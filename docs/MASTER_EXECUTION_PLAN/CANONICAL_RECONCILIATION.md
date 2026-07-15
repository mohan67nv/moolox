# Moolox Canonical Planning Reconciliation

**Status:** Approved canonical overlay  
**Effective date:** 2026-07-15
**Scope:** Resolves conflicts among the Master Execution Plan, Master Feature Registry, Sprint Completion Ledger, and Known Gap ledger without deleting any planned capability.

---

## 1. Precedence and change-control rules

When documents disagree, use this order:

1. This reconciliation document for naming, identity, status, and conflict resolution.
2. `SPRINT_COMPLETION_LEDGER.md` for verified implementation status and commit evidence only.
3. `MASTER_EXECUTION_PLAN/IMPLEMENTATION_ORDER.md` for sprint and task order.
4. `MASTER_EXECUTION_PLAN/SPRINT_PLAN.md` for sprint acceptance criteria.
5. `MASTER_FEATURE_REGISTRY/*` for complete long-term feature definitions and architectural preservation.
6. Historical product, engineering, company, and CTO bibles for rationale.

No implementation may infer scope from a lower-precedence document when a higher-precedence document is explicit.

## 2. Product and package naming

- The company and product name is **Moolox**.
- The package namespace is **`@moolox/*`**.
- Public names use `moolox.com`, Moolox-owned deployment domains, `moolox_live_*` API-key prefixes, `moolox` CLI commands, and `feat(moolox)` commit scopes.
- `DIOS`, `@dios/*`, `dios.app`, and related identifiers in older documents are historical aliases only. They must not be introduced into new code, configuration, tests, URLs, packages, or user-facing text.
- Historical prose is preserved for traceability; this rule supersedes every legacy example.

## 3. Canonical Feature ID format

- All canonical IDs use a three-digit suffix: `AST-001`, `GIT-001`, `AUTH-004`.
- Two-digit MEP IDs are planning aliases only: for example, `GIT-01` maps to `GIT-001` when—and only when—the feature title and semantics match.
- Numeric similarity never overrides semantics.
- Existing implementation references remain valid but documentation and new code must use three-digit IDs.

## 4. Semantic collision resolutions

| Conflicting reference | Canonical resolution |
|:---|:---|
| MEP `AUTH-04` GitHub OAuth/PAT vs Registry `AUTH-004` Enterprise SSO | `AUTH-004` remains **Enterprise SAML/SSO**. GitHub credential authorization is the new `AUTH-007`. |
| MEP `AST-04` storage vs Registry `AST-004` autosave | `AST-004` remains autosave/checkpointing. Compressed storage remains `DB-003`; compression codec implementation is tracked as `AST-010`. |
| MEP `AST-05` pruning vs Registry `AST-005` locking | `AST-005` remains optimistic locking. Pruning is `AIS-003`. |
| MEP `AST-06` conflict resolution vs Registry `AST-006` Sandpack | `AST-006` remains Sandpack. Node-level AST conflict handling remains `GIT-005`. |
| Ledger `AI-005` Live Patch Preview vs Registry `AIS-005` image-to-code | Live Patch Preview is `AIS-006`; image-to-code remains `AIS-005`. |
| Ledger `TKN-005` brand/theme behavior vs Registry `TKN-005` Figma sync | Figma sync remains `TKN-005`; completed theme switcher/presets are early partial delivery of `TKN-004` and `CMP-002`. |
| Ledger `PLG-001` sandbox runtime | `PLG-001` is the plugin hook abstraction only; sandbox runtime remains `PLG-002`. |
| Ledger `MKT-001` manifest parser | `MKT-001` remains the marketplace domain interface; manifest parsing belongs to `PLG-004`. |
| Ledger `ENT-001` SAML/OIDC | `ENT-001` remains the enterprise organization model; SAML/SSO remains `AUTH-004`. |

## 5. Implementation status baseline

