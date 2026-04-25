export const CONSTELLATION_LORE_REGISTRY = [
  {
    id: "great-bear-01",

    targetStarIds: [
      "dubhe",
      "merak",
      "phecda",
      "megrez",
      "alioth",
      "mizar",
      "alkaid"
    ],

    presentationLayout: [
      { id: "dubhe",  x: -0.86, y:  0.38 },
      { id: "merak",  x: -0.86, y: -0.18 },
      { id: "phecda", x: -0.34, y: -0.16 },
      { id: "megrez", x: -0.06, y:  0.00 },
      { id: "alioth", x:  0.34, y:  0.02 },
      { id: "mizar",  x:  0.68, y: -0.02 },
      { id: "alkaid", x:  1.00, y:  0.18 }
    ],

    presentationEdges: [
      ["dubhe", "merak"],
      ["merak", "phecda"],
      ["phecda", "megrez"],
      ["megrez", "dubhe"],
      ["megrez", "alioth"],
      ["alioth", "mizar"],
      ["mizar", "alkaid"]
    ],

    promptLabel: "Велика Ведмедиця",
    promptReadyLabel: "E • відкрити сузір'я",

    dwellMs: 900,
    focusAngleDeg: 8.0,
    focusReleaseDeg: 11.5,
    promptLift: 0.28,

    rigDistance: 3.35,
    rigLift: 0.04,
    rigSide: 0.00,

    constellationOffsetX: -0.86,
    constellationOffsetY: 0.10,
    constellationScale: 0.88,

    panelOffsetX: 0.96,
    panelOffsetY: 0.06,

    openDurationMs: 1750,
    closeDurationMs: 1350,
    panelDelayMs: 520,

    title: "Ursa Major · Велика Ведмедиця",
    body: [
      "Велика Ведмедиця — одне з найупізнаваніших сузір’їв північного неба. У цьому світі вона працює не як схема з підручника, а як перший небесний архів.",
      "Коли користувач утримує на ній увагу, небо відповідає не кнопкою, а актом наближення: сузір’я входить у простір як окрема форма для споглядання.",
      "Цей slice перевіряє правильну interaction grammar Whisper XR: gaze, attunement, confirmation, cinematic reveal, reading, return."
    ],
  },
];

export function getConstellationLoreEntry(id = "great-bear-01") {
  return (
    CONSTELLATION_LORE_REGISTRY.find((entry) => entry.id === id) ??
    CONSTELLATION_LORE_REGISTRY[0]
  );
}
