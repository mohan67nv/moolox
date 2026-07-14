# FOUNDER RESEARCH BIBLE — PART 1
## Industry Research & Competitor Deep-Dive
**Document:** 2 of 4 | **Series:** Founder Research Bible  
**Classification:** Evidence-Based Strategic Research

---

# PART 1 — INDUSTRY RESEARCH

## 1.1 Market Taxonomy & Size

| Category | Global Market Size (2025 Est.) | CAGR (2025–2030) | Key Evidence Source |
|:---|:---|:---|:---|
| **Website Builders** | $15.8B | 8.2% | Grand View Research 2024 |
| **No-Code Platforms** | $21.2B | 28.5% | Gartner "Citizen Developer" forecast |
| **Low-Code Platforms** | $32.6B | 23.4% | Forrester Wave Low-Code 2024 |
| **CMS (Total)** | $18.3B | 11.7% | MarketsandMarkets |
| **AI Coding Tools** | $5.2B | 42.1% | Pitchbook AI Developer Tools Q4 2024 |
| **Design Tools (Digital)** | $12.7B | 14.3% | Statista Digital Design Software |
| **Landing Page / CRO** | $3.8B | 18.9% | Allied Market Research |
| **AI Design Tools** | $1.9B | 38.7% | CB Insights Emerging Tech |
| **TOTAL ADDRESSABLE** | **~$111.5B** | **~19% blended** | Composite estimate |

> **Evidence vs. Assumption:** Market sizes are sourced from named analyst firms. The composite TAM is an analytical aggregation and should be validated with primary research before investor presentations.

---

## 1.2 Category Deep-Dives

### A. AI Website Builders (Emerging — $2.1B, CAGR ~45%)

**Major Players:** Lovable, Bolt.new, v0 (Vercel), Dora AI, Framer AI, Wix ADI, Hostinger AI Builder

**Technology Shifts:**
- LLM context windows expanding from 8k → 200k+ tokens enables full-site architectural awareness
- WebContainer/Sandpack technology allows full Node.js execution in-browser (StackBlitz patent)
- Structured JSON output from LLMs enables AST-level code generation vs. raw text blobs
- Multi-agent orchestration replacing single-prompt generation

**Key Risks:**
- Commoditization: Every platform bolting on AI features as checkbox marketing
- Model dependency: Heavy reliance on 2-3 LLM providers (Anthropic, OpenAI)
- Quality ceiling: LLMs still hallucinate CSS, break responsive layouts, lose context on large codebases

### B. Traditional Website Builders ($15.8B, CAGR 8.2%)

**Major Players:** Wix (public, ~$7B market cap), Squarespace (private, $6.9B LBO), WordPress.com (Automattic, $7.5B valuation), Webflow ($4B valuation)

**Structural Trend:** Market is bifurcating:
1. **Downmarket:** Wix/Squarespace commoditizing basic sites toward free or very low cost
2. **Upmarket:** Webflow/Framer targeting professional designers and agencies at premium prices

**Evidence:** Wix reported 260M+ registered users but ARPU declining YoY as free tier expands. Webflow reported $100M+ ARR in 2023 with average contract value increasing 34% YoY, confirming upmarket pull.

### C. No-Code / Low-Code ($53.8B combined, CAGR ~25%)

**Critical Insight:** Gartner predicts 70% of new applications will use low-code/no-code by 2028 (up from 25% in 2023). This is the macro-tailwind for our entire thesis.

**Risk:** Enterprise buyers increasingly demanding that no-code tools produce auditable, exportable code — pure visual-only builders face "glass ceiling" at enterprise scale.

### D. AI Coding Tools ($5.2B, CAGR 42.1%)

**Major Players:** GitHub Copilot (~1.8M paid subscribers), Cursor (~$100M ARR, fastest-growing dev tool ever), Replit, Codeium, Tabnine

**Critical Observation:** Cursor proved that developers will pay $20-40/mo for AI-augmented coding. But these tools are IDE-centric — they require existing developer skills. The gap between "AI-assisted coding" and "AI-complete website generation" remains enormous.

### E. Design Tools ($12.7B, CAGR 14.3%)

