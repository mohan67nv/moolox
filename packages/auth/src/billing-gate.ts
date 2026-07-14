/**
 * @moolox/auth — Metered AI Credit Billing Gate (`Stripe Webhooks`) (AUTH-003)
 *
 * Real-time credit pool auditor (`1 credit = $0.01`) deducting credits per Sonnet/Vision
 * prompt and triggering a hard circuit breaker when credit balance is exhausted.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { eq, sql } from 'drizzle-orm';
import { type Database, workspaces } from '@moolox/db';

/**
 * Custom error thrown when a workspace has insufficient AI credits.
 */
export class AICreditExceededError extends Error {
  public readonly status = 402;
  public readonly code = 'AI_CREDIT_EXCEEDED';

  constructor(workspaceId: string, required: number, remaining: number) {
    super(
      `AI Credit Circuit Breaker Triggered: Workspace "${workspaceId}" requires ${required} credits, but only has ${remaining} credits remaining. Please upgrade your plan.`,
    );
    this.name = 'AICreditExceededError';
  }
}

/**
 * Checks a workspace's AI credit balance and atomically deducts the required amount.
 * 1 credit corresponds to $0.01 ($1.00 = 100 credits).
 *
 * If `aiCreditsUsed + creditsRequired > aiCreditsLimit`, throws `AICreditExceededError`.
 */
export async function checkAndDeductAICredits(
  db: Database,
  workspaceId: string,
  creditsRequired: number,
): Promise<{ creditsLimit: number; creditsUsed: number; creditsRemaining: number; costCents: number }> {
  if (creditsRequired <= 0) {
    throw new Error('creditsRequired must be a positive integer.');
  }

  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, workspaceId),
    columns: {
      id: true,
      aiCreditsLimit: true,
      aiCreditsUsed: true,
    },
  });

  if (!workspace) {
    throw new Error(`Workspace "${workspaceId}" not found for credit check.`);
  }

  const remaining = workspace.aiCreditsLimit - workspace.aiCreditsUsed;
  if (remaining < creditsRequired) {
    throw new AICreditExceededError(workspaceId, creditsRequired, Math.max(0, remaining));
  }

  // Atomically increment aiCreditsUsed
  const [updated] = await db
    .update(workspaces)
    .set({
      aiCreditsUsed: sql`${workspaces.aiCreditsUsed} + ${creditsRequired}`,
    })
    .where(eq(workspaces.id, workspaceId))
    .returning({
      aiCreditsLimit: workspaces.aiCreditsLimit,
      aiCreditsUsed: workspaces.aiCreditsUsed,
    });

  if (!updated) {
    throw new Error(`Failed to update credit balance for workspace "${workspaceId}".`);
  }

  const newRemaining = updated.aiCreditsLimit - updated.aiCreditsUsed;
  const costCents = creditsRequired * 1.0; // 1 credit = 1 cent ($0.01)

  return {
    creditsLimit: updated.aiCreditsLimit,
    creditsUsed: updated.aiCreditsUsed,
    creditsRemaining: newRemaining,
    costCents,
  };
}
