/**
 * @moolox/git — Repository Provisioning & Linking Tests (GIT-001)
 */

import { describe, it, expect } from 'vitest';
import { extractRepoFullName } from '../src/sync/push';

describe('Repository Full Name Extraction (GIT-001)', () => {
  it('extracts org/repo from standard HTTPS URL', () => {
    expect(extractRepoFullName('https://github.com/moolox/dios-core')).toBe('moolox/dios-core');
    expect(extractRepoFullName('https://github.com/acme-org/website-2026.git')).toBe('acme-org/website-2026');
  });

  it('extracts org/repo from SSH URL', () => {
    expect(extractRepoFullName('git@github.com:moolox/dios-core.git')).toBe('moolox/dios-core');
    expect(extractRepoFullName('git@github.com:acme-org/website-2026')).toBe('acme-org/website-2026');
  });

  it('throws exact error for invalid or non-GitHub URL formats', () => {
    expect(() => extractRepoFullName('https://gitlab.com/moolox/repo')).toThrow('Cannot extract repository full name from URL');
    expect(() => extractRepoFullName('not-a-url')).toThrow();
  });
});
