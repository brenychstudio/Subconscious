function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function createVoiceSeedEngine() {
  let ctx = null;
  let stream = null;
  let source = null;
  let analyser = null;
  let timeData = null;
  let freqData = null;

  let enabled = false;
  let error = null;

  let energy = 0;
  let brightness = 0;
  let onset = 0;
  let breath = 0;
  let presence = 0;
  let bloom = 0;

  let prevEnergy = 0;
  let lastActiveAt = 0;

  let noiseFloor = 0.01;
  let calibrating = false;
  let calibrationFramesLeft = 0;

  async function start() {
    error = null;

    if (!navigator.mediaDevices?.getUserMedia) {
      error = "Microphone API unavailable";
      return getState();
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioCtx();

      if (ctx.state !== "running") {
        await ctx.resume();
      }

      source = ctx.createMediaStreamSource(stream);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.86;

      source.connect(analyser);

      timeData = new Uint8Array(analyser.fftSize);
      freqData = new Uint8Array(analyser.frequencyBinCount);

      enabled = true;
      calibrating = true;
      calibrationFramesLeft = 72;

      energy = 0;
      brightness = 0;
      onset = 0;
      breath = 0;
      presence = 0;
      bloom = 0;
      prevEnergy = 0;
      noiseFloor = 0.01;

      return getState();
    } catch (err) {
      enabled = false;
      error = err?.message || "Microphone permission denied";
      return getState();
    }
  }

  async function stop() {
    enabled = false;
    calibrating = false;
    calibrationFramesLeft = 0;

    try { source?.disconnect?.(); } catch {}
    source = null;
    analyser = null;
    timeData = null;
    freqData = null;

    if (stream) {
      try {
        stream.getTracks().forEach((track) => track.stop());
      } catch {}
      stream = null;
    }

    if (ctx) {
      try { await ctx.close(); } catch {}
      ctx = null;
    }

    energy = 0;
    brightness = 0;
    onset = 0;
    breath = 0;
    presence = 0;
    bloom = 0;
    prevEnergy = 0;
    noiseFloor = 0.01;

    return getState();
  }

  async function toggle() {
    if (enabled) {
      return await stop();
    }
    return await start();
  }

  function update() {
    if (!enabled || !analyser || !timeData || !freqData) {
      return getState();
    }

    analyser.getByteTimeDomainData(timeData);
    analyser.getByteFrequencyData(freqData);

    let rmsSum = 0;
    let zeroCrossings = 0;
    let prev = (timeData[0] - 128) / 128;

    for (let i = 0; i < timeData.length; i += 1) {
      const v = (timeData[i] - 128) / 128;
      rmsSum += v * v;

      if ((prev >= 0 && v < 0) || (prev < 0 && v >= 0)) {
        zeroCrossings += 1;
      }
      prev = v;
    }

    const rms = Math.sqrt(rmsSum / timeData.length);

    if (calibrating) {
      noiseFloor = lerp(noiseFloor, rms, 0.08);
      calibrationFramesLeft -= 1;

      if (calibrationFramesLeft <= 0) {
        calibrating = false;
      }
    } else {
      noiseFloor = lerp(noiseFloor, Math.min(noiseFloor, rms), 0.01);
    }

    let weighted = 0;
    let total = 0;

    for (let i = 0; i < freqData.length; i += 1) {
      const mag = freqData[i] / 255;
      weighted += i * mag;
      total += mag;
    }

    const centroid = total > 0 ? weighted / total : 0;
    const rawBrightness = clamp01(centroid / (freqData.length * 0.55));
    const rawBreath = clamp01(zeroCrossings / (timeData.length * 0.24));

    const gate = noiseFloor + 0.006;
    const rawEnergy = clamp01((rms - gate) / 0.16);

    const delta = Math.max(0, rawEnergy - prevEnergy);
    const rawOnset = clamp01(delta * 6.5);

    const speaking = rawEnergy > 0.055 || rawOnset > 0.085;
    const targetPresence = speaking
      ? clamp01(rawEnergy * 0.82 + rawBreath * 0.18)
      : 0;

    const targetBloom = speaking
      ? clamp01(rawEnergy * 0.7 + rawBrightness * 0.25 + rawOnset * 0.35)
      : 0;

    energy = lerp(energy, rawEnergy, 0.16);
    brightness = lerp(brightness, rawBrightness, 0.12);
    breath = lerp(breath, rawBreath, 0.12);

    if (rawOnset > onset) {
      onset = lerp(onset, rawOnset, 0.28);
    } else {
      onset = lerp(onset, rawOnset, 0.12);
    }

    if (targetPresence > presence) {
      presence = lerp(presence, targetPresence, 0.22);
    } else {
      presence = lerp(presence, targetPresence, 0.06);
    }

    if (targetBloom > bloom) {
      bloom = lerp(bloom, targetBloom, 0.16);
    } else {
      bloom = lerp(bloom, targetBloom, 0.025);
    }

    prevEnergy = rawEnergy;

    if (speaking || presence > 0.05 || bloom > 0.06) {
      lastActiveAt = performance.now();
    }

    return getState();
  }

  function getState() {
    const active = enabled && (performance.now() - lastActiveAt < 360);

    return {
      enabled,
      active,
      calibrating,
      energy,
      brightness,
      onset,
      breath,
      presence,
      bloom,
      noiseFloor,
      error,
    };
  }

  async function dispose() {
    await stop();
  }

  return {
    toggle,
    update,
    getState,
    dispose,
  };
}

export default createVoiceSeedEngine;
