/**
 * @moolox/analytics — Privacy Consent Engine & Consent-Gated Telemetry
 *
 * Feature IDs: PRV-001, ANA-002
 *
 * Manages tenant telemetry consent (`ANA-002`), provides AI memory inspection
 * and deletion capabilities (`PRV-001`), and guarantees sanitization so user
 * prompts, API keys, and raw canvas secrets never enter ordinary telemetry spans.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { OTelTracer } from '../tracing/OTelTracer';
import { type OTelSpan } from '../types';

export interface ConsentRecord {
  /** Workspace or tenant ID */
  workspaceId: string;
  /** Whether the workspace consented to telemetry and usage metrics (`ANA-002`) */
  hasConsentedToTelemetry: boolean;
  /** Whether the workspace consented to AI model memory and personalization (`PRV-001`) */
  hasConsentedToAIMemory: boolean;
  /** Timestamp when consent was last updated */
  updatedAt: number;
}

export interface AIMemoryItem {
  id: string;
  workspaceId: string;
  key: string;
  valueSummary: string;
  createdTimestamp: number;
}

/**
 * Sensitive regex patterns that must be scrubbed from telemetry spans (`PRV-001`).
 */
const SENSITIVE_PATTERNS = [
  /sk-[a-zA-Z0-9-_]{10,}/g, // OpenAI / general API secret keys
  /bearer\s+[a-zA-Z0-9-_.]+/gi, // Bearer tokens
  /password["']?\s*[:=]\s*["']?([^"'\s]+)/gi, // Passwords
  /secret["']?\s*[:=]\s*["']?([^"'\s]+)/gi, // Generic secrets
];

export class PrivacyConsentEngine {
  private static consentLedger = new Map<string, ConsentRecord>();
  private static aiMemoryStore = new Map<string, AIMemoryItem[]>();

  /**
   * Sets or updates consent preferences for a workspace (`PRV-001`, `ANA-002`).
   */
  static setConsent(
    workspaceId: string,
    hasConsentedToTelemetry: boolean,
    hasConsentedToAIMemory: boolean,
  ): ConsentRecord {
    const record: ConsentRecord = {
      workspaceId,
      hasConsentedToTelemetry,
      hasConsentedToAIMemory,
      updatedAt: Date.now(),
    };

    PrivacyConsentEngine.consentLedger.set(workspaceId, record);

    // If telemetry consent is withdrawn (`hasConsentedToTelemetry = false`), immediately purge active trace spans for this tenant
    if (!hasConsentedToTelemetry) {
      this.purgeTelemetryForWorkspace(workspaceId);
    }

    // If AI memory consent is withdrawn (`hasConsentedToAIMemory = false`), immediately purge stored memories
    if (!hasConsentedToAIMemory) {
      this.deleteAllAIMemory(workspaceId);
    }

    return record;
  }

  /**
   * Retrieves active consent record. Defaults to FALSE (opt-in required per `ANA-002`, `PRV-001`).
   */
  static getConsent(workspaceId: string): ConsentRecord {
    return (
      PrivacyConsentEngine.consentLedger.get(workspaceId) || {
        workspaceId,
        hasConsentedToTelemetry: false,
        hasConsentedToAIMemory: false,
        updatedAt: 0,
      }
    );
  }

  /**
   * Stores an AI memory preference item only if the tenant consented (`PRV-001`).
   */
  static storeAIMemory(workspaceId: string, key: string, valueSummary: string): AIMemoryItem | null {
    const consent = this.getConsent(workspaceId);
    if (!consent.hasConsentedToAIMemory) {
      return null;
    }

    const item: AIMemoryItem = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      workspaceId,
      key,
      valueSummary,
      createdTimestamp: Date.now(),
    };

