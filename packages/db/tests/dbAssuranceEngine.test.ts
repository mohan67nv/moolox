import { describe, it, expect, beforeEach } from 'vitest';
import {
  SchemaMigrationVerifier,
  PITRBackupEngine,
} from '../src/assurance/dbAssuranceEngine';

describe('Database Assurance Engine: Migrations & PITR Recovery (MIG-001, BKP-001)', () => {
  beforeEach(() => {
    SchemaMigrationVerifier.resetHistoryForTest();
    PITRBackupEngine.resetForTest();
  });

  describe('SchemaMigrationVerifier (MIG-001)', () => {
    it('verifies backwards compatibility for additive SQL statements', async () => {
      SchemaMigrationVerifier.registerMigrationStep({
        version: 'v1.1.0',
        description: 'Add billing_tier column to tenants',
        sqlStatements: ['ALTER TABLE tenants ADD COLUMN billing_tier VARCHAR(64);'],
        isBackwardsCompatible: true,
      });

      const res = await SchemaMigrationVerifier.verifyNMinusOneCompatibility('v1.0.0', 'v1.1.0');
      expect(res.success).toBe(true);
      expect(res.isNMinusOneCompatible).toBe(true);
      expect(res.errors).toBeUndefined();
    });

    it('fails N-1 audit when destructive DROP TABLE or DROP COLUMN statement is registered', async () => {
      SchemaMigrationVerifier.registerMigrationStep({
        version: 'v1.2.0',
        description: 'Drop old legacy column',
        sqlStatements: ['ALTER TABLE tenants DROP COLUMN old_data;'],
        isBackwardsCompatible: true,
      });

      const res = await SchemaMigrationVerifier.verifyNMinusOneCompatibility('v1.1.0', 'v1.2.0');
      expect(res.success).toBe(false);
      expect(res.isNMinusOneCompatible).toBe(false);
      expect(res.errors![0]).toContain('Destructive SQL detected');
    });
  });

  describe('PITRBackupEngine (BKP-001)', () => {
    it('takes snapshot and restores exactly to requested point in time', async () => {
      const snap1 = PITRBackupEngine.createSnapshot('proj-1', { node1: { type: 'Hero' } });
      expect(snap1.metadata.totalRows).toBe(1);

      // Take a second snapshot 50ms later
      await new Promise((r) => setTimeout(r, 10));
      const midTime = Date.now();
      await new Promise((r) => setTimeout(r, 10));

      const snap2 = PITRBackupEngine.createSnapshot('proj-1', { node1: { type: 'Hero' }, node2: { type: 'Footer' } });
      expect(snap2.metadata.totalRows).toBe(2);

      // Restore to midTime (should restore snap1 because snap2 is after midTime)
      const restored = await PITRBackupEngine.restoreToPointInTime('proj-1', midTime);

      expect(restored.success).toBe(true);
      expect(restored.restoredSnapshotId).toBe(snap1.snapshotId);
      expect(restored.rowsRestored).toBe(1);
    });

    it('returns failure when attempting to restore project with no snapshots', async () => {
      const restored = await PITRBackupEngine.restoreToPointInTime('proj-empty', Date.now());
      expect(restored.success).toBe(false);
      expect(restored.error).toContain('No PITR snapshots found');
    });
  });
});
