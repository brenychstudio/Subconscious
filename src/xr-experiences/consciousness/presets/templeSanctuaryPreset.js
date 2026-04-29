export const templeSanctuaryPreset = {
  userSpawn: {
    position: { x: 0, y: 1.6, z: 20.6 },
    lookAt: { x: 0, y: 1.22, z: -0.12 },
  },

  altar: {
    radius: 2.7,
    height: 0.15,
  },

  chamber: {
    position: { x: 0, y: 0, z: 0 },
    offsetY: 0.78,
    scale: 1.12,
    spinSpeed: 0.072,
    lightIntensity: 2.58,
    lightDistance: 36,
    auraOpacity: 0.0,
    auraRadius: 2.15,
  },

  firstFrameComposition: {
    enabled: true,

    // DEMO-REAL-01A — arrival composition lock.
    // Local authored visual support only: no sky, no XRRoot, no transition-state changes.
    y: 1.18,
    z: -0.72,

    haloRadius: 2.62,
    innerHaloRadius: 1.56,
    backVeilRadius: 2.88,

    haloOpacity: 0.112,
    innerHaloOpacity: 0.058,
    backVeilOpacity: 0.026,
    verticalSeamOpacity: 0.046,
    aisleOpacity: 0.036,

    breathSpeed: 0.34,
    haloRotation: 0.006,
    fadeAtProximityStart: 0.2,
    fadeAtProximityEnd: 0.78,
    openingFade: 0.72,

    chamberLightBoost: 0.48,
    fillLightBoost: 0.08,
    keyLightIntensity: 0.72,
    rimLightIntensity: 0.42,

    color: "#dce8ff",
    accentColor: "#86a8ff",
  },

  atmosphere: {
    enabled: true,

    anchorY: 1.45,

    foregroundDust: {
      count: 80,
      radius: 2.2,
      depth: 2.4,
      yMin: -0.15,
      yMax: 1.85,
      size: 0.022,
      opacity: 0.145,
      drift: 0.22,
      spin: 0.0009,
      verticalAmplitude: 0.018,
      lateralAmplitude: 0.012,
    },

    midDust: {
      count: 120,
      radius: 4.8,
      depth: 5.4,
      yMin: -0.25,
      yMax: 2.8,
      size: 0.03,
      opacity: 0.092,
      drift: 0.15,
      spin: 0.00045,
      verticalAmplitude: 0.026,
      lateralAmplitude: 0.018,
    },

    backgroundDust: {
      count: 180,
      radius: 9.5,
      depth: 10.5,
      yMin: -0.4,
      yMax: 4.4,
      size: 0.04,
      opacity: 0.058,
      drift: 0.08,
      spin: 0.00018,
      verticalAmplitude: 0.035,
      lateralAmplitude: 0.02,
    },

    mist: {
      enabled: true,
      count: 96,
      radius: 2.2,
      depth: 2.0,
      yMin: 0.15,
      yMax: 2.05,
      size: 0.019,
      opacity: 0.052,
      drift: 0.12,
      spin: 0.00035,
      verticalAmplitude: 0.02,
      lateralAmplitude: 0.015,
    },

    haze: {
      color: 0xdbe8ff,

      nearRadius: 1.65,
      nearHeight: 1.9,
      nearOpacity: 0.045,

      midRadius: 2.4,
      midHeight: 2.4,
      midOpacity: 0.03,

      farRadius: 4.8,
      farHeight: 3.6,
      farOpacity: 0.018,
    },

    breath: {
      speed: 0.95,
      glowRadius: 2.25,
      glowOpacityMin: 0.028,
      glowOpacityMax: 0.085,
      glowScaleAmp: 0.055,
    },

    localHazeOpacity: 0.0,
    localHazeScale: 0.0,
    localHazeHeight: 0.0,
    localHazeBreathSpeed: 0.0,
    localHazePostOpenBoost: 0.0,

    chamberBreathLightMin: 1.92,
    chamberBreathLightMax: 2.82,
    chamberBreathSpeed: 0.72,
    chamberAmbientLift: 0.085,
    portalAreaLift: 0.11,
    atmosphereBreathSpeed: 0.52,
    atmosphereDustCount: 168,
    atmosphereDustOpacity: 0.058,
    atmosphereDustSpread: 2.45,
    atmosphereDustDrift: 0.09,
    atmosphereDustRise: 0.016,
    thresholdLightBoost: 0.18,
  },

  lightDirection: {
    centralLightIntensityMin: 1.88,
    centralLightIntensityMax: 2.58,
    centralLightBreathSpeed: 0.64,
    chamberReadabilityBoost: 0.18,
    postOpenLightBoost: 0.24,
    portalBacklightIntensity: 0.42,
    floorBounceOpacity: 0.032,
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

  activationPeak: {
    enabled: true,

    // DEMO-REAL-01B — Chamber Activation Peak Pass.
    // Local authored visual boost for Hold E -> THRESHOLD OPEN.
    // No sky, no XRRoot, no Scene02 orchestration changes.
    chargeStart: 0.18,
    chargeEnd: 0.96,

    smoothing: 0.13,
    flashDecay: 1.62,
    pulseSpeed: 2.2,

    coreY: 1.06,
    z: -0.02,

    crownRadius: 1.72,
    innerCrownRadius: 1.05,
    crownTube: 0.012,

    chargeRingOpacity: 0.115,
    innerRingOpacity: 0.085,
    flashRingOpacity: 0.26,

    verticalBeamHeight: 3.75,
    verticalBeamRadius: 0.032,
    beamOpacity: 0.068,
    flashBeamOpacity: 0.16,

    shockwaveRadius: 2.65,
    shockwaveOpacity: 0.13,
    flashShockwaveOpacity: 0.24,

    sparkCount: 168,
    sparkSize: 0.025,
    sparkOpacity: 0.44,
    sparkRadiusMin: 0.42,
    sparkRadiusMax: 1.12,
    sparkExpansion: 1.95,
    sparkLift: 0.34,

    lightBoost: 0.78,
    flashLightBoost: 1.82,
    portalKick: 0.36,
    rearGlowKick: 0.16,
    callRingKick: 0.14,
    soundBoost: 0.42,

    color: "#eef4ff",
    accentColor: "#9fbaff",
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

  spaceResponse: {
    enabled: true,

    breathSpeed: 0.7,
    breathAmplitude: 0.08,

    ambientParticleCount: 180,
    ambientParticleSize: 0.028,
    ambientParticleOpacity: 0.18,
    ambientParticleRadiusMin: 1.4,
    ambientParticleRadiusMax: 5.6,
    ambientParticleYMin: 0.3,
    ambientParticleYMax: 3.2,
    ambientParticleColor: "#d7e7ff",

    starPulseOpacity: 0.12,
    floorBreathBoost: 0.08,
  },

  chamberDissolve: {
    enabled: true,

    startAtOpen: 0.3,
    rampSpeed: 0.024,

    particleCount: 240,
    particleSize: 0.018,
    particleOpacity: 0.72,
    particleColor: "#f2f6ff",

    particleRadiusMin: 0.22,
    particleRadiusMax: 0.72,

    outwardDistance: 3.15,
    upwardLift: 0.68,
    wobble: 0.06,

    shellFadeTo: 0.045,
    coreFadeTo: 0.02,
    rootScaleTo: 0.82,
    hideAt: 0.994,
  },

  localPresence: {
    enabled: true,

    startAtOpen: 0.1,

    nearCount: 84,
    nearRadius: 1.28,
    nearDepth: 1.1,
    nearYMin: -0.12,
    nearYMax: 1.52,
    nearSize: 0.016,
    nearOpacity: 0.082,

    farCount: 124,
    farRadius: 2.35,
    farDepth: 1.9,
    farYMin: -0.22,
    farYMax: 1.95,
    farSize: 0.013,
    farOpacity: 0.052,

    hazeCount: 72,
    hazeRadius: 3.15,
    hazeDepth: 2.35,
    hazeYMin: -0.18,
    hazeYMax: 2.18,
    hazeSize: 0.011,
    hazeOpacity: 0.026,

    drift: 0.11,
    spin: 0.0003,
    breathSpeed: 0.58,
    scaleAmp: 0.052,
    color: "#dce8ff",
  },

  transitionPortal: {
    enabled: true,

    z: -2.02,
    y: 1.08,

    radius: 1.18,
    innerRadius: 0.72,
    tube: 0.012,

    startAtRelease: 0.18,
    rampSpeed: 0.055,

    portalRotationSpeedOuter: 0.06,
    portalRotationSpeedInner: 0.11,
    portalPullStrength: 0.26,
    portalParticleCount: 220,
    portalParticleOpacity: 0.22,
    portalDepthOpacity: 0.38,
    portalBreathSpeed: 0.92,

    coreOpacity: 0.46,
    ringOpacity: 0.24,
    innerRingOpacity: 0.14,

    particleCount: 240,
    particleSize: 0.022,
    particleOpacity: 0.28,
    particleDepth: 3.65,

    pulseSpeed: 1.35,
    rotationSpeed: 0.16,
    pullSpeed: 0.42,

    color: "#bcd6ff",
    coreColor: "#040914",
  },

  portalPullCleanup: {
    enabled: true,

    // DEMO-REAL-01C — Portal / Path Pull Cleanup.
    // Makes the passage deeper and less technical:
    // darker core, quieter big halos, cleaner pull field, less UI-like ring brightness.
    portalRingMin: 0.16,
    portalRingMax: 0.30,
    innerRingMin: 0.08,
    innerRingMax: 0.20,
    coreMin: 0.24,
    coreMax: 0.42,

    passageCoreMin: 0.34,
    passageCoreMax: 0.58,
    passageParticleMin: 0.14,
    passageParticleMax: 0.36,

    pullOpacityMin: 0.16,
    pullOpacityMax: 0.48,
    pullApproachBoost: 0.08,

    portalLightMin: 0.22,
    portalLightMax: 0.82,
    portalApproachLightBoost: 0.08,

    pathVoidMin: 0.52,
    pathVoidMax: 0.86,
    pathAuraMin: 0.045,
    pathAuraMax: 0.18,
    pathAuraScaleNear: 2.05,
    pathAuraScaleFar: 3.15,
    pathRingMin: 0.03,
    pathRingMax: 0.18,
    pathStreakMin: 0.08,
    pathStreakMax: 0.48,
    pathAccelerationMin: 0.024,
    pathAccelerationMax: 0.30,
    pathRailMin: 0.012,
    pathRailMax: 0.105,
    pathHazeMin: 0.008,
    pathHazeMax: 0.038,
    pathGuideLightMin: 0.34,
    pathGuideLightMax: 1.05,
    pathIsolationLightMin: 0.26,
    pathIsolationLightMax: 0.82,
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
      opacity: 0.105,
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
      opacity: 0.052,
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
      opacity: 0.118,
  },

    floorRings: {
    radii: [2.2, 4.45, 7.15],
      opacity: 0.058,
  },

  callLight: {
    ringRadius: 1.75,
    ringOpacity: 0.0,
    rearGlowOpacity: 0.0,
  },
};
