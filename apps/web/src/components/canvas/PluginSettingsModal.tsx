'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { WorkspacePluginBindingEngine, type PluginInstallationRecord } from '@moolox/marketplace';
import { PluginPermissionFirewall, PluginSandboxEngine, type PluginPermission } from '@moolox/plugins';

export interface PluginSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

export const PluginSettingsModal: React.FC<PluginSettingsModalProps> = ({ isOpen, onClose, workspaceId }) => {
  const [plugins, setPlugins] = useState<PluginInstallationRecord[]>([]);
  const [selectedPluginId, setSelectedPluginId] = useState<string | null>(null);
  const [activePermissions, setActivePermissions] = useState<PluginPermission[]>([]);

  const refreshPlugins = useCallback(() => {
    const list = WorkspacePluginBindingEngine.getInstalledPlugins(workspaceId);
    setPlugins(list);
    const first = list[0];
    if (first && !selectedPluginId) {
      setSelectedPluginId(first.pluginId);
      setActivePermissions(PluginPermissionFirewall.getActiveGrants(first.pluginId));
    }
  }, [workspaceId, selectedPluginId]);

  useEffect(() => {
    if (isOpen) {
      refreshPlugins();
    }
  }, [isOpen, refreshPlugins]);

  const handleSelectPlugin = (pluginId: string) => {
    setSelectedPluginId(pluginId);
    setActivePermissions(PluginPermissionFirewall.getActiveGrants(pluginId));
  };

  const handleTogglePermission = (permission: PluginPermission) => {
    if (!selectedPluginId) return;

    if (activePermissions.includes(permission)) {
      PluginPermissionFirewall.revokePermission(selectedPluginId, permission);
    } else {
      // Re-register or add permission if declared in manifest
      const target = plugins.find((p) => p.pluginId === selectedPluginId);
      if (target) {
        // For control plane simulation, re-boot or toggle grant
        PluginSandboxEngine.suspendPlugin(selectedPluginId);
      }
    }
    setActivePermissions(PluginPermissionFirewall.getActiveGrants(selectedPluginId));
  };

  const handleUninstall = (pluginId: string) => {
    WorkspacePluginBindingEngine.uninstallPlugin(workspaceId, pluginId);
    if (selectedPluginId === pluginId) {
      setSelectedPluginId(null);
    }
    refreshPlugins();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-emerald-400">🛡️</span>
              Plugin Security & Runtime Control Plane (`PLG-001..004`)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Audit active sandboxes, inspect capability grants, and manage extension lifecycles.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left List */}
          <div className="w-1/3 border-r border-slate-800 bg-slate-950/40 p-3 flex flex-col gap-2 overflow-y-auto">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-2">
              Installed Extensions ({plugins.length})
            </span>

            {plugins.length === 0 ? (
              <div className="text-xs text-slate-500 p-4 text-center">No plugins installed in this workspace.</div>
            ) : (
              plugins.map((inst) => (
                <button
                  key={inst.pluginId}
                  onClick={() => handleSelectPlugin(inst.pluginId)}
                  className={`p-3 rounded-xl text-left transition-all border ${
                    selectedPluginId === inst.pluginId
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-white font-medium shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-sm font-semibold truncate">{inst.pluginId}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
                    <span>v{inst.versionInstalled}</span>
                    <span className="text-emerald-400 font-semibold">Active</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Right Inspection Panel */}
          <div className="w-2/3 p-6 flex flex-col gap-6 overflow-y-auto bg-slate-900">
            {!selectedPluginId ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                Select an extension to inspect security policies (`PLG-004`).
              </div>
            ) : (
              (() => {
                const target = plugins.find((p) => p.pluginId === selectedPluginId);
                if (!target) return null;

                const allPermissions: PluginPermission[] = [
                  'read:ast',
                  'write:ast',
                  'read:tokens',
                  'write:tokens',
                  'network:fetch',
                ];

                return (
                  <>
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-white">{target.pluginId}</h3>
                        <button
                          onClick={() => handleUninstall(target.pluginId)}
                          className="px-3 py-1 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-semibold hover:bg-rose-900 hover:text-white transition-colors"
                        >
                          Uninstall Sandbox
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Installation ID: <code className="text-slate-300 bg-slate-800 px-1 rounded">{target.installationId}</code>
                      </p>
                    </div>

                    {/* Firewall Capabilities Matrix (`PLG-004`) */}
                    <div className="flex flex-col gap-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                        <span>Permission Firewall Grants (`PLG-004`)</span>
                        <span className="text-[10px] font-normal text-emerald-400">Protected by RPC Bus</span>
                      </h4>

                      <div className="grid grid-cols-1 gap-2">
                        {allPermissions.map((perm) => {
                          const isGranted = activePermissions.includes(perm);
                          return (
                            <div
                              key={perm}
                              className={`p-3 rounded-xl border flex items-center justify-between ${
                                isGranted
                                  ? 'bg-slate-800/80 border-emerald-500/30 text-white'
                                  : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                              }`}
                            >
                              <div>
                                <div className="text-xs font-semibold font-mono">{perm}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {perm === 'read:ast' && 'Read component tree (`IASTNode`) inside the studio.'}
                                  {perm === 'write:ast' && 'Apply immutable delta patches (`ASTPatchAction`).'}
                                  {perm === 'read:tokens' && 'Inspect W3C design token tokens (`colors.bg.main`).'}
                                  {perm === 'write:tokens' && 'Transform theme palettes and custom CSS variables.'}
                                  {perm === 'network:fetch' && 'Guarded external HTTP fetch (loopback blocked).'}
                                </div>
                              </div>

                              <button
                                onClick={() => handleTogglePermission(perm)}
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                                  isGranted
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                }`}
                              >
                                {isGranted ? 'Granted ✓' : 'Revoked'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                );
              })()
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-500">
          <span>All plugin RPC calls run inside isolated Web Worker sandboxes (`PLG-002`).</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
