# Moolox Known Gaps & Future-Sprint Triggers (`KNOWN_GAP.md`)

This document records any intentional architectural dormancies, future-sprint triggers, or structural deferrals across all completed and active sprints. Following our constitutional **Zero-Throwaway Philosophy**, no feature is deleted or "mocked" as temporary throwaway code; instead, capabilities required for later sprints are preserved in interfaces, schemas, and API boundaries with strict feature flags or dormant schema states (`is_active = false`).

---

## 📋 Ledger of Known Architectural Gaps & Planned Activations

| Feature ID | Feature Name | Current Implementation State | Planned Activation Sprint | Reason for Dormancy / Deferred Execution |
| :--- | :--- | :--- | :--- | :--- |
| **`DB-004` (`enterpriseOrgs`)** | Enterprise Organization Entities | Table `enterprise_orgs` exists in the Drizzle schema with foreign key references from `workspaces`. | **Sprint 10 enterprise integration** | Dormant schema remains preserved. `ENT-001..002` activation moves to Sprint 10 so pre-GA work proves repository trust and production safety. |
| **`DB-004` (`plugins`)** | Community & Verified Plugins | Tables for plugins and installations are preserved in the extensible schema. | **Sprint 7 hooks / Sprint 9 sandbox** | `PLG-001` activates lifecycle hooks in Sprint 7. `PLG-002..004` activate the sandbox, RPC, and manifest scopes in Sprint 9. Marketplace scope remains Sprint 8. |
| **`AST-010` / `DB-003`** | Zstd Database Storage Layer | `compressASTToBase64()` and `decompressASTFromBase64()` are implemented in `@moolox/ast-core`; database physical representation and streaming behavior remain separately gated. | **Sprint 7H migration verification; Sprint 9 collaboration integration** | Compression codec implementation is complete, but storage migrations and collaborative transport require explicit compatibility and restore tests. |
| **`PRJ-002` / `CORE-002` / `PRJ-008`** | Production Save Transaction | `useProjectStore` provides `saveFetcher` injection and a default save route contract. | **Sprint 5 Task 5.1** | `PRJ-008` owns the authenticated type-safe transactional endpoint, tenant isolation, optimistic `409`, exact reload hash, and Playwright journey. |
| **`AUTH-007` / `SEC-002`** | GitHub Credential Lifecycle | No canonical GitHub credential record or rotation implementation is complete yet. | **Sprint 4 Task 4.1 hooks / Sprint 7H certification** | Task 4.1 implements least-privilege installation authorization and encrypted storage; Sprint 7H certifies rotation, revocation, secret redaction, and incident response. |
| **`GIT-007` / `GIT-008`** | Webhook Replay and Drift Recovery | Basic incoming/outgoing Git synchronization has recorded Sprint 4 implementation evidence. | **Sprint 6 initial certification; Sprint 7H recertification** | GA requires idempotent delivery history, DLQ/replay, missed-webhook recovery, force-push handling, and safe drift reconciliation. |
| **`MIG-001` / `BKP-001`** | Database Migration and Disaster Recovery | Schema code exists, but versioned migrations and automated restore evidence are not yet certified. | **Sprint 6 initial certification; Sprint 7H recertification** | Production operation requires schema drift enforcement, PITR, RPO/RTO, and restore drills before GA. |
| **`GIT-009` / `AST-011`** | Brownfield Compatibility and Editability Boundaries | Repository linking exists, but existing repositories lack an accepted compatibility report and enforced safe/read-only regions. | **Sprint 5 Task 5.2** | GA differentiation requires honest supported scope and prevention of silent rewrites. |
| **`CHG-001` / `REV-001`** | Semantic Change and Visual PR Journey | Patch, Git, canvas, and audit capabilities exist separately. | **Sprint 5 Task 5.4 / Sprint 6 Task 6.1** | The complete intent→minimal diff→visual review→merge reconciliation journey is not yet integrated. |
| **`PRV-001`** | Consent and AI-Memory Controls | Telemetry and RAG plans exist without a complete pre-GA consent/memory-control gate. | **Sprint 6 Task 6.2** | `ANA-002` and learning cannot activate before explicit purpose/retention consent, withdrawal, inspection/deletion, and redaction. |
| **`TST-002` / `VAL-001`** | Public Technical Proof and Paid Demand | No reproducible repository corpus or paid design-partner gate currently certifies the business. | **Sprint 6 Task 6.4** | GA is blocked until round-trip fidelity and willingness to pay are evidenced. |

---

## 🔍 Verification Mandate
Before closing any sprint or task, developers must check this ledger. If a newly implemented module resolves a gap listed here, update the row status to `✅ ACTIVATED & RESOLVED` and cite the exact Git Commit hash.
