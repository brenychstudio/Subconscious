import * as THREE from "three";
import { templeSanctuaryPreset } from "../presets/templeSanctuaryPreset.js";

function disposeMaterial(material) {
  if (!material) return;
  if (Array.isArray(material)) {
    material.forEach((m) => m?.dispose?.());
    return;
  }
  material.dispose?.();
}

function makeTempleMaterial({
  color = "#8ea9ff",
  opacity = 0.16,
  emissive = "#6587ea",
  emissiveIntensity = 0.14,
} = {}) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity,
    roughness: 0.94,
    metalness: 0.04,
    emissive: new THREE.Color(emissive),
    emissiveIntensity,
    depthWrite: false,
  });
}

function makeBasicGlow({ color = "#a7c2ff", opacity = 0.08 } = {}) {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

function makeAxialGlowMaterial({ color = "#b8d2ff", opacity = 0.1 } = {}) {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
}

function createSoftPointTexture(size = 96) {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  const half = size * 0.5;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);

  gradient.addColorStop(0.0, "rgba(255,255,255,0.95)");
  gradient.addColorStop(0.24, "rgba(235,244,255,0.72)");
  gradient.addColorStop(0.56, "rgba(160,190,255,0.16)");
  gradient.addColorStop(1.0, "rgba(255,255,255,0)");

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(half, half, half, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  return texture;
}

function createRing(radius, opacity) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(Math.max(0.001, radius - 0.06), radius, 96),
    makeBasicGlow({ opacity })
  );
  ring.rotation.x = -Math.PI / 2;
  return ring;
}

function createThresholdDriftGeometry({ count = 54, radius = 2.15, depth = 0.72 } = {}) {
  const positions = [];
  const seeds = [];
  const basePositions = [];

  for (let i = 0; i < count; i += 1) {
    const t = i / Math.max(1, count - 1);
    const angle = t * Math.PI * 2 * 2.35 + Math.sin(i * 12.9898) * 0.4;
    const ring = radius * (0.38 + (((i * 37) % 100) / 100) * 0.62);
    const y = (Math.sin(i * 1.73) * 0.5 + 0.5) * radius * 0.9 - radius * 0.35;
    const z = Math.sin(i * 2.17) * depth;

    positions.push(
      Math.cos(angle) * ring,
      y,
      z
    );

    basePositions.push(
      Math.cos(angle) * ring,
      y,
      z
    );

    seeds.push(t);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("seed", new THREE.Float32BufferAttribute(seeds, 1));
  geometry.userData.basePositions = new Float32Array(basePositions);

  return geometry;
}

function createPylon(width, depth, height, opacity) {
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(width * 0.62, width * 0.76, height * 0.055, 12),
    makeTempleMaterial({
      opacity: opacity * 0.72,
      emissiveIntensity: 0.045,
    })
  );
  base.position.y = height * 0.027;
  group.add(base);

  const lowerSleeve = new THREE.Mesh(
    new THREE.CylinderGeometry(width * 0.34, width * 0.42, height * 0.16, 12),
    makeTempleMaterial({
      opacity: opacity * 0.52,
      emissiveIntensity: 0.055,
    })
  );
  lowerSleeve.position.y = height * 0.105;
  group.add(lowerSleeve);

  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(width * 0.115, width * 0.19, height * 0.78, 12),
    makeTempleMaterial({
      opacity: opacity * 0.82,
      emissiveIntensity: 0.085,
    })
  );
  shaft.position.y = height * 0.47;
  group.add(shaft);

  const innerSpine = new THREE.Mesh(
    new THREE.CylinderGeometry(width * 0.026, width * 0.026, height * 0.64, 8),
    makeBasicGlow({
      opacity: opacity * 0.34,
    })
  );
  innerSpine.position.y = height * 0.47;
  group.add(innerSpine);

  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry(width * 0.18, width * 0.22, height * 0.055, 12),
    makeTempleMaterial({
      opacity: opacity * 0.42,
      emissiveIntensity: 0.055,
    })
  );
  crown.position.y = height * 0.855;
  group.add(crown);

  const tip = new THREE.Mesh(
    new THREE.ConeGeometry(width * 0.24, height * 0.105, 12),
    makeTempleMaterial({
      opacity: opacity * 0.58,
      emissiveIntensity: 0.08,
    })
  );
  tip.position.y = height * 0.935;
  group.add(tip);

  return group;
}

function createRearGate(preset) {
  const root = new THREE.Group();
  root.name = "TempleSanctuaryRearGate";

  const left = createPylon(
    preset.pillarWidth,
    preset.pillarDepth,
    preset.height,
    preset.opacity
  );
  left.position.set(-preset.width * 0.5, 0, preset.z);
  root.add(left);

  const right = createPylon(
    preset.pillarWidth,
    preset.pillarDepth,
    preset.height,
    preset.opacity
  );
  right.position.set(preset.width * 0.5, 0, preset.z);
  root.add(right);

  const lintel = new THREE.Mesh(
    new THREE.BoxGeometry(
      preset.width + preset.pillarWidth * 0.55,
      preset.lintelHeight,
      preset.pillarDepth * 0.82
    ),
    makeTempleMaterial({
      opacity: preset.opacity + 0.03,
      emissiveIntensity: 0.1,
    })
  );
  lintel.position.set(0, preset.height - preset.lintelHeight * 0.55, preset.z);
  root.add(lintel);

  const innerFrameLeft = new THREE.Mesh(
    new THREE.BoxGeometry(
      preset.pillarWidth * 0.46,
      preset.innerHeight,
      preset.pillarDepth * 0.25
    ),
    makeBasicGlow({ opacity: preset.opacity * 0.5 })
  );
  innerFrameLeft.position.set(
    -preset.innerWidth * 0.5,
    preset.innerHeight * 0.5,
    preset.z + 0.01
  );
  root.add(innerFrameLeft);

  const innerFrameRight = innerFrameLeft.clone();
  innerFrameRight.position.x = preset.innerWidth * 0.5;
  root.add(innerFrameRight);

  const innerLintel = new THREE.Mesh(
    new THREE.BoxGeometry(
      preset.innerWidth,
      preset.lintelHeight * 0.56,
      preset.pillarDepth * 0.18
    ),
    makeBasicGlow({ opacity: preset.opacity * 0.45 })
  );
  innerLintel.position.set(0, preset.innerHeight, preset.z + 0.01);
  root.add(innerLintel);

  return root;
}

function sanctuaryRand(min, max) {
  return min + Math.random() * (max - min);
}

function createSanctuaryDustLayer(THREE, spec, color = 0xffffff, texture = null) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(spec.count * 3);
  const basePositions = new Float32Array(spec.count * 3);
  const phases = new Float32Array(spec.count);

  for (let i = 0; i < spec.count; i += 1) {
    const i3 = i * 3;
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.sqrt(Math.random()) * spec.radius;
    const depth = sanctuaryRand(-spec.depth * 0.5, spec.depth * 0.5);
    const y = sanctuaryRand(spec.yMin, spec.yMax);

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius + depth;

    positions[i3 + 0] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    basePositions[i3 + 0] = x;
    basePositions[i3 + 1] = y;
    basePositions[i3 + 2] = z;

    phases[i] = Math.random() * Math.PI * 2;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.userData.basePositions = basePositions;
  geometry.userData.phases = phases;

  const material = new THREE.PointsMaterial({
    map: texture || undefined,
    alphaMap: texture || undefined,
    alphaTest: texture ? 0.002 : 0,
    color,
    size: spec.size,
    transparent: true,
    opacity: spec.opacity,
    depthWrite: false,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });

  const points = new THREE.Points(geometry, material);
  points.userData.spec = spec;
  return points;
}

function createSanctuaryMistLayer(THREE, spec, color = 0xffffff) {
  return createSanctuaryDustLayer(THREE, spec, color);
}

function createSanctuaryLocalPresenceLayer(THREE, spec, texture, color = 0xffffff) {
  return createSanctuaryDustLayer(THREE, spec, color, texture);
}

function updateSanctuaryDustLayer(points, elapsed, breathMix) {
  if (!points) return;

  const spec = points.userData.spec;
  const positions = points.geometry.attributes.position.array;
  const basePositions = points.geometry.userData.basePositions;
  const phases = points.geometry.userData.phases;

  for (let i = 0; i < phases.length; i += 1) {
    const i3 = i * 3;
    const phase = phases[i];

    positions[i3 + 0] =
      basePositions[i3 + 0] +
      Math.cos(elapsed * spec.drift + phase) * spec.lateralAmplitude;

    positions[i3 + 1] =
      basePositions[i3 + 1] +
      Math.sin(elapsed * spec.drift * 1.2 + phase) * spec.verticalAmplitude;

    positions[i3 + 2] =
      basePositions[i3 + 2] +
      Math.sin(elapsed * spec.drift * 0.85 + phase * 1.37) * spec.lateralAmplitude;
  }

  points.geometry.attributes.position.needsUpdate = true;
  points.rotation.y += spec.spin;
  points.material.opacity = spec.opacity * (0.82 + breathMix * 0.32);
}

