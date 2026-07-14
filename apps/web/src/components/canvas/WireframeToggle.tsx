/**
 * @moolox/web — Wireframe Mode Toggle (Feature: CNV-004)
 *
 * Activates skeleton layout inspect borders (`outline-dashed`) across all virtualized
 * canvas AST nodes, enabling precision boundary inspection and box model debugging.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import React from 'react';

export interface WireframeToggleProps {
  isWireframeActive: boolean;
  onToggleWireframe: (active: boolean) => void;
}

export const WireframeToggle: React.FC<WireframeToggleProps> = ({
  isWireframeActive,
  onToggleWireframe,
}) => {
  return (
    <button
      type="button"
      onClick={() => onToggleWireframe(!isWireframeActive)}
      aria-pressed={isWireframeActive}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
        isWireframeActive
          ? 'bg-purple-600 border-purple-500 text-white shadow-sm'
          : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
      }`}
      title="Toggle Wireframe Inspect Mode (CNV-004)"
    >
      <span className="text-base">{isWireframeActive ? '🧱' : '📐'}</span>
      <span>{isWireframeActive ? 'Wireframe: ON' : 'Wireframe: OFF'}</span>
    </button>
  );
};
