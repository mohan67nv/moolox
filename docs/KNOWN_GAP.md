# Moolox Known Gaps & Future-Sprint Triggers (`KNOWN_GAP.md`)

This document records any intentional architectural dormancies, future-sprint triggers, or structural deferrals across all completed and active sprints. Following our constitutional **Zero-Throwaway Philosophy**, no feature is deleted or "mocked" as temporary throwaway code; instead, capabilities required for later sprints are preserved in interfaces, schemas, and API boundaries with strict feature flags or dormant schema states (`is_active = false`).

---

## 📋 Ledger of Known Architectural Gaps & Planned Activations

| Feature ID | Feature Name | Current Implementation State | Planned Activation Sprint | Reason for Dormancy / Deferred Execution |
| :--- | :--- | :--- | :--- | :--- |
| **`DB-004` (`enterpriseOrgs`)** | Enterprise Organization Entities | Table `enterprise_orgs` exists in the Drizzle schema with foreign key references from `workspaces`. | **Sprint 6 activation; Sprint 10 full enterprise integration** | `ENT-001` activates the hierarchy root in Sprint 6; SAML/SCIM/data-lifecycle certification remains Sprint 10. Future changes use `MIG-001`; the existence of a table does not eliminate migration discipline. |
| **`DB-004` (`plugins`)** | Community & Verified Plugins | Tables for plugins and installations are preserved in the extensible schema. | **Sprint 7 hooks / Sprint 9 sandbox** | `PLG-001` activates lifecycle hooks in Sprint 7. `PLG-002..004` activate the sandbox, RPC, and manifest scopes in Sprint 9. Marketplace scope remains Sprint 8. |
| **`AST-010` / `DB-003`** | Zstd Database Storage Layer | `compressASTToBase64()` and `decompressASTFromBase64()` are implemented in `@moolox/ast-core`; database physical representation and streaming behavior remain separately gated. | **Sprint 7H migration verification; Sprint 9 collaboration integration** | Compression codec implementation is complete, but storage migrations and collaborative transport require explicit compatibility and restore tests. |
| **`PRJ-002` / `CORE-002`** | Default Save Endpoint Hook | `useProjectStore` provides `saveFetcher` injection and a default save route contract. | **Before the feature is marked fully production-active** | The physical type-safe API/transaction endpoint must be verified against the implemented router. This is an implementation completion check, not a reason to redesign the store. |
| **`AUTH-007` / `SEC-002`** | GitHub Credential Lifecycle | No canonical GitHub credential record or rotation implementation is complete yet. | **Sprint 4 Task 4.1 hooks / Sprint 7H certification** | Task 4.1 implements least-privilege installation authorization and encrypted storage; Sprint 7H certifies rotation, revocation, secret redaction, and incident response. |
| **`GIT-007` / `GIT-008`** | Webhook Replay and Drift Recovery | Basic incoming/outgoing Git synchronization is Sprint 4 scope. | **Sprint 7H** | Idempotent delivery history, DLQ/replay, missed-webhook recovery, force-push handling, and safe drift reconciliation are post-Sprint-4 production hardening. |
| **`MIG-001` / `BKP-001`** | Database Migration and Disaster Recovery | Schema code exists, but versioned migrations and automated restore evidence are not yet certified. | **Sprint 7H** | Production operation requires schema drift enforcement, PITR, RPO/RTO, and restore drills; edge rollback does not satisfy database recovery. |

---

## 🔍 Verification Mandate
Before closing any sprint or task, developers must check this ledger. If a newly implemented module resolves a gap listed here, update the row status to `✅ ACTIVATED & RESOLVED` and cite the exact Git Commit hash.
