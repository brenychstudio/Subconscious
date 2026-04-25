export const PORTAL_REGISTRY = [
  {
    id: "portal-of-dissolution",
    label: "Portal of Dissolution",
    stateShift: "shedding-form",
    transitionCharacter: "liquid-dark",
    caption: "A passage where form loosens, darkens, and yields.",
  },
  {
    id: "portal-of-illumination",
    label: "Portal of Illumination",
    stateShift: "clarity-reveal",
    transitionCharacter: "luminous-opening",
    caption: "A passage where tension clears into luminous order.",
  },
];

export const PORTAL_BY_ID = Object.fromEntries(
  PORTAL_REGISTRY.map((portal) => [portal.id, portal])
);

export function getPortalById(portalId) {
  return PORTAL_BY_ID[portalId] ?? null;
}
