/**
 * @moolox/marketplace — One-Click Plugin Installation & Workspace Binding (`MKT-002`)
 *
 * Manages the installation of verified plugins into specific workspaces (`plugin_installations` schema),
 * validates platform dependencies, and boots the plugin into `PluginSandboxEngine`.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { ManifestValidator, PluginSandboxEngine, type PluginManifest } from '@moolox/plugins';
import { MarketplaceCatalogRegistry } from '../registry/marketplaceCatalog';

export interface PluginInstallationRecord {
  installationId: string;
  workspaceId: string;
  pluginId: string;
  versionInstalled: string;
  installedAt: number;
  isActive: boolean;
  settings: Record<string, any>;
}

export interface InstallationResult {
  success: boolean;
  installation?: PluginInstallationRecord;
  error?: string;
}

export class WorkspacePluginBindingEngine {
  private static installations = new Map<string, PluginInstallationRecord[]>();

  /**
   * Installs and binds a marketplace plugin to a multi-tenant workspace (`MKT-002`).
   */
  static async installPlugin(workspaceId: string, marketplaceItemId: string, settings: Record<string, any> = {}): Promise<InstallationResult> {
    const item = MarketplaceCatalogRegistry.getItem(marketplaceItemId);

    if (!item) {
      return { success: false, error: `Marketplace item '${marketplaceItemId}' not found.` };
    }

    if (item.type !== 'plugin' || !item.manifest) {
      return { success: false, error: `Item '${marketplaceItemId}' is not a valid installable plugin package.` };
    }

    if (!item.verified) {
      return { success: false, error: `Installation blocked: Plugin '${item.title}' has not passed the security verification gate (` + `MKT-003` + `).` };
    }

    // Validate manifest
    const validation = ManifestValidator.validate(item.manifest);
    if (!validation.valid || !validation.manifest) {
      return { success: false, error: `Manifest verification failed: ${validation.errors.join('; ')}` };
    }

    // Check if already installed
    const existing = this.installations.get(workspaceId) || [];
    const alreadyInstalled = existing.find((inst) => inst.pluginId === item.manifest!.id);
    if (alreadyInstalled) {
      return { success: false, error: `Plugin '${item.manifest.id}' is already installed in workspace '${workspaceId}'.` };
    }

    // Create installation record
    const record: PluginInstallationRecord = {
      installationId: `inst-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      workspaceId,
      pluginId: item.manifest.id,
      versionInstalled: item.manifest.version,
      installedAt: Date.now(),
      isActive: true,
      settings: { ...settings },
    };

    this.installations.set(workspaceId, [...existing, record]);

    // Boot into sandboxed engine (`PLG-002`)
    PluginSandboxEngine.loadPlugin(validation.manifest);
    MarketplaceCatalogRegistry.incrementDownloadCount(marketplaceItemId);

    return { success: true, installation: record };
  }

  /**
   * Installs and clones a marketplace AST template or component into a project tree (`MKT-002`, `WS-006`, `PRJ-006`).
   */
  static async installTemplateToProject(
    workspaceId: string,
    projectId: string,
    marketplaceItemId: string,
    targetProjectRoot: Record<string, any>,
    targetParentId: string = 'root'
  ): Promise<{ success: boolean; clonedAST?: Record<string, any>; error?: string }> {
    const item = MarketplaceCatalogRegistry.getItem(marketplaceItemId);

    if (!item) {
      return { success: false, error: `Marketplace item '${marketplaceItemId}' not found.` };
    }

    if (item.type !== 'template' && item.type !== 'component') {
      return { success: false, error: `Item '${marketplaceItemId}' is not an installable AST template/component.` };
    }

    if (!item.verified || !item.templateAST) {
      return { success: false, error: `Installation blocked: Template '${item.title}' has not passed verification (` + `MKT-003` + `) or lacks valid AST payload.` };
    }

    // Remap ID via simple UUID generator
    const hex = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const clonedAST = JSON.parse(JSON.stringify(item.templateAST));
    clonedAST.nodeId = `node-${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`;

    let parentFound = false;
    const findAndAppend = (node: Record<string, any>): boolean => {
      if (node.nodeId === targetParentId) {
        if (!Array.isArray(node.children)) node.children = [];
        node.children.push(clonedAST);
        parentFound = true;
        return true;
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          if (findAndAppend(child)) return true;
        }
      }
      return false;
    };

    if (targetParentId === 'root' || targetParentId === targetProjectRoot.nodeId) {
      if (!Array.isArray(targetProjectRoot.children)) targetProjectRoot.children = [];
      targetProjectRoot.children.push(clonedAST);
      parentFound = true;
    } else {
      findAndAppend(targetProjectRoot);
    }

    if (!parentFound) {
      return { success: false, error: `Target parent container '${targetParentId}' not found in project '${projectId}'.` };
    }

    MarketplaceCatalogRegistry.incrementDownloadCount(marketplaceItemId);
    return { success: true, clonedAST };
  }

  /**
   * Uninstalls a plugin from a workspace and halts its sandbox (`MKT-002`).
   */
  static uninstallPlugin(workspaceId: string, pluginId: string): boolean {
    const existing = this.installations.get(workspaceId) || [];
    const filtered = existing.filter((inst) => inst.pluginId !== pluginId);
    if (filtered.length === existing.length) return false;

    this.installations.set(workspaceId, filtered);
    PluginSandboxEngine.unloadPlugin(pluginId);
    return true;
  }

  static getInstalledPlugins(workspaceId: string): PluginInstallationRecord[] {
    return [...(this.installations.get(workspaceId) || [])];
  }

  static resetForTest(): void {
    this.installations.clear();
  }
}
