import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bug } from "lucide-react";
import type { ForceMode } from "@/lib/slotEngine";

interface DevPanelProps {
  onForceMode: (mode: ForceMode) => void;
  disabled: boolean;
}

const modes: { mode: ForceMode; label: string; color: string }[] = [
  { mode: 'freespin', label: '🎆 Free Spin', color: 'hsl(280 60% 50%)' },
  { mode: 'jackpot', label: '🐱 Jackpot', color: 'hsl(45 100% 50%)' },
  { mode: 'bigwin', label: '💰 Big Win', color: 'hsl(120 60% 40%)' },
  { mode: 'smallwin', label: '🍀 Small Win', color: 'hsl(160 50% 40%)' },
  { mode: '1line', label: '1️⃣ 1 Line', color: 'hsl(200 60% 45%)' },
  { mode: '2line', label: '2️⃣ 2 Lines', color: 'hsl(220 60% 50%)' },
  { mode: '3line', label: '3️⃣ 3 Lines', color: 'hsl(260 60% 50%)' },
];

const DevPanel = ({ onForceMode, disabled }: DevPanelProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-4 right-4 z-[100]">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="w-10 h-10 rounded-full bg-muted/80 backdrop-blur border border-border flex items-center justify-center hover:bg-muted transition-colors"
        title="Dev Tools"
      >
        <Bug className="w-5 h-5 text-muted-foreground" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute top-12 right-0 w-48 rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-2xl p-3 flex flex-col gap-2"
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
          >
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-1">
              Dev — Force Next Spin
            </span>
            {modes.map(({ mode, label, color }) => (
              <button
                key={mode}
                onClick={() => { onForceMode(mode); setOpen(false); }}
                disabled={disabled}
                className="text-left text-xs font-medium py-2 px-3 rounded-lg hover:brightness-125 transition-all disabled:opacity-40"
                style={{ background: `${color}22`, color }}
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DevPanel;
