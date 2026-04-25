import * as THREE from "three";
import { XRHandModelFactory } from "three/examples/jsm/webxr/XRHandModelFactory.js";

const ROOM_STYLE = {
  "hall-of-arrival": {
    handColor: "#7ea4ff",
    handEmissive: "#4b79ff",
    handOpacity: 0.16,
    handEmissiveIntensity: 0.08,
    scale: 1.0,
  },
  "signal-corridor": {
    handColor: "#86acff",
    handEmissive: "#5b88ff",
    handOpacity: 0.18,
    handEmissiveIntensity: 0.10,
    scale: 1.0,
  },
  "membrane-chamber": {
    handColor: "#93b7ff",
    handEmissive: "#6b96ff",
    handOpacity: 0.20,
    handEmissiveIntensity: 0.12,
    scale: 1.02,
  },
  "portal-atrium": {
    handColor: "#98bcff",
    handEmissive: "#739dff",
    handOpacity: 0.19,
    handEmissiveIntensity: 0.11,
    scale: 1.02,
  },
};

function getRoomStyle(roomId) {
  return ROOM_STYLE[roomId] ?? ROOM_STYLE["hall-of-arrival"];
}

function makeGhostHandMaterial(sourceMaterial, style) {
  const next = new THREE.MeshBasicMaterial({
    color: new THREE.Color(style.handColor),
    transparent: true,
    opacity: style.handOpacity,
    depthWrite: false,
    depthTest: true,
    blending: THREE.NormalBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
  });

  if ("name" in sourceMaterial && sourceMaterial.name) {
    next.name = sourceMaterial.name + "__whisperGhost";
  }

  return next;
}

function ensureStyled(bundle, style) {
  bundle.model.traverse((obj) => {
    if (!(obj.isMesh || obj.isSkinnedMesh)) return;

    if (obj.userData.__whisperStyled) return;

    if (Array.isArray(obj.material)) {
      obj.material = obj.material.map((mat) => makeGhostHandMaterial(mat, style));
      bundle.handMaterials.push(...obj.material);
    } else if (obj.material) {
      obj.material = makeGhostHandMaterial(obj.material, style);
      bundle.handMaterials.push(obj.material);
    }

    obj.renderOrder = 70;
    obj.castShadow = false;
    obj.receiveShadow = false;
    obj.userData.__whisperStyled = true;
  });
}

function createBundle(index, renderer, factory) {
  const handObject = renderer.xr.getHand(index);
  handObject.name = `xr-articulated-hand-${index}`;

  const model = factory.createHandModel(handObject, "mesh");
  model.visible = false;
  handObject.add(model);

  return {
    index,
    handObject,
    model,
    handMaterials: [],
  };
}

export function createHandVisualProxySystem({
  handPresence,
  renderer,
}) {
  const factory = new XRHandModelFactory();

  const bundles = [
    createBundle(0, renderer, factory),
    createBundle(1, renderer, factory),
  ];

  function findSideStateForIndex(index) {
    const left = handPresence.getSide("left");
    if (left?.source === "hand-tracking" && left?.sourceIndex === index) {
      return left;
    }

    const right = handPresence.getSide("right");
    if (right?.source === "hand-tracking" && right?.sourceIndex === index) {
      return right;
    }

    return null;
  }

  function applyRuntimeStyle(bundle, style, sideState, timeMs) {
    ensureStyled(bundle, style);

    const pulse = 0.5 + 0.5 * Math.sin(timeMs * 0.0018 + bundle.index * 0.8);
    const proximity = sideState?.proximityIntensity ?? 0;
    const contact = sideState?.contactIntensity ?? 0;
    const ritual = sideState?.ritualCharge ?? 0;

    const handOpacity =
      style.handOpacity +
      pulse * 0.008 +
      proximity * 0.02 +
      contact * 0.025 +
      ritual * 0.012;

    bundle.handMaterials.forEach((mat) => {
      if (!mat) return;
      mat.opacity = handOpacity;
      mat.color.set(style.handColor);
    });

    bundle.model.scale.setScalar(style.scale * (1 + contact * 0.015));
  }

  function update({
    currentRoomId = "",
    timeMs = performance.now(),
  } = {}) {
    const style = getRoomStyle(currentRoomId);

    ["left", "right"].forEach((side) => {
      const mount = handPresence.getMount(side);
      if (mount?.visualRoot) {
        mount.visualRoot.visible = false;
      }
    });

    bundles.forEach((bundle) => {
      const sideState = findSideStateForIndex(bundle.index);

      const visible =
        Boolean(sideState?.presenting) &&
        Boolean(sideState?.visible) &&
        sideState?.source === "hand-tracking";

      bundle.handObject.visible = visible;
      bundle.model.visible = visible;

      if (!visible) return;

      applyRuntimeStyle(bundle, style, sideState, timeMs);
    });
  }

  function dispose() {
    bundles.forEach((bundle) => {
      try {
        bundle.model.removeFromParent();
      } catch {}

      try {
        bundle.handObject.remove(bundle.model);
      } catch {}

      bundle.model.traverse((obj) => {
        try { obj.geometry?.dispose?.(); } catch {}
      });

      bundle.handMaterials.forEach((mat) => {
        try { mat?.dispose?.(); } catch {}
      });
    });
  }

  return {
    update,
    dispose,
  };
}