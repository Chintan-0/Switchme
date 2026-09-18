import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, RotateCcw } from 'lucide-react';
import { PlayerColor } from '../types';

interface TouchControlsProps {
  currentColor: PlayerColor;
  onDirectionChange: (left: boolean, right: boolean) => void;
  onJumpPress: (pressed: boolean) => void;
  onReset: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  currentColor,
  onDirectionChange,
  onJumpPress,
  onReset,
}) => {
  const isRed = currentColor === 'RED';

  return (
    <div
      id="touch-controls-container"
      className="md:hidden fixed inset-x-0 bottom-0 z-40 p-4 pb-6 flex items-end justify-between pointer-events-none select-none"
    >
      {/* Left/Right Directional Pad */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Left Button */}
        <button
          id="touch-btn-left"
          onTouchStart={(e) => {
            e.preventDefault();
            onDirectionChange(true, false);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onDirectionChange(false, false);
          }}
          onMouseDown={() => onDirectionChange(true, false)}
          onMouseUp={() => onDirectionChange(false, false)}
          onMouseLeave={() => onDirectionChange(false, false)}
          className={`w-15 h-15 rounded-2xl flex flex-col items-center justify-center transition active:scale-90 border backdrop-blur-md cursor-pointer ${
            !isRed
              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/30'
              : 'bg-white/5 border-white/10 text-white/30'
          }`}
          aria-label="Move Left"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="text-[9px] font-mono font-bold tracking-tighter opacity-80">
            {!isRed ? 'BLUE' : 'LOCK'}
          </span>
        </button>

        {/* Right Button */}
        <button
          id="touch-btn-right"
          onTouchStart={(e) => {
            e.preventDefault();
            onDirectionChange(false, true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onDirectionChange(false, false);
          }}
          onMouseDown={() => onDirectionChange(false, true)}
          onMouseUp={() => onDirectionChange(false, false)}
          onMouseLeave={() => onDirectionChange(false, false)}
          className={`w-15 h-15 rounded-2xl flex flex-col items-center justify-center transition active:scale-90 border backdrop-blur-md cursor-pointer ${
            isRed
              ? 'bg-rose-500/25 border-rose-400 text-rose-300 shadow-lg shadow-rose-500/30'
              : 'bg-white/5 border-white/10 text-white/30'
          }`}
          aria-label="Move Right"
        >
          <ArrowRight className="w-6 h-6" />
          <span className="text-[9px] font-mono font-bold tracking-tighter opacity-80">
            {isRed ? 'RED' : 'LOCK'}
          </span>
        </button>
      </div>

      {/* Center Quick Reset */}
      <div className="pointer-events-auto pb-1">
        <button
          id="touch-btn-reset"
          onClick={onReset}
          className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 text-neutral-300 flex items-center justify-center active:scale-90 transition cursor-pointer"
          aria-label="Reset Level"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Jump Button */}
      <div className="pointer-events-auto">
        <button
          id="touch-btn-jump"
          onTouchStart={(e) => {
            e.preventDefault();
            onJumpPress(true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onJumpPress(false);
          }}
          onMouseDown={() => onJumpPress(true)}
          onMouseUp={() => onJumpPress(false)}
          onMouseLeave={() => onJumpPress(false)}
          className="w-18 h-18 rounded-full bg-gradient-to-tr from-white/15 via-white/25 to-white/10 border-2 border-white/60 text-white flex flex-col items-center justify-center active:scale-90 shadow-xl shadow-white/10 backdrop-blur-md cursor-pointer"
          aria-label="Jump"
        >
          <ArrowUp className="w-7 h-7" />
          <span className="text-[10px] font-display font-bold tracking-wider">
            JUMP
          </span>
        </button>
      </div>
    </div>
  );
};
