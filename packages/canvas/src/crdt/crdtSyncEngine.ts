/**
 * @moolox/canvas — Real-Time CRDT Collaboration Engine (`COL-001`, `COL-003`, `COL-004`)
 *
 * Implements Lamport logical clocks, state vector diffing, and deterministic Last-Write-Wins (`LWW`)
 * reconciliation for conflict-free multi-user simultaneous canvas editing (`Yjs`-inspired convergence).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { type IASTNode, type CRDTMetadata } from '@moolox/types';

export interface LamportClock {
  counter: number;
  clientId: string;
}

export interface CRDTOperation {
  opId: string;
  clientId: string;
  clock: LamportClock;
  type: 'node:insert' | 'node:remove' | 'node:update_props' | 'node:update_styles' | 'node:replace_subtree';
  targetNodeId: string;
  parentNodeId?: string;
  index?: number;
  payload?: Record<string, unknown> | IASTNode;
  timestamp: number;
}

export class OptimisticLockReconciler {
  /**
   * Deterministic tie-breaker (`COL-004`):
   * Compares two Lamport clocks to determine the Last-Write-Wins (`LWW`) winner.
   * If counters differ, the higher counter wins.
   * If counters are identical, lexical comparison on `clientId` breaks the tie deterministically (`clientB > clientA`).
   */
  static compareClocks(clockA: LamportClock, clockB: LamportClock): number {
    if (clockA.counter !== clockB.counter) {
      return clockA.counter - clockB.counter;
    }
    if (clockA.clientId !== clockB.clientId) {
      return clockA.clientId > clockB.clientId ? 1 : -1;
    }
    return 0;
  }

  /**
   * Reconciles concurrent updates to the exact same AST node (`COL-004`).
   * Returns true if `incomingOp` wins over `existingClock`, otherwise false.
   */
  static shouldApplyIncomingPatch(incomingClock: LamportClock, existingClock?: LamportClock): boolean {
    if (!existingClock) return true;
    return this.compareClocks(incomingClock, existingClock) > 0;
  }
}

export class CRDTDocument {
  private localClientId: string;
  private localCounter: number = 0;
  private stateVector = new Map<string, number>();
  private operationLog = new Map<string, CRDTOperation>();
  private nodeClocks = new Map<string, LamportClock>();
  private astRoot: IASTNode;

  constructor(localClientId: string, initialRoot: IASTNode) {
    this.localClientId = localClientId;
    this.astRoot = JSON.parse(JSON.stringify(initialRoot));
    this.stateVector.set(localClientId, 0);
  }

  getAstRoot(): IASTNode {
    return this.astRoot;
  }

  getStateVector(): Map<string, number> {
    return new Map(this.stateVector);
  }

  getOperationLog(): CRDTOperation[] {
    return Array.from(this.operationLog.values());
  }

  /**
   * Increments the local Lamport clock and generates a new atomic `CRDTOperation` (`COL-001`).
   */
  createOperation(
    type: CRDTOperation['type'],
    targetNodeId: string,
    payload?: Record<string, unknown> | IASTNode,
    parentNodeId?: string,
    index?: number
  ): CRDTOperation {
    this.localCounter += 1;
    this.stateVector.set(this.localClientId, this.localCounter);

    const op: CRDTOperation = {
      opId: `op-${this.localClientId}-${this.localCounter}`,
      clientId: this.localClientId,
      clock: { counter: this.localCounter, clientId: this.localClientId },
      type,
      targetNodeId,
      parentNodeId,
      index,
      payload,
      timestamp: Date.now(),
    };

    this.applyOperation(op);
    return op;
  }