export function createTempleSanctuary() {
  const preset = templeSanctuaryPreset;

  const root = new THREE.Group();
  root.name = "TempleSanctuaryRoot";

  const decorRoot = new THREE.Group();
  decorRoot.name = "TempleSanctuaryDecorRoot";
  root.add(decorRoot);

  const softPointTexture = createSoftPointTexture(96);

  const altarRoot = new THREE.Group();
  altarRoot.name = "TempleSanctuaryAltarRoot";
  altarRoot.position.set(
    preset.chamber.position.x,
    preset.chamber.position.y,
    preset.chamber.position.z
  );
  root.add(altarRoot);

  const altarDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(
      preset.altar.radius,
      preset.altar.radius * 1.08,
      preset.altar.height,
      64
    ),
    makeTempleMaterial({
      opacity: 0.11,
      emissiveIntensity: 0.06,
    })
  );
  altarDisc.position.set(0, preset.altar.height * 0.5, 0);
  altarRoot.add(altarDisc);

  preset.floorRings.radii.forEach((radius, index) => {
    const ring = createRing(radius, Math.max(0.03, preset.floorRings.opacity - index * 0.025));
    ring.position.y = 0.01 + index * 0.002;
    decorRoot.add(ring);
  });

  for (let i = 0; i < preset.processionalRows.count; i += 1) {
    const z = preset.processionalRows.zStart - i * preset.processionalRows.zGap;
    const height =
      preset.processionalRows.baseHeight -
      i * preset.processionalRows.heightFalloff;

    const left = createPylon(
      preset.processionalRows.width,
      preset.processionalRows.depth,
      height,
      preset.processionalRows.opacity
    );
    left.position.set(preset.processionalRows.leftX, 0, z);
    left.rotation.z = 0.012;
    decorRoot.add(left);

    const right = createPylon(
      preset.processionalRows.width,
      preset.processionalRows.depth,
      height,
      preset.processionalRows.opacity
    );
    right.position.set(preset.processionalRows.rightX, 0, z);
    right.rotation.z = -0.012;
    decorRoot.add(right);
  }

  if (preset.sideSentinels.enabled) {
    preset.sideSentinels.positions.forEach((item) => {
      const sentinel = createPylon(
        preset.sideSentinels.width,
        preset.sideSentinels.depth,
        item.h,
        preset.sideSentinels.opacity
      );
      sentinel.position.set(item.x, 0, item.z);
      sentinel.rotation.z = item.x < 0 ? 0.01 : -0.01;
      decorRoot.add(sentinel);
    });
  }

  const rearGate = createRearGate(preset.rearGate);
  decorRoot.add(rearGate);

  const chamberAnchor = new THREE.Group();
  chamberAnchor.name = "TempleSanctuaryChamberAnchor";
  chamberAnchor.position.set(
    0,
    preset.altar.height + preset.chamber.offsetY,
    0
  );
  altarRoot.add(chamberAnchor);

  const chamberLight = new THREE.PointLight(
    new THREE.Color("#b7ccff"),
    preset.chamber.lightIntensity,
    preset.chamber.lightDistance,
    2
  );
  chamberLight.position.set(0, preset.altar.height + 1.2, 0);
  root.add(chamberLight);

  const lightDirectionPreset = preset.lightDirection ?? {};
  const chamberFillTarget = new THREE.Object3D();
  chamberFillTarget.name = "TempleSanctuaryChamberFillTarget";
  chamberFillTarget.position.set(0, preset.altar.height + 1.0, 0.22);
  root.add(chamberFillTarget);

  const chamberFillLight = new THREE.DirectionalLight(
    new THREE.Color("#dbe8ff"),
    0.22
  );
  chamberFillLight.name = "TempleSanctuaryChamberFillLight";
  chamberFillLight.position.set(1.9, 4.95, 3.2);
  chamberFillLight.target = chamberFillTarget;
  root.add(chamberFillLight);

  const portalBacklight = new THREE.PointLight(
    new THREE.Color("#c8dbff"),
    0,
    10,
    2
  );
  portalBacklight.name = "TempleSanctuaryPortalBacklight";
  portalBacklight.position.set(0, preset.altar.height + 1.02, -2.4);
  root.add(portalBacklight);

  const callRing = new THREE.Mesh(
    new THREE.TorusGeometry(
      preset.callLight.ringRadius,
      0.018,
      12,
      120
    ),
    makeBasicGlow({ opacity: preset.callLight.ringOpacity })
  );
  callRing.position.set(0, preset.altar.height + 1.02, -0.38);
  decorRoot.add(callRing);

  const rearGlow = new THREE.Mesh(
    new THREE.CircleGeometry(preset.chamber.auraRadius, 64),
    makeBasicGlow({ opacity: preset.callLight.rearGlowOpacity })
  );
  rearGlow.position.set(0, preset.altar.height + 1.0, -0.52);
  decorRoot.add(rearGlow);

  const thresholdReveal = preset.thresholdReveal ?? {};
  const thresholdRoot = new THREE.Group();
  thresholdRoot.name = "TempleSanctuaryThresholdReveal";
  thresholdRoot.position.set(
    0,
    preset.altar.height + (thresholdReveal.y ?? 1.04),
    thresholdReveal.z ?? -0.92
  );
  thresholdRoot.visible = false;
  decorRoot.add(thresholdRoot);

  const thresholdRing = new THREE.Mesh(
    new THREE.TorusGeometry(
      thresholdReveal.radius ?? 1.58,
      thresholdReveal.tube ?? 0.012,
      10,
      144
    ),
    makeBasicGlow({
      color: thresholdReveal.color ?? "#9fbaff",
      opacity: 0,
    })
  );
  thresholdRing.name = "TempleSanctuaryThresholdRing";
  thresholdRoot.add(thresholdRing);

  const thresholdOuterRing = new THREE.Mesh(
    new THREE.TorusGeometry(
      (thresholdReveal.radius ?? 1.58) * 1.34,
      (thresholdReveal.tube ?? 0.012) * 0.62,
      8,
      144
    ),
    makeBasicGlow({
      color: thresholdReveal.color ?? "#9fbaff",
      opacity: 0,
    })
  );
  thresholdOuterRing.name = "TempleSanctuaryThresholdOuterRing";
  thresholdRoot.add(thresholdOuterRing);

  const thresholdVeil = new THREE.Mesh(
    new THREE.CircleGeometry((thresholdReveal.radius ?? 1.58) * 0.86, 72),
    makeBasicGlow({
      color: thresholdReveal.color ?? "#9fbaff",
      opacity: 0,
    })
  );
  thresholdVeil.name = "TempleSanctuaryThresholdVeil";
  thresholdVeil.position.z = -0.014;
  thresholdRoot.add(thresholdVeil);

  const thresholdDrift = preset.thresholdDrift ?? {};

  const thresholdDriftPoints = new THREE.Points(
    createThresholdDriftGeometry({
      count: thresholdDrift.count ?? 54,
      radius: thresholdDrift.radius ?? 2.15,
      depth: thresholdDrift.depth ?? 0.72,
    }),
    new THREE.PointsMaterial({
      map: softPointTexture,
      alphaMap: softPointTexture,
      alphaTest: softPointTexture ? 0.002 : 0,
      color: new THREE.Color(thresholdDrift.color ?? "#a9c4ff"),
      transparent: true,
      opacity: 0,
      size: thresholdDrift.size ?? 0.022,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    })
  );
  thresholdDriftPoints.name = "TempleSanctuaryThresholdDrift";
  thresholdDriftPoints.position.z = -0.08;
  thresholdRoot.add(thresholdDriftPoints);

  const chamberRoot = chamberAnchor;
  const spaceResponse = preset.spaceResponse ?? {};
  const chamberDissolve = preset.chamberDissolve ?? {};
  const atmospherePreset = preset.atmosphere;
  let atmosphere = null;

  if (atmospherePreset?.enabled) {
    const atmosphereRoot = new THREE.Group();
    atmosphereRoot.name = "sanctuaryAtmosphere";
    atmosphereRoot.position.set(0, atmospherePreset.anchorY ?? 1.45, 0);

    const foregroundDust = createSanctuaryDustLayer(
      THREE,
      atmospherePreset.foregroundDust
    );
    const midDust = createSanctuaryDustLayer(
      THREE,
      atmospherePreset.midDust
    );
    const backgroundDust = createSanctuaryDustLayer(
      THREE,
      atmospherePreset.backgroundDust
    );
    const mist = createSanctuaryMistLayer(
      THREE,
      atmospherePreset.mist,
      atmospherePreset.haze.color
    );
    const atmosphereDust = createSanctuaryDustLayer(
      THREE,
      {
        count: atmospherePreset.atmosphereDustCount ?? 168,
        radius: atmospherePreset.atmosphereDustSpread ?? 2.45,
        depth: (atmospherePreset.atmosphereDustSpread ?? 2.45) * 0.78,
        yMin: 0.08,
        yMax: 2.15,
        size: 0.015,
        opacity: atmospherePreset.atmosphereDustOpacity ?? 0.058,
        drift: atmospherePreset.atmosphereDustDrift ?? 0.09,
        spin: 0.00028,
        verticalAmplitude: atmospherePreset.atmosphereDustRise ?? 0.016,
        lateralAmplitude: 0.012,
      },
      atmospherePreset.haze.color,
      softPointTexture
    );

    atmosphereRoot.add(backgroundDust);
    atmosphereRoot.add(midDust);
    atmosphereRoot.add(foregroundDust);
    atmosphereRoot.add(mist);
    atmosphereRoot.add(atmosphereDust);

    root.add(atmosphereRoot);

    atmosphere = {
      root: atmosphereRoot,
      foregroundDust,
      midDust,
      backgroundDust,
      mist,
      atmosphereDust,
    };
  }

  const localPresencePreset = preset.localPresence ?? {};
  let localPresence = null;

  if (localPresencePreset?.enabled) {
    const localPresenceRoot = new THREE.Group();
    localPresenceRoot.name = "TempleSanctuaryLocalPresence";
    localPresenceRoot.position.set(
      0,
      preset.altar.height + preset.chamber.offsetY,
      0
    );
    altarRoot.add(localPresenceRoot);

    const localPresenceNear = createSanctuaryLocalPresenceLayer(
      THREE,
      {
        count: localPresencePreset.nearCount ?? 84,
        radius: localPresencePreset.nearRadius ?? 1.28,
        depth: localPresencePreset.nearDepth ?? 1.1,
        yMin: localPresencePreset.nearYMin ?? -0.12,
        yMax: localPresencePreset.nearYMax ?? 1.52,
        size: localPresencePreset.nearSize ?? 0.016,
        opacity: localPresencePreset.nearOpacity ?? 0.07,
        drift: localPresencePreset.drift ?? 0.11,
        spin: localPresencePreset.spin ?? 0.0003,
        verticalAmplitude: 0.014,
        lateralAmplitude: 0.011,
      },
      softPointTexture,
      localPresencePreset.color ?? "#dce8ff"
    );

    const localPresenceFar = createSanctuaryLocalPresenceLayer(
      THREE,
      {
        count: localPresencePreset.farCount ?? 124,
        radius: localPresencePreset.farRadius ?? 2.35,
        depth: localPresencePreset.farDepth ?? 1.9,
        yMin: localPresencePreset.farYMin ?? -0.22,
        yMax: localPresencePreset.farYMax ?? 1.95,
        size: localPresencePreset.farSize ?? 0.013,
        opacity: localPresencePreset.farOpacity ?? 0.042,
        drift: localPresencePreset.drift ?? 0.11,
        spin: (localPresencePreset.spin ?? 0.0003) * 0.7,
        verticalAmplitude: 0.018,
        lateralAmplitude: 0.013,
      },
      softPointTexture,
      localPresencePreset.color ?? "#dce8ff"
    );

    const localPresenceHaze = createSanctuaryLocalPresenceLayer(
      THREE,
      {
        count: localPresencePreset.hazeCount ?? 72,
        radius: localPresencePreset.hazeRadius ?? 3.15,
        depth: localPresencePreset.hazeDepth ?? 2.35,
        yMin: localPresencePreset.hazeYMin ?? -0.18,
        yMax: localPresencePreset.hazeYMax ?? 2.18,
        size: localPresencePreset.hazeSize ?? 0.011,
        opacity: localPresencePreset.hazeOpacity ?? 0.026,
        drift: localPresencePreset.drift ?? 0.11,
        spin: (localPresencePreset.spin ?? 0.0003) * 0.55,
        verticalAmplitude: 0.014,
        lateralAmplitude: 0.016,
      },
      softPointTexture,
      localPresencePreset.color ?? "#dce8ff"
    );

    localPresenceRoot.add(localPresenceFar);
    localPresenceRoot.add(localPresenceHaze);
    localPresenceRoot.add(localPresenceNear);

    localPresence = {
      root: localPresenceRoot,
      near: localPresenceNear,
      far: localPresenceFar,
      haze: localPresenceHaze,
    };
  }

  // ---------------------------------------------
  // SPACE RESPONSE AMBIENT PARTICLES
  // ---------------------------------------------
  const ambientParticleCount = spaceResponse.ambientParticleCount ?? 180;
  const ambientPositions = new Float32Array(ambientParticleCount * 3);
  const ambientBasePositions = new Float32Array(ambientParticleCount * 3);
  const ambientPhase = new Float32Array(ambientParticleCount);
  const ambientLift = new Float32Array(ambientParticleCount);

  for (let i = 0; i < ambientParticleCount; i += 1) {
    const r = THREE.MathUtils.lerp(
      spaceResponse.ambientParticleRadiusMin ?? 1.4,
      spaceResponse.ambientParticleRadiusMax ?? 5.6,
      Math.random()
    );
    const a = Math.random() * Math.PI * 2;
    const y = THREE.MathUtils.lerp(
      spaceResponse.ambientParticleYMin ?? 0.3,
      spaceResponse.ambientParticleYMax ?? 3.2,
      Math.random()
    );

    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;

    ambientBasePositions[i * 3 + 0] = x;
    ambientBasePositions[i * 3 + 1] = y;
    ambientBasePositions[i * 3 + 2] = z;

    ambientPositions[i * 3 + 0] = x;
    ambientPositions[i * 3 + 1] = y;
    ambientPositions[i * 3 + 2] = z;

    ambientPhase[i] = Math.random() * Math.PI * 2;
    ambientLift[i] = 0.3 + Math.random() * 0.7;
  }

  const ambientGeometry = new THREE.BufferGeometry();
  ambientGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(ambientPositions, 3)
  );

  const ambientMaterial = new THREE.PointsMaterial({
    map: softPointTexture,
    alphaMap: softPointTexture,
    alphaTest: softPointTexture ? 0.002 : 0,
    color: new THREE.Color(spaceResponse.ambientParticleColor ?? "#d7e7ff"),
    size: spaceResponse.ambientParticleSize ?? 0.028,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    toneMapped: false,
  });

  const ambientPoints = new THREE.Points(ambientGeometry, ambientMaterial);
  ambientPoints.name = "TempleSanctuaryAmbientResponsePoints";
  ambientPoints.visible = false;
  decorRoot.add(ambientPoints);

  // ---------------------------------------------
  // CHAMBER DISSOLVE PREP
  // ---------------------------------------------
  const chamberVisualEntries = [];
  const chamberVisualEntryKeys = new Set();

  const collectChamberVisualEntries = () => {
    chamberRoot.traverse((child) => {
      if (!child) return;
      if (!(child.isMesh || child.isLine || child.isPoints) || !child.material) {
        return;
      }

      const registerMaterial = (material) => {
        if (!material) return;

        const key = `${child.uuid}:${material.uuid}`;
        if (chamberVisualEntryKeys.has(key)) return;

        chamberVisualEntryKeys.add(key);
        material.transparent = true;

        chamberVisualEntries.push({
          child,
          material,
          baseOpacity: material.opacity ?? 1,
        });
      };

      if (Array.isArray(child.material)) {
        child.material.forEach(registerMaterial);
      } else {
        registerMaterial(child.material);
      }
    });
  };

  const dissolveParticleCount = chamberDissolve.particleCount ?? 240;
  const dissolvePositions = new Float32Array(dissolveParticleCount * 3);
  const dissolveBasePositions = new Float32Array(dissolveParticleCount * 3);
  const dissolveDirections = new Float32Array(dissolveParticleCount * 3);
  const dissolveSpeeds = new Float32Array(dissolveParticleCount);
  const dissolveLift = new Float32Array(dissolveParticleCount);
  const dissolvePhase = new Float32Array(dissolveParticleCount);

  for (let i = 0; i < dissolveParticleCount; i += 1) {
    const theta = Math.random() * Math.PI * 2;
    const v = Math.random() * 2 - 1;
    const phi = Math.acos(v);

    const radius = THREE.MathUtils.lerp(
      chamberDissolve.particleRadiusMin ?? 0.22,
      chamberDissolve.particleRadiusMax ?? 0.72,
      Math.random()
    );

    const x = Math.sin(phi) * Math.cos(theta) * radius;
    const y = Math.cos(phi) * radius;
    const z = Math.sin(phi) * Math.sin(theta) * radius;

    dissolveBasePositions[i * 3 + 0] = x;
    dissolveBasePositions[i * 3 + 1] = y;
    dissolveBasePositions[i * 3 + 2] = z;

    dissolvePositions[i * 3 + 0] = x;
    dissolvePositions[i * 3 + 1] = y;
    dissolvePositions[i * 3 + 2] = z;

    const dir = new THREE.Vector3(
      x + (Math.random() - 0.5) * 0.25,
      y + (Math.random() - 0.5) * 0.15,
      z + (Math.random() - 0.5) * 0.25
    ).normalize();

    dissolveDirections[i * 3 + 0] = dir.x;
    dissolveDirections[i * 3 + 1] = dir.y;
    dissolveDirections[i * 3 + 2] = dir.z;

    dissolveSpeeds[i] = 0.28 + Math.random() * 0.44;
    dissolveLift[i] = 0.22 + Math.random() * 0.42;
    dissolvePhase[i] = Math.random() * Math.PI * 2;
  }

  const dissolveGeometry = new THREE.BufferGeometry();
  dissolveGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(dissolvePositions, 3)
  );

  const dissolveMaterial = new THREE.PointsMaterial({
    map: softPointTexture,
    alphaMap: softPointTexture,
    alphaTest: softPointTexture ? 0.002 : 0,
    color: new THREE.Color(chamberDissolve.particleColor ?? "#f2f6ff"),
    size: chamberDissolve.particleSize ?? 0.03,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    toneMapped: false,
  });

  const chamberDissolvePoints = new THREE.Points(dissolveGeometry, dissolveMaterial);
  chamberDissolvePoints.name = "TempleSanctuaryChamberDissolvePoints";
  chamberDissolvePoints.position.copy(chamberRoot.position);
  chamberDissolvePoints.visible = false;
  decorRoot.add(chamberDissolvePoints);

  // SCENE01-PORTAL-09D.2 - chamber release particle field.
  // This is independent from the mesh fade, so the chamber visibly releases into space.
  const chamberReleaseParticleCount = 520;
  const chamberReleasePositions = new Float32Array(chamberReleaseParticleCount * 3);
  const chamberReleaseBasePositions = new Float32Array(chamberReleaseParticleCount * 3);
  const chamberReleaseVelocities = new Float32Array(chamberReleaseParticleCount * 3);
  const chamberReleasePhases = new Float32Array(chamberReleaseParticleCount);

  for (let i = 0; i < chamberReleaseParticleCount; i += 1) {
    const i3 = i * 3;

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 0.32 + Math.random() * 0.58;

    const x = Math.sin(phi) * Math.cos(theta) * r;
    const y = Math.cos(phi) * r * 0.82 + 0.04;
    const z = Math.sin(phi) * Math.sin(theta) * r;

    const outward = new THREE.Vector3(x, y * 0.78, z).normalize();
    const velocityScale = 0.85 + Math.random() * 1.45;

    chamberReleaseBasePositions[i3 + 0] = x;
    chamberReleaseBasePositions[i3 + 1] = y;
    chamberReleaseBasePositions[i3 + 2] = z;

    chamberReleasePositions[i3 + 0] = x;
    chamberReleasePositions[i3 + 1] = y;
    chamberReleasePositions[i3 + 2] = z;

    chamberReleaseVelocities[i3 + 0] = outward.x * velocityScale;
    chamberReleaseVelocities[i3 + 1] = (outward.y * 0.55 + 0.42) * velocityScale;
    chamberReleaseVelocities[i3 + 2] = outward.z * velocityScale;

    chamberReleasePhases[i] = Math.random() * Math.PI * 2;
  }

  const chamberReleaseGeometry = new THREE.BufferGeometry();
  chamberReleaseGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(chamberReleasePositions, 3)
  );

  const chamberReleaseMaterial = new THREE.PointsMaterial({
    map: softPointTexture,
    alphaMap: softPointTexture,
    alphaTest: softPointTexture ? 0.001 : 0,
    color: new THREE.Color("#f7fbff"),
    size: 0.082,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    toneMapped: false,
  });

  const chamberReleaseParticles = new THREE.Points(
    chamberReleaseGeometry,
    chamberReleaseMaterial
  );
  chamberReleaseParticles.name = "TempleSanctuaryChamberReleaseParticles";
  chamberReleaseParticles.position.copy(chamberRoot.position);
  chamberReleaseParticles.visible = false;
  chamberReleaseParticles.renderOrder = 80;
  decorRoot.add(chamberReleaseParticles);

  const transitionPortal = preset.transitionPortal ?? {};

  const transitionPortalRoot = new THREE.Group();
  transitionPortalRoot.name = "TempleSanctuaryTransitionPortal";
  transitionPortalRoot.position.set(
    0,
    preset.altar.height + (transitionPortal.y ?? 1.08),
    transitionPortal.z ?? -2.02
  );
  transitionPortalRoot.visible = false;
  decorRoot.add(transitionPortalRoot);

  const transitionPortalCore = new THREE.Mesh(
    new THREE.CircleGeometry(transitionPortal.innerRadius ?? 0.62, 96),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(transitionPortal.coreColor ?? "#040914"),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      toneMapped: false,
    })
  );
  transitionPortalCore.name = "TempleSanctuaryTransitionPortalCore";
  transitionPortalCore.position.z = -0.04;
  transitionPortalRoot.add(transitionPortalCore);

  const transitionPortalRing = new THREE.Mesh(
    new THREE.TorusGeometry(
      transitionPortal.radius ?? 1.22,
      transitionPortal.tube ?? 0.014,
      12,
      160
    ),
    makeAxialGlowMaterial({
      color: transitionPortal.color ?? "#bcd6ff",
      opacity: 0,
    })
  );
  transitionPortalRing.name = "TempleSanctuaryTransitionPortalRing";
  transitionPortalRoot.add(transitionPortalRing);

  const transitionPortalInnerRing = new THREE.Mesh(
    new THREE.TorusGeometry(
      transitionPortal.innerRadius ?? 0.62,
      (transitionPortal.tube ?? 0.014) * 0.62,
      10,
      144
    ),
    makeAxialGlowMaterial({
      color: transitionPortal.color ?? "#bcd6ff",
      opacity: 0,
    })
  );
  transitionPortalInnerRing.name = "TempleSanctuaryTransitionPortalInnerRing";
  transitionPortalInnerRing.position.z = -0.02;
  transitionPortalRoot.add(transitionPortalInnerRing);

  const transitionPortalLight = new THREE.PointLight(
    new THREE.Color("#bcd6ff"),
    0,
    4.8,
    1.65
  );
  transitionPortalLight.name = "TempleSanctuaryTransitionPortalLivingLight";
  transitionPortalLight.position.set(0, 0, 0.28);
  transitionPortalRoot.add(transitionPortalLight);

  // SCENE01-THRESHOLD-10A - Passage Aperture / Depth Gate.
  // A local portal-depth structure. No sky, room state, XRRoot, or global environment changes.
  const passageRoot = new THREE.Group();
  passageRoot.name = "TempleSanctuaryPassageAperture";
  passageRoot.visible = false;
  passageRoot.position.set(0, 0, -0.18);
  transitionPortalRoot.add(passageRoot);

  const passageCoreMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color("#02050b"),
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    toneMapped: false,
  });

  const passageCore = new THREE.Mesh(
    new THREE.CircleGeometry(0.56, 96),
    passageCoreMaterial
  );
  passageCore.name = "TempleSanctuaryPassageApertureCore";
  passageCore.position.z = -0.18;
  passageCore.renderOrder = 42;
  passageRoot.add(passageCore);

  const passageDepthRings = [];
  const passageDepthRingSpecs = [
    { radius: 0.52, z: -0.22, tube: 0.006, opacity: 0.22, speed: 0.075 },
    { radius: 0.72, z: -0.48, tube: 0.005, opacity: 0.16, speed: -0.052 },
    { radius: 0.94, z: -0.82, tube: 0.004, opacity: 0.11, speed: 0.034 },
  ];

  passageDepthRingSpecs.forEach((spec, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(spec.radius, spec.tube, 8, 128),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(index === 0 ? "#dceaff" : "#8fb4ff"),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      })
    );

    ring.name = `TempleSanctuaryPassageDepthRing_${index}`;
    ring.position.z = spec.z;
    ring.renderOrder = 43 + index;
    passageRoot.add(ring);

    passageDepthRings.push({ ring, ...spec });
  });

  const passageParticleCount = 180;
  const passageParticlePositions = new Float32Array(passageParticleCount * 3);
  const passageParticleBasePositions = new Float32Array(passageParticleCount * 3);
  const passageParticlePhases = new Float32Array(passageParticleCount);

  for (let i = 0; i < passageParticleCount; i += 1) {
    const i3 = i * 3;
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.18 + Math.random() * 1.05;
    const depth = -0.15 - Math.random() * 1.65;

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.78;
    const z = depth;

    passageParticleBasePositions[i3 + 0] = x;
    passageParticleBasePositions[i3 + 1] = y;
    passageParticleBasePositions[i3 + 2] = z;

    passageParticlePositions[i3 + 0] = x;
    passageParticlePositions[i3 + 1] = y;
    passageParticlePositions[i3 + 2] = z;

    passageParticlePhases[i] = Math.random() * Math.PI * 2;
  }

  const passageParticleGeometry = new THREE.BufferGeometry();
  passageParticleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(passageParticlePositions, 3)
  );

  const passageParticleMaterial = new THREE.PointsMaterial({
    map: softPointTexture,
    alphaMap: softPointTexture,
    alphaTest: softPointTexture ? 0.001 : 0,
    color: new THREE.Color("#dceaff"),
    size: 0.048,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    toneMapped: false,
  });

  const passageParticles = new THREE.Points(
    passageParticleGeometry,
    passageParticleMaterial
  );
  passageParticles.name = "TempleSanctuaryPassagePullParticles";
  passageParticles.visible = false;
  passageParticles.renderOrder = 84;
  passageRoot.add(passageParticles);

  // SCENE01-THRESHOLD-10B - Pull Field / Spatial Invitation.
  // A restrained directional field in front of the portal. It suggests passage,
  // without teleporting or changing room state.
  const thresholdPullFieldCount = 260;
  const thresholdPullPositions = new Float32Array(thresholdPullFieldCount * 3);
  const thresholdPullBasePositions = new Float32Array(thresholdPullFieldCount * 3);
  const thresholdPullPhases = new Float32Array(thresholdPullFieldCount);
  const thresholdPullSeeds = new Float32Array(thresholdPullFieldCount);

  for (let i = 0; i < thresholdPullFieldCount; i += 1) {
    const i3 = i * 3;
    const lane = Math.random();
    const angle = Math.random() * Math.PI * 2;

    // Wider near the viewer, narrower toward the aperture.
    const z = THREE.MathUtils.lerp(0.52, -1.95, lane);
    const radius = THREE.MathUtils.lerp(1.38, 0.28, lane) * (0.45 + Math.random() * 0.7);

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.62;

    thresholdPullBasePositions[i3 + 0] = x;
    thresholdPullBasePositions[i3 + 1] = y;
    thresholdPullBasePositions[i3 + 2] = z;

    thresholdPullPositions[i3 + 0] = x;
    thresholdPullPositions[i3 + 1] = y;
    thresholdPullPositions[i3 + 2] = z;

    thresholdPullPhases[i] = Math.random() * Math.PI * 2;
    thresholdPullSeeds[i] = lane;
  }

  const thresholdPullGeometry = new THREE.BufferGeometry();
  thresholdPullGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(thresholdPullPositions, 3)
  );

  const thresholdPullMaterial = new THREE.PointsMaterial({
    map: softPointTexture,
    alphaMap: softPointTexture,
    alphaTest: softPointTexture ? 0.001 : 0,
    color: new THREE.Color("#dceaff"),
    size: 0.06,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    toneMapped: false,
  });

  const thresholdPullField = new THREE.Points(
    thresholdPullGeometry,
    thresholdPullMaterial
  );
  thresholdPullField.name = "TempleSanctuaryThresholdPullField";
  thresholdPullField.visible = false;
  thresholdPullField.renderOrder = 86;
  transitionPortalRoot.add(thresholdPullField);

  // SCENE01-THRESHOLD-10C - Transition Trigger Readiness.
  // Visual/readiness zone only. No teleport, no room switch, no sky changes.
  const transitionReadinessRoot = new THREE.Group();
  transitionReadinessRoot.name = "TempleSanctuaryTransitionReadinessZone";
  transitionReadinessRoot.visible = false;
  decorRoot.add(transitionReadinessRoot);

  const transitionTriggerZ = (transitionPortal.z ?? -2.02) + 0.78;

  const transitionReadinessRing = new THREE.Mesh(
    new THREE.RingGeometry(0.74, 0.79, 128),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color("#bcd6ff"),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    })
  );
  transitionReadinessRing.name = "TempleSanctuaryTransitionReadinessRing";
  transitionReadinessRing.rotation.x = -Math.PI / 2;
  transitionReadinessRing.position.set(0, 0.045, transitionTriggerZ);
  transitionReadinessRing.scale.set(0.78, 1.32, 1);
  transitionReadinessRoot.add(transitionReadinessRing);

  const transitionReadinessInnerRing = new THREE.Mesh(
    new THREE.RingGeometry(0.36, 0.39, 96),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color("#edf6ff"),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    })
  );
  transitionReadinessInnerRing.name = "TempleSanctuaryTransitionReadinessInnerRing";
  transitionReadinessInnerRing.rotation.x = -Math.PI / 2;
  transitionReadinessInnerRing.position.set(0, 0.052, transitionTriggerZ);
  transitionReadinessInnerRing.scale.set(0.84, 1.18, 1);
  transitionReadinessRoot.add(transitionReadinessInnerRing);

  const transitionReadinessNeedles = new THREE.Group();
  transitionReadinessNeedles.name = "TempleSanctuaryTransitionReadinessNeedles";
  transitionReadinessNeedles.position.set(0, 0.062, transitionTriggerZ);
  transitionReadinessRoot.add(transitionReadinessNeedles);

  function createTransitionReadinessNeedle(angle, length = 0.22, width = 0.011) {
    const needle = new THREE.Mesh(
      new THREE.BoxGeometry(length, width, 0.01),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#e8f2ff"),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      })
    );

    const radius = 0.79;
    needle.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    needle.rotation.z = angle + Math.PI * 0.5;

    return needle;
  }

  transitionReadinessNeedles.add(
    createTransitionReadinessNeedle(0),
    createTransitionReadinessNeedle(Math.PI * 0.5, 0.16, 0.009),
    createTransitionReadinessNeedle(Math.PI, 0.22, 0.011),
    createTransitionReadinessNeedle(Math.PI * 1.5, 0.16, 0.009)
  );

  const transitionReadinessGlow = new THREE.PointLight(
    new THREE.Color("#9fbfff"),
    0,
    2.8,
    1.9
  );
  transitionReadinessGlow.name = "TempleSanctuaryTransitionReadinessGlow";
  transitionReadinessGlow.position.set(0, 0.36, transitionTriggerZ);
  transitionReadinessRoot.add(transitionReadinessGlow);

  // SCENE01-THRESHOLD-10D — First Passage Trigger / Soft Scene State Shift.
  // This is the first real "passage activated" state, but it does NOT teleport
  // and does NOT switch rooms yet.
  const firstPassageRoot = new THREE.Group();
  firstPassageRoot.name = "TempleSanctuaryFirstPassageState";
  firstPassageRoot.visible = false;
  firstPassageRoot.position.set(0, 0, -0.34);
  transitionPortalRoot.add(firstPassageRoot);

  const firstPassageTunnelRings = [];
  const firstPassageTunnelSpecs = [
    { radius: 0.44, z: -0.38, tube: 0.0048, opacity: 0.2, speed: 0.09 },
    { radius: 0.62, z: -0.78, tube: 0.0042, opacity: 0.16, speed: -0.074 },
    { radius: 0.84, z: -1.22, tube: 0.0038, opacity: 0.12, speed: 0.052 },
    { radius: 1.08, z: -1.74, tube: 0.0032, opacity: 0.08, speed: -0.036 },
  ];

  firstPassageTunnelSpecs.forEach((spec, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(spec.radius, spec.tube, 8, 132),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(index < 2 ? "#e9f3ff" : "#8fb4ff"),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      })
    );

    ring.name = `TempleSanctuaryFirstPassageTunnelRing_${index}`;
    ring.position.z = spec.z;
    ring.renderOrder = 88 + index;
    firstPassageRoot.add(ring);
    firstPassageTunnelRings.push({ ring, ...spec });
  });

  const firstPassageStreakCount = 220;
  const firstPassageStreakPositions = new Float32Array(firstPassageStreakCount * 3);
  const firstPassageStreakBasePositions = new Float32Array(firstPassageStreakCount * 3);
  const firstPassageStreakPhases = new Float32Array(firstPassageStreakCount);
  const firstPassageStreakSeeds = new Float32Array(firstPassageStreakCount);

  for (let i = 0; i < firstPassageStreakCount; i += 1) {
    const i3 = i * 3;
    const lane = Math.random();
    const angle = Math.random() * Math.PI * 2;

    const z = THREE.MathUtils.lerp(0.12, -2.6, lane);
    const radius = THREE.MathUtils.lerp(1.08, 0.16, lane) * (0.45 + Math.random() * 0.78);

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.68;

    firstPassageStreakBasePositions[i3 + 0] = x;
    firstPassageStreakBasePositions[i3 + 1] = y;
    firstPassageStreakBasePositions[i3 + 2] = z;

    firstPassageStreakPositions[i3 + 0] = x;
    firstPassageStreakPositions[i3 + 1] = y;
    firstPassageStreakPositions[i3 + 2] = z;

    firstPassageStreakPhases[i] = Math.random() * Math.PI * 2;
    firstPassageStreakSeeds[i] = lane;
  }

  const firstPassageStreakGeometry = new THREE.BufferGeometry();
  firstPassageStreakGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(firstPassageStreakPositions, 3)
  );

  const firstPassageStreakMaterial = new THREE.PointsMaterial({
    map: softPointTexture,
    alphaMap: softPointTexture,
    alphaTest: softPointTexture ? 0.001 : 0,
    color: new THREE.Color("#eaf3ff"),
    size: 0.058,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    toneMapped: false,
  });

  const firstPassageStreaks = new THREE.Points(
    firstPassageStreakGeometry,
    firstPassageStreakMaterial
  );
  firstPassageStreaks.name = "TempleSanctuaryFirstPassageStreaks";
  firstPassageStreaks.visible = false;
  firstPassageStreaks.renderOrder = 92;
  firstPassageRoot.add(firstPassageStreaks);

  const firstPassageLight = new THREE.PointLight(
    new THREE.Color("#dceaff"),
    0,
    5.8,
    1.55
  );
  firstPassageLight.name = "TempleSanctuaryFirstPassageLight";
  firstPassageLight.position.set(0, 0, -0.72);
  firstPassageRoot.add(firstPassageLight);

  // SCENE01-PORTAL-09D.2 - small luminous ticks make ring rotation readable.
  // Full circles rotate invisibly, so these restrained markers reveal mechanism motion.
  const transitionPortalMechanismMarkers = new THREE.Group();
  transitionPortalMechanismMarkers.name = "TempleSanctuaryTransitionPortalMechanismMarkers";
  transitionPortalMechanismMarkers.visible = false;
  transitionPortalRoot.add(transitionPortalMechanismMarkers);

  function createPortalMechanismTick(radius, angle, length = 0.16, width = 0.012) {
    const tick = new THREE.Mesh(
      new THREE.BoxGeometry(length, width, 0.01),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#e8f2ff"),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      })
    );

    tick.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      0.07
    );

    tick.rotation.z = angle + Math.PI * 0.5;
    return tick;
  }

  for (let i = 0; i < 8; i += 1) {
    const angle = (i / 8) * Math.PI * 2;
    transitionPortalMechanismMarkers.add(
      createPortalMechanismTick(transitionPortal.radius ?? 1.22, angle, 0.18, 0.012)
    );
  }

  for (let i = 0; i < 5; i += 1) {
    const angle = (i / 5) * Math.PI * 2 + Math.PI * 0.18;
    transitionPortalMechanismMarkers.add(
      createPortalMechanismTick(transitionPortal.innerRadius ?? 0.62, angle, 0.11, 0.01)
    );
  }

  const portalParticleCount =
    transitionPortal.portalParticleCount ?? transitionPortal.particleCount ?? 240;
  const portalParticlePositions = new Float32Array(portalParticleCount * 3);
  const portalParticleBasePositions = new Float32Array(portalParticleCount * 3);
  const portalParticlePhase = new Float32Array(portalParticleCount);

  for (let i = 0; i < portalParticleCount; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = THREE.MathUtils.lerp(
      transitionPortal.portalParticleRadiusMin ?? transitionPortal.innerRadius ?? 0.62,
      transitionPortal.portalParticleRadiusMax ?? transitionPortal.radius ?? 1.22,
      Math.random()
    );
    const depth =
      -Math.random() *
      (transitionPortal.portalParticleDepth ?? transitionPortal.particleDepth ?? 3.2);

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const z = depth;

    portalParticleBasePositions[i * 3 + 0] = x;
    portalParticleBasePositions[i * 3 + 1] = y;
    portalParticleBasePositions[i * 3 + 2] = z;

    portalParticlePositions[i * 3 + 0] = x;
    portalParticlePositions[i * 3 + 1] = y;
    portalParticlePositions[i * 3 + 2] = z;

    portalParticlePhase[i] = Math.random() * Math.PI * 2;
  }

  const transitionPortalParticleGeometry = new THREE.BufferGeometry();
  transitionPortalParticleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(portalParticlePositions, 3)
  );

  const transitionPortalParticleMaterial = new THREE.PointsMaterial({
    map: softPointTexture,
    alphaMap: softPointTexture,
    alphaTest: softPointTexture ? 0.002 : 0,
    color: new THREE.Color(transitionPortal.color ?? "#bcd6ff"),
    size:
      transitionPortal.portalParticleSize ??
      transitionPortal.particleSize ??
      0.022,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    toneMapped: false,
  });

  const transitionPortalParticles = new THREE.Points(
    transitionPortalParticleGeometry,
    transitionPortalParticleMaterial
  );
  transitionPortalParticles.name = "TempleSanctuaryTransitionPortalParticles";
  transitionPortalParticles.visible = false;
  transitionPortalRoot.add(transitionPortalParticles);

  let chamberReleaseAmount = 0;
  let transitionPortalOpenAmount = 0;

  let t = 0;
  let proximityLevel = 0;
  let handAttunementTarget = 0;
  let handAttunementLevel = 0;
  let ritualChargeLevel = 0;
  let ritualChargeComplete = false;
  let transformationCueTriggered = false;
  let transformationCueLevel = 0;
  let openingStateLevel = 0;
  let transitionReadinessLevel = 0;
  let transitionZoneLevel = 0;
  let firstPassageHoldTime = 0;
  let firstPassageTriggered = false;
  let firstPassageLevel = 0;

  const chamberWorldPosition = new THREE.Vector3();
  const cameraWorldPosition = new THREE.Vector3();
  const transitionZoneWorldPosition = new THREE.Vector3();
  const baseChamberScale = preset.chamber.scale ?? 1;

  root.userData.scene01Transition = {
    ready: false,
    inZone: false,
    canTransition: false,
    firstPassageTriggered: false,
    firstPassageLevel: 0,
    hold: 0,
    readiness: 0,
    proximity: 0,
    phase: "closed",
  };

  return {
    root,
    altarRoot,
    chamberAnchor,
    update(deltaSeconds = 0, camera = null) {
      t += deltaSeconds;

      const presence = preset.presence ?? {};
      let targetProximity = 0;

      if (
        presence.enabled !== false &&
        camera &&
        typeof camera.getWorldPosition === "function"
      ) {
        chamberAnchor.getWorldPosition(chamberWorldPosition);
        camera.getWorldPosition(cameraWorldPosition);

        const distance = cameraWorldPosition.distanceTo(chamberWorldPosition);
        const startDistance = presence.startDistance ?? 10.5;
        const fullDistance = presence.fullDistance ?? 2.8;
        const range = Math.max(0.001, startDistance - fullDistance);

        targetProximity =
          1 -
          THREE.MathUtils.clamp(
            (distance - fullDistance) / range,
            0,
            1
          );
      }

      proximityLevel = THREE.MathUtils.lerp(
        proximityLevel,
        targetProximity,
        presence.smoothing ?? 0.055
      );

      const attunement = preset.attunement ?? {};
      const attunementEnabled = attunement.enabled !== false;

      handAttunementLevel = THREE.MathUtils.lerp(
        handAttunementLevel,
        attunementEnabled ? handAttunementTarget : 0,
        attunement.smoothing ?? 0.075
      );

      const ritualCharge = preset.ritualCharge ?? {};
      const ritualChargeEnabled = ritualCharge.enabled !== false;

      const canCharge =
        ritualChargeEnabled &&
        handAttunementLevel >= (ritualCharge.handThreshold ?? 0.62) &&
        proximityLevel >= (ritualCharge.proximityThreshold ?? 0.18);

      if (canCharge) {
        ritualChargeLevel = THREE.MathUtils.clamp(
          ritualChargeLevel + deltaSeconds * (ritualCharge.chargeRate ?? 0.34),
          0,
          1
        );
      } else {
        ritualChargeLevel = THREE.MathUtils.clamp(
          ritualChargeLevel - deltaSeconds * (ritualCharge.decayRate ?? 0.22),
          0,
          1
        );
      }

      ritualChargeComplete =
        ritualChargeLevel >= (ritualCharge.completeThreshold ?? 0.96);

      const transformationCue = preset.transformationCue ?? {};
      const transformationCueEnabled = transformationCue.enabled !== false;

      if (transformationCueEnabled && ritualChargeComplete) {
        transformationCueTriggered = true;
      }

      const transformationTarget =
        transformationCueEnabled && transformationCueTriggered ? 1 : 0;

      transformationCueLevel = THREE.MathUtils.lerp(
        transformationCueLevel,
        transformationTarget,
        transformationCue.smoothing ?? 0.035
      );

      const openingState = preset.openingState ?? {};
      const openingStateEnabled = openingState.enabled !== false;

      openingStateLevel = THREE.MathUtils.lerp(
        openingStateLevel,
        openingStateEnabled && transformationCueTriggered ? 1 : 0,
        openingState.smoothing ?? 0.028
      );

      const chargeInfluence =
        ritualChargeLevel *
        (transformationCueTriggered
          ? openingState.chargeDampening ?? 0.52
          : 1);

      const breathSpeed = presence.breathSpeed ?? 1.15;
      const baseBreath = presence.breathAmplitude ?? 0.032;
      const proximityPulseBoost = presence.proximityPulseBoost ?? 0.055;
      const attunementPulseBoost = attunement.pulseBoost ?? 0.052;
      const ritualPulseBoost = ritualCharge.pulseBoost ?? 0.075;
      const transformationPulseBoost = transformationCue.pulseBoost ?? 0.12;

      const pulseWave = Math.sin(t * breathSpeed);
      const breath =
        1 +
        pulseWave *
          (
            baseBreath * 0.45 +
            proximityLevel * proximityPulseBoost +
            handAttunementLevel * attunementPulseBoost +
            chargeInfluence * ritualPulseBoost +
            transformationCueLevel * transformationPulseBoost +
            openingStateLevel * (openingState.pulseFloor ?? 0.028)
          );

      const proximityScale =
        baseChamberScale +
        proximityLevel * (presence.scaleBoost ?? 0.085) +
        handAttunementLevel * (attunement.scaleBoost ?? 0.038) +
        chargeInfluence * (ritualCharge.scaleBoost ?? 0.045) +
        transformationCueLevel * (transformationCue.scaleBoost ?? 0.075);

      const dissolveScaleMultiplier = THREE.MathUtils.lerp(
        1,
        chamberDissolve.rootScaleTo ?? 0.66,
        Math.pow(chamberReleaseAmount, 1.65)
      );

      chamberAnchor.scale.setScalar(
        proximityScale * breath * dissolveScaleMultiplier
      );

      const spin =
        preset.chamber.spinSpeed +
        proximityLevel * (presence.spinBoost ?? 0.14) +
        handAttunementLevel * (attunement.spinBoost ?? 0.055) +
        chargeInfluence * (ritualCharge.spinBoost ?? 0.09) +
        transformationCueLevel * (transformationCue.spinBoost ?? 0.16);

      chamberAnchor.rotation.y += deltaSeconds * spin;

      const threshold = preset.thresholdReveal ?? {};
      const thresholdEnabled = threshold.enabled !== false;
      const thresholdAmount = thresholdEnabled ? transformationCueLevel : 0;
      const lightDirection = preset.lightDirection ?? {};
      const centralBreathSpeed =
        lightDirection.centralLightBreathSpeed ?? atmospherePreset.chamberBreathSpeed ?? 0.72;
      const centralBreath = 0.5 + 0.5 * Math.sin(t * centralBreathSpeed);
      const centralBaseLight = THREE.MathUtils.lerp(
        lightDirection.centralLightIntensityMin ?? atmospherePreset.chamberBreathLightMin ?? 1.92,
        lightDirection.centralLightIntensityMax ?? atmospherePreset.chamberBreathLightMax ?? 2.82,
        centralBreath
      );
      const readabilityBoost =
        1 +
        openingStateLevel * (lightDirection.chamberReadabilityBoost ?? 0.18) +
        thresholdAmount * (lightDirection.postOpenLightBoost ?? 0.24);

      chamberLight.intensity =
        centralBaseLight * readabilityBoost +
        proximityLevel * 0.18 +
        handAttunementLevel * 0.24 +
        chargeInfluence * 0.32 +
        transformationCueLevel * 0.58 +
        openingStateLevel * (atmospherePreset.chamberAmbientLift ?? 0.085) +
        openingStateLevel * (atmospherePreset.portalAreaLift ?? 0.11) * 0.5 +
        thresholdAmount * (atmospherePreset.thresholdLightBoost ?? 0.18);

      chamberFillLight.intensity =
        centralBaseLight *
        0.12 *
        readabilityBoost *
        (0.92 + openingStateLevel * 0.08);
      chamberFillTarget.position.set(
        0,
        preset.altar.height + 1.0 + openingStateLevel * 0.06,
        0.16 + thresholdAmount * 0.18
      );

      portalBacklight.intensity =
        thresholdAmount *
        (lightDirection.portalBacklightIntensity ?? 0.42) *
        (0.78 + centralBreath * 0.22);
      portalBacklight.position.z = -2.4 - thresholdAmount * 0.12;

      const cueWave = 0.72 + Math.max(0, pulseWave) * 0.28;

      callRing.material.opacity =
        Math.max(0, preset.callLight.ringOpacity) +
        transformationCueLevel *
          (transformationCue.callRingOpacity ?? 0.13) *
          cueWave;

      rearGlow.material.opacity =
        Math.max(
          preset.callLight.rearGlowOpacity,
          thresholdAmount * (lightDirection.floorBounceOpacity ?? 0.032)
        ) +
        transformationCueLevel * (transformationCue.rearGlowOpacity ?? 0.11) * cueWave;

      thresholdRoot.visible = thresholdAmount > 0.012;

      if (thresholdRoot.visible) {
        thresholdRoot.rotation.z +=
          deltaSeconds *
          (threshold.rotationSpeed ?? 0.035) *
          (0.35 + thresholdAmount);

        thresholdRoot.scale.setScalar(
          1 + thresholdAmount * (threshold.scaleBoost ?? 0.085)
        );

        thresholdRing.rotation.z += deltaSeconds * 0.018 * thresholdAmount;
        thresholdOuterRing.rotation.z -= deltaSeconds * 0.012 * thresholdAmount;
        thresholdVeil.rotation.z += deltaSeconds * 0.009 * thresholdAmount;

        thresholdRing.scale.setScalar(1 + thresholdAmount * 0.014);
        thresholdOuterRing.scale.setScalar(1 + thresholdAmount * 0.018);
        thresholdVeil.scale.setScalar(1 + thresholdAmount * 0.012);
        thresholdVeil.position.z = -0.014 - thresholdAmount * 0.012;
      }

      thresholdRing.material.opacity =
        Math.max(
          thresholdAmount * (threshold.ringOpacity ?? 0.105),
          openingStateLevel * (openingState.ringFloor ?? 0.045)
        ) * cueWave;

      thresholdOuterRing.material.opacity =
        Math.max(
          thresholdAmount * (threshold.outerRingOpacity ?? 0.045),
          openingStateLevel * (openingState.outerRingFloor ?? 0.022)
        ) * cueWave;

      thresholdVeil.material.opacity =
        Math.max(
          thresholdAmount * (threshold.veilOpacity ?? 0.038),
          openingStateLevel * (openingState.veilFloor ?? 0.018)
        ) * cueWave;

      const drift = preset.thresholdDrift ?? {};
      const driftEnabled = drift.enabled !== false;
      const driftAmount = driftEnabled ? transformationCueLevel : 0;

      thresholdDriftPoints.visible = driftAmount > 0.018;

      if (thresholdDriftPoints.visible) {
        thresholdDriftPoints.rotation.z +=
          deltaSeconds * (drift.rotationSpeed ?? 0.018) * (0.3 + driftAmount);

        thresholdDriftPoints.position.y =
          Math.sin(t * (drift.liftSpeed ?? 0.045)) *
          (drift.breathing ?? 0.035);

        const driftAttr = thresholdDriftPoints.geometry.getAttribute("position");
        const driftBase = thresholdDriftPoints.geometry.userData.basePositions;
        const driftSeed = thresholdDriftPoints.geometry.getAttribute("seed");
        const driftPull = thresholdAmount * (transitionPortal.portalPullStrength ?? 0.26);

        if (driftAttr && driftBase && driftSeed) {
          for (let i = 0; i < driftSeed.count; i += 1) {
            const ix = i * 3 + 0;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;
            const phase = driftSeed.array[i] * Math.PI * 2;
            const pull = driftPull * (0.42 + driftSeed.array[i] * 0.22);
            const swirl = 0.014 + thresholdAmount * 0.012;

            driftAttr.array[ix] =
              driftBase[ix] * (1 - pull) +
              Math.cos(t * 0.56 + phase) * swirl * 0.75;

            driftAttr.array[iy] =
              driftBase[iy] * (1 - pull * 0.14) +
              Math.sin(t * 0.68 + phase) * swirl * 0.9;

            driftAttr.array[iz] =
              driftBase[iz] -
              thresholdAmount * 0.12 -
              pull * 0.2 +
              Math.sin(t * 0.46 + phase) * swirl * 0.7;
          }

          driftAttr.needsUpdate = true;
        }

        thresholdDriftPoints.material.opacity =
          Math.max(
            driftAmount * (drift.opacity ?? 0.16),
            openingStateLevel * (openingState.driftFloor ?? 0.075)
          ) * cueWave;
      } else {
        thresholdDriftPoints.material.opacity = 0;
      }

      const responseBreath =
        1 +
        Math.sin(t * (spaceResponse.breathSpeed ?? 0.7)) *
          (spaceResponse.breathAmplitude ?? 0.08);

      if (atmosphere && atmospherePreset?.enabled) {
        const breathMix =
          0.5 + 0.5 * Math.sin(t * (atmospherePreset.atmosphereBreathSpeed ?? atmospherePreset.breath.speed));
        const hazeBoost =
          1 + openingStateLevel * Math.max(0, atmospherePreset.localHazePostOpenBoost ?? 0);

        updateSanctuaryDustLayer(atmosphere.foregroundDust, t, breathMix);
        updateSanctuaryDustLayer(atmosphere.midDust, t * 0.9, breathMix);
        updateSanctuaryDustLayer(atmosphere.backgroundDust, t * 0.75, breathMix);
        updateSanctuaryDustLayer(atmosphere.mist, t * 1.05, breathMix * 1.1);

        atmosphere.atmosphereDust.material.opacity =
          (atmospherePreset.atmosphereDustOpacity ?? 0.058) *
          (0.72 + breathMix * 0.28) *
          hazeBoost;

        atmosphere.atmosphereDust.material.size =
          (atmospherePreset.atmosphereDustCount ?? 168) > 0
            ? 0.015 * (0.94 + breathMix * 0.08)
            : 0.015;

        atmosphere.root.rotation.y += 0.00018;
      }

      if (localPresence && localPresencePreset?.enabled) {
        const openPresence = THREE.MathUtils.smoothstep(
          openingStateLevel,
          localPresencePreset.startAtOpen ?? 0.1,
          1
        );
        const presenceBase = THREE.MathUtils.clamp(
          proximityLevel * 0.5 +
            handAttunementLevel * 0.28 +
            openingStateLevel * 0.45,
          0,
          1
        );
        const presenceBoost =
          1 +
          openingStateLevel * 0.2 +
          transformationCueLevel * 0.08 +
          openPresence * 0.12;
        const presenceBreath =
          0.5 + 0.5 * Math.sin(t * (localPresencePreset.breathSpeed ?? 0.55));

        localPresence.root.visible = presenceBase > 0.01 || openPresence > 0.01;

        updateSanctuaryDustLayer(
          localPresence.near,
          t * 0.98,
          presenceBase * presenceBoost * (0.84 + presenceBreath * 0.16)
        );
        updateSanctuaryDustLayer(
          localPresence.far,
          t * 0.84,
          presenceBase * presenceBoost * (0.8 + presenceBreath * 0.2)
        );
        updateSanctuaryDustLayer(
          localPresence.haze,
          t * 0.78,
          presenceBase * presenceBoost * (0.74 + presenceBreath * 0.26)
        );

        localPresence.near.material.opacity =
          (localPresencePreset.nearOpacity ?? 0.07) *
          presenceBase *
          presenceBoost *
          (0.82 + presenceBreath * 0.3);

        localPresence.far.material.opacity =
          (localPresencePreset.farOpacity ?? 0.042) *
          presenceBase *
          presenceBoost *
          (0.8 + presenceBreath * 0.26);

        localPresence.haze.material.opacity =
          (localPresencePreset.hazeOpacity ?? 0.026) *
          Math.max(presenceBase, openPresence * 0.85) *
          presenceBoost *
          (0.68 + presenceBreath * 0.32);

        const presenceScale =
          1 +
          presenceBase * (localPresencePreset.scaleAmp ?? 0.045) +
          Math.max(0, presenceBreath) * 0.014 +
          openPresence * 0.012;

        localPresence.root.scale.setScalar(presenceScale);
        localPresence.root.rotation.y +=
          (localPresencePreset.spin ?? 0.0003) * (0.8 + presenceBase * 0.6);
      }

      // ---------------------------------------------
      // SPACE RESPONSE PARTICLES
      // ---------------------------------------------
      const ambientAmount = spaceResponse.enabled !== false ? openingStateLevel : 0;

      ambientPoints.visible = ambientAmount > 0.02;
      ambientMaterial.opacity =
        ambientAmount *
        (spaceResponse.ambientParticleOpacity ?? 0.18) *
        (0.78 + Math.max(0, Math.sin(t * 0.9)) * 0.22);

      if (ambientPoints.visible) {
        const attr = ambientGeometry.getAttribute("position");

        for (let i = 0; i < ambientParticleCount; i += 1) {
          const ix = i * 3 + 0;
          const iy = i * 3 + 1;
          const iz = i * 3 + 2;

          const phase = ambientPhase[i];
          const lift = ambientLift[i];

          ambientPositions[ix] =
            ambientBasePositions[ix] +
            Math.sin(t * 0.35 + phase) * 0.035 * ambientAmount;

          ambientPositions[iy] =
            ambientBasePositions[iy] +
            Math.sin(t * 0.7 + phase) * 0.05 * lift * ambientAmount;

          ambientPositions[iz] =
            ambientBasePositions[iz] +
            Math.cos(t * 0.35 + phase) * 0.035 * ambientAmount;
        }

        attr.needsUpdate = true;
      }

      // ---------------------------------------------
      // CHAMBER DISSOLVE
      // ---------------------------------------------
      collectChamberVisualEntries();

      const dissolveEnabled = chamberDissolve.enabled !== false;
      const dissolveTrigger = chamberDissolve.startAtOpen ?? 0.82;
      const dissolveTarget =
        dissolveEnabled && openingStateLevel >= dissolveTrigger ? 1 : 0;

      chamberReleaseAmount = THREE.MathUtils.lerp(
        chamberReleaseAmount,
        dissolveTarget,
        chamberDissolve.rampSpeed ?? 0.065
      );

      const dissolveAmount = chamberReleaseAmount;

      // SCENE01-PORTAL-09D.2 - visible release field.
      // Makes the chamber feel like it dissolves into space instead of only scaling away.
      const releaseAmount = THREE.MathUtils.smoothstep(dissolveAmount, 0.015, 0.82);

      // Keep the release visible longer. This should feel like the chamber is dissolving
      // into the room, not like particles appear for one moment and vanish.
      const releaseFade = THREE.MathUtils.smoothstep(dissolveAmount, 1.15, 1.55);
      const releasePresence = releaseAmount * (1 - releaseFade * 0.18);

      chamberReleaseParticles.visible = releasePresence > 0.006;
      chamberReleaseMaterial.opacity = releasePresence * 1.35;

      if (chamberReleaseParticles.visible) {
        const releaseAttr = chamberReleaseGeometry.getAttribute("position");
        const expansion = releaseAmount * 5.4;
        const lateExpansion = THREE.MathUtils.smoothstep(dissolveAmount, 0.24, 1.0) * 2.6;

        for (let i = 0; i < chamberReleaseParticleCount; i += 1) {
          const i3 = i * 3;
          const phase = chamberReleasePhases[i];

          const wobbleX = Math.sin(t * 0.72 + phase) * 0.035 * releaseAmount;
          const wobbleY = Math.cos(t * 0.58 + phase * 1.3) * 0.028 * releaseAmount;
          const wobbleZ = Math.sin(t * 0.49 + phase * 0.8) * 0.035 * releaseAmount;

          chamberReleasePositions[i3 + 0] =
            chamberReleaseBasePositions[i3 + 0] +
            chamberReleaseVelocities[i3 + 0] * (expansion + lateExpansion) +
            wobbleX;

          chamberReleasePositions[i3 + 1] =
            chamberReleaseBasePositions[i3 + 1] +
            chamberReleaseVelocities[i3 + 1] * (expansion * 0.72 + lateExpansion * 0.55) +
            wobbleY;

          chamberReleasePositions[i3 + 2] =
            chamberReleaseBasePositions[i3 + 2] +
            chamberReleaseVelocities[i3 + 2] * (expansion + lateExpansion) +
            wobbleZ;
        }

        releaseAttr.needsUpdate = true;

        // Very slow rotation keeps the released field alive without becoming an effect storm.
        chamberReleaseParticles.rotation.y += deltaSeconds * 0.045 * releaseAmount;
        chamberReleaseParticles.rotation.z -= deltaSeconds * 0.018 * releaseAmount;
      }

      chamberRoot.visible = dissolveAmount < (chamberDissolve.hideAt ?? 0.992);

      for (const entry of chamberVisualEntries) {
        const mat = entry.material;
        if (!mat) continue;

        mat.transparent = true;

        const lowerName = String(entry.child?.name ?? "").toLowerCase();
        const isCoreLike =
          lowerName.includes("core") || lowerName.includes("inner");

        const targetFade = isCoreLike
          ? chamberDissolve.coreFadeTo ?? 0.015
          : chamberDissolve.shellFadeTo ?? 0.03;

        mat.opacity =
          dissolveAmount >= (chamberDissolve.hideAt ?? 0.992)
            ? 0
            : THREE.MathUtils.lerp(
                entry.baseOpacity,
                entry.baseOpacity * targetFade,
                dissolveAmount
              );
      }

      chamberDissolvePoints.visible = dissolveAmount > 0.01;
      const dissolveRise = THREE.MathUtils.smoothstep(
        dissolveAmount,
        0.08,
        0.42
      );
      const dissolveTail = 1 - THREE.MathUtils.smoothstep(dissolveAmount, 0.84, 1);
      dissolveMaterial.opacity =
        (chamberDissolve.particleOpacity ?? 0.72) *
        (0.12 + dissolveRise * 0.88) *
        (0.72 + dissolveTail * 0.28);
      dissolveMaterial.size =
        (chamberDissolve.particleSize ?? 0.018) *
        (0.9 + responseBreath * 0.12);

      if (chamberDissolvePoints.visible) {
        const attr = dissolveGeometry.getAttribute("position");
        const spread =
          Math.pow(dissolveAmount, 1.16) *
          (chamberDissolve.outwardDistance ?? 3.15);
        const liftBase =
          Math.pow(dissolveAmount, 1.1) *
          (chamberDissolve.upwardLift ?? 0.68);
        const wobble =
          (chamberDissolve.wobble ?? 0.06) * (0.55 + dissolveAmount * 0.45);

        for (let i = 0; i < dissolveParticleCount; i += 1) {
          const ix = i * 3 + 0;
          const iy = i * 3 + 1;
          const iz = i * 3 + 2;

          const speed = dissolveSpeeds[i];
          const lift = dissolveLift[i];
          const phase = dissolvePhase[i];

          dissolvePositions[ix] =
            dissolveBasePositions[ix] +
            dissolveDirections[ix] * spread * speed +
            Math.sin(t * 0.9 + phase) * wobble;

          dissolvePositions[iy] =
            dissolveBasePositions[iy] +
            dissolveDirections[iy] * spread * speed +
            liftBase * lift +
            Math.sin(t * 1.15 + phase) * wobble * 0.6;

          dissolvePositions[iz] =
            dissolveBasePositions[iz] +
            dissolveDirections[iz] * spread * speed +
            Math.cos(t * 0.9 + phase) * wobble;
        }

        attr.needsUpdate = true;
      }

      // ---------------------------------------------
      // TRANSITION PORTAL OPENING / PULL
      // ---------------------------------------------
      const portalEnabled = transitionPortal.enabled !== false;
      const portalTarget =
        portalEnabled &&
        chamberReleaseAmount >= (transitionPortal.startAtRelease ?? 0.18)
          ? 1
          : 0;

      transitionPortalOpenAmount = THREE.MathUtils.lerp(
        transitionPortalOpenAmount,
        portalTarget,
        transitionPortal.rampSpeed ?? 0.055
      );

      const portalAmount = transitionPortalOpenAmount;
      const portalBreathSpeed =
        transitionPortal.portalBreathSpeed ?? transitionPortal.pulseSpeed ?? 1.35;
      const portalBreath = 0.5 + 0.5 * Math.sin(t * portalBreathSpeed);
      const portalPulse = 0.84 + portalBreath * 0.16;
      const portalOuterSpeed =
        transitionPortal.portalRotationSpeedOuter ??
        transitionPortal.rotationSpeed ??
        0.06;
      const portalInnerSpeed =
        transitionPortal.portalRotationSpeedInner ??
        Math.max(0.024, portalOuterSpeed * 1.7);
      const portalPullStrength = transitionPortal.portalPullStrength ?? 0.26;
      const portalDepthOpacity =
        transitionPortal.portalDepthOpacity ?? transitionPortal.coreOpacity ?? 0.36;

      transitionPortalRoot.visible = portalAmount > 0.015;

      if (transitionPortalRoot.visible) {
        transitionPortalRoot.rotation.z +=
          deltaSeconds *
          portalOuterSpeed *
          0.16 *
          (0.35 + portalAmount);

        transitionPortalRoot.scale.setScalar(
          0.72 + portalAmount * 0.38 + portalBreath * 0.018
        );
      }

      transitionPortalCore.material.opacity =
        portalAmount * portalDepthOpacity * portalPulse;
      transitionPortalCore.position.z = -0.04 - portalAmount * 0.05;
      transitionPortalCore.scale.setScalar(1 + portalAmount * 0.045 + portalBreath * 0.02);

      transitionPortalRing.material.opacity =
        portalAmount * (transitionPortal.ringOpacity ?? 0.34) * portalPulse;
      transitionPortalRing.rotation.z += deltaSeconds * portalOuterSpeed * portalAmount;
      transitionPortalRing.scale.setScalar(1 + portalBreath * 0.012);
      transitionPortalRing.position.z = portalAmount * 0.006;

      transitionPortalInnerRing.material.opacity =
        portalAmount *
        (transitionPortal.innerRingOpacity ?? 0.22) *
        (0.92 + portalBreath * 0.08);
      transitionPortalInnerRing.rotation.z -=
        deltaSeconds * portalInnerSpeed * portalAmount;
      transitionPortalInnerRing.scale.setScalar(1 + portalBreath * 0.02);
      transitionPortalInnerRing.position.z = -0.02 - portalAmount * 0.015;

      // SCENE01-PORTAL-09D.1 - mechanism rings + living light.
      // Local-only visual pass. Does not touch sky, E input, threshold logic, or dissolve.
      const mechanismBreath = 0.5 + 0.5 * Math.sin(t * 0.72);
      const mechanismAmount = portalAmount * (0.76 + mechanismBreath * 0.24);

      // Slow ritual mechanism motion: layered, restrained, readable.
      transitionPortalRing.rotation.z += deltaSeconds * 0.055 * mechanismAmount;
      transitionPortalInnerRing.rotation.z -= deltaSeconds * 0.088 * mechanismAmount;

      // Subtle living opacity variation. No flashing, no overexposure.
      transitionPortalRing.material.opacity =
        portalAmount * THREE.MathUtils.lerp(0.26, 0.46, mechanismBreath);

      transitionPortalInnerRing.material.opacity =
        portalAmount * THREE.MathUtils.lerp(0.16, 0.34, 1 - mechanismBreath);

      // Keep the dark center present but gently breathing.
      transitionPortalCore.material.opacity =
        portalAmount * THREE.MathUtils.lerp(0.12, 0.24, mechanismBreath);

      // Local light only. This gives the portal a living presence without brightening the whole world.
      transitionPortalLight.intensity =
        portalAmount * THREE.MathUtils.lerp(0.34, 1.15, mechanismBreath);

      transitionPortalLight.distance =
        THREE.MathUtils.lerp(3.2, 5.2, portalAmount);

      transitionPortalLight.color.lerpColors(
        new THREE.Color("#8fb4ff"),
        new THREE.Color("#edf6ff"),
        mechanismBreath * 0.55
      );

      // Visible mechanism markers: this makes the rotation readable even on perfect circles.
      transitionPortalMechanismMarkers.visible = portalAmount > 0.012;
      transitionPortalMechanismMarkers.rotation.z += deltaSeconds * 0.34 * mechanismAmount;

      transitionPortalMechanismMarkers.children.forEach((marker, index) => {
        marker.material.opacity =
          portalAmount *
          THREE.MathUtils.lerp(0.38, 0.92, mechanismBreath) *
          (index % 3 === 0 ? 0.7 : 1);
      });

      // SCENE01-THRESHOLD-10A - animated depth aperture.
      // This turns the opened threshold into a directional passage without creating a new scene.
      const passageAmount = THREE.MathUtils.smoothstep(portalAmount, 0.08, 0.92);
      const passageBreath = 0.5 + 0.5 * Math.sin(t * 0.54);
      const passagePulse = THREE.MathUtils.lerp(0.82, 1.16, passageBreath);

      passageRoot.visible = passageAmount > 0.015;

      if (passageRoot.visible) {
        // The aperture sits slightly behind the ring plane and grows into readability.
        passageRoot.scale.setScalar(THREE.MathUtils.lerp(0.82, 1.08, passageAmount));

        passageCoreMaterial.opacity =
          passageAmount * THREE.MathUtils.lerp(0.26, 0.48, passageBreath);

        passageCore.scale.setScalar(
          THREE.MathUtils.lerp(0.82, 1.04, passageBreath) *
            THREE.MathUtils.lerp(0.78, 1.0, passageAmount)
        );

        passageDepthRings.forEach((entry, index) => {
          const localPhase = passageBreath * (index + 1) * 0.18;
          entry.ring.visible = true;
          entry.ring.rotation.z += deltaSeconds * entry.speed * passageAmount;
          entry.ring.material.opacity =
            passageAmount * entry.opacity * passagePulse * (1 - localPhase * 0.2);

          const scaleBreath =
            1 + Math.sin(t * 0.42 + index * 1.7) * 0.018 * passageAmount;
          entry.ring.scale.setScalar(scaleBreath);
        });

        passageParticles.visible = passageAmount > 0.04;
        passageParticleMaterial.opacity =
          passageAmount * THREE.MathUtils.lerp(0.22, 0.58, passageBreath);

        if (passageParticles.visible) {
          const passageAttr = passageParticleGeometry.getAttribute("position");
          const pull = passageAmount * THREE.MathUtils.lerp(0.25, 0.72, passageBreath);

          for (let i = 0; i < passageParticleCount; i += 1) {
            const i3 = i * 3;
            const phase = passageParticlePhases[i];

            const baseX = passageParticleBasePositions[i3 + 0];
            const baseY = passageParticleBasePositions[i3 + 1];
            const baseZ = passageParticleBasePositions[i3 + 2];

            const spiral = t * 0.18 + phase;
            const inward = 1 - pull * 0.34;
            const depthPull = pull * 0.72;

            passageParticlePositions[i3 + 0] =
              baseX * inward +
              Math.sin(spiral) * 0.035 * passageAmount;

            passageParticlePositions[i3 + 1] =
              baseY * inward +
              Math.cos(spiral * 0.85) * 0.028 * passageAmount;

            passageParticlePositions[i3 + 2] =
              baseZ -
              depthPull +
              Math.sin(t * 0.48 + phase) * 0.05 * passageAmount;
          }

          passageAttr.needsUpdate = true;

          passageParticles.rotation.z -= deltaSeconds * 0.045 * passageAmount;
          passageParticles.rotation.y += deltaSeconds * 0.018 * passageAmount;
        }
      }

      // SCENE01-THRESHOLD-10B - directional pull field.
      // The portal starts behaving like a passage, not only a rotating object.
      const pullAmount = THREE.MathUtils.smoothstep(portalAmount, 0.18, 0.96);
      const pullBreath = 0.5 + 0.5 * Math.sin(t * 0.46);
      const pullStrength = pullAmount * THREE.MathUtils.lerp(0.42, 1.0, pullBreath);

      thresholdPullField.visible = pullAmount > 0.025;
      thresholdPullMaterial.opacity =
        pullAmount * THREE.MathUtils.lerp(0.26, 0.78, pullBreath);

      if (thresholdPullField.visible) {
        const pullAttr = thresholdPullGeometry.getAttribute("position");

        for (let i = 0; i < thresholdPullFieldCount; i += 1) {
          const i3 = i * 3;
          const phase = thresholdPullPhases[i];
          const lane = thresholdPullSeeds[i];

          const baseX = thresholdPullBasePositions[i3 + 0];
          const baseY = thresholdPullBasePositions[i3 + 1];
          const baseZ = thresholdPullBasePositions[i3 + 2];

          // A slow loop makes particles feel continuously drawn inward.
          const travel = (t * 0.105 + phase * 0.035 + lane) % 1;
          const narrowing = THREE.MathUtils.lerp(1.0, 0.22, travel * pullStrength);
          const depthShift = travel * 1.75 * pullStrength;

          const spiral = t * 0.38 + phase;
          const spiralX = Math.sin(spiral) * 0.045 * pullAmount * (1 - lane * 0.35);
          const spiralY = Math.cos(spiral * 0.82) * 0.035 * pullAmount * (1 - lane * 0.25);

          thresholdPullPositions[i3 + 0] = baseX * narrowing + spiralX;
          thresholdPullPositions[i3 + 1] = baseY * narrowing + spiralY;
          thresholdPullPositions[i3 + 2] = baseZ - depthShift;
        }

        pullAttr.needsUpdate = true;

        // Very slow field rotation. This should feel gravitational, not like a spinner.
        thresholdPullField.rotation.z -= deltaSeconds * 0.038 * pullAmount;
        thresholdPullField.rotation.y += deltaSeconds * 0.012 * pullAmount;
      }

      // Local light response: aperture grows slightly more persuasive after opening.
      // This is additive to the 10A passage light, still local to the portal.
      transitionPortalLight.intensity +=
        pullAmount * THREE.MathUtils.lerp(0.08, 0.26, pullBreath);

      // SCENE01-THRESHOLD-10C - transition readiness zone.
      // This prepares the future passage trigger without switching rooms yet.
      const transitionReadyTarget = portalAmount > 0.78 ? 1 : 0;

      transitionReadinessLevel = THREE.MathUtils.lerp(
        transitionReadinessLevel,
        transitionReadyTarget,
        0.045
      );

      let transitionZoneTarget = 0;

      if (
        transitionReadinessLevel > 0.05 &&
        camera &&
        typeof camera.getWorldPosition === "function"
      ) {
        transitionReadinessRing.getWorldPosition(transitionZoneWorldPosition);
        camera.getWorldPosition(cameraWorldPosition);

        const dx = cameraWorldPosition.x - transitionZoneWorldPosition.x;
        const dz = cameraWorldPosition.z - transitionZoneWorldPosition.z;
        const horizontalDistance = Math.sqrt(dx * dx + dz * dz);

        const zoneStartDistance = 2.35;
        const zoneFullDistance = 0.72;
        const zoneRange = Math.max(0.001, zoneStartDistance - zoneFullDistance);

        transitionZoneTarget =
          1 -
          THREE.MathUtils.clamp(
            (horizontalDistance - zoneFullDistance) / zoneRange,
            0,
            1
          );
      }

      transitionZoneLevel = THREE.MathUtils.lerp(
        transitionZoneLevel,
        transitionZoneTarget,
        0.075
      );

      const transitionZoneBreath = 0.5 + 0.5 * Math.sin(t * 0.62);
      const transitionZonePresence = Math.max(
        transitionReadinessLevel * 0.62,
        transitionZoneLevel
      );

      transitionReadinessRoot.visible = transitionReadinessLevel > 0.035;

      if (transitionReadinessRoot.visible) {
        transitionReadinessRing.material.opacity =
          transitionReadinessLevel *
          THREE.MathUtils.lerp(0.08, 0.22, transitionZoneBreath) +
          transitionZoneLevel * 0.18;

        transitionReadinessInnerRing.material.opacity =
          transitionReadinessLevel *
          THREE.MathUtils.lerp(0.04, 0.14, 1 - transitionZoneBreath) +
          transitionZoneLevel * 0.22;

        transitionReadinessRing.rotation.z +=
          deltaSeconds * 0.018 * transitionReadinessLevel;

        transitionReadinessInnerRing.rotation.z -=
          deltaSeconds * 0.026 * transitionReadinessLevel;

        transitionReadinessNeedles.rotation.z +=
          deltaSeconds * THREE.MathUtils.lerp(0.018, 0.075, transitionZoneLevel);

        transitionReadinessNeedles.children.forEach((needle, index) => {
          needle.material.opacity =
            transitionReadinessLevel *
            THREE.MathUtils.lerp(0.08, 0.34, transitionZoneBreath) *
            (index % 2 === 0 ? 1 : 0.62) +
            transitionZoneLevel * 0.22;
        });

        transitionReadinessGlow.intensity =
          transitionZonePresence *
          THREE.MathUtils.lerp(0.04, 0.22, transitionZoneBreath);

        transitionReadinessGlow.distance =
          THREE.MathUtils.lerp(1.8, 3.4, transitionZonePresence);

        // The pull field becomes slightly more persuasive when the viewer approaches the zone.
        thresholdPullMaterial.opacity += transitionZoneLevel * 0.14;
        transitionPortalLight.intensity += transitionZoneLevel * 0.18;
      }

      // Public readiness state for future Scene 02 trigger.
      // This still does not trigger navigation yet.
      const canStartFirstPassage =
        transitionReadinessLevel > 0.72 && transitionZoneLevel > 0.68;

      if (canStartFirstPassage && !firstPassageTriggered) {
        firstPassageHoldTime += deltaSeconds;

        if (firstPassageHoldTime > 1.15) {
          firstPassageTriggered = true;
        }
      } else if (!firstPassageTriggered) {
        firstPassageHoldTime = Math.max(
          0,
          firstPassageHoldTime - deltaSeconds * 0.8
        );
      }

      const firstPassageTarget = firstPassageTriggered ? 1 : 0;

      firstPassageLevel = THREE.MathUtils.lerp(
        firstPassageLevel,
        firstPassageTarget,
        0.035
      );

      const firstPassageBreath = 0.5 + 0.5 * Math.sin(t * 0.38);
      const firstPassagePulse = THREE.MathUtils.lerp(0.78, 1.18, firstPassageBreath);

      firstPassageRoot.visible = firstPassageLevel > 0.012;

      if (firstPassageRoot.visible) {
        firstPassageRoot.scale.setScalar(
          THREE.MathUtils.lerp(0.92, 1.16, firstPassageLevel)
        );

        firstPassageTunnelRings.forEach((entry, index) => {
          entry.ring.visible = true;
          entry.ring.rotation.z += deltaSeconds * entry.speed * firstPassageLevel;

          entry.ring.material.opacity =
            firstPassageLevel *
            entry.opacity *
            firstPassagePulse *
            (index === 0 ? 1.22 : 1);

          const tunnelScale =
            1 + Math.sin(t * 0.32 + index * 1.4) * 0.026 * firstPassageLevel;

          entry.ring.scale.setScalar(tunnelScale);
        });

        firstPassageStreaks.visible = firstPassageLevel > 0.025;
        firstPassageStreakMaterial.opacity =
          firstPassageLevel * THREE.MathUtils.lerp(0.28, 0.86, firstPassageBreath);

        if (firstPassageStreaks.visible) {
          const streakAttr = firstPassageStreakGeometry.getAttribute("position");

          for (let i = 0; i < firstPassageStreakCount; i += 1) {
            const i3 = i * 3;
            const phase = firstPassageStreakPhases[i];
            const lane = firstPassageStreakSeeds[i];

            const baseX = firstPassageStreakBasePositions[i3 + 0];
            const baseY = firstPassageStreakBasePositions[i3 + 1];
            const baseZ = firstPassageStreakBasePositions[i3 + 2];

            const travel = (t * 0.16 + phase * 0.033 + lane) % 1;
            const inward = THREE.MathUtils.lerp(1.0, 0.16, travel * firstPassageLevel);
            const depthPull = travel * 2.25 * firstPassageLevel;

            const spiral = t * 0.44 + phase;
            const swirlX = Math.sin(spiral) * 0.05 * firstPassageLevel;
            const swirlY = Math.cos(spiral * 0.82) * 0.04 * firstPassageLevel;

            firstPassageStreakPositions[i3 + 0] = baseX * inward + swirlX;
            firstPassageStreakPositions[i3 + 1] = baseY * inward + swirlY;
            firstPassageStreakPositions[i3 + 2] = baseZ - depthPull;
          }

          streakAttr.needsUpdate = true;

          firstPassageStreaks.rotation.z -= deltaSeconds * 0.072 * firstPassageLevel;
          firstPassageStreaks.rotation.y += deltaSeconds * 0.026 * firstPassageLevel;
        }

        firstPassageLight.intensity =
          firstPassageLevel * THREE.MathUtils.lerp(0.42, 1.25, firstPassageBreath);

        firstPassageLight.distance =
          THREE.MathUtils.lerp(3.8, 6.2, firstPassageLevel);

        // Push existing portal response into a more decisive passage state.
        transitionPortalLight.intensity +=
          firstPassageLevel * THREE.MathUtils.lerp(0.16, 0.42, firstPassageBreath);

        thresholdPullMaterial.opacity += firstPassageLevel * 0.2;
        passageParticleMaterial.opacity += firstPassageLevel * 0.16;
      }

      root.userData.scene01Transition = {
        ready: transitionReadinessLevel > 0.72,
        inZone: transitionZoneLevel > 0.68,
        canTransition: canStartFirstPassage,
        firstPassageTriggered,
        firstPassageLevel,
        hold: firstPassageHoldTime,
        readiness: transitionReadinessLevel,
        proximity: transitionZoneLevel,
        phase: firstPassageTriggered ? "first-passage" : "threshold-ready",
      };

      transitionPortalParticles.visible = portalAmount > 0.025;
      transitionPortalParticleMaterial.opacity =
        portalAmount *
        (transitionPortal.portalParticleOpacity ?? transitionPortal.particleOpacity ?? 0.42) *
        portalPulse;

      if (transitionPortalParticles.visible) {
        transitionPortalParticles.rotation.z -=
          deltaSeconds *
          (transitionPortal.pullSpeed ?? 0.42) *
          (0.2 + portalAmount);

        const portalAttr = transitionPortalParticleGeometry.getAttribute("position");
        const portalParticlePull = portalAmount * portalPullStrength;
        const portalParticleSwirl = 0.018 + portalAmount * 0.022;

        for (let i = 0; i < portalParticleCount; i += 1) {
          const ix = i * 3 + 0;
          const iy = i * 3 + 1;
          const iz = i * 3 + 2;
          const phase = portalParticlePhase[i];

          portalParticlePositions[ix] =
            portalParticleBasePositions[ix] * (1 - portalParticlePull * 0.42) +
            Math.cos(t * 0.86 + phase) * portalParticleSwirl;

          portalParticlePositions[iy] =
            portalParticleBasePositions[iy] * (1 - portalParticlePull * 0.18) +
            Math.sin(t * 0.74 + phase) * portalParticleSwirl * 0.84;

          portalParticlePositions[iz] =
            portalParticleBasePositions[iz] -
            portalAmount * 0.46 -
            portalParticlePull * 0.28 +
            Math.sin(t * 0.54 + phase) * portalParticleSwirl * 0.66;
        }

        portalAttr.needsUpdate = true;
      }

      return Math.max(
        proximityLevel,
        handAttunementLevel * (preset.attunement?.soundBoost ?? 0.75),
        chargeInfluence * (preset.ritualCharge?.soundBoost ?? 0.95),
        transformationCueLevel * (preset.transformationCue?.soundBoost ?? 1.15),
        openingStateLevel * (preset.openingState?.soundFloor ?? 0.85)
      );
    },
    setHandAttunement(value = 0) {
      handAttunementTarget = THREE.MathUtils.clamp(value, 0, 1);
    },
    getChamberWorldPosition(target = new THREE.Vector3()) {
      chamberAnchor.getWorldPosition(target);
      return target;
    },
    getHandAttunementLevel() {
      return handAttunementLevel;
    },
    getRitualChargeLevel() {
      return ritualChargeLevel;
    },
    getTransitionReadiness() {
      return root.userData.scene01Transition ?? {
        ready: false,
        inZone: false,
        canTransition: false,
        firstPassageTriggered: false,
        firstPassageLevel: 0,
        hold: 0,
        readiness: 0,
        proximity: 0,
        phase: "closed",
      };
    },
    isRitualChargeComplete() {
      return ritualChargeComplete;
    },
    getTransformationCueLevel() {
      return transformationCueLevel;
    },
    isTransformationCueTriggered() {
      return transformationCueTriggered;
    },
    getOpeningStateLevel() {
      return openingStateLevel;
    },
    resetRitualCharge() {
      ritualChargeLevel = 0;
      ritualChargeComplete = false;
    },
    resetTransformationCue() {
      transformationCueTriggered = false;
      transformationCueLevel = 0;
      openingStateLevel = 0;
    },
    dispose() {
      softPointTexture?.dispose?.();
      root.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose?.();
        if (obj.material) disposeMaterial(obj.material);
      });
      root.removeFromParent();
    },
  };
}
