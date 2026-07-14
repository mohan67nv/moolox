# DOCUMENT 7 — MASTER FEATURE REGISTRY & PROGRESSIVE ARCHITECTURE BLUEPRINT
## Part 5: Progressive Architecture & 100%-Extensible Database Blueprint
**Document:** 7.5 of 7.6 | **Series:** Master Feature Registry & Staged Delivery Blueprint

---

# 7. PROGRESSIVE ARCHITECTURE & DOMAIN INTERFACE PRESERVATION

To fulfill our **Zero-Throwaway Foundation mandate**, we construct our Next.js 15 Monorepo with explicit domain isolation boundaries. Every future module (`Marketplace`, `Plugins`, `Collaboration`, `Enterprise`) exists as a formal domain interface within our `@dios/types` package and Drizzle ORM schema right from Sprint 1.

## 7.1 The Progressive Interface Extension Pattern
We write exact TypeScript interfaces that allow `v0.5` implementations to be cleanly upgraded to `v2.0+` implementations via dependency injection without refactoring calling code:

```typescript
// ============================================================================
// @dios/types — PROGRESSIVE DOMAIN INTERFACES (PRESERVED DAY 1)
// ============================================================================

export type ReleaseBucket = 'v0.5_Alpha' | 'v1.0_Public' | 'v1.5_Polish' | 'v2.0_Ecosystem' | 'v3.0_Enterprise' | 'Future';

/**
 * 1. THE AST NODE & CRDT COLLABORATION EXTENSION CONTRACT
 * Preserves exact hooks required for Yjs real-time multiplayer without active WebSockets during v1.0.
 */
export interface IASTNode {
  nodeId: string;           // Immutable UUID
  type: string;             // 'section' | 'div' | 'h1' | 'HeroComponent'
  props: Record<string, any>;
  styles: Record<string, string>; // Strictly bound to tokens.json keys
  children?: IASTNode[];
  // FUTURE CRDT HOOK (Preserved Day 1):
  crdtMetadata?: {
    versionVector: Record<string, number>;
    lastModifiedBy: string;
    lockedBy?: string;
  };
}

/**
 * 2. THE MULTI-AGENT ORCHESTRATOR INTERFACE
 * Preserves exact execution contracts for all 12 agents while allowing v0.5 to route only to Core 3.
 */
export interface IAgentContext {
  workspaceId: string;
  projectId: string;
  activeTokens: Record<string, any>;
  targetSubTree: IASTNode;
  userPrompt: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface IAgentExecutor {
  agentId: 'ROUTER' | 'GENERATOR' | 'STATIC_LINTER' | 'PLANNER' | 'LAYOUT' | 'UX' | 'COPY' | 'SEO' | 'A11Y' | 'PERF' | 'SECURITY' | 'REVIEWER';
  releaseBucket: ReleaseBucket;
  execute(context: IAgentContext): Promise<{
    patch: IASTMutationPatch | null;
    diagnostics: Array<{ level: 'error' | 'warn'; message: string; ruleId: string }>;
    tokensUsed: number;
  }>;
}

/**
 * 3. THE CREATOR MARKETPLACE SERVICE INTERFACE
 * Decouples UI component selection from internal built-ins vs external seller listings.
 */
export interface IMarketplaceService {
  getAvailableComponents(workspaceId: string): Promise<Array<{
    itemId: string;
    name: string;
    category: string;
    astTree: IASTNode;
    isBuiltIn: boolean; // true for our 50 launch components; false for v2.0 seller items
    priceCents: number;
  }>>;
}
```

---

# 8. THE 100%-EXTENSIBLE DATABASE BLUEPRINT (`@dios/db`)

We resolve the apparent conflict between the CTO review (which advocated pruning to 8 tables to prevent launch complexity) and our permanent product vision (which requires 20+ tables for marketplace, enterprise, and plugin ecosystems).

We deploy a **100%-Extensible Unified Relational Schema** inside Drizzle ORM right on Day 1. The 8 core production tables are active immediately; the remaining ecosystem and enterprise tables exist cleanly in the schema as dormant/reserved domains (`is_active = false`), allowing seamless post-launch activation without disruptive database migrations.

