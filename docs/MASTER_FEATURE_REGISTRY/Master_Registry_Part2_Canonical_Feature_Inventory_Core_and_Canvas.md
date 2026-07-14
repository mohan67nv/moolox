# DOCUMENT 7 — MASTER FEATURE REGISTRY & PROGRESSIVE ARCHITECTURE BLUEPRINT
## Part 2: Canonical Feature Inventory — Core Engine, Canvas & Design Systems
**Document:** 7.2 of 7.6 | **Series:** Master Feature Registry & Staged Delivery Blueprint

---

# 4. CANONICAL FEATURE INVENTORY: PILLARS 1 THROUGH 6

We record every planned capability across Pillars 1 through 6 of our overarching venture architecture. Every entry explicitly defines its canonical `Feature ID`, `Name`, `Description`, `Business Value`, `Engineering Complexity (0-10)`, `Dependencies`, `Current Status`, `Planned Release Bucket`, and `Implementation Progress %`.

---

## 4.1 Pillar 1: Bidirectional AST Engine Core (`@dios/ast-core`)

| Feature ID | Feature Name | Detailed Technical Description | Business Value | Complexity | Dependencies | Status | Release Bucket | Progress % |
|:---|:---|:---|:---:|:---:|:---|:---:|:---:|:---:|
| **`AST-001`** | **Unified JSONB AST Node Schema** | Standardized, version-controlled tree structure (`ASTNodeId`, `type`, `props`, `styles`, `children`) representing clean Next.js/React DOM trees. | **CRITICAL** | 7/10 | None (Base Core) | Architecture Defined | **`v0.5 Alpha`** | `100% (Spec) / 0% (Code)` |
| **`AST-002`** | **SWC/Babel AST Parser & Serializer** | Fast TypeScript visitor engine parsing raw JSX/TSX files into `ASTNode` trees and serializing mutated trees back into clean, human-readable React code. | **CRITICAL** | 8/10 | `AST-001` | Architecture Defined | **`v0.5 Alpha`** | `100% (Spec) / 0% (Code)` |
| **`AST-003`** | **Sub-Tree Structural Diffing Engine** | Precision mutation engine computing minimal delta patches (`ASTMutationPatch`) when elements are dragged or AI modifies a specific section. | **CRITICAL** | 8/10 | `AST-002` | Architecture Defined | **`v0.5 Alpha`** | `100% (Spec) / 0% (Code)` |
| **`AST-004`** | **Debounced Auto-Save & Checkpointing** | High-speed memory buffer (`Zustand`) holding active canvas mutations and flushing Zstd-compressed `JSONB` checkpoints to DB every 3s. | **HIGH** | 5/10 | `AST-001`, `DB-001` | Architecture Defined | **`v0.5 Alpha`** | `100% (Spec) / 0% (Code)` |
| **`AST-005`** | **Optimistic Single-Editor File Locking** | Collision prevention mechanism locking active `version_id` to single editor (`Last-write-wins at node level`) to prevent split-brain edits. | **HIGH** | 5/10 | `AST-004` | Architecture Defined | **`v0.5 Alpha`** | `100% (Spec) / 0% (Code)` |
| **`AST-006`** | **In-Canvas Sandpack Node Emulation** | In-browser `WebContainer/Sandpack` execution running full Node.js server actions inside live canvas preview iframe (`Shadow DOM portal`). | **MEDIUM** | 8/10 | `AST-002` | Architecture Defined | **`v1.5 Polish`** | `100% (Spec) / 0% (Code)` |

---

## 4.2 Pillar 2: React 19 Visual DOM Canvas & Property Inspector (`@dios/canvas`)

| Feature ID | Feature Name | Detailed Technical Description | Business Value | Complexity | Dependencies | Status | Release Bucket | Progress % |
|:---|:---|:---|:---:|:---:|:---|:---:|:---:|:---:|
| **`CNV-001`** | **60fps Virtualized DOM Renderer** | Virtualized viewport rendering engine (`@dios/canvas`) executing React 19 components with zero frame drops during element drag-and-drop. | **CRITICAL** | 8/10 | `AST-001` | Architecture Defined | **`v0.5 Alpha`** | `100% (Spec) / 0% (Code)` |
| **`CNV-002`** | **Bidirectional Property Inspector Panel** | Right-hand sidebar mapped directly to active `ASTNode.props` and `styles`; dragging padding (`p-6`) instantly updates AST and re-renders canvas. | **CRITICAL** | 6/10 | `CNV-001`, `AST-003`| Architecture Defined | **`v0.5 Alpha`** | `100% (Spec) / 0% (Code)` |
| **`CNV-003`** | **Multi-Viewport & Responsive Matrix** | Instant toggling between Mobile (`375px`), Tablet (`768px`), Desktop (`1440px`), and Ultra-Wide viewports with side-by-side sync comparison. | **HIGH** | 5/10 | `CNV-001` | Architecture Defined | **`v0.5 Alpha`** | `100% (Spec) / 0% (Code)` |
| **`CNV-004`** | **Precision Bounding Box & Wireframe Mode** | Visual debugging layer highlighting DOM margins, flex/grid alignment vectors, and accessibility outline boundaries (`Shift+W`). | **HIGH** | 4/10 | `CNV-001` | Architecture Defined | **`v0.5 Alpha`** | `100% (Spec) / 0% (Code)` |
| **`CNV-005`** | **Interactive Breakpoint & Grid Layout Math** | Visual grid/flexbox controls converting visual column dragging directly into Tailwind grid classes (`grid-cols-1 md:grid-cols-3`). | **HIGH** | 6/10 | `CNV-002` | Architecture Defined | **`v1.0 Public`** | `100% (Spec) / 0% (Code)` |
| **`CNV-006`** | **Virtualized Sub-Tree Lazy Windowing** | Memory optimization pruning off-screen DOM nodes on massive 100+ page sites (`ASTNodeId windowing`) to maintain memory usage under 150MB. | **HIGH** | 7/10 | `CNV-001` | Architecture Defined | **`v1.0 Public`** | `100% (Spec) / 0% (Code)` |

