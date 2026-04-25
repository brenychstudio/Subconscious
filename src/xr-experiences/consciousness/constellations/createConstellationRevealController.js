import * as THREE from "three";

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function remap01(x, a, b) {
  if (b <= a) return x >= b ? 1 : 0;
  return clamp01((x - a) / (b - a));
}

function buildHeroLookup(heroStarsGroup) {
  const map = new Map();
  heroStarsGroup?.children?.forEach((sprite) => {
    const id = sprite?.userData?.starId;
    if (id) map.set(id, sprite);
  });
  return map;
}

function buildPresentationGroup(skySystem, entry) {
  const group = new THREE.Group();
  group.name = "constellation-presentation-stage";

  const heroLookup = buildHeroLookup(skySystem.layers.heroStars);
  const layout = entry.presentationLayout ?? [];
  const edgeList = entry.presentationEdges ?? [];
  const starPositions = new Map();

  layout.forEach((node) => {
    const source = heroLookup.get(node.id);
    if (!source) return;

    const isBright = (source.userData?.magnitude ?? 99) < 1.4;

    const material = new THREE.SpriteMaterial({
      map: source.material.map,
      color: 0xf5f9ff,
      transparent: true,
      opacity: isBright ? 0.96 : 0.86,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const sprite = new THREE.Sprite(material);
    sprite.position.set(node.x, node.y, 0);

    const baseScale = isBright ? 0.28 : 0.21;
    sprite.scale.setScalar(baseScale);

    group.add(sprite);
    starPositions.set(node.id, sprite.position.clone());
  });

  edgeList.forEach(([aId, bId]) => {
    const a = starPositions.get(aId);
    const b = starPositions.get(bId);
    if (!a || !b) return;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [a.x, a.y, a.z, b.x, b.y, b.z],
        3
      )
    );

    const material = new THREE.LineBasicMaterial({
      color: 0x95afe8,
      transparent: true,
      opacity: 0.20,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const line = new THREE.Line(geometry, material);
    group.add(line);
  });

  return group;
}

function collectOriginalSelection(skySystem, starIds) {
  const starSet = new Set(starIds);

  const stars = skySystem.layers.heroStars.children.filter((sprite) =>
    starSet.has(sprite?.userData?.starId)
  );

  const lines = skySystem.layers.constellationLines.children.filter((line) => {
    const fromId = line?.userData?.fromId;
    const toId = line?.userData?.toId;
    return starSet.has(fromId) && starSet.has(toId);
  });

  return { stars, lines };
}

function applyDimFactor(originalSelection, factor) {
  if (!originalSelection) return;

  originalSelection.stars.forEach((sprite) => {
    const base = sprite.userData.__loreBaseOpacity ?? sprite.material.opacity;
    sprite.userData.__loreBaseOpacity = base;
    sprite.material.opacity = base * factor;
  });

  originalSelection.lines.forEach((line) => {
    const base = line.userData.__loreBaseOpacity ?? line.material.opacity;
    line.userData.__loreBaseOpacity = base;
    line.material.opacity = base * factor;
  });
}

function restoreOriginal(originalSelection) {
  if (!originalSelection) return;

  originalSelection.stars.forEach((sprite) => {
    const base = sprite.userData.__loreBaseOpacity;
    if (typeof base === "number") sprite.material.opacity = base;
  });

  originalSelection.lines.forEach((line) => {
    const base = line.userData.__loreBaseOpacity;
    if (typeof base === "number") line.material.opacity = base;
  });
}

export function createConstellationRevealController({
  scene,
  camera,
  skySystem,
  entry,
  overlay,
}) {
  const cameraWorldPos = new THREE.Vector3();
  const cameraQuat = new THREE.Quaternion();
  const cameraForward = new THREE.Vector3();
  const cameraRight = new THREE.Vector3(1, 0, 0);
  const cameraUp = new THREE.Vector3(0, 1, 0);

  const rigTarget = new THREE.Vector3();
  const rigQuat = new THREE.Quaternion();
  const rigEuler = new THREE.Euler();

  let mode = "idle";
  let progress = 0;
  let presentationRig = null;
  let stageGroup = null;
  let originalSelection = null;
  let loreOpened = false;

  function computeRigTransform() {
    camera.getWorldPosition(cameraWorldPos);
    camera.getWorldQuaternion(cameraQuat);

    cameraForward.set(0, 0, -1).applyQuaternion(cameraQuat).normalize();
    cameraRight.set(1, 0, 0).applyQuaternion(cameraQuat).normalize();
    cameraUp.set(0, 1, 0).applyQuaternion(cameraQuat).normalize();

    rigTarget
      .copy(cameraWorldPos)
      .add(cameraForward.clone().multiplyScalar(entry.rigDistance ?? 3.35))
      .add(cameraRight.clone().multiplyScalar(entry.rigSide ?? 0))
      .add(cameraUp.clone().multiplyScalar(entry.rigLift ?? 0.04));

    rigEuler.setFromQuaternion(cameraQuat, "YXZ");
    rigEuler.x = 0;
    rigEuler.z = 0;
    rigQuat.setFromEuler(rigEuler);
  }

  function open(target) {
    if (!target || mode === "opening" || mode === "open") return;

    computeRigTransform();

    presentationRig = new THREE.Group();
    presentationRig.name = "constellation-presentation-rig";
    presentationRig.position.copy(rigTarget);
    presentationRig.quaternion.copy(rigQuat);

    stageGroup = buildPresentationGroup(skySystem, entry);
    stageGroup.position.set(entry.constellationOffsetX ?? -0.86, entry.constellationOffsetY ?? 0.10, 0);
    stageGroup.scale.setScalar(0.22);

    stageGroup.traverse((obj) => {
      if (obj.material?.opacity != null) {
        obj.material.opacity *= 0.22;
      }
    });

    presentationRig.add(stageGroup);
    scene.add(presentationRig);

    originalSelection = collectOriginalSelection(skySystem, target.starIds);

    overlay.setLoreWorldPosition(
      rigTarget.clone()
        .add(new THREE.Vector3(entry.panelOffsetX ?? 0.96, entry.panelOffsetY ?? 0.06, 0).applyQuaternion(rigQuat))
    );

    if (overlay.loreMesh) {
      overlay.loreMesh.quaternion.copy(rigQuat);
    }

    mode = "opening";
    progress = 0;
    loreOpened = false;
  }

  function close() {
    if (mode === "idle" || mode === "closing") return;
    mode = "closing";
    overlay.closeLore();
  }

  function isOpen() {
    return mode === "open";
  }

  function isBusy() {
    return mode === "opening" || mode === "closing";
  }

  function update({ dtMs = 16 }) {
    if (!presentationRig || !stageGroup) return;

    const openDuration = entry.openDurationMs ?? 1700;
    const closeDuration = entry.closeDurationMs ?? 1350;
    const duration = mode === "closing" ? closeDuration : openDuration;
    const delta = dtMs / duration;

    if (mode === "opening") {
      progress = Math.min(1, progress + delta);
      if (progress >= 1) {
        progress = 1;
        mode = "open";
      }
    } else if (mode === "closing") {
      progress = Math.max(0, progress - delta);
      if (progress <= 0) {
        restoreOriginal(originalSelection);

        scene.remove(presentationRig);
        presentationRig.traverse((obj) => {
          obj.geometry?.dispose?.();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((mat) => mat.dispose?.());
            } else {
              obj.material.dispose?.();
            }
          }
        });

        presentationRig = null;
        stageGroup = null;
        originalSelection = null;
        loreOpened = false;
        mode = "idle";
        return;
      }
    }

    const eased = easeInOutCubic(progress);
    const stageT = easeInOutCubic(remap01(progress, 0.08, 0.84));

    stageGroup.scale.setScalar(0.22 + (entry.constellationScale ?? 0.88) * stageT);
    stageGroup.position.y = (entry.constellationOffsetY ?? 0.10) + Math.sin(progress * Math.PI) * 0.03;

    stageGroup.traverse((obj) => {
      if (obj.material?.opacity != null) {
        const isLine = obj.type === "Line";
        const targetOpacity = isLine ? 0.22 : 0.94;
        obj.material.opacity += (targetOpacity - obj.material.opacity) * 0.09;
      }
    });

    applyDimFactor(originalSelection, Math.max(0.18, 1 - eased * 0.82));

    const panelThreshold = clamp01((entry.panelDelayMs ?? 620) / openDuration);
    if (!loreOpened && progress >= panelThreshold) {
      overlay.openLore({
        title: entry.title,
        body: entry.body,
      });
      loreOpened = true;
    }

    if (overlay.loreMesh) {
      overlay.loreMesh.quaternion.copy(rigQuat);
    }
  }

  function dispose() {
    restoreOriginal(originalSelection);
    if (presentationRig) {
      scene.remove(presentationRig);
    }
    overlay.closeLore();
  }

  return {
    open,
    close,
    update,
    isOpen,
    isBusy,
    dispose,
  };
}
