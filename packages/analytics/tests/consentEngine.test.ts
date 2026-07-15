import { describe, it, expect, beforeEach } from 'vitest';
import {
  PrivacyConsentEngine,
  ConsentGatedTelemetry,
} from '../src/privacy/consentEngine';
import { OTelTracer } from '../src/tracing/OTelTracer';

describe('Privacy Consent Engine & Consent-Gated Telemetry (PRV-001, ANA-002)', () => {
  beforeEach(() => {
    PrivacyConsentEngine.resetForTesting();
    OTelTracer.clearBuffer();
  });

  describe('PrivacyConsentEngine (PRV-001)', () => {
    it('defaults consent to false (opt-in required per ANA-002)', () => {
      const consent = PrivacyConsentEngine.getConsent('ws-new');
      expect(consent.hasConsentedToTelemetry).toBe(false);
      expect(consent.hasConsentedToAIMemory).toBe(false);
    });

    it('stores and inspects AI memory items when consent is granted', () => {
      PrivacyConsentEngine.setConsent('ws-consented', true, true);
      const item = PrivacyConsentEngine.storeAIMemory('ws-consented', 'color_preference', 'User prefers dark mode vibrant colors');

      expect(item).not.toBeNull();
      const memories = PrivacyConsentEngine.inspectAIMemory('ws-consented');
      expect(memories).toHaveLength(1);
      expect(memories[0].key).toBe('color_preference');
    });

    it('refuses to store AI memory when consent is denied', () => {
      PrivacyConsentEngine.setConsent('ws-denied', true, false);
      const item = PrivacyConsentEngine.storeAIMemory('ws-denied', 'font_preference', 'Inter');

      expect(item).toBeNull();
      expect(PrivacyConsentEngine.inspectAIMemory('ws-denied')).toHaveLength(0);
    });

    it('deletes specific and all AI memory on inspection/withdrawal', () => {
      PrivacyConsentEngine.setConsent('ws-mem', true, true);
      const m1 = PrivacyConsentEngine.storeAIMemory('ws-mem', 'k1', 'v1');
      PrivacyConsentEngine.storeAIMemory('ws-mem', 'k2', 'v2');

      expect(PrivacyConsentEngine.inspectAIMemory('ws-mem')).toHaveLength(2);
      PrivacyConsentEngine.deleteAIMemoryItem('ws-mem', m1!.id);
      expect(PrivacyConsentEngine.inspectAIMemory('ws-mem')).toHaveLength(1);

      PrivacyConsentEngine.deleteAllAIMemory('ws-mem');
      expect(PrivacyConsentEngine.inspectAIMemory('ws-mem')).toHaveLength(0);
    });

    it('scrubs API secret keys and passwords from telemetry string attributes', () => {
      const dirtyString = 'Error connecting with sk-proj-1234567890abcdef1234567890abcdef and password: mySuperSecretPassword123';
      const cleanString = PrivacyConsentEngine.sanitizeString(dirtyString);

      expect(cleanString).not.toContain('sk-proj-');
      expect(cleanString).not.toContain('mySuperSecretPassword123');
      expect(cleanString).toContain('[REDACTED_SECRET]');
    });
  });

  describe('ConsentGatedTelemetry (ANA-002)', () => {
    it('does not create spans or record telemetry if workspace has not consented', () => {
      const span = ConsentGatedTelemetry.startSpan('ws-no-consent', 'pipeline.execute');
      expect(span).toBeNull();
      expect(OTelTracer.getBuffer()).toHaveLength(0);
    });

    it('creates span and sanitizes attributes when workspace has consented', () => {
      PrivacyConsentEngine.setConsent('ws-consented', true, true);
      const span = ConsentGatedTelemetry.startSpan('ws-consented', 'canvas.render', {
        api_key: 'sk-abcdef1234567890abcdef1234567890abcdef',
        node_count: 42,
      });

      expect(span).not.toBeNull();
      expect(span?.attributes['api_key']).toContain('[REDACTED_SECRET]');
      expect(span?.attributes['node_count']).toBe(42);

      ConsentGatedTelemetry.endSpan(span);
      expect(OTelTracer.getBuffer()).toHaveLength(1);
    });

    it('purges existing telemetry buffer when consent is withdrawn mid-session', () => {
      PrivacyConsentEngine.setConsent('ws-active', true, true);
      const span = ConsentGatedTelemetry.startSpan('ws-active', 'auth.login');
      ConsentGatedTelemetry.endSpan(span);

      expect(OTelTracer.getBuffer()).toHaveLength(1);

      // User withdraws consent
      PrivacyConsentEngine.setConsent('ws-active', false, false);
      expect(OTelTracer.getBuffer()).toHaveLength(0);
    });
  });
});
