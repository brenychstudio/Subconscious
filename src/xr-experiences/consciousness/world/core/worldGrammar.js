import { getOrderedRooms, getRoomById } from "./roomRegistry.js";

export const WORLD_01_TRAVERSAL = getOrderedRooms().map((room) => room.id);

export function getInitialRoomId() {
  return WORLD_01_TRAVERSAL[0] ?? null;
}

export function getNextRoomId(currentRoomId) {
  const index = WORLD_01_TRAVERSAL.indexOf(currentRoomId);
  if (index < 0) return getInitialRoomId();
  return WORLD_01_TRAVERSAL[index + 1] ?? null;
}

export function getPreviousRoomId(currentRoomId) {
  const index = WORLD_01_TRAVERSAL.indexOf(currentRoomId);
  if (index <= 0) return null;
  return WORLD_01_TRAVERSAL[index - 1] ?? null;
}

export function createWorld01TraversalPlan() {
  return WORLD_01_TRAVERSAL.map((roomId, index) => {
    const room = getRoomById(roomId);
    return {
      step: index + 1,
      roomId,
      role: room?.role ?? "unknown",
      sceneFamily: room?.sceneFamily ?? "unknown",
      nextRoomId: getNextRoomId(roomId),
    };
  });
}
