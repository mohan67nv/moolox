/**
 * @moolox/ast-core — AST Compiler Engine & Sub-Tree Diffing Core
 *
 * Feature IDs:
 * - AST-002: SWC Parser & TSX Code Serializer
 * - AST-003: Sub-Tree Structural Diffing & Patching Engine
 * - AST-004: Zstd / Compressed JSONB Database Store Helper
 * - AST-005: AST Window Pruning & Context Slice Helper
 * - CMP-001: 11 Built-In Core Component Specifications
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

export * from './compiler/parser';
export * from './compiler/serializer';
export * from './diff/patcher';
export * from './compress/zstd';
export * from './prune/window';
export * from './components/coreSpecs';
