# ENGINEERING MODULE BREAKDOWN
## Architectural Boundaries, TypeScript Contracts & Pod Ownership Across 16 Modules
**Document Series:** Master Execution Plan (MEP) — File 4 of 8 | **Status:** Canonical Module Specifications | **Isolation Rule:** Zero Cross-Module Leakage

---

# ARCHITECTURAL ISOLATION MANDATE (`@dios/*`)

Our modular Next.js 15 App Router Monorepo (`@dios/core`) enforces strict physical and logical boundaries using `pnpm workspaces` and `Turborepo` task pipelines. Every engineering module exists as a self-contained domain package. Cross-module communication must occur exclusively via explicit TypeScript interfaces (`@dios/types`) or type-safe tRPC procedure calls (`@dios/api`). Direct file import leaks across package boundaries (`import { helper } from '../../packages/ast/src/internal'`) are blocked by our compiler linting gates.

---

# MODULE 1: AUTHENTICATION (`@dios/auth`)

### 1. Architectural Overview & Pod Ownership
- **Monorepo Package Path:** `packages/auth` | **Assigned Engineering Pod:** `Platform Pod`
- **Core Responsibilities:** Edge JWT signature verification, JWKS key rotation, workspace role-based access control (`RBAC` middleware), metered AI credit checking, SAML SSO federation, and headless developer API key hashing.
- **Assigned Canonical Feature IDs:** `AUTH-01`, `AUTH-02`, `AUTH-03`, `AUTH-04`, `AUTH-05`, `AUTH-06` (`6 Features`)

### 2. Exported TypeScript Interfaces & API Contracts
```typescript
// packages/auth/src/contracts.ts
export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer' | 'client_editor';

export interface IAuthContext {
  userId: string;        // Clerk sub UUID
  email: string;
  activeWorkspaceId?: string;
  role?: WorkspaceRole;
}

export interface IRBACService {
  verifyPermission(userId: string, workspaceId: string, requiredRole: WorkspaceRole): Promise<boolean>;
  deductAICredit(workspaceId: string, costCents: number): Promise<{ allowed: boolean; remainingCredits: number }>;
}
```

---

# MODULE 2: WORKSPACE (`@dios/workspace`)

### 1. Architectural Overview & Pod Ownership
- **Monorepo Package Path:** `packages/workspace` | **Assigned Engineering Pod:** `Platform Pod`
- **Core Responsibilities:** Multi-tenant workspace entity management (`workspaces` table), unique URL slug routing (`/w/acme`), member email invitations (`JWT 48hr TTL`), global brand tone settings, and audit activity feeds.
- **Assigned Canonical Feature IDs:** `WS-01`, `WS-02`, `WS-03`, `WS-04`, `WS-05`, `WS-06` (`6 Features`)

### 2. Exported TypeScript Interfaces & API Contracts
```typescript
// packages/workspace/src/contracts.ts
export interface IWorkspace {
  id: string;
  name: string;
  slug: string;
  planTier: 'free' | 'pro' | 'agency' | 'enterprise';
  aiCreditsLimit: number;
  aiCreditsUsed: number;
  metadata: {
    defaultFont?: string;
    brandTone?: string; // e.g., "Professional Fintech with concise copy"
  };
}

export interface IWorkspaceService {
  getWorkspaceBySlug(slug: string): Promise<IWorkspace | null>;
  inviteMember(workspaceId: string, email: string, role: WorkspaceRole): Promise<{ invitationToken: string }>;
}
```

---

# MODULE 3: PROJECTS (`@dios/project`)

### 1. Architectural Overview & Pod Ownership
- **Monorepo Package Path:** `packages/project` | **Assigned Engineering Pod:** `AST Pod`
- **Core Responsibilities:** Project entity creation (`projects` table), active version pointers (`active_version_id`), debounced auto-save state memory buffering (`Zustand`), single-editor optimistic locking, and 1-click template duplication.
- **Assigned Canonical Feature IDs:** `PRJ-01`, `PRJ-02`, `PRJ-03`, `PRJ-04`, `PRJ-05`, `PRJ-06`, `PRJ-07` (`7 Features`)

