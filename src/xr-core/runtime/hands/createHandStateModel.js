const FINGER_KEYS = ["thumb", "index", "middle", "ring", "pinky"];

function createEmptyFingertips() {
  return FINGER_KEYS.reduce((acc, key) => {
    acc[key] = null;
    return acc;
  }, {});
}

function createSideState(side) {
  return {
    side,
    connected: false,
    visible: false,
    presenting: false,
    source: "none",
    sourceIndex: -1,

    pose: {
      position: [0, 0, 0],
      quaternion: [0, 0, 0, 1],
      scale: [1, 1, 1],
    },

    palm: {
      position: [0, 0, 0],
      normal: [0, 0, -1],
    },

    fingertips: createEmptyFingertips(),

    trigger: 0,
    squeeze: 0,
    pinch: 0,
    confidence: 0,

    gesture: "hidden",

    visibilityWeight: 0,
    proximityIntensity: 0,
    contactIntensity: 0,
    ritualCharge: 0,
    worldResponseMultiplier: 1,
  };
}

function cloneSimple(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeTrackingMode(current, next) {
  if (next === "none") return current;
  if (current === "none") return next;
  if (current === next) return current;
  return "mixed";
}

export function createHandStateModel() {
  const state = {
    frame: 0,
    presenting: false,
    activeSourceCount: 0,
    trackingMode: "none",
    left: createSideState("left"),
    right: createSideState("right"),
  };

  const clearSide = (side) => {
    state[side] = createSideState(side);
    state[side].presenting = state.presenting;
  };

  const beginFrame = ({ presenting = false } = {}) => {
    state.frame += 1;
    state.presenting = presenting;
    state.activeSourceCount = 0;
    state.trackingMode = "none";
    clearSide("left");
    clearSide("right");
  };

  const applySide = (side, patch) => {
    const next = {
      ...state[side],
      ...patch,
    };

    if (patch.pose) next.pose = patch.pose;
    if (patch.palm) next.palm = patch.palm;
    if (patch.fingertips) {
      next.fingertips = {
        ...createEmptyFingertips(),
        ...patch.fingertips,
      };
    }

    state[side] = next;

    if (next.connected) {
      state.activeSourceCount += 1;
      state.trackingMode = mergeTrackingMode(state.trackingMode, next.source);
    }
  };

  const getSide = (side) => state[side];
  const snapshot = () => cloneSimple(state);

  return {
    state,
    beginFrame,
    applySide,
    getSide,
    snapshot,
  };
}
