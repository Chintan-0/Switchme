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
      className="fixed top-0 inset-x-0 z-30 pointer-events-none p-3 md:p-5 flex flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Brand & Level Info */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Logo Glyph */}
          <div className="relative w-10 h-10 rounded-xl bg-[#0e111a] border border-white/20 flex items-center justify-center shadow-lg shadow-black/40 overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#ff3366]/30 via-transparent to-[#00d4ff]/30" />
            <div className="flex items-center gap-1 font-display font-black text-sm z-10">
              <span className="text-[#ff3366]">S</span>
              <span className="text-[#00d4ff]">M</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-base md:text-lg tracking-wider text-white uppercase drop-shadow">
                SwitchMe!
              </h1>
              <span className="hidden sm:inline-block text-[11px] font-mono text-neutral-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                {levelSubtitle}
              </span>
            </div>
            <div className="text-xs text-neutral-400 font-medium">
              Chamber: <span className="text-white font-semibold">{levelTitle}</span>
            </div>
          </div>
        </div>

        {/* Center: State & Direction Indicator (Desktop & Mobile) */}
        <div className="hidden sm:flex items-center pointer-events-auto">
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
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Timer & Stats Badge */}
          <div className="hidden md:flex items-center gap-3 bg-[#0d0f18]/80 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-xl font-mono text-xs text-neutral-300">
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
            className="w-9 h-9 rounded-xl bg-[#0d0f18]/80 backdrop-blur-md border border-white/15 hover:border-white/30 text-neutral-300 hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Level Selector */}
          <button
            id="btn-hud-levels"
            onClick={onOpenLevelSelect}
            title="Chamber Matrix"
            className="w-9 h-9 rounded-xl bg-[#0d0f18]/80 backdrop-blur-md border border-white/15 hover:border-white/30 text-neutral-300 hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Audio Mute Toggle */}
          <button
            id="btn-hud-mute"
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            className="w-9 h-9 rounded-xl bg-[#0d0f18]/80 backdrop-blur-md border border-white/15 hover:border-white/30 text-neutral-300 hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Reset Button */}
          <button
            id="btn-hud-reset"
            onClick={onResetLevel}
            title="Restart Level (R)"
            className="px-2.5 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-neutral-200 hover:text-white flex items-center gap-1.5 transition active:scale-95 text-xs font-display font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">R</span>
          </button>
        </div>
      </div>

      {/* Mobile State Banner (when on small screens) */}
      <div className="sm:hidden flex justify-center pointer-events-auto">
        <div
          className={`px-3 py-1 rounded-full border text-[11px] font-display font-bold flex items-center gap-1.5 shadow-md ${
            isRed
              ? 'bg-rose-950/70 border-rose-500/70 text-rose-300'
              : 'bg-cyan-950/70 border-cyan-500/70 text-cyan-300'
          }`}
        >
          <span>{isRed ? '🔴' : '🔵'}</span>
          <span>{isRed ? 'RED: ONLY MOVES RIGHT (→)' : 'BLUE: ONLY MOVES LEFT (←)'}</span>
        </div>
      </div>
    </header>
  );
};
