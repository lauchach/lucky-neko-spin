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
 * Background music — fun Chinese-style pentatonic piano melody
 */
function startBackgroundMusic() {
  const ctx = getCtx();
  const dest = getMusicDest();

  // Chinese pentatonic scale (宮商角徵羽) in multiple octaves
  const scaleBase = [262, 294, 330, 392, 440]; // C D E G A
  const scaleHigh = scaleBase.map(f => f * 2);
  const allNotes = [...scaleBase, ...scaleHigh];

  // Pre-composed melodic phrases that sound Chinese/festive
  const phrases = [
    // phrase 1 — bouncy ascending
    [392, 440, 524, 588, 524, 440, 392],
    // phrase 2 — descending playful
    [784, 660, 524, 440, 392, 440, 524],
    // phrase 3 — call-and-response
    [524, 588, 660, 524, 392, 440, 392],
    // phrase 4 — festive jump
    [392, 524, 440, 660, 524, 784, 660],
    // phrase 5 — resolving
    [660, 524, 440, 392, 330, 392, 440],
    // phrase 6 — fast ornament
    [524, 588, 524, 440, 524, 660, 524],
  ];

  let phraseIndex = 0;
  let noteInPhrase = 0;

  const playNote = () => {
    const phrase = phrases[phraseIndex % phrases.length];
    const freq = phrase[noteInPhrase];
    const t = ctx.currentTime;

    // Piano-like tone: sine + slight harmonic for brightness
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, t);

    // Piano envelope: quick attack, natural decay
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.06, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.03, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc.start(t);
    osc.stop(t + 0.6);

    // Bright harmonic overtone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(dest);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 3, t);
    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(0.008, t + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc2.start(t);
    osc2.stop(t + 0.3);

    noteInPhrase++;
    if (noteInPhrase >= phrase.length) {
      noteInPhrase = 0;
      phraseIndex++;
    }

    // Varying rhythm: mix of 8th and 16th note feel
    const isQuick = Math.random() > 0.6;
    const delay = isQuick ? 150 : 280;
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
