/**
 * @moolox/db — Complete 100%-Extensible Drizzle ORM Relational Schema
 *
 * Single source of truth for the Moolox database architecture (Feature ID: DB-001).
 * Implements all 15 tables from Master Registry Part 5 right on Day 1.
 *
 * - Core production tables (workspaces, users, workspace_members, projects,
 *   project_versions, ai_sessions, deployments, subscriptions) are active immediately.
 * - Ecosystem, Marketplace, Collaboration, and Enterprise tables exist cleanly
 *   in the schema with dormant flags (`is_active = false`) or optional relations,
 *   enabling zero-throwaway progressive activation across Sprints 1–12.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import {
  pgTable,
  varchar,
  text,
  integer,
  smallint,
  boolean,
  decimal,
  timestamp,
  jsonb,
  primaryKey,
  unique,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { IASTNode, TokenDocument } from '@moolox/types';

// ============================================================================
// 1. ENTERPRISE & COMPLIANCE DOMAIN (PRESERVED FOR v3.0 / ENTERPRISE ACTIVATION)
// Defined first so `workspaces` can reference `enterprise_orgs.id`.
// ============================================================================

export const enterpriseOrgs = pgTable('enterprise_orgs', {
  id: varchar('id', { length: 32 }).primaryKey(),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  ssoDomain: varchar('sso_domain', { length: 255 }).unique(),
  isHipaaEnforced: boolean('is_hipaa_enforced').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================================
// 2. CORE DOMAIN: TENANCY, IDENTITIES & PROJECTS (ACTIVE IN v0.5 / v1.0)
// ============================================================================

export const workspaces = pgTable('workspaces', {
  id: varchar('id', { length: 32 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  plan: varchar('plan', { length: 32 }).notNull().default('free'), // free, pro, agency, enterprise
  aiCreditsLimit: integer('ai_credits_limit').notNull().default(1000),
  aiCreditsUsed: integer('ai_credits_used').notNull().default(0),
  /** Preserved Enterprise Hook: Pointer to parent enterprise hierarchy */
  enterpriseOrgId: varchar('enterprise_org_id', { length: 32 }).references(
    (): AnyPgColumn => enterpriseOrgs.id,
    { onDelete: 'set null' },
  ),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable('users', {
  /** Clerk sub ID */
  id: varchar('id', { length: 32 }).primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  fullName: varchar('full_name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const workspaceMembers = pgTable(
  'workspace_members',
  {
    workspaceId: varchar('workspace_id', { length: 32 })
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 32 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** owner, admin, editor, viewer, client_editor */
    role: varchar('role', { length: 32 }).notNull().default('editor'),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.workspaceId, t.userId] }),
  }),
);

export const projects = pgTable(
  'projects',
  {
    id: varchar('id', { length: 32 }).primaryKey(),
    workspaceId: varchar('workspace_id', { length: 32 })
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    activeVersionId: varchar('active_version_id', { length: 32 }),
    githubRepoUrl: text('github_repo_url'),
    githubBranch: varchar('github_branch', { length: 128 }).default('main'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    workspaceSlugUnique: unique().on(t.workspaceId, t.slug),
  }),
);

export const projectVersions = pgTable(
  'project_versions',
  {
    id: varchar('id', { length: 32 }).primaryKey(),
    projectId: varchar('project_id', { length: 32 })
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    versionNum: integer('version_num').notNull(),
    name: varchar('name', { length: 255 }).default('Auto-Save Checkpoint'),
    /** Compressed JSONB AST Document conforming to IASTNode */
    astTree: jsonb('ast_tree').$type<IASTNode>().notNull(),
    /** Constitutional W3C Design Tokens Law conforming to TokenDocument */
    tokensJson: jsonb('tokens_json').$type<TokenDocument>().notNull(),
    createdBy: varchar('created_by', { length: 32 }).references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    projectVersionUnique: unique().on(t.projectId, t.versionNum),
  }),
);

