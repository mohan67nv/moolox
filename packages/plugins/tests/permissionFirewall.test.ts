import { describe, it, expect, beforeEach } from 'vitest';
import { PluginPermissionFirewall } from '../src/security/permissionFirewall';
import { type PluginManifest } from '../src/manifest/manifestValidator';

describe('PluginPermissionFirewall (PLG-004)', () => {
  const sampleManifest: PluginManifest = {
    id: 'com.moolox.trusted',
    version: '1.0.0',
    name: 'Trusted Extension',
    author: 'Moolox',
    description: 'Trusted plugin',
    permissions: ['read:ast', 'read:tokens'],
    entryPoint: 'dist/index.js',
    hooks: ['onASTInspect'],
    isActive: true,
  };

  beforeEach(() => {
    PluginPermissionFirewall.resetForTest();
  });

  it('allows access when permission is granted by manifest', () => {
    PluginPermissionFirewall.registerPluginPermissions(sampleManifest);
    const result = PluginPermissionFirewall.assertPermission('com.moolox.trusted', 'read:ast');
    expect(result.allowed).toBe(true);
  });

  it('blocks access when permission was not declared in manifest', () => {
    PluginPermissionFirewall.registerPluginPermissions(sampleManifest);
    expect(() => {
      PluginPermissionFirewall.assertPermission('com.moolox.trusted', 'write:ast');
    }).toThrow(/attempted to access capability 'write:ast'/);
  });

  it('blocks access when permission has been explicitly revoked at runtime', () => {
    PluginPermissionFirewall.registerPluginPermissions(sampleManifest);
    PluginPermissionFirewall.revokePermission('com.moolox.trusted', 'read:ast');

    expect(() => {
      PluginPermissionFirewall.assertPermission('com.moolox.trusted', 'read:ast');
    }).toThrow(/Security Firewall Violation/);
  });

  it('prevents loopback requests in guardedFetch', async () => {
    const netManifest: PluginManifest = {
      ...sampleManifest,
      id: 'com.moolox.net',
      permissions: ['network:fetch'],
    };
    PluginPermissionFirewall.registerPluginPermissions(netManifest);

    await expect(
      PluginPermissionFirewall.guardedFetch('com.moolox.net', 'http://169.254.169.254/latest/meta-data')
    ).rejects.toThrow(/attempted restricted loopback access/);
  });
});