**Major Players:** Figma ($12.5B acquisition by Adobe, blocked, now independent at ~$10B valuation), Canva ($26B valuation, 190M+ MAU), Adobe Creative Cloud ($14B+ ARR)

**Key Trend:** Design-to-code remains the most requested workflow. Figma Dev Mode launched 2023 but generates CSS snippets, not production React components. The gap between "design artifact" and "deployable code" remains the industry's central unsolved problem.

---

## 1.3 Porter's Five Forces Analysis

| Force | Intensity | Analysis |
|:---|:---|:---|
| **Threat of New Entrants** | **HIGH** | Low barriers: any team with LLM API access can build a basic AI site generator in weeks. 50+ YC-funded AI builder startups in 2024-2025 alone. |
| **Supplier Power** | **HIGH** | Critical dependency on 2-3 LLM providers (Anthropic, OpenAI). Pricing changes or API deprecations pose existential risk. Open-source models (Llama, DeepSeek) partially mitigate. |
| **Buyer Power** | **HIGH** | Zero switching costs between AI builders. Users can export code and leave instantly. Loyalty is near-zero in this category. |
| **Threat of Substitutes** | **MEDIUM** | Traditional dev agencies, WordPress + Elementor, manual coding with Cursor/Copilot. These are slower but deeply entrenched. |
| **Competitive Rivalry** | **VERY HIGH** | Webflow ($330M raised), Framer ($30M), Lovable ($15M), Bolt ($20M), v0 (Vercel's $300M+), Wix ($7B public) all competing directly. Red ocean conditions. |

> **Strategic Implication:** Porter's analysis reveals a **brutally competitive** landscape with high supplier dependency. Winning requires building structural moats (network effects, proprietary data, switching costs) that pure AI generation cannot provide alone.

---

## 1.4 Industry SWOT (For a New Entrant)

| | **Positive** | **Negative** |
|:---|:---|:---|
| **Internal** | **Strengths:** Clean-slate architecture; no legacy technical debt; can build AST-native visual engine from day one; opportunity to own the "Visual Canvas + Git Parity" category before incumbents. | **Weaknesses:** Zero brand recognition; zero existing user base; must recruit elite Rust/WASM + LLM engineering talent in hyper-competitive market; 18+ month runway to MVP parity. |
| **External** | **Opportunities:** $111B+ TAM; 70% of apps to be no-code by 2028 (Gartner); design-to-code gap unsolved; agencies desperately seeking margin expansion tools; enterprise demand for auditable AI-generated code. | **Threats:** Vercel could ship visual canvas for v0 in 6 months; Figma could acquire an AI code generator; commoditization race to zero; LLM cost volatility; regulatory uncertainty around AI-generated content/code IP. |

---

# PART 2 — COMPETITOR RESEARCH

## 2.1 Competitor Deep-Dive Profiles

### FRAMER
| Dimension | Detail |
|:---|:---|
| **HQ / Founded** | Amsterdam, 2015 (pivoted from React prototyping library) |
| **Funding** | ~$33M total (Atomico, Accel, Meritech Capital) |
| **Team Size** | ~120 employees |
| **Revenue (Est.)** | ~$40-60M ARR (based on pricing tiers and reported 2M+ sites) |
| **Pricing** | Free tier → Mini $5/mo → Basic $15/mo → Pro $30/mo per site. Enterprise custom. |
| **Core Customers** | SaaS startups (landing pages), indie designers, creative agencies |
| **Positioning** | "The professional website builder" — premium design quality, motion-first |
| **AI Strategy** | AI section/page generator (basic prompt → layout). AI copy rewriting. Limited to initial generation, not iterative editing. |
| **Strengths** | Best-in-class animations/transitions; excellent perceived design quality; fast edge CDN; strong designer community on X/Twitter; low learning curve for designers. |
| **Weaknesses** | **FATAL: Zero code export.** Entire site locked in Framer's proprietary runtime. No Git sync. AI generation is shallow (single-prompt layout, no multi-agent refinement). CMS is rudimentary compared to Webflow. |
| **Enterprise Strategy** | Nascent. No SOC2 certification publicly announced. No RBAC beyond basic team seats. |
| **Missing Capabilities** | Code export, Git sync, design token governance, headless CMS depth, accessibility automation, multi-page AI architecture, A/B testing, analytics |
| **Key Reviews** | G2 4.5/5. Product Hunt #1 multiple times. Top complaint: *"If Framer dies, my website dies with it."* |

### WEBFLOW
| Dimension | Detail |
|:---|:---|
| **HQ / Founded** | San Francisco, 2013 |
| **Funding** | ~$330M total. $120M Series C at $4B valuation (2022). |
| **Team Size** | ~600 employees (peaked at 800+, laid off ~100 in 2023) |
| **Revenue (Est.)** | $150-200M ARR |
| **Pricing** | Site plans: Free → Basic $14/mo → CMS $23/mo → Business $39/mo → Enterprise $239+/mo. Workspace seats separate ($19-49/seat). |
| **Core Customers** | Professional web designers, mid-market marketing teams, agencies |
| **Positioning** | "The visual development platform" — CSS-level control for power designers |
| **AI Strategy** | Webflow AI Assistant (2024): copy generation, basic section suggestions. Acquired Intellimize (2023) for personalization/A/B testing. Still largely bolted-on. |
| **Strengths** | Deepest visual CSS control (Grid, Flexbox); robust CMS with relationships; massive agency partner ecosystem (~3,000 certified partners); enterprise compliance (SOC2). |
| **Weaknesses** | Extremely steep learning curve (30+ hours to proficiency). Legacy engine built on proprietary DOM, not React. No Git sync. AI features superficial. Pricing is complex and expensive at scale. Slow rendering on large DOMs. |
| **Enterprise Strategy** | Most mature: SOC2 Type II, dedicated account managers, custom SLAs, Localization support. |
| **Missing Capabilities** | Git sync, React/Next.js code export, design token system, AI structural generation, in-browser code editing, responsive breakpoint AI optimization |
| **Key Reviews** | G2 4.4/5 (3,000+ reviews). Top complaint: *"Pricing is predatory — CMS item limits, per-seat charges, per-site plans all stack up."* Second: *"Learning curve is brutal. Took me 2 months to feel comfortable."* |

### LOVABLE
| Dimension | Detail |
|:---|:---|
| **HQ / Founded** | Stockholm, 2024 (originally "GPT Engineer") |
| **Funding** | ~$15M (Y Combinator, various angels) |
| **Team Size** | ~40 |
| **Revenue (Est.)** | $5-15M ARR (growing rapidly) |
| **Pricing** | Free tier (limited) → Starter $20/mo → Launch $50/mo → Scale $100/mo → Team $200/mo. Credit-based AI generation. |
| **Core Customers** | Non-technical founders, solo builders, early-stage startups |
| **Positioning** | "The AI full-stack engineer" — build entire apps from prompts |
| **AI Strategy** | Core product IS AI. Full-stack generation: React + Tailwind + Supabase. GitHub sync (one-way push). Conversational iterative editing. |
| **Strengths** | Fastest 0-to-working-app experience; built-in Supabase database integration; GitHub push; genuine full-stack capability (auth, CRUD, API routes). |
| **Weaknesses** | **Context degradation after 15-20 prompts** (the "Prompt #15 Curse"). No visual WYSIWYG canvas. Design quality is generic/template-like. No design token system. Code quality degrades on complex projects. Credit anxiety discourages exploration. |
| **Enterprise Strategy** | None currently. No compliance certifications. |
| **Missing Capabilities** | Visual canvas, design tokens, responsive breakpoint editor, accessibility engine, A/B testing, CMS, multi-page design governance, agency handoff, white-label |
| **Key Reviews** | Product Hunt 4.5/5. X/Twitter sentiment highly positive for speed. Top complaint: *"AI forgets my database schema after too many edits."* *"Designs all look the same — generic Tailwind."* |

### BOLT.NEW (STACKBLITZ)
| Dimension | Detail |
|:---|:---|
| **HQ / Founded** | San Francisco, 2017 (Bolt.new launched 2024) |
| **Funding** | ~$20M (GV/Google Ventures) |
| **Team Size** | ~50 |
| **Revenue (Est.)** | $10-20M ARR (combined StackBlitz + Bolt) |
| **Pricing** | Free tier → Pro $20/mo → Team $30/mo/seat. Token-based AI usage. |
| **Core Customers** | Full-stack developers, rapid prototypers |
| **Positioning** | "AI full-stack development in the browser" |
| **AI Strategy** | AI generates full Node.js/React/Vite apps running in WebContainers (proprietary browser-based runtime). |
| **Strengths** | Only platform running real Node.js backend in the browser (WebContainers patent). Fastest package resolution. True full-stack execution. |
| **Weaknesses** | Zero visual design tools. Purely code-centric interface. Intimidating for non-developers. Multi-page design governance nonexistent. Code degrades on large projects. |
| **Enterprise Strategy** | StackBlitz has some enterprise traction for documentation/sandboxing. Bolt.new itself has no enterprise features. |
| **Missing Capabilities** | Visual canvas, design system, responsive design tools, CMS, deployment pipeline, agency features, branding tools, analytics, SEO tools |

### V0 (VERCEL)
| Dimension | Detail |
|:---|:---|
| **HQ / Founded** | San Francisco. v0 launched 2023. Vercel founded 2015. |
| **Funding** | Vercel: $313M total at $3.2B valuation |
| **Team Size** | Vercel: ~450. v0 team estimated at 15-25 |
| **Revenue (Est.)** | v0 revenue undisclosed. Vercel ~$100M+ ARR |
| **Pricing** | v0: Free tier → Premium $20/mo (increased generation limits) |
| **Core Customers** | React/Next.js frontend engineers, shadcn/ui users |
| **Positioning** | "AI-powered UI component generator" — best-in-class isolated component quality |
| **AI Strategy** | Fine-tuned models on shadcn/ui + Tailwind CSS component library. Generates isolated React components from prompts. Recently added multi-file project generation. |
| **Strengths** | Highest fidelity component design quality in the market. Clean, production-grade JSX + Tailwind. Seamless Vercel deployment. Backed by Next.js creator (Guillermo Rauch). |
| **Weaknesses** | **Not a website builder.** Generates components, not sites. No visual canvas. No multi-page routing governance. No CMS. No design token system beyond shadcn defaults. Cannot manage site-wide consistency. |
| **Enterprise Strategy** | Through Vercel Enterprise (separate product). v0 itself is consumer/prosumer. |
| **Missing Capabilities** | Full site generation, visual canvas, multi-page management, CMS, design tokens, responsive editor, deployment dashboard, agency features, Git bidirectional sync |

### DORA AI
| Dimension | Detail |
|:---|:---|
| **HQ / Founded** | San Francisco, 2022 |
| **Funding** | ~$5.5M seed |
| **Team Size** | ~15-20 |
| **Pricing** | Free → Pro $12/mo → Business $36/mo |
| **Positioning** | "AI-powered 3D interactive website builder" |
| **Strengths** | Exceptional 3D/WebGL animation capabilities; AI generates animated sites from prompts; unique visual differentiation. |
| **Weaknesses** | Very small team; limited CMS; no code export; niche positioning (3D-heavy sites); limited enterprise features; small user base. |
| **Missing Capabilities** | Code export, Git sync, design tokens, CMS depth, team collaboration, enterprise compliance, accessibility tools |

### WIX STUDIO
| Dimension | Detail |
|:---|:---|
| **HQ / Founded** | Tel Aviv, 2006 (Wix Studio rebrand 2023) |
| **Funding** | Public company (NASDAQ: WIX). ~$7B market cap. |
| **Revenue** | $1.7B+ total revenue (2024). Wix Studio subset undisclosed. |
| **Team Size** | ~5,000 total |
| **Pricing** | $17-159/mo per site |
| **Strengths** | All-in-one ecosystem (payments, booking, CRM, email marketing); massive scale (260M+ accounts); strong SMB tooling. |
| **Weaknesses** | Terrible code quality and DOM output. Awful mobile Core Web Vitals (avg Lighthouse 45-65). Heavy JavaScript runtime. Perceived as "unprofessional" by designers. AI features are generic template shuffling. |
| **Missing Capabilities** | Clean code output, design tokens, Git integration, developer tooling, performance optimization, professional design credibility |

### SQUARESPACE
| Dimension | Detail |
|:---|:---|
| **HQ / Founded** | New York, 2003. Taken private 2024 ($6.9B LBO by Permira). |
| **Revenue** | ~$950M (2023, pre-private) |
| **Strengths** | Beautiful default templates; strong brand among creatives/artists; integrated e-commerce; domain registrar. |
| **Weaknesses** | Closed ecosystem; limited customization; no AI strategy of substance; no developer tools; declining relevance among tech-forward users. |

### CANVA
| Dimension | Detail |
|:---|:---|
| **HQ / Founded** | Sydney, 2012 |
| **Funding** | $572M raised. Valued at $26B (2024). |
| **Revenue** | ~$2.3B ARR (2024) |
| **Team Size** | ~4,500 |
| **Strengths** | 190M+ MAU; brand recognition; acquired Affinity (vector/photo/publishing suite); Magic Studio AI; enterprise traction (Teams/Enterprise plans). |
| **Weaknesses** | Canva Websites are extremely basic — essentially image-based pages, not responsive HTML/CSS. No developer workflow. No code. Not a serious web platform. |
| **Relevance** | Canva is a design tool expanding into websites, not a website builder expanding into design. Overlap is at the very low end (personal blogs, simple portfolios). |

### FIGMA
| Dimension | Detail |
|:---|:---|
| **HQ / Founded** | San Francisco, 2016 |
| **Valuation** | ~$12.5B (post-failed Adobe acquisition) |
| **Revenue** | ~$600M+ ARR (2024 est.) |
| **Team Size** | ~1,500 |
| **Strengths** | Industry standard for UI design; multiplayer collaboration; Dev Mode; massive plugin ecosystem; deeply embedded in designer workflows. |
| **Weaknesses** | **Figma is a design tool, NOT a website builder.** Dev Mode exports CSS snippets, not production components. The "Figma-to-code" gap is the #1 complained-about workflow in the industry. No hosting. No CMS. No deployment. |
| **AI Strategy** | "Make Designs" AI (2024) — generates UI layouts from prompts within Figma. Currently basic. |
| **Strategic Threat Level** | **HIGH.** If Figma ships a production-grade code export + hosting pipeline, it threatens every visual builder. However, Figma's DNA is design collaboration, not engineering deployment. |

### REPLIT
| Dimension | Detail |
|:---|:---|
| **HQ / Founded** | San Francisco, 2016 |
| **Funding** | ~$200M at $1.16B valuation |
| **Revenue** | Undisclosed, estimated $30-50M ARR |
| **Strengths** | Full cloud IDE; AI Agent for app building; deployment built-in; strong education market. |
| **Weaknesses** | Not design-focused at all; output quality is functional not premium; performance of deployed apps is mediocre; no visual canvas. |

### CURSOR
| Dimension | Detail |
|:---|:---|
| **HQ / Founded** | San Francisco, 2022 |
| **Funding** | ~$400M at $9B+ valuation (2025) |
| **Revenue** | ~$200M+ ARR (fastest-growing dev tool in history) |
| **Strengths** | Best AI coding assistant; deep codebase understanding; loved by developers; VS Code fork means instant familiarity. |
| **Weaknesses** | **Requires developer skills.** Not accessible to designers, marketers, or non-technical founders. No visual output. No deployment. No design system awareness. |
| **Relevance** | Cursor is a developer productivity tool, not a website builder. However, many users ARE using Cursor to build websites manually. Our platform could capture these users with a visual layer. |

---

## 2.2 Comprehensive Comparison Matrix

| Feature / Capability | Framer | Webflow | Lovable | Bolt.new | v0 | Dora | Wix Studio | Cursor |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Visual WYSIWYG Canvas** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| **AI Site Generation** | ⚠️ Basic | ⚠️ Basic | ✅ | ✅ | ⚠️ Components | ✅ | ⚠️ Basic | ❌ |
| **Clean Code Export** | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Git Sync (Two-Way)** | ❌ | ❌ | ⚠️ One-way | ⚠️ One-way | ❌ | ❌ | ❌ | ✅ Native |
| **Design Token System** | ❌ | ⚠️ Variables | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Responsive Breakpoints** | ✅ | ✅ | ⚠️ Auto | ⚠️ Auto | ❌ | ✅ | ✅ | N/A |
| **CMS / Database** | ⚠️ Basic | ✅ | ✅ Supabase | ⚠️ Basic | ❌ | ⚠️ Basic | ✅ | N/A |
| **Edge Deployment** | ✅ | ✅ | ✅ | ✅ | ✅ Vercel | ✅ | ✅ | ❌ |
| **Accessibility Auto-Fix** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **A/B Testing Native** | ❌ | ⚠️ Intellimize | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Agency White-Label** | ❌ | ⚠️ Limited | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Enterprise Compliance** | ❌ | ✅ SOC2 | ❌ | ❌ | ✅ Via Vercel | ❌ | ⚠️ | ❌ |
| **Animations / Motion** | ✅ Best | ⚠️ Interactions | ❌ | ❌ | ❌ | ✅ 3D | ⚠️ Basic | N/A |
| **Multi-Agent AI** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Design-to-Code Parity** | ❌ | ❌ | N/A | N/A | N/A | ❌ | ❌ | N/A |

> **Key Finding:** No single competitor offers the combination of Visual Canvas + Clean Code Export + Git Sync + Design Tokens + AI Generation. This intersection is the strategic white space.

---

## 2.3 Competitor Funding & Valuation Landscape

| Company | Total Raised | Last Valuation | Revenue (Est.) | Rev Multiple | Stage |
|:---|:---|:---|:---|:---|:---|
| **Wix** | Public | $7.0B mkt cap | $1.7B | 4.1x | Public |
| **Squarespace** | Private (LBO) | $6.9B | $950M | 7.3x | Private |
| **Canva** | $572M | $26B | $2.3B | 11.3x | Late Private |
| **Figma** | $332M | $12.5B | $600M | 20.8x | Late Private |
| **Cursor** | $400M | $9.0B | $200M | 45x | Growth |
| **Webflow** | $330M | $4.0B | $175M | 22.8x | Series C |
| **Vercel** | $313M | $3.2B | $100M | 32x | Series E |
| **Replit** | $200M | $1.16B | $40M | 29x | Series B |
| **Framer** | $33M | ~$400M (est.) | $50M | 8x | Series B |
| **Bolt/StackBlitz** | $20M | ~$150M (est.) | $15M | 10x | Series A |
| **Lovable** | $15M | ~$100M (est.) | $10M | 10x | Series A |
| **Dora** | $5.5M | ~$30M (est.) | $2M | 15x | Seed |

> **Analysis:** AI-native tools (Cursor at 45x, Vercel at 32x) command significantly higher revenue multiples than legacy builders (Wix at 4.1x, Squarespace at 7.3x). This confirms that the market values AI-native architecture and developer-forward positioning at massive premiums.

---

## 2.4 Blue Ocean Strategy Canvas

**Value Curves — Current Competitors vs. Our Proposed Platform:**

| Strategic Factor | Wix | Webflow | Framer | Lovable | v0 | **Ours (Target)** |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| Ease of Use (Non-Technical) | 9 | 4 | 7 | 8 | 3 | **8** |
| Visual Design Quality | 5 | 7 | 9 | 4 | 7 | **9** |
| Code Quality / Export | 1 | 3 | 1 | 7 | 9 | **9** |
| AI Generation Depth | 3 | 2 | 4 | 8 | 7 | **9** |
| Design System Governance | 2 | 4 | 3 | 1 | 2 | **10** |
| Git / Developer Workflow | 1 | 1 | 1 | 5 | 3 | **9** |
| Performance (Core Web Vitals) | 3 | 6 | 8 | 6 | 8 | **9** |
| Enterprise Readiness | 4 | 7 | 2 | 1 | 6 | **7** |
| Agency / Team Workflows | 3 | 6 | 3 | 2 | 1 | **8** |
| Conversion Optimization | 2 | 4 | 2 | 1 | 1 | **8** |

**Blue Ocean Insight:** The highest-value unexplored territory lies in the upper-right quadrant of **"Design System Governance + Git Developer Workflow + AI Generation Depth."** No competitor scores above 5 on all three simultaneously. Our platform targets 9+ on all three.

*— End of Part 1 —*
*Continue to Part 2: User Research & Customer Psychology*
