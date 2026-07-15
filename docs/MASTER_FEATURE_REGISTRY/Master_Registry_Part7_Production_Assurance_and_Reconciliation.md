# DOCUMENT 7 — MASTER FEATURE REGISTRY & PROGRESSIVE ARCHITECTURE BLUEPRINT
## Part 7: Canonical Reconciliation & Production Assurance Inventory

**Status:** Active addendum  
**Effective date:** 2026-07-15

---

## 1. Canonical identity rules

- Product and company: **Moolox**.
- Package namespace: **`@moolox/*`**.
- Feature IDs use three digits.
- `AUTH-004` remains Enterprise SAML/SSO.
- `AUTH-007` is GitHub credential authorization.
- `GIT-001..004` remain canonical Sprint 4 Git synchronization features.
- Detailed semantic collision rules and document precedence are defined by `../MASTER_EXECUTION_PLAN/CANONICAL_RECONCILIATION.md`.

## 2. New authentication feature

| Feature ID | Feature Name | Description | Dependencies | Release | Sprint | Status |
|:---|:---|:---|:---|:---:|:---:|:---:|
| **`AUTH-007`** | **GitHub App Credential Authorization Bridge** | GitHub App installation authorization and least-privilege repository scope binding with versioned envelope-encrypted credentials, revocation/suspension handling, redaction from logs/traces, and preserved rotation hooks. | `AUTH-001` | `v1.0 Public` | `4 / Task 4.1` | Not Started |

## 3. Git reliability extensions

| Feature ID | Feature Name | Description | Dependencies | Release | Sprint | Status |
|:---|:---|:---|:---|:---:|:---:|:---:|
| **`GIT-007`** | **Webhook Delivery Ledger and Idempotent Processing** | Durable unique-delivery recording, HMAC-before-parse verification, duplicate suppression, bounded retries, dead-letter handling, audited replay, and GitHub installation/repository lifecycle-event handling. | `GIT-001`, `GIT-003`, `GIT-004`, `INF-002`, `WS-005` | Production Hardening | `7H` | Not Started |
| **`GIT-008`** | **Drift Reconciliation and Safe Branch-State Controller** | Scheduled/manual convergence of remote SHA, exported tree hash, and active AST version; safe handling of missed webhooks, force pushes, branch protection/deletion, repository transfer, and default-branch changes. | `GIT-004`, `GIT-005`, `GIT-007` | Production Hardening | `7H` | Not Started |

## 4. Production assurance features

| Feature ID | Feature Name | Description | Dependencies | Sprint | Status |
|:---|:---|:---|:---|:---:|:---:|
| **`MIG-001`** | **Versioned Database Migration and Schema-Drift Enforcement** | Committed Drizzle migrations, N-1 fixture migration, expand/backfill/contract policy, destructive-change approval, and CI drift detection. | `DB-001`, `DB-002` | `7H` | Not Started |
| **`BKP-001`** | **PostgreSQL PITR Backup and Restore Verification** | Encrypted PITR, defined RPO/RTO, isolated restore drills, integrity/hash verification, backup freshness alerts, and recovery runbooks. | `DB-001`, `MIG-001`, `ANA-001` | `7H` | Not Started |
| **`SEC-001`** | **Application Edge-Security Baseline** | CSP, HSTS, browser security headers, CSRF/origin validation, request limits, route rate/concurrency limits, and cross-tenant authorization tests. | `AUTH-001`, `AUTH-002`, `INF-001` | `7H` | Not Started |
| **`SEC-002`** | **Credential and Encryption-Key Lifecycle Management** | Versioned envelope encryption, rotation, immediate revocation, secret redaction, audited access, and incident response for GitHub credentials and future integration secrets. | `AUTH-007`, `GIT-001`, `ANA-001` | `7H` | Not Started |
| **`OPS-001`** | **SLOs, Alerting, and Incident Response** | SLIs/SLOs, burn-rate alerts, logs/metrics/traces correlation, ownership, runbooks, and game-day verification. | `ANA-001`, `INF-002`, `DEP-002`, `BKP-001`, `GIT-007` | `7H` | Not Started |
| **`TST-001`** | **Production Assurance CI Matrix** | Required real lint, build, typecheck, unit, migration, integration, Playwright, axe, webhook replay, security scanning, and SBOM checks. | `MIG-001`, `SEC-001`, `GIT-007` | `7H` | Not Started |
| **`A11Y-001`** | **Moolox Platform WCAG 2.2 AA Conformance Gate** | Keyboard, focus, reduced-motion, semantic, live-region, automated axe, and manual screen-reader certification for the Moolox application UI. | `CNV-001..004`, `TST-001` | `7H` | Not Started |

