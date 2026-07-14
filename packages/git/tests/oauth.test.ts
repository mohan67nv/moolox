/**
 * @moolox/git — GitHub App OAuth & Configuration Tests (AUTH-007)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getGitHubAppConfig, generateAppJWT, type GitHubAppConfig } from '../src/github/oauth';
import { generateKeyPairSync } from 'node:crypto';

describe('GitHub App Configuration & OAuth (AUTH-007)', () => {
  let mockPrivateKey: string;

  beforeEach(() => {
    // Generate ephemeral RSA key for JWT signing test
    const { privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    mockPrivateKey = privateKey;

    process.env.GITHUB_APP_ID = '123456';
    process.env.GITHUB_APP_PRIVATE_KEY = mockPrivateKey;
    process.env.GITHUB_WEBHOOK_SECRET = 'mock_secret_abc';
    process.env.GITHUB_APP_CLIENT_ID = 'Iv1.mockClientId';
  });

  afterEach(() => {
    delete process.env.GITHUB_APP_ID;
    delete process.env.GITHUB_APP_PRIVATE_KEY;
    delete process.env.GITHUB_WEBHOOK_SECRET;
    delete process.env.GITHUB_APP_CLIENT_ID;
  });

  it('retrieves valid GitHubAppConfig from environment variables', () => {
    const config = getGitHubAppConfig();
    expect(config.appId).toBe('123456');
    expect(config.webhookSecret).toBe('mock_secret_abc');
    expect(config.clientId).toBe('Iv1.mockClientId');
    expect(config.privateKey).toContain('BEGIN PRIVATE KEY');
  });

  it('throws explicit error when required environment variables are missing', () => {
    delete process.env.GITHUB_APP_ID;
    expect(() => getGitHubAppConfig()).toThrow('Missing GitHub App configuration');
  });

  it('generates valid RS256 JWT for app authentication with proper header and payload', async () => {
    const config: GitHubAppConfig = {
      appId: '123456',
      privateKey: mockPrivateKey,
      webhookSecret: 'mock_secret',
      clientId: 'mock_client_id',
      apiBaseUrl: 'https://api.github.com',
    };

    const jwt = await generateAppJWT(config);
    expect(jwt).toBeTruthy();

    const parts = jwt.split('.');
    expect(parts).toHaveLength(3);

    const header = JSON.parse(Buffer.from(parts[0]!, 'base64url').toString('utf8'));
    expect(header).toEqual({ alg: 'RS256', typ: 'JWT' });

    const payload = JSON.parse(Buffer.from(parts[1]!, 'base64url').toString('utf8'));
    expect(payload.iss).toBe('123456');
    expect(typeof payload.iat).toBe('number');
    expect(typeof payload.exp).toBe('number');
    expect(payload.exp - payload.iat).toBe(660); // 10 min + 60s skew allowance
  });
});
