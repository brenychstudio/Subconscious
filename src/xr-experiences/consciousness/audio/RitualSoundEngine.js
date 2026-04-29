const DEMO_REAL_02_AUDIO_PASS = true;

const ROOM_MIX = {
  "hall-of-arrival": { arrival: 1.0, signal: 0.08, membrane: 0.06, portal: 0.0 },
  "signal-corridor": { arrival: 0.18, signal: 1.0, membrane: 0.14, portal: 0.02 },
  "membrane-chamber": { arrival: 0.08, signal: 0.18, membrane: 1.0, portal: 0.06 },
  "portal-atrium": { arrival: 0.04, signal: 0.12, membrane: 0.28, portal: 1.0 },
};

const MASTER_GAIN = 0.42;
const OUTPUT_GAIN = 1.68;

function clamp01(value) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}

function rampParam(param, value, ctx, time = 0.18) {
  if (!param || !ctx) return;

  const now = ctx.currentTime;
  const safeValue = Number.isFinite(value) ? value : 0;

  try {
    param.cancelScheduledValues(now);
    param.setTargetAtTime(safeValue, now, Math.max(0.001, time));
  } catch {
    try {
      param.value = safeValue;
    } catch {}
  }
}

function setEnvelope(gainParam, ctx, points) {
  if (!gainParam || !ctx) return;

  const now = ctx.currentTime;

  try {
    gainParam.cancelScheduledValues(now);
    points.forEach(([time, value, mode = "linear"]) => {
      const at = now + Math.max(0, time);
      if (mode === "target") {
        gainParam.setTargetAtTime(value, at, 0.035);
      } else if (time <= 0) {
        gainParam.setValueAtTime(value, at);
      } else {
        gainParam.linearRampToValueAtTime(value, at);
      }
    });
  } catch {}
}

function createNoiseBuffer(ctx, duration = 2, amount = 0.22) {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const channel = buffer.getChannelData(0);

  for (let i = 0; i < length; i += 1) {
    channel[i] = (Math.random() * 2 - 1) * amount;
  }

  return buffer;
}

function createOscLayer(ctx, config) {
  const output = ctx.createGain();
  output.gain.value = 0;

  const filter = ctx.createBiquadFilter();
  filter.type = config.filterType ?? "lowpass";
  filter.frequency.value = config.filterFrequency ?? 800;
  filter.Q.value = config.q ?? 0.7;

  const primary = ctx.createOscillator();
  primary.type = config.typeA ?? "sine";
  primary.frequency.value = config.freqA ?? 110;

  const primaryGain = ctx.createGain();
  primaryGain.gain.value = config.gainA ?? 0.5;

  primary.connect(primaryGain);
  primaryGain.connect(filter);

  let secondary = null;
  let secondaryGain = null;

  if (config.freqB) {
    secondary = ctx.createOscillator();
    secondary.type = config.typeB ?? "sine";
    secondary.frequency.value = config.freqB;
    secondary.detune.value = config.detuneB ?? 0;

    secondaryGain = ctx.createGain();
    secondaryGain.gain.value = config.gainB ?? 0.35;

    secondary.connect(secondaryGain);
    secondaryGain.connect(filter);
  }

  filter.connect(output);
  output.connect(config.destination);

  primary.start();
  if (secondary) secondary.start();

  return {
    output,
    filter,
    primary,
    secondary,
    primaryGain,
    secondaryGain,
  };
}

function createNoiseLayer(ctx, destination, config = {}) {
  const source = ctx.createBufferSource();
  source.buffer = createNoiseBuffer(ctx, config.duration ?? 2.4, config.amount ?? 0.22);
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = config.filterType ?? "highpass";
  filter.frequency.value = config.filterFrequency ?? 1800;
  filter.Q.value = config.q ?? 0.3;

  const output = ctx.createGain();
  output.gain.value = 0;

  source.connect(filter);
  filter.connect(output);
  output.connect(destination);
  source.start();

  return {
    source,
    filter,
    output,
  };
}

function createDynamicsChain(ctx) {
  const input = ctx.createGain();
  const compressor = ctx.createDynamicsCompressor();
  const output = ctx.createGain();

  compressor.threshold.value = -21;
  compressor.knee.value = 18;
  compressor.ratio.value = 2.2;
  compressor.attack.value = 0.012;
  compressor.release.value = 0.34;

  input.connect(compressor);
  compressor.connect(output);

  return { input, compressor, output };
}

