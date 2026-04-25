import { useEffect, useMemo, useState } from "react";
import XRExperienceHost from "../../xr-core/runtime/XRExperienceHost.jsx";
import { createWorldFormationRuntime } from "./world/runtime/createWorldFormationRuntime.js";

const consciousnessOptions = {
  quality: {
    maxDpr: 1.5,
  },
  timings: {
    mouseLookSpeed: 0.32,
  },
  locomotion: {
    snapTurnDeg: 30,
    snapCooldownMs: 320,
  },
  layout: {
    spacing: 7.2,
    curveAmp: 0.62,
  },
};

export default function ConsciousnessWorldApp() {
  const [entryStage, setEntryStage] = useState("prelude");
  const worldRuntime = useMemo(() => createWorldFormationRuntime(), []);

  useEffect(() => {
    worldRuntime.setEntryStage(entryStage);

    if (
      entryStage === "world" &&
      worldRuntime.state.currentRoomId &&
      !worldRuntime.state.visitedRoomIds.includes(worldRuntime.state.currentRoomId)
    ) {
      worldRuntime.markVisited(worldRuntime.state.currentRoomId);
    }
  }, [entryStage, worldRuntime]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__WHISPER_WORLD__ = worldRuntime;
    }

    return () => {
      try {
        if (typeof window !== "undefined") {
          delete window.__WHISPER_WORLD__;
        }
      } catch {}
    };
  }, [worldRuntime]);

  return (
    <main className="app-shell prelude-mode xr-world-kiosk">
      <section className="runtime-wrap">
        <div className="runtime-stage">
          <XRExperienceHost
            mode="kiosk"
            autoStart={false}
            options={consciousnessOptions}
            worldRuntime={worldRuntime}
            builderLoader={() => import("./manifest/buildConsciousnessManifest.js")}
            onStageChange={setEntryStage}
          />
        </div>
      </section>
    </main>
  );
}
