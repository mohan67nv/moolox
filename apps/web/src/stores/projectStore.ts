/**
 * @moolox/web — Client-Side Auto-Save Store & Optimistic Locking (Task 1.3)
 *
 * Feature IDs:
 * - PRJ-002: Zustand 3s Debounced Auto-Save Buffer
 * - PRJ-003: Single-Editor Optimistic Locking (`activeVersionId` / 409 Conflict)
 * - PRJ-004: Local `Ctrl+Z` / `Ctrl+Shift+Z` Undo/Redo Stack (up to 50 states)
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { create } from 'zustand';
import { type IASTNode, type IW3CTokenMap, type ASTMutationPatch } from '@moolox/types';
import { applyPatch, compressASTToBase64 } from '@moolox/ast-core';

/**
 * Maximum number of historical checkpoints preserved in local memory (`PRJ-004`).
 */
export const MAX_UNDO_STACK_SIZE = 50;

/**
 * Custom error thrown when an optimistic lock conflict occurs on save (`409 Conflict`).
 */
export class OptimisticLockConflictError extends Error {
  public readonly status = 409;
  public readonly code = 'OPTIMISTIC_LOCK_CONFLICT';

  constructor(message = 'Another session modified this project checkpoint. Please refresh or resolve conflicts.') {
    super(message);
    this.name = 'OptimisticLockConflictError';
  }
}

/**
 * API response contract for `project.saveVersion`.
 */
export interface SaveVersionResponse {
  success: boolean;
  newVersionId?: string;
  savedAt?: number;
  error?: string;
  code?: string;
}

/**
 * Type contract for customized or mocked save endpoints (enables clean unit testing & tRPC integration).
 */
export type SaveVersionFetcher = (payload: {
  projectId: string;
  activeVersionId: string;
  compressedTreeBase64: string;
  tokensJson: IW3CTokenMap | null;
}) => Promise<SaveVersionResponse>;

/**
 * Zustand Project Store State & Actions
 */
export interface ProjectStoreState {
  // State
  projectId: string | null;
  activeVersionId: string | null;
  activeTree: IASTNode | null;
  tokensJson: IW3CTokenMap | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: number | null;
  saveError: string | null;
  undoStack: IASTNode[];
  redoStack: IASTNode[];

  // Custom fetcher hook for API / tRPC requests
  saveFetcher?: SaveVersionFetcher;

  // Actions
  initProject: (
    projectId: string,
    versionId: string,
    tree: IASTNode,
    tokens?: IW3CTokenMap | null,
    fetcher?: SaveVersionFetcher,
  ) => void;
  applyASTPatch: (patchOrPatches: ASTMutationPatch | ASTMutationPatch[]) => void;
  updateTokens: (tokens: IW3CTokenMap) => void;
  undo: () => void;
  redo: () => void;
  saveVersionNow: () => Promise<boolean>;
  scheduleAutoSave: () => void;
  cancelAutoSave: () => void;
  setSaveFetcher: (fetcher: SaveVersionFetcher) => void;
}

// Internal debounce timer reference stored outside state for clean cleanup
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
const AUTO_SAVE_DEBOUNCE_MS = 3000; // Exact 3-second debounce (`PRJ-002`)

/**
 * Creates and exports the unified Moolox Zustand Project Store.
 */
