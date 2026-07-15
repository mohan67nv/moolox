# Moolox 2031 — Product Strategy, Competitive Position, Future-Now Differentiation, and Execution-Plan Gap Report

**Document status:** Strategic review and planning input  
**Date:** July 15, 2026  
**Purpose:** Guide future reconciliation of the Master Execution Plan and Master Feature Registry without deleting or silently replacing existing architecture or commitments  
**Important interpretation:** “2031” means **a product launched in 2026 that feels five years ahead**, not a plan to wait five years before delivering the differentiation  
**Implementation status:** This document is analysis only. It does not itself authorize implementation, change canonical feature IDs, or override `MASTER_EXECUTION_PLAN/CANONICAL_RECONCILIATION.md`.

---

# 1. Executive Decision

## 1.1 The answer

**Build Moolox: YES, conditionally.**

Moolox should not be positioned as another AI website generator. Prompt-to-site generation, visual editing, responsive preview, hosting, code export, Git integration, CMS, and basic analytics are rapidly becoming standard features.

Moolox should instead become:

> **The trusted visual and AI change layer for customer-owned production websites: a system that understands an existing repository, converts human intent into minimal verified changes, enforces organizational policy, coordinates review, preserves why decisions were made, and learns privately from outcomes.**

Short positioning:

> **Safely change production websites through canvas, code, and Git—without breaking the codebase, design system, or business intent.**

Category proposal:

> **Web Change Intelligence.**

This is not simply a visual builder, IDE, CMS, hosting company, or AI agent. It is the control, verification, governance, and organizational-memory layer connecting those systems.

## 1.2 Strategic scores

| Assessment | Current broad plan | Refined future-now strategy |
|---|---:|---:|
| Strategic originality | 4/10 | 8/10 |
| Customer urgency | 6/10 | 8/10 |
| Technical difficulty | 9/10 | 8/10 |
| Competitive defensibility | 4/10 | 8/10 if proven |
| Current implementation readiness | 2/10 | 2/10 |
| Potential customer value | 7/10 | 9/10 |
| Probability of useful paid V1 | 20–30% | 55–65% |
| Probability of early product-market fit | 10–20% | 35–45% |
| Sustainable-business probability | 20–30% | 45–60% |
| Venture-scale probability | 5–15% | 15–25% |
| Estimated failure probability | 80–88% | 55–65% |

These are strategic judgment ranges, not statistically measured forecasts.

## 1.3 Non-negotiable strategic correction

The existing architecture and execution plans should be **preserved**, not discarded. However, preservation must not mean blindly completing every historical feature in its original order.

The reconciliation should:

1. Keep completed technical foundations and canonical IDs.
2. Add missing customer journeys, validation gates, and future-now differentiators.
3. Reclassify speculative parity features so they do not displace the critical wedge.
4. Distinguish prototype completion from integrated, usable, hardened, and customer-validated completion.
5. Require proof of repository fidelity and paid demand before marketplace, spatial, broad enterprise, or autonomous scope.

---

# 2. Scope and Evidence

This report is based on a complete read of all documentation available before its creation:

- **57 documentation files**;
- approximately **125,000 words**;
- Company Bible;
- Founder Research Bible;
- Product Bible V1 and V2;
- Engineering Bible;
- CTO Architecture Review;
- Master Execution Plan;
- Master Feature Registry;
- `KNOWN_GAP.md`;
- `SPRINT_COMPLETION_LEDGER.md`.

The repository implementation was also inspected read-only across the web application and packages for auth, workspace, project, database, AST, tokens, canvas, AI, Git, deploy, billing, analytics, and components.

The competitive review considered the July 2026 direction of:

- Vercel v0;
- Builder.io Fusion/Publish;
- Framer;
- Webflow;
- Figma Design/Make/Sites;
- Lovable;
- Bolt;
- Replit;
- Cursor;
- Devin Desktop/Windsurf;
- Base44;
- Wix Studio;
- WordPress/Elementor;
- Shopify;
- Squarespace;
- Plasmic;
- Webstudio;
- Divhunt;
- Readdy;
- Relume;
- Linear as a workflow-quality benchmark.

Competitor capabilities change quickly. The comparison in this document is strategic evidence as of July 2026 and must be refreshed quarterly before being used in sales, fundraising, or public claims.

---

# 3. What Moolox Is Building

## 3.1 Original product thesis

The documentation describes an AI-native platform combining:

- a Figma/Framer-like visual canvas;
- production React/Next.js output;
- AST-backed visual and code synchronization;
- centralized design tokens;
- contextual and full-project AI editing;
- Git synchronization;
- managed staging and production deployment;
- accessibility and performance remediation;
- collaboration and approval;
- agency handoff;
- enterprise governance;
- analytics, experimentation, and eventual autonomous optimization.

That product remains directionally valuable, but the feature bundle by itself is no longer unique.

## 3.2 Refined product thesis

Moolox should be understood as five connected systems:

### A. Repository Intelligence

Moolox understands a real repository rather than treating it as anonymous text:

- route and layout structure;
- server/client boundaries;
- component ownership;
- design tokens and repeated magic values;
- content and CMS connections;
- analytics events;
- data dependencies;
- tests;
- unsupported or high-risk regions;
- semantic identity across refactors.

### B. Intent-to-Change Engine

A visual edit, natural-language request, policy change, or campaign objective becomes:

- a scoped plan;
- a minimal semantic AST/source patch;
- visual before/after;
- affected routes and components;
- responsive impact;
- plain-language explanation;
- reversible Git change.

### C. Verification and Policy Layer

Before merging or publishing, Moolox verifies:

- type safety;
- tests;
- design tokens;
- component policy;
- accessibility;
- responsive layouts;
- performance budgets;
- security;
- SEO;
- analytics instrumentation;
- customer-defined legal and content rules.

### D. Cross-Functional Change Workflow

Designers, marketers, developers, clients, legal reviewers, and AI agents work on one accountable change object with:

- states;
- owner;
- scope;
- diff;
- approvals;
- comments;
- risk;
- deployment;
- rollback;
- outcome.

### E. Private Organizational Memory

Moolox preserves:

- why an element exists;
- who owns it;
- which audience it serves;
- approved exceptions;
- rejected alternatives;
- experiment history;
- dependencies;
- safe-edit confidence;
- outcome evidence.

This is what can become more valuable every month.

---

# 4. The Problem Being Solved

## 4.1 Existing customer frustrations

The source documents identify recurring frustrations:

1. Figma designs must be rebuilt manually.
2. Visual builders create lock-in.
3. Generated code is often untrusted.
4. AI loses context and rewrites unaffected code.
5. Design systems are inconsistently enforced.
6. Designers cannot safely edit production code.
7. Developers become a bottleneck for routine visual changes.
8. Clients can accidentally break layouts.
9. Visual and Git histories diverge.
10. Accessibility and performance checks occur late.
11. Website tools are split across design, code, CMS, hosting, analytics, QA, comments, and deployment.
12. Agencies repeatedly solve the same operational problems for every client.
13. Website knowledge disappears when an employee or agency leaves.
14. Teams know what changed but often cannot recover why it changed.
15. Businesses launch websites but lack a safe continuous-improvement system.