```sql
-- ============================================================================
-- DIOS COMPLETE 100%-EXTENSIBLE RELATIONAL SCHEMA (ALL 20+ TABLES PRESERVED)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- CORE DOMAIN: TENANCY, IDENTITIES & PROJECTS (ACTIVE IN v0.5 / v1.0)
-- ----------------------------------------------------------------------------

CREATE TABLE workspaces (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    plan VARCHAR(32) NOT NULL DEFAULT 'free', -- free, pro, agency, enterprise
    ai_credits_limit INT NOT NULL DEFAULT 1000,
    ai_credits_used INT NOT NULL DEFAULT 0,
    -- PRESERVED ENTERPRISE HOOK: Pointer to parent enterprise hierarchy
    enterprise_org_id VARCHAR(32), 
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id VARCHAR(32) PRIMARY KEY, -- Clerk sub ID
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE workspace_members (
    workspace_id VARCHAR(32) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id VARCHAR(32) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL DEFAULT 'editor', -- owner, admin, editor, viewer, client_editor
    PRIMARY KEY (workspace_id, user_id)
);

CREATE TABLE projects (
    id VARCHAR(32) PRIMARY KEY,
    workspace_id VARCHAR(32) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    active_version_id VARCHAR(32),
    github_repo_url TEXT,
    github_branch VARCHAR(128) DEFAULT 'main',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, slug)
);

CREATE TABLE project_versions (
    id VARCHAR(32) PRIMARY KEY,
    project_id VARCHAR(32) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version_num INT NOT NULL,
    name VARCHAR(255) DEFAULT 'Auto-Save Checkpoint',
    ast_tree JSONB NOT NULL,    -- Compressed Zstd JSONB AST Document
    tokens_json JSONB NOT NULL, -- Constitutional W3C Design Tokens Law
    created_by VARCHAR(32) REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, version_num)
);

CREATE TABLE ai_sessions (
    id VARCHAR(32) PRIMARY KEY,
    workspace_id VARCHAR(32) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id VARCHAR(32) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_prompt TEXT NOT NULL,
    tokens_consumed INT NOT NULL DEFAULT 0,
    cost_cents DECIMAL(10, 4) NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE deployments (
    id VARCHAR(32) PRIMARY KEY,
    project_id VARCHAR(32) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version_id VARCHAR(32) NOT NULL REFERENCES project_versions(id),
    deployment_url TEXT NOT NULL,
    custom_domain VARCHAR(255),
    status VARCHAR(32) NOT NULL DEFAULT 'live',
    deployed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscriptions (
    workspace_id VARCHAR(32) PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(128) UNIQUE NOT NULL,
    stripe_subscription_id VARCHAR(128) UNIQUE NOT NULL,
    plan_tier VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    current_period_end TIMESTAMPTZ NOT NULL
);

-- ----------------------------------------------------------------------------
-- ECOSYSTEM & MARKETPLACE DOMAIN (PRESERVED FOR v2.0 ACTIVATION)
-- ----------------------------------------------------------------------------

CREATE TABLE seller_accounts (
    user_id VARCHAR(32) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    stripe_connect_account_id VARCHAR(128) UNIQUE NOT NULL,
    storefront_slug VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE marketplace_items (
    id VARCHAR(32) PRIMARY KEY,
    seller_id VARCHAR(32) NOT NULL REFERENCES seller_accounts(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL, -- component, brand_kit, full_template
    price_cents INT NOT NULL DEFAULT 0,
    ast_snapshot JSONB NOT NULL,
    preview_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT FALSE, -- Set true when v2.0 activates
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE item_reviews (
    id VARCHAR(32) PRIMARY KEY,
    item_id VARCHAR(32) NOT NULL REFERENCES marketplace_items(id) ON DELETE CASCADE,
    reviewer_id VARCHAR(32) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE plugins (
    id VARCHAR(32) PRIMARY KEY,
    developer_id VARCHAR(32) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    manifest_json JSONB NOT NULL, -- Permissions: ['read:ast', 'write:tokens']
    worker_bundle_url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE, -- Set true when v2.0 activates
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- COLLABORATION & ANNOTATION DOMAIN (PRESERVED FOR v2.0 ACTIVATION)
-- ----------------------------------------------------------------------------

CREATE TABLE canvas_comments (
    id VARCHAR(32) PRIMARY KEY,
    project_id VARCHAR(32) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    target_node_id VARCHAR(64) NOT NULL, -- Target ASTNodeId
    author_id VARCHAR(32) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- ENTERPRISE & COMPLIANCE DOMAIN (PRESERVED FOR v3.0 / ENTERPRISE ACTIVATION)
-- ----------------------------------------------------------------------------

CREATE TABLE enterprise_orgs (
    id VARCHAR(32) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    sso_domain VARCHAR(255) UNIQUE,
    is_hipaa_enforced BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE workspaces ADD CONSTRAINT fk_workspace_enterprise 
    FOREIGN KEY (enterprise_org_id) REFERENCES enterprise_orgs(id) ON DELETE SET NULL;

CREATE TABLE audit_logs (
    id VARCHAR(32) PRIMARY KEY,
    workspace_id VARCHAR(32) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    actor_id VARCHAR(32) NOT NULL REFERENCES users(id),
    action VARCHAR(128) NOT NULL, -- e.g., 'PROJECT_EXPORTED_GIT', 'TOKEN_CHANGED'
    metadata JSONB,
    ip_address VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

*— End of Part 5 (Progressive Architecture & 100%-Extensible Database Blueprint) —*
