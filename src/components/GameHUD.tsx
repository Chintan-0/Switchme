import React from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Layers,
  HelpCircle,
  Clock,
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
      className="fixed top-0 inset-x-0 z-30 pointer-events-none p-2 sm:p-3 flex items-center justify-between gap-2"
      style={{
        paddingTop: 'max(8px, env(safe-area-inset-top, 0px))',
        paddingLeft: 'max(10px, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(10px, env(safe-area-inset-right, 0px))',
      }}
    >
      {/* TOP LEFT: Compact Brand & Level Name */}
      <div className="flex items-center gap-2 pointer-events-auto shrink-0">
        <div className="w-7 h-7 rounded-lg bg-[#0e111a]/90 border border-white/20 flex items-center justify-center shadow overflow-hidden shrink-0">
          <div className="flex items-center text-[10px] font-display font-black tracking-tighter">
            <span className="text-[#ff3366]">S</span>
            <span className="text-[#00d4ff]">M</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <h1 className="font-display font-bold text-xs sm:text-sm tracking-wide text-white uppercase truncate max-w-[110px] sm:max-w-xs drop-shadow">
            {levelTitle}
          </h1>
        </div>
      </div>

      {/* TOP CENTER: Sleek, Minimal Direction Badge */}
      <div className="pointer-events-auto shrink-0">
        <div
          className={`px-2.5 py-0.5 rounded-full border text-[10px] sm:text-xs font-display font-black tracking-wider flex items-center gap-1 transition-all duration-300 ${
            isRed
              ? 'bg-rose-950/80 border-rose-500/80 text-rose-300 shadow-[0_0_10px_rgba(255,51,102,0.4)]'
              : 'bg-cyan-950/80 border-cyan-500/80 text-cyan-300 shadow-[0_0_10px_rgba(0,212,255,0.4)]'
          }`}
        >
          <span>{isRed ? '🔴 RED →' : '🔵 BLUE ←'}</span>
        </div>
      </div>

      {/* TOP RIGHT: Compact Circular Action Icons */}
      <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
        {/* Desktop-only Timer */}
        <div className="hidden md:flex items-center gap-1 bg-[#0d0f18]/85 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-full font-mono text-xs text-neutral-300 mr-1">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span>{formatTimer(stats.timeSeconds)}</span>
        </div>

        {/* Restart Button (Top Right as specified) */}
        <button
          id="btn-hud-reset"
          onClick={onResetLevel}
          title="Restart Level"
          aria-label="Restart Level"
          className="w-8 h-8 rounded-full bg-[#0d0f18]/85 backdrop-blur-md border border-white/20 text-neutral-200 hover:text-white flex items-center justify-center transition active:scale-90 shadow cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Audio Mute Toggle */}
        <button
          id="btn-hud-mute"
          onClick={onToggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
          aria-label="Toggle Sound"
          className="w-8 h-8 rounded-full bg-[#0d0f18]/85 backdrop-blur-md border border-white/20 text-neutral-200 hover:text-white flex items-center justify-center transition active:scale-90 shadow cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
        </button>

        {/* Level Select (Chamber Matrix) */}
        <button
          id="btn-hud-levels"
          onClick={onOpenLevelSelect}
          title="Level Select"
          aria-label="Level Select"
          className="w-8 h-8 rounded-full bg-[#0d0f18]/85 backdrop-blur-md border border-white/20 text-neutral-200 hover:text-white flex items-center justify-center transition active:scale-90 shadow cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5" />
        </button>

        {/* How to Play Guide */}
        <button
          id="btn-hud-guide"
          onClick={onOpenGuide}
          title="Help & Controls"
          aria-label="Help & Controls"
          className="w-8 h-8 rounded-full bg-[#0d0f18]/85 backdrop-blur-md border border-white/20 text-neutral-200 hover:text-white flex items-center justify-center transition active:scale-90 shadow cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