## 4.2 The sharper problem for 2026

Several competitors can now generate pages, visually edit output, connect Git, deploy, and use design systems. Therefore, Moolox cannot win merely by combining those checkboxes.

The sharper problem is:

> **Companies cannot safely let multiple humans and AI agents evolve a mature production website while preserving architecture, brand rules, business intent, reviewability, ownership, and evidence about what worked.**

## 4.3 Jobs to be done

### Agency owner

> Help the agency deliver and operate more customer-owned websites without adding proportional developer headcount or creating client lock-in.

### Design engineer

> Let designers make production-real changes while preserving components, tokens, accessibility, and code quality.

### Growth team

> Move from an approved idea to a measurable production experiment without an engineering coordination cycle for every small change.

### Frontend/platform team

> Govern components and standards across many web properties and prevent AI or human contributors from creating drift.

### Client stakeholder

> Make safe content or campaign changes and understand their status without learning Git or risking the layout.

### Technical founder

> Launch quickly, retain ownership, and avoid replacing the product when requirements become more sophisticated.

---

# 5. Customers and Beachhead

## 5.1 Recommended initial customer

The strongest initial customer is:

> **An agency or internal web-platform team managing 10–100 React/Next.js properties with Git-based development, recurring changes, and at least a partial design system.**

Why this segment:

- repeated usage rather than one-time generation;
- multiple properties create compounding value;
- clear economic cost from review and handoff;
- stronger willingness to pay;
- direct pain around client permissions;
- clear need for governance;
- potential expansion from one repository to a fleet;
- differentiated from simple-site builders.

## 5.2 Customer prioritization

| Segment | Pain intensity | Willingness to pay | Frequency | Competitive fit | Priority |
|---|---:|---:|---:|---:|---:|
| Next.js agencies with recurring retainers | Very high | High | Very high | Strong | 1 |
| Internal web-platform/design-system teams | Very high | Very high | High | Strong | 2 |
| Growth teams with engineering bottlenecks | High | High | High | Medium/strong | 3 |
| Design engineers | High | Medium/high | High | Strong | 4 |
| Technical founders | Medium/high | Medium | Medium | Crowded | 5 |
| Freelance designers | Medium | Medium | Medium | Crowded | 6 |
| General SMB website owners | Medium | Low/medium | Low | Very crowded | Avoid initially |
| Generic full-stack app builders | Different job | Medium | Medium | Extremely crowded | Reject initially |

## 5.3 Will customers pay?

Customers will not reliably pay a premium for prompt generation alone. They may pay for:

- fewer frontend hours per change;
- faster client approval;
- fewer regressions;
- design-system compliance;
- safe delegation;
- auditable changes;
- fleet-wide updates;
- clean ownership and exit;
- lower maintenance cost;
- evidence-backed improvement.

The pricing proof should use paid design partnerships, not survey enthusiasm.

---

# 6. What Moolox Replaces—and What It Does Not

## 6.1 Workflows Moolox can replace or consolidate

- Figma-to-code reconstruction for supported interfaces;
- repetitive visual implementation;
- disconnected visual QA;
- manual design-token review;
- accessibility and performance checklists;
- screenshots pasted into tickets;
- client review portals disconnected from source;
- hand-written explanations of code changes for non-developers;
- website-maintenance spreadsheets;
- fragile cross-site search-and-replace projects;
- institutional UI knowledge stored in Slack;
- manual audit of component drift;
- portions of deployment approval and rollback tooling;
- fragmented experiment planning and promotion.

## 6.2 Systems Moolox should integrate rather than replace

- GitHub/GitLab;
- Cursor and coding agents;
- Figma;
- Vercel/Cloudflare/AWS;
- Shopify;
- headless CMS platforms;
- PostHog/Amplitude/GA4 and data warehouses;
- Linear/Jira;
- identity providers;
- payment processors;
- observability backends.

## 6.3 Shutdown test

A mature customer should miss:

- semantic repository mapping;
- safe-edit boundaries;
- policy definitions;
- component lineage;
- decision history;
- cross-site impact maps;
- visual explanations of changes;
- client approval workflows;
- experiment context;
- accumulated confidence about what can change safely.

Customers should not lose access to their source, assets, deployments, or data. Moolox should create **valuable dependence without artificial lock-in**.

---

# 7. Future-Now Product Experience

“2031” means the following experience should feel possible at launch or through immediate staged releases—not that Moolox waits until 2031.

## 7.1 The launch demonstration

1. User connects a real Next.js repository.
2. Moolox produces an **editability and risk map**.
3. It identifies components, routes, tokens, dependencies, tests, and unsupported regions.
4. User opens a live production-like canvas.
5. User selects an element and asks for a business-level change.
6. Moolox proposes a plan and shows exactly what is in scope.
7. Moolox generates a minimal semantic patch.
8. User sees visual, source, token, accessibility, responsive, and performance diffs.
9. Moolox runs the repository’s real checks.
10. A normal pull request is opened.
11. Reviewers approve from visual or code views.
12. The change deploys through existing infrastructure or optional Moolox hosting.
13. Moolox records the reason and expected outcome.
14. If instrumented, it observes the outcome and recommends keep, refine, or roll back.

The “magic” is not generation. It is the confidence that every layer remains synchronized.

## 7.2 Future-now signature capabilities

### 1. Repository Reality Map

A visual graph of:

- routes;
- layouts;
- components;
- tokens;
- content sources;
- analytics;
- owners;
- dependencies;
- risk;
- editability.

Each region is marked:

- safe autonomous edit;
- safe with review;
- developer-only;
- generated but protected;
- unsupported.

### 2. Semantic Change Object

Every change includes:

- intent;
- affected semantic entities;
- owner;
- proposed source patch;
- visual diff;
- policy impact;
- checks;
- approvals;
- deployment;
- outcome;
- rollback.

### 3. Interface Policy Compiler

Users define organizational rules in code or plain language:

- approved tokens and components;
- prohibited patterns;
- accessibility rules;
- legal text requirements;
- analytics requirements;
- brand voice;
- allowed experimentation boundaries;
- controlled exceptions.

Policies operate in AI, canvas, CI, PR review, and publishing.

### 4. Designer-Readable Pull Requests

A reviewer sees:

- before/after across breakpoints;
- changed copy and tokens;
- affected components;
- source diff;
- design-system impact;
- accessibility impact;
- performance impact;
- risk;
- explanation of why the change was proposed.

### 5. Intent Memory

Users can ask:

- Why does this pricing section exist?
- Who approved this exception?
- Which experiment created this variant?
- Where else is this component used?
- What breaks if this is removed?
- Why was the previous proposal rejected?

