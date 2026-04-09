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

  useEffect(() => {
    if (spinning) {
      setLocalSpinning(true);
    } else {
      // Delay content switch to match animation delay
      const timeout = setTimeout(() => setLocalSpinning(false), delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [spinning, delay]);

  const displaySymbols = localSpinning ? symbols : finalSymbols;

  return (
    <div className="relative w-16 sm:w-20 h-48 sm:h-56 overflow-hidden rounded-lg bg-muted/50 border-2 border-gold/30 reel-mask">
      <motion.div
        className="flex flex-col items-center"
        animate={localSpinning ? {
          y: [0, -1200],
        } : {
          y: 0,
        }}
        transition={localSpinning ? {
          y: {
            duration: 0.3,
            repeat: Infinity,
            ease: "linear",
          },
        } : {
          y: {
            type: "spring",
            stiffness: 200,
            damping: 30,
          },
        }}
      >
        {(localSpinning ? [...symbols, ...symbols, ...symbols] : displaySymbols).map((symbol, i) => (
          <div
            key={i}
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
