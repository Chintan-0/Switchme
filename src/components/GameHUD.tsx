import React from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Layers,
  HelpCircle,
  Clock,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { PlayerColor, LevelStats } from '../types';

interface GameHUDProps {
  levelTitle: string;
  levelSubtitle: string;
  currentColor: PlayerColor;
  stats: LevelStats;
  isMuted: boolean;
  onToggleMute: () => void;
  onResetLevel: () => void;
  onOpenLevelSelect: () => void;
  onOpenGuide: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  levelTitle,
  levelSubtitle,
  currentColor,
  stats,
  isMuted,
  onToggleMute,
  onResetLevel,
  onOpenLevelSelect,
  onOpenGuide,
}) => {
  const isRed = currentColor === 'RED';

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <header
      id="game-hud-header"
      className="fixed top-0 inset-x-0 z-30 pointer-events-none p-2.5 sm:p-4 md:p-5 pt-safe pl-safe pr-safe flex flex-col gap-1"
      style={{
        paddingTop: 'max(10px, env(safe-area-inset-top, 0px))',
        paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
      }}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Left: Compact Level Badge & Direction Status */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Logo Icon */}
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#0e111a] border border-white/20 flex items-center justify-center shadow-lg shadow-black/40 overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#ff3366]/30 via-transparent to-[#00d4ff]/30" />
            <div className="flex items-center gap-0.5 font-display font-black text-xs sm:text-sm z-10">
              <span className="text-[#ff3366]">S</span>
              <span className="text-[#00d4ff]">M</span>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h1 className="font-display font-bold text-xs sm:text-base tracking-wide text-white uppercase drop-shadow">
                {levelTitle}
              </h1>
              {/* Color & Direction Bead Indicator */}
              <div
                className={`px-2 py-0.5 rounded-full border text-[10px] font-display font-black flex items-center gap-1 transition-colors duration-300 ${
                  isRed
                    ? 'bg-rose-950/80 border-rose-500/80 text-rose-300 shadow-[0_0_10px_rgba(255,51,102,0.4)]'
                    : 'bg-cyan-950/80 border-cyan-500/80 text-cyan-300 shadow-[0_0_10px_rgba(0,212,255,0.4)]'
                }`}
              >
                <span>{isRed ? '🔴 →' : '🔵 ←'}</span>
                <span className="hidden xs:inline">{isRed ? 'RIGHT' : 'LEFT'}</span>
              </div>
            </div>
            <div className="hidden sm:block text-[11px] text-neutral-400 font-mono">
              {levelSubtitle}
            </div>
          </div>
        </div>

        {/* Center: Desktop-only Expanded Direction Indicator */}
        <div className="hidden md:flex items-center pointer-events-auto">
          <div
            className={`px-4 py-1.5 rounded-full border text-xs font-display font-bold flex items-center gap-2 shadow-lg transition-all duration-300 ${
              isRed
                ? 'bg-rose-950/60 border-rose-500/70 text-rose-300 neon-glow-red'
                : 'bg-cyan-950/60 border-cyan-500/70 text-cyan-300 neon-glow-blue'
            }`}
          >
            <span className="text-sm">{isRed ? '🔴' : '🔵'}</span>
            <span>
              {isRed ? 'RED • MOVES RIGHT (→)' : 'BLUE • MOVES LEFT (←)'}
            </span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Mobile Timer Badge */}
          <div className="flex md:hidden items-center gap-1 bg-[#0d0f18]/85 backdrop-blur-md border border-white/15 px-2.5 py-1.5 rounded-xl font-mono text-xs text-neutral-200">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{formatTimer(stats.timeSeconds)}</span>
          </div>

          {/* Desktop Full Timer & Stats Badge */}
          <div className="hidden md:flex items-center gap-3 bg-[#0d0f18]/85 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-xl font-mono text-xs text-neutral-300">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{formatTimer(stats.timeSeconds)}</span>
            </div>
            <div className="w-px h-3 bg-white/20" />
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>{stats.jumps} J</span>
            </div>
            <div className="w-px h-3 bg-white/20" />
            <div className="flex items-center gap-1.5 text-cyan-300">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{stats.switches}</span>
            </div>
          </div>

          {/* Guide Button */}
          <button
            id="btn-hud-guide"
            onClick={onOpenGuide}
            title="How to Play"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0d0f18]/85 backdrop-blur-md border border-white/15 hover:border-white/30 text-neutral-300 hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Level Selector */}
          <button
            id="btn-hud-levels"
            onClick={onOpenLevelSelect}
            title="Chamber Matrix"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0d0f18]/85 backdrop-blur-md border border-white/15 hover:border-white/30 text-neutral-300 hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Audio Mute Toggle */}
          <button
            id="btn-hud-mute"
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0d0f18]/85 backdrop-blur-md border border-white/15 hover:border-white/30 text-neutral-300 hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />}
          </button>

          {/* Desktop Reset Button (R) */}
          <button
            id="btn-hud-reset"
            onClick={onResetLevel}
            title="Restart Level (R)"
            className="hidden sm:flex px-2.5 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-neutral-200 hover:text-white items-center gap-1.5 transition active:scale-95 text-xs font-display font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>R</span>
          </button>
        </div>
      </div>
    </header>
  );
};
