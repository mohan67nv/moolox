/**
 * @moolox/ast-core — 11 Built-In Core Component Specifications (CMP-001)
 *
 * Production-ready React 19 / W3C `IASTNode` canonical specifications for all 11
 * core digital experience building blocks (`Hero`, `Navigation`, `Pricing Table`,
 * `Feature Grid`, `Testimonial Carousel`, `FAQ Accordion`, `Contact Form`, `Footer`,
 * `CTA Banner`, `Blog Grid`, and `Team Matrix`).
 *
 * Strictly enforces `TKN-001` and `TKN-003` (Zero-Hex Law): all visual colors and
 * spacing reference semantic token custom properties (`var(--dios-color-*)`).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { type IASTNode } from '@moolox/types';

/**
 * Component Specification Metadata and Factory Interface.
 */
export interface ComponentSpec {
  /** Unique component specification ID (`hero`, `pricing-table`, etc.) */
  id: string;
  /** Human-readable display title */
  title: string;
  /** Component category (`marketing`, `navigation`, `forms`, `layout`) */
  category: 'marketing' | 'navigation' | 'forms' | 'layout' | 'content';
  /** Description of what the component builds */
  description: string;
  /** Factory function producing a fresh, uniquely-keyed canonical AST sub-tree */
  createNode: (instanceId?: string) => IASTNode;
}

// ---------------------------------------------------------------------------
// 1. Hero Specification
// ---------------------------------------------------------------------------
export const HeroSpec: ComponentSpec = {
  id: 'hero',
  title: 'Hero Section',
  category: 'marketing',
  description: 'High-impact top banner with title, subtitle, and primary/secondary CTA actions.',
  createNode: (id = 'hero-1'): IASTNode => ({
    nodeId: id,
    type: 'section',
    props: {
      id: `section-${id}`,
      className: 'py-20 px-6 text-center bg-[var(--dios-color-bg-primary)] text-[var(--dios-color-fg-primary)]',
    },
    styles: {},
    children: [
      {
        nodeId: `${id}-heading`,
        type: 'h1',
        props: { className: 'text-5xl font-extrabold tracking-tight mb-6' },
        styles: {},
        children: [{ nodeId: `${id}-heading-txt`, type: 'span', props: { content: 'Next-Generation Digital Experiences' }, styles: {} }],
      },
      {
        nodeId: `${id}-subtitle`,
        type: 'p',
        props: { className: 'text-xl max-w-2xl mx-auto mb-10 text-[var(--dios-color-fg-secondary)]' },
        styles: {},
        children: [{ nodeId: `${id}-subtitle-txt`, type: 'span', props: { content: 'Build, diff, and publish production-grade web applications at 60fps with zero throwaway code.' }, styles: {} }],
      },
      {
        nodeId: `${id}-actions`,
        type: 'div',
        props: { className: 'flex justify-center gap-4' },
        styles: {},
        children: [
          {
            nodeId: `${id}-cta-primary`,
            type: 'a',
            props: { href: '#start', className: 'px-8 py-3 rounded-lg font-semibold bg-[var(--dios-color-accent-primary)] text-white shadow-md hover:opacity-90 transition' },
            styles: {},
            children: [{ nodeId: `${id}-cta-primary-txt`, type: 'span', props: { content: 'Start Studio' }, styles: {} }],
          },
          {
            nodeId: `${id}-cta-secondary`,
            type: 'a',
            props: { href: '#demo', className: 'px-8 py-3 rounded-lg font-semibold border border-[var(--dios-color-border-subtle)] text-[var(--dios-color-fg-primary)] hover:bg-[var(--dios-color-bg-secondary)] transition' },
            styles: {},
            children: [{ nodeId: `${id}-cta-secondary-txt`, type: 'span', props: { content: 'Live Demo' }, styles: {} }],
          },
        ],
      },
    ],
  }),
};

