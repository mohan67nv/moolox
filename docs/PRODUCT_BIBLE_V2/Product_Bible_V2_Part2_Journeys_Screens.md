# PRODUCT BIBLE V2 — PART 2
## User Journeys & Complete Screen Inventory
**Document:** 3.2 of 3.6 | **Series:** Product Bible V2

---

# PART 4 — USER JOURNEYS

## 4.1 Journey: Signup → First Site Live (The "Golden Path")

**Target:** New user sees a live site on a custom URL within 3 minutes of landing on our marketing page.

```
Step 1: Landing Page
├── User clicks "Start Building Free"
├── Redirect → OAuth (Google/GitHub/Email)
└── Total time: ~15 seconds

Step 2: Onboarding (1 screen, 3 choices)
├── "What are you building?" → [Website / Landing Page / App / Dashboard / Blog]
├── "What's it for?" → Free text (e.g., "AI-powered legal tech startup")  
├── "Pick a vibe" → 6 curated design presets (dark/light × 3 aesthetics)
│   ├── "SaaS Dark" — Vercel/Linear aesthetic
│   ├── "Startup Light" — Stripe/Notion aesthetic
│   ├── "Creative Bold" — Framer/Awwwards aesthetic
│   ├── "Corporate Trust" — Salesforce/IBM aesthetic
│   ├── "Editorial Minimal" — Medium/Substack aesthetic
│   └── "Custom" → AI generates brand from description
└── Total time: ~30 seconds

Step 3: AI Generation (streaming, visible progress)
├── Progress bar shows: "Architecting sitemap..." → "Generating hero..." → "Building pricing..." → "Optimizing performance..."
├── Live preview renders incrementally in background
├── Sitemap tree builds in left panel: /home, /features, /pricing, /about
└── Total time: ~20-40 seconds

Step 4: Canvas (site is ready, user lands in editor)
├── Full site visible on canvas at desktop breakpoint
├── Floating toast: "Your site is ready! Click any element to edit."
├── Cmd+K prompt box available for AI edits
├── Top bar: [Breakpoints] [Undo/Redo] [Git Branch] [Publish ▸]
└── User can start editing immediately

Step 5: First Edit (guided)
├── Subtle pulse animation on hero headline suggesting "click to edit"
├── User clicks headline → inline text editing activates
├── User types new headline → saves automatically
└── Total time: ~10 seconds

Step 6: Publish
├── User clicks "Publish ▸" button
├── Dropdown: "Deploy to staging" (1 click)
├── URL generated: project-name.dios.app
├── Toast: "Live! Share this link: [copy button]"
└── Total time: ~3 seconds

TOTAL GOLDEN PATH: < 3 minutes signup-to-live-URL
```

## 4.2 Journey: AI-Assisted Editing

```
Contextual AI Edit (Cmd+K on selected element):
├── User selects a pricing card on canvas
├── Presses Cmd+K → floating prompt box appears over selection
├── Types: "Make this card glassmorphic with a subtle glow border"
├── AI streams changes:
│   ├── Adds backdrop-filter: blur(12px) to card
│   ├── Adds border: 1px solid rgba(255,255,255,0.1)
│   ├── Adds box-shadow with brand accent color glow
│   └── All changes use design tokens, not hard-coded values
├── Visual diff overlay shows: green = added, red = removed
├── User sees Before/After toggle
├── Actions: [Accept ✓] [Reject ✗] [Refine →]
└── If accepted: changes commit to AST, code panel updates, Git diff staged

Full-Page AI Edit:
├── User opens AI Studio panel (right sidebar)
├── Types: "Redesign the features section as a bento grid with icons"
├── AI generates the new section in sandbox
├── Preview renders below prompt
├── User can drag-position within page structure
├── Actions: [Insert Above] [Replace] [Insert Below] [Cancel]
└── AI explains changes: "Replaced 3-column feature list with 2x3 bento grid. Added Lucide icons. Used brand-primary for icon backgrounds."
```

## 4.3 Journey: Team Collaboration

```
Designer creates initial site:
├── Invites developer teammate (email/link)
├── Developer joins workspace → sees project
├── Developer opens Code Panel → sees clean Next.js code
├── Developer creates branch: "feature/auth-flow"
├── Developer adds custom React component via code
├── Component appears on canvas automatically (AST sync)
├── Designer sees new component → adjusts visual styling on canvas
├── Code updates reflect designer's visual changes
├── Both changes merge to same branch
└── Developer creates PR → reviewer approves → merge to main → auto-deploy
```