---

## 4.3 Pillar 3: Constitutional Design Token Governance (`@dios/tokens`)

| Feature ID | Feature Name | Detailed Technical Description | Business Value | Complexity | Dependencies | Status | Release Bucket | Progress % |
|:---|:---|:---|:---:|:---:|:---|:---:|:---:|:---:|
| **`TKN-001`** | **W3C `tokens.json` Schema Validation Engine** | Strict JSON schema parser binding all visual properties to W3C Design Tokens format (`color.bg.primary`, `space.8`, `font.heading.xl`). | **CRITICAL** | 6/10 | None (Base Core) | Architecture Defined | **`v0.5 Alpha`** | `100% (Spec) / 0% (Code)` |
| **`TKN-002`** | **Real-Time Token-to-Tailwind Compiler** | Instant compiler transforming `tokens.json` directly into native Tailwind CSS v4 variables and utility classes without page reloads (`< 5ms`). | **CRITICAL** | 7/10 | `TKN-001` | Architecture Defined | **`v0.5 Alpha`** | `100% (Spec) / 0% (Code)` |
| **`TKN-003`** | **Hardcoded Token Enforcement Rule Engine** | Compiler validation rule blocking ad-hoc hex strings (`#123456`) or magic numbers in user/AI edits, forcing mapping to nearest token variable. | **HIGH** | 5/10 | `TKN-001` | Architecture Defined | **`v0.5 Alpha`** | `100% (Spec) / 0% (Code)` |
| **`TKN-004`** | **Theme Studio & Dark/Light Mode Generator** | Interactive design system editor allowing 1-click theme inversion (`Light -> Dark -> High Contrast`) while preserving harmonious contrast ratios. | **HIGH** | 5/10 | `TKN-002` | Architecture Defined | **`v1.0 Public`** | `100% (Spec) / 0% (Code)` |
| **`TKN-005`** | **Bi-Directional Figma Token Sync Bridge** | Figma plugin (`@dios/figma-sync`) enabling 2-way import/export of `tokens.json` and variable collections directly between Figma and DIOS. | **HIGH** | 8/10 | `TKN-001` | Architecture Defined | **`v2.0 Ecosystem`**| `100% (Spec) / 0% (Code)` |

---

## 4.4 Pillar 4: AI Studio Bar & `Cmd+K` Contextual Editing (`@dios/ai`)

| Feature ID | Feature Name | Detailed Technical Description | Business Value | Complexity | Dependencies | Status | Release Bucket | Progress % |
|:---|:---|:---|:---:|:---:|:---|:---:|:---:|:---:|
| **`AIS-001`** | **Floating Natural Language Prompt Bar** | Bottom-docked AI input interface (`Cmd+K`) accepting multi-turn prompts with instant element selection targeting (`Targeting: #hero-heading`). | **CRITICAL** | 5/10 | `CNV-001` | Architecture Defined | **`v0.5 Alpha`** | `100% (Spec) / 0% (Code)` |
| **`AIS-002`** | **SSE Real-Time AST Patch Streamer** | Server-Sent Events (`SSE`) streaming connection receiving partial JSON patches (`ASTMutationPatch`) and re-rendering DOM progressively as AI types. | **CRITICAL** | 7/10 | `AIS-001`, `AST-003`| Architecture Defined | **`v0.5 Alpha`** | `100% (Spec) / 0% (Code)` |
| **`AIS-003`** | **Scoped Sub-Tree Context Window Pruning** | Token optimization slicing the active `ASTNodeId` and direct parents/children into prompt preamble (`never sending full 500-node site AST`). | **HIGH** | 6/10 | `AIS-001`, `AST-001`| Architecture Defined | **`v0.5 Alpha`** | `100% (Spec) / 0% (Code)` |
| **`AIS-004`** | **Instantaneous Undo/Redo AI Checkpoint Tree** | Non-destructive branching history allowing instant 1-click rollback of AI generation turns (`Ctrl+Z`) via immutable `JSONB` version nodes. | **HIGH** | 5/10 | `AST-004` | Architecture Defined | **`v1.0 Public`** | `100% (Spec) / 0% (Code)` |
| **`AIS-005`** | **Multi-Modal Image-to-Code Converter** | Vision capability (`Claude 3.7 Vision / GPT-4o`) accepting wireframe screenshots or whiteboard photos and converting directly to clean AST layouts. | **HIGH** | 7/10 | `AIS-001`, `TKN-002`| Architecture Defined | **`v1.0 Public`** | `100% (Spec) / 0% (Code)` |

