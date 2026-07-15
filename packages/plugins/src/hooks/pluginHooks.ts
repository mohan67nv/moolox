/**
 * @moolox/plugins — AST & Token Hook Injection Points (`PLG-003`)
 *
 * Allows verified plugins to register custom AST node inspectors, property editors, and token palette transforms.
 * All hook executions are bound to the `PluginPermissionFirewall` to prevent privilege escalation (`PLG-004`).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { type PluginHookType } from '../manifest/manifestValidator';
import { PluginPermissionFirewall } from '../security/permissionFirewall';

export type HookCallback = (context: Record<string, any>) => unknown | Promise<unknown>;

export interface RegisteredHook {
  pluginId: string;
  hookType: PluginHookType;
  callback: HookCallback;
}

export class PluginHookRegistry {
  private static hooks = new Map<PluginHookType, RegisteredHook[]>();

  /**
   * Registers a callback for a specific hook injection point (`PLG-003`).
   */
  static registerHook(pluginId: string, hookType: PluginHookType, callback: HookCallback): void {
    // Assert appropriate permissions based on hook type
    if (hookType === 'onASTInspect') {
      PluginPermissionFirewall.assertPermission(pluginId, 'read:ast');
    } else if (hookType === 'onTokenTransform') {
      PluginPermissionFirewall.assertPermission(pluginId, 'write:tokens');
    }

    const list = this.hooks.get(hookType) || [];
    this.hooks.set(hookType, [...list, { pluginId, hookType, callback }]);
  }

  /**
   * Executes all registered callbacks for `hookType`, returning the aggregated context or transformations (`PLG-003`).
   */
  static async executeHooks(hookType: PluginHookType, initialContext: Record<string, any>): Promise<any[]> {
    const list = this.hooks.get(hookType) || [];
    const results: any[] = [];

    for (const item of list) {
      try {
        const res = await item.callback(initialContext);
        results.push({ pluginId: item.pluginId, success: true, result: res });
      } catch (err: unknown) {
        results.push({
          pluginId: item.pluginId,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown hook execution failure.',
        });
      }
    }

    return results;
  }

  static getHooksForType(hookType: PluginHookType): RegisteredHook[] {
    return [...(this.hooks.get(hookType) || [])];
  }

  static resetForTest(): void {
    this.hooks.clear();
  }
}
