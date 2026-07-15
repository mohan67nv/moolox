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
  type: 'plugin' | 'template';
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

export interface SearchQuery {
  category?: MarketplaceCategory;
  searchTerm?: string;
  maxPriceCents?: number;
  onlyVerified?: boolean;
}

export class MarketplaceCatalogRegistry {
  private static items = new Map<string, MarketplaceItem>();

  /**
   * Registers a new marketplace item into the catalog index (`MKT-001`).
   */
  static registerItem(item: MarketplaceItem): void {
    this.items.set(item.id, { ...item });
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

  static getItem(id: string): MarketplaceItem | undefined {
    return this.items.get(id);
  }

  static getAll(): MarketplaceItem[] {
    return Array.from(this.items.values());
  }

  static resetForTest(): void {
    this.items.clear();
  }
}
