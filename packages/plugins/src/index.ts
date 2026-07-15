/**
 * @moolox/plugins — Plugin Manifest & Sandboxed Extension SDK (`PLG-001..004`)
 *
 * Provides manifest validation, permission firewalls, sandboxed RPC execution, and hook injection points.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

export * from './manifest/manifestValidator';
export * from './security/permissionFirewall';
export * from './runtime/sandboxRuntime';
export * from './runtime/webWorkerSandbox';
export * from './hooks/pluginHooks';
