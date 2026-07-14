# Moolox Production Hardening Plan

**Status:** Canonical execution-plan addendum  
**Architecture rule:** These features strengthen the existing Moolox stack. They do not replace the product architecture, database model, AI architecture, module boundaries, design system, or technology stack.

---

## 1. Added canonical features

| Feature ID | Feature and owner | Dependencies | Definition of Done | Sprint |
|:---|:---|:---|:---|:---:|
| **`MIG-001`** | **Versioned Database Migration and Schema-Drift Enforcement** — `@moolox/db`, Platform Pod | `DB-001`, `DB-002` | Versioned Drizzle SQL migrations are committed; CI migrates an empty database and an N-1 fixture; expand/backfill/contract policy is documented; destructive changes require explicit approval; rollback or forward-fix is tested; schema drift fails CI. | `7H` |
| **`BKP-001`** | **PostgreSQL PITR Backup and Restore Verification** — `@moolox/db`, `@moolox/analytics`, Platform Ops | `DB-001`, `MIG-001`, `ANA-001` | Encrypted backups and WAL/PITR are enabled; RPO/RTO are defined; an isolated restore drill applies migrations and verifies referential integrity plus sampled workspace hashes; backup age and restore failures alert; recovery ownership is documented. | `7H` |
| **`SEC-001`** | **Application Edge-Security Baseline** — `@moolox/auth`, `apps/web`, Platform Pod | `AUTH-001`, `AUTH-002`, `INF-001` | CSP nonces/hashes, HSTS, frame/MIME/referrer/permissions policies, CSRF/origin checks, body/upload limits, and route-specific rate/concurrency limits are enforced; cross-tenant authorization and header tests pass. | `7H` |
| **`SEC-002`** | **Credential and Encryption-Key Lifecycle Management** — `@moolox/auth`, `@moolox/git`, `@moolox/db` | `AUTH-007`, `GIT-001`, `ANA-001` | GitHub credentials use envelope encryption with versioned keys; secrets never enter logs/traces; dual-read/single-write rotation works; revocation and installation suspension stop jobs immediately; access is audited; leaked-token response is tested. | `7H` |
| **`GIT-007`** | **GitHub Webhook Delivery Ledger and Idempotent Processing** — `@moolox/git`, `@moolox/db`, `@moolox/analytics` | `GIT-001`, `GIT-003`, `GIT-004`, `INF-002`, `WS-005` | HMAC is verified before parsing; delivery IDs are unique and durable; duplicate delivery causes no duplicate commit or AST mutation; bounded retries and DLQ exist; replay is audited; installation deletion/suspension and repository rename/transfer events are handled. | `7H` |
| **`GIT-008`** | **GitHub Drift Reconciliation and Safe Branch-State Controller** — `@moolox/git`, `@moolox/ast-core` | `GIT-004`, `GIT-005`, `GIT-007` | Scheduled/manual reconciliation compares remote SHA, exported tree hash, and active AST version; missed webhooks self-heal; force-push, branch deletion/protection, repository transfer, and default-branch changes pause safely; no destructive overwrite occurs without preview and approval. | `7H` |
| **`OPS-001`** | **Service-Level Objectives, Alerting, and Incident Response** — `@moolox/analytics`, Platform Ops | `ANA-001`, `INF-002`, `DEP-002`, `GIT-007`, `BKP-001` | SLIs/SLOs cover API availability, save latency, Git sync lag, queue delay, deployment success, AI failures, backup freshness, and restore success; burn-rate alerts have owners; traces/logs/metrics correlate; runbooks and game-day evidence exist. | `7H` |
| **`TST-001`** | **Production Assurance CI Matrix** — all packages and `apps/web` | Existing tests, `MIG-001`, `SEC-001`, `GIT-007` | Required CI runs real lint, build, typecheck, unit, migration, API integration, Playwright journeys, axe scans, webhook replay, dependency/security scans, and artifact/SBOM generation; critical-module coverage thresholds apply. | `7H` |
| **`A11Y-001`** | **Moolox Platform WCAG 2.2 AA Conformance Gate** — `apps/web`, `@moolox/canvas`, `@moolox/components` | `CNV-001..004`, `TST-001` | Core workflows are keyboard-complete; focus behavior, reduced motion, landmarks, and live regions are correct; serious/critical axe findings are zero; screen-reader checks cover Git connection, canvas editing, publish, billing, and recovery. | `7H` |
| **`DLC-001`** | **Tenant Data Retention, Deletion, and Legal-Hold Engine** — `@moolox/db`, `@moolox/workspace`, `@moolox/enterprise` | `AUTH-002`, `DB-001`, `WS-005`, `BKP-001` | A retention matrix covers prompts, AST versions, deployments, audit logs, telemetry, and credentials; deletion has a reversible grace period and verified purge; backup tombstones prevent resurrection; legal holds override deletion; jobs are idempotent and issue audit receipts. | `10` |
| **`DLC-002`** | **User and Workspace Portability / DSAR Export** — `@moolox/project`, `@moolox/workspace`, `@moolox/deploy` | `DLC-001`, `PRJ-001`, `WS-005` | An authorized owner can export projects, versions, tokens, assets, memberships, and audit metadata in a documented portable format; exports are encrypted, expiring, resumable, tenant-isolated, and validation/re-import preserves semantics. | `10` |
| **`API-001`** | **Canonical API Compatibility and Error Contract** — `@moolox/types`, `@moolox/sdk`, `apps/web` | `CORE-002`, `AUTH-006`, `SDK-001` | A versioned OpenAPI contract is generated or checked from canonical Zod schemas; stable problem-details errors include code and correlation ID; pagination and idempotency are consistent; breaking contract diffs fail CI; deprecation and SDK compatibility policies are tested. | `11` |
| **`SEC-003`** | **Software Supply-Chain Integrity and Release Provenance** — root tooling, all packages | `TST-001`, `GIT-006` | Dependency review, secret scanning, SAST, license policy, vulnerability thresholds, SBOMs, signed provenance, least-privilege short-lived release credentials, and emergency patch SLAs are enforced. | `11` |

