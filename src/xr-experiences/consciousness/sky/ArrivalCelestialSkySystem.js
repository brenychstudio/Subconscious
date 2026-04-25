import * as THREE from "three";
import { createStarSpriteTexture } from "./createStarSpriteTexture.js";
import {
  ARRIVAL_HERO_STARS,
  ARRIVAL_CONSTELLATION_EDGES,
  ARRIVAL_SKY_DEBUG_INFO,
  getArrivalHeroStarById,
} from "./arrivalSkyCatalog.js";
import { getArrivalSkyPreset } from "./arrivalSkyPresets.js";

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function raDecToVector3(raHours, decDeg, radius) {
  const ra = (raHours / 24) * Math.PI * 2;
  const dec = THREE.MathUtils.degToRad(decDeg);

  const x = -radius * Math.cos(dec) * Math.sin(ra);
  const y = radius * Math.sin(dec);
  const z = -radius * Math.cos(dec) * Math.cos(ra);

  return new THREE.Vector3(x, y, z);
}

function randomSpherePoint(radius) {
  const u = Math.random();
  const v = Math.random();

  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);

  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

function randomUpperHemispherePoint(radius, minY = 0) {
  const point = new THREE.Vector3();

  for (let i = 0; i < 24; i += 1) {
    point.copy(randomSpherePoint(radius));
    if (point.y >= minY) return point;
  }

  point.copy(randomSpherePoint(radius));
  point.y = Math.abs(point.y) + minY;

  return point.setLength(radius);
}

function randomSphereShellPoint(minRadius, maxRadius) {
  const point = randomSpherePoint(1);
  const radius = lerp(minRadius, maxRadius, Math.random());
  return point.normalize().multiplyScalar(radius);
}

function randomSkyHemisphereShellPoint(minRadius, maxRadius, minY = 0) {
  const point = new THREE.Vector3();

  for (let i = 0; i < 40; i += 1) {
    point.copy(randomSpherePoint(1));
    const radius = lerp(minRadius, maxRadius, Math.random());
    point.normalize().multiplyScalar(radius);

    if (point.y >= minY) return point;
  }

  point.copy(randomSpherePoint(1));
  const radius = lerp(minRadius, maxRadius, Math.random());
  point.normalize().multiplyScalar(radius);
  point.y = Math.abs(point.y) + minY;

  return point.setLength(radius);
}

function fadeByHeight(y, start, end) {
  return clamp01((y - start) / Math.max(0.0001, end - start));
}

function buildBackgroundStars(_texture, preset) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(preset.backgroundStarCount * 3);

  for (let i = 0; i < preset.backgroundStarCount; i += 1) {
    const point = randomSkyHemisphereShellPoint(
      preset.domeRadius - 3.2,
      preset.domeRadius - 0.8,
      preset.backgroundMinY
    );

    positions[i * 3 + 0] = point.x;
    positions[i * 3 + 1] = point.y;
    positions[i * 3 + 2] = point.z;
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xc9dcff,
    size: preset.backgroundStarSize,
    transparent: true,
    opacity: preset.backgroundStarOpacity,
    depthWrite: false,
    depthTest: true,
    fog: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: false,
  });

  const points = new THREE.Points(geometry, material);
  points.name = "arrival-background-stars";
  points.frustumCulled = false;
  points.renderOrder = -30;
  return points;
}

function buildMidStars(texture, preset) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(preset.midStarCount * 3);

  for (let i = 0; i < preset.midStarCount; i += 1) {
    const point = randomSkyHemisphereShellPoint(
      preset.domeRadius - 2.2,
      preset.domeRadius - 0.5,
      preset.midMinY
    );

    positions[i * 3 + 0] = point.x;
    positions[i * 3 + 1] = point.y;
    positions[i * 3 + 2] = point.z;
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    map: texture,
    alphaMap: texture,
    alphaTest: 0,
    color: 0xf6fbff,
    size: preset.midStarSize,
    transparent: true,
    opacity: preset.midStarOpacity,
    depthWrite: false,
    depthTest: true,
    fog: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: false,
  });

  const points = new THREE.Points(geometry, material);
  points.name = "arrival-mid-stars";
  points.frustumCulled = false;
  points.renderOrder = -29;
  return points;
}

