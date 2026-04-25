import { useRef } from "react";
import "./thresholdPrelude.css";
import SingularityTransitionCanvas from "./SingularityTransitionCanvas.jsx";

const stars = Array.from({ length: 90 }, (_, i) => ({
  id: i,
  left: `${(i * 37) % 100}%`,
  top: `${(i * 19) % 100}%`,
  size: 1 + ((i * 13) % 3),
  delay: `${((i * 0.08) % 4).toFixed(2)}s`,
  duration: `${(3 + ((i * 17) % 6)).toFixed(2)}s`,
}));

const orbitNodes = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  angle: (i / 12) * Math.PI * 2,
  radiusX: 96 + (i % 3) * 12,
  radiusY: 58 + (i % 4) * 8,
}));

export default function ThresholdPrelude({
  phase = "prelude",
  onExplore,
  worldReady = false,
  errorMessage = "",
}) {
  const isPrelude = phase === "prelude";
  const isTransition = phase === "transition";
  const isArrival = phase === "arrival";
  const isHandoff = phase === "handoff";
  const heroAnchorRef = useRef(null);

  return (
    <div
      className={[
        "tp-root",
        isTransition ? "tp-transition" : "",
        (isArrival || isHandoff) ? "tp-arrival" : "",
        isHandoff ? "tp-handoff" : "",
      ].join(" ").trim()}
    >
      <div className="tp-bg" />
      <div className="tp-vignette" />
      <div className="tp-radial-glow" />

      {stars.map((star) => (
        <span
          key={star.id}
          className="tp-star"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}

      <div className="tp-shell">
        <div className="tp-topbar">
          <div>
            <div className="tp-kicker">WHISPER XR · THRESHOLD PRELUDE</div>
            <div className="tp-toptext">Authorial consciousness world</div>
          </div>
        </div>

        <div className="tp-grid">
          <div className="tp-copy">
            <div className="tp-mini">AN AUTHORED PASSAGE INTO THE WORLD</div>

            <h1 className="tp-title">
              A threshold
              <br />
              between signal
              <br />
              and silence
            </h1>

            <p className="tp-body">
              The world listens before it reveals itself.
              <br />
              Voice, ritual sound, and living portals open a contemplative passage through shifting states of perception.
            </p>

            <div className="tp-actions">
              <button
                type="button"
                className="tp-cta"
                onClick={onExplore}
                disabled={!isPrelude}
              >
                Enter
                <span className="tp-arrow">→</span>
              </button>
            </div>
          </div>

          <div className="tp-stage">
            <div className="tp-hero">
              <div className="tp-hero-atmosphere" />
              <div className="tp-hero-veil tp-veil-outer" />
              <div className="tp-hero-veil tp-veil-inner" />
              <div className="tp-hero-membrane" />
              <div className="tp-hero-body" />
              <div className="tp-hero-seam tp-seam-a" />
              <div className="tp-hero-seam tp-seam-b" />
              <div className="tp-hero-core-glow" />
              <div ref={heroAnchorRef} className="tp-hero-nucleus" />
              <div className="tp-hero-ring tp-ring-a" />
              <div className="tp-hero-ring tp-ring-b" />
              <div className="tp-hero-ring tp-ring-c" />

              {orbitNodes.map((node) => (
                <span
                  key={node.id}
                  className="tp-orbit-node"
                  style={{
                    left: `calc(50% + ${Math.cos(node.angle) * node.radiusX}px)`,
                    top: `calc(50% + ${Math.sin(node.angle) * node.radiusY}px)`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <SingularityTransitionCanvas phase={phase} anchorRef={heroAnchorRef} />
    </div>
  );
}
