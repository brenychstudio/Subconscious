export const templeSanctuaryPreset = {
  userSpawn: {
    position: { x: 0, y: 1.6, z: 23.5 },
    lookAt: { x: 0, y: 1.22, z: 0.12 },
  },

  altar: {
    radius: 2.85,
    height: 0.16,
  },

  chamber: {
    position: { x: 0, y: 0, z: 0 },
    offsetY: 0.82,
    scale: 1.0,
    spinSpeed: 0.072,
    lightIntensity: 2.18,
    lightDistance: 34,
    auraOpacity: 0.0,
    auraRadius: 2.15,
  },

  processionalRows: {
    leftX: -6.35,
    rightX: 6.35,
    zStart: 10.4,
    zGap: 3.95,
    count: 4,
    width: 0.52,
    depth: 0.52,
    baseHeight: 11.2,
    heightFalloff: 0.92,
    opacity: 0.135,
  },

  sideSentinels: {
    enabled: true,
    positions: [
      { x: -12.4, z: 7.2, h: 8.2 },
      { x: 12.4, z: 7.2, h: 8.2 },
      { x: -12.4, z: -3.2, h: 7.2 },
      { x: 12.4, z: -3.2, h: 7.2 },
    ],
    width: 0.44,
    depth: 0.44,
    opacity: 0.07,
  },

  rearGate: {
    z: -7.6,
    width: 6.25,
    height: 8.35,
    pillarWidth: 0.48,
    pillarDepth: 0.48,
    lintelHeight: 0.34,
    innerWidth: 3.9,
    innerHeight: 6.25,
    opacity: 0.145,
  },

  floorRings: {
    radii: [2.35, 4.65, 7.25],
    opacity: 0.095,
  },

  callLight: {
    ringRadius: 1.75,
    ringOpacity: 0.0,
    rearGlowOpacity: 0.0,
  },
};