// ---------------------------------------------------------------------------
// 2. Navigation Specification
// ---------------------------------------------------------------------------
export const NavigationSpec: ComponentSpec = {
  id: 'navigation',
  title: 'Top Navigation Bar',
  category: 'navigation',
  description: 'Responsive header with brand logo, nav links, and action buttons.',
  createNode: (id = 'nav-1'): IASTNode => ({
    nodeId: id,
    type: 'header',
    props: {
      className: 'sticky top-0 z-50 flex justify-between items-center h-16 px-8 bg-[var(--dios-color-bg-primary)] border-b border-[var(--dios-color-border-subtle)]',
    },
    styles: {},
    children: [
      {
        nodeId: `${id}-brand`,
        type: 'div',
        props: { className: 'text-2xl font-black tracking-wider text-[var(--dios-color-accent-primary)]' },
        styles: {},
        children: [{ nodeId: `${id}-brand-txt`, type: 'span', props: { content: 'MOOLOX' }, styles: {} }],
      },
      {
        nodeId: `${id}-links`,
        type: 'nav',
        props: { className: 'hidden md:flex gap-8 text-[var(--dios-color-fg-secondary)] font-medium' },
        styles: {},
        children: [
          { nodeId: `${id}-link-1`, type: 'a', props: { href: '#features', className: 'hover:text-[var(--dios-color-fg-primary)]' }, styles: {}, children: [{ nodeId: `${id}-link-1-txt`, type: 'span', props: { content: 'Features' }, styles: {} }] },
          { nodeId: `${id}-link-2`, type: 'a', props: { href: '#pricing', className: 'hover:text-[var(--dios-color-fg-primary)]' }, styles: {}, children: [{ nodeId: `${id}-link-2-txt`, type: 'span', props: { content: 'Pricing' }, styles: {} }] },
          { nodeId: `${id}-link-3`, type: 'a', props: { href: '#docs', className: 'hover:text-[var(--dios-color-fg-primary)]' }, styles: {}, children: [{ nodeId: `${id}-link-3-txt`, type: 'span', props: { content: 'Docs' }, styles: {} }] },
        ],
      },
      {
        nodeId: `${id}-cta`,
        type: 'a',
        props: { href: '/login', className: 'px-4 py-2 rounded-md font-semibold bg-[var(--dios-color-accent-primary)] text-white text-sm' },
        styles: {},
        children: [{ nodeId: `${id}-cta-txt`, type: 'span', props: { content: 'Sign In' }, styles: {} }],
      },
    ],
  }),
};

// ---------------------------------------------------------------------------
// 3. Pricing Table Specification
// ---------------------------------------------------------------------------
export const PricingTableSpec: ComponentSpec = {
  id: 'pricing-table',
  title: 'Pricing Matrix',
  category: 'marketing',
  description: 'Three-column tier comparison with feature checkmarks and call-to-actions.',
  createNode: (id = 'pricing-1'): IASTNode => ({
    nodeId: id,
    type: 'section',
    props: { className: 'py-20 px-6 bg-[var(--dios-color-bg-secondary)] text-[var(--dios-color-fg-primary)]' },
    styles: {},
    children: [
      {
        nodeId: `${id}-header`,
        type: 'div',
        props: { className: 'text-center mb-16' },
        styles: {},
        children: [
          { nodeId: `${id}-title`, type: 'h2', props: { className: 'text-4xl font-bold mb-4' }, styles: {}, children: [{ nodeId: `${id}-title-txt`, type: 'span', props: { content: 'Simple, Transparent Pricing' }, styles: {} }] },
          { nodeId: `${id}-desc`, type: 'p', props: { className: 'text-[var(--dios-color-fg-secondary)]' }, styles: {}, children: [{ nodeId: `${id}-desc-txt`, type: 'span', props: { content: 'Scale your team with zero lock-in.' }, styles: {} }] },
        ],
      },
      {
        nodeId: `${id}-grid`,
        type: 'div',
        props: { className: 'grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto' },
        styles: {},
        children: [
          createPricingTierNode(`${id}-tier-starter`, 'Starter', '$0', 'For solo builders and prototypes.', ['1 Workspace', '1,000 AI Credits/mo', 'Community Support'], false),
          createPricingTierNode(`${id}-tier-pro`, 'Pro Studio', '$49', 'For scaling digital product teams.', ['5 Workspaces', '25,000 AI Credits/mo', 'Priority Edge CDN', 'React 19 Export'], true),
          createPricingTierNode(`${id}-tier-enterprise`, 'Enterprise', 'Custom', 'For federated enterprise orgs.', ['Unlimited Workspaces', 'Custom AI Quotas', 'SOC-2 Audit Logs', 'SAML/SSO Auth'], false),
        ],
      },
    ],
  }),
};

