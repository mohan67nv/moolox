# PRODUCT BIBLE V2 — PART 4
## AI Experience, Workspace Architecture & Design Tokens
**Document:** 3.4 of 3.6 | **Series:** Product Bible V2

---

# PART 8 — AI EXPERIENCE DESIGN

## 8.1 AI Interaction Modalities

### Prompt Box (Cmd+K Contextual)
| Property | Specification |
|:---|:---|
| **Purpose** | Localized AI edits on a selected canvas element |
| **Trigger** | `Cmd+K` while element is selected on canvas |
| **Appearance** | Floating input bar (480px wide) positioned above/below selected element. Glass background + glow border. |
| **Input Types** | Text prompt, pasted image (reference), pasted URL (style source) |
| **Context Sent to AI** | Selected element's AST subtree + parent context (3 levels up) + design tokens + page sitemap |
| **Output** | Streamed code diff applied to selected element only. Visual diff overlay on canvas. |
| **Actions** | Accept (Cmd+Enter), Reject (Escape), Refine ("Make it more subtle"), Undo last AI change (Cmd+Z) |
| **Memory** | User corrections stored per-project. If user always rejects a certain style, AI learns to avoid it. |

### AI Studio Panel (Full Conversation)
| Property | Specification |
|:---|:---|
| **Purpose** | Full conversational AI interface for complex, multi-step operations |
| **Trigger** | `Cmd+J` or click AI icon in right panel |
| **Appearance** | Right sidebar panel (480px), expandable to 50% viewport width |
| **Context Awareness** | Full project context: all pages, all components, design tokens, deployment history, analytics data |
| **Capabilities** | Full site generation, multi-page edits, architectural changes, copy overhaul, bulk operations |
| **Conversation History** | Persistent per-project. Searchable. Branching (fork a conversation to try alternate approaches). |
| **Context Indicator** | Top of panel shows: "Context: 5 pages · 42 components · Brand: SaaS Dark · Tokens: v2.1" |

### Selection-Based AI Editing
| Property | Specification |
|:---|:---|
| **Purpose** | Edit specific visual properties of selected elements via AI |
| **Trigger** | Right-click element → "AI Edit" or select element + Cmd+K |
| **Scope Control** | "Edit this element only" / "Edit all instances of this component" / "Edit across all pages" |
| **Preview** | Split-screen before/after. Toggle with `Tab` key. |
| **Diff Visualization** | Green highlight = added properties. Red strikethrough = removed. Yellow = modified values. |

### Voice Input
| Property | Specification |
|:---|:---|
| **Purpose** | Hands-free AI prompting for rapid iteration |
| **Trigger** | Hold `V` key + speak (push-to-talk) |
| **Processing** | Whisper API → text transcription → standard prompt pipeline |
| **Feedback** | Waveform visualization while recording. Transcribed text appears in prompt box before execution. |
| **Phase** | P2 (v2.0). Not in MVP. |

### Image Input
| Property | Specification |
|:---|:---|
| **Purpose** | Use visual references to guide AI generation |
| **Input Methods** | Drag-and-drop image onto AI prompt box. Paste from clipboard (Cmd+V). Upload button. |
| **Use Cases** | "Make my hero section look like this [screenshot]", "Match this color palette [photo]", "Use this layout structure [wireframe photo]" |
| **Processing** | Vision model (GPT-4o / Claude) analyzes image → extracts layout structure, colors, typography → generates corresponding design tokens and AST |

### Website URL Import
| Property | Specification |
|:---|:---|
| **Purpose** | Clone the design language of any existing website |
| **Input** | Paste URL into AI prompt or dedicated "Import" flow |
| **Processing** | Headless browser captures full-page screenshot + extracts computed styles (colors, fonts, spacing) + DOM structure |
| **Output** | Design token set derived from target site + structural AST layout. NOT a pixel-perfect copy — a "structural homage" using extracted design patterns. |
| **Legal** | Disclaimer: "This generates an original design inspired by the referenced URL. No copyrighted content is copied." |

