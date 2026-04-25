import * as THREE from "three";

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function smoothstep01(x) {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
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

export function createPortalInvocationProto() {
  const group = new THREE.Group();
  group.position.set(0, 1.88, 0);
  group.scale.setScalar(0.82);

  const veil = new THREE.Mesh(
    new THREE.PlaneGeometry(1.14, 1.82),
    makeAdditiveMaterial(0xd7e3ff, 0.0)
  );
  veil.position.z = -0.12;
  group.add(veil);

  const ringA = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.018, 16, 96),
    makeAdditiveMaterial(0xecf3ff, 0.0)
  );
  ringA.rotation.x = Math.PI / 2;
  ringA.position.z = -0.02;
  group.add(ringA);

  const ringB = new THREE.Mesh(
    new THREE.TorusGeometry(0.86, 0.012, 16, 96),
    makeAdditiveMaterial(0xcbdcff, 0.0)
  );
  ringB.rotation.x = Math.PI * 0.44;
  ringB.rotation.z = Math.PI * 0.18;
  ringB.position.z = 0.12;
  group.add(ringB);

  const core = new THREE.Mesh(
    new THREE.CircleGeometry(0.28, 56),
    makeAdditiveMaterial(0xffffff, 0.0)
  );
  core.position.z = 0.04;
  group.add(core);

  const knot = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.34, 1),
    makeAdditiveMaterial(0xd8e6ff, 0.0, true)
  );
  knot.position.z = 0.08;
  group.add(knot);

  const arcs = [];
  for (let i = 0; i < 3; i += 1) {
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(0.46 + i * 0.08, 0.008, 10, 48, Math.PI * 0.62),
      makeAdditiveMaterial(0xe4edff, 0.0)
    );
    arc.rotation.x = Math.PI / 2;
    arc.rotation.z = i * 1.38;
    arc.position.z = -0.04 + i * 0.05;
    group.add(arc);
    arcs.push(arc);
  }

  const motes = [];
  for (let i = 0; i < 6; i += 1) {
    const mote = new THREE.Mesh(
      new THREE.SphereGeometry(0.024, 10, 10),
      makeAdditiveMaterial(0xf7faff, 0.0)
    );
    group.add(mote);
    motes.push(mote);
  }

  const light = new THREE.PointLight(0xf5f9ff, 0.0, 5.8, 2.0);
  light.position.z = 0.08;
  group.add(light);

  return {
    group,
    elements: {
      veil,
      ringA,
      ringB,
      core,
      knot,
      arcs,
      motes,
      light,
    },
  };
}

export function updatePortalInvocationProto(entry, { elapsed, voice, focus = 0, unlocked = 0 }) {
  const raw =
    focus * 0.22 +
    unlocked * 0.18 +
    voice.presence * 0.42 +
    voice.bloom * 0.16 +
    voice.brightness * 0.08 +
    voice.onset * 0.05 -
    0.28;

  const trigger = clamp01(raw);
  const reveal = smoothstep01(trigger);
  const glow = clamp01(reveal * 0.82 + voice.bloom * 0.18 + unlocked * 0.12);

  const { veil, ringA, ringB, core, knot, arcs, motes, light } = entry.elements;

  entry.group.visible = reveal > 0.018 || unlocked > 0.035;
  if (!entry.group.visible) return;

  veil.scale.set(
    0.96 + reveal * 0.08,
    0.98 + glow * 0.14,
    1
  );
  setOpacity(veil.material, 0.003 + reveal * 0.026 + glow * 0.01);

  ringA.rotation.z += 0.008 + voice.onset * 0.006;
  ringA.scale.setScalar(1 + reveal * 0.06 + glow * 0.03);
  setOpacity(ringA.material, 0.008 + reveal * 0.06 + glow * 0.02);

  ringB.rotation.x += 0.004 + voice.breath * 0.003;
  ringB.rotation.z += 0.003;
  ringB.scale.setScalar(1 + glow * 0.08);
  setOpacity(ringB.material, 0.005 + reveal * 0.04 + glow * 0.015);

  core.scale.setScalar(0.78 + reveal * 0.3 + glow * 0.08);
  setOpacity(core.material, 0.01 + reveal * 0.09 + glow * 0.03 + voice.brightness * 0.015);

  knot.rotation.x += 0.004 + voice.onset * 0.003;
  knot.rotation.y += 0.006 + voice.breath * 0.002;
  knot.scale.setScalar(0.9 + reveal * 0.12 + glow * 0.04);
  setOpacity(knot.material, 0.006 + reveal * 0.04 + glow * 0.018);

  arcs.forEach((arc, i) => {
    arc.rotation.z += 0.002 + voice.onset * 0.0015;
    arc.rotation.y = Math.sin(elapsed * 0.7 + i) * 0.16;
    setOpacity(arc.material, 0.003 + reveal * 0.022 + glow * 0.01);
  });

  motes.forEach((mote, i) => {
    const angle = elapsed * (0.36 + voice.onset * 0.1) + i * 1.047;
    const radius = 0.54 + reveal * 0.18 + glow * 0.05;
    mote.position.x = Math.cos(angle) * radius;
    mote.position.z = Math.sin(angle) * radius * 0.72 + (i % 2 === 0 ? 0.1 : -0.08);
    mote.position.y = Math.sin(elapsed * 1.15 + i) * (0.08 + voice.breath * 0.05);
    mote.scale.setScalar(0.7 + reveal * 0.5);
    setOpacity(mote.material, 0.002 + reveal * 0.02 + glow * 0.01);
  });

  light.intensity = 0.008 + reveal * 0.14 + glow * 0.05;
}
