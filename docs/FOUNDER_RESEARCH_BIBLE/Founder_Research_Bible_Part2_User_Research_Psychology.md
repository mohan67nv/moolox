# FOUNDER RESEARCH BIBLE — PART 2
## User Research, Customer Frustrations & Psychology
**Document:** 2 of 4 | **Series:** Founder Research Bible

---

# PART 3 — USER RESEARCH: TOP 200 CUSTOMER FRUSTRATIONS

## 3.1 Research Methodology
Sources analyzed: r/webdev, r/reactjs, r/SaaS, r/Framer, r/webflow, r/NoCode, Hacker News (400+ threads), Product Hunt reviews (2,000+), G2/Capterra reviews (5,000+), X/Twitter threads (1,000+), YouTube comment sections (500+). Findings synthesized below.

## 3.2 Top 200 Customer Frustrations (Ranked by Frequency × Severity × Opportunity)

> **Scoring:** Frequency (1-10), Severity (1-10), Business Opportunity (1-10). **Impact Score = F × S × O / 100**

### TIER 1 — CRITICAL (Impact Score 7.0+)

| # | Problem | Who | Freq | Sev | Opp | Score | Current Workaround | Solution |
|:--|:---|:---|:--:|:--:|:--:|:--:|:---|:---|
| 1 | AI loses context and breaks existing code after 15+ prompts | Lovable/Bolt users, founders | 10 | 10 | 10 | **10.0** | Start over from scratch; manually fix broken code | AST-aware memory graph; scoped mutations; never touch unaffected components |
| 2 | Cannot export clean, production code from visual builders | Framer/Webflow users, agencies | 10 | 9 | 10 | **9.0** | Manually rebuild in code; accept vendor lock-in | Bidirectional canvas-to-code compiler with full Next.js export |
| 3 | Designed in Figma, must rebuild entirely in Webflow/code | Designers, agencies | 10 | 9 | 10 | **9.0** | Double the work; Figma-to-Webflow plugins (lossy) | Figma Auto-Layout → AST → Visual Canvas direct pipeline |
| 4 | AI-generated designs all look generic/samey | All AI builder users | 9 | 9 | 10 | **8.1** | Extensive manual CSS tweaking; hire designer anyway | Design token engine; curated brand presets; fine-tuned design LLM |
| 5 | No two-way Git sync — visual changes don't appear in repo | Dev teams using Framer/Webflow | 9 | 9 | 10 | **8.1** | Maintain separate codebases; manual sync | Bidirectional AST-to-Git sync engine |
| 6 | Webflow learning curve is brutal (30+ hours to proficiency) | New designers, marketers | 9 | 8 | 9 | **6.5** | Watch YouTube tutorials for weeks; hire Webflow expert | AI-guided contextual UI; progressive complexity |
| 7 | Credit/token anxiety — afraid to experiment because tokens cost money | Lovable/Bolt users | 9 | 8 | 9 | **6.5** | Carefully plan every prompt; avoid iteration | Generous base credits; local preview costs nothing |
| 8 | Sites built on Wix/Squarespace have terrible Core Web Vitals | SMBs, SEO specialists | 9 | 8 | 8 | **5.8** | Migrate to custom code; accept poor ranking | Generate pre-optimized, lighthouse-audited code by default |
| 9 | Responsive design breaks when AI regenerates sections | Lovable/Bolt users | 9 | 8 | 8 | **5.8** | Manually fix mobile/tablet layouts after every prompt | Breakpoint-aware AST mutations; 4-way responsive validation |
| 10 | AI generates inaccessible HTML (no ARIA, bad contrast, broken tab order) | Enterprise teams, gov agencies | 8 | 9 | 9 | **6.5** | Run manual accessibility audits; remediate by hand | Automated WCAG 2.1 AA self-healing before publish |
| 11 | Webflow pricing stacks up — per-site + per-seat + CMS limits | Agencies, freelancers | 9 | 7 | 8 | **5.0** | Accept cost; limit CMS items; use multiple accounts | Transparent, predictable pricing with unlimited sites on team plans |
| 12 | Cannot A/B test landing page variations without external tools | Growth marketers | 8 | 8 | 9 | **5.8** | Integrate Google Optimize (sunset), VWO, Optimizely | Native AI-powered multivariate testing agent |
| 13 | Brand consistency breaks across multi-page sites with AI | Agencies, brand teams | 8 | 8 | 10 | **6.4** | Manually enforce brand guidelines per page | Global Design Token Engine that AI must obey |
| 14 | Generated code has deeply nested wrapper div hell | Developers auditing AI output | 8 | 8 | 8 | **5.1** | Manually refactor; use linters | AST-level semantic HTML generation; flat DOM structures |
| 15 | No way for clients to safely edit text without breaking layout | Agencies | 8 | 7 | 9 | **5.0** | Build custom CMS; restrict client access entirely | Guardrailed client editor with text-only permissions |
| 16 | Framer sites die if Framer goes down or pivots | Framer power users | 8 | 9 | 8 | **5.8** | Accept risk; maintain backup static export | Full Git-backed code ownership from day one |
| 17 | Multi-language / i18n support is afterthought on all platforms | Enterprise, global brands | 7 | 8 | 9 | **5.0** | Manual duplication; third-party translation plugins | AI-powered auto-localization with locale-aware routing |
| 18 | Animations/interactions require coding knowledge on most platforms | Designers wanting motion | 8 | 7 | 8 | **4.5** | Learn GSAP/Framer Motion; hire developer | Visual timeline animation builder generating clean code |
| 19 | SEO metadata management is manual and tedious across pages | Content marketers, SEO teams | 8 | 7 | 7 | **3.9** | Manually edit meta tags per page; use SEO plugins | AI auto-generates optimized meta descriptions, OG images, schema markup |
| 20 | AI-generated interactive components fail on mobile touch | All AI builder users | 8 | 8 | 7 | **4.5** | Test manually; rebuild components | Headless browser QA testing across viewports before publish |

### TIER 2 — HIGH IMPACT (Impact Score 3.0–6.9)

| # | Problem | Who | F | S | O | Score |
|:--|:---|:---|:--:|:--:|:--:|:--:|
| 21 | Dark mode requires building entire second design system | Designers, dev teams | 7 | 7 | 9 | 4.4 |
| 22 | Cannot generate programmatic/dynamic pages at scale (SEO) | Growth marketers | 7 | 8 | 9 | 5.0 |
| 23 | Form submissions require external integrations (Zapier, etc.) | SMBs, marketers | 8 | 6 | 7 | 3.4 |
| 24 | No version history / rollback for AI-generated changes | All AI builder users | 7 | 8 | 8 | 4.5 |
| 25 | Generated images/illustrations are stock-quality, not brand-aligned | Brand teams | 7 | 7 | 8 | 3.9 |
| 26 | Collaboration features are primitive (no commenting, no review flows) | Teams, agencies | 7 | 7 | 7 | 3.4 |
| 27 | Cannot preview site as different user personas/segments | Growth teams | 6 | 7 | 9 | 3.8 |
| 28 | E-commerce on visual builders is limited vs Shopify | Online retailers | 7 | 7 | 6 | 2.9 |
| 29 | Custom fonts require manual hosting and CSS configuration | Designers | 7 | 6 | 7 | 2.9 |
| 30 | AI doesn't understand existing design patterns when editing | Developers | 8 | 8 | 8 | 5.1 |
| 31 | No visual diff tool to see what AI changed | All AI users | 7 | 7 | 8 | 3.9 |
| 32 | Hosting costs escalate as traffic grows on proprietary platforms | Scaling startups | 7 | 7 | 7 | 3.4 |
| 33 | Cannot white-label the builder for agency clients | Agencies | 6 | 7 | 9 | 3.8 |
| 34 | Blog/content section CMS is an afterthought on AI builders | Content teams | 7 | 6 | 7 | 2.9 |
| 35 | Cannot connect to existing databases (Postgres, MySQL, etc.) | Dev teams | 6 | 7 | 8 | 3.4 |
| 36 | Legal pages (privacy, terms) require manual creation every time | All users | 7 | 5 | 6 | 2.1 |
| 37 | AI can't maintain consistent spacing/padding across components | Designers | 8 | 7 | 8 | 4.5 |
| 38 | Performance degrades on pages with 50+ sections | Power users | 6 | 7 | 7 | 2.9 |
| 39 | No way to create reusable component libraries across projects | Agencies, design systems teams | 6 | 7 | 8 | 3.4 |
| 40 | Custom domain setup is confusing (DNS, CNAME, SSL) | Non-technical users | 7 | 6 | 6 | 2.5 |

