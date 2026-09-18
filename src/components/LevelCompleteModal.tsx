import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, ArrowRight, Trophy, Clock, Zap, RefreshCw } from 'lucide-react';
import { LevelStats } from '../types';

interface LevelCompleteModalProps {
  isOpen: boolean;
  levelTitle: string;
  stats: LevelStats;
  hasNextLevel: boolean;
  onReplay: () => void;
  onNextLevel: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  isOpen,
  levelTitle,
  stats,
  hasNextLevel,
  onReplay,
  onNextLevel,
}) => {
  if (!isOpen) return null;

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    const ms = Math.floor((totalSeconds % 1) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <div
        id="level-complete-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
      >
        <motion.div
          id="level-complete-card"
          initial={{ opacity: 0, scale: 0.88, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          className="w-full max-w-sm rounded-2xl border border-white/20 bg-[#0d0f18] p-7 shadow-2xl text-center relative overflow-hidden"
        >
          {/* Neon accent corner glows */}
          <div className="absolute -top-16 -left-16 w-32 h-32 bg-[#ff3366]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-[#00d4ff]/20 rounded-full blur-2xl pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ff3366]/20 via-white/10 to-[#00d4ff]/20 border border-white/25 mb-4 shadow-lg shadow-white/5">
            <Trophy className="w-7 h-7 text-amber-300" />
          </div>

          <div className="text-xs font-display tracking-[0.25em] text-cyan-400 uppercase font-semibold mb-1">
            Chamber Cleared
          </div>

          <h2 className="text-2xl font-display font-bold text-white tracking-wide uppercase mb-1">
            Level Complete
          </h2>

          <p className="text-base font-display font-bold text-cyan-400 tracking-wider uppercase mb-6">
            {levelTitle}
          </p>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-5" />

          {/* Minimal Stats Block per specification */}
          <div className="space-y-3 mb-6 bg-white/[0.03] rounded-xl border border-white/10 p-4 font-mono text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-neutral-400 text-xs tracking-wider uppercase">
                <Clock className="w-4 h-4 text-cyan-400" /> Time
              </span>
              <span className="font-bold text-white tracking-wider">
                {formatTime(stats.timeSeconds)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-neutral-400 text-xs tracking-wider uppercase">
                <RefreshCw className="w-4 h-4 text-cyan-400" /> Switches
              </span>
              <span className="font-bold text-cyan-300 tracking-wider text-base">
                {stats.switches}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-neutral-400 text-xs tracking-wider uppercase">
                <RotateCcw className="w-4 h-4 text-rose-400" /> Restarts
              </span>
              <span className="font-bold text-neutral-300 tracking-wider">
                {stats.deaths}
              </span>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              id="btn-replay-level"
              onClick={onReplay}
              className="flex-1 py-3 px-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 active:scale-98 transition text-sm font-display font-semibold text-white flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Replay
            </button>

            {hasNextLevel && (
              <button
                id="btn-next-level"
                onClick={onNextLevel}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#ff3366] to-[#00d4ff] hover:opacity-95 active:scale-98 transition text-sm font-display font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                <span>Next Level</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
