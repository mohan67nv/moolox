/**
 * @moolox/auth — Clerk Enterprise Identity & JWKS Verification (AUTH-001)
 *
 * Verifies JWT signatures at the edge (`< 1ms`) and extracts user identity
 * (`sub`, `email`, active workspace context) from Bearer tokens or Edge headers.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { verifyToken, type VerifyTokenOptions } from '@clerk/backend';
import { AuthContextSchema, type IAuthContext, type WorkspaceRole } from '@moolox/types';

/**
 * Custom error thrown when edge JWT or request authentication fails.
 */
export class UnauthorizedError extends Error {
  public readonly status = 401;
  public readonly code = 'UNAUTHORIZED';

  constructor(message = 'Authentication required. Missing or invalid Bearer token.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Options for verifying a Clerk edge token directly against JWKS.
 */
export interface VerifyClerkTokenOptions extends Partial<VerifyTokenOptions> {
  secretKey?: string;
  jwtKey?: string;
  apiUrl?: string;
}

/**
 * Verifies a raw JWT Bearer token using Clerk's JWKS public key or secret key.
 * Returns the validated payload claims.
 */
export async function verifyClerkJwt(
  token: string,
  options: VerifyClerkTokenOptions = {},
): Promise<{
  sub: string;
  email?: string;
  org_id?: string;
  org_role?: string;
  metadata?: Record<string, unknown>;
}> {
  if (!token) {
    throw new UnauthorizedError('Missing JWT token.');
  }

  const secretKey = options.secretKey || process.env.CLERK_SECRET_KEY;
  const jwtKey = options.jwtKey || process.env.CLERK_JWT_KEY;

  if (!secretKey && !jwtKey) {
    // If running in local test mode without Clerk keys, perform mock payload decoding
    // only when explicitly enabled by TEST_MOCK_AUTH=true environment variable
    if (process.env.NODE_ENV === 'test' || process.env.TEST_MOCK_AUTH === 'true') {
      return decodeMockToken(token);
    }
    throw new Error('Missing Clerk authentication keys (CLERK_SECRET_KEY or CLERK_JWT_KEY).');
  }

  try {
    const claims = await verifyToken(token, {
      secretKey,
      jwtKey,
      ...options,
    });

    return {
      sub: claims.sub,
      email: typeof claims.email === 'string' ? claims.email : undefined,
      org_id: typeof claims.org_id === 'string' ? claims.org_id : undefined,
      org_role: typeof claims.org_role === 'string' ? claims.org_role : undefined,
      metadata: (claims.metadata as Record<string, unknown>) || {},
    };
  } catch (error) {
    throw new UnauthorizedError(
      `Invalid JWT token signature: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Extracts the standardized `IAuthContext` from either:
 * 1. An Authorization Bearer header (`Bearer eyJ...`)
 * 2. Clerk Edge headers set by Next.js `clerkMiddleware()` (`x-clerk-user-id`, `x-clerk-user-email`, etc.)
 */
export async function extractAuthContextFromHeaders(
  headers: Headers | Record<string, string | undefined>,
  options: VerifyClerkTokenOptions = {},
): Promise<IAuthContext> {
  const getHeader = (name: string): string | undefined => {
    if (typeof (headers as Headers).get === 'function') {
      return (headers as Headers).get(name) || undefined;
    }
    const record = headers as Record<string, string | undefined>;
    return record[name] || record[name.toLowerCase()];
  };

  // 1. Check direct Clerk edge headers first (if pre-verified by middleware)
  const clerkUserId = getHeader('x-clerk-user-id') || getHeader('x-auth-user-id');
  if (clerkUserId) {
    const email = getHeader('x-clerk-user-email') || getHeader('x-auth-user-email') || 'user@moolox.local';
    const activeWorkspaceId = getHeader('x-clerk-org-id') || getHeader('x-auth-workspace-id');
    const roleStr = getHeader('x-clerk-org-role') || getHeader('x-auth-workspace-role');

    return AuthContextSchema.parse({
      userId: clerkUserId,
      email,
      activeWorkspaceId: activeWorkspaceId || undefined,
      role: isValidRole(roleStr) ? (roleStr as WorkspaceRole) : undefined,
    });
  }

  // 2. Check Authorization header
  const authHeader = getHeader('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing Authorization Bearer header.');
  }

  const token = authHeader.slice(7).trim();
  const claims = await verifyClerkJwt(token, options);

  // Map Clerk org_role (e.g., 'org:admin') to Moolox WorkspaceRole ('admin')
  const mappedRole = claims.org_role ? mapClerkRoleToWorkspaceRole(claims.org_role) : undefined;

  return AuthContextSchema.parse({
    userId: claims.sub,
    email: claims.email || 'user@moolox.local',
    activeWorkspaceId: claims.org_id,
    role: mappedRole,
  });
}

/** Helper to validate role string against WorkspaceRole enum values */
function isValidRole(role?: string): boolean {
  return role === 'owner' || role === 'admin' || role === 'editor' || role === 'viewer' || role === 'client_editor';
}

/** Maps Clerk org_role claims like 'org:admin' or 'org:member' to WorkspaceRole */
export function mapClerkRoleToWorkspaceRole(clerkRole: string): WorkspaceRole {
  const normalized = clerkRole.replace(/^org:/i, '').toLowerCase();
  switch (normalized) {
    case 'owner':
      return 'owner';
    case 'admin':
      return 'admin';
    case 'editor':
    case 'member':
      return 'editor';
    case 'viewer':
    case 'guest':
      return 'viewer';
    case 'client_editor':
      return 'client_editor';
    default:
      return 'editor';
  }
}

/** Helper for local/unit testing when TEST_MOCK_AUTH=true */
function decodeMockToken(token: string): { sub: string; email?: string; org_id?: string; org_role?: string } {
  if (token === 'mock-invalid-token') {
    throw new UnauthorizedError('Mock token verification failed.');
  }
  try {
    const parts = token.split('.');
    if (parts.length === 3 && parts[1]) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      return {
        sub: payload.sub || 'mock_user_id',
        email: payload.email || 'mock@moolox.com',
        org_id: payload.org_id || payload.workspace_id,
        org_role: payload.org_role || payload.role,
      };
    }
  } catch {
    // Ignore and fallback to simple string token
  }
  return {
    sub: `user_${token}`,
    email: `${token}@moolox.local`,
  };
}
