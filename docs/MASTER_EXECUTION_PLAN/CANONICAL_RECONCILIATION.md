# Moolox Canonical Planning Reconciliation

**Status:** Approved canonical overlay  
**Effective date:** 2026-07-14  
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

- Sprints 0–3 are completed as recorded by the Sprint Completion Ledger.
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
