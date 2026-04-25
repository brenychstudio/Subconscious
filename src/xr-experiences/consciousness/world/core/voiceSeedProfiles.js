export const VOICE_SEED_PROFILES = [
  {
    id: "contemplative-seed",
    label: "Contemplative",
    dominantAtmosphere: "contemplative",
    audioBias: "drone-light",
    geometryBias: "slow-opening",
    portalBias: "portal-of-illumination",
  },
  {
    id: "ritual-seed",
    label: "Ritual",
    dominantAtmosphere: "ritual",
    audioBias: "pulse-resonance",
    geometryBias: "gathering-pressure",
    portalBias: "portal-of-dissolution",
  },
  {
    id: "void-seed",
    label: "Void",
    dominantAtmosphere: "void",
    audioBias: "sub-drone",
    geometryBias: "dark-expansion",
    portalBias: "portal-of-dissolution",
  },
  {
    id: "dream-architecture-seed",
    label: "Dream Architecture",
    dominantAtmosphere: "dream-architecture",
    audioBias: "harmonic-fog",
    geometryBias: "soft-non-euclidean",
    portalBias: "portal-of-illumination",
  },
];

export const VOICE_SEED_BY_ID = Object.fromEntries(
  VOICE_SEED_PROFILES.map((profile) => [profile.id, profile])
);

export function getVoiceSeedProfile(profileId) {
  return VOICE_SEED_BY_ID[profileId] ?? VOICE_SEED_PROFILES[0];
}
