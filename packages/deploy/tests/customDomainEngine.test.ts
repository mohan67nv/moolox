import { describe, it, expect } from 'vitest';
import {
  generateRequiredDNSRecords,
  verifyDNSRecords,
  provisionSSLCertificate,
  checkAndProvisionDomain,
  type CustomDomainConfig,
} from '../src/domain/customDomainEngine';

describe('Custom Domain SSL & DNS Routing Verification Engine (DEP-004)', () => {
  const baseDomain: CustomDomainConfig = {
    id: 'dom-123',
    projectId: 'proj-abc',
    domainName: 'mybrand.com',
    status: 'pending_verification',
    sslStatus: 'unprovisioned',
    requiredRecords: generateRequiredDNSRecords('mybrand.com', 'proj-abc'),
    lastCheckedAt: Date.now(),
  };

  it('generates CNAME and challenge TXT records for a custom domain', () => {
    const records = generateRequiredDNSRecords('mybrand.com', 'proj-abc');
    expect(records).toHaveLength(2);
    expect(records[0].type).toBe('CNAME');
    expect(records[0].name).toBe('www.mybrand.com');
    expect(records[0].value).toBe('anycast.dios.app');
    expect(records[1].type).toBe('TXT');
    expect(records[1].name).toBe('_moolox-challenge.mybrand.com');
    expect(records[1].value).toContain('moolox-verify-');
  });

  it('fails verification and lists missing reasons when DNS answers do not match', async () => {
    const result = await verifyDNSRecords(baseDomain, {
      'www.mybrand.com': ['wrong-target.com'],
      '_moolox-challenge.mybrand.com': [],
    });

    expect(result.isVerified).toBe(false);
    expect(result.status).toBe('pending_verification');
    expect(result.explanation).toContain('Missing or mismatched CNAME record');
    expect(result.explanation).toContain('Missing or mismatched TXT record');
  });

  it('passes verification when DNS answers match expected values', async () => {
    const records = baseDomain.requiredRecords;
    const mockAnswers: Record<string, string[]> = {
      [records[0].name]: [records[0].value],
      [records[1].name]: [records[1].value],
    };

    const result = await verifyDNSRecords(baseDomain, mockAnswers);

    expect(result.isVerified).toBe(true);
    expect(result.status).toBe('pending_ssl');
    expect(result.explanation).toContain('All DNS records verified successfully');
  });

  it('refuses to provision SSL if DNS is unverified', async () => {
    const result = await provisionSSLCertificate(baseDomain, false);
    expect(result.sslStatus).toBe('unprovisioned');
    expect(result.status).toBe('pending_verification');
    expect(result.errorMessage).toContain('Cannot provision SSL');
  });

  it('checkAndProvisionDomain fully verifies and activates SSL certificate in one pipeline', async () => {
    const records = baseDomain.requiredRecords;
    const mockAnswers: Record<string, string[]> = {
      [records[0].name]: [records[0].value],
      [records[1].name]: [records[1].value],
    };

    const { domain, result } = await checkAndProvisionDomain(baseDomain, mockAnswers);

    expect(result.isVerified).toBe(true);
    expect(domain.status).toBe('active');
    expect(domain.sslStatus).toBe('active');
    expect(domain.errorMessage).toBeUndefined();
  });
});