### 2. Exported TypeScript Interfaces & API Contracts
```typescript
// packages/project/src/contracts.ts
export interface IProject {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  activeVersionId: string;
  githubRepoUrl?: string;
  isSpatial?: boolean;
}

export interface IProjectService {
  createProject(workspaceId: string, name: string, templateVersionId?: string): Promise<IProject>;
  saveAutoSaveCheckpoint(projectId: string, astPayload: any, tokensPayload: any): Promise<{ versionId: string; versionNum: number }>;
}
```

---

# MODULE 4: CANVAS (`@dios/canvas`)

### 1. Architectural Overview & Pod Ownership
- **Monorepo Package Path:** `packages/canvas` (Rendered inside `apps/web/src/components/canvas`) | **Assigned Engineering Pod:** `Canvas Pod`
- **Core Responsibilities:** 60fps virtualized DOM renderer mounting React 19 inside an isolated iframe (`Shadow DOM`), bidirectional right-hand Property Inspector, multi-viewport responsive matrix, breakpoint grid splitters, and `Sandpack` live node emulation.
- **Assigned Canonical Feature IDs:** `CNV-01`, `CNV-02`, `CNV-03`, `CNV-04`, `CNV-05`, `CNV-06`, `CNV-07`, `CNV-08`, `CNV-09`, `CNV-10` (`10 Features`)

### 2. Exported TypeScript Interfaces & API Contracts
```typescript
// packages/canvas/src/contracts.ts
export type ViewportMode = 'mobile' | 'tablet' | 'desktop' | 'ultrawide';

export interface ICanvasState {
  activeProjectId: string;
  selectedNodeId: string | null;
  viewport: ViewportMode;
  wireframeMode: boolean;
  activeCollaborators: Array<{ userId: string; name: string; color: string; cursor: { x: number; y: number } }>;
}

export interface ICanvasBridge {
  mountSubTree(astTree: any, tokensJson: any): void;
  selectNode(nodeId: string): void;
  updateNodeProp(nodeId: string, propKey: string, newValue: any): void;
}
```

---

# MODULE 5: AST ENGINE (`@dios/ast-core`)

### 1. Architectural Overview & Pod Ownership
- **Monorepo Package Path:** `packages/ast-core` | **Assigned Engineering Pod:** `AST Pod`
- **Core Responsibilities:** SWC/TypeScript visitor parser converting JSX/TSX into exact `IASTNode` JSONB structures, delta mutation computing (`ASTMutationPatch`), Zstd JSONB compression, node ID locking, and self-healing syntax recovery.
- **Assigned Canonical Feature IDs:** `AST-01`, `AST-02`, `AST-03`, `AST-04`, `AST-05`, `AST-06`, `AST-07`, `AST-08`, `AST-09` (`9 Features`)

### 2. Exported TypeScript Interfaces & API Contracts
```typescript
// packages/ast-core/src/contracts.ts
export interface IASTNode {
  nodeId: string;           // Immutable UUID ("node-123")
  type: string;             // 'section' | 'div' | 'h1' | 'HeroComponent'
  props: Record<string, any>;
  styles: Record<string, string>; // Strictly mapped to tokens.json keys ("color.bg.primary")
  children?: IASTNode[];
}

export interface IASTMutationPatch {
  targetNodeId: string;
  action: 'ADD_CHILD' | 'REMOVE_NODE' | 'UPDATE_PROPS' | 'UPDATE_STYLES' | 'REPLACE_SUBTREE';
  payload: any;
  timestamp: number;
}

export interface IASTCompilerService {
  parseJSX(tsxCode: string): Promise<IASTNode>;
  serializeAST(tree: IASTNode): Promise<string>; // Outputs clean Next.js 15 TSX
  computePatch(oldTree: IASTNode, newTree: IASTNode): IASTMutationPatch[];
  extractSubTree(tree: IASTNode, targetNodeId: string): { subTree: IASTNode; tokenCostEstimate: number };
}
```

---

# MODULE 6: AI ORCHESTRATION (`@dios/ai`)

### 1. Architectural Overview & Pod Ownership
- **Monorepo Package Path:** `packages/ai` | **Assigned Engineering Pod:** `AI Pod`
- **Core Responsibilities:** Floating `Cmd+K` natural language prompt studio, 3-Agent Core Loop (`Haiku Router -> Sonnet Generator -> Static Linter`), SSE real-time AST patch streaming, `pgvector` RAG context memory, and automated accessibility/performance repair loops.
- **Assigned Canonical Feature IDs:** `AI-01`, `AI-02`, `AI-03`, `AI-04`, `AI-05`, `AI-06`, `AI-07`, `AI-08`, `AI-09`, `AI-10`, `AI-11` (`11 Features`)

