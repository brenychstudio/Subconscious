import * as THREE from "three";

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

// SCENE02-RUNTIME-03 - Scene02 binding helpers externalized.
// These helpers do not create visuals and do not switch rooms.
// They only build contracts/snapshots or perform explicit container binding when called.

export function roundScene02PreflightNumber(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 1000) / 1000;
}

export function createScene02TransformSnapshot(object) {
  if (!object) {
    return {
      exists: false,
      name: null,
      uuid: null,
      parentName: null,
      visible: false,
      childCount: 0,
      local: null,
      world: null,
    };
  }

  const worldPosition = new THREE.Vector3();
  const worldQuaternion = new THREE.Quaternion();
  const worldScale = new THREE.Vector3();
  const worldRotation = new THREE.Euler();

  object.updateWorldMatrix?.(true, false);
  object.matrixWorld?.decompose(worldPosition, worldQuaternion, worldScale);
  worldRotation.setFromQuaternion(worldQuaternion, "XYZ");

  return {
    exists: true,
    name: object.name ?? null,
    uuid: object.uuid ?? null,
    parentName: object.parent?.name ?? null,
    visible: Boolean(object.visible),
    childCount: object.children?.length ?? 0,
    renderOrder: object.renderOrder ?? 0,

    local: {
      position: [
        roundScene02PreflightNumber(object.position?.x ?? 0),
        roundScene02PreflightNumber(object.position?.y ?? 0),
        roundScene02PreflightNumber(object.position?.z ?? 0),
      ],
      rotation: [
        roundScene02PreflightNumber(object.rotation?.x ?? 0),
        roundScene02PreflightNumber(object.rotation?.y ?? 0),
        roundScene02PreflightNumber(object.rotation?.z ?? 0),
      ],
      scale: [
        roundScene02PreflightNumber(object.scale?.x ?? 1),
        roundScene02PreflightNumber(object.scale?.y ?? 1),
        roundScene02PreflightNumber(object.scale?.z ?? 1),
      ],
    },

    world: {
      position: [
        roundScene02PreflightNumber(worldPosition.x),
        roundScene02PreflightNumber(worldPosition.y),
        roundScene02PreflightNumber(worldPosition.z),
      ],
      rotation: [
        roundScene02PreflightNumber(worldRotation.x),
        roundScene02PreflightNumber(worldRotation.y),
        roundScene02PreflightNumber(worldRotation.z),
      ],
      scale: [
        roundScene02PreflightNumber(worldScale.x),
        roundScene02PreflightNumber(worldScale.y),
        roundScene02PreflightNumber(worldScale.z),
      ],
    },
  };
}