## 4.4 Journey: Agency Client Handoff

```
Agency Setup:
├── Agency creates project for client "Acme Corp"
├── Designs full site in Canvas
├── Configures client permissions:
│   ├── ✅ Edit text content
│   ├── ✅ Swap images (from approved library)
│   ├── ✅ Add blog posts (CMS)
│   ├── ❌ Modify layout structure
│   ├── ❌ Change design tokens
│   ├── ❌ Access code panel
│   └── ❌ Modify navigation
├── Generates client portal URL: acme.agency-brand.com
├── Client receives branded login (agency logo, agency colors)
├── Client edits text → changes go to staging
├── Client clicks "Request Review" → agency gets notification
├── Agency approves → changes deploy to production
└── Agency bill: $0 additional per client (unlimited on Agency plan)
```

## 4.5 Journey: Deployment & Analytics

```
Deployment Pipeline:
├── User clicks "Publish ▸"
├── Options:
│   ├── "Deploy to Staging" → project-name.dios.app (instant)
│   ├── "Deploy to Production" → custom-domain.com (requires DNS setup once)
│   └── "Export to Git" → Push clean Next.js to GitHub/GitLab
├── Build process (invisible, <5s):
│   ├── AST → Next.js static export
│   ├── Image optimization (WebP/AVIF, srcset)
│   ├── CSS purge + minification
│   ├── Lighthouse audit (must pass 95+)
│   ├── Accessibility audit (must pass WCAG AA)
│   └── If any audit fails → warning with auto-fix suggestion
├── Edge deployment to Cloudflare Workers (200+ PoPs)
└── SSL provisioned automatically

Post-Deploy Analytics:
├── Dashboard shows: Visitors, Page Views, Bounce Rate, Avg. Session
├── Core Web Vitals: LCP, FID, CLS (real user monitoring)
├── Conversion funnel (if goals configured)
├── AI Insight: "Mobile bounce rate is 12% higher than desktop. The hero CTA button is 48px below the fold on iPhone 15. Recommendation: Reduce hero image height by 80px."
└── A/B test results (if active): Variant B headline converts 23% better → "Promote to 100%?" [Yes] [No]
```

---

# PART 5 — COMPLETE SCREEN INVENTORY

## 5.1 Screen Catalog

### Screen 1: Home / Marketing Landing Page
| Property | Specification |
|:---|:---|
| **Purpose** | Convert visitors to signups. Communicate product value. |
| **Layout** | Full-width marketing page. Hero → Demo Video → Features → Pricing → Social Proof → CTA → Footer |
| **Key Interactions** | "Start Building Free" CTA → OAuth signup. Live interactive demo embedded (sandbox). |
| **Responsive** | Full responsive. Mobile-first hero with stacked layout. |
| **Empty State** | N/A (always has content) |
| **Loading State** | Skeleton shimmer for dynamic elements (pricing, testimonials) |

### Screen 2: Dashboard (Post-Login Home)
| Property | Specification |
|:---|:---|
| **Purpose** | Overview of all projects, recent activity, quick actions. |
| **Layout** | Left sidebar (workspace nav) + Main content (project grid/list). Top bar with search, notifications, profile. |
| **Components** | ProjectCard (thumbnail, name, last edited, status), QuickActionBar ("New Project", "Import", "From Template"), ActivityFeed |
| **Interactions** | Click project → opens Canvas. "+" → New project wizard. Right-click project → context menu (duplicate, archive, delete, settings). |
| **Keyboard** | `/` → Focus search. `N` → New project. `1-9` → Open project by index. |
| **Empty State** | Illustration + "Create your first project" CTA + template suggestions |
| **Loading State** | ProjectCard skeletons (6 cards with shimmer) |
| **Error State** | "Unable to load projects. Retry?" with retry button |

### Screen 3: Visual Canvas (Core Editor)
| Property | Specification |
|:---|:---|
| **Purpose** | Primary editing surface. Visual WYSIWYG + Code split view. |
| **Layout** | **Top Bar:** Breakpoints [Desktop/Tablet/Mobile] · Undo/Redo · Zoom · Branch indicator · Publish button. **Left Panel (collapsible, 240px):** Page tree + Component library + Asset drawer. **Center (fluid):** Live canvas rendering via WebContainer. **Right Panel (collapsible, 320px):** Tab 1: Visual Properties (styling sliders, token selectors). Tab 2: Code Inspector (live JSX/TSX). Tab 3: AI Chat. **Bottom Bar (floating):** Cmd+K AI prompt. |
| **Components** | CanvasRenderer, PropertyPanel, CodeInspector, PageTree, ComponentDrawer, AssetDrawer, BreakpointToggle, AICmdKBar, BranchIndicator, PublishDropdown |
| **Interactions** | Click element → select (blue outline). Double-click text → inline edit. Drag element → reorder in DOM. Drag edge → resize. Right-click → context menu (duplicate, delete, wrap, extract component, AI edit). |
| **Keyboard** | `Cmd+K` → AI prompt. `Cmd+Z/Y` → Undo/Redo. `Cmd+D` → Duplicate. `Cmd+G` → Group/wrap in div. `Cmd+Shift+E` → Export selection. `Space+Drag` → Pan canvas. `Cmd+0` → Fit to screen. `Tab` → Next sibling element. `Enter` → Enter child. `Escape` → Exit / deselect. `1/2/3` → Switch breakpoints. |
| **Empty State** | Canvas shows: "Start with AI prompt, template, or blank page" with 3 action cards |
| **Loading State** | Canvas skeleton with progressive WebContainer hydration. Code panel shows "Compiling..." |
| **Error State** | If WebContainer fails: "Preview unavailable. Code editor remains functional. [Retry] [Report Issue]" |
| **Responsive** | Canvas itself shows responsive previews. The editor UI collapses panels on <1280px screens. |

### Screen 4: AI Studio Panel
| Property | Specification |
|:---|:---|
| **Purpose** | Dedicated AI interaction — full conversation, generation history, memory settings |
| **Layout** | Right sidebar panel (480px, expandable to half-screen). Chat interface with streaming responses. |
| **Components** | ChatMessageList, PromptInput (multiline, file/image drop), GenerationPreview, ContextIndicator ("Aware of: 5 pages, 42 components, brand tokens"), ModelSelector, HistoryDrawer |
| **Interactions** | Type prompt → AI streams response with live code preview. Attach image → AI interprets visual reference. Paste URL → AI analyzes and extracts design patterns. Click "Apply" on any suggestion → merges to canvas. |
| **Keyboard** | `Cmd+J` → Toggle AI Studio. `Enter` → Send prompt. `Shift+Enter` → New line. `Cmd+↑` → Previous prompt. `Escape` → Close panel. |
| **Empty State** | "Ask me anything about your project. I know your design tokens, sitemap, and component library." |

### Screen 5: Brand Studio
| Property | Specification |
|:---|:---|
| **Purpose** | Define and manage brand identity that governs all AI generation and design tokens. |
| **Layout** | Full-page settings view. Sections: Logo, Colors (primary/secondary/neutral/semantic), Typography (font family, scale, weights), Tone of Voice (dropdown: Professional/Playful/Technical/Friendly), Imagery Style. |
| **Components** | ColorPicker (with shade auto-generation 50-950), FontSelector (Google Fonts browser), TypeScalePreview (live H1-Caption rendering), ToneSelector, LogoUploader |
| **Interactions** | Change any value → live preview cards update showing before/after across sample components. "Apply to Project" → regenerates all design tokens. |
| **Keyboard** | Standard form navigation. `Cmd+S` → Save changes. |

### Screen 6: Design Token Manager
| Property | Specification |
|:---|:---|
| **Purpose** | Technical view of all design tokens. JSON editor + visual preview. Import/export. |
| **Layout** | Split view: Left = token tree (collapsible categories). Right = JSON editor with syntax highlighting. Bottom = live component preview using current tokens. |
| **Components** | TokenTree, JSONEditor (Monaco), TokenPreviewGrid, ImportExportBar, VersionSelector |
| **Interactions** | Edit token value → preview updates live. Import JSON file → validates against schema → shows diff. Export → downloads `tokens.json`. |

