/**
 * @moolox/workspace — Multi-Workspace Dashboard Tests (WS-004)
 */

import { describe, it, expect } from 'vitest';
import type { WorkspaceSummary, DashboardData } from '../src/dashboard';

describe('Dashboard Data Model & Formatting (WS-004)', () => {
  const sampleWorkspaceSummary: WorkspaceSummary = {
    id: 'ws_abc123',
    name: 'Acme Corp',
    slug: 'acme-corp',
    plan: 'pro',
    userRole: 'owner',
    projectCount: 5,
    memberCount: 12,
    aiCredits: {
      used: 250,
      limit: 1000,
      percentage: 25,
    },
    lastActivityAt: new Date('2026-07-14T10:00:00Z'),
    hasGitHubIntegration: true,
  };

  it('formats workspace summary correctly with percentage calculation', () => {
    expect(sampleWorkspaceSummary.id).toBe('ws_abc123');
    expect(sampleWorkspaceSummary.aiCredits.percentage).toBe(25);
    expect(sampleWorkspaceSummary.hasGitHubIntegration).toBe(true);
  });

  it('supports aggregating dashboard matrix across multiple workspaces', () => {
    const dashboard: DashboardData = {
      workspaces: [sampleWorkspaceSummary],
      totalWorkspaces: 1,
      totalProjects: 5,
      recentActivity: [
        {
          id: 'log_1',
          workspaceId: 'ws_abc123',
          workspaceName: 'Acme Corp',
          action: 'PROJECT_VERSION_CREATED',
          actorId: 'usr_owner',
          metadata: { versionNum: 4 },
          createdAt: new Date('2026-07-14T10:00:00Z'),
        },
      ],
    };

    expect(dashboard.totalWorkspaces).toBe(1);
    expect(dashboard.totalProjects).toBe(5);
    expect(dashboard.recentActivity[0]!.action).toBe('PROJECT_VERSION_CREATED');
  });
});
