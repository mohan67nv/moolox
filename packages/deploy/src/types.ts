/**
 * @moolox/deploy — Edge Deployment, Static Chunk Compilation & Rollback Types
 *
 * Feature IDs: DEP-001, DEP-002, DEP-003
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

/**
 * Static export artifact bundle emitted by StaticExporter (`DEP-001`).
 */
export interface StaticExportBundle {
  /** Unique bundle identifier */
  bundleId: string;
  /** Full standalone HTML5 document string */
  html: string;
  /** Compiled W3C custom properties and design token stylesheet */
  css: string;
  /** Standalone micro-hydration JavaScript bundle */
  js: string;
  /** Integrity hash (SHA-256 / FNV-1a) of the combined bundle */
  hash: string;
  /** Creation timestamp in milliseconds */
  timestamp: number;
  /** Execution and bundle diagnostics */
  metadata: {
    totalNodes: number;
    totalTokensCompiled: number;
    sizeBytes: number;
    compileDurationMs: number;
  };
}

/**
 * Edge Anycast publication result returned from CloudflareAnycast (`DEP-002`).
 */
export interface PublishResult {
  /** Whether edge propagation succeeded */
  success: boolean;
  /** Published bundle identifier */
  bundleId: string;
  /** Fully qualified edge domain (e.g. `https://my-brand.dios.app/`) */
  edgeUrl: string;
  /** Assigned edge subdomain (`my-brand`) */
  subdomain: string;
  /** Cloudflare Anycast POP regions that have propagated the payload */
  anycastRegions: string[];
  /** Propagation duration in milliseconds (`target < 500ms`) */
  propagationMs: number;
  /** Error description if publication failed */
  errorMessage?: string;
}

/**
 * Rollback request payload passed to InstantRollback (`DEP-003`).
 */
export interface RollbackRequest {
  /** Target project UUID */
  projectId: string;
  /** Version ID to instantly flip live traffic to */
  targetVersionId: string;
  /** Optional reason for audit logs */
  reason?: string;
}

/**
 * Execution result returned from instant pointer-flip (`DEP-003`).
 */
export interface RollbackResult {
  /** Whether the pointer flip succeeded */
  success: boolean;
  /** Target project UUID */
  projectId: string;
  /** Previously active version ID before rollback */
  previousVersionId: string;
  /** Newly active version ID now receiving live edge traffic */
  newActiveVersionId: string;
  /** Pointer-flip latency in milliseconds (`target < 1,000ms`) */
  flipDurationMs: number;
  /** Audit trail summary */
  explanation: string;
}
