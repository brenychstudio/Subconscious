import * as THREE from "three";

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function makeAdditiveMaterial(color, opacity, wireframe = false) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    wireframe,
  });
}

function setOpacity(material, value) {
  if (!material) return;
  material.opacity = Math.max(0, value);
}

const VARIANTS = {
  "hall-of-arrival": {
    type: "seed",
    x: 0.72,
    y: 2.34,
    z: 0.34,
    scale: 0.72,
    core: 0xf5f8ff,
    aura: 0xdbe7ff,
    accent: 0xc3d4ff,
  },
  "signal-corridor": {
    type: "ribbon",
    x: 0.92,
    y: 1.94,
    z: 0.34,
    scale: 0.84,
    core: 0xe7efff,
    aura: 0xb5ccff,
    accent: 0x9cb8ff,
  },
  "membrane-chamber": {
    type: "bloom",
    x: 0,
    y: 2.1,
    z: 0.62,
    scale: 1.0,
    core: 0xf7fbff,
    aura: 0xc7daff,
    accent: 0xb4cbff,
  },
  "portal-atrium": {
    type: "knot",
    x: 0,
    y: 2.02,
    z: 0.92,
    scale: 0.78,
    core: 0xffffff,
    aura: 0xdce8ff,
    accent: 0xc6d8ff,
  },
};

function createSeedVariant(variant) {
  const group = new THREE.Group();
  group.position.set(variant.x, variant.y, variant.z);
  group.scale.setScalar(variant.scale);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 20, 20),
    makeAdditiveMaterial(variant.core, 0.0)
  );
  group.add(core);

  const ringA = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.015, 12, 72),
    makeAdditiveMaterial(variant.aura, 0.0)
  );
  ringA.rotation.x = Math.PI / 2;
  group.add(ringA);

  const ringB = new THREE.Mesh(
    new THREE.TorusGeometry(0.52, 0.01, 12, 72),
    makeAdditiveMaterial(variant.accent, 0.0)
  );
  ringB.rotation.y = Math.PI / 2;
  group.add(ringB);

  const motes = [];
  for (let i = 0; i < 4; i += 1) {
    const mote = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 10, 10),
      makeAdditiveMaterial(variant.core, 0.0)
    );
    group.add(mote);
    motes.push(mote);
  }

  const light = new THREE.PointLight(variant.core, 0.0, 4.4, 2.0);
  group.add(light);

  return { group, elements: { core, ringA, ringB, motes, light } };
}

function createRibbonVariant(variant) {
  const group = new THREE.Group();
  group.position.set(variant.x, variant.y, variant.z);
  group.scale.setScalar(variant.scale);

  const ribbons = [];
  const xs = [-0.36, -0.18, 0, 0.18, 0.36];
  xs.forEach((x, i) => {
    const ribbon = new THREE.Mesh(
      new THREE.PlaneGeometry(0.05, 0.92),
      makeAdditiveMaterial(i % 2 === 0 ? variant.aura : variant.accent, 0.0)
    );
    ribbon.position.set(x, 0, Math.sin(i * 0.9) * 0.08);
    group.add(ribbon);
    ribbons.push(ribbon);
  });

  const pulseRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.44, 0.014, 12, 72),
    makeAdditiveMaterial(variant.core, 0.0)
  );
  pulseRing.rotation.x = Math.PI / 2;
  group.add(pulseRing);

  const nodes = [];
  for (let i = 0; i < 4; i += 1) {
    const node = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 10, 10),
      makeAdditiveMaterial(variant.core, 0.0)
    );
    group.add(node);
    nodes.push(node);
  }

  const light = new THREE.PointLight(variant.core, 0.0, 4.8, 2.0);
  group.add(light);

  return { group, elements: { ribbons, pulseRing, nodes, light } };
}

