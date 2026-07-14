# PRODUCT BIBLE V2 — PART 3
## Design System & Component Library
**Document:** 3.3 of 3.6 | **Series:** Product Bible V2

---

# PART 6 — DESIGN SYSTEM

## 6.1 Design Language: "Obsidian"

Named **Obsidian** — a design language inspired by the precision of Linear, the warmth of Stripe, and the spatial clarity of Figma.

### Typography System

| Token Name | Font | Weight | Size | Line Height | Letter Spacing | Usage |
|:---|:---|:---:|:---:|:---:|:---:|:---|
| `type.display` | Geist / Inter | 600 | 48px / 3rem | 1.1 | -0.02em | Hero headings, marketing pages |
| `type.h1` | Geist / Inter | 600 | 32px / 2rem | 1.2 | -0.015em | Page titles |
| `type.h2` | Geist / Inter | 600 | 24px / 1.5rem | 1.25 | -0.01em | Section headings |
| `type.h3` | Geist / Inter | 600 | 20px / 1.25rem | 1.3 | -0.005em | Subsection headings |
| `type.h4` | Geist / Inter | 500 | 16px / 1rem | 1.4 | 0 | Card titles, labels |
| `type.body` | Inter | 400 | 15px / 0.9375rem | 1.6 | 0 | Body text, descriptions |
| `type.body-sm` | Inter | 400 | 13px / 0.8125rem | 1.5 | 0 | Secondary text, captions |
| `type.caption` | Inter | 400 | 11px / 0.6875rem | 1.4 | 0.01em | Labels, badges, metadata |
| `type.code` | Geist Mono / JetBrains Mono | 400 | 13px / 0.8125rem | 1.6 | 0 | Code blocks, terminal |

**Type Scale Ratio:** 1.2 (Minor Third) — Tight enough for information density, spaced enough for readability.

### Color System

#### Dark Mode (Primary)

| Token | Hex | HSL | Usage |
|:---|:---|:---|:---|
| `bg.primary` | `#0A0A0B` | 240° 7% 3% | App background, canvas background |
| `bg.secondary` | `#111113` | 240° 6% 7% | Sidebar, panel backgrounds |
| `bg.tertiary` | `#1A1A1E` | 240° 5% 11% | Card backgrounds, hover states |
| `bg.elevated` | `#222226` | 240° 4% 14% | Dropdown menus, modal backgrounds |
| `bg.surface` | `#2A2A2F` | 240° 4% 17% | Input fields, interactive surfaces |
| `border.subtle` | `#2E2E33` | 240° 4% 19% | Subtle dividers, card borders |
| `border.default` | `#3A3A40` | 240° 4% 24% | Standard borders, separators |
| `border.strong` | `#4A4A52` | 240° 4% 30% | Focus rings, active borders |
| `text.primary` | `#EDEDEF` | 240° 5% 93% | Primary text, headings |
| `text.secondary` | `#A0A0A8` | 240° 4% 65% | Secondary text, descriptions |
| `text.tertiary` | `#6E6E78` | 240° 4% 45% | Placeholder text, disabled text |
| `accent.primary` | `#6366F1` | 239° 84% 67% | Primary actions, links, active states |
| `accent.primary-hover` | `#818CF8` | 239° 91% 77% | Hover on primary elements |
| `accent.secondary` | `#8B5CF6` | 258° 89% 66% | AI-related actions, generation indicators |
| `success` | `#22C55E` | 142° 71% 45% | Success states, confirmations |
| `warning` | `#F59E0B` | 38° 92% 50% | Warnings, caution states |
| `error` | `#EF4444` | 0° 84% 60% | Errors, destructive actions |
| `info` | `#3B82F6` | 217° 91% 60% | Information, tooltips |

#### Light Mode

| Token | Hex | Usage |
|:---|:---|:---|
| `bg.primary` | `#FFFFFF` | App background |
| `bg.secondary` | `#FAFAFA` | Sidebar, panels |
| `bg.tertiary` | `#F5F5F5` | Cards, hover |
| `bg.elevated` | `#FFFFFF` | Dropdowns, modals (with shadow) |
| `border.subtle` | `#E5E5E5` | Subtle dividers |
| `border.default` | `#D4D4D4` | Standard borders |
| `text.primary` | `#171717` | Primary text |
| `text.secondary` | `#525252` | Secondary text |
| `text.tertiary` | `#A3A3A3` | Placeholder |
| `accent.primary` | `#4F46E5` | Primary actions (darker for contrast) |