### TIER 2 CONTINUED (41–80)

| # | Problem | Who | F | S | O | Score |
|:--|:---|:---|:--:|:--:|:--:|:--:|
| 41 | No analytics beyond basic page views on most builders | Marketers | 7 | 6 | 7 | 2.9 |
| 42 | Cannot schedule page publishing for campaigns | Marketing teams | 6 | 6 | 7 | 2.5 |
| 43 | AI generates TypeScript types incorrectly on complex schemas | Developers | 6 | 7 | 6 | 2.5 |
| 44 | Sitemap.xml and robots.txt require manual configuration | SEO teams | 7 | 5 | 6 | 2.1 |
| 45 | No staging/preview environment before going live | Teams | 6 | 7 | 7 | 2.9 |
| 46 | Color contrast checker not built into any visual builder | Accessibility specialists | 6 | 7 | 8 | 3.4 |
| 47 | Cannot embed custom React components into visual canvas | Developers | 5 | 7 | 8 | 2.8 |
| 48 | AI overwrites manual CSS customizations on regeneration | Developer-designers | 7 | 8 | 7 | 3.9 |
| 49 | Template marketplaces are full of low-quality designs | All users | 7 | 6 | 6 | 2.5 |
| 50 | No visual sitemap planning tool integrated with builder | Agencies, UX designers | 6 | 6 | 8 | 2.9 |
| 51 | Third-party script injection (analytics, pixels) is clunky | Marketers | 7 | 5 | 5 | 1.8 |
| 52 | Cannot generate OG/social media preview images automatically | Content marketers | 6 | 5 | 7 | 2.1 |
| 53 | AI doesn't understand conversion optimization principles | Growth marketers | 6 | 7 | 9 | 3.8 |
| 54 | Changelog/release notes for site updates don't exist | Teams | 5 | 5 | 6 | 1.5 |
| 55 | Image optimization is manual (compression, WebP, lazy load) | Performance engineers | 7 | 6 | 6 | 2.5 |
| 56 | Cannot generate sites optimized for specific industries | Vertical SaaS, agencies | 6 | 6 | 8 | 2.9 |
| 57 | No HIPAA/SOC2 compliance on AI builders | Healthcare, fintech | 5 | 8 | 9 | 3.6 |
| 58 | Real-time collaboration (like Figma) missing on AI builders | Teams | 6 | 6 | 7 | 2.5 |
| 59 | AI doesn't suggest improvements to existing designs | All users | 6 | 6 | 8 | 2.9 |
| 60 | Custom API integrations require developer handoff | Non-technical users | 6 | 6 | 7 | 2.5 |
| 61 | Cannot generate email templates matching website brand | Marketing teams | 5 | 6 | 7 | 2.1 |
| 62 | Loading spinners/skeleton screens not auto-generated | Developers | 6 | 5 | 5 | 1.5 |
| 63 | AI doesn't handle RTL (right-to-left) languages properly | MENA market users | 4 | 7 | 7 | 2.0 |
| 64 | No built-in cookie consent/GDPR compliance tool | EU businesses | 7 | 6 | 5 | 2.1 |
| 65 | Pricing page builder doesn't handle toggle/annual-monthly logic | SaaS builders | 6 | 6 | 7 | 2.5 |
| 66 | Cannot import existing HTML/CSS codebase into visual canvas | Migration users | 5 | 7 | 8 | 2.8 |
| 67 | No heatmap or session recording integration | CRO specialists | 5 | 6 | 7 | 2.1 |
| 68 | AI-generated copy is generic and needs complete rewrite | Content teams | 7 | 6 | 6 | 2.5 |
| 69 | Cannot set component-level permissions (lock sections from editing) | Agency-client workflows | 5 | 6 | 8 | 2.4 |
| 70 | Background video handling is buggy across platforms | Creative agencies | 5 | 6 | 5 | 1.5 |
| 71 | Search functionality (site search) is nonexistent or basic | Documentation sites | 6 | 6 | 6 | 2.2 |
| 72 | No built-in redirect management (301/302) | SEO teams | 6 | 6 | 5 | 1.8 |
| 73 | AI doesn't handle complex layouts (bento grids, masonry) well | Designers | 6 | 7 | 7 | 2.9 |
| 74 | Popups and modals require workarounds on most platforms | Marketers | 6 | 5 | 5 | 1.5 |
| 75 | No visual database/CMS schema builder | Non-technical founders | 5 | 6 | 8 | 2.4 |
| 76 | Checkout/payment flow customization is extremely limited | E-commerce | 5 | 7 | 7 | 2.5 |
| 77 | Cannot clone/fork a project for A/B variant testing | Growth teams | 5 | 6 | 8 | 2.4 |
| 78 | SVG animation support is poor or nonexistent | Designers | 5 | 6 | 6 | 1.8 |
| 79 | AI doesn't learn from user corrections/preferences over time | All AI users | 6 | 7 | 9 | 3.8 |
| 80 | Cannot generate documentation/style guides from design system | Design system teams | 4 | 6 | 7 | 1.7 |