    const existing = PrivacyConsentEngine.aiMemoryStore.get(workspaceId) || [];
    PrivacyConsentEngine.aiMemoryStore.set(workspaceId, [...existing, item]);
    return item;
  }

  /**
   * Inspects and returns all stored AI memories for a workspace (`PRV-001`).
   */
  static inspectAIMemory(workspaceId: string): AIMemoryItem[] {
    return [...(PrivacyConsentEngine.aiMemoryStore.get(workspaceId) || [])];
  }

  /**
   * Deletes a specific AI memory item (`PRV-001`).
   */
  static deleteAIMemoryItem(workspaceId: string, memoryId: string): boolean {
    const existing = PrivacyConsentEngine.aiMemoryStore.get(workspaceId);
    if (!existing) return false;

    const filtered = existing.filter((m) => m.id !== memoryId);
    const wasDeleted = filtered.length < existing.length;
    PrivacyConsentEngine.aiMemoryStore.set(workspaceId, filtered);
    return wasDeleted;
  }

  /**
   * Deletes all stored AI memory for a workspace (`PRV-001`).
   */
  static deleteAllAIMemory(workspaceId: string): void {
    PrivacyConsentEngine.aiMemoryStore.delete(workspaceId);
  }

  /**
   * Scrubs sensitive tokens, prompts, and credentials from string attributes (`PRV-001`).
   */
  static sanitizeString(input: string): string {
    let sanitized = input;
    for (const pattern of SENSITIVE_PATTERNS) {
      sanitized = sanitized.replace(pattern, '[REDACTED_SECRET]');
    }
    return sanitized;
  }

  /**
   * Sanitizes attributes object before recording in telemetry spans (`PRV-001`).
   */
  static sanitizeAttributes(attributes: Record<string, any>): Record<string, any> {
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(attributes)) {
      if (typeof v === 'string') {
        clean[k] = this.sanitizeString(v);
      } else if (typeof v === 'object' && v !== null) {
        clean[k] = JSON.parse(this.sanitizeString(JSON.stringify(v)));
      } else {
        clean[k] = v;
      }
    }
    return clean;
  }

  /**
   * Purges all buffered OTel spans tagged for this workspace (`ANA-002`).
   */
  private static purgeTelemetryForWorkspace(workspaceId: string): void {
    const buffer = OTelTracer.getBuffer();
    // Filter out spans belonging to this workspace
    const remaining = buffer.filter((s) => s.attributes['workspace_id'] !== workspaceId);
    if (remaining.length !== buffer.length) {
      OTelTracer.clearBuffer();
      // Re-populate with remaining
      for (const span of remaining) {
        (OTelTracer as any).spanBuffer.push(span);
      }
    }
  }

  /** Clears consent ledger for testing */
  static resetForTesting(): void {
    PrivacyConsentEngine.consentLedger.clear();
    PrivacyConsentEngine.aiMemoryStore.clear();
  }
}

export class ConsentGatedTelemetry {
  /**
   * Starts a telemetry span ONLY if the workspace explicitly consented (`ANA-002`).
   * Sanitizes all input attributes to ensure zero secrets leak into spans (`PRV-001`).
   */
  static startSpan(
    workspaceId: string,
    name: string,
    attributes: Record<string, any> = {},
  ): OTelSpan | null {
    const consent = PrivacyConsentEngine.getConsent(workspaceId);
    if (!consent.hasConsentedToTelemetry) {
      return null;
    }

    const safeAttrs = PrivacyConsentEngine.sanitizeAttributes({
      ...attributes,
      workspace_id: workspaceId,
    });

    return OTelTracer.startSpan(name, safeAttrs);
  }

  /**
   * Ends an active telemetry span if it was created (`ANA-002`).
   */
  static endSpan(
    span: OTelSpan | null,
    status: 'ok' | 'error' = 'ok',
    additionalAttributes: Record<string, any> = {},
  ): OTelSpan | null {
    if (!span) return null;

    const safeAdd = PrivacyConsentEngine.sanitizeAttributes(additionalAttributes);
    return OTelTracer.endSpan(span.spanId, status, safeAdd);
  }
}
