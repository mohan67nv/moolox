# PRODUCT BIBLE V2 — MASTER INDEX
## The Complete Product, UX & Design System Blueprint
**Document 3** | **Classification:** Definitive Product Specification

---

## Document Map

| Part | File | Sections | Key Deliverables |
|:---|:---|:---|:---|
| **Part 1** | [Philosophy, Ecosystem & Users](file:///home/mohana-fedora/Data/MNVProjects/AIBuilder/docs/Product_Bible_V2_Part1_Philosophy_Ecosystem_Users.md) | Parts 1-3 | Mission/vision, 7 core principles, design/engineering/AI/accessibility/performance principles, 20+ product definitions with Mermaid ecosystem diagram, 10 user type profiles |
| **Part 2** | [Journeys & Screens](file:///home/mohana-fedora/Data/MNVProjects/AIBuilder/docs/Product_Bible_V2_Part2_Journeys_Screens.md) | Parts 4-5 | 5 user journeys (signup, AI editing, collaboration, agency handoff, deployment), 22 screen specifications with layouts, components, keyboard shortcuts, empty/loading/error states |
| **Part 3** | [Design System & Components](file:///home/mohana-fedora/Data/MNVProjects/AIBuilder/docs/Product_Bible_V2_Part3_DesignSystem_Components.md) | Parts 6-7 | "Obsidian" design language (typography, colors, spacing, radii, elevation, motion, glass, responsive), 11 core components with variants, states, accessibility, animations, tokens |
| **Part 4** | [AI, Workspace & Tokens](file:///home/mohana-fedora/Data/MNVProjects/AIBuilder/docs/Product_Bible_V2_Part4_AI_Workspace_Tokens.md) | Parts 8-10 | 11 AI interaction modalities, workspace architecture with Mermaid diagram, RBAC permission matrix (7 roles), W3C design token JSON schema, Tailwind compilation rules |
| **Part 5** | [Accessibility, Performance & Enterprise](file:///home/mohana-fedora/Data/MNVProjects/AIBuilder/docs/Product_Bible_V2_Part5_Accessibility_Performance_Enterprise.md) | Parts 11-14 | WCAG keyboard/screenreader/contrast/RTL spec, generated code auto-fix rules, performance targets, collaboration (presence, comments, approvals), enterprise (SSO, SOC2, GDPR, audit, white-label) |
| **Part 6** | [MVP & Roadmap](file:///home/mohana-fedora/Data/MNVProjects/AIBuilder/docs/Product_Bible_V2_Part6_MVP_Roadmap.md) | Parts 15-16 | 5 version definitions (v0.1→v3.0) with include/exclude, anti-requirements, RICE-scored features across 5 phases, Gantt roadmap, team scaling plan (3→20 engineers) |

---

## Quick Reference

### The Product in One Sentence
> A bidirectional visual canvas that generates production-ready Next.js code governed by a centralized design token system, with AI that never breaks what already works.

### The 7 Core Principles
1. **Code Is Truth** — Canvas is a projection of the AST
2. **Design Tokens Are Law** — No unauthorized values, ever
3. **AI Is a Teammate** — Explainable, undoable, scoped
4. **Performance Is a Feature** — Lighthouse 95+ by default
5. **Accessibility Is Not Optional** — WCAG AA enforced at compile-time
6. **Zero Lock-In** — Full Git export, self-host anywhere
7. **Progressive Complexity** — Simple for beginners, powerful for experts

### The Design Language: "Obsidian"
- **Dark-first** with full light mode token mapping
- **4px base unit** spacing system
- **Minor Third (1.2) type scale** with Inter/Geist fonts
- **8px default border radius**, glass effects with 12px blur
- **100-300ms transitions**, spring physics for drag operations

### MVP Timeline
| Version | Timeline | Team | Key Milestone |
|:---|:---|:---|:---|
| v0.1 | Months 1-3 | 3 eng | AST engine proof (internal) |
| v0.5 | Months 4-6 | 5 eng | Closed alpha (100 users) |
| v1.0 | Months 7-10 | 8 eng | Public launch + paid plans |
| v2.0 | Months 11-15 | 12 eng | Agency workflows + A/B testing |
| v3.0 | Months 16-22 | 20 eng | Enterprise + developer platform |

---

## Complete Document Series

| Doc # | Title | Purpose |
|:---|:---|:---|
| **Doc 1** | [Product Bible V1](file:///home/mohana-fedora/Data/MNVProjects/AIBuilder/docs/Product_Bible_AI_Website_Platform.md) | Market thesis, competitive analysis, technical architecture, business model |
| **Doc 2** | Founder Research Bible ([Part 1](file:///home/mohana-fedora/Data/MNVProjects/AIBuilder/docs/Founder_Research_Bible_Part1_Industry_Competitors.md) · [Part 2](file:///home/mohana-fedora/Data/MNVProjects/AIBuilder/docs/Founder_Research_Bible_Part2_User_Research_Psychology.md) · [Part 3](file:///home/mohana-fedora/Data/MNVProjects/AIBuilder/docs/Founder_Research_Bible_Part3_Design_Pricing_WhiteSpace.md) · [Part 4](file:///home/mohana-fedora/Data/MNVProjects/AIBuilder/docs/Founder_Research_Bible_Part4_Moat_Future_Verdict.md)) | Evidence-based research, 200 frustrations, 100 opportunities, moat analysis, verdict |
| **Doc 3** | Product Bible V2 (this document, 6 parts) | Complete product specification — the implementation blueprint |