### 2. Exported TypeScript Interfaces & API Contracts
```typescript
// packages/ai/src/contracts.ts
export type AIIntent = 'CREATE_SECTION' | 'UPDATE_LAYOUT_AND_STYLE' | 'REFACTOR_COPY' | 'FIX_A11Y';

export interface IAIPromptRequest {
  workspaceId: string;
  projectId: string;
  targetNodeId?: string;
  userPrompt: string;
  subTreeContext: any;
  activeTokensJson: any;
}

export interface IAITurnResult {
  intent: AIIntent;
  patch: IASTMutationPatch | null;
  diagnostics: Array<{ level: 'error' | 'warn'; message: string; ruleId: string }>;
  costCents: number;
  retriesUsed: number;
}
```

---

# MODULE 7: COMPONENTS (`@dios/components`)

### 1. Architectural Overview & Pod Ownership
- **Monorepo Package Path:** `packages/components` | **Assigned Engineering Pod:** `AST Pod`
- **Core Responsibilities:** 11 built-in React 19 component specifications (`Hero`, `Navigation`, `Pricing Table`...), 50 hardcoded Obsidian brand presets (`/presets`), 1-click insertion drawer, and prop customizer metadata.
- **Assigned Canonical Feature IDs:** `CMP-01`, `CMP-02`, `CMP-03`, `CMP-04`, `CMP-05`, `CMP-06` (`6 Features`)

### 2. Exported TypeScript Interfaces & API Contracts
```typescript
// packages/components/src/contracts.ts
export interface IComponentSpec {
  componentId: string; // e.g., "dios-pricing-table-v1"
  name: string;
  category: 'hero' | 'navigation' | 'pricing' | 'feature' | 'footer' | 'cta';
  defaultAST: any;     // Exact IASTNode structure
  allowedVariants: string[]; // ['primary', 'outline', 'minimal']
  configurableProps: Array<{ propKey: string; type: 'string' | 'number' | 'boolean' | 'select'; options?: string[] }>;
}

export interface IComponentRegistry {
  getBuiltInSpecs(): IComponentSpec[];
  getBrandPreset(presetId: string): Promise<{ tokensJson: any; name: string }>;
}
```

---

# MODULE 8: DESIGN TOKENS (`@dios/tokens`)

### 1. Architectural Overview & Pod Ownership
- **Monorepo Package Path:** `packages/tokens` | **Assigned Engineering Pod:** `AST Pod`
- **Core Responsibilities:** W3C `tokens.json` schema validation (`Zod law`), real-time token-to-Tailwind v4 CSS variable compiler (`< 5ms`), hardcoded zero-hex rule engine, interactive Theme Studio (`Light/Dark inverter`), and Figma sync bridges.
- **Assigned Canonical Feature IDs:** `TKN-01`, `TKN-02`, `TKN-03`, `TKN-04`, `TKN-05`, `TKN-06` (`6 Features`)

### 2. Exported TypeScript Interfaces & API Contracts
```typescript
// packages/tokens/src/contracts.ts
export interface IW3CTokenMap {
  color: Record<string, { value: string; type: 'color' }>;
  space: Record<string, { value: string; type: 'dimension' }>;
  font: Record<string, { value: string; type: 'fontFamily' }>;
  [key: string]: any;
}

export interface ITokenCompilerService {
  validateTokensSchema(rawJson: any): { valid: boolean; errors?: string[] };
  compileToTailwindCSS(tokens: IW3CTokenMap): Promise<{ cssVariables: string; tailwindConfig: any }>;
  invertThemeToDark(tokens: IW3CTokenMap): IW3CTokenMap;
}
```

---

# MODULE 9: DEPLOYMENT (`@dios/deploy`)

### 1. Architectural Overview & Pod Ownership
- **Monorepo Package Path:** `packages/deploy` | **Assigned Engineering Pod:** `Platform Pod`
- **Core Responsibilities:** Next.js static edge compiler (`/out` HTML/JS), Cloudflare R2 + Edge KV Anycast publisher (`*.dios.app`), instant pointer rollback controllers (`< 1s`), custom domain CNAME verification, and automated image optimization.
- **Assigned Canonical Feature IDs:** `DEP-01`, `DEP-02`, `DEP-03`, `DEP-04`, `DEP-05`, `DEP-06` (`6 Features`)

