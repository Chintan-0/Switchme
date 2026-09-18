import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, ArrowLeft, Space, RefreshCw } from 'lucide-react';

interface ControlsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlsGuideModal: React.FC<ControlsGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="controls-guide-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      >
        <motion.div
          id="controls-guide-card"
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-2xl border border-white/20 bg-[#0d0f18] p-6 shadow-2xl relative"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xs font-display tracking-[0.2em] text-cyan-400 uppercase font-semibold">
                Solo Mode Handbook
              </div>
              <h3 className="text-xl font-display font-bold text-white">
                How To Play
              </h3>
            </div>
            <button
              id="btn-close-controls-guide"
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3.5 mb-6 text-sm">
            {/* Rule 1: Red */}
            <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/20 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold shrink-0">
                🔴
              </div>
              <div>
                <div className="font-display font-bold text-rose-300">
                  1. Red Moves ONLY Right
                </div>
                <div className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">D</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">→</kbd>. Red cannot move left under any circumstances.
                </div>
              </div>
            </div>

            {/* Rule 2: Blue */}
            <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold shrink-0">
                🔵
              </div>
              <div>
                <div className="font-display font-bold text-cyan-300">
                  2. Blue Moves ONLY Left
                </div>
                <div className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">A</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">←</kbd>. Blue cannot move right under any circumstances.
                </div>
              </div>
            </div>

            {/* Rule 3: Jump */}
            <div className="p-3.5 rounded-xl border border-white/15 bg-white/[0.03] flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold shrink-0">
                <Space className="w-5 h-5 text-neutral-200" />
              </div>
              <div>
                <div className="font-display font-bold text-white">
                  3. Space to Jump
                </div>
                <div className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">SPACE</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">W</kbd>. Hold longer for maximum height; release early for short hops.
                </div>
              </div>
            </div>

            {/* Rule 4: Color Switch */}
            <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-950/20 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold shrink-0">
                <RefreshCw className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <div className="font-display font-bold text-purple-300">
                  4. The Color Switch Vortex
                </div>
                <div className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
                  Entering the vortex changes Red ↔ Blue, flipping your movement direction instantly!
                </div>
              </div>
            </div>

            {/* Rule 5: Speed Boost Floor Tiles */}
            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold shrink-0">
                ⚡
              </div>
              <div>
                <div className="font-display font-bold text-amber-300">
                  5. Speed Boost Tiles
                </div>
                <div className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
                  Glows crimson for Red (propels Right) and electric cyan for Blue (propels Left). Leap off them to clear huge chasms!
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-400 pt-1 border-t border-white/10">
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">R</kbd> to restart anytime
            </span>
            <button
              id="btn-dismiss-guide"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 font-display text-white text-xs font-semibold cursor-pointer"
            >
              Got It
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
