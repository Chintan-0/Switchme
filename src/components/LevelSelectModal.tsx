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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      >
        <motion.div
          id="level-select-card"
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-2xl border border-white/20 bg-[#0d0f18] p-6 shadow-2xl relative"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-display tracking-[0.2em] text-cyan-400 uppercase font-semibold">
                Chamber Matrix
              </div>
              <h3 className="text-xl font-display font-bold text-white">
                Select Level
              </h3>
            </div>
            <button
              id="btn-close-level-select"
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 my-4">
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
                  className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between group cursor-pointer ${
                    isCurrent
                      ? 'border-cyan-400/80 bg-cyan-950/30 text-white'
                      : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-sm ${
                        isCurrent
                          ? 'bg-gradient-to-tr from-[#ff3366] to-[#00d4ff] text-white shadow-md shadow-cyan-500/30'
                          : 'bg-white/10 text-neutral-300'
                      }`}
                    >
                      {String(lvl.id).padStart(2, '0')}
                    </div>
                    <div>
                      <div className="font-display font-semibold text-sm flex items-center gap-2">
                        {lvl.title}
                        {isCompleted && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <div className="text-xs text-neutral-400">
                        {lvl.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCurrent ? (
                      <span className="text-[11px] font-display uppercase tracking-wider text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/30">
                        Playing
                      </span>
                    ) : (
                      <Play className="w-4 h-4 text-neutral-400 group-hover:text-white group-hover:translate-x-0.5 transition" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-neutral-500 font-mono">
              Two Directions. One Way Forward.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
