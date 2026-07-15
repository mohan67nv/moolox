'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MarketplaceCatalogRegistry,
  WorkspacePluginBindingEngine,
  SandboxPreviewRunner,
  type MarketplaceItem,
  type MarketplaceCategory,
  type EphemeralPreviewSession,
} from '@moolox/marketplace';

export interface MarketplaceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

export const MarketplaceDrawer: React.FC<MarketplaceDrawerProps> = ({ isOpen, onClose, workspaceId }) => {
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [previewSession, setPreviewSession] = useState<EphemeralPreviewSession | null>(null);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [installedPluginIds, setInstalledPluginIds] = useState<Set<string>>(new Set());

  const refreshCatalog = useCallback(() => {
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

  useEffect(() => {
    if (isOpen) {
      refreshCatalog();
      refreshInstalled();
    }
  }, [isOpen, refreshCatalog, refreshInstalled]);

  const handlePreview = async (item: MarketplaceItem) => {
    setErrorMsg(null);
    try {
      const session = await SandboxPreviewRunner.startPreviewSession(item.id);
      setPreviewSession(session);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to launch sandbox preview session.');
    }
  };

  const handleClosePreview = () => {
    if (previewSession) {
      SandboxPreviewRunner.terminateSession(previewSession.sessionId);
      setPreviewSession(null);
    }
  };

  const handleInstall = async (item: MarketplaceItem) => {
    setErrorMsg(null);
    setInstallingId(item.id);
    try {
      const res = await WorkspacePluginBindingEngine.installPlugin(workspaceId, item.id);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to install plugin.');
      } else {
        refreshInstalled();
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown installation error.');
    } finally {
      setInstallingId(null);
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col text-slate-100 shadow-2xl overflow-hidden animate-slide-left">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              Creator Marketplace & Ecosystem (`v1.2`)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified AST component templates, theme kits, and sandboxed extensions.
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

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Search plugins, templates, keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mx-4 mt-4 p-3 bg-rose-950/80 border border-rose-500/40 rounded-lg text-xs text-rose-200 flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="font-bold text-rose-300 hover:text-white ml-2">
              ✕
            </button>
          </div>
        )}

        {/* Ephemeral Sandbox Preview Bar (`MKT-005`) */}
        {previewSession && (
          <div className="mx-4 mt-4 p-4 bg-indigo-950/60 border border-indigo-500/50 rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                Active Sandbox Preview (`MKT-005`)
              </span>
              <button
                onClick={handleClosePreview}
                className="text-xs text-indigo-300 hover:text-white underline"
              >
                End Session
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Session ID: <code className="text-indigo-200 bg-indigo-900/60 px-1 py-0.5 rounded">{previewSession.sessionId}</code>
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span>Status: <strong className="text-emerald-400">Isolated & Sandboxed</strong></span>
              <span>Nodes Audited: <strong className="text-white">{previewSession.simulatedOutputState.sandboxedDOMNodesCount}</strong></span>
            </div>
          </div>
        )}

        {/* Catalog Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
              <div className="text-3xl mb-2">📦</div>
              <p className="text-sm">No marketplace items match the selected filters.</p>
            </div>
          ) : (
            items.map((item) => {
              const isInstalled = item.manifest && installedPluginIds.has(item.manifest.id);

              return (
                <div
                  key={item.id}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col gap-2 hover:border-slate-700 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300 font-medium">
                          {item.type.toUpperCase()}
                        </span>
                        {item.verified && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1">
                            ✓ Verified (`MKT-003`)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-white">
                        {item.priceCents === 0 ? 'Free' : `$${(item.priceCents / 100).toFixed(2)}`}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        ⭐ {item.rating.toFixed(1)} ({item.downloadsCount} DLs)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                    <span className="text-slate-500">By <strong className="text-slate-300">{item.creator}</strong></span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePreview(item)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
                      >
                        Preview Sandbox (`MKT-005`)
                      </button>

                      {item.type === 'plugin' && (
                        <button
                          onClick={() => handleInstall(item)}
                          disabled={Boolean(isInstalled) || installingId === item.id}
                          className={`px-3 py-1 rounded font-semibold transition-all ${
                            isInstalled
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60 cursor-default'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10'
                          }`}
                        >
                          {isInstalled
                            ? 'Installed'
                            : installingId === item.id
                            ? 'Installing...'
                            : 'Install (`MKT-002`)'}
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
    </div>
  );
};
