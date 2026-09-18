export type PlayerColor = 'RED' | 'BLUE';

export type BoostDirection = 'RIGHT' | 'LEFT';

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  isBarrier?: boolean;
  floating?: boolean;
}

export interface SpeedBoostTile {
  id: string;
  x: number;
  y: number;
  width: number;
  height?: number;
  direction: BoostDirection;
  boostMultiplier?: number;
}

export interface ColorSwitch {
  id: string;
  x: number;
  y: number;
  radius: number;
  pulsePhase: number;
  active: boolean;
}

export interface ExitPortal {
  id: string;
  x: number;
  y: number;
  radius: number;
  pulsePhase: number;
}

export interface LevelHint {
  x: number;
  y: number;
  text: string;
  subtext?: string;
  direction?: 'right' | 'left' | 'jump';
}

export interface LevelData {
  id: number;
  title: string;
  subtitle: string;
  spawn: {
    x: number;
    y: number;
    color: PlayerColor;
  };
  platforms: Platform[];
  switches: ColorSwitch[];
  exit: ExitPortal;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  hints: LevelHint[];
  speedTiles?: SpeedBoostTile[];
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  maxLife: number;
  life: number;
  shape?: 'circle' | 'spark' | 'ring' | 'line';
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: PlayerColor;
  isGrounded: boolean;
  wasGrounded: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  squashX: number;
  squashY: number;
  rotation: number;
  facing: 1 | -1;
  blockedTimer: number; // visual feedback when trying forbidden direction
  indicatorFlipProgress: number; // 0 to 1 transition
  walkCycle: number;
  landTimer: number;
  boostTimer: number;
  isOnBoost: boolean;
}

export interface LevelStats {
  timeSeconds: number;
  jumps: number;
  switches: number;
  deaths: number;
  completed: boolean;
}

export type CameraViewMode = 'FIT' | 'FOLLOW';
