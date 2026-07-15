# CANONICAL IMPLEMENTATION ORDER & POD PARALLELISM MATRIX
## Exact Daily Critical Path Sequence, Blocker Gates & Parallel Pod Orchestration
**Document Series:** Master Execution Plan (MEP) — File 7 of 8 | **Status:** Approved Pod Orchestration | **Throwaway Code:** Zero (0%)

---

# POD PARALLELISM STRATEGY & RESOURCE ALLOCATION

To achieve our aggressive **60-Day `v0.5 Alpha`** and **120-Day `v1.0 Public`** launch targets without incurring technical debt, our founding engineering organization operates as four highly synchronized, domain-bounded execution pods (`Platform Pod`, `AST Pod`, `Canvas Pod`, `AI Pod`).

```mermaid
graph LR
    subgraph S0 [Sprint 0: Monorepo Foundation]
        P0["Platform Pod:<br/>@dios/core + @dios/db Schema (`20+ tables`)"]
        A0["AST Pod:<br/>@dios/types + IASTNode Schema (`Zod Law`)"]
    end

    subgraph S1 [Sprint 1: AST Core Engine]
        A1["AST Pod (Critical Path):<br/>@dios/ast-core SWC Parser + Delta Engine"]
        P1["Platform Pod (Parallel):<br/>@dios/workspace Invites + Zustand Store"]
    end

    subgraph S2 [Sprint 2: Tokens & Canvas]
        C2["Canvas Pod (Critical Path):<br/>@dios/canvas React 19 60fps Iframe"]
        A2["AST Pod (Parallel):<br/>@dios/tokens Tailwind v4 Compiler (`< 5ms`)"]
    end

    subgraph S3 [Sprint 3: AI & Deploy (`v0.5 Gate`)]
        AI3["AI Pod (Critical Path):<br/>@dios/ai 3-Agent Core Loop + Cmd+K SSE"]
        P3["Platform Pod (Parallel):<br/>@dios/deploy Static /out + R2/Edge KV"]
    end

    S0 --> S1 --> S2 --> S3
    
    style A1 fill:#10B981,color:#fff,stroke:#065F46,stroke-width:2px
    style C2 fill:#10B981,color:#fff,stroke:#065F46,stroke-width:2px
    style AI3 fill:#3B82F6,color:#fff,stroke:#1D4ED8,stroke-width:2px
```

---

# 1. DAILY CRITICAL PATH EXECUTION SEQUENCE (`SPRINT 0 THROUGH 3 -> v0.5 ALPHA`)

### Sprint 0 (`Days 1–14`): Monorepo Foundation & Zero-Throwaway ORM Schema
- **Day 1–3 (`Task 0.1 - Platform Pod`):** Initialize `Next.js 15 App Router Monorepo Shell` using `pnpm workspaces` (`packages/*`, `apps/*`) and configure `Turborepo` task pipelines (`build`, `lint`, `typecheck`).
- **Day 4–6 (`Task 0.2 - AST Pod`):** Scaffold `packages/types/src/schemas.ts`; export exact `IASTNode`, `IW3CTokenMap`, `ASTNodeId`, and `WorkspaceRole` Zod schemas (`AST-01`, `TKN-01`).
- **Day 7–10 (`Task 0.3 - Platform Pod`):** Scaffold `packages/db/src/schema/*.ts`. Define our **Complete 100%-Extensible Drizzle ORM Relational Schema across all 20+ tables** (`workspaces`, `projects`, `project_versions`, `ai_sessions`, `deployments`, `marketplace_items`, `plugins`, `enterprise_orgs`). Enforce `is_active = false` flags on dormant `v2.0/v3.0` tables to guarantee zero destructive migrations post-launch (`DB-01`).
- **Day 11–14 (`Task 0.4 - Platform Pod`):** Mount `packages/auth/src/middleware.ts` integrating Clerk Enterprise JWKS verification (`AUTH-01`). Enforce edge JWT signature verification in `< 1ms` on `/api/*` and `/trpc/*` routes. Connect `SET LOCAL` connection pooling parameters for PostgreSQL RLS (`AUTH-02`).
- **Sprint 0 Unblocking Gate:** `pnpm build` passes monorepo-wide in `< 15s`; Drizzle ORM verifies all 20+ tables exist cleanly inside PostgreSQL 16 (`100% schema preserved`).