function buildAtmosphericDust(texture, preset) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(preset.dustCount * 3);

  for (let i = 0; i < preset.dustCount; i += 1) {
    const radius = 10 + Math.random() * 20;
    const angle = Math.random() * Math.PI * 2;

    positions[i * 3 + 0] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = preset.dustMinY + Math.random() * (preset.dustMaxY - preset.dustMinY);
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    map: texture,
    alphaMap: texture,
    alphaTest: 0,
    color: 0x8fa3c9,
    size: preset.dustSize,
    transparent: true,
    opacity: preset.dustOpacity,
    depthWrite: false,
    depthTest: true,
    fog: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: false,
  });

  const points = new THREE.Points(geometry, material);
  points.name = "arrival-atmospheric-dust";
  points.frustumCulled = false;
  points.renderOrder = -29;
  return points;
}

function buildHeroStars(texture, preset) {
  const group = new THREE.Group();
  group.name = "arrival-hero-stars";

  ARRIVAL_HERO_STARS.forEach((star) => {
    const isBright = star.mag < 0.8;

    const material = new THREE.SpriteMaterial({
      map: texture,
      color: isBright ? 0xf8fbff : 0xd6e3ff,
      transparent: true,
      opacity: preset.heroStarOpacity,
      depthWrite: false,
      depthTest: false,
      fog: false,
      blending: THREE.AdditiveBlending,
    });

    const sprite = new THREE.Sprite(material);
    sprite.position.copy(raDecToVector3(star.ra, star.dec, preset.domeRadius - 1.2));

    const heightFade = fadeByHeight(
      sprite.position.y,
      preset.heroFadeStartY,
      preset.heroFadeEndY
    );

    if (heightFade <= 0.01) return;

    const baseScale = isBright
      ? preset.heroStarBrightScale
      : preset.heroStarBaseScale;

    sprite.scale.setScalar(baseScale);
    sprite.userData.starId = star.id;
    sprite.userData.magnitude = star.mag;
    sprite.userData.heightFade = heightFade;
    sprite.frustumCulled = false;
    sprite.renderOrder = -28;
    group.add(sprite);
  });

  return group;
}

function buildConstellationLayer(preset) {
  const group = new THREE.Group();
  group.name = "arrival-constellation-lines";

  ARRIVAL_CONSTELLATION_EDGES.forEach(([fromId, toId]) => {
    const from = getArrivalHeroStarById(fromId);
    const to = getArrivalHeroStarById(toId);
    if (!from || !to) return;

    const fromPoint = raDecToVector3(from.ra, from.dec, preset.domeRadius - 1.3);
    const toPoint = raDecToVector3(to.ra, to.dec, preset.domeRadius - 1.3);

    const fromFade = fadeByHeight(
      fromPoint.y,
      preset.constellationFadeStartY,
      preset.constellationFadeEndY
    );
    const toFade = fadeByHeight(
      toPoint.y,
      preset.constellationFadeStartY,
      preset.constellationFadeEndY
    );
    const lineFade = Math.min(fromFade, toFade);

    if (lineFade <= 0.02) return;

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [
          fromPoint.x, fromPoint.y, fromPoint.z,
          toPoint.x, toPoint.y, toPoint.z,
        ],
        3
      )
    );

    const material = new THREE.LineBasicMaterial({
      color: 0x7f96cf,
      transparent: true,
      opacity: preset.constellationOpacity * lineFade,
      depthWrite: false,
      depthTest: false,
      fog: false,
      blending: THREE.AdditiveBlending,
    });

    const line = new THREE.Line(geometry, material);
    line.userData.fromId = fromId;
    line.userData.toId = toId;
    line.userData.heightFade = lineFade;
    line.frustumCulled = false;
    line.renderOrder = -27;
    group.add(line);
  });

  return group;
}

export function createArrivalCelestialSkySystem({
  presetId = "nightThreshold",
  initialRoomId = null,
} = {}) {
  const preset = getArrivalSkyPreset(presetId);

  const root = new THREE.Group();
  root.name = "arrival-celestial-sky-system";
  root.visible = true;

  const anchor = new THREE.Group();
  anchor.name = "arrival-celestial-sky-anchor";
  anchor.position.set(0, preset.anchorHeight, 0);
  anchor.rotation.x = preset.pitchOffsetX ?? 0;
  anchor.rotation.y = preset.yawOffsetY ?? 0;
  root.add(anchor);

  const starTexture = createStarSpriteTexture({
    size: 128,
    coreAlpha: 1,
    haloAlpha: 0.28,
    outerAlpha: 0,
  });

  const backgroundStars = buildBackgroundStars(starTexture, preset);
  const midStars = buildMidStars(starTexture, preset);
  const atmosphericDust = buildAtmosphericDust(starTexture, preset);
  const heroStars = buildHeroStars(starTexture, preset);
  const constellationLines = buildConstellationLayer(preset);

  anchor.add(backgroundStars);
  anchor.add(midStars);
  anchor.add(atmosphericDust);
  anchor.add(heroStars);
  anchor.add(constellationLines);

  const state = {
    enabled: true,
    currentRoomId: initialRoomId,
    elapsed: 0,
    emphasis: 0,
    voice: {
      brightness: 0,
      bloom: 0,
      presence: 0,
    },
    viewer: {
      x: 0,
      y: 0,
      z: 0,
    },
  };

  const api = {
    group: root,
    preset,
    state,
    layers: {
      anchor,
      backgroundStars,
      midStars,
      atmosphericDust,
      heroStars,
      constellationLines,
    },
    debugInfo: ARRIVAL_SKY_DEBUG_INFO,
    setEnabled(next) {
      state.enabled = Boolean(next);
      root.visible = state.enabled;
    },
    setRoom(roomId) {
      state.currentRoomId = roomId ?? null;
    },
    snapshot() {
      return {
        version: ARRIVAL_SKY_DEBUG_INFO.version,
        mode: ARRIVAL_SKY_DEBUG_INFO.mode,
        enabled: state.enabled,
        currentRoomId: state.currentRoomId,
        emphasis: state.emphasis,
        viewer: { ...state.viewer },
        voice: { ...state.voice },
      };
    },
  };

  root.userData.api = api;
  root.userData.kind = "ArrivalCelestialSkySystem";

  return api;
}

