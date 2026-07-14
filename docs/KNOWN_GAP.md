# Moolox Known Gaps & Future-Sprint Triggers (`KNOWN_GAP.md`)

This document records any intentional architectural dormancies, future-sprint triggers, or structural deferrals across all completed and active sprints. Following our constitutional **Zero-Throwaway Philosophy**, no feature is deleted or "mocked" as temporary throwaway code; instead, capabilities required for later sprints are preserved in interfaces, schemas, and API boundaries with strict feature flags or dormant schema states (`is_active = false`).

---

## 📋 Ledger of Known Architectural Gaps & Planned Activations

| Feature ID | Feature Name | Current Implementation State | Planned Activation Sprint | Reason for Dormancy / Deferred Execution |
| :--- | :--- | :--- | :--- | :--- |
| **`DB-001` (`enterpriseOrgs`)** | Enterprise Organization Entities | Table `enterprise_orgs` created in Drizzle schema with foreign key references from `workspaces`. | **Sprint 6** | Enterprise federated multi-org structures (`ENT-001`) and SOC-2 audit streaming are scheduled for Sprint 6. Schema is live so zero DB migrations are needed. |
| **`DB-001` (`plugins`)** | Community & Verified Plugins | Table `plugins` and `plugin_installations` created in Drizzle schema. | **Sprint 7** | Plugin SDK sandbox (`PLG-001`) and marketplace registry (`MKT-001`) activate in Sprint 7. |
| **`AST-004`** | Zstd Database Storage Layer | Helper functions `compressASTToBase64()` and `decompressASTFromBase64()` implemented using high-speed `fflate` inside `@moolox/ast-core`. Currently stores compressed Base64 strings in `projects.astTree`. | **Sprint 3 / Sprint 4** | Binary `Uint8Array` / PostgreSQL physical `bytea` / `jsonb` streaming over WebSocket sync engine (`WS-SYNC-001`) activates during canvas collaborative broadcasting. |
| **`PRJ-002`** | Default Save Endpoint Hook | `useProjectStore` provides customized `saveFetcher` injection hooks and defaults to `POST /api/trpc/project.saveVersion`. | **Sprint 3** | Full tRPC router (`packages/api`) linking `projectStore` to physical database transaction commits initializes in Sprint 3 (`Project Versioning & Branching`). |

---

## 🔍 Verification Mandate
Before closing any sprint or task, developers must check this ledger. If a newly implemented module resolves a gap listed here, update the row status to `✅ ACTIVATED & RESOLVED` and cite the exact Git Commit hash.
