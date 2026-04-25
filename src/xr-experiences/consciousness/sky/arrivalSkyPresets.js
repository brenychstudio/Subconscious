export const ARRIVAL_SKY_PRESETS = {
  nightThreshold: {
    domeRadius: 46,
    anchorHeight: 1.25,
    pitchOffsetX: -0.18,
    yawOffsetY: -0.34,

    backgroundStarCount: 18000,
    backgroundStarSize: 1.05,
    backgroundStarOpacity: 0.72,
    backgroundMinY: 1.8,

    midStarCount: 4200,
    midStarSize: 1.85,
    midStarOpacity: 0.88,
    midMinY: 2.6,

    dustCount: 10,
    dustSize: 0.55,
    dustOpacity: 0.0008,
    dustMinY: 1.2,
    dustMaxY: 8,

    heroStarBaseScale: 0.95,
    heroStarBrightScale: 1.75,
    heroStarOpacity: 0.94,
    heroFadeStartY: -10,
    heroFadeEndY: 28,

    constellationOpacity: 0.11,
    constellationFadeStartY: -6,
    constellationFadeEndY: 24,

    followLerp: 0.075,

    skySpinY: 0.0024,
    skyNutationAmpX: 0.006,
    skyNutationSpeedX: 0.045,

    backgroundSpinY: -0.00028,
    midSpinY: 0.00072,
    heroSpinY: 0.00014,
    constellationSpinY: 0.00009,

    rollDriftAmplitude: 0.0004,
  },
};

export function getArrivalSkyPreset(id = "nightThreshold") {
  return ARRIVAL_SKY_PRESETS[id] ?? ARRIVAL_SKY_PRESETS.nightThreshold;
}
