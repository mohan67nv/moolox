/**
 * @moolox/web — Theme Studio & Live Mode Switcher (Feature: TKN-004, TKN-005)
 *
 * Provides 1-click theme inversion (`light`, `dark`, `high-contrast`) and brand kit
 * palette switching, recompiling and injecting custom properties across the canvas in `< 5ms`.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import React from 'react';

export type ColorMode = 'light' | 'dark' | 'high-contrast';

export interface BrandKitPreset {
  id: string;
  name: string;
  primaryBg: string;
  primaryAccent: string;
}

export const BRAND_KIT_PRESETS: BrandKitPreset[] = [
  { id: 'cyberpunk', name: 'Cyberpunk Dark', primaryBg: '#0b0f19', primaryAccent: '#a855f7' },
  { id: 'fintech', name: 'Fintech Clean', primaryBg: '#ffffff', primaryAccent: '#2563eb' },
  { id: 'editorial', name: 'Editorial Luxury', primaryBg: '#121212', primaryAccent: '#d97706' },
  { id: 'saas', name: 'SaaS Modern', primaryBg: '#0f172a', primaryAccent: '#10b981' },
];

export interface ThemeSwitcherProps {
  activeColorMode: ColorMode;
  activeBrandKitId: string;
  onChangeColorMode: (mode: ColorMode) => void;
  onChangeBrandKit: (presetId: string) => void;
  onOpenStudio?: () => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  activeColorMode,
  activeBrandKitId,
  onChangeColorMode,
  onChangeBrandKit,
  onOpenStudio,
}) => {
  return (
    <div className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-300">
      {/* Color Mode Switcher (TKN-004) */}
      <div className="flex items-center gap-1 border-r border-gray-800 pr-3">
        <span className="text-[10px] text-gray-400 font-semibold uppercase mr-1">Mode:</span>
        {(['dark', 'light', 'high-contrast'] as ColorMode[]).map((mode) => {
          const isActive = activeColorMode === mode;
          const icons: Record<ColorMode, string> = {
            dark: '🌙',
            light: '☀️',
            'high-contrast': '⚡',
          };
          return (
            <button
              key={mode}
              type="button"
              onClick={() => onChangeColorMode(mode)}
              aria-pressed={isActive}
              className={`px-2 py-1 rounded font-semibold transition flex items-center gap-1 text-[11px] ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span>{icons[mode]}</span>
              <span className="capitalize">{mode.replace('-', ' ')}</span>
            </button>
          );
        })}
      </div>

      {/* Brand Kit Preset Selector (TKN-005 / CMP-002) */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-400 font-semibold uppercase">Brand Kit:</span>
        <select
          value={activeBrandKitId}
          onChange={(e) => onChangeBrandKit(e.target.value)}
          className="bg-gray-950 border border-gray-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
        >
          {BRAND_KIT_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </select>
        {onOpenStudio && (
          <button
            type="button"
            onClick={onOpenStudio}
            className="ml-1 px-2.5 py-1 bg-purple-600/80 hover:bg-purple-600 text-white font-semibold rounded transition flex items-center gap-1 shadow-sm text-[11px]"
          >
            <span>🎨</span>
            <span>Studio</span>
          </button>
        )}
      </div>
    </div>
  );
};
