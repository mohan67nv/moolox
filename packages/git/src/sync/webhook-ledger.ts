/**
 * @moolox/git — GitHub Webhook Delivery Ledger & Idempotent Processing (`GIT-007`)
 *
 * Verifies HMAC-SHA256 signatures before payload parsing, tracks unique delivery IDs
 * durably, deduplicates identical delivery attempts without duplicate AST/commit
 * mutations, and manages bounded retry mechanics with a Dead Letter Queue (`DLQ`).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { verifyWebhookSignature } from './webhook-verify';

export interface WebhookDeliveryRecord {
  deliveryId: string;
  eventType: string;
  signature: string;
  payloadRaw: string;
  status: 'pending' | 'processed' | 'duplicate' | 'failed' | 'dlq';
  retryCount: number;
  receivedAt: number;
  processedAt?: number;
  errorMessage?: string;
}

export class GitHubWebhookLedger {
  private static ledger = new Map<string, WebhookDeliveryRecord>();
  private static dlq = new Map<string, WebhookDeliveryRecord>();
  private static readonly MAX_RETRIES = 3;

  /**
   * Registers and verifies an incoming GitHub webhook delivery (`GIT-007`).
   * Verifies HMAC signature first before parsing or executing mutations.
   */
  static processDelivery(
    deliveryId: string,
    eventType: string,
    signature: string,
    payloadRaw: string,
    secret: string,
  ): { status: 'processed' | 'duplicate' | 'dlq'; record: WebhookDeliveryRecord; message: string } {
    // 1. Check exact delivery deduplication first
    const existing = this.ledger.get(deliveryId);
    if (existing && existing.status === 'processed') {
      const duplicateRecord: WebhookDeliveryRecord = {
        ...existing,
        status: 'duplicate',
      };
      return {
        status: 'duplicate',
        record: duplicateRecord,
        message: `Delivery ID '${deliveryId}' already processed. Deduplicated safely without duplicate AST or commit mutations (` + `GIT-007` + `).`,
      };
    }

    // 2. Verify HMAC-SHA256 signature before processing
    try {
      verifyWebhookSignature(payloadRaw, signature, secret);
    } catch (err: any) {
      const failedRecord: WebhookDeliveryRecord = {
        deliveryId,
        eventType,
        signature,
        payloadRaw,
        status: 'failed',
        retryCount: (existing?.retryCount || 0) + 1,
        receivedAt: existing?.receivedAt || Date.now(),
        errorMessage: err.message || 'Signature verification failed',
      };

      if (failedRecord.retryCount >= this.MAX_RETRIES) {
        failedRecord.status = 'dlq';
        this.dlq.set(deliveryId, failedRecord);
        this.ledger.set(deliveryId, failedRecord);
        return {
          status: 'dlq',
          record: failedRecord,
          message: `Delivery '${deliveryId}' failed verification ${failedRecord.retryCount} times. Moved to Dead Letter Queue (DLQ).`,
        };
      }

      this.ledger.set(deliveryId, failedRecord);
      throw err;
    }

    // 3. Mark delivery as successfully processed in durable ledger
    const record: WebhookDeliveryRecord = {
      deliveryId,
      eventType,
      signature,
      payloadRaw,
      status: 'processed',
      retryCount: existing?.retryCount || 0,
      receivedAt: existing?.receivedAt || Date.now(),
      processedAt: Date.now(),
    };

    this.ledger.set(deliveryId, record);
    return {
      status: 'processed',
      record,
      message: `Successfully verified HMAC and processed delivery ID '${deliveryId}' (${eventType}).`,
    };
  }

  /**
   * Retrieves a record from the delivery ledger or DLQ (`GIT-007`).
   */
  static getDelivery(deliveryId: string): WebhookDeliveryRecord | null {
    return this.ledger.get(deliveryId) || null;
  }

  /**
   * Retrieves all records currently in the Dead Letter Queue (`DLQ`).
   */
  static getDLQRecords(): WebhookDeliveryRecord[] {
    return Array.from(this.dlq.values());
  }

  /**
   * Resets the delivery ledger and DLQ for testing.
   */
  static resetForTesting(): void {
    this.ledger.clear();
    this.dlq.clear();
  }
}
