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

    seeds.push(t);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("seed", new THREE.Float32BufferAttribute(seeds, 1));

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

function createSanctuaryDustLayer(THREE, spec, color = 0xffffff) {
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
    color,
    size: spec.size,
    transparent: true,
    opacity: spec.opacity,
    depthWrite: false,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.userData.spec = spec;
  return points;
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

function createSanctuaryHazeShell(THREE, radius, height, color, opacity) {
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 28, 18),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );

  shell.scale.set(1, height / radius, 1);
  return shell;
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

  const axialOpening = preset.axialOpening ?? {};

  const axialRoot = new THREE.Group();
  axialRoot.name = "TempleSanctuaryAxialOpening";
  axialRoot.position.set(
    0,
    preset.altar.height + (axialOpening.y ?? 1.22),
    axialOpening.z ?? -1.34
  );
  axialRoot.visible = false;
  decorRoot.add(axialRoot);

  const axialCoreBeam = new THREE.Mesh(
    new THREE.PlaneGeometry(
      axialOpening.beamWidth ?? 0.34,
      axialOpening.beamHeight ?? 5.8
    ),
    makeAxialGlowMaterial({
      color: axialOpening.color ?? "#b8d2ff",
      opacity: 0,
    })
  );
  axialCoreBeam.name = "TempleSanctuaryAxialCoreBeam";
  axialCoreBeam.position.z = -0.03;
  axialRoot.add(axialCoreBeam);

  const axialDepthBeam = new THREE.Mesh(
    new THREE.PlaneGeometry(
      axialOpening.beamDepthWidth ?? 1.95,
      axialOpening.beamHeight ?? 5.8
    ),
    makeAxialGlowMaterial({
      color: axialOpening.color ?? "#b8d2ff",
      opacity: 0,
    })
  );
  axialDepthBeam.name = "TempleSanctuaryAxialDepthBeam";
  axialDepthBeam.rotation.y = Math.PI / 2;
  axialDepthBeam.position.z = -0.02;
  axialRoot.add(axialDepthBeam);

  const axialSideBeamLeft = new THREE.Mesh(
    new THREE.PlaneGeometry(
      (axialOpening.beamWidth ?? 0.34) * 0.42,
      (axialOpening.beamHeight ?? 5.8) * 0.82
    ),
    makeAxialGlowMaterial({
      color: axialOpening.color ?? "#b8d2ff",
      opacity: 0,
    })
  );
  axialSideBeamLeft.name = "TempleSanctuaryAxialSideBeamLeft";
  axialSideBeamLeft.position.set(-0.72, 0, -0.055);
  axialSideBeamLeft.rotation.z = 0.035;
  axialRoot.add(axialSideBeamLeft);

  const axialSideBeamRight = axialSideBeamLeft.clone();
  axialSideBeamRight.name = "TempleSanctuaryAxialSideBeamRight";
  axialSideBeamRight.position.x = 0.72;
  axialSideBeamRight.rotation.z = -0.035;
  axialRoot.add(axialSideBeamRight);

  const axialVeil = new THREE.Mesh(
    new THREE.CircleGeometry(1.72, 96),
    makeAxialGlowMaterial({
      color: axialOpening.color ?? "#b8d2ff",
      opacity: 0,
    })
  );
  axialVeil.name = "TempleSanctuaryAxialVeil";
  axialVeil.position.z = -0.08;
  axialRoot.add(axialVeil);

  const axialFloorWave = new THREE.Mesh(
    new THREE.RingGeometry(
      Math.max(0.001, (axialOpening.floorWaveRadius ?? 2.75) - 0.055),
      axialOpening.floorWaveRadius ?? 2.75,
      128
    ),
    makeAxialGlowMaterial({
      color: axialOpening.color ?? "#b8d2ff",
      opacity: 0,
    })
  );
  axialFloorWave.name = "TempleSanctuaryAxialFloorWave";
  axialFloorWave.rotation.x = -Math.PI / 2;
  axialFloorWave.position.set(0, 0.026, 0);
  decorRoot.add(axialFloorWave);

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

    const nearHaze = createSanctuaryHazeShell(
      THREE,
      atmospherePreset.haze.nearRadius,
      atmospherePreset.haze.nearHeight,
      atmospherePreset.haze.color,
      atmospherePreset.haze.nearOpacity
    );

    const midHaze = createSanctuaryHazeShell(
      THREE,
      atmospherePreset.haze.midRadius,
      atmospherePreset.haze.midHeight,
      atmospherePreset.haze.color,
      atmospherePreset.haze.midOpacity
    );

    const farHaze = createSanctuaryHazeShell(
      THREE,
      atmospherePreset.haze.farRadius,
      atmospherePreset.haze.farHeight,
      atmospherePreset.haze.color,
      atmospherePreset.haze.farOpacity
    );

    const breathingGlow = createSanctuaryHazeShell(
      THREE,
      atmospherePreset.breath.glowRadius,
      atmospherePreset.breath.glowRadius * 0.72,
      atmospherePreset.haze.color,
      atmospherePreset.breath.glowOpacityMin
    );

    atmosphereRoot.add(farHaze);
    atmosphereRoot.add(backgroundDust);
    atmosphereRoot.add(midHaze);
    atmosphereRoot.add(midDust);
    atmosphereRoot.add(nearHaze);
    atmosphereRoot.add(foregroundDust);
    atmosphereRoot.add(breathingGlow);

    root.add(atmosphereRoot);

    atmosphere = {
      root: atmosphereRoot,
      foregroundDust,
      midDust,
      backgroundDust,
      nearHaze,
      midHaze,
      farHaze,
      breathingGlow,
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

  const dissolveParticleCount = chamberDissolve.particleCount ?? 340;
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

    const radius = 0.18 + Math.random() * 0.52;

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

    dissolveSpeeds[i] = 0.6 + Math.random() * 0.8;
    dissolveLift[i] = 0.4 + Math.random() * 0.7;
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

  const portalParticleCount = transitionPortal.particleCount ?? 240;
  const portalParticlePositions = new Float32Array(portalParticleCount * 3);
  const portalParticleBasePositions = new Float32Array(portalParticleCount * 3);
  const portalParticlePhase = new Float32Array(portalParticleCount);

  for (let i = 0; i < portalParticleCount; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = THREE.MathUtils.lerp(
      transitionPortal.innerRadius ?? 0.62,
      transitionPortal.radius ?? 1.22,
      Math.random()
    );
    const depth = -Math.random() * (transitionPortal.particleDepth ?? 3.2);

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
    size: transitionPortal.particleSize ?? 0.022,
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

  const chamberWorldPosition = new THREE.Vector3();
  const cameraWorldPosition = new THREE.Vector3();
  const baseChamberScale = preset.chamber.scale ?? 1;

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
        chamberDissolve.rootScaleTo ?? 0.38,
        chamberReleaseAmount
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

      chamberLight.intensity =
        preset.chamber.lightIntensity +
        Math.sin(t * 0.8) * 0.08 +
        proximityLevel * (presence.lightBoost ?? 2.1) +
        handAttunementLevel * (attunement.lightBoost ?? 1.25) +
        chargeInfluence * (ritualCharge.lightBoost ?? 1.55) +
        transformationCueLevel * (transformationCue.lightBoost ?? 2.6) +
        openingStateLevel * (openingState.lightFloor ?? 0.38) +
        Math.max(0, pulseWave) *
          (
            proximityLevel * (presence.lightPulseBoost ?? 0.34) +
            handAttunementLevel * 0.22 +
            chargeInfluence * 0.38 +
            transformationCueLevel * 0.5
          );

      const cueWave = 0.72 + Math.max(0, pulseWave) * 0.28;

      callRing.material.opacity =
        Math.max(0, preset.callLight.ringOpacity) +
        transformationCueLevel *
          (transformationCue.callRingOpacity ?? 0.13) *
          cueWave;

      rearGlow.material.opacity =
        Math.max(0, preset.callLight.rearGlowOpacity) +
        transformationCueLevel *
          (transformationCue.rearGlowOpacity ?? 0.11) *
          cueWave;

      const threshold = preset.thresholdReveal ?? {};
      const thresholdEnabled = threshold.enabled !== false;
      const thresholdAmount = thresholdEnabled ? transformationCueLevel : 0;

      thresholdRoot.visible = thresholdAmount > 0.012;

      if (thresholdRoot.visible) {
        thresholdRoot.rotation.z +=
          deltaSeconds *
          (threshold.rotationSpeed ?? 0.035) *
          (0.35 + thresholdAmount);

        thresholdRoot.scale.setScalar(
          1 + thresholdAmount * (threshold.scaleBoost ?? 0.085)
        );
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

        thresholdDriftPoints.material.opacity =
          Math.max(
            driftAmount * (drift.opacity ?? 0.16),
            openingStateLevel * (openingState.driftFloor ?? 0.075)
          ) * cueWave;
      } else {
        thresholdDriftPoints.material.opacity = 0;
      }

      const axial = preset.axialOpening ?? {};
      const axialEnabled = axial.enabled !== false;
      const axialAmount = axialEnabled ? openingStateLevel : 0;
      const axialPulse =
        0.72 +
        Math.max(0, Math.sin(t * (axial.pulseSpeed ?? 1.1))) * 0.28;

      axialRoot.visible = axialAmount > 0.018;

      if (axialRoot.visible) {
        axialRoot.rotation.z +=
          deltaSeconds * (axial.rotationSpeed ?? 0.0) * (0.25 + axialAmount);

        axialRoot.scale.setScalar(
          1 + axialAmount * (axial.scaleBoost ?? 0.05)
        );
      }

      axialCoreBeam.material.opacity =
        axialAmount * (axial.coreOpacity ?? 0.12) * axialPulse;

      axialDepthBeam.material.opacity =
        axialAmount * (axial.veilOpacity ?? 0.035) * axialPulse;

      axialSideBeamLeft.material.opacity =
        axialAmount * (axial.sideOpacity ?? 0.0) * axialPulse;

      axialSideBeamRight.material.opacity =
        axialAmount * (axial.sideOpacity ?? 0.0) * axialPulse;

      axialVeil.material.opacity =
        axialAmount * (axial.veilOpacity ?? 0.035) * axialPulse;

      axialFloorWave.visible = axialAmount > 0.018;
      axialFloorWave.material.opacity =
        axialAmount * (axial.floorWaveOpacity ?? 0.06) * axialPulse;

      const responseBreath =
        1 +
        Math.sin(t * (spaceResponse.breathSpeed ?? 0.7)) *
          (spaceResponse.breathAmplitude ?? 0.08);

      axialFloorWave.scale.setScalar(
        0.92 +
          axialAmount * (0.08 + (spaceResponse.floorBreathBoost ?? 0.08)) +
          Math.max(0, Math.sin(t * 0.65)) * 0.025
      );

      if (atmosphere && atmospherePreset?.enabled) {
        const breathMix =
          0.5 + 0.5 * Math.sin(t * atmospherePreset.breath.speed);

        updateSanctuaryDustLayer(atmosphere.foregroundDust, t, breathMix);
        updateSanctuaryDustLayer(atmosphere.midDust, t * 0.9, breathMix);
        updateSanctuaryDustLayer(atmosphere.backgroundDust, t * 0.75, breathMix);

        atmosphere.nearHaze.material.opacity =
          atmospherePreset.haze.nearOpacity * (0.88 + breathMix * 0.35);

        atmosphere.midHaze.material.opacity =
          atmospherePreset.haze.midOpacity * (0.9 + breathMix * 0.28);

        atmosphere.farHaze.material.opacity =
          atmospherePreset.haze.farOpacity * (0.95 + breathMix * 0.18);

        const glowOpacity =
          atmospherePreset.breath.glowOpacityMin +
          (atmospherePreset.breath.glowOpacityMax -
            atmospherePreset.breath.glowOpacityMin) *
            breathMix;

        atmosphere.breathingGlow.material.opacity = glowOpacity;

        const glowScale = 1 + breathMix * atmospherePreset.breath.glowScaleAmp;
        atmosphere.breathingGlow.scale.set(
          glowScale,
          (atmospherePreset.breath.glowRadius * 0.72 /
            atmospherePreset.breath.glowRadius) * glowScale,
          glowScale
        );

        atmosphere.root.rotation.y += 0.00035;
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

      chamberRoot.visible = dissolveAmount < (chamberDissolve.hideAt ?? 0.94);

      for (const entry of chamberVisualEntries) {
        const mat = entry.material;
        if (!mat) continue;

        mat.transparent = true;

        const lowerName = String(entry.child?.name ?? "").toLowerCase();
        const isCoreLike =
          lowerName.includes("core") || lowerName.includes("inner");

        const targetFade = isCoreLike
          ? chamberDissolve.coreFadeTo ?? 0.04
          : chamberDissolve.shellFadeTo ?? 0.14;

        mat.opacity =
          dissolveAmount >= (chamberDissolve.hideAt ?? 0.94)
            ? 0
            : THREE.MathUtils.lerp(
                entry.baseOpacity,
                entry.baseOpacity * targetFade,
                dissolveAmount
              );
      }

      chamberDissolvePoints.visible = dissolveAmount > 0.01;
      dissolveMaterial.opacity =
        dissolveAmount * (chamberDissolve.particleOpacity ?? 0.88);
      dissolveMaterial.size =
        (chamberDissolve.particleSize ?? 0.03) *
        (0.92 + responseBreath * 0.12);

      if (chamberDissolvePoints.visible) {
        const attr = dissolveGeometry.getAttribute("position");
        const spread = dissolveAmount * (chamberDissolve.outwardDistance ?? 1.9);
        const liftBase = dissolveAmount * (chamberDissolve.upwardLift ?? 0.48);
        const wobble = (chamberDissolve.wobble ?? 0.045) * dissolveAmount;

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
      const portalPulse =
        0.72 +
        Math.max(0, Math.sin(t * (transitionPortal.pulseSpeed ?? 1.35))) * 0.28;

      transitionPortalRoot.visible = portalAmount > 0.015;

      if (transitionPortalRoot.visible) {
        transitionPortalRoot.rotation.z +=
          deltaSeconds *
          (transitionPortal.rotationSpeed ?? 0.16) *
          (0.35 + portalAmount);

        transitionPortalRoot.scale.setScalar(0.72 + portalAmount * 0.38);
      }

      transitionPortalCore.material.opacity =
        portalAmount * (transitionPortal.coreOpacity ?? 0.36) * portalPulse;

      transitionPortalRing.material.opacity =
        portalAmount * (transitionPortal.ringOpacity ?? 0.34) * portalPulse;

      transitionPortalInnerRing.material.opacity =
        portalAmount * (transitionPortal.innerRingOpacity ?? 0.22) * portalPulse;

      transitionPortalParticles.visible = portalAmount > 0.025;
      transitionPortalParticleMaterial.opacity =
        portalAmount * (transitionPortal.particleOpacity ?? 0.42) * portalPulse;

      if (transitionPortalParticles.visible) {
        transitionPortalParticles.rotation.z -=
          deltaSeconds *
          (transitionPortal.pullSpeed ?? 0.42) *
          (0.2 + portalAmount);

        const portalAttr = transitionPortalParticleGeometry.getAttribute("position");

        for (let i = 0; i < portalParticleCount; i += 1) {
          const ix = i * 3 + 0;
          const iy = i * 3 + 1;
          const iz = i * 3 + 2;
          const phase = portalParticlePhase[i];
          const inward = portalAmount * 0.22;

          portalParticlePositions[ix] =
            portalParticleBasePositions[ix] * (1 - inward) +
            Math.sin(t * 0.9 + phase) * 0.035 * portalAmount;

          portalParticlePositions[iy] =
            portalParticleBasePositions[iy] * (1 - inward) +
            Math.cos(t * 0.75 + phase) * 0.028 * portalAmount;

          portalParticlePositions[iz] =
            portalParticleBasePositions[iz] -
            portalAmount * 0.46 +
            Math.sin(t * 0.55 + phase) * 0.06 * portalAmount;
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
