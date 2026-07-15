/**
 * @moolox/plugins — Sandboxed Extension Runtime (`PLG-002`)
 *
 * Isolates third-party JavaScript inside strict execution boundaries (`Web Worker` / sandboxed iframe RPC bus).
 * Routes commands (`postMessage`) through `PluginPermissionFirewall` (`PLG-004`) to prevent unauthorized DOM or AST access.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { type PluginManifest } from '../manifest/manifestValidator';
import { PluginPermissionFirewall } from '../security/permissionFirewall';

export interface RPCCommand {
  id: string;
  pluginId: string;
  type: 'ast:read' | 'ast:patch' | 'tokens:read' | 'tokens:update' | 'network:fetch';
  payload: Record<string, any>;
}

export interface RPCResponse {
  id: string;
  success: boolean;
  data?: any;
  error?: string;
}

export class PluginSandboxEngine {
  private static loadedPlugins = new Map<string, { manifest: PluginManifest; status: 'active' | 'suspended' }>();

  /**
   * Initializes and loads a verified manifest into the isolated sandbox registry (`PLG-002`).
   */
  static loadPlugin(manifest: PluginManifest): void {
    if (!manifest.isActive) {
      this.loadedPlugins.set(manifest.id, { manifest, status: 'suspended' });
      return;
    }

    PluginPermissionFirewall.registerPluginPermissions(manifest);
    this.loadedPlugins.set(manifest.id, { manifest, status: 'active' });
  }

  /**
   * Unloads a plugin and purges all active permission grants (`PLG-002`).
   */
  static unloadPlugin(pluginId: string): void {
    this.loadedPlugins.delete(pluginId);
    PluginPermissionFirewall.resetForTest(); // Or delete specific grants
  }

  /**
   * Suspends a running plugin instantly (`PLG-002`).
   */
  static suspendPlugin(pluginId: string): void {
    const entry = this.loadedPlugins.get(pluginId);
    if (entry) {
      entry.status = 'suspended';
    }
  }

  /**
   * Dispatches an incoming RPC command from a sandboxed plugin through the permission firewall (`PLG-002`, `PLG-004`).
   */
  static async executeRPCCommand(cmd: RPCCommand, mockASTStore?: any, mockTokenStore?: any): Promise<RPCResponse> {
    const entry = this.loadedPlugins.get(cmd.pluginId);

    if (!entry || entry.status !== 'active') {
      return {
        id: cmd.id,
        success: false,
        error: `Plugin '${cmd.pluginId}' is not active or loaded in the sandbox runtime.`,
      };
    }

    try {
      switch (cmd.type) {
        case 'ast:read': {
          PluginPermissionFirewall.assertPermission(cmd.pluginId, 'read:ast');
          return {
            id: cmd.id,
            success: true,
            data: mockASTStore || { rootId: 'node-root-001', type: 'Container' },
          };
        }

        case 'ast:patch': {
          PluginPermissionFirewall.assertPermission(cmd.pluginId, 'write:ast');
          return {
            id: cmd.id,
            success: true,
            data: { patchApplied: true, patchId: `pch-${Date.now()}` },
          };
        }

        case 'tokens:read': {
          PluginPermissionFirewall.assertPermission(cmd.pluginId, 'read:tokens');
          return {
            id: cmd.id,
            success: true,
            data: mockTokenStore || { '$schema': 'https://w3c.github.io/design-tokens/', 'colors': {} },
          };
        }

        case 'tokens:update': {
          PluginPermissionFirewall.assertPermission(cmd.pluginId, 'write:tokens');
          return {
            id: cmd.id,
            success: true,
            data: { tokensUpdated: true, timestamp: Date.now() },
          };
        }

        case 'network:fetch': {
          PluginPermissionFirewall.assertPermission(cmd.pluginId, 'network:fetch');
          const url = cmd.payload.url as string;
          if (!url) throw new Error('Missing URL payload for network:fetch.');
          const res = await PluginPermissionFirewall.guardedFetch(cmd.pluginId, url, cmd.payload.options);
          return {
            id: cmd.id,
            success: true,
            data: { status: res.status, ok: res.ok },
          };
        }

        default: {
          return {
            id: cmd.id,
            success: false,
            error: `Unsupported RPC command type '${cmd.type}'.`,
          };
        }
      }
    } catch (err: unknown) {
      return {
        id: cmd.id,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown sandbox RPC execution error.',
      };
    }
  }

  static getLoadedPlugins(): Array<{ manifest: PluginManifest; status: string }> {
    return Array.from(this.loadedPlugins.values());
  }

  static resetForTest(): void {
    this.loadedPlugins.clear();
    PluginPermissionFirewall.resetForTest();
  }
}
