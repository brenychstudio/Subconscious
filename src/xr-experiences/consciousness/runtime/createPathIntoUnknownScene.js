export function createScene02SwitchContract({
  ready = false,
  level = 0,
  phase = "locked",
  proximity = 0,
  scene02ShellValue = 0,
  scene02VisualIsolationValue = 0,
}) {
  return {
    version: "scene02-switch-contract-v0.1",

    ready,
    level,
    phase,

    sourceSceneId: "scene01-sanctuary",
    sourceTitle: "Sanctuary / Membrane Chamber",

    targetSceneId: "scene02-path-into-unknown",
    targetTitle: "Path Into the Unknown",

    transitionType: "soft-passage",
    switchMode: "future-runtime-switch",
    entryAnchor: "path-threshold-forward",
    entryDirection: "forward-through-portal",

    requirements: {
      thresholdOpen: true,
      firstPassageTriggered: true,
      enterReady: true,
      preScene02HandoffTriggered: true,
      scene02ShellActivated: true,
      scene02VisualIsolationTriggered: true,
      viewerInTransitionZone: proximity > 0.72,
    },

    runtime: {
      scene02ShellLevel: scene02ShellValue,
      scene02VisualIsolationLevel: scene02VisualIsolationValue,
      proximity,
    },

    nextStep: ready
      ? "Scene02 runtime switch can be implemented by a future handoff adapter."
      : "Scene02 visual shell is preparing; runtime switch is not ready yet.",

    performsNavigationNow: false,
    performsTeleportNow: false,
    touchesSkyNow: false,
  };
}

export function createScene02RuntimeSwitchStub({
  armed = false,
  level = 0,
  phase = "not-ready",
  proximity = 0,
  switchContract = null,
}) {
  const contractReady = Boolean(switchContract?.ready);

  return {
    version: "scene02-runtime-switch-stub-v0.1",

    armed,
    level,
    phase,

    sourceSceneId: "scene01-sanctuary",
    targetSceneId: "scene02-path-into-unknown",

    switchMode: "stub-only",
    transitionType: "soft-passage",
    entryAnchor: "path-threshold-forward",
    entryDirection: "forward-through-portal",

    contractReady,
    canBeImplementedByFutureAdapter:
      armed && contractReady && proximity > 0.72,

    futureAdapterContract: {
      shouldFadeScene01: true,
      shouldKeepSkyLayerAlive: true,
      shouldPreserveUserForwardDirection: true,
      shouldEnterScene02AtAnchor: "path-threshold-forward",
      shouldUseSoftPassageTransition: true,
    },

    runtime: {
      proximity,
      switchContractLevel: switchContract?.level ?? 0,
      switchContractPhase: switchContract?.phase ?? "not-ready",
    },

    performsNavigationNow: false,
    performsTeleportNow: false,
    performsRoomSwitchNow: false,
    touchesSkyNow: false,

    nextStep: armed
      ? "Safe runtime switch stub is armed. Future adapter can implement actual Scene02 switch."
      : "Runtime switch stub is waiting for Scene02 switch contract readiness.",
  };
}

