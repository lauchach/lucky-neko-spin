import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SlotReel from "./SlotReel";
import { spin, generateReelStrip, type Symbol } from "@/lib/slotEngine";

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
  const reelStrips = useRef(Array.from({ length: 5 }, () => generateReelStrip(30)));

  const handleSpin = useCallback(() => {
    if (spinning || balance < bet) return;

    setBalance(prev => prev - bet);
    setSpinning(true);
    setLastWin(0);

    const result = spin(bet);

    setTimeout(() => {
      setSpinning(false);
      setReels(result.reels);
      if (result.winAmount > 0) {
        setLastWin(result.winAmount);
        setBalance(prev => prev + result.winAmount);
        if (result.isJackpot) {
          setShowJackpot(true);
          setTimeout(() => setShowJackpot(false), 3000);
        }
      }
    }, 2000);
  }, [spinning, balance, bet]);

  const adjustBet = (delta: number) => {
    setBet(prev => Math.max(1, Math.min(100, prev + delta)));
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-xl mx-auto px-4">
      {/* Title */}
      <motion.h1
        className="font-display text-3xl sm:text-5xl font-bold text-primary animate-glow-pulse tracking-wider"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        Lucky Neko
      </motion.h1>

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
      <div className="relative p-3 sm:p-4 rounded-2xl red-gradient shadow-2xl border border-gold/20">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

        {/* Reels Container */}
        <div className="flex gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl bg-background/90 backdrop-blur border border-border">
          {reels.map((reelSymbols, i) => (
            <SlotReel
              key={i}
              symbols={reelStrips.current[i]}
              spinning={spinning}
              delay={i * 0.1}
              finalSymbols={reelSymbols}
            />
          ))}
        </div>

        {/* Win line indicator */}
        <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-0.5 bg-primary/30 pointer-events-none" />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 sm:gap-6 w-full justify-center">
        {/* Bet Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => adjustBet(-5)}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full red-gradient flex items-center justify-center text-secondary-foreground font-bold text-lg hover:brightness-110 transition-all"
            disabled={spinning}
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
            disabled={spinning}
          >
            +
          </button>
        </div>

        {/* Spin Button */}
        <motion.button
          onClick={handleSpin}
          disabled={spinning || balance < bet}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full gold-gradient flex items-center justify-center shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: spinning ? 1 : 1.05 }}
          whileTap={{ scale: spinning ? 1 : 0.95 }}
        >
          <motion.span
            className="font-display text-base sm:text-lg font-bold text-primary-foreground tracking-wider"
            animate={spinning ? { rotate: 360 } : { rotate: 0 }}
            transition={spinning ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
          >
            {spinning ? "🐱" : "SPIN"}
          </motion.span>
        </motion.button>

        {/* Max Bet */}
        <button
          onClick={() => setBet(100)}
          className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg red-gradient text-secondary-foreground text-xs sm:text-sm font-bold uppercase tracking-wider hover:brightness-110 transition-all"
          disabled={spinning}
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
    </div>
  );
};

export default SlotMachine;