function triggerToneHit(ctx, destination, options = {}) {
  if (!ctx || !destination) return;

  const now = ctx.currentTime;
  const output = ctx.createGain();
  output.gain.value = 0;
  output.connect(destination);

  const low = ctx.createOscillator();
  low.type = "sine";
  low.frequency.setValueAtTime(options.lowFreq ?? 43, now);
  low.frequency.exponentialRampToValueAtTime(options.lowEndFreq ?? 32, now + 0.42);

  const lowGain = ctx.createGain();
  lowGain.gain.value = options.lowGain ?? 0.34;

  const ping = ctx.createOscillator();
  ping.type = "sine";
  ping.frequency.setValueAtTime(options.pingFreq ?? 392, now);
  ping.frequency.exponentialRampToValueAtTime(options.pingEndFreq ?? 261.63, now + 0.76);

  const pingGain = ctx.createGain();
  pingGain.gain.value = options.pingGain ?? 0.075;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(options.filterStart ?? 980, now);
  filter.frequency.exponentialRampToValueAtTime(options.filterEnd ?? 260, now + 0.8);
  filter.Q.value = 0.55;

  low.connect(lowGain);
  ping.connect(pingGain);
  lowGain.connect(filter);
  pingGain.connect(filter);
  filter.connect(output);

  setEnvelope(output.gain, ctx, [
    [0, 0],
    [0.018, options.gain ?? 0.8],
    [0.16, (options.gain ?? 0.8) * 0.34],
    [0.82, 0.0001],
  ]);

  low.start(now);
  ping.start(now);
  low.stop(now + 0.95);
  ping.stop(now + 0.95);

  window.setTimeout(() => {
    try { low.disconnect(); } catch {}
    try { ping.disconnect(); } catch {}
    try { lowGain.disconnect(); } catch {}
    try { pingGain.disconnect(); } catch {}
    try { filter.disconnect(); } catch {}
    try { output.disconnect(); } catch {}
  }, 1250);
}

function triggerNoiseBloom(ctx, destination, options = {}) {
  if (!ctx || !destination) return;

  const now = ctx.currentTime;
  const source = ctx.createBufferSource();
  source.buffer = createNoiseBuffer(ctx, options.duration ?? 1.2, options.amount ?? 0.24);

  const filter = ctx.createBiquadFilter();
  filter.type = options.filterType ?? "bandpass";
  filter.frequency.setValueAtTime(options.filterStart ?? 1600, now);
  filter.frequency.exponentialRampToValueAtTime(options.filterEnd ?? 420, now + 0.92);
  filter.Q.value = options.q ?? 0.55;

  const output = ctx.createGain();
  output.gain.value = 0;
  output.connect(destination);

  source.connect(filter);
  filter.connect(output);

  setEnvelope(output.gain, ctx, [
    [0, 0],
    [0.035, options.gain ?? 0.18],
    [0.28, (options.gain ?? 0.18) * 0.42],
    [1.08, 0.0001],
  ]);

  source.start(now);
  source.stop(now + 1.2);

  window.setTimeout(() => {
    try { source.disconnect(); } catch {}
    try { filter.disconnect(); } catch {}
    try { output.disconnect(); } catch {}
  }, 1450);
}

