/**
 * @moolox/auth — Edge Authentication, Identity, RBAC & Billing Gate
 *
 * Feature IDs: AUTH-001, AUTH-002, AUTH-003, AUTH-004
 *
 * Single source of truth for edge JWT signature verification, workspace RBAC
 * permission matrix, metered AI credit billing checks, and enterprise SSO bridges.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

export * from './jwks';
export * from './rbac';
export * from './billing-gate';
export * from './sso';
export * from './middleware';
export * from './security/tenantSecurityEngine';