## 5. Enterprise data-lifecycle features

| Feature ID | Feature Name | Description | Dependencies | Sprint | Status |
|:---|:---|:---|:---|:---:|:---:|
| **`DLC-001`** | **Tenant Retention, Deletion, and Legal-Hold Engine** | Data-class retention matrix, reversible deletion grace period, verified purge, backup tombstones, legal holds, idempotent erasure jobs, and audit receipts. | `AUTH-002`, `DB-001`, `WS-005`, `BKP-001` | `10` | Not Started |
| **`DLC-002`** | **User/Workspace Portability and DSAR Export** | Encrypted, expiring, resumable, tenant-isolated exports of projects, versions, tokens, assets, membership, and audit metadata with validation/re-import integrity. | `DLC-001`, `PRJ-001`, `WS-005` | `10` | Not Started |

## 6. Platform contract and supply-chain features

| Feature ID | Feature Name | Description | Dependencies | Sprint | Status |
|:---|:---|:---|:---|:---:|:---:|
| **`API-001`** | **Canonical API Compatibility and Error Contract** | Versioned OpenAPI/Zod contract, stable problem-details errors, pagination, idempotency rules, breaking-change detection, deprecation policy, and SDK compatibility tests. | `CORE-002`, `AUTH-006`, `SDK-001` | `11` | Not Started |
| **`SEC-003`** | **Software Supply-Chain Integrity and Release Provenance** | Dependency review, secret scanning, SAST, license/vulnerability policy, SBOM, signed provenance, short-lived release credentials, and emergency patch SLA. | `TST-001`, `GIT-006` | `11` | Not Started |

## 7. Non-duplication statement

These features preserve and strengthen existing architecture:

- `BKP-001` is database recovery; `DEP-003` remains edge release rollback.
- `GIT-007..008` cover delivery reliability and drift; `GIT-005` remains structural conflict resolution.
- `A11Y-001` governs the Moolox product UI; generated-output accessibility remains in the AI quality pipeline.
- `OPS-001` builds service operations on existing OpenTelemetry.
- `API-001` governs public compatibility on top of existing API/SDK features.

No existing feature is removed, renamed destructively, or rescheduled by this addendum except the explicit conflict corrections in the reconciliation document.

## 8. Final pre-GA trust overlay

The following nine canonical features close customer-journey and validation gaps from `docs/Moolox_2031.md` while preserving existing architecture:

| ID | Capability | Sprint | Existing foundation extended |
|:---|:---|:---:|:---|
| `PRJ-008` | Production persistence/save transaction | 5 | `PRJ-001..004`, `CORE-002`, DB/RLS |
| `GIT-009` | Brownfield repository compatibility report | 5 | `GIT-001..004`, `AST-002` |
| `AST-011` | Safe editability/confidence map | 5 | AST scope, Canvas, AI pruning |
| `CHG-001` | Semantic change/minimal-diff contract | 5 | AST patch, Git diff, audit, project versions |
| `REV-001` | Designer-readable visual PR | 6 | Git, Canvas, deployment previews |
| `PRV-001` | Consent and AI-memory controls | 6 | Auth, analytics, AI memory, audit |
| `BIL-007` | Canonical billing lifecycle/economics | 6 | Billing, metering, analytics |
| `TST-002` | Round-trip corpus and golden journeys | 6 | `TST-001` and core product loop |
| `VAL-001` | Paid design-partner release gate | 6 | Product discovery and release governance |

### Non-duplication and timing

- `REV-001` is the constrained GA single-change review path; later `PRJ-006`/`COL-005` provide broad branching and collaborative review.
- `PRV-001` gates analytics and learning before GA; `DLC-001..002` later provide full tenant lifecycle and portability.
- `TST-002` proves product-specific fidelity; `TST-001` remains the general production CI matrix.
- `VAL-001` is a release decision gate, not a software module.
- P0 assurance features receive initial Sprint 6 certification and Sprint 7H recertification before Sprint 8.
