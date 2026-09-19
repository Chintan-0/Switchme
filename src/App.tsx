/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './engine/GameEngine';
import { LEVELS } from './levels/levelData';
import { GameHUD } from './components/GameHUD';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { ControlsGuideModal } from './components/ControlsGuideModal';
import { SpriteExporterModal } from './components/SpriteExporterModal';
import { TouchControls } from './components/TouchControls';
import { sound } from './audio/synth';
import { PlayerColor, LevelStats, CameraViewMode } from './types';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Game state
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentColor, setCurrentColor] = useState<PlayerColor>('RED');
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('FIT');
  const [isMuted, setIsMuted] = useState(sound.getIsMuted());
  const [completedLevels, setCompletedLevels] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('switchme_completed_levels');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [stats, setStats] = useState<LevelStats>({
    timeSeconds: 0,
    jumps: 0,
    switches: 0,
    deaths: 0,
    completed: false,
  });

  // Modal visibility states
  const [isLevelCompleteOpen, setIsLevelCompleteOpen] = useState(false);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSpriteExporterOpen, setIsSpriteExporterOpen] = useState(false);

  // Screen fade transition state during level load
  const [isFading, setIsFading] = useState(true);

  const currentLevel = LEVELS[currentLevelIndex] || LEVELS[0];
  const hasNextLevel = currentLevelIndex < LEVELS.length - 1;

  // Initial boot fade-in transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFading(false);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Handle Level Completion
  const handleLevelComplete = useCallback((finalStats: LevelStats) => {
    setStats(finalStats);
    setIsLevelCompleteOpen(true);

    setCompletedLevels((prev) => {
      if (!prev.includes(currentLevel.id)) {
        const updated = [...prev, currentLevel.id];
        try {
          localStorage.setItem('switchme_completed_levels', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      }
      return prev;
    });
  }, [currentLevel.id]);

  // Handle Level selection with screen fade transition
  const handleSelectLevel = useCallback((levelId: number) => {
    const idx = LEVELS.findIndex((l) => l.id === levelId);
    if (idx !== -1) {
      setIsFading(true);
      setIsLevelCompleteOpen(false);
      setTimeout(() => {
        setCurrentLevelIndex(idx);
        if (engineRef.current) {
          engineRef.current.loadLevel(LEVELS[idx]);
          setCurrentColor(LEVELS[idx].spawn.color);
        }
        setTimeout(() => {
          setIsFading(false);
        }, 60);
      }, 240);
    }
  }, []);

  // Handle Replay with screen fade transition
  const handleReplay = useCallback(() => {
    setIsLevelCompleteOpen(false);
    setIsFading(true);
    setTimeout(() => {
      if (engineRef.current) {
        engineRef.current.resetLevel();
      }
      setTimeout(() => {
        setIsFading(false);
      }, 60);
    }, 180);
  }, []);

  // Handle Next Level
  const handleNextLevel = useCallback(() => {
    if (hasNextLevel) {
      handleSelectLevel(LEVELS[currentLevelIndex + 1].id);
    }
  }, [hasNextLevel, currentLevelIndex, handleSelectLevel]);

  // Handle Audio Mute
  const handleToggleMute = useCallback(() => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  }, []);

  // Handle Camera Mode Toggle (Full Fit vs Follow)
  const handleToggleCameraMode = useCallback(() => {
    if (engineRef.current) {
      const nextMode = engineRef.current.toggleCameraMode();
      setCameraMode(nextMode);
    }
  }, []);

  // Initialize and bind canvas engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set initial size
    const updateCanvasSize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      if (engineRef.current) {
        engineRef.current.snapCameraToFit();
      }
    };

    updateCanvasSize();

    const engine = new GameEngine(canvas, currentLevel, {
      onLevelComplete: handleLevelComplete,
      onStatsUpdate: (newStats) => setStats({ ...newStats }),
      onColorChange: (color) => setCurrentColor(color),
      onCameraModeChange: (mode) => setCameraMode(mode),
    });

    engineRef.current = engine;
    engine.start();

    // ResizeObserver, visualViewport, and orientationchange listeners
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    const handleOrientationChange = () => {
      setTimeout(updateCanvasSize, 50);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', updateCanvasSize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateCanvasSize);
    }

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', updateCanvasSize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateCanvasSize);
      }
      engine.stop();
      engine.unbindEvents();
    };
  }, [currentLevel, handleLevelComplete]);

  // Developer shortcut to access the Sprite Exporter tool without cluttering the player HUD: Shift + E
  useEffect(() => {
    const handleDevKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'E' || e.key === 'e')) {
        setIsSpriteExporterOpen((prev) => !prev);
      }
    };
    (window as unknown as { __toggleSpriteExporter: () => void }).__toggleSpriteExporter = () => {
      setIsSpriteExporterOpen((prev) => !prev);
    };
    window.addEventListener('keydown', handleDevKeyDown);
    return () => window.removeEventListener('keydown', handleDevKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      id="switchme-app-root"
      className="fixed inset-0 w-full h-full min-h-[100dvh] max-h-[100dvh] bg-[#07080d] overflow-hidden flex flex-col items-center justify-center select-none touch-none overscroll-none"
    >
      {/* Heads-up Display Header */}
      <GameHUD
        levelTitle={currentLevel.title}
        levelSubtitle={currentLevel.subtitle}
        currentColor={currentColor}
        stats={stats}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onResetLevel={handleReplay}
        onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Physics & Rendering Canvas */}
      <canvas
        ref={canvasRef}
        id="game-canvas"
        className="w-full h-full block cursor-crosshair touch-none"
      />

      {/* Touch controls for mobile / tablet devices */}
      <TouchControls
        currentColor={currentColor}
        onDirectionChange={(left, right) => {
          if (engineRef.current) {
            engineRef.current.setTouchDirection(left, right);
          }
        }}
        onJumpPress={(pressed) => {
          if (engineRef.current) {
            engineRef.current.setTouchJump(pressed);
          }
        }}
      />

      {/* Step 12: Level Complete Modal */}
      <LevelCompleteModal
        isOpen={isLevelCompleteOpen}
        levelTitle={currentLevel.title}
        stats={stats}
        hasNextLevel={hasNextLevel}
        onReplay={handleReplay}
        onNextLevel={handleNextLevel}
      />

      {/* Level Select Modal */}
      <LevelSelectModal
        isOpen={isLevelSelectOpen}
        levels={LEVELS}
        currentLevelId={currentLevel.id}
        completedLevels={completedLevels}
        onSelectLevel={handleSelectLevel}
        onClose={() => setIsLevelSelectOpen(false)}
      />

      {/* How to Play / Controls Guide Modal */}
      <ControlsGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Character Spritesheet & PNG Asset Exporter Modal */}
      <SpriteExporterModal
        isOpen={isSpriteExporterOpen}
        onClose={() => setIsSpriteExporterOpen(false)}
      />

      {/* Screen Fade Transition Overlay during Level Load */}
      <div
        id="screen-fade-overlay"
        className={`fixed inset-0 z-40 bg-[#07080d] flex items-center justify-center transition-opacity duration-300 ease-in-out ${
          isFading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isFading}
      >
        <div className="flex flex-col items-center gap-3 select-none">
          <div className="w-8 h-8 rounded-full border-2 border-t-[#00d4ff] border-r-[#ff3366] border-b-transparent border-l-transparent animate-spin opacity-80" />
        </div>
      </div>
    </div>
  );
}