### Figma Import
| Property | Specification |
|:---|:---|
| **Purpose** | Convert Figma designs directly to editable canvas projects |
| **Input** | Figma file URL or plugin-based export |
| **Processing** | Figma API → extract frames, auto-layout, styles, components → AST compiler → canvas components |
| **Fidelity** | Auto-Layout frames → Flexbox/Grid. Figma color styles → design tokens. Figma text styles → typography tokens. Variants → React component props. |
| **Phase** | P1 (v1.0). Plugin beta in MVP. |

### AI Undo / History
| Property | Specification |
|:---|:---|
| **Purpose** | Granular undo specifically for AI operations |
| **Implementation** | Every AI edit creates a named checkpoint: "AI: Made pricing card glassmorphic (14:32)". Standard Cmd+Z undoes the entire AI operation atomically. |
| **History Panel** | Timeline view showing all edits (manual and AI) with visual thumbnails. Click any point to restore. Branch from any point. |
| **Retention** | Last 100 operations per session. Full history persisted for 30 days. |

### AI Memory & Preferences
| Property | Specification |
|:---|:---|
| **Project Memory** | AI remembers: brand voice, previously rejected suggestions, common editing patterns, custom component names |
| **User Preferences** | Cross-project preferences: preferred code style (semicolons, quotes), component naming convention, default responsive behavior |
| **Explicit Instructions** | Users can add permanent instructions: "Always use Inter font. Never use gradients. Our brand voice is professional but warm." |
| **Memory Management** | Settings page where users can view, edit, and delete stored AI memories |

### AI Suggestions
| Property | Specification |
|:---|:---|
| **Proactive Suggestions** | AI surfaces actionable suggestions based on current page state: "This page has no meta description. Generate one?" / "The CTA button contrast ratio is 3.8:1. WCAG AA requires 4.5:1. Auto-fix?" |
| **Suggestion Display** | Subtle floating chips near relevant elements. Non-intrusive. Dismissable. |
| **Frequency Control** | Settings: "Show AI suggestions" → Always / Sometimes / Never |

### AI Explainability
| Property | Specification |
|:---|:---|
| **Change Summary** | Every AI edit includes a human-readable summary: "Changed 3 properties on `.hero-title`: font-size 48px→56px, line-height 1.1→1.15, color text.primary→accent.primary" |
| **Reasoning** | Optional expandable section: "Reasoning: Increased font size for better visual hierarchy. Adjusted line-height proportionally. Applied accent color to draw attention to headline." |
| **Code Diff** | Standard unified diff view showing exact code changes. Syntax highlighted. Copy-able. |

### Multi-Agent Interaction (Transparent to User)
| Property | Specification |
|:---|:---|
| **User Experience** | Users interact with a SINGLE AI interface. Multi-agent orchestration happens behind the scenes. |
| **Progress Indicators** | During complex operations, show pipeline stages: "Analyzing structure... → Generating layout... → Applying brand tokens... → Running accessibility check..." |
| **Agent Visibility** | Optional "Developer Mode" toggle shows which agent handled which part of the generation, with individual latency metrics. |

---

# PART 9 — WORKSPACE ARCHITECTURE

## 9.1 Information Hierarchy

```mermaid
graph TD
    Org[Organization / Workspace] --> Team1[Team A]
    Org --> Team2[Team B]
    
    Team1 --> P1[Project: Marketing Site]
    Team1 --> P2[Project: Documentation]
    
    P1 --> Pages1[Pages]
    P1 --> Comp1[Components]
    P1 --> Assets1[Assets]
    P1 --> Tokens1[Design Tokens]
    P1 --> Deploy1[Deployments]
    
    Pages1 --> Home[/ - Home]
    Pages1 --> Features[/features]
    Pages1 --> Pricing[/pricing]
    Pages1 --> Blog[/blog]
    Pages1 --> BlogPost[/blog/[slug]]
    
    Comp1 --> Navbar[Navbar]
    Comp1 --> Footer[Footer]
    Comp1 --> PricingCard[PricingCard]
    Comp1 --> HeroSection[HeroSection]
    
    Assets1 --> Images[Images]
    Assets1 --> Icons[Icons]
    Assets1 --> Videos[Videos]
```

## 9.2 Entity Definitions

