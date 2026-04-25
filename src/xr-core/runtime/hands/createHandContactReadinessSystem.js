import * as THREE from "three";

const _targetPos = new THREE.Vector3();
const _handPos = new THREE.Vector3();
const _worldPos = new THREE.Vector3();

const AUTO_SCAN_INTERVAL_MS = 1400;
const MAX_DWELL_MS = 2200;

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function smooth01(x) {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
}

function intensityFromDistance(distance, radius) {
  if (!Number.isFinite(radius) || radius <= 0) return 0;
  return smooth01(1 - clamp01(distance / radius));
}

function inferTypeFromObject(object3D) {
  const raw = `${object3D.name || ""} ${object3D.userData?.type || ""} ${object3D.userData?.kind || ""}`.toLowerCase();

  if (raw.includes("portal")) return "portal";
  if (raw.includes("membrane")) return "membrane";
  if (raw.includes("signal")) return "signal";
  if (raw.includes("core")) return "core";
  return "generic";
}

function inferRoomIdFromObject(object3D) {
  if (object3D.userData?.roomId) return object3D.userData.roomId;

  let node = object3D.parent;
  while (node) {
    if (node.userData?.roomId) return node.userData.roomId;
    node = node.parent;
  }

  return "";
}

function createTargetRecord({
  id,
  roomId = "",
  type = "generic",
  object3D = null,
  getPosition = null,
  radius = 0.22,
  touchRadius = 0.08,
  weight = 1,
  enabled = true,
  meta = {},
}) {
  return {
    id,
    roomId,
    type,
    object3D,
    getPosition,
    radius,
    touchRadius,
    weight,
    enabled,
    meta,
    auto: false,
  };
}

function createEmptyDwellState() {
  return {
    leftMs: 0,
    rightMs: 0,
  };
}