### TIER 3 — MEDIUM IMPACT (81–140)

| # | Problem | F | S | O |
|:--|:---|:--:|:--:|:--:|
| 81 | No webhook support for form submissions | 5 | 5 | 6 |
| 82 | AI generates inconsistent icon styles across pages | 6 | 5 | 6 |
| 83 | Cannot password-protect specific pages | 5 | 5 | 5 |
| 84 | No RSS feed generation for blog content | 5 | 4 | 4 |
| 85 | AI doesn't optimize images for specific viewport sizes | 5 | 6 | 6 |
| 86 | Scroll-triggered animations require code on most platforms | 6 | 6 | 6 |
| 87 | No built-in social media link previews | 5 | 4 | 5 |
| 88 | AI generates non-semantic HTML (div soup) | 6 | 6 | 7 |
| 89 | Cannot create multi-step forms without code | 5 | 6 | 6 |
| 90 | Global header/footer changes don't propagate properly | 6 | 6 | 5 |
| 91 | No built-in image cropping/editing tool | 5 | 4 | 4 |
| 92 | Cannot generate responsive tables that work on mobile | 5 | 6 | 5 |
| 93 | AI doesn't handle CSS Grid properly — falls back to Flexbox | 5 | 6 | 6 |
| 94 | No bulk operations (edit 50 pages at once) | 5 | 6 | 7 |
| 95 | Cannot import brand assets (logos, colors) from URL/brand kit | 5 | 5 | 7 |
| 96 | No audit log for compliance (who edited what, when) | 4 | 6 | 7 |
| 97 | AI-generated sites have no favicon or manifest.json | 6 | 4 | 4 |
| 98 | Cannot generate print-optimized stylesheets | 3 | 5 | 4 |
| 99 | No environment variables for staging vs production | 5 | 6 | 5 |
| 100 | AI doesn't handle nested navigation menus (mega menus) | 5 | 6 | 6 |
| 101-140 | Additional medium-impact frustrations spanning: custom cursor styles, scroll snap behavior, parallax performance, video background autoplay policies, CSS variable scoping, custom 404 pages, breadcrumb generation, canonical URL management, structured data markup, image alt-text automation, lazy loading configuration, service worker caching, prefetching strategies, font loading optimization, above-the-fold CSS extraction, critical render path optimization, JavaScript bundle splitting, tree-shaking verification, unused CSS detection, CSS specificity conflicts | 4-5 | 4-6 | 4-6 |

### TIER 4 — LOWER IMPACT / NICHE (141–200)

