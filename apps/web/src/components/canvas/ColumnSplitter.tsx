/**
 * @moolox/web — Interactive Grid Column Splitter (CNV-005)
 *
 * Renders draggable column handles between grid items inside the canvas iframe
 * or layout overlay. Calculates horizontal drag deltas (`deltaXPx`) via the
 * `@moolox/canvas` Breakpoint Math Engine and updates Tailwind grid span classes cleanly.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  calculateGridColumnSpan,
  computeColumnWidthPct,
  type ViewportBreakpoint,
} from '@moolox/canvas';

export interface ColumnSplitterProps {
  /** Target grid container node ID */
  containerNodeId: string;
  /** Current column span (`1..12`) */
  currentSpan: number;
  /** Total grid columns (default 12) */
  totalCols?: number;
  /** Container width in pixels (for delta calculation) */
  containerWidthPx: number;
  /** Active breakpoint (`mobile`, `tablet`, `desktop`, `wide`) */
  activeBreakpoint?: ViewportBreakpoint;
  /** Callback triggered when drag finishes with new column span */
  onSpanChange: (newSpan: number) => void;
}

export const ColumnSplitter: React.FC<ColumnSplitterProps> = ({
  containerNodeId,
  currentSpan,
  totalCols = 12,
  containerWidthPx,
  activeBreakpoint = 'desktop',
  onSpanChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewSpan, setPreviewSpan] = useState(currentSpan);
  const startXRef = useRef<number>(0);
  const startSpanRef = useRef<number>(currentSpan);

  useEffect(() => {
    if (!isDragging) {
      setPreviewSpan(currentSpan);
    }
  }, [currentSpan, isDragging]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startXRef.current;
      const newSpan = calculateGridColumnSpan(deltaX, containerWidthPx, startSpanRef.current, totalCols);
      setPreviewSpan(newSpan);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onSpanChange(previewSpan);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, containerWidthPx, totalCols, previewSpan, onSpanChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startXRef.current = e.clientX;
    startSpanRef.current = currentSpan;
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const currentPct = computeColumnWidthPct(previewSpan, totalCols);

  return (
    <div
      data-container-id={containerNodeId}
      className="relative inline-flex items-center group select-none"
    >
      {/* Drag handle line */}
      <div
        onMouseDown={handleMouseDown}
        className={`w-2.5 h-full min-h-[40px] flex items-center justify-center cursor-col-resize z-30 transition -mx-1.5 ${
          isDragging
            ? 'bg-blue-500/30'
            : 'hover:bg-blue-500/20'
        }`}
        title={`Drag to resize column span (${previewSpan}/${totalCols})`}
      >
        <div
          className={`w-1 h-8 rounded-full transition shadow-sm ${
            isDragging
              ? 'bg-blue-500 scale-110 shadow-blue-500/50'
              : 'bg-gray-700 group-hover:bg-blue-400'
          }`}
        />
      </div>

      {/* Floating feedback badge during drag */}
      {isDragging && (
        <div className="absolute left-1/2 -top-9 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold font-mono px-2 py-1 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none flex items-center gap-1.5 border border-blue-400/50">
          <span>{activeBreakpoint.toUpperCase()}:</span>
          <span>{previewSpan}/{totalCols} cols</span>
          <span className="text-blue-200">({currentPct}%)</span>
        </div>
      )}
    </div>
  );
};