### Sprint 1 (`Days 15–28`): AST Compiler Engine & Sub-Tree Diffing Core
- **Day 15–18 (`Task 1.1 - AST Pod [CRITICAL PATH]`):** Build `packages/ast-core/src/compiler/*.ts`. Mount SWC JSX/TSX visitor parser (`parseJSX`) and Next.js 15 clean code serializer (`serializeAST`) (`AST-02`).
- **Day 19–22 (`Task 1.2 - AST Pod [CRITICAL PATH]`):** Build `packages/ast-core/src/diff/patcher.ts`. Implement sub-tree structural diffing engine (`computePatch`), emitting minimal delta `ASTMutationPatch` payloads when nodes mutate (`AST-03`).
- **Day 23–25 (`Task 1.3 - AST Pod & Platform Pod`):** Implement `Zstd` high-compression database storage inside `project_versions.ast_tree` (`AST-04`). Build client-side Zustand store (`projectStore.ts`) with debounced auto-saves (`3s buffer`) and `Ctrl+Z` undo/redo checkpoint stacks (`PRJ-02`, `PRJ-04`).
- **Day 26–28 (`Task 1.4 - Platform Pod [PARALLEL]`):** Build `packages/workspace/src/*.ts` member invitation link generator (`WS-02`), brand tone metadata store (`WS-03`), and single-editor optimistic version locking (`PRJ-03`).
- **Sprint 1 Unblocking Gate:** `parseJSX(code)` parses 100-line React TSX into `IASTNode` in `< 30ms`; `computePatch` calculates structural deltas in `< 5ms`; Zustand auto-saves compressed Zstd JSONB cleanly.

### Sprint 2 (`Days 29–42`): Design Tokens Law & React 19 Canvas Engine
- **Day 29–32 (`Task 2.1 - AST Pod [PARALLEL]`):** Build `packages/tokens/src/compiler/*.ts`. Implement real-time `tokens.json -> Tailwind CSS v4 variables` compiler (`< 5ms`) (`TKN-02`) and hardcoded zero-hex validation rules (`TKN-03`).
- **Day 33–36 (`Task 2.2 - Canvas Pod [CRITICAL PATH]`):** Build `apps/web/src/components/canvas/*.tsx`. Mount React 19 virtualized 60fps DOM canvas inside an isolated iframe (`Shadow DOM portal`) (`CNV-01`). Implement multi-viewport matrix buttons (`375px -> 1920px`) (`CNV-03`) and `Shift+W` wireframe debugging grid (`CNV-04`).
- **Day 37–39 (`Task 2.3 - Canvas Pod [CRITICAL PATH]`):** Build bidirectional right-hand Property Inspector panel (`CNV-02`). Connect node selection clicks directly to `ASTNode.props` and `styles`; verify edits reflect on canvas live without iframe reloads.
- **Day 40–42 (`Task 2.4 - AST Pod`):** Build all 11 built-in core component specifications (`Hero`, `Pricing Table`, `Navigation`...) inside `packages/ast-core/src/components/*.ts` (`CMP-01`). Ensure all specs consume `tokens.json` keys strictly.
- **Sprint 2 Unblocking Gate:** Canvas renders 50 DOM elements at `60fps`; editing `padding: p-8` inside Property Inspector updates AST and re-renders canvas in `< 15ms`; ad-hoc hex inputs throw compiler errors.

