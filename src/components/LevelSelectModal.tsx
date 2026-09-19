import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, CheckCircle2 } from 'lucide-react';
import { LevelData } from '../types';

interface LevelSelectModalProps {
  isOpen: boolean;
  levels: LevelData[];
  currentLevelId: number;
  completedLevels: number[];
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  levels,
  currentLevelId,
  completedLevels,
  onSelectLevel,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="level-select-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4"
      >
        <motion.div
          id="level-select-card"
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg max-h-[85dvh] flex flex-col rounded-2xl border border-white/20 bg-[#0d0f18] p-4 sm:p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div>
              <div className="text-xs font-display tracking-[0.2em] text-cyan-400 uppercase font-semibold">
                Chamber Matrix
              </div>
              <h3 className="text-lg sm:text-xl font-display font-bold text-white">
                Select Level (1 – 10)
              </h3>
            </div>
            <button
              id="btn-close-level-select"
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Responsive Level Matrix Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5 my-2 overflow-y-auto pr-1">
            {levels.map((lvl) => {
              const isCurrent = lvl.id === currentLevelId;
              const isCompleted = completedLevels.includes(lvl.id);

              return (
                <button
                  key={lvl.id}
                  id={`btn-select-level-${lvl.id}`}
                  onClick={() => {
                    onSelectLevel(lvl.id);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between min-h-[72px] sm:min-h-[80px] ${
                    isCurrent
                      ? 'border-cyan-400 bg-cyan-950/40 text-white shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/50'
                      : isCompleted
                      ? 'border-emerald-500/30 bg-emerald-950/20 text-neutral-200 hover:bg-white/[0.08]'
                      : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-display font-black text-xs ${
                        isCurrent
                          ? 'bg-gradient-to-tr from-[#ff3366] to-[#00d4ff] text-white shadow-sm'
                          : 'bg-white/10 text-neutral-300'
                      }`}
                    >
                      {String(lvl.id).padStart(2, '0')}
                    </span>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-400/30">
                        NOW
                      </span>
                    ) : (
                      <Play className="w-3.5 h-3.5 text-neutral-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-display font-bold text-xs sm:text-sm truncate text-white">
                      {lvl.title}
                    </div>
                    <div className="text-[10px] text-neutral-400 truncate">
                      {lvl.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="text-center pt-2 mt-auto shrink-0 border-t border-white/10">
            <p className="text-[11px] text-neutral-400 font-mono">
              Two Directions. One Way Forward.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