export function createScene02ContainerBindingContract({
  ready = false,
  level = 0,
  phase = "not-ready",
  container = null,
  adapterObject = null,
  currentLocalSceneId = "scene01-sanctuary",
  targets = {},
}) {
  const targetStates = {
    scene02ShellRoot: Boolean(targets.scene02ShellRoot),
    scene02IsolationRoot: Boolean(targets.scene02IsolationRoot),
    preScene02Root: Boolean(targets.preScene02Root),
    firstPassageRoot: Boolean(targets.firstPassageRoot),
    passageRoot: Boolean(targets.passageRoot),
  };

  const requiredTargetsReady =
    targetStates.scene02ShellRoot &&
    targetStates.scene02IsolationRoot &&
    targetStates.preScene02Root;

  const containerPrepared = Boolean(container?.prepared);
  const adapterReady = Boolean(adapterObject?.ready);
  const isScene02Local = currentLocalSceneId === "scene02-path-into-unknown";

  return {
    version: "scene02-container-binding-contract-v0.1",

    ready,
    level,
    phase,

    sourceSceneId: "scene01-sanctuary",
    targetSceneId: "scene02-path-into-unknown",

    contractType: "container-binding-contract-only",
    bindingMode: "future-reparent-contract",
    containerName: "PathIntoUnknownRuntimeContainer",

    canBindFutureChildren:
      ready &&
      containerPrepared &&
      adapterReady &&
      isScene02Local &&
      requiredTargetsReady,

    targetLayers: [
      {
        key: "scene02ShellRoot",
        objectName: "PathIntoUnknownScene02Shell",
        required: true,
        exists: targetStates.scene02ShellRoot,
        futureRole: "scene02-primary-shell",
      },
      {
        key: "scene02IsolationRoot",
        objectName: "PathIntoUnknownVisualIsolationLayer",
        required: true,
        exists: targetStates.scene02IsolationRoot,
        futureRole: "scene02-visual-isolation",
      },
      {
        key: "preScene02Root",
        objectName: "TempleSanctuaryPreScene02Handoff",
        required: true,
        exists: targetStates.preScene02Root,
        futureRole: "scene02-pre-handoff-bridge",
      },
      {
        key: "firstPassageRoot",
        objectName: "TempleSanctuaryFirstPassageState",
        required: false,
        exists: targetStates.firstPassageRoot,
        futureRole: "scene01-to-scene02-passage-memory",
      },
      {
        key: "passageRoot",
        objectName: "TempleSanctuaryPassageAperture",
        required: false,
        exists: targetStates.passageRoot,
        futureRole: "threshold-aperture-memory",
      },
    ],

    readiness: {
      containerPrepared,
      adapterReady,
      isScene02Local,
      requiredTargetsReady,
      currentLocalSceneId,
    },

    safety: {
      contractOnly: true,
      reparentsExistingLayersNow: false,
      movesObjectsNow: false,
      changesWorldTransformsNow: false,
      performsTeleportNow: false,
      performsRoomSwitchNow: false,
      touchesSkyNow: false,
      touchesXRRootNow: false,
    },

    nextStep: ready
      ? "Ready for binding preflight or isolated child clone test."
      : "Waiting for container, adapter, and Scene02 local state readiness.",
  };
}

export function createScene02ContainerBindingPreflight({
  ready = false,
  level = 0,
  phase = "not-ready",
  bindingContract = null,
  containerRoot = null,
  currentLocalSceneId = "scene01-sanctuary",
  targets = {},
}) {
  const targetSnapshots = {
    scene02ShellRoot: createScene02TransformSnapshot(targets.scene02ShellRoot),
    scene02IsolationRoot: createScene02TransformSnapshot(
      targets.scene02IsolationRoot
    ),
    preScene02Root: createScene02TransformSnapshot(targets.preScene02Root),
    firstPassageRoot: createScene02TransformSnapshot(targets.firstPassageRoot),
    passageRoot: createScene02TransformSnapshot(targets.passageRoot),
  };

  const requiredTargetsReady =
    targetSnapshots.scene02ShellRoot.exists &&
    targetSnapshots.scene02IsolationRoot.exists &&
    targetSnapshots.preScene02Root.exists;

  const containerSnapshot = createScene02TransformSnapshot(containerRoot);
  const contractReady = Boolean(bindingContract?.ready);
  const canBindFutureChildren = Boolean(bindingContract?.canBindFutureChildren);
  const isScene02Local = currentLocalSceneId === "scene02-path-into-unknown";

  return {
    version: "scene02-container-binding-preflight-v0.1",

    ready,
    level,
    phase,

    sourceSceneId: "scene01-sanctuary",
    targetSceneId: "scene02-path-into-unknown",

    preflightType: "binding-preflight-only",
    containerName: "PathIntoUnknownRuntimeContainer",

    canAttemptFutureBinding:
      ready &&
      contractReady &&
      canBindFutureChildren &&
      requiredTargetsReady &&
      containerSnapshot.exists &&
      isScene02Local,

    readiness: {
      contractReady,
      canBindFutureChildren,
      requiredTargetsReady,
      containerExists: containerSnapshot.exists,
      isScene02Local,
      currentLocalSceneId,
    },

    containerSnapshot,
    targetSnapshots,

    requiredBindingTargets: [
      "scene02ShellRoot",
      "scene02IsolationRoot",
      "preScene02Root",
    ],

    optionalBindingTargets: ["firstPassageRoot", "passageRoot"],

    recommendedFutureBindingStrategy: {
      strategy: "preserve-world-transform-before-reparent",
      step1: "capture current world matrices for each target layer",
      step2: "reparent one target layer at a time",
      step3: "restore world transform after reparent",
      step4: "validate visual position before binding next layer",
      step5: "rollback immediately if any target shifts unexpectedly",
    },

    rollbackStrategy: {
      noStateMutationNeededNow: true,
      futureRollbackMethod:
        "If future reparent fails, restore each layer to its original parent using captured parentName/world transform snapshots.",
      currentStepRollback:
        "This step only writes userData diagnostics; restore the backup file if needed.",
    },

    safety: {
      preflightOnly: true,
      reparentsExistingLayersNow: false,
      movesObjectsNow: false,
      changesWorldTransformsNow: false,
      changesVisualsNow: false,
      performsTeleportNow: false,
      performsRoomSwitchNow: false,
      touchesSkyNow: false,
      touchesXRRootNow: false,
    },

    nextStep: ready
      ? "Ready for a controlled single-layer binding or actual binding pass."
      : "Waiting for binding contract/container readiness before any binding attempt.",
  };
}

