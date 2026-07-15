/**
 * @moolox/tokens — 50 Obsidian Brand Presets Registry (CMP-002)
 *
 * Provides exactly 50 production-ready, hardcoded W3C design token brand presets
 * across `dark`, `light`, `vibrant`, `minimal`, `enterprise`, and `creative` categories.
 * Each preset recompiles `tokens.json` and updates the virtualized canvas in `< 50ms`.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { type IW3CTokenMap } from '@moolox/types';

export interface BrandPresetSpecification {
  /** Unique preset slug (`cyberpunk-dark`, `fintech-clean`, etc.) */
  id: string;
  /** Human-readable brand name */
  name: string;
  /** Short aesthetic description */
  description: string;
  /** Category classification */
  category: 'dark' | 'light' | 'vibrant' | 'minimal' | 'enterprise' | 'creative';
  /** Primary background hex preview */
  primaryBg: string;
  /** Primary accent hex preview */
  primaryAccent: string;
  /** Canonical W3C token map (`IW3CTokenMap`) */
  tokens: IW3CTokenMap;
}

function createBaseTokenMap(
  bgPrimary: string,
  bgSecondary: string,
  fgPrimary: string,
  fgSecondary: string,
  accentPrimary: string,
  accentSecondary: string,
  borderPrimary: string,
  errorHex = '#ef4444',
  fontHeading = 'Inter, sans-serif',
  fontBody = 'Inter, sans-serif',
): IW3CTokenMap {
  return {
    color: {
      bg: {
        primary: { value: bgPrimary, type: 'color' },
        secondary: { value: bgSecondary, type: 'color' },
      },
      fg: {
        primary: { value: fgPrimary, type: 'color' },
        secondary: { value: fgSecondary, type: 'color' },
      },
      accent: {
        primary: { value: accentPrimary, type: 'color' },
        secondary: { value: accentSecondary, type: 'color' },
        error: { value: errorHex, type: 'color' },
      },
      border: {
        primary: { value: borderPrimary, type: 'color' },
      },
    },
    space: {
      '4': { value: '4px', type: 'dimension' },
      '8': { value: '8px', type: 'dimension' },
      '12': { value: '12px', type: 'dimension' },
      '16': { value: '16px', type: 'dimension' },
      '24': { value: '24px', type: 'dimension' },
      '32': { value: '32px', type: 'dimension' },
      '48': { value: '48px', type: 'dimension' },
      '64': { value: '64px', type: 'dimension' },
    },
    font: {
      heading: {
        family: { value: fontHeading, type: 'fontFamily' },
      },
      body: {
        family: { value: fontBody, type: 'fontFamily' },
      },
    },
  };
}

/**
 * Registry containing exactly 50 canonical Obsidian brand presets (`CMP-002`).
 */