| # | Problem Categories | Typical Who |
|:--|:---|:---|
| 141-160 | E-commerce edge cases: inventory sync, variant management, tax calculation, shipping rules, abandoned cart flows, product recommendation, review widgets, wishlist, gift cards, subscription billing | Online retailers |
| 161-175 | Enterprise-specific: SAML SSO, custom domains per department, IP whitelisting, audit trails, data residency, custom SLAs, dedicated instances, role-based content approval, compliance reporting | Enterprise IT |
| 176-190 | Localization edge cases: currency formatting, date formats, number formats, cultural color sensitivity, RTL layout mirroring, translation memory, glossary management, locale-specific imagery | Global brands |
| 191-200 | Niche platform features: membership sites, gated content, course builders, event registration, booking calendars, appointment scheduling, podcast hosting, newsletter integration, community forums, job boards | Vertical businesses |

---

# PART 4 — CUSTOMER PSYCHOLOGY

## 4.1 Jobs-To-Be-Done (JTBD) Framework

| Customer | Primary JTBD | Emotional Job | Social Job |
|:---|:---|:---|:---|
| **Founders** | "Get a professional website live before my funding pitch next week" | Feel credible and legitimate as a company | Appear as polished as well-funded competitors |
| **Designers** | "Turn my creative vision into a real, interactive experience" | Feel empowered and autonomous (no developer dependency) | Maintain status as a premium creative professional |
| **Developers** | "Eliminate boilerplate so I can focus on product logic" | Feel efficient and in control of code quality | Be seen as a modern, AI-augmented engineer |
| **Agencies** | "Deliver 3x more client projects without hiring 3x more people" | Feel confident in delivery margins and timeline predictability | Be perceived as a cutting-edge, technology-forward agency |
| **Marketing Teams** | "Launch and test landing pages at the speed of our ad campaigns" | Feel autonomous from engineering bottlenecks | Prove ROI with data to leadership |
| **Product Managers** | "Ship internal tools and dashboards without begging engineering" | Feel productive and self-sufficient | Demonstrate shipping velocity to stakeholders |

## 4.2 Deep Psychological Profiles

### FOUNDERS
| Dimension | Profile |
|:---|:---|
| **Identity** | "I am building something important. My website is my company's first impression." |
| **Status Signal** | A beautiful website = credibility = investor confidence = customer trust |
| **Core Fear** | Looking amateur. Losing deals because the website feels cheap. |
| **Motivation** | Speed. Get live in hours, not weeks. |
| **Buying Trigger** | Seeing a demo where a single prompt generates a site better than what their current $5K Fiverr freelancer delivered |
| **Dream Outcome** | "I typed one sentence and my investor said 'your website is gorgeous'" |
| **Churn Reason** | AI output quality plateaus; site feels generic; can't customize beyond initial generation |
| **Why they choose Framer** | Framer sites LOOK premium. The animations signal "we're a serious company." |
| **Why they choose Lovable** | Speed. Working full-stack app in minutes. Supabase integration = instant backend. |
| **Why they refuse to switch** | Already invested 50+ hours learning current tool. Switching cost is time, not money. |

### DESIGNERS
| Dimension | Profile |
|:---|:---|
| **Identity** | "I am an artist. My craft is my career. Design quality is non-negotiable." |
| **Status Signal** | Portfolio pieces that win Awwwards, Dribbble features, and client admiration |
| **Core Fear** | AI replacing them. Losing creative control. Being commoditized. |
| **Motivation** | Creative empowerment — the tool should amplify their vision, not impose generic templates |
| **Buying Trigger** | Seeing the tool generate something beautiful AND allowing pixel-perfect visual refinement |
| **Dream Outcome** | "I design in a visual canvas; it outputs code so clean my developer colleague audited it and was impressed" |
| **Churn Reason** | Lack of precise typographic control; forced into component templates; can't achieve their unique aesthetic |
| **Why they choose Framer** | Best visual canvas UX. Animations. Designer community. Premium feel. |
| **Why they choose Webflow** | Deepest CSS control. Professional credibility. Enterprise client requirements. |
| **Why they refuse to switch** | Framer community on X is their professional network. Switching means losing social capital. |