### Sprint 3 (`Days 43–60`): 3-Agent AI Loop, Edge Publishing & `v0.5 Alpha` Gate
- **Day 43–46 (`Task 3.1 - AI Pod [CRITICAL PATH]`):** Build `packages/ai/src/agents/*.ts`. Mount our **3-Agent Core Loop**: `HaikuRouterAgent` (`AI-02 intent classification in < 250ms`), `SonnetGeneratorAgent` (`AI-03 AST patch generation`), and `StaticLinterGate` (`AI-04 axe-core / DOMPurify local static checking`).
- **Day 47–50 (`Task 3.2 - AI Pod [CRITICAL PATH]`):** Build floating `Cmd+K` prompt drawer (`AI-01`) and Server-Sent Events (`SSE`) streaming API route (`/api/ai/stream`). Connect node targeting (`#hero-heading`) and sub-tree window extraction (`AST-05`).
- **Day 51–55 (`Task 3.3 - Platform Pod [PARALLEL]`):** Build `packages/deploy/src/*.ts` 1-click static Next.js edge compiler (`/out`) (`DEP-01`), Cloudflare R2 + Edge KV Anycast publisher (`*.dios.app`) (`DEP-02`), and instant pointer rollback controllers (`DEP-03`).
- **Day 56–60 (`Task 3.4 - Platform Pod & AI Pod`):** Connect Stripe billing webhooks (`BIL-01`), free tier AI credit counters (`Max 10 credits/mo`) (`BIL-02`), metered credit circuit breakers (`AUTH-03`), and OpenTelemetry (`OTel`) trace spans across all endpoints (`ANA-01`).
- **`v0.5 Alpha` Release Exit Gate (`Day 60`):** Complete end-to-end user simulation (`Cmd+K prompt -> Sonnet patch -> Static gate -> Canvas render -> R2 Edge deploy -> Live *.dios.app URL`). Verified P95 latency `< 3.0s`; AI turn cost `< $0.09`; zero XSS or contrast errors. **CERTIFIED AND RELEASED TO ALPHA COHORT.**

---

# 2. DAILY CRITICAL PATH EXECUTION SEQUENCE (`SPRINT 4 THROUGH 6 -> v1.0 PUBLIC`)

### Sprint 4 (`Days 61–74`): Bidirectional GitHub Monorepo Synchronization (`Code is Truth`)
- **Day 61–64 (`Task 4.1 - Platform Pod & AST Pod`):** Build `packages/git/src/github/*.ts` GitHub App installation client (`GIT-001`) and encrypted credential authorization bridge (`AUTH-007`). Connect repository-linking UI in project settings. Preserve versioned encryption and revocation hooks required by `SEC-002`.
- **Day 65–68 (`Task 4.2 - AST Pod [CRITICAL PATH]`):** Build clean Next.js 15 App Router code exporter (`GIT-002`). Verify the compiler converts internal AST trees and `tokens.json` into standalone, buildable `/src/app/*` TSX code with zero Moolox runtime imports.
- **Day 69–71 (`Task 4.3 - Platform Pod [CRITICAL PATH]`):** Mount Inngest background event worker (`pushCommitJob`) (`GIT-003`). Verify canvas save triggers a background job, bundles code, and commits to the linked GitHub branch (`feat(moolox): update copy`) in `< 4 seconds`.
- **Day 72–74 (`Task 4.4 - AST Pod`):** Build incoming GitHub push webhook listener (`/api/webhooks/github`) (`GIT-004`). Verify developer edits in VS Code trigger the webhook, run the SWC parser, and re-render the active canvas AST inside `< 3 seconds` without conflict. Build the `/dashboard` switcher and append-only activity feed (`WS-004`, `WS-005`).
- **Sprint 4 Unblocking Gate:** Bidirectional push/pull cycle verified across 50 simulated VS Code + Canvas edit turns without data loss or React syntax breakage (`100% code parity`).

### Sprint 5 (`Days 75–88`): Theme Studio, Brand Presets & Template Growth Engine
- **Day 75–78 (`Task 5.1 - Canvas Pod`):** Build W3C Token Theme Studio UI (`TKN-04`). Implement perceptual HSL luminance inversion math allowing 1-click `Light -> Dark mode` toggles while maintaining `>= 4.5:1` WCAG contrast.
- **Day 79–82 (`Task 5.2 - AST Pod [PARALLEL]`):** Compile and verify exactly 50 hardcoded Obsidian brand presets (`Cyberpunk`, `Fintech Clean`, `SaaS Modern`...) inside `/packages/tokens/src/presets/*.json` (`CMP-02`). Build 1-click project template duplication bridge (`PRJ-05`).
- **Day 83–88 (`Task 5.3 - Canvas Pod`):** Build left-hand component insertion slide-over drawer (`CMP-03`), right-hand prop customizer dropdowns (`CMP-04`), and interactive breakpoint grid column splitters (`CNV-05`).
- **Sprint 5 Unblocking Gate:** Clicking any of the 50 brand preset thumbnails recompiles `tokens.json` and updates canvas in `< 50ms`; dragging column splitters updates Tailwind grid classes cleanly.

> **FINAL PRE-GA REPLACEMENT:** The historical sequence above is retained only for traceability. Execute the following binding order:

