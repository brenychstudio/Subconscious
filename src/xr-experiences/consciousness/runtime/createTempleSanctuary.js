import * as THREE from "three";
import { templeSanctuaryPreset } from "../presets/templeSanctuaryPreset.js";
import {
  createPathIntoUnknownSceneRuntime,
  createScene02SwitchContract as createScene02SwitchContractFromPathScene,
  createScene02RuntimeSwitchStub as createScene02RuntimeSwitchStubFromPathScene,
  createScene02RuntimeDiagnostic as createScene02RuntimeDiagnosticFromPathScene,
  createScene02AdapterObject as createScene02AdapterObjectFromPathScene,
  createScene02ContainerBindingContract as createScene02ContainerBindingContractFromPathScene,
  createScene02ContainerBindingPreflight as createScene02ContainerBindingPreflightFromPathScene,
  createScene02ActualBindingState as createScene02ActualBindingStateFromPathScene,
  roundScene02PreflightNumber as roundScene02PreflightNumberFromPathScene,
  createScene02TransformSnapshot as createScene02TransformSnapshotFromPathScene,
  createScene02BindingRuntimeSnapshot as createScene02BindingRuntimeSnapshotFromPathScene,
  bindScene02LayerToContainerPreserveWorld as bindScene02LayerToContainerPreserveWorldFromPathScene,
  createScene02VisualResponseState as createScene02VisualResponseStateFromPathScene,
  createScene02RuntimeContainerState as createScene02RuntimeContainerStateFromPathScene,
} from "./createPathIntoUnknownScene.js";

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

  const firstFramePreset = preset.firstFrameComposition ?? {};
  const firstFrameRoot = new THREE.Group();
  firstFrameRoot.name = "TempleSanctuaryFirstFrameComposition";
  firstFrameRoot.position.set(
    0,
    preset.altar.height + (firstFramePreset.y ?? 1.18),
    firstFramePreset.z ?? -0.72
  );
  altarRoot.add(firstFrameRoot);

  const firstFrameBackVeil = new THREE.Mesh(
    new THREE.CircleGeometry(firstFramePreset.backVeilRadius ?? 2.88, 96),
    makeAxialGlowMaterial({
      color: firstFramePreset.accentColor ?? "#86a8ff",
      opacity: 0,
    })
  );
  firstFrameBackVeil.name = "TempleSanctuaryFirstFrameBackVeil";
  firstFrameBackVeil.position.z = -0.035;
  firstFrameRoot.add(firstFrameBackVeil);

  const firstFrameOuterHalo = new THREE.Mesh(
    new THREE.RingGeometry(
      Math.max(0.01, (firstFramePreset.haloRadius ?? 2.62) - 0.018),
      firstFramePreset.haloRadius ?? 2.62,
      160
    ),
    makeAxialGlowMaterial({
      color: firstFramePreset.color ?? "#dce8ff",
      opacity: 0,
    })
  );
  firstFrameOuterHalo.name = "TempleSanctuaryFirstFrameOuterHalo";
  firstFrameOuterHalo.position.z = -0.012;
  firstFrameRoot.add(firstFrameOuterHalo);

  const firstFrameInnerHalo = new THREE.Mesh(
    new THREE.RingGeometry(
      Math.max(0.01, (firstFramePreset.innerHaloRadius ?? 1.56) - 0.014),
      firstFramePreset.innerHaloRadius ?? 1.56,
      144
    ),
    makeAxialGlowMaterial({
      color: firstFramePreset.color ?? "#dce8ff",
      opacity: 0,
    })
  );
  firstFrameInnerHalo.name = "TempleSanctuaryFirstFrameInnerHalo";
  firstFrameInnerHalo.position.z = -0.004;
  firstFrameRoot.add(firstFrameInnerHalo);

  const firstFrameVerticalSeams = new THREE.Group();
  firstFrameVerticalSeams.name = "TempleSanctuaryFirstFrameVerticalSeams";
  firstFrameRoot.add(firstFrameVerticalSeams);

  const firstFrameSeamMaterial = makeAxialGlowMaterial({
    color: firstFramePreset.accentColor ?? "#86a8ff",
    opacity: 0,
  });

  [-1.72, 1.72].forEach((x) => {
    const seam = new THREE.Mesh(
      new THREE.BoxGeometry(0.026, 2.8, 0.01),
      firstFrameSeamMaterial
    );
    seam.name =
      x < 0
        ? "TempleSanctuaryFirstFrameLeftSeam"
        : "TempleSanctuaryFirstFrameRightSeam";
    seam.position.set(x, 0.05, 0.012);
    firstFrameVerticalSeams.add(seam);
  });

  const firstFrameAisleRoot = new THREE.Group();
  firstFrameAisleRoot.name = "TempleSanctuaryFirstFrameAisleLines";
  firstFrameAisleRoot.position.set(0, 0.032, 8.4);
  firstFrameRoot.add(firstFrameAisleRoot);

  const firstFrameAisleMaterial = makeAxialGlowMaterial({
    color: firstFramePreset.color ?? "#dce8ff",
    opacity: 0,
  });

  [
    { x: 0, width: 0.022, length: 11.8, opacityScale: 1 },
    { x: -0.58, width: 0.014, length: 9.8, opacityScale: 0.58 },
    { x: 0.58, width: 0.014, length: 9.8, opacityScale: 0.58 },
  ].forEach((lineSpec, index) => {
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(lineSpec.width, 0.006, lineSpec.length),
      index === 0 ? firstFrameAisleMaterial : firstFrameAisleMaterial.clone()
    );
    line.name = `TempleSanctuaryFirstFrameAisleLine_${index}`;
    line.position.set(lineSpec.x, 0, 0);
    line.userData.opacityScale = lineSpec.opacityScale;
    firstFrameAisleRoot.add(line);
  });

  const firstFrameKeyLight = new THREE.PointLight(
    new THREE.Color(firstFramePreset.color ?? "#dce8ff"),
    0,
    18,
    2
  );
  firstFrameKeyLight.name = "TempleSanctuaryFirstFrameKeyLight";
  firstFrameKeyLight.position.set(0, preset.altar.height + 1.65, 3.2);
  firstFrameRoot.add(firstFrameKeyLight);

  const firstFrameRimLight = new THREE.PointLight(
    new THREE.Color(firstFramePreset.accentColor ?? "#86a8ff"),
    0,
    20,
    2
  );
  firstFrameRimLight.name = "TempleSanctuaryFirstFrameRimLight";
  firstFrameRimLight.position.set(-2.8, preset.altar.height + 1.7, 2.4);
  firstFrameRoot.add(firstFrameRimLight);

  const activationPeakPreset = preset.activationPeak ?? {};
  const activationPeakRoot = new THREE.Group();
  activationPeakRoot.name = "TempleSanctuaryActivationPeakRoot";
  activationPeakRoot.position.set(
    0,
    activationPeakPreset.coreY ?? 1.06,
    activationPeakPreset.z ?? -0.02
  );
  activationPeakRoot.visible = false;
  chamberAnchor.add(activationPeakRoot);

  const activationOuterRing = new THREE.Mesh(
    new THREE.TorusGeometry(
      activationPeakPreset.crownRadius ?? 1.72,
      activationPeakPreset.crownTube ?? 0.012,
      10,
      160
    ),
    makeAxialGlowMaterial({
      color: activationPeakPreset.color ?? "#eef4ff",
      opacity: 0,
    })
  );
  activationOuterRing.name = "TempleSanctuaryActivationOuterRing";
  activationPeakRoot.add(activationOuterRing);

  const activationInnerRing = new THREE.Mesh(
    new THREE.TorusGeometry(
      activationPeakPreset.innerCrownRadius ?? 1.05,
      (activationPeakPreset.crownTube ?? 0.012) * 0.78,
      10,
      144
    ),
    makeAxialGlowMaterial({
      color: activationPeakPreset.accentColor ?? "#9fbaff",
      opacity: 0,
    })
  );
  activationInnerRing.name = "TempleSanctuaryActivationInnerRing";
  activationPeakRoot.add(activationInnerRing);

  const activationBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(
      activationPeakPreset.verticalBeamRadius ?? 0.032,
      activationPeakPreset.verticalBeamRadius ?? 0.032,
      activationPeakPreset.verticalBeamHeight ?? 3.75,
      24,
      1,
      true
    ),
    makeAxialGlowMaterial({
      color: activationPeakPreset.color ?? "#eef4ff",
      opacity: 0,
    })
  );
  activationBeam.name = "TempleSanctuaryActivationVerticalBeam";
  activationPeakRoot.add(activationBeam);

  const activationShockwave = new THREE.Mesh(
    new THREE.RingGeometry(
      Math.max(0.01, (activationPeakPreset.shockwaveRadius ?? 2.65) - 0.09),
      activationPeakPreset.shockwaveRadius ?? 2.65,
      160
    ),
    makeAxialGlowMaterial({
      color: activationPeakPreset.accentColor ?? "#9fbaff",
      opacity: 0,
    })
  );
  activationShockwave.name = "TempleSanctuaryActivationShockwave";
  activationShockwave.rotation.x = -Math.PI / 2;
  activationShockwave.position.set(0, preset.altar.height + 0.016, 0);
  activationShockwave.visible = false;
  decorRoot.add(activationShockwave);

  const activationSparkCount = activationPeakPreset.sparkCount ?? 168;
  const activationSparkPositions = new Float32Array(activationSparkCount * 3);
  const activationSparkBasePositions = new Float32Array(activationSparkCount * 3);
  const activationSparkDirections = new Float32Array(activationSparkCount * 3);
  const activationSparkPhases = new Float32Array(activationSparkCount);

  for (let i = 0; i < activationSparkCount; i += 1) {
    const theta = Math.random() * Math.PI * 2;
    const v = Math.random() * 2 - 1;
    const phi = Math.acos(v);

    const radius = THREE.MathUtils.lerp(
      activationPeakPreset.sparkRadiusMin ?? 0.42,
      activationPeakPreset.sparkRadiusMax ?? 1.12,
      Math.random()
    );

    const dx = Math.sin(phi) * Math.cos(theta);
    const dy = Math.cos(phi);
    const dz = Math.sin(phi) * Math.sin(theta);

    const i3 = i * 3;

    activationSparkDirections[i3 + 0] = dx;
    activationSparkDirections[i3 + 1] = dy;
    activationSparkDirections[i3 + 2] = dz;

    activationSparkBasePositions[i3 + 0] = dx * radius;
    activationSparkBasePositions[i3 + 1] = dy * radius * 0.72;
    activationSparkBasePositions[i3 + 2] = dz * radius;

    activationSparkPositions[i3 + 0] = activationSparkBasePositions[i3 + 0];
    activationSparkPositions[i3 + 1] = activationSparkBasePositions[i3 + 1];
    activationSparkPositions[i3 + 2] = activationSparkBasePositions[i3 + 2];

    activationSparkPhases[i] = Math.random() * Math.PI * 2;
  }

  const activationSparkGeometry = new THREE.BufferGeometry();
  activationSparkGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(activationSparkPositions, 3)
  );

  const activationSparkMaterial = new THREE.PointsMaterial({
    map: softPointTexture,
    alphaMap: softPointTexture,
    alphaTest: softPointTexture ? 0.002 : 0,
    color: new THREE.Color(activationPeakPreset.color ?? "#eef4ff"),
    size: activationPeakPreset.sparkSize ?? 0.025,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    toneMapped: false,
  });

  const activationSparks = new THREE.Points(
    activationSparkGeometry,
    activationSparkMaterial
  );
  activationSparks.name = "TempleSanctuaryActivationSparks";
  activationSparks.visible = false;
  activationPeakRoot.add(activationSparks);

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

  // SCENE01-THRESHOLD-10D вЂ” First Passage Trigger / Soft Scene State Shift.
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

  // SCENE01-THRESHOLD-10E - Passage Prompt / Enter Scene 02 Readiness.
  // Visual prompt only. No teleport, no room switch, no sky/global changes.
  function createPassagePromptTexture() {
    if (typeof document === "undefined") return null;

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "rgba(160,190,255,0)");
    gradient.addColorStop(0.22, "rgba(210,230,255,0.52)");
    gradient.addColorStop(0.5, "rgba(245,250,255,0.88)");
    gradient.addColorStop(0.78, "rgba(210,230,255,0.52)");
    gradient.addColorStop(1, "rgba(160,190,255,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(176, 128, 672, 1);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "500 42px Inter, Arial, sans-serif";
    ctx.letterSpacing = "0.18em";
    ctx.fillStyle = "rgba(238,246,255,0.92)";
    ctx.fillText("PASSAGE READY", canvas.width / 2, 92);

    ctx.font = "400 22px Inter, Arial, sans-serif";
    ctx.fillStyle = "rgba(188,214,255,0.68)";
    ctx.fillText("MOVE FORWARD", canvas.width / 2, 154);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    return texture;
  }

  const passagePromptRoot = new THREE.Group();
  passagePromptRoot.name = "TempleSanctuaryPassagePromptRoot";
  passagePromptRoot.visible = false;
  passagePromptRoot.position.set(0, -0.92, 0.34);
  transitionPortalRoot.add(passagePromptRoot);

  const passagePromptTexture = createPassagePromptTexture();

  const passagePromptSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: passagePromptTexture,
      color: new THREE.Color("#ffffff"),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    })
  );
  passagePromptSprite.name = "TempleSanctuaryPassagePromptSprite";
  passagePromptSprite.scale.set(1.28, 0.32, 1);
  passagePromptSprite.renderOrder = 110;
  passagePromptRoot.add(passagePromptSprite);

  const passagePromptNeedles = new THREE.Group();
  passagePromptNeedles.name = "TempleSanctuaryPassagePromptNeedles";
  passagePromptNeedles.position.set(0, 0.02, 0.02);
  passagePromptRoot.add(passagePromptNeedles);

  function createPassagePromptNeedle(x, y, length = 0.18, width = 0.009) {
    const needle = new THREE.Mesh(
      new THREE.BoxGeometry(length, width, 0.01),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#e8f2ff"),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      })
    );

    needle.position.set(x, y, 0);
    return needle;
  }

  passagePromptNeedles.add(
    createPassagePromptNeedle(-0.72, 0, 0.18, 0.008),
    createPassagePromptNeedle(0.72, 0, 0.18, 0.008),
    createPassagePromptNeedle(-0.54, -0.12, 0.1, 0.006),
    createPassagePromptNeedle(0.54, -0.12, 0.1, 0.006)
  );

  const passagePromptLight = new THREE.PointLight(
    new THREE.Color("#dceaff"),
    0,
    2.6,
    1.8
  );
  passagePromptLight.name = "TempleSanctuaryPassagePromptLight";
  passagePromptLight.position.set(0, -0.18, 0.26);
  passagePromptRoot.add(passagePromptLight);

  // SCENE01-THRESHOLD-10F - Soft Passage State / Pre-Scene02 Handoff.
  // This is a pre-handoff visual/state layer only.
  // It does NOT teleport, does NOT switch rooms, and does NOT touch sky/global runtime.
  const preScene02Root = new THREE.Group();
  preScene02Root.name = "TempleSanctuaryPreScene02Handoff";
  preScene02Root.visible = false;
  preScene02Root.position.set(0, 0, -0.72);
  transitionPortalRoot.add(preScene02Root);

  const preScene02Rings = [];
  const preScene02RingSpecs = [
    { radius: 0.32, z: -0.28, tube: 0.004, opacity: 0.22, speed: -0.12 },
    { radius: 0.54, z: -0.72, tube: 0.0038, opacity: 0.16, speed: 0.09 },
    { radius: 0.78, z: -1.24, tube: 0.0034, opacity: 0.11, speed: -0.062 },
    { radius: 1.08, z: -1.86, tube: 0.003, opacity: 0.075, speed: 0.044 },
    { radius: 1.36, z: -2.62, tube: 0.0026, opacity: 0.052, speed: -0.028 },
  ];

  preScene02RingSpecs.forEach((spec, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(spec.radius, spec.tube, 8, 144),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(index < 2 ? "#f2f8ff" : "#9fbfff"),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      })
    );

    ring.name = `TempleSanctuaryPreScene02DepthRing_${index}`;
    ring.position.z = spec.z;
    ring.renderOrder = 96 + index;
    preScene02Root.add(ring);

    preScene02Rings.push({ ring, ...spec });
  });

  const preScene02StreamCount = 320;
  const preScene02StreamPositions = new Float32Array(preScene02StreamCount * 3);
  const preScene02StreamBasePositions = new Float32Array(preScene02StreamCount * 3);
  const preScene02StreamPhases = new Float32Array(preScene02StreamCount);
  const preScene02StreamSeeds = new Float32Array(preScene02StreamCount);

  for (let i = 0; i < preScene02StreamCount; i += 1) {
    const i3 = i * 3;
    const lane = Math.random();
    const angle = Math.random() * Math.PI * 2;

    const z = THREE.MathUtils.lerp(0.18, -3.2, lane);
    const radius =
      THREE.MathUtils.lerp(1.16, 0.08, lane) * (0.38 + Math.random() * 0.86);

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.68;

    preScene02StreamBasePositions[i3 + 0] = x;
    preScene02StreamBasePositions[i3 + 1] = y;
    preScene02StreamBasePositions[i3 + 2] = z;

    preScene02StreamPositions[i3 + 0] = x;
    preScene02StreamPositions[i3 + 1] = y;
    preScene02StreamPositions[i3 + 2] = z;

    preScene02StreamPhases[i] = Math.random() * Math.PI * 2;
    preScene02StreamSeeds[i] = lane;
  }

  const preScene02StreamGeometry = new THREE.BufferGeometry();
  preScene02StreamGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(preScene02StreamPositions, 3)
  );

  const preScene02StreamMaterial = new THREE.PointsMaterial({
    map: softPointTexture,
    alphaMap: softPointTexture,
    alphaTest: softPointTexture ? 0.001 : 0,
    color: new THREE.Color("#f0f7ff"),
    size: 0.064,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    toneMapped: false,
  });

  const preScene02Streams = new THREE.Points(
    preScene02StreamGeometry,
    preScene02StreamMaterial
  );
  preScene02Streams.name = "TempleSanctuaryPreScene02Streams";
  preScene02Streams.visible = false;
  preScene02Streams.renderOrder = 104;
  preScene02Root.add(preScene02Streams);

  const preScene02GuideLight = new THREE.PointLight(
    new THREE.Color("#edf6ff"),
    0,
    7.2,
    1.42
  );
  preScene02GuideLight.name = "TempleSanctuaryPreScene02GuideLight";
  preScene02GuideLight.position.set(0, 0, -1.18);
  preScene02Root.add(preScene02GuideLight);

  // SCENE02-BOOTSTRAP-01 - Path Into the Unknown Shell.
  // First visual shell for Scene 02. No teleport, no room switch, no sky/global changes.
  const scene02ShellRoot = new THREE.Group();
  scene02ShellRoot.name = "PathIntoUnknownScene02Shell";
  scene02ShellRoot.visible = false;
  scene02ShellRoot.position.set(0, 0, -1.18);
  transitionPortalRoot.add(scene02ShellRoot);

  const scene02VoidCoreMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color("#01040a"),
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    toneMapped: false,
  });

  const scene02VoidCore = new THREE.Mesh(
    new THREE.CircleGeometry(0.82, 128),
    scene02VoidCoreMaterial
  );
  scene02VoidCore.name = "PathIntoUnknownVoidCore";
  scene02VoidCore.position.z = -0.62;
  scene02VoidCore.renderOrder = 118;
  scene02ShellRoot.add(scene02VoidCore);

  const scene02DepthRings = [];
  const scene02DepthRingSpecs = [
    { radius: 0.48, z: -0.42, tube: 0.0038, opacity: 0.22, speed: 0.13 },
    { radius: 0.76, z: -0.98, tube: 0.0034, opacity: 0.17, speed: -0.1 },
    { radius: 1.08, z: -1.68, tube: 0.003, opacity: 0.12, speed: 0.072 },
    { radius: 1.42, z: -2.48, tube: 0.0027, opacity: 0.082, speed: -0.052 },
    { radius: 1.82, z: -3.42, tube: 0.0024, opacity: 0.052, speed: 0.034 },
    { radius: 2.28, z: -4.48, tube: 0.002, opacity: 0.032, speed: -0.024 },
  ];

  scene02DepthRingSpecs.forEach((spec, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(spec.radius, spec.tube, 8, 144),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(index < 2 ? "#f2f8ff" : "#7fa7ff"),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      })
    );

    ring.name = `PathIntoUnknownDepthRing_${index}`;
    ring.position.z = spec.z;
    ring.renderOrder = 120 + index;
    scene02ShellRoot.add(ring);

    scene02DepthRings.push({ ring, ...spec });
  });

  const scene02StreamCount = 420;
  const scene02StreamPositions = new Float32Array(scene02StreamCount * 3);
  const scene02StreamBasePositions = new Float32Array(scene02StreamCount * 3);
  const scene02StreamPhases = new Float32Array(scene02StreamCount);
  const scene02StreamSeeds = new Float32Array(scene02StreamCount);

  for (let i = 0; i < scene02StreamCount; i += 1) {
    const i3 = i * 3;
    const lane = Math.random();
    const angle = Math.random() * Math.PI * 2;

    const z = THREE.MathUtils.lerp(0.24, -5.4, lane);
    const radius =
      THREE.MathUtils.lerp(1.48, 0.06, lane) * (0.34 + Math.random() * 0.92);

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.7;

    scene02StreamBasePositions[i3 + 0] = x;
    scene02StreamBasePositions[i3 + 1] = y;
    scene02StreamBasePositions[i3 + 2] = z;

    scene02StreamPositions[i3 + 0] = x;
    scene02StreamPositions[i3 + 1] = y;
    scene02StreamPositions[i3 + 2] = z;

    scene02StreamPhases[i] = Math.random() * Math.PI * 2;
    scene02StreamSeeds[i] = lane;
  }

  const scene02StreamGeometry = new THREE.BufferGeometry();
  scene02StreamGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(scene02StreamPositions, 3)
  );

  const scene02StreamMaterial = new THREE.PointsMaterial({
    map: softPointTexture,
    alphaMap: softPointTexture,
    alphaTest: softPointTexture ? 0.001 : 0,
    color: new THREE.Color("#eef6ff"),
    size: 0.068,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    toneMapped: false,
  });

  const scene02Streams = new THREE.Points(
    scene02StreamGeometry,
    scene02StreamMaterial
  );
  scene02Streams.name = "PathIntoUnknownForwardStreams";
  scene02Streams.visible = false;
  scene02Streams.renderOrder = 130;
  scene02ShellRoot.add(scene02Streams);

  const scene02GuideLight = new THREE.PointLight(
    new THREE.Color("#edf6ff"),
    0,
    9.2,
    1.35
  );
  scene02GuideLight.name = "PathIntoUnknownGuideLight";
  scene02GuideLight.position.set(0, 0, -2.2);
  scene02ShellRoot.add(scene02GuideLight);

  // SCENE02-BOOTSTRAP-07F вЂ” Scene02 Runtime Container Preparation.
  // Empty container root only. Existing Scene02 visual layers are NOT reparented yet.
  // No teleport, no room switch, no XRRoot changes, no sky changes.
  const scene02RuntimeContainerRoot = new THREE.Group();
  scene02RuntimeContainerRoot.name = "PathIntoUnknownRuntimeContainer";
  scene02RuntimeContainerRoot.visible = false;
  scene02RuntimeContainerRoot.position.set(0, 0, -1.18);
  transitionPortalRoot.add(scene02RuntimeContainerRoot);

  scene02RuntimeContainerRoot.userData =
    createScene02RuntimeContainerStateFromPathScene({
      prepared: false,
      level: 0,
      phase: "not-ready",
      acceptsFutureChildren: true,
      currentChildrenBound: false,
      existingVisualLayersStillInPlace: true,
      boundLayerKeys: [],
    });

  // SCENE02-VISUAL-01 вЂ” Cinematic Path Into the Unknown visual layer.
  // Local authored visual proof only: no sky, no XRRoot, no teleport, no hard room switch.
  function createScene02CinematicSoftDiscTexture({
    size = 128,
    inner = "rgba(190, 230, 255, 0.95)",
    mid = "rgba(100, 170, 255, 0.18)",
    outer = "rgba(20, 40, 90, 0)",
  } = {}) {
    if (typeof document === "undefined") return null;

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d");
    const center = size * 0.5;
    const gradient = context.createRadialGradient(
      center,
      center,
      0,
      center,
      center,
      center
    );

    gradient.addColorStop(0, inner);
    gradient.addColorStop(0.28, mid);
    gradient.addColorStop(1, outer);

    context.clearRect(0, 0, size, size);
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);

    if ("SRGBColorSpace" in THREE) {
      texture.colorSpace = THREE.SRGBColorSpace;
    }

    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;

    return texture;
  }

  const scene02CinematicPathRoot = new THREE.Group();
  scene02CinematicPathRoot.name = "Scene02CinematicPathIntoUnknown";
  scene02CinematicPathRoot.visible = false;
  scene02CinematicPathRoot.position.set(0, 0, -1.05);
  scene02CinematicPathRoot.renderOrder = 80;
  scene02RuntimeContainerRoot.add(scene02CinematicPathRoot);

  const scene02CinematicVoidMaterial = new THREE.MeshBasicMaterial({
    color: 0x01030a,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
  });

  const scene02CinematicVoid = new THREE.Mesh(
    new THREE.CircleGeometry(1.85, 128),
    scene02CinematicVoidMaterial
  );
  scene02CinematicVoid.name = "Scene02CinematicVoidCore";
  scene02CinematicVoid.position.set(0, 0, -5.45);
  scene02CinematicVoid.renderOrder = 82;
  scene02CinematicPathRoot.add(scene02CinematicVoid);

  const scene02SoftDiscTexture = createScene02CinematicSoftDiscTexture({
    inner: "rgba(210, 240, 255, 0.9)",
    mid: "rgba(80, 155, 255, 0.16)",
    outer: "rgba(10, 25, 70, 0)",
  });

  const scene02PortalPullMaterial = new THREE.SpriteMaterial({
    map: scene02SoftDiscTexture,
    color: 0x8fc8ff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });

  const scene02PortalPullSprite = new THREE.Sprite(scene02PortalPullMaterial);
  scene02PortalPullSprite.name = "Scene02PortalPullAura";
  scene02PortalPullSprite.position.set(0, 0, -2.2);
  scene02PortalPullSprite.scale.set(3.4, 3.4, 1);
  scene02PortalPullSprite.renderOrder = 81;
  scene02CinematicPathRoot.add(scene02PortalPullSprite);

  const scene02TunnelRings = [];
  const scene02TunnelRingGeometry = new THREE.TorusGeometry(1, 0.006, 8, 128);

  for (let i = 0; i < 26; i += 1) {
    const material = new THREE.MeshBasicMaterial({
      color: 0x8edaff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });

    material.color.setHSL(0.56 + (i % 5) * 0.025, 0.62, 0.68);

    const ring = new THREE.Mesh(scene02TunnelRingGeometry, material);
    ring.name = `Scene02DepthRing_${String(i).padStart(2, "0")}`;
    ring.renderOrder = 83 + i;
    ring.userData.depthSeed = i / 26;
    ring.userData.rotationSeed = i * 0.43;
    ring.userData.rotationSpeed = 0.035 + (i % 4) * 0.013;
    ring.position.set(0, 0, -0.8 - i * 0.28);
    ring.scale.setScalar(0.55 + i * 0.045);

    scene02TunnelRings.push(ring);
    scene02CinematicPathRoot.add(ring);
  }

  const scene02PathStreakCount = 128;
  const scene02PathStreakPositions = new Float32Array(
    scene02PathStreakCount * 2 * 3
  );

  const scene02PathStreakSeeds = Array.from(
    { length: scene02PathStreakCount },
    (_, index) => {
      const angle = index * 2.399963 + (index % 7) * 0.19;
      return {
        angle,
        radius: 0.28 + (((index * 37) % 100) / 100) * 1.35,
        z: -7.4 + (((index * 53) % 100) / 100) * 7.2,
        speed: 0.62 + (((index * 29) % 100) / 100) * 1.45,
        length: 0.16 + (((index * 17) % 100) / 100) * 0.42,
        twist: index % 2 === 0 ? 1 : -1,
      };
    }
  );

  const scene02PathStreakGeometry = new THREE.BufferGeometry();
  scene02PathStreakGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(scene02PathStreakPositions, 3)
  );

  const scene02PathStreakMaterial = new THREE.LineBasicMaterial({
    color: 0xb9eaff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });

  const scene02PathStreakLines = new THREE.LineSegments(
    scene02PathStreakGeometry,
    scene02PathStreakMaterial
  );
  scene02PathStreakLines.name = "Scene02ForwardStreakField";
  scene02PathStreakLines.renderOrder = 90;
  scene02CinematicPathRoot.add(scene02PathStreakLines);

  // SCENE02-VISUAL-02 вЂ” additional acceleration streak field.
  // Gives the path stronger forward motion without camera teleport or room switch.
  const scene02PathAccelerationCount = 96;
  const scene02PathAccelerationPositions = new Float32Array(
    scene02PathAccelerationCount * 2 * 3
  );

  const scene02PathAccelerationSeeds = Array.from(
    { length: scene02PathAccelerationCount },
    (_, index) => {
      const lane = index % 6;
      const angle = index * 2.399963 + lane * 0.37;

      return {
        angle,
        lane,
        radius: 0.48 + (((index * 41) % 100) / 100) * 1.55,
        z: -8.6 + (((index * 67) % 100) / 100) * 8.4,
        speed: 1.15 + (((index * 23) % 100) / 100) * 2.8,
        length: 0.38 + (((index * 19) % 100) / 100) * 0.78,
        twist: index % 2 === 0 ? 1 : -1,
        brightness: 0.62 + (((index * 13) % 100) / 100) * 0.38,
      };
    }
  );

  const scene02PathAccelerationGeometry = new THREE.BufferGeometry();
  scene02PathAccelerationGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(scene02PathAccelerationPositions, 3)
  );

  const scene02PathAccelerationMaterial = new THREE.LineBasicMaterial({
    color: 0xd8f6ff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });

  const scene02PathAccelerationLines = new THREE.LineSegments(
    scene02PathAccelerationGeometry,
    scene02PathAccelerationMaterial
  );
  scene02PathAccelerationLines.name = "Scene02AccelerationStreakField";
  scene02PathAccelerationLines.renderOrder = 96;
  scene02CinematicPathRoot.add(scene02PathAccelerationLines);

  const scene02SideRailCount = 18;
  const scene02SideRailPositions = new Float32Array(scene02SideRailCount * 2 * 3);
  const scene02SideRailSeeds = Array.from(
    { length: scene02SideRailCount },
    (_, index) => ({
      angle: index * ((Math.PI * 2) / scene02SideRailCount),
      offset: (index % 3) * 0.17,
      phase: index * 0.41,
    })
  );

  const scene02SideRailGeometry = new THREE.BufferGeometry();
  scene02SideRailGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(scene02SideRailPositions, 3)
  );

  const scene02SideRailMaterial = new THREE.LineBasicMaterial({
    color: 0x72cfff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });

  const scene02SideRailLines = new THREE.LineSegments(
    scene02SideRailGeometry,
    scene02SideRailMaterial
  );
  scene02SideRailLines.name = "Scene02PeripheralPullRails";
  scene02SideRailLines.renderOrder = 94;
  scene02CinematicPathRoot.add(scene02SideRailLines);

  const scene02HazeSprites = [];
  const scene02HazeTexture = createScene02CinematicSoftDiscTexture({
    size: 96,
    inner: "rgba(170, 220, 255, 0.42)",
    mid: "rgba(80, 130, 240, 0.10)",
    outer: "rgba(0, 0, 20, 0)",
  });

  for (let i = 0; i < 10; i += 1) {
    const hazeMaterial = new THREE.SpriteMaterial({
      map: scene02HazeTexture,
      color: 0x6aa8ff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });

    const haze = new THREE.Sprite(hazeMaterial);
    haze.name = `Scene02LocalBreathHaze_${String(i).padStart(2, "0")}`;
    haze.position.set(
      Math.cos(i * 1.71) * (0.35 + (i % 4) * 0.18),
      Math.sin(i * 1.37) * (0.22 + (i % 5) * 0.11),
      -1.4 - i * 0.46
    );
    const hazeScale = 0.75 + (i % 5) * 0.24;
    haze.scale.set(hazeScale, hazeScale, 1);
    haze.renderOrder = 78;
    haze.userData.baseX = haze.position.x;
    haze.userData.baseY = haze.position.y;
    haze.userData.baseZ = haze.position.z;
    haze.userData.phase = i * 0.73;

    scene02HazeSprites.push(haze);
    scene02CinematicPathRoot.add(haze);
  }

  root.userData.scene02CinematicPath = {
    version: "scene02-cinematic-path-v0.1",
    active: false,
    level: 0,
    mode: "visual-layer-only",
    safety: {
      touchesSkyNow: false,
      touchesXRRootNow: false,
      performsTeleportNow: false,
      performsRoomSwitchNow: false,
    },
  };

  // SCENE02-BOOTSTRAP-03 - Scene02 Visual Isolation Layer.
  // This starts separating Scene 02 as its own visual state.
  // No teleport, no room switch, no sky/global runtime changes.
  const scene02IsolationRoot = new THREE.Group();
  scene02IsolationRoot.name = "PathIntoUnknownVisualIsolationLayer";
  scene02IsolationRoot.visible = false;
  scene02IsolationRoot.position.set(0, 0, -1.72);
  transitionPortalRoot.add(scene02IsolationRoot);

  const scene02IsolationVeilMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color("#02060d"),
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    toneMapped: false,
  });

  const scene02IsolationVeil = new THREE.Mesh(
    new THREE.CircleGeometry(1.42, 128),
    scene02IsolationVeilMaterial
  );
  scene02IsolationVeil.name = "PathIntoUnknownIsolationVeil";
  scene02IsolationVeil.position.z = -0.84;
  scene02IsolationVeil.renderOrder = 136;
  scene02IsolationRoot.add(scene02IsolationVeil);

  const scene02IsolationRings = [];
  const scene02IsolationRingSpecs = [
    { radius: 0.62, z: -0.46, tube: 0.0032, opacity: 0.12, speed: 0.078 },
    { radius: 1.04, z: -1.14, tube: 0.0028, opacity: 0.082, speed: -0.054 },
    { radius: 1.56, z: -2.08, tube: 0.0024, opacity: 0.052, speed: 0.034 },
    { radius: 2.16, z: -3.26, tube: 0.002, opacity: 0.032, speed: -0.022 },
  ];

  scene02IsolationRingSpecs.forEach((spec, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(spec.radius, spec.tube, 8, 144),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(index < 1 ? "#eaf3ff" : "#769fff"),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      })
    );

    ring.name = `PathIntoUnknownIsolationRing_${index}`;
    ring.position.z = spec.z;
    ring.renderOrder = 138 + index;
    scene02IsolationRoot.add(ring);

    scene02IsolationRings.push({ ring, ...spec });
  });

  const scene02IsolationStreamCount = 260;
  const scene02IsolationStreamPositions = new Float32Array(scene02IsolationStreamCount * 3);
  const scene02IsolationStreamBasePositions = new Float32Array(scene02IsolationStreamCount * 3);
  const scene02IsolationStreamPhases = new Float32Array(scene02IsolationStreamCount);
  const scene02IsolationStreamSeeds = new Float32Array(scene02IsolationStreamCount);

  for (let i = 0; i < scene02IsolationStreamCount; i += 1) {
    const i3 = i * 3;
    const lane = Math.random();
    const angle = Math.random() * Math.PI * 2;

    const z = THREE.MathUtils.lerp(0.18, -4.8, lane);
    const radius =
      THREE.MathUtils.lerp(1.64, 0.04, lane) * (0.28 + Math.random() * 0.92);

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.68;

    scene02IsolationStreamBasePositions[i3 + 0] = x;
    scene02IsolationStreamBasePositions[i3 + 1] = y;
    scene02IsolationStreamBasePositions[i3 + 2] = z;

    scene02IsolationStreamPositions[i3 + 0] = x;
    scene02IsolationStreamPositions[i3 + 1] = y;
    scene02IsolationStreamPositions[i3 + 2] = z;

    scene02IsolationStreamPhases[i] = Math.random() * Math.PI * 2;
    scene02IsolationStreamSeeds[i] = lane;
  }

  const scene02IsolationStreamGeometry = new THREE.BufferGeometry();
  scene02IsolationStreamGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(scene02IsolationStreamPositions, 3)
  );

  const scene02IsolationStreamMaterial = new THREE.PointsMaterial({
    map: softPointTexture,
    alphaMap: softPointTexture,
    alphaTest: softPointTexture ? 0.001 : 0,
    color: new THREE.Color("#eef6ff"),
    size: 0.052,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    toneMapped: false,
  });

  const scene02IsolationStreams = new THREE.Points(
    scene02IsolationStreamGeometry,
    scene02IsolationStreamMaterial
  );
  scene02IsolationStreams.name = "PathIntoUnknownIsolationStreams";
  scene02IsolationStreams.visible = false;
  scene02IsolationStreams.renderOrder = 144;
  scene02IsolationRoot.add(scene02IsolationStreams);

  const scene02IsolationLight = new THREE.PointLight(
    new THREE.Color("#dceaff"),
    0,
    8.8,
    1.5
  );
  scene02IsolationLight.name = "PathIntoUnknownIsolationLight";
  scene02IsolationLight.position.set(0, 0.02, -1.8);
  scene02IsolationRoot.add(scene02IsolationLight);

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
  let activationPeakAge = 999;
  let activationPeakLevel = 0;
  let transitionReadinessLevel = 0;
  let transitionZoneLevel = 0;
  let firstPassageHoldTime = 0;
  let firstPassageTriggered = false;
  let firstPassageLevel = 0;
  let passagePromptLevel = 0;
  let enterReadinessLevel = 0;
  let preScene02HoldTime = 0;
  let preScene02HandoffTriggered = false;
  let preScene02HandoffLevel = 0;
  let scene02ShellHoldTime = 0;
  let scene02ShellActivated = false;
  let scene02ShellLevel = 0;
  let scene02VisualIsolationHoldTime = 0;
  let scene02VisualIsolationTriggered = false;
  let scene02VisualIsolationLevel = 0;
  let scene01SoftFadeLevel = 0;
  let scene02SwitchContractHoldTime = 0;
  let scene02SwitchContractReady = false;
  let scene02SwitchContractLevel = 0;
  let scene02RuntimeSwitchStubHoldTime = 0;
  let scene02RuntimeSwitchStubArmed = false;
  let scene02RuntimeSwitchStubLevel = 0;
  let scene02AdapterObjectHoldTime = 0;
  let scene02AdapterObjectReady = false;
  let scene02AdapterObjectLevel = 0;
  let scene02LocalSceneIdSwitchHoldTime = 0;
  let scene02LocalSceneIdSwitchReady = false;
  let scene02LocalSceneIdSwitchLevel = 0;
  let scene02SemanticVisualPriorityLevel = 0;
  let scene02RuntimeContainerHoldTime = 0;
  let scene02RuntimeContainerPrepared = false;
  let scene02RuntimeContainerLevel = 0;
  let scene02ContainerBindingContractHoldTime = 0;
  let scene02ContainerBindingContractReady = false;
  let scene02ContainerBindingContractLevel = 0;
  let scene02ContainerBindingPreflightHoldTime = 0;
  let scene02ContainerBindingPreflightReady = false;
  let scene02ContainerBindingPreflightLevel = 0;
  let scene02ContainerActualBindingHoldTime = 0;
  let scene02ContainerActualBindingRequested = false;
  let scene02ContainerActualBindingComplete = false;
  let scene02ContainerActualBindingFailed = false;
  let scene02ContainerActualBindingLevel = 0;

  const scene02OriginalParents = new Map();

  // SCENE02-BOOTSTRAP-02 - minimal local scene-state registry.
  // This is intentionally local to Scene 01 runtime for now.
  // No room switch, no teleport, no XRRoot changes.
  const localSceneStateRegistry = {
    scene01: {
      id: "scene01-sanctuary",
      title: "Sanctuary / Membrane Chamber",
      status: "active",
      phase: "arrival",
      level: 1,
      supportFadeLevel: 0,
      isCurrent: true,
      isComplete: false,
    },

    scene02: {
      id: "scene02-path-into-unknown",
      title: "Path Into the Unknown",
      status: "dormant",
      phase: "locked",
      shellActivated: false,
      shellLevel: 0,
      visualIsolationTriggered: false,
      visualIsolationLevel: 0,
      handoffReady: false,
      switchContractReady: false,
      switchContractLevel: 0,
      switchContract: null,
      runtimeSwitchStubArmed: false,
      runtimeSwitchStubLevel: 0,
      runtimeSwitchStub: null,
      adapterObjectReady: false,
      adapterObjectLevel: 0,
      adapterObject: null,
      runtimeContainerPrepared: false,
      runtimeContainerLevel: 0,
      runtimeContainer: null,
      containerBindingContractReady: false,
      containerBindingContractLevel: 0,
      containerBindingContract: null,
      containerBindingPreflightReady: false,
      containerBindingPreflightLevel: 0,
      containerBindingPreflight: null,
      isCurrent: false,
      isComplete: false,
    },
  };

  function updateLocalSceneStateRegistry({
    scene01Phase,
    scene01Complete = false,
    scene01SupportFadeValue = 0,
    scene02Status,
    scene02Phase,
    scene02ShellActive,
    scene02ShellValue,
    scene02VisualIsolationActive = false,
    scene02VisualIsolationValue = 0,
    scene02HandoffReady,
    scene02SwitchContractReadyValue = false,
    scene02SwitchContractLevelValue = 0,
    scene02SwitchContract = null,
    scene02RuntimeSwitchStubArmedValue = false,
    scene02RuntimeSwitchStubLevelValue = 0,
    scene02RuntimeSwitchStub = null,
    scene02AdapterObjectReadyValue = false,
    scene02AdapterObjectLevelValue = 0,
    scene02AdapterObject = null,
    scene02RuntimeContainerPreparedValue = false,
    scene02RuntimeContainerLevelValue = 0,
    scene02RuntimeContainer = null,
    scene02ContainerBindingContractReadyValue = false,
    scene02ContainerBindingContractLevelValue = 0,
    scene02ContainerBindingContract = null,
    scene02ContainerBindingPreflightReadyValue = false,
    scene02ContainerBindingPreflightLevelValue = 0,
    scene02ContainerBindingPreflight = null,
  }) {
  localSceneStateRegistry.scene01.phase = scene01Phase;
  localSceneStateRegistry.scene01.isComplete = scene01Complete;
  localSceneStateRegistry.scene01.supportFadeLevel = scene01SupportFadeValue;
  localSceneStateRegistry.scene01.status = scene01Complete
    ? "handoff-ready"
    : "active";
    localSceneStateRegistry.scene01.isCurrent = !scene02HandoffReady;

    localSceneStateRegistry.scene02.status = scene02Status;
    localSceneStateRegistry.scene02.phase = scene02Phase;
    localSceneStateRegistry.scene02.shellActivated = scene02ShellActive;
    localSceneStateRegistry.scene02.shellLevel = scene02ShellValue;
    localSceneStateRegistry.scene02.visualIsolationTriggered = scene02VisualIsolationActive;
    localSceneStateRegistry.scene02.visualIsolationLevel = scene02VisualIsolationValue;
    localSceneStateRegistry.scene02.handoffReady = scene02HandoffReady;
    localSceneStateRegistry.scene02.switchContractReady = scene02SwitchContractReadyValue;
    localSceneStateRegistry.scene02.switchContractLevel = scene02SwitchContractLevelValue;
    localSceneStateRegistry.scene02.switchContract = scene02SwitchContract;
    localSceneStateRegistry.scene02.runtimeSwitchStubArmed = scene02RuntimeSwitchStubArmedValue;
    localSceneStateRegistry.scene02.runtimeSwitchStubLevel = scene02RuntimeSwitchStubLevelValue;
    localSceneStateRegistry.scene02.runtimeSwitchStub = scene02RuntimeSwitchStub;
    // SCENE02-BOOTSTRAP-07C вЂ” registry binding only.
    // Adapter object is now exposed through sceneRegistry,
    // but this does not switch scenes, teleport, or mutate currentLocalSceneId.
    localSceneStateRegistry.scene02.adapterObjectReady = scene02AdapterObjectReadyValue;
    localSceneStateRegistry.scene02.adapterObjectLevel = scene02AdapterObjectLevelValue;
    localSceneStateRegistry.scene02.adapterObject = scene02AdapterObject;

    // SCENE02-BOOTSTRAP-07F вЂ” runtime container registry binding.
    // This only exposes the prepared empty container through sceneRegistry.
    // It does not move visual layers yet.
    localSceneStateRegistry.scene02.runtimeContainerPrepared =
      scene02RuntimeContainerPreparedValue;
    localSceneStateRegistry.scene02.runtimeContainerLevel =
      scene02RuntimeContainerLevelValue;
    localSceneStateRegistry.scene02.runtimeContainer = scene02RuntimeContainer;

    // SCENE02-BOOTSTRAP-07G вЂ” container binding contract registry binding.
    // Contract only. Existing layers are not reparented in this step.
    localSceneStateRegistry.scene02.containerBindingContractReady =
      scene02ContainerBindingContractReadyValue;
    localSceneStateRegistry.scene02.containerBindingContractLevel =
      scene02ContainerBindingContractLevelValue;
    localSceneStateRegistry.scene02.containerBindingContract =
      scene02ContainerBindingContract;

    // SCENE02-BOOTSTRAP-07H вЂ” binding preflight registry binding.
    // Preflight only. Existing layers are not reparented in this step.
    localSceneStateRegistry.scene02.containerBindingPreflightReady =
      scene02ContainerBindingPreflightReadyValue;
    localSceneStateRegistry.scene02.containerBindingPreflightLevel =
      scene02ContainerBindingPreflightLevelValue;
    localSceneStateRegistry.scene02.containerBindingPreflight =
      scene02ContainerBindingPreflight;

    localSceneStateRegistry.scene02.isCurrent = scene02HandoffReady;
  }

  root.userData.sceneRegistry = localSceneStateRegistry;
  root.userData.scene02 = localSceneStateRegistry.scene02;
  // SCENE02-BOOTSTRAP-07D - local scene id state.
  // Semantic marker only. No teleport, no visual switch, no room switch.
  root.userData.currentLocalSceneId = root.userData.currentLocalSceneId ?? "scene01-sanctuary";
  root.userData.previousLocalSceneId = root.userData.previousLocalSceneId ?? null;
  root.userData.localSceneSwitchMode = root.userData.localSceneSwitchMode ?? "none";

  function createScene02SwitchContract(options = {}) {
    return createScene02SwitchContractFromPathScene(options);
  }

  root.userData.scene02SwitchContract = createScene02SwitchContract({
    ready: false,
    level: 0,
    phase: "not-ready",
    proximity: 0,
    scene02ShellValue: 0,
    scene02VisualIsolationValue: 0,
  });

  function createScene02RuntimeSwitchStub(options = {}) {
    return createScene02RuntimeSwitchStubFromPathScene(options);
  }

  // SCENE02-BOOTSTRAP-07A вЂ” Runtime Switch Diagnostic Marker Only.
  // Diagnostic only: no adapter, no room switch, no teleport, no visual changes.
  function createScene02RuntimeDiagnostic(options = {}) {
    return createScene02RuntimeDiagnosticFromPathScene(options);
  }

  // SCENE02-BOOTSTRAP-07B - Adapter Object Only.
  // Object-only adapter descriptor. No registry mutation, no currentLocalSceneId,
  // no room switch, no teleport, no visual changes.
  function createScene02AdapterObject(options = {}) {
    return createScene02AdapterObjectFromPathScene(options);
  }

  // SCENE02-BOOTSTRAP-07G вЂ” Container Binding Contract Only.
  // Contract only: no reparent, no room switch, no teleport, no visual movement.
  function createScene02ContainerBindingContract(options = {}) {
    return createScene02ContainerBindingContractFromPathScene(options);
  }

  // SCENE02-BOOTSTRAP-07H вЂ” Binding Preflight Only.
  // This captures safe transform/parent snapshots for future binding.
  // It does NOT reparent, move objects, change visuals, switch rooms, or touch sky.
  function roundScene02PreflightNumber(value) {
    return roundScene02PreflightNumberFromPathScene(value);
  }

  function createScene02TransformSnapshot(object) {
    return createScene02TransformSnapshotFromPathScene(object);
  }

  function createScene02ContainerBindingPreflight(options = {}) {
    return createScene02ContainerBindingPreflightFromPathScene(options);
  }

  // SCENE02-BOOTSTRAP-08A вЂ” Controlled Container Binding helpers.
  // Actual binding, but controlled: preserves world transform and runs once.
  function createScene02BindingRuntimeSnapshot(object) {
    return createScene02BindingRuntimeSnapshotFromPathScene(object);
  }

  function bindScene02LayerToContainerPreserveWorld(options = {}) {
    return bindScene02LayerToContainerPreserveWorldFromPathScene({
      ...options,
      originalParents: scene02OriginalParents,
    });
  }

  function createScene02ActualBindingState(options = {}) {
    return createScene02ActualBindingStateFromPathScene({
      ...options,
      originalParents: scene02OriginalParents,
    });
  }

  root.userData.scene02RuntimeSwitch = createScene02RuntimeSwitchStub({
    armed: false,
    level: 0,
    phase: "not-ready",
    proximity: 0,
    switchContract: null,
  });
  root.userData.scene02RuntimeDiagnostic = createScene02RuntimeDiagnostic({
    transitionState: root.userData.scene01Transition ?? null,
    switchContract: root.userData.scene02SwitchContract ?? null,
    runtimeSwitchStub: root.userData.scene02RuntimeSwitch ?? null,
    proximity: 0,
  });
  root.userData.scene02AdapterObject = createScene02AdapterObject({
    ready: false,
    level: 0,
    phase: "not-ready",
    diagnostic: root.userData.scene02RuntimeDiagnostic ?? null,
    switchContract: root.userData.scene02SwitchContract ?? null,
    runtimeSwitchStub: root.userData.scene02RuntimeSwitch ?? null,
    proximity: 0,
  });
  root.userData.scene02ContainerBindingContract =
    createScene02ContainerBindingContract({
      ready: false,
      level: 0,
      phase: "not-ready",
      container: root.userData.scene02RuntimeContainer ?? null,
      adapterObject: root.userData.scene02AdapterObject ?? null,
      currentLocalSceneId: root.userData.currentLocalSceneId ?? "scene01-sanctuary",
      targets: {
        scene02ShellRoot,
        scene02IsolationRoot,
        preScene02Root,
        firstPassageRoot,
        passageRoot,
      },
    });
  root.userData.scene02ContainerBindingPreflight =
    createScene02ContainerBindingPreflight({
      ready: false,
      level: 0,
      phase: "not-ready",
      bindingContract: root.userData.scene02ContainerBindingContract ?? null,
      containerRoot: scene02RuntimeContainerRoot ?? null,
      currentLocalSceneId: root.userData.currentLocalSceneId ?? "scene01-sanctuary",
      targets: {
        scene02ShellRoot,
        scene02IsolationRoot,
        preScene02Root,
        firstPassageRoot,
        passageRoot,
      },
    });
  root.userData.scene02ContainerActualBinding =
    createScene02ActualBindingState({
      requested: false,
      complete: false,
      failed: false,
      level: 0,
      phase: "not-ready",
      results: [],
      containerRoot: scene02RuntimeContainerRoot ?? null,
    });

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
    enterReady: false,
    enterReadiness: 0,
    promptVisible: false,
    preScene02HandoffTriggered: false,
    preScene02HandoffLevel: 0,
    preScene02Hold: 0,
    handoffReady: false,
    scene02ShellActivated: false,
    scene02ShellLevel: 0,
    scene02ShellHold: 0,
    scene02ShellReady: false,
    scene02HandoffReady: false,
    scene02SwitchContractReady: false,
    scene02SwitchContractLevel: 0,
    scene02SwitchContractPhase: "not-ready",
    scene02RuntimeSwitchStubArmed: false,
    scene02RuntimeSwitchStubLevel: 0,
    scene02RuntimeSwitchStubPhase: "not-ready",
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

      if (
        transformationCueEnabled &&
        ritualChargeComplete &&
        !transformationCueTriggered
      ) {
        transformationCueTriggered = true;
        activationPeakAge = 0;
      }

      if (activationPeakAge < 999) {
        activationPeakAge += deltaSeconds;
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

      const activationPeak = preset.activationPeak ?? {};
      const activationPeakEnabled = activationPeak.enabled !== false;
      const activationChargeAmount = activationPeakEnabled
        ? THREE.MathUtils.smoothstep(
            ritualChargeLevel,
            activationPeak.chargeStart ?? 0.18,
            activationPeak.chargeEnd ?? 0.96
          )
        : 0;
      const activationPeakFlashAmount = activationPeakEnabled
        ? Math.exp(-activationPeakAge * (activationPeak.flashDecay ?? 1.62))
        : 0;
      const activationPeakTarget = activationPeakEnabled
        ? THREE.MathUtils.clamp(
            activationChargeAmount * 0.62 + activationPeakFlashAmount,
            0,
            1
          )
        : 0;

      activationPeakLevel = THREE.MathUtils.lerp(
        activationPeakLevel,
        activationPeakTarget,
        activationPeak.smoothing ?? 0.13
      );

      const activationPeakBreath =
        0.5 + 0.5 * Math.sin(t * (activationPeak.pulseSpeed ?? 2.2));
      const activationPeakLightAmount =
        activationPeakLevel * (0.72 + activationPeakBreath * 0.28);

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
      const firstFrame = preset.firstFrameComposition ?? {};
      const firstFrameEnabled = firstFrame.enabled !== false;
      const firstFrameProximityFade =
        1 -
        THREE.MathUtils.smoothstep(
          proximityLevel,
          firstFrame.fadeAtProximityStart ?? 0.2,
          firstFrame.fadeAtProximityEnd ?? 0.78
        );
      const firstFrameOpeningFade =
        1 -
        THREE.MathUtils.clamp(
          openingStateLevel * (firstFrame.openingFade ?? 0.72),
          0,
          1
        );
      const firstFrameAmount = firstFrameEnabled
        ? THREE.MathUtils.clamp(
            firstFrameProximityFade * firstFrameOpeningFade,
            0,
            1
          )
        : 0;
      const firstFrameBreath =
        0.5 + 0.5 * Math.sin(t * (firstFrame.breathSpeed ?? 0.34));
      const firstFramePulse = THREE.MathUtils.lerp(
        0.78,
        1.08,
        firstFrameBreath
      );
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
        thresholdAmount * (atmospherePreset.thresholdLightBoost ?? 0.18) +
        activationPeakLightAmount * (activationPeak.lightBoost ?? 0.78) +
        activationPeakFlashAmount * (activationPeak.flashLightBoost ?? 1.82) +
        firstFrameAmount * (firstFrame.chamberLightBoost ?? 0.48) * firstFramePulse;

      chamberFillLight.intensity =
        centralBaseLight *
        0.12 *
        readabilityBoost *
        (0.92 + openingStateLevel * 0.08) +
        firstFrameAmount * (firstFrame.fillLightBoost ?? 0.08) * firstFramePulse;
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

      portalBacklight.intensity +=
        activationPeakFlashAmount * (activationPeak.portalKick ?? 0.36);

      activationPeakRoot.visible = activationPeakLevel > 0.012;
      activationShockwave.visible = activationPeakLevel > 0.012;

      if (activationPeakRoot.visible) {
        activationPeakRoot.rotation.z +=
          deltaSeconds * (0.014 + activationPeakLevel * 0.035);
        activationOuterRing.rotation.z +=
          deltaSeconds * (0.08 + activationPeakLevel * 0.22);
        activationInnerRing.rotation.z -=
          deltaSeconds * (0.12 + activationPeakLevel * 0.34);

        const activationScale =
          1 +
          activationChargeAmount * 0.025 +
          activationPeakFlashAmount * 0.22 +
          activationPeakBreath * 0.012;

        activationOuterRing.scale.setScalar(activationScale);
        activationInnerRing.scale.setScalar(
          1 + activationChargeAmount * 0.018 + activationPeakFlashAmount * 0.16
        );
        activationBeam.scale.setScalar(1 + activationPeakFlashAmount * 0.18);
      }

      activationOuterRing.material.opacity =
        activationChargeAmount * (activationPeak.chargeRingOpacity ?? 0.115) +
        activationPeakFlashAmount * (activationPeak.flashRingOpacity ?? 0.26);

      activationInnerRing.material.opacity =
        activationChargeAmount * (activationPeak.innerRingOpacity ?? 0.085) +
        activationPeakFlashAmount * (activationPeak.flashRingOpacity ?? 0.26) * 0.72;

      activationBeam.material.opacity =
        activationChargeAmount * (activationPeak.beamOpacity ?? 0.068) +
        activationPeakFlashAmount * (activationPeak.flashBeamOpacity ?? 0.16);

      activationShockwave.material.opacity =
        activationPeakLevel * (activationPeak.shockwaveOpacity ?? 0.13) +
        activationPeakFlashAmount * (activationPeak.flashShockwaveOpacity ?? 0.24);
      activationShockwave.scale.setScalar(
        1 + activationPeakFlashAmount * 0.34 + activationPeakBreath * 0.025
      );

      activationSparks.visible = activationPeakLevel > 0.02;
      activationSparkMaterial.opacity =
        activationPeakLevel *
        (activationPeak.sparkOpacity ?? 0.44) *
        (0.55 + activationPeakFlashAmount * 0.45);

      if (activationSparks.visible) {
        const activationSparkAttr =
          activationSparkGeometry.getAttribute("position");
        const activationExpansion =
          activationPeakFlashAmount * (activationPeak.sparkExpansion ?? 1.95) +
          activationChargeAmount * 0.22;
        const activationLift =
          activationPeakFlashAmount * (activationPeak.sparkLift ?? 0.34);

        for (let i = 0; i < activationSparkCount; i += 1) {
          const i3 = i * 3;
          const phase = activationSparkPhases[i];
          const swirl =
            Math.sin(t * 1.18 + phase) *
            (0.018 + activationPeakLevel * 0.035);

          activationSparkPositions[i3 + 0] =
            activationSparkBasePositions[i3 + 0] +
            activationSparkDirections[i3 + 0] * activationExpansion +
            Math.cos(t * 0.82 + phase) * swirl;

          activationSparkPositions[i3 + 1] =
            activationSparkBasePositions[i3 + 1] +
            activationSparkDirections[i3 + 1] * activationExpansion * 0.72 +
            activationLift +
            Math.sin(t * 0.96 + phase) * swirl * 0.76;

          activationSparkPositions[i3 + 2] =
            activationSparkBasePositions[i3 + 2] +
            activationSparkDirections[i3 + 2] * activationExpansion +
            Math.sin(t * 0.68 + phase) * swirl;
        }

        activationSparkAttr.needsUpdate = true;
        activationSparks.rotation.y +=
          deltaSeconds * (0.04 + activationPeakLevel * 0.08);
      }

      if (typeof firstFrameRoot !== "undefined" && firstFrameRoot) {
        firstFrameRoot.visible = firstFrameAmount > 0.01;

        if (firstFrameRoot.visible) {
          firstFrameRoot.scale.setScalar(1 + firstFrameBreath * 0.018);
          firstFrameRoot.rotation.z +=
            deltaSeconds * (firstFrame.haloRotation ?? 0.006);
        }

        firstFrameBackVeil.material.opacity = THREE.MathUtils.lerp(
          firstFrameBackVeil.material.opacity,
          firstFrameAmount * (firstFrame.backVeilOpacity ?? 0.026),
          0.055
        );
        firstFrameOuterHalo.material.opacity = THREE.MathUtils.lerp(
          firstFrameOuterHalo.material.opacity,
          firstFrameAmount * (firstFrame.haloOpacity ?? 0.112),
          0.055
        );
        firstFrameInnerHalo.material.opacity = THREE.MathUtils.lerp(
          firstFrameInnerHalo.material.opacity,
          firstFrameAmount * (firstFrame.innerHaloOpacity ?? 0.058),
          0.055
        );
        firstFrameSeamMaterial.opacity = THREE.MathUtils.lerp(
          firstFrameSeamMaterial.opacity,
          firstFrameAmount * (firstFrame.verticalSeamOpacity ?? 0.046),
          0.055
        );

        firstFrameAisleRoot.children.forEach((line) => {
          line.material.opacity = THREE.MathUtils.lerp(
            line.material.opacity,
            firstFrameAmount *
              (firstFrame.aisleOpacity ?? 0.036) *
              (line.userData.opacityScale ?? 1) *
              (0.72 + firstFrameBreath * 0.28),
            0.055
          );
        });

        firstFrameKeyLight.intensity = THREE.MathUtils.lerp(
          firstFrameKeyLight.intensity,
          firstFrameAmount *
            (firstFrame.keyLightIntensity ?? 0.72) *
            (0.86 + firstFrameBreath * 0.14),
          0.055
        );
        firstFrameRimLight.intensity = THREE.MathUtils.lerp(
          firstFrameRimLight.intensity,
          firstFrameAmount *
            (firstFrame.rimLightIntensity ?? 0.42) *
            (0.82 + firstFrameBreath * 0.18),
          0.055
        );
      }

      const cueWave = 0.72 + Math.max(0, pulseWave) * 0.28;

      callRing.material.opacity =
        Math.max(0, preset.callLight.ringOpacity) +
        transformationCueLevel *
          (transformationCue.callRingOpacity ?? 0.13) *
          cueWave +
        activationPeakLevel *
          (activationPeak.callRingKick ?? 0.14) *
          (0.78 + activationPeakBreath * 0.22) +
        activationPeakFlashAmount * (activationPeak.flashRingOpacity ?? 0.26) * 0.62;

      rearGlow.material.opacity =
        Math.max(
          preset.callLight.rearGlowOpacity,
          thresholdAmount * (lightDirection.floorBounceOpacity ?? 0.032)
        ) +
        transformationCueLevel * (transformationCue.rearGlowOpacity ?? 0.11) * cueWave +
        activationPeakLevel *
          (activationPeak.rearGlowKick ?? 0.16) *
          (0.78 + activationPeakBreath * 0.22) +
        activationPeakFlashAmount * 0.12;

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
      const portalPullCleanup = preset.portalPullCleanup ?? {};

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
        portalAmount *
        THREE.MathUtils.lerp(
          portalPullCleanup.portalRingMin ?? 0.16,
          portalPullCleanup.portalRingMax ?? 0.30,
          mechanismBreath
        );

      transitionPortalInnerRing.material.opacity =
        portalAmount *
        THREE.MathUtils.lerp(
          portalPullCleanup.innerRingMin ?? 0.08,
          portalPullCleanup.innerRingMax ?? 0.20,
          1 - mechanismBreath
        );

      // Keep the dark center present but gently breathing.
      transitionPortalCore.material.opacity =
        portalAmount *
        THREE.MathUtils.lerp(
          portalPullCleanup.coreMin ?? 0.24,
          portalPullCleanup.coreMax ?? 0.42,
          mechanismBreath
        );

      // Local light only. This gives the portal a living presence without brightening the whole world.
      transitionPortalLight.intensity =
        portalAmount *
        THREE.MathUtils.lerp(
          portalPullCleanup.portalLightMin ?? 0.22,
          portalPullCleanup.portalLightMax ?? 0.82,
          mechanismBreath
        );

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
          passageAmount *
          THREE.MathUtils.lerp(
            portalPullCleanup.passageCoreMin ?? 0.34,
            portalPullCleanup.passageCoreMax ?? 0.58,
            passageBreath
          );

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
          passageAmount *
          THREE.MathUtils.lerp(
            portalPullCleanup.passageParticleMin ?? 0.14,
            portalPullCleanup.passageParticleMax ?? 0.36,
            passageBreath
          );

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
        pullAmount *
        THREE.MathUtils.lerp(
          portalPullCleanup.pullOpacityMin ?? 0.16,
          portalPullCleanup.pullOpacityMax ?? 0.48,
          pullBreath
        );

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
        thresholdPullMaterial.opacity +=
          transitionZoneLevel * (portalPullCleanup.pullApproachBoost ?? 0.08);
        transitionPortalLight.intensity +=
          transitionZoneLevel *
          (portalPullCleanup.portalApproachLightBoost ?? 0.08);
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

      // SCENE01-THRESHOLD-10E - passage prompt / enter readiness.
      // This prepares the UX for Scene 02 without performing navigation yet.
      const enterReadyTarget =
        firstPassageTriggered && firstPassageLevel > 0.62 && transitionZoneLevel > 0.54
          ? 1
          : 0;

      enterReadinessLevel = THREE.MathUtils.lerp(
        enterReadinessLevel,
        enterReadyTarget,
        0.055
      );

      const promptTarget = firstPassageTriggered ? 1 : 0;

      passagePromptLevel = THREE.MathUtils.lerp(
        passagePromptLevel,
        promptTarget,
        0.04
      );

      const promptBreath = 0.5 + 0.5 * Math.sin(t * 0.52);
      const enterPulse = THREE.MathUtils.lerp(0.82, 1.16, promptBreath);
      const promptPresence = Math.max(passagePromptLevel * 0.66, enterReadinessLevel);

      passagePromptRoot.visible = passagePromptLevel > 0.025;

      if (passagePromptRoot.visible) {
        passagePromptRoot.position.y =
          -0.92 + Math.sin(t * 0.38) * 0.018 * passagePromptLevel;

        passagePromptRoot.scale.setScalar(
          THREE.MathUtils.lerp(0.92, 1.04, enterReadinessLevel)
        );

        passagePromptSprite.material.opacity =
          passagePromptLevel * THREE.MathUtils.lerp(0.22, 0.46, promptBreath) +
          enterReadinessLevel * 0.22;

        passagePromptNeedles.rotation.z +=
          deltaSeconds * THREE.MathUtils.lerp(0.018, 0.082, enterReadinessLevel);

        passagePromptNeedles.children.forEach((needle, index) => {
          needle.material.opacity =
            passagePromptLevel *
              THREE.MathUtils.lerp(0.12, 0.38, promptBreath) *
              (index < 2 ? 1 : 0.62) +
            enterReadinessLevel * 0.24;
        });

        passagePromptLight.intensity =
          promptPresence * THREE.MathUtils.lerp(0.04, 0.28, promptBreath);

        passagePromptLight.distance =
          THREE.MathUtils.lerp(1.4, 3.0, promptPresence);

        // When enter readiness is active, reinforce the existing readiness zone.
        transitionReadinessRing.material.opacity += enterReadinessLevel * 0.14;
        transitionReadinessInnerRing.material.opacity += enterReadinessLevel * 0.18;
        transitionReadinessGlow.intensity += enterReadinessLevel * 0.16;

        // The passage field becomes more persuasive, but still restrained.
        thresholdPullMaterial.opacity += enterReadinessLevel * 0.12;
        firstPassageStreakMaterial.opacity += enterReadinessLevel * 0.12;

        transitionPortalLight.intensity +=
          enterReadinessLevel * THREE.MathUtils.lerp(0.1, 0.28, promptBreath);

        firstPassageLight.intensity +=
          enterReadinessLevel * THREE.MathUtils.lerp(0.08, 0.24, promptBreath);
      }

      // SCENE02-BOOTSTRAP-01 - Path Into the Unknown shell activation.
      // This is still visual/state preparation only. No teleport or room switch.
      const canActivateScene02Shell =
        preScene02HandoffTriggered &&
        preScene02HandoffLevel > 0.78 &&
        transitionZoneLevel > 0.82;

      if (canActivateScene02Shell && !scene02ShellActivated) {
        scene02ShellHoldTime += deltaSeconds;

        if (scene02ShellHoldTime > 1.15) {
          scene02ShellActivated = true;
        }
      } else if (!scene02ShellActivated) {
        scene02ShellHoldTime = Math.max(0, scene02ShellHoldTime - deltaSeconds * 0.8);
      }

      const scene02ShellTarget = scene02ShellActivated ? 1 : 0;

      scene02ShellLevel = THREE.MathUtils.lerp(
        scene02ShellLevel,
        scene02ShellTarget,
        0.032
      );

      const scene02Breath = 0.5 + 0.5 * Math.sin(t * 0.28);
      const scene02Pulse = THREE.MathUtils.lerp(0.76, 1.24, scene02Breath);

      scene02ShellRoot.visible = scene02ShellLevel > 0.01;

      if (scene02ShellRoot.visible) {
        scene02ShellRoot.scale.setScalar(
          THREE.MathUtils.lerp(0.86, 1.28, scene02ShellLevel)
        );

        scene02ShellRoot.rotation.z -= deltaSeconds * 0.016 * scene02ShellLevel;

        scene02VoidCoreMaterial.opacity =
          scene02ShellLevel * THREE.MathUtils.lerp(0.32, 0.62, scene02Breath);

        scene02VoidCore.scale.setScalar(
          THREE.MathUtils.lerp(0.82, 1.18, scene02ShellLevel) *
            THREE.MathUtils.lerp(0.96, 1.06, scene02Breath)
        );

        scene02DepthRings.forEach((entry, index) => {
          entry.ring.visible = true;
          entry.ring.rotation.z += deltaSeconds * entry.speed * scene02ShellLevel;

          const ringBreath =
            1 + Math.sin(t * 0.24 + index * 1.15) * 0.032 * scene02ShellLevel;

          entry.ring.scale.setScalar(ringBreath);

          entry.ring.material.opacity =
            scene02ShellLevel *
            entry.opacity *
            scene02Pulse *
            (index === 0 ? 1.34 : 1);
        });

        scene02Streams.visible = scene02ShellLevel > 0.02;
        scene02StreamMaterial.opacity =
          scene02ShellLevel * THREE.MathUtils.lerp(0.42, 1.18, scene02Breath);

        if (scene02Streams.visible) {
          const scene02Attr = scene02StreamGeometry.getAttribute("position");

          for (let i = 0; i < scene02StreamCount; i += 1) {
            const i3 = i * 3;
            const phase = scene02StreamPhases[i];
            const lane = scene02StreamSeeds[i];

            const baseX = scene02StreamBasePositions[i3 + 0];
            const baseY = scene02StreamBasePositions[i3 + 1];
            const baseZ = scene02StreamBasePositions[i3 + 2];

            const travel = (t * 0.26 + phase * 0.021 + lane) % 1;
            const compression = THREE.MathUtils.lerp(
              1.0,
              0.04,
              travel * scene02ShellLevel
            );

            const depthPull = travel * 4.4 * scene02ShellLevel;
            const spiral = t * 0.62 + phase;

            const swirlX = Math.sin(spiral) * 0.068 * scene02ShellLevel;
            const swirlY = Math.cos(spiral * 0.78) * 0.052 * scene02ShellLevel;

            scene02StreamPositions[i3 + 0] = baseX * compression + swirlX;
            scene02StreamPositions[i3 + 1] = baseY * compression + swirlY;
            scene02StreamPositions[i3 + 2] = baseZ - depthPull;
          }

          scene02Attr.needsUpdate = true;

          scene02Streams.rotation.z -= deltaSeconds * 0.11 * scene02ShellLevel;
          scene02Streams.rotation.y += deltaSeconds * 0.038 * scene02ShellLevel;
        }

        scene02GuideLight.intensity =
          scene02ShellLevel * THREE.MathUtils.lerp(0.72, 2.35, scene02Breath);

        scene02GuideLight.distance =
          THREE.MathUtils.lerp(5.2, 10.4, scene02ShellLevel);

        // Scene 02 shell makes previous prompt less important.
        passagePromptSprite.material.opacity *= THREE.MathUtils.lerp(
          1,
          0.22,
          scene02ShellLevel
        );

        passagePromptNeedles.children.forEach((needle) => {
          needle.material.opacity *= THREE.MathUtils.lerp(
            1,
            0.32,
            scene02ShellLevel
          );
        });

        // Reinforce all existing passage layers into one deeper forward motion.
        preScene02StreamMaterial.opacity += scene02ShellLevel * 0.18;
        firstPassageStreakMaterial.opacity += scene02ShellLevel * 0.16;
        thresholdPullMaterial.opacity += scene02ShellLevel * 0.14;
        passageParticleMaterial.opacity += scene02ShellLevel * 0.12;

        transitionPortalLight.intensity +=
          scene02ShellLevel * THREE.MathUtils.lerp(0.18, 0.52, scene02Breath);

        firstPassageLight.intensity +=
          scene02ShellLevel * THREE.MathUtils.lerp(0.14, 0.36, scene02Breath);

        preScene02GuideLight.intensity +=
          scene02ShellLevel * THREE.MathUtils.lerp(0.18, 0.48, scene02Breath);
      }

      // SCENE02-BOOTSTRAP-03 - visual isolation readiness.
      // Still no navigation, no teleport, no room switch.
      const scene02ShellReady = scene02ShellLevel > 0.82;

      const canStartScene02VisualIsolation =
        scene02ShellActivated &&
        scene02ShellReady &&
        preScene02HandoffLevel > 0.74 &&
        transitionZoneLevel > 0.74;

      if (canStartScene02VisualIsolation && !scene02VisualIsolationTriggered) {
        scene02VisualIsolationHoldTime += deltaSeconds;

        if (scene02VisualIsolationHoldTime > 0.9) {
          scene02VisualIsolationTriggered = true;
        }
      } else if (!scene02VisualIsolationTriggered) {
        scene02VisualIsolationHoldTime = Math.max(
          0,
          scene02VisualIsolationHoldTime - deltaSeconds * 0.8
        );
      }

      const scene02VisualIsolationTarget = scene02VisualIsolationTriggered ? 1 : 0;

      scene02VisualIsolationLevel = THREE.MathUtils.lerp(
        scene02VisualIsolationLevel,
        scene02VisualIsolationTarget,
        0.032
      );

      const scene02IsolationBreath = 0.5 + 0.5 * Math.sin(t * 0.24);
      const scene02IsolationPulse = THREE.MathUtils.lerp(
        0.78,
        1.2,
        scene02IsolationBreath
      );

      scene02IsolationRoot.visible = scene02VisualIsolationLevel > 0.01;

      if (scene02IsolationRoot.visible) {
        scene02IsolationRoot.scale.setScalar(
          THREE.MathUtils.lerp(0.92, 1.22, scene02VisualIsolationLevel)
        );

        scene02IsolationRoot.rotation.z -=
          deltaSeconds * 0.012 * scene02VisualIsolationLevel;

        scene02IsolationVeilMaterial.opacity =
          scene02VisualIsolationLevel *
          THREE.MathUtils.lerp(0.12, 0.28, scene02IsolationBreath);

        scene02IsolationVeil.scale.setScalar(
          THREE.MathUtils.lerp(0.92, 1.18, scene02VisualIsolationLevel) *
            THREE.MathUtils.lerp(0.96, 1.04, scene02IsolationBreath)
        );

        scene02IsolationRings.forEach((entry, index) => {
          entry.ring.visible = true;
          entry.ring.rotation.z +=
            deltaSeconds * entry.speed * scene02VisualIsolationLevel;

          const ringBreath =
            1 +
            Math.sin(t * 0.22 + index * 1.18) * 0.028 * scene02VisualIsolationLevel;

          entry.ring.scale.setScalar(ringBreath);

          entry.ring.material.opacity =
            scene02VisualIsolationLevel *
            entry.opacity *
            scene02IsolationPulse *
            (index === 0 ? 1.28 : 1);
        });

        scene02IsolationStreams.visible = scene02VisualIsolationLevel > 0.024;
        scene02IsolationStreamMaterial.opacity =
          scene02VisualIsolationLevel *
          THREE.MathUtils.lerp(0.18, 0.72, scene02IsolationBreath);

        if (scene02IsolationStreams.visible) {
          const isoAttr = scene02IsolationStreamGeometry.getAttribute("position");

          for (let i = 0; i < scene02IsolationStreamCount; i += 1) {
            const i3 = i * 3;
            const phase = scene02IsolationStreamPhases[i];
            const lane = scene02IsolationStreamSeeds[i];

            const baseX = scene02IsolationStreamBasePositions[i3 + 0];
            const baseY = scene02IsolationStreamBasePositions[i3 + 1];
            const baseZ = scene02IsolationStreamBasePositions[i3 + 2];

            const travel = (t * 0.2 + phase * 0.019 + lane) % 1;
            const compression = THREE.MathUtils.lerp(
              1.0,
              0.06,
              travel * scene02VisualIsolationLevel
            );

            const depthPull = travel * 3.7 * scene02VisualIsolationLevel;
            const spiral = t * 0.48 + phase;

            const swirlX = Math.sin(spiral) * 0.052 * scene02VisualIsolationLevel;
            const swirlY = Math.cos(spiral * 0.78) * 0.042 * scene02VisualIsolationLevel;

            scene02IsolationStreamPositions[i3 + 0] = baseX * compression + swirlX;
            scene02IsolationStreamPositions[i3 + 1] = baseY * compression + swirlY;
            scene02IsolationStreamPositions[i3 + 2] = baseZ - depthPull;
          }

          isoAttr.needsUpdate = true;

          scene02IsolationStreams.rotation.z -=
            deltaSeconds * 0.07 * scene02VisualIsolationLevel;

          scene02IsolationStreams.rotation.y +=
            deltaSeconds * 0.026 * scene02VisualIsolationLevel;
        }

        scene02IsolationLight.intensity =
          scene02VisualIsolationLevel *
          THREE.MathUtils.lerp(0.22, 0.92, scene02IsolationBreath);

        scene02IsolationLight.distance =
          THREE.MathUtils.lerp(4.6, 8.8, scene02VisualIsolationLevel);

        // Scene 01 support elements become secondary, not removed.
        passagePromptSprite.material.opacity *= THREE.MathUtils.lerp(
          1,
          0.28,
          scene02VisualIsolationLevel
        );

        transitionReadinessRing.material.opacity *= THREE.MathUtils.lerp(
          1,
          0.52,
          scene02VisualIsolationLevel
        );

        transitionReadinessInnerRing.material.opacity *= THREE.MathUtils.lerp(
          1,
          0.52,
          scene02VisualIsolationLevel
        );

        // Scene 02 layers gain priority.
        scene02StreamMaterial.opacity += scene02VisualIsolationLevel * 0.16;
        preScene02StreamMaterial.opacity += scene02VisualIsolationLevel * 0.12;
        firstPassageStreakMaterial.opacity += scene02VisualIsolationLevel * 0.1;

        scene02GuideLight.intensity +=
          scene02VisualIsolationLevel *
          THREE.MathUtils.lerp(0.12, 0.36, scene02IsolationBreath);
      }

      const scene02HandoffReady =
        scene02ShellActivated &&
        scene02ShellReady &&
        scene02VisualIsolationLevel > 0.76 &&
        transitionZoneLevel > 0.72;

      // SCENE02-BOOTSTRAP-04 - Soft Scene01 Fade Support.
      // Scene 01 does not disappear. It becomes quieter while Scene 02 takes focus.
      const scene01SoftFadeTarget =
        scene02VisualIsolationLevel > 0.32 || scene02HandoffReady ? 1 : 0;

      scene01SoftFadeLevel = THREE.MathUtils.lerp(
        scene01SoftFadeLevel,
        scene01SoftFadeTarget,
        0.026
      );

      const scene01FadePresence = THREE.MathUtils.smoothstep(
        scene01SoftFadeLevel,
        0.04,
        1.0
      );

      const scene01SupportDim = THREE.MathUtils.lerp(1.0, 0.34, scene01FadePresence);
      const scene01PromptDim = THREE.MathUtils.lerp(1.0, 0.24, scene01FadePresence);
      const scene01ParticleDim = THREE.MathUtils.lerp(1.0, 0.42, scene01FadePresence);

      // Floor/readiness layer becomes secondary.
      if (transitionReadinessRoot?.visible) {
        transitionReadinessRing.material.opacity *= scene01SupportDim;
        transitionReadinessInnerRing.material.opacity *= scene01SupportDim;

        transitionReadinessNeedles.children.forEach((needle) => {
          needle.material.opacity *= scene01SupportDim;
        });

        transitionReadinessGlow.intensity *= scene01SupportDim;
      }

      // Prompt remains useful, but becomes less dominant once Scene 02 takes visual priority.
      if (passagePromptRoot?.visible) {
        passagePromptSprite.material.opacity *= scene01PromptDim;

        passagePromptNeedles.children.forEach((needle) => {
          needle.material.opacity *= scene01PromptDim;
        });

        passagePromptLight.intensity *= scene01PromptDim;
      }

      // Older Scene01 release/support particles become quieter.
      // We do not hide them abruptly; this prevents a hard visual pop.
      if (chamberReleaseParticles?.visible) {
        chamberReleaseMaterial.opacity *= scene01ParticleDim;
      }

      if (chamberDissolvePoints?.visible) {
        dissolveMaterial.opacity *= scene01ParticleDim;
      }

      if (transitionPortalMechanismMarkers?.visible) {
        transitionPortalMechanismMarkers.children.forEach((marker) => {
          marker.material.opacity *= THREE.MathUtils.lerp(1.0, 0.72, scene01FadePresence);
        });
      }

      // Keep portal mechanism alive, but let the Scene02 tunnel become the primary visual.
      transitionPortalRing.material.opacity *= THREE.MathUtils.lerp(
        1.0,
        0.82,
        scene01FadePresence
      );

      transitionPortalInnerRing.material.opacity *= THREE.MathUtils.lerp(
        1.0,
        0.78,
        scene01FadePresence
      );

      // Reinforce Scene02 visual layers while Scene01 support fades.
      if (scene02VisualIsolationLevel > 0.01) {
        scene02IsolationStreamMaterial.opacity += scene01FadePresence * 0.08;
        scene02StreamMaterial.opacity += scene01FadePresence * 0.08;
        preScene02StreamMaterial.opacity += scene01FadePresence * 0.06;

        scene02IsolationLight.intensity += scene01FadePresence * 0.18;
        scene02GuideLight.intensity += scene01FadePresence * 0.18;
        preScene02GuideLight.intensity += scene01FadePresence * 0.1;
      }

      // SCENE02-BOOTSTRAP-05 - Handoff State Marker + Future Switch Contract.
      // This creates an explicit future switch contract only.
      // It does NOT teleport, does NOT switch rooms, and does NOT touch sky/runtime root.
      const canPrepareScene02SwitchContract =
        scene02HandoffReady &&
        scene02VisualIsolationLevel > 0.76 &&
        scene01SoftFadeLevel > 0.48 &&
        transitionZoneLevel > 0.72;

      if (canPrepareScene02SwitchContract && !scene02SwitchContractReady) {
        scene02SwitchContractHoldTime += deltaSeconds;

        if (scene02SwitchContractHoldTime > 0.8) {
          scene02SwitchContractReady = true;
        }
      } else if (!scene02SwitchContractReady) {
        scene02SwitchContractHoldTime = Math.max(
          0,
          scene02SwitchContractHoldTime - deltaSeconds * 0.75
        );
      }

      const scene02SwitchContractTarget = scene02SwitchContractReady ? 1 : 0;

      scene02SwitchContractLevel = THREE.MathUtils.lerp(
        scene02SwitchContractLevel,
        scene02SwitchContractTarget,
        0.04
      );

      const scene02SwitchContract = createScene02SwitchContract({
        ready: scene02SwitchContractReady,
        level: scene02SwitchContractLevel,
        phase: scene02SwitchContractReady
          ? "switch-contract-ready"
          : scene02HandoffReady
            ? "handoff-preparing"
            : "not-ready",
        proximity: transitionZoneLevel,
        scene02ShellValue: scene02ShellLevel,
        scene02VisualIsolationValue: scene02VisualIsolationLevel,
      });

      // Make the contract publicly available for the future runtime switch layer.
      root.userData.scene02SwitchContract = scene02SwitchContract;

      // SCENE02-BOOTSTRAP-06 - Soft Runtime Switch Stub.
      // This creates a safe future switch stub only.
      // It does NOT navigate, teleport, switch rooms, or touch sky.
      const canArmScene02RuntimeSwitchStub =
        scene02SwitchContractReady &&
        scene02SwitchContractLevel > 0.78 &&
        scene02HandoffReady &&
        transitionZoneLevel > 0.72;

      if (canArmScene02RuntimeSwitchStub && !scene02RuntimeSwitchStubArmed) {
        scene02RuntimeSwitchStubHoldTime += deltaSeconds;

        if (scene02RuntimeSwitchStubHoldTime > 0.75) {
          scene02RuntimeSwitchStubArmed = true;
        }
      } else if (!scene02RuntimeSwitchStubArmed) {
        scene02RuntimeSwitchStubHoldTime = Math.max(
          0,
          scene02RuntimeSwitchStubHoldTime - deltaSeconds * 0.75
        );
      }

      const scene02RuntimeSwitchStubTarget = scene02RuntimeSwitchStubArmed ? 1 : 0;

      scene02RuntimeSwitchStubLevel = THREE.MathUtils.lerp(
        scene02RuntimeSwitchStubLevel,
        scene02RuntimeSwitchStubTarget,
        0.04
      );

      const scene02RuntimeSwitchStub = createScene02RuntimeSwitchStub({
        armed: scene02RuntimeSwitchStubArmed,
        level: scene02RuntimeSwitchStubLevel,
        phase: scene02RuntimeSwitchStubArmed
          ? "runtime-switch-stub-armed"
          : scene02SwitchContractReady
            ? "contract-ready"
            : "not-ready",
        proximity: transitionZoneLevel,
        switchContract: scene02SwitchContract,
      });

      root.userData.scene02RuntimeSwitch = scene02RuntimeSwitchStub;
      // SCENE02-BOOTSTRAP-07A вЂ” update runtime diagnostic marker.
      // This only exposes diagnostic state. It does not affect visuals or switching.
      root.userData.scene02RuntimeDiagnostic = createScene02RuntimeDiagnostic({
        transitionState: root.userData.scene01Transition ?? null,
        switchContract: root.userData.scene02SwitchContract ?? scene02SwitchContract,
        runtimeSwitchStub: scene02RuntimeSwitchStub,
        proximity: transitionZoneLevel,
      });
      // SCENE02-BOOTSTRAP-07B - update adapter object only.
      // This only creates/exposes an object. It does not mutate registry,
      // does not set currentLocalSceneId, and does not trigger any visual/runtime switch.
      const scene02RuntimeDiagnostic = root.userData.scene02RuntimeDiagnostic;

      const canPrepareScene02AdapterObject =
        Boolean(scene02RuntimeDiagnostic?.safeForFutureAdapter) &&
        Boolean(scene02SwitchContract?.ready) &&
        Boolean(scene02RuntimeSwitchStub?.armed) &&
        scene02RuntimeSwitchStubLevel > 0.72 &&
        transitionZoneLevel > 0.68;

      if (canPrepareScene02AdapterObject && !scene02AdapterObjectReady) {
        scene02AdapterObjectHoldTime += deltaSeconds;

        if (scene02AdapterObjectHoldTime > 0.65) {
          scene02AdapterObjectReady = true;
        }
      } else if (!scene02AdapterObjectReady) {
        scene02AdapterObjectHoldTime = Math.max(
          0,
          scene02AdapterObjectHoldTime - deltaSeconds * 0.75
        );
      }

      const scene02AdapterObjectTarget = scene02AdapterObjectReady ? 1 : 0;

      scene02AdapterObjectLevel = THREE.MathUtils.lerp(
        scene02AdapterObjectLevel,
        scene02AdapterObjectTarget,
        0.04
      );

      const scene02AdapterObject = createScene02AdapterObject({
        ready: scene02AdapterObjectReady,
        level: scene02AdapterObjectLevel,
        phase: scene02AdapterObjectReady
          ? "adapter-object-ready"
          : canPrepareScene02AdapterObject
            ? "adapter-object-preparing"
            : "not-ready",
        diagnostic: scene02RuntimeDiagnostic,
        switchContract: scene02SwitchContract,
        runtimeSwitchStub: scene02RuntimeSwitchStub,
        proximity: transitionZoneLevel,
      });

      root.userData.scene02AdapterObject = scene02AdapterObject;
      // SCENE02-BOOTSTRAP-07D - Local Scene Id Switch Only.
      // This changes only semantic userData ids after the adapter object is ready.
      // It does NOT teleport, does NOT switch rooms, does NOT change visuals, and does NOT touch sky.
      const canSwitchLocalSceneIdToScene02 =
        scene02AdapterObjectReady &&
        scene02AdapterObjectLevel > 0.76 &&
        Boolean(root.userData.sceneRegistry?.scene02?.adapterObject) &&
        transitionZoneLevel > 0.68;

      if (canSwitchLocalSceneIdToScene02 && !scene02LocalSceneIdSwitchReady) {
        scene02LocalSceneIdSwitchHoldTime += deltaSeconds;

        if (scene02LocalSceneIdSwitchHoldTime > 0.55) {
          scene02LocalSceneIdSwitchReady = true;
        }
      } else if (!scene02LocalSceneIdSwitchReady) {
        scene02LocalSceneIdSwitchHoldTime = Math.max(
          0,
          scene02LocalSceneIdSwitchHoldTime - deltaSeconds * 0.75
        );
      }

      const scene02LocalSceneIdSwitchTarget = scene02LocalSceneIdSwitchReady ? 1 : 0;

      scene02LocalSceneIdSwitchLevel = THREE.MathUtils.lerp(
        scene02LocalSceneIdSwitchLevel,
        scene02LocalSceneIdSwitchTarget,
        0.04
      );

      if (scene02LocalSceneIdSwitchReady) {
        root.userData.previousLocalSceneId = "scene01-sanctuary";
        root.userData.currentLocalSceneId = "scene02-path-into-unknown";
        root.userData.localSceneSwitchMode = "semantic-local-id-only";
      } else {
        root.userData.currentLocalSceneId =
          root.userData.currentLocalSceneId ?? "scene01-sanctuary";
        root.userData.localSceneSwitchMode =
          root.userData.localSceneSwitchMode ?? "none";
      }

      root.userData.scene02LocalSceneIdSwitch = {
        version: "scene02-local-scene-id-switch-v0.1",
        ready: scene02LocalSceneIdSwitchReady,
        level: scene02LocalSceneIdSwitchLevel,
        phase: scene02LocalSceneIdSwitchReady
          ? "local-scene-id-switched"
          : canSwitchLocalSceneIdToScene02
            ? "local-scene-id-preparing"
            : "not-ready",
        previousLocalSceneId: root.userData.previousLocalSceneId,
        currentLocalSceneId: root.userData.currentLocalSceneId,
        mode: root.userData.localSceneSwitchMode,
        safety: {
          semanticOnly: true,
          performsTeleportNow: false,
          performsRoomSwitchNow: false,
          changesVisualsNow: false,
          touchesSkyNow: false,
          touchesXRRootNow: false,
        },
      };

      // SCENE02-BOOTSTRAP-07E - Visual Response Only.
      // Once the semantic local scene id is Scene 02, give Scene 02 more visual priority.
      // No teleport, no hard room switch, no XRRoot changes, no sky changes.
      const scene02SemanticVisualPriorityTarget =
        root.userData.currentLocalSceneId === "scene02-path-into-unknown" &&
        scene02LocalSceneIdSwitchReady
          ? 1
          : 0;

      scene02SemanticVisualPriorityLevel = THREE.MathUtils.lerp(
        scene02SemanticVisualPriorityLevel,
        scene02SemanticVisualPriorityTarget,
        0.035
      );

      const scene02VisualPriorityPresence = THREE.MathUtils.smoothstep(
        scene02SemanticVisualPriorityLevel,
        0.04,
        1.0
      );

      if (scene02VisualPriorityPresence > 0.01) {
        const visualPriorityBreath = 0.5 + 0.5 * Math.sin(t * 0.2);

        // Scene 02 becomes visually primary.
        scene02StreamMaterial.opacity +=
          scene02VisualPriorityPresence *
          THREE.MathUtils.lerp(0.16, 0.42, visualPriorityBreath);

        scene02IsolationStreamMaterial.opacity +=
          scene02VisualPriorityPresence *
          THREE.MathUtils.lerp(0.08, 0.22, visualPriorityBreath);

        preScene02StreamMaterial.opacity +=
          scene02VisualPriorityPresence *
          THREE.MathUtils.lerp(0.04, 0.14, visualPriorityBreath);

        scene02GuideLight.intensity +=
          scene02VisualPriorityPresence *
          THREE.MathUtils.lerp(0.22, 0.72, visualPriorityBreath);

        scene02IsolationLight.intensity +=
          scene02VisualPriorityPresence *
          THREE.MathUtils.lerp(0.08, 0.32, visualPriorityBreath);

        preScene02GuideLight.intensity +=
          scene02VisualPriorityPresence *
          THREE.MathUtils.lerp(0.04, 0.18, visualPriorityBreath);

        // Keep the portal alive as the threshold object, but avoid making old UI layers dominant.
        transitionPortalLight.intensity +=
          scene02VisualPriorityPresence *
          THREE.MathUtils.lerp(0.06, 0.18, visualPriorityBreath);

        transitionPortalRing.material.opacity *= THREE.MathUtils.lerp(
          1.0,
          0.84,
          scene02VisualPriorityPresence
        );

        transitionPortalInnerRing.material.opacity *= THREE.MathUtils.lerp(
          1.0,
          0.78,
          scene02VisualPriorityPresence
        );

        // Scene 01 support UI becomes secondary.
        if (passagePromptRoot?.visible) {
          passagePromptSprite.material.opacity *= THREE.MathUtils.lerp(
            1.0,
            0.34,
            scene02VisualPriorityPresence
          );

          passagePromptNeedles.children.forEach((needle) => {
            needle.material.opacity *= THREE.MathUtils.lerp(
              1.0,
              0.22,
              scene02VisualPriorityPresence
            );
          });

          passagePromptLight.intensity *= THREE.MathUtils.lerp(
            1.0,
            0.22,
            scene02VisualPriorityPresence
          );
        }

        if (transitionReadinessRoot?.visible) {
          transitionReadinessRing.material.opacity *= THREE.MathUtils.lerp(
            1.0,
            0.46,
            scene02VisualPriorityPresence
          );

          transitionReadinessInnerRing.material.opacity *= THREE.MathUtils.lerp(
            1.0,
            0.26,
            scene02VisualPriorityPresence
          );

          transitionReadinessNeedles.children.forEach((needle) => {
            needle.material.opacity *= THREE.MathUtils.lerp(
              1.0,
              0.28,
              scene02VisualPriorityPresence
            );
          });

          transitionReadinessGlow.intensity *= THREE.MathUtils.lerp(
            1.0,
            0.3,
            scene02VisualPriorityPresence
          );
        }

        // Old chamber release particles become background memory, not the main event.
        if (chamberReleaseParticles?.visible) {
          chamberReleaseMaterial.opacity *= THREE.MathUtils.lerp(
            1.0,
            0.48,
            scene02VisualPriorityPresence
          );
        }

        if (chamberDissolvePoints?.visible) {
          dissolveMaterial.opacity *= THREE.MathUtils.lerp(
            1.0,
            0.46,
            scene02VisualPriorityPresence
          );
        }
      }

      root.userData.scene02VisualResponse =
        createScene02VisualResponseStateFromPathScene({
          active: scene02SemanticVisualPriorityLevel > 0.08,
          level: scene02SemanticVisualPriorityLevel,
          currentLocalSceneId:
            root.userData.currentLocalSceneId ?? "scene01-sanctuary",
        });

      // SCENE02-BOOTSTRAP-07F вЂ” Scene02 Container Preparation.
      // Empty runtime container only. This prepares a future place for real Scene02 logic,
      // but does not reparent existing visual layers yet.
      const canPrepareScene02RuntimeContainer =
        root.userData.currentLocalSceneId === "scene02-path-into-unknown" &&
        scene02LocalSceneIdSwitchReady &&
        scene02SemanticVisualPriorityLevel > 0.62 &&
        Boolean(root.userData.sceneRegistry?.scene02?.adapterObject);

      if (canPrepareScene02RuntimeContainer && !scene02RuntimeContainerPrepared) {
        scene02RuntimeContainerHoldTime += deltaSeconds;

        if (scene02RuntimeContainerHoldTime > 0.65) {
          scene02RuntimeContainerPrepared = true;
        }
      } else if (!scene02RuntimeContainerPrepared) {
        scene02RuntimeContainerHoldTime = Math.max(
          0,
          scene02RuntimeContainerHoldTime - deltaSeconds * 0.75
        );
      }

      const scene02RuntimeContainerTarget = scene02RuntimeContainerPrepared ? 1 : 0;

      scene02RuntimeContainerLevel = THREE.MathUtils.lerp(
        scene02RuntimeContainerLevel,
        scene02RuntimeContainerTarget,
        0.04
      );

      scene02RuntimeContainerRoot.visible = scene02RuntimeContainerLevel > 0.01;

      scene02RuntimeContainerRoot.userData =
        createScene02RuntimeContainerStateFromPathScene({
          prepared: scene02RuntimeContainerPrepared,
          level: scene02RuntimeContainerLevel,
          phase: scene02RuntimeContainerPrepared
            ? "scene02-container-prepared"
            : canPrepareScene02RuntimeContainer
              ? "scene02-container-preparing"
              : "not-ready",
          acceptsFutureChildren: scene02RuntimeContainerPrepared,
          currentChildrenBound:
            Boolean(scene02ContainerActualBindingComplete) ||
            Boolean(scene02RuntimeContainerRoot.userData?.currentChildrenBound),
          existingVisualLayersStillInPlace:
            !scene02ContainerActualBindingComplete &&
            (scene02RuntimeContainerRoot.userData?.existingVisualLayersStillInPlace ??
              true),
          boundLayerKeys: scene02ContainerActualBindingComplete
            ? ["scene02ShellRoot", "scene02IsolationRoot", "preScene02Root"]
            : scene02RuntimeContainerRoot.userData?.boundLayerKeys ?? [],
        });

      root.userData.scene02RuntimeContainer = scene02RuntimeContainerRoot.userData;

      // SCENE02-RUNTIME-01 вЂ” first external Scene02 runtime module shell.
      // This does not move visuals or switch rooms. It wraps the prepared Scene02 container.
      const pathIntoUnknownSceneRuntime = createPathIntoUnknownSceneRuntime({
        containerRoot: scene02RuntimeContainerRoot,
        sourceSceneId: "scene01-sanctuary",
        sceneId: "scene02-path-into-unknown",
        title: "Path Into the Unknown",
      });

      root.userData.scene02RuntimeModule =
        pathIntoUnknownSceneRuntime.getSnapshot();

      // SCENE02-BOOTSTRAP-07G вЂ” Container Binding Contract Only.
      // Creates a contract for future binding/reparenting, but does NOT bind or reparent now.
      const canPrepareScene02ContainerBindingContract =
        scene02RuntimeContainerPrepared &&
        scene02RuntimeContainerLevel > 0.72 &&
        scene02AdapterObjectReady &&
        scene02AdapterObjectLevel > 0.72 &&
        root.userData.currentLocalSceneId === "scene02-path-into-unknown";

      if (
        canPrepareScene02ContainerBindingContract &&
        !scene02ContainerBindingContractReady
      ) {
        scene02ContainerBindingContractHoldTime += deltaSeconds;

        if (scene02ContainerBindingContractHoldTime > 0.55) {
          scene02ContainerBindingContractReady = true;
        }
      } else if (!scene02ContainerBindingContractReady) {
        scene02ContainerBindingContractHoldTime = Math.max(
          0,
          scene02ContainerBindingContractHoldTime - deltaSeconds * 0.75
        );
      }

      const scene02ContainerBindingContractTarget =
        scene02ContainerBindingContractReady ? 1 : 0;

      scene02ContainerBindingContractLevel = THREE.MathUtils.lerp(
        scene02ContainerBindingContractLevel,
        scene02ContainerBindingContractTarget,
        0.04
      );

      const scene02ContainerBindingContract = createScene02ContainerBindingContract({
        ready: scene02ContainerBindingContractReady,
        level: scene02ContainerBindingContractLevel,
        phase: scene02ContainerBindingContractReady
          ? "container-binding-contract-ready"
          : canPrepareScene02ContainerBindingContract
            ? "container-binding-contract-preparing"
            : "not-ready",
        container: root.userData.scene02RuntimeContainer ?? null,
        adapterObject: root.userData.scene02AdapterObject ?? null,
        currentLocalSceneId: root.userData.currentLocalSceneId ?? "scene01-sanctuary",
        targets: {
          scene02ShellRoot,
          scene02IsolationRoot,
          preScene02Root,
          firstPassageRoot,
          passageRoot,
        },
      });

      root.userData.scene02ContainerBindingContract = scene02ContainerBindingContract;

      // SCENE02-BOOTSTRAP-07H вЂ” Binding Preflight Only.
      // Captures object/container readiness and transform snapshots.
      // Does NOT reparent, move, switch rooms, teleport, or touch sky.
      const canPrepareScene02ContainerBindingPreflight =
        scene02ContainerBindingContractReady &&
        scene02ContainerBindingContractLevel > 0.72 &&
        Boolean(root.userData.scene02ContainerBindingContract?.canBindFutureChildren) &&
        scene02RuntimeContainerPrepared &&
        scene02RuntimeContainerLevel > 0.72 &&
        root.userData.currentLocalSceneId === "scene02-path-into-unknown";

      if (
        canPrepareScene02ContainerBindingPreflight &&
        !scene02ContainerBindingPreflightReady
      ) {
        scene02ContainerBindingPreflightHoldTime += deltaSeconds;

        if (scene02ContainerBindingPreflightHoldTime > 0.45) {
          scene02ContainerBindingPreflightReady = true;
        }
      } else if (!scene02ContainerBindingPreflightReady) {
        scene02ContainerBindingPreflightHoldTime = Math.max(
          0,
          scene02ContainerBindingPreflightHoldTime - deltaSeconds * 0.75
        );
      }

      const scene02ContainerBindingPreflightTarget =
        scene02ContainerBindingPreflightReady ? 1 : 0;

      scene02ContainerBindingPreflightLevel = THREE.MathUtils.lerp(
        scene02ContainerBindingPreflightLevel,
        scene02ContainerBindingPreflightTarget,
        0.04
      );

      const scene02ContainerBindingPreflight = createScene02ContainerBindingPreflight({
        ready: scene02ContainerBindingPreflightReady,
        level: scene02ContainerBindingPreflightLevel,
        phase: scene02ContainerBindingPreflightReady
          ? "binding-preflight-ready"
          : canPrepareScene02ContainerBindingPreflight
            ? "binding-preflight-preparing"
            : "not-ready",
        bindingContract: root.userData.scene02ContainerBindingContract ?? null,
        containerRoot: scene02RuntimeContainerRoot ?? null,
        currentLocalSceneId: root.userData.currentLocalSceneId ?? "scene01-sanctuary",
        targets: {
          scene02ShellRoot,
          scene02IsolationRoot,
          preScene02Root,
          firstPassageRoot,
          passageRoot,
        },
      });

      root.userData.scene02ContainerBindingPreflight =
        scene02ContainerBindingPreflight;

      // SCENE02-BOOTSTRAP-08A вЂ” Controlled Container Binding.
      // This is the first actual controlled binding step.
      // It reparents only Scene02 visual layers into the Scene02 container.
      // No teleport, no camera move, no XRRoot, no sky changes.
      const canRunScene02ActualContainerBinding =
        scene02ContainerBindingPreflightReady &&
        scene02ContainerBindingPreflightLevel > 0.72 &&
        Boolean(
          root.userData.scene02ContainerBindingPreflight?.canAttemptFutureBinding
        ) &&
        scene02RuntimeContainerPrepared &&
        root.userData.currentLocalSceneId === "scene02-path-into-unknown";

      if (
        canRunScene02ActualContainerBinding &&
        !scene02ContainerActualBindingRequested &&
        !scene02ContainerActualBindingComplete &&
        !scene02ContainerActualBindingFailed
      ) {
        scene02ContainerActualBindingHoldTime += deltaSeconds;

        if (scene02ContainerActualBindingHoldTime > 0.45) {
          scene02ContainerActualBindingRequested = true;
        }
      } else if (
        !scene02ContainerActualBindingRequested &&
        !scene02ContainerActualBindingComplete
      ) {
        scene02ContainerActualBindingHoldTime = Math.max(
          0,
          scene02ContainerActualBindingHoldTime - deltaSeconds * 0.75
        );
      }

      let scene02ActualBindingResults =
        root.userData.scene02ContainerActualBinding?.results ?? [];

      if (
        scene02ContainerActualBindingRequested &&
        !scene02ContainerActualBindingComplete &&
        !scene02ContainerActualBindingFailed
      ) {
        try {
          scene02ActualBindingResults = [
            bindScene02LayerToContainerPreserveWorld({
              key: "scene02ShellRoot",
              object: scene02ShellRoot,
              container: scene02RuntimeContainerRoot,
            }),
            bindScene02LayerToContainerPreserveWorld({
              key: "scene02IsolationRoot",
              object: scene02IsolationRoot,
              container: scene02RuntimeContainerRoot,
            }),
            bindScene02LayerToContainerPreserveWorld({
              key: "preScene02Root",
              object: preScene02Root,
              container: scene02RuntimeContainerRoot,
            }),
          ];

          const allRequiredBindingsOk = scene02ActualBindingResults.every(
            (result) => result.ok
          );

          scene02ContainerActualBindingComplete = allRequiredBindingsOk;
          scene02ContainerActualBindingFailed = !allRequiredBindingsOk;
        } catch (error) {
          scene02ContainerActualBindingFailed = true;
          scene02ActualBindingResults = [
            {
              key: "binding-exception",
              ok: false,
              reason: error?.message ?? "unknown-binding-error",
            },
          ];
        }
      }

      const scene02ActualBindingTarget = scene02ContainerActualBindingComplete
        ? 1
        : scene02ContainerActualBindingRequested
          ? 0.55
          : 0;

      scene02ContainerActualBindingLevel = THREE.MathUtils.lerp(
        scene02ContainerActualBindingLevel,
        scene02ActualBindingTarget,
        0.04
      );

      if (scene02ContainerActualBindingComplete) {
        scene02RuntimeContainerRoot.visible = true;
        scene02RuntimeContainerRoot.userData.currentChildrenBound = true;
        scene02RuntimeContainerRoot.userData.existingVisualLayersStillInPlace = false;
        scene02RuntimeContainerRoot.userData.boundLayerKeys = [
          "scene02ShellRoot",
          "scene02IsolationRoot",
          "preScene02Root",
        ];
      }

      root.userData.scene02ContainerActualBinding = createScene02ActualBindingState({
        requested: scene02ContainerActualBindingRequested,
        complete: scene02ContainerActualBindingComplete,
        failed: scene02ContainerActualBindingFailed,
        level: scene02ContainerActualBindingLevel,
        phase: scene02ContainerActualBindingFailed
          ? "actual-binding-failed"
          : scene02ContainerActualBindingComplete
            ? "actual-binding-complete"
            : scene02ContainerActualBindingRequested
              ? "actual-binding-requested"
              : canRunScene02ActualContainerBinding
                ? "actual-binding-preparing"
                : "not-ready",
        results: scene02ActualBindingResults,
        containerRoot: scene02RuntimeContainerRoot,
      });

      // SCENE02-RUNTIME-01 вЂ” update external Scene02 runtime module shell.
      // This mirrors current Scene02 state into a separate module without moving logic yet.
      if (scene02ContainerActualBindingComplete) {
        pathIntoUnknownSceneRuntime.markBoundLayers(
          root.userData.scene02ContainerActualBinding?.boundLayerKeys ?? [
            "scene02ShellRoot",
            "scene02IsolationRoot",
            "preScene02Root",
          ]
        );
      }

      root.userData.scene02RuntimeModule = pathIntoUnknownSceneRuntime.update({
        active:
          root.userData.currentLocalSceneId === "scene02-path-into-unknown" ||
          scene02ContainerActualBindingComplete,
        ready: scene02ContainerActualBindingComplete,
        level: Math.max(
          scene02ContainerActualBindingLevel,
          scene02SemanticVisualPriorityLevel,
          scene02RuntimeContainerLevel
        ),
        phase: scene02ContainerActualBindingComplete
          ? "externalized-scene02-runtime-shell-ready"
          : scene02RuntimeContainerPrepared
            ? "externalized-scene02-runtime-shell-preparing"
            : "not-ready",
        currentLocalSceneId:
          root.userData.currentLocalSceneId ?? "scene01-sanctuary",
        previousLocalSceneId: root.userData.previousLocalSceneId ?? null,
        containerPrepared: scene02RuntimeContainerPrepared,
        containerBound: scene02ContainerActualBindingComplete,
        visualResponseLevel: scene02SemanticVisualPriorityLevel,
        actualBindingComplete: scene02ContainerActualBindingComplete,
      });

      // SCENE02-VISUAL-01 вЂ” Cinematic Path Into the Unknown Pass.
      // Bold but controlled: visible tunnel/depth/pull layer only.
      // No sky, no XRRoot, no teleport, no hard room switch.
      {
        const rawPathPresence = Math.max(
          scene02SemanticVisualPriorityLevel ?? 0,
          scene02ContainerActualBindingLevel ?? 0,
          scene02RuntimeContainerLevel ?? 0
        );

        const pathPresence = scene02ContainerActualBindingComplete
          ? THREE.MathUtils.smoothstep(rawPathPresence, 0.04, 0.92)
          : THREE.MathUtils.smoothstep(
              scene02SemanticVisualPriorityLevel ?? 0,
              0.28,
              1.0
            ) * 0.56;

        const pathPulse = 0.5 + 0.5 * Math.sin(t * 0.72);
        const slowBreath = 0.5 + 0.5 * Math.sin(t * 0.19);
        const pullEnergy = pathPresence * THREE.MathUtils.lerp(0.72, 1.25, pathPulse);

        scene02CinematicPathRoot.visible = pathPresence > 0.012;
        scene02CinematicPathRoot.rotation.z =
          -t * THREE.MathUtils.lerp(0.025, 0.145, pullEnergy);

        scene02CinematicPathRoot.position.z = THREE.MathUtils.lerp(
          scene02CinematicPathRoot.position.z,
          -1.05 - pullEnergy * 0.26,
          0.045
        );

        const pathScale = 0.92 + pullEnergy * 0.18 + slowBreath * 0.018;
        scene02CinematicPathRoot.scale.set(pathScale, pathScale, 1);

        scene02CinematicVoidMaterial.opacity = THREE.MathUtils.lerp(
          scene02CinematicVoidMaterial.opacity,
          pathPresence *
            THREE.MathUtils.lerp(
              portalPullCleanup.pathVoidMin ?? 0.52,
              portalPullCleanup.pathVoidMax ?? 0.86,
              pullEnergy
            ),
          0.055
        );

        scene02PortalPullMaterial.opacity = THREE.MathUtils.lerp(
          scene02PortalPullMaterial.opacity,
          pathPresence *
            THREE.MathUtils.lerp(
              portalPullCleanup.pathAuraMin ?? 0.045,
              portalPullCleanup.pathAuraMax ?? 0.18,
              pathPulse
            ),
          0.05
        );

        const pullScale = THREE.MathUtils.lerp(
          portalPullCleanup.pathAuraScaleNear ?? 2.05,
          portalPullCleanup.pathAuraScaleFar ?? 3.15,
          pullEnergy
        );
        scene02PortalPullSprite.scale.set(
          pullScale * (1 + slowBreath * 0.03),
          pullScale * (1 + pathPulse * 0.025),
          1
        );

        for (const ring of scene02TunnelRings) {
          const loopDepth =
            (ring.userData.depthSeed + t * (0.022 + pullEnergy * 0.075)) % 1;

          const radius = THREE.MathUtils.lerp(0.52, 1.95, loopDepth);
          const z = THREE.MathUtils.lerp(-0.74, -7.6, loopDepth);

          ring.position.z = z;
          ring.scale.setScalar(
            radius * (1 + Math.sin(t * 0.31 + loopDepth * 8) * 0.018)
          );
          ring.rotation.z =
            ring.userData.rotationSeed +
            t * ring.userData.rotationSpeed * THREE.MathUtils.lerp(1.4, 7.6, pullEnergy);

          const fadeFront = THREE.MathUtils.smoothstep(loopDepth, 0.02, 0.18);
          const fadeBack = 1 - THREE.MathUtils.smoothstep(loopDepth, 0.78, 1.0);
          const ringOpacity =
            pathPresence *
            fadeFront *
            fadeBack *
            THREE.MathUtils.lerp(
              portalPullCleanup.pathRingMin ?? 0.03,
              portalPullCleanup.pathRingMax ?? 0.18,
              pullEnergy
            );

          ring.material.opacity = THREE.MathUtils.lerp(
            ring.material.opacity,
            ringOpacity,
            0.06
          );
        }

        for (let i = 0; i < scene02PathStreakSeeds.length; i += 1) {
          const seed = scene02PathStreakSeeds[i];

          seed.z +=
            deltaSeconds *
            seed.speed *
            THREE.MathUtils.lerp(0.28, 3.65, pullEnergy);

          if (seed.z > 0.25) {
            seed.z = -7.6 - (((i * 31) % 100) / 100) * 1.4;
            seed.radius = 0.28 + (((i * 37 + Math.floor(t * 10)) % 100) / 100) * 1.36;
          }

          const normalizedDepth = THREE.MathUtils.clamp((seed.z + 7.8) / 8.05, 0, 1);
          const perspectiveRadius =
            seed.radius * THREE.MathUtils.lerp(0.34, 1.82, normalizedDepth);
          const twist =
            seed.angle +
            seed.twist * (t * (0.045 + pullEnergy * 0.18) + seed.z * 0.18);

          const x1 = Math.cos(twist) * perspectiveRadius;
          const y1 = Math.sin(twist) * perspectiveRadius * 0.72;

          const tailDepth = Math.max(
            -8.4,
            seed.z - seed.length * (1.0 + pullEnergy * 1.8)
          );
          const tailRadius =
            seed.radius *
            THREE.MathUtils.lerp(
              0.30,
              1.64,
              THREE.MathUtils.clamp((tailDepth + 7.8) / 8.05, 0, 1)
            );
          const tailTwist = twist - seed.twist * 0.035;

          const x2 = Math.cos(tailTwist) * tailRadius;
          const y2 = Math.sin(tailTwist) * tailRadius * 0.72;

          const p = i * 6;
          scene02PathStreakPositions[p + 0] = x1;
          scene02PathStreakPositions[p + 1] = y1;
          scene02PathStreakPositions[p + 2] = seed.z;

          scene02PathStreakPositions[p + 3] = x2;
          scene02PathStreakPositions[p + 4] = y2;
          scene02PathStreakPositions[p + 5] = tailDepth;
        }

        scene02PathStreakGeometry.getAttribute("position").needsUpdate = true;

        scene02PathStreakMaterial.opacity = THREE.MathUtils.lerp(
          scene02PathStreakMaterial.opacity,
          pathPresence *
            THREE.MathUtils.lerp(
              portalPullCleanup.pathStreakMin ?? 0.08,
              portalPullCleanup.pathStreakMax ?? 0.48,
              pullEnergy
            ),
          0.07
        );

        // SCENE02-VISUAL-02 вЂ” acceleration streak update.
        // Stronger forward pull layer. Visual only. No camera movement.
        for (let i = 0; i < scene02PathAccelerationSeeds.length; i += 1) {
          const seed = scene02PathAccelerationSeeds[i];

          seed.z +=
            deltaSeconds *
            seed.speed *
            THREE.MathUtils.lerp(0.55, 7.8, pullEnergy);

          if (seed.z > 0.58) {
            seed.z = -8.9 - (((i * 43 + Math.floor(t * 19)) % 100) / 100) * 1.25;
            seed.radius =
              0.45 + (((i * 41 + Math.floor(t * 11)) % 100) / 100) * 1.62;
          }

          const depth01 = THREE.MathUtils.clamp((seed.z + 9.0) / 9.55, 0, 1);
          const radiusCurve =
            seed.radius * THREE.MathUtils.lerp(0.22, 2.15, depth01);

          const spiral =
            seed.angle +
            seed.twist *
              (t * THREE.MathUtils.lerp(0.06, 0.42, pullEnergy) + seed.z * 0.28);

          const laneOffset = (seed.lane - 2.5) * 0.018 * pullEnergy;
          const xHead = Math.cos(spiral + laneOffset) * radiusCurve;
          const yHead = Math.sin(spiral + laneOffset) * radiusCurve * 0.72;

          const tailZ = Math.max(
            -9.6,
            seed.z - seed.length * THREE.MathUtils.lerp(1.4, 6.2, pullEnergy)
          );

          const tailDepth01 = THREE.MathUtils.clamp((tailZ + 9.0) / 9.55, 0, 1);
          const tailRadius =
            seed.radius * THREE.MathUtils.lerp(0.18, 1.76, tailDepth01);

          const tailSpiral =
            spiral - seed.twist * THREE.MathUtils.lerp(0.04, 0.18, pullEnergy);

          const xTail = Math.cos(tailSpiral) * tailRadius;
          const yTail = Math.sin(tailSpiral) * tailRadius * 0.72;

          const p = i * 6;

          scene02PathAccelerationPositions[p + 0] = xHead;
          scene02PathAccelerationPositions[p + 1] = yHead;
          scene02PathAccelerationPositions[p + 2] = seed.z;

          scene02PathAccelerationPositions[p + 3] = xTail;
          scene02PathAccelerationPositions[p + 4] = yTail;
          scene02PathAccelerationPositions[p + 5] = tailZ;
        }

        scene02PathAccelerationGeometry.getAttribute("position").needsUpdate = true;

        scene02PathAccelerationMaterial.opacity = THREE.MathUtils.lerp(
          scene02PathAccelerationMaterial.opacity,
          pathPresence *
            THREE.MathUtils.lerp(
              portalPullCleanup.pathAccelerationMin ?? 0.024,
              portalPullCleanup.pathAccelerationMax ?? 0.30,
              pullEnergy
            ),
          0.075
        );

        // Peripheral pull rails: subtle edge-language that makes the path feel deeper.
        for (let i = 0; i < scene02SideRailSeeds.length; i += 1) {
          const seed = scene02SideRailSeeds[i];

          const angle =
            seed.angle -
            t * THREE.MathUtils.lerp(0.018, 0.18, pullEnergy) +
            Math.sin(t * 0.11 + seed.phase) * 0.035;

          const radiusNear =
            THREE.MathUtils.lerp(1.18, 2.25, pullEnergy) + seed.offset;
          const radiusFar =
            THREE.MathUtils.lerp(0.24, 0.92, pullEnergy) + seed.offset * 0.2;

          const nearZ = THREE.MathUtils.lerp(-1.15, -0.62, pullEnergy);
          const farZ = THREE.MathUtils.lerp(-5.2, -8.1, pullEnergy);

          const p = i * 6;

          scene02SideRailPositions[p + 0] = Math.cos(angle) * radiusNear;
          scene02SideRailPositions[p + 1] = Math.sin(angle) * radiusNear * 0.72;
          scene02SideRailPositions[p + 2] = nearZ;

          scene02SideRailPositions[p + 3] = Math.cos(angle + 0.075) * radiusFar;
          scene02SideRailPositions[p + 4] = Math.sin(angle + 0.075) * radiusFar * 0.72;
          scene02SideRailPositions[p + 5] = farZ;
        }

        scene02SideRailGeometry.getAttribute("position").needsUpdate = true;

        scene02SideRailMaterial.opacity = THREE.MathUtils.lerp(
          scene02SideRailMaterial.opacity,
          pathPresence *
            THREE.MathUtils.lerp(
              portalPullCleanup.pathRailMin ?? 0.012,
              portalPullCleanup.pathRailMax ?? 0.105,
              pullEnergy
            ),
          0.055
        );

        for (const haze of scene02HazeSprites) {
          const phase = haze.userData.phase;
          const drift = Math.sin(t * 0.16 + phase);

          haze.position.x =
            haze.userData.baseX +
            Math.cos(t * 0.11 + phase) * 0.045 * pathPresence;
          haze.position.y = haze.userData.baseY + drift * 0.035 * pathPresence;
          haze.position.z =
            haze.userData.baseZ + Math.sin(t * 0.09 + phase) * 0.08 * pathPresence;

          const hazeScale =
            0.72 +
            (phase % 1.4) * 0.28 +
            pathPresence * THREE.MathUtils.lerp(0.20, 0.55, slowBreath);

          haze.scale.set(hazeScale, hazeScale, 1);
          haze.material.opacity = THREE.MathUtils.lerp(
            haze.material.opacity,
            pathPresence *
              THREE.MathUtils.lerp(
                portalPullCleanup.pathHazeMin ?? 0.008,
                portalPullCleanup.pathHazeMax ?? 0.038,
                slowBreath
              ),
            0.045
          );
        }

        if (typeof scene02StreamMaterial !== "undefined" && scene02StreamMaterial) {
          scene02StreamMaterial.opacity = THREE.MathUtils.lerp(
            scene02StreamMaterial.opacity,
            Math.max(
              scene02StreamMaterial.opacity,
              pathPresence * THREE.MathUtils.lerp(0.22, 0.62, pathPulse)
            ),
            0.055
          );
        }

        if (
          typeof scene02IsolationStreamMaterial !== "undefined" &&
          scene02IsolationStreamMaterial
        ) {
          scene02IsolationStreamMaterial.opacity = THREE.MathUtils.lerp(
            scene02IsolationStreamMaterial.opacity,
            Math.max(
              scene02IsolationStreamMaterial.opacity,
              pathPresence * THREE.MathUtils.lerp(0.16, 0.48, slowBreath)
            ),
            0.055
          );
        }

        if (typeof scene02VoidCoreMaterial !== "undefined" && scene02VoidCoreMaterial) {
          scene02VoidCoreMaterial.opacity = THREE.MathUtils.lerp(
            scene02VoidCoreMaterial.opacity,
            Math.max(
              scene02VoidCoreMaterial.opacity,
              pathPresence * THREE.MathUtils.lerp(0.38, 0.72, pathPulse)
            ),
            0.05
          );
        }

        if (typeof scene02GuideLight !== "undefined" && scene02GuideLight) {
          scene02GuideLight.intensity = THREE.MathUtils.lerp(
            scene02GuideLight.intensity,
            Math.max(
              scene02GuideLight.intensity,
              pathPresence *
                THREE.MathUtils.lerp(
                  portalPullCleanup.pathGuideLightMin ?? 0.34,
                  portalPullCleanup.pathGuideLightMax ?? 1.05,
                  pathPulse
                )
            ),
            0.05
          );
        }

        if (
          typeof scene02IsolationLight !== "undefined" &&
          scene02IsolationLight
        ) {
          scene02IsolationLight.intensity = THREE.MathUtils.lerp(
            scene02IsolationLight.intensity,
            Math.max(
              scene02IsolationLight.intensity,
              pathPresence *
                THREE.MathUtils.lerp(
                  portalPullCleanup.pathIsolationLightMin ?? 0.26,
                  portalPullCleanup.pathIsolationLightMax ?? 0.82,
                  slowBreath
                )
            ),
            0.05
          );
        }

        if (
          typeof preScene02StreamMaterial !== "undefined" &&
          preScene02StreamMaterial
        ) {
          preScene02StreamMaterial.opacity = THREE.MathUtils.lerp(
            preScene02StreamMaterial.opacity,
            Math.max(
              preScene02StreamMaterial.opacity,
              pathPresence * THREE.MathUtils.lerp(0.12, 0.32, pathPulse)
            ),
            0.045
          );
        }

        if (
          typeof passagePromptSprite !== "undefined" &&
          passagePromptSprite?.material
        ) {
          passagePromptSprite.material.opacity *= THREE.MathUtils.lerp(
            1.0,
            0.16,
            pathPresence
          );
        }

        if (
          typeof transitionReadinessRing !== "undefined" &&
          transitionReadinessRing?.material
        ) {
          transitionReadinessRing.material.opacity *= THREE.MathUtils.lerp(
            1.0,
            0.22,
            pathPresence
          );
        }

        root.userData.scene02CinematicPath = {
          version: "scene02-cinematic-path-v0.1",
          active: pathPresence > 0.012,
          level: pathPresence,
          pullEnergy,
          mode: "visual-layer-only",
          visualStack: {
            voidCore: true,
            rotatingDepthRings: true,
            forwardStreaks: true,
            localHaze: true,
            accelerationStreaks: true,
            peripheralPullRails: true,
            forwardMotionPolish: true,
          },
          safety: {
            touchesSkyNow: false,
            touchesXRRootNow: false,
            performsTeleportNow: false,
            performsRoomSwitchNow: false,
          },
        };
      }

      // SCENE02-BOOTSTRAP-02 - derive minimal scene02 state.
      // Still no navigation, no teleport, no room switch.
      const scene01TransitionPhase =
        scene02RuntimeSwitchStubArmed
          ? "scene02-runtime-switch-stub-armed"
          : scene02SwitchContractReady
            ? "scene02-switch-contract-ready"
            : scene02VisualIsolationLevel > 0.76
              ? "scene02-visual-isolation"
              : scene02ShellReady
                ? "path-into-unknown-shell"
                : preScene02HandoffLevel > 0.82
                  ? "pre-scene02-handoff"
                  : enterReadinessLevel > 0.72
                    ? "enter-ready"
                    : firstPassageTriggered
                      ? "first-passage"
                      : "threshold-ready";

      const scene02Status =
        scene02RuntimeSwitchStubArmed
          ? "runtime-switch-stub-armed"
          : scene02SwitchContractReady
            ? "switch-contract-ready"
            : scene02VisualIsolationTriggered
              ? scene02HandoffReady
                ? "handoff-ready"
                : "visual-isolation"
              : scene02ShellActivated
                ? "shell-active"
                : preScene02HandoffTriggered
                  ? "warming"
                  : "dormant";

      const scene02Phase =
        scene02RuntimeSwitchStubArmed
          ? "runtime-switch-stub-armed"
          : scene02SwitchContractReady
            ? "switch-contract-ready"
            : scene02VisualIsolationTriggered
              ? scene02HandoffReady
                ? "handoff-ready"
                : "visual-isolation"
              : scene02ShellActivated
                ? scene02ShellReady
                  ? "path-open"
                  : "shell-emerging"
                : preScene02HandoffTriggered
                  ? "preparing"
                  : "locked";

      updateLocalSceneStateRegistry({
        scene01Phase: scene01TransitionPhase,
        scene01Complete: scene02HandoffReady,
        scene01SupportFadeValue: scene01SoftFadeLevel,
        scene02Status,
        scene02Phase,
        scene02ShellActive: scene02ShellActivated,
        scene02ShellValue: scene02ShellLevel,
        scene02VisualIsolationActive: scene02VisualIsolationTriggered,
        scene02VisualIsolationValue: scene02VisualIsolationLevel,
        scene02HandoffReady,
        scene02SwitchContractReadyValue: scene02SwitchContractReady,
        scene02SwitchContractLevelValue: scene02SwitchContractLevel,
        scene02SwitchContract,
        scene02RuntimeSwitchStubArmedValue: scene02RuntimeSwitchStubArmed,
        scene02RuntimeSwitchStubLevelValue: scene02RuntimeSwitchStubLevel,
        scene02RuntimeSwitchStub,
        scene02AdapterObjectReadyValue: scene02AdapterObjectReady,
        scene02AdapterObjectLevelValue: scene02AdapterObjectLevel,
        scene02AdapterObject: root.userData.scene02AdapterObject ?? null,
        scene02RuntimeContainerPreparedValue: scene02RuntimeContainerPrepared,
        scene02RuntimeContainerLevelValue: scene02RuntimeContainerLevel,
        scene02RuntimeContainer: root.userData.scene02RuntimeContainer ?? null,
        scene02ContainerBindingContractReadyValue:
          scene02ContainerBindingContractReady,
        scene02ContainerBindingContractLevelValue:
          scene02ContainerBindingContractLevel,
        scene02ContainerBindingContract:
          root.userData.scene02ContainerBindingContract ?? null,
        scene02ContainerBindingPreflightReadyValue:
          scene02ContainerBindingPreflightReady,
        scene02ContainerBindingPreflightLevelValue:
          scene02ContainerBindingPreflightLevel,
        scene02ContainerBindingPreflight:
          root.userData.scene02ContainerBindingPreflight ?? null,
      });

      // Public readiness state for future real Scene 02 transition.
      // This still does not perform navigation yet.
      root.userData.scene01Transition = {
        ready: transitionReadinessLevel > 0.72,
        inZone: transitionZoneLevel > 0.68,
        canTransition: canStartFirstPassage,
        firstPassageTriggered,
        firstPassageLevel,
        enterReady: enterReadinessLevel > 0.72,
        enterReadiness: enterReadinessLevel,
        promptVisible: passagePromptLevel > 0.2,
        preScene02HandoffTriggered,
        preScene02HandoffLevel,
        preScene02Hold: preScene02HoldTime,
        handoffReady: preScene02HandoffLevel > 0.82,
        scene02ShellActivated,
        scene02ShellLevel,
        scene02ShellHold: scene02ShellHoldTime,
        scene02ShellReady,
        scene02HandoffReady,
        scene02VisualIsolationTriggered,
        scene02VisualIsolationLevel,
        scene02VisualIsolationReady: scene02VisualIsolationLevel > 0.76,
        scene01SoftFadeLevel,
        scene01SupportSecondary: scene01SoftFadeLevel > 0.62,
        scene02SwitchContractReady,
        scene02SwitchContractLevel,
        scene02SwitchContractPhase: scene02SwitchContract.phase,
        scene02RuntimeSwitchStubArmed,
        scene02RuntimeSwitchStubLevel,
        scene02RuntimeSwitchStubPhase: scene02RuntimeSwitchStub.phase,
        scene02AdapterObjectReady,
        scene02AdapterObjectLevel,
        scene02AdapterObjectPhase: root.userData.scene02AdapterObject?.phase ?? "not-ready",
        scene02AdapterObjectBoundToRegistry:
          Boolean(root.userData.sceneRegistry?.scene02?.adapterObject),
        scene02LocalSceneIdSwitchReady,
        scene02LocalSceneIdSwitchLevel,
        scene02LocalSceneIdSwitchPhase:
          root.userData.scene02LocalSceneIdSwitch?.phase ?? "not-ready",
        currentLocalSceneId: root.userData.currentLocalSceneId ?? "scene01-sanctuary",
        previousLocalSceneId: root.userData.previousLocalSceneId ?? null,
        localSceneSwitchMode: root.userData.localSceneSwitchMode ?? "none",
        scene02VisualResponseActive:
          root.userData.scene02VisualResponse?.active ?? false,
        scene02VisualResponseLevel: scene02SemanticVisualPriorityLevel,
        scene02VisualResponsePhase:
          root.userData.scene02VisualResponse?.phase ?? "not-active",
        scene02RuntimeContainerPrepared,
        scene02RuntimeContainerLevel,
        scene02RuntimeContainerPhase:
          root.userData.scene02RuntimeContainer?.phase ?? "not-ready",
        scene02ContainerBindingContractReady,
        scene02ContainerBindingContractLevel,
        scene02ContainerBindingContractPhase:
          root.userData.scene02ContainerBindingContract?.phase ?? "not-ready",
        scene02ContainerBindingCanBindFutureChildren:
          root.userData.scene02ContainerBindingContract?.canBindFutureChildren ?? false,
        scene02ContainerBindingPreflightReady,
        scene02ContainerBindingPreflightLevel,
        scene02ContainerBindingPreflightPhase:
          root.userData.scene02ContainerBindingPreflight?.phase ?? "not-ready",
        scene02ContainerBindingCanAttemptFutureBinding:
          root.userData.scene02ContainerBindingPreflight?.canAttemptFutureBinding ?? false,
        scene02ContainerActualBindingRequested,
        scene02ContainerActualBindingComplete,
        scene02ContainerActualBindingFailed,
        scene02ContainerActualBindingLevel,
        scene02ContainerActualBindingPhase:
          root.userData.scene02ContainerActualBinding?.phase ?? "not-ready",
        scene02RuntimeModuleReady:
          root.userData.scene02RuntimeModule?.ready ?? false,
        scene02RuntimeModulePhase:
          root.userData.scene02RuntimeModule?.phase ?? "not-ready",
        scene02RuntimeModuleReadyForExtraction:
          root.userData.scene02RuntimeModule?.readyForFutureFullExtraction ?? false,
        hold: firstPassageHoldTime,
        readiness: transitionReadinessLevel,
        proximity: transitionZoneLevel,
        phase: scene01TransitionPhase,
      };

      root.userData.sceneRegistry = localSceneStateRegistry;
      root.userData.scene02 = localSceneStateRegistry.scene02;

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
        activationPeakLevel * (preset.activationPeak?.soundBoost ?? 0.42),
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
        enterReady: false,
        enterReadiness: 0,
        promptVisible: false,
        preScene02HandoffTriggered: false,
        preScene02HandoffLevel: 0,
        preScene02Hold: 0,
        handoffReady: false,
        scene02ShellActivated: false,
        scene02ShellLevel: 0,
        scene02ShellHold: 0,
        scene02ShellReady: false,
        scene02HandoffReady: false,
        scene02VisualIsolationTriggered: false,
        scene02VisualIsolationLevel: 0,
        scene02VisualIsolationReady: false,
        scene01SoftFadeLevel: 0,
        scene01SupportSecondary: false,
        scene02SwitchContractReady: false,
        scene02SwitchContractLevel: 0,
        scene02SwitchContractPhase: "not-ready",
        scene02RuntimeSwitchStubArmed: false,
        scene02RuntimeSwitchStubLevel: 0,
        scene02RuntimeSwitchStubPhase: "not-ready",
        scene02AdapterObjectReady: false,
        scene02AdapterObjectLevel: 0,
        scene02AdapterObjectPhase: "not-ready",
        scene02AdapterObjectBoundToRegistry: false,
        scene02LocalSceneIdSwitchReady: false,
        scene02LocalSceneIdSwitchLevel: 0,
        scene02LocalSceneIdSwitchPhase: "not-ready",
        currentLocalSceneId: "scene01-sanctuary",
        previousLocalSceneId: null,
        localSceneSwitchMode: "none",
        scene02VisualResponseActive: false,
        scene02VisualResponseLevel: 0,
        scene02VisualResponsePhase: "not-active",
        scene02RuntimeContainerPrepared: false,
        scene02RuntimeContainerLevel: 0,
        scene02RuntimeContainerPhase: "not-ready",
        scene02ContainerBindingContractReady: false,
        scene02ContainerBindingContractLevel: 0,
        scene02ContainerBindingContractPhase: "not-ready",
        scene02ContainerBindingCanBindFutureChildren: false,
        scene02ContainerBindingPreflightReady: false,
        scene02ContainerBindingPreflightLevel: 0,
        scene02ContainerBindingPreflightPhase: "not-ready",
        scene02ContainerBindingCanAttemptFutureBinding: false,
        scene02ContainerActualBindingRequested: false,
        scene02ContainerActualBindingComplete: false,
        scene02ContainerActualBindingFailed: false,
        scene02ContainerActualBindingLevel: 0,
        scene02ContainerActualBindingPhase: "not-ready",
        scene02RuntimeModuleReady: false,
        scene02RuntimeModulePhase: "not-ready",
        scene02RuntimeModuleReadyForExtraction: false,
        hold: 0,
        readiness: 0,
        proximity: 0,
        phase: "closed",
      };
    },
    getSceneStateRegistry() {
      return root.userData.sceneRegistry ?? localSceneStateRegistry;
    },
    getScene02State() {
      return root.userData.scene02 ?? localSceneStateRegistry.scene02;
    },
    getScene02SwitchContract() {
      return root.userData.scene02SwitchContract ?? createScene02SwitchContract({
        ready: false,
        level: 0,
        phase: "not-ready",
        proximity: 0,
        scene02ShellValue: 0,
        scene02VisualIsolationValue: 0,
      });
    },
    getScene02RuntimeSwitchStub() {
      return root.userData.scene02RuntimeSwitch ?? createScene02RuntimeSwitchStub({
        armed: false,
        level: 0,
        phase: "not-ready",
        proximity: 0,
        switchContract: root.userData.scene02SwitchContract ?? null,
      });
    },
    getScene02RuntimeDiagnostic() {
      return root.userData.scene02RuntimeDiagnostic ?? createScene02RuntimeDiagnostic({
        transitionState: root.userData.scene01Transition ?? null,
        switchContract: root.userData.scene02SwitchContract ?? null,
        runtimeSwitchStub: root.userData.scene02RuntimeSwitch ?? null,
        proximity: 0,
      });
    },
    getScene02AdapterObject() {
      return root.userData.scene02AdapterObject ?? createScene02AdapterObject({
        ready: false,
        level: 0,
        phase: "not-ready",
        diagnostic: root.userData.scene02RuntimeDiagnostic ?? null,
        switchContract: root.userData.scene02SwitchContract ?? null,
        runtimeSwitchStub: root.userData.scene02RuntimeSwitch ?? null,
        proximity: 0,
      });
    },
    getScene02LocalSceneIdSwitch() {
      return root.userData.scene02LocalSceneIdSwitch ?? {
        version: "scene02-local-scene-id-switch-v0.1",
        ready: false,
        level: 0,
        phase: "not-ready",
        previousLocalSceneId: root.userData.previousLocalSceneId ?? null,
        currentLocalSceneId: root.userData.currentLocalSceneId ?? "scene01-sanctuary",
        mode: root.userData.localSceneSwitchMode ?? "none",
        safety: {
          semanticOnly: true,
          performsTeleportNow: false,
          performsRoomSwitchNow: false,
          changesVisualsNow: false,
          touchesSkyNow: false,
          touchesXRRootNow: false,
        },
      };
    },
    getScene02VisualResponse() {
      return root.userData.scene02VisualResponse ??
        createScene02VisualResponseStateFromPathScene({
          active: false,
          level: 0,
          phase: "not-active",
          currentLocalSceneId:
            root.userData.currentLocalSceneId ?? "scene01-sanctuary",
        });
    },
    isRitualChargeComplete() {
      return ritualChargeComplete;
    },
    getScene02RuntimeContainer() {
      return root.userData.scene02RuntimeContainer ??
        createScene02RuntimeContainerStateFromPathScene({
          prepared: false,
          level: 0,
          phase: "not-ready",
          acceptsFutureChildren: false,
          currentChildrenBound: false,
          existingVisualLayersStillInPlace: true,
        });
    },
    getScene02ContainerBindingContract() {
      return root.userData.scene02ContainerBindingContract ?? createScene02ContainerBindingContract({
        ready: false,
        level: 0,
        phase: "not-ready",
        container: root.userData.scene02RuntimeContainer ?? null,
        adapterObject: root.userData.scene02AdapterObject ?? null,
        currentLocalSceneId:
          root.userData.currentLocalSceneId ?? "scene01-sanctuary",
        targets: {
          scene02ShellRoot,
          scene02IsolationRoot,
          preScene02Root,
          firstPassageRoot,
          passageRoot,
        },
      });
    },
    getScene02ContainerBindingPreflight() {
      return root.userData.scene02ContainerBindingPreflight ?? createScene02ContainerBindingPreflight({
        ready: false,
        level: 0,
        phase: "not-ready",
        bindingContract: root.userData.scene02ContainerBindingContract ?? null,
        containerRoot: scene02RuntimeContainerRoot ?? null,
        currentLocalSceneId:
          root.userData.currentLocalSceneId ?? "scene01-sanctuary",
        targets: {
          scene02ShellRoot,
          scene02IsolationRoot,
          preScene02Root,
          firstPassageRoot,
          passageRoot,
        },
      });
    },
    getScene02ContainerActualBinding() {
      return root.userData.scene02ContainerActualBinding ?? createScene02ActualBindingState({
        requested: false,
        complete: false,
        failed: false,
        level: 0,
        phase: "not-ready",
        results: [],
        containerRoot: scene02RuntimeContainerRoot ?? null,
      });
    },
    getScene02RuntimeModule() {
      return root.userData.scene02RuntimeModule ??
        pathIntoUnknownSceneRuntime.getSnapshot();
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
      activationPeakAge = 999;
      activationPeakLevel = 0;
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