export function createRitualSoundEngine() {
  let ctx = null;
  let dynamics = null;
  let master = null;
  let ready = false;

  let lowBed = null;
  let subPulse = null;
  let arrival = null;
  let signal = null;
  let membrane = null;
  let portal = null;
  let choir = null;
  let air = null;
  let shimmer = null;

  let currentRoomId = "hall-of-arrival";
  let roomPresence = 0;
  let portalPresence = 0;
  let sanctuaryPresence = 0;
  let previousSanctuaryPresence = 0;
  let previousPortalPresence = 0;

  let thresholdHitCooldown = 0;
  let portalHitCooldown = 0;
  let chargeSwell = 0;
  let thresholdAfterglow = 0;
  let portalAfterglow = 0;

  let voiceEnergy = 0;
  let voiceBrightness = 0;
  let voiceOnset = 0;
  let voiceBreath = 0;
  let voicePresence = 0;
  let voiceBloom = 0;
  let voiceActive = false;

  const ensure = async () => {
    if (ready) return;
    if (typeof window === "undefined") return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    ctx = new AudioCtx();

    dynamics = createDynamicsChain(ctx);
    master = ctx.createGain();
    master.gain.value = 0;

    dynamics.output.connect(master);
    master.connect(ctx.destination);

    lowBed = createOscLayer(ctx, {
      destination: dynamics.input,
      typeA: "sine",
      freqA: 48,
      gainA: 0.74,
      typeB: "triangle",
      freqB: 72,
      gainB: 0.18,
      detuneB: 1.5,
      filterType: "lowpass",
      filterFrequency: 128,
      q: 0.22,
    });

    subPulse = createOscLayer(ctx, {
      destination: dynamics.input,
      typeA: "sine",
      freqA: 36,
      gainA: 0.68,
      typeB: "sine",
      freqB: 54,
      gainB: 0.16,
      detuneB: -3,
      filterType: "lowpass",
      filterFrequency: 92,
      q: 0.28,
    });

    arrival = createOscLayer(ctx, {
      destination: dynamics.input,
      typeA: "sine",
      freqA: 196,
      gainA: 0.48,
      typeB: "sine",
      freqB: 293.66,
      gainB: 0.2,
      detuneB: 2.5,
      filterType: "bandpass",
      filterFrequency: 520,
      q: 0.72,
    });

    signal = createOscLayer(ctx, {
      destination: dynamics.input,
      typeA: "triangle",
      freqA: 148,
      gainA: 0.4,
      typeB: "triangle",
      freqB: 296,
      gainB: 0.15,
      detuneB: -2,
      filterType: "bandpass",
      filterFrequency: 960,
      q: 1.2,
    });

    membrane = createOscLayer(ctx, {
      destination: dynamics.input,
      typeA: "triangle",
      freqA: 92,
      gainA: 0.42,
      typeB: "sine",
      freqB: 138,
      gainB: 0.22,
      detuneB: 5,
      filterType: "lowpass",
      filterFrequency: 760,
      q: 0.68,
    });

    portal = createOscLayer(ctx, {
      destination: dynamics.input,
      typeA: "sine",
      freqA: 392,
      gainA: 0.26,
      typeB: "triangle",
      freqB: 784,
      gainB: 0.11,
      detuneB: 2,
      filterType: "bandpass",
      filterFrequency: 1420,
      q: 1.15,
    });

    choir = createOscLayer(ctx, {
      destination: dynamics.input,
      typeA: "sine",
      freqA: 220,
      gainA: 0.22,
      typeB: "sine",
      freqB: 329.63,
      gainB: 0.12,
      detuneB: -4,
      filterType: "bandpass",
      filterFrequency: 680,
      q: 0.82,
    });

    air = createNoiseLayer(ctx, dynamics.input, {
      filterType: "highpass",
      filterFrequency: 1850,
      q: 0.28,
      amount: 0.2,
    });

    shimmer = createNoiseLayer(ctx, dynamics.input, {
      filterType: "bandpass",
      filterFrequency: 2600,
      q: 0.62,
      amount: 0.16,
    });

    ready = true;
  };

  const resume = async () => {
    await ensure();
    if (!ctx) return;

    if (ctx.state !== "running") {
      await ctx.resume();
    }

    rampParam(master.gain, MASTER_GAIN, ctx, 0.28);
  };

  const setRoomState = (roomId, presence) => {
    currentRoomId = roomId;
    roomPresence = clamp01(presence);
  };

  const setPortalPresence = (value) => {
    previousPortalPresence = portalPresence;
    portalPresence = clamp01(value);

    if (ready && ctx && portalPresence > 0.52 && previousPortalPresence <= 0.52 && portalHitCooldown <= 0) {
      portalHitCooldown = 1.4;
      portalAfterglow = Math.max(portalAfterglow, 1);
      triggerNoiseBloom(ctx, dynamics.input, {
        gain: 0.12,
        filterStart: 2400,
        filterEnd: 780,
        duration: 1.0,
        amount: 0.16,
      });
    }
  };

  const setSanctuaryPresence = (value) => {
    previousSanctuaryPresence = sanctuaryPresence;
    sanctuaryPresence = clamp01(value);

    if (ready && ctx && sanctuaryPresence > 0.88 && previousSanctuaryPresence <= 0.88 && thresholdHitCooldown <= 0) {
      thresholdHitCooldown = 2.2;
      thresholdAfterglow = Math.max(thresholdAfterglow, 1);
      triggerToneHit(ctx, dynamics.input, {
        lowFreq: 46,
        lowEndFreq: 31,
        pingFreq: 392,
        pingEndFreq: 246.94,
        gain: 0.78,
        lowGain: 0.35,
        pingGain: 0.07,
        filterStart: 1080,
        filterEnd: 260,
      });
      triggerNoiseBloom(ctx, dynamics.input, {
        gain: 0.145,
        filterStart: 3200,
        filterEnd: 520,
        duration: 1.12,
        amount: 0.18,
      });
    }
  };

  const setVoiceFeatures = (features) => {
    voiceEnergy = clamp01(features?.energy ?? 0);
    voiceBrightness = clamp01(features?.brightness ?? 0);
    voiceOnset = clamp01(features?.onset ?? 0);
    voiceBreath = clamp01(features?.breath ?? 0);
    voicePresence = clamp01(features?.presence ?? features?.energy ?? 0);
    voiceBloom = clamp01(features?.bloom ?? features?.energy ?? 0);
    voiceActive = Boolean(features?.active);
  };

  const update = (elapsed = 0, dtSec = 1 / 60) => {
    if (!ready || !ctx) return;

    const safeDt = clamp(dtSec, 1 / 240, 0.08);
    thresholdHitCooldown = Math.max(0, thresholdHitCooldown - safeDt);
    portalHitCooldown = Math.max(0, portalHitCooldown - safeDt);
    thresholdAfterglow = Math.max(0, thresholdAfterglow - safeDt * 0.46);
    portalAfterglow = Math.max(0, portalAfterglow - safeDt * 0.62);

    const mix = ROOM_MIX[currentRoomId] ?? ROOM_MIX["hall-of-arrival"];
    const presenceScalar = 0.18 + roomPresence * 0.82;

    const ritualCharge = clamp01((sanctuaryPresence - 0.24) / 0.76);
    const openingEnergy = Math.max(
      thresholdAfterglow,
      portalAfterglow * 0.78,
      clamp01((sanctuaryPresence - 0.62) / 0.38) * 0.75,
      portalPresence * 0.92
    );
    chargeSwell = chargeSwell * 0.94 + ritualCharge * 0.06;

    const voiceMain = voiceActive ? voicePresence : voicePresence * 0.42;
    const voiceAir = voiceBloom;
    const voiceImpulse = voiceOnset;

    const arrivalTarget =
      mix.arrival *
      presenceScalar *
      (0.058 + voiceMain * 0.024 + voiceAir * 0.012) *
      OUTPUT_GAIN;

    const signalTarget =
      mix.signal *
      presenceScalar *
      (0.062 + voiceBrightness * 0.026 + voiceImpulse * 0.02) *
      OUTPUT_GAIN;

    const membraneTarget =
      (mix.membrane *
        presenceScalar *
        (0.084 + voiceMain * 0.04 + voiceBreath * 0.018) +
        sanctuaryPresence * 0.11 +
        chargeSwell * 0.07) *
      OUTPUT_GAIN;

    const portalTarget =
      ((mix.portal * presenceScalar) + portalPresence * 0.86 + openingEnergy * 0.18) *
      (0.082 + voiceBrightness * 0.026 + voiceAir * 0.022) *
      OUTPUT_GAIN;

    const choirTarget =
      (thresholdAfterglow * 0.055 +
        ritualCharge * 0.028 +
        voiceMain * 0.012 +
        portalPresence * 0.018) *
      OUTPUT_GAIN;

    const bedTarget =
      (0.048 +
        roomPresence * 0.018 +
        voiceMain * 0.01 +
        sanctuaryPresence * 0.032 +
        thresholdAfterglow * 0.026) *
      OUTPUT_GAIN;

    const subTarget =
      (ritualCharge * 0.026 + openingEnergy * 0.038 + portalPresence * 0.018) *
      OUTPUT_GAIN;

    const airTarget =
      (0.007 +
        portalPresence * 0.012 +
        roomPresence * 0.004 +
        voiceBrightness * 0.004 +
        voiceAir * 0.004 +
        sanctuaryPresence * 0.006) *
      OUTPUT_GAIN;

    const shimmerTarget =
      (portalPresence * 0.016 + thresholdAfterglow * 0.018 + voiceBrightness * 0.005) *
      OUTPUT_GAIN;

    rampParam(lowBed.output.gain, bedTarget, ctx, 0.3);
    rampParam(subPulse.output.gain, subTarget, ctx, 0.12);
    rampParam(arrival.output.gain, arrivalTarget, ctx, 0.24);
    rampParam(signal.output.gain, signalTarget, ctx, 0.18);
    rampParam(membrane.output.gain, membraneTarget, ctx, 0.18);
    rampParam(portal.output.gain, portalTarget, ctx, 0.16);
    rampParam(choir.output.gain, choirTarget, ctx, 0.28);
    rampParam(air.output.gain, airTarget, ctx, 0.28);
    rampParam(shimmer.output.gain, shimmerTarget, ctx, 0.2);

    const lowBedFreq = 122 + Math.sin(elapsed * 0.18) * 10 + voiceMain * 8 + openingEnergy * 8;
    const subFreq = 78 + Math.sin(elapsed * 0.48) * 8 + openingEnergy * 18;
    const arrivalFreq = 430 + Math.sin(elapsed * 0.52) * 26 + voiceBrightness * 52 + voiceAir * 24;
    const signalFreq =
      850 +
      Math.sin(elapsed * 2.1) * 160 +
      roomPresence * 86 +
      voiceImpulse * 165 +
      voiceBrightness * 105;
    const membraneFreq =
      700 +
      Math.sin(elapsed * 0.94) * 118 +
      roomPresence * 68 +
      voiceBreath * 120 +
      voiceMain * 92 +
      sanctuaryPresence * 310 +
      thresholdAfterglow * 260;
    const portalFreq =
      1200 +
      Math.sin(elapsed * 1.6) * 180 +
      portalPresence * 380 +
      openingEnergy * 220 +
      voiceBrightness * 170 +
      voiceAir * 90;
    const choirFreq = 620 + Math.sin(elapsed * 0.38) * 68 + thresholdAfterglow * 210 + voiceMain * 90;
    const airFreq = 1650 + Math.sin(elapsed * 0.4) * 120 + portalPresence * 240 + voiceBrightness * 150;
    const shimmerFreq = 2300 + Math.sin(elapsed * 0.72) * 320 + portalPresence * 420 + thresholdAfterglow * 260;

    rampParam(lowBed.filter.frequency, lowBedFreq, ctx, 0.28);
    rampParam(subPulse.filter.frequency, subFreq, ctx, 0.18);
    rampParam(arrival.filter.frequency, arrivalFreq, ctx, 0.24);
    rampParam(signal.filter.frequency, signalFreq, ctx, 0.14);
    rampParam(membrane.filter.frequency, membraneFreq, ctx, 0.16);
    rampParam(portal.filter.frequency, portalFreq, ctx, 0.14);
    rampParam(choir.filter.frequency, choirFreq, ctx, 0.24);
    rampParam(air.filter.frequency, airFreq, ctx, 0.22);
    rampParam(shimmer.filter.frequency, shimmerFreq, ctx, 0.16);

    if (signal.secondary) {
      rampParam(signal.secondary.detune, Math.sin(elapsed * 2.3) * 8 + voiceImpulse * 28, ctx, 0.14);
    }

    if (membrane.secondary) {
      rampParam(
        membrane.secondary.detune,
        Math.sin(elapsed * 0.92) * 12 + roomPresence * 6 + voiceMain * 14 + thresholdAfterglow * 28,
        ctx,
        0.2
      );
    }

    if (portal.secondary) {
      rampParam(
        portal.secondary.detune,
        Math.sin(elapsed * 1.4) * 9 + portalPresence * 16 + openingEnergy * 14 + voiceBrightness * 18 + voiceAir * 12,
        ctx,
        0.16
      );
    }

    if (choir.secondary) {
      rampParam(
        choir.secondary.detune,
        Math.sin(elapsed * 0.58) * 10 + thresholdAfterglow * 22 + voiceMain * 12,
        ctx,
        0.24
      );
    }
  };

  const dispose = async () => {
    if (!ready || !ctx) return;

    try { rampParam(master.gain, 0, ctx, 0.12); } catch {}

    const stopNode = (node) => {
      try { node?.stop?.(); } catch {}
      try { node?.disconnect?.(); } catch {}
    };

    [lowBed, subPulse, arrival, signal, membrane, portal, choir].forEach((layer) => {
      stopNode(layer?.primary);
      stopNode(layer?.secondary);
      try { layer?.output?.disconnect?.(); } catch {}
      try { layer?.filter?.disconnect?.(); } catch {}
    });

    stopNode(air?.source);
    stopNode(shimmer?.source);
    try { air?.output?.disconnect?.(); } catch {}
    try { shimmer?.output?.disconnect?.(); } catch {}
    try { dynamics?.input?.disconnect?.(); } catch {}
    try { dynamics?.compressor?.disconnect?.(); } catch {}
    try { dynamics?.output?.disconnect?.(); } catch {}
    try { master?.disconnect?.(); } catch {}

    try { await ctx.close(); } catch {}

    ctx = null;
    dynamics = null;
    master = null;
    ready = false;
  };

  return {
    resume,
    setRoomState,
    setPortalPresence,
    setSanctuaryPresence,
    setVoiceFeatures,
    update,
    dispose,
  };
}

export default createRitualSoundEngine;
