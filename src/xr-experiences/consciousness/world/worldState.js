export function createInitialWorldState() {
  return {
    currentRoomId: null,
    visitedRoomIds: new Set(),
    unlockedPortalIds: new Set(),
    voiceArtifacts: [],
    sessionStartedAt: Date.now(),
  };
}
