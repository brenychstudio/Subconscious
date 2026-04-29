export function createPathIntoUnknownSceneRuntime({
  containerRoot = null,
  sourceSceneId = "scene01-sanctuary",
  sceneId = "scene02-path-into-unknown",
  title = "Path Into the Unknown",
} = {}) {
  const runtimeState = {
    version: "path-into-unknown-runtime-v0.1",

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
        ? "Move Scene02 state helpers into this module in SCENE02-RUNTIME-02."
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