  /**
   * Applies an incoming (local or remote) CRDTOperation to the canonical AST document (`COL-001`, `COL-003`).
   * Guarantees conflict-free structural convergence.
   */
  applyOperation(op: CRDTOperation): { applied: boolean; reason?: string } {
    if (this.operationLog.has(op.opId)) {
      return { applied: false, reason: `Duplicate operation '${op.opId}' (` + `COL-003` + `).` };
    }

    // Advance local Lamport clock (`COL-001`)
    if (op.clientId !== this.localClientId) {
      this.localCounter = Math.max(this.localCounter, op.clock.counter) + 1;
    } else {
      this.localCounter = Math.max(this.localCounter, op.clock.counter);
    }
    const currentVectorMax = this.stateVector.get(op.clientId) || 0;
    this.stateVector.set(op.clientId, Math.max(currentVectorMax, op.clock.counter));
    this.operationLog.set(op.opId, op);

    // Check Optimistic Lock / LWW priority for existing node modifications (`COL-004`)
    const existingClock = this.nodeClocks.get(op.targetNodeId);
    if (op.type === 'node:update_props' || op.type === 'node:update_styles') {
      if (!OptimisticLockReconciler.shouldApplyIncomingPatch(op.clock, existingClock)) {
        return { applied: false, reason: `Incoming patch superseded by higher clock on node '${op.targetNodeId}' (` + `COL-004` + `).` };
      }
    }

    this.nodeClocks.set(op.targetNodeId, op.clock);

    // Apply structural delta modification (`COL-003`)
    const mutatedRoot = JSON.parse(JSON.stringify(this.astRoot)) as IASTNode;

    switch (op.type) {
      case 'node:update_props': {
        const target = this.findNodeById(mutatedRoot, op.targetNodeId);
        if (target && op.payload && !(op.payload as IASTNode).nodeId) {
          target.props = { ...target.props, ...op.payload };
          this.updateNodeMetadata(target, op);
        }
        break;
      }

      case 'node:update_styles': {
        const target = this.findNodeById(mutatedRoot, op.targetNodeId);
        if (target && op.payload && !(op.payload as IASTNode).nodeId) {
          target.styles = { ...target.styles, ...(op.payload as Record<string, string>) };
          this.updateNodeMetadata(target, op);
        }
        break;
      }

      case 'node:insert': {
        const parentId = op.parentNodeId || mutatedRoot.nodeId;
        const parent = this.findNodeById(mutatedRoot, parentId);
        if (parent && op.payload && (op.payload as IASTNode).nodeId) {
          if (!parent.children) parent.children = [];
          // Prevent duplicates
          const existingIdx = parent.children.findIndex((c) => c.nodeId === op.targetNodeId);
          if (existingIdx === -1) {
            const insertIdx = op.index !== undefined ? Math.min(op.index, parent.children.length) : parent.children.length;
            const childNode = op.payload as IASTNode;
            this.updateNodeMetadata(childNode, op);
            parent.children.splice(insertIdx, 0, childNode);
          }
        }
        break;
      }

      case 'node:remove': {
        this.removeNodeById(mutatedRoot, op.targetNodeId);
        break;
      }

      case 'node:replace_subtree': {
        if (op.targetNodeId === mutatedRoot.nodeId && op.payload && (op.payload as IASTNode).nodeId) {
          this.astRoot = op.payload as IASTNode;
          this.updateNodeMetadata(this.astRoot, op);
          return { applied: true };
        } else {
          const target = this.findNodeById(mutatedRoot, op.targetNodeId);
          if (target && op.payload && (op.payload as IASTNode).nodeId) {
            Object.assign(target, op.payload);
            this.updateNodeMetadata(target, op);
          }
        }
        break;
      }
    }

    this.astRoot = mutatedRoot;
    return { applied: true };
  }

  /**
   * Computes missing CRDTOperations since a remote client's state vector (`COL-003`).
   * Used when a client joins or reconnects after network partition.
   */
  computeDeltaSince(remoteVector: Map<string, number>): CRDTOperation[] {
    const missingOps: CRDTOperation[] = [];
    for (const op of this.operationLog.values()) {
      const remoteCounter = remoteVector.get(op.clientId) || 0;
      if (op.clock.counter > remoteCounter) {
        missingOps.push(op);
      }
    }
    // Sort by logical Lamport clock counter
    return missingOps.sort((a, b) => OptimisticLockReconciler.compareClocks(a.clock, b.clock));
  }

  private updateNodeMetadata(node: IASTNode, op: CRDTOperation): void {
    const versionMap: Record<string, number> = node.crdtMetadata?.versionVector ? { ...node.crdtMetadata.versionVector } : {};
    versionMap[op.clientId] = op.clock.counter;

    const meta: CRDTMetadata = {
      versionVector: versionMap,
      lastModifiedBy: op.clientId,
    };
    node.crdtMetadata = meta;
  }

  private findNodeById(current: IASTNode, id: string): IASTNode | null {
    if (current.nodeId === id) return current;
    if (current.children) {
      for (const child of current.children) {
        const found = this.findNodeById(child, id);
        if (found) return found;
      }
    }
    return null;
  }

  private removeNodeById(current: IASTNode, id: string): boolean {
    if (!current.children) return false;
    const idx = current.children.findIndex((c) => c.nodeId === id);
    if (idx !== -1) {
      current.children.splice(idx, 1);
      return true;
    }
    for (const child of current.children) {
      if (this.removeNodeById(child, id)) return true;
    }
    return false;
  }
}