### 6. Fleet-Wide Safe Operations

A legal, brand, accessibility, or component update can be proposed across many repositories, with:

- impact analysis;
- per-property exceptions;
- rollout waves;
- approvals;
- automatic rollback boundaries.

### 7. Outcome-Aware—but Honest—Recommendations

Moolox must not claim causal certainty from weak correlation. It should:

- verify instrumentation;
- propose bounded hypotheses;
- run controlled experiments where possible;
- display uncertainty;
- protect guardrail metrics;
- preserve evidence;
- promote winners as normal reviewable source changes.

---

# 8. End-to-End Delivery

## 8.1 Create or connect

- Create from prompt/preset/template, or connect an existing repository.
- Analyze compatibility.
- Detect design system, components, routes, and content sources.
- Ask for clarification where confidence is low.

## 8.2 Understand

- Build semantic project graph.
- Map visual nodes to source.
- identify safe and unsafe areas.
- detect hard-coded design values and drift.
- import or define organizational policies.

## 8.3 Change

- Direct canvas editing;
- scoped conversational editing;
- multi-page operations;
- source editing;
- policy-driven remediation;
- fleet-wide operations.

## 8.4 Explain

- visual diff;
- semantic source diff;
- plain-language summary;
- affected users/routes/components;
- risk and confidence;
- checks and unresolved issues.

## 8.5 Verify

- build;
- typecheck;
- unit/integration tests;
- visual regression;
- accessibility;
- responsive behavior;
- performance;
- security;
- SEO;
- instrumentation;
- policy compliance.

## 8.6 Approve

- designer approval;
- engineering approval;
- client approval;
- legal/compliance approval where required;
- recorded overrides with owner and expiration.

## 8.7 Deploy

- customer-owned deployment by default;
- optional Moolox staging/hosting;
- immutable artifact;
- domain and SSL where managed;
- canary or staged rollout;
- one-click rollback.

## 8.8 Learn

- observe errors and web vitals;
- connect outcomes;
- record accepted/rejected AI proposals;
- update repository-specific confidence;
- recommend the next safe useful action.

---

# 9. Hosting Strategy

## 9.1 Decision

Keep hosting in the product strategy, but do not make hosting the primary reason to buy or the primary lock-in.

## 9.2 Recommended modes

| Mode | Role |
|---|---|
| Preview hosting | Default activation path for immediate review |
| Moolox managed production | Convenient option for customers wanting one system |
| Customer Vercel/Cloudflare/AWS | First-class production path |
| Static/exported deployment | Zero-runtime-dependency portability |
| Dedicated/private deployment | Later, buyer-driven enterprise scope |

## 9.3 Hosting principles

- Published sites survive Moolox control-plane incidents where feasible.
- Export does not require Moolox runtime.
- Assets, redirects, forms, metadata, and deployment configuration have portability contracts.
- Hosting wins through ease, observability, and optimization—not sabotage of exit.
- Managed telemetry requires explicit privacy controls.

## 9.4 Current reality

The repository currently contains an in-memory deployment prototype, not real Cloudflare publication. Hosting must not be marketed as implemented until durable infrastructure, domains, certificates, artifacts, rollback, observability, and disaster recovery are operating end to end.

---

# 10. Competitive Comparison

## 10.1 Status legend

- **Strong:** mature capability visible in the competitor.
- **Partial:** exists with material boundaries.
- **Planned:** represented in Moolox plans but not yet usable.
- **Future-now proposal:** recommended by this report and should be considered during reconciliation.
- **No:** absent or not a core capability.

## 10.2 Detailed capability comparison

| Capability | Moolox today | Moolox planned/current docs | Moolox future-now target | v0 | Builder.io | Framer | Webflow | Figma Make/Sites | Lovable/Bolt | Cursor/Devin |
|---|---|---|---|---|---|---|---|---|---|---|
| Prompt-to-site | Deterministic prototype | Yes | Baseline, not moat | Strong | Strong | Strong | Strong | Strong | Strong | Through agents |
| High-fidelity visual canvas | Unmounted prototype | Yes | Strong but scoped to safe regions | Partial/strong | Strong | Excellent | Excellent | Excellent design canvas | Partial | Browser/design modes |
| Production React/Next code | Constrained AST prototype | Yes | Customer-owned, minimal patches | Strong | Strong | Platform project model | Export limitations | Partial/evolving | Strong | Native code |
| Import existing mature repository | Service fragments only | Incompletely represented | **Primary V1 capability** | Partial/strong | Strong | No | No true round-trip | Beta/evolving | Bolt partial; Lovable no existing import | Native repository |
| Repository compatibility report | No | No explicit feature | **Required differentiator** | Limited | Partial | No | No | No | No | Code understanding only |
| Safe/unsafe editability map | No | No explicit feature | **Required differentiator** | No | No clear equivalent | No | No | No | No | No visual governance map |
| Repeated visual ↔ code round-trip | Not integrated | Core promise | **Publicly benchmarked fidelity** | Partial | Closest competitor | Platform-internal | No code re-import | Evolving | Generated projects/limitations | Code-native, weaker visual semantics |
| Stable semantic identity through refactors | Sequential IDs currently | Implied AST identity | **Required** | Unclear | Partial | Internal model | Internal model | Internal model | Limited | Code symbols/history |
| Minimal semantic diff guarantee | No | Scoped patches | **Required and measured** | Partial | Partial | Platform change | Platform change | Partial | Variable | Variable by agent |
| Semantic conflict explanation | No | `GIT-005` planned | **Designer-readable three-way conflict UI** | Partial | Partial | Branch workflow | Branch workflow | Partial | Weak/overwrite risks | Developer diff tools |
| Hard token enforcement | Compiler prototype | Yes | **Policy across AI/canvas/code/CI** | Design-system context | Strong | Variables/styles | Strong variables | Strong design systems | Variable | Uses repository rules |
| Interface policy beyond tokens | No | Partial assurance rules | **Brand+legal+a11y+analytics+engineering compiler** | Limited | Partial | Limited | Enterprise governance | Design-system governance | Limited | Rules/instructions, not visual policy graph |
| Visual PR for non-developers | No | Review/diff fragments | **Signature capability** | Partial | PR workflow | Visual branches | Branch/review | Comments/review | PR integration | Code-oriented review |
| Intent/decision memory per element | No | AI memory/RAG only | **Signature capability** | No | No clear equivalent | No | No | Comments/history | Project context | Code/chat history |
| Change outcome attached to source | No | Analytics planned | **Signature capability** | External | Publish/experimentation | A/B + analytics | Optimize | Limited | Basic analytics | External tools |
| Fleet-wide governed changes | No | Enterprise/multi-workspace partial | **Post-V1 differentiator** | Limited | Enterprise | Multi-site partial | Strong enterprise sites | Enterprise org | Workspace projects | Multi-repo agents, less policy-focused |
| Client-safe edit boundaries | No | `WS-006`/agency partial | **First-class agency workflow** | Limited | Roles | Partial | Strong | Permissions | Growing | Not primary |
| Accessibility/performance merge gate | Static prototype | Planned assurance | **Blocking, explainable gate** | External checks | Partial | Audits | Audits/optimization | Design checks | Variable | CI tooling |
| Managed hosting | Mock only | Yes | Optional convenience | Vercel | Customer stack/Builder | Strong | Strong | Sites hosting | Strong | Via integrations |
| No mandatory runtime | Export prototype | Yes | **Binding portability contract** | Yes for code | Often customer stack | No | Export limitations | Platform-dependent | Yes | Yes |
| CMS | No | Historically promised, not canonically complete | Integrate first; native only if validated | External | Strong | Strong | Excellent | Sites CMS | Limited | External/code |
| Native A/B testing | No | Research promise, missing canonical implementation | Later governed experimentation | External | Strong via Publish | Strong | Strong | Limited | Limited | External |
| Agency portal | No | Partial future IDs | Governed customer-owned-repo handoff | Limited | Enterprise | Partial | Strong | Not primary | Growing | No |
| Component lineage/evolution graph | No | Components/marketplace but not lineage | **Future-now differentiation** | No | Partial design-system knowledge | No | Libraries | Libraries | No | Code references only |
| Privacy-safe organizational learning | No | RAG/data lifecycle partial | **Private-by-default moat** | No clear equivalent | Enterprise controls | No clear equivalent | Enterprise controls | Enterprise controls | Project context | Enterprise privacy controls |