- Sprints 0–4 contain recorded implementation evidence in the Sprint Completion Ledger.
- Recorded sprint completion does not by itself certify integration, customer usability, production hardening, or a release gate. Those states require the completion taxonomy and executable release evidence below.
- Features completed earlier than their planned sprint remain completed and are marked **Early Delivery**; their original future sprint performs integration, activation, and full release-gate verification rather than duplicate implementation.
- A feature is complete only when the ledger cites implementation, tests, quality gates, and commit evidence.
- Pre-implementation `0%` tables in older documents are stale baselines and must not override the ledger.

## 6. Canonical Sprint 4

Sprint 4 remains **Bidirectional GitHub Monorepo Synchronization (`Code is Truth`)**.

| Task | Canonical Feature IDs | Scope |
|:---|:---|:---|
| `4.1` | `AUTH-007`, `GIT-001` | GitHub App installation authorization, encrypted credential lifecycle, repository linking, and project-settings UI. |
| `4.2` | `GIT-002` | Standalone Next.js App Router code exporter with no Moolox runtime dependency. |
| `4.3` | `GIT-003` | Durable background push and Moolox commit formatting. |
| `4.4` | `GIT-004`, `WS-004`, `WS-005` | Verified incoming webhook pull, dashboard switcher, and append-only audit feed. |

Task 4.1 must pass implementation, tests, type safety, documentation, lint, performance, security review, and commit gates before Task 4.2 starts.

The former ledger proposal for Sprint 4 plugins/marketplace/enterprise is not deleted. It is restored to its canonical staged delivery:

- `PLG-001`: Sprint 7.
- `MKT-001..005`: Sprint 8.
- `PLG-002..004`: Sprint 9.
- `AUTH-004` and enterprise activation: Sprint 10.

## 7. Added production-assurance features

The architecture review added assurance capabilities around the existing stack without replacing module boundaries or technologies:

| Feature ID | Name | Scheduled workstream |
|:---|:---|:---|
| `MIG-001` | Versioned database migrations and schema-drift enforcement | Sprint 7H |
| `BKP-001` | PostgreSQL PITR backup and automated restore verification | Sprint 7H |
| `SEC-001` | Application edge-security baseline | Sprint 7H |
| `SEC-002` | Credential and encryption-key lifecycle management | Sprint 7H; hooks begin in Task 4.1 |
| `GIT-007` | Webhook delivery ledger and idempotent processing | Sprint 7H |
| `GIT-008` | GitHub drift reconciliation and safe branch-state controller | Sprint 7H |
| `OPS-001` | SLOs, alerting, and incident response | Sprint 7H |
| `TST-001` | Production assurance CI matrix | Sprint 7H |
| `A11Y-001` | Moolox platform WCAG 2.2 AA conformance gate | Sprint 7H |
| `DLC-001` | Tenant data retention, deletion, and legal holds | Sprint 10 |
| `DLC-002` | User/workspace portability and DSAR export | Sprint 10 |
| `API-001` | Canonical API compatibility and error contract | Sprint 11 |
| `SEC-003` | Software supply-chain integrity and provenance | Sprint 11 |

Detailed dependencies and acceptance criteria are in `PRODUCTION_HARDENING_PLAN.md`.

## 8. Sprint 7H insertion rule

Sprint 7H is a mandatory production-hardening gate after Sprint 7 and before Sprint 8. It does not remove or defer existing Sprint 7 or Sprint 8 product scope. Sprint 8 cannot begin until all Sprint 7H P0 gates pass.

## 9. Documentation maintenance rule

Every future planning change must update, in the same commit:

1. Feature definition or addendum.
2. Dependency graph.
3. Sprint plan and implementation order.
4. Progress tracker.
5. Known-gap ledger when dormant or deferred.
6. Completion ledger when implemented.

This prevents another split-brain planning state.

## 10. Final pre-GA product direction