export function createScene02BindingRuntimeSnapshot(object) {
  if (!object) {
    return {
      exists: false,
      name: null,
      parentName: null,
      uuid: null,
    };
  }

  const worldPosition = new THREE.Vector3();
  const worldQuaternion = new THREE.Quaternion();
  const worldScale = new THREE.Vector3();

  object.updateWorldMatrix?.(true, false);
  object.matrixWorld?.decompose(worldPosition, worldQuaternion, worldScale);

  return {
    exists: true,
    name: object.name ?? null,
    uuid: object.uuid ?? null,
    parentName: object.parent?.name ?? null,
    visible: Boolean(object.visible),
    childCount: object.children?.length ?? 0,
    worldPosition: [
      roundScene02PreflightNumber(worldPosition.x),
      roundScene02PreflightNumber(worldPosition.y),
      roundScene02PreflightNumber(worldPosition.z),
    ],
    worldScale: [
      roundScene02PreflightNumber(worldScale.x),
      roundScene02PreflightNumber(worldScale.y),
      roundScene02PreflightNumber(worldScale.z),
    ],
  };
}

export function bindScene02LayerToContainerPreserveWorld({
  key,
  object,
  container,
  originalParents = null,
}) {
  if (!object || !container) {
    return {
      key,
      ok: false,
      reason: "missing-object-or-container",
      objectName: object?.name ?? null,
      containerName: container?.name ?? null,
    };
  }

  if (object === container) {
    return {
      key,
      ok: false,
      reason: "cannot-bind-container-to-itself",
      objectName: object.name,
      containerName: container.name,
    };
  }

  if (object.parent === container) {
    return {
      key,
      ok: true,
      alreadyBound: true,
      objectName: object.name,
      containerName: container.name,
      parentName: object.parent?.name ?? null,
    };
  }

  if (originalParents && !originalParents.has(key)) {
    originalParents.set(key, {
      parent: object.parent ?? null,
      parentName: object.parent?.name ?? null,
      snapshotBeforeBinding: createScene02BindingRuntimeSnapshot(object),
    });
  }

  container.updateWorldMatrix?.(true, false);
  object.updateWorldMatrix?.(true, false);

  // THREE.Object3D.attach preserves world transform while changing parent.
  container.attach(object);

  object.updateWorldMatrix?.(true, true);

  return {
    key,
    ok: object.parent === container,
    alreadyBound: false,
    objectName: object.name ?? null,
    containerName: container.name ?? null,
    parentName: object.parent?.name ?? null,
    snapshotAfterBinding: createScene02BindingRuntimeSnapshot(object),
  };
}

export function createScene02ActualBindingState({
  requested = false,
  complete = false,
  failed = false,
  level = 0,
  phase = "not-ready",
  results = [],
  containerRoot = null,
  originalParents = null,
}) {
  return {
    version: "scene02-container-actual-binding-v0.1",
    requested,
    complete,
    failed,
    level,
    phase,
    containerName: containerRoot?.name ?? "PathIntoUnknownRuntimeContainer",
    boundLayerKeys: results.filter((item) => item.ok).map((item) => item.key),
    results,
    originalParents: originalParents
      ? Array.from(originalParents.entries()).map(([key, value]) => ({
          key,
          parentName: value.parentName,
          snapshotBeforeBinding: value.snapshotBeforeBinding,
        }))
      : [],
    safety: {
      actualBinding: true,
      preservesWorldTransform: true,
      reparentsOnlyScene02Layers: true,
      movesCameraNow: false,
      performsTeleportNow: false,
      performsRoomSwitchNow: false,
      touchesSkyNow: false,
      touchesXRRootNow: false,
    },
  };
}