### Spacing System

**Base unit: 4px.** All spacing values are multiples of 4.

| Token | Value | Usage |
|:---|:---|:---|
| `space.0` | 0px | Reset |
| `space.1` | 4px | Tight inline gaps, icon-to-text |
| `space.2` | 8px | Compact element spacing |
| `space.3` | 12px | Default inner padding (small components) |
| `space.4` | 16px | Standard padding, form field height |
| `space.5` | 20px | Medium spacing |
| `space.6` | 24px | Section inner padding |
| `space.8` | 32px | Large spacing, card padding |
| `space.10` | 40px | Section gaps |
| `space.12` | 48px | Major section spacing |
| `space.16` | 64px | Page section breaks |
| `space.20` | 80px | Hero section padding |
| `space.24` | 96px | Marketing page section gaps |

### Border Radius

| Token | Value | Usage |
|:---|:---|:---|
| `radius.none` | 0px | Sharp corners (tables, code blocks) |
| `radius.sm` | 4px | Badges, tags, small chips |
| `radius.md` | 8px | Buttons, inputs, cards |
| `radius.lg` | 12px | Modals, dropdowns, panels |
| `radius.xl` | 16px | Large cards, hero sections |
| `radius.2xl` | 24px | Floating action buttons, pills |
| `radius.full` | 9999px | Avatars, circular icons |

### Elevation (Shadows)

| Token | Value | Usage |
|:---|:---|:---|
| `shadow.xs` | `0 1px 2px rgba(0,0,0,0.3)` | Subtle card lift |
| `shadow.sm` | `0 2px 4px rgba(0,0,0,0.3)` | Buttons, small cards |
| `shadow.md` | `0 4px 8px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)` | Dropdowns, popovers |
| `shadow.lg` | `0 8px 24px rgba(0,0,0,0.4)` | Modals, dialogs |
| `shadow.xl` | `0 16px 48px rgba(0,0,0,0.5)` | Command palette, overlay panels |
| `shadow.glow` | `0 0 20px rgba(99,102,241,0.15)` | AI-active elements, accent highlights |

### Motion System

| Token | Duration | Easing | Usage |
|:---|:---|:---|:---|
| `motion.instant` | 0ms | — | Immediate state changes (checkbox toggle) |
| `motion.fast` | 100ms | `ease-out` | Hover effects, button press |
| `motion.normal` | 200ms | `ease-in-out` | Panel transitions, dropdown open |
| `motion.slow` | 300ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Modal open/close, page transitions |
| `motion.spring` | 400ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Drag-and-drop, canvas element reorder |
| `motion.gentle` | 500ms | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Accordion expand, AI streaming entry |

**Reduced Motion:** When `prefers-reduced-motion: reduce` is active, all durations collapse to `0ms` or `motion.fast`. No spring/bounce effects. Content changes are instant.

### Responsive Breakpoints

| Token | Value | Target |
|:---|:---|:---|
| `screen.sm` | 640px | Large phones (landscape) |
| `screen.md` | 768px | Tablets (portrait) |
| `screen.lg` | 1024px | Tablets (landscape), small laptops |
| `screen.xl` | 1280px | Laptops, desktops |
| `screen.2xl` | 1536px | Large desktops, ultrawide |

### Glass / Frosted Effects

| Token | Value | Usage |
|:---|:---|:---|
| `glass.bg` | `rgba(17, 17, 19, 0.7)` | Floating panels, command palette |
| `glass.blur` | `backdrop-filter: blur(12px)` | Applied with glass.bg |
| `glass.border` | `1px solid rgba(255,255,255,0.06)` | Subtle edge definition on glass surfaces |

### Design Token Naming Convention

