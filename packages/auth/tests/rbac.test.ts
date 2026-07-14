/**
 * @moolox/auth — RBAC Engine Unit Tests (Feature: AUTH-002)
 *
 * Validates role-based permission matrix across all 5 tenancy roles.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import { hasPermission, assertPermission, ForbiddenError } from '../src/rbac';

describe('Workspace RBAC Permission Engine (AUTH-002)', () => {
  it('owner has full permissions across all actions', () => {
    const actions = [
      'DELETE_WORKSPACE',
      'MANAGE_BILLING',
      'MANAGE_MEMBERS',
      'MANAGE_SETTINGS',
      'CREATE_PROJECT',
      'EDIT_AST',
      'PUBLISH_DEPLOYMENT',
      'VIEW_PROJECT',
    ] as const;

    for (const action of actions) {
      expect(hasPermission('owner', action)).toBe(true);
    }
  });

  it('admin has all permissions except DELETE_WORKSPACE', () => {
    expect(hasPermission('admin', 'DELETE_WORKSPACE')).toBe(false);
    expect(hasPermission('admin', 'MANAGE_BILLING')).toBe(true);
    expect(hasPermission('admin', 'MANAGE_MEMBERS')).toBe(true);
    expect(hasPermission('admin', 'PUBLISH_DEPLOYMENT')).toBe(true);
  });

  it('editor can create projects, edit AST, publish, and view, but cannot manage tenancy or billing', () => {
    expect(hasPermission('editor', 'CREATE_PROJECT')).toBe(true);
    expect(hasPermission('editor', 'EDIT_AST')).toBe(true);
    expect(hasPermission('editor', 'PUBLISH_DEPLOYMENT')).toBe(true);
    expect(hasPermission('editor', 'VIEW_PROJECT')).toBe(true);

    expect(hasPermission('editor', 'MANAGE_MEMBERS')).toBe(false);
    expect(hasPermission('editor', 'MANAGE_BILLING')).toBe(false);
    expect(hasPermission('editor', 'DELETE_WORKSPACE')).toBe(false);
  });

  it('client_editor can edit AST and view projects only', () => {
    expect(hasPermission('client_editor', 'EDIT_AST')).toBe(true);
    expect(hasPermission('client_editor', 'VIEW_PROJECT')).toBe(true);

    expect(hasPermission('client_editor', 'CREATE_PROJECT')).toBe(false);
    expect(hasPermission('client_editor', 'PUBLISH_DEPLOYMENT')).toBe(false);
  });

  it('viewer can only view projects', () => {
    expect(hasPermission('viewer', 'VIEW_PROJECT')).toBe(true);
    expect(hasPermission('viewer', 'EDIT_AST')).toBe(false);
    expect(hasPermission('viewer', 'CREATE_PROJECT')).toBe(false);
    expect(hasPermission('viewer', 'PUBLISH_DEPLOYMENT')).toBe(false);
  });

  it('assertPermission throws ForbiddenError when permission is lacking', () => {
    expect(() => assertPermission('viewer', 'EDIT_AST')).toThrow(ForbiddenError);
    expect(() => assertPermission('editor', 'MANAGE_BILLING')).toThrow(ForbiddenError);
  });

  it('assertPermission succeeds silently when permission is granted', () => {
    expect(() => assertPermission('editor', 'EDIT_AST')).not.toThrow();
    expect(() => assertPermission('owner', 'DELETE_WORKSPACE')).not.toThrow();
  });
});
