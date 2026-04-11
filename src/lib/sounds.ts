// Web Audio API synthesized sound effects for the slot machine

let audioCtx: AudioContext | null = null;
let musicGainNode: GainNode | null = null;
let sfxGainNode: GainNode | null = null;
let musicPlaying = false;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    musicGainNode = audioCtx.createGain();
    musicGainNode.connect(audioCtx.destination);
    sfxGainNode = audioCtx.createGain();
    sfxGainNode.connect(audioCtx.destination);
  }
  return audioCtx;
}

export function getSfxDest(): GainNode {
  getCtx();
  return sfxGainNode!;
}

export function getMusicDest(): GainNode {
  getCtx();
  return musicGainNode!;
}

export function setMusicVolume(v: number) {
  const dest = getMusicDest();
  dest.gain.setValueAtTime(v, getCtx().currentTime);
}

export function setSfxVolume(v: number) {
  const dest = getSfxDest();
  dest.gain.setValueAtTime(v, getCtx().currentTime);
}

// Resume audio context on first user interaction (autoplay policy)
export function resumeAudio() {
  const ctx = getCtx();
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  if (!musicPlaying) {
    startBackgroundMusic();
    musicPlaying = true;
  }
}

/**
 * Background music — Chinese festive style with erhu, guzheng, and percussion feel
 */
function startBackgroundMusic() {
  const ctx = getCtx();
  const dest = getMusicDest();

  // Chinese pentatonic: C D E G A across octaves
  const phrases = [
    [392, 440, 524, 660, 784, 660, 524, 440],
    [784, 660, 524, 440, 392, 330, 392, 440],
    [524, 660, 784, 880, 784, 660, 524, 392],
    [440, 524, 392, 330, 392, 524, 660, 524],
    [660, 784, 880, 784, 660, 524, 440, 524],
    [392, 524, 660, 524, 440, 392, 330, 392],
  ];

  let phraseIdx = 0;
  let noteIdx = 0;
  let beat = 0;

  const playNote = () => {
    const phrase = phrases[phraseIdx % phrases.length];
    const freq = phrase[noteIdx];
    const t = ctx.currentTime;

    // === Erhu-like lead (sawtooth + vibrato) ===
    const erhu = ctx.createOscillator();
    const erhuGain = ctx.createGain();
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();

    // Vibrato modulation
    vibrato.frequency.setValueAtTime(5.5, t);
    vibratoGain.gain.setValueAtTime(8, t);
    vibrato.connect(vibratoGain);
    vibratoGain.connect(erhu.frequency);

    erhu.connect(erhuGain);
    erhuGain.connect(dest);
    erhu.type = "sawtooth";
    erhu.frequency.setValueAtTime(freq, t);

    // Erhu envelope — expressive slide-in
    erhuGain.gain.setValueAtTime(0, t);
    erhuGain.gain.linearRampToValueAtTime(0.04, t + 0.03);
    erhuGain.gain.linearRampToValueAtTime(0.035, t + 0.2);
    erhuGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    erhu.start(t);
    erhu.stop(t + 0.5);
    vibrato.start(t);
    vibrato.stop(t + 0.5);

    // === Guzheng-like pluck (square + fast decay, high harmonics) ===
    if (beat % 2 === 0) {
      const gz = ctx.createOscillator();
      const gzGain = ctx.createGain();
      gz.connect(gzGain);
      gzGain.connect(dest);
      gz.type = "square";
      gz.frequency.setValueAtTime(freq * 2, t);

      gzGain.gain.setValueAtTime(0, t);
      gzGain.gain.linearRampToValueAtTime(0.025, t + 0.005);
      gzGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      gz.start(t);
      gz.stop(t + 0.25);

      // Guzheng shimmer harmonic
      const gzH = ctx.createOscillator();
      const gzHGain = ctx.createGain();
      gzH.connect(gzHGain);
      gzHGain.connect(dest);
      gzH.type = "sine";
      gzH.frequency.setValueAtTime(freq * 4, t);
      gzHGain.gain.setValueAtTime(0, t);
      gzHGain.gain.linearRampToValueAtTime(0.006, t + 0.005);
      gzHGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      gzH.start(t);
      gzH.stop(t + 0.15);
    }

    // === Percussion — woodblock/drum on downbeats ===
    if (beat % 4 === 0) {
      // Woodblock click
      const wb = ctx.createOscillator();
      const wbGain = ctx.createGain();
      wb.connect(wbGain);
      wbGain.connect(dest);
      wb.type = "square";
      wb.frequency.setValueAtTime(1200, t);
      wb.frequency.exponentialRampToValueAtTime(600, t + 0.02);
      wbGain.gain.setValueAtTime(0.05, t);
      wbGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      wb.start(t);
      wb.stop(t + 0.04);
    }

    if (beat % 8 === 2) {
      // Small gong/cymbal
      const gong = ctx.createOscillator();
      const gongGain = ctx.createGain();
      gong.connect(gongGain);
      gongGain.connect(dest);
      gong.type = "triangle";
      gong.frequency.setValueAtTime(3000, t);
      gong.frequency.exponentialRampToValueAtTime(1500, t + 0.1);
      gongGain.gain.setValueAtTime(0.02, t);
      gongGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      gong.start(t);
      gong.stop(t + 0.2);
    }

    // === Bass drone on phrase changes ===
    if (noteIdx === 0) {
      const bass = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bass.connect(bassGain);
      bassGain.connect(dest);
      bass.type = "sine";
      bass.frequency.setValueAtTime(freq / 4, t);
      bassGain.gain.setValueAtTime(0, t);
      bassGain.gain.linearRampToValueAtTime(0.025, t + 0.05);
      bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      bass.start(t);
      bass.stop(t + 0.8);
    }

    noteIdx++;
    beat++;
    if (noteIdx >= phrase.length) {
      noteIdx = 0;
      phraseIdx++;
    }

    // Festive rhythm — alternating fast/slow
    const delays = [200, 180, 220, 160, 240, 200, 180, 260];
    const delay = delays[beat % delays.length];
    setTimeout(playNote, delay);
  };

  playNote();
}

/**
 * Slot reel spinning — a rhythmic soft ticking sound
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
    gain.connect(getSfxDest());

    // Softer triangle wave with lower frequency for pleasant ticking
    osc.type = "triangle";
    osc.frequency.setValueAtTime(300 + Math.random() * 150, ctx.currentTime);
    
    // Gentle envelope - softer attack and longer decay
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);

    timeout = window.setTimeout(tick, 80);
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
  gain.connect(getSfxDest());

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
    gain.connect(getSfxDest());

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
    gain.connect(getSfxDest());

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
    gain2.connect(getSfxDest());

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
  noiseGain.connect(getSfxDest());
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
  gain.connect(getSfxDest());

  osc.type = "sine";
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
}
