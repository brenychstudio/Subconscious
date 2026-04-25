export const ARRIVAL_HERO_STARS = [
  { id: "polaris", ra: 2.5303, dec: 89.2641, mag: 1.98 },
  { id: "caph", ra: 0.1529, dec: 59.1498, mag: 2.28 },
  { id: "schedar", ra: 0.6751, dec: 56.5373, mag: 2.24 },
  { id: "gamma-cas", ra: 0.9451, dec: 60.7167, mag: 2.15 },
  { id: "ruchbah", ra: 1.4303, dec: 60.2353, mag: 2.68 },

  { id: "capella", ra: 5.2782, dec: 45.998, mag: 0.08 },
  { id: "aldebaran", ra: 4.5987, dec: 16.5093, mag: 0.86 },

  { id: "betelgeuse", ra: 5.9195, dec: 7.4071, mag: 0.45 },
  { id: "bellatrix", ra: 5.4189, dec: 6.3497, mag: 1.64 },
  { id: "alnitak", ra: 5.6793, dec: -1.9426, mag: 1.74 },
  { id: "alnilam", ra: 5.6036, dec: -1.2019, mag: 1.69 },
  { id: "mintaka", ra: 5.5334, dec: -0.2991, mag: 2.23 },
  { id: "saiph", ra: 5.7959, dec: -9.6696, mag: 2.07 },
  { id: "rigel", ra: 5.2423, dec: -8.2016, mag: 0.13 },

  { id: "castor", ra: 7.5767, dec: 31.8883, mag: 1.58 },
  { id: "pollux", ra: 7.7553, dec: 28.0262, mag: 1.14 },
  { id: "procyon", ra: 7.655, dec: 5.225, mag: 0.34 },
  { id: "sirius", ra: 6.7525, dec: -16.7161, mag: -1.46 },

  { id: "vega", ra: 18.6156, dec: 38.7837, mag: 0.03 },
  { id: "deneb", ra: 20.6905, dec: 45.2803, mag: 1.25 },
  { id: "altair", ra: 19.8464, dec: 8.8683, mag: 0.76 },

  { id: "dubhe", ra: 11.0621, dec: 61.7508, mag: 1.79 },
  { id: "merak", ra: 11.0307, dec: 56.3824, mag: 2.34 },
  { id: "phecda", ra: 11.8972, dec: 53.6948, mag: 2.43 },
  { id: "megrez", ra: 12.257, dec: 57.0326, mag: 3.32 },
  { id: "alioth", ra: 12.9004, dec: 55.9598, mag: 1.76 },
  { id: "mizar", ra: 13.3987, dec: 54.9254, mag: 2.23 },
  { id: "alkaid", ra: 13.7923, dec: 49.3133, mag: 1.85 },
];

export const ARRIVAL_CONSTELLATION_EDGES = [
  ["caph", "schedar"],
  ["schedar", "gamma-cas"],
  ["gamma-cas", "ruchbah"],

  ["betelgeuse", "bellatrix"],
  ["bellatrix", "mintaka"],
  ["mintaka", "alnilam"],
  ["alnilam", "alnitak"],
  ["alnitak", "saiph"],
  ["saiph", "rigel"],

  ["castor", "pollux"],
  ["pollux", "procyon"],
  ["procyon", "sirius"],

  ["vega", "deneb"],
  ["deneb", "altair"],
  ["altair", "vega"],

  ["dubhe", "merak"],
  ["merak", "phecda"],
  ["phecda", "megrez"],
  ["megrez", "alioth"],
  ["alioth", "mizar"],
  ["mizar", "alkaid"],

  ["capella", "aldebaran"],
];

export function getArrivalHeroStarById(id) {
  return ARRIVAL_HERO_STARS.find((star) => star.id === id) ?? null;
}

export const ARRIVAL_SKY_DEBUG_INFO = {
  version: "CELESTIAL-ARCH-01B",
  mode: "premium-renderer-foundation",
};
