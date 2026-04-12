import { motion, AnimatePresence } from "framer-motion";

interface FreeSpinOverlayProps {
  show: boolean;
  freeSpinsRemaining: number;
  totalFreeSpinWin: number;
  isIntro: boolean;
  freeSpinsAwarded: number;
}

const FreeSpinOverlay = ({ show, freeSpinsRemaining, totalFreeSpinWin, isIntro, freeSpinsAwarded }: FreeSpinOverlayProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 bg-background/85 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="text-center p-8 rounded-2xl border-2 border-primary/40"
            style={{
              background: 'linear-gradient(135deg, hsl(0 70% 15%), hsl(0 60% 20%), hsl(45 40% 15%))',
              boxShadow: '0 0 60px hsl(45 100% 50% / 0.3), inset 0 0 30px hsl(45 100% 50% / 0.1)',
            }}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ type: "spring", damping: 15 }}
          >
            {isIntro ? (
              <>
                <motion.div
                  className="text-6xl sm:text-8xl mb-4"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  🎆
                </motion.div>
                <h2 className="font-display text-3xl sm:text-5xl font-bold text-primary animate-glow-pulse">
                  FREE SPIN!
                </h2>
                <p className="font-display text-xl sm:text-2xl text-accent mt-3">
                  {freeSpinsAwarded} Free Spins!
                </p>
              </>
            ) : (
              <>
                <h2 className="font-display text-3xl sm:text-5xl font-bold text-primary animate-glow-pulse mb-3">
                  Free Spin Complete!
                </h2>
                <p className="font-display text-2xl sm:text-3xl text-accent">
                  Total Win: +{totalFreeSpinWin.toLocaleString()}
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FreeSpinOverlay;
