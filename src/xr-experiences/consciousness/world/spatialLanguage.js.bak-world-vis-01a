export const WORLD_VISUALS = {
  fogDensity: 0.034,
  baseBg: "#04060a",
  floorColor: "#05070c",
  floorEmissive: "#0b1220",
  floorEmissiveIntensity: 0.06,
  hazeBaseOpacity: 0.092,
};

export const ROOM_PRESETS = {
  "hall-of-arrival": {
    shellColor: 0x8ea8ff,
    shellOpacity: 0.052,
    auraColor: 0xdde8ff,
    auraOpacity: 0.16,
    pulseColor: 0xa6c1ff,
    coreColor: 0xf2f6ff,
  },
  "signal-corridor": {
    shellColor: 0x7f98ff,
    shellOpacity: 0.044,
    auraColor: 0xa2bbff,
    auraOpacity: 0.14,
    pulseColor: 0x8fa9ff,
    coreColor: 0xdde8ff,
  },
  "membrane-chamber": {
    shellColor: 0x97b4ff,
    shellOpacity: 0.048,
    auraColor: 0xe7efff,
    auraOpacity: 0.18,
    pulseColor: 0xb4cbff,
    coreColor: 0xf4f8ff,
  },
  "portal-atrium": {
    shellColor: 0x9eb6ff,
    shellOpacity: 0.05,
    auraColor: 0xf0f5ff,
    auraOpacity: 0.20,
    pulseColor: 0xc0d5ff,
    coreColor: 0xffffff,
  },
};

export function getRoomPreset(roomId) {
  return ROOM_PRESETS[roomId] ?? ROOM_PRESETS["hall-of-arrival"];
}
