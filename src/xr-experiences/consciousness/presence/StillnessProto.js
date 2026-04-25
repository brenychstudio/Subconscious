import * as THREE from "three";

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function makeAdditiveMaterial(color, opacity) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

function setOpacity(material, value) {
  if (!material) return;
  material.opacity = Math.max(0, value);
}

const ROOM_PROFILES = {
  "hall-of-arrival": {
    y: 1.96,
    z: 0.28,
    floorScale: [0.92, 1, 0.92],
    hoverScale: [0.88, 1, 0.88],
    veilScale: [0.78, 1.02, 1],
    coreBias: 1.0,
    veilBias: 0.9,
  },
  "signal-corridor": {
    y: 1.82,
    z: 0.18,
    floorScale: [1.18, 1, 0.72],
    hoverScale: [1.04, 1, 0.58],
    veilScale: [0.52, 1.12, 1],
    coreBias: 0.68,
    veilBias: 0.76,
  },
  "membrane-chamber": {
    y: 2.04,
    z: 0.58,
    floorScale: [1.02, 1, 1.02],
    hoverScale: [0.94, 1, 0.94],
    veilScale: [0.94, 1.24, 1],
    coreBias: 1.12,
    veilBias: 1.08,
  },
  "portal-atrium": {
    y: 2.0,
    z: 0.74,
    floorScale: [0.92, 1, 0.92],
    hoverScale: [0.82, 1, 0.82],
    veilScale: [0.68, 1.18, 1],
    coreBias: 0.74,
    veilBias: 0.92,
  },
};

export function createStillnessProtoTracker() {
  const prevPos = new THREE.Vector3();
  const currentPos = new THREE.Vector3();
  const prevQuat = new THREE.Quaternion();
  const currentQuat = new THREE.Quaternion();

  let initialized = false;

  let motionStillness = 0;
  let silence = 0;
  let stillness = 0;
  let settled = 0;

  function update({ camera, dtSec, voice }) {
    if (!camera) {
      return { motionStillness, silence, stillness, settled };
    }

    const safeDt = Math.max(0.001, dtSec || 0.016);

    camera.getWorldPosition(currentPos);
    camera.getWorldQuaternion(currentQuat);

    if (!initialized) {
      prevPos.copy(currentPos);
      prevQuat.copy(currentQuat);
      initialized = true;
    }

    const posDelta = currentPos.distanceTo(prevPos);
    const dot = Math.abs(
      prevQuat.x * currentQuat.x +
      prevQuat.y * currentQuat.y +
      prevQuat.z * currentQuat.z +
      prevQuat.w * currentQuat.w
    );
    const rotDelta = 2 * Math.acos(Math.min(1, Math.max(-1, dot)));

    prevPos.copy(currentPos);
    prevQuat.copy(currentQuat);

    const linearSpeed = posDelta / safeDt;
    const angularSpeed = rotDelta / safeDt;

    const motionAmount = clamp01(
      linearSpeed / 0.22 +
      angularSpeed / 1.85
    );
    const motionTarget = 1 - motionAmount;

    const voiceEnabled = Boolean(voice?.enabled);
    const silenceTarget = voiceEnabled
      ? 1 - clamp01(
          (voice?.presence ?? 0) * 0.92 +
          (voice?.bloom ?? 0) * 0.34 +
          (voice?.onset ?? 0) * 0.38
        )
      : 1;

    motionStillness = lerp(motionStillness, motionTarget, motionTarget > motionStillness ? 0.08 : 0.18);
    silence = lerp(silence, silenceTarget, silenceTarget > silence ? 0.06 : 0.14);

    const stillnessTarget = clamp01(
      motionStillness * 0.58 +
      silence * 0.42
    );
    stillness = lerp(stillness, stillnessTarget, stillnessTarget > stillness ? 0.05 : 0.12);

    const settleTarget =
      motionStillness > 0.8 && silence > 0.82
        ? clamp01((motionStillness * 0.55 + silence * 0.45))
        : 0;

    settled = lerp(settled, settleTarget, settleTarget > settled ? 0.03 : 0.08);

    return {
      motionStillness,
      silence,
      stillness,
      settled,
    };
  }

  function dispose() {}

  return {
    update,
    dispose,
  };
}

