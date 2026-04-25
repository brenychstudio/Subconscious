import * as THREE from "three";

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function rand(min, max) {
  return lerp(min, max, Math.random());
}

function createSoftStarTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;

  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.12, "rgba(255,255,255,0.96)");
  gradient.addColorStop(0.34, "rgba(220,235,255,0.44)");
  gradient.addColorStop(0.70, "rgba(180,205,255,0.10)");
  gradient.addColorStop(1, "rgba(180,205,255,0)");

  ctx.clearRect(0, 0, 128, 128);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function randomSpawn() {
  const side = Math.random() < 0.5 ? -1 : 1;

  const start = new THREE.Vector3(
    side * rand(12, 22),
    rand(11, 20),
    rand(-14, 8)
  );

  const dir = new THREE.Vector3(
    -side * rand(0.72, 0.98),
    rand(-0.18, -0.08),
    rand(-0.12, 0.12)
  ).normalize();

  return { start, dir };
}

function buildOne(texture) {
  const group = new THREE.Group();
  group.visible = false;
  group.renderOrder = 90;

  const haloMaterial = new THREE.SpriteMaterial({
    map: texture,
    color: 0xcfe2ff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
    blending: THREE.AdditiveBlending,
  });

  const halo = new THREE.Sprite(haloMaterial);
  halo.scale.setScalar(0.42);
  halo.renderOrder = 90;
  group.add(halo);

  const headMaterial = new THREE.SpriteMaterial({
    map: texture,
    color: 0xf4f8ff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
    blending: THREE.AdditiveBlending,
  });

  const head = new THREE.Sprite(headMaterial);
  head.scale.setScalar(0.22);
  head.renderOrder = 91;
  group.add(head);

  const trailGeometry = new THREE.BufferGeometry();
  trailGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3)
  );

  const trailMaterial = new THREE.LineBasicMaterial({
    color: 0xd6e6ff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
    blending: THREE.AdditiveBlending,
  });

  const trail = new THREE.Line(trailGeometry, trailMaterial);
  trail.renderOrder = 90;
  group.add(trail);

  return {
    group,
    halo,
    head,
    trail,
    active: false,
    age: 0,
    duration: 0,
    speed: 0,
    tailLength: 0,
    brightness: 1,
    baseScale: 0.22,
    haloScale: 0.42,
    start: new THREE.Vector3(),
    dir: new THREE.Vector3(),
  };
}

function spawn(star) {
  const spawnData = randomSpawn();

  star.active = true;
  star.age = 0;
  star.duration = rand(1.9, 3.4);
  star.speed = rand(5.4, 9.4);
  star.tailLength = rand(2.8, 5.2);
  star.brightness = rand(0.92, 1.18);
  star.baseScale = rand(0.18, 0.28);
  star.haloScale = star.baseScale * rand(2.2, 2.9);

  star.start.copy(spawnData.start);
  star.dir.copy(spawnData.dir);

  star.head.scale.setScalar(star.baseScale);
  star.halo.scale.setScalar(star.haloScale);

  star.group.position.copy(star.start);
  star.group.visible = true;

  star.head.material.opacity = 0;
  star.halo.material.opacity = 0;
  star.trail.material.opacity = 0;
}

function updateOne(star, dtSec) {
  if (!star.active) return;

  star.age += dtSec;
  const t = clamp01(star.age / star.duration);

  if (t >= 1) {
    star.active = false;
    star.group.visible = false;
    star.head.material.opacity = 0;
    star.halo.material.opacity = 0;
    star.trail.material.opacity = 0;
    return;
  }

  const fadeIn = clamp01(t / 0.20);
  const fadeOut = 1 - clamp01((t - 0.70) / 0.30);
  const alpha = fadeIn * fadeOut;

  const traveled = star.speed * star.age;
  const headPos = star.start.clone().addScaledVector(star.dir, traveled);
  const tailPos = headPos.clone().addScaledVector(star.dir, -star.tailLength);

  star.group.position.copy(headPos);

  star.head.material.opacity = 0.72 * alpha * star.brightness;
  star.halo.material.opacity = 0.16 * alpha * star.brightness;
  star.trail.material.opacity = 0.24 * alpha * star.brightness;

  const pulse = 1 + Math.sin(t * Math.PI) * 0.06;
  star.head.scale.setScalar(star.baseScale * pulse);
  star.halo.scale.setScalar(star.haloScale * (1 + Math.sin(t * Math.PI) * 0.04));

  const pos = star.trail.geometry.getAttribute("position");
  pos.setXYZ(0, tailPos.x - headPos.x, tailPos.y - headPos.y, tailPos.z - headPos.z);
  pos.setXYZ(1, 0, 0, 0);
  pos.needsUpdate = true;
}

export function createArrivalFallingStarsSystem() {
  const root = new THREE.Group();
  root.name = "arrival-falling-stars-system";
  root.visible = true;
  root.renderOrder = 90;

  const texture = createSoftStarTexture();

  const pool = Array.from({ length: 5 }, () => {
    const star = buildOne(texture);
    root.add(star.group);
    return star;
  });

  let cooldown = rand(2.0, 4.0);

  function getIdle() {
    return pool.find((item) => !item.active) ?? null;
  }

  function update({
    dtSec = 0.016,
    enabled = true,
    intensity = 0,
  } = {}) {
    root.visible = enabled;
    if (!enabled) return;

    cooldown -= dtSec * (1 + intensity * 0.12);

    if (cooldown <= 0) {
      const idle = getIdle();
      if (idle) {
        spawn(idle);
      }

      cooldown = rand(5.5, 10.0);
    }

    pool.forEach((star) => updateOne(star, dtSec));
  }

  function dispose() {
    root.traverse((obj) => {
      obj.geometry?.dispose?.();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((mat) => {
            mat?.map?.dispose?.();
            mat?.dispose?.();
          });
        } else {
          obj.material.map?.dispose?.();
          obj.material.dispose?.();
        }
      }
    });
  }

  return {
    group: root,
    update,
    dispose,
  };
}
