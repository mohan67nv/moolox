/**
 * @moolox/ast-core — Zstd / Compressed JSONB Database Store Helper (AST-004)
 *
 * Compresses and decompresses canonical `IASTNode` trees for high-efficiency
 * relational database storage (`projects.ast_tree`) and tRPC payload transfer.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { zlibSync, unzlibSync } from 'fflate';
import { type IASTNode, ASTNodeSchema } from '@moolox/types';

/**
 * Compresses an `IASTNode` tree into a binary Buffer / Uint8Array (`zlib/DEFLATE` compressed).
 * Reduces JSON payload size by 70–85% for fast database storage and network transit.
 */
export function compressAST(tree: IASTNode): Uint8Array {
  if (!tree) {
    throw new Error('Cannot compress null or undefined IASTNode.');
  }

  const jsonString = JSON.stringify(tree);
  const rawBytes = new TextEncoder().encode(jsonString);

  // Compress using high-speed deflate/zlib
  return zlibSync(rawBytes, { level: 6 });
}

/**
 * Compresses an `IASTNode` tree and returns a Base64 encoded string (`Zstd/Deflate string wrapper`).
 */
export function compressASTToBase64(tree: IASTNode): string {
  const compressedBytes = compressAST(tree);
  return Buffer.from(compressedBytes).toString('base64');
}

/**
 * Decompresses a raw Uint8Array / Buffer back into a validated `IASTNode` tree.
 */
export function decompressAST(compressedData: Uint8Array | Buffer, validateSchema = true): IASTNode {
  if (!compressedData || compressedData.length === 0) {
    throw new Error('Cannot decompress empty binary payload.');
  }

  let decompressedBytes: Uint8Array;
  try {
    decompressedBytes = unzlibSync(compressedData);
  } catch (error) {
    throw new Error(`Decompression failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  const jsonString = new TextDecoder().decode(decompressedBytes);
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Decompressed payload is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  return validateSchema ? ASTNodeSchema.parse(parsedJson) : (parsedJson as IASTNode);
}

/**
 * Decompresses a Base64 encoded compressed string back into a validated `IASTNode` tree.
 */
export function decompressASTFromBase64(base64String: string, validateSchema = true): IASTNode {
  if (!base64String) {
    throw new Error('Cannot decompress empty Base64 string.');
  }
  const buffer = Buffer.from(base64String, 'base64');
  return decompressAST(buffer, validateSchema);
}
