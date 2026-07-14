/**
 * @moolox/types — Domain Types Tests
 *
 * Validates shared domain Zod schemas (WorkspaceRole, PlanTier,
 * ReleaseBucket, AuthContext, AgentId, ViewportMode, DeploymentStatus).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import {
  WorkspaceRoleSchema,
  PlanTierSchema,
  ReleaseBucketSchema,
  AuthContextSchema,
  AgentIdSchema,
  AIIntentSchema,
  ViewportModeSchema,
  DeploymentStatusSchema,
} from '../src/index';

describe('WorkspaceRoleSchema', () => {
  it('accepts all valid roles', () => {
    const roles = ['owner', 'admin', 'editor', 'viewer', 'client_editor'];
    for (const role of roles) {
      expect(WorkspaceRoleSchema.parse(role)).toBe(role);
    }
  });

  it('rejects invalid roles', () => {
    expect(() => WorkspaceRoleSchema.parse('superadmin')).toThrow();
    expect(() => WorkspaceRoleSchema.parse('')).toThrow();
  });
});

describe('PlanTierSchema', () => {
  it('accepts all plan tiers', () => {
    const tiers = ['free', 'pro', 'agency', 'enterprise'];
    for (const tier of tiers) {
      expect(PlanTierSchema.parse(tier)).toBe(tier);
    }
  });

  it('rejects invalid tiers', () => {
    expect(() => PlanTierSchema.parse('premium')).toThrow();
  });
});

describe('ReleaseBucketSchema', () => {
  it('accepts all release buckets matching staged delivery model', () => {
    const buckets = [
      'v0.5_Alpha', 'v1.0_Public', 'v1.5_Polish',
      'v2.0_Ecosystem', 'v3.0_Enterprise', 'Platform', 'Future',
    ];
    for (const bucket of buckets) {
      expect(ReleaseBucketSchema.parse(bucket)).toBe(bucket);
    }
  });
});

describe('AuthContextSchema', () => {
  it('accepts a valid full auth context', () => {
    const ctx = {
      userId: 'user_2abc123',
      email: 'founder@moolox.com',
      activeWorkspaceId: 'ws_123',
      role: 'owner' as const,
    };
    const result = AuthContextSchema.parse(ctx);
    expect(result.userId).toBe('user_2abc123');
    expect(result.role).toBe('owner');
  });

  it('accepts context without optional workspace fields', () => {
    const ctx = {
      userId: 'user_123',
      email: 'user@example.com',
    };
    const result = AuthContextSchema.parse(ctx);
    expect(result.activeWorkspaceId).toBeUndefined();
    expect(result.role).toBeUndefined();
  });

  it('rejects invalid email addresses', () => {
    expect(() =>
      AuthContextSchema.parse({
        userId: 'user_123',
        email: 'not-an-email',
      }),
    ).toThrow();
  });

  it('rejects empty userId', () => {
    expect(() =>
      AuthContextSchema.parse({
        userId: '',
        email: 'user@example.com',
      }),
    ).toThrow();
  });
});

describe('AgentIdSchema', () => {
  it('recognizes all 12 orchestration agents', () => {
    const agents = [
      'ROUTER', 'GENERATOR', 'STATIC_LINTER', 'PLANNER',
      'LAYOUT', 'UX', 'COPY', 'SEO',
      'A11Y', 'PERF', 'SECURITY', 'REVIEWER',
    ];
    expect(agents).toHaveLength(12);
    for (const agent of agents) {
      expect(AgentIdSchema.parse(agent)).toBe(agent);
    }
  });
});

describe('AIIntentSchema', () => {
  it('accepts all intent classifications', () => {
    const intents = [
      'CREATE_SECTION', 'UPDATE_LAYOUT_AND_STYLE', 'REFACTOR_COPY',
      'FIX_A11Y', 'OPTIMIZE_PERFORMANCE', 'GENERATE_FROM_IMAGE',
    ];
    for (const intent of intents) {
      expect(AIIntentSchema.parse(intent)).toBe(intent);
    }
  });
});

describe('ViewportModeSchema', () => {
  it('accepts all viewport modes', () => {
    const modes = ['mobile', 'tablet', 'desktop', 'ultrawide'];
    for (const mode of modes) {
      expect(ViewportModeSchema.parse(mode)).toBe(mode);
    }
  });
});

describe('DeploymentStatusSchema', () => {
  it('accepts all deployment lifecycle states', () => {
    const statuses = ['building', 'live', 'failed', 'rolled_back'];
    for (const status of statuses) {
      expect(DeploymentStatusSchema.parse(status)).toBe(status);
    }
  });
});