function createBloomVariant(variant) {
  const group = new THREE.Group();
  group.position.set(variant.x, variant.y, variant.z);
  group.scale.setScalar(variant.scale);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.2, 2),
    makeAdditiveMaterial(variant.core, 0.0)
  );
  group.add(core);

  const aura = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.42, 1),
    makeAdditiveMaterial(variant.aura, 0.0, true)
  );
  group.add(aura);

  const ringA = new THREE.Mesh(
    new THREE.TorusGeometry(0.4, 0.016, 12, 72),
    makeAdditiveMaterial(variant.aura, 0.0)
  );
  ringA.rotation.x = Math.PI / 2;
  group.add(ringA);

  const ringB = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.01, 12, 72),
    makeAdditiveMaterial(variant.accent, 0.0)
  );
  ringB.rotation.y = Math.PI / 2;
  group.add(ringB);

  const petals = [];
  for (let i = 0; i < 7; i += 1) {
    const angle = (i / 7) * Math.PI * 2;
    const petal = new THREE.Mesh(
      new THREE.PlaneGeometry(0.11, 0.56),
      makeAdditiveMaterial(variant.accent, 0.0)
    );
    petal.position.set(Math.cos(angle) * 0.32, 0, Math.sin(angle) * 0.32);
    petal.rotation.y = angle;
    petal.rotation.z = Math.PI * 0.18;
    group.add(petal);
    petals.push(petal);
  }

  const seeds = [];
  for (let i = 0; i < 8; i += 1) {
    const seed = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 10, 10),
      makeAdditiveMaterial(variant.core, 0.0)
    );
    group.add(seed);
    seeds.push(seed);
  }

  const light = new THREE.PointLight(variant.core, 0.0, 6.2, 2.0);
  group.add(light);

  return { group, elements: { core, aura, ringA, ringB, petals, seeds, light } };
}

function createKnotVariant(variant) {
  const group = new THREE.Group();
  group.position.set(variant.x, variant.y, variant.z);
  group.scale.setScalar(variant.scale);

  const knot = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.28, 1),
    makeAdditiveMaterial(variant.aura, 0.0, true)
  );
  group.add(knot);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 18, 18),
    makeAdditiveMaterial(variant.core, 0.0)
  );
  group.add(core);

  const ringA = new THREE.Mesh(
    new THREE.TorusGeometry(0.52, 0.016, 12, 72),
    makeAdditiveMaterial(variant.aura, 0.0)
  );
  ringA.rotation.x = Math.PI / 2;
  group.add(ringA);

  const ringB = new THREE.Mesh(
    new THREE.TorusGeometry(0.68, 0.01, 12, 72),
    makeAdditiveMaterial(variant.accent, 0.0)
  );
  ringB.rotation.z = Math.PI * 0.26;
  group.add(ringB);

  const nodes = [];
  for (let i = 0; i < 5; i += 1) {
    const node = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 10, 10),
      makeAdditiveMaterial(variant.core, 0.0)
    );
    group.add(node);
    nodes.push(node);
  }

  const light = new THREE.PointLight(variant.core, 0.0, 5.4, 2.0);
  group.add(light);

  return { group, elements: { knot, core, ringA, ringB, nodes, light } };
}

export function createVoiceSculptureProto(roomId) {
  const variant = VARIANTS[roomId] ?? VARIANTS["membrane-chamber"];

  let built;
  if (variant.type === "seed") built = createSeedVariant(variant);
  else if (variant.type === "ribbon") built = createRibbonVariant(variant);
  else if (variant.type === "knot") built = createKnotVariant(variant);
  else built = createBloomVariant(variant);

  return {
    roomId,
    variant,
    type: variant.type,
    group: built.group,
    elements: built.elements,
  };
}

function updateSeed(entry, elapsed, strength, dormant, voice) {
  const { core, ringA, ringB, motes, light } = entry.elements;
  const show = dormant ? strength * 0.22 : strength;

  core.scale.setScalar(0.72 + show * 0.82);
  setOpacity(core.material, dormant ? 0.012 + show * 0.06 : 0.06 + show * 0.28);

  ringA.rotation.z += 0.006 + voice.onset * 0.004;
  ringA.scale.setScalar(1 + show * 0.12);
  setOpacity(ringA.material, dormant ? 0.008 + show * 0.035 : 0.03 + show * 0.12);

  ringB.rotation.y += 0.004 + voice.breath * 0.003;
  setOpacity(ringB.material, dormant ? 0.004 + show * 0.02 : 0.018 + show * 0.08);

  motes.forEach((mote, i) => {
    const angle = elapsed * (0.7 + voice.onset * 0.2) + i * 1.57;
    const radius = 0.32 + show * 0.22;
    mote.position.x = Math.cos(angle) * radius;
    mote.position.z = Math.sin(angle) * radius;
    mote.position.y = Math.sin(elapsed * 1.4 + i) * 0.06 + voice.breath * 0.04;
    mote.scale.setScalar(0.7 + show * 0.9);
    setOpacity(mote.material, dormant ? 0.004 + show * 0.018 : 0.016 + show * 0.08);
  });

  light.intensity = dormant ? show * 0.08 : 0.04 + show * 0.26;
}