export function createScene02RuntimeDiagnostic({
  transitionState = null,
  switchContract = null,
  runtimeSwitchStub = null,
  proximity = 0,
}) {
  const contractReady = Boolean(switchContract?.ready);
  const stubArmed = Boolean(runtimeSwitchStub?.armed);
  const stubLevel = runtimeSwitchStub?.level ?? 0;

  return {
    version: "scene02-runtime-diagnostic-v0.1",

    reachedSwitchContract: contractReady,
    reachedRuntimeSwitchStub: stubArmed,
    stubLevel,
    proximity,

    phase: stubArmed
      ? "runtime-switch-stub-armed"
      : contractReady
        ? "switch-contract-ready"
        : transitionState?.phase ?? "not-ready",

    safeForFutureAdapter:
      contractReady && stubArmed && stubLevel > 0.72 && proximity > 0.68,

    confirms: {
      noNavigation: true,
      noTeleport: true,
      noRoomSwitch: true,
      noSkyMutation: true,
      noXRRootMutation: true,
      diagnosticOnly: true,
    },

    observedTransition: {
      scene02ShellActivated: Boolean(transitionState?.scene02ShellActivated),
      scene02ShellReady: Boolean(transitionState?.scene02ShellReady),
      scene02VisualIsolationReady: Boolean(
        transitionState?.scene02VisualIsolationReady
      ),
      scene02SwitchContractReady: Boolean(
        transitionState?.scene02SwitchContractReady
      ),
      scene02RuntimeSwitchStubArmed: stubArmed,
      phase: transitionState?.phase ?? "unknown",
    },

    nextStep: contractReady && stubArmed
      ? "Ready for adapter promotion from Path Into the Unknown runtime module."
      : "Continue validating pre-adapter state before adding adapter logic.",
  };
}

export function createScene02AdapterObject({
  ready = false,
  level = 0,
  phase = "not-ready",
  diagnostic = null,
  switchContract = null,
  runtimeSwitchStub = null,
  proximity = 0,
}) {
  const diagnosticSafe = Boolean(diagnostic?.safeForFutureAdapter);
  const contractReady = Boolean(switchContract?.ready);
  const stubArmed = Boolean(runtimeSwitchStub?.armed);

  return {
    version: "scene02-adapter-object-v0.1",

    type: "adapter-object-only",
    ready,
    level,
    phase,

    sourceSceneId: "scene01-sanctuary",
    targetSceneId: "scene02-path-into-unknown",

    adapterMode: "descriptor-only",
    transitionType: "soft-passage",
    entryAnchor: "path-threshold-forward",
    entryDirection: "forward-through-portal",

    gates: {
      diagnosticSafe,
      contractReady,
      runtimeSwitchStubArmed: stubArmed,
      proximityReady: proximity > 0.68,
    },

    canPromoteToAdapterDraft:
      ready && diagnosticSafe && contractReady && stubArmed && proximity > 0.68,

    runtime: {
      proximity,
      diagnosticPhase: diagnostic?.phase ?? "unknown",
      switchContractPhase: switchContract?.phase ?? "unknown",
      runtimeSwitchStubPhase: runtimeSwitchStub?.phase ?? "unknown",
      runtimeSwitchStubLevel: runtimeSwitchStub?.level ?? 0,
    },

    safety: {
      mutatesRegistryNow: false,
      mutatesCurrentLocalSceneIdNow: false,
      performsNavigationNow: false,
      performsTeleportNow: false,
      performsRoomSwitchNow: false,
      touchesSkyNow: false,
      touchesXRRootNow: false,
      visualChangesNow: false,
    },

    nextStep: ready
      ? "Ready for registry binding or adapter promotion."
      : "Waiting for diagnostic/runtime-switch readiness.",
  };
}

const EXTERNALIZED_STATE_HELPERS = [
  "createScene02SwitchContract",
  "createScene02RuntimeSwitchStub",
  "createScene02RuntimeDiagnostic",
  "createScene02AdapterObject",
];

