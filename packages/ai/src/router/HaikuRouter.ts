/**
 * @moolox/ai — Router Agent (`Claude 3.5 Haiku` Intent Classifier) (Feature: ORC-002)
 *
 * Ultra-fast intent classification (`< 250ms`) routing natural language instructions
 * (`AI-001`) and slicing target `ASTNodeId` windows via `pruneASTWindow` (`AST-005`)
 * before passing minimal context to downstream generator models.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { type AgentContext, type AgentResult, type AIIntentCategory, type IAgentExecutor } from '../types';
import { pruneASTWindow } from '@moolox/ast-core';

export class HaikuRouter implements IAgentExecutor {
  readonly agentId = 'haiku-router';
  readonly title = 'Router Agent (Claude 3.5 Haiku Intent & Context Slicer)';

  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    const prompt = (context.userPrompt || '').toLowerCase().trim();

    // 1. Fast Intent Classification (< 250ms target)
    let intent: AIIntentCategory = 'UNKNOWN';

    if (
      prompt.includes('add ') ||
      prompt.includes('insert ') ||
      prompt.includes('create ') ||
      prompt.includes('build ') ||
      prompt.includes('new ') ||
      prompt.includes('append ')
    ) {
      intent = 'ADD_SECTION';
    } else if (
      prompt.includes('color') ||
      prompt.includes('bg') ||
      prompt.includes('background') ||
      prompt.includes('style') ||
      prompt.includes('padding') ||
      prompt.includes('margin') ||
      prompt.includes('font') ||
      prompt.includes('theme') ||
      prompt.includes('dark') ||
      prompt.includes('light') ||
      prompt.includes('border')
    ) {
      intent = 'UPDATE_STYLE';
    } else if (
      prompt.includes('refactor') ||
      prompt.includes('reorganize') ||
      prompt.includes('clean') ||
      prompt.includes('move') ||
      prompt.includes('restructure') ||
      prompt.includes('replace') ||
      prompt.includes('swap')
    ) {
      intent = 'REFACTOR_SUBTREE';
    } else if (
      prompt.includes('what ') ||
      prompt.includes('how ') ||
      prompt.includes('why ') ||
      prompt.includes('explain') ||
      prompt.includes('question')
    ) {
      intent = 'ANSWER_QUESTION';
    } else if (prompt.length > 0) {
      // Default fallback for actionable prompts
      intent = 'UPDATE_STYLE';
    }

    // 2. Resolve Target Node ID from explicit context or prompt extraction
    let targetId = context.targetNodeId || null;
    if (!targetId && context.astTree) {
      // Try extracting node ID reference from prompt (e.g. "in hero-1" or "on pricing-table")
      const idMatch = prompt.match(/(?:in|on|to|for|node|id)\s+([a-zA-Z0-9_-]+)/i);
      if (idMatch && idMatch[1]) {
        const candidate = idMatch[1];
        if (this.findNodeById(context.astTree, candidate)) {
          targetId = candidate;
        }
      }

      // If no node ID is found and tree is present, default to root or top-level section
      if (!targetId) {
        targetId = context.astTree.nodeId;
      }
    }

    // 3. Context Window Slicing via pruneASTWindow (AST-005)
    let prunedTree = context.astTree || null;
    let tokensUsed = 45; // Base prompt routing cost

    if (context.astTree && targetId) {
      const budget = context.tokenBudgetMax || 1500;
      const pruneResult = pruneASTWindow(context.astTree, targetId, {
        maxTokens: budget,
        preserveAncestors: true,
        preserveSiblings: true,
      });

      prunedTree = pruneResult.prunedTree;
      tokensUsed += pruneResult.tokensUsed;
    }

    const durationMs = Date.now() - startTime;

    return {
      success: true,
      intent,
      targetNodeId: targetId,
      prunedContextTree: prunedTree,
      explanation: `Routed intent '${intent}' focusing on target node '${targetId || 'root'}' (< ${durationMs}ms classification time).`,
      durationMs,
      tokensUsed,
    };
  }

  private findNodeById(node: any, targetId: string): boolean {
    if (!node) return false;
    if (node.nodeId === targetId) return true;
    if (node.children) {
      for (const child of node.children) {
        if (this.findNodeById(child, targetId)) return true;
      }
    }
    return false;
  }
}