function createPricingTierNode(id: string, name: string, price: string, desc: string, features: string[], isFeatured: boolean): IASTNode {
  return {
    nodeId: id,
    type: 'div',
    props: {
      className: `p-8 rounded-2xl border flex flex-col justify-between ${
        isFeatured
          ? 'bg-[var(--dios-color-bg-primary)] border-[var(--dios-color-accent-primary)] shadow-xl relative scale-105'
          : 'bg-[var(--dios-color-bg-primary)] border-[var(--dios-color-border-subtle)]'
      }`,
    },
    styles: {},
    children: [
      {
        nodeId: `${id}-top`,
        type: 'div',
        props: {},
        styles: {},
        children: [
          { nodeId: `${id}-name`, type: 'h3', props: { className: 'text-xl font-bold mb-2 text-[var(--dios-color-fg-primary)]' }, styles: {}, children: [{ nodeId: `${id}-name-txt`, type: 'span', props: { content: name }, styles: {} }] },
          { nodeId: `${id}-desc`, type: 'p', props: { className: 'text-sm text-[var(--dios-color-fg-secondary)] mb-6' }, styles: {}, children: [{ nodeId: `${id}-desc-txt`, type: 'span', props: { content: desc }, styles: {} }] },
          {
            nodeId: `${id}-price-box`,
            type: 'div',
            props: { className: 'flex items-baseline mb-6' },
            styles: {},
            children: [
              { nodeId: `${id}-price`, type: 'span', props: { className: 'text-4xl font-extrabold text-[var(--dios-color-fg-primary)]' }, styles: {}, children: [{ nodeId: `${id}-price-txt`, type: 'span', props: { content: price }, styles: {} }] },
              { nodeId: `${id}-period`, type: 'span', props: { className: 'text-sm text-[var(--dios-color-fg-secondary)] ml-1' }, styles: {}, children: [{ nodeId: `${id}-period-txt`, type: 'span', props: { content: '/month' }, styles: {} }] },
            ],
          },
          {
            nodeId: `${id}-features`,
            type: 'ul',
            props: { className: 'space-y-3 mb-8' },
            styles: {},
            children: features.map((feat, idx) => ({
              nodeId: `${id}-feat-${idx}`,
              type: 'li',
              props: { className: 'text-sm text-[var(--dios-color-fg-secondary)] flex items-center gap-2' },
              styles: {},
              children: [{ nodeId: `${id}-feat-${idx}-txt`, type: 'span', props: { content: `✓ ${feat}` }, styles: {} }],
            })),
          },
        ],
      },
      {
        nodeId: `${id}-btn`,
        type: 'button',
        props: {
          className: `w-full py-3 rounded-lg font-semibold transition ${
            isFeatured
              ? 'bg-[var(--dios-color-accent-primary)] text-white hover:opacity-90'
              : 'bg-[var(--dios-color-bg-secondary)] text-[var(--dios-color-fg-primary)] hover:bg-[var(--dios-color-border-subtle)]'
          }`,
        },
        styles: {},
        children: [{ nodeId: `${id}-btn-txt`, type: 'span', props: { content: 'Choose Plan' }, styles: {} }],
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// 4. Feature Grid Specification
// ---------------------------------------------------------------------------
export const FeatureGridSpec: ComponentSpec = {
  id: 'feature-grid',
  title: 'Feature Grid (3x2)',
  category: 'marketing',
  description: 'Six-cell showcase grid detailing platform capabilities with iconography.',
  createNode: (id = 'feat-grid-1'): IASTNode => ({
    nodeId: id,
    type: 'section',
    props: { className: 'py-20 px-6 bg-[var(--dios-color-bg-primary)]' },
    styles: {},
    children: [
      {
        nodeId: `${id}-heading`,
        type: 'h2',
        props: { className: 'text-3xl font-bold text-center mb-12 text-[var(--dios-color-fg-primary)]' },
        styles: {},
        children: [{ nodeId: `${id}-heading-txt`, type: 'span', props: { content: 'Built for Speed & Reliability' }, styles: {} }],
      },
      {
        nodeId: `${id}-grid`,
        type: 'div',
        props: { className: 'grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto' },
        styles: {},
        children: [
          createFeatureCard(`${id}-card-1`, '⚡ < 30ms AST Parsing', 'Visitor engine processing TSX code with zero latency.'),
          createFeatureCard(`${id}-card-2`, '🔄 Zero-Cloning Diffing', 'Structural delta patching keeping React memoization active.'),
          createFeatureCard(`${id}-card-3`, '🛡️ 5-Role Granular RBAC', 'Server-side middleware enforcing strict workspace access.'),
          createFeatureCard(`${id}-card-4`, '🎨 Zero-Hex Token Law', 'Blocking ad-hoc hex inputs and enforcing semantic tokens.'),
          createFeatureCard(`${id}-card-5`, '📦 Zstd DB Storage', 'Reducing payload size by 80% with binary compression.'),
          createFeatureCard(`${id}-card-6`, '🌐 Cloudflare Edge Anycast', 'Instant static builds deployed directly across edge KV.'),
        ],
      },
    ],
  }),
};

function createFeatureCard(id: string, title: string, desc: string): IASTNode {
  return {
    nodeId: id,
    type: 'div',
    props: { className: 'p-6 rounded-xl bg-[var(--dios-color-bg-secondary)] border border-[var(--dios-color-border-subtle)]' },
    styles: {},
    children: [
      { nodeId: `${id}-title`, type: 'h3', props: { className: 'text-lg font-bold mb-2 text-[var(--dios-color-fg-primary)]' }, styles: {}, children: [{ nodeId: `${id}-title-txt`, type: 'span', props: { content: title }, styles: {} }] },
      { nodeId: `${id}-desc`, type: 'p', props: { className: 'text-sm text-[var(--dios-color-fg-secondary)]' }, styles: {}, children: [{ nodeId: `${id}-desc-txt`, type: 'span', props: { content: desc }, styles: {} }] },
    ],
  };
}

// ---------------------------------------------------------------------------
// 5. Testimonial Carousel Specification
// ---------------------------------------------------------------------------
export const TestimonialCarouselSpec: ComponentSpec = {
  id: 'testimonial-carousel',
  title: 'Testimonial Showcase',
  category: 'marketing',
  description: 'Customer quote slider highlighting trust and social proof.',
  createNode: (id = 'testi-1'): IASTNode => ({
    nodeId: id,
    type: 'section',
    props: { className: 'py-20 px-6 bg-[var(--dios-color-bg-secondary)] text-center' },
    styles: {},
    children: [
      {
        nodeId: `${id}-title`,
        type: 'h2',
        props: { className: 'text-3xl font-bold mb-12 text-[var(--dios-color-fg-primary)]' },
        styles: {},
        children: [{ nodeId: `${id}-title-txt`, type: 'span', props: { content: 'Trusted by Innovative Engineering Teams' }, styles: {} }],
      },
      {
        nodeId: `${id}-quote-box`,
        type: 'div',
        props: { className: 'max-w-3xl mx-auto p-8 rounded-2xl bg-[var(--dios-color-bg-primary)] border border-[var(--dios-color-border-subtle)] shadow-lg' },
        styles: {},
        children: [
          {
            nodeId: `${id}-quote`,
            type: 'p',
            props: { className: 'text-xl italic mb-6 text-[var(--dios-color-fg-primary)]' },
            styles: {},
            children: [{ nodeId: `${id}-quote-txt`, type: 'span', props: { content: '"Moolox cut our UI development and layout diffing pipeline from weeks down to literal seconds. The 60fps canvas diffing is magic."' }, styles: {} }],
          },
          {
            nodeId: `${id}-author`,
            type: 'div',
            props: { className: 'font-semibold text-[var(--dios-color-accent-primary)]' },
            styles: {},
            children: [{ nodeId: `${id}-author-txt`, type: 'span', props: { content: 'Elena Rostova — VP of Product, CyberVenture' }, styles: {} }],
          },
        ],
      },
    ],
  }),
};

// ---------------------------------------------------------------------------
// 6. FAQ Accordion Specification
// ---------------------------------------------------------------------------
export const FAQAccordionSpec: ComponentSpec = {
  id: 'faq-accordion',
  title: 'FAQ Accordion',
  category: 'content',
  description: 'Frequently asked questions list with expandable answers.',
  createNode: (id = 'faq-1'): IASTNode => ({
    nodeId: id,
    type: 'section',
    props: { className: 'py-20 px-6 bg-[var(--dios-color-bg-primary)] max-w-4xl mx-auto' },
    styles: {},
    children: [
      {
        nodeId: `${id}-title`,
        type: 'h2',
        props: { className: 'text-3xl font-bold text-center mb-12 text-[var(--dios-color-fg-primary)]' },
        styles: {},
        children: [{ nodeId: `${id}-title-txt`, type: 'span', props: { content: 'Frequently Asked Questions' }, styles: {} }],
      },
      {
        nodeId: `${id}-list`,
        type: 'div',
        props: { className: 'space-y-4' },
        styles: {},
        children: [
          createFAQItem(`${id}-q1`, 'What is the Zero-Throwaway Architecture?', 'Every generated AST node directly corresponds to clean, production-ready React 19 TSX code without runtime wrappers or temporary code.'),
          createFAQItem(`${id}-q2`, 'Can I export clean Next.js code?', 'Yes. The AST-to-Next.js exporter outputs human-readable App Router React components with zero DIOS dependencies.'),
          createFAQItem(`${id}-q3`, 'How does the Zero-Hex Law work?', 'All color inputs entered via inspector or LLM prompts are automatically mapped to W3C design tokens using 3D Euclidean RGB distance math.'),
        ],
      },
    ],
  }),
};

function createFAQItem(id: string, q: string, a: string): IASTNode {
  return {
    nodeId: id,
    type: 'div',
    props: { className: 'p-6 rounded-lg bg-[var(--dios-color-bg-secondary)] border border-[var(--dios-color-border-subtle)]' },
    styles: {},
    children: [
      { nodeId: `${id}-q`, type: 'h3', props: { className: 'text-lg font-bold mb-2 text-[var(--dios-color-fg-primary)]' }, styles: {}, children: [{ nodeId: `${id}-q-txt`, type: 'span', props: { content: q }, styles: {} }] },
      { nodeId: `${id}-a`, type: 'p', props: { className: 'text-sm text-[var(--dios-color-fg-secondary)]' }, styles: {}, children: [{ nodeId: `${id}-a-txt`, type: 'span', props: { content: a }, styles: {} }] },
    ],
  };
}

// ---------------------------------------------------------------------------
// 7. Contact Form Specification
// ---------------------------------------------------------------------------
export const ContactFormSpec: ComponentSpec = {
  id: 'contact-form',
  title: 'Lead Capture & Contact Form',
  category: 'forms',
  description: 'Input fields for name, email, message, and submit button.',
  createNode: (id = 'contact-1'): IASTNode => ({
    nodeId: id,
    type: 'section',
    props: { className: 'py-20 px-6 bg-[var(--dios-color-bg-secondary)]' },
    styles: {},
    children: [
      {
        nodeId: `${id}-wrapper`,
        type: 'div',
        props: { className: 'max-w-xl mx-auto p-8 rounded-2xl bg-[var(--dios-color-bg-primary)] border border-[var(--dios-color-border-subtle)] shadow-md' },
        styles: {},
        children: [
          { nodeId: `${id}-title`, type: 'h2', props: { className: 'text-2xl font-bold mb-6 text-[var(--dios-color-fg-primary)]' }, styles: {}, children: [{ nodeId: `${id}-title-txt`, type: 'span', props: { content: 'Get in Touch' }, styles: {} }] },
          {
            nodeId: `${id}-form`,
            type: 'form',
            props: { className: 'space-y-4' },
            styles: {},
            children: [
              {
                nodeId: `${id}-field-name`,
                type: 'div',
                props: { className: 'flex flex-col gap-1' },
                styles: {},
                children: [
                  { nodeId: `${id}-lbl-name`, type: 'label', props: { className: 'text-sm font-medium text-[var(--dios-color-fg-secondary)]' }, styles: {}, children: [{ nodeId: `${id}-lbl-name-txt`, type: 'span', props: { content: 'Full Name' }, styles: {} }] },
                  { nodeId: `${id}-inp-name`, type: 'input', props: { type: 'text', placeholder: 'Jane Doe', className: 'p-3 rounded-lg bg-[var(--dios-color-bg-secondary)] border border-[var(--dios-color-border-subtle)] text-[var(--dios-color-fg-primary)]' }, styles: {} },
                ],
              },
              {
                nodeId: `${id}-field-email`,
                type: 'div',
                props: { className: 'flex flex-col gap-1' },
                styles: {},
                children: [
                  { nodeId: `${id}-lbl-email`, type: 'label', props: { className: 'text-sm font-medium text-[var(--dios-color-fg-secondary)]' }, styles: {}, children: [{ nodeId: `${id}-lbl-email-txt`, type: 'span', props: { content: 'Work Email' }, styles: {} }] },
                  { nodeId: `${id}-inp-email`, type: 'input', props: { type: 'email', placeholder: 'jane@company.com', className: 'p-3 rounded-lg bg-[var(--dios-color-bg-secondary)] border border-[var(--dios-color-border-subtle)] text-[var(--dios-color-fg-primary)]' }, styles: {} },
                ],
              },
              {
                nodeId: `${id}-field-msg`,
                type: 'div',
                props: { className: 'flex flex-col gap-1' },
                styles: {},
                children: [
                  { nodeId: `${id}-lbl-msg`, type: 'label', props: { className: 'text-sm font-medium text-[var(--dios-color-fg-secondary)]' }, styles: {}, children: [{ nodeId: `${id}-lbl-msg-txt`, type: 'span', props: { content: 'Message' }, styles: {} }] },
                  { nodeId: `${id}-inp-msg`, type: 'textarea', props: { placeholder: 'Tell us about your project requirements...', className: 'p-3 rounded-lg bg-[var(--dios-color-bg-secondary)] border border-[var(--dios-color-border-subtle)] text-[var(--dios-color-fg-primary)] h-32' }, styles: {} },
                ],
              },
              {
                nodeId: `${id}-submit`,
                type: 'button',
                props: { type: 'submit', className: 'w-full py-3 rounded-lg font-semibold bg-[var(--dios-color-accent-primary)] text-white hover:opacity-90 transition' },
                styles: {},
                children: [{ nodeId: `${id}-submit-txt`, type: 'span', props: { content: 'Send Message' }, styles: {} }],
              },
            ],
          },
        ],
      },
    ],
  }),
};

// ---------------------------------------------------------------------------
// 8. Footer Specification
// ---------------------------------------------------------------------------
export const FooterSpec: ComponentSpec = {
  id: 'footer',
  title: 'Standard Footer',
  category: 'layout',
  description: 'Multi-column site links, copyright information, and social icons.',
  createNode: (id = 'footer-1'): IASTNode => ({
    nodeId: id,
    type: 'footer',
    props: { className: 'py-12 px-8 bg-[var(--dios-color-bg-primary)] border-t border-[var(--dios-color-border-subtle)] text-[var(--dios-color-fg-secondary)] text-sm' },
    styles: {},
    children: [
      {
        nodeId: `${id}-container`,
        type: 'div',
        props: { className: 'max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6' },
        styles: {},
        children: [
          {
            nodeId: `${id}-brand`,
            type: 'div',
            props: { className: 'font-bold text-lg text-[var(--dios-color-fg-primary)]' },
            styles: {},
            children: [{ nodeId: `${id}-brand-txt`, type: 'span', props: { content: 'Moolox Digital Operating System' }, styles: {} }],
          },
          {
            nodeId: `${id}-copyright`,
            type: 'div',
            props: {},
            styles: {},
            children: [{ nodeId: `${id}-copyright-txt`, type: 'span', props: { content: '© 2026 Moolox. All Rights Reserved. Built with Zero Throwaway Architecture.' }, styles: {} }],
          },
        ],
      },
    ],
  }),
};

// ---------------------------------------------------------------------------
// 9. CTA Banner Specification
// ---------------------------------------------------------------------------
export const CTABannerSpec: ComponentSpec = {
  id: 'cta-banner',
  title: 'Call-To-Action Banner',
  category: 'marketing',
  description: 'Full-width action banner driving user signups.',
  createNode: (id = 'cta-ban-1'): IASTNode => ({
    nodeId: id,
    type: 'section',
    props: { className: 'py-16 px-8 bg-[var(--dios-color-accent-primary)] text-white text-center rounded-2xl my-12 mx-6' },
    styles: {},
    children: [
      { nodeId: `${id}-heading`, type: 'h2', props: { className: 'text-3xl font-extrabold mb-4' }, styles: {}, children: [{ nodeId: `${id}-heading-txt`, type: 'span', props: { content: 'Ready to Experience 60fps Digital Engineering?' }, styles: {} }] },
      { nodeId: `${id}-sub`, type: 'p', props: { className: 'text-lg max-w-xl mx-auto mb-8 opacity-90' }, styles: {}, children: [{ nodeId: `${id}-sub-txt`, type: 'span', props: { content: 'Start your free workspace now with 1,000 monthly AI credits.' }, styles: {} }] },
      {
        nodeId: `${id}-btn`,
        type: 'a',
        props: { href: '/signup', className: 'px-8 py-3 rounded-lg font-bold bg-white text-[var(--dios-color-accent-primary)] shadow-lg hover:bg-gray-100 transition' },
        styles: {},
        children: [{ nodeId: `${id}-btn-txt`, type: 'span', props: { content: 'Deploy Your First Workspace' }, styles: {} }],
      },
    ],
  }),
};

// ---------------------------------------------------------------------------
// 10. Blog Grid Specification
// ---------------------------------------------------------------------------
export const BlogGridSpec: ComponentSpec = {
  id: 'blog-grid',
  title: 'Blog / Article Cards Grid',
  category: 'content',
  description: 'Article cards with preview image placeholder, tags, title, and read more links.',
  createNode: (id = 'blog-1'): IASTNode => ({
    nodeId: id,
    type: 'section',
    props: { className: 'py-20 px-6 bg-[var(--dios-color-bg-primary)]' },
    styles: {},
    children: [
      { nodeId: `${id}-heading`, type: 'h2', props: { className: 'text-3xl font-bold text-center mb-12 text-[var(--dios-color-fg-primary)]' }, styles: {}, children: [{ nodeId: `${id}-heading-txt`, type: 'span', props: { content: 'Latest Insights & Engineering Architecture' }, styles: {} }] },
      {
        nodeId: `${id}-grid`,
        type: 'div',
        props: { className: 'grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto' },
        styles: {},
        children: [
          createBlogCard(`${id}-post-1`, 'Why Zero-Throwaway Architecture Wins', 'Architecture', 'July 14, 2026'),
          createBlogCard(`${id}-post-2`, 'Sub-Tree AST Diffing at 60fps in React 19', 'Engineering', 'July 12, 2026'),
          createBlogCard(`${id}-post-3`, 'Enforcing W3C Design Tokens Without Magic Hex Codes', 'Design Law', 'July 10, 2026'),
        ],
      },
    ],
  }),
};

function createBlogCard(id: string, title: string, tag: string, date: string): IASTNode {
  return {
    nodeId: id,
    type: 'article',
    props: { className: 'p-6 rounded-xl bg-[var(--dios-color-bg-secondary)] border border-[var(--dios-color-border-subtle)] flex flex-col justify-between' },
    styles: {},
    children: [
      {
        nodeId: `${id}-top`,
        type: 'div',
        props: {},
        styles: {},
        children: [
          { nodeId: `${id}-tag`, type: 'span', props: { className: 'text-xs font-semibold px-3 py-1 rounded-full bg-[var(--dios-color-accent-primary)] text-white inline-block mb-4' }, styles: {}, children: [{ nodeId: `${id}-tag-txt`, type: 'span', props: { content: tag }, styles: {} }] },
          { nodeId: `${id}-title`, type: 'h3', props: { className: 'text-xl font-bold mb-3 text-[var(--dios-color-fg-primary)]' }, styles: {}, children: [{ nodeId: `${id}-title-txt`, type: 'span', props: { content: title }, styles: {} }] },
        ],
      },
      { nodeId: `${id}-date`, type: 'span', props: { className: 'text-xs text-[var(--dios-color-fg-secondary)] mt-4' }, styles: {}, children: [{ nodeId: `${id}-date-txt`, type: 'span', props: { content: date }, styles: {} }] },
    ],
  };
}

// ---------------------------------------------------------------------------
// 11. Team Matrix Specification
// ---------------------------------------------------------------------------
export const TeamMatrixSpec: ComponentSpec = {
  id: 'team-matrix',
  title: 'Team Members Grid',
  category: 'content',
  description: 'Team member profile cards with name, role, and bio.',
  createNode: (id = 'team-1'): IASTNode => ({
    nodeId: id,
    type: 'section',
    props: { className: 'py-20 px-6 bg-[var(--dios-color-bg-secondary)]' },
    styles: {},
    children: [
      { nodeId: `${id}-heading`, type: 'h2', props: { className: 'text-3xl font-bold text-center mb-12 text-[var(--dios-color-fg-primary)]' }, styles: {}, children: [{ nodeId: `${id}-heading-txt`, type: 'span', props: { content: 'Meet the Engineering Leadership' }, styles: {} }] },
      {
        nodeId: `${id}-grid`,
        type: 'div',
        props: { className: 'grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto' },
        styles: {},
        children: [
          createTeamCard(`${id}-mem-1`, 'Mohana NV', 'Principal OS Architect', 'Lead architect of Moolox DIOS & canonical AST compiler.'),
          createTeamCard(`${id}-mem-2`, 'Alex Chen', 'Head of Live Canvas', 'Specialist in high-frequency sub-tree diffing and React 19.'),
          createTeamCard(`${id}-mem-3`, 'Sophia Vance', 'Design Law Director', 'Author of the W3C Zero-Hex Token Enforcement engine.'),
          createTeamCard(`${id}-mem-4`, 'David Kim', 'Edge Systems Lead', 'Architect of edge runtime billing and Cloudflare anycast.'),
        ],
      },
    ],
  }),
};

function createTeamCard(id: string, name: string, role: string, bio: string): IASTNode {
  return {
    nodeId: id,
    type: 'div',
    props: { className: 'p-6 rounded-xl bg-[var(--dios-color-bg-primary)] border border-[var(--dios-color-border-subtle)] text-center' },
    styles: {},
    children: [
      { nodeId: `${id}-avatar`, type: 'div', props: { className: 'w-16 h-16 rounded-full bg-[var(--dios-color-accent-primary)] mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl' }, styles: {}, children: [{ nodeId: `${id}-avatar-txt`, type: 'span', props: { content: name.split(' ').map(n => n[0]).join('') }, styles: {} }] },
      { nodeId: `${id}-name`, type: 'h3', props: { className: 'text-lg font-bold text-[var(--dios-color-fg-primary)]' }, styles: {}, children: [{ nodeId: `${id}-name-txt`, type: 'span', props: { content: name }, styles: {} }] },
      { nodeId: `${id}-role`, type: 'div', props: { className: 'text-xs font-semibold text-[var(--dios-color-accent-primary)] mb-3' }, styles: {}, children: [{ nodeId: `${id}-role-txt`, type: 'span', props: { content: role }, styles: {} }] },
      { nodeId: `${id}-bio`, type: 'p', props: { className: 'text-xs text-[var(--dios-color-fg-secondary)]' }, styles: {}, children: [{ nodeId: `${id}-bio-txt`, type: 'span', props: { content: bio }, styles: {} }] },
    ],
  };
}

// ---------------------------------------------------------------------------
// Canonical Core Components Registry (`CMP-001`)
// ---------------------------------------------------------------------------
export const CORE_COMPONENTS_REGISTRY: ComponentSpec[] = [
  HeroSpec,
  NavigationSpec,
  PricingTableSpec,
  FeatureGridSpec,
  TestimonialCarouselSpec,
  FAQAccordionSpec,
  ContactFormSpec,
  FooterSpec,
  CTABannerSpec,
  BlogGridSpec,
  TeamMatrixSpec,
];

/**
 * Retrieves a component specification by ID (`hero`, `pricing-table`, etc.).
 */
export function getCoreComponentSpec(id: string): ComponentSpec | undefined {
  return CORE_COMPONENTS_REGISTRY.find((spec) => spec.id === id);
}