## 2. Sprint 7H — Production Assurance and Recovery Gate

- **Duration:** 30 calendar days after Sprint 7.
- **Assigned features:** `MIG-001`, `BKP-001`, `SEC-001`, `SEC-002`, `GIT-007`, `GIT-008`, `OPS-001`, `TST-001`, `A11Y-001`.
- **Entry gate:** Sprint 7 completed; Sprint 4 Git flows stable enough for replay and reconciliation testing.
- **Exit gate:**
  1. An N-1 database fixture migrates and an isolated PITR restore succeeds within documented RTO.
  2. Duplicate, delayed, and missed GitHub webhooks converge without duplicate commits, lost AST mutations, or silent overwrite.
  3. Required CI blocks merge on lint, type, test, migration, accessibility, or security failures.
  4. A security-header and cross-tenant authorization suite reports zero critical findings.
  5. Operational alerts and incident runbooks pass a game-day exercise.

Sprint 8 is blocked until this gate is certified.

## 3. Sprint 10 additions

Add `DLC-001` and `DLC-002` before the Enterprise exit gate. Enterprise certification is blocked until deletion, legal-hold, backup-tombstone, and portability tests pass.

## 4. Sprint 11 additions

Add `API-001` and `SEC-003` before publishing public APIs, SDK packages, CLI packages, plugin SDK packages, or GitHub Actions. The Platform release is blocked by breaking contract diffs, unsigned artifacts, missing SBOMs, or high-severity unresolved supply-chain findings.

## 5. Explicit non-duplication map

- `BKP-001` does not duplicate `DEP-003`; edge release rollback is not database disaster recovery.
- `GIT-007` and `GIT-008` do not duplicate `GIT-005`; delivery reliability and remote-state reconciliation are distinct from AST merge conflicts.
- `A11Y-001` governs the Moolox product UI; generated-site accessibility remains under `ORC-004`, `ORC-010`, and related AI quality features.
- `OPS-001` builds SLOs and response operations on top of existing `ANA-001` tracing.
- `API-001` governs compatibility and error semantics on top of `AUTH-006`, `SDK-001`, and `SDK-002`.