function updateRibbon(entry, elapsed, strength, dormant, voice) {
  const { ribbons, pulseRing, nodes, light } = entry.elements;
  const show = dormant ? strength * 0.16 : strength;

  ribbons.forEach((ribbon, i) => {
    const wave = 0.5 + Math.sin(elapsed * 2.1 + i * 0.45) * 0.5;
    ribbon.position.y = wave * (0.14 + show * 0.18) + voice.breath * 0.05;
    ribbon.scale.y = 0.82 + show * 0.48 + wave * 0.18;
    setOpacity(ribbon.material, dormant ? 0.003 + show * 0.015 : 0.018 + show * 0.08 + voice.onset * 0.03);
  });

  pulseRing.rotation.z += 0.014 + voice.onset * 0.01;
  pulseRing.scale.x = 1 + show * 0.24 + voice.onset * 0.08;
  pulseRing.scale.y = 1;
  pulseRing.scale.z = 1;
  setOpacity(pulseRing.material, dormant ? 0.004 + show * 0.018 : 0.018 + show * 0.09 + voice.brightness * 0.03);

  nodes.forEach((node, i) => {
    const t = (i / Math.max(1, nodes.length - 1)) - 0.5;
    node.position.x = t * (0.9 + show * 0.3);
    node.position.y = Math.sin(elapsed * 1.8 + i) * 0.08 + voice.breath * 0.04;
    node.position.z = Math.cos(elapsed * 1.1 + i) * 0.06;
    node.scale.setScalar(0.7 + show * 0.8);
    setOpacity(node.material, dormant ? 0.003 + show * 0.012 : 0.014 + show * 0.055);
  });

  light.intensity = dormant ? show * 0.05 : 0.03 + show * 0.2;
}

function updateBloom(entry, elapsed, strength, dormant, voice) {
  const { core, aura, ringA, ringB, petals, seeds, light } = entry.elements;
  const show = dormant ? strength * 0.12 : strength;

  core.scale.setScalar(0.72 + show * 0.98 + voice.bloom * (dormant ? 0.02 : 0.16));
  setOpacity(core.material, dormant ? 0.006 + show * 0.028 : 0.04 + show * 0.24 + voice.bloom * 0.08);

  aura.scale.setScalar(0.92 + show * 0.44 + voice.bloom * (dormant ? 0.02 : 0.1));
  aura.rotation.x += 0.004 + voice.onset * 0.004;
  aura.rotation.y += 0.006 + voice.breath * 0.004;
  setOpacity(aura.material, dormant ? 0.004 + show * 0.018 : 0.02 + show * 0.08 + voice.brightness * 0.03);

  ringA.rotation.z += 0.01 + voice.onset * 0.01;
  ringA.scale.setScalar(1 + show * 0.12);
  setOpacity(ringA.material, dormant ? 0.004 + show * 0.018 : 0.02 + show * 0.08);

  ringB.rotation.x += 0.006 + voice.breath * 0.004;
  ringB.rotation.y += 0.006 + voice.onset * 0.004;
  setOpacity(ringB.material, dormant ? 0.003 + show * 0.015 : 0.014 + show * 0.06);

  petals.forEach((petal, i) => {
    const angle = (i / petals.length) * Math.PI * 2 + elapsed * (0.2 + voice.onset * 0.08);
    const radius = 0.28 + show * 0.18;
    petal.position.x = Math.cos(angle) * radius;
    petal.position.z = Math.sin(angle) * radius;
    petal.position.y = Math.sin(elapsed * 1.1 + i) * 0.05 + voice.breath * 0.05;
    petal.rotation.y = angle;
    setOpacity(petal.material, dormant ? 0.002 + show * 0.012 : 0.014 + show * 0.055 + voice.bloom * 0.02);
  });

  seeds.forEach((seed, i) => {
    const angle = (i / seeds.length) * Math.PI * 2 + elapsed * (0.48 + voice.onset * 0.14);
    const radius = 0.56 + show * 0.34;
    seed.position.x = Math.cos(angle) * radius;
    seed.position.z = Math.sin(angle) * radius;
    seed.position.y = Math.sin(elapsed * 1.6 + i) * 0.12 + voice.presence * 0.05;
    seed.scale.setScalar(0.6 + show * 1.0);
    setOpacity(seed.material, dormant ? 0.002 + show * 0.01 : 0.012 + show * 0.05);
  });

  light.intensity = dormant ? show * 0.04 : 0.05 + show * 0.34 + voice.bloom * 0.08;
}

