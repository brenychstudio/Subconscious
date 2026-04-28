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

export function createTempleSanctuary() {
  const preset = templeSanctuaryPreset;

  const root = new THREE.Group();
  root.name = "TempleSanctuaryRoot";

  const decorRoot = new THREE.Group();
  decorRoot.name = "TempleSanctuaryDecorRoot";
  root.add(decorRoot);

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
      color: new THREE.Color(thresholdDrift.color ?? "#a9c4ff"),
      transparent: true,
      opacity: 0,
      size: thresholdDrift.size ?? 0.022,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  thresholdDriftPoints.name = "TempleSanctuaryThresholdDrift";
  thresholdDriftPoints.position.z = -0.08;
  thresholdRoot.add(thresholdDriftPoints);

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

      chamberAnchor.scale.setScalar(proximityScale * breath);

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
      root.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose?.();
        if (obj.material) disposeMaterial(obj.material);
      });
      root.removeFromParent();
    },
  };
}
