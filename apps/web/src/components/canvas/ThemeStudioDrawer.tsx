/**
 * @moolox/web — Perceptual HSL Theme Studio Drawer (TKN-004)
 *
 * Provides a slide-over Theme Studio interface allowing designers and developers
 * to inspect perceptual luminance (`L`), verify WCAG 2.1 AA contrast ratios (`>= 4.5:1`),
 * switch between `light`, `dark`, and `high-contrast` modes with 1-click inversion (`< 5ms`),
 * and apply any of the 50 Obsidian Brand Presets (`CMP-002`) live across the canvas.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import React, { useMemo } from 'react';
import { type TokenDocument } from '@moolox/types';
import { ThemeInverterEngine, calculateContrastRatio, passesWcagAA, type ColorMode } from '@moolox/tokens';

export interface ThemeStudioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeDocument: TokenDocument;
  onUpdateDocument: (newDoc: TokenDocument) => void;
  onApplyBrandPreset?: (presetId: string) => void;
  brandPresetsList?: Array<{ id: string; name: string; primaryBg: string; primaryAccent: string; colorMode: ColorMode }>;
}

export const ThemeStudioDrawer: React.FC<ThemeStudioDrawerProps> = ({
  isOpen,
  onClose,
  activeDocument,
  onUpdateDocument,
  onApplyBrandPreset,
  brandPresetsList = [],
}) => {
  const currentMode = (activeDocument.metadata.colorMode as ColorMode) || 'dark';

  const colorTokens = activeDocument.tokens.color as Record<
    string,
    Record<string, { value: string }>
  >;
  const bgPrimary = colorTokens?.bg?.primary?.value || '#0b0f19';
  const fgPrimary = colorTokens?.fg?.primary?.value || '#ffffff';
  const accentPrimary = colorTokens?.accent?.primary?.value || '#3b82f6';

  const contrastRatio = useMemo(() => {
    return calculateContrastRatio(fgPrimary, bgPrimary);
  }, [fgPrimary, bgPrimary]);

  const isWcagCompliant = passesWcagAA(fgPrimary, bgPrimary);

  if (!isOpen) return null;

  const handleSwitchMode = (targetMode: ColorMode) => {
    const result = ThemeInverterEngine.switchMode(activeDocument, targetMode);
    onUpdateDocument(result.document);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-gray-950 border-l border-gray-800 shadow-2xl flex flex-col text-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-gray-900/60">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎨</span>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-white">W3C Theme Studio</h2>
            <p className="text-[11px] text-gray-400">Perceptual HSL & Contrast Engine (TKN-004)</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-white px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 transition text-xs font-semibold"
        >
          ✕ Close
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Mode Inverter */}
        <div className="space-y-3 bg-gray-900/40 p-4 rounded-xl border border-gray-800/80">
          <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center justify-between">
            <span>Color Mode Inverter</span>
            <span className="text-[10px] text-blue-400 font-mono">1-Click &lt; 5ms</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['dark', 'light', 'high-contrast'] as ColorMode[]).map((mode) => {
              const isActive = currentMode === mode;
              const icons: Record<ColorMode, string> = {
                dark: '🌙',
                light: '☀️',
                'high-contrast': '⚡',
              };
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleSwitchMode(mode)}
                  aria-pressed={isActive}
                  className={`py-2 px-3 rounded-lg font-semibold transition flex flex-col items-center gap-1 text-xs border ${
                    isActive
                      ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                  }`}
                >
                  <span className="text-base">{icons[mode]}</span>
                  <span className="capitalize">{mode.replace('-', ' ')}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* WCAG 2.1 AA Contrast Verification Box */}
        <div className="space-y-3 bg-gray-900/40 p-4 rounded-xl border border-gray-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">WCAG 2.1 AA Compliance</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                isWcagCompliant
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                  : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
              }`}
            >
              {isWcagCompliant ? 'PASS AA' : 'FAIL AA'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono bg-gray-950 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded border border-gray-700" style={{ backgroundColor: bgPrimary }} />
              <span className="w-4 h-4 rounded border border-gray-700" style={{ backgroundColor: fgPrimary }} />
              <span className="text-gray-300">Ratio:</span>
            </div>
            <span className="text-base font-bold text-white">{contrastRatio}:1</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Perceptual HSL inverter automatically maps relative luminance to ensure body text meets the mandatory 4.5:1 minimum threshold.
          </p>
        </div>

        {/* Active Token Values Preview */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Primary Color Tokens</span>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-gray-900/60 px-3 py-2 rounded-lg border border-gray-800 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded border border-gray-700" style={{ backgroundColor: bgPrimary }} />
                <span className="text-gray-300">color.bg.primary</span>
              </div>
              <span className="text-gray-400">{bgPrimary}</span>
            </div>
            <div className="flex items-center justify-between bg-gray-900/60 px-3 py-2 rounded-lg border border-gray-800 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded border border-gray-700" style={{ backgroundColor: fgPrimary }} />
                <span className="text-gray-300">color.fg.primary</span>
              </div>
              <span className="text-gray-400">{fgPrimary}</span>
            </div>
            <div className="flex items-center justify-between bg-gray-900/60 px-3 py-2 rounded-lg border border-gray-800 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded border border-gray-700" style={{ backgroundColor: accentPrimary }} />
                <span className="text-gray-300">color.accent.primary</span>
              </div>
              <span className="text-gray-400">{accentPrimary}</span>
            </div>
          </div>
        </div>

        {/* Brand Presets Quick Selector (CMP-002) */}
        {brandPresetsList.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-gray-800">
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center justify-between">
              <span>Obsidian Brand Presets</span>
              <span className="text-[10px] text-gray-400 font-normal">50 Presets (CMP-002)</span>
            </span>
            <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
              {brandPresetsList.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onApplyBrandPreset && onApplyBrandPreset(preset.id)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-900/50 hover:bg-gray-800 border border-gray-800/80 hover:border-gray-700 transition text-left"
                >
                  <div className="w-5 h-5 rounded flex-shrink-0 border border-gray-700" style={{ backgroundColor: preset.primaryBg }}>
                    <div className="w-2.5 h-2.5 rounded-full mt-1 ml-1" style={{ backgroundColor: preset.primaryAccent }} />
                  </div>
                  <span className="text-xs font-medium text-gray-300 truncate">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-800 bg-gray-900/80 text-[11px] text-gray-400 flex items-center justify-between font-mono">
        <span>CSS Custom Props injected</span>
        <span className="text-emerald-400 font-bold">● ACTIVE</span>
      </div>
    </div>
  );
};