### 2. Exported TypeScript Interfaces & API Contracts
```typescript
// packages/deploy/src/contracts.ts
export interface IDeploymentRecord {
  id: string;
  projectId: string;
  versionId: string;
  edgeUrl: string;       // e.g., "https://acme.dios.app"
  customDomain?: string; // e.g., "https://www.acme.com"
  status: 'building' | 'live' | 'failed' | 'rolled_back';
  deployedAt: number;
}

export interface IDeployerService {
  compileAndPublish(projectId: string, versionId: string): Promise<IDeploymentRecord>;
  rollbackEdgePointer(projectId: string, targetVersionId: string): Promise<{ success: boolean; activeVersionId: string }>;
  verifyCustomDomainDNS(customDomain: string, expectedCname: string): Promise<{ verified: boolean; sslProvisioned: boolean }>;
}
```

---

# MODULE 10: GIT MONOREPO SYNC (`@dios/git`)

### 1. Architectural Overview & Pod Ownership
- **Monorepo Package Path:** `packages/git` | **Assigned Engineering Pod:** `Platform Pod` & `AST Pod`
- **Core Responsibilities:** GitHub App repository provisioner (`OAuth`), AST-to-Next.js 15 clean code exporter, Inngest background git pusher (`feat(dios)`), incoming webhook bidirectional code puller (`< 3s`), and `ASTNodeId` structural conflict resolver.
- **Assigned Canonical Feature IDs:** `GIT-01`, `GIT-02`, `GIT-03`, `GIT-04`, `GIT-05`, `GIT-06` (`6 Features`)

### 2. Exported TypeScript Interfaces & API Contracts
```typescript
// packages/git/src/contracts.ts
export interface IGitRepoLink {
  workspaceId: string;
  projectId: string;
  githubRepoFullName: string; // e.g., "acme/marketing-site"
  branch: string;             // e.g., "main"
  lastSyncedCommitSha?: string;
}

export interface IGitSyncService {
  exportProjectToGitHub(projectId: string, commitMessage?: string): Promise<{ commitSha: string; pullRequestUrl?: string }>;
  handleIncomingPushWebhook(payload: any): Promise<{ mutatedNodeIds: string[]; newVersionId: string }>;
}
```

---

# MODULE 11: MARKETPLACE (`@dios/marketplace`)

### 1. Architectural Overview & Pod Ownership
- **Monorepo Package Path:** `packages/marketplace` | **Assigned Engineering Pod:** `Ecosystem Pod`
- **Core Responsibilities:** Creator component storefronts (`dios.app/@creator`), seller accounts (`Stripe Connect Express`), item review star ratings, automated AST ingestion security sandboxes, and AI component style adaptation (`Adapt to My Brand`).
- **Assigned Canonical Feature IDs:** `MKT-01`, `MKT-02`, `MKT-03`, `MKT-04`, `MKT-05`, `MKT-06`, `MKT-07` (`7 Features`)

### 2. Exported TypeScript Interfaces & API Contracts
```typescript
// packages/marketplace/src/contracts.ts
export interface IMarketplaceItem {
  id: string;
  sellerId: string;
  title: string;
  category: 'component' | 'brand_kit' | 'full_template';
  priceCents: number;
  astSnapshot: any;
  previewUrl: string;
  ratingAverage: number;
  isBuiltIn: boolean; // true for launch items; false for seller items
}

export interface IMarketplaceService {
  listAvailableItems(workspaceId: string, category?: string): Promise<IMarketplaceItem[]>;
  purchaseAndUnlockItem(workspaceId: string, itemId: string): Promise<{ unlockedAST: any; stripeTransactionId: string }>;
}
```

---

# MODULE 12: BILLING & SUBSCRIPTIONS (`@dios/billing`)

### 1. Architectural Overview & Pod Ownership
- **Monorepo Package Path:** `packages/billing` | **Assigned Engineering Pod:** `Platform Pod`
- **Core Responsibilities:** Stripe webhook synchronization (`checkout.session.completed`), Free/Pro/Agency subscription plan gating (`$29/$299`), metered AI credit top-up checkouts (`$10/1,000 credits`), and enterprise custom Net-30 purchase order workflows.
- **Assigned Canonical Feature IDs:** `BIL-01`, `BIL-02`, `BIL-03`, `BIL-04`, `BIL-05`, `BIL-06` (`6 Features`)

