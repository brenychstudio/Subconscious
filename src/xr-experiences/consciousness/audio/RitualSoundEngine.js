const ROOM_MIX = {
  "hall-of-arrival": { arrival: 1.0, signal: 0.08, membrane: 0.06, portal: 0.00 },
  "signal-corridor": { arrival: 0.18, signal: 1.0, membrane: 0.14, portal: 0.02 },
  "membrane-chamber": { arrival: 0.08, signal: 0.18, membrane: 1.0, portal: 0.06 },
  "portal-atrium": { arrival: 0.04, signal: 0.12, membrane: 0.28, portal: 1.0 },
};

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

const MASTER_GAIN = 0.32;
const OUTPUT_GAIN = 1.45;

function rampParam(param, value, ctx, time = 0.18) {
  if (!param || !ctx) return;
  param.cancelScheduledValues(ctx.currentTime);
  param.setTargetAtTime(value, ctx.currentTime, time);
}

function createNoiseBuffer(ctx, duration = 2) {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const channel = buffer.getChannelData(0);

  for (let i = 0; i < length; i += 1) {
    channel[i] = (Math.random() * 2 - 1) * 0.22;
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
  };
}

function createNoiseLayer(ctx, destination) {
  const source = ctx.createBufferSource();
  source.buffer = createNoiseBuffer(ctx, 2.4);
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 1800;
  filter.Q.value = 0.3;

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

export function createRitualSoundEngine() {
  let ctx = null;
  let master = null;
  let ready = false;

  let lowBed = null;
  let arrival = null;
  let signal = null;
  let membrane = null;
  let portal = null;
  let air = null;

  let currentRoomId = "hall-of-arrival";
  let roomPresence = 0;
  let portalPresence = 0;

  let voiceEnergy = 0;
  let voiceBrightness = 0;
  let voiceOnset = 0;
  let voiceBreath = 0;
  let voicePresence = 0;
  let voiceBloom = 0;
  let voiceActive = false;

  const ensure = async () => {
    if (ready) return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    ctx = new AudioCtx();

    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    lowBed = createOscLayer(ctx, {
      destination: master,
      typeA: "sine",
      freqA: 54,
      gainA: 0.75,
      typeB: "triangle",
      freqB: 81,
      gainB: 0.22,
      detuneB: 2,
      filterType: "lowpass",
      filterFrequency: 150,
      q: 0.2,
    });

    arrival = createOscLayer(ctx, {
      destination: master,
      typeA: "sine",
      freqA: 196,
      gainA: 0.5,
      typeB: "sine",
      freqB: 293.66,
      gainB: 0.22,
      detuneB: 3,
      filterType: "bandpass",
      filterFrequency: 420,
      q: 0.8,
    });

    signal = createOscLayer(ctx, {
      destination: master,
      typeA: "triangle",
      freqA: 148,
      gainA: 0.45,
      typeB: "triangle",
      freqB: 296,
      gainB: 0.16,
      detuneB: -2,
      filterType: "bandpass",
      filterFrequency: 900,
      q: 1.3,
    });

    membrane = createOscLayer(ctx, {
      destination: master,
      typeA: "triangle",
      freqA: 92,
      gainA: 0.38,
      typeB: "sine",
      freqB: 138,
      gainB: 0.2,
      detuneB: 5,
      filterType: "lowpass",
      filterFrequency: 720,
      q: 0.7,
    });

    portal = createOscLayer(ctx, {
      destination: master,
      typeA: "sine",
      freqA: 392,
      gainA: 0.26,
      typeB: "triangle",
      freqB: 784,
      gainB: 0.12,
      detuneB: 2,
      filterType: "bandpass",
      filterFrequency: 1320,
      q: 1.2,
    });

    air = createNoiseLayer(ctx, master);

    ready = true;
  };

  const resume = async () => {
    await ensure();
    if (!ctx) return;

    if (ctx.state !== "running") {
      await ctx.resume();
    }

    rampParam(master.gain, MASTER_GAIN, ctx, 0.22);
  };

  const setRoomState = (roomId, presence) => {
    currentRoomId = roomId;
    roomPresence = clamp01(presence);
  };

  const setPortalPresence = (value) => {
    portalPresence = clamp01(value);
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

  const update = (elapsed) => {
    if (!ready || !ctx) return;

    const mix = ROOM_MIX[currentRoomId] ?? ROOM_MIX["hall-of-arrival"];
    const presenceScalar = 0.16 + roomPresence * 0.84;

    const voiceMain = voiceActive ? voicePresence : voicePresence * 0.45;
    const voiceAir = voiceBloom;
    const voiceImpulse = voiceOnset;

    const arrivalTarget = mix.arrival * presenceScalar * (0.052 + voiceMain * 0.024 + voiceAir * 0.01) * OUTPUT_GAIN;
    const signalTarget = mix.signal * presenceScalar * (0.065 + voiceBrightness * 0.026 + voiceImpulse * 0.022) * OUTPUT_GAIN;
    const membraneTarget = mix.membrane * presenceScalar * (0.078 + voiceMain * 0.04 + voiceBreath * 0.016) * OUTPUT_GAIN;
    const portalTarget = ((mix.portal * presenceScalar) + portalPresence * 0.85) * (0.078 + voiceBrightness * 0.026 + voiceAir * 0.02) * OUTPUT_GAIN;
    const bedTarget = (0.038 + roomPresence * 0.018 + voiceMain * 0.012) * OUTPUT_GAIN;
    const airTarget = (0.008 + portalPresence * 0.012 + roomPresence * 0.004 + voiceBrightness * 0.004 + voiceAir * 0.004) * OUTPUT_GAIN;

    rampParam(lowBed.output.gain, bedTarget, ctx, 0.28);
    rampParam(arrival.output.gain, arrivalTarget, ctx, 0.22);
    rampParam(signal.output.gain, signalTarget, ctx, 0.18);
    rampParam(membrane.output.gain, membraneTarget, ctx, 0.22);
    rampParam(portal.output.gain, portalTarget, ctx, 0.18);
    rampParam(air.output.gain, airTarget, ctx, 0.26);

    const lowBedFreq = 145 + Math.sin(elapsed * 0.18) * 16 + voiceMain * 10;
    const arrivalFreq = 380 + Math.sin(elapsed * 0.52) * 28 + voiceBrightness * 56 + voiceAir * 24;
    const signalFreq = 820 + Math.sin(elapsed * 2.1) * 180 + roomPresence * 90 + voiceImpulse * 180 + voiceBrightness * 110;
    const membraneFreq = 680 + Math.sin(elapsed * 0.94) * 120 + roomPresence * 70 + voiceBreath * 120 + voiceMain * 96;
    const portalFreq = 1180 + Math.sin(elapsed * 1.6) * 180 + portalPresence * 320 + voiceBrightness * 180 + voiceAir * 90;
    const airFreq = 1700 + Math.sin(elapsed * 0.4) * 120 + portalPresence * 260 + voiceBrightness * 150;

    rampParam(lowBed.filter.frequency, lowBedFreq, ctx, 0.28);
    rampParam(arrival.filter.frequency, arrivalFreq, ctx, 0.24);
    rampParam(signal.filter.frequency, signalFreq, ctx, 0.14);
    rampParam(membrane.filter.frequency, membraneFreq, ctx, 0.18);
    rampParam(portal.filter.frequency, portalFreq, ctx, 0.14);
    rampParam(air.filter.frequency, airFreq, ctx, 0.22);

    if (signal.secondary) {
      rampParam(signal.secondary.detune, Math.sin(elapsed * 2.3) * 8 + voiceImpulse * 28, ctx, 0.14);
    }

    if (membrane.secondary) {
      rampParam(membrane.secondary.detune, Math.sin(elapsed * 0.92) * 12 + roomPresence * 6 + voiceMain * 14, ctx, 0.22);
    }

    if (portal.secondary) {
      rampParam(portal.secondary.detune, Math.sin(elapsed * 1.4) * 9 + portalPresence * 16 + voiceBrightness * 18 + voiceAir * 12, ctx, 0.18);
    }
  };

  const dispose = async () => {
    if (!ready || !ctx) return;

    try { rampParam(master.gain, 0, ctx, 0.12); } catch {}

    const stopNode = (node) => {
      try { node?.stop?.(); } catch {}
      try { node?.disconnect?.(); } catch {}
    };

    stopNode(lowBed?.primary);
    stopNode(lowBed?.secondary);
    stopNode(arrival?.primary);
    stopNode(arrival?.secondary);
    stopNode(signal?.primary);
    stopNode(signal?.secondary);
    stopNode(membrane?.primary);
    stopNode(membrane?.secondary);
    stopNode(portal?.primary);
    stopNode(portal?.secondary);
    stopNode(air?.source);

    try { lowBed?.output?.disconnect?.(); } catch {}
    try { arrival?.output?.disconnect?.(); } catch {}
    try { signal?.output?.disconnect?.(); } catch {}
    try { membrane?.output?.disconnect?.(); } catch {}
    try { portal?.output?.disconnect?.(); } catch {}
    try { air?.output?.disconnect?.(); } catch {}
    try { master?.disconnect?.(); } catch {}

    try { await ctx.close(); } catch {}

    ctx = null;
    master = null;
    ready = false;
  };

  return {
    resume,
    setRoomState,
    setPortalPresence,
    setVoiceFeatures,
    update,
    dispose,
  };
}

export default createRitualSoundEngine;
