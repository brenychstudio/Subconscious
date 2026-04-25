import { ROOM_REGISTRY, getRoomById } from "../core/roomRegistry.js";
import { PORTAL_REGISTRY, getPortalById } from "../core/portalRegistry.js";
import { ARTIFACT_REGISTRY } from "../core/artifactRegistry.js";
import { VOICE_SEED_PROFILES, getVoiceSeedProfile } from "../core/voiceSeedProfiles.js";
import {
  WORLD_01_TRAVERSAL,
  createWorld01TraversalPlan,
  getInitialRoomId,
  getNextRoomId,
  getPreviousRoomId,
} from "../core/worldGrammar.js";
import { createTraversalState } from "../core/createTraversalState.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createWorldFormationRuntime() {
  const state = createTraversalState();
  const emittedSessionKeys = new Set();

  const markVisited = (roomId) => {
    if (!roomId) return;
    if (!state.visitedRoomIds.includes(roomId)) {
      state.visitedRoomIds.push(roomId);
    }
    state.currentRoomId = roomId;
  };

  const setEntryStage = (stage) => {
    state.entryStage = stage;
  };

  const seedWorld = (seedProfileId) => {
    const profile = getVoiceSeedProfile(seedProfileId);
    state.seedProfileId = profile.id;
    return profile;
  };

  const openPortal = (portalId) => {
    const portal = getPortalById(portalId);
    if (!portal) return null;
    if (!state.openedPortalIds.includes(portal.id)) {
      state.openedPortalIds.push(portal.id);
    }
    return portal;
  };

  const markMemory = ({
    type,
    source = "world-event",
    roomId = state.currentRoomId,
    portalId = null,
    artifactId = null,
    meta = null,
    dedupeKey = null,
  }) => {
    if (!type) return null;

    if (dedupeKey && emittedSessionKeys.has(dedupeKey)) {
      return null;
    }

    if (dedupeKey) {
      emittedSessionKeys.add(dedupeKey);
    }

    const mark = {
      id: `mark-${Date.now()}-${state.memoryMarks.length + 1}`,
      type,
      source,
      roomId,
      portalId,
      artifactId,
      meta,
      at: Date.now(),
    };

    state.memoryMarks.push(mark);
    return mark;
  };

  const recordRoomEntry = (roomId, source = "xr-room-focus") => {
    if (!roomId) return null;
    markVisited(roomId);

    return markMemory({
      type: "room-entry",
      roomId,
      source,
      dedupeKey: `room-entry:${roomId}`,
    });
  };

  const recordPortalUnlock = (portalId, source = "xr-portal-unlock") => {
    const portal = openPortal(portalId);
    if (!portal) return null;

    return markMemory({
      type: "portal-unlock",
      portalId: portal.id,
      roomId: state.currentRoomId,
      source,
      meta: {
        portalLabel: portal.label,
        stateShift: portal.stateShift,
      },
      dedupeKey: `portal-unlock:${portal.id}`,
    });
  };

  const createArtifact = (artifactId, source = "world-event") => {
    if (!artifactId) return null;

    state.createdArtifactIds.push(artifactId);

    markMemory({
      type: "artifact-created",
      artifactId,
      roomId: state.currentRoomId,
      source,
      dedupeKey: `artifact-created:${artifactId}:${state.createdArtifactIds.length}`,
    });

    return artifactId;
  };

  const advanceRoom = () => {
    const nextRoomId = getNextRoomId(state.currentRoomId);
    if (nextRoomId) {
      recordRoomEntry(nextRoomId, "runtime-advance");
    }
    return nextRoomId;
  };

  const rewindRoom = () => {
    const previousRoomId = getPreviousRoomId(state.currentRoomId);
    if (previousRoomId) {
      state.currentRoomId = previousRoomId;
    }
    return previousRoomId;
  };

  const snapshot = () => ({
    state: clone(state),
    rooms: clone(ROOM_REGISTRY),
    portals: clone(PORTAL_REGISTRY),
    artifacts: clone(ARTIFACT_REGISTRY),
    voiceSeedProfiles: clone(VOICE_SEED_PROFILES),
    traversal: clone(WORLD_01_TRAVERSAL),
    traversalPlan: clone(createWorld01TraversalPlan()),
    currentRoom: clone(getRoomById(state.currentRoomId)),
    currentSeedProfile: clone(getVoiceSeedProfile(state.seedProfileId)),
  });

  return {
    state,
    markVisited,
    setEntryStage,
    seedWorld,
    openPortal,
    markMemory,
    recordRoomEntry,
    recordPortalUnlock,
    createArtifact,
    advanceRoom,
    rewindRoom,
    getCurrentRoom: () => getRoomById(state.currentRoomId),
    getCurrentSeedProfile: () => getVoiceSeedProfile(state.seedProfileId),
    getInitialRoomId,
    snapshot,
  };
}
