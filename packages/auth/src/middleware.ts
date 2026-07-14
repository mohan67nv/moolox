/**
 * @moolox/auth — Edge Authentication Middleware (AUTH-001 & AUTH-002)
 *
 * Protects `/api/*` and `/trpc/*` routes at the edge using `@clerk/nextjs` middleware.
 * Unauthenticated requests are rejected immediately with exact `401 Unauthorized` JSON errors (`< 2ms`).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Route matchers for protected backend routes.
 */
export const isProtectedApiRoute = createRouteMatcher(['/api/(.*)', '/trpc/(.*)']);
export const isPublicRoute = createRouteMatcher(['/api/webhook/(.*)', '/api/health']);

/**
 * Creates and exports the unified Moolox Clerk Edge Middleware.
 * Protects `/api/*` and `/trpc/*` routes while allowing webhooks and health endpoints.
 */
export function createAuthMiddleware() {
  return clerkMiddleware(async (auth, req: NextRequest) => {
    // Check if the route is protected
    if (isProtectedApiRoute(req) && !isPublicRoute(req)) {
      const authObj = await auth();

      if (!authObj.userId) {
        // Return exact 401 Unauthorized JSON error right from the edge
        return NextResponse.json(
          {
            error: 'Unauthorized',
            message: 'Authentication required to access this endpoint.',
            status: 401,
          },
          { status: 401 },
        );
      }

      // Populate standardized Moolox edge headers for downstream API routes / tRPC contexts
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-clerk-user-id', authObj.userId);
      if (authObj.orgId) {
        requestHeaders.set('x-clerk-org-id', authObj.orgId);
      }
      if (authObj.orgRole) {
        requestHeaders.set('x-clerk-org-role', authObj.orgRole);
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.next();
  });
}

/**
 * Default exported instance ready to be re-exported in `apps/web/src/middleware.ts`.
 */
export const authMiddleware = createAuthMiddleware();
