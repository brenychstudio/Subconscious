export const templeSanctuaryPreset = {
  userSpawn: {
    position: { x: 0, y: 1.6, z: 24.5 },
    lookAt: { x: 0, y: 1.18, z: 0.08 },
  },

  altar: {
    radius: 2.7,
    height: 0.15,
  },

  chamber: {
    position: { x: 0, y: 0, z: 0 },
    offsetY: 0.78,
    scale: 1.04,
    spinSpeed: 0.072,
    lightIntensity: 2.32,
    lightDistance: 36,
    auraOpacity: 0.0,
    auraRadius: 2.15,
  },

  presence: {
    enabled: true,
    startDistance: 14.5,
    fullDistance: 3.1,
    smoothing: 0.065,

    spinBoost: 0.14,
    lightBoost: 2.1,
    scaleBoost: 0.085,

    breathSpeed: 1.15,
    breathAmplitude: 0.032,
    proximityPulseBoost: 0.055,
    lightPulseBoost: 0.34,
  },

  attunement: {
    enabled: true,
    startDistance: 1.65,
    fullDistance: 0.42,
    smoothing: 0.075,

    spinBoost: 0.055,
    lightBoost: 1.75,
    scaleBoost: 0.055,
    pulseBoost: 0.075,

    soundBoost: 0.95,
  },

  ritualCharge: {
    enabled: true,

    handThreshold: 0.62,
    proximityThreshold: 0.18,

    chargeRate: 0.42,
    decayRate: 0.22,

    spinBoost: 0.12,
    lightBoost: 2.0,
    scaleBoost: 0.06,
    pulseBoost: 0.1,
    soundBoost: 1.1,

    completeThreshold: 0.96,
  },

  transformationCue: {
    enabled: true,

    smoothing: 0.035,

    spinBoost: 0.16,
    lightBoost: 3.4,
    scaleBoost: 0.095,
    pulseBoost: 0.16,
    soundBoost: 1.35,

    callRingOpacity: 0.18,
    rearGlowOpacity: 0.15,

    holdAfterComplete: true,
  },

  thresholdReveal: {
    enabled: true,

    z: -0.92,
    y: 1.04,

    radius: 1.58,
    tube: 0.012,

    ringOpacity: 0.16,
    outerRingOpacity: 0.075,
    veilOpacity: 0.065,

    rotationSpeed: 0.035,
    scaleBoost: 0.12,

    color: "#9fbaff",
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
    radii: [2.2, 4.45, 7.15],
    opacity: 0.075,
  },

  callLight: {
    ringRadius: 1.75,
    ringOpacity: 0.0,
    rearGlowOpacity: 0.0,
  },
};
