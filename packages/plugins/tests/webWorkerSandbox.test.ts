import { describe, it, expect, beforeEach } from 'vitest';
import {
  WebWorkerSandboxEngine,
  WorkerResourceMonitor,
  WorkerRPCBus,
  ResourceExhaustionError,
} from '../src/runtime/webWorkerSandbox';
import { type PluginManifest } from '../src/manifest/manifestValidator';
import { PluginPermissionFirewall } from '../src/security/permissionFirewall';

describe('WebWorkerSandboxEngine & WorkerResourceMonitor (PLG-002..004)', () => {
  const validManifest: PluginManifest = {
    id: 'com.moolox.ast-optimizer',
    version: '1.2.0',
    name: 'AST Tree Optimizer Pro',
    author: 'Moolox Labs',
    description: 'High-speed sandboxed AST pruner.',
    permissions: ['read:ast', 'write:ast'],
    entryPoint: 'dist/worker.js',
    hooks: ['onASTInspect'],
    isActive: true,
  };

  beforeEach(() => {
    WebWorkerSandboxEngine.resetForTest();
  });

  it('spawns an isolated worker and registers manifest permissions with the firewall (`PLG-002`, `PLG-004`)', () => {
    const record = WebWorkerSandboxEngine.spawnWorker(validManifest, 'const x = 42;');
    expect(record.status).toBe('running');
    expect(record.pluginId).toBe('com.moolox.ast-optimizer');
    expect(record.worker).toBeDefined();

    // Verify permission firewall registration
    expect(() => PluginPermissionFirewall.assertPermission('com.moolox.ast-optimizer', 'read:ast')).not.toThrow();
    expect(() => PluginPermissionFirewall.assertPermission('com.moolox.ast-optimizer', 'network:fetch')).toThrow();
  });

  it('blocks worker spawning if script contains forbidden DOM/window identifiers (`PLG-002` structural check)', () => {
    expect(() => {
      WebWorkerSandboxEngine.spawnWorker(validManifest, 'const doc = window.document; doc.location = "http://evil.com";');
    }).toThrow(/Worker security gate failure.*forbidden identifier matching/);
  });

  it('dispatches RPC commands across WorkerRPCBus boundary with zero reference sharing (`PLG-003`)', async () => {
    WebWorkerSandboxEngine.spawnWorker(validManifest, 'const workerReady = true;');

    const cmd = {
      id: 'rpc-101',
      pluginId: 'com.moolox.ast-optimizer',
      type: 'ast:read' as const,
      payload: {},
    };

    const res = await WebWorkerSandboxEngine.dispatchRPC(cmd, { rootId: 'node-root-uuid', type: 'Canvas' });
    expect(res.success).toBe(true);
    expect(res.data?.rootId).toBe('node-root-uuid');
    expect(res.id).toBe('rpc-101');
  });

  it('terminates worker and throws ResourceExhaustionError when CPU execution duration exceeds 500ms limit (`PLG-002`)', async () => {
    WebWorkerSandboxEngine.spawnWorker(validManifest, '/* heavy loop */');

    const cmd = {
      id: 'rpc-slow-202',
      pluginId: 'com.moolox.ast-optimizer',
      type: 'ast:read' as const,
      payload: {},
    };

    // Simulate 550ms execution time (> 500ms limit)
    const res = await WebWorkerSandboxEngine.dispatchRPC(cmd, undefined, undefined, 550);
    expect(res.success).toBe(false);
    expect(res.error).toContain('Worker CPU boundary exceeded');
    expect(res.error).toContain('elapsed 550ms > max 500ms limit');

    // Worker should now be terminated
    const status = WebWorkerSandboxEngine.getWorkerStatus('com.moolox.ast-optimizer');
    expect(status?.status).toBe('terminated');
  });

  it('throws ResourceExhaustionError when memory allocation exceeds 64MB limit (`PLG-002`)', () => {
    expect(() => {
      WorkerResourceMonitor.assertMemoryUsage('com.moolox.ast-optimizer', 72);
    }).toThrow(ResourceExhaustionError);

    expect(() => {
      WorkerResourceMonitor.assertMemoryUsage('com.moolox.ast-optimizer', 72);
    }).toThrow(/Worker heap limit exceeded.*72MB > max 64MB limit/);
  });

  it('terminates worker threads cleanly (`terminateWorker`) (`PLG-002`)', () => {
    WebWorkerSandboxEngine.spawnWorker(validManifest, 'const active = true;');
    expect(WebWorkerSandboxEngine.getWorkerStatus('com.moolox.ast-optimizer')?.status).toBe('running');

    const terminated = WebWorkerSandboxEngine.terminateWorker('com.moolox.ast-optimizer');
    expect(terminated).toBe(true);
    expect(WebWorkerSandboxEngine.getWorkerStatus('com.moolox.ast-optimizer')?.status).toBe('terminated');
  });
});
