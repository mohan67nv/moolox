import { describe, it, expect, beforeEach } from 'vitest';
import {
  ForcePushGuard,
  WebhookConvergenceEngine,
} from '../src/sync/webhook-convergence';

describe('Force-Push Safety & Webhook Convergence Engine (GIT-007, GIT-008)', () => {
  beforeEach(() => {
    WebhookConvergenceEngine.resetForTesting();
  });

  describe('ForcePushGuard (GIT-007)', () => {
    it('blocks force push on protected branches (main, master, production, dev)', () => {
      const audit = ForcePushGuard.evaluatePushSafety('main', true, false);
      expect(audit.allowed).toBe(false);
      expect(audit.reason).toContain('Force-push or non-fast-forward update on protected branch');
    });

    it('blocks non-fast-forward update on protected branch dev', () => {
      const audit = ForcePushGuard.evaluatePushSafety('dev', false, true);
      expect(audit.allowed).toBe(false);
    });

    it('allows fast-forward updates on protected branches and normal updates on feature branches', () => {
      expect(ForcePushGuard.evaluatePushSafety('main', false, false).allowed).toBe(true);
      expect(ForcePushGuard.evaluatePushSafety('feature/hero', true, false).allowed).toBe(true);
    });
  });

  describe('WebhookConvergenceEngine (GIT-008)', () => {
    it('deduplicates exact delivery IDs immediately', () => {
      const res1 = WebhookConvergenceEngine.processWebhookDelivery('del-1', 'push', 'org/repo', 'main', 'sha-111', 1000);
      expect(res1.status).toBe('processed');

      const res2 = WebhookConvergenceEngine.processWebhookDelivery('del-1', 'push', 'org/repo', 'main', 'sha-111', 1000);
      expect(res2.status).toBe('deduplicated');
      expect(res2.message).toContain('already processed');
    });

    it('converges out-of-order/delayed webhooks against active HEAD without stale overwrite', () => {
      // 1. New webhook arrives first (timestamp 2000, sha-NEW)
      const resNew = WebhookConvergenceEngine.processWebhookDelivery('del-new', 'push', 'org/repo', 'main', 'sha-new', 2000);
      expect(resNew.status).toBe('processed');
      expect(WebhookConvergenceEngine.getBranchLatestSha('org/repo', 'main')).toBe('sha-new');

      // 2. Old delayed webhook arrives later (timestamp 1000, sha-OLD)
      const resOld = WebhookConvergenceEngine.processWebhookDelivery('del-old', 'push', 'org/repo', 'main', 'sha-old', 1000);
      expect(resOld.status).toBe('converged');
      expect(resOld.message).toContain('Delayed out-of-order webhook delivery');

      // Verify active HEAD remains sha-NEW (no stale overwrite!)
      expect(WebhookConvergenceEngine.getBranchLatestSha('org/repo', 'main')).toBe('sha-new');
    });
  });
});
