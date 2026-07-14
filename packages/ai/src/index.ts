/**
 * @moolox/ai — 3-Agent Core AI Loop & Multi-Agent Orchestration Engine
 *
 * Feature IDs:
 * - ORC-001: Unified Agent Interface (`IAgentExecutor`, `AgentContext`, `AgentResult`)
 * - ORC-002: Router Agent (`Claude 3.5 Haiku` Intent & AST Window Pruner)
 * - ORC-003: Unified Generator Agent (`Claude 3.7 Sonnet` Layout & Token Engine)
 * - ORC-004: Deterministic Static Quality Gate (`axe/DOMPurify Zero-Cost Linter`)
 * - ORC-013: Reviewer & Self-Healing Loop (`Max 1 Retry Automatic Error Remediation`)
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

export * from './types';
export * from './router/HaikuRouter';
export * from './generator/SonnetGenerator';
export * from './linter/QualityGate';
export * from './pipeline/Orchestrator';