## 10.3 Where Moolox is not ahead

Moolox is not currently ahead in:

- product usability;
- prompt generation;
- visual design quality;
- hosting;
- CMS;
- collaboration;
- templates;
- ecosystem;
- enterprise administration;
- analytics;
- A/B testing;
- market distribution.

The current codebase is behind mature competitors in all of these areas.

## 10.4 Where Moolox can become ahead

Moolox can lead if it proves the combined system below—not merely documents it:

| Potential lead | Why competitors remain vulnerable | Required proof |
|---|---|---|
| Brownfield repository onboarding | Many tools work best on generated or constrained projects | Real monorepo corpus and first-change success |
| Honest editability boundaries | AI products often imply universal capability | Correct unsupported/risky-region classification |
| Repeated semantic round-trip | Basic Git sync does not guarantee preservation | Hundreds of repeated external/visual edit cycles |
| Minimal trustworthy patches | Broad rewrites reduce developer trust | Diff-size and manual-repair benchmarks |
| Designer-readable Git governance | Existing PRs are code-centric | Non-developer review success and faster approvals |
| Interface policy compiler | Tokens exist, but full policy enforcement is fragmented | Same rule enforced in canvas, AI, CI, and publish |
| Decision memory | Code and comments rarely preserve business intent | Reliable answers linked to evidence and history |
| Fleet change intelligence | Multi-site tools lack repository-semantic governance | Safe rollout across heterogeneous properties |
| Outcome-linked source history | CRO tools separate experiments from lasting source decisions | Evidence preserved with PR, deployment, and rollback |
| Customer-owned agency workflow | Agency portals often imply platform lock-in | Client-owned repo/infrastructure with safe delegation |

---

# 11. Moolox Capability Stack

## 11.1 What the existing plans already provide or preserve

| Capability group | Existing planned value | Strategic role |
|---|---|---|
| AST core | Parse, transform, serialize, patch, checkpoint | Technical foundation |
| Canvas | Visual selection, editing, responsive preview | User interaction layer |
| Tokens | W3C-style tokens and compilation | Design governance foundation |
| AI pipeline | Scoped generation, routing, validation | Change proposal engine |
| Git | Credentials, push/pull, synchronization, conflicts | Ownership and collaboration |
| Deployment | Export, edge publish, domains, rollback | Activation and optional operations |
| Components | Core specifications, presets, libraries | Reuse and quality |
| Workspace/project | Organizations, projects, roles, versions | Product hierarchy |
| Billing | Subscription, quota, top-up, enterprise billing | Commercial foundation |
| Analytics | Telemetry, page views, web vitals, product metrics | Measurement foundation |
| Security/reliability | Migration, restore, headers, credentials, CI, SLOs | Production assurance |
| Marketplace/plugins | Ecosystem and extensions | Later distribution |
| Collaboration | CRDT, presence, comments | Later multi-user workflow |
| Enterprise | SSO, SCIM, residency, CMEK, audit | Later procurement readiness |
| SDK/API/CLI | Platform access | Later ecosystem |
| Spatial/future | WebXR and autonomous scope | Speculative horizon |

## 11.2 What should be added without deleting the foundation

| New strategic layer | Relationship to existing architecture |
|---|---|
| Repository Reality Map | Builds on AST, Git, project graph, tests, tokens |
| Editability/Confidence Map | Extends AST capability and AI scope controls |
| Semantic Change Object | Unifies AST patch, Git diff, review, deploy, analytics |
| Interface Policy Compiler | Extends tokens, security, accessibility, AI quality gates |
| Visual PR Review | Extends Git, canvas, collaboration, version history |
| Intent/Decision Graph | Extends project versions, AI memory, comments, audit |
| Component Evolution Graph | Extends components, Git history, analytics, marketplace |
| Fleet Governance | Extends workspace, enterprise, Git, deployment |
| Outcome Evidence Graph | Extends analytics, experimentation, change history |
| Private Learning Controls | Extends RAG, data lifecycle, security, enterprise |
| Continuous Research Gates | Extends progress/release planning, not runtime architecture |

---

# 12. Features Missing or Inadequately Represented in Current Sprint Plans

> **Canonical disposition update — 2026-07-15:** The final pre-GA reconciliation has assigned the P0 trust wedge to Sprints 5–6. Canonical IDs are `PRJ-008`, `GIT-009`, `AST-011`, `CHG-001`, `REV-001`, `PRV-001`, `BIL-007`, `TST-002`, and `VAL-001`. Existing features were preserved and selectively reassigned as recorded in `MASTER_EXECUTION_PLAN/CANONICAL_RECONCILIATION.md`. Remaining post-GA gaps below are intentionally preserved for later sprint detail, integration, or explicit rejection—not silently forgotten.

This table is intended as input for a future reconciliation. “Missing” does not always mean no related code or ID exists; it may mean the complete customer outcome lacks a canonical feature, owner, dependencies, sprint, or acceptance criteria.

## 12.1 Highest-priority missing requirements

