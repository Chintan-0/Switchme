import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, RotateCcw, Lock } from 'lucide-react';
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
  const [isMovePressed, setIsMovePressed] = useState(false);
  const [isJumpPressed, setIsJumpPressed] = useState(false);
  const [isSwitchTransitioning, setIsSwitchTransitioning] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Active touch ID refs for independent multi-touch tracking (thumb 1 = move, thumb 2 = jump)
  const moveTouchIdRef = useRef<number | null>(null);
  const jumpTouchIdRef = useRef<number | null>(null);
  const moveButtonRef = useRef<HTMLDivElement | null>(null);
  const lastColorRef = useRef<PlayerColor>(currentColor);

  // Detect touch device or mobile/tablet screen size
  useEffect(() => {
    const checkTouch = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobileWidth = window.innerWidth <= 1024;
      setIsTouchDevice(hasTouch || isMobileWidth);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  // Trigger switch pulse animation whenever player color changes (RED <-> BLUE)
  useEffect(() => {
    if (lastColorRef.current !== currentColor) {
      lastColorRef.current = currentColor;
      setIsSwitchTransitioning(true);
      // If player was holding movement across color switch, reset input so they don't move in wrong direction
      if (moveTouchIdRef.current !== null) {
        moveTouchIdRef.current = null;
        setIsMovePressed(false);
        onDirectionChange(false, false);
      }
      const timer = setTimeout(() => setIsSwitchTransitioning(false), 360);
      return () => clearTimeout(timer);
    }
  }, [currentColor, onDirectionChange]);

  // Handle Movement Touch Start
  const handleMoveTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.changedTouches.length === 0) return;

    const touch = e.changedTouches[0];
    moveTouchIdRef.current = touch.identifier;
    setIsMovePressed(true);

    if (isRed) {
      onDirectionChange(false, true); // Move Right
    } else {
      onDirectionChange(true, false); // Move Left
    }
  };

  // Handle Movement Touch Move (with 35px generous deadzone so thumb doesn't drop input accidentally)
  const handleMoveTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (moveTouchIdRef.current === null || !moveButtonRef.current) return;
    let touch: React.Touch | null = null;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === moveTouchIdRef.current) {
        touch = e.changedTouches[i];
        break;
      }
    }
    if (!touch) return;

    const rect = moveButtonRef.current.getBoundingClientRect();
    const DEADZONE = 35;
    const isInsideWithDeadzone =
      touch.clientX >= rect.left - DEADZONE &&
      touch.clientX <= rect.right + DEADZONE &&
      touch.clientY >= rect.top - DEADZONE &&
      touch.clientY <= rect.bottom + DEADZONE;

    if (!isInsideWithDeadzone) {
      moveTouchIdRef.current = null;
      setIsMovePressed(false);
      onDirectionChange(false, false);
    }
  };

  // Handle Movement Touch End / Cancel
  const handleMoveTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (moveTouchIdRef.current === null) return;
    let touchEnded = false;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === moveTouchIdRef.current) {
        touchEnded = true;
        break;
      }
    }
    if (touchEnded) {
      moveTouchIdRef.current = null;
      setIsMovePressed(false);
      onDirectionChange(false, false);
    }
  };

  // Handle Jump Touch Start
  const handleJumpTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.changedTouches.length === 0) return;

    const touch = e.changedTouches[0];
    jumpTouchIdRef.current = touch.identifier;
    setIsJumpPressed(true);
    onJumpPress(true);
  };

  // Handle Jump Touch End / Cancel
  const handleJumpTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (jumpTouchIdRef.current === null) return;
    let touchEnded = false;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === jumpTouchIdRef.current) {
        touchEnded = true;
        break;
      }
    }
    if (touchEnded) {
      jumpTouchIdRef.current = null;
      setIsJumpPressed(false);
      onJumpPress(false);
    }
  };

  // If desktop non-touch screen and wide resolution, hide touch controls to keep desktop clean
  if (!isTouchDevice) {
    return null;
  }

  return (
    <div
      id="touch-controls-container"
      className="fixed inset-x-0 bottom-0 z-40 p-4 pb-safe pl-safe pr-safe flex items-end justify-between pointer-events-none select-none touch-none transition-opacity duration-200"
      style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))' }}
    >
      {/* BOTTOM LEFT: Direction-Aware Movement Controller */}
      <div
        ref={moveButtonRef}
        id="touch-move-cluster"
        onTouchStart={handleMoveTouchStart}
        onTouchMove={handleMoveTouchMove}
        onTouchEnd={handleMoveTouchEnd}
        onTouchCancel={handleMoveTouchEnd}
        onMouseDown={() => {
          setIsMovePressed(true);
          onDirectionChange(!isRed, isRed);
        }}
        onMouseUp={() => {
          setIsMovePressed(false);
          onDirectionChange(false, false);
        }}
        onMouseLeave={() => {
          setIsMovePressed(false);
          onDirectionChange(false, false);
        }}
        className={`pointer-events-auto flex items-center p-1.5 rounded-2xl border backdrop-blur-xl bg-[#090b14]/85 shadow-2xl transition-all duration-300 ${
          isSwitchTransitioning ? 'scale-105 ring-2 ring-white/40' : ''
        } ${
          isRed
            ? 'border-rose-500/40 shadow-rose-950/40'
            : 'border-cyan-500/40 shadow-cyan-950/40'
        }`}
      >
        {/* LEFT BUTTON (Active ONLY when Blue) */}
        <div
          id="touch-btn-left"
          className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
            !isRed
              ? isMovePressed
                ? 'bg-cyan-500/40 border-2 border-cyan-300 text-cyan-100 scale-95 shadow-[0_0_25px_rgba(0,212,255,0.6)]'
                : 'bg-cyan-500/20 border border-cyan-400/80 text-cyan-300 shadow-[0_0_15px_rgba(0,212,255,0.3)] animate-pulse'
              : 'bg-white/[0.02] border border-white/5 text-neutral-600 opacity-30 cursor-not-allowed pointer-events-none'
          }`}
          aria-label={!isRed ? 'Move Left (Blue)' : 'Left Locked'}
        >
          <ArrowLeft className={`w-7 h-7 sm:w-8 sm:h-8 transition-transform ${!isRed && isMovePressed ? '-translate-x-1' : ''}`} />
          <span className="text-[10px] font-mono font-black tracking-widest mt-0.5">
            {!isRed ? 'LEFT' : 'LOCKED'}
          </span>
          {isRed && (
            <div className="absolute top-1.5 right-1.5 opacity-60">
              <Lock className="w-3 h-3 text-neutral-500" />
            </div>
          )}
        </div>

        {/* Dividing Neon Spine */}
        <div
          className={`w-px h-10 mx-1.5 transition-colors duration-300 ${
            isRed ? 'bg-rose-500/40' : 'bg-cyan-500/40'
          }`}
        />

        {/* RIGHT BUTTON (Active ONLY when Red) */}
        <div
          id="touch-btn-right"
          className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
            isRed
              ? isMovePressed
                ? 'bg-rose-500/40 border-2 border-rose-300 text-rose-100 scale-95 shadow-[0_0_25px_rgba(255,51,102,0.6)]'
                : 'bg-rose-500/20 border border-rose-400/80 text-rose-300 shadow-[0_0_15px_rgba(255,51,102,0.3)] animate-pulse'
              : 'bg-white/[0.02] border border-white/5 text-neutral-600 opacity-30 cursor-not-allowed pointer-events-none'
          }`}
          aria-label={isRed ? 'Move Right (Red)' : 'Right Locked'}
        >
          <ArrowRight className={`w-7 h-7 sm:w-8 sm:h-8 transition-transform ${isRed && isMovePressed ? 'translate-x-1' : ''}`} />
          <span className="text-[10px] font-mono font-black tracking-widest mt-0.5">
            {isRed ? 'RIGHT' : 'LOCKED'}
          </span>
          {!isRed && (
            <div className="absolute top-1.5 left-1.5 opacity-60">
              <Lock className="w-3 h-3 text-neutral-500" />
            </div>
          )}
        </div>
      </div>

      {/* CENTER: Safe Minimalist Restart Button */}
      <div className="pointer-events-auto pb-2">
        <button
          id="touch-btn-reset"
          onClick={onReset}
          className="w-11 h-11 rounded-2xl bg-[#090b14]/80 border border-white/15 text-neutral-300 hover:text-white flex items-center justify-center active:scale-90 transition backdrop-blur-md shadow-lg cursor-pointer"
          title="Restart Chamber"
          aria-label="Restart Chamber"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* BOTTOM RIGHT: Large High-Tactile Jump Button */}
      <div className="pointer-events-auto">
        <button
          id="touch-btn-jump"
          onTouchStart={handleJumpTouchStart}
          onTouchEnd={handleJumpTouchEnd}
          onTouchCancel={handleJumpTouchEnd}
          onMouseDown={() => {
            setIsJumpPressed(true);
            onJumpPress(true);
          }}
          onMouseUp={() => {
            setIsJumpPressed(false);
            onJumpPress(false);
          }}
          onMouseLeave={() => {
            setIsJumpPressed(false);
            onJumpPress(false);
          }}
          className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-150 backdrop-blur-xl shadow-2xl cursor-pointer ${
            isJumpPressed
              ? 'scale-90 bg-white/35 border-white text-white shadow-[0_0_35px_rgba(255,255,255,0.7)] ring-4 ring-white/20'
              : 'bg-gradient-to-tr from-white/15 via-[#0d101c]/80 to-white/20 border-white/60 text-white shadow-[0_0_20px_rgba(255,255,255,0.25)]'
          }`}
          aria-label="Jump"
        >
          <ArrowUp className={`w-8 h-8 sm:w-9 sm:h-9 transition-transform ${isJumpPressed ? '-translate-y-1' : ''}`} />
          <span className="text-[11px] font-display font-black tracking-widest text-white drop-shadow">
            JUMP
          </span>
        </button>
      </div>
    </div>
  );
};
