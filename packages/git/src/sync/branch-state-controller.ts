/**
 * @moolox/git — GitHub Drift Reconciliation & Safe Branch-State Controller (`GIT-008`)
 *
 * Compares remote SHA, exported tree hash, and active AST tree version to detect
 * semantic or physical Git drift. Automatically self-heals missed webhooks and
 * safely pauses background push jobs (`paused_unsafe_push`) upon detecting force-pushes,
 * branch deletions, or default branch changes until explicitly previewed and approved.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

export interface DriftReconciliationAudit {
  repoFullName: string;
  branch: string;
  remoteSha: string;
  exportedTreeHash: string;
  activeAstVersion: string;
  isDriftDetected: boolean;
  driftType?: 'MISSED_WEBHOOK' | 'AST_EXPORT_LAG' | 'REMOTE_SHA_MISMATCH';
  reconciliationAction: 'NO_ACTION' | 'SELF_HEALING_PULL' | 'PAUSED_REQUIRES_APPROVAL';
  timestamp: number;
}

export type UnsafeGitEventType =
  | 'force_push'
  | 'branch_delete'
  | 'branch_protect'
  | 'repo_transfer'
  | 'default_branch_change';

export interface BranchSafetyState {
  repoFullName: string;
  branch: string;
  isPausedForSafety: boolean;
  pauseReason?: string;
  pausedAt?: number;
  lastEvent?: UnsafeGitEventType;
}

export class SafeBranchStateController {
  private static branchSafetyStates = new Map<string, BranchSafetyState>();

  /**
   * Evaluates reconciliation status between remote SHA, exported tree hash, and active AST version (`GIT-008`).
   */
  static reconcileDrift(
    repoFullName: string,
    branch: string,
    remoteSha: string,
    exportedTreeHash: string,
    activeAstVersion: string,
  ): DriftReconciliationAudit {
    const branchKey = `${repoFullName}:${branch}`;
    const safety = this.branchSafetyStates.get(branchKey);

    // If branch is currently paused due to an unsafe event, require manual approval
    if (safety?.isPausedForSafety) {
      return {
        repoFullName,
        branch,
        remoteSha,
        exportedTreeHash,
        activeAstVersion,
        isDriftDetected: true,
        driftType: 'REMOTE_SHA_MISMATCH',
        reconciliationAction: 'PAUSED_REQUIRES_APPROVAL',
        timestamp: Date.now(),
      };
    }

    // Check if remote SHA differs from exported tree hash (missed webhook self-healing)
    if (remoteSha !== exportedTreeHash) {
      return {
        repoFullName,
        branch,
        remoteSha,
        exportedTreeHash,
        activeAstVersion,
        isDriftDetected: true,
        driftType: 'MISSED_WEBHOOK',
        reconciliationAction: 'SELF_HEALING_PULL',
        timestamp: Date.now(),
      };
    }

    // Check if exported tree differs from active AST version
    if (exportedTreeHash !== activeAstVersion) {
      return {
        repoFullName,
        branch,
        remoteSha,
        exportedTreeHash,
        activeAstVersion,
        isDriftDetected: true,
        driftType: 'AST_EXPORT_LAG',
        reconciliationAction: 'SELF_HEALING_PULL',
        timestamp: Date.now(),
      };
    }

    return {
      repoFullName,
      branch,
      remoteSha,
      exportedTreeHash,
      activeAstVersion,
      isDriftDetected: false,
      reconciliationAction: 'NO_ACTION',
      timestamp: Date.now(),
    };
  }

  /**
   * Intercepts destructive or high-risk repository events, pausing push sync to prevent silent data loss (`GIT-008`).
   */
  static handleUnsafeEvent(
    repoFullName: string,
    branch: string,
    event: UnsafeGitEventType,
    details: string,
  ): BranchSafetyState {
    const branchKey = `${repoFullName}:${branch}`;
    const state: BranchSafetyState = {
      repoFullName,
      branch,
      isPausedForSafety: true,
      pauseReason: `Sync paused due to unsafe event '${event}': ${details}. Manual preview & approval required (` + `GIT-008` + `).`,
      pausedAt: Date.now(),
      lastEvent: event,
    };

    this.branchSafetyStates.set(branchKey, state);
    return state;
  }

  /**
   * Resumes branch sync after administrator preview and approval (`GIT-008`).
   */
  static resumeBranchSync(repoFullName: string, branch: string): BranchSafetyState | null {
    const branchKey = `${repoFullName}:${branch}`;
    const existing = this.branchSafetyStates.get(branchKey);
    if (!existing) return null;

    existing.isPausedForSafety = false;
    existing.pauseReason = undefined;
    this.branchSafetyStates.set(branchKey, existing);
    return existing;
  }

  static getBranchState(repoFullName: string, branch: string): BranchSafetyState | null {
    return this.branchSafetyStates.get(`${repoFullName}:${branch}`) || null;
  }

  static resetForTesting(): void {
    this.branchSafetyStates.clear();
  }
}
