// src/xr-core/runtime/XRExperienceHost.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { isImmersiveVRSupported } from "./useXRSupport.js";
import { validateManifest } from "../content/validateManifest.js";
import ThresholdPrelude from "./ThresholdPrelude.jsx";

export default function XRExperienceHost({
  mode = "exhibition",
  options,
  autoStart = false,
  builderLoader,
  onStageChange,
  worldRuntime,
}) {
  const [supported, setSupported] = useState(false);
  const [checked, setChecked] = useState(false);

  const [started, setStarted] = useState(autoStart);
  const [entryStage, setEntryStage] = useState(autoStart ? "world" : "prelude");

  const [manifest, setManifest] = useState(null);
  const [XRRoot, setXRRoot] = useState(null);
  const [err, setErr] = useState(null);
  const [manifestErrors, setManifestErrors] = useState(null);
  const [manifestWarnings, setManifestWarnings] = useState(null);

  const transitionStartedAtRef = useRef(0);

  const height = useMemo(
    () => (mode === "kiosk" ? "100dvh" : "56vh"),
    [mode]
  );
  const minHeight = useMemo(
    () => (mode === "kiosk" ? "100dvh" : "420px"),
    [mode]
  );

  const xrReady = Boolean(XRRoot && manifest && !err);
  const shouldPreMountWorld =
    started && xrReady && (entryStage === "transition" || entryStage === "arrival");

  useEffect(() => {
    if (typeof onStageChange === "function") {
      onStageChange(entryStage);
    }
  }, [entryStage, onStageChange]);

  useEffect(() => {
    let alive = true;
    isImmersiveVRSupported().then((ok) => {
      if (!alive) return;
      setSupported(Boolean(ok));
      setChecked(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!started) return;
    let alive = true;

    async function boot() {
      try {
        if (typeof builderLoader !== "function") {
          throw new Error("XR manifest builderLoader is required.");
        }

        const [builderMod, XRRootMod] = await Promise.all([
          builderLoader(),
          import("./XRRootThree.jsx"),
        ]);

        const build =
          builderMod?.buildManifest ||
          builderMod?.buildWhisperManifest ||
          builderMod?.default;

        if (typeof build !== "function") {
          throw new Error(
            "XR manifest builder must export a function (buildManifest | buildWhisperManifest | default)."
          );
        }

        const m = await build();
        if (!alive) return;

        const v = validateManifest(m);

        setManifestWarnings(
          Array.isArray(v.warnings) && v.warnings.length ? v.warnings : null
        );

        if (!v.ok) {
          setManifestErrors(v.errors);
          setErr("XR manifest validation failed.");
          return;
        }

        setManifest(v.manifest || m);
        setXRRoot(() => XRRootMod.default);
      } catch (e) {
        if (!alive) return;
        setManifestErrors(null);
        setErr(String(e?.message || e));
      }
    }

    boot();
    return () => {
      alive = false;
    };
  }, [started, builderLoader]);

  useEffect(() => {
    if (entryStage !== "transition") return;
    if (!xrReady) return;

    const minPassageMs = 2600;
    const elapsed = performance.now() - transitionStartedAtRef.current;
    const wait = Math.max(0, minPassageMs - elapsed);

    const timer = window.setTimeout(() => {
      setEntryStage("arrival");
    }, wait);

    return () => {
      window.clearTimeout(timer);
    };
  }, [entryStage, xrReady]);

  useEffect(() => {
    if (entryStage !== "arrival") return;
    if (!xrReady) return;

    const timer = window.setTimeout(() => {
      setEntryStage("world");
    }, 1450);

    return () => {
      window.clearTimeout(timer);
    };
  }, [entryStage, xrReady]);

  const handleExplore = () => {
    if (entryStage !== "prelude") return;
    transitionStartedAtRef.current = performance.now();
    setStarted(true);
    setEntryStage("transition");
  };

  if (entryStage !== "world") {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100dvh",
          overflow: "hidden",
          background: "#03060d",
        }}
      >
        {shouldPreMountWorld ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: entryStage === "arrival" ? 1 : 0,
              transform: entryStage === "arrival" ? "scale(1)" : "scale(1.02)",
              transition: "opacity 1.25s ease, transform 1.25s ease",
              pointerEvents: "none",
            }}
          >
            <XRRoot
              manifest={manifest}
              options={options}
              xrSupported={supported}
              xrChecked={checked}
              worldRuntime={worldRuntime}
            />
          </div>
        ) : null}

        <ThresholdPrelude
          phase={entryStage}
          onExplore={handleExplore}
          worldReady={xrReady}
          errorMessage={err || ""}
        />
      </div>
    );
  }

  if (err) {
    const canCopy = typeof navigator !== "undefined" && navigator.clipboard?.writeText;

    const copyDiagnostics = async () => {
      const payload = {
        error: err,
        manifestErrors,
        manifestWarnings,
      };
      const txt = JSON.stringify(payload, null, 2);

      try {
        if (canCopy) await navigator.clipboard.writeText(txt);
      } catch {}
    };

    return (
      <div
        style={{
          color: "rgba(255,255,255,0.80)",
          fontSize: 12,
          lineHeight: 1.6,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(0,0,0,0.35)",
          padding: 14,
          maxWidth: 760,
        }}
      >
        <div
          style={{
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontSize: 10,
            opacity: 0.7,
          }}
        >
          XR Fail-safe
        </div>

        <div style={{ marginTop: 8 }}>
          XR init failed: <span style={{ opacity: 0.85 }}>{err}</span>
        </div>

        {(Array.isArray(manifestErrors) && manifestErrors.length) ||
        (Array.isArray(manifestWarnings) && manifestWarnings.length) ? (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {canCopy ? (
                <button
                  type="button"
                  onClick={copyDiagnostics}
                  style={{
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "transparent",
                    color: "rgba(255,255,255,0.78)",
                    padding: "8px 10px",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    fontSize: 10,
                    cursor: "pointer",
                  }}
                >
                  Copy diagnostics
                </button>
              ) : null}

              <div style={{ opacity: 0.55, fontSize: 11 }}>
                Fix manifest → refresh (/experience or /xr)
              </div>
            </div>

            {Array.isArray(manifestErrors) && manifestErrors.length ? (
              <>
                <div
                  style={{
                    marginTop: 10,
                    opacity: 0.75,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  Errors
                </div>
                <ul
                  style={{
                    marginTop: 6,
                    paddingLeft: 18,
                    color: "rgba(255,255,255,0.70)",
                  }}
                >
                  {manifestErrors.map((x) => (
                    <li key={`e-${x}`}>{x}</li>
                  ))}
                </ul>
              </>
            ) : null}

            {Array.isArray(manifestWarnings) && manifestWarnings.length ? (
              <>
                <div
                  style={{
                    marginTop: 10,
                    opacity: 0.6,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  Warnings
                </div>
                <ul
                  style={{
                    marginTop: 6,
                    paddingLeft: 18,
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  {manifestWarnings.map((x) => (
                    <li key={`w-${x}`}>{x}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  if (!xrReady) {
    return (
      <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
        Loading XR…
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height,
        minHeight,
        border: mode === "kiosk" ? "none" : "1px solid rgba(255,255,255,0.10)",
        background: mode === "kiosk" ? "#05060a" : "rgba(255,255,255,0.02)",
        overflow: "hidden",
        animation: "xrWorldFadeIn 1.15s ease",
      }}
    >
      <XRRoot
        manifest={manifest}
        options={options}
        xrSupported={supported}
        xrChecked={checked}
        worldRuntime={worldRuntime}
      />

      {checked && !supported ? (
        <div
          style={{
            position: "absolute",
            left: 14,
            bottom: 14,
            padding: "10px 12px",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.28)",
            color: "rgba(255,255,255,0.62)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontSize: 10,
            pointerEvents: "none",
          }}
        >
          Desktop preview
        </div>
      ) : null}

      <style>{`
        @keyframes xrWorldFadeIn {
          from { opacity: 0; transform: scale(1.012); }
          to { opacity: 1; transform: scale(1); }
        }

        #VRButton{
          position:absolute;
          right:14px;
          bottom:14px;
          padding:12px 14px;
          border:1px solid rgba(255,255,255,0.18) !important;
          background:rgba(0,0,0,0.35) !important;
          color:rgba(255,255,255,0.88) !important;
          letter-spacing:0.26em;
          text-transform:uppercase;
          font-size:11px;
          border-radius:0;
        }
      `}</style>
    </div>
  );
}
