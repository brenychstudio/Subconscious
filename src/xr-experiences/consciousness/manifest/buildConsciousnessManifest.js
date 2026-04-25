import { roomRegistry } from "../world/roomRegistry.js";

export function buildConsciousnessManifest() {
  const zones = roomRegistry.map((room) => ({
    id: room.zoneId,
    label: room.label,
  }));

  const artworks = roomRegistry.map((room, index) => ({
    id: `artwork-${room.id}`,
    printId: `cw-${String(index + 1).padStart(2, "0")}`,
    zoneId: room.zoneId,
    src: room.artworkSrc,
    caption: room.caption,
    title: room.title,
  }));

  const beats = roomRegistry.map((room, index) => ({
    id: `beat-${room.id}`,
    zoneId: room.zoneId,
    artworkPrintId: `cw-${String(index + 1).padStart(2, "0")}`,
    guidance: {
      type: "beacon",
      intensity: index === roomRegistry.length - 1 ? 1 : 0.68,
    },
    onGaze: [`focus:${room.id}`],
    onProximity: [`arrive:${room.id}`],
  }));

  return {
    schemaVersion: 1,
    experienceId: "consciousness-world-bootstrap",
    zones,
    artworks,
    beats,
    collect: {
      mode: "qr",
      shareBasePath: "/p/",
    },
  };
}

export default buildConsciousnessManifest;
