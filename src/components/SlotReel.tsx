import { motion } from "framer-motion";
import { Symbol } from "@/lib/slotEngine";

interface SlotReelProps {
  symbols: Symbol[];
  spinning: boolean;
  delay: number;
  finalSymbols: Symbol[];
}

const SlotReel = ({ symbols, spinning, delay, finalSymbols }: SlotReelProps) => {
  const displaySymbols = spinning ? symbols : finalSymbols;

  return (
    <div className="relative w-16 sm:w-20 h-48 sm:h-56 overflow-hidden rounded-lg bg-muted/50 border-2 border-gold/30 reel-mask">
      <motion.div
        className="flex flex-col items-center"
        animate={spinning ? {
          y: [0, -1200],
        } : {
          y: 0,
        }}
        transition={spinning ? {
          y: {
            duration: 0.3,
            repeat: Infinity,
            ease: "linear",
            delay,
          },
        } : {
          y: {
            type: "spring",
            stiffness: 200,
            damping: 30,
            delay,
          },
        }}
      >
        {(spinning ? [...symbols, ...symbols, ...symbols] : displaySymbols).map((symbol, i) => (
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
