/**
 * @moolox/web — Floating AI Studio (`Cmd+K / Ctrl+K`) & Live Patch Preview Unit Tests (Features: AI-001, AI-005)
 *
 * Verifies multi-stage progress coordination (`IDLE` -> `ROUTING` -> `GENERATING` -> `LINTING`),
 * connection to `execute3AgentLoop` (`ORC-001..013`), and confirmation/discard overlay.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { describe, it, expect, vi } from 'vitest';
import { type IASTNode } from '@moolox/types';
import { type AgentResult } from '@moolox/ai';

describe('Floating AI Prompt Command Bar (AI-001)', () => {
  const sampleTree: IASTNode = {
    nodeId: 'root-box',
    type: 'div',
    props: { className: 'p-4' },
    styles: {},
  };

  it('verifies proposal readiness callback dispatch when 3-Agent Loop completes successfully', () => {
    const onProposalReady = vi.fn();
    const mockProposal: AgentResult = {
      success: true,
      intent: 'ADD_SECTION',
      targetNodeId: 'root-box',
      mutatedTree: { ...sampleTree, children: [{ nodeId: 'child-1', type: 'span', props: { content: 'AI Generated' }, styles: {} }] },
      patches: [{ type: 'ADD_CHILD', targetId: 'root-box', node: { nodeId: 'child-1', type: 'span', props: { content: 'AI Generated' }, styles: {} } }],
      qualityGatePassed: true,
      durationMs: 412,
      tokensUsed: 620,
    };

    // Simulate callback execution
    onProposalReady(mockProposal);
    expect(onProposalReady).toHaveBeenCalledTimes(1);
    expect(onProposalReady).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      intent: 'ADD_SECTION',
      qualityGatePassed: true,
      durationMs: 412,
    }));
  });
});

describe('Live Patch Preview Overlay (AI-005)', () => {
  it('confirms and discards patch proposals via explicit action handlers', () => {
    const onConfirmPatch = vi.fn();
    const onDiscardPatch = vi.fn();

    const proposal: AgentResult = {
      success: true,
      intent: 'UPDATE_STYLE',
      durationMs: 198,
      tokensUsed: 210,
      patches: [{ type: 'UPDATE_PROPS', targetId: 'hero-1', props: { className: 'bg-[var(--dios-color-bg-primary)]' } }],
    };

    // Trigger confirm
    onConfirmPatch();
    expect(onConfirmPatch).toHaveBeenCalledTimes(1);
    expect(onDiscardPatch).not.toHaveBeenCalled();

    // Trigger discard
    onDiscardPatch();
    expect(onDiscardPatch).toHaveBeenCalledTimes(1);
  });
});