| Missing/incomplete requirement | Source documents | Current coverage | Gap classification | Recommended action |
|---|---|---|---|---|
| Existing mature repository onboarding journey | Founder frustrations; Product Bible code ownership; refined competitive analysis | Git linking exists, but no complete compatibility/onboarding feature | **Untracked as journey** | Add P0 epic before broad parity work |
| Repository compatibility report | Implied by code-as-truth and brownfield need | None | **Untracked** | Add supported constructs, risk, and remediation report |
| Safe/unsafe editability map | AI must not break working code; scoped edits | Scope/pruning exists internally | **Untracked customer feature** | Add confidence zones and unsupported-region UX |
| Public repeated round-trip benchmark | Core moat in all bibles | Unit tests and Git features do not establish product fidelity | **Untracked proof gate** | Add release benchmark and corpus |
| Minimal semantic diff metric | Founder complaints about destructive rewriting | Scoped AST patches partial | **Inadequate acceptance criteria** | Measure changed nodes/files/lines and repair rate |
| Designer-readable visual PR | Product review workflows; Git differentiation | Diffs/review fragments | **Partial** | Add complete review journey and UI |
| Intent/decision memory per semantic element | Founder future/moat; AI memory; company vision | RAG/preferences only | **Untracked** | Add intent graph with evidence, ownership, retention |
| Interface policy compiler beyond tokens | Product principles; accessibility/security/legal commitments | Tokens and separate static gates | **Partial** | Unify brand, a11y, legal, analytics, engineering policies |
| Component lineage and migration graph | Reuse, design systems, marketplace, enterprise governance | Component registry only | **Untracked** | Add lineage, usage, deprecation, migration |
| Multi-site fleet change operations | Agency/enterprise vision | Workspaces and future enterprise features | **Partial** | Add impact analysis, rollout waves, exceptions, rollback |
| Complete agency client handoff | Product Bible journey; Founder agency moat | `WS-006`, `BIL-004`, `AGC-*` fragments | **Partial** | Add review request, approval, staging, audit, notifications |
| Conversion experiment lifecycle | Founder whitespace #3/#76; Product Bible v2 | Analytics without canonical complete experiment system | **Untracked** | Add variant, assignment, exposure, goal, decision, promotion |
| Conversion-data moat architecture | Founder Research’s strongest long-term moat | No canonical data/evidence graph | **Untracked** | Add privacy-safe outcome evidence and learning contracts |
| Statistical testing rules and guardrails | Product vision for autonomous CRO | None | **Untracked** | Define validity, duration, sample, guardrails, uncertainty |
| Consent for analytics/experimentation | Company legal; Product privacy; production requirements | Data lifecycle arrives later | **Partial/too late** | Move privacy prerequisites before analytics activation |
| AI memory inspection/deletion controls | Product memory and privacy principles | RAG planned; lifecycle general | **Partial** | Add customer-visible memory controls |
| Golden journey: signup to live under 3 minutes | Product Bible V1/V2 | Components distributed across sprints | **No journey owner/gate** | Add Playwright funnel and performance gate |
| Golden journey: repo to first safe merged PR | Refined wedge; code/Git vision | No complete journey | **Untracked** | Make primary activation metric |
| URL/HTML/existing-site import | Founder frustrations and white-space list | Figma token sync only | **Untracked** | Decide: implement constrained importer or reject explicitly |
| Figma Auto Layout to AST, not token-only sync | Founder Research; Product Bible | `TKN-005` token sync; future adapter partial | **Partial** | Clarify full import or integration boundary |
| CMS strategy | Product Bible v1/v3; client editing | No canonical CMS feature set | **Untracked decision** | Integrate headless CMS first or register constrained native CMS |
| Research validation cadence | Founder Research closing mandate | No sprint owner | **Untracked operating requirement** | Add continuous discovery workstream |
| Paid design partner gate | Business-risk requirement | None | **Untracked** | Block broad expansion until paid evidence |
| Willingness-to-pay validation | Pricing research | Price assumptions only | **Untracked** | Test packages through paid pilots |
| Competitive refresh | Time-sensitive research | None | **Untracked** | Quarterly official-source review |
| Product-outcome metrics | Product Bible success metrics | Analytics IDs only partially represent them | **Partial** | Add release thresholds for activation, retention, trust |
| Save endpoint production verification | `KNOWN_GAP.md` `PRJ-002`/`CORE-002` | No owned sprint/gate | **Explicit open gap** | Assign sprint, owner, test, acceptance |
| 22-screen traceability | Product Bible V2 | Coverage asserted, not mapped | **Partial** | Map each screen to feature IDs and release |
| 11+ AI interaction modalities | Product Bible V2 | Some AI IDs | **Partial** | Map, preserve, or explicitly defer each modality |
| Public 500+ brand-kit repository | Founder growth `GRO-002` | No clear MEP feature | **Untracked/defer candidate** | Validate before adding; do not treat as moat |
| Copy/SEO/a11y/performance/security specialist semantics | Historical `ORC-*` | Collapsed into AI IDs | **Partially mapped** | Preserve outcomes, not necessarily 12 agents |
| Full billing lifecycle | Product/business bibles | Subscription/quota mechanisms | **Partial** | Add tax, invoices, proration, retries, refunds, disputes |
| Canonical pricing and credits | Conflicting bibles/plans | Multiple contradictory values | **Unresolved decision** | Approve one model with economics gate |
| Gross-margin and AI-cost gate | Company financial plan | AI cost telemetry partial | **Partial** | Add workload scenarios and release guardrail |
| Managed hosting portability contract | Zero lock-in promise | Export and deployment features | **Partial** | Include assets, forms, data, redirects, config, experiments |

## 12.2 Research opportunities that should not automatically become features

The Founder Research Bible contains a 100-item whitespace list. Those items are opportunities, not approved commitments. The following should generally be integrations or deferred unless customers prove demand:

| Opportunity | Recommended disposition |
|---|---|
| Native e-commerce engine | Integrate Shopify/Stripe; do not build inventory/checkout core |
| Native email/newsletter platform | Integrate existing providers |
| Support chatbot builder | Integrate; not core |
| Community/forum platform | Integrate |
| Job board, podcast, event, course builders | Templates/integrations only if demand |
| Native mobile app generation | Reject in current strategy |
| WebXR/spatial builder | Defer indefinitely until core trust |
| AI video generation | Integrate provider if needed |
| Full analytics warehouse | Integrate; retain change/outcome evidence only |
| Full CMS | Prefer headless integration; consider constrained content layer |
| Marketplace | Defer until repeat usage and supply economics |
| Community edition | Consider only if it advances repository adapters/distribution |
| Voice editing | Low-cost interface addition after core reliability |
| QR/link shortener/popups/social proof | Commodity integration/template features |
| Legal-page generation | Assist with disclaimers; never claim legal compliance automatically |

## 12.3 Canonical disposition summary

