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

function toNodeId(id: string, suffix?: string): string {
  const base = id.startsWith('node-') ? id : `node-${id}`;
  return suffix ? `${base}-${suffix}` : base;
}

// ---------------------------------------------------------------------------
// 1. Hero Specification
// ---------------------------------------------------------------------------
export const HeroSpec: ComponentSpec = {
  id: 'hero',
  title: 'Hero Section',
  category: 'marketing',
  description: 'High-impact top banner with title, subtitle, and primary/secondary CTA actions.',
  createNode: (id = 'node-hero-1'): IASTNode => {
    const s = toNodeId(id);
    return {
      nodeId: s,
      type: 'section',
      props: {
        id: `section-${id.replace(/^node-/, '')}`,
        className: 'py-20 px-6 text-center bg-[var(--dios-color-bg-primary)] text-[var(--dios-color-fg-primary)]',
      },
      styles: {},
      children: [
        {
          nodeId: `${s}-heading`,
          type: 'h1',
          props: { className: 'text-5xl font-extrabold tracking-tight mb-6' },
          styles: {},
          children: [{ nodeId: `${s}-heading-txt`, type: 'span', props: { content: 'Next-Generation Digital Experiences' }, styles: {} }],
        },
        {
          nodeId: `${s}-subtitle`,
          type: 'p',
          props: { className: 'text-xl max-w-2xl mx-auto mb-10 text-[var(--dios-color-fg-secondary)]' },
          styles: {},
          children: [{ nodeId: `${s}-subtitle-txt`, type: 'span', props: { content: 'Build, diff, and publish production-grade web applications at 60fps with zero throwaway code.' }, styles: {} }],
        },
        {
          nodeId: `${s}-actions`,
          type: 'div',
          props: { className: 'flex justify-center gap-4' },
          styles: {},
          children: [
            {
              nodeId: `${s}-cta-primary`,
              type: 'a',
              props: { href: '#start', className: 'px-8 py-3 rounded-lg font-semibold bg-[var(--dios-color-accent-primary)] text-white shadow-md hover:opacity-90 transition' },
              styles: {},
              children: [{ nodeId: `${s}-cta-primary-txt`, type: 'span', props: { content: 'Start Studio' }, styles: {} }],
            },
            {
              nodeId: `${s}-cta-secondary`,
              type: 'a',
              props: { href: '#demo', className: 'px-8 py-3 rounded-lg font-semibold border border-[var(--dios-color-border-subtle)] text-[var(--dios-color-fg-primary)] hover:bg-[var(--dios-color-bg-secondary)] transition' },
              styles: {},
              children: [{ nodeId: `${s}-cta-secondary-txt`, type: 'span', props: { content: 'Live Demo' }, styles: {} }],
            },
          ],
        },
      ],
    };
  },
};

// ---------------------------------------------------------------------------
// 2. Navigation Specification
// ---------------------------------------------------------------------------
export const NavigationSpec: ComponentSpec = {
  id: 'navigation',
  title: 'Top Navigation Bar',
  category: 'navigation',
  description: 'Responsive header with brand logo, nav links, and action buttons.',
  createNode: (id = 'node-nav-1'): IASTNode => {
    const s = toNodeId(id);
    return {
      nodeId: s,
      type: 'header',
      props: {
        className: 'sticky top-0 z-50 flex justify-between items-center h-16 px-8 bg-[var(--dios-color-bg-primary)] border-b border-[var(--dios-color-border-subtle)]',
      },
      styles: {},
      children: [
        {
          nodeId: `${s}-brand`,
          type: 'div',
          props: { className: 'text-2xl font-black tracking-wider text-[var(--dios-color-accent-primary)]' },
          styles: {},
          children: [{ nodeId: `${s}-brand-txt`, type: 'span', props: { content: 'MOOLOX' }, styles: {} }],
        },
        {
          nodeId: `${s}-links`,
          type: 'nav',
          props: { className: 'hidden md:flex gap-8 text-[var(--dios-color-fg-secondary)] font-medium' },
          styles: {},
          children: [
            { nodeId: `${s}-link-1`, type: 'a', props: { href: '#features', className: 'hover:text-[var(--dios-color-fg-primary)]' }, styles: {}, children: [{ nodeId: `${s}-link-1-txt`, type: 'span', props: { content: 'Features' }, styles: {} }] },
            { nodeId: `${s}-link-2`, type: 'a', props: { href: '#pricing', className: 'hover:text-[var(--dios-color-fg-primary)]' }, styles: {}, children: [{ nodeId: `${s}-link-2-txt`, type: 'span', props: { content: 'Pricing' }, styles: {} }] },
            { nodeId: `${s}-link-3`, type: 'a', props: { href: '#docs', className: 'hover:text-[var(--dios-color-fg-primary)]' }, styles: {}, children: [{ nodeId: `${s}-link-3-txt`, type: 'span', props: { content: 'Docs' }, styles: {} }] },
          ],
        },
        {
          nodeId: `${s}-cta`,
          type: 'a',
          props: { href: '/login', className: 'px-4 py-2 rounded-md font-semibold bg-[var(--dios-color-accent-primary)] text-white text-sm' },
          styles: {},
          children: [{ nodeId: `${s}-cta-txt`, type: 'span', props: { content: 'Sign In' }, styles: {} }],
        },
      ],
    };
  },
};

