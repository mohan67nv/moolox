/**
 * @moolox/deploy — Edge Deployment, Static /out Compiler & Instant Rollback Engine
 *
 * Feature IDs:
 * - DEP-001: Static `/out` Chunk Compiler (`Zero Server Dependency HTML/CSS/JS Artifacts`)
 * - DEP-002: Cloudflare R2 / Edge KV Anycast Publisher (`< 500ms Global Propagation`)
 * - DEP-003: 1-Second Instant Rollback Engine (`Atomic Pointer-Flipping in < 1s`)
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

export * from './types';
export * from './compiler/StaticExporter';
export * from './publisher/CloudflareAnycast';
export * from './rollback/InstantRollback';
export * from './domain/customDomainEngine';
export * from './ops/incidentGameDay';
export * from './ga/goldenJourneySignOff';