| Gap family | Final disposition |
|:---|:---|
| Transactional save | `PRJ-008`, Sprint 5 Task 5.1 |
| Brownfield onboarding and compatibility | `GIT-009`, Sprint 5 Task 5.2 |
| Editability/confidence boundaries | `AST-011`, Sprint 5 Task 5.2 |
| Minimal semantic change | `CHG-001`, Sprint 5 Task 5.4 |
| Visual PR review | `REV-001`, Sprint 6 Task 6.1 |
| Consent and AI-memory controls | `PRV-001`, Sprint 6 Task 6.2 |
| Canonical billing/economics | `BIL-007`, Sprint 6 Task 6.2 |
| Corpus and golden journeys | `TST-002`, Sprint 6 Task 6.4 |
| Paid design partners/WTP | `VAL-001`, Sprint 6 Task 6.4 |
| Initial production assurance | Sprint 6 Task 6.3; Sprint 7H recertification |
| Intent graph, lineage, agency completion, fleet governance, experiments/outcome graph | Preserved post-GA strategic scope; assign during Sprint 7–10 detailed reconciliation |
| Native CMS | Not GA; integrate headless CMS first, validate before native build |
| URL/HTML and full Figma layout import | Not GA; constrained adapter requires explicit supported contract |
| Marketplace/plugins/multiplayer/enterprise/spatial/autonomy | Preserved but cannot bypass GA trust gates |

---

# 13. Execution-Plan Preservation and Reconciliation Principles

## 13.1 Preserve

The following should not be thrown away:

- canonical Moolox naming and IDs;
- package boundaries;
- AST investment;
- token compiler;
- Git credential and synchronization work;
- versioning and rollback concepts;
- security and production-hardening additions;
- portability commitment;
- staged marketplace/plugin/enterprise architecture;
- progressive database and interface extensibility.

## 13.2 Correct

Correct factual status without deleting history:

- label implemented prototypes accurately;
- separate mock from production integration;
- separate unit tested from end-to-end verified;
- remove false release certification;
- align ledger claims with executable evidence;
- correct ID misattributions;
- reconcile feature counts and release arithmetic;
- assign open known gaps.

## 13.3 Add

Add traceable IDs or epics for:

- repository onboarding;
- compatibility and editability maps;
- semantic change objects;
- visual PR review;
- policy compiler;
- intent memory;
- component lineage;
- fleet operations;
- experimentation and outcome evidence;
- privacy controls;
- customer-validation workstreams;
- journey-level release gates.

## 13.4 Reorder, do not silently delete

The next plan update should prioritize proof of the wedge before parity expansion. Existing later features may remain preserved but should not consume critical-path capacity until validation gates pass.

Recommended priority sequence:

1. Make existing foundations real and integrated.
2. Prove repository onboarding and semantic round-trip.
3. Prove developer trust and non-developer usefulness.
4. Deliver one complete agency/design-engineering journey.
5. Add policy, review, and decision memory.
6. Add real production hardening.
7. Add outcome evidence and governed experimentation.
8. Expand to fleet governance.
9. Add ecosystem/enterprise only when pulled by customers.

---

# 14. Current Implementation Reality

The completion ledger states that Sprints 0–4 are complete and the alpha is certified. The implementation supports a more cautious description.

## 14.1 Evidence-based maturity table

| Area | Existing evidence | Missing for usability/production | Honest classification |
|---|---|---|---|
| Web app | Root page builds | Auth, dashboard, editor, settings, APIs, full journey | Static shell |
| Auth | Middleware/RBAC/JWT helpers | Installed app middleware, sessions, routes, end-to-end tests | Library prototype |
| Workspace | Lifecycle/invite/member service functions | Transactions, APIs, UI, real integration tests | Service prototype |
| Project | Store, undo/redo, template duplication | Real save endpoint and persistence journey | Partial prototype |
| AST | SWC parse/serialize/patch/prune tests | Broad React support, stable IDs, repository corpus, integration | Strong constrained prototype |
| Tokens | Compile/enforce/theme functions | Passing performance target and mounted workflow | Real library, failing one current test |
| Canvas | Renderer/inspector/drawers | Mounted route, virtualization, browser interaction/perf proof | Presentational prototype |
| Components | AST core specifications | Dedicated component package and rendered system | Registry prototype |
| AI | Router/generator/gate classes | Real model SDK/provider, healing behavior, UI/API integration | Deterministic simulation |
| Git | Encryption, GitHub service functions, push/pull logic | Routes, workers, UI, full integration, conflict safety | Meaningful but unintegrated service |
| Deploy | Static exporter | Real Cloudflare infrastructure, persistence, domains, rollback | Mock publisher |
| Billing | Quota/webhook classes | Signature verification, Stripe SDK/routes/UI/persistence | In-memory prototype |
| Analytics | Span-shaped in-memory objects | OpenTelemetry SDK/exporter/context/backend/integration | Mock tracer |
| Tests | Typecheck/build pass; many unit tests | Current full suite fails; little browser/E2E/integration testing | Prototype quality gate |

## 14.2 Honest progress estimate

| Milestone interpretation | Estimate |
|---|---:|
| Domain/library prototypes | 25–35% |
| Integrated internal alpha | Under 10% |
| End-user usable V1 | Under 5% |
| Production general availability | 0–3% |

This does not make the work worthless. It means future planning must distinguish architectural progress from product completion.

---

# 15. What the Real V1 Must Deliver

## 15.1 V1 customer promise

> Connect or create a Next.js website, make a visual or conversational change, receive a minimal verified pull request, review it visually or in code, and deploy it without losing ownership.

## 15.2 Required V1 scope

### Product

- real auth and onboarding;
- project/repository connection;
- repository analysis and compatibility report;
- constrained but reliable canvas;
- token/policy import and enforcement;
- actual model-powered scoped change;
- visual/source diff;
- Git branch/PR workflow;
- external edit reconciliation;
- staging preview;
- customer-owned deployment integration;
- optional managed preview hosting;
- basic team/reviewer workflow;
- metered billing;
- product analytics and feedback.

### Quality

- versioned AST schema;
- stable semantic IDs;
- parser/serializer corpus;
- fuzz/property tests;
- cross-tenant isolation;
- real credential lifecycle;
- signed/idempotent webhooks;
- migrations and restore;
- immutable deployment artifacts;
- rollback drills;
- accessibility and responsive tests;
- performance budgets;
- redacted telemetry;
- incident runbooks.

### Validation

- 5–10 qualified design partners;
- at least three paid pilots;
- real repositories rather than demos only;
- developer merge-without-repair metric;
- time to first safe PR;
- repeat monthly change rate;
- non-developer task success;
- customer willingness to retain Moolox after first launch.

## 15.3 What V1 should not require

- full CMS;
- marketplace;
- plugin economy;
- full real-time multiplayer;
- broad enterprise administration;
- every framework;
- commerce engine;
- WebXR;
- autonomous production deployment;
- full conversion network effect;
- hundreds of templates.

---

# 16. Product Love and Recommendation

Customers recommend a product when it creates a surprising outcome they can describe simply.

Recommended Moolox stories:

1. “We connected our existing repository and made the first safe visual change the same day.”
2. “Our designer opened a PR that engineering merged without rewriting.”
3. “The client can update approved content without breaking anything.”
4. “A rebrand across 40 properties became a controlled rollout.”
5. “Moolox explained why removing a pricing element would break an active experiment.”
6. “It caught an accessibility and analytics regression before the change reached review.”
7. “We can stop using Moolox and still own a clean, deployable repository.”
8. “Every month it understands our standards better.”