export function createPathIntoUnknownSceneRuntime({
  containerRoot = null,
  sourceSceneId = "scene01-sanctuary",
  sceneId = "scene02-path-into-unknown",
  title = "Path Into the Unknown",
} = {}) {
  const runtimeState = {
    version: "path-into-unknown-runtime-v0.2",

    sceneId,
    title,
    sourceSceneId,

    mode: "externalized-runtime-shell",
    phase: "created",

    active: false,
    ready: false,
    level: 0,

    containerPrepared: false,
    containerBound: false,

    currentLocalSceneId: sourceSceneId,
    previousLocalSceneId: null,

    visualResponseLevel: 0,
    actualBindingComplete: false,

    boundLayerKeys: [],
    knownLayerKeys: [
      "scene02ShellRoot",
      "scene02IsolationRoot",
      "preScene02Root",
    ],

    externalizedHelpers: EXTERNALIZED_STATE_HELPERS,
    externalizedHelpersReady: true,
    helperSource: "createPathIntoUnknownScene.js",

    safety: {
      runtimeShellOnly: true,
      createsOwnVisualsNow: false,
      reparentsLayersNow: false,
      performsTeleportNow: false,
      performsRoomSwitchNow: false,
      touchesSkyNow: false,
      touchesXRRootNow: false,
    },
  };

  function getContainerSnapshot() {
    if (!containerRoot) {
      return {
        exists: false,
        name: null,
        visible: false,
        childCount: 0,
      };
    }

    return {
      exists: true,
      name: containerRoot.name ?? null,
      visible: Boolean(containerRoot.visible),
      childCount: containerRoot.children?.length ?? 0,
      userDataVersion: containerRoot.userData?.version ?? null,
      prepared: Boolean(containerRoot.userData?.prepared),
      currentChildrenBound: Boolean(containerRoot.userData?.currentChildrenBound),
    };
  }

  function getSnapshot() {
    return {
      ...runtimeState,
      container: getContainerSnapshot(),
      readyForFutureFullExtraction:
        runtimeState.ready &&
        runtimeState.containerPrepared &&
        runtimeState.containerBound &&
        runtimeState.currentLocalSceneId === sceneId,
      nextStep: runtimeState.containerBound
        ? "Move Scene02 visual construction into this module in a later extraction pass."
        : "Wait for container binding before moving visual/runtime logic.",
    };
  }

  function update({
    active = runtimeState.active,
    ready = runtimeState.ready,
    level = runtimeState.level,
    phase = runtimeState.phase,
    currentLocalSceneId = runtimeState.currentLocalSceneId,
    previousLocalSceneId = runtimeState.previousLocalSceneId,
    containerPrepared = runtimeState.containerPrepared,
    containerBound = runtimeState.containerBound,
    visualResponseLevel = runtimeState.visualResponseLevel,
    actualBindingComplete = runtimeState.actualBindingComplete,
  } = {}) {
    runtimeState.active = Boolean(active);
    runtimeState.ready = Boolean(ready);
    runtimeState.level = Number.isFinite(level) ? level : runtimeState.level;
    runtimeState.phase = phase;
    runtimeState.currentLocalSceneId = currentLocalSceneId;
    runtimeState.previousLocalSceneId = previousLocalSceneId;
    runtimeState.containerPrepared = Boolean(containerPrepared);
    runtimeState.containerBound = Boolean(containerBound);
    runtimeState.visualResponseLevel = Number.isFinite(visualResponseLevel)
      ? visualResponseLevel
      : runtimeState.visualResponseLevel;
    runtimeState.actualBindingComplete = Boolean(actualBindingComplete);

    if (containerRoot) {
      containerRoot.userData.pathIntoUnknownRuntime = getSnapshot();
    }

    return getSnapshot();
  }

  function markBoundLayers(layerKeys = []) {
    runtimeState.boundLayerKeys = Array.from(
      new Set(
        layerKeys.filter((key) => typeof key === "string" && key.length > 0)
      )
    );

    runtimeState.containerBound = runtimeState.boundLayerKeys.length > 0;

    if (containerRoot) {
      containerRoot.userData.pathIntoUnknownRuntime = getSnapshot();
    }

    return getSnapshot();
  }

  function dispose() {
    runtimeState.active = false;
    runtimeState.ready = false;
    runtimeState.phase = "disposed";

    if (containerRoot?.userData?.pathIntoUnknownRuntime) {
      delete containerRoot.userData.pathIntoUnknownRuntime;
    }

    return getSnapshot();
  }

  return {
    id: sceneId,
    title,
    containerRoot,
    update,
    markBoundLayers,
    getSnapshot,
    dispose,
  };
}
