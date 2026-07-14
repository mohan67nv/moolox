/**
 * @moolox/web — Floating Prompt Command Bar (`Cmd+K / Ctrl+K`) (Feature: AI-001)
 *
 * Natural language prompt bar orchestrating the 3-Agent Core AI Loop (`Haiku -> Sonnet -> Linter`).
 * Provides live multi-stage progress indicators and emits quality-gated sub-tree mutations (`ORC-001..013`).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { type IASTNode, type IW3CTokenMap } from '@moolox/types';
import { execute3AgentLoop, type AgentResult } from '@moolox/ai';

export interface PromptBarProps {
  /** Active AST sub-tree canvas (`IASTNode`) */
  astTree: IASTNode | null;
  /** Currently selected node ID inside canvas (`targetNodeId`) */
  selectedNodeId?: string | null;
  /** Active W3C design tokens map (`IW3CTokenMap`) for Zero-Hex resolution */
  tokenMap?: IW3CTokenMap;
  /** Callback fired when the 3-Agent Loop completes and proposes a mutated tree or patches */
  onProposalReady: (result: AgentResult) => void;
  /** Optional custom trigger state from parent */
  isOpen?: boolean;
  /** Callback when PromptBar closes (`Esc` or outside click) */
  onClose?: () => void;
}

export type PipelineStage = 'IDLE' | 'ROUTING' | 'GENERATING' | 'LINTING' | 'HEALING' | 'DONE' | 'ERROR';

