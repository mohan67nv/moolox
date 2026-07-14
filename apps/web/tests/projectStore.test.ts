/**
 * @moolox/web — Project Store & Undo/Redo Unit Tests (Task 1.3)
 *
 * Validates Zustand debounced auto-save triggers (`PRJ-002`), exact `Ctrl+Z`
 * undo / redo stack steps (`PRJ-004`), and 409 optimistic lock conflicts (`PRJ-003`).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useProjectStore, OptimisticLockConflictError, type SaveVersionResponse } from '../src/stores/projectStore';
import { parseJSX, decompressASTFromBase64 } from '@moolox/ast-core';

describe('Client-Side Auto-Save Store & Optimistic Locking (Task 1.3)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useProjectStore.getState().cancelAutoSave();
  });

  afterEach(() => {
    useProjectStore.getState().cancelAutoSave();
    vi.useRealTimers();
  });

  const sampleTree = parseJSX(`
    <div id="root" className="p-4 bg-white">
      <h1 data-node-id="node-title" className="text-xl font-bold">First Version</h1>
    </div>
  `);

  it('initProject initializes state accurately and resets undo/redo stacks', () => {
    useProjectStore.getState().initProject('prj_101', 'ver_alpha', sampleTree);

    const state = useProjectStore.getState();
    expect(state.projectId).toBe('prj_101');
    expect(state.activeVersionId).toBe('ver_alpha');
    expect(state.isDirty).toBe(false);
    expect(state.undoStack).toHaveLength(0);
    expect(state.redoStack).toHaveLength(0);
  });

  it('applyASTPatch updates activeTree immutably, pushes to undoStack, and sets isDirty=true (`PRJ-004`)', () => {
    useProjectStore.getState().initProject('prj_101', 'ver_alpha', sampleTree);

    useProjectStore.getState().applyASTPatch({
      targetNodeId: 'node-title',
      action: 'UPDATE_PROPS',
      payload: { props: { className: 'text-2xl font-extrabold text-blue-600' } },
      timestamp: Date.now(),
    });

    const state = useProjectStore.getState();
    expect(state.isDirty).toBe(true);
    expect(state.undoStack).toHaveLength(1);
    expect(state.undoStack[0]?.nodeId).toBe(sampleTree.nodeId);

    const titleNode = state.activeTree?.children?.[0];
    expect(titleNode?.props.className).toBe('text-2xl font-extrabold text-blue-600');
  });

  it('undo and redo actions step forward and backward through history accurately (`PRJ-004`)', () => {
    useProjectStore.getState().initProject('prj_101', 'ver_alpha', sampleTree);

    // 1st Edit
    useProjectStore.getState().applyASTPatch({
      targetNodeId: 'node-title',
      action: 'UPDATE_PROPS',
      payload: { props: { className: 'edit-1' } },
      timestamp: Date.now(),
    });

    // 2nd Edit
    useProjectStore.getState().applyASTPatch({
      targetNodeId: 'node-title',
      action: 'UPDATE_PROPS',
      payload: { props: { className: 'edit-2' } },
      timestamp: Date.now(),
    });

    let state = useProjectStore.getState();
    expect(state.activeTree?.children?.[0]?.props.className).toBe('edit-2');
    expect(state.undoStack).toHaveLength(2);

    // Perform Undo
    useProjectStore.getState().undo();
    state = useProjectStore.getState();
    expect(state.activeTree?.children?.[0]?.props.className).toBe('edit-1');
    expect(state.undoStack).toHaveLength(1);
    expect(state.redoStack).toHaveLength(1);

    // Perform Undo again to original state
    useProjectStore.getState().undo();
    state = useProjectStore.getState();
    expect(state.activeTree?.children?.[0]?.props.className).toBe('text-xl font-bold');
    expect(state.undoStack).toHaveLength(0);
    expect(state.redoStack).toHaveLength(2);

    // Perform Redo to step forward
    useProjectStore.getState().redo();
    state = useProjectStore.getState();
    expect(state.activeTree?.children?.[0]?.props.className).toBe('edit-1');
    expect(state.undoStack).toHaveLength(1);
    expect(state.redoStack).toHaveLength(1);
  });

  it('scheduleAutoSave triggers saveVersionNow exactly after 3,000ms debounce buffer (`PRJ-002`)', async () => {
    const mockSaveFetcher = vi.fn().mockResolvedValue({
      success: true,
      newVersionId: 'ver_beta_2',
      savedAt: 1720000000,
    } satisfies SaveVersionResponse);

    useProjectStore.getState().initProject('prj_101', 'ver_alpha', sampleTree, null, mockSaveFetcher);

    useProjectStore.getState().applyASTPatch({
      targetNodeId: 'node-title',
      action: 'UPDATE_PROPS',
      payload: { props: { className: 'debounce-check' } },
      timestamp: Date.now(),
    });

    expect(mockSaveFetcher).not.toHaveBeenCalled();

    // Advance 2,900ms -> should not trigger yet
    vi.advanceTimersByTime(2900);
    expect(mockSaveFetcher).not.toHaveBeenCalled();

    // Advance remaining 100ms -> should trigger now
    vi.advanceTimersByTime(100);
    expect(mockSaveFetcher).toHaveBeenCalledTimes(1);

    const callArgs = mockSaveFetcher.mock.calls[0]?.[0];
    expect(callArgs.projectId).toBe('prj_101');
    expect(callArgs.activeVersionId).toBe('ver_alpha');

    // Verify sent payload decompresses to exact active AST tree
    const decompressed = decompressASTFromBase64(callArgs.compressedTreeBase64);
    expect(decompressed.children?.[0]?.props.className).toBe('debounce-check');
  });

  it('saveVersionNow detects optimistic lock conflicts and sets error / throws `OptimisticLockConflictError` (`PRJ-003`)', async () => {
    const conflictFetcher = vi.fn().mockResolvedValue({
      success: false,
      code: 'OPTIMISTIC_LOCK_CONFLICT',
      error: '409 Conflict: Another editor committed version ver_gamma.',
    } satisfies SaveVersionResponse);

    useProjectStore.getState().initProject('prj_101', 'ver_old', sampleTree, null, conflictFetcher);

    useProjectStore.getState().applyASTPatch({
      targetNodeId: 'node-title',
      action: 'UPDATE_PROPS',
      payload: { props: { className: 'conflict-test' } },
      timestamp: Date.now(),
    });

    await expect(useProjectStore.getState().saveVersionNow()).rejects.toThrow(OptimisticLockConflictError);

    const state = useProjectStore.getState();
    expect(state.saveError).toContain('409 Conflict');
    expect(state.isDirty).toBe(true); // Remains dirty since save was rejected by optimistic lock
  });
});