export function createHandContactReadinessSystem({
  scene,
  handPresence,
}) {
  const registry = new Map();
  const activeState = {
    left: null,
    right: null,
  };

  const dwellStateByTarget = new Map();
  const previousPayloadTargetIds = new Set();

  let lastAutoScanAt = 0;
  let autoScanDirty = true;
  let lastUpdateAt = performance.now();

  const getHandProbePoint = (side) => {
    const sideState = handPresence.getSide(side);
    const mount = handPresence.getMount(side);

    if (!sideState?.connected || !sideState?.visible) {
      return null;
    }

    if (
      sideState.source === "hand-tracking" &&
      Array.isArray(sideState.fingertips?.index) &&
      sideState.fingertips.index.length === 3
    ) {
      _handPos.set(
        sideState.fingertips.index[0],
        sideState.fingertips.index[1],
        sideState.fingertips.index[2]
      );

      return {
        point: _handPos.clone(),
        pointType: "index-tip",
      };
    }

    if (mount?.palmAnchor) {
      mount.palmAnchor.updateMatrixWorld(true);
      _worldPos.setFromMatrixPosition(mount.palmAnchor.matrixWorld);

      return {
        point: _worldPos.clone(),
        pointType: "palm-anchor",
      };
    }

    if (Array.isArray(sideState.palm?.position) && sideState.palm.position.length === 3) {
      _handPos.set(
        sideState.palm.position[0],
        sideState.palm.position[1],
        sideState.palm.position[2]
      );

      return {
        point: _handPos.clone(),
        pointType: "palm-state",
      };
    }

    return null;
  };

  const resolveTargetPosition = (target) => {
    if (typeof target.getPosition === "function") {
      const value = target.getPosition();
      if (value && typeof value.x === "number") {
        return _targetPos.copy(value);
      }
      if (Array.isArray(value) && value.length === 3) {
        return _targetPos.set(value[0], value[1], value[2]);
      }
    }

    if (target.object3D) {
      target.object3D.updateMatrixWorld(true);
      return _targetPos.setFromMatrixPosition(target.object3D.matrixWorld);
    }

    return null;
  };

  const registerTarget = ({
    id,
    roomId = "",
    type = "generic",
    object3D = null,
    getPosition = null,
    radius = 0.22,
    touchRadius = 0.08,
    weight = 1,
    enabled = true,
    meta = {},
    auto = false,
  }) => {
    if (!id) {
      throw new Error("HAND-01C registerTarget requires id");
    }

    const record = createTargetRecord({
      id,
      roomId,
      type,
      object3D,
      getPosition,
      radius,
      touchRadius,
      weight,
      enabled,
      meta,
    });

    record.auto = auto;
    registry.set(id, record);

    if (!dwellStateByTarget.has(id)) {
      dwellStateByTarget.set(id, createEmptyDwellState());
    }

    return record;
  };

  const unregisterTarget = (id) => {
    registry.delete(id);
    dwellStateByTarget.delete(id);
  };

  const clearTargets = () => {
    registry.clear();
    dwellStateByTarget.clear();
  };

  const markDirty = () => {
    autoScanDirty = true;
  };

  const autoRegisterSceneTargets = () => {
    const discovered = [];
    const existingAutoIds = new Set(
      Array.from(registry.values())
        .filter((x) => x.auto)
        .map((x) => x.id)
    );

    scene.traverse((object3D) => {
      if (!object3D || !object3D.isObject3D) return;

      const config = object3D.userData?.handTargetConfig || null;
      const explicit = object3D.userData?.handTarget === true;

      if (!explicit && !config) return;

      const id =
        config?.id ||
        object3D.userData?.handTargetId ||
        object3D.uuid;

      if (existingAutoIds.has(id) || registry.has(id)) return;

      discovered.push(
        registerTarget({
          id,
          roomId: config?.roomId || inferRoomIdFromObject(object3D),
          type: config?.type || inferTypeFromObject(object3D),
          object3D,
          radius: config?.radius ?? 0.22,
          touchRadius: config?.touchRadius ?? 0.08,
          weight: config?.weight ?? 1,
          enabled: config?.enabled ?? true,
          meta: config?.meta ?? {},
          auto: true,
        })
      );
    });

    autoScanDirty = false;
    return discovered;
  };

  const clearStaleResponderPayloads = (currentPayloadIds) => {
    previousPayloadTargetIds.forEach((targetId) => {
      if (currentPayloadIds.has(targetId)) return;
      const target = registry.get(targetId);
      if (!target?.object3D) return;
      target.object3D.userData.__handReadiness = null;
    });

    previousPayloadTargetIds.clear();
    currentPayloadIds.forEach((id) => previousPayloadTargetIds.add(id));
  };

  const applyResponderPayloads = (payloadsByTarget) => {
    const currentPayloadIds = new Set(payloadsByTarget.keys());

    payloadsByTarget.forEach((payload, targetId) => {
      const target = registry.get(targetId);
      if (!target?.object3D) return;

      target.object3D.userData.__handReadiness = payload;

      const responder = target.object3D.userData?.onHandReadiness;
      if (typeof responder === "function") {
        responder(payload);
      }
    });

    clearStaleResponderPayloads(currentPayloadIds);
  };

  const updateSideState = (side, result, roomId) => {
    const sideState = handPresence.getSide(side);
    if (!sideState) return;

    sideState.proximityIntensity = result?.proximityIntensity ?? 0;
    sideState.contactIntensity = result?.contactIntensity ?? 0;
    sideState.ritualCharge = result
      ? Math.max(result.contactIntensity * 0.75, result.proximityIntensity * 0.32)
      : 0;

    sideState.contact = result
      ? {
          targetId: result.targetId,
          roomId,
          type: result.type,
          distance: result.distance,
          pointType: result.pointType,
          proximityIntensity: result.proximityIntensity,
          contactIntensity: result.contactIntensity,
        }
      : null;
  };

  const decayAllDwells = (dtMs) => {
    dwellStateByTarget.forEach((state) => {
      state.leftMs = Math.max(0, state.leftMs - dtMs * 0.42);
      state.rightMs = Math.max(0, state.rightMs - dtMs * 0.42);
    });
  };

  const update = ({
    currentRoomId = "",
    timeMs = performance.now(),
  } = {}) => {
    const snapshot = handPresence.snapshot();
    const dtMs = Math.max(0, Math.min(80, timeMs - lastUpdateAt));
    lastUpdateAt = timeMs;

    if (!snapshot.presenting) {
      activeState.left = null;
      activeState.right = null;
      updateSideState("left", null, currentRoomId);
      updateSideState("right", null, currentRoomId);
      decayAllDwells(dtMs);
      clearStaleResponderPayloads(new Set());
      return;
    }

    if (autoScanDirty || timeMs - lastAutoScanAt > AUTO_SCAN_INTERVAL_MS) {
      autoRegisterSceneTargets();
      lastAutoScanAt = timeMs;
    }

    decayAllDwells(dtMs);

    const relevantTargets = Array.from(registry.values()).filter((target) => {
      if (!target.enabled) return false;
      if (!target.roomId) return true;
      return target.roomId === currentRoomId;
    });

    const payloadsByTarget = new Map();

    ["left", "right"].forEach((side) => {
      const probe = getHandProbePoint(side);
      const sideState = handPresence.getSide(side);

      if (!probe || !sideState?.connected) {
        activeState[side] = null;
        updateSideState(side, null, currentRoomId);
        return;
      }

      let best = null;

      relevantTargets.forEach((target) => {
        const pos = resolveTargetPosition(target);
        if (!pos) return;

        const distance = probe.point.distanceTo(pos);
        const proximityIntensity = intensityFromDistance(distance, target.radius);
        const contactIntensity = intensityFromDistance(distance, target.touchRadius);

        const score =
          proximityIntensity * (target.weight || 1) +
          contactIntensity * 0.7;

        if (!best || score > best.score) {
          best = {
            targetId: target.id,
            roomId: target.roomId,
            type: target.type,
            distance,
            proximityIntensity,
            contactIntensity,
            pointType: probe.pointType,
            score,
          };
        }
      });

      activeState[side] = best;
      updateSideState(side, best, currentRoomId);

      if (best) {
        const dwell = dwellStateByTarget.get(best.targetId) || createEmptyDwellState();
        dwellStateByTarget.set(best.targetId, dwell);

        const engageFactor =
          best.proximityIntensity * 0.72 +
          best.contactIntensity * 1.12;

        if (engageFactor > 0.04) {
          const gain = dtMs * (0.35 + engageFactor);
          if (side === "left") dwell.leftMs = Math.min(MAX_DWELL_MS, dwell.leftMs + gain);
          if (side === "right") dwell.rightMs = Math.min(MAX_DWELL_MS, dwell.rightMs + gain);
        }

        const existing = payloadsByTarget.get(best.targetId) || {
          id: best.targetId,
          roomId: best.roomId,
          type: best.type,
          aggregateProximity: 0,
          aggregateContact: 0,
          dwellMs: 0,
          leftDwellMs: 0,
          rightDwellMs: 0,
          bothHandsActive: false,
          coherence: 0,
          dominantSide: side,
          hands: {},
        };

        existing.aggregateProximity = Math.max(
          existing.aggregateProximity,
          best.proximityIntensity
        );
        existing.aggregateContact = Math.max(
          existing.aggregateContact,
          best.contactIntensity
        );

        existing.hands[side] = {
          distance: best.distance,
          pointType: best.pointType,
          proximityIntensity: best.proximityIntensity,
          contactIntensity: best.contactIntensity,
        };

        existing.leftDwellMs = dwell.leftMs;
        existing.rightDwellMs = dwell.rightMs;
        existing.dwellMs = Math.max(dwell.leftMs, dwell.rightMs);

        payloadsByTarget.set(best.targetId, existing);
      }
    });

    payloadsByTarget.forEach((payload) => {
      const left = payload.hands.left;
      const right = payload.hands.right;

      payload.bothHandsActive = Boolean(left && right);
      payload.coherence = payload.bothHandsActive
        ? Math.min(
            left.proximityIntensity + left.contactIntensity * 0.5,
            right.proximityIntensity + right.contactIntensity * 0.5
          )
        : 0;

      if (left && right) {
        const leftPower = left.proximityIntensity + left.contactIntensity * 1.2;
        const rightPower = right.proximityIntensity + right.contactIntensity * 1.2;
        payload.dominantSide = leftPower >= rightPower ? "left" : "right";
      } else if (left) {
        payload.dominantSide = "left";
      } else if (right) {
        payload.dominantSide = "right";
      } else {
        payload.dominantSide = "none";
      }
    });

    applyResponderPayloads(payloadsByTarget);
  };

  const snapshot = () => ({
    targetCount: registry.size,
    targets: Array.from(registry.values()).map((target) => ({
      id: target.id,
      roomId: target.roomId,
      type: target.type,
      radius: target.radius,
      touchRadius: target.touchRadius,
      enabled: target.enabled,
      auto: target.auto,
    })),
    active: {
      left: activeState.left,
      right: activeState.right,
    },
  });

  const dispose = () => {
    clearTargets();
  };

  return {
    registerTarget,
    unregisterTarget,
    clearTargets,
    markDirty,
    autoRegisterSceneTargets,
    update,
    snapshot,
    dispose,
  };
}