### Screen 7: Template Gallery
| Property | Specification |
|:---|:---|
| **Purpose** | Browse and select pre-built website templates organized by category and industry. |
| **Layout** | Filter sidebar (category, industry, style, page count) + Template grid with hover-preview. |
| **Components** | TemplateCard (animated hover preview, name, page count, rating), FilterPanel, SearchBar, CategoryTabs |
| **Interactions** | Hover template → animated micro-preview. Click → full-page preview with page-by-page navigation. "Use Template" → Creates new project with template + opens Brand Studio to customize identity. |

### Screen 8: Deployments Dashboard
| Property | Specification |
|:---|:---|
| **Purpose** | Manage domains, view deployment history, check performance scores. |
| **Layout** | Domain card (status, SSL, last deploy) + Deployment history list + Performance scorecard. |
| **Components** | DomainCard, DeploymentRow (timestamp, status, commit hash, Lighthouse scores), PerformanceGauge (LCP, FID, CLS), RollbackButton |
| **Interactions** | "Add Domain" → DNS configuration wizard. Click deployment → view details + rollback option. |

### Screen 9: Analytics
| Property | Specification |
|:---|:---|
| **Purpose** | Website performance metrics, visitor analytics, conversion tracking, AI insights. |
| **Layout** | KPI cards at top (visitors, page views, bounce rate, avg session) + Time-series chart + Page breakdown table + AI Insights panel. |
| **Components** | KPICard, TimeSeriesChart (D3/Recharts), PageTable, AIInsightCard, ConversionFunnel, A/BTestResults |

### Screen 10: Project Settings
| Property | Specification |
|:---|:---|
| **Purpose** | Project configuration: SEO defaults, custom code injection, integrations, danger zone. |
| **Layout** | Vertical section list: General, SEO, Custom Code, Integrations, Git, Danger Zone. |
| **Components** | SettingsSection, SEOPreview (Google SERP mockup), CodeInjector (head/body), IntegrationCards, GitRepoConnector |

### Screen 11: Marketplace
| Property | Specification |
|:---|:---|
| **Purpose** | Browse and purchase third-party templates, components, plugins, and design systems. |
| **Layout** | Featured carousel + Category navigation + Search + Item grid. |
| **Components** | MarketplaceItemCard, ReviewStars, PurchaseButton, CreatorProfile, PreviewModal |

### Screen 12: Enterprise Console
| Property | Specification |
|:---|:---|
| **Purpose** | Organization-level administration for enterprise customers. |
| **Layout** | Sidebar: Teams, Members, Billing, SSO, Audit Log, Compliance, White Label. Main: contextual admin views. |
| **Components** | TeamTable, MemberRow (role, last active, permissions), AuditLogTable (action, user, timestamp, IP), SSOConfig, ComplianceBadges |

### Screen 13: Command Palette
| Property | Specification |
|:---|:---|
| **Purpose** | Universal search and action launcher (Linear/Raycast-inspired). |
| **Layout** | Centered modal overlay. Search input + results list with keyboard navigation. |
| **Trigger** | `Cmd+K` (when not in AI context) or `Cmd+P` |
| **Actions** | Navigate to page, open project, search components, run AI action, toggle settings, keyboard shortcut reference |

### Screens 14-22: Additional Screens (Abbreviated)

| Screen | Purpose | Key Feature |
|:---|:---|:---|
| **14. Component Library** | Browse, create, manage reusable components | Variant editor, prop inspector, usage tracker |
| **15. Asset Library** | Upload, organize, optimize media assets | Drag-and-drop upload, auto-optimization, AI image generation |
| **16. Collaboration View** | Comment threads, review queues, presence | Element-pinned comments, approval workflows |
| **17. Billing & Plans** | Subscription management, usage metrics, invoices | Credit usage gauge, plan comparison, upgrade flow |
| **18. Profile & Settings** | User preferences, API keys, connected accounts | Theme preference, keyboard shortcut customization |
| **19. Notifications** | Activity feed, mentions, deployment alerts | Filterable by type, mark-as-read, notification preferences |
| **20. Help & Documentation** | In-app guides, keyboard shortcuts, tutorials | Searchable, contextual suggestions based on current screen |
| **21. Onboarding Wizard** | First-time user setup flow | 3-step progressive onboarding with skip option |
| **22. Error/404 Page** | Graceful error handling | Branded error page with helpful navigation links |

---

*— End of Part 2 (Product Bible V2) —*
*Continue to Part 3: Design System & Component Library*
