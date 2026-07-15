import { describe, it, expect, beforeEach } from 'vitest';
import { SafeBranchStateController } from '../src/sync/branch-state-controller';

describe('SafeBranchStateController: GitHub Drift Reconciliation & Safe Branch Safety (GIT-008)', () => {
  beforeEach(() => {
    SafeBranchStateController.resetForTesting();
  });

  it('detects zero drift when remote SHA, exported tree, and active AST version match exactly', () => {
    const audit = SafeBranchStateController.reconcileDrift('org/repo', 'main', 'tree-123', 'tree-123', 'tree-123');
    expect(audit.isDriftDetected).toBe(false);
    expect(audit.reconciliationAction).toBe('NO_ACTION');
    expect(audit.driftType).toBeUndefined();
  });

  it('detects missed webhook (remote SHA != exported tree) and triggers SELF_HEALING_PULL', () => {
    const audit = SafeBranchStateController.reconcileDrift('org/repo', 'main', 'remote-new-456', 'tree-123', 'tree-123');
    expect(audit.isDriftDetected).toBe(true);
    expect(audit.driftType).toBe('MISSED_WEBHOOK');
    expect(audit.reconciliationAction).toBe('SELF_HEALING_PULL');
  });

  it('detects AST export lag (exported tree != active AST) and triggers SELF_HEALING_PULL', () => {
    const audit = SafeBranchStateController.reconcileDrift('org/repo', 'main', 'tree-123', 'tree-123', 'ast-newer-789');
    expect(audit.isDriftDetected).toBe(true);
    expect(audit.driftType).toBe('AST_EXPORT_LAG');
    expect(audit.reconciliationAction).toBe('SELF_HEALING_PULL');
  });

  it('pauses sync safely when high-risk event (force_push or branch_delete) occurs', () => {
    const state = SafeBranchStateController.handleUnsafeEvent('org/repo', 'main', 'force_push', 'Detected non-fast-forward push +sha999');
    expect(state.isPausedForSafety).toBe(true);
    expect(state.pauseReason).toContain("unsafe event 'force_push'");

    // Verify reconciliation checks report PAUSED_REQUIRES_APPROVAL when paused
    const audit = SafeBranchStateController.reconcileDrift('org/repo', 'main', 'tree-123', 'tree-123', 'tree-123');
    expect(audit.isDriftDetected).toBe(true);
    expect(audit.reconciliationAction).toBe('PAUSED_REQUIRES_APPROVAL');
  });

  it('resumes branch sync after administrator preview and approval', () => {
    SafeBranchStateController.handleUnsafeEvent('org/repo', 'dev', 'branch_protect', 'Branch protection rules modified');
    expect(SafeBranchStateController.getBranchState('org/repo', 'dev')?.isPausedForSafety).toBe(true);

    const resumed = SafeBranchStateController.resumeBranchSync('org/repo', 'dev');
    expect(resumed?.isPausedForSafety).toBe(false);
    expect(SafeBranchStateController.getBranchState('org/repo', 'dev')?.isPausedForSafety).toBe(false);

    const audit = SafeBranchStateController.reconcileDrift('org/repo', 'dev', 'tree-abc', 'tree-abc', 'tree-abc');
    expect(audit.reconciliationAction).toBe('NO_ACTION');
  });
});