### Sprint 5 (`Days 75–88`): Integrated Repository Wedge
- **Task 5.1:** Integrate auth/workspace/project/canvas/API paths and complete `PRJ-008` transactional persistence. No in-memory substitute is allowed on the certified journey.
- **Task 5.2:** Implement `GIT-009` compatibility analysis, then `AST-011` editability/confidence enforcement. Editing is blocked until report acceptance.
- **Task 5.3:** Integrate `TKN-004`, `CMP-003..004`, and `CNV-005` against persisted state and safe regions.
- **Task 5.4:** Implement `CHG-001` only after Tasks 5.1–5.3 pass; enforce zero unrelated mutation.
- **Sprint 5 gate:** Real supported repository → accepted report → bounded edit → save/reload → minimal buildable diff.

### Sprint 6 (`Days 89–120`): Orchestration Expansion, Billing Gates & `v1.0 Public` Launch
- **Day 89–95 (`Task 6.1 - AI Pod [CRITICAL PATH]`):** Activate specialized AI orchestration agents (`AI-07`): `LayoutSpecialistAgent`, `UXSpecialistAgent`, and `ReviewerLoopAgent` (`AI-06`). Mount `AI-05` multi-modal Vision image-to-code converter inside `Cmd+K` bar (`Claude 3.7 Vision`).
- **Day 96–104 (`Task 6.2 - Canvas Pod & AST Pod`):** Build virtualized sub-tree lazy windowing (`CNV-06`) and `ASTNodeId` structural conflict resolver (`AST-06`). Verify 100+ page enterprise sites (`500 nodes`) render inside canvas consuming `< 150MB` heap memory.
- **Day 105–112 (`Task 6.3 - Platform Pod [PARALLEL]`):** Build Cloudflare Custom Hostname API bridge for automated CNAME SSL provisioning (`DEP-04`). Connect Stripe Pro (`$29/mo`) and Agency (`$299/mo`) subscription gating checkouts (`BIL-03`, `BIL-04`).
- **Day 113–120 (`Task 6.4 - Platform Pod & Enterprise Pod`):** Mount core web vitals script collector (`ANA-02`) across published sites. Activate dormant `enterprise_orgs` root table (`ENT-01`) and connect Drata continuous SOC2 Type II monitoring checks (`ENT-02`).
- **`v1.0 Public` Release Exit Gate (`Day 120`):** Execute 1,000-user concurrent public readiness penetration and load test. Verify 2-Way Git sync, instant Stripe Pro checkout unlock, and zero failing SOC2 security controls. **CERTIFIED AND LAUNCHED GLOBALLY (`90–95% OF VISION DELIVERED`).**

> **FINAL PRE-GA REPLACEMENT:** The historical launch assertion above is void. Execute this binding order:

### Sprint 6 (`Gate-Driven`): Trust, Commercialization, and GA Certification
- **Task 6.1:** Pull `GIT-005` forward; complete `AI-006`; implement `REV-001` branch/PR, visual review, conflict pause, and merge reconciliation.
- **Task 6.2:** Complete `DEP-004`, `BIL-003`, `PRV-001`, `BIL-007`, and consent-gated `ANA-002`.
- **Task 6.3:** Initial production certification of `MIG-001`, `BKP-001`, `SEC-001..002`, `GIT-007..008`, `OPS-001`, `TST-001`, and `A11Y-001`.
- **Task 6.4:** Execute `TST-002` repository corpus/golden journeys and `VAL-001` paid design-partner gate.
- **GA gate:** All Sprint 6 acceptance criteria in `SPRINT_PLAN.md` pass. No calendar date, traffic simulation, or feature count substitutes for evidence.

---

# 3. HIGH-LEVEL POST-LAUNCH EXECUTION ORDER (`SPRINT 7 THROUGH 12`)

