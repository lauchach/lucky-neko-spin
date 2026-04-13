import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Symbol, SCATTER_SYMBOL } from "@/lib/slotEngine";

interface SlotReelProps {
  symbols: Symbol[];
  spinning: boolean;
  delay: number;
  finalSymbols: Symbol[];
  winningRows?: number[];
  hasWin?: boolean;
  matchCount?: number;
  reelIndex?: number;
  stopDelayMs?: number;
  hasAnticipation?: boolean;
  scatterLandClass?: string;
}

const SlotReel = ({
  symbols,
  spinning,
  delay,
  finalSymbols,
  winningRows = [],
  hasWin = false,
  matchCount = 0,
  reelIndex = 0,
  stopDelayMs = 2000,
  hasAnticipation = false,
  scatterLandClass,
}: SlotReelProps) => {
  const [localSpinning, setLocalSpinning] = useState(false);

  useEffect(() => {
    if (spinning) {
      setLocalSpinning(true);
      return;
    }

    const timeout = setTimeout(() => setLocalSpinning(false), stopDelayMs);
    return () => clearTimeout(timeout);
  }, [spinning, stopDelayMs]);

  const displaySymbols = localSpinning ? [...symbols, ...symbols, ...symbols] : finalSymbols;
  const showWinState = !localSpinning && !spinning && hasWin;

  // Slow down animation when in anticipation mode
  const spinDuration = hasAnticipation && !spinning ? 0.6 : 0.3;

  return (
    <div className={`relative w-16 sm:w-20 h-48 sm:h-56 overflow-hidden rounded-lg bg-muted/50 border-2 border-gold/30 reel-mask ${localSpinning && hasAnticipation ? 'reel-anticipation' : ''}`}>
      <motion.div
        key={localSpinning ? "spinning" : `final-${finalSymbols.join("")}`}
        className="flex flex-col items-center"
        initial={{ y: 0 }}
        animate={localSpinning ? { y: [0, -1200] } : { y: 0 }}
        transition={localSpinning ? {
          y: {
            duration: spinDuration,
            repeat: Infinity,
            ease: "linear",
          },
        } : {
          duration: 0,
        }}
      >
        {displaySymbols.map((symbol, i) => {
          const isScatter = symbol === SCATTER_SYMBOL;
          const isWinningCell = showWinState && winningRows.includes(i) && reelIndex < matchCount;
          const isDimmed = showWinState && !isWinningCell && !isScatter;

          // Apply scatter landing class only to scatter symbols in final state
          const landingClass = !localSpinning && !spinning && isScatter && scatterLandClass ? scatterLandClass : '';

          return (
            <div
              key={`${symbol}-${i}`}
              className={`flex items-center justify-center w-16 sm:w-20 h-16 sm:h-[4.67rem] text-3xl sm:text-4xl select-none transition-all duration-500
                ${isWinningCell ? "win-cell" : ""}
                ${isDimmed ? "opacity-30 scale-90" : ""}
                ${isScatter && !localSpinning && !landingClass ? "scatter-symbol" : ""}
                ${landingClass}
              `}
            >
              {symbol}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default SlotReel;
