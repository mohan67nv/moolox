/**
 * @moolox/marketplace — Plugin & Template Marketplace Registry (`MKT-001`)
 *
 * Cataloging verified plugins and community templates, providing search/filter indexing,
 * categories (`AST Generators`, `Theme Kits`, `SEO Tools`, `UI Components`), and metadata.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { type PluginManifest } from '@moolox/plugins';

export type MarketplaceCategory = 'AST Generators' | 'Theme Kits' | 'SEO Tools' | 'UI Components';

export interface MarketplaceItem {
  id: string;
  type: 'plugin' | 'template' | 'component';
  title: string;
  creator: string;
  description: string;
  category: MarketplaceCategory;
  version: string;
  priceCents: number;
  rating: number;
  downloadsCount: number;
  manifest?: PluginManifest;
  templateAST?: Record<string, any>;
  verified: boolean;
  tags: string[];
}

export interface CreatorStorefrontProfile {
  creatorHandle: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  stripeConnectAccountId?: string;
  verifiedSeller: boolean;
  totalItems: number;
  totalDownloads: number;
  averageRating: number;
  items: MarketplaceItem[];
}

export interface SearchQuery {
  category?: MarketplaceCategory;
  searchTerm?: string;
  creatorHandle?: string;
  maxPriceCents?: number;
  onlyVerified?: boolean;
}

export class MarketplaceCatalogRegistry {
  private static items = new Map<string, MarketplaceItem>();
  private static profiles = new Map<string, Omit<CreatorStorefrontProfile, 'totalItems' | 'totalDownloads' | 'averageRating' | 'items'>>();

  /**
   * Registers a new marketplace item into the catalog index (`MKT-001`).
   */
  static registerItem(item: MarketplaceItem): void {
    this.items.set(item.id, { ...item });
  }

  /**
   * Registers or updates a creator profile storefront (`MKT-001`).
   */
  static registerCreatorProfile(profile: Omit<CreatorStorefrontProfile, 'totalItems' | 'totalDownloads' | 'averageRating' | 'items'>): void {
    this.profiles.set(profile.creatorHandle.toLowerCase(), profile);
  }

  /**
   * Retrieves full storefront metrics and item listings for a given creator (`MKT-001`).
   */
  static getStorefrontByCreator(creatorHandle: string): CreatorStorefrontProfile | undefined {
    const cleanHandle = creatorHandle.toLowerCase().replace(/^@/, '');
    const profile = this.profiles.get(cleanHandle);
    const creatorItems = Array.from(this.items.values()).filter(
      (item) => item.creator.toLowerCase().replace(/^@/, '') === cleanHandle
    );

    if (!profile && creatorItems.length === 0) return undefined;

    const totalDownloads = creatorItems.reduce((sum, item) => sum + item.downloadsCount, 0);
    const avgRating = creatorItems.length > 0
      ? Number((creatorItems.reduce((sum, item) => sum + item.rating, 0) / creatorItems.length).toFixed(1))
      : 5.0;

    return {
      creatorHandle: cleanHandle,
      displayName: profile?.displayName || cleanHandle,
      bio: profile?.bio || `Verified Moolox Studio Creator (@${cleanHandle})`,
      avatarUrl: profile?.avatarUrl || `https://api.moolox.app/avatars/${cleanHandle}.png`,
      stripeConnectAccountId: profile?.stripeConnectAccountId,
      verifiedSeller: profile?.verifiedSeller ?? true,
      totalItems: creatorItems.length,
      totalDownloads,
      averageRating: avgRating,
      items: creatorItems,
    };
  }

  /**
   * Increments the download counter for an item upon workspace installation (`MKT-002`).
   */
  static incrementDownloadCount(id: string): boolean {
    const item = this.items.get(id);
    if (!item) return false;
    item.downloadsCount++;
    return true;
  }

  /**
   * Searches and filters the catalog index based on criteria (`MKT-001`).
   */
  static search(query: SearchQuery = {}): MarketplaceItem[] {
    const all = Array.from(this.items.values());

    return all.filter((item) => {
      if (query.category && item.category !== query.category) return false;
      if (query.onlyVerified && !item.verified) return false;
      if (typeof query.maxPriceCents === 'number' && item.priceCents > query.maxPriceCents) return false;
      if (query.creatorHandle && item.creator.toLowerCase().replace(/^@/, '') !== query.creatorHandle.toLowerCase().replace(/^@/, '')) {
        return false;
      }

      if (query.searchTerm) {
        const term = query.searchTerm.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(term);
        const matchesDesc = item.description.toLowerCase().includes(term);
        const matchesCreator = item.creator.toLowerCase().includes(term);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(term));
        if (!matchesTitle && !matchesDesc && !matchesCreator && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Pre-populates default verified seed catalog for production (`MKT-001`).
   */
  static seedDefaultItems(): void {
    if (this.items.size > 0) return;

    this.registerCreatorProfile({
      creatorHandle: 'moolox-core',
      displayName: 'Moolox Official Core Team',
      bio: 'High-performance canonical AST components, design token kits, and SEO utilities.',
      verifiedSeller: true,
    });

    this.registerItem({
      id: 'item-seo-audit-plugin',
      type: 'plugin',
      title: 'Automated Core Web Vitals & SEO Auditor',
      creator: 'moolox-core',
      description: 'Real-time LCP/CLS simulation and meta tag verification inside the studio property inspector.',
      category: 'SEO Tools',
      version: '2.4.0',
      priceCents: 0,
      rating: 4.9,
      downloadsCount: 1420,
      verified: true,
      tags: ['seo', 'core-web-vitals', 'meta', 'audit'],
      manifest: {
        id: 'seo-auditor',
        name: 'SEO Auditor Pro',
        version: '2.4.0',
        author: 'Moolox Official',
        description: 'Real-time LCP/CLS simulation and meta tag verification inside the studio property inspector.',
        permissions: ['read:ast', 'read:tokens'],
        entryPoint: 'src/index.js',
        hooks: ['onASTInspect'],
      },
    });

    this.registerItem({
      id: 'item-saas-hero-pro',
      type: 'template',
      title: 'SaaS Launchpad Pro Hero Kit',
      creator: 'moolox-core',
      description: 'Conversion-optimized dark mode hero section with glassmorphic cards and dynamic grid layout.',
      category: 'UI Components',
      version: '1.2.0',
      priceCents: 2900, // $29.00 USD
      rating: 4.8,
      downloadsCount: 650,
      verified: true,
      tags: ['hero', 'saas', 'dark-mode', 'glassmorphism'],
      templateAST: {
        nodeId: 'node-a1b2c3d4-1111-2222-3333-1234567890ab',
        type: 'HeroContainer',
        props: { headline: 'Ship Next-Gen AI Web Apps' },
        styles: { 'background-color': 'colors.bg.main' },
        children: [],
      },
    });
  }

  static getItem(id: string): MarketplaceItem | undefined {
    return this.items.get(id);
  }

  static getAll(): MarketplaceItem[] {
    return Array.from(this.items.values());
  }

  static resetForTest(): void {
    this.items.clear();
    this.profiles.clear();
  }
}

