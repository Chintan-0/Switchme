import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Lock } from 'lucide-react';
import { PlayerColor } from '../types';

interface TouchControlsProps {
  currentColor: PlayerColor;
  onDirectionChange: (left: boolean, right: boolean) => void;
  onJumpPress: (pressed: boolean) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  currentColor,
  onDirectionChange,
  onJumpPress,
}) => {
  const isRed = currentColor === 'RED';
  const [isMovePressed, setIsMovePressed] = useState(false);
  const [isJumpPressed, setIsJumpPressed] = useState(false);
  const [isSwitchTransitioning, setIsSwitchTransitioning] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Independent multi-touch identifiers (thumb 1 = move, thumb 2 = jump)
  const moveTouchIdRef = useRef<number | null>(null);
  const jumpTouchIdRef = useRef<number | null>(null);
  const moveClusterRef = useRef<HTMLDivElement | null>(null);
  const jumpButtonRef = useRef<HTMLDivElement | null>(null);
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

  // Trigger brief pulse animation whenever player color changes (RED <-> BLUE)
  useEffect(() => {
    if (lastColorRef.current !== currentColor) {
      lastColorRef.current = currentColor;
      setIsSwitchTransitioning(true);
      // Cancel lingering movement so player doesn't move in old direction
      if (moveTouchIdRef.current !== null) {
        moveTouchIdRef.current = null;
        setIsMovePressed(false);
        onDirectionChange(false, false);
      }
      const timer = setTimeout(() => setIsSwitchTransitioning(false), 320);
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

    // Apply directional restriction: RED moves Right, BLUE moves Left
    if (isRed) {
      onDirectionChange(false, true);
    } else {
      onDirectionChange(true, false);
    }
  };

  // Handle Movement Touch Move (with 35px generous deadzone around cluster)
  const handleMoveTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (moveTouchIdRef.current === null || !moveClusterRef.current) return;
    let touch: React.Touch | null = null;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === moveTouchIdRef.current) {
        touch = e.changedTouches[i];
        break;
      }
    }
    if (!touch) return;

    const rect = moveClusterRef.current.getBoundingClientRect();
    const DEADZONE = 35;
    const isInside =
      touch.clientX >= rect.left - DEADZONE &&
      touch.clientX <= rect.right + DEADZONE &&
      touch.clientY >= rect.top - DEADZONE &&
      touch.clientY <= rect.bottom + DEADZONE;

    if (!isInside) {
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
  const handleJumpTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.changedTouches.length === 0) return;

    const touch = e.changedTouches[0];
    jumpTouchIdRef.current = touch.identifier;
    setIsJumpPressed(true);
    onJumpPress(true);
  };

  // Handle Jump Touch End / Cancel
  const handleJumpTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
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

  if (!isTouchDevice) {
    return null;
  }

  return (
    <div
      id="touch-controls-container"
      className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-5 flex items-end justify-between pointer-events-none select-none touch-none"
      style={{
        paddingBottom: 'max(14px, env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'max(14px, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(14px, env(safe-area-inset-right, 0px))',
      }}
    >
      {/* BOTTOM LEFT: Compact Integrated Movement Controller */}
      <div
        ref={moveClusterRef}
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
        className={`pointer-events-auto flex items-center p-1 rounded-2xl border backdrop-blur-xl bg-[#090b14]/90 shadow-2xl transition-all duration-300 ${
          isSwitchTransitioning ? 'scale-105 ring-2 ring-white/40' : ''
        } ${
          isRed
            ? 'border-rose-500/40 shadow-[0_0_15px_rgba(255,51,102,0.2)]'
            : 'border-cyan-500/40 shadow-[0_0_15px_rgba(0,212,255,0.2)]'
        }`}
      >
        {/* LEFT BUTTON (Active ONLY when Blue) */}
        <div
          id="touch-btn-left"
          className={`relative w-15 h-14 sm:w-17 sm:h-15 rounded-xl flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${
            !isRed
              ? isMovePressed
                ? 'bg-cyan-500/40 border-2 border-cyan-300 text-cyan-100 scale-95 shadow-[0_0_20px_rgba(0,212,255,0.6)]'
                : 'bg-cyan-500/20 border border-cyan-400/80 text-cyan-300 shadow-[0_0_12px_rgba(0,212,255,0.3)] animate-pulse'
              : 'bg-white/[0.02] border border-white/5 text-neutral-600 opacity-20 cursor-not-allowed pointer-events-none'
          }`}
          aria-label={!isRed ? 'Move Left (Blue)' : 'Left Locked'}
        >
          <ArrowLeft className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${!isRed && isMovePressed ? '-translate-x-1' : ''}`} />
          <span className="text-[9px] font-mono font-bold tracking-wider mt-0.5">
            {!isRed ? 'LEFT' : 'LOCK'}
          </span>
          {isRed && (
            <div className="absolute top-1 right-1 opacity-50">
              <Lock className="w-2.5 h-2.5 text-neutral-500" />
            </div>
          )}
        </div>

        {/* Divider Bar */}
        <div
          className={`w-px h-8 mx-1 transition-colors duration-300 ${
            isRed ? 'bg-rose-500/30' : 'bg-cyan-500/30'
          }`}
        />

        {/* RIGHT BUTTON (Active ONLY when Red) */}
        <div
          id="touch-btn-right"
          className={`relative w-15 h-14 sm:w-17 sm:h-15 rounded-xl flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${
            isRed
              ? isMovePressed
                ? 'bg-rose-500/40 border-2 border-rose-300 text-rose-100 scale-95 shadow-[0_0_20px_rgba(255,51,102,0.6)]'
                : 'bg-rose-500/20 border border-rose-400/80 text-rose-300 shadow-[0_0_12px_rgba(255,51,102,0.3)] animate-pulse'
              : 'bg-white/[0.02] border border-white/5 text-neutral-600 opacity-20 cursor-not-allowed pointer-events-none'
          }`}
          aria-label={isRed ? 'Move Right (Red)' : 'Right Locked'}
        >
          <ArrowRight className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${isRed && isMovePressed ? 'translate-x-1' : ''}`} />
          <span className="text-[9px] font-mono font-bold tracking-wider mt-0.5">
            {isRed ? 'RIGHT' : 'LOCK'}
          </span>
          {!isRed && (
            <div className="absolute top-1 left-1 opacity-50">
              <Lock className="w-2.5 h-2.5 text-neutral-500" />
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM RIGHT: Compact High-Tactile Jump Button */}
      <div
        ref={jumpButtonRef}
        id="touch-btn-jump-container"
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
        className="pointer-events-auto p-1 cursor-pointer"
      >
        <div
          id="touch-btn-jump"
          className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full flex flex-col items-center justify-center border transition-all duration-100 backdrop-blur-xl shadow-xl ${
            isJumpPressed
              ? 'scale-90 bg-white/35 border-white text-white shadow-[0_0_25px_rgba(255,255,255,0.7)] ring-2 ring-white/30'
              : 'bg-[#090b14]/90 border-white/40 text-white shadow-[0_0_12px_rgba(255,255,255,0.15)] active:scale-95'
          }`}
          aria-label="Jump"
        >
          <ArrowUp className={`w-6 h-6 sm:w-7 sm:h-7 transition-transform ${isJumpPressed ? '-translate-y-0.5' : ''}`} />
          <span className="text-[9px] font-display font-black tracking-widest text-white drop-shadow">
            JUMP
          </span>
        </div>
      </div>
    </div>
  );
};