export const aiSessions = pgTable('ai_sessions', {
  id: varchar('id', { length: 32 }).primaryKey(),
  workspaceId: varchar('workspace_id', { length: 32 })
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  projectId: varchar('project_id', { length: 32 })
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  userPrompt: text('user_prompt').notNull(),
  tokensConsumed: integer('tokens_consumed').notNull().default(0),
  costCents: decimal('cost_cents', { precision: 10, scale: 4 }).notNull().default('0'),
  status: varchar('status', { length: 32 }).notNull().default('completed'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const deployments = pgTable('deployments', {
  id: varchar('id', { length: 32 }).primaryKey(),
  projectId: varchar('project_id', { length: 32 })
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  versionId: varchar('version_id', { length: 32 })
    .notNull()
    .references(() => projectVersions.id, { onDelete: 'restrict' }),
  deploymentUrl: text('deployment_url').notNull(),
  customDomain: varchar('custom_domain', { length: 255 }),
  status: varchar('status', { length: 32 }).notNull().default('live'),
  deployedAt: timestamp('deployed_at', { withTimezone: true }).notNull().defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
  workspaceId: varchar('workspace_id', { length: 32 })
    .primaryKey()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 128 }).unique().notNull(),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 128 }).unique().notNull(),
  planTier: varchar('plan_tier', { length: 32 }).notNull(),
  status: varchar('status', { length: 32 }).notNull().default('active'),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
});

// ============================================================================
// 3. ECOSYSTEM & MARKETPLACE DOMAIN (PRESERVED FOR v2.0 ACTIVATION)
// ============================================================================

