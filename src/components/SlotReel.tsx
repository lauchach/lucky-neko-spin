import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Symbol } from "@/lib/slotEngine";

interface SlotReelProps {
  symbols: Symbol[];
  spinning: boolean;
  delay: number;
  finalSymbols: Symbol[];
}

const SlotReel = ({ symbols, spinning, delay, finalSymbols }: SlotReelProps) => {
  const [localSpinning, setLocalSpinning] = useState(false);
  const stopDelayMs = Math.round(delay * 1000);

  useEffect(() => {
    if (spinning) {
      setLocalSpinning(true);
      return;
    }

    const timeout = setTimeout(() => setLocalSpinning(false), stopDelayMs);
    return () => clearTimeout(timeout);
  }, [spinning, stopDelayMs]);

  const displaySymbols = localSpinning ? [...symbols, ...symbols, ...symbols] : finalSymbols;

  return (
    <div className="relative w-16 sm:w-20 h-48 sm:h-56 overflow-hidden rounded-lg bg-muted/50 border-2 border-gold/30 reel-mask">
      <motion.div
        key={localSpinning ? "spinning" : `final-${finalSymbols.join("")}`}
        className="flex flex-col items-center"
        initial={{ y: 0 }}
        animate={localSpinning ? { y: [0, -1200] } : { y: 0 }}
        transition={localSpinning ? {
          y: {
            duration: 0.3,
            repeat: Infinity,
            ease: "linear",
          },
        } : {
          duration: 0,
        }}
      >
        {displaySymbols.map((symbol, i) => (
          <div
            key={`${symbol}-${i}`}
            className="flex items-center justify-center w-16 sm:w-20 h-16 sm:h-[4.67rem] text-3xl sm:text-4xl select-none"
          >
            {symbol}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default SlotReel;