function updateKnot(entry, elapsed, strength, dormant, voice, portalUnlock) {
  const { knot, core, ringA, ringB, nodes, light } = entry.elements;
  const show = dormant ? strength * 0.14 : strength;

  knot.rotation.x += 0.005 + voice.onset * 0.004;
  knot.rotation.y += 0.007 + voice.breath * 0.003;
  knot.scale.setScalar(0.86 + show * 0.36 + portalUnlock * 0.08);
  setOpacity(knot.material, dormant ? 0.004 + show * 0.016 : 0.02 + show * 0.08 + portalUnlock * 0.03);

  core.scale.setScalar(0.72 + show * 0.74);
  setOpacity(core.material, dormant ? 0.006 + show * 0.024 : 0.03 + show * 0.18 + voice.brightness * 0.04);

  ringA.rotation.z += 0.012 + voice.onset * 0.01;
  ringA.scale.setScalar(1 + show * 0.12 + portalUnlock * 0.04);
  setOpacity(ringA.material, dormant ? 0.004 + show * 0.016 : 0.02 + show * 0.08 + portalUnlock * 0.03);

  ringB.rotation.x += 0.008 + voice.breath * 0.004;
  ringB.rotation.z += 0.004;
  setOpacity(ringB.material, dormant ? 0.003 + show * 0.012 : 0.014 + show * 0.05 + portalUnlock * 0.025);

  nodes.forEach((node, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 + elapsed * (0.32 + voice.onset * 0.1);
    const radius = 0.56 + show * 0.22 + portalUnlock * 0.06;
    node.position.x = Math.cos(angle) * radius;
    node.position.z = Math.sin(angle) * radius;
    node.position.y = Math.sin(elapsed * 1.2 + i) * 0.08;
    node.scale.setScalar(0.6 + show * 0.9);
    setOpacity(node.material, dormant ? 0.002 + show * 0.01 : 0.012 + show * 0.05);
  });

  light.intensity = dormant ? show * 0.05 : 0.03 + show * 0.22 + portalUnlock * 0.08;
}

export function updateVoiceSculptureProto(entry, { elapsed, voice, focus = 0, portalUnlock = 0 }) {
  const dominant = focus > 0.24;
  const support = !dominant && focus > 0.09;

  const roomFocusWeight =
    entry.roomId === "membrane-chamber" ? 0.76 :
    entry.roomId === "portal-atrium" ? 0.36 :
    entry.roomId === "hall-of-arrival" ? 0.28 :
    0.32;

  const roomVoiceWeight =
    entry.roomId === "membrane-chamber" ? 0.62 :
    entry.roomId === "portal-atrium" ? 0.34 :
    entry.roomId === "hall-of-arrival" ? 0.22 :
    0.28;

  const roomBloomWeight =
    entry.roomId === "membrane-chamber" ? 0.30 :
    entry.roomId === "portal-atrium" ? 0.16 :
    entry.roomId === "hall-of-arrival" ? 0.10 :
    0.12;

  const dominantStrength = clamp01(
    0.06 +
    focus * roomFocusWeight +
    voice.presence * roomVoiceWeight +
    voice.bloom * roomBloomWeight +
    voice.onset * 0.04
  );

  const supportStrength = clamp01(
    focus * 0.08 +
    voice.bloom * 0.02 +
    voice.presence * 0.018
  );

  const strength = dominant ? dominantStrength : support ? supportStrength : 0;
  const hidden = !dominant && (!support || strength < 0.055);

  entry.group.visible = !hidden;
  if (hidden) return;

  const passive = !dominant;

  if (entry.type === "seed") {
    updateSeed(entry, elapsed, strength, passive, voice);
  } else if (entry.type === "ribbon") {
    updateRibbon(entry, elapsed, strength, passive, voice);
  } else if (entry.type === "knot") {
    updateKnot(entry, elapsed, strength, passive, voice, portalUnlock);
  } else {
    updateBloom(entry, elapsed, strength, passive, voice);
  }

  const baseScale = entry.variant.scale;
  const targetScale = dominant
    ? baseScale * (0.82 + strength * 0.18 + voice.bloom * 0.04)
    : baseScale * (0.58 + strength * 0.08);

  entry.group.scale.setScalar(targetScale);

  if (!dominant) {
    entry.group.position.y = entry.variant.y - 0.06;
  } else {
    entry.group.position.y = entry.variant.y;
  }
}

