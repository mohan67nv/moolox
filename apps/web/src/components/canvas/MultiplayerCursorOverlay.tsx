/**
 * @moolox/web — Multiplayer Cursor & Presence Overlay (`CNV-008`, `COL-002`, `ANA-004`)
 *
 * Renders real-time multi-user cursor pointers, collaborator avatars with role indicators,
 * and live CRDT sync telemetry badges directly inside the Moolox Studio canvas viewport.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import React, { useEffect, useState } from 'react';
import { PresenceRoomManager, type CollaboratorPresence } from '@moolox/canvas';
import { CRDTLatencyTracker, type CRDTLatencyMetricsSummary } from '@moolox/analytics';

export interface MultiplayerCursorOverlayProps {
  /** Active collaboration room ID (`COL-002`) */
  roomId: string;
  /** Current local user ID (`COL-002`) */
  localUserId: string;
  /** Optional override for presence data (for testing or controlled rendering) */
  collaborators?: CollaboratorPresence[];
  /** Optional override for sync metrics (for testing or controlled rendering) */
  metrics?: CRDTLatencyMetricsSummary | null;
  /** Callback fired when a collaborator avatar is clicked */
  onCollaboratorClick?: (userId: string) => void;
}

export const MultiplayerCursorOverlay: React.FC<MultiplayerCursorOverlayProps> = ({
  roomId,
  localUserId,
  collaborators: externalCollaborators,
  metrics: externalMetrics,
  onCollaboratorClick,
}) => {
  const [internalCollaborators, setInternalCollaborators] = useState<CollaboratorPresence[]>([]);
  const [internalMetrics, setInternalMetrics] = useState<CRDTLatencyMetricsSummary | null>(null);

  useEffect(() => {
    if (externalCollaborators) return;

    const pollPresence = () => {
      const activeList = PresenceRoomManager.getRoomPresence(roomId);
      setInternalCollaborators(activeList);

      const latestMetrics = CRDTLatencyTracker.getLatencyMetrics(roomId);
      setInternalMetrics(latestMetrics);
    };

    pollPresence();
    const interval = setInterval(pollPresence, 500);
    return () => clearInterval(interval);
  }, [roomId, externalCollaborators]);

  const activeCollaborators = externalCollaborators ?? internalCollaborators;
  const activeMetrics = externalMetrics !== undefined ? externalMetrics : internalMetrics;
  const remoteCollaborators = activeCollaborators.filter((c) => c.userId !== localUserId && c.status !== 'offline');

  return (
    <div
      className="moolox-multiplayer-overlay pointer-events-none absolute inset-0 z-50 overflow-hidden"
      data-testid="multiplayer-cursor-overlay"
      style={{
        '--moolox-multiplayer-zindex': '50',
      } as React.CSSProperties}
    >
      {/* Top-Right Collaborator Bar & Sync Latency Badge */}
      <div className="pointer-events-auto absolute right-4 top-4 flex items-center gap-3 rounded-full border border-slate-700/80 bg-slate-900/90 px-4 py-2 shadow-xl backdrop-blur-md">
        {/* Telemetry Badge (`CNV-008`, `ANA-004`) */}
        {activeMetrics && activeMetrics.totalSyncEvents > 0 && (
          <div
            className="flex items-center gap-2 border-r border-slate-700 pr-3 text-xs font-medium text-slate-300"
            data-testid="crdt-sync-badge"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                activeMetrics.frameBudgetExceededCount > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
              }`}
            />
            <span>CRDT Sync: {activeMetrics.averageLatencyMs}ms</span>
            <span className="text-slate-500">(p95: {activeMetrics.p95LatencyMs}ms)</span>
          </div>
        )}

        {/* Presence Avatars (`COL-002`) */}
        <div className="flex -space-x-2 overflow-hidden" data-testid="collaborator-avatars">
          {activeCollaborators.map((user) => (
            <button
              key={user.userId}
              type="button"
              onClick={() => onCollaboratorClick?.(user.userId)}
              className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-900 text-xs font-bold text-white shadow-sm transition-transform hover:z-10 hover:scale-110 focus:outline-none"
              style={{ backgroundColor: user.avatarColor }}
              title={`${user.displayName} (${user.role})`}
              data-testid={`avatar-${user.userId}`}
            >
              {user.displayName.slice(0, 2).toUpperCase()}
              {user.status === 'idle' && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-slate-900 bg-amber-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Remote Live Cursor Pointers (`COL-002`) */}
      {remoteCollaborators.map((user) => {
        if (!user.cursor) return null;
        const { x, y } = user.cursor;

        return (
          <div
            key={user.userId}
            className="absolute left-0 top-0 transition-all duration-100 ease-out"
            style={{
              transform: `translate(${x}px, ${y}px)`,
            }}
            data-testid={`cursor-${user.userId}`}
          >
            {/* SVG Cursor Pointer */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={user.avatarColor}
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-md"
            >
              <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8804L0.500002 1.19841L11.7841 12.3673H5.65376Z" />
            </svg>

            {/* Collaborator Name Tag */}
            <div
              className="ml-4 mt-1 rounded px-2 py-0.5 text-[11px] font-semibold text-white shadow-md"
              style={{ backgroundColor: user.avatarColor }}
            >
              {user.displayName}
              {user.role === 'ROLE_VIEWER' && <span className="ml-1 opacity-75">(Viewer)</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};
