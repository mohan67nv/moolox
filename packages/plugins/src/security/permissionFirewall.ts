/**
 * @moolox/plugins — Plugin Permission Firewall (`PLG-004`)
 *
 * Intercepts every plugin API request (`read:ast`, `write:ast`, `read:tokens`, `write:tokens`, `network:fetch`),
 * verifying that the requesting plugin has declared the permission in its manifest and that the workspace administrator
 * has approved the requested boundary.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { type PluginManifest, type PluginPermission } from '../manifest/manifestValidator';

export interface PermissionCheckResult {
  allowed: boolean;
  pluginId: string;
  requestedPermission: PluginPermission;
  reason?: string;
}

export class PluginPermissionFirewall {
  private static activeGrants = new Map<string, Set<PluginPermission>>();
  private static revokedGrants = new Map<string, Set<PluginPermission>>();

  /**
   * Registers verified permissions from an active plugin manifest into the firewall (`PLG-004`).
   */
  static registerPluginPermissions(manifest: PluginManifest): void {
    if (!manifest.isActive) {
      this.activeGrants.delete(manifest.id);
      return;
    }
    const granted = new Set<PluginPermission>(manifest.permissions);
    const revoked = this.revokedGrants.get(manifest.id);
    if (revoked) {
      for (const r of revoked) {
        granted.delete(r);
      }
    }
    this.activeGrants.set(manifest.id, granted);
  }

  /**
   * Explicitly revokes a permission from a plugin at runtime (`PLG-004`).
   */
  static revokePermission(pluginId: string, permission: PluginPermission): void {
    const active = this.activeGrants.get(pluginId);
    if (active) {
      active.delete(permission);
    }
    const revoked = this.revokedGrants.get(pluginId) || new Set<PluginPermission>();
    revoked.add(permission);
    this.revokedGrants.set(pluginId, revoked);
  }

  /**
   * Evaluates whether `pluginId` is authorized to execute `permission`.
   * Throws a security violation if unauthorized (`PLG-004`).
   */
  static assertPermission(pluginId: string, permission: PluginPermission): PermissionCheckResult {
    const grants = this.activeGrants.get(pluginId);

    if (!grants) {
      const result: PermissionCheckResult = {
        allowed: false,
        pluginId,
        requestedPermission: permission,
        reason: `Plugin '${pluginId}' is not loaded or has no active permission grants.`,
      };
      throw new Error(`[Security Firewall Violation] ${result.reason}`);
    }

    if (!grants.has(permission)) {
      const result: PermissionCheckResult = {
        allowed: false,
        pluginId,
        requestedPermission: permission,
        reason: `Plugin '${pluginId}' attempted to access capability '${permission}' without explicit manifest declaration or grant.`,
      };
      throw new Error(`[Security Firewall Violation] ${result.reason}`);
    }

    return {
      allowed: true,
      pluginId,
      requestedPermission: permission,
    };
  }

  /**
   * Intercepts and validates network fetch requests (`network:fetch` check) (`PLG-004`).
   */
  static async guardedFetch(pluginId: string, url: string, options?: RequestInit): Promise<Response> {
    this.assertPermission(pluginId, 'network:fetch');

    // Prevent local metadata loopback or sensitive internal routing
    const parsedUrl = new URL(url);
    if (
      parsedUrl.hostname === '169.254.169.254' ||
      parsedUrl.hostname === 'localhost' ||
      parsedUrl.hostname === '127.0.0.1' ||
      parsedUrl.hostname === '0.0.0.0'
    ) {
      throw new Error(`[Security Firewall Violation] Plugin '${pluginId}' attempted restricted loopback access: '${url}'.`);
    }

    return fetch(url, options);
  }

  static getActiveGrants(pluginId: string): PluginPermission[] {
    const grants = this.activeGrants.get(pluginId);
    return grants ? Array.from(grants) : [];
  }

  static resetForTest(): void {
    this.activeGrants.clear();
    this.revokedGrants.clear();
  }
}