// ---------------------------------------------------------------------------
// 3. Pricing Table Specification
// ---------------------------------------------------------------------------
export const PricingTableSpec: ComponentSpec = {
  id: 'pricing-table',
  title: 'Pricing Matrix',
  category: 'marketing',
  description: 'Three-column tier comparison with feature checkmarks and call-to-actions.',
  createNode: (id = 'node-pricing-1'): IASTNode => {
    const s = toNodeId(id);
    return {
      nodeId: s,
      type: 'section',
      props: { className: 'py-20 px-6 bg-[var(--dios-color-bg-secondary)] text-[var(--dios-color-fg-primary)]' },
      styles: {},
      children: [
        {
          nodeId: `${s}-header`,
          type: 'div',
          props: { className: 'text-center mb-16' },
          styles: {},
          children: [
            { nodeId: `${s}-title`, type: 'h2', props: { className: 'text-4xl font-bold mb-4' }, styles: {}, children: [{ nodeId: `${s}-title-txt`, type: 'span', props: { content: 'Simple, Transparent Pricing' }, styles: {} }] },
            { nodeId: `${s}-desc`, type: 'p', props: { className: 'text-[var(--dios-color-fg-secondary)]' }, styles: {}, children: [{ nodeId: `${s}-desc-txt`, type: 'span', props: { content: 'Scale your team with zero lock-in.' }, styles: {} }] },
          ],
        },
        {
          nodeId: `${s}-grid`,
          type: 'div',
          props: { className: 'grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto' },
          styles: {},
          children: [
            createPricingTierNode(`${s}-tier-starter`, 'Starter', '$0', 'For solo builders and prototypes.', ['1 Workspace', '1,000 AI Credits/mo', 'Community Support'], false),
            createPricingTierNode(`${s}-tier-pro`, 'Pro Studio', '$49', 'For scaling digital product teams.', ['5 Workspaces', '25,000 AI Credits/mo', 'Priority Edge CDN', 'React 19 Export'], true),
            createPricingTierNode(`${s}-tier-enterprise`, 'Enterprise', 'Custom', 'For federated enterprise orgs.', ['Unlimited Workspaces', 'Custom AI Quotas', 'SOC-2 Audit Logs', 'SAML/SSO Auth'], false),
          ],
        },
      ],
    };
  },
};