export const BRAND_PRESETS_REGISTRY: BrandPresetSpecification[] = [
  // 1-10: Dark & Cyberpunk
  {
    id: 'cyberpunk-dark',
    name: 'Cyberpunk Dark',
    description: 'Neon purple aesthetics on deep void navy background.',
    category: 'dark',
    primaryBg: '#0b0f19',
    primaryAccent: '#a855f7',
    tokens: createBaseTokenMap('#0b0f19', '#131929', '#f8fafc', '#94a3b8', '#a855f7', '#ec4899', '#1e293b'),
  },
  {
    id: 'tokyo-neon',
    name: 'Tokyo Neon',
    description: 'Vibrant cyan and magenta electric highlights over pitch black.',
    category: 'vibrant',
    primaryBg: '#08080c',
    primaryAccent: '#06b6d4',
    tokens: createBaseTokenMap('#08080c', '#121218', '#ffffff', '#a1a1aa', '#06b6d4', '#f43f5e', '#27272a'),
  },
  {
    id: 'dracula-pro',
    name: 'Dracula Pro',
    description: 'Famous gothic vampire palette with soft lavender accents.',
    category: 'dark',
    primaryBg: '#282a36',
    primaryAccent: '#bd93f9',
    tokens: createBaseTokenMap('#282a36', '#44475a', '#f8f8f2', '#6272a4', '#bd93f9', '#ff79c6', '#6272a4'),
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    description: 'Precision low-fatigue teal and yellow dark tone.',
    category: 'dark',
    primaryBg: '#002b36',
    primaryAccent: '#2aa198',
    tokens: createBaseTokenMap('#002b36', '#073642', '#839496', '#586e75', '#2aa198', '#b58900', '#073642'),
  },
  {
    id: 'monokai-vibe',
    name: 'Monokai Vibe',
    description: 'Warm charcoal background with acid green and orange pops.',
    category: 'dark',
    primaryBg: '#272822',
    primaryAccent: '#a6e22e',
    tokens: createBaseTokenMap('#272822', '#3e3d32', '#f8f8f2', '#75715e', '#a6e22e', '#fd971f', '#49483e'),
  },
  {
    id: 'synthwave-84',
    name: 'Synthwave 84',
    description: 'Retrofuturistic sunset pinks over deep violet sky.',
    category: 'vibrant',
    primaryBg: '#1f1a3a',
    primaryAccent: '#ff71ce',
    tokens: createBaseTokenMap('#1f1a3a', '#2d2552', '#ffffff', '#b3abdb', '#ff71ce', '#01cdfe', '#403572'),
  },
  {
    id: 'terminal-green',
    name: 'Terminal Green',
    description: 'Classic phosphor green monochrome CRT computer console.',
    category: 'creative',
    primaryBg: '#050d05',
    primaryAccent: '#22c55e',
    tokens: createBaseTokenMap('#050d05', '#0c1a0c', '#4ade80', '#166534', '#22c55e', '#15803d', '#14532d'),
  },
  {
    id: 'deep-space',
    name: 'Deep Space',
    description: 'Ultra-deep cosmic black with starlight white and cobalt.',
    category: 'dark',
    primaryBg: '#030712',
    primaryAccent: '#3b82f6',
    tokens: createBaseTokenMap('#030712', '#111827', '#f9fafb', '#6b7280', '#3b82f6', '#60a5fa', '#1f2937'),
  },
  {
    id: 'obsidian-black',
    name: 'Obsidian Black',
    description: 'Pure stealth dark mode with diamond white contrast.',
    category: 'minimal',
    primaryBg: '#000000',
    primaryAccent: '#ffffff',
    tokens: createBaseTokenMap('#000000', '#121212', '#ffffff', '#888888', '#ffffff', '#cccccc', '#222222'),
  },
  {
    id: 'cyber-matrix',
    name: 'Cyber Matrix',
    description: 'Digital rain emerald glow over obsidian grid.',
    category: 'dark',
    primaryBg: '#020d08',
    primaryAccent: '#10b981',
    tokens: createBaseTokenMap('#020d08', '#062015', '#ecfdf5', '#6ee7b7', '#10b981', '#059669', '#0d3826'),
  },

  // 11-20: Fintech & SaaS Modern
  {
    id: 'fintech-clean',
    name: 'Fintech Clean',
    description: 'High-trust sapphire blue with immaculate white surface.',
    category: 'enterprise',
    primaryBg: '#ffffff',
    primaryAccent: '#2563eb',
    tokens: createBaseTokenMap('#ffffff', '#f8fafc', '#0f172a', '#475569', '#2563eb', '#1d4ed8', '#e2e8f0'),
  },
  {
    id: 'saas-modern',
    name: 'SaaS Modern',
    description: 'Slate dark header theme with conversion-ready emerald green.',
    category: 'enterprise',
    primaryBg: '#0f172a',
    primaryAccent: '#10b981',
    tokens: createBaseTokenMap('#0f172a', '#1e293b', '#f8fafc', '#94a3b8', '#10b981', '#3b82f6', '#334155'),
  },
  {
    id: 'corporate-navy',
    name: 'Corporate Navy',
    description: 'Authoritative deep navy blue with polished gold highlights.',
    category: 'enterprise',
    primaryBg: '#0a192f',
    primaryAccent: '#d97706',
    tokens: createBaseTokenMap('#0a192f', '#172a45', '#e6f1ff', '#8892b0', '#d97706', '#64ffda', '#233554'),
  },
  {
    id: 'biotech-green',
    name: 'BioTech Green',
    description: 'Scientific clean white with cellular mint and seafoam.',
    category: 'light',
    primaryBg: '#f9fbfb',
    primaryAccent: '#059669',
    tokens: createBaseTokenMap('#f9fbfb', '#f0fdf4', '#064e3b', '#047857', '#059669', '#10b981', '#d1fae5'),
  },
  {
    id: 'web3-glass',
    name: 'Web3 Glass',
    description: 'Decentralized dark glassmorphism with iridescent cyan.',
    category: 'vibrant',
    primaryBg: '#0d1117',
    primaryAccent: '#38bdf8',
    tokens: createBaseTokenMap('#0d1117', '#161b22', '#c9d1d9', '#8b949e', '#38bdf8', '#818cf8', '#30363d'),
  },
  {
    id: 'ai-quantum',
    name: 'AI Quantum',
    description: 'Deep neural network indigo with ultraviolet quantum glow.',
    category: 'vibrant',
    primaryBg: '#0f0c20',
    primaryAccent: '#8b5cf6',
    tokens: createBaseTokenMap('#0f0c20', '#1c1638', '#ede9fe', '#a78bfa', '#8b5cf6', '#c084fc', '#2e2459'),
  },
  {
    id: 'slate-clean',
    name: 'Slate Clean',
    description: 'Professional neutral slate gray with blue primary action.',
    category: 'minimal',
    primaryBg: '#f8fafc',
    primaryAccent: '#0284c7',
    tokens: createBaseTokenMap('#f8fafc', '#f1f5f9', '#0f172a', '#64748b', '#0284c7', '#0369a1', '#cbd5e1'),
  },
  {
    id: 'emerald-city',
    name: 'Emerald City',
    description: 'Prosperous dark green forest with sparkling jade accents.',
    category: 'dark',
    primaryBg: '#041f14',
    primaryAccent: '#34d399',
    tokens: createBaseTokenMap('#041f14', '#083322', '#ecfdf5', '#6ee7b7', '#34d399', '#10b981', '#0e4f35'),
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    description: 'Sleek midnight blue with ice white typography.',
    category: 'dark',
    primaryBg: '#090d16',
    primaryAccent: '#60a5fa',
    tokens: createBaseTokenMap('#090d16', '#131c2e', '#f8fafc', '#94a3b8', '#60a5fa', '#3b82f6', '#1e293b'),
  },
  {
    id: 'glacier-white',
    name: 'Glacier White',
    description: 'Ultra-crisp arctic white with freezing blue accents.',
    category: 'light',
    primaryBg: '#ffffff',
    primaryAccent: '#0284c7',
    tokens: createBaseTokenMap('#ffffff', '#f0f9ff', '#0c4a6e', '#0369a1', '#0284c7', '#38bdf8', '#bae6fd'),
  },

  // 21-30: Editorial & Luxury
  {
    id: 'editorial-luxury',
    name: 'Editorial Luxury',
    description: 'High-end magazine dark editorial with warm amber gold.',
    category: 'creative',
    primaryBg: '#121212',
    primaryAccent: '#d97706',
    tokens: createBaseTokenMap('#121212', '#1e1e1e', '#f5f5f4', '#a8a29e', '#d97706', '#f59e0b', '#292524'),
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    description: 'Regal black velvet accompanied by metallic gold leaf.',
    category: 'creative',
    primaryBg: '#0a0a0a',
    primaryAccent: '#eab308',
    tokens: createBaseTokenMap('#0a0a0a', '#171717', '#fafafa', '#a3a3a3', '#eab308', '#ca8a04', '#262626'),
  },
  {
    id: 'nord-minimal',
    name: 'Nord Minimal',
    description: 'Arctic fjord calm blue-gray palette with polar frost.',
    category: 'minimal',
    primaryBg: '#2e3440',
    primaryAccent: '#88c0d0',
    tokens: createBaseTokenMap('#2e3440', '#3b4252', '#eceff4', '#d8dee9', '#88c0d0', '#81a1c1', '#4c566a'),
  },
  {
    id: 'neo-brutalism',
    name: 'Neo Brutalism',
    description: 'Bold stark borders with high-contrast electric yellow.',
    category: 'creative',
    primaryBg: '#fffbeb',
    primaryAccent: '#000000',
    tokens: createBaseTokenMap('#fffbeb', '#fef3c7', '#000000', '#451a03', '#000000', '#f59e0b', '#000000'),
  },
  {
    id: 'swiss-graphic',
    name: 'Swiss Graphic',
    description: 'International typographic style in pure crimson and white.',
    category: 'minimal',
    primaryBg: '#ffffff',
    primaryAccent: '#dc2626',
    tokens: createBaseTokenMap('#ffffff', '#fef2f2', '#111827', '#4b5563', '#dc2626', '#b91c1c', '#e5e7eb'),
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    description: 'Delicate warm blush rose over silky dark slate.',
    category: 'creative',
    primaryBg: '#18181b',
    primaryAccent: '#f43f5e',
    tokens: createBaseTokenMap('#18181b', '#27272a', '#fff1f2', '#fda4af', '#f43f5e', '#fb7185', '#3f3f46'),
  },
  {
    id: 'ember-rust',
    name: 'Ember Rust',
    description: 'Cozy autumn bonfire amber over roasted charcoal.',
    category: 'dark',
    primaryBg: '#1c1917',
    primaryAccent: '#ea580c',
    tokens: createBaseTokenMap('#1c1917', '#292524', '#ffedd5', '#fdba74', '#ea580c', '#f97316', '#44403c'),
  },
  {
    id: 'pastel-dream',
    name: 'Pastel Dream',
    description: 'Soft lavender and mint cotton candy light palette.',
    category: 'light',
    primaryBg: '#fdf4ff',
    primaryAccent: '#c084fc',
    tokens: createBaseTokenMap('#fdf4ff', '#fae8ff', '#4a044e', '#86198f', '#c084fc', '#e879f9', '#f0abfc'),
  },
  {
    id: 'sepia-retro',
    name: 'Sepia Retro',
    description: 'Vintage aged book paper with warm espresso typography.',
    category: 'creative',
    primaryBg: '#fef3c7',
    primaryAccent: '#78350f',
    tokens: createBaseTokenMap('#fef3c7', '#fde68a', '#451a03', '#92400e', '#78350f', '#b45309', '#d97706'),
  },
  {
    id: 'bonsai-zen',
    name: 'Bonsai Zen',
    description: 'Japanese garden organic tea green on peaceful stone gray.',
    category: 'minimal',
    primaryBg: '#f4f6f4',
    primaryAccent: '#3f624d',
    tokens: createBaseTokenMap('#f4f6f4', '#e8ece9', '#1e2d24', '#4d6054', '#3f624d', '#5c806b', '#c2ccc5'),
  },

  // 31-40: Creative & Vibrant
  {
    id: 'ocean-mist',
    name: 'Ocean Mist',
    description: 'Calm Pacific teal and sea foam white.',
    category: 'light',
    primaryBg: '#f0fdf4',
    primaryAccent: '#0d9488',
    tokens: createBaseTokenMap('#f0fdf4', '#ccfbf1', '#134e4a', '#0f766e', '#0d9488', '#14b8a6', '#99f6e4'),
  },
  {
    id: 'forest-pine',
    name: 'Forest Pine',
    description: 'Deep woodland pine needle dark green.',
    category: 'dark',
    primaryBg: '#061a14',
    primaryAccent: '#22c55e',
    tokens: createBaseTokenMap('#061a14', '#0d2820', '#f0fdf4', '#86efac', '#22c55e', '#4ade80', '#154133'),
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    description: 'Golden hour orange and purple horizon.',
    category: 'vibrant',
    primaryBg: '#181124',
    primaryAccent: '#f97316',
    tokens: createBaseTokenMap('#181124', '#261b38', '#fff7ed', '#fdba74', '#f97316', '#a855f7', '#3d2c58'),
  },
  {
    id: 'crimson-peak',
    name: 'Crimson Peak',
    description: 'Dramatic blood ruby red accents over obsidian.',
    category: 'dark',
    primaryBg: '#0f0a0a',
    primaryAccent: '#e11d48',
    tokens: createBaseTokenMap('#0f0a0a', '#1a1212', '#ffe4e6', '#f43f5e', '#e11d48', '#be123c', '#332020'),
  },
  {
    id: 'royal-amethyst',
    name: 'Royal Amethyst',
    description: 'Majestic purple velvet with crown gold highlights.',
    category: 'creative',
    primaryBg: '#130d1f',
    primaryAccent: '#a855f7',
    tokens: createBaseTokenMap('#130d1f', '#201633', '#faf5ff', '#d8b4fe', '#a855f7', '#eab308', '#382857'),
  },
  {
    id: 'minimal-cream',
    name: 'Minimal Cream',
    description: 'Warm cream canvas with soft cocoa text.',
    category: 'minimal',
    primaryBg: '#faf8f5',
    primaryAccent: '#57534e',
    tokens: createBaseTokenMap('#faf8f5', '#f5f0eb', '#292524', '#78716c', '#57534e', '#a8a29e', '#e7e5e4'),
  },
  {
    id: 'desert-sand',
    name: 'Desert Sand',
    description: 'Sunbaked terracotta orange on warm sandy beige.',
    category: 'light',
    primaryBg: '#fefce8',
    primaryAccent: '#d97706',
    tokens: createBaseTokenMap('#fefce8', '#fef9c3', '#451a03', '#92400e', '#d97706', '#b45309', '#fde047'),
  },
  {
    id: 'arctic-frost',
    name: 'Arctic Frost',
    description: 'Icy cyan blue highlights over subzero silver.',
    category: 'light',
    primaryBg: '#f0f9ff',
    primaryAccent: '#0284c7',
    tokens: createBaseTokenMap('#f0f9ff', '#e0f2fe', '#082f49', '#0369a1', '#0284c7', '#38bdf8', '#bae6fd'),
  },
  {
    id: 'lava-red',
    name: 'Lava Red',
    description: 'Volcanic molten red fire against hardened basalt.',
    category: 'dark',
    primaryBg: '#140c0c',
    primaryAccent: '#ef4444',
    tokens: createBaseTokenMap('#140c0c', '#241414', '#fef2f2', '#fca5a5', '#ef4444', '#dc2626', '#3f2222'),
  },
  {
    id: 'velvet-violet',
    name: 'Velvet Violet',
    description: 'Plum and violet twilight with soft lilac glow.',
    category: 'creative',
    primaryBg: '#170f1c',
    primaryAccent: '#9333ea',
    tokens: createBaseTokenMap('#170f1c', '#271930', '#faf5ff', '#e9d5ff', '#9333ea', '#c084fc', '#40294f'),
  },

  // 41-50: Expanded Spectrum
  {
    id: 'electric-blue',
    name: 'Electric Blue',
    description: 'High-voltage azure blue over dark carbon fiber.',
    category: 'vibrant',
    primaryBg: '#080c14',
    primaryAccent: '#2563eb',
    tokens: createBaseTokenMap('#080c14', '#111827', '#eff6ff', '#93c5fd', '#2563eb', '#3b82f6', '#1e293b'),
  },
  {
    id: 'mustard-yellow',
    name: 'Mustard Yellow',
    description: 'Bold mustard yellow accents on industrial slate.',
    category: 'creative',
    primaryBg: '#1e293b',
    primaryAccent: '#eab308',
    tokens: createBaseTokenMap('#1e293b', '#334155', '#fefce8', '#fef08a', '#eab308', '#ca8a04', '#475569'),
  },
  {
    id: 'slate-dark',
    name: 'Slate Dark',
    description: 'Balanced developer dark mode with steel blue.',
    category: 'dark',
    primaryBg: '#0f172a',
    primaryAccent: '#38bdf8',
    tokens: createBaseTokenMap('#0f172a', '#1e293b', '#f8fafc', '#94a3b8', '#38bdf8', '#0284c7', '#334155'),
  },
  {
    id: 'titanium-silver',
    name: 'Titanium Silver',
    description: 'Sleek brushed silver metallic on gunmetal dark.',
    category: 'minimal',
    primaryBg: '#18181b',
    primaryAccent: '#a1a1aa',
    tokens: createBaseTokenMap('#18181b', '#27272a', '#fafafa', '#d4d4d8', '#a1a1aa', '#e4e4e7', '#3f3f46'),
  },
  {
    id: 'neon-peach',
    name: 'Neon Peach',
    description: 'Vibrant neon peach and coral over warm dark void.',
    category: 'vibrant',
    primaryBg: '#1a1014',
    primaryAccent: '#fb7185',
    tokens: createBaseTokenMap('#1a1014', '#2b1b22', '#fff1f2', '#fecdd3', '#fb7185', '#f43f5e', '#452b36'),
  },
  {
    id: 'matcha-green',
    name: 'Matcha Green',
    description: 'Natural organic matcha green over soft warm white.',
    category: 'light',
    primaryBg: '#fcfaf7',
    primaryAccent: '#65a30d',
    tokens: createBaseTokenMap('#fcfaf7', '#f5f2eb', '#1a2e05', '#3f6212', '#65a30d', '#84cc16', '#e4ded4'),
  },
  {
    id: 'cloud-white',
    name: 'Cloud White',
    description: 'Airy cloud white with gentle sky blue interface.',
    category: 'light',
    primaryBg: '#ffffff',
    primaryAccent: '#0ea5e9',
    tokens: createBaseTokenMap('#ffffff', '#f0f9ff', '#0f172a', '#64748b', '#0ea5e9', '#38bdf8', '#e2e8f0'),
  },
  {
    id: 'grapefruit-pink',
    name: 'Grapefruit Pink',
    description: 'Zesty grapefruit pink action over clean white surface.',
    category: 'vibrant',
    primaryBg: '#ffffff',
    primaryAccent: '#ec4899',
    tokens: createBaseTokenMap('#ffffff', '#fdf2f8', '#1f2937', '#6b7280', '#ec4899', '#f472b6', '#f3f4f6'),
  },
  {
    id: 'tangerine-orange',
    name: 'Tangerine Orange',
    description: 'Energetic tangerine orange on crisp modern light background.',
    category: 'vibrant',
    primaryBg: '#fffbeb',
    primaryAccent: '#f97316',
    tokens: createBaseTokenMap('#fffbeb', '#fef3c7', '#431407', '#9a3412', '#f97316', '#fb923c', '#fde68a'),
  },
  {
    id: 'coffee-brown',
    name: 'Coffee Brown',
    description: 'Rich espresso roast and caramel over dark roast bean.',
    category: 'dark',
    primaryBg: '#171210',
    primaryAccent: '#d97706',
    tokens: createBaseTokenMap('#171210', '#261e1a', '#fef3c7', '#fde68a', '#d97706', '#b45309', '#3d302a'),
  },
];

/**
 * Retrieves a brand preset by its unique ID (`cyberpunk-dark`, etc.).
 * Returns `Cyberpunk Dark` (`cyberpunk-dark`) if ID is not found.
 */
export function getBrandPresetById(presetId: string): BrandPresetSpecification {
  return (
    BRAND_PRESETS_REGISTRY.find((p) => p.id === presetId || p.id === presetId.toLowerCase()) ||
    BRAND_PRESETS_REGISTRY[0]!
  );
}