export function createStillnessField() {
  const group = new THREE.Group();
  group.visible = false;

  const floorRing = new THREE.Mesh(
    new THREE.RingGeometry(0.64, 0.92, 64),
    makeAdditiveMaterial(0xe9f2ff, 0)
  );
  floorRing.rotation.x = -Math.PI / 2;
  floorRing.position.y = 0.04;
  group.add(floorRing);

  const hoverRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.012, 12, 72),
    makeAdditiveMaterial(0xd6e4ff, 0)
  );
  hoverRing.rotation.x = Math.PI / 2;
  group.add(hoverRing);

  const veil = new THREE.Mesh(
    new THREE.PlaneGeometry(0.88, 1.38),
    makeAdditiveMaterial(0xdce8ff, 0)
  );
  veil.position.z = -0.04;
  group.add(veil);

  const core = new THREE.Mesh(
    new THREE.CircleGeometry(0.18, 48),
    makeAdditiveMaterial(0xf8fbff, 0)
  );
  core.position.z = 0.02;
  group.add(core);

  const motes = [];
  for (let i = 0; i < 5; i += 1) {
    const mote = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 10, 10),
      makeAdditiveMaterial(0xf6f9ff, 0)
    );
    group.add(mote);
    motes.push(mote);
  }

  const light = new THREE.PointLight(0xf4f8ff, 0, 5.6, 2);
  group.add(light);

  return {
    group,
    elements: {
      floorRing,
      hoverRing,
      veil,
      core,
      motes,
      light,
    },
  };
}

export function updateStillnessField(entry, { elapsed, room, stillness = 0, settled = 0, progress = 0 }) {
  if (!room) {
    entry.group.visible = false;
    return;
  }

  const profile = ROOM_PROFILES[room.id] ?? ROOM_PROFILES["hall-of-arrival"];
  const calm = clamp01(stillness * (0.7 + settled * 0.3) * (0.55 + progress * 0.45));

  entry.group.visible = calm > 0.025;
  if (!entry.group.visible) return;

  entry.group.position.set(room.x, 0, room.z);

  const { floorRing, hoverRing, veil, core, motes, light } = entry.elements;

  floorRing.scale.set(
    profile.floorScale[0] * (1 + calm * 0.08),
    profile.floorScale[1],
    profile.floorScale[2] * (1 + calm * 0.08)
  );
  setOpacity(floorRing.material, 0.008 + calm * 0.07);

  hoverRing.position.y = profile.y;
  hoverRing.position.z = profile.z;
  hoverRing.scale.set(
    profile.hoverScale[0] * (1 + calm * 0.12),
    profile.hoverScale[1],
    profile.hoverScale[2] * (1 + calm * 0.12)
  );
  hoverRing.rotation.z += 0.003;
  setOpacity(hoverRing.material, 0.006 + calm * 0.05);

  veil.position.y = profile.y;
  veil.position.z = profile.z - 0.04;
  veil.scale.set(
    profile.veilScale[0],
    profile.veilScale[1] * (1 + calm * 0.16),
    1
  );
  setOpacity(veil.material, 0.004 + calm * 0.035 * profile.veilBias);

  core.position.y = profile.y;
  core.position.z = profile.z + 0.02;
  core.scale.setScalar(0.84 + calm * 0.46 * profile.coreBias);
  setOpacity(core.material, 0.008 + calm * 0.07 * profile.coreBias);

  motes.forEach((mote, i) => {
    const angle = elapsed * 0.24 + i * 1.256;
    const radius = 0.38 + calm * 0.14;
    mote.position.set(
      room.x + Math.cos(angle) * radius,
      profile.y + Math.sin(elapsed * 0.7 + i) * 0.08,
      room.z + profile.z + Math.sin(angle) * radius * 0.72
    );
    mote.scale.setScalar(0.72 + calm * 0.42);
    setOpacity(mote.material, 0.003 + calm * 0.028);
  });

  light.position.set(0, profile.y, profile.z + 0.04);
  light.intensity = 0.01 + calm * 0.14;
}