`docs/Moolox_2031.md` is the approved strategic input for the final pre-General-Availability reconciliation. It does not replace this document, but the following product promise is now binding for Sprints 5–6:

> Connect or create a supported Next.js website, understand what is safe to change, make a visual or conversational change, receive a minimal verified pull request, review it visually or in code, and deploy without surrendering ownership.

Moolox is not certified for GA by generic generation, a visual canvas, Git export, or hosting alone. GA requires a trustworthy repository-to-change-to-review-to-deployment loop using customer-owned code.

## 11. Completion-state taxonomy

Every feature and sprint must use the highest state for which evidence exists:

| State | Binding meaning |
|:---|:---|
| **Scaffolded** | Package, schema, interface, or component boundary exists. |
| **Implemented** | Core logic exists and has focused automated tests. Mocks may still exist outside certified paths. |
| **Integrated** | The production-shaped web/API/worker/database path invokes the implementation end to end. |
| **Journey Verified** | A user-visible Playwright or equivalent journey passes against production-shaped services. |
| **Production Certified** | Security, privacy, migration, recovery, observability, accessibility, performance, and incident gates pass. |
| **Customer Validated** | Qualified external users complete the journey and paid evidence meets the release threshold. |
| **Released** | All applicable gates above pass and an explicit release decision is recorded. |

`Completed` in the historical ledger means **recorded implementation evidence** unless the row separately cites every higher gate. “Certified,” “launched,” “100%,” and “production-ready” are prohibited without executable evidence.

## 12. New canonical pre-GA features

| Feature ID | Canonical feature | Sprint | Non-duplication rule |
|:---|:---|:---:|:---|
| `PRJ-008` | Production Project Persistence and Save Transaction | `5` | Completes the physical `PRJ-002`/`CORE-002` save contract; does not replace local Zustand behavior. |
| `GIT-009` | Brownfield Repository Onboarding and Compatibility Report | `5` | Extends repository linking; it does not duplicate `GIT-001` authorization or `GIT-004` inbound synchronization. |
| `AST-011` | Safe Editability and Confidence Map | `5` | Converts parser/scope knowledge into enforced customer-visible boundaries; it does not replace `AIS-003` pruning. |
| `CHG-001` | Semantic Change Object and Minimal-Diff Contract | `5` | Unifies intent, patch, diff, checks, audit, review, deployment, and outcome without adding a new architectural module. |
| `REV-001` | Designer-Readable Visual Pull-Request Review | `6` | Covers the constrained single-change GA review journey; `PRJ-006` and `COL-005` retain later branching/collaboration scope. |
| `PRV-001` | Analytics, AI-Memory, and Learning Consent Controls | `6` | Pre-GA privacy gate; it complements later `DLC-001..002`. |
| `BIL-007` | Canonical Pricing, Billing Lifecycle, and AI-Economics Gate | `6` | Reconciles pricing and production billing; it does not replace Agency `BIL-004`. |
| `TST-002` | Repository Round-Trip Corpus and GA Golden-Journey Certification | `6` | Product-specific public proof built on production CI `TST-001`. |
| `VAL-001` | Paid Design-Partner and Willingness-to-Pay Release Gate | `6` | Operating release gate, not runtime architecture. |

The canonical inventory is now **134 features**: 112 historical product features, 13 production-assurance features, and 9 final pre-GA trust/validation features. Exact release counts must be derived from the canonical ID table rather than old prose totals.

## 13. Final Sprint 5 and Sprint 6 authority

Only Sprints 5 and 6 remain before constrained public GA. Historical Sprint 5/6 sections in lower-precedence documents are superseded where they conflict with this matrix.