| Sprint & Release Target | Execution Cadence & Pod Assignments | Primary Architectural Tasks & Blockers Resolved |
|:---|:---|:---|
| **Sprint 7 (`v1.5 Polish`)**<br/>*(Months 4–5 / 30 Days)* | **Canvas Pod:** `CNV-07` (Sandpack Emulation)<br/>**AI Pod:** `AI-08` (`pgvector` RAG Memory), `AI-09` (o3 Planner)<br/>**Platform Pod:** `DEP-05` (Image Opt), `CMP-05` (`/components/*` SSG) | Mounts `Sandpack` iframe inside canvas for live API/form testing. Indexes user style corrections inside PostgreSQL `pgvector`. Builds 10,000+ programmatic landing page SSG directory (`/components/*`). |
| **Sprint 7H (`Production Hardening`)**<br/>*(30 Days / Mandatory Gate)* | **Platform Pod:** `MIG-001`, `BKP-001`, `SEC-001..002`, `OPS-001`, `TST-001`<br/>**AST & Platform Pods:** `GIT-007..008`<br/>**Canvas Pod:** `A11Y-001` | Certifies migration/restore safety, credential lifecycle, webhook idempotency, remote-state reconciliation, required CI, operational response, and WCAG 2.2 AA conformance. Blocks Sprint 8 until certified. |
| **Sprint 8 (`v2.0 Gate 1`)**<br/>*(Months 6–7 / 30 Days)* | **Ecosystem Pod:** `MKT-01..05` (Creator Marketplace + Stripe Connect 80/20)<br/>**AST Pod:** `PRJ-06` (Visual Branching)<br/>**Platform Pod:** `WS-06` (Client Portal) | Activates dormant `marketplace_items` schema tables. Builds public creator storefronts (`dios.app/@creator`), Stripe Connect 80/20 payouts, and automated AST ingestion security scanners (`MKT-04`). |
| **Sprint 9 (`v2.0 Ecosystem`)**<br/>*(Months 8–9 / 30 Days)* | **Ecosystem Pod:** `PLG-02..04` (Web Worker Sandbox + postMessage RPC)<br/>**Canvas Pod:** `COL-01..05` (`Yjs` CRDT Multiplayer + Cursors)<br/>**Platform Pod:** `TKN-05` (Figma Sync) | Mounts `WorkerGlobalScope` zero-DOM sandbox for secure third-party plugins. Activates `Yjs` CRDT WebSocket collaboration via Cloudflare Durable Objects. **LAUNCHES `v2.0 ECOSYSTEM` RELEASE.** |
| **Sprint 10 (`Enterprise`)**<br/>*(Months 10–12 / 60 Days)* | **Enterprise Pod:** `ENT-003` (GDPR eu-west-1), `ENT-004` (SCIM 2.0)<br/>`ENT-005` (AWS KMS CMEK), `ENT-006` (HIPAA Shield), `DLC-001..002` (Data Lifecycle)<br/>**Platform Pod:** `AUTH-004` (SAML 2.0 SSO) | Activates `enterprise_orgs` hierarchy. Mounts Okta/Azure AD SAML SSO and SCIM provisioning. Enforces European residency, customer-key encryption, verified deletion/legal holds, and portable exports. |
| **Sprint 11 (`Platform SDK`)**<br/>*(Months 13–18 / 120 Days)*| **Platform Pod:** `SDK-01` (Headless REST/tRPC), `SDK-02` (`@dios/sdk`)<br/>`SDK-03` (`@dios/cli`), `AUTH-06` (API Keys)<br/>**Ecosystem Pod:** `PLG-05` (`@dios/plugin-sdk`) | Transforms DIOS into an open headless platform. Releases official npm package (`@dios/sdk`), public API router (`/api/v1/*`), CLI toolchain (`npx @dios/cli init`), and GitHub Action (`@dios/action`). |
| **Sprint 12 (`Future`)**<br/>*(Months 19–24 / 180 Days)*| **Ecosystem Pod:** `CNV-09` (WebXR 3D Canvas), `SDK-07` (Spatial SDK)<br/>**AI Pod:** `AI-11` (Autonomous Watchdog)<br/>**Enterprise Pod:** `DEP-06` (Air-Gapped Sharder) | Conquers Category Frontiers. Mounts Three.js / React Three Fiber spatial 3D canvas rendering (`WebXR`). Activates background multi-agent watchdog loop auto-repairing broken customer edge sites. |

### Final preserved reassignments

- Sprint 7 additionally receives `AI-005`, `AI-007`, and `CNV-006`; `GIT-005` has moved to Sprint 6.
- Sprint 8 additionally receives `CMP-002`, `PRJ-005`, and `BIL-004` alongside `WS-006`.
- Sprint 10 receives `ENT-001..002` activation with the remaining enterprise scope.
- Sprint 7H is post-GA assurance recertification and still blocks Sprint 8.

---

*— End of File 7 (Canonical Implementation Order — Daily Critical Path Sequence, Blocker Gates & Parallel Pod Orchestration) —*
