/**
 * @moolox/ai — 3-Agent Core AI Loop & Self-Healing Orchestrator (Feature: ORC-001..004, ORC-013)
 *
 * Coordinates the multi-stage atomic AI generation pipeline:
 * 1. Router (`HaikuRouter — ORC-002`): Fast intent classification & AST window slicing (< 250ms).
 * 2. Generator (`SonnetGenerator — ORC-003`): Structural layout & token styling generation.
 * 3. Quality Gate (`QualityGate — ORC-004`): Zero-cost static verification (`< 10ms`).
 * 4. Self-Healing Loop (`ORC-013`): Catches linter trace errors and retries generation once before returning.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { type AgentContext, type AgentResult } from '../types';
import { HaikuRouter } from '../router/HaikuRouter';
import { SonnetGenerator } from '../generator/SonnetGenerator';
import { QualityGate } from '../linter/QualityGate';

export interface OrchestratorOptions {
  /** Maximum number of self-healing retries if QualityGate fails (`ORC-013`: default 1) */
  maxRetries?: number;
}

export class PipelineOrchestrator {
  private router = new HaikuRouter();
  private generator = new SonnetGenerator();
  private linter = new QualityGate();

  async executeLoop(context: AgentContext, options: OrchestratorOptions = {}): Promise<AgentResult> {
    const startTime = Date.now();
    const maxRetries = options.maxRetries ?? 1;
    let totalTokens = 0;

    // Step 1: Intent Routing & Context Window Pruning (< 250ms target)
    const routerResult = await this.router.execute(context);
    totalTokens += routerResult.tokensUsed;

    const generatorContext: AgentContext = {
      ...context,
      astTree: routerResult.prunedContextTree || context.astTree,
      targetNodeId: routerResult.targetNodeId,
      metadata: {
        ...context.metadata,
        intent: routerResult.intent,
      },
    };

    // Step 2: First-Pass Structural Generation
    let genResult = await this.generator.execute(generatorContext);
    totalTokens += genResult.tokensUsed;

    // Step 3: Zero-Cost Static Quality Gate & Sanitization (< 10ms target)
    let linterContext: AgentContext = {
      ...context,
      astTree: genResult.mutatedTree || null,
    };
    let linterResult = await this.linter.execute(linterContext);
    totalTokens += linterResult.tokensUsed;

    let retryAttempt = 0;

    // Step 4: Self-Healing Loop (ORC-013 — Max 1 Retry)
    while (!linterResult.qualityGatePassed && retryAttempt < maxRetries) {
      retryAttempt++;
      const traceErrors = linterResult.linterErrors || ['Unknown structural violation'];

      // Feed linter errors directly back into Generator for automated remediation
      const retryContext: AgentContext = {
        ...generatorContext,
        metadata: {
          ...generatorContext.metadata,
          retryAttempt,
          linterErrors: traceErrors,
          healingPrompt: `Remediate the following Quality Gate violations: ${traceErrors.join('; ')}`,
        },
      };

      genResult = await this.generator.execute(retryContext);
      totalTokens += genResult.tokensUsed;

      linterContext = {
        ...context,
        astTree: genResult.mutatedTree || null,
      };
      linterResult = await this.linter.execute(linterContext);
      totalTokens += linterResult.tokensUsed;
    }

    const totalDurationMs = Date.now() - startTime;
    const finalPassed = linterResult.qualityGatePassed ?? false;

    return {
      success: finalPassed,
      intent: routerResult.intent,
      targetNodeId: routerResult.targetNodeId,
      prunedContextTree: routerResult.prunedContextTree,
      mutatedTree: genResult.mutatedTree,
      patches: genResult.patches,
      qualityGatePassed: finalPassed,
      linterErrors: linterResult.linterErrors || [],
      explanation: finalPassed
        ? `3-Agent Loop succeeded on attempt ${retryAttempt + 1} (${totalDurationMs}ms, ${totalTokens} tokens). ${genResult.explanation}`
        : `3-Agent Loop Quality Gate failed after ${retryAttempt + 1} attempts (${totalDurationMs}ms). Violations: ${(linterResult.linterErrors || []).join(' | ')}`,
      durationMs: totalDurationMs,
      tokensUsed: totalTokens,
    };
  }
}

/**
 * Singleton convenience method for triggering the 3-Agent Loop (`Haiku -> Sonnet -> Linter`).
 */
export async function execute3AgentLoop(context: AgentContext, options?: OrchestratorOptions): Promise<AgentResult> {
  const orchestrator = new PipelineOrchestrator();
  return orchestrator.executeLoop(context, options);
}