```
{category}.{property}.{variant}.{state}

Examples:
  color.bg.primary          → #0A0A0B
  color.text.secondary      → #A0A0A8
  color.accent.primary.hover → #818CF8
  space.4                   → 16px
  radius.md                 → 8px
  shadow.lg                 → 0 8px 24px ...
  motion.normal             → 200ms ease-in-out
  type.h2.size              → 24px
  type.h2.weight            → 600
  type.h2.lineHeight        → 1.25
```

**Versioning:** Tokens follow SemVer. Breaking changes (removing tokens, renaming) increment major. Additions increment minor. Value adjustments increment patch.

---

# PART 7 — COMPONENT LIBRARY

## 7.1 Core Components

### Button
| Property | Specification |
|:---|:---|
| **Variants** | `primary` (filled accent), `secondary` (outlined), `ghost` (text-only), `destructive` (error color), `ai` (gradient accent for AI actions) |
| **Sizes** | `sm` (h-8, text-caption), `md` (h-10, text-body-sm), `lg` (h-12, text-body) |
| **States** | Default, Hover (+bg lightness), Active (scale 0.98), Focus (ring-2 accent), Disabled (opacity 0.5, pointer-events-none), Loading (spinner replaces text) |
| **Accessibility** | `role="button"`, `aria-disabled` when disabled, `aria-busy` when loading, visible focus ring (2px offset), min touch target 44×44px |
| **Animation** | Hover: `motion.fast` bg transition. Active: `transform scale(0.98)` spring. Loading spinner: continuous rotate. |
| **Tokens Used** | `accent.primary`, `radius.md`, `space.3` (padding-x), `shadow.sm` (primary variant), `type.body-sm` |
| **Usage** | Primary CTAs, form submissions, dialog actions, toolbar actions |

### Card
| Property | Specification |
|:---|:---|
| **Variants** | `default` (bg.tertiary, border.subtle), `elevated` (bg.elevated, shadow.md), `glass` (glass.bg + glass.blur), `interactive` (hover lift effect), `ai-highlight` (glow border for AI-generated) |
| **Sizes** | Fluid (adapts to content), `compact` (reduced padding), `spacious` (increased padding) |
| **States** | Default, Hover (translateY(-2px) + shadow increase), Selected (accent border), Dragging (opacity 0.8 + shadow.xl) |
| **Accessibility** | Semantic `<article>` or `<div role="region">`. If clickable, `role="button"` + `tabIndex={0}` + Enter/Space activation. |
| **Animation** | Hover: `motion.normal` translateY + shadow. Selected: `motion.fast` border-color. |
| **Tokens Used** | `bg.tertiary`, `border.subtle`, `radius.lg`, `space.6` (padding), `shadow.xs` |

### Input / Text Field
| Property | Specification |
|:---|:---|
| **Variants** | `default`, `with-icon` (left/right icon slot), `with-addon` (prefix/suffix text), `textarea` (multi-line) |
| **Sizes** | `sm` (h-8), `md` (h-10), `lg` (h-12) |
| **States** | Empty, Filled, Focused (ring-2 accent + border.strong), Error (ring-2 error + error message below), Disabled (opacity 0.5), Read-only (bg.secondary) |
| **Accessibility** | Associated `<label>` (required). `aria-invalid="true"` on error. `aria-describedby` pointing to error/help text. Autocomplete attributes where applicable. |
| **Animation** | Focus: `motion.fast` ring appearance. Error shake: `motion.fast` 4px horizontal oscillation. |
| **Tokens Used** | `bg.surface`, `border.default`, `radius.md`, `type.body`, `text.primary` (value), `text.tertiary` (placeholder) |

### Dialog / Modal
| Property | Specification |
|:---|:---|
| **Variants** | `default` (centered), `sheet` (slide from right), `alert` (centered, smaller), `fullscreen` |
| **Sizes** | `sm` (max-w-md), `md` (max-w-lg), `lg` (max-w-2xl), `full` (max-w-5xl) |
| **States** | Opening (fade + scale from 0.95), Open, Closing (fade + scale to 0.95) |
| **Accessibility** | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to title. Focus trap inside dialog. `Escape` closes. Return focus to trigger element on close. |
| **Animation** | Open: `motion.slow` fade + scale(0.95→1). Close: reverse. Backdrop: `motion.normal` fade. |
| **Tokens Used** | `bg.elevated`, `shadow.xl`, `radius.xl`, `glass.blur` (backdrop) |

