import { LevelData, Particle, PlayerColor, PlayerState, LevelStats, CameraViewMode, SpeedBoostTile } from '../types';
import { sound } from '../audio/synth';
import { drawCharacter, drawDirectionArrow, CharacterPose } from './CharacterSpriteRenderer';

export interface GameEngineCallbacks {
  onLevelComplete: (stats: LevelStats) => void;
  onStatsUpdate: (stats: LevelStats) => void;
  onColorChange: (color: PlayerColor) => void;
  onCameraModeChange?: (mode: CameraViewMode) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private level: LevelData;
  private callbacks: GameEngineCallbacks;

  // Player
  private player: PlayerState;
  private keys: { [key: string]: boolean } = {};
  private touchInput: { left: boolean; right: boolean; jump: boolean } = {
    left: false,
    right: false,
    jump: false,
  };

  // Particles & Ambient
  private particles: Particle[] = [];
  private ambientParticles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];

  // Physics constants
  private readonly SPEED = 310;
  private readonly BOOST_SPEED = 540;
  private readonly ACCELERATION = 1800;
  private readonly BOOST_ACCELERATION = 3200;
  private readonly FRICTION = 1400;
  private readonly GRAVITY = 1180;
  private readonly JUMP_VELOCITY = -520;
  private readonly COYOTE_TIME = 0.12; // 120ms
  private readonly JUMP_BUFFER_TIME = 0.12; // 120ms
  private lastBoostSfxTime = 0;

  // Camera & Adaptive Level Framing
  private camera = {
    x: 0,
    y: 0,
    scale: 1,
    targetX: 0,
    targetY: 0,
    targetScale: 1,
    mode: 'FIT' as CameraViewMode,
  };
  private readonly padTop = 82;
  private readonly padBottom = 38;
  private readonly padLeft = 40;
  private readonly padRight = 40;
  private cameraLookahead = 60; // Directional lookahead smoothly lerped on color switch
  private shakeTimer = 0;
  private shakeIntensity = 0;

  // Stats & Timing
  private stats: LevelStats = {
    timeSeconds: 0,
    jumps: 0,
    switches: 0,
    deaths: 0,
    completed: false,
  };
  private lastTime = 0;
  private animationFrameId: number | null = null;
  private isRunning = false;
  private switchCooldownTimer = 0;
  private activeSwitchId: string | null = null;
  private switchFlashTimer = 0;
  private switchFlashColor = '#ffffff';
  private switchShockwaves: Array<{
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    color: string;
    life: number;
    maxLife: number;
  }> = [];
  private isCompleting = false;
  private completionTimer = 0;

  // Post-Processing Bloom Pass
  private bloomCanvas: HTMLCanvasElement | null = null;
  private bloomCtx: CanvasRenderingContext2D | null = null;
  private bloomW = 0;
  private bloomH = 0;
  private bloomPulseTimer = 0;

  // Parallax Background & Dynamic Hue Shift
  private bgHueProgress = 1; // 1 = Red, 0 = Blue (smoothly lerped)
  private parallaxStars: Array<{
    x: number;
    y: number;
    size: number;
    baseAlpha: number;
    layer: number; // 0 = Far (0.15x), 1 = Mid (0.38x)
    twinkleSpeed: number;
    twinklePhase: number;
  }> = [];

  constructor(canvas: HTMLCanvasElement, level: LevelData, callbacks: GameEngineCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.level = level;
    this.callbacks = callbacks;

    this.player = this.createInitialPlayerState();
    this.bgHueProgress = this.player.color === 'RED' ? 1 : 0;
    this.initParallaxStars();
    this.initAmbientParticles();
    this.bindEvents();
    this.snapCameraToFit();
  }

  private initParallaxStars() {
    this.parallaxStars = [];
    const count = 75;
    let seed = 42;
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let i = 0; i < count; i++) {
      this.parallaxStars.push({
        x: random() * 2000,
        y: random() * 1200,
        size: 0.8 + random() * 1.8,
        baseAlpha: 0.18 + random() * 0.45,
        layer: random() > 0.4 ? 1 : 0,
        twinkleSpeed: 1.2 + random() * 2.5,
        twinklePhase: random() * Math.PI * 2,
      });
    }
  }

  private createInitialPlayerState(): PlayerState {
    return {
      x: this.level.spawn.x,
      y: this.level.spawn.y,
      vx: 0,
      vy: 0,
      width: 28,
      height: 28,
      color: this.level.spawn.color,
      isGrounded: false,
      wasGrounded: false,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      squashX: 1,
      squashY: 1,
      rotation: 0,
      facing: this.level.spawn.color === 'RED' ? 1 : -1,
      blockedTimer: 0,
      indicatorFlipProgress: 1,
      walkCycle: 0,
      landTimer: 0,
      boostTimer: 0,
      isOnBoost: false,
    };
  }

  private initAmbientParticles() {
    this.ambientParticles = [];
    for (let i = 0; i < 45; i++) {
      this.ambientParticles.push({
        x: Math.random() * this.level.bounds.maxX,
        y: Math.random() * this.level.bounds.maxY,
        vx: (Math.random() - 0.5) * 15,
        vy: -10 - Math.random() * 20,
        size: 1 + Math.random() * 2,
        alpha: 0.15 + Math.random() * 0.35,
      });
    }
  }

  private bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  public unbindEvents() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.isRunning = false;
    this.bloomCanvas = null;
    this.bloomCtx = null;
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // Avoid interfering with browser shortcuts
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    this.keys[e.key.toLowerCase()] = true;
    this.keys[e.code] = true;

    if (e.key.toLowerCase() === 'r') {
      this.resetLevel();
      return;
    }

    // Toggle Camera View Mode: 'V' or 'C'
    if (e.key.toLowerCase() === 'v' || e.key.toLowerCase() === 'c') {
      this.toggleCameraMode();
      return;
    }

    if (e.key === ' ' || e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
      this.player.jumpBufferTimer = this.JUMP_BUFFER_TIME;
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = false;
    this.keys[e.code] = false;

    // Variable jump height cut
    if ((e.key === ' ' || e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') && this.player.vy < -150) {
      this.player.vy *= 0.5;
    }
  };

  public setTouchDirection(left: boolean, right: boolean) {
    this.touchInput.left = left;
    this.touchInput.right = right;
  }

  public setTouchJump(pressed: boolean) {
    this.touchInput.jump = pressed;
    if (pressed) {
      this.player.jumpBufferTimer = this.JUMP_BUFFER_TIME;
    } else if (this.player.vy < -150) {
      this.player.vy *= 0.5;
    }
  }

  public setCameraMode(mode: CameraViewMode) {
    this.camera.mode = mode;
    this.callbacks.onCameraModeChange?.(mode);
  }

  public toggleCameraMode(): CameraViewMode {
    const nextMode: CameraViewMode = this.camera.mode === 'FIT' ? 'FOLLOW' : 'FIT';
    this.setCameraMode(nextMode);
    return nextMode;
  }

  public getCameraMode(): CameraViewMode {
    return this.camera.mode;
  }

  public snapCameraToFit() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const viewportW = Math.max(320, this.canvas.width / dpr);
    const viewportH = Math.max(240, this.canvas.height / dpr);
    const isPortrait = viewportW < viewportH;
    const isMobileViewport = viewportW < 768 || isPortrait;

    const padTop = isMobileViewport ? 52 : this.padTop;
    const padBottom = isMobileViewport ? 95 : this.padBottom;
    const padLeft = isMobileViewport ? 20 : this.padLeft;
    const padRight = isMobileViewport ? 20 : this.padRight;

    const levelMinX = this.level.bounds.minX;
    const levelMaxX = this.level.bounds.maxX;
    const levelMinY = this.level.bounds.minY;
    const levelMaxY = this.level.bounds.maxY;
    const levelW = Math.max(100, levelMaxX - levelMinX);
    const levelH = Math.max(100, levelMaxY - levelMinY);

    const availW = Math.max(100, viewportW - (padLeft + padRight));
    const availH = Math.max(100, viewportH - (padTop + padBottom));

    const fitScale = Math.min(availW / levelW, availH / levelH);
    const cappedFitScale = Math.min(fitScale, 1.45);

    const levelCenterX = (levelMinX + levelMaxX) / 2;
    const levelCenterY = (levelMinY + levelMaxY) / 2;

    const shouldUseFollow = this.camera.mode === 'FOLLOW' || (isMobileViewport && cappedFitScale < 0.72);
    this.cameraLookahead = this.player.facing * (isMobileViewport ? 80 : 60);

    if (!shouldUseFollow) {
      this.camera.targetScale = cappedFitScale;
      this.camera.targetX = levelCenterX;
      this.camera.targetY = levelCenterY;
    } else {
      const followScale = isMobileViewport
        ? Math.max(0.78, Math.min(1.25, cappedFitScale * 1.65))
        : Math.min(Math.max(cappedFitScale * 1.35, 1.05), 1.6);
      this.camera.targetScale = followScale;

      let tx = this.player.x + this.player.width / 2 + this.cameraLookahead;
      let ty = this.player.y + this.player.height / 2 - (isPortrait ? 20 : 10);

      const halfW = (availW / 2) / followScale;
      const halfH = (availH / 2) / followScale;

      if (levelW > halfW * 2) {
        tx = Math.max(levelMinX + halfW, Math.min(levelMaxX - halfW, tx));
      } else {
        tx = levelCenterX;
      }

      if (levelH > halfH * 2) {
        ty = Math.max(levelMinY + halfH, Math.min(levelMaxY - halfH, ty));
      } else {
        ty = levelCenterY;
      }

      this.camera.targetX = tx;
      this.camera.targetY = ty;
    }

    this.camera.x = this.camera.targetX;
    this.camera.y = this.camera.targetY;
    this.camera.scale = this.camera.targetScale;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public resetLevel() {
    sound.playReset();
    this.player = this.createInitialPlayerState();
    this.bgHueProgress = this.player.color === 'RED' ? 1 : 0;
    this.particles = [];
    this.switchShockwaves = [];
    this.activeSwitchId = null;
    this.switchCooldownTimer = 0;
    this.switchFlashTimer = 0;
    this.stats.timeSeconds = 0;
    this.stats.jumps = 0;
    this.stats.switches = 0;
    this.stats.deaths++;
    this.stats.completed = false;
    this.isCompleting = false;
    this.completionTimer = 0;
    this.bloomPulseTimer = 0;
    this.callbacks.onColorChange(this.player.color);
    this.callbacks.onStatsUpdate({ ...this.stats });
    this.snapCameraToFit();
  }

  public loadLevel(level: LevelData) {
    this.level = level;
    this.resetLevel();
    this.initAmbientParticles();
    this.snapCameraToFit();
  }

  private loop = (currentTime: number) => {
    if (!this.isRunning) return;

    let dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Cap delta time to prevent physics tunnel spikes
    if (dt > 0.05) dt = 0.05;

    this.update(dt);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    if (this.isCompleting) {
      this.completionTimer += dt;
      // Pull player into exit vortex center
      const dx = this.level.exit.x - (this.player.x + this.player.width / 2);
      const dy = this.level.exit.y - (this.player.y + this.player.height / 2);
      this.player.x += dx * 6 * dt;
      this.player.y += dy * 6 * dt;
      this.player.squashX = Math.max(0.1, 1 - this.completionTimer * 1.2);
      this.player.squashY = Math.max(0.1, 1 - this.completionTimer * 1.2);
      this.player.rotation += 12 * dt;

      this.updateParticles(dt);
      if (this.completionTimer > 0.85 && !this.stats.completed) {
        this.stats.completed = true;
        this.callbacks.onLevelComplete({ ...this.stats });
      }
      return;
    }

    this.stats.timeSeconds += dt;
    this.callbacks.onStatsUpdate({ ...this.stats });

    // Smoothly interpolate background hue transition (1 = Red, 0 = Blue)
    const targetHue = this.player.color === 'RED' ? 1 : 0;
    this.bgHueProgress += (targetHue - this.bgHueProgress) * Math.min(1, dt * 4.5);

    if (this.switchCooldownTimer > 0) {
      this.switchCooldownTimer -= dt;
    }
    if (this.switchFlashTimer > 0) {
      this.switchFlashTimer -= dt;
    }
    if (this.player.indicatorFlipProgress < 1) {
      this.player.indicatorFlipProgress = Math.min(1, this.player.indicatorFlipProgress + dt * 8.0);
    }
    if (this.player.blockedTimer > 0) {
      this.player.blockedTimer -= dt;
    }
    if (this.player.landTimer > 0) {
      this.player.landTimer -= dt;
    }
    if (this.player.isGrounded && Math.abs(this.player.vx) > 15) {
      this.player.walkCycle = (this.player.walkCycle + dt * 4.2) % 1;
    }
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
    }
    if (this.bloomPulseTimer > 0) {
      this.bloomPulseTimer -= dt;
    }

    // Input collection
    const keyLeft = this.keys['arrowleft'] || this.keys['a'] || this.touchInput.left;
    const keyRight = this.keys['arrowright'] || this.keys['d'] || this.touchInput.right;

    let moveIntent = 0;
    if (keyLeft && !keyRight) moveIntent = -1;
    if (keyRight && !keyLeft) moveIntent = 1;

    // CORE MECHANIC: Direction Restriction based on State
    // Red moves ONLY Right (moveIntent > 0)
    // Blue moves ONLY Left (moveIntent < 0)
    let effectiveDirection = 0;
    if (this.player.color === 'RED') {
      if (moveIntent > 0) {
        effectiveDirection = 1;
      } else if (moveIntent < 0) {
        // Player tried to move Left while RED!
        // Subtle visual response from the direction indicator, no annoying error sound
        if (this.player.blockedTimer <= 0) {
          this.player.blockedTimer = 0.22;
        }
      }
    } else if (this.player.color === 'BLUE') {
      if (moveIntent < 0) {
        effectiveDirection = -1;
      } else if (moveIntent > 0) {
        // Player tried to move Right while BLUE!
        // Subtle visual response from the direction indicator, no annoying error sound
        if (this.player.blockedTimer <= 0) {
          this.player.blockedTimer = 0.22;
        }
      }
    }

    // SPEED BOOST FLOOR DETECTION (Independent World Object)
    const speedTiles = this.getAllSpeedTiles();
    let activeBoostTile: SpeedBoostTile | null = null;
    const playerBottom = this.player.y + this.player.height;
    const playerLeft = this.player.x;
    const playerRight = this.player.x + this.player.width;

    for (const st of speedTiles) {
      // Horizontal overlap
      if (playerRight > st.x + 3 && playerLeft < st.x + st.width - 3) {
        // Vertical proximity: feet near or on the tile top surface
        if (playerBottom >= st.y - 4 && playerBottom <= st.y + 14) {
          activeBoostTile = st;
          break;
        }
      }
    }

    const onBoostFloor = activeBoostTile !== null;
    this.player.isOnBoost = onBoostFloor;
    if (onBoostFloor && activeBoostTile) {
      this.player.boostTimer = 0.35;
      const now = performance.now() / 1000;
      if (now - this.lastBoostSfxTime > 0.26) {
        sound.playSpeedBoost(activeBoostTile.direction === 'RIGHT' ? 'RED' : 'BLUE');
        this.lastBoostSfxTime = now;
      }
    } else if (this.player.boostTimer > 0) {
      this.player.boostTimer -= dt;
    }

    // Horizontal Movement & Friction
    const isBoostActive = this.player.isOnBoost || (this.player.boostTimer > 0 && Math.abs(this.player.vx) > this.SPEED);
    const maxAllowedSpeed = isBoostActive ? this.BOOST_SPEED : this.SPEED;
    const currentAccel = onBoostFloor ? this.BOOST_ACCELERATION : this.ACCELERATION;

    if (onBoostFloor && activeBoostTile) {
      // Physical level object: Boost tile propels in its OWN fixed direction
      const boostDir = activeBoostTile.direction === 'RIGHT' ? 1 : -1;
      this.player.vx += boostDir * currentAccel * dt;

      // Ensure instant punchy acceleration floor threshold in the pad's direction
      if (boostDir > 0 && this.player.vx < 360) {
        this.player.vx = Math.max(this.player.vx, 360);
      } else if (boostDir < 0 && this.player.vx > -360) {
        this.player.vx = Math.min(this.player.vx, -360);
      }

      // Clamp to BOOST_SPEED
      if (Math.abs(this.player.vx) > maxAllowedSpeed) {
        this.player.vx = Math.sign(this.player.vx) * maxAllowedSpeed;
      }

      // Character facing is strictly anchored to its color (Red = 1 / Right, Blue = -1 / Left)
      // Boost NEVER overwrites the player's facing or color!
      this.player.facing = this.player.color === 'RED' ? 1 : -1;

      // Boost emission particles (high-speed jet streaks matching tile's color & direction)
      if (Math.random() < 0.65) {
        this.particles.push({
          x: this.player.x + (boostDir > 0 ? 0 : this.player.width),
          y: playerBottom - 2 + (Math.random() - 0.5) * 6,
          vx: -boostDir * (140 + Math.random() * 180),
          vy: -12 - Math.random() * 24,
          size: 2.5 + Math.random() * 2,
          alpha: 0.9,
          color: activeBoostTile.direction === 'RIGHT' ? '#ff3366' : '#00d4ff',
          maxLife: 0.22,
          life: 0.22,
          shape: 'line',
        });
      }
    } else if (effectiveDirection !== 0) {
      this.player.vx += effectiveDirection * currentAccel * dt;
      if (Math.abs(this.player.vx) > maxAllowedSpeed) {
        this.player.vx = Math.sign(this.player.vx) * maxAllowedSpeed;
      }
      // Character facing is strictly anchored to color (Red = 1 / Right, Blue = -1 / Left)
      this.player.facing = this.player.color === 'RED' ? 1 : -1;

      // Running trail particles
      if (this.player.isGrounded && Math.random() < 0.35) {
        this.particles.push({
          x: this.player.x + this.player.width / 2 + (Math.random() - 0.5) * 8,
          y: this.player.y + this.player.height,
          vx: -effectiveDirection * (30 + Math.random() * 40),
          vy: -10 - Math.random() * 20,
          size: 2.5 + Math.random() * 2,
          alpha: 0.7,
          color: this.player.color === 'RED' ? '#ff3366' : '#00d4ff',
          maxLife: 0.25,
          life: 0.25,
          shape: 'circle',
        });
      }
    } else {
      // Apply friction or smooth aerodynamic decay from boost momentum
      if (Math.abs(this.player.vx) > this.SPEED) {
        const excess = Math.abs(this.player.vx) - this.SPEED;
        const decay = Math.min(excess, 650 * dt);
        this.player.vx = Math.sign(this.player.vx) * (Math.abs(this.player.vx) - decay);
      } else {
        const frictionAmt = this.FRICTION * dt;
        if (Math.abs(this.player.vx) <= frictionAmt) {
          this.player.vx = 0;
        } else {
          this.player.vx -= Math.sign(this.player.vx) * frictionAmt;
        }
      }
    }

    // Gravity & Terminal Velocity
    this.player.vy += this.GRAVITY * dt;
    if (this.player.vy > 750) {
      this.player.vy = 750;
    }

    // Grounding & Coyote timer
    if (this.player.isGrounded) {
      this.player.coyoteTimer = this.COYOTE_TIME;
    } else {
      this.player.coyoteTimer -= dt;
    }

    // Jump buffer timer
    if (this.player.jumpBufferTimer > 0) {
      this.player.jumpBufferTimer -= dt;
    }

    // Jump execution (Coyote Time + Jump Buffer)
    if (this.player.jumpBufferTimer > 0 && this.player.coyoteTimer > 0) {
      this.player.vy = this.JUMP_VELOCITY;
      this.player.jumpBufferTimer = 0;
      this.player.coyoteTimer = 0;
      this.player.isGrounded = false;
      this.player.squashX = 0.75;
      this.player.squashY = 1.35;
      this.stats.jumps++;
      sound.playJump();

      // Jump dust explosion
      this.triggerJumpDust(this.player.x + this.player.width / 2, this.player.y + this.player.height);
    }

    // Move & Collide horizontally
    this.player.x += this.player.vx * dt;
    this.handleHorizontalCollisions();

    // Move & Collide vertically
    this.player.y += this.player.vy * dt;
    this.handleVerticalCollisions();

    // Animate squash / stretch recovery
    this.player.squashX += (1 - this.player.squashX) * 14 * dt;
    this.player.squashY += (1 - this.player.squashY) * 14 * dt;

    // Check bottom boundary fall (respawn if player falls into the abyss)
    if (this.player.y > this.level.bounds.maxY + 100) {
      this.resetLevel();
      return;
    }

    // Check Color Switch collisions
    this.checkColorSwitches();

    // Check Exit Portal collision
    this.checkExitPortal();

    // Update Particles
    this.updateParticles(dt);

    // Update Camera
    this.updateCamera(dt);
  }

  private handleHorizontalCollisions() {
    const LEDGE_STEP_TOLERANCE = 10; // Pixels near platform tops where players land rather than hitting walls

    for (const p of this.level.platforms) {
      if (this.isBoxColliding(this.player.x, this.player.y, this.player.width, this.player.height, p.x, p.y, p.width, p.height)) {
        // If it's a walkable platform (not a vertical barrier wall) and player is falling/level with feet near the top:
        // Treat this as an impending surface landing rather than a side-wall crash so horizontal momentum isn't killed.
        if (!p.isBarrier) {
          const playerBottom = this.player.y + this.player.height;
          if (playerBottom - p.y <= LEDGE_STEP_TOLERANCE && this.player.vy >= -50) {
            continue;
          }
        }

        if (this.player.vx > 0) {
          // Moving right hit left edge
          this.player.x = p.x - this.player.width;
          this.player.vx = 0;
        } else if (this.player.vx < 0) {
          // Moving left hit right edge
          this.player.x = p.x + p.width;
          this.player.vx = 0;
        }
      }
    }
  }

  private handleVerticalCollisions() {
    this.player.wasGrounded = this.player.isGrounded;
    this.player.isGrounded = false;

    for (const p of this.level.platforms) {
      // 1. Landing on top surface of platform (falling or flat vy >= 0)
      if (this.player.vy >= 0) {
        const playerBottom = this.player.y + this.player.height;
        // Check horizontal overlap with 2px corner leniency to prevent edge-slip drops
        const horizontalOverlap = this.player.x < p.x + p.width + 2 && this.player.x + this.player.width > p.x - 2;
        // Catch range: from 2px above the surface down to frame step distance + tolerance
        const maxCatchDistance = Math.max(14, this.player.vy * 0.025 + 6);

        if (horizontalOverlap && playerBottom >= p.y - 2 && playerBottom <= p.y + maxCatchDistance) {
          this.player.y = p.y - this.player.height;
          this.player.vy = 0;
          this.player.isGrounded = true;

          // Landing feedback
          if (!this.player.wasGrounded) {
            this.player.squashX = 1.35;
            this.player.squashY = 0.72;
            this.player.landTimer = 0.18;
            sound.playLand();
            this.triggerLandDust(this.player.x + this.player.width / 2, this.player.y + this.player.height);
          }
          continue;
        }
      }

      // 2. Head hitting ceiling or barrier underside (moving upwards vy < 0)
      if (this.player.vy < 0) {
        if (this.isBoxColliding(this.player.x, this.player.y, this.player.width, this.player.height, p.x, p.y, p.width, p.height)) {
          this.player.y = p.y + p.height;
          this.player.vy = 0;
          this.player.squashY = 0.85;
        }
      }
    }
  }

  private checkColorSwitches() {
    const px = this.player.x + this.player.width / 2;
    const py = this.player.y + this.player.height / 2;

    for (const sw of this.level.switches) {
      const dist = Math.hypot(px - sw.x, py - sw.y);

      // If this switch is currently latched (player entered and is still within perimeter):
      if (this.activeSwitchId === sw.id) {
        // Reset the latch only when the player has clearly moved away outside the vortex trigger zone
        if (dist > sw.radius + 24) {
          this.activeSwitchId = null;
        }
        // Do NOT trigger again while player is still inside or standing underneath on the platform!
        continue;
      }

      // Check if player entered the vortex (Forgiving activation collision):
      if (dist < sw.radius + 14) {
        if (this.switchCooldownTimer > 0) continue;

        // Latch this switch so landing or staying on the platform will NEVER flip back!
        this.activeSwitchId = sw.id;
        this.switchCooldownTimer = 0.35; // Brief cooldown for smoothness

        // Permanent Color & Direction Toggle
        const prevColor = this.player.color;
        const nextColor: PlayerColor = prevColor === 'RED' ? 'BLUE' : 'RED';
        this.player.color = nextColor;
        this.player.facing = nextColor === 'RED' ? 1 : -1;
        this.player.indicatorFlipProgress = 0; // Trigger directional arrow pop & sparkles animation
        this.stats.switches++;

        // Eliminate Direction-Shift Stutter:
        // Cancel opposing velocity so the player immediately flows with the new direction
        if (nextColor === 'RED') {
          if (this.player.vx < 0) this.player.vx = 0;
        } else if (nextColor === 'BLUE') {
          if (this.player.vx > 0) this.player.vx = 0;
        }
        this.player.blockedTimer = 0; // Clear any blocked warning state immediately

        // Camera micro-shake & pulse feedback
        this.shakeTimer = 0.18;
        this.shakeIntensity = 5;
        this.bloomPulseTimer = 0.45;
        this.switchFlashTimer = 0.18;
        this.switchFlashColor = nextColor === 'RED' ? '#ff3366' : '#00d4ff';

        // Play harmonic chime & notify React UI / HUD / Touch controls
        sound.playSwitch(nextColor);
        this.callbacks.onColorChange(nextColor);

        // Spawn expanding shockwave ring
        this.switchShockwaves.push({
          x: sw.x,
          y: sw.y,
          radius: 8,
          maxRadius: sw.radius + 36,
          color: nextColor === 'RED' ? '#ff3366' : '#00d4ff',
          life: 0.32,
          maxLife: 0.32,
        });

        // Trigger rich dual-colored particle explosion
        this.triggerSwitchBurst(sw.x, sw.y, nextColor, prevColor);
      }
    }
  }

  private checkExitPortal() {
    if (this.isCompleting) return;

    const px = this.player.x + this.player.width / 2;
    const py = this.player.y + this.player.height / 2;
    const ex = this.level.exit;

    const dist = Math.hypot(px - ex.x, py - ex.y);
    if (dist < ex.radius + 12) {
      this.isCompleting = true;
      this.completionTimer = 0;
      this.bloomPulseTimer = 0.8;
      sound.playLevelComplete();
      this.triggerPortalWinBurst(ex.x, ex.y);
    }
  }

  private isBoxColliding(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  private triggerJumpDust(x: number, y: number) {
    for (let i = 0; i < 7; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y - 2,
        vx: (Math.random() - 0.5) * 80,
        vy: -15 - Math.random() * 25,
        size: 2 + Math.random() * 2,
        alpha: 0.65,
        color: '#ffffff',
        maxLife: 0.22,
        life: 0.22,
      });
    }
  }

  private triggerLandDust(x: number, y: number) {
    for (let i = 0; i < 9; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y - 2,
        vx: (Math.random() - 0.5) * 110,
        vy: -20 - Math.random() * 30,
        size: 2 + Math.random() * 2.5,
        alpha: 0.7,
        color: this.player.color === 'RED' ? '#ff3366' : '#00d4ff',
        maxLife: 0.25,
        life: 0.25,
      });
    }
  }

  private triggerSparks(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 90,
        vy: -20 - Math.random() * 50,
        size: 1.5 + Math.random() * 2,
        alpha: 0.8,
        color,
        maxLife: 0.2,
        life: 0.2,
      });
    }
  }

  private triggerSwitchBurst(x: number, y: number, newColor: PlayerColor, prevColor?: PlayerColor) {
    const burstColor = newColor === 'RED' ? '#ff3366' : '#00d4ff';
    const altColor = prevColor ? (prevColor === 'RED' ? '#ff3366' : '#00d4ff') : (newColor === 'RED' ? '#00d4ff' : '#ff3366');

    // Energetic sparks in the new neon color
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 * i) / 24 + (Math.random() - 0.5) * 0.25;
      const speed = 90 + Math.random() * 180;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 3,
        alpha: 1,
        color: burstColor,
        maxLife: 0.38 + Math.random() * 0.18,
        life: 0.38 + Math.random() * 0.18,
        shape: 'spark',
      });
    }

    // Residual motes of previous color transforming/dissolving
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 2.5,
        alpha: 0.9,
        color: altColor,
        maxLife: 0.3 + Math.random() * 0.15,
        life: 0.3 + Math.random() * 0.15,
        shape: 'circle',
      });
    }

    // Brilliant white core explosion sparks
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 100;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 2,
        alpha: 1,
        color: '#ffffff',
        maxLife: 0.25,
        life: 0.25,
        shape: 'spark',
      });
    }
  }

  private triggerPortalWinBurst(x: number, y: number) {
    for (let i = 0; i < 48; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 200;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3.5,
        alpha: 1,
        color: Math.random() > 0.5 ? '#ffffff' : Math.random() > 0.5 ? '#00d4ff' : '#ff3366',
        maxLife: 0.8,
        life: 0.8,
        shape: 'circle',
      });
    }
  }

  private updateParticles(dt: number) {
    // Update switch shockwave rings
    for (let i = this.switchShockwaves.length - 1; i >= 0; i--) {
      const sw = this.switchShockwaves[i];
      sw.life -= dt;
      if (sw.life <= 0) {
        this.switchShockwaves.splice(i, 1);
        continue;
      }
      const progress = 1 - Math.max(0, sw.life / sw.maxLife);
      sw.radius = 8 + (sw.maxRadius - 8) * Math.sqrt(progress);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
    }

    // Ambient floating motes
    for (const ap of this.ambientParticles) {
      ap.x += ap.vx * dt;
      ap.y += ap.vy * dt;
      if (ap.y < 0) ap.y = this.level.bounds.maxY;
      if (ap.x < 0) ap.x = this.level.bounds.maxX;
      if (ap.x > this.level.bounds.maxX) ap.x = 0;
    }
  }

  private updateCamera(dt: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const viewportW = Math.max(320, this.canvas.width / dpr);
    const viewportH = Math.max(240, this.canvas.height / dpr);
    const isPortrait = viewportW < viewportH;
    const isMobileViewport = viewportW < 768 || isPortrait;

    const padTop = isMobileViewport ? 52 : this.padTop;
    const padBottom = isMobileViewport ? 95 : this.padBottom;
    const padLeft = isMobileViewport ? 20 : this.padLeft;
    const padRight = isMobileViewport ? 20 : this.padRight;

    const levelMinX = this.level.bounds.minX;
    const levelMaxX = this.level.bounds.maxX;
    const levelMinY = this.level.bounds.minY;
    const levelMaxY = this.level.bounds.maxY;
    const levelW = Math.max(100, levelMaxX - levelMinX);
    const levelH = Math.max(100, levelMaxY - levelMinY);

    const availW = Math.max(100, viewportW - (padLeft + padRight));
    const availH = Math.max(100, viewportH - (padTop + padBottom));

    const fitScale = Math.min(availW / levelW, availH / levelH);
    const cappedFitScale = Math.min(fitScale, 1.45);

    const levelCenterX = (levelMinX + levelMaxX) / 2;
    const levelCenterY = (levelMinY + levelMaxY) / 2;

    const shouldUseFollow = this.camera.mode === 'FOLLOW' || (isMobileViewport && cappedFitScale < 0.72);

    // Directional Lookahead smoothly follows player facing:
    // RED (facing = 1) -> +75px to +90px; BLUE (facing = -1) -> -75px to -90px.
    const targetLookahead = this.player.facing * (isMobileViewport ? 80 : 60);
    this.cameraLookahead += (targetLookahead - this.cameraLookahead) * Math.min(1, 5.5 * dt);

    if (!shouldUseFollow) {
      this.camera.targetScale = cappedFitScale;
      this.camera.targetX = levelCenterX;
      this.camera.targetY = levelCenterY;
    } else {
      const followScale = isMobileViewport
        ? Math.max(0.78, Math.min(1.25, cappedFitScale * 1.65))
        : Math.min(Math.max(cappedFitScale * 1.35, 1.05), 1.6);
      this.camera.targetScale = followScale;

      let tx = this.player.x + this.player.width / 2 + this.cameraLookahead;
      let ty = this.player.y + this.player.height / 2 - (isPortrait ? 20 : 10);

      const halfW = (availW / 2) / followScale;
      const halfH = (availH / 2) / followScale;

      if (levelW > halfW * 2) {
        tx = Math.max(levelMinX + halfW, Math.min(levelMaxX - halfW, tx));
      } else {
        tx = levelCenterX;
      }

      if (levelH > halfH * 2) {
        ty = Math.max(levelMinY + halfH, Math.min(levelMaxY - halfH, ty));
      } else {
        ty = levelCenterY;
      }

      this.camera.targetX = tx;
      this.camera.targetY = ty;
    }

    const factor = Math.min(1, (isMobileViewport ? 6.5 : 8) * dt);
    this.camera.scale += (this.camera.targetScale - this.camera.scale) * factor;
    this.camera.x += (this.camera.targetX - this.camera.x) * factor;
    this.camera.y += (this.camera.targetY - this.camera.y) * factor;
  }

  // MAIN RENDER LOOP
  private render() {
    const ctx = this.ctx;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;
    const viewportW = canvasW / dpr;
    const viewportH = canvasH / dpr;
    const isPortrait = viewportW < viewportH;
    const isMobileViewport = viewportW < 768 || isPortrait;
    const padTop = isMobileViewport ? 52 : this.padTop;
    const padBottom = isMobileViewport ? 95 : this.padBottom;

    // Parallax Scrolling Background with Dynamic Color-Hue Feedback Loop
    this.renderParallaxBackground(ctx, viewportW, viewportH, canvasW, canvasH, dpr);

    // Camera transform with screen shake
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeTimer > 0) {
      shakeX = (Math.random() - 0.5) * this.shakeIntensity;
      shakeY = (Math.random() - 0.5) * this.shakeIntensity;
    }

    const midY = (viewportH + padTop - padBottom) / 2;
    ctx.translate(Math.round(viewportW / 2 + shakeX), Math.round(midY + shakeY));
    ctx.scale(this.camera.scale, this.camera.scale);
    ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));

    // Ambient floating particles
    for (const ap of this.ambientParticles) {
      ctx.fillStyle = `rgba(255, 255, 255, ${ap.alpha * 0.25})`;
      ctx.beginPath();
      ctx.arc(ap.x, ap.y, ap.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render Environmental Depth & Architectural Conduits (Visual progression for Level 2)
    this.renderEnvironmentalDepth(ctx);

    // Render Hints & Environmental Labels
    this.renderLevelHints(ctx);

    // Render Platforms
    this.renderPlatforms(ctx);

    // Render Speed Boost Floor Tiles
    this.renderSpeedBoostTiles(ctx);

    // Render Color Switches
    this.renderColorSwitches(ctx);

    // Render Exit Portal
    this.renderExitPortal(ctx);

    // Render Particles
    this.renderParticles(ctx);

    // Render Player
    this.renderPlayer(ctx);

    // Short crisp switch flash burst around player/switch
    if (this.switchFlashTimer > 0) {
      const flashProgress = this.switchFlashTimer / 0.18;
      const flashAlpha = flashProgress * 0.35;
      const px = this.player.x + this.player.width / 2;
      const py = this.player.y + this.player.height / 2;
      const isRedSwitch = this.switchFlashColor === '#ff3366';

      ctx.save();
      const flashGrad = ctx.createRadialGradient(px, py, 2, px, py, 80);
      flashGrad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha * 1.2})`);
      flashGrad.addColorStop(0.35, isRedSwitch ? `rgba(255, 51, 102, ${flashAlpha})` : `rgba(0, 212, 255, ${flashAlpha})`);
      flashGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.arc(px, py, 80, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();

    // Subtle screen-space light wash on color transition
    if (this.switchFlashTimer > 0) {
      const flashProgress = this.switchFlashTimer / 0.18;
      const washAlpha = flashProgress * 0.07;
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${washAlpha})`;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.restore();
    }

    // POST-PROCESSING BLOOM PASS:
    // Refined, subtle optical glow highlighting neon filaments without hazy over-saturation.
    this.applyBloomPass();
  }

  private renderParallaxBackground(
    ctx: CanvasRenderingContext2D,
    viewportW: number,
    viewportH: number,
    canvasW: number,
    canvasH: number,
    dpr: number
  ) {
    const time = performance.now() / 1000;
    const t = this.bgHueProgress; // 0 = Blue (Left), 1 = Red (Right)

    // Deep void base background color:
    // Red: rgb(14, 8, 18) (#0e0812)
    // Blue: rgb(6, 9, 19) (#060913)
    const bgR = Math.round(6 + t * 8);
    const bgG = Math.round(9 - t * 1);
    const bgB = Math.round(19 - t * 1);

    // Dynamic primary accent hue (Electric Cyan <-> Neon Crimson):
    // Blue: rgb(0, 212, 255)
    // Red:  rgb(255, 51, 102)
    const hR = Math.round(0 + t * 255);
    const hG = Math.round(212 - t * 161);
    const hB = Math.round(255 - t * 153);

    // Secondary harmonic hue (Deep Azure <-> Warm Magenta Violet):
    const sR = Math.round(30 + t * 180);
    const sG = Math.round(110 - t * 65);
    const sB = Math.round(220 - t * 80);

    // 1. PHYSICAL CANVAS BASE CLEAR
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
    ctx.fillRect(0, 0, canvasW, canvasH);

    // 2. LOGICAL VIEWPORT COORDINATES FOR PARALLAX MULTI-LAYERS
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const camX = this.camera.x;
    const camY = this.camera.y;

    // --- LAYER 0: DEEP ATMOSPHERIC PARALLAX NEBULAS (Factor: 0.035) ---
    const neb1X = viewportW * 0.3 - camX * 0.035;
    const neb1Y = viewportH * 0.35 - camY * 0.035 + Math.sin(time * 0.4) * 8;
    const neb1Radius = Math.max(viewportW, viewportH) * 0.65;
    const neb1Grad = ctx.createRadialGradient(neb1X, neb1Y, 10, neb1X, neb1Y, neb1Radius);
    neb1Grad.addColorStop(0, `rgba(${hR}, ${hG}, ${hB}, 0.065)`);
    neb1Grad.addColorStop(0.45, `rgba(${sR}, ${sG}, ${sB}, 0.025)`);
    neb1Grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = neb1Grad;
    ctx.fillRect(0, 0, viewportW, viewportH);

    const neb2X = viewportW * 0.75 - camX * 0.05;
    const neb2Y = viewportH * 0.65 - camY * 0.05 - Math.cos(time * 0.5) * 8;
    const neb2Radius = Math.max(viewportW, viewportH) * 0.55;
    const neb2Grad = ctx.createRadialGradient(neb2X, neb2Y, 10, neb2X, neb2Y, neb2Radius);
    neb2Grad.addColorStop(0, `rgba(${sR}, ${sG}, ${sB}, 0.05)`);
    neb2Grad.addColorStop(0.5, `rgba(${hR}, ${hG}, ${hB}, 0.015)`);
    neb2Grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = neb2Grad;
    ctx.fillRect(0, 0, viewportW, viewportH);

    // --- LAYER 1: FAR CYBERNETIC STRUCTURES & SILHOUETTE CONDUITS (Factor: 0.10) ---
    ctx.save();
    ctx.strokeStyle = `rgba(${hR}, ${hG}, ${hB}, 0.038)`;
    ctx.lineWidth = 1;
    const structureSpacing = 160;
    const p1OffsetX = (-(camX * 0.10) % structureSpacing + structureSpacing) % structureSpacing - structureSpacing;
    const p1OffsetY = (-(camY * 0.10) % 240 + 240) % 240 - 240;

    ctx.beginPath();
    for (let x = p1OffsetX; x < viewportW + structureSpacing; x += structureSpacing) {
      // Tall architectural conduit pylon
      ctx.moveTo(x, 0);
      ctx.lineTo(x, viewportH);
      // Horizontal structural crossbeam
      const beamY = ((viewportH * 0.4 + p1OffsetY + (Math.abs(Math.round(x)) % 3) * 40) % viewportH + viewportH) % viewportH;
      ctx.moveTo(x - 14, beamY);
      ctx.lineTo(x + 14, beamY);
      // Secondary structural node marker
      const nodeY = ((viewportH * 0.7 + p1OffsetY) % viewportH + viewportH) % viewportH;
      ctx.moveTo(x - 3, nodeY);
      ctx.lineTo(x + 3, nodeY);
    }
    ctx.stroke();

    // Far horizontal circuit horizon grid lines
    ctx.strokeStyle = `rgba(${sR}, ${sG}, ${sB}, 0.022)`;
    ctx.beginPath();
    for (let y = p1OffsetY; y < viewportH + 120; y += 120) {
      ctx.moveTo(0, y);
      ctx.lineTo(viewportW, y);
    }
    ctx.stroke();
    ctx.restore();

    // --- LAYER 2: MID-DEPTH NEON GRID & INTERSECTION RETICLES (Factor: 0.25) ---
    ctx.save();
    const gridSpacing = 64;
    const ox = (-(camX * 0.25) % gridSpacing + gridSpacing) % gridSpacing - gridSpacing;
    const oy = (-(camY * 0.25) % gridSpacing + gridSpacing) % gridSpacing - gridSpacing;

    ctx.strokeStyle = `rgba(${hR}, ${hG}, ${hB}, 0.028)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = ox; x < viewportW + gridSpacing; x += gridSpacing) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, viewportH);
    }
    for (let y = oy; y < viewportH + gridSpacing; y += gridSpacing) {
      ctx.moveTo(0, y);
      ctx.lineTo(viewportW, y);
    }
    ctx.stroke();

    // Glowing micro-dots at grid intersections
    ctx.fillStyle = `rgba(${hR}, ${hG}, ${hB}, 0.065)`;
    for (let x = ox; x < viewportW + gridSpacing; x += gridSpacing) {
      for (let y = oy; y < viewportH + gridSpacing; y += gridSpacing) {
        ctx.fillRect(x - 1, y - 1, 2, 2);
      }
    }
    ctx.restore();

    // --- LAYER 3: PARALLAX FLOATING DUST & TWINKLING STARFIELD (Factors: 0.15 & 0.38) ---
    ctx.save();
    const wrapW = viewportW + 160;
    const wrapH = viewportH + 160;

    for (let i = 0; i < this.parallaxStars.length; i++) {
      const star = this.parallaxStars[i];
      const factor = star.layer === 0 ? 0.15 : 0.38;
      const driftY = (time * (star.layer === 0 ? 4 : 8)) % wrapH;

      const sx = (((star.x - camX * factor) % wrapW) + wrapW) % wrapW - 80;
      const sy = (((star.y - camY * factor - driftY) % wrapH) + wrapH) % wrapH - 80;

      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7;
      const alpha = star.baseAlpha * twinkle * (star.layer === 0 ? 0.45 : 0.75);

      ctx.fillStyle = star.layer === 0
        ? `rgba(${sR}, ${sG}, ${sB}, ${alpha})`
        : `rgba(${hR}, ${hG}, ${hB}, ${alpha})`;

      ctx.beginPath();
      ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // --- LAYER 4: CINEMATIC VIGNETTE ---
    const vigRadius = Math.max(viewportW, viewportH) * 0.75;
    const vigGrad = ctx.createRadialGradient(
      viewportW / 2,
      viewportH / 2,
      Math.min(viewportW, viewportH) * 0.35,
      viewportW / 2,
      viewportH / 2,
      vigRadius
    );
    vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, viewportW, viewportH);

    ctx.restore();
  }

  private ensureBloomBuffers() {
    // 0.5x downsampling provides cinematic soft diffusion with minimal fill-rate cost
    const targetW = Math.max(1, Math.floor(this.canvas.width / 2));
    const targetH = Math.max(1, Math.floor(this.canvas.height / 2));

    if (!this.bloomCanvas) {
      this.bloomCanvas = document.createElement('canvas');
      this.bloomCtx = this.bloomCanvas.getContext('2d', { willReadFrequently: false });
    }

    if (this.bloomCanvas && (this.bloomW !== targetW || this.bloomH !== targetH)) {
      this.bloomW = targetW;
      this.bloomH = targetH;
      this.bloomCanvas.width = targetW;
      this.bloomCanvas.height = targetH;
    }
  }

  private applyBloomPass() {
    this.ensureBloomBuffers();
    if (!this.bloomCanvas || !this.bloomCtx) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const bw = this.bloomW;
    const bh = this.bloomH;

    if (w <= 0 || h <= 0 || bw <= 0 || bh <= 0) return;

    // STEP 1: Brightness extraction & thresholding
    // Extract neon red (#ff3366), cyan (#00d4ff), and crisp cores without blinding over-saturation
    this.bloomCtx.clearRect(0, 0, bw, bh);
    this.bloomCtx.save();
    try {
      this.bloomCtx.filter = 'contrast(125%) brightness(105%)';
    } catch {
      // Fallback if filter is unsupported
    }
    this.bloomCtx.drawImage(this.canvas, 0, 0, w, h, 0, 0, bw, bh);
    this.bloomCtx.restore();

    // Dynamic subtle surge when switching colors or entering portal
    const pulseBoost = this.bloomPulseTimer > 0 ? this.bloomPulseTimer * 0.2 : 0;

    // STEP 2: Subtle Multi-Octave Additive Screen Composite
    // Blends soft, restrained bloom halos over the base game scene, keeping the screen crisp and legible.
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Direct 1:1 physical canvas coordinates
    ctx.globalCompositeOperation = 'screen';

    try {
      // Octave 1: Crisp Neon Filament Edge Glow (Sharp & Restrained)
      ctx.filter = 'blur(4px)';
      ctx.globalAlpha = Math.min(0.28, 0.14 + pulseBoost * 0.1);
      ctx.drawImage(this.bloomCanvas, 0, 0, bw, bh, 0, 0, w, h);

      // Octave 2: Gentle Local Neon Bleed (Soft Ambient Kiss)
      ctx.filter = 'blur(10px)';
      ctx.globalAlpha = Math.min(0.18, 0.07 + pulseBoost * 0.06);
      ctx.drawImage(this.bloomCanvas, 0, 0, bw, bh, 0, 0, w, h);
    } catch {
      // Graceful fallback for non-filter environments
      ctx.globalAlpha = 0.12;
      ctx.drawImage(this.bloomCanvas, 0, 0, bw, bh, 0, 0, w, h);
    }

    ctx.restore();
  }

  private renderEnvironmentalDepth(ctx: CanvasRenderingContext2D) {
    const time = performance.now() / 1000;

    if (this.level.id === 2) {
      ctx.save();
      // Decorative vertical conduit between Tier 1 right and Tier 2 right
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(1190, 205);
      ctx.lineTo(1190, 275);
      ctx.lineTo(1110, 390);
      ctx.stroke();

      // Decorative conduit between Tier 2 left and Tier 3 left
      ctx.strokeStyle = 'rgba(255, 51, 102, 0.08)';
      ctx.beginPath();
      ctx.moveTo(270, 365);
      ctx.lineTo(270, 440);
      ctx.lineTo(320, 540);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.restore();
    } else if (this.level.id === 3) {
      ctx.save();
      // Subtle architectural conduits tracing the chasm descent and ascent
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.moveTo(380, 360);
      ctx.lineTo(580, 520);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 51, 102, 0.08)';
      ctx.beginPath();
      ctx.moveTo(960, 480);
      ctx.lineTo(480, 440);
      ctx.lineTo(380, 360);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.restore();
    } else if (this.level.id === 4) {
      ctx.save();
      // Subtle architectural conduits tracing the yawning chasm of The Gap
      ctx.strokeStyle = 'rgba(255, 51, 102, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 10]);
      ctx.beginPath();
      ctx.moveTo(350, 340);
      ctx.lineTo(515, 450);
      ctx.lineTo(680, 350);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(0, 212, 255, 0.08)';
      ctx.beginPath();
      ctx.moveTo(870, 260);
      ctx.lineTo(650, 225);
      ctx.lineTo(320, 150);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.restore();
    }
  }

  private renderLevelHints(ctx: CanvasRenderingContext2D) {
    if (!this.level.hints || this.level.hints.length === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const viewportW = this.canvas.width / dpr;
    const viewportH = this.canvas.height / dpr;
    const isMobile = viewportW < 768 || viewportW < viewportH;

    ctx.save();
    ctx.textAlign = 'center';

    for (const hint of this.level.hints) {
      // Determine adapted text and subtext for mobile vs desktop
      let text = hint.text;
      let subtext = hint.subtext;

      if (isMobile) {
        if (hint.direction === 'jump' || hint.text === 'SPACE') {
          text = 'JUMP ↑';
          subtext = undefined;
        } else if (hint.text === 'MOVE RIGHT') {
          text = 'MOVE RIGHT →';
          subtext = undefined;
        } else if (hint.text === 'BLUE') {
          text = 'BLUE ←';
          subtext = undefined;
        } else if (hint.text === 'COLOR SWITCH') {
          text = 'COLOR SWITCH';
          subtext = 'REVERSE';
        } else if (hint.text === 'REACH THE EXIT') {
          text = 'EXIT 🏁';
          subtext = undefined;
        } else if (subtext && (subtext.includes('Press') || subtext.includes('Enter'))) {
          subtext = undefined;
        }
      }

      // Contextual auto-fade: smoothly fade out after player passes that section
      let alpha = 1.0;
      if (hint.direction === 'right' || text.includes('RIGHT') || text.includes('JUMP')) {
        if (this.player.x > hint.x + 35) {
          alpha = Math.max(0, 1 - (this.player.x - (hint.x + 35)) / 90);
        }
      } else if (hint.direction === 'left' || text.includes('BLUE')) {
        if (this.player.x < hint.x - 35) {
          alpha = Math.max(0, 1 - ((hint.x - 35) - this.player.x) / 90);
        }
      }

      if (alpha <= 0.02) continue;

      const fontSize = isMobile ? 11 : 13;
      ctx.font = `600 ${fontSize}px "Chakra Petch", monospace`;
      const mainMetrics = ctx.measureText(text);
      let badgeWidth = Math.max(isMobile ? 70 : 100, mainMetrics.width + (isMobile ? 16 : 24));

      if (subtext) {
        ctx.font = `500 ${isMobile ? 8 : 10}px "Plus Jakarta Sans", sans-serif`;
        const subMetrics = ctx.measureText(subtext);
        badgeWidth = Math.max(badgeWidth, subMetrics.width + (isMobile ? 16 : 24));
      }

      const badgeHeight = subtext ? (isMobile ? 28 : 36) : (isMobile ? 20 : 24);
      const bx = hint.x - badgeWidth / 2;
      const by = hint.y - badgeHeight / 2;

      // Semi-transparent dark pill background
      ctx.fillStyle = `rgba(9, 11, 20, ${0.78 * alpha})`;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.18 * alpha})`;
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.roundRect(bx, by, badgeWidth, badgeHeight, 5);
      ctx.fill();
      ctx.stroke();

      // Text color based on direction
      if (hint.direction === 'right' || text.includes('RIGHT')) {
        ctx.fillStyle = `rgba(255, 51, 102, ${alpha})`;
      } else if (hint.direction === 'left' || text.includes('LEFT') || text.includes('BLUE')) {
        ctx.fillStyle = `rgba(0, 212, 255, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      }

      ctx.font = `700 ${fontSize}px "Chakra Petch", monospace`;
      ctx.fillText(text, hint.x, hint.y + (subtext ? -2 : (isMobile ? 3.5 : 4.5)));

      if (subtext) {
        ctx.font = `500 ${isMobile ? 8 : 10}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.65 * alpha})`;
        ctx.fillText(subtext, hint.x, hint.y + (isMobile ? 9 : 11));
      }
    }
    ctx.restore();
  }

  private renderPlatforms(ctx: CanvasRenderingContext2D) {
    const time = performance.now() / 1000;

    for (const p of this.level.platforms) {
      ctx.save();

      if (p.isBarrier) {
        if (p.label === 'RAISED') {
          // Step 6 Raised platform obstacle block
          ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(p.x, p.y, p.width, p.height, 4);
          ctx.fill();
          ctx.stroke();

          // Top bright neon rim
          ctx.strokeStyle = '#00d4ff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p.x + 2, p.y + 1);
          ctx.lineTo(p.x + p.width - 2, p.y + 1);
          ctx.stroke();

          // Diagonal step warning stripes
          ctx.strokeStyle = 'rgba(0, 212, 255, 0.35)';
          ctx.lineWidth = 1.5;
          for (let sx = p.x + 10; sx < p.x + p.width + p.height; sx += 18) {
            ctx.beginPath();
            const startX = sx;
            const startY = p.y + 3;
            const endX = sx - 15;
            const endY = p.y + p.height - 3;
            if (startX > p.x && endX < p.x + p.width) {
              ctx.moveTo(Math.max(p.x + 2, endX), Math.min(p.y + p.height - 3, endY));
              ctx.lineTo(Math.min(p.x + p.width - 2, startX), Math.max(p.y + 3, startY));
              ctx.stroke();
            }
          }
        } else {
          // Harmless barrier wall (Step 4)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(p.x, p.y, p.width, p.height, 4);
          ctx.fill();
          ctx.stroke();

          // Neon warning vertical notches
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          for (let ny = p.y + 12; ny < p.y + p.height - 8; ny += 14) {
            ctx.beginPath();
            ctx.moveTo(p.x + 3, ny);
            ctx.lineTo(p.x + p.width - 3, ny);
            ctx.stroke();
          }
        }
      } else {
        // Clean neon white platform (Step 1 visual style)
        // Soft bottom drop-shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(p.x, p.y + p.height, p.width, 7);

        // Visual Progression for Level 2: Floating platform neon underglow & suspension anchors
        if (p.floating) {
          // Underglow ambient light
          const underGlow = ctx.createLinearGradient(p.x, p.y + p.height, p.x, p.y + p.height + 16);
          underGlow.addColorStop(0, 'rgba(0, 212, 255, 0.18)');
          underGlow.addColorStop(1, 'rgba(0, 212, 255, 0)');
          ctx.fillStyle = underGlow;
          ctx.fillRect(p.x + 8, p.y + p.height, p.width - 16, 16);

          // Suspension anchor brackets
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fillRect(p.x + 10, p.y + p.height, 6, 5);
          ctx.fillRect(p.x + p.width - 16, p.y + p.height, 6, 5);

          // Subtle floating pulse dot under center
          const pulseAlpha = 0.4 + Math.sin(time * 3 + p.x * 0.01) * 0.3;
          ctx.fillStyle = `rgba(0, 212, 255, ${pulseAlpha})`;
          ctx.beginPath();
          ctx.arc(p.x + p.width / 2, p.y + p.height + 2, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Platform base
        const grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
        grad.addColorStop(1, 'rgba(220, 225, 235, 0.88)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.width, p.height, 5);
        ctx.fill();

        // Top glowing neon edge highlight
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x + 4, p.y + 1);
        ctx.lineTo(p.x + p.width - 4, p.y + 1);
        ctx.stroke();

        // Subtle tech grid lines on platform edge
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 1;
        for (let px = p.x + 30; px < p.x + p.width - 10; px += 40) {
          ctx.beginPath();
          ctx.moveTo(px, p.y + 3);
          ctx.lineTo(px, p.y + p.height - 3);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  private getAllSpeedTiles(): SpeedBoostTile[] {
    return this.level.speedTiles || [];
  }

  private renderSpeedBoostTiles(ctx: CanvasRenderingContext2D) {
    const tiles = this.getAllSpeedTiles();
    if (tiles.length === 0) return;

    const time = performance.now() / 1000;

    for (const tile of tiles) {
      ctx.save();

      const tx = tile.x;
      const ty = tile.y;
      const tw = tile.width;
      const th = Math.max(8, tile.height ?? 8);

      // Independent fixed tile identity:
      // RIGHT boost: Neon crimson (#ff3366, rgb(255, 51, 102))
      // LEFT boost: Electric cyan (#00d4ff, rgb(0, 212, 255))
      const isRight = tile.direction === 'RIGHT';
      const r = isRight ? 255 : 0;
      const g = isRight ? 51 : 212;
      const b = isRight ? 102 : 255;
      const glowHex = isRight ? '#ff3366' : '#00d4ff';

      // Check if player is on this specific tile
      const playerOver = this.player.isOnBoost &&
        (this.player.x + this.player.width > tx && this.player.x < tx + tw);

      // 1. UNDERGLOW & AMBIENT EMISSION
      // Radiates soft red or cyan glow into the environment based on tile's direction
      const glowGrad = ctx.createRadialGradient(
        tx + tw / 2, ty + th / 2, 4,
        tx + tw / 2, ty + th / 2, Math.max(tw * 0.55, 36)
      );
      const glowAlpha = playerOver ? 0.45 : 0.22;
      glowGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${glowAlpha})`);
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(tx - 24, ty - 16, tw + 48, th + 32);

      // 2. METALLIC CASING BASE (Dark cyber plate)
      ctx.fillStyle = 'rgba(12, 15, 24, 0.96)';
      ctx.beginPath();
      ctx.roundRect(tx, ty, tw, th, 4);
      ctx.fill();

      // Recessed interior track bed
      ctx.fillStyle = `rgba(${Math.round(r * 0.15)}, ${Math.round(g * 0.15)}, ${Math.round(b * 0.15)}, 0.85)`;
      ctx.beginPath();
      ctx.roundRect(tx + 2, ty + 1, tw - 4, th - 2, 3);
      ctx.fill();

      // 3. NEON RAIL BORDERS
      // Top and bottom illuminated guide rails
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${playerOver ? 0.95 : 0.55})`;
      ctx.lineWidth = playerOver ? 1.8 : 1.2;
      ctx.beginPath();
      ctx.moveTo(tx + 2, ty + 1);
      ctx.lineTo(tx + tw - 2, ty + 1);
      ctx.moveTo(tx + 2, ty + th - 1);
      ctx.lineTo(tx + tw - 2, ty + th - 1);
      ctx.stroke();

      // 4. ANIMATED KINETIC DIRECTIONAL CHEVRONS
      // RIGHT: Point RIGHT (>>>), flowing rightwards
      // LEFT: Point LEFT (<<<), flowing leftwards
      const chevronSpacing = 22;
      const chevronDir = isRight ? 1 : -1;
      const flowSpeed = playerOver ? 72 : 44;
      const flowOffset = (chevronDir * time * flowSpeed) % chevronSpacing;

      ctx.save();
      // Clip to interior track so arrows don't bleed outside the pad
      ctx.beginPath();
      ctx.rect(tx + 4, ty, tw - 8, th);
      ctx.clip();

      ctx.lineWidth = playerOver ? 2.4 : 1.8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Draw flowing chevrons across the full width of the tile
      const arrowDepth = 6;
      const arrowHalfH = (th - 4) / 2;
      const startX = tx - chevronSpacing + ((flowOffset % chevronSpacing + chevronSpacing) % chevronSpacing);

      for (let cx = startX; cx < tx + tw + chevronSpacing; cx += chevronSpacing) {
        // Distance-based wave modulation across tile
        const relPos = Math.max(0, Math.min(1, (cx - tx) / tw));
        // Stagger pulse
        const wave = Math.sin(time * 8 + (isRight ? relPos : (1 - relPos)) * Math.PI * 2) * 0.25 + 0.75;
        const arrowAlpha = Math.min(1, (playerOver ? 0.95 : 0.75) * wave);

        ctx.strokeStyle = playerOver
          ? (Math.random() > 0.35 ? '#ffffff' : glowHex)
          : `rgba(${r}, ${g}, ${b}, ${arrowAlpha})`;
        ctx.shadowColor = glowHex;
        ctx.shadowBlur = playerOver ? 8 : 4;

        ctx.beginPath();
        if (isRight) {
          // Pointing RIGHT (>>>)
          ctx.moveTo(cx - arrowDepth, ty + th / 2 - arrowHalfH);
          ctx.lineTo(cx, ty + th / 2);
          ctx.lineTo(cx - arrowDepth, ty + th / 2 + arrowHalfH);
        } else {
          // Pointing LEFT (<<<)
          ctx.moveTo(cx + arrowDepth, ty + th / 2 - arrowHalfH);
          ctx.lineTo(cx, ty + th / 2);
          ctx.lineTo(cx + arrowDepth, ty + th / 2 + arrowHalfH);
        }
        ctx.stroke();
      }
      ctx.restore();

      // 5. SIDE TERMINAL BRACKETS & LED STATUS INDICATORS
      // Left and right mounting caps with micro-LEDs
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(tx, ty + 1, 3, th - 2);
      ctx.fillRect(tx + tw - 3, ty + 1, 3, th - 2);

      // Micro LED dots (illuminating the launch exit direction)
      const ledActive = isRight ? tx + tw - 2 : tx + 2;
      ctx.fillStyle = glowHex;
      ctx.shadowColor = glowHex;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(ledActive, ty + th / 2, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // 6. ACTIVE OVERDRIVE FLASH WHEN PLAYER CONTACTS
      if (playerOver) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.roundRect(tx, ty, tw, th, 4);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private renderColorSwitches(ctx: CanvasRenderingContext2D) {
    const time = performance.now() / 1000;
    const isLevel2OrMulti = this.level.switches.length > 1;
    const px = this.player.x + this.player.width / 2;
    const py = this.player.y + this.player.height / 2;

    // Render expanding switch shockwaves first
    for (const ring of this.switchShockwaves) {
      const p = 1 - Math.max(0, ring.life / ring.maxLife);
      ctx.save();
      ctx.strokeStyle = ring.color;
      ctx.shadowColor = ring.color;
      ctx.shadowBlur = 10;
      ctx.lineWidth = Math.max(1.2, 3.5 * (1 - p));
      ctx.globalAlpha = Math.max(0, (1 - p) * 0.8);
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    for (const sw of this.level.switches) {
      ctx.save();
      ctx.translate(sw.x, sw.y);

      // Distance to player center
      const dist = Math.hypot(px - sw.x, py - sw.y);
      const isLatched = this.activeSwitchId === sw.id;

      // 3 CLEAR STATES:
      // 1. IDLE: dist >= nearRadius (tight radius, ~48px) -> approach = 0
      // 2. NEAR / READY: triggerRadius <= dist < nearRadius -> subtle restrained reaction
      // 3. ACTIVATED: dist < triggerRadius -> handled in checkColorSwitches
      const triggerRadius = sw.radius + 14; // Forgiving activation threshold (~40px)
      const nearRadius = sw.radius + 22;    // Visually tight near radius (~48px, slightly larger than player size)

      // Approach factor: strictly 0 when outside nearRadius or when latched
      let approach = 0;
      if (!isLatched && dist < nearRadius) {
        approach = Math.max(0, Math.min(1, (nearRadius - dist) / (nearRadius - triggerRadius)));
      }

      // Dynamic rotation: calm slow idle (1.4 rad/s), subtly accelerating to ~2.1 rad/s when very close
      const rotSpeed = 1.4 + approach * 0.7;
      const rot = time * rotSpeed;

      // Outer radial glow:
      // IDLE: minimal, tight glow with very low opacity
      // NEAR: subtle, restrained increase
      const glowRadius = sw.radius * 1.35 + approach * 5;
      const glowGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, glowRadius);
      glowGrad.addColorStop(0, `rgba(255, 255, 255, ${0.08 + approach * 0.08})`);
      glowGrad.addColorStop(0.4, `rgba(0, 212, 255, ${0.04 + approach * 0.06})`);
      glowGrad.addColorStop(0.75, `rgba(255, 51, 102, ${0.03 + approach * 0.05})`);
      glowGrad.addColorStop(1, 'rgba(255, 51, 102, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Near/Ready state: very subtle particle activity (2 tiny motes orbiting rim only when very close)
      if (approach > 0.35) {
        ctx.save();
        for (let i = 0; i < 2; i++) {
          const wAngle = time * 3.5 + i * Math.PI;
          const wR = sw.radius * 1.05;
          ctx.fillStyle = i === 0 ? 'rgba(0, 212, 255, 0.7)' : 'rgba(255, 51, 102, 0.7)';
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 3;
          ctx.beginPath();
          ctx.arc(Math.cos(wAngle) * wR, Math.sin(wAngle) * wR, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Gentle ambient pulse wave (faint, slow)
      const pulseProgress = (time * (1.0 + approach * 0.4)) % 1;
      const pulseR = sw.radius + pulseProgress * 12;
      ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - pulseProgress) * (0.12 + approach * 0.12)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
      ctx.stroke();

      // Dual color rings
      ctx.rotate(rot);

      // Red arc
      ctx.strokeStyle = '#ff3366';
      ctx.lineWidth = 2.4 + approach * 0.6;
      ctx.shadowColor = '#ff3366';
      ctx.shadowBlur = 4 + approach * 3;
      ctx.beginPath();
      ctx.arc(0, 0, sw.radius, 0, Math.PI * 0.85);
      ctx.stroke();

      // Blue arc
      ctx.strokeStyle = '#00d4ff';
      ctx.shadowColor = '#00d4ff';
      ctx.beginPath();
      ctx.arc(0, 0, sw.radius, Math.PI, Math.PI * 1.85);
      ctx.stroke();

      // Inner pulsating core vortex
      ctx.rotate(-rot * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 3 + approach * 3;
      ctx.beginPath();
      const coreR = 8.5 + approach * 1.5 + Math.sin(time * 4) * 0.8;
      ctx.arc(0, 0, coreR, 0, Math.PI * 2);
      ctx.fill();

      // Procedural Vector Vortex Swirl Glyph (Platform-independent)
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#08090f';
      ctx.beginPath();
      ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
      ctx.fill();

      // Dual intertwined swirl arms in neon contrast
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';

      // Red swirl arm
      ctx.strokeStyle = '#ff3366';
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 0.9);
      ctx.stroke();

      // Blue swirl arm
      ctx.strokeStyle = '#00d4ff';
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, Math.PI, Math.PI * 1.9);
      ctx.stroke();

      // Center bright singularity dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 1.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  private renderExitPortal(ctx: CanvasRenderingContext2D) {
    const time = performance.now() / 1000;
    const ex = this.level.exit;

    ctx.save();
    ctx.translate(ex.x, ex.y);

    // Subtle upward vertical light beacon indicating level exit / completion
    const beaconHeight = 90;
    const beaconGrad = ctx.createLinearGradient(0, 0, 0, -beaconHeight);
    beaconGrad.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
    beaconGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.1)');
    beaconGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = beaconGrad;
    ctx.fillRect(-ex.radius * 0.45, -beaconHeight, ex.radius * 0.9, beaconHeight);

    // Upward floating pure white & subtle dual accent motes
    for (let i = 0; i < 4; i++) {
      const pOffset = (time * 28 + i * 20) % 50;
      const pAlpha = 1 - pOffset / 50;
      const col = i === 0 ? '#ffffff' : (i % 2 === 0 ? 'rgba(0, 212, 255, 0.7)' : 'rgba(255, 51, 102, 0.7)');
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc((Math.sin(time * 2.5 + i * 1.5) * ex.radius) * 0.4, -pOffset, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bright white portal aura with subtle dual accents at the fringe
    const aura = ctx.createRadialGradient(0, 0, 8, 0, 0, ex.radius * 1.6);
    aura.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    aura.addColorStop(0.4, 'rgba(255, 255, 255, 0.12)');
    aura.addColorStop(0.7, 'rgba(0, 212, 255, 0.08)');
    aura.addColorStop(0.9, 'rgba(255, 51, 102, 0.06)');
    aura.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, ex.radius * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Geometric Exit Gateway: Bright white outer ring
    const rot = time * 0.9;
    ctx.rotate(rot);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, ex.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Subtle counter-rotating dashed ring with subtle red/blue accents
    ctx.rotate(-rot * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, ex.radius * 0.75, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Glowing pure white portal core
    const corePulse = 14 + Math.sin(time * 4) * 2;
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, corePulse);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.95)');
    coreGrad.addColorStop(1, 'rgba(215, 235, 255, 0.4)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, corePulse, 0, Math.PI * 2);
    ctx.fill();

    // Clean exit diamond emblem in center
    ctx.strokeStyle = '#0e111a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(6, 0);
    ctx.lineTo(0, 6);
    ctx.lineTo(-6, 0);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 3;

      if (p.shape === 'line') {
        ctx.lineWidth = p.size;
        ctx.strokeStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.05, p.y - p.vy * 0.05);
        ctx.stroke();
      } else if (p.shape === 'spark') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderPlayer(ctx: CanvasRenderingContext2D) {
    const p = this.player;
    const cx = p.x + p.width / 2;
    const time = performance.now() / 1000;
    const isRed = p.color === 'RED';

    // High-speed boost trailing motion lines
    if (Math.abs(p.vx) > 310 || p.isOnBoost) {
      ctx.save();
      const streakColor = isRed ? 'rgba(255, 51, 102, 0.75)' : 'rgba(0, 212, 255, 0.75)';
      const streakDir = isRed ? 1 : -1;
      ctx.strokeStyle = streakColor;
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.shadowColor = streakColor;
      ctx.shadowBlur = 8;

      const offsets = [-14, -8, -2, 4, 10];
      for (let i = 0; i < offsets.length; i++) {
        const offY = p.y + p.height / 2 + offsets[i] + Math.sin(time * 35 + i * 2) * 2;
        const lineLen = 24 + Math.random() * 32;
        const startX = cx - streakDir * (p.width / 2 + 4);
        const endX = startX - streakDir * lineLen;

        ctx.beginPath();
        ctx.moveTo(startX, offY);
        ctx.lineTo(endX, offY);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Determine current character pose & frame index:
    let pose: CharacterPose = 'idle';
    let frameIndex = 0;

    if (p.landTimer > 0 || p.squashY < 0.85) {
      pose = 'land';
      frameIndex = p.landTimer > 0.08 ? 0 : 1;
    } else if (!p.isGrounded) {
      if (p.vy < -30) {
        pose = 'jump';
        frameIndex = p.vy < -200 ? 0 : 1;
      } else {
        pose = 'fall';
        frameIndex = p.vy < 260 ? 0 : 1;
      }
    } else if (Math.abs(p.vx) > 15) {
      pose = 'walk';
      frameIndex = Math.floor(((p.walkCycle % 1 + 1) % 1) * 4);
    }

    // Render cute mascot character:
    // Sized to fit comfortably on platforms, anchored to the player collision base
    const mascotSize = 44;
    const mascotX = cx - mascotSize / 2;
    const mascotY = p.y + p.height - mascotSize + 3;

    // Enforce facing matches color: Red = 1 (Right), Blue = -1 (Left)
    const targetFacing = isRed ? 1 : -1;

    // Smooth horizontal flip transition when switching colors (3D coin flip effect)
    let flipScaleX = targetFacing;
    if (p.indicatorFlipProgress < 1) {
      // Smooth cosine easing from previous orientation (-targetFacing) to new orientation (+targetFacing)
      // At progress = 0: -targetFacing (starts from previous orientation)
      // At progress = 0.5: 0 (passes through razor-thin edge-on profile)
      // At progress = 1: +targetFacing (settles into target orientation)
      flipScaleX = targetFacing * -Math.cos(p.indicatorFlipProgress * Math.PI);
    }

    ctx.save();
    // Shake effect when trying forbidden direction
    if (p.blockedTimer > 0) {
      const shakeAmt = Math.sin(time * 45) * 3;
      ctx.translate(shakeAmt, 0);
    }

    drawCharacter(ctx, mascotX, mascotY, mascotSize, {
      color: p.color,
      pose,
      frameIndex,
      walkCycle: p.walkCycle,
      facing: isRed ? 'right' : 'left',
      flipScaleX,
      glow: true,
    });
    ctx.restore();

    // Floating Directional Arrow Indicator Above Mascot
    this.renderDirectionIndicator(ctx, cx, p.y - 8, isRed, time);
  }

  private renderDirectionIndicator(
    ctx: CanvasRenderingContext2D,
    cx: number,
    playerTopY: number,
    isRed: boolean,
    time: number
  ) {
    const p = this.player;
    ctx.save();

    // Bobbing float
    const floatY = playerTopY - 16 + Math.sin(time * 5) * 3;
    ctx.translate(cx, floatY);

    if (p.blockedTimer > 0) {
      const shakeAmt = Math.sin(time * 40) * 4;
      ctx.translate(shakeAmt, 0);
    }

    // Direction transition animation pop and sparkle feedback
    if (p.indicatorFlipProgress < 1) {
      const pop = 1 + Math.sin((1 - p.indicatorFlipProgress) * Math.PI) * 0.35;
      ctx.scale(pop, pop);

      // Micro-sparkles circling the arrow during color flip
      for (let s = 0; s < 4; s++) {
        const sAngle = (s / 4) * Math.PI * 2 + time * 8;
        const sDist = 18 * (1 - p.indicatorFlipProgress);
        ctx.fillStyle = isRed ? '#ff3366' : '#00d4ff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(Math.cos(sAngle) * sDist, Math.sin(sAngle) * sDist, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Render sleek glowing directional arrow
    const arrowSize = 26;
    drawDirectionArrow(ctx, -arrowSize / 2, -arrowSize / 2, arrowSize, {
      color: p.color,
      direction: isRed ? 'right' : 'left',
      glow: true,
    });

    ctx.restore();
  }
}
