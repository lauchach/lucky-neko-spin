// Web Audio API synthesized sound effects for the slot machine

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

// Resume audio context on first user interaction (autoplay policy)
export function resumeAudio() {
  const ctx = getCtx();
  if (ctx.state === "suspended") {
    ctx.resume();
  }
}

/**
 * Slot reel spinning — a rhythmic clicking/ticking sound
 * Returns a stop function to end the loop
 */
export function playSpinSound(): () => void {
  const ctx = getCtx();
  let running = true;
  let timeout: number;

  const tick = () => {
    if (!running) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "square";
    osc.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.03);

    timeout = window.setTimeout(tick, 60);
  };

  tick();

  return () => {
    running = false;
    clearTimeout(timeout);
  };
}

/**
 * Reel stop — a satisfying "clunk" per reel
 */
export function playReelStop() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "triangle";
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
}

/**
 * Win sound — ascending arpeggio
 */
export function playWinSound() {
  const ctx = getCtx();
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    const startTime = ctx.currentTime + i * 0.12;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

    osc.start(startTime);
    osc.stop(startTime + 0.3);
  });
}

/**
 * Jackpot sound — dramatic fanfare with harmonics
 */
export function playJackpotSound() {
  const ctx = getCtx();

  // Fanfare notes
  const melody = [
    { freq: 523, time: 0 },      // C5
    { freq: 659, time: 0.15 },    // E5
    { freq: 784, time: 0.3 },     // G5
    { freq: 1047, time: 0.5 },    // C6
    { freq: 784, time: 0.7 },     // G5
    { freq: 1047, time: 0.85 },   // C6
    { freq: 1319, time: 1.1 },    // E6
    { freq: 1568, time: 1.4 },    // G6
  ];

  melody.forEach(({ freq, time }) => {
    // Main tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "square";
    const startTime = ctx.currentTime + time;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.1, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

    osc.start(startTime);
    osc.stop(startTime + 0.4);

    // Harmonic layer
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 2, startTime);

    gain2.gain.setValueAtTime(0, startTime);
    gain2.gain.linearRampToValueAtTime(0.05, startTime + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

    osc2.start(startTime);
    osc2.stop(startTime + 0.35);
  });

  // Shimmer sweep
  const noise = ctx.createOscillator();
  const noiseGain = ctx.createGain();
  noise.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.type = "sawtooth";
  noise.frequency.setValueAtTime(2000, ctx.currentTime);
  noise.frequency.exponentialRampToValueAtTime(8000, ctx.currentTime + 1.8);
  noiseGain.gain.setValueAtTime(0.02, ctx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
  noise.start(ctx.currentTime);
  noise.stop(ctx.currentTime + 1.8);
}

/**
 * Coin insert / bet change click
 */
export function playClickSound() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "sine";
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
}
