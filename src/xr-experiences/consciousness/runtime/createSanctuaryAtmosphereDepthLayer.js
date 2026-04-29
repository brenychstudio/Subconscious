function clamp01(value) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function makeRadialGradientTexture(THREE, size = 512) {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, size, size);

  const gradient = ctx.createRadialGradient(
    size * 0.5,
    size * 0.5,
    size * 0.02,
    size * 0.5,
    size * 0.5,
    size * 0.62
  );

  gradient.addColorStop(0.0, "rgba(255,255,255,0.18)");
  gradient.addColorStop(0.22, "rgba(210,228,255,0.095)");
  gradient.addColorStop(0.54, "rgba(145,178,255,0.032)");
  gradient.addColorStop(1.0, "rgba(255,255,255,0.0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  if ("SRGBColorSpace" in THREE) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  return texture;
}

function makeVerticalHazeTexture(THREE, width = 256, height = 1024) {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0.0, "rgba(255,255,255,0.0)");
  gradient.addColorStop(0.16, "rgba(255,255,255,0.032)");
  gradient.addColorStop(0.42, "rgba(255,255,255,0.09)");
  gradient.addColorStop(0.68, "rgba(255,255,255,0.062)");
  gradient.addColorStop(1.0, "rgba(255,255,255,0.0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  if ("SRGBColorSpace" in THREE) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  return texture;
}

function makeSoftDustTexture(THREE, size = 64) {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const half = size * 0.5;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);

  gradient.addColorStop(0.0, "rgba(255,255,255,0.86)");
  gradient.addColorStop(0.35, "rgba(220,236,255,0.34)");
  gradient.addColorStop(1.0, "rgba(255,255,255,0.0)");

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  if ("SRGBColorSpace" in THREE) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  return texture;
}

function disposeMaterial(material) {
  if (!material) return;
  if (Array.isArray(material)) {
    material.forEach((item) => item?.dispose?.());
    return;
  }
  material.dispose?.();
}