## 16.1 Trust principles

- Never silently modify unrelated code.
- Never pretend unsupported code is editable.
- Never claim causal optimization without evidence.
- Never train globally on private code by default.
- Never trap production behind a proprietary runtime.
- Never hide model, check, or deployment failure.
- Make rollback obvious.
- Make override ownership explicit.
- Prefer a small correct patch to an impressive rewrite.

---

# 17. Data Moat

## 17.1 The wrong moat

Do not depend on:

- generic prompts;
- public templates;
- raw customer code collection;
- model access;
- named AI agents;
- AST implementation alone;
- hosting lock-in.

## 17.2 The defensible data graph

Per customer, Moolox can accumulate:

- semantic repository map;
- safe-edit confidence;
- component lineage;
- design and interface policies;
- accepted/rejected changes;
- manual repair patterns;
- review decisions;
- policy exceptions;
- deployment outcomes;
- rollback causes;
- accessibility/performance incidents;
- experiment hypotheses and evidence;
- business intent;
- ownership and approval relationships.

## 17.3 Privacy-safe architecture

### Private by default

- source code;
- prompts;
- content/assets;
- analytics;
- decision history;
- embeddings;
- experiments;
- organization-specific policies.

### Potentially aggregate only with controls

- parser failure categories;
- anonymous compatibility patterns;
- classes of regression;
- generic remediation success rates;
- confidence calibration;
- non-identifying performance effects by abstract change type.

### Required controls

- tenant isolation;
- encryption;
- regional storage;
- retention controls;
- customer inspection/deletion;
- export;
- explicit opt-in for global learning;
- short raw-diagnostic retention;
- no secret/code payloads in ordinary telemetry;
- audit of model and human actions.

The core moat question becomes:

> **Given this organization’s code, policies, decisions, and outcomes, what is the safest useful next change?**

---

# 18. Monthly Compounding

Moolox must improve for a customer every month even if frontier models are unchanged.

| Loop | Input | Learning | Customer-visible improvement |
|---|---|---|---|
| Change quality | Proposed, edited, accepted, rejected patches | What changes require repair | Higher merge-without-repair rate |
| Policy | Violations, remediations, exceptions | Actual organizational rules | Earlier and more accurate enforcement |
| Component | Usage, drift, migration, defects | Component quality and lineage | Better reuse and safer upgrades |
| Outcome | Deployments, experiments, rollbacks | What worked in context | Better bounded recommendations |
| Fleet | Equivalent patterns across properties | Cross-site impact | One fix safely benefits many sites |
| Collaboration | Comments, approvals, ownership | Who decides what | Correct automatic routing and context |
| Trust | Successful small delegated changes | Safe autonomy boundary | Larger scope can be delegated safely |

Monthly reporting should emphasize:

- hours saved;
- review cycles removed;
- regressions prevented;
- policy coverage;
- inaccessible pages remediated;
- fleet-wide changes completed;
- experiments concluded;
- stale components retired;
- changes merged without repair.

---

# 19. After the First Website

The first website is only the acquisition event.

## Lifecycle

1. **Connect/create** — establish repository and visual mapping.
2. **Launch** — verify and deploy safely.
3. **Operate** — recurring copy, campaign, design, and product changes.
4. **Learn** — preserve decisions and outcomes.
5. **Standardize** — promote successful components and policies.
6. **Expand** — more pages, brands, locales, and properties.
7. **Govern** — permissions, approvals, legal, accessibility, provenance.
8. **Modernize** — dependency, framework, token, and component migration.
9. **Transfer** — agency handoff, employee change, acquisition, reorganization.
10. **Exit/archive** — complete export without runtime lock-in.

Retention must be based on continuing operational value. If users generate or export once and do not return, Moolox has not created a defensible product.

---

# 20. Immediate “2031-Level” Product Bets

These are ranked by risk-adjusted ability to feel ahead at launch.

| Rank | Bet | Customer wow | Defensibility | Complexity | Recommended stage |
|---:|---|---:|---:|---:|---|
| 1 | Repository Reality and Editability Map | 9/10 | 9/10 | High | V1 wedge |
| 2 | Verified Visual Change + minimal PR | 10/10 | 9/10 | Very high | V1 wedge |
| 3 | Designer-readable visual PR | 9/10 | 7/10 | Medium/high | V1 |
| 4 | Interface Policy Compiler | 9/10 | 8/10 | High | V1/V1.5 |
| 5 | Honest safe-autonomy zones | 8/10 | 8/10 | Medium/high | V1 |
| 6 | Intent/Decision Graph | 9/10 | 9/10 | High | V1.5 |
| 7 | Component Evolution Graph | 8/10 | 8/10 | High | V1.5/V2 |
| 8 | Fleet-wide governed remediation | 10/10 | 9/10 | Very high | V2 after single-repo proof |
| 9 | Outcome-linked source history | 9/10 | 9/10 | Very high | V2 |
| 10 | Portable web-operations control plane | 8/10 | 8/10 | Very high | Expansion |

---

# 21. Five- and Ten-Year Vision

The product should feel five years ahead now, while the company vision still compounds over time.

## 21.1 2026 launch ambition

Deliver the first trustworthy visual-to-production change workflow for real Next.js repositories:

- repository map;
- safe editing boundaries;
- minimal semantic changes;
- visual review;
- policy checks;
- normal Git PR;
- owned deployment.

## 21.2 2031 company position

Moolox is the trusted interface through which humans and AI agents modify production React properties without bypassing organizational controls.

It provides:

- mature brownfield understanding;
- high-confidence semantic Git synchronization;
- private organizational memory;
- enforceable interface policies;
- portfolio governance;
- evidence-linked optimization;
- optional managed hosting;
- clean exit.

## 21.3 2036 vision

Moolox becomes the intent and governance layer for customer-facing digital systems across changing frameworks and channels.

The enduring customer asset is not a page. It is:

- brand policy;
- component lineage;
- customer-experience intent;
- approval structure;
- change history;
- evidence about what works;
- capacity to evolve safely.

This vision may extend to commerce surfaces, documentation, embedded interfaces, and agent-generated experiences, but Moolox should remain a control/intelligence layer rather than attempting to own every runtime.

---

# 22. Risks and Kill Criteria

## 22.1 Principal risks

