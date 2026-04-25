export const ROOM_REGISTRY = [
  {
    id: "hall-of-arrival",
    label: "Hall of Arrival",
    role: "entry-attunement",
    caption: "A quiet threshold for breath, gaze, and first attunement.",
    sceneFamily: "intro-gate",
    atmosphereMode: "contemplative",
    handMode: "ghost-presence",
    primaryPortalType: null,
    traversalOrder: 0,
  },
  {
    id: "signal-corridor",
    label: "Signal Corridor",
    role: "signal-gathering",
    caption: "A listening corridor where signal gathers, stretches, and prepares the passage.",
    sceneFamily: "signal-object",
    atmosphereMode: "ritual",
    handMode: "signal-response",
    primaryPortalType: null,
    traversalOrder: 1,
  },
  {
    id: "membrane-chamber",
    label: "Membrane Chamber",
    role: "embodied-response",
    caption: "A living membrane that answers presence with tension, bloom, and release.",
    sceneFamily: "membrane",
    atmosphereMode: "revelation",
    handMode: "membrane-response",
    primaryPortalType: null,
    traversalOrder: 2,
  },
  {
    id: "portal-atrium",
    label: "Portal Atrium",
    role: "state-passage",
    caption: "A suspended threshold where dissolution and illumination wait in balance.",
    sceneFamily: "portal-surface",
    atmosphereMode: "void",
    handMode: "portal-tension",
    primaryPortalType: "portal-of-dissolution",
    traversalOrder: 3,
  },
];

export const ROOM_BY_ID = Object.fromEntries(
  ROOM_REGISTRY.map((room) => [room.id, room])
);

export function getRoomById(roomId) {
  return ROOM_BY_ID[roomId] ?? null;
}

export function getOrderedRooms() {
  return [...ROOM_REGISTRY].sort((a, b) => a.traversalOrder - b.traversalOrder);
}