---

## 4.5 Pillar 5: Curated Component Library & Brand Presets (`@dios/components`)

| Feature ID | Feature Name | Detailed Technical Description | Business Value | Complexity | Dependencies | Status | Release Bucket | Progress % |
|:---|:---|:---|:---:|:---:|:---|:---:|:---:|:---:|
| **`CMP-001`** | **11 Built-In Core Component Specifications** | Production-ready React 19 specifications for `Hero`, `Navigation`, `Pricing Table`, `Feature Grid`, `Testimonial Carousel`, `FAQ Accordion`, `Contact Form`, `Footer`, `CTA Banner`, `Blog Grid`, and `Team Matrix`. | **CRITICAL** | 4/10 | `AST-001`, `TKN-001`| Architecture Defined | **`v0.5 Alpha`** | `100% (Spec) / 0% (Code)` |
| **`CMP-002`** | **50 Hardcoded Obsidian Brand Kits** | Curated portfolio of 50 pre-compiled `tokens.json` brand presets (`Cyberpunk Dark`, `Fintech Clean`, `SaaS Modern`, `Editorial Luxury`) available at launch. | **HIGH** | 3/10 | `TKN-001` | Architecture Defined | **`v1.0 Public`** | `100% (Spec) / 0% (Code)` |
| **`CMP-003`** | **1-Click Component Insertion Drawer** | Visual component browser slide-over allowing users to drag and drop pre-built components directly onto canvas split-points. | **HIGH** | 4/10 | `CMP-001`, `CNV-001`| Architecture Defined | **`v1.0 Public`** | `100% (Spec) / 0% (Code)` |
| **`CMP-004`** | **Interactive Component Prop Customizer** | Automated prop variation generator (`variant="primary" | "outline" | "ghost"`) exposed directly inside right-hand Property Inspector. | **HIGH** | 5/10 | `CMP-001`, `CNV-002`| Architecture Defined | **`v1.0 Public`** | `100% (Spec) / 0% (Code)` |

---

## 4.6 Pillar 6: Bidirectional GitHub Monorepo Sync (`@dios/git`)

| Feature ID | Feature Name | Detailed Technical Description | Business Value | Complexity | Dependencies | Status | Release Bucket | Progress % |
|:---|:---|:---|:---:|:---:|:---|:---:|:---:|:---:|
| **`GIT-001`** | **GitHub App OAuth & Repo Provisioner** | 1-click GitHub App integration authorizing `@dios/git` to create repositories or link to existing Next.js 15 monorepo branches (`main / staging`). | **CRITICAL** | 6/10 | `AUTH-001` | Architecture Defined | **`v1.0 Public`** | `100% (Spec) / 0% (Code)` |
| **`GIT-002`** | **AST-to-Next.js Code Generator & Exporter** | Compiler exporting active AST and `tokens.json` to clean, human-readable Next.js 15 App Router code (`/src/app/*`) with zero DIOS runtime dependencies. | **CRITICAL** | 8/10 | `AST-002`, `TKN-002`| Architecture Defined | **`v1.0 Public`** | `100% (Spec) / 0% (Code)` |
| **`GIT-003`** | **Automated Git Push & Commit Formatter** | Background Inngest worker bundling code exports and pushing atomic commits (`feat(dios): update hero pricing section [skip ci]`) to user branch. | **CRITICAL** | 6/10 | `GIT-002` | Architecture Defined | **`v1.0 Public`** | `100% (Spec) / 0% (Code)` |
| **`GIT-004`** | **Incoming GitHub Webhook Bidirectional Puller** | Webhook listener (`push event`) detecting developer code changes pushed from VS Code, running SWC parser, and updating canvas AST in `< 3s`. | **HIGH** | 8/10 | `AST-002`, `GIT-001`| Architecture Defined | **`v1.0 Public`** | `100% (Spec) / 0% (Code)` |
| **`GIT-005`** | **AST Node ID Last-Write-Wins Conflict Resolver** | Structural collision handler cleanly merging simultaneous canvas edits and Git pushes by locking changes to unique `ASTNodeId` boundaries. | **HIGH** | 7/10 | `GIT-004`, `AST-005`| Architecture Defined | **`v1.5 Polish`** | `100% (Spec) / 0% (Code)` |

---

*— End of Part 2 (Canonical Feature Inventory — Core Engine, Canvas & Design Systems) —*
