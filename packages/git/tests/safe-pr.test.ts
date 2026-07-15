import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  evaluatePRRiskAndChecks,
  checkMergeConflictsOrUnsafeScope,
  createPullRequestFromChangeSet,
  verifyPRMergeReconciliation,
  SafePRError,
} from '../src/sync/safe-pr';

describe('Safe PR Review & Reconciliation Engine (GIT-005, AI-006, REV-001)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('evaluatePRRiskAndChecks()', () => {
    it('classifies risk as LOW when only regular source code or styling files are modified', () => {
      const summary = evaluatePRRiskAndChecks([
        { path: 'apps/web/src/components/Hero.tsx', content: 'export const Hero = () => <div>Hero</div>;' },
        { path: 'apps/web/src/styles/theme.css', content: ':root { --color: blue; }' },
      ]);

      expect(summary.riskLevel).toBe('low');
      expect(summary.requiresHumanReview).toBe(false);
      expect(summary.riskFactors).toHaveLength(0);
    });

    it('classifies risk as HIGH when protected workflows or database schemas are modified', () => {
      const summary = evaluatePRRiskAndChecks([
        { path: '.github/workflows/deploy.yml', content: 'name: CI/CD' },
        { path: 'packages/db/src/schema.ts', content: 'export const users = pgTable(...)' },
      ]);

      expect(summary.riskLevel).toBe('high');
      expect(summary.requiresHumanReview).toBe(true);
      expect(summary.riskFactors.length).toBeGreaterThanOrEqual(2);
      expect(summary.riskFactors[0]).toContain('CI/CD workflow');
    });

    it('classifies risk as MEDIUM when config files are modified', () => {
      const summary = evaluatePRRiskAndChecks([
        { path: 'apps/web/next.config.ts', content: 'export default { reactStrictMode: true };' },
      ]);

      expect(summary.riskLevel).toBe('medium');
      expect(summary.requiresHumanReview).toBe(true);
      expect(summary.riskFactors[0]).toContain('compiler configuration');
    });
  });

  describe('checkMergeConflictsOrUnsafeScope()', () => {
    it('throws SafePRError with code UNSAFE_SCOPE when attempting to modify production CI deploy workflows', async () => {
      await expect(
        checkMergeConflictsOrUnsafeScope('test-token', 'mohan67nv/moolox', 'main', [
          { path: '.github/workflows/production-deploy.yml', content: 'malicious modification' },
        ]),
      ).rejects.toThrowError(SafePRError);
    });

    it('throws SafePRError when target base branch does not exist (404)', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('Not Found', { status: 404 }) as any,
      );

      await expect(
        checkMergeConflictsOrUnsafeScope('test-token', 'mohan67nv/moolox', 'non-existent-branch', [
          { path: 'apps/web/src/page.tsx', content: 'safe content' },
        ]),
      ).rejects.toThrowError(SafePRError);

      expect(fetchSpy).toHaveBeenCalled();
    });

    it('passes cleanly when scope is safe and base branch exists', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ object: { sha: 'sha123' } }), { status: 200 }) as any,
      );

      await expect(
        checkMergeConflictsOrUnsafeScope('test-token', 'mohan67nv/moolox', 'dev', [
          { path: 'apps/web/src/page.tsx', content: 'safe content' },
        ]),
      ).resolves.toBeUndefined();
    });
  });

  describe('createPullRequestFromChangeSet()', () => {
    it('creates dedicated branch, commits atomic diff, and opens formatted PR with semantic summary', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
        const urlStr = url.toString();
        // Base or head branch HEAD
        if (urlStr.includes('/git/ref/heads/')) {
          return new Response(JSON.stringify({ object: { sha: 'base-sha-123' } }), { status: 200 }) as any;
        }
        // Current commit object
        if (urlStr.endsWith('/git/commits/base-sha-123')) {
          return new Response(JSON.stringify({ tree: { sha: 'base-tree-123' } }), { status: 200 }) as any;
        }
        // Create tree
        if (urlStr.endsWith('/git/trees')) {
          return new Response(JSON.stringify({ sha: 'new-tree-456' }), { status: 200 }) as any;
        }
        // Create commit
        if (urlStr.endsWith('/git/commits')) {
          return new Response(
            JSON.stringify({ sha: 'new-commit-789', html_url: 'https://github.com/commit/789' }),
            { status: 200 },
          ) as any;
        }
        // Create branch reference
        if (urlStr.endsWith('/git/refs') && init?.method === 'POST') {
          return new Response(JSON.stringify({ ref: 'refs/heads/moolox/chg-001' }), { status: 201 }) as any;
        }
        // Patch ref (fast-forward head branch)
        if (urlStr.includes('/git/refs/heads/moolox/chg-') && init?.method === 'PATCH') {
          return new Response(JSON.stringify({ object: { sha: 'new-commit-789' } }), { status: 200 }) as any;
        }
        // Create Pull Request
        if (urlStr.endsWith('/pulls') && init?.method === 'POST') {
          return new Response(
            JSON.stringify({ number: 42, html_url: 'https://github.com/mohan67nv/moolox/pull/42' }),
            { status: 201 },
          ) as any;
        }
        return new Response('Not Found', { status: 404 }) as any;
      });

      const result = await createPullRequestFromChangeSet({
        token: 'test-jwt-token',
        repoFullName: 'mohan67nv/moolox',
        baseBranch: 'dev',
        changeSetId: 'CHG-001',
        files: [{ path: 'apps/web/src/components/Hero.tsx', content: 'export const Hero = () => <div>Updated Hero</div>;' }],
        prTitle: 'Update Hero Section layout tokens',
        prDescription: 'Applies Obsidian Brand Preset styling to Hero Section.',
      });

      expect(result.prNumber).toBe(42);
      expect(result.prUrl).toBe('https://github.com/mohan67nv/moolox/pull/42');
      expect(result.commitSha).toBe('new-commit-789');
      expect(result.headBranch).toContain('moolox/chg-chg-001-');
      expect(result.summary.riskLevel).toBe('low');
    });
  });

  describe('verifyPRMergeReconciliation()', () => {
    it('returns isReconciled = true when SHA matches and PR is mergeable', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify({
            head: { sha: 'expected-sha-999' },
            mergeable: true,
            mergeable_state: 'clean',
          }),
          { status: 200 },
        ) as any,
      );

      const result = await verifyPRMergeReconciliation('test-token', 'mohan67nv/moolox', 42, 'expected-sha-999');

      expect(result.isReconciled).toBe(true);
      expect(result.mergeStatus).toBe('mergeable');
      expect(result.discrepancyReasons).toHaveLength(0);
    });

    it('returns isReconciled = false when PR has merge conflicts against base branch', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify({
            head: { sha: 'expected-sha-999' },
            mergeable: false,
            mergeable_state: 'dirty',
          }),
          { status: 200 },
        ) as any,
      );

      const result = await verifyPRMergeReconciliation('test-token', 'mohan67nv/moolox', 42, 'expected-sha-999');

      expect(result.isReconciled).toBe(false);
      expect(result.mergeStatus).toBe('conflicted');
      expect(result.discrepancyReasons[0]).toContain('merge conflicts');
    });
  });
});
