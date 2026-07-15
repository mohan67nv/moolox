/**
 * @moolox/canvas — Multiplayer Presence Room & Role Authorization (`COL-002`, `COL-005`)
 *
 * Tracks active collaborator presence, live cursor coordinates (`x, y, activeNodeId`), and enforces
 * strict room-level role authorization (`ROLE_VIEWER` vs `ROLE_EDITOR` vs `ROLE_OWNER`).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

export type CollaboratorRole = 'ROLE_VIEWER' | 'ROLE_EDITOR' | 'ROLE_OWNER';

export interface CollaboratorCursor {
  x: number;
  y: number;
  activeNodeId?: string;
  selectionRange?: string[];
}

export interface CollaboratorPresence {
  userId: string;
  displayName: string;
  avatarColor: string;
  role: CollaboratorRole;
  cursor?: CollaboratorCursor;
  lastActiveTimestamp: number;
  status: 'active' | 'idle' | 'offline';
}

export class RoomAuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RoomAuthorizationError';
  }
}

export class PresenceRoomManager {
  private static rooms = new Map<string, Map<string, CollaboratorPresence>>();

  /**
   * Joins a user into a collaborative canvas room (`COL-002`, `COL-005`).
   */
  static joinRoom(
    roomId: string,
    user: { userId: string; displayName: string; role: CollaboratorRole; avatarColor?: string }
  ): CollaboratorPresence {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Map<string, CollaboratorPresence>());
    }

    const roomMap = this.rooms.get(roomId)!;
    const existing = roomMap.get(user.userId);

    const presence: CollaboratorPresence = {
      userId: user.userId,
      displayName: user.displayName,
      avatarColor: user.avatarColor || existing?.avatarColor || '#6366f1',
      role: user.role,
      cursor: existing?.cursor || { x: 0, y: 0 },
      lastActiveTimestamp: Date.now(),
      status: 'active',
    };

    roomMap.set(user.userId, presence);
    return presence;
  }

  /**
   * Enforces room-level write authorization (`COL-005`).
   * Throws `RoomAuthorizationError` if the user is a read-only viewer (`ROLE_VIEWER`).
   */
  static assertWritePermission(roomId: string, userId: string): void {
    const roomMap = this.rooms.get(roomId);
    if (!roomMap) {
      throw new RoomAuthorizationError(`Cannot assert write permissions: room '${roomId}' does not exist (` + `COL-005` + `).`);
    }

    const presence = roomMap.get(userId);
    if (!presence) {
      throw new RoomAuthorizationError(`User '${userId}' is not joined in room '${roomId}' (` + `COL-005` + `).`);
    }

    if (presence.role === 'ROLE_VIEWER') {
      throw new RoomAuthorizationError(
        `Authorization Denied: User '${presence.displayName}' (${userId}) holds read-only role 'ROLE_VIEWER' in room '${roomId}' (` + `COL-005` + `).`
      );
    }
  }

  /**
   * Updates collaborator cursor coordinates inside the room (`COL-002`).
   */
  static updateCursor(roomId: string, userId: string, cursor: CollaboratorCursor): CollaboratorPresence | null {
    const roomMap = this.rooms.get(roomId);
    if (!roomMap) return null;

    const presence = roomMap.get(userId);
    if (!presence) return null;

    presence.cursor = cursor;
    presence.lastActiveTimestamp = Date.now();
    if (presence.status === 'idle') presence.status = 'active';

    return presence;
  }

  /**
   * Leaves a room cleanly (`COL-002`).
   */
  static leaveRoom(roomId: string, userId: string): boolean {
    const roomMap = this.rooms.get(roomId);
    if (!roomMap) return false;
    return roomMap.delete(userId);
  }

  /**
   * Prunes idle users whose last activity exceeded `timeoutMs` (`COL-002`).
   */
  static pruneIdleUsers(roomId: string, idleTimeoutMs: number = 60000, offlineTimeoutMs: number = 300000): void {
    const roomMap = this.rooms.get(roomId);
    if (!roomMap) return;

    const now = Date.now();
    for (const [userId, presence] of roomMap.entries()) {
      const elapsed = now - presence.lastActiveTimestamp;
      if (elapsed > offlineTimeoutMs) {
        roomMap.delete(userId);
      } else if (elapsed > idleTimeoutMs) {
        presence.status = 'idle';
      }
    }
  }

  /**
   * Returns active presence list for room UI overlay (`COL-002`).
   */
  static getRoomPresence(roomId: string): CollaboratorPresence[] {
    const roomMap = this.rooms.get(roomId);
    if (!roomMap) return [];
    return Array.from(roomMap.values());
  }

  static resetForTest(): void {
    this.rooms.clear();
  }
}
