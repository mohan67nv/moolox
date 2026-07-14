/**
 * @moolox/auth — Enterprise SAML / Single Sign-On (`SSO`) Bridge (AUTH-004)
 *
 * Preserves exact hooks required for Okta, Azure AD, and Google Workspace federated
 * authentication for enterprise accounts when activated in `v3.0 Enterprise`.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { eq } from 'drizzle-orm';
import { type Database, enterpriseOrgs, type EnterpriseOrg } from '@moolox/db';

/**
 * Enterprise SSO provider configuration contract.
 */
export interface EnterpriseSSOConfig {
  enterpriseOrgId: string;
  ssoDomain: string;
  provider: 'okta' | 'azure_ad' | 'google_workspace' | 'saml_custom';
  metadataUrl?: string;
  enforceSSOOnly: boolean;
  isHipaaEnforced: boolean;
}

/**
 * Resolves an enterprise organization and its SSO configuration from an email address
 * domain (e.g. `user@enterprise.com` -> `sso_domain = 'enterprise.com'`).
 *
 * Preserved Day 1 hook ready for `v3.0 Enterprise` activation.
 */
export async function resolveEnterpriseSSOByDomain(
  db: Database,
  emailDomain: string,
): Promise<EnterpriseOrg | null> {
  if (!emailDomain || !emailDomain.includes('.')) {
    return null;
  }

  const normalizedDomain = emailDomain.toLowerCase().trim();
  const org = await db.query.enterpriseOrgs.findFirst({
    where: eq(enterpriseOrgs.ssoDomain, normalizedDomain),
  });

  return org || null;
}