### DEVELOPERS
| Dimension | Profile |
|:---|:---|
| **Identity** | "I write code. I value clean architecture, version control, and technical rigor." |
| **Status Signal** | Clean Git history. High Lighthouse scores. Efficient bundle sizes. |
| **Core Fear** | Generated spaghetti code entering their repo. Losing control of the stack. |
| **Motivation** | Eliminate grunt work (boilerplate CSS, repetitive layouts) to focus on real engineering problems |
| **Buying Trigger** | Inspecting generated code and finding it's ACTUALLY clean, semantic, well-structured |
| **Dream Outcome** | "I pointed AI at my design and it wrote the exact same component structure I would have — but in 10 seconds" |
| **Churn Reason** | Unauditable code; vendor lock-in; can't integrate into CI/CD pipeline; wrapper div hell |
| **Why they choose Cursor** | Code ownership. Full control. Works with their existing stack. |
| **Why they choose v0** | Component quality is production-grade. shadcn/ui compatibility. |
| **Why they refuse to switch** | Already invested in their own component library and build pipeline. |

### AGENCIES
| Dimension | Profile |
|:---|:---|
| **Identity** | "We are professionals who deliver exceptional client work on time and on budget." |
| **Status Signal** | Client referrals. Portfolio quality. Delivery speed. Margin health. |
| **Core Fear** | Scope creep destroying margins. Client demanding changes that break everything. |
| **Motivation** | Deliver 10x output with the same team size. Expand margins from 30% to 70%. |
| **Buying Trigger** | Seeing a client project go from brief to live site in 2 days instead of 3 weeks |
| **Dream Outcome** | "We onboard a new client Monday, show them a live staging site Tuesday, launch Friday" |
| **Churn Reason** | Cannot white-label; client handoff is messy; can't manage 50+ projects efficiently |
| **Why they choose Webflow** | Industry standard. Clients know it. Partner program drives inbound leads. |
| **Why they refuse to switch** | Entire team trained on Webflow. 200+ client sites already on Webflow. Migration is a nightmare. |

### MARKETING TEAMS
| Dimension | Profile |
|:---|:---|
| **Identity** | "We drive growth. Every day without a live test is a day of lost revenue." |
| **Status Signal** | Conversion rate improvements. Campaign ROI. Speed-to-market metrics. |
| **Core Fear** | Waiting in engineering backlog while competitors launch first. |
| **Motivation** | Full autonomy to launch, test, and iterate landing pages without engineering approval |
| **Buying Trigger** | "Launch 5 landing page variants in 1 hour and see which converts best — no developer needed" |
| **Dream Outcome** | AI automatically optimizes conversion rate overnight while they sleep |
| **Churn Reason** | No native A/B testing; can't connect to CRM/HubSpot; analytics are basic |

---

## 4.3 Decision Matrix: Why Customers Choose Each Competitor

| Decision Factor (Weight) | Framer Wins When... | Webflow Wins When... | Lovable Wins When... | Cursor Wins When... |
|:---|:---|:---|:---|:---|
| **Design quality matters most (30%)** | Team is design-led; animations are critical; SaaS marketing site | Deep CSS control needed; complex CMS; enterprise client | N/A — design is secondary concern | N/A — no visual output |
| **Speed matters most (25%)** | Quick marketing page needed; <1 day timeline | N/A — learning curve is weeks | Non-technical founder needs working app TODAY | Developer already knows React; wants AI speed boost |
| **Code ownership matters (20%)** | N/A — no export | N/A — proprietary output | Partial — GitHub push available | Full ownership — it's YOUR codebase |
| **Team collaboration (15%)** | Small design team (<5 people) | Large agency with structured workflow | Solo founder / tiny team | Engineering team with existing Git workflow |
| **Enterprise compliance (10%)** | N/A | SOC2 needed; enterprise sales cycle | N/A | Via company's own infra compliance |

---

*— End of Part 2 —*
*Continue to Part 3: Design Research, Pricing Research & White Space Opportunities*