| Risk | Severity | Mitigation |
|---|---:|---|
| v0/Builder/Cursor closes semantic round-trip gap | Critical | Move fast on repository fidelity and governance, not generic generation |
| Arbitrary repository support is too brittle | Critical | Support constrained profiles, show confidence boundaries, PR-first changes |
| Developers reject generated diffs | Critical | Minimality, determinism, formatting stability, benchmark repair rate |
| Agencies want custom services, not product | High | Standardize adapters; reject bespoke work that cannot repeat |
| Customers use Moolox once | Critical | Build recurring change, policy, fleet, and outcome workflows |
| Scope remains too broad | Critical | Gate every expansion on paid usage and core trust |
| Data moat violates expectations | Critical | Private-by-default, opt-in aggregation, transparent contract |
| Optimization produces false confidence | High | Controlled experiments, uncertainty, guardrails, human approval |
| Hosting distracts the team | High | Optional hosting; integrate existing infrastructure first |
| Enterprise work starts before PMF | High | Buyer-funded readiness gates |
| Documentation status remains inaccurate | High | Evidence-based completion states and automated traceability |

## 22.2 Strategy kill criteria

Reconsider or pivot if, after focused validation:

1. Existing Next.js repositories cannot reach a first safe merged change within one working day.
2. Fewer than 50% of activated teams merge a Moolox change within 30 days.
3. Mature Moolox-generated PRs merge without manual code repair less than 70% of the time.
4. Round-trip sync repeatedly creates formatting churn or destructive conflicts.
5. Customers primarily export once and do not return monthly.
6. Teams value generation but will not pay for governance or continuing operation.
7. Moolox cannot reduce review time or regressions compared with a coding agent and GitHub alone.
8. Multi-site customers do not retain materially better than single-site customers.
9. Reliable outcome instrumentation cannot be established.
10. The product requires continuing bespoke engineering for every repository.

## 22.3 Feature kill criteria

- **Marketplace:** Do not build until repeat usage and creator demand exist.
- **Managed hosting:** Deprioritize if it does not improve activation, trust, or retention.
- **Autonomous optimization:** Stop if attribution or rollback safety is weak.
- **Agency white-label:** Stop if it becomes custom services instead of repeatable workflow.
- **Broad framework support:** Do not expand until Next.js fidelity is excellent.
- **Enterprise/private cloud:** Build only against qualified committed revenue.
- **Spatial/WebXR:** Do not pursue before core Git trust and PMF.

---

# 23. Product and Business Metrics

## 23.1 Primary activation metric

> **Time from repository connection to first safe merged production change.**

## 23.2 Trust metrics

- merge-without-manual-repair rate;
- conflict-free synchronization rate;
- unrelated-code-change rate;
- rollback rate;
- policy false-positive/false-negative rate;
- unsupported-region classification accuracy;
- developer trust score.

## 23.3 Usage and retention

- repositories connected;
- first PR opened;
- first PR merged;
- monthly merged changes per repository;
- active governed properties;
- multi-site expansion;
- 30/90/180-day project retention;
- agency sites per account;
- client reviewer participation.

## 23.4 Product-quality metrics

- visual fidelity;
- parser/serializer round-trip preservation;
- diff minimality;
- build/type/test pass rate;
- accessibility pass rate;
- performance-budget pass rate;
- median and P95 change latency;
- first-proposal acceptance.

## 23.5 Business metrics

- paid pilot conversion;
- free-to-paid conversion;
- gross margin by workload;
- AI cost per merged change;
- support cost per active property;
- NDR;
- churn;
- expansion from one to many repositories;
- sales cycle by segment;
- customer-reported hours saved.

Avoid optimizing primarily for prompts sent, tokens consumed, or raw sites generated.

---

# 24. Recommended Pricing Logic

Pricing must be validated, but the value metric should align with operational value.

| Tier | Primary value | Possible pricing unit |
|---|---|---|
| Individual | One or a few active production projects | Active governed project |
| Team | Shared review and policy | Active projects + seats |
| Agency | Client-safe operation and portfolio control | Governed client properties + included seats |
| Organization | Design system, policy, fleet governance | Active repositories/properties |
| Enterprise | Governance, residency, private execution, SLA | Platform fee + governed fleet |

Principles:

- include useful AI allowance;
- make overage transparent;
- avoid token anxiety;
- distinguish draft projects from active governed production properties;
- model hosting/build/egress costs separately;
- make reviewer/client-seat rules simple;
- test willingness to pay with actual invoices.

---

# 25. Immediate Planning Recommendations

This document is not itself the plan update. Before changing canonical files, conduct a controlled reconciliation.

## P0 planning changes

1. Add an evidence-based completion-state taxonomy.
2. Correct stale sprint/release claims.
3. Define the repository-onboarding epic.
4. Define the round-trip public benchmark.
5. Define the semantic change object.
6. Define the visual PR journey.
7. Define the interface policy compiler.
8. Assign the save-endpoint known gap.
9. Add customer-validation tasks and stop/go gates.
10. Add three paid design partners as a business gate.
11. Map all golden journeys to tests.
12. Resolve CMS/import/hosting boundaries explicitly.
13. Move privacy controls before analytics/experiments.
14. Reconcile pricing and unit economics.

## P1 planning changes

1. Add intent/decision memory.
2. Add complete agency handoff.
3. Add component lineage.
4. Add fleet impact analysis.
5. Add governed experimentation and evidence.
6. Add AI memory inspection/deletion.
7. Add full portability contract.
8. Add measurable premium-design acceptance.

## Preserve but de-prioritize until gates pass

- marketplace;
- plugin sandbox breadth;
- broad SDK/API ecosystem;
- real-time multiplayer;
- full enterprise suite;
- private cloud;
- spatial/WebXR;
- autonomous production actions.

---

# 26. Final Verdict

## Decision

# **YES—BUILD MOOLOX, BUT BUILD THE FUTURE-NOW WEDGE, NOT THE COMMODITY CHECKLIST.**

Moolox should launch soon with a narrow experience that feels five years ahead:

> **Connect a real repository, understand what is safe to change, make a visual or conversational request, receive a minimal verified pull request, review it in design and code language, and deploy without surrendering ownership.**

That experience solves a real frustration and is difficult enough to differentiate.

The business should not depend on being the best generic generator. Frontier models and incumbents will continue commoditizing generation. Moolox’s defensibility must come from:

- trust;
- semantic repository understanding;
- policy enforcement;
- visual/code review;
- safe collaboration;
- decision memory;
- outcome evidence;
- portfolio compounding;
- clean ownership and exit.

## Final risk-adjusted assessment

- **Build recommendation:** Yes, conditional.
- **Decision confidence:** 72%.
- **Current broad-plan success probability:** 15–20%.
- **Refined early-PMF probability:** 35–45%.
- **Refined sustainable-business probability:** 45–60%.
- **Refined venture-scale probability:** 15–25%.
- **Failure probability after narrowing:** 55–65%.
- **Current risk:** High.
- **Potential value if executed correctly:** 9/10.

## Final founder test

Do not ask only:

> Can Moolox generate and host a beautiful website?

Ask:

> Can Moolox become the system a company trusts every time its production website changes—regardless of whether the change came from a designer, developer, marketer, client, or AI agent?

If the answer becomes yes, Moolox is not another builder. It is infrastructure for how digital experiences evolve.
