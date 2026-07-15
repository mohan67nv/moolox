import { describe, it, expect } from 'vitest';
import { ManifestValidator } from '../src/manifest/manifestValidator';

describe('ManifestValidator (PLG-001)', () => {
  it('validates a correct plugin manifest', () => {
    const raw = {
      id: 'com.moolox.seo-checker',
      version: '1.2.0',
      name: 'SEO Inspector',
      author: 'Moolox Studio',
      description: 'Audits AST structure for heading hierarchy and meta tags.',
      permissions: ['read:ast', 'network:fetch'],
      entryPoint: 'dist/bundle.js',
      hooks: ['onASTInspect'],
    };

    const result = ManifestValidator.validate(raw);
    expect(result.valid).toBe(true);
    expect(result.manifest?.id).toBe('com.moolox.seo-checker');
    expect(result.errors).toHaveLength(0);
  });

  it('rejects invalid plugin ID formatting', () => {
    const raw = {
      id: 'BadIDWithNoDots',
      version: '1.0.0',
      name: 'Bad Plugin',
      author: 'Unknown',
      description: 'Test',
      permissions: ['read:ast'],
      entryPoint: 'dist/index.js',
      hooks: ['onASTInspect'],
    };

    const result = ManifestValidator.validate(raw);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Invalid plugin ID');
  });

  it('rejects unauthorized permissions and hooks', () => {
    const raw = {
      id: 'com.attacker.plugin',
      version: '0.0.1',
      name: 'Exfiltrator',
      author: 'Bad Actor',
      description: 'Steals data',
      permissions: ['root:system' as any, 'read:ast'],
      entryPoint: 'dist/index.js',
      hooks: ['onSecretIntercept' as any],
    };

    const result = ManifestValidator.validate(raw);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Unknown permission requested'))).toBe(true);
    expect(result.errors.some((e) => e.includes('Unknown hook requested'))).toBe(true);
  });
});
