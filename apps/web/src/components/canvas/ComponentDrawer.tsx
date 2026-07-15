/**
 * @moolox/web — 1-Click Component Insertion Drawer (CMP-003)
 *
 * Left-hand slide-over interface cataloging all 11 canonical core component
 * specifications (`CMP-001`). Allows 1-click structural insertion (`ADD_CHILD`)
 * into the active AST tree with instant visual feedback.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import React, { useState, useMemo } from 'react';
import { CORE_COMPONENTS_REGISTRY, type ComponentSpec } from '@moolox/ast-core';

export interface ComponentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertComponent: (specId: string) => void;
  selectedNodeId?: string | null;
}

export const ComponentDrawer: React.FC<ComponentDrawerProps> = ({
  isOpen,
  onClose,
  onInsertComponent,
  selectedNodeId,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSpecs = useMemo(() => {
    return CORE_COMPONENTS_REGISTRY.filter((spec) => {
      const matchesCategory = activeCategory === 'all' || spec.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        spec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spec.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All (11)' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'forms', label: 'Forms' },
    { id: 'content', label: 'Content' },
  ];

  const getCategoryIcon = (category: ComponentSpec['category']): string => {
    switch (category) {
      case 'marketing':
        return '🚀';
      case 'navigation':
        return '🧭';
      case 'forms':
        return '📝';
      case 'content':
        return '📰';
      case 'layout':
        return '📐';
      default:
        return '📦';
    }
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-80 bg-gray-950 border-r border-gray-800 shadow-2xl flex flex-col text-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-800 bg-gray-900/60">
        <div className="flex items-center gap-2">
          <span className="text-lg">📦</span>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-white">Component Library</h2>
            <p className="text-[11px] text-gray-400">1-Click W3C Insertion (CMP-003)</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-white px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 transition text-xs font-semibold"
        >
          ✕
        </button>
      </div>

      {/* Target Notice */}
      <div className="px-4 py-2 bg-blue-950/40 border-b border-blue-900/40 text-[11px] text-blue-300 flex items-center justify-between">
        <span>Target: <strong className="font-mono text-white">{selectedNodeId || 'Root Container'}</strong></span>
        <span className="text-[10px] bg-blue-900/60 px-1.5 py-0.5 rounded">ADD_CHILD</span>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-gray-800 bg-gray-900/30">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search 11 core components..."
          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto px-3 py-2 border-b border-gray-800 bg-gray-950 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Component Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredSpecs.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-xs">
            <p>No components match your search.</p>
          </div>
        ) : (
          filteredSpecs.map((spec) => (
            <div
              key={spec.id}
              className="p-3 rounded-xl bg-gray-900/50 hover:bg-gray-900 border border-gray-800/80 hover:border-blue-500/60 transition group flex flex-col justify-between gap-2 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg bg-gray-800 p-1.5 rounded-lg border border-gray-700">
                    {getCategoryIcon(spec.category)}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition">
                      {spec.title}
                    </h3>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">
                      {spec.id}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">
                {spec.description}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-gray-800/60">
                <span className="text-[10px] text-gray-500 font-mono">AST Tree Sub-Tree</span>
                <button
                  type="button"
                  onClick={() => onInsertComponent(spec.id)}
                  className="px-3 py-1 bg-blue-600/90 hover:bg-blue-600 text-white font-semibold rounded-lg transition text-xs flex items-center gap-1 shadow-sm"
                >
                  <span>➕ Insert</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-800 bg-gray-900/80 text-[11px] text-gray-400 flex items-center justify-between font-mono">
        <span>Specs Catalog</span>
        <span className="text-blue-400">11 Canonical Specs</span>
      </div>
    </div>
  );
};