export function updateArrivalCelestialSkySystem(
  skySystem,
  {
    elapsed = 0,
    viewer = null,
    emphasis = 0,
    voice = null,
    roomId = null,
  } = {}
) {
  if (!skySystem || !skySystem.group || !skySystem.layers) return;
  if (!skySystem.state.enabled) return;

  const { preset, state, layers } = skySystem;

  state.elapsed = elapsed;
  state.emphasis = clamp01(emphasis);

  if (roomId !== null) {
    state.currentRoomId = roomId;
  }

  if (viewer) {
    state.viewer.x = Number.isFinite(viewer.x) ? viewer.x : state.viewer.x;
    state.viewer.y = Number.isFinite(viewer.y) ? viewer.y : state.viewer.y;
    state.viewer.z = Number.isFinite(viewer.z) ? viewer.z : state.viewer.z;
  }

  if (voice) {
    state.voice.brightness = clamp01(voice.brightness ?? state.voice.brightness);
    state.voice.bloom = clamp01(voice.bloom ?? state.voice.bloom);
    state.voice.presence = clamp01(voice.presence ?? state.voice.presence);
  }

  layers.anchor.position.x = lerp(layers.anchor.position.x, state.viewer.x, preset.followLerp);
  layers.anchor.position.y = lerp(
    layers.anchor.position.y,
    state.viewer.y + preset.anchorHeight,
    preset.followLerp
  );
  layers.anchor.position.z = lerp(layers.anchor.position.z, state.viewer.z, preset.followLerp);

  layers.anchor.rotation.x =
    (preset.pitchOffsetX ?? 0) +
    Math.sin(elapsed * (preset.skyNutationSpeedX ?? 0.045)) * (preset.skyNutationAmpX ?? 0.006);

  layers.anchor.rotation.y =
    (preset.yawOffsetY ?? 0) +
    elapsed * (preset.skySpinY ?? 0.0024);

  layers.anchor.rotation.z =
    Math.sin(elapsed * 0.08) * (preset.rollDriftAmplitude ?? 0.0004);

  layers.backgroundStars.material.opacity = clamp01(
    preset.backgroundStarOpacity +
      state.emphasis * 0.04 +
      state.voice.brightness * 0.03
  );

  layers.backgroundStars.rotation.y = elapsed * (preset.backgroundSpinY ?? -0.00028);

  layers.midStars.material.opacity = clamp01(
    preset.midStarOpacity +
      state.emphasis * 0.05 +
      state.voice.brightness * 0.04 +
      state.voice.bloom * 0.02
  );

  layers.midStars.rotation.y = elapsed * (preset.midSpinY ?? 0.00072);

  layers.atmosphericDust.material.opacity = clamp01(
    preset.dustOpacity +
      state.emphasis * 0.0002 +
      state.voice.bloom * 0.0002
  );

  layers.atmosphericDust.rotation.y = elapsed * 0.0006;

  layers.heroStars.rotation.y = elapsed * (preset.heroSpinY ?? 0.00014);
  layers.constellationLines.rotation.y = elapsed * (preset.constellationSpinY ?? 0.00009);

  layers.heroStars.children.forEach((sprite, index) => {
    const wave = 0.5 + Math.sin(elapsed * (0.72 + index * 0.011)) * 0.5;
    const magnitudeBias = sprite.userData.magnitude < 0.8 ? 0.09 : 0.04;
    const heightFade = sprite.userData.heightFade ?? 1;

    sprite.material.opacity = clamp01(
      (
        preset.heroStarOpacity +
        state.emphasis * 0.022 +
        state.voice.brightness * (magnitudeBias * 0.72) +
        wave * 0.012
      ) * heightFade
    );

    const baseScale =
      sprite.userData.magnitude < 0.8
        ? preset.heroStarBrightScale
        : preset.heroStarBaseScale;

    const pulse = 1 + state.voice.bloom * 0.045 + wave * 0.025;
    sprite.scale.setScalar(baseScale * pulse);
  });

  layers.constellationLines.children.forEach((line, index) => {
    const wave = 0.5 + Math.sin(elapsed * (0.24 + index * 0.013)) * 0.5;
    const heightFade = line.userData.heightFade ?? 1;

    line.material.opacity = clamp01(
      (
        preset.constellationOpacity +
        state.emphasis * 0.012 +
        state.voice.presence * 0.010 +
        wave * 0.005
      ) * heightFade
    );
  });
}

export function disposeArrivalCelestialSkySystem(skySystem) {
  if (!skySystem || !skySystem.group) return;

  skySystem.group.traverse((node) => {
    if (node.geometry) {
      node.geometry.dispose?.();
    }

    if (node.material) {
      if (Array.isArray(node.material)) {
        node.material.forEach((material) => {
          material?.map?.dispose?.();
          material?.alphaMap?.dispose?.();
          material?.dispose?.();
        });
      } else {
        node.material.map?.dispose?.();
        node.material.alphaMap?.dispose?.();
        node.material.dispose?.();
      }
    }
  });

  if (skySystem.group.parent) {
    skySystem.group.parent.remove(skySystem.group);
  }
}
