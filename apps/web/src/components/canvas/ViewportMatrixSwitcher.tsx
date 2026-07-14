/**
 * @moolox/web — Viewport Matrix Switcher (Feature: CNV-003)
 *
 * Toggles the live canvas iframe between target responsive breakpoints (`375px` mobile,
 * `768px` tablet, and `1440px` / `100%` desktop) while preserving 60fps rendering.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import React from 'react';

export type ViewportMode = 'mobile' | 'tablet' | 'desktop';

export interface ViewportDimensions {
  mode: ViewportMode;
  label: string;
  widthPx: number | '100%';
  heightPx: number | '100%';
  icon: string;
}

export const VIEWPORT_PRESETS: Record<ViewportMode, ViewportDimensions> = {
  mobile: {
    mode: 'mobile',
    label: 'Mobile (375px)',
    widthPx: 375,
    heightPx: 812,
    icon: '📱',
  },
  tablet: {
    mode: 'tablet',
    label: 'Tablet (768px)',
    widthPx: 768,
    heightPx: 1024,
    icon: '💻',
  },
  desktop: {
    mode: 'desktop',
    label: 'Desktop (1440px)',
    widthPx: '100%',
    heightPx: '100%',
    icon: '🖥️',
  },
};

export interface ViewportMatrixSwitcherProps {
  activeMode: ViewportMode;
  onChangeViewport: (mode: ViewportMode) => void;
}

export const ViewportMatrixSwitcher: React.FC<ViewportMatrixSwitcherProps> = ({
  activeMode,
  onChangeViewport,
}) => {
  return (
    <div
      className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1"
      role="group"
      aria-label="Viewport Matrix Switcher"
    >
      {(Object.values(VIEWPORT_PRESETS) as ViewportDimensions[]).map((preset) => {
        const isActive = preset.mode === activeMode;
        return (
          <button
            key={preset.mode}
            type="button"
            onClick={() => onChangeViewport(preset.mode)}
            aria-pressed={isActive}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            <span>{preset.icon}</span>
            <span>{preset.label}</span>
          </button>
        );
      })}
    </div>
  );
};
