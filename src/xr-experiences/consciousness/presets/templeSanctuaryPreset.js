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

    smoothing: 0.032,

    spinBoost: 0.2,
    lightBoost: 3.45,
    scaleBoost: 0.105,
    pulseBoost: 0.18,
    soundBoost: 1.35,

    callRingOpacity: 0.22,
    rearGlowOpacity: 0.18,

    holdAfterComplete: true,
  },

  thresholdReveal: {
    enabled: true,

    z: -0.98,
    y: 1.04,

    radius: 1.72,
    tube: 0.014,

    ringOpacity: 0.19,
    outerRingOpacity: 0.09,
    veilOpacity: 0.072,

    rotationSpeed: 0.048,
    scaleBoost: 0.13,

    color: "#b7caff",
  },

  thresholdDrift: {
    enabled: true,

    count: 82,
    radius: 2.38,
    depth: 0.9,

    size: 0.03,
    opacity: 0.28,

    rotationSpeed: 0.032,
    liftSpeed: 0.075,
    breathing: 0.07,

    color: "#b7d0ff",
  },

  openingState: {
    enabled: true,

    smoothing: 0.026,

    chargeDampening: 0.48,

    lightFloor: 0.72,
    pulseFloor: 0.052,
    soundFloor: 1.0,

    ringFloor: 0.105,
    outerRingFloor: 0.052,
    veilFloor: 0.04,
    driftFloor: 0.16,
  },

  axialOpening: {
    enabled: true,

    z: -1.34,
    y: 1.22,

    beamHeight: 5.8,
    beamWidth: 0.34,
    beamDepthWidth: 1.95,

    coreOpacity: 0.34,
    sideOpacity: 0.12,
    veilOpacity: 0.11,

    floorWaveRadius: 2.75,
    floorWaveOpacity: 0.18,

    pulseSpeed: 1.45,
    rotationSpeed: 0.024,
    scaleBoost: 0.18,

    color: "#b8d2ff",
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
