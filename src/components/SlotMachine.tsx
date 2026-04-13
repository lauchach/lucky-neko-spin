import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SlotReel from "./SlotReel";
import FreeSpinOverlay from "./FreeSpinOverlay";
import DevPanel from "./DevPanel";
import { spin, generateReelStrip, SCATTER_SYMBOL, type Symbol, type SlotResult, type ForceMode } from "@/lib/slotEngine";
import { resumeAudio, playSpinSound, playReelStop, playWinSound, playJackpotSound, playClickSound, setMusicVolume, setSfxVolume, playScatterLand, playScatterAnticipation, playScatterExplosion } from "@/lib/sounds";
import { Volume2, VolumeX, Music, Music2 } from "lucide-react";

/** Find which reel indices contain at least one scatter */
function getScatterReelIndices(reels: Symbol[][]): number[] {
  const indices: number[] = [];
  for (let i = 0; i < reels.length; i++) {
    if (reels[i].some(s => s === SCATTER_SYMBOL)) {
      indices.push(i);
    }
  }
  return indices;
}

/** Calculate per-reel stop delays with scatter anticipation */
function calcReelStopDelays(scatterReels: number[]): number[] {
  const BASE = 600;
  const REEL_GAP = 300;
  const delays = [0, 1, 2, 3, 4].map(i => BASE + i * REEL_GAP);

  if (scatterReels.length < 2) return delays;

  // Sort scatter reel indices
  const sorted = [...scatterReels].sort((a, b) => a - b);

  // After 2nd scatter reel, add big delay to remaining reels for anticipation
  const secondScatterReel = sorted[1];
  for (let i = secondScatterReel + 1; i < 5; i++) {
    delays[i] += 1000; // extra 1s anticipation
  }

  return delays;
}