export const PromptBar: React.FC<PromptBarProps> = ({
  astTree,
  selectedNodeId,
  tokenMap,
  onProposalReady,
  isOpen: parentIsOpen,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(parentIsOpen ?? false);
  const [promptInput, setPromptInput] = useState('');
  const [currentStage, setCurrentStage] = useState<PipelineStage>('IDLE');
  const [stageMessage, setStageMessage] = useState('');
  const [lastError, setLastError] = useState<string | null>(null);

  // Sync internal isOpen when parent prop changes
  useEffect(() => {
    if (parentIsOpen !== undefined) {
      setIsOpen(parentIsOpen);
    }
  }, [parentIsOpen]);

  // Global Cmd+K / Ctrl+K and Esc listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen && currentStage === 'IDLE') {
        e.preventDefault();
        setIsOpen(false);
        if (onClose) onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStage, onClose]);

  const handleSubmitPrompt = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!promptInput.trim() || currentStage !== 'IDLE') return;

      setLastError(null);
      setCurrentStage('ROUTING');
      setStageMessage('⚡ Router Agent (Claude 3.5 Haiku): Classifying intent & slicing AST window (< 250ms)...');

      try {
        // Simulate progress transitions for UI responsiveness during async loop execution
        const timer1 = setTimeout(() => {
          setCurrentStage('GENERATING');
          setStageMessage('🎨 Generator Agent (Claude 3.7 Sonnet): Constructing layout & resolving tokens (TKN-003)...');
        }, 150);

        const timer2 = setTimeout(() => {
          setCurrentStage('LINTING');
          setStageMessage('🛡️ Quality Gate (Local TS): Running zero-cost WCAG 2.1 AA, schema & Zero-Hex linter (< 10ms)...');
        }, 350);

        const result = await execute3AgentLoop({
          userPrompt: promptInput,
          astTree,
          targetNodeId: selectedNodeId,
          activeTokens: tokenMap,
          metadata: { timestamp: Date.now() },
        });

        clearTimeout(timer1);
        clearTimeout(timer2);

        if (result.success && result.qualityGatePassed) {
          setCurrentStage('DONE');
          setStageMessage(`✅ Success! ${result.intent} completed in ${result.durationMs}ms (${result.tokensUsed} tokens).`);
          onProposalReady(result);

          // Reset bar after brief success display
          setTimeout(() => {
            setCurrentStage('IDLE');
            setStageMessage('');
            setPromptInput('');
            setIsOpen(false);
            if (onClose) onClose();
          }, 1200);
        } else {
          setCurrentStage('ERROR');
          const errorTxt = result.linterErrors?.length
            ? result.linterErrors.join(' | ')
            : result.explanation || '3-Agent Quality Gate verification failed.';
          setLastError(errorTxt);
          setStageMessage('❌ Quality Gate blocked proposal due to structural/Zero-Hex violations.');
        }
      } catch (err: unknown) {
        setCurrentStage('ERROR');
        const errorMessage = err instanceof Error ? err.message : String(err);
        setLastError(errorMessage || 'Unexpected failure inside 3-Agent Core Loop.');
        setStageMessage('❌ Orchestrator encountered a fatal error.');
      }
    },
    [promptInput, currentStage, astTree, selectedNodeId, tokenMap, onProposalReady, onClose],
  );

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xl transition border border-blue-400/30"
        title="Open 3-Agent AI Studio (Cmd+K)"
      >
        <span>✨</span>
        <span>AI Studio Prompt</span>
        <kbd className="px-1.5 py-0.5 rounded bg-blue-700/80 text-[10px] font-mono border border-blue-500">Cmd+K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-xs text-gray-200"
        role="dialog"
        aria-label="3-Agent AI Studio Prompt Bar"
      >
        {/* Header bar */}
        <div className="p-3 border-b border-gray-800/80 bg-gray-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">✨</span>
            <span className="font-bold text-white text-xs">Moolox 3-Agent AI Studio (`ORC-001..013`)</span>
            {selectedNodeId && (
              <span className="px-2 py-0.5 rounded bg-purple-900/50 text-purple-300 font-mono text-[10px] border border-purple-800">
                Target: {selectedNodeId}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              if (onClose) onClose();
            }}
            disabled={currentStage !== 'IDLE' && currentStage !== 'ERROR'}
            className="text-gray-400 hover:text-white px-2 py-1 rounded text-xs font-mono"
          >
            Esc
          </button>
        </div>

        {/* Prompt input area */}
        <form onSubmit={handleSubmitPrompt} className="p-4 flex flex-col gap-3">
          <div className="relative flex items-center">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              disabled={currentStage !== 'IDLE' && currentStage !== 'ERROR'}
              placeholder={
                selectedNodeId
                  ? `Instruct AI for node "${selectedNodeId}" (e.g. "Add a feature grid" or "Make padding 32px")...`
                  : `Instruct AI across workspace canvas (e.g. "Build a pricing matrix with dark cyberpunk theme")...`
              }
              autoFocus
              className="w-full bg-gray-900/90 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!promptInput.trim() || (currentStage !== 'IDLE' && currentStage !== 'ERROR')}
              className="absolute right-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition disabled:opacity-40"
            >
              Generate
            </button>
          </div>

          {/* Live pipeline status */}
          {stageMessage && (
            <div
              className={`p-2.5 rounded-lg border font-mono text-[11px] flex items-center justify-between ${
                currentStage === 'DONE'
                  ? 'bg-green-950/50 border-green-800 text-green-300'
                  : currentStage === 'ERROR'
                  ? 'bg-red-950/50 border-red-800 text-red-300'
                  : 'bg-blue-950/40 border-blue-900/60 text-blue-300 animate-pulse'
              }`}
            >
              <span>{stageMessage}</span>
              {currentStage !== 'IDLE' && currentStage !== 'DONE' && currentStage !== 'ERROR' && (
                <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          )}

          {/* Linter error details if Quality Gate fails */}
          {lastError && (
            <div className="p-3 rounded-lg bg-red-950/70 border border-red-800 text-red-200 text-[11px] font-mono space-y-1">
              <div className="font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <span>⚠️ Quality Gate / Zero-Hex Violation (`ORC-004 / TKN-003`)</span>
              </div>
              <p>{lastError}</p>
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStage('IDLE');
                    setLastError(null);
                    setStageMessage('');
                  }}
                  className="px-2.5 py-1 rounded bg-red-900 hover:bg-red-800 text-white font-semibold text-[10px]"
                >
                  Dismiss & Retry
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Footer info */}
        <div className="px-4 py-2 bg-gray-900/40 border-t border-gray-800 text-[10px] text-gray-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>⚡ Haiku Router (&lt; 250ms)</span>
            <span>🎨 Sonnet Generator</span>
            <span>🛡️ Static Gate (&lt; 10ms)</span>
          </div>
          <span className="font-mono text-gray-400">Zero-Throwaway (`TKN-003 / ORC-013`)</span>
        </div>
      </div>
    </div>
  );
};