### 2. Exported TypeScript Interfaces & API Contracts
```typescript
// packages/billing/src/contracts.ts
export interface ISubscriptionTier {
  planId: 'free' | 'pro' | 'agency' | 'enterprise';
  monthlyPriceCents: number;
  includedAICredits: number;
  features: {
    gitExport: boolean;
    customDomain: boolean;
    agencyPortal: boolean;
    removeBadge: boolean;
  };
}

export interface IBillingService {
  createStripeCheckoutSession(workspaceId: string, targetPlanId: string): Promise<{ checkoutUrl: string }>;
  handleStripeWebhookEvent(rawBody: string, signatureHeader: string): Promise<{ processed: boolean; workspaceId?: string }>;
}
```

---

# MODULE 13: ANALYTICS & OBSERVABILITY (`@dios/analytics`)

### 1. Architectural Overview & Pod Ownership
- **Monorepo Package Path:** `packages/analytics` | **Assigned Engineering Pod:** `Platform Pod` & `AI Pod`
- **Core Responsibilities:** OpenTelemetry (`OTel`) distributed trace injection across API/Workers/SSE, published site core web vitals (`LCP/CLS`) script collector, AI token cost telemetry dashboards (`$0.085 avg`), and WAE retention funnel cohort tracking.
- **Assigned Canonical Feature IDs:** `ANA-01`, `ANA-02`, `ANA-03`, `ANA-04`, `ANA-05` (`5 Features`)

### 2. Exported TypeScript Interfaces & API Contracts
```typescript
// packages/analytics/src/contracts.ts
export interface IAITelemetryEvent {
  workspaceId: string;
  projectId: string;
  agentId: string;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
  costCents: number;
}

export interface IAnalyticsCollector {
  recordAITurn(event: IAITelemetryEvent): void;
  recordSitePageView(siteSlug: string, lcpTimeMs: number, referrer: string): void;
  getWorkspaceUsageReport(workspaceId: string): Promise<{ totalCreditsUsed: number; totalGenerations: number; p95LatencyMs: number }>;
}
```

---

# MODULE 14: ENTERPRISE & GOVERNANCE (`@dios/enterprise`)

### 1. Architectural Overview & Pod Ownership
- **Monorepo Package Path:** `packages/enterprise` | **Assigned Engineering Pod:** `Enterprise Pod`
- **Core Responsibilities:** Multi-tiered enterprise organization hierarchy (`enterprise_orgs`), Drata continuous SOC2 Type II monitoring, European GDPR data residency shards (`eu-west-1 Dublin`), SCIM 2.0 automated provisioning, and HIPAA PHI compliance modes.
- **Assigned Canonical Feature IDs:** `ENT-01`, `ENT-02`, `ENT-03`, `ENT-04`, `ENT-05`, `ENT-06`, `ENT-07`, `ENT-08` (`8 Features`)

### 2. Exported TypeScript Interfaces & API Contracts
```typescript
// packages/enterprise/src/contracts.ts
export interface IEnterpriseOrg {
  id: string;
  companyName: string;
  slug: string;
  ssoDomain?: string;
  residencyRegion: 'us-east-1' | 'eu-west-1';
  isHipaaEnforced: boolean;
  kmsKeyArn?: string;
}

export interface IEnterpriseGovernanceService {
  enforceDataResidency(workspaceId: string): Promise<{ assignedDatabasePool: string; assignedStorageBucket: string }>;
  handleSCIMProvisionEvent(action: 'CREATE_USER' | 'DELETE_USER', userData: any): Promise<{ success: boolean }>;
}
```

---

# MODULE 15: PLUGINS & WORKERS (`@dios/plugins`)

### 1. Architectural Overview & Pod Ownership
- **Monorepo Package Path:** `packages/plugins` | **Assigned Engineering Pod:** `Ecosystem Pod`
- **Core Responsibilities:** Plugin extension lifecycle hooks (`IPluginHost`), zero-DOM Web Worker sandboxing (`WorkerGlobalScope`), typed `postMessage` RPC bridge, permission manifest verification (`manifest.json`), and public developer SDK (`@dios/plugin-sdk`).
- **Assigned Canonical Feature IDs:** `PLG-01`, `PLG-02`, `PLG-03`, `PLG-04`, `PLG-05`, `PLG-06` (`6 Features`)