### Navigation / Sidebar
| Property | Specification |
|:---|:---|
| **Variants** | `sidebar` (vertical, collapsible), `topbar` (horizontal), `breadcrumb` (path indicator) |
| **States** | Expanded (240px), Collapsed (64px, icons only), Mobile (sheet overlay) |
| **Accessibility** | `<nav aria-label="Main navigation">`. Current page: `aria-current="page"`. Collapsible sections: `aria-expanded`. |
| **Animation** | Collapse: `motion.normal` width transition. Item hover: `motion.fast` bg change. |
| **Tokens Used** | `bg.secondary` (sidebar bg), `accent.primary` (active item), `text.secondary` (inactive items) |

### Command Palette
| Property | Specification |
|:---|:---|
| **Trigger** | `Cmd+P` (navigation) or `Cmd+K` (actions, when not on canvas element) |
| **Layout** | Centered overlay (max-w-xl). Search input at top. Categorized results list below. |
| **Categories** | Pages, Components, Actions, Settings, Recent, AI Commands |
| **States** | Empty (recent items + suggestions), Searching (live filter), No results ("No matches. Try a different search."), Loading (for AI commands) |
| **Accessibility** | `role="combobox"` with `aria-expanded`. Results: `role="listbox"`. Arrow keys navigate. Enter selects. Escape closes. |
| **Animation** | Open: `motion.slow` fade + scale from 0.98. Results: `motion.instant` filter (no animation on list changes). |
| **Tokens Used** | `glass.bg`, `glass.blur`, `shadow.xl`, `radius.xl` |

### Toast / Notification
| Property | Specification |
|:---|:---|
| **Variants** | `info` (blue), `success` (green), `warning` (amber), `error` (red), `ai` (purple gradient) |
| **Position** | Bottom-right (stacked, max 3 visible) |
| **Duration** | Info/Success: 4s auto-dismiss. Warning: 6s. Error: Manual dismiss only. |
| **Accessibility** | `role="alert"` for errors. `role="status"` for info/success. `aria-live="polite"`. Dismiss button with `aria-label="Dismiss notification"`. |
| **Animation** | Enter: `motion.spring` slide from right + fade. Exit: `motion.normal` slide right + fade. |

### Table
| Property | Specification |
|:---|:---|
| **Variants** | `default` (striped rows), `compact` (dense padding), `bordered` (full borders) |
| **Features** | Sortable columns (click header), Filterable, Paginated, Selectable rows (checkbox), Resizable columns |
| **States** | Loading (skeleton rows), Empty ("No data found" illustration), Error (retry message) |
| **Accessibility** | Semantic `<table>`, `<thead>`, `<tbody>`. `scope="col"` on headers. Sort: `aria-sort="ascending/descending"`. Selection: `aria-selected`. |
| **Tokens Used** | `bg.primary` (even rows), `bg.secondary` (odd rows), `border.subtle`, `type.body-sm` |

### Skeleton / Loader
| Property | Specification |
|:---|:---|
| **Variants** | `text` (rounded rectangle), `circle` (avatar), `card` (full card shape), `table-row` (row with cells) |
| **Animation** | Shimmer: linear gradient sweep from left to right, 1.5s duration, infinite loop. Uses `motion.gentle` timing. |
| **Accessibility** | `aria-busy="true"` on parent container. `aria-label="Loading content"`. |
| **Reduced Motion** | Shimmer replaced with static 50% opacity placeholder. |

### Code Block
| Property | Specification |
|:---|:---|
| **Features** | Syntax highlighting (Shiki), line numbers, copy button, language indicator, word wrap toggle |
| **Languages** | TypeScript, JavaScript, JSX, TSX, CSS, HTML, JSON, Bash, Python, SQL |
| **Accessibility** | `role="code"`. Copy button: `aria-label="Copy code to clipboard"`. Language: visible label. |
| **Tokens Used** | `bg.secondary`, `radius.lg`, `type.code`, `border.subtle` |

---

*— End of Part 3 (Product Bible V2) —*
*Continue to Part 4: AI Experience, Workspace Architecture & Design Tokens*