### Organization / Workspace
- **Contains:** Teams, Members, Billing, Global Settings, Shared Libraries
- **Limits:** Free: 1 workspace. Pro: 3. Agency: 10. Enterprise: Unlimited.
- **Permissions:** Owner, Admin, Member, Billing Admin

### Team
- **Purpose:** Group members working on related projects
- **Contains:** Projects, Team-level permissions
- **Permissions:** Team Admin, Editor, Viewer

### Project
- **Backing:** Every project is a Git repository (internal or linked to GitHub/GitLab)
- **Contains:** Pages, Components, Assets, Design Tokens, Deployment Config, Settings
- **Metadata:** Name, description, favicon, OG image, SEO defaults, custom domain
- **Branching:** Projects support Git-like branches. Default: `main`. AI edits can target `ai-draft` branch.

### Page
- **Structure:** Next.js App Router compatible. Each page = a route segment.
- **File:** Maps to `app/[route]/page.tsx` in exported code
- **Properties:** URL path, title, meta description, OG tags, layout (which layout component wraps it)
- **Special Pages:** Layout (shared wrapper), Loading (loading.tsx), Error (error.tsx), Not Found (not-found.tsx)

### Component
- **Definition:** A reusable React component with props, variants, and design-token-governed styling
- **Types:** Layout components (Header, Footer, Sidebar), Content components (HeroSection, FeatureGrid, PricingTable), Primitive components (Button, Input, Card)
- **Props System:** Typed props with default values. Variants mapped to design tokens. Editable in both visual Properties panel and code.
- **Instances vs. Source:** Editing a component instance on a page edits that instance. Editing the source component updates ALL instances.

### Asset
- **Types:** Image (JPEG, PNG, WebP, AVIF, SVG), Video (MP4, WebM), Font (WOFF2), Document (PDF)
- **Auto-Processing:** Images auto-converted to WebP + AVIF. Responsive srcset generated (640, 768, 1024, 1280, 1536px widths). Lazy loading applied by default.
- **Storage:** Cloudflare R2 with edge caching. CDN URLs for all assets.
- **Organization:** Folders, tags, search by name/type/usage

### Design Tokens
- **Format:** JSON following W3C Design Tokens specification draft
- **Categories:** Colors, Typography, Spacing, Radii, Shadows, Motion, Breakpoints
- **Versioning:** SemVer. Breaking changes require explicit migration.
- **Enforcement:** All AI generation and visual editing must output values referencing tokens, never raw values.

### Version History
- **Granularity:** Every save creates a checkpoint. AI edits create named checkpoints.
- **Storage:** Last 100 checkpoints stored for free tier. Unlimited for Pro+.
- **Restore:** Click any checkpoint to preview. "Restore" reverts project to that state. "Branch from here" creates a new branch from that point.
- **Diff:** Visual diff (overlay screenshots) + code diff (unified git diff format)

### Deployment
- **Environments:** Staging (auto, *.dios.app), Production (custom domain, requires promotion)
- **Build:** Automatic Next.js static/ISR export + image optimization + CSS purge + minification
- **Infrastructure:** Cloudflare Workers + R2 + KV (edge state)
- **Rollback:** Any previous production deployment can be rolled back with 1 click

### Permissions Model (RBAC)

| Role | View Projects | Edit Canvas | Edit Code | Edit Tokens | Deploy Staging | Deploy Production | Manage Members | Billing |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Owner** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Editor** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Designer** | ✅ | ✅ | 👁️ View | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Copywriter** | ✅ | ✅ Text Only | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Client Reviewer** | ✅ | ✅ Text+Images | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Viewer** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Collaboration
- **Presence:** Real-time cursors showing who is viewing/editing what (Figma-style)
- **Comments:** Pinned to specific DOM elements. Thread-based. Resolvable. Mentionable (@user).
- **Review Flow:** Designer submits for review → Reviewer sees changes + comments → Approves or requests changes → On approval, editor can deploy.
- **Conflict Resolution:** When two users edit the same element simultaneously, last-write-wins with undo history preserving both versions.

---

# PART 10 — COMPLETE DESIGN TOKEN SPECIFICATION

## 10.1 Token JSON Schema (W3C Draft Compatible)

