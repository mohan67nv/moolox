/**
 * @moolox/db — Schema Unit Tests (Feature: DB-001)
 *
 * Validates the 100%-Extensible Drizzle ORM Relational Schema structure,
 * table configurations, column mappings, and dormant flags.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import { getTableName } from 'drizzle-orm';
import * as schema from '../src/schema';

describe('Drizzle ORM Relational Schema (DB-001)', () => {
  it('exports all 15 canonical tables from Master Registry Part 5', () => {
    // Core Domain
    expect(schema.workspaces).toBeDefined();
    expect(schema.users).toBeDefined();
    expect(schema.workspaceMembers).toBeDefined();
    expect(schema.projects).toBeDefined();
    expect(schema.projectVersions).toBeDefined();
    expect(schema.aiSessions).toBeDefined();
    expect(schema.deployments).toBeDefined();
    expect(schema.subscriptions).toBeDefined();

    // Ecosystem & Marketplace Domain (Preserved for v2.0)
    expect(schema.sellerAccounts).toBeDefined();
    expect(schema.marketplaceItems).toBeDefined();
    expect(schema.itemReviews).toBeDefined();
    expect(schema.plugins).toBeDefined();

    // Collaboration Domain (Preserved for v2.0)
    expect(schema.canvasComments).toBeDefined();

    // Enterprise Domain (Preserved for v3.0 / Enterprise)
    expect(schema.enterpriseOrgs).toBeDefined();
    expect(schema.auditLogs).toBeDefined();
  });

  it('configures table names exactly according to SQL specifications', () => {

    expect(getTableName(schema.workspaces)).toBe('workspaces');
    expect(getTableName(schema.users)).toBe('users');
    expect(getTableName(schema.workspaceMembers)).toBe('workspace_members');
    expect(getTableName(schema.projects)).toBe('projects');
    expect(getTableName(schema.projectVersions)).toBe('project_versions');
    expect(getTableName(schema.aiSessions)).toBe('ai_sessions');
    expect(getTableName(schema.deployments)).toBe('deployments');
    expect(getTableName(schema.subscriptions)).toBe('subscriptions');
    expect(getTableName(schema.sellerAccounts)).toBe('seller_accounts');
    expect(getTableName(schema.marketplaceItems)).toBe('marketplace_items');
    expect(getTableName(schema.itemReviews)).toBe('item_reviews');
    expect(getTableName(schema.plugins)).toBe('plugins');
    expect(getTableName(schema.canvasComments)).toBe('canvas_comments');
    expect(getTableName(schema.enterpriseOrgs)).toBe('enterprise_orgs');
    expect(getTableName(schema.auditLogs)).toBe('audit_logs');
  });

  it('enforces required primary keys across all tables', () => {
    expect(schema.workspaces.id.notNull).toBe(true);
    expect(schema.users.id.notNull).toBe(true);
    expect(schema.projects.id.notNull).toBe(true);
    expect(schema.projectVersions.id.notNull).toBe(true);
    expect(schema.aiSessions.id.notNull).toBe(true);
    expect(schema.deployments.id.notNull).toBe(true);
    expect(schema.subscriptions.workspaceId.notNull).toBe(true);
    expect(schema.sellerAccounts.userId.notNull).toBe(true);
    expect(schema.marketplaceItems.id.notNull).toBe(true);
    expect(schema.itemReviews.id.notNull).toBe(true);
    expect(schema.plugins.id.notNull).toBe(true);
    expect(schema.canvasComments.id.notNull).toBe(true);
    expect(schema.enterpriseOrgs.id.notNull).toBe(true);
    expect(schema.auditLogs.id.notNull).toBe(true);
  });

  it('configures dormant flags on preserved ecosystem and plugin tables', () => {
    // Marketplace items dormant flag (isActive = false default)
    expect(schema.marketplaceItems.isActive.default).toBe(false);

    // Plugins dormant flag (isActive = false default)
    expect(schema.plugins.isActive.default).toBe(false);

    // Seller accounts verification flag
    expect(schema.sellerAccounts.isVerified.default).toBe(false);
  });

  it('configures default values for core tenancy limits and quotas', () => {
    expect(schema.workspaces.plan.default).toBe('free');
    expect(schema.workspaces.aiCreditsLimit.default).toBe(1000);
    expect(schema.workspaces.aiCreditsUsed.default).toBe(0);
    expect(schema.workspaceMembers.role.default).toBe('editor');
    expect(schema.projects.githubBranch.default).toBe('main');
  });

  it('exports all Drizzle relations for type-safe joins across domains', () => {
    expect(schema.workspacesRelations).toBeDefined();
    expect(schema.usersRelations).toBeDefined();
    expect(schema.workspaceMembersRelations).toBeDefined();
    expect(schema.projectsRelations).toBeDefined();
    expect(schema.projectVersionsRelations).toBeDefined();
    expect(schema.aiSessionsRelations).toBeDefined();
    expect(schema.deploymentsRelations).toBeDefined();
    expect(schema.subscriptionsRelations).toBeDefined();
    expect(schema.sellerAccountsRelations).toBeDefined();
    expect(schema.marketplaceItemsRelations).toBeDefined();
    expect(schema.itemReviewsRelations).toBeDefined();
    expect(schema.pluginsRelations).toBeDefined();
    expect(schema.canvasCommentsRelations).toBeDefined();
    expect(schema.enterpriseOrgsRelations).toBeDefined();
    expect(schema.auditLogsRelations).toBeDefined();
  });
});
