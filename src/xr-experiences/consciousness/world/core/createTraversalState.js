import { getInitialRoomId } from "./worldGrammar.js";

export function createTraversalState() {
  return {
    entryStage: "prelude",
    seedProfileId: "contemplative-seed",
    currentRoomId: getInitialRoomId(),
    visitedRoomIds: [],
    openedPortalIds: [],
    createdArtifactIds: [],
    memoryMarks: [],
  };
}