| Sprint | Binding purpose | Tasks |
|:---|:---|:---|
| **Sprint 5 — Integrated Repository Wedge** | Turn recorded prototypes into an authenticated, persisted workflow for a real supported repository. | `5.1` integration and `PRJ-008`; `5.2` `GIT-009` + `AST-011`; `5.3` essential visual editing; `5.4` `CHG-001`. |
| **Sprint 6 — Trust, Commercialization, and GA Certification** | Produce a reviewable PR, prove repeated round-trip fidelity, finish commercial/privacy integration, certify production operation, and pass paid-customer gates. | `6.1` `GIT-005` + `AI-006` + `REV-001`; `6.2` `DEP-004` + `BIL-003` + `ANA-002` + `PRV-001` + `BIL-007`; `6.3` initial production-assurance certification; `6.4` `TST-002` + `VAL-001`. |

### Sprint 5 exit gate

A user can authenticate, connect a real supported repository, receive and accept a compatibility/editability report, perform one bounded visual or AI change, save/reload it transactionally, and obtain one minimal buildable source diff with zero unrelated mutation. This is an integrated wedge, not GA.

### Sprint 6 / GA exit gate

GA is blocked until:

1. At least 10 non-demo repositories complete 10 import→edit→export→re-import cycles each.
2. Supported regions preserve semantic hashes; unrelated file/node mutations are zero and every unsupported case is categorized.
3. At least 90% of supported pilot PRs merge without manual code repair.
4. Save/reload, optimistic conflict, signed billing, consent, custom-domain, migration, PITR restore, webhook replay/drift, credential rotation, cross-tenant, accessibility, and incident-game-day gates pass.
5. Five to ten qualified design partners use real repositories and at least three are paying.
6. Supported scope, known limits, pricing, rollback, support ownership, and evidence are documented.

## 14. Preserved feature reassignment

No feature is deleted. The following lower-priority work moves to existing post-GA sprints so Sprints 5–6 can prove the trust wedge:

| Feature | Previous sprint | Canonical sprint | Reason |
|:---|:---:|:---:|:---|
| `CMP-002` | `5` | `8` | Preset volume belongs with template/marketplace inventory; existing early presets remain available. |
| `PRJ-005` | `5` | `8` | Template duplication belongs with template activation. |
| `AI-005` | `6` | `7` | Image input is secondary to reliable scoped text/visual change. |
| `AI-007` | `6` | `7` | Specialist expansion follows integration of the real core model path. |
| `CNV-006` | `6` | `7` | GA ships a documented project-size envelope; larger-site optimization follows. |
| `BIL-004` | `6` | `8` | Agency billing activates with `WS-006`, resolving the previous impossible dependency. |
| `ENT-001`, `ENT-002` | `6` | `10` | Dormant schemas remain; enterprise activation and monitoring ship with complete governance. |
| `GIT-005` | `7` | `6` | Safe structural conflict handling is a GA dependency. |

Under the semantic collision rule, `AST-006` remains Sandpack. It must never again be used as the Git/AST conflict resolver.

## 15. Sprint 7H role after this reconciliation

Initial P0 assurance certification (`MIG-001`, `BKP-001`, `SEC-001..002`, `GIT-007..008`, `OPS-001`, `TST-001`, `A11Y-001`) moves into Sprint 6 Task 6.3 because GA cannot precede production safety. Sprint 7H remains a mandatory **post-GA recertification and expansion-hardening gate** after Sprint 7 and still blocks Sprint 8. It re-runs and expands the controls against production evidence; it does not duplicate their initial implementation.

## 16. Explicit post-GA decisions for remaining Section 12 gaps

- Intent/decision graph, component lineage, complete agency handoff, fleet operations, governed experimentation, outcome evidence, and private learning expansion remain preserved post-GA scope and must be assigned during the Sprint 7–10 detailed reconciliation.
- Full CMS is not a GA requirement; Moolox integrates headless CMS providers first. Native CMS requires validated demand and a separate canonical decision.
- URL/HTML import and full Figma Auto Layout import are not GA requirements; constrained adapters require an explicit supported-format contract.
- Marketplace, plugin economy, real-time collaboration, broad enterprise, private cloud, spatial/WebXR, and autonomous production changes remain preserved but cannot bypass the GA trust gates.
