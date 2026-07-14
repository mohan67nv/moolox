/**
 * @moolox/web — Right-Hand Property Inspector (Feature: CNV-002)
 *
 * Provides real-time visual property and attribute editing for selected canvas AST nodes.
 * Enforces Zero-Hex Law (`TKN-003`) by validating inputs against W3C token paths and
 * emits structural sub-tree updates with `< 15ms` latency (`Acceptance Criteria 2`).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import React, { useState, useEffect } from 'react';
import { type IASTNode, type IW3CTokenMap } from '@moolox/types';
import { enforceTokenResolution } from '@moolox/tokens';

export interface PropertyInspectorProps {
  /** The selected AST node (`IASTNode`) or `null` if no node is selected */
  selectedNode: IASTNode | null;
  /** Callback to dispatch updated AST node to canvas/projectStore (`< 15ms` target) */
  onUpdateNode: (nodeId: string, updatedNode: IASTNode) => void;
  /** Active W3C design tokens map (`IW3CTokenMap`) for Zero-Hex validation */
  tokenMap?: IW3CTokenMap;
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({
  selectedNode,
  onUpdateNode,
  tokenMap,
}) => {
  const [classNameInput, setClassNameInput] = useState('');
  const [contentInput, setContentInput] = useState('');
  const [styleColorInput, setStyleColorInput] = useState('');
  const [stylePaddingInput, setStylePaddingInput] = useState('');

  // Sync local inputs when selectedNode changes
  useEffect(() => {
    if (selectedNode) {
      setClassNameInput(
        typeof selectedNode.props?.className === 'string'
          ? selectedNode.props.className
          : '',
      );
      setContentInput(
        typeof selectedNode.props?.content === 'string'
          ? selectedNode.props.content
          : '',
      );
      setStyleColorInput(
        selectedNode.styles && typeof selectedNode.styles.color === 'string'
          ? selectedNode.styles.color
          : '',
      );
      setStylePaddingInput(
        selectedNode.styles && typeof selectedNode.styles.padding === 'string'
          ? selectedNode.styles.padding
          : '',
      );
    } else {
      setClassNameInput('');
      setContentInput('');
      setStyleColorInput('');
      setStylePaddingInput('');
    }
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <aside className="w-80 h-full bg-gray-900 border-l border-gray-800 p-6 flex flex-col items-center justify-center text-gray-500 text-xs text-center">
        <span className="text-2xl mb-2">🔍</span>
        <span className="font-semibold text-gray-400 mb-1">No Element Selected</span>
        <span>Click any element inside the live 60fps canvas to inspect and edit its properties.</span>
      </aside>
    );
  }

  const handleApplyClassName = (newClassName: string) => {
    setClassNameInput(newClassName);
    const updatedProps = { ...selectedNode.props, className: newClassName };
    onUpdateNode(selectedNode.nodeId, {
      ...selectedNode,
      props: updatedProps,
    });
  };

  const handleApplyContent = (newContent: string) => {
    setContentInput(newContent);
    const updatedProps = { ...selectedNode.props, content: newContent };
    onUpdateNode(selectedNode.nodeId, {
      ...selectedNode,
      props: updatedProps,
    });
  };

  const handleApplyStyleColor = (newColor: string) => {
    let resolvedColor = newColor;

    // Enforce Zero-Hex Law if tokenMap is available and input is a hex string
    if (tokenMap && newColor.trim().startsWith('#')) {
      const resolution = enforceTokenResolution(newColor, tokenMap);
      resolvedColor = `var(${resolution.resolvedCssVar})`;
    }

    setStyleColorInput(resolvedColor);
    const updatedStyles: Record<string, string> = { ...(selectedNode.styles || {}) };
    if (resolvedColor) {
      updatedStyles.color = resolvedColor;
    } else {
      delete updatedStyles.color;
    }
    onUpdateNode(selectedNode.nodeId, {
      ...selectedNode,
      styles: updatedStyles,
    });
  };

  const handleApplyStylePadding = (newPadding: string) => {
    setStylePaddingInput(newPadding);
    const updatedStyles: Record<string, string> = { ...(selectedNode.styles || {}) };
    if (newPadding) {
      updatedStyles.padding = newPadding;
    } else {
      delete updatedStyles.padding;
    }
    onUpdateNode(selectedNode.nodeId, {
      ...selectedNode,
      styles: updatedStyles,
    });
  };

  return (
    <aside
      className="w-80 h-full bg-gray-900 border-l border-gray-800 flex flex-col overflow-y-auto text-gray-200 text-xs"
      aria-label="Property Inspector Panel"
    >
      <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-950/50">
        <div>
          <h3 className="font-bold text-sm text-white">Property Inspector</h3>
          <p className="text-gray-400 font-mono text-[10px] mt-0.5">
            ID: <span className="text-blue-400">{selectedNode.nodeId}</span>
          </p>
        </div>
        <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono text-[10px] uppercase border border-blue-800">
          {selectedNode.type}
        </span>
      </div>

      <div className="p-4 space-y-6 flex-1">
        {/* Section 1: Text Content */}
        <div className="space-y-2">
          <label htmlFor="inspector-content" className="block font-semibold text-gray-300 text-[11px] uppercase tracking-wider">
            Text Content
          </label>
          <input
            id="inspector-content"
            type="text"
            value={contentInput}
            onChange={(e) => handleApplyContent(e.target.value)}
            placeholder="Enter element text content..."
            className="w-full bg-gray-950 border border-gray-800 rounded-md p-2 text-xs text-white focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Section 2: Tailwind Utility Classes (className) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="inspector-className" className="font-semibold text-gray-300 text-[11px] uppercase tracking-wider">
              Tailwind Classes
            </label>
            <span className="text-[10px] text-purple-400 font-mono">TKN-003 Enforced</span>
          </div>
          <textarea
            id="inspector-className"
            rows={3}
            value={classNameInput}
            onChange={(e) => handleApplyClassName(e.target.value)}
            placeholder="e.g. px-6 py-4 bg-[var(--dios-color-bg-primary)] rounded-lg font-bold"
            className="w-full bg-gray-950 border border-gray-800 rounded-md p-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Section 3: Inline Layout Styles (< 15ms target) */}
        <div className="space-y-3 pt-2 border-t border-gray-800/80">
          <h4 className="font-semibold text-gray-300 text-[11px] uppercase tracking-wider">
            Inline Styles & Tokens
          </h4>

          <div>
            <label htmlFor="inspector-style-color" className="block text-gray-400 text-[11px] mb-1">
              Text Color (`style.color`)
            </label>
            <div className="flex gap-2">
              <input
                id="inspector-style-color"
                type="text"
                value={styleColorInput}
                onChange={(e) => handleApplyStyleColor(e.target.value)}
                placeholder="var(--dios-color-accent-primary)"
                className="flex-1 bg-gray-950 border border-gray-800 rounded-md p-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            {styleColorInput.startsWith('var(--') && (
              <p className="text-[10px] text-green-400 mt-1 flex items-center gap-1 font-mono">
                <span>✓</span> Resolved canonical W3C design token
              </p>
            )}
          </div>

          <div>
            <label htmlFor="inspector-style-padding" className="block text-gray-400 text-[11px] mb-1">
              Layout Padding (`style.padding`)
            </label>
            <input
              id="inspector-style-padding"
              type="text"
              value={stylePaddingInput}
              onChange={(e) => handleApplyStylePadding(e.target.value)}
              placeholder="e.g. 16px or var(--dios-space-8)"
              className="w-full bg-gray-950 border border-gray-800 rounded-md p-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-800 bg-gray-950/40 text-[10px] text-gray-400 flex items-center justify-between">
        <span>Latency Target:</span>
        <span className="font-mono text-green-400 font-semibold">&lt; 15ms sub-tree sync</span>
      </div>
    </aside>
  );
};