// SCENE02-RUNTIME-04 — Scene02 visual/runtime state helpers.
// These helpers build state/userData objects only.
// They do not create geometry, move objects, teleport, switch rooms, or touch sky/XRRoot.

export function createScene02VisualResponseState({
  active = null,
  level = 0,
  phase = null,
  source = "currentLocalSceneId",
  currentLocalSceneId = "scene01-sanctuary",
} = {}) {
  const normalizedLevel = Number.isFinite(level) ? level : 0;
  const computedActive =
    active === null ? normalizedLevel > 0.08 : Boolean(active);

  return {
    version: "scene02-visual-response-v0.1",
    active: computedActive,
    level: normalizedLevel,
    phase:
      phase ??
      (normalizedLevel > 0.72
        ? "scene02-visual-priority"
        : normalizedLevel > 0.08
          ? "scene02-visual-priority-emerging"
          : "not-active"),
    source,
    currentLocalSceneId,
    safety: {
      visualResponseOnly: true,
      performsTeleportNow: false,
      performsRoomSwitchNow: false,
      mutatesXRRootNow: false,
      touchesSkyNow: false,
    },
  };
}

export function createScene02RuntimeContainerState({
  prepared = false,
  level = 0,
  phase = null,
  mode = "empty-container-preparation",
  parent = "TempleSanctuaryTransitionPortalRoot",
  entryAnchor = "path-threshold-forward",
  entryDirection = "forward-through-portal",
  acceptsFutureChildren = false,
  currentChildrenBound = false,
  existingVisualLayersStillInPlace = true,
  boundLayerKeys = [],
  futureBindingTargets = [
    "PathIntoUnknownScene02Shell",
    "PathIntoUnknownVisualIsolationLayer",
    "TempleSanctuaryPreScene02Handoff",
  ],
} = {}) {
  const normalizedLevel = Number.isFinite(level) ? level : 0;
  const normalizedBoundLayerKeys = Array.isArray(boundLayerKeys)
    ? boundLayerKeys.filter((key) => typeof key === "string" && key.length > 0)
    : [];

  return {
    version: "scene02-runtime-container-v0.1",
    sceneId: "scene02-path-into-unknown",
    prepared: Boolean(prepared),
    level: normalizedLevel,
    phase:
      phase ??
      (prepared
        ? "scene02-container-prepared"
        : normalizedLevel > 0.01
          ? "scene02-container-preparing"
          : "not-ready"),
    mode,
    anchor: {
      parent,
      entryAnchor,
      entryDirection,
    },
    acceptsFutureChildren: Boolean(acceptsFutureChildren),
    currentChildrenBound: Boolean(currentChildrenBound),
    existingVisualLayersStillInPlace: Boolean(existingVisualLayersStillInPlace),
    futureBindingTargets,
    boundLayerKeys: normalizedBoundLayerKeys,
    safety: {
      emptyContainerOnly: !currentChildrenBound,
      existingLayersReparentedNow: Boolean(currentChildrenBound),
      performsTeleportNow: false,
      performsRoomSwitchNow: false,
      changesCameraNow: false,
      touchesSkyNow: false,
      touchesXRRootNow: false,
    },
  };
}

const EXTERNALIZED_STATE_HELPERS = [
  "createScene02SwitchContract",
  "createScene02RuntimeSwitchStub",
  "createScene02RuntimeDiagnostic",
  "createScene02AdapterObject",
  "createScene02ContainerBindingContract",
  "createScene02ContainerBindingPreflight",
  "createScene02ActualBindingState",
  "roundScene02PreflightNumber",
  "createScene02TransformSnapshot",
  "createScene02BindingRuntimeSnapshot",
  "bindScene02LayerToContainerPreserveWorld",
  "createScene02VisualResponseState",
  "createScene02RuntimeContainerState",
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