### 2. Exported TypeScript Interfaces & API Contracts
```typescript
// packages/plugins/src/contracts.ts
export interface IPluginManifest {
  pluginId: string;
  name: string;
  version: string;
  permissions: Array<'read:ast' | 'write:ast' | 'read:tokens' | 'write:tokens' | 'network:proxy'>;
  workerEntrypoint: string; // e.g., "dist/worker.bundle.js"
}

export interface IPluginRuntimeService {
  mountPluginWorker(manifest: IPluginManifest, workerCode: string): Promise<{ workerInstanceId: string }>;
  dispatchRPCAction(workerInstanceId: string, action: string, payload: any): Promise<any>;
}
```

---

# MODULE 16: DEVELOPER SDK & PLATFORM (`@dios/sdk`)

### 1. Architectural Overview & Pod Ownership
- **Monorepo Package Path:** `packages/sdk` | **Assigned Engineering Pod:** `Platform Pod` & `Ecosystem Pod`
- **Core Responsibilities:** Public headless REST/tRPC API endpoints (`/api/v1/*`), official TypeScript client library (`@dios/sdk`), CLI toolchain (`npx @dios/cli init / deploy`), headless batch site generation loops, and spatial WebXR 3D engine adapters (`@dios/sdk/spatial`).
- **Assigned Canonical Feature IDs:** `SDK-01`, `SDK-02`, `SDK-03`, `SDK-04`, `SDK-05`, `SDK-06`, `SDK-07` (`7 Features`)

### 2. Exported TypeScript Interfaces & API Contracts
```typescript
// packages/sdk/src/contracts.ts
export interface IDiosHeadlessClient {
  projects: {
    list(workspaceId: string): Promise<any[]>;
    getAST(projectId: string): Promise<any>;
    mutateAST(projectId: string, patch: any): Promise<{ newVersionId: string }>;
  };
  ai: {
    generateTurn(projectId: string, prompt: string, targetNodeId?: string): Promise<{ mutatedTree: any; costCents: number }>;
    generateBatch(customerList: Array<{ businessName: string; industry: string }>): Promise<Array<{ projectId: string; edgeUrl: string }>>;
  };
  deployments: {
    publish(projectId: string): Promise<{ edgeUrl: string }>;
  };
}

export interface ISDKRouterService {
  authenticateBearerToken(authorizationHeader: string): Promise<{ workspaceId: string; allowedScopes: string[] }>;
}
```

---

---

# FINAL PRE-GA CROSS-MODULE CONTRACTS

The nine final trust/validation features reuse existing module boundaries. No seventeenth runtime module is introduced.

| Contract | Canonical owner | Participating modules | Required shape |
|:---|:---|:---|:---|
| `RepositoryCompatibilityReport` | `@moolox/git` | Git, AST, Tokens, Project | Repository SHA, framework profile, supported files/entities, unsupported constructs, parse failures, risks, remediation, accepted-at timestamp. |
| `EditabilityMap` | `@moolox/ast-core` | AST, Canvas, AI | Stable semantic entity ID, source range, classification (`editable`, `review-required`, `read-only`), confidence, reasons, permitted operations. |
| `SemanticChange` | `@moolox/project` | Project, AST, Git, Canvas, Analytics, Deploy | Intent, actor, base SHA/version, semantic IDs, AST patch, file diff, check results, review state, deployment state, outcome references, immutable audit timestamps. |
| `VisualReview` | `@moolox/git` + `apps/web` | Git, Canvas, Deploy | Branch/PR, responsive snapshots, semantic summary, source diff, policy/check status, approve/reject, merged SHA reconciliation. |
| `ConsentRecord` | `@moolox/auth` | Auth, Analytics, AI, Workspace | Tenant/user, purpose, policy version, retention, granted/withdrawn timestamps, audit receipt. |
| `RoundTripEvidence` | root quality tooling | All core modules | Repository fixture/version, cycle number, semantic hashes, diff metrics, check results, unsupported classifications, repair outcome. |

`CHG-001` is an aggregate contract, not a new package. Persistence may use existing project/version/audit extensibility with versioned migrations; implementation must not bypass `MIG-001`.

*— End of File 4 (Engineering Module Breakdown — Architectural Boundaries, TypeScript Contracts & Pod Ownership across 16 Modules) —*
