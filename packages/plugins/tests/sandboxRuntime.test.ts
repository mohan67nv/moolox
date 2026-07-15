import { describe, it, expect, beforeEach } from 'vitest';
import { PluginSandboxEngine } from '../src/runtime/sandboxRuntime';
import { PluginHookRegistry } from '../src/hooks/pluginHooks';
import { type PluginManifest } from '../src/manifest/manifestValidator';

describe('PluginSandboxEngine & HookRegistry (PLG-002, PLG-003)', () => {
  const activeManifest: PluginManifest = {
    id: 'com.moolox.inspector',
    version: '1.0.0',
    name: 'Inspector Plugin',
    author: 'Moolox',
    description: 'Inspector',
    permissions: ['read:ast', 'write:ast'],
    entryPoint: 'dist/index.js',
    hooks: ['onASTInspect'],
    isActive: true,
  };

  beforeEach(() => {
    PluginSandboxEngine.resetForTest();
    PluginHookRegistry.resetForTest();
  });

  it('loads plugin and executes authorized RPC commands', async () => {
    PluginSandboxEngine.loadPlugin(activeManifest);

    const res = await PluginSandboxEngine.executeRPCCommand({
      id: 'rpc-101',
      pluginId: 'com.moolox.inspector',
      type: 'ast:read',
      payload: {},
    });

    expect(res.success).toBe(true);
    expect(res.data?.rootId).toBeDefined();
  });

  it('rejects RPC commands when plugin lacks required permissions', async () => {
    PluginSandboxEngine.loadPlugin(activeManifest); // only has read:ast and write:ast

    const res = await PluginSandboxEngine.executeRPCCommand({
      id: 'rpc-102',
      pluginId: 'com.moolox.inspector',
      type: 'tokens:read',
      payload: {},
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('Security Firewall Violation');
  });

  it('rejects RPC execution when plugin is suspended or unloaded', async () => {
    PluginSandboxEngine.loadPlugin(activeManifest);
    PluginSandboxEngine.suspendPlugin('com.moolox.inspector');

    const res = await PluginSandboxEngine.executeRPCCommand({
      id: 'rpc-103',
      pluginId: 'com.moolox.inspector',
      type: 'ast:read',
      payload: {},
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('not active or loaded');
  });

  it('registers and executes AST inspector hooks safely', async () => {
    PluginSandboxEngine.loadPlugin(activeManifest);

    PluginHookRegistry.registerHook('com.moolox.inspector', 'onASTInspect', async (ctx) => {
      return { inspectedNodeId: ctx.nodeId, timestamp: 123456 };
    });

    const results = await PluginHookRegistry.executeHooks('onASTInspect', { nodeId: 'node-hero-001' });
    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(true);
    expect(results[0].result.inspectedNodeId).toBe('node-hero-001');
  });
});
