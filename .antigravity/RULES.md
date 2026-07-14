# Antigravity Project Rules
Never spend tokens to rediscover knowledge that already exists in the project. Reuse the Master Feature Registry, ADRs, and implementation artifacts before consulting strategic documents

Version: 3.0
Status: ACTIVE
Authority: Founder

---

# Project Mission

Build a world-class AI-powered Digital Experience Operating System.

This project is **not** an AI website builder.

The long-term platform includes:

- Websites
- Landing Pages
- SaaS Applications
- Documentation
- Dashboards
- Portals
- Ecommerce
- Internal Tools
- Developer Platform
- AI Workspace

Every engineering decision must support this long-term vision.

---

# Source of Truth

The project is governed by the following documents.

## Strategic Documents

1. Product Bible
2. Founder Research Bible
3. Product Bible V2
4. AI + Engineering Bible
5. Company Bible
6. CTO Architecture Review

## Execution Documents

7. Master Feature Registry (6 Parts)
8. Master Execution Plan (Generated from Feature Registry)

Priority Order

Master Feature Registry

↓

Master Execution Plan

↓

CTO Architecture Review

↓

AI + Engineering Bible

↓

Product Bible V2

↓

Product Bible

↓

Founder Research Bible

↓

Company Bible

The Master Feature Registry is the primary implementation guide.

Every implementation task must originate from the Feature Registry.

Never invent features.

Never silently remove features.

Never change feature priority without approval.

---

# Architecture Freeze

The product architecture is frozen.

Do NOT redesign:

- Product Vision
- Domain Model
- Module Boundaries
- AI Architecture
- Technology Stack
- Database Direction
- Folder Structure
- Design System
- Engineering Principles

Implementation improvements are encouraged.

Architecture changes require explicit approval.

---

# Product Philosophy

No approved feature should disappear.

Every feature belongs to one release.

Allowed Releases

- v0.5 Alpha
- v1.0
- v1.5
- v2.0
- Enterprise
- Platform
- Future

If implementation is postponed:

- Preserve architecture
- Preserve interfaces
- Preserve extension points
- Preserve database compatibility

Never reduce long-term vision.

---

# Master Feature Registry Rules

The Master Feature Registry is the implementation contract.

Before implementing anything:

1. Locate the feature.
2. Read its dependencies.
3. Read acceptance criteria.
4. Read implementation notes.
5. Read related APIs.
6. Read related database entities.
7. Read related ADRs.

Every completed feature must update:

- Status
- Progress
- Tests
- Documentation
- Completion %
- Dependencies

Never implement features outside the registry unless approved.

---

# Engineering Principles

Always prioritize:

- Clean Architecture
- SOLID
- Modular Design
- High Cohesion
- Low Coupling
- Explicit Interfaces
- Strong Typing
- Testability
- Security by Default
- Observability
- Long-Term Maintainability

Build software that remains maintainable for years.

---

# Code Quality

Every implementation must include:

- Production-ready code
- Unit Tests
- Integration Tests
- Type Safety
- Documentation
- Error Handling
- Structured Logging

Incomplete implementations are not complete.

---

# Security

Always:

- Validate inputs
- Sanitize outputs
- Protect secrets
- Follow OWASP
- Apply Least Privilege
- Never trust client input
- Review security implications

---

# AI Responsibilities

AI is an engineering partner.

AI is NOT the product owner.

AI must:

- Preserve architecture
- Preserve interfaces
- Preserve module boundaries
- Respect roadmap
- Explain trade-offs
- Justify major refactors

---

# Refactoring

Allowed

- Better code
- Better testing
- Better maintainability
- Better readability
- Better performance

Not Allowed

- Product redesign
- Scope reduction
- Feature removal
- Technology replacement
- Architecture replacement

without explicit approval.

---

# Documentation

Documentation supports engineering.

Avoid duplication.

Only create documentation that:

- documents architecture
- documents APIs
- records ADRs
- improves maintainability
- helps future engineers

---

# Architecture Decision Records (ADR)

Every significant engineering decision must generate an ADR.

Examples:

- Technology changes
- Database changes
- API contract changes
- Security model changes
- AI workflow changes

Every ADR must contain:

- Context
- Decision
- Alternatives
- Trade-offs
- Consequences

Never silently change architecture.

---

# Git

Keep commits:

- Small
- Atomic
- Reversible
- Well-described

Never mix unrelated work.

---

# Definition of Done

A feature is complete only if:

✓ Feature Registry updated

✓ Production implementation complete

✓ Unit Tests pass

✓ Integration Tests pass

✓ Type Checking passes

✓ Lint passes

✓ Documentation updated

✓ Logging complete

✓ Error handling complete

✓ Security reviewed

✓ Performance acceptable

Only then proceed.

---

# Working Style

Implement one feature at a time.

Complete one module at a time.

Review.

Test.

Commit.

Update Feature Registry.

Repeat.

Never partially implement multiple modules.

---

# Context & Token Efficiency (CRITICAL)

Context is a limited engineering resource.

Treat input tokens like production infrastructure.

Always minimize context while preserving correctness.

Never load the entire project unless explicitly requested.

Always ask:

"What is the minimum context required?"

Preferred loading order:

1. Master Feature Registry
2. Current Sprint
3. Current Feature
4. Current Module
5. Current Source Files
6. Direct Dependencies
7. Related APIs
8. Related Database Schema
9. Relevant Engineering Bible section

Only consult Product Bible or Founder Research Bible if implementation is blocked.

---

# Context Budget

Target maximum input tokens:

Small Task
<10K

Medium Task
10K–25K

Large Task
25K–50K

Major Refactor
50K–70K

Architecture Review
70K–90K

Never exceed 90K tokens unless explicitly approved.

If estimated context exceeds 70K:

STOP.

Propose a lower-context implementation strategy.

---

# Progressive Context

Never repeatedly reload completed work.

Assume completed modules remain correct.

Load only:

- Current Sprint
- Current Feature
- Current Module
- Current Dependencies
- Current Tests

Ignore unrelated systems.

---

# Decision Memory

Reuse previous engineering decisions.

Avoid repeating:

- Architecture summaries
- Product summaries
- Feature inventories
- Previously accepted decisions

Reference existing ADRs instead.

---

# Cost Awareness

Token efficiency is an engineering KPI.

Always ask:

- Can fewer files be loaded?
- Can summaries be reused?
- Can implementation be split?
- Can this task avoid loading strategic documents?

Always choose the lowest-context solution that preserves correctness.

---

# Communication

Implementation responses should be concise.

Avoid repeating:

- Vision
- Architecture
- Long explanations

Focus only on:

- Current Feature
- Current Module
- Current Task
- Current Blockers
- Next Action

Generate detailed reports only when requested.

---

# Founder Principle

The vision is fixed.

Architecture is stable.

Execution is iterative.

Quality is preferred over shortcuts.

Implementation should continuously improve the codebase while preserving the approved product vision.

Engineering excellence includes:

- Maintainability
- Simplicity
- Testability
- Security
- Performance
- Cost efficiency
- Token efficiency

Think like a long-term Staff Engineer building software that will still be excellent five years from now.

# Licensing

This project is proprietary commercial software.

License:

Proprietary Commercial

Copyright © 2026 Meqrun.

All Rights Reserved.

Do not introduce dependencies whose licenses are incompatible with commercial distribution.

Preferred licenses:

- MIT
- Apache-2.0
- BSD-2
- BSD-3

Before adding any dependency:

Verify its license.

Flag GPL/AGPL/LGPL dependencies for approval.