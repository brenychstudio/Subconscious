export const templeEntryPreset = {
  userSpawn: {
    position: { x: 0, y: 1.6, z: 6.8 },
    lookAt: { x: 0, y: 1.65, z: 0 },
  },

  chamber: {
    position: { x: 0, y: 1.55, z: 0 },
    scale: 2.65,
  },

  templeField: {
    radius: 6.8,
    columnCount: 8,
    columnHeight: 5.8,
    columnRadiusTop: 0.06,
    columnRadiusBottom: 0.11,
    inwardTilt: 0.02,
  },

  floorRings: {
    count: 4,
    baseRadius: 1.05,
    gap: 0.78,
  },

  backgroundStructures: {
    enabled: true,
    ringLift: 0.015,
    ringOpacity: 0.14,
    columnOpacity: 0.22,
  },

  suppressInitialPortalRow: true,
};
