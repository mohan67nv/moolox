import { describe, it, expect, beforeEach } from 'vitest';
import {
  CRDTDocument,
  OptimisticLockReconciler,
  PresenceRoomManager,
  RoomAuthorizationError,
} from '../src';
import { type IASTNode } from '@moolox/types';

describe('Real-Time CRDT Collaboration & Presence Engine (`COL-001..COL-005`)', () => {
  const initialRoot: IASTNode = {
    nodeId: 'node-root-canvas',
    type: 'Container',
    props: { title: 'Initial Studio Canvas' },
    styles: { 'background': 'color.bg.primary' },
    children: [
      {
        nodeId: 'node-hero-01',
        type: 'HeroSpec',
        props: { heading: 'Welcome to Moolox' },
        styles: { 'padding': 'space.8' },
      },
    ],
  };

  beforeEach(() => {
    PresenceRoomManager.resetForTest();
  });

  it('generates incrementing Lamport clocks and applies structural node insertions (`COL-001`, `COL-003`)', () => {
    const doc = new CRDTDocument('client-alpha', initialRoot);
    const op = doc.createOperation('node:insert', 'node-child-02', {
      nodeId: 'node-child-02',
      type: 'ButtonSpec',
      props: { label: 'Click Me' },
      styles: { 'color': 'color.text.primary' },
    }, 'node-root-canvas');

    expect(op.clock.counter).toBe(1);
    expect(op.clock.clientId).toBe('client-alpha');

    const root = doc.getAstRoot();
    expect(root.children?.length).toBe(2);
    expect(root.children?.[1].nodeId).toBe('node-child-02');
  });

  it('converges concurrent property modifications deterministically via LWW reconciliation (`COL-004`)', () => {
    const doc = new CRDTDocument('client-alpha', initialRoot);

    // Client Alpha updates title at Lamport clock 5
    doc.applyOperation({
      opId: 'op-alpha-5',
      clientId: 'client-alpha',
      clock: { counter: 5, clientId: 'client-alpha' },
      type: 'node:update_props',
      targetNodeId: 'node-root-canvas',
      payload: { title: 'Alpha Title' },
      timestamp: Date.now(),
    });

    expect(doc.getAstRoot().props.title).toBe('Alpha Title');

    // Concurrent incoming patch from Client Beta with lower Lamport clock 3 -> should be rejected/superseded (`COL-004`)
    const resSuperseded = doc.applyOperation({
      opId: 'op-beta-3',
      clientId: 'client-beta',
      clock: { counter: 3, clientId: 'client-beta' },
      type: 'node:update_props',
      targetNodeId: 'node-root-canvas',
      payload: { title: 'Stale Beta Title' },
      timestamp: Date.now(),
    });

    expect(resSuperseded.applied).toBe(false);
    expect(resSuperseded.reason).toContain('superseded by higher clock');
    expect(doc.getAstRoot().props.title).toBe('Alpha Title'); // Preserved!

    // Incoming patch from Client Gamma with higher Lamport clock 6 -> should win (`COL-004`)
    const resWinner = doc.applyOperation({
      opId: 'op-gamma-6',
      clientId: 'client-gamma',
      clock: { counter: 6, clientId: 'client-gamma' },
      type: 'node:update_props',
      targetNodeId: 'node-root-canvas',
      payload: { title: 'Gamma Title Winner' },
      timestamp: Date.now(),
    });

    expect(resWinner.applied).toBe(true);
    expect(doc.getAstRoot().props.title).toBe('Gamma Title Winner');
  });

  it('breaks Lamport clock ties deterministically using client ID priority (`COL-004`)', () => {
    const clockA = { counter: 10, clientId: 'client-alice' };
    const clockB = { counter: 10, clientId: 'client-bob' };

    // bob > alice lexically
    expect(OptimisticLockReconciler.compareClocks(clockA, clockB)).toBeLessThan(0);
    expect(OptimisticLockReconciler.shouldApplyIncomingPatch(clockB, clockA)).toBe(true);
    expect(OptimisticLockReconciler.shouldApplyIncomingPatch(clockA, clockB)).toBe(false);
  });

  it('computes missing state vector deltas for joining or reconnected collaborators (`COL-003`)', () => {
    const doc = new CRDTDocument('client-server', initialRoot);
    doc.createOperation('node:update_props', 'node-hero-01', { heading: 'Step 1' });
    doc.createOperation('node:update_props', 'node-hero-01', { heading: 'Step 2' });
    doc.createOperation('node:insert', 'node-nav-01', {
      nodeId: 'node-nav-01',
      type: 'NavigationSpec',
      props: {},
      styles: {},
    });

    expect(doc.getOperationLog().length).toBe(3);

    // Peer client joins with stale vector where client-server only reached counter 1
    const peerVector = new Map<string, number>([['client-server', 1]]);
    const delta = doc.computeDeltaSince(peerVector);

    expect(delta.length).toBe(2); // Operations 2 and 3
    expect(delta[0].clock.counter).toBe(2);
    expect(delta[1].clock.counter).toBe(3);
  });

  it('manages multi-user presence and live cursor coordinates inside rooms (`COL-002`)', () => {
    PresenceRoomManager.joinRoom('room-demo-1', {
      userId: 'usr-creator-1',
      displayName: 'Maya Lin',
      role: 'ROLE_OWNER',
      avatarColor: '#10b981',
    });

    PresenceRoomManager.joinRoom('room-demo-1', {
      userId: 'usr-viewer-2',
      displayName: 'Alex Rivers',
      role: 'ROLE_VIEWER',
      avatarColor: '#3b82f6',
    });

    expect(PresenceRoomManager.getRoomPresence('room-demo-1').length).toBe(2);

    // Update cursor
    PresenceRoomManager.updateCursor('room-demo-1', 'usr-creator-1', { x: 450, y: 320, activeNodeId: 'node-hero-01' });
    const presenceList = PresenceRoomManager.getRoomPresence('room-demo-1');
    const maya = presenceList.find((u) => u.userId === 'usr-creator-1');
    expect(maya?.cursor?.x).toBe(450);
    expect(maya?.cursor?.activeNodeId).toBe('node-hero-01');
  });

  it('enforces room-level write authorization and throws RoomAuthorizationError for ROLE_VIEWER (`COL-005`)', () => {
    PresenceRoomManager.joinRoom('room-restricted', {
      userId: 'usr-readonly',
      displayName: 'Guest Auditor',
      role: 'ROLE_VIEWER',
    });

    PresenceRoomManager.joinRoom('room-restricted', {
      userId: 'usr-editor',
      displayName: 'Lead Architect',
      role: 'ROLE_EDITOR',
    });

    expect(() => PresenceRoomManager.assertWritePermission('room-restricted', 'usr-editor')).not.toThrow();
    expect(() => PresenceRoomManager.assertWritePermission('room-restricted', 'usr-readonly')).toThrow(RoomAuthorizationError);
    expect(() => PresenceRoomManager.assertWritePermission('room-restricted', 'usr-readonly')).toThrow(
      /Authorization Denied.*holds read-only role 'ROLE_VIEWER'/
    );
  });
});