const SlotMachine = () => {
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState<Symbol[][]>([
    ['🐱', '🔔', '🐟'],
    ['🏮', '🐱', '🎋'],
    ['💰', '🐟', '🐱'],
    ['🔔', '🍀', '🏮'],
    ['🐈', '🐱', '💰'],
  ]);
  const [lastWin, setLastWin] = useState(0);
  const [showJackpot, setShowJackpot] = useState(false);
  const [winResult, setWinResult] = useState<SlotResult | null>(null);
  const [musicMuted, setMusicMuted] = useState(false);
  const [sfxMuted, setSfxMuted] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  // Per-reel stop delays and scatter info
  const [reelStopDelays, setReelStopDelays] = useState<number[]>([600, 900, 1200, 1500, 1800]);
  const [scatterReelIndices, setScatterReelIndices] = useState<number[]>([]);
  const [scatterLandClasses, setScatterLandClasses] = useState<Record<number, string>>({});

  // Free spin state
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState(0);
  const [inFreeSpin, setInFreeSpin] = useState(false);
  const [totalFreeSpinWin, setTotalFreeSpinWin] = useState(0);
  const [showFreeSpinIntro, setShowFreeSpinIntro] = useState(false);
  const [showFreeSpinEnd, setShowFreeSpinEnd] = useState(false);
  const [freeSpinsAwarded, setFreeSpinsAwarded] = useState(0);

  const reelStrips = useRef(Array.from({ length: 5 }, () => generateReelStrip(30)));
  const stopSpinSound = useRef<(() => void) | null>(null);
  const stopAnticipation = useRef<(() => void) | null>(null);
  const nextForceMode = useRef<ForceMode>('none');

  const doSpin = useCallback((isFree: boolean) => {
    if (spinning) return;
    if (!isFree && balance < bet) return;

    resumeAudio();
    if (!isFree) {
      setBalance(prev => prev - bet);
    }
    setSpinning(true);
    setLastWin(0);
    setWinResult(null);
    setScatterLandClasses({});
    setScreenShake(false);
    setShowFlash(false);

    stopSpinSound.current = playSpinSound();

    const result = spin(bet, nextForceMode.current);
    nextForceMode.current = 'none';

    const scatterReels = getScatterReelIndices(result.reels);
    const delays = calcReelStopDelays(scatterReels);
    setReelStopDelays(delays);
    setScatterReelIndices(scatterReels);

    // Schedule reel stop sounds and scatter land effects
    const sortedScatterReels = [...scatterReels].sort((a, b) => a - b);
    let scatterCount = 0;

    for (let i = 0; i < 5; i++) {
      const isScatterReel = scatterReels.includes(i);
      
      setTimeout(() => {
        playReelStop();
      }, delays[i]);

      if (isScatterReel) {
        const scatterIdx = scatterCount;
        scatterCount++;

        setTimeout(() => {
          if (scatterIdx >= 2) {
            // 3rd+ scatter: EXPLOSION
            playScatterExplosion();
            setScreenShake(true);
            setShowFlash(true);
            setTimeout(() => {
              setScreenShake(false);
              setShowFlash(false);
            }, 600);
            setScatterLandClasses(prev => ({ ...prev, [i]: 'scatter-land-explosive' }));
          } else {
            playScatterLand(scatterIdx);
            setScatterLandClasses(prev => ({ ...prev, [i]: 'scatter-land' }));
          }
        }, delays[i] + 50);
      }
    }

    // Start anticipation sound after 2nd scatter lands (if there could be a 3rd)
    if (sortedScatterReels.length >= 3) {
      const secondScatterDelay = delays[sortedScatterReels[1]];
      setTimeout(() => {
        stopAnticipation.current = playScatterAnticipation();
      }, secondScatterDelay + 100);
    }

    // Use the max delay for the final timeout
    const maxDelay = Math.max(...delays);

    setTimeout(() => {
      stopSpinSound.current?.();
      stopSpinSound.current = null;
      stopAnticipation.current?.();
      stopAnticipation.current = null;

      setSpinning(false);
      setReels(result.reels);

      if (result.winAmount > 0) {
        setLastWin(result.winAmount);
        setBalance(prev => prev + result.winAmount);
        setWinResult(result);

        if (isFree) {
          setTotalFreeSpinWin(prev => prev + result.winAmount);
        }

        if (result.isJackpot) {
          setTimeout(() => playJackpotSound(), 200);
          setShowJackpot(true);
          setTimeout(() => setShowJackpot(false), 3000);
        } else {
          setTimeout(() => playWinSound(), 200);
        }
      }

      // Handle free spins trigger
      if (result.freeSpinsAwarded > 0) {
        const wasAlreadyFree = isFree;
        setFreeSpinsAwarded(result.freeSpinsAwarded);
        setFreeSpinsRemaining(prev => prev + result.freeSpinsAwarded);
        if (!wasAlreadyFree) {
          setInFreeSpin(true);
          setTotalFreeSpinWin(result.winAmount);
        }
        setShowFreeSpinIntro(true);
        setTimeout(() => setShowFreeSpinIntro(false), 2500);
      } else if (isFree) {
        setFreeSpinsRemaining(prev => {
          const next = prev - 1;
          if (next <= 0) {
            setTimeout(() => {
              setShowFreeSpinEnd(true);
              setTimeout(() => {
                setShowFreeSpinEnd(false);
                setInFreeSpin(false);
                setTotalFreeSpinWin(0);
              }, 3000);
            }, 500);
          }
          return next;
        });
      }
    }, maxDelay + 200);
  }, [spinning, balance, bet]);

  const handleSpin = useCallback(() => {
    doSpin(inFreeSpin);
  }, [doSpin, inFreeSpin]);

  // Auto-spin during free spins
  useEffect(() => {
    if (inFreeSpin && !spinning && freeSpinsRemaining > 0 && !showFreeSpinIntro && !showFreeSpinEnd) {
      const timer = setTimeout(() => doSpin(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [inFreeSpin, spinning, freeSpinsRemaining, showFreeSpinIntro, showFreeSpinEnd, doSpin]);

  useEffect(() => {
    return () => {
      stopSpinSound.current?.();
      stopAnticipation.current?.();
    };
  }, []);

  const adjustBet = (delta: number) => {
    playClickSound();
    resumeAudio();
    setBet(prev => Math.max(1, Math.min(100, prev + delta)));
  };

  const getMatchCountForLine = (row: number): number => {
    if (!winResult) return 0;
    const rowSymbols = winResult.reels.map(r => r[row]);
    const first = rowSymbols[0];
    let count = 1;
    for (let i = 1; i < rowSymbols.length; i++) {
      if (rowSymbols[i] === first) count++;
      else break;
    }
    return count >= 3 ? count : 0;
  };

  const winningLines = winResult?.winningLines ?? [];
  const hasWin = winningLines.length > 0;

  const matchCountPerLine: Record<number, number> = {};
  winningLines.forEach(row => {
    matchCountPerLine[row] = getMatchCountForLine(row);
  });

  const maxMatchCount = Math.max(0, ...Object.values(matchCountPerLine));

  const toggleMusic = () => {
    resumeAudio();
    const next = !musicMuted;
    setMusicMuted(next);
    setMusicVolume(next ? 0 : 1);
  };

  const toggleSfx = () => {
    resumeAudio();
    const next = !sfxMuted;
    setSfxMuted(next);
    setSfxVolume(next ? 0 : 1);
  };

  return (
    <div className={`flex flex-col items-center gap-4 sm:gap-6 w-full max-w-xl mx-auto px-4 ${screenShake ? 'screen-shake' : ''}`}>
      {/* Dev Panel */}
      <DevPanel
        onForceMode={(mode) => {
          nextForceMode.current = mode;
          if (!spinning && !inFreeSpin) doSpin(false);
        }}
        disabled={spinning || inFreeSpin}
      />
      {/* Title + Sound Controls */}
      <div className="flex items-center justify-between w-full">
        <div className="w-20" />
        <motion.h1
          className="font-display text-3xl sm:text-5xl font-bold text-primary animate-glow-pulse tracking-wider"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Lucky Neko
        </motion.h1>
        <div className="flex items-center gap-2 w-20 justify-end">
          <button
            onClick={toggleMusic}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
            title={musicMuted ? "เปิดเพลง" : "ปิดเพลง"}
          >
            {musicMuted ? <Music className="w-4 h-4 opacity-40" /> : <Music2 className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleSfx}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
            title={sfxMuted ? "เปิดเสียงเกม" : "ปิดเสียงเกม"}
          >
            {sfxMuted ? <VolumeX className="w-4 h-4 opacity-40" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Free Spin Banner */}
      <AnimatePresence>
        {inFreeSpin && (
          <motion.div
            className="w-full text-center py-2 px-4 rounded-lg border border-primary/40"
            style={{ background: 'linear-gradient(90deg, hsl(280 60% 20%), hsl(320 50% 25%), hsl(280 60% 20%))' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span className="font-display text-sm sm:text-base text-primary font-bold tracking-wider">
              🎆 FREE SPIN — {freeSpinsRemaining} remaining | Win: {totalFreeSpinWin.toLocaleString()}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Balance */}
      <div className="flex items-center gap-4 sm:gap-8 w-full justify-between">
        <div className="flex flex-col items-center">
          <span className="text-xs sm:text-sm text-muted-foreground uppercase tracking-widest">Balance</span>
          <span className="font-display text-xl sm:text-2xl font-bold text-primary">{balance.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs sm:text-sm text-muted-foreground uppercase tracking-widest">Last Win</span>
          <motion.span
            key={lastWin}
            className="font-display text-xl sm:text-2xl font-bold text-accent"
            initial={lastWin > 0 ? { scale: 2 } : {}}
            animate={{ scale: 1 }}
          >
            {lastWin.toLocaleString()}
          </motion.span>
        </div>
      </div>

      {/* Slot Machine Frame */}
      <div className={`relative p-3 sm:p-4 rounded-2xl red-gradient shadow-2xl border border-gold/20 ${inFreeSpin ? 'freespin-active' : ''}`}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

        {/* Flash overlay for scatter explosion */}
        {showFlash && (
          <div className="absolute inset-0 rounded-2xl scatter-flash z-40" />
        )}

        {/* Reels Container */}
        <div className="relative flex gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl bg-background/90 backdrop-blur border border-border">
          {reels.map((reelSymbols, i) => (
            <SlotReel
              key={i}
              symbols={reelStrips.current[i]}
              spinning={spinning}
              delay={i * 0.1}
              finalSymbols={reelSymbols}
              winningRows={winningLines}
              hasWin={hasWin}
              matchCount={maxMatchCount}
              reelIndex={i}
              stopDelayMs={reelStopDelays[i]}
              hasAnticipation={scatterReelIndices.length >= 2 && i > scatterReelIndices.sort((a, b) => a - b)[1]}
              scatterLandClass={scatterLandClasses[i]}
            />
          ))}

          {/* Payline overlays */}
          <AnimatePresence>
            {!spinning && winningLines.map(row => {
              const count = matchCountPerLine[row] || 0;
              const rowPercent = ((row + 0.5) / 3) * 100;

              return (
                <motion.div
                  key={`payline-${row}`}
                  className="absolute left-3 sm:left-4 pointer-events-none"
                  style={{
                    top: `${rowPercent}%`,
                    right: `calc(${((5 - count) / 5) * 100}% + 0.75rem)`,
                  }}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  exit={{ scaleX: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="h-[3px] payline-glow origin-left" />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Win line indicator */}
        <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-0.5 bg-primary/30 pointer-events-none" />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 sm:gap-6 w-full justify-center">
        <div className="flex items-center gap-2">
          <button
            onClick={() => adjustBet(-5)}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full red-gradient flex items-center justify-center text-secondary-foreground font-bold text-lg hover:brightness-110 transition-all"
            disabled={spinning || inFreeSpin}
          >
            −
          </button>
          <div className="flex flex-col items-center min-w-[60px]">
            <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest">Bet</span>
            <span className="font-display text-lg sm:text-xl font-bold text-foreground">{bet}</span>
          </div>
          <button
            onClick={() => adjustBet(5)}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full red-gradient flex items-center justify-center text-secondary-foreground font-bold text-lg hover:brightness-110 transition-all"
            disabled={spinning || inFreeSpin}
          >
            +
          </button>
        </div>

        <motion.button
          onClick={handleSpin}
          disabled={spinning || (!inFreeSpin && balance < bet) || inFreeSpin}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full gold-gradient flex items-center justify-center shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: spinning ? 1 : 1.05 }}
          whileTap={{ scale: spinning ? 1 : 0.95 }}
        >
          <motion.span
            className="font-display text-base sm:text-lg font-bold text-primary-foreground tracking-wider"
            animate={spinning ? { rotate: 360 } : { rotate: 0 }}
            transition={spinning ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
          >
            {spinning ? "🐱" : inFreeSpin ? "FREE" : "SPIN"}
          </motion.span>
        </motion.button>

        <button
          onClick={() => { playClickSound(); resumeAudio(); setBet(100); }}
          className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg red-gradient text-secondary-foreground text-xs sm:text-sm font-bold uppercase tracking-wider hover:brightness-110 transition-all"
          disabled={spinning || inFreeSpin}
        >
          Max
        </button>
      </div>

      {/* Jackpot Overlay */}
      <AnimatePresence>
        {showJackpot && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <motion.div
                className="text-7xl sm:text-9xl mb-4"
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                🐱
              </motion.div>
              <h2 className="font-display text-4xl sm:text-6xl font-bold text-primary animate-glow-pulse">
                JACKPOT!
              </h2>
              <p className="font-display text-2xl sm:text-3xl text-accent mt-2">
                +{lastWin.toLocaleString()}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Free Spin Overlays */}
      <FreeSpinOverlay
        show={showFreeSpinIntro}
        freeSpinsRemaining={freeSpinsRemaining}
        totalFreeSpinWin={totalFreeSpinWin}
        isIntro={true}
        freeSpinsAwarded={freeSpinsAwarded}
      />
      <FreeSpinOverlay
        show={showFreeSpinEnd}
        freeSpinsRemaining={0}
        totalFreeSpinWin={totalFreeSpinWin}
        isIntro={false}
        freeSpinsAwarded={0}
      />
    </div>
  );
};

export default SlotMachine;
