import { useEffect, useMemo, useRef } from "react";

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function easeInOutCubic(x) {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function rotate(x, y, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return {
    x: x * c - y * s,
    y: x * s + y * c,
  };
}

export default function SingularityTransitionCanvas({ phase = "prelude", anchorRef = null }) {
  const canvasRef = useRef(null);
  const phaseStartedAtRef = useRef(performance.now());
  const lastPhaseRef = useRef(phase);

  const particles = useMemo(() => {
    return Array.from({ length: 84 }, (_, i) => {
      const a = ((i * 137.507764) % 360) * Math.PI / 180;
      const r = 0.18 + (((i * 73) % 100) / 100) * 0.92;
      return {
        id: i,
        a,
        r,
        size: 0.9 + ((i * 17) % 12) / 10,
        spin: 0.28 + (((i * 19) % 100) / 100) * 1.2,
        alpha: 0.18 + (((i * 29) % 100) / 100) * 0.34,
      };
    });
  }, []);

  useEffect(() => {
    if (lastPhaseRef.current !== phase) {
      lastPhaseRef.current = phase;
      phaseStartedAtRef.current = performance.now();
    }
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;

    const resize = () => {
      const dpr = 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const frame = (now) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const minDim = Math.min(w, h);

      let cx = w * 0.68;
      let cy = h * 0.52;
      let baseR = minDim * 0.035;

      const anchorNode = anchorRef?.current;
      if (anchorNode) {
        const rect = anchorNode.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          cx = rect.left + rect.width / 2;
          cy = rect.top + rect.height / 2;
          baseR = Math.max(rect.width, rect.height) * 0.5;
        }
      }

      const phaseElapsed = now - phaseStartedAtRef.current;
      const transitionRaw = phase === "transition" ? clamp01(phaseElapsed / 2200) : phase === "arrival" ? 1 : 0;
      const arrivalRaw = phase === "arrival" ? clamp01(phaseElapsed / 900) : 0;

      const transitionT = easeInOutCubic(transitionRaw);
      const arrivalT = Math.pow(arrivalRaw, 0.9);

      const visibility = phase === "prelude" ? 0 : phase === "transition" ? 1 : Math.max(0, 1 - arrivalT * 0.98);
      const targetHole = minDim * 0.30;
      const arrivalHole = minDim * 0.50;

      let holeR = baseR;
      if (phase === "transition") {
        holeR = lerp(baseR, targetHole, transitionT);
      } else if (phase === "arrival") {
        holeR = lerp(targetHole * 0.96, arrivalHole, arrivalT);
      }

      ctx.clearRect(0, 0, w, h);

      if (visibility > 0.001) {
        const vignette = ctx.createRadialGradient(cx, cy, minDim * 0.04, cx, cy, minDim * 1.05);
        vignette.addColorStop(0, `rgba(6,10,20,${0.02 * visibility})`);
        vignette.addColorStop(0.32, `rgba(4,8,18,${0.08 * visibility})`);
        vignette.addColorStop(0.68, `rgba(0,0,0,${0.28 * visibility})`);
        vignette.addColorStop(1, `rgba(0,0,0,${0.72 * visibility})`);
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);

        const fieldGlow = ctx.createRadialGradient(cx, cy, holeR * 0.2, cx, cy, holeR * 2.05);
        fieldGlow.addColorStop(0, `rgba(132,160,255,${0.04 * visibility})`);
        fieldGlow.addColorStop(0.22, `rgba(112,142,255,${0.08 * visibility})`);
        fieldGlow.addColorStop(0.52, `rgba(60,88,180,${0.06 * visibility})`);
        fieldGlow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = fieldGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, holeR * 1.9, 0, Math.PI * 2);
        ctx.fill();

        particles.forEach((p) => {
          const orbitRadius = p.r * minDim * 0.60;
          const dx = Math.cos(p.a) * orbitRadius;
          const dy = Math.sin(p.a) * orbitRadius * 0.72;

          const pullBase = phase === "transition" ? transitionT : 1;
          const effectivePull = clamp01(pullBase * (0.48 + p.spin * 0.24));
          const swirl = rotate(dx, dy, -(0.24 + p.spin * 0.54) * pullBase);

          const px = cx + swirl.x * (1 - effectivePull);
          const py = cy + swirl.y * (1 - effectivePull);

          const trailPull = clamp01(effectivePull - 0.05);
          const trail = rotate(dx, dy, -(0.14 + p.spin * 0.26) * Math.max(0.02, pullBase));
          const tx = cx + trail.x * (1 - trailPull);
          const ty = cy + trail.y * (1 - trailPull);

          const alpha = p.alpha * visibility * (phase === "arrival" ? (1 - arrivalT) * 0.6 : 1);

          ctx.beginPath();
          ctx.strokeStyle = `rgba(210,225,255,${alpha * 0.14})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(tx, ty);
          ctx.lineTo(px, py);
          ctx.stroke();

          ctx.beginPath();
          ctx.fillStyle = `rgba(255,255,255,${alpha * 0.72})`;
          ctx.arc(px, py, p.size * 0.34, 0, Math.PI * 2);
          ctx.fill();
        });

        const ringAlpha = phase === "arrival"
          ? (1 - arrivalT) * 0.08
          : 0.16 * (1 - Math.pow(transitionT, 1.25));

        [1.22, 1.48].forEach((mult, idx) => {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(160,184,255,${(0.028 - idx * 0.008) * ringAlpha})`;
          ctx.lineWidth = 1;
          ctx.arc(cx, cy, holeR * mult, 0, Math.PI * 2);
          ctx.stroke();
        });

        ctx.save();
        ctx.translate(cx, cy);
        ctx.globalAlpha = 0.10 * visibility * (phase === "arrival" ? (1 - arrivalT) : 1);
        ctx.strokeStyle = "rgba(180,200,255,0.7)";
        ctx.lineWidth = 0.8;
        ctx.rotate(-0.18 - transitionT * 0.22);
        ctx.beginPath();
        ctx.ellipse(0, 0, holeR * 1.12, holeR * 0.48, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.rotate(0.62 + transitionT * 0.18);
        ctx.beginPath();
        ctx.ellipse(0, 0, holeR * 0.84, holeR * 0.30, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        const edgeGlow = ctx.createRadialGradient(cx, cy, holeR * 0.98, cx, cy, holeR * 1.34);
        edgeGlow.addColorStop(0, "rgba(0,0,0,0)");
        edgeGlow.addColorStop(0.78, `rgba(76,104,196,${0.03 * visibility})`);
        edgeGlow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = edgeGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, holeR * 1.34, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "rgba(1,2,4,0.992)";
        ctx.arc(cx, cy, holeR, 0, Math.PI * 2);
        ctx.fill();

        if (phase === "arrival") {
          const flash = ctx.createRadialGradient(cx, cy, holeR * 0.22, cx, cy, holeR * 1.8);
          flash.addColorStop(0, `rgba(255,255,255,${0.12 * (1 - arrivalT)})`);
          flash.addColorStop(0.22, `rgba(220,232,255,${0.06 * (1 - arrivalT)})`);
          flash.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = flash;
          ctx.fillRect(0, 0, w, h);
        }
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [particles, phase, anchorRef]);

  return <canvas ref={canvasRef} className={`tp-canvas-layer ${phase !== "prelude" ? "is-active" : ""}`} />;
}