export const useProjectStore = create<ProjectStoreState>((set, get) => ({
  // Initial State
  projectId: null,
  activeVersionId: null,
  activeTree: null,
  tokensJson: null,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  saveError: null,
  undoStack: [],
  redoStack: [],
  saveFetcher: undefined,

  /**
   * Initializes the project store with a loaded AST tree and active version check.
   */
  initProject: (projectId, versionId, tree, tokens = null, fetcher) => {
    get().cancelAutoSave();
    set({
      projectId,
      activeVersionId: versionId,
      activeTree: tree,
      tokensJson: tokens,
      isDirty: false,
      isSaving: false,
      lastSavedAt: Date.now(),
      saveError: null,
      undoStack: [],
      redoStack: [],
      ...(fetcher ? { saveFetcher: fetcher } : {}),
    });
  },

  /**
   * Sets or updates the API save fetcher function.
   */
  setSaveFetcher: (fetcher) => {
    set({ saveFetcher: fetcher });
  },

  /**
   * Immutably applies AST mutation deltas (`AST-003`).
   * Pushes current tree to `undoStack` (`PRJ-004`) and schedules 3s debounced save (`PRJ-002`).
   */
  applyASTPatch: (patchOrPatches) => {
    const { activeTree, undoStack } = get();
    if (!activeTree) return;

    // Apply delta immutably via @moolox/ast-core patcher (`< 15ms`)
    const updatedTree = applyPatch(activeTree, patchOrPatches);
    if (updatedTree === activeTree) return; // No mutation occurred

    // Push previous state to undoStack (capping at MAX_UNDO_STACK_SIZE = 50)
    const nextUndoStack = [...undoStack, activeTree];
    if (nextUndoStack.length > MAX_UNDO_STACK_SIZE) {
      nextUndoStack.shift();
    }

    set({
      activeTree: updatedTree,
      undoStack: nextUndoStack,
      redoStack: [], // Clear redo stack on new action
      isDirty: true,
      saveError: null,
    });

    get().scheduleAutoSave();
  },

  /**
   * Updates design tokens and schedules debounced save.
   */
  updateTokens: (tokens) => {
    set({
      tokensJson: tokens,
      isDirty: true,
      saveError: null,
    });
    get().scheduleAutoSave();
  },

  /**
   * Undo (`Ctrl+Z`) — pops latest state from undoStack (`PRJ-004`).
   */
  undo: () => {
    const { activeTree, undoStack, redoStack } = get();
    if (!activeTree || undoStack.length === 0) return;

    const previousTree = undoStack[undoStack.length - 1]!;
    const nextUndoStack = undoStack.slice(0, -1);
    const nextRedoStack = [activeTree, ...redoStack];
    if (nextRedoStack.length > MAX_UNDO_STACK_SIZE) {
      nextRedoStack.pop();
    }

    set({
      activeTree: previousTree,
      undoStack: nextUndoStack,
      redoStack: nextRedoStack,
      isDirty: true,
      saveError: null,
    });

    get().scheduleAutoSave();
  },

  /**
   * Redo (`Ctrl+Shift+Z`) — pops state from redoStack (`PRJ-004`).
   */
  redo: () => {
    const { activeTree, undoStack, redoStack } = get();
    if (!activeTree || redoStack.length === 0) return;

    const nextTree = redoStack[0]!;
    const nextRedoStack = redoStack.slice(1);
    const nextUndoStack = [...undoStack, activeTree];
    if (nextUndoStack.length > MAX_UNDO_STACK_SIZE) {
      nextUndoStack.shift();
    }

    set({
      activeTree: nextTree,
      undoStack: nextUndoStack,
      redoStack: nextRedoStack,
      isDirty: true,
      saveError: null,
    });

    get().scheduleAutoSave();
  },

  /**
   * Schedules a debounced auto-save after exactly 3 seconds (`PRJ-002`).
   */
  scheduleAutoSave: () => {
    const { cancelAutoSave, saveVersionNow } = get();
    cancelAutoSave();

    autoSaveTimer = setTimeout(() => {
      saveVersionNow().catch((err) => {
        set({ saveError: err instanceof Error ? err.message : String(err) });
      });
    }, AUTO_SAVE_DEBOUNCE_MS);
  },

  /**
   * Cancels any pending debounced auto-save timer.
   */
  cancelAutoSave: () => {
    if (autoSaveTimer !== null) {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = null;
    }
  },

  /**
   * Immediately saves the current project state using Zstd Base64 compression (`AST-004`).
   * Enforces optimistic locking verification (`PRJ-003`).
   */
  saveVersionNow: async () => {
    get().cancelAutoSave();

    const { projectId, activeVersionId, activeTree, tokensJson, isDirty, isSaving, saveFetcher } = get();

    if (!projectId || !activeVersionId || !activeTree || !isDirty || isSaving) {
      return false;
    }

    set({ isSaving: true, saveError: null });

    const compressedTreeBase64 = compressASTToBase64(activeTree);

    try {
      let response: SaveVersionResponse;

      if (saveFetcher) {
        response = await saveFetcher({
          projectId,
          activeVersionId,
          compressedTreeBase64,
          tokensJson,
        });
      } else {
        // Default fetcher calling Next.js API / tRPC router
        const res = await fetch('/api/trpc/project.saveVersion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            activeVersionId,
            compressedTreeBase64,
            tokensJson,
          }),
        });

        if (res.status === 409) {
          throw new OptimisticLockConflictError();
        }

        response = (await res.json()) as SaveVersionResponse;
      }

      if (response.code === 'OPTIMISTIC_LOCK_CONFLICT' || response.error?.includes('409') || response.error?.toLowerCase().includes('conflict')) {
        throw new OptimisticLockConflictError(response.error);
      }

      if (!response.success || !response.newVersionId) {
        throw new Error(response.error || 'Failed to save project version.');
      }

      set({
        activeVersionId: response.newVersionId,
        isDirty: false,
        isSaving: false,
        lastSavedAt: response.savedAt || Date.now(),
        saveError: null,
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      set({
        isSaving: false,
        saveError: errorMessage,
      });
      if (error instanceof OptimisticLockConflictError) {
        throw error;
      }
      return false;
    }
  },
}));
