import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, ArrowLeft, Space, RefreshCw, Smartphone, Monitor } from 'lucide-react';

interface ControlsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlsGuideModal: React.FC<ControlsGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'touch' | 'keyboard'>('keyboard');

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 1024;
    setActiveTab(isTouch ? 'touch' : 'keyboard');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="controls-guide-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4"
      >
        <motion.div
          id="controls-guide-card"
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl border border-white/20 bg-[#0d0f18] p-5 sm:p-6 shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-display tracking-[0.2em] text-cyan-400 uppercase font-semibold">
                Solo Mode Handbook
              </div>
              <h3 className="text-lg sm:text-xl font-display font-bold text-white">
                How To Play
              </h3>
            </div>
            <button
              id="btn-close-controls-guide"
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toggle between Touch and Keyboard */}
          <div className="flex rounded-xl bg-white/5 p-1 mb-4 border border-white/10">
            <button
              onClick={() => setActiveTab('touch')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-display font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'touch'
                  ? 'bg-gradient-to-r from-rose-500/80 to-cyan-500/80 text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Touch Screen</span>
            </button>
            <button
              onClick={() => setActiveTab('keyboard')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-display font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'keyboard'
                  ? 'bg-gradient-to-r from-rose-500/80 to-cyan-500/80 text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Keyboard</span>
            </button>
          </div>

          {/* Touch Controls Guide */}
          {activeTab === 'touch' ? (
            <div className="space-y-3 mb-5 text-sm">
              {/* Touch Rule 1: Move */}
              <div className="p-3 rounded-xl border border-white/15 bg-white/[0.03] flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500/30 to-cyan-500/30 border border-white/20 flex items-center justify-center text-white font-bold shrink-0">
                  👆
                </div>
                <div>
                  <div className="font-display font-bold text-white text-sm">
                    MOVE (Bottom Left Pad)
                  </div>
                  <div className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    <span className="text-rose-400 font-bold">RED</span> → Tap & hold <span className="font-bold text-rose-300">RIGHT (→)</span>. Left is locked.<br />
                    <span className="text-cyan-400 font-bold">BLUE</span> → Tap & hold <span className="font-bold text-cyan-300">LEFT (←)</span>. Right is locked.
                  </div>
                </div>
              </div>

              {/* Touch Rule 2: Jump */}
              <div className="p-3 rounded-xl border border-white/15 bg-white/[0.03] flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold shrink-0">
                  <Space className="w-4 h-4 text-neutral-200" />
                </div>
                <div>
                  <div className="font-display font-bold text-white text-sm">
                    JUMP (Bottom Right Button)
                  </div>
                  <div className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    Tap or hold with your right thumb. Hold longer for maximum height; release early for short hops. You can jump and move simultaneously!
                  </div>
                </div>
              </div>

              {/* Touch Rule 3: Switch */}
              <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-950/20 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold shrink-0">
                  <RefreshCw className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <div className="font-display font-bold text-purple-300 text-sm">
                    SWITCH (Vortex)
                  </div>
                  <div className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    Enter any glowing Swapper Orb to reverse color: <span className="text-rose-400 font-bold">RED ⇄ BLUE</span>. Your thumb button automatically swaps to the new direction!
                  </div>
                </div>
              </div>

              {/* Touch Rule 4: Boost */}
              <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold shrink-0">
                  ⚡
                </div>
                <div>
                  <div className="font-display font-bold text-amber-300 text-sm">
                    SPEED BOOST PADS
                  </div>
                  <div className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    Fixed direction (<span className="font-mono text-amber-300">&gt;&gt;&gt;</span> or <span className="font-mono text-amber-300">&lt;&lt;&lt;</span>). Propels you at 540 px/s across chasms. Does not change your color.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 mb-5 text-sm">
              {/* Keyboard Rule 1: Red */}
              <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-950/20 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold shrink-0">
                  🔴
                </div>
                <div>
                  <div className="font-display font-bold text-rose-300 text-sm">
                    1. Red Moves ONLY Right
                  </div>
                  <div className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">D</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">→</kbd>. Red cannot move left.
                  </div>
                </div>
              </div>

              {/* Keyboard Rule 2: Blue */}
              <div className="p-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold shrink-0">
                  🔵
                </div>
                <div>
                  <div className="font-display font-bold text-cyan-300 text-sm">
                    2. Blue Moves ONLY Left
                  </div>
                  <div className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">A</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">←</kbd>. Blue cannot move right.
                  </div>
                </div>
              </div>

              {/* Keyboard Rule 3: Jump */}
              <div className="p-3 rounded-xl border border-white/15 bg-white/[0.03] flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold shrink-0">
                  <Space className="w-4 h-4 text-neutral-200" />
                </div>
                <div>
                  <div className="font-display font-bold text-white text-sm">
                    3. Jump
                  </div>
                  <div className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">SPACE</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">W</kbd>. Hold for max height.
                  </div>
                </div>
              </div>

              {/* Keyboard Rule 4: Switch */}
              <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-950/20 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold shrink-0">
                  <RefreshCw className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <div className="font-display font-bold text-purple-300 text-sm">
                    4. Color Switch Vortex
                  </div>
                  <div className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    Entering changes Red ↔ Blue, immediately flipping your allowed horizontal direction!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-neutral-400 pt-3 border-t border-white/10">
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Restart level anytime</span>
            </span>
            <button
              id="btn-dismiss-guide"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 font-display text-white text-xs font-semibold cursor-pointer active:scale-95 transition"
            >
              Got It
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