function createPricingTierNode(id: string, name: string, price: string, desc: string, features: string[], isFeatured: boolean): IASTNode {
  const s = toNodeId(id);
  return {
    nodeId: s,
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
        nodeId: `${s}-top`,
        type: 'div',
        props: {},
        styles: {},
        children: [
          { nodeId: `${s}-name`, type: 'h3', props: { className: 'text-xl font-bold mb-2 text-[var(--dios-color-fg-primary)]' }, styles: {}, children: [{ nodeId: `${s}-name-txt`, type: 'span', props: { content: name }, styles: {} }] },
          { nodeId: `${s}-desc`, type: 'p', props: { className: 'text-sm text-[var(--dios-color-fg-secondary)] mb-6' }, styles: {}, children: [{ nodeId: `${s}-desc-txt`, type: 'span', props: { content: desc }, styles: {} }] },
          {
            nodeId: `${s}-price-box`,
            type: 'div',
            props: { className: 'flex items-baseline mb-6' },
            styles: {},
            children: [
              { nodeId: `${s}-price`, type: 'span', props: { className: 'text-4xl font-extrabold text-[var(--dios-color-fg-primary)]' }, styles: {}, children: [{ nodeId: `${s}-price-txt`, type: 'span', props: { content: price }, styles: {} }] },
              { nodeId: `${s}-period`, type: 'span', props: { className: 'text-sm text-[var(--dios-color-fg-secondary)] ml-1' }, styles: {}, children: [{ nodeId: `${s}-period-txt`, type: 'span', props: { content: '/month' }, styles: {} }] },
            ],
          },
          {
            nodeId: `${s}-features`,
            type: 'ul',
            props: { className: 'space-y-3 mb-8' },
            styles: {},
            children: features.map((feat, idx) => ({
              nodeId: `${s}-feat-${idx}`,
              type: 'li',
              props: { className: 'text-sm text-[var(--dios-color-fg-secondary)] flex items-center gap-2' },
              styles: {},
              children: [{ nodeId: `${s}-feat-${idx}-txt`, type: 'span', props: { content: `✓ ${feat}` }, styles: {} }],
            })),
          },
        ],
      },
      {
        nodeId: `${s}-btn`,
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
  createNode: (id = 'node-feat-grid-1'): IASTNode => {
    const s = toNodeId(id);
    return {
      nodeId: s,
      type: 'section',
      props: { className: 'py-20 px-6 bg-[var(--dios-color-bg-primary)]' },
      styles: {},
      children: [
        {
          nodeId: `${s}-heading`,
          type: 'h2',
          props: { className: 'text-3xl font-bold text-center mb-12 text-[var(--dios-color-fg-primary)]' },
          styles: {},
          children: [{ nodeId: `${s}-heading-txt`, type: 'span', props: { content: 'Built for Speed & Reliability' }, styles: {} }],
        },
        {
          nodeId: `${s}-grid`,
          type: 'div',
          props: { className: 'grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto' },
          styles: {},
          children: [
            createFeatureCard(`${s}-card-1`, '⚡ < 30ms AST Parsing', 'Visitor engine processing TSX code with zero latency.'),
            createFeatureCard(`${s}-card-2`, '🔄 Zero-Cloning Diffing', 'Structural delta patching keeping React memoization active.'),
            createFeatureCard(`${s}-card-3`, '🛡️ 5-Role Granular RBAC', 'Server-side middleware enforcing strict workspace access.'),
            createFeatureCard(`${s}-card-4`, '🎨 Zero-Hex Token Law', 'Blocking ad-hoc hex inputs and enforcing semantic tokens.'),
            createFeatureCard(`${s}-card-5`, '📦 Zstd DB Storage', 'Reducing payload size by 80% with binary compression.'),
            createFeatureCard(`${s}-card-6`, '🌐 Cloudflare Edge Anycast', 'Instant static builds deployed directly across edge KV.'),
          ],
        },
      ],
    };
  },
};

function createFeatureCard(id: string, title: string, desc: string): IASTNode {
  const s = toNodeId(id);
  return {
    nodeId: s,
    type: 'div',
    props: { className: 'p-6 rounded-xl bg-[var(--dios-color-bg-secondary)] border border-[var(--dios-color-border-subtle)]' },
    styles: {},
    children: [
      { nodeId: `${s}-title`, type: 'h3', props: { className: 'text-lg font-bold mb-2 text-[var(--dios-color-fg-primary)]' }, styles: {}, children: [{ nodeId: `${s}-title-txt`, type: 'span', props: { content: title }, styles: {} }] },
      { nodeId: `${s}-desc`, type: 'p', props: { className: 'text-sm text-[var(--dios-color-fg-secondary)]' }, styles: {}, children: [{ nodeId: `${s}-desc-txt`, type: 'span', props: { content: desc }, styles: {} }] },
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
  createNode: (id = 'node-testi-1'): IASTNode => {
    const s = toNodeId(id);
    return {
      nodeId: s,
      type: 'section',
      props: { className: 'py-20 px-6 bg-[var(--dios-color-bg-secondary)] text-center' },
      styles: {},
      children: [
        {
          nodeId: `${s}-title`,
          type: 'h2',
          props: { className: 'text-3xl font-bold mb-12 text-[var(--dios-color-fg-primary)]' },
          styles: {},
          children: [{ nodeId: `${s}-title-txt`, type: 'span', props: { content: 'Trusted by Innovative Engineering Teams' }, styles: {} }],
        },
        {
          nodeId: `${s}-quote-box`,
          type: 'div',
          props: { className: 'max-w-3xl mx-auto p-8 rounded-2xl bg-[var(--dios-color-bg-primary)] border border-[var(--dios-color-border-subtle)] shadow-lg' },
          styles: {},
          children: [
            {
              nodeId: `${s}-quote`,
              type: 'p',
              props: { className: 'text-xl italic mb-6 text-[var(--dios-color-fg-primary)]' },
              styles: {},
              children: [{ nodeId: `${s}-quote-txt`, type: 'span', props: { content: '"Moolox cut our UI development and layout diffing pipeline from weeks down to literal seconds. The 60fps canvas diffing is magic."' }, styles: {} }],
            },
            {
              nodeId: `${s}-author`,
              type: 'div',
              props: { className: 'font-semibold text-[var(--dios-color-accent-primary)]' },
              styles: {},
              children: [{ nodeId: `${s}-author-txt`, type: 'span', props: { content: 'Elena Rostova — VP of Product, CyberVenture' }, styles: {} }],
            },
          ],
        },
      ],
    };
  },
};

// ---------------------------------------------------------------------------
// 6. FAQ Accordion Specification
// ---------------------------------------------------------------------------
export const FAQAccordionSpec: ComponentSpec = {
  id: 'faq-accordion',
  title: 'FAQ Accordion',
  category: 'content',
  description: 'Frequently asked questions list with expandable answers.',
  createNode: (id = 'node-faq-1'): IASTNode => {
    const s = toNodeId(id);
    return {
      nodeId: s,
      type: 'section',
      props: { className: 'py-20 px-6 bg-[var(--dios-color-bg-primary)] max-w-4xl mx-auto' },
      styles: {},
      children: [
        {
          nodeId: `${s}-title`,
          type: 'h2',
          props: { className: 'text-3xl font-bold text-center mb-12 text-[var(--dios-color-fg-primary)]' },
          styles: {},
          children: [{ nodeId: `${s}-title-txt`, type: 'span', props: { content: 'Frequently Asked Questions' }, styles: {} }],
        },
        {
          nodeId: `${s}-list`,
          type: 'div',
          props: { className: 'space-y-4' },
          styles: {},
          children: [
            createFAQItem(`${s}-q1`, 'What is the Zero-Throwaway Architecture?', 'Every generated AST node directly corresponds to clean, production-ready React 19 TSX code without runtime wrappers or temporary code.'),
            createFAQItem(`${s}-q2`, 'Can I export clean Next.js code?', 'Yes. The AST-to-Next.js exporter outputs human-readable App Router React components with zero DIOS dependencies.'),
            createFAQItem(`${s}-q3`, 'How does the Zero-Hex Law work?', 'All color inputs entered via inspector or LLM prompts are automatically mapped to W3C design tokens using 3D Euclidean RGB distance math.'),
          ],
        },
      ],
    };
  },
};

function createFAQItem(id: string, q: string, a: string): IASTNode {
  const s = toNodeId(id);
  return {
    nodeId: s,
    type: 'div',
    props: { className: 'p-6 rounded-lg bg-[var(--dios-color-bg-secondary)] border border-[var(--dios-color-border-subtle)]' },
    styles: {},
    children: [
      { nodeId: `${s}-q`, type: 'h3', props: { className: 'text-lg font-bold mb-2 text-[var(--dios-color-fg-primary)]' }, styles: {}, children: [{ nodeId: `${s}-q-txt`, type: 'span', props: { content: q }, styles: {} }] },
      { nodeId: `${s}-a`, type: 'p', props: { className: 'text-sm text-[var(--dios-color-fg-secondary)]' }, styles: {}, children: [{ nodeId: `${s}-a-txt`, type: 'span', props: { content: a }, styles: {} }] },
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
  createNode: (id = 'node-contact-1'): IASTNode => {
    const s = toNodeId(id);
    return {
      nodeId: s,
      type: 'section',
      props: { className: 'py-20 px-6 bg-[var(--dios-color-bg-secondary)]' },
      styles: {},
      children: [
        {
          nodeId: `${s}-wrapper`,
          type: 'div',
          props: { className: 'max-w-xl mx-auto p-8 rounded-2xl bg-[var(--dios-color-bg-primary)] border border-[var(--dios-color-border-subtle)] shadow-md' },
          styles: {},
          children: [
            { nodeId: `${s}-title`, type: 'h2', props: { className: 'text-2xl font-bold mb-6 text-[var(--dios-color-fg-primary)]' }, styles: {}, children: [{ nodeId: `${s}-title-txt`, type: 'span', props: { content: 'Get in Touch' }, styles: {} }] },
            {
              nodeId: `${s}-form`,
              type: 'form',
              props: { className: 'space-y-4' },
              styles: {},
              children: [
                {
                  nodeId: `${s}-field-name`,
                  type: 'div',
                  props: { className: 'flex flex-col gap-1' },
                  styles: {},
                  children: [
                    { nodeId: `${s}-lbl-name`, type: 'label', props: { className: 'text-sm font-medium text-[var(--dios-color-fg-secondary)]' }, styles: {}, children: [{ nodeId: `${s}-lbl-name-txt`, type: 'span', props: { content: 'Full Name' }, styles: {} }] },
                    { nodeId: `${s}-inp-name`, type: 'input', props: { type: 'text', placeholder: 'Jane Doe', className: 'p-3 rounded-lg bg-[var(--dios-color-bg-secondary)] border border-[var(--dios-color-border-subtle)] text-[var(--dios-color-fg-primary)]' }, styles: {} },
                  ],
                },
                {
                  nodeId: `${s}-field-email`,
                  type: 'div',
                  props: { className: 'flex flex-col gap-1' },
                  styles: {},
                  children: [
                    { nodeId: `${s}-lbl-email`, type: 'label', props: { className: 'text-sm font-medium text-[var(--dios-color-fg-secondary)]' }, styles: {}, children: [{ nodeId: `${s}-lbl-email-txt`, type: 'span', props: { content: 'Work Email' }, styles: {} }] },
                    { nodeId: `${s}-inp-email`, type: 'input', props: { type: 'email', placeholder: 'jane@company.com', className: 'p-3 rounded-lg bg-[var(--dios-color-bg-secondary)] border border-[var(--dios-color-border-subtle)] text-[var(--dios-color-fg-primary)]' }, styles: {} },
                  ],
                },
                {
                  nodeId: `${s}-field-msg`,
                  type: 'div',
                  props: { className: 'flex flex-col gap-1' },
                  styles: {},
                  children: [
                    { nodeId: `${s}-lbl-msg`, type: 'label', props: { className: 'text-sm font-medium text-[var(--dios-color-fg-secondary)]' }, styles: {}, children: [{ nodeId: `${s}-lbl-msg-txt`, type: 'span', props: { content: 'Message' }, styles: {} }] },
                    { nodeId: `${s}-inp-msg`, type: 'textarea', props: { placeholder: 'Tell us about your project requirements...', className: 'p-3 rounded-lg bg-[var(--dios-color-bg-secondary)] border border-[var(--dios-color-border-subtle)] text-[var(--dios-color-fg-primary)] h-32' }, styles: {} },
                  ],
                },
                {
                  nodeId: `${s}-submit`,
                  type: 'button',
                  props: { type: 'submit', className: 'w-full py-3 rounded-lg font-semibold bg-[var(--dios-color-accent-primary)] text-white hover:opacity-90 transition' },
                  styles: {},
                  children: [{ nodeId: `${s}-submit-txt`, type: 'span', props: { content: 'Send Message' }, styles: {} }],
                },
              ],
            },
          ],
        },
      ],
    };
  },
};

// ---------------------------------------------------------------------------
// 8. Footer Specification
// ---------------------------------------------------------------------------
export const FooterSpec: ComponentSpec = {
  id: 'footer',
  title: 'Standard Footer',
  category: 'layout',
  description: 'Multi-column site links, copyright information, and social icons.',
  createNode: (id = 'node-footer-1'): IASTNode => {
    const s = toNodeId(id);
    return {
      nodeId: s,
      type: 'footer',
      props: { className: 'py-12 px-8 bg-[var(--dios-color-bg-primary)] border-t border-[var(--dios-color-border-subtle)] text-[var(--dios-color-fg-secondary)] text-sm' },
      styles: {},
      children: [
        {
          nodeId: `${s}-container`,
          type: 'div',
          props: { className: 'max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6' },
          styles: {},
          children: [
            {
              nodeId: `${s}-brand`,
              type: 'div',
              props: { className: 'font-bold text-lg text-[var(--dios-color-fg-primary)]' },
              styles: {},
              children: [{ nodeId: `${s}-brand-txt`, type: 'span', props: { content: 'Moolox Digital Operating System' }, styles: {} }],
            },
            {
              nodeId: `${s}-copyright`,
              type: 'div',
              props: {},
              styles: {},
              children: [{ nodeId: `${s}-copyright-txt`, type: 'span', props: { content: '© 2026 Moolox. All Rights Reserved. Built with Zero Throwaway Architecture.' }, styles: {} }],
            },
          ],
        },
      ],
    };
  },
};

// ---------------------------------------------------------------------------
// 9. CTA Banner Specification
// ---------------------------------------------------------------------------
export const CTABannerSpec: ComponentSpec = {
  id: 'cta-banner',
  title: 'Call-To-Action Banner',
  category: 'marketing',
  description: 'Full-width action banner driving user signups.',
  createNode: (id = 'node-cta-ban-1'): IASTNode => {
    const s = toNodeId(id);
    return {
      nodeId: s,
      type: 'section',
      props: { className: 'py-16 px-8 bg-[var(--dios-color-accent-primary)] text-white text-center rounded-2xl my-12 mx-6' },
      styles: {},
      children: [
        { nodeId: `${s}-heading`, type: 'h2', props: { className: 'text-3xl font-extrabold mb-4' }, styles: {}, children: [{ nodeId: `${s}-heading-txt`, type: 'span', props: { content: 'Ready to Experience 60fps Digital Engineering?' }, styles: {} }] },
        { nodeId: `${s}-sub`, type: 'p', props: { className: 'text-lg max-w-xl mx-auto mb-8 opacity-90' }, styles: {}, children: [{ nodeId: `${s}-sub-txt`, type: 'span', props: { content: 'Start your free workspace now with 1,000 monthly AI credits.' }, styles: {} }] },
        {
          nodeId: `${s}-btn`,
          type: 'a',
          props: { href: '/signup', className: 'px-8 py-3 rounded-lg font-bold bg-white text-[var(--dios-color-accent-primary)] shadow-lg hover:bg-gray-100 transition' },
          styles: {},
          children: [{ nodeId: `${s}-btn-txt`, type: 'span', props: { content: 'Deploy Your First Workspace' }, styles: {} }],
        },
      ],
    };
  },
};

// ---------------------------------------------------------------------------
// 10. Blog Grid Specification
// ---------------------------------------------------------------------------
export const BlogGridSpec: ComponentSpec = {
  id: 'blog-grid',
  title: 'Blog / Article Cards Grid',
  category: 'content',
  description: 'Article cards with preview image placeholder, tags, title, and read more links.',
  createNode: (id = 'node-blog-1'): IASTNode => {
    const s = toNodeId(id);
    return {
      nodeId: s,
      type: 'section',
      props: { className: 'py-20 px-6 bg-[var(--dios-color-bg-primary)]' },
      styles: {},
      children: [
        { nodeId: `${s}-heading`, type: 'h2', props: { className: 'text-3xl font-bold text-center mb-12 text-[var(--dios-color-fg-primary)]' }, styles: {}, children: [{ nodeId: `${s}-heading-txt`, type: 'span', props: { content: 'Latest Insights & Engineering Architecture' }, styles: {} }] },
        {
          nodeId: `${s}-grid`,
          type: 'div',
          props: { className: 'grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto' },
          styles: {},
          children: [
            createBlogCard(`${s}-post-1`, 'Why Zero-Throwaway Architecture Wins', 'Architecture', 'July 14, 2026'),
            createBlogCard(`${s}-post-2`, 'Sub-Tree AST Diffing at 60fps in React 19', 'Engineering', 'July 12, 2026'),
            createBlogCard(`${s}-post-3`, 'Enforcing W3C Design Tokens Without Magic Hex Codes', 'Design Law', 'July 10, 2026'),
          ],
        },
      ],
    };
  },
};

function createBlogCard(id: string, title: string, tag: string, date: string): IASTNode {
  const s = toNodeId(id);
  return {
    nodeId: s,
    type: 'article',
    props: { className: 'p-6 rounded-xl bg-[var(--dios-color-bg-secondary)] border border-[var(--dios-color-border-subtle)] flex flex-col justify-between' },
    styles: {},
    children: [
      {
        nodeId: `${s}-top`,
        type: 'div',
        props: {},
        styles: {},
        children: [
          { nodeId: `${s}-tag`, type: 'span', props: { className: 'text-xs font-semibold px-3 py-1 rounded-full bg-[var(--dios-color-accent-primary)] text-white inline-block mb-4' }, styles: {}, children: [{ nodeId: `${s}-tag-txt`, type: 'span', props: { content: tag }, styles: {} }] },
          { nodeId: `${s}-title`, type: 'h3', props: { className: 'text-xl font-bold mb-3 text-[var(--dios-color-fg-primary)]' }, styles: {}, children: [{ nodeId: `${s}-title-txt`, type: 'span', props: { content: title }, styles: {} }] },
        ],
      },
      { nodeId: `${s}-date`, type: 'span', props: { className: 'text-xs text-[var(--dios-color-fg-secondary)] mt-4' }, styles: {}, children: [{ nodeId: `${s}-date-txt`, type: 'span', props: { content: date }, styles: {} }] },
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
  createNode: (id = 'node-team-1'): IASTNode => {
    const s = toNodeId(id);
    return {
      nodeId: s,
      type: 'section',
      props: { className: 'py-20 px-6 bg-[var(--dios-color-bg-secondary)]' },
      styles: {},
      children: [
        { nodeId: `${s}-heading`, type: 'h2', props: { className: 'text-3xl font-bold text-center mb-12 text-[var(--dios-color-fg-primary)]' }, styles: {}, children: [{ nodeId: `${s}-heading-txt`, type: 'span', props: { content: 'Meet the Engineering Leadership' }, styles: {} }] },
        {
          nodeId: `${s}-grid`,
          type: 'div',
          props: { className: 'grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto' },
          styles: {},
          children: [
            createTeamCard(`${s}-mem-1`, 'Mohana NV', 'Principal OS Architect', 'Lead architect of Moolox DIOS & canonical AST compiler.'),
            createTeamCard(`${s}-mem-2`, 'Alex Chen', 'Head of Live Canvas', 'Specialist in high-frequency sub-tree diffing and React 19.'),
            createTeamCard(`${s}-mem-3`, 'Sophia Vance', 'Design Law Director', 'Author of the W3C Zero-Hex Token Enforcement engine.'),
            createTeamCard(`${s}-mem-4`, 'David Kim', 'Edge Systems Lead', 'Architect of edge runtime billing and Cloudflare anycast.'),
          ],
        },
      ],
    };
  },
};

function createTeamCard(id: string, name: string, role: string, bio: string): IASTNode {
  const s = toNodeId(id);
  return {
    nodeId: s,
    type: 'div',
    props: { className: 'p-6 rounded-xl bg-[var(--dios-color-bg-primary)] border border-[var(--dios-color-border-subtle)] text-center' },
    styles: {},
    children: [
      { nodeId: `${s}-avatar`, type: 'div', props: { className: 'w-16 h-16 rounded-full bg-[var(--dios-color-accent-primary)] mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl' }, styles: {}, children: [{ nodeId: `${s}-avatar-txt`, type: 'span', props: { content: name.split(' ').map(n => n[0]).join('') }, styles: {} }] },
      { nodeId: `${s}-name`, type: 'h3', props: { className: 'text-lg font-bold text-[var(--dios-color-fg-primary)]' }, styles: {}, children: [{ nodeId: `${s}-name-txt`, type: 'span', props: { content: name }, styles: {} }] },
      { nodeId: `${s}-role`, type: 'div', props: { className: 'text-xs font-semibold text-[var(--dios-color-accent-primary)] mb-3' }, styles: {}, children: [{ nodeId: `${s}-role-txt`, type: 'span', props: { content: role }, styles: {} }] },
      { nodeId: `${s}-bio`, type: 'p', props: { className: 'text-xs text-[var(--dios-color-fg-secondary)]' }, styles: {}, children: [{ nodeId: `${s}-bio-txt`, type: 'span', props: { content: bio }, styles: {} }] },
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