```json
{
  "$schema": "https://design-tokens.org/schema.json",
  "version": "1.0.0",
  "color": {
    "bg": {
      "primary": { "$value": "#0A0A0B", "$type": "color", "$description": "App background" },
      "secondary": { "$value": "#111113", "$type": "color" },
      "tertiary": { "$value": "#1A1A1E", "$type": "color" },
      "elevated": { "$value": "#222226", "$type": "color" },
      "surface": { "$value": "#2A2A2F", "$type": "color" }
    },
    "text": {
      "primary": { "$value": "#EDEDEF", "$type": "color" },
      "secondary": { "$value": "#A0A0A8", "$type": "color" },
      "tertiary": { "$value": "#6E6E78", "$type": "color" }
    },
    "accent": {
      "primary": { "$value": "#6366F1", "$type": "color" },
      "primary-hover": { "$value": "#818CF8", "$type": "color" },
      "secondary": { "$value": "#8B5CF6", "$type": "color" }
    },
    "semantic": {
      "success": { "$value": "#22C55E", "$type": "color" },
      "warning": { "$value": "#F59E0B", "$type": "color" },
      "error": { "$value": "#EF4444", "$type": "color" },
      "info": { "$value": "#3B82F6", "$type": "color" }
    }
  },
  "typography": {
    "font-family": {
      "sans": { "$value": "Inter, system-ui, sans-serif", "$type": "fontFamily" },
      "display": { "$value": "Geist, Inter, system-ui, sans-serif", "$type": "fontFamily" },
      "mono": { "$value": "Geist Mono, JetBrains Mono, monospace", "$type": "fontFamily" }
    },
    "scale": {
      "display": { "$value": "3rem", "$type": "dimension" },
      "h1": { "$value": "2rem", "$type": "dimension" },
      "h2": { "$value": "1.5rem", "$type": "dimension" },
      "h3": { "$value": "1.25rem", "$type": "dimension" },
      "body": { "$value": "0.9375rem", "$type": "dimension" },
      "body-sm": { "$value": "0.8125rem", "$type": "dimension" },
      "caption": { "$value": "0.6875rem", "$type": "dimension" }
    }
  },
  "spacing": {
    "1": { "$value": "4px", "$type": "dimension" },
    "2": { "$value": "8px", "$type": "dimension" },
    "3": { "$value": "12px", "$type": "dimension" },
    "4": { "$value": "16px", "$type": "dimension" },
    "6": { "$value": "24px", "$type": "dimension" },
    "8": { "$value": "32px", "$type": "dimension" },
    "12": { "$value": "48px", "$type": "dimension" },
    "16": { "$value": "64px", "$type": "dimension" },
    "24": { "$value": "96px", "$type": "dimension" }
  },
  "radius": {
    "sm": { "$value": "4px", "$type": "dimension" },
    "md": { "$value": "8px", "$type": "dimension" },
    "lg": { "$value": "12px", "$type": "dimension" },
    "xl": { "$value": "16px", "$type": "dimension" },
    "full": { "$value": "9999px", "$type": "dimension" }
  }
}
```

## 10.2 Token-to-Tailwind Compilation

Tokens compile to Tailwind CSS theme extension:

```javascript
// tailwind.config.ts (auto-generated from tokens.json)
export default {
  theme: {
    extend: {
      colors: {
        bg: { primary: '#0A0A0B', secondary: '#111113', tertiary: '#1A1A1E' },
        text: { primary: '#EDEDEF', secondary: '#A0A0A8', tertiary: '#6E6E78' },
        accent: { primary: '#6366F1', 'primary-hover': '#818CF8', secondary: '#8B5CF6' },
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: { sans: ['Inter', 'system-ui'], display: ['Geist', 'Inter'], mono: ['Geist Mono'] },
      borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px' },
      spacing: { 1: '4px', 2: '8px', 3: '12px', 4: '16px', 6: '24px', 8: '32px' },
    }
  }
}
```

**Auto-Generation Rule:** When any token value changes in the Brand Studio or Token Manager, the system automatically regenerates `tailwind.config.ts`, CSS custom properties, and notifies all components of the change via reactive state management.

---

*— End of Part 4 (Product Bible V2) —*
*Continue to Part 5: Accessibility, Performance, Collaboration & Enterprise*