export const sellerAccounts = pgTable('seller_accounts', {
  userId: varchar('user_id', { length: 32 })
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  stripeConnectAccountId: varchar('stripe_connect_account_id', { length: 128 }).unique().notNull(),
  storefrontSlug: varchar('storefront_slug', { length: 255 }).unique().notNull(),
  bio: text('bio'),
  isVerified: boolean('is_verified').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const marketplaceItems = pgTable('marketplace_items', {
  id: varchar('id', { length: 32 }).primaryKey(),
  sellerId: varchar('seller_id', { length: 32 })
    .notNull()
    .references(() => sellerAccounts.userId, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  /** component, brand_kit, full_template */
  category: varchar('category', { length: 64 }).notNull(),
  priceCents: integer('price_cents').notNull().default(0),
  astSnapshot: jsonb('ast_snapshot').$type<IASTNode | Record<string, unknown>>().notNull(),
  previewUrl: text('preview_url'),
  /** Set true when v2.0 activates */
  isActive: boolean('is_active').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const itemReviews = pgTable('item_reviews', {
  id: varchar('id', { length: 32 }).primaryKey(),
  itemId: varchar('item_id', { length: 32 })
    .notNull()
    .references(() => marketplaceItems.id, { onDelete: 'cascade' }),
  reviewerId: varchar('reviewer_id', { length: 32 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  rating: smallint('rating').notNull(), // CHECK (rating >= 1 AND rating <= 5) enforced via validation / migration
  comment: text('comment'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const plugins = pgTable('plugins', {
  id: varchar('id', { length: 32 }).primaryKey(),
  developerId: varchar('developer_id', { length: 32 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  /** Permissions array / configuration, e.g., ['read:ast', 'write:tokens'] */
  manifestJson: jsonb('manifest_json').$type<Record<string, unknown>>().notNull(),
  workerBundleUrl: text('worker_bundle_url').notNull(),
  /** Set true when v2.0 activates */
  isActive: boolean('is_active').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================================
// 4. COLLABORATION & ANNOTATION DOMAIN (PRESERVED FOR v2.0 ACTIVATION)
// ============================================================================

export const canvasComments = pgTable('canvas_comments', {
  id: varchar('id', { length: 32 }).primaryKey(),
  projectId: varchar('project_id', { length: 32 })
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  /** Target ASTNodeId */
  targetNodeId: varchar('target_node_id', { length: 64 }).notNull(),
  authorId: varchar('author_id', { length: 32 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isResolved: boolean('is_resolved').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================================
// 5. AUDIT LOGS (ENTERPRISE DOMAIN PRESERVED FOR v3.0 / ENTERPRISE)
// ============================================================================

export const auditLogs = pgTable('audit_logs', {
  id: varchar('id', { length: 32 }).primaryKey(),
  workspaceId: varchar('workspace_id', { length: 32 })
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  actorId: varchar('actor_id', { length: 32 })
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  /** e.g., 'PROJECT_EXPORTED_GIT', 'TOKEN_CHANGED' */
  action: varchar('action', { length: 128 }).notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  ipAddress: varchar('ip_address', { length: 64 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================================
// RELATIONS DEFINITIONS (DRIZZLE ORM JOIN CONTRACTS)
// ============================================================================

export const enterpriseOrgsRelations = relations(enterpriseOrgs, ({ many }) => ({
  workspaces: many(workspaces),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  enterpriseOrg: one(enterpriseOrgs, {
    fields: [workspaces.enterpriseOrgId],
    references: [enterpriseOrgs.id],
  }),
  members: many(workspaceMembers),
  projects: many(projects),
  aiSessions: many(aiSessions),
  subscription: one(subscriptions, {
    fields: [workspaces.id],
    references: [subscriptions.workspaceId],
  }),
  auditLogs: many(auditLogs),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  memberships: many(workspaceMembers),
  createdVersions: many(projectVersions),
  sellerAccount: one(sellerAccounts, {
    fields: [users.id],
    references: [sellerAccounts.userId],
  }),
  reviews: many(itemReviews),
  plugins: many(plugins),
  comments: many(canvasComments),
  auditLogs: many(auditLogs),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceMembers.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [workspaceMembers.userId],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.id],
  }),
  versions: many(projectVersions),
  aiSessions: many(aiSessions),
  deployments: many(deployments),
  comments: many(canvasComments),
}));

export const projectVersionsRelations = relations(projectVersions, ({ one, many }) => ({
  project: one(projects, {
    fields: [projectVersions.projectId],
    references: [projects.id],
  }),
  creator: one(users, {
    fields: [projectVersions.createdBy],
    references: [users.id],
  }),
  deployments: many(deployments),
}));

export const aiSessionsRelations = relations(aiSessions, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [aiSessions.workspaceId],
    references: [workspaces.id],
  }),
  project: one(projects, {
    fields: [aiSessions.projectId],
    references: [projects.id],
  }),
}));

export const deploymentsRelations = relations(deployments, ({ one }) => ({
  project: one(projects, {
    fields: [deployments.projectId],
    references: [projects.id],
  }),
  version: one(projectVersions, {
    fields: [deployments.versionId],
    references: [projectVersions.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [subscriptions.workspaceId],
    references: [workspaces.id],
  }),
}));

export const sellerAccountsRelations = relations(sellerAccounts, ({ one, many }) => ({
  user: one(users, {
    fields: [sellerAccounts.userId],
    references: [users.id],
  }),
  items: many(marketplaceItems),
}));

export const marketplaceItemsRelations = relations(marketplaceItems, ({ one, many }) => ({
  seller: one(sellerAccounts, {
    fields: [marketplaceItems.sellerId],
    references: [sellerAccounts.userId],
  }),
  reviews: many(itemReviews),
}));

export const itemReviewsRelations = relations(itemReviews, ({ one }) => ({
  item: one(marketplaceItems, {
    fields: [itemReviews.itemId],
    references: [marketplaceItems.id],
  }),
  reviewer: one(users, {
    fields: [itemReviews.reviewerId],
    references: [users.id],
  }),
}));

export const pluginsRelations = relations(plugins, ({ one }) => ({
  developer: one(users, {
    fields: [plugins.developerId],
    references: [users.id],
  }),
}));

export const canvasCommentsRelations = relations(canvasComments, ({ one }) => ({
  project: one(projects, {
    fields: [canvasComments.projectId],
    references: [projects.id],
  }),
  author: one(users, {
    fields: [canvasComments.authorId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [auditLogs.workspaceId],
    references: [workspaces.id],
  }),
  actor: one(users, {
    fields: [auditLogs.actorId],
    references: [users.id],
  }),
}));

// ============================================================================
// TYPE EXPORTS (SELECT & INSERT TYPES)
// ============================================================================

export type EnterpriseOrg = typeof enterpriseOrgs.$inferSelect;
export type NewEnterpriseOrg = typeof enterpriseOrgs.$inferInsert;

export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type NewWorkspaceMember = typeof workspaceMembers.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type ProjectVersion = typeof projectVersions.$inferSelect;
export type NewProjectVersion = typeof projectVersions.$inferInsert;

export type AISession = typeof aiSessions.$inferSelect;
export type NewAISession = typeof aiSessions.$inferInsert;

export type Deployment = typeof deployments.$inferSelect;
export type NewDeployment = typeof deployments.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export type SellerAccount = typeof sellerAccounts.$inferSelect;
export type NewSellerAccount = typeof sellerAccounts.$inferInsert;

export type MarketplaceItem = typeof marketplaceItems.$inferSelect;
export type NewMarketplaceItem = typeof marketplaceItems.$inferInsert;

export type ItemReview = typeof itemReviews.$inferSelect;
export type NewItemReview = typeof itemReviews.$inferInsert;

export type Plugin = typeof plugins.$inferSelect;
export type NewPlugin = typeof plugins.$inferInsert;

export type CanvasComment = typeof canvasComments.$inferSelect;
export type NewCanvasComment = typeof canvasComments.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
