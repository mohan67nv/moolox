/**
 * @moolox/workspace — Role-Based Workspace Invite Links & Verification (WS-002)
 *
 * Generates and verifies secure, time-bound, role-encoded invite tokens (`7 days`).
 * Allows authorized administrators (`MANAGE_MEMBERS`) to invite new collaborators and
 * verifies their onboarding directly into `workspace_members`.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import crypto from 'node:crypto';
import { eq, and } from 'drizzle-orm';
import { type Database, workspaceMembers, type WorkspaceMember } from '@moolox/db';
import { type WorkspaceRole } from '@moolox/types';
import { verifyWorkspaceAccess, ForbiddenError, UnauthorizedError } from '@moolox/auth';

/**
 * Decoded payload stored within a workspace invite token.
 */
export interface InviteTokenPayload {
  workspaceId: string;
  role: WorkspaceRole;
  invitedByUserId: string;
  expiresAt: number;
}

/**
 * Options for generating an invite token.
 */
export interface CreateInviteOptions {
  workspaceId: string;
  role: WorkspaceRole;
  invitedByUserId: string;
  /** Expiration duration in days (`7` by default) */
  expiresInDays?: number;
  /** Cryptographic secret for HMAC token signing */
  secretKey?: string;
}

/**
 * Generates a signed, tamper-proof invite token (`invite_{base64url}`).
 */
export function createWorkspaceInviteToken(options: CreateInviteOptions): string {
  if (!options.workspaceId || !options.role || !options.invitedByUserId) {
    throw new Error('Missing required options (`workspaceId`, `role`, `invitedByUserId`).');
  }

  const secret = options.secretKey || process.env.WORKSPACE_INVITE_SECRET || 'moolox_default_dev_invite_secret';
  const expiresInDays = options.expiresInDays ?? 7;
  const expiresAt = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;

  const payload: InviteTokenPayload = {
    workspaceId: options.workspaceId,
    role: options.role,
    invitedByUserId: options.invitedByUserId,
    expiresAt,
  };

  const payloadString = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(payloadString, 'utf8').toString('base64url');

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payloadBase64);
  const signature = hmac.digest('base64url');

  return `invite_${payloadBase64}.${signature}`;
}

/**
 * Verifies a secure invite token signature and checks for expiration.
 */
export function verifyWorkspaceInviteToken(token: string, secretKey?: string): InviteTokenPayload {
  if (!token || !token.startsWith('invite_')) {
    throw new UnauthorizedError('Invalid invite token format.');
  }

  const secret = secretKey || process.env.WORKSPACE_INVITE_SECRET || 'moolox_default_dev_invite_secret';
  const rawParts = token.slice(7).split('.');
  if (rawParts.length !== 2) {
    throw new UnauthorizedError('Malformed invite token.');
  }

  const [payloadBase64, providedSignature] = rawParts;
  if (!payloadBase64 || !providedSignature) {
    throw new UnauthorizedError('Malformed invite token signature.');
  }

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payloadBase64);
  const expectedSignature = hmac.digest('base64url');

  const providedBuf = Buffer.from(providedSignature);
  const expectedBuf = Buffer.from(expectedSignature);

  if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
    throw new UnauthorizedError('Tampered or invalid invite token signature.');
  }

  let payload: InviteTokenPayload;
  try {
    const jsonString = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    payload = JSON.parse(jsonString) as InviteTokenPayload;
  } catch {
    throw new UnauthorizedError('Failed to parse invite token payload.');
  }

  if (Date.now() > payload.expiresAt) {
    throw new ForbiddenError(`Invite token expired on ${new Date(payload.expiresAt).toISOString()}.`);
  }

  return payload;
}

/**
 * Creates an invite link after verifying that the acting user has `MANAGE_MEMBERS` permission.
 */
export async function createAndSendWorkspaceInvite(
  db: Database,
  actorUserId: string,
  workspaceId: string,
  role: WorkspaceRole,
  options: Partial<CreateInviteOptions> = {},
): Promise<{ token: string; payload: InviteTokenPayload; inviteUrl: string }> {
  // 1. Assert actor has MANAGE_MEMBERS permission on the target workspace
  await verifyWorkspaceAccess(db, actorUserId, workspaceId, 'MANAGE_MEMBERS');

  // 2. Generate signed invite token
  const token = createWorkspaceInviteToken({
    workspaceId,
    role,
    invitedByUserId: actorUserId,
    ...options,
  });

  const payload = verifyWorkspaceInviteToken(token, options.secretKey);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const inviteUrl = `${baseUrl}/invite/accept?token=${encodeURIComponent(token)}`;

  return {
    token,
    payload,
    inviteUrl,
  };
}

/**
 * Verifies and accepts an invite token, adding the user into `workspace_members`.
 * If the user is already a member, returns the existing membership without duplicate insertion.
 */
export async function acceptWorkspaceInvite(
  db: Database,
  userId: string,
  tokenString: string,
  secretKey?: string,
): Promise<{ membership: WorkspaceMember; created: boolean }> {
  if (!userId) {
    throw new UnauthorizedError('User authentication required to accept workspace invite.');
  }

  const payload = verifyWorkspaceInviteToken(tokenString, secretKey);

  // 1. Check if user already exists in workspace_members
  const existing = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, payload.workspaceId),
      eq(workspaceMembers.userId, userId),
    ),
  });

  if (existing) {
    return {
      membership: existing,
      created: false,
    };
  }

  // 2. Insert new membership
  const [inserted] = await db
    .insert(workspaceMembers)
    .values({
      workspaceId: payload.workspaceId,
      userId,
      role: payload.role,
      joinedAt: new Date(),
    })
    .returning();

  if (!inserted) {
    throw new Error(`Failed to insert membership for user "${userId}" into workspace "${payload.workspaceId}".`);
  }

  return {
    membership: inserted,
    created: true,
  };
}