export function createSanctuaryAtmosphereDepthLayer(THREE, preset = {}) {
  const root = new THREE.Group();
  root.name = "SanctuaryAtmosphereDepthLayer";

  const enabled = preset.enabled !== false;
  const color = new THREE.Color(preset.color ?? "#9fbaff");

  const floorTexture = makeRadialGradientTexture(THREE, 512);
  const hazeTexture = makeVerticalHazeTexture(THREE, 256, 1024);
  const dustTexture = makeSoftDustTexture(THREE, 64);

  const floorGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(preset.floorSize ?? 16, preset.floorSize ?? 16, 1, 1),
    new THREE.MeshBasicMaterial({
      map: floorTexture ?? undefined,
      color,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      toneMapped: false,
    })
  );
  floorGlow.name = "SanctuaryAtmosphereFloorGlow";
  floorGlow.rotation.x = -Math.PI / 2;
  floorGlow.position.set(0, preset.floorY ?? 0.018, preset.floorZ ?? 1.6);
  root.add(floorGlow);

  const verticalHaze = new THREE.Mesh(
    new THREE.CylinderGeometry(
      preset.hazeRadius ?? 7.2,
      preset.hazeRadius ?? 7.2,
      preset.hazeHeight ?? 6.6,
      72,
      1,
      true
    ),
    new THREE.MeshBasicMaterial({
      map: hazeTexture ?? undefined,
      color,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
      fog: false,
      toneMapped: false,
    })
  );
  verticalHaze.name = "SanctuaryAtmosphereVerticalHaze";
  verticalHaze.position.set(0, preset.hazeY ?? 2.95, preset.hazeZ ?? 0.8);
  root.add(verticalHaze);

  const veilGroup = new THREE.Group();
  veilGroup.name = "SanctuaryAtmosphereVeilGroup";
  root.add(veilGroup);

  const veilTexture = makeVerticalHazeTexture(THREE, 256, 1024);
  const veils = [];

  const veilSpecs = preset.veils ?? [
    { z: -1.8, y: 1.75, width: 8.8, height: 3.8, opacity: 0.032, rotationY: 0.0 },
    { z: 1.8, y: 1.48, width: 11.2, height: 3.2, opacity: 0.022, rotationY: 0.12 },
    { z: 4.6, y: 1.18, width: 14.2, height: 2.4, opacity: 0.018, rotationY: -0.09 },
  ];

  veilSpecs.forEach((spec, index) => {
    const material = new THREE.MeshBasicMaterial({
      map: veilTexture ?? undefined,
      color,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      fog: false,
      toneMapped: false,
    });

    const veil = new THREE.Mesh(
      new THREE.PlaneGeometry(spec.width, spec.height, 1, 1),
      material
    );

    veil.name = `SanctuaryAtmosphereDepthVeil_${index}`;
    veil.position.set(0, spec.y, spec.z);
    veil.rotation.y = spec.rotationY ?? 0;
    veil.userData.baseOpacity = spec.opacity ?? 0.02;
    veil.userData.phase = index * 1.618;

    veilGroup.add(veil);
    veils.push(veil);
  });

  const dustCount = Math.max(0, Math.floor(preset.dustCount ?? 112));
  const dustPositions = new Float32Array(dustCount * 3);
  const dustBasePositions = new Float32Array(dustCount * 3);
  const dustPhases = new Float32Array(dustCount);
  const dustVelocity = new Float32Array(dustCount * 3);

  for (let i = 0; i < dustCount; i += 1) {
    const i3 = i * 3;
    const radius = Math.sqrt(Math.random()) * (preset.dustRadius ?? 6.8);
    const angle = Math.random() * Math.PI * 2;
    const y = THREE.MathUtils.lerp(
      preset.dustYMin ?? 0.45,
      preset.dustYMax ?? 3.2,
      Math.random()
    );
    const z =
      THREE.MathUtils.lerp(
        preset.dustZMin ?? -4.2,
        preset.dustZMax ?? 5.4,
        Math.random()
      ) + Math.sin(angle) * 0.7;

    dustBasePositions[i3 + 0] = Math.cos(angle) * radius;
    dustBasePositions[i3 + 1] = y;
    dustBasePositions[i3 + 2] = z;

    dustPositions[i3 + 0] = dustBasePositions[i3 + 0];
    dustPositions[i3 + 1] = dustBasePositions[i3 + 1];
    dustPositions[i3 + 2] = dustBasePositions[i3 + 2];

    dustVelocity[i3 + 0] = (Math.random() - 0.5) * (preset.dustDriftX ?? 0.018);
    dustVelocity[i3 + 1] = (Math.random() - 0.5) * (preset.dustDriftY ?? 0.01);
    dustVelocity[i3 + 2] = (Math.random() - 0.5) * (preset.dustDriftZ ?? 0.014);

    dustPhases[i] = Math.random() * Math.PI * 2;
  }

  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));

  const dustMaterial = new THREE.PointsMaterial({
    map: dustTexture ?? undefined,
    alphaMap: dustTexture ?? undefined,
    alphaTest: dustTexture ? 0.001 : 0,
    color,
    size: preset.dustSize ?? 0.038,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    toneMapped: false,
  });

  const dust = new THREE.Points(dustGeometry, dustMaterial);
  dust.name = "SanctuaryAtmosphereSoftDust";
  dust.frustumCulled = false;
  root.add(dust);

  const update = ({
    elapsed = 0,
    deltaSeconds = 1 / 60,
    proximityLevel = 0,
    ritualChargeLevel = 0,
    transformationCueLevel = 0,
    openingStateLevel = 0,
    releaseAmount = 0,
    firstFrameAmount = 0,
  } = {}) => {
    if (!enabled) {
      root.visible = false;
      return;
    }

    root.visible = true;

    const safeDt = Math.max(0, Math.min(0.08, deltaSeconds));
    const proximity = clamp01(proximityLevel);
    const charge = clamp01(ritualChargeLevel);
    const transform = clamp01(transformationCueLevel);
    const opening = clamp01(openingStateLevel);
    const release = clamp01(releaseAmount);
    const firstFrame = clamp01(firstFrameAmount);

    const breathSpeed = preset.breathSpeed ?? 0.28;
    const slowBreath = 0.5 + 0.5 * Math.sin(elapsed * breathSpeed);
    const deepBreath = 0.5 + 0.5 * Math.sin(elapsed * (preset.deepBreathSpeed ?? 0.12) + 1.4);

    const presence =
      (preset.basePresence ?? 0.72) +
      firstFrame * (preset.firstFrameBoost ?? 0.18) +
      proximity * (preset.proximityBoost ?? 0.16) +
      charge * (preset.chargeBoost ?? 0.08) +
      transform * (preset.transformationBoost ?? 0.14) +
      opening * (preset.openingBoost ?? 0.2) +
      release * (preset.releaseBoost ?? 0.16);

    const amount = clamp01(presence);

    floorGlow.material.opacity =
      amount * (preset.floorOpacity ?? 0.052) * (0.78 + slowBreath * 0.22);

    verticalHaze.material.opacity =
      amount * (preset.hazeOpacity ?? 0.046) * (0.74 + deepBreath * 0.26);

    verticalHaze.rotation.y += safeDt * (preset.hazeRotationSpeed ?? 0.006);
    verticalHaze.scale.setScalar(
      1 + slowBreath * (preset.hazeScaleAmp ?? 0.018) + opening * 0.012
    );

    veils.forEach((veil) => {
      const phase = veil.userData.phase ?? 0;
      const localBreath = 0.5 + 0.5 * Math.sin(elapsed * 0.22 + phase);
      veil.material.opacity =
        amount * (veil.userData.baseOpacity ?? 0.02) * (0.66 + localBreath * 0.34);

      veil.position.x = Math.sin(elapsed * 0.08 + phase) * (preset.veilDriftX ?? 0.06);
      veil.position.y += Math.sin(elapsed * 0.11 + phase) * (preset.veilDriftY ?? 0.0006);
    });

    dustMaterial.opacity =
      amount * (preset.dustOpacity ?? 0.058) * (0.72 + slowBreath * 0.28);

    if (dustCount > 0) {
      const attr = dustGeometry.getAttribute("position");

      for (let i = 0; i < dustCount; i += 1) {
        const i3 = i * 3;
        const phase = dustPhases[i];

        dustPositions[i3 + 0] =
          dustBasePositions[i3 + 0] +
          Math.sin(elapsed * 0.12 + phase) * (preset.dustFloatX ?? 0.035) +
          dustVelocity[i3 + 0] * elapsed * 0.18;

        dustPositions[i3 + 1] =
          dustBasePositions[i3 + 1] +
          Math.sin(elapsed * 0.16 + phase) * (preset.dustFloatY ?? 0.045) +
          dustVelocity[i3 + 1] * elapsed * 0.14;

        dustPositions[i3 + 2] =
          dustBasePositions[i3 + 2] +
          Math.cos(elapsed * 0.1 + phase) * (preset.dustFloatZ ?? 0.04) +
          dustVelocity[i3 + 2] * elapsed * 0.16;
      }

      attr.needsUpdate = true;
    }

    root.rotation.y += safeDt * (preset.rootDrift ?? 0.002);
  };

  const dispose = () => {
    root.traverse((object) => {
      if (object.geometry) object.geometry.dispose?.();
      if (object.material) disposeMaterial(object.material);
    });

    try {
      floorTexture?.dispose?.();
    } catch {}
    try {
      hazeTexture?.dispose?.();
    } catch {}
    try {
      veilTexture?.dispose?.();
    } catch {}
    try {
      dustTexture?.dispose?.();
    } catch {}

    root.removeFromParent();
  };

  return {
    root,
    update,
    dispose,
  };
}

export default createSanctuaryAtmosphereDepthLayer;
