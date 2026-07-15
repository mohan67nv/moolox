/**
 * @moolox/marketplace — Marketplace Sandbox Inspection Preview (`MKT-005`)
 *
 * Ephemeral preview runner allowing studio users to inspect, execute, and test any marketplace
 * plugin or template inside a sandboxed virtual canvas scratchpad prior to workspace installation.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { MarketplaceCatalogRegistry, type MarketplaceItem } from '../registry/marketplaceCatalog';
import { TemplateVerificationEngine, type TemplateVerificationAudit } from '../verification/templateVerifier';
import { PluginSandboxEngine, ManifestValidator } from '@moolox/plugins';

export interface EphemeralPreviewSession {
  sessionId: string;
  itemId: string;
  status: 'active' | 'terminated';
  createdTimestamp: number;
  auditResult?: TemplateVerificationAudit;
  simulatedOutputState: {
    previewReady: boolean;
    manifestValid?: boolean;
    sandboxedDOMNodesCount: number;
  };
}

export class SandboxPreviewRunner {
  private static activeSessions = new Map<string, EphemeralPreviewSession>();

  /**
   * Boots an ephemeral preview scratchpad session for a marketplace item (`MKT-005`).
   */
  static async startPreviewSession(marketplaceItemId: string): Promise<EphemeralPreviewSession> {
    const item = MarketplaceCatalogRegistry.getItem(marketplaceItemId);

    if (!item) {
      throw new Error(`Cannot start preview session: Marketplace item '${marketplaceItemId}' not found.`);
    }

    const sessionId = `prv-${Date.now.toString()}-${Math.random().toString(36).substring(2, 6)}`;

    if (item.type === 'template' && item.templateAST) {
      // Run template verifier audit in real-time
      const audit = TemplateVerificationEngine.verifyTemplate(item.title, item.templateAST as any);

      const session: EphemeralPreviewSession = {
        sessionId,
        itemId: marketplaceItemId,
        status: 'active',
        createdTimestamp: Date.now(),
        auditResult: audit,
        simulatedOutputState: {
          previewReady: audit.verified,
          sandboxedDOMNodesCount: audit.totalNodesChecked,
        },
      };

      this.activeSessions.set(sessionId, session);
      return session;
    } else if (item.type === 'plugin' && item.manifest) {
      const validation = ManifestValidator.validate(item.manifest);

      if (validation.valid && validation.manifest) {
        // Load into isolated sandbox engine for preview inspection
        PluginSandboxEngine.loadPlugin(validation.manifest);
      }

      const session: EphemeralPreviewSession = {
        sessionId,
        itemId: marketplaceItemId,
        status: 'active',
        createdTimestamp: Date.now(),
        simulatedOutputState: {
          previewReady: validation.valid,
          manifestValid: validation.valid,
          sandboxedDOMNodesCount: 1, // Plugin UI panel container
        },
      };

      this.activeSessions.set(sessionId, session);
      return session;
    } else {
      throw new Error(`Item '${marketplaceItemId}' lacks valid payload for inspection preview.`);
    }
  }

  /**
   * Terminates an active preview session and unloads any ephemeral sandbox assets (`MKT-005`).
   */
  static terminateSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.status === 'terminated') return false;

    session.status = 'terminated';

    const item = MarketplaceCatalogRegistry.getItem(session.itemId);
    if (item?.type === 'plugin' && item.manifest) {
      PluginSandboxEngine.unloadPlugin(item.manifest.id);
    }

    return true;
  }

  static getActiveSession(sessionId: string): EphemeralPreviewSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  static resetForTest(): void {
    this.activeSessions.clear();
  }
}
