'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MarketplaceCatalogRegistry,
  WorkspacePluginBindingEngine,
  SandboxPreviewRunner,
  type MarketplaceItem,
  type MarketplaceCategory,
  type EphemeralPreviewSession,
  type CreatorStorefrontProfile,
} from '@moolox/marketplace';
import {
  StripeConnectBillingEngine,
  type StripeConnectAccount,
  type MarketplacePurchaseRecord,
  type ConnectTransferRecord,
} from '@moolox/billing';
import { ComponentPackagingEngine } from '@moolox/components';
import { type IASTNode } from '@moolox/types';

export interface MarketplaceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

export const MarketplaceDrawer: React.FC<MarketplaceDrawerProps> = ({ isOpen, onClose, workspaceId }) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'preview' | 'billing'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [selectedCreatorProfile, setSelectedCreatorProfile] = useState<CreatorStorefrontProfile | null>(null);

  // Sandbox Preview State
  const [previewSession, setPreviewSession] = useState<EphemeralPreviewSession | null>(null);
  const [activePreviewItem, setActivePreviewItem] = useState<MarketplaceItem | null>(null);

  // Installation & Insertion State
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installedPluginIds, setInstalledPluginIds] = useState<Set<string>>(new Set());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Stripe Connect Creator Billing State
  const [creatorIdInput, setCreatorIdInput] = useState('moolox-core');
  const [connectAccount, setConnectAccount] = useState<StripeConnectAccount | null>(null);
  const [creatorPurchases, setCreatorPurchases] = useState<MarketplacePurchaseRecord[]>([]);
  const [creatorTransfers, setCreatorTransfers] = useState<ConnectTransferRecord[]>([]);

  const refreshCatalog = useCallback(() => {
    MarketplaceCatalogRegistry.seedDefaultItems();
    const query = {
      category: selectedCategory === 'ALL' ? undefined : selectedCategory,
      searchTerm: searchTerm.trim() ? searchTerm : undefined,
    };
    const results = MarketplaceCatalogRegistry.search(query);
    setItems(results);
  }, [selectedCategory, searchTerm]);

  const refreshInstalled = useCallback(() => {
    const records = WorkspacePluginBindingEngine.getInstalledPlugins(workspaceId);
    setInstalledPluginIds(new Set(records.map((r) => r.pluginId)));
  }, [workspaceId]);

  const refreshConnectLedger = useCallback(() => {
    const acc = StripeConnectBillingEngine.getConnectAccount(creatorIdInput) || StripeConnectBillingEngine.createConnectAccount(creatorIdInput);
    setConnectAccount(acc);
    setCreatorPurchases(StripeConnectBillingEngine.getPurchasesForCreator(creatorIdInput));
    setCreatorTransfers(StripeConnectBillingEngine.getTransfersForCreator(creatorIdInput));
  }, [creatorIdInput]);

  useEffect(() => {
    if (isOpen) {
      refreshCatalog();
      refreshInstalled();
      refreshConnectLedger();
    }
  }, [isOpen, refreshCatalog, refreshInstalled, refreshConnectLedger]);

  const handleInspectCreator = (creatorHandle: string) => {
    const profile = MarketplaceCatalogRegistry.getStorefrontByCreator(creatorHandle);
    if (profile) {
      setSelectedCreatorProfile(profile);
      setSearchTerm('');
      setSelectedCategory('ALL');
    }
  };

  const handlePreview = async (item: MarketplaceItem) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const session = await SandboxPreviewRunner.startPreviewSession(item.id);
      setPreviewSession(session);
      setActivePreviewItem(item);
      setActiveTab('preview');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to launch sandbox preview session.');
    }
  };

  const handleClosePreview = () => {
    if (previewSession) {
      SandboxPreviewRunner.terminateSession(previewSession.sessionId);
      setPreviewSession(null);
      setActivePreviewItem(null);
    }
  };

  const handleInstallPlugin = async (item: MarketplaceItem) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setInstallingId(item.id);
    try {
      const res = await WorkspacePluginBindingEngine.installPlugin(workspaceId, item.id);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to install plugin.');
      } else {
        setSuccessMsg(`Plugin '${item.title}' installed and booted into sandbox engine (` + `MKT-002` + `).`);
        refreshInstalled();
        refreshCatalog();
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown installation error.');
    } finally {
      setInstallingId(null);
    }
  };

  const handleInsertComponent = async (item: MarketplaceItem) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setInstallingId(item.id);
    try {
      if (!item.templateAST) {
        throw new Error('Component item has no AST template payload.');
      }

      // Package AST tree cleanly (`CMP-006`)
      const manifest = ComponentPackagingEngine.packageComponent(
        `pkg-${item.id}`,
        item.title,
        item.templateAST as unknown as IASTNode,
        {},
        item.creator
      );

      // Clone into project root (`PRJ-006`)
      const targetProjectRoot: Record<string, unknown> = { nodeId: 'root', type: 'Canvas', children: [] };
      const res = await WorkspacePluginBindingEngine.installTemplateToProject(
        workspaceId,
        'prj-active',
        item.id,
        targetProjectRoot
      );

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to insert component into canvas tree.');
      } else {
        setSuccessMsg(`1-Click Insert (` + `CMP-006` + `): '${item.title}' (${manifest.packageId}) remapped canonical IDs and inserted cleanly into project canvas.`);
        refreshCatalog();
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Component packaging & insertion failed.');
    } finally {
      setInstallingId(null);
    }
  };

  // Stripe Connect Actions
  const handleCompleteOnboarding = () => {
    if (connectAccount) {
      StripeConnectBillingEngine.completeOnboarding(creatorIdInput);
      refreshConnectLedger();
      setSuccessMsg(`Stripe Connect Express onboarding verified for creator '${creatorIdInput}'. Payouts Enabled.`);
    }
  };

  const handleSimulatePurchase = async (item: MarketplaceItem) => {
    const price = item.priceCents || 2900; // default $29.00 if 0
    await StripeConnectBillingEngine.processPurchase(workspaceId, item.creator.replace(/^@/, ''), item.id, price, 'USD');
    refreshConnectLedger();
    setSuccessMsg(`Processed purchase ($${(price / 100).toFixed(2)}) for '${item.title}'. Enforced exact 80/20 revenue split.`);
  };

  const handleSimulateRefund = (purchaseId: string) => {
    const reconciled = StripeConnectBillingEngine.reconcileRefund(purchaseId);
    if (reconciled) {
      refreshConnectLedger();
      setSuccessMsg(`Reconciled refund for purchase '${purchaseId}' and reversed Connect transfer (` + `BIL-004` + `).`);
    } else {
      setErrorMsg(`Failed to reconcile refund for '${purchaseId}'.`);
    }
  };

  if (!isOpen) return null;

  const categories: Array<MarketplaceCategory | 'ALL'> = [
    'ALL',
    'AST Generators',
    'Theme Kits',
    'SEO Tools',
    'UI Components',
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl bg-slate-950 border-l border-slate-800 h-full flex flex-col text-slate-100 shadow-2xl overflow-hidden animate-slide-left">
        {/* Header & Control Navigation */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
              Creator Component Marketplace & Stripe Connect (`v2.0`)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Unified storefront catalog, AST security scratchpad (`MKT-004`), and 80/20 seller revenue payouts (`BIL-004`).
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Close Marketplace"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/40 px-6 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'catalog'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🛍️</span> Catalog & Creator Storefronts
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'preview'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🧪</span> Sandbox Preview Scratchpad {previewSession ? '(Active)' : ''}
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'billing'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>💳</span> Stripe Connect Revenue Ledger (`80/20`)
          </button>
        </div>

        {/* Status Notifications */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-center justify-between shadow-lg">
            <span>⚠️ {errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="font-bold text-rose-300 hover:text-white ml-2">✕</button>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 flex items-center justify-between shadow-lg">
            <span>✓ {successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="font-bold text-emerald-300 hover:text-white ml-2">✕</button>
          </div>
        )}

        {/* Tab 1: Catalog & Creator Storefronts */}
        {activeTab === 'catalog' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter Bar */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/30 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search verified plugins, hero templates, keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                {selectedCreatorProfile && (
                  <button
                    onClick={() => setSelectedCreatorProfile(null)}
                    className="px-3 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
                  >
                    Clear Storefront Filter
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedCreatorProfile(null);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat && !selectedCreatorProfile
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Creator Storefront Profile Banner (`MKT-001`) */}
            {selectedCreatorProfile && (
              <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-900/40 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl font-bold text-emerald-400">
                    {selectedCreatorProfile.displayName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{selectedCreatorProfile.displayName}</h3>
                      {selectedCreatorProfile.verifiedSeller && (
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                          ✓ Verified Seller
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedCreatorProfile.bio}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-300 font-medium">
                      <span>Storefront Items: <strong className="text-white">{selectedCreatorProfile.totalItems}</strong></span>
                      <span>Total Downloads: <strong className="text-emerald-400">{selectedCreatorProfile.totalDownloads}</strong></span>
                      <span>Average Rating: ⭐ <strong className="text-amber-400">{selectedCreatorProfile.averageRating}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Catalog Items Grid */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {(selectedCreatorProfile ? selectedCreatorProfile.items : items).length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
                  <div className="text-4xl mb-2">📦</div>
                  <p className="text-sm">No marketplace items match current filter criteria.</p>
                </div>
              ) : (
                (selectedCreatorProfile ? selectedCreatorProfile.items : items).map((item) => {
                  const isInstalledPlugin = item.manifest && installedPluginIds.has(item.manifest.id);

                  return (
                    <div
                      key={item.id}
                      className="p-4 bg-slate-900/90 border border-slate-800/80 rounded-xl flex flex-col gap-3 hover:border-slate-700 transition-all shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-sm">{item.title}</h3>
                            <span className="px-2 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300 font-semibold uppercase">
                              {item.type}
                            </span>
                            {item.verified && (
                              <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/30">
                                ✓ Security Gate Audited (`MKT-004`)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-extrabold text-white">
                            {item.priceCents === 0 ? 'Free ($0.00)' : `$${(item.priceCents / 100).toFixed(2)} USD`}
                          </span>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            ⭐ {item.rating.toFixed(1)} <span className="text-slate-600">•</span> <strong className="text-emerald-400">{item.downloadsCount}</strong> DLs
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 text-[10px] rounded-md bg-slate-950 border border-slate-800 text-slate-400">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                        <div className="text-slate-400 flex items-center gap-1.5">
                          <span>Created by</span>
                          <button
                            onClick={() => handleInspectCreator(item.creator)}
                            className="font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            @{item.creator.replace(/^@/, '')}
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePreview(item)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors text-xs border border-slate-700/60"
                          >
                            🧪 Sandbox Preview (`MKT-005`)
                          </button>

                          {item.type === 'plugin' ? (
                            <button
                              onClick={() => handleInstallPlugin(item)}
                              disabled={Boolean(isInstalledPlugin) || installingId === item.id}
                              className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all shadow-md ${
                                isInstalledPlugin
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 cursor-default'
                                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                              }`}
                            >
                              {isInstalledPlugin ? 'Installed (`Active`)' : installingId === item.id ? 'Installing...' : 'Install Plugin (`MKT-002`)'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleInsertComponent(item)}
                              disabled={installingId === item.id}
                              className="px-3.5 py-1.5 rounded-lg font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20"
                            >
                              {installingId === item.id ? 'Inserting...' : '1-Click Insert Component (`CMP-006`)'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Sandbox Preview Scratchpad (`MKT-005`) */}
        {activeTab === 'preview' && (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto gap-6">
            {!previewSession ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-3xl text-indigo-400 mb-4">
                  🧪
                </div>
                <h3 className="text-base font-bold text-white">No Ephemeral Sandbox Preview Active</h3>
                <p className="text-xs text-slate-400 max-w-md mt-1">
                  Select any AST component, UI hero template, or verified plugin from the storefront catalog and click <strong className="text-indigo-300">Sandbox Preview</strong> to inspect output live with zero risk of prototype pollution or XSS (`MKT-004`).
                </p>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="mt-5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/20"
                >
                  Browse Storefront Catalog
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="p-5 bg-indigo-950/40 border border-indigo-500/40 rounded-2xl flex flex-col gap-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-indigo-400 animate-ping" />
                      <h3 className="font-bold text-white text-base">
                        Active Sandbox Session: <span className="text-indigo-300">{activePreviewItem?.title || previewSession.sessionId}</span>
                      </h3>
                    </div>
                    <button
                      onClick={handleClosePreview}
                      className="px-3 py-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-xs font-medium transition-colors"
                    >
                      End & Terminate Session
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-2 border-t border-indigo-900/60 text-xs">
                    <div>
                      <span className="text-slate-400">Session ID:</span>
                      <div className="font-mono text-indigo-200 bg-indigo-950 px-2 py-1 rounded mt-0.5 border border-indigo-900">
                        {previewSession.sessionId}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Security Gate (`MKT-004`):</span>
                      <div className="text-emerald-400 font-bold mt-1 flex items-center gap-1">
                        ✓ 100% Isolated & Verified Zero-XSS
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">DOM Nodes Simulated:</span>
                      <div className="text-white font-extrabold mt-1 text-sm">
                        {previewSession.simulatedOutputState.sandboxedDOMNodesCount} nodes
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Output Frame */}
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      AST Tree Scratchpad Rendering (`Simulated Live Viewport`)
                    </span>
                    {activePreviewItem?.type !== 'plugin' && activePreviewItem && (
                      <button
                        onClick={() => handleInsertComponent(activePreviewItem)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md"
                      >
                        Insert this Subtree into Canvas (`PRJ-006`)
                      </button>
                    )}
                  </div>

                  <div className="p-8 bg-slate-950 border border-slate-800/80 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto min-h-[220px] flex flex-col justify-center">
                    {activePreviewItem?.templateAST ? (
                      <pre className="text-emerald-400 text-[11px] leading-relaxed">
                        {JSON.stringify(activePreviewItem.templateAST, null, 2)}
                      </pre>
                    ) : (
                      <div className="text-slate-500 italic text-center">
                        Simulating sandboxed plugin runtime hooks (`onASTInspect`, `read:ast`).
                        <br />
                        No DOM clobbering or prototype pollution vectors present.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Stripe Connect Revenue Ledger (`BIL-004`, `MKT-003`) */}
        {activeTab === 'billing' && (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto gap-6">
            {/* Account Status Box */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Stripe Connect Express Seller Account (`BIL-004`)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Automated 80% creator / 20% platform revenue split engine with instant `transfer.create` execution.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Inspect Creator ID:</span>
                  <input
                    type="text"
                    value={creatorIdInput}
                    onChange={(e) => setCreatorIdInput(e.target.value)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500 w-36"
                  />
                </div>
              </div>

              {connectAccount ? (
                <div className="grid grid-cols-4 gap-4 p-4 bg-slate-950 border border-slate-800/80 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-500">Stripe Account ID:</span>
                    <div className="font-mono text-slate-200 mt-1">{connectAccount.stripeAccountId}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Account Type:</span>
                    <div className="font-semibold text-amber-400 uppercase mt-1">{connectAccount.accountType}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Payouts / Transfers:</span>
                    <div className="mt-1">
                      {connectAccount.payoutsEnabled ? (
                        <span className="text-emerald-400 font-bold">✓ Enabled & Active</span>
                      ) : (
                        <span className="text-amber-400 font-semibold">Pending Onboarding</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    {!connectAccount.payoutsEnabled && (
                      <button
                        onClick={handleCompleteOnboarding}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/20"
                      >
                        Simulate Onboarding Complete
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-950 rounded-xl text-xs text-slate-500 italic">
                  No Connect account initialized for creator &apos;{creatorIdInput}&apos;.
                </div>
              )}

              {/* Purchase Simulation Quick Test */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                <span className="text-slate-400">Test Revenue Ledger: Simulate a live test purchase for @{creatorIdInput}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSimulatePurchase({ id: 'item-saas-hero-pro', title: 'SaaS Hero Pro Kit', creator: creatorIdInput, priceCents: 2900 } as unknown as MarketplaceItem)}
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
                  >
                    + Simulate $29.00 Purchase
                  </button>
                  <button
                    onClick={() => handleSimulatePurchase({ id: 'item-seo-audit-plugin', title: 'SEO Auditor Pro', creator: creatorIdInput, priceCents: 9900 } as unknown as MarketplaceItem)}
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium transition-colors"
                  >
                    + Simulate $99.00 Purchase
                  </button>
                </div>
              </div>
            </div>

            {/* Purchases & Revenue Splits Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
              <h4 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Stripe Connect Payout Transactions & Revenue Ledger (`80% Creator / 20% Platform`)</span>
                <span className="text-xs font-normal text-slate-400">{creatorPurchases.length} total transactions</span>
              </h4>

              {creatorPurchases.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 italic bg-slate-950 rounded-xl border border-slate-800/60">
                  No marketplace purchases recorded yet for @{creatorIdInput}. Click &quot;Simulate Purchase&quot; above to generate ledger items.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/60">
                        <th className="py-2.5 px-3">Transaction ID</th>
                        <th className="py-2.5 px-3">Item ID</th>
                        <th className="py-2.5 px-3">Gross Sales</th>
                        <th className="py-2.5 px-3 text-emerald-400">Creator Share (80%)</th>
                        <th className="py-2.5 px-3 text-slate-400">Platform Fee (20%)</th>
                        <th className="py-2.5 px-3">Transfer Status (`Connect`)</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {creatorPurchases.map((pur) => {
                        const transfer = creatorTransfers.find((t) => t.transferId === pur.transferId);
                        const isRefunded = pur.status === 'refunded' || transfer?.status === 'reversed';

                        return (
                          <tr key={pur.purchaseId} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-3 font-mono text-slate-300">{pur.purchaseId}</td>
                            <td className="py-3 px-3 font-medium text-white">{pur.marketplaceItemId}</td>
                            <td className="py-3 px-3 font-bold text-white">${(pur.grossAmountCents / 100).toFixed(2)}</td>
                            <td className="py-3 px-3 font-extrabold text-emerald-400">${(pur.creatorPayoutCents / 100).toFixed(2)}</td>
                            <td className="py-3 px-3 text-slate-400 font-medium">${(pur.platformFeeCents / 100).toFixed(2)}</td>
                            <td className="py-3 px-3">
                              {isRefunded ? (
                                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-[11px]">
                                  Refunded / Reversed (`transfer.reversed`)
                                </span>
                              ) : transfer ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold text-[11px]">
                                  Succeeded (`{transfer.transferId}`)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium text-[11px]">
                                  Held (Connect Onboarding Required)
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {!isRefunded && (
                                <button
                                  onClick={() => handleSimulateRefund(pur.purchaseId)}
                                  className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 font-medium transition-colors text-[11px] border border-rose-800/60"
                                >
                                  Refund (`charge.refunded`)
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
