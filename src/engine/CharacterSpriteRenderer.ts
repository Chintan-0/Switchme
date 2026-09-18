/**
 * CharacterSpriteRenderer.ts
 * 
 * Minimalist modern neon 2D platformer character renderer for "SwitchMe!".
 * Renders the cute humanoid mascot in both Neon Red (#FF3B3B) and Neon Blue (#318BFF)
 * across all requested poses: Idle, Walk, Jump, Fall, Land, and glowing directional arrows.
 * 
 * Capable of:
 * 1. Real-time game engine rendering (with dynamic animation interpolation).
 * 2. Generating pure transparent high-res PNG sprite sheets.
 * 3. Exporting individual transparent PNG sprite assets.
 */

export type CharacterColor = 'RED' | 'BLUE';
export type CharacterPose = 'idle' | 'walk' | 'jump' | 'fall' | 'land';

export interface DrawSpriteOptions {
  color: CharacterColor;
  pose: CharacterPose;
  walkCycle?: number;  // 0 to 1 cycle progress for walk animation
  frameIndex?: number; // Explicit frame index: 0..3 for walk; 0..1 for jump/fall/land
  size?: number;       // Base dimension box size (e.g., 128 or 256)
  facing?: 'left' | 'right'; // Facing direction (defaults to right for Red, left for Blue)
  flipScaleX?: number; // Smooth flip scale from -1 to 1 for transitions
  glow?: boolean;      // Render soft luminous neon aura
  alpha?: number;      // Master opacity
}

export interface SpriteFrameInfo {
  id: string;
  name: string;
  color: CharacterColor;
  pose: CharacterPose | 'arrow';
  col: number;
  row: number;
  width: number;
  height: number;
}

export interface ColorStyleConfig {
  base: string;
  highlight: string;
  gradientTop: string;
  gradientBottom: string;
  rim: string;
  glowOuter: string;
  glowInner: string;
  shadowColor: string;
  defaultFacing: 'right' | 'left';
}

export const COLOR_CONFIG: Record<CharacterColor, ColorStyleConfig> = {
  RED: {
    base: '#FF3B3B',
    highlight: '#FFA4A4',
    gradientTop: '#FF5C5C',
    gradientBottom: '#B31E24',
    rim: 'rgba(255, 180, 180, 0.75)',
    glowOuter: 'rgba(255, 59, 59, 0.38)',
    glowInner: 'rgba(255, 59, 59, 0.18)',
    shadowColor: '#FF3B3B',
    defaultFacing: 'right',
  },
  BLUE: {
    base: '#318BFF',
    highlight: '#A3CEFF',
    gradientTop: '#579EFF',
    gradientBottom: '#0D52B8',
    rim: 'rgba(180, 220, 255, 0.75)',
    glowOuter: 'rgba(49, 139, 255, 0.38)',
    glowInner: 'rgba(49, 139, 255, 0.18)',
    shadowColor: '#318BFF',
    defaultFacing: 'left',
  },
};

/**
 * Draws the cute humanoid mascot character onto a 2D canvas context.
 * The drawing coordinate center is at (cx, cy) or fits within the given box.
 */
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  options: DrawSpriteOptions
) {
  const { color, pose, walkCycle = 0, glow = true, alpha = 1.0 } = options;
  const cfg = COLOR_CONFIG[color];
  const facing = options.facing ?? cfg.defaultFacing;
  const isFacingRight = facing === 'right';

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x + size / 2, y + size / 2);

  // Normalize scale: base character coordinates are mapped on a 100x100 virtual grid
  const scale = size / 100;
  const facingScale = options.flipScaleX !== undefined ? options.flipScaleX : (isFacingRight ? 1 : -1);
  ctx.scale(scale * facingScale, scale);

  // Pose-dependent offsets and deformations for right-facing 3/4 stance
  // Bold, unmistakable directional orientation:
  // HEAD + TORSO + LEADING LIMBS form one clear directional flow toward RIGHT (↘)
  let headX = 9.5;       // Head shifted prominently forward toward the right (+X)
  let headY = -12;
  let headTilt = 0.10;   // Head tilted forward toward right (~6 degrees)
  let bodyX = 6.5;       // Torso center shifted forward toward right (+X)
  let bodyY = 12;
  let bodyTilt = 0.22;   // Torso leaning forward toward the right (~13 degrees, '/')
  let bodySquashX = 1.0;
  let bodySquashY = 1.0;
  let rootYOffset = 0;

  // Asymmetric limbs:
  // Note on Canvas 2D limb rotation (limb defined down along +Y):
  // - NEGATIVE angle swings limb FORWARD to the RIGHT (+X, \)
  // - POSITIVE angle swings limb BACKWARD to the LEFT (-X, /)
  // Rear limbs (Left Arm & Left Leg): Trailing visibly behind to the left (-X, /)
  let rearArmX = -7.5;
  let rearArmY = bodyY - 2;
  let rearArmAngle = 0.38; // Trailing backward to the left (~+22 deg, '/')
  let rearArmLength = 15.0;
  let rearArmThickness = 6.0;

  // Front arm: clearly sits AHEAD of the torso leading toward the RIGHT
  let frontArmX = 11.5;
  let frontArmY = bodyY - 1;
  let frontArmAngle = -0.60; // Reaching forward toward the right (~-34 deg, '\')
  let frontArmLength = 18.5;
  let frontArmThickness = 7.0;

  // Rear leg: trailing slightly toward the LEFT
  let rearLegX = -5.5;
  let rearLegY = bodyY + 7;
  let rearLegAngle = 0.30; // Trailing backward to the left (~+17 deg, '/')
  let rearLegBend = 0;
  let rearLegLength = 18.0;
  let rearLegThickness = 7.0;

  // Front leg: clearly stepping/reaching toward the RIGHT, foot visibly ahead of body
  let frontLegX = 9.5;
  let frontLegY = bodyY + 7;
  let frontLegAngle = -0.42; // Stepping forward toward the right (~-24 deg, '\')
  let frontLegBend = 0;
  let frontLegLength = 20.0;
  let frontLegThickness = 7.5;

  const frameIdx = options.frameIndex;

  switch (pose) {
    case 'idle': {
      // Natural, unmistakable 3/4 ready-to-dash posture:
      // Head and torso flow forward-right (↘)
      // Front arm and front leg lead forward to the right (+X)
      // Rear arm and rear leg trail behind to the left (-X)
      headX = 9.5;
      headY = -12;
      headTilt = 0.10;
      bodyX = 6.5;
      bodyTilt = 0.22;
      frontArmX = 11.5;
      frontArmAngle = -0.58;  // Reaching clearly forward-right (\)
      rearArmX = -7.5;
      rearArmAngle = 0.38;    // Trailing back-left (/)
      frontLegX = 9.5;
      frontLegAngle = -0.42;  // Planted clearly ahead to the right (\)
      rearLegX = -5.5;
      rearLegAngle = 0.30;    // Planted trailing back-left (/)
      break;
    }
    case 'walk': {
      // 4 Distinct Walk Frames:
      // Frame 0 (Walk 1): Contact / deep forward stride (front foot forward to +X, rear foot back to -X)
      // Frame 1 (Walk 2): High pass step / upward bounce (rear leg driving forward with bent knee)
      // Frame 2 (Walk 3): Opposite contact / stride forward (front arm driving forward)
      // Frame 3 (Walk 4): Second pass step / bounce (front leg returning forward)
      const walkFrame = frameIdx !== undefined ? (frameIdx % 4) : Math.floor(((walkCycle % 1 + 1) % 1) * 4);

      if (walkFrame === 0) {
        // Walk 1: Contact
        rootYOffset = 0;
        headX = 10.0;
        headTilt = 0.12;
        bodyX = 7.0;
        bodyTilt = 0.24;
        frontLegX = 9.5;
        frontLegAngle = -0.65; // Front leg reaches strong forward to the RIGHT
        rearLegX = -5.5;
        rearLegAngle = 0.55;   // Rear leg extends strong back to the LEFT
        rearLegBend = 0.20;
        frontArmX = 11.5;
        frontArmAngle = 0.35;  // Front arm swings back
        rearArmX = -7.5;
        rearArmAngle = -0.55;  // Rear arm swings forward to the RIGHT
      } else if (walkFrame === 1) {
        // Walk 2: Passing & High Bob
        rootYOffset = -4.0;
        headX = 10.5;
        headTilt = 0.10;
        bodyX = 6.5;
        bodyTilt = 0.20;
        frontLegX = 9.5;
        frontLegAngle = -0.18; // Front leg bearing weight under center
        rearLegX = -5.5;
        rearLegAngle = -0.42;  // Rear leg knee driving forward to the RIGHT
        rearLegBend = 0.70;    // Knee deeply bent forward
        frontArmX = 11.5;
        frontArmAngle = -0.35;
        rearArmX = -7.5;
        rearArmAngle = 0.25;
      } else if (walkFrame === 2) {
        // Walk 3: Opposite Contact
        rootYOffset = 0;
        headX = 10.0;
        headTilt = 0.12;
        bodyX = 7.0;
        bodyTilt = 0.24;
        frontLegX = 9.5;
        frontLegAngle = 0.40;  // Front leg pushed back to the LEFT
        frontLegBend = 0.25;
        rearLegX = -5.5;
        rearLegAngle = -0.58;  // Rear leg reaching forward to the RIGHT
        frontArmX = 11.5;
        frontArmAngle = -0.72; // Front arm pumping forward to the RIGHT
        rearArmX = -7.5;
        rearArmAngle = 0.45;   // Rear arm pumping back to the LEFT
      } else {
        // Walk 4: Passing 2
        rootYOffset = -3.5;
        headX = 10.0;
        headTilt = 0.10;
        bodyX = 6.5;
        bodyTilt = 0.20;
        frontLegX = 9.5;
        frontLegAngle = -0.45; // Front leg swinging forward to the RIGHT
        frontLegBend = 0.55;
        rearLegX = -5.5;
        rearLegAngle = 0.15;   // Rear leg under body
        frontArmX = 11.5;
        frontArmAngle = -0.40;
        rearArmX = -7.5;
        rearArmAngle = 0.20;
      }
      break;
    }
    case 'jump': {
      // 2 Distinct Jump Frames:
      // Frame 0 (Jump 1): Takeoff / Upward leap driving forward-right
      // Frame 1 (Jump 2): High apex leap, aerodynamic flight driving forward-right
      const jumpFrame = frameIdx !== undefined ? (frameIdx % 2) : 0;

      if (jumpFrame === 0) {
        // Jump 1: Upward spring / ascent toward the RIGHT
        rootYOffset = -5;
        headX = 10.5;
        headY = -14;
        headTilt = -0.04;
        bodyX = 7.0;
        bodyTilt = 0.22;
        bodySquashX = 0.94;
        bodySquashY = 1.06;
        frontArmX = 11.5;
        frontArmAngle = -0.90; // Reaching up & forward toward the RIGHT
        rearArmX = -7.5;
        rearArmAngle = 0.38;   // Trailing down-back to the LEFT
        frontLegX = 9.5;
        frontLegAngle = -0.45; // Front knee tucked forward-right
        frontLegBend = 0.55;
        rearLegX = -5.5;
        rearLegAngle = 0.58;   // Rear leg trailing back-left
        rearLegBend = 0.40;
      } else {
        // Jump 2: High Apex Soar driving RIGHT
        rootYOffset = -8;
        headX = 11.5;
        headY = -15;
        headTilt = -0.06;
        bodyX = 8.0;
        bodyTilt = 0.26;
        bodySquashX = 0.92;
        bodySquashY = 1.08;
        frontArmX = 11.5;
        frontArmAngle = -0.95; // Streamlined forward reach to the RIGHT
        rearArmX = -7.5;
        rearArmAngle = 0.48;   // Tucked back-left
        frontLegX = 9.5;
        frontLegAngle = 0.22;  // Legs trailing in aerodynamic slipstream to the LEFT
        frontLegBend = 0.35;
        rearLegX = -5.5;
        rearLegAngle = 0.65;
        rearLegBend = 0.45;
      }
      break;
    }
    case 'fall': {
      // 2 Distinct Fall Frames:
      // Frame 0 (Fall 1): Controlled descent oriented forward-right
      // Frame 1 (Fall 2): High-speed drop diving down-right with trailing limbs
      const fallFrame = frameIdx !== undefined ? (frameIdx % 2) : 0;

      if (fallFrame === 0) {
        // Fall 1: Descent
        rootYOffset = 2;
        headX = 9.5;
        headY = -10;
        headTilt = 0.12;       // Gazing down-right
        bodyX = 6.5;
        bodyTilt = 0.20;
        frontArmX = 11.5;
        frontArmAngle = -0.30; // Leading arm down-right
        rearArmX = -7.5;
        rearArmAngle = 0.60;   // Trailing arm back-up to the left
        frontLegX = 9.5;
        frontLegAngle = -0.35; // Front leg reaching down-forward to catch ground
        frontLegBend = 0.15;
        rearLegX = -5.5;
        rearLegAngle = 0.40;   // Rear leg trailing up-left
        rearLegBend = 0.25;
      } else {
        // Fall 2: Fast drop diving down-right
        rootYOffset = 4;
        headX = 10.0;
        headY = -9;
        headTilt = 0.15;
        bodyX = 7.0;
        bodyTilt = 0.24;
        bodySquashX = 0.92;
        bodySquashY = 1.08;
        frontArmX = 11.5;
        frontArmAngle = 0.25;  // Arms swept back by upward wind
        rearArmX = -7.5;
        rearArmAngle = 0.72;
        frontLegX = 9.5;
        frontLegAngle = -0.40; // Extended forward-down
        frontLegBend = 0.15;
        rearLegX = -5.5;
        rearLegAngle = 0.48;   // Trailing back-up
        rearLegBend = 0.30;
      }
      break;
    }
    case 'land': {
      // 2 Distinct Land Frames:
      // Frame 0 (Land 1): Deep impact ground squash with forward brace facing RIGHT
      // Frame 1 (Land 2): Springing recovery uncoiling into sprint facing RIGHT
      const landFrame = frameIdx !== undefined ? (frameIdx % 2) : 0;

      if (landFrame === 0) {
        // Land 1: Deep Impact Squash (Superhero brace facing RIGHT)
        rootYOffset = 7;
        headX = 10.5;
        headY = -4;
        headTilt = 0.12;       // Low head gazing right
        bodyX = 7.0;
        bodyY = 15;
        bodyTilt = 0.22;       // Leaning forward into ground
        bodySquashX = 1.30;
        bodySquashY = 0.70;
        frontArmX = 11.5;
        frontArmAngle = -0.80; // Front arm braced to ground forward-right
        rearArmX = -7.5;
        rearArmAngle = 0.70;   // Rear arm flared back-up to left for balance
        frontLegX = 9.5;
        frontLegAngle = -0.70; // Front knee bent deep forward-right
        frontLegBend = 0.85;
        rearLegX = -5.5;
        rearLegAngle = 0.52;   // Rear leg bent back-left
        rearLegBend = 0.80;
      } else {
        // Land 2: Spring Recovery (Uncoiling forward-right into sprint)
        rootYOffset = 3;
        headX = 10.0;
        headY = -9;
        headTilt = 0.10;
        bodyX = 6.5;
        bodyY = 13;
        bodyTilt = 0.22;
        bodySquashX = 1.12;
        bodySquashY = 0.90;
        frontArmX = 11.5;
        frontArmAngle = -0.50; // Reaching forward-right
        rearArmX = -7.5;
        rearArmAngle = 0.35;   // Trailing back-left
        frontLegX = 9.5;
        frontLegAngle = -0.42; // Stepping forward-right
        frontLegBend = 0.30;
        rearLegX = -5.5;
        rearLegAngle = 0.38;   // Pushing off back-left
        rearLegBend = 0.30;
      }
      break;
    }
  }

  ctx.translate(0, rootYOffset);

  // -------------------------------------------------------------
  // 1. SOFT OUTER NEON GLOW PASS
  // -------------------------------------------------------------
  if (glow) {
    ctx.save();
    ctx.shadowColor = cfg.shadowColor;
    ctx.shadowBlur = 14;
    ctx.fillStyle = cfg.glowOuter;

    // Head glow silhouette using sculpted 3/4 head path
    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(headTilt);
    drawHeadPath(ctx);
    ctx.fill();
    ctx.restore();

    // Body glow silhouette using the 3/4 torso shape
    ctx.save();
    ctx.translate(bodyX, bodyY);
    ctx.rotate(bodyTilt);
    ctx.scale(bodySquashX, bodySquashY);
    drawTorsoPath(ctx);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // -------------------------------------------------------------
  // 2. REAR LIMBS (Left Leg & Left Arm - drawn BEHIND torso)
  // -------------------------------------------------------------
  drawLimb(ctx, rearLegX, rearLegY, rearLegAngle, rearLegBend, rearLegLength, rearLegThickness, cfg, true);
  drawLimb(ctx, rearArmX, rearArmY, rearArmAngle, 0, rearArmLength, rearArmThickness, cfg, true);

  // -------------------------------------------------------------
  // 3. MAIN BODY / TORSO (3/4 Sculpted Silhouette with Forward Chest)
  // -------------------------------------------------------------
  ctx.save();
  ctx.translate(bodyX, bodyY);
  ctx.rotate(bodyTilt);
  ctx.scale(bodySquashX, bodySquashY);

  // Body gradient fill
  const bodyGrad = ctx.createLinearGradient(0, -12, 6, 16);
  bodyGrad.addColorStop(0, cfg.gradientTop);
  bodyGrad.addColorStop(0.5, cfg.base);
  bodyGrad.addColorStop(1, cfg.gradientBottom);

  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = cfg.rim;
  ctx.lineWidth = 1.5;

  drawTorsoPath(ctx);
  ctx.fill();
  ctx.stroke();

  // Subtle internal luminous highlight on upper forward chest
  const chestGrad = ctx.createRadialGradient(8, -3, 1, 6, -2, 11);
  chestGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
  chestGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.12)');
  chestGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = chestGrad;
  ctx.beginPath();
  ctx.ellipse(8, -2, 7, 5.5, 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // -------------------------------------------------------------
  // 4. FORWARD LIMBS (Right Leg & Right Arm - drawn IN FRONT of torso)
  // -------------------------------------------------------------
  drawLimb(ctx, frontLegX, frontLegY, frontLegAngle, frontLegBend, frontLegLength, frontLegThickness, cfg, false);
  drawLimb(ctx, frontArmX, frontArmY, frontArmAngle, 0, frontArmLength, frontArmThickness, cfg, false);

  // -------------------------------------------------------------
  // 5. HEAD & VISOR (Sculpted 3/4 head contour positioned forward)
  // -------------------------------------------------------------
  ctx.save();
  ctx.translate(headX, headY);
  if (headTilt !== 0) {
    ctx.rotate(headTilt);
  }

  const headGrad = ctx.createRadialGradient(8, -6, 3, 4, 0, 24);
  headGrad.addColorStop(0, cfg.highlight);
  headGrad.addColorStop(0.35, cfg.gradientTop);
  headGrad.addColorStop(0.75, cfg.base);
  headGrad.addColorStop(1, cfg.gradientBottom);

  ctx.fillStyle = headGrad;
  ctx.strokeStyle = cfg.rim;
  ctx.lineWidth = 1.8;

  drawHeadPath(ctx);
  ctx.fill();
  ctx.stroke();

  // Soft internal radial highlight (jelly-like luminosity biased forward)
  const innerHighlight = ctx.createRadialGradient(11, -7, 1, 10, -6, 16);
  innerHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.60)');
  innerHighlight.addColorStop(0.45, 'rgba(255, 255, 255, 0.15)');
  innerHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = innerHighlight;
  ctx.beginPath();
  ctx.ellipse(9, -5, 14, 10, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // -------------------------------------------------------------
  // 6. TWO GLOWING WHITE VERTICAL EYES (Positioned on the forward face)
  // -------------------------------------------------------------
  const eye1Width = 4.2;
  const eye1Height = 11.0;
  const eye1Radius = 2.1;
  const eye1X = 6.5; // Inner eye shifted forward onto the right face

  const eye2Width = 5.8;
  const eye2Height = 13.5;
  const eye2Radius = 2.8;
  const eye2X = 14.5; // Outer leading eye prominent on the right visor edge

  const eyeY = -1.5;

  ctx.save();
  // White eye glow aura
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#ffffff';

  // Eye 1 (inner / back eye in perspective)
  ctx.beginPath();
  ctx.roundRect(eye1X, eyeY - eye1Height / 2, eye1Width, eye1Height, eye1Radius);
  ctx.fill();

  // Eye 2 (outer / leading eye closer to front)
  ctx.beginPath();
  ctx.roundRect(eye2X, eyeY - eye2Height / 2, eye2Width, eye2Height, eye2Radius);
  ctx.fill();

  // Soft inner neon depth
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.roundRect(eye1X + 0.6, eyeY - eye1Height / 2 + 0.6, eye1Width - 1.2, eye1Height - 1.2, eye1Radius);
  ctx.roundRect(eye2X + 0.6, eyeY - eye2Height / 2 + 0.6, eye2Width - 1.2, eye2Height - 1.2, eye2Radius);
  ctx.fill();

  // Forward specular glint on the leading eye to clearly accentuate forward gaze
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(eye2X + eye2Width - 1.2, eyeY - 2.8, 1.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore(); // restore eyes

  ctx.restore(); // restore head

  ctx.restore(); // restore root scale / translate
}

/**
 * Helper to generate the sculpted 3/4 head path:
 * Rear (left side): streamlined rounded skull profile
 * Front (right side): cute forward-projecting visor/face profile
 */
function drawHeadPath(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  // Top-rear of skull (sleeker back)
  ctx.moveTo(-15, -14);
  // Curve across top sloping forward
  ctx.bezierCurveTo(-4, -22, 10, -21, 18, -12);
  // Forward visor/face protruding prominently out to the right (+X)
  ctx.bezierCurveTo(24, -3, 24, 9, 17, 16);
  // Cute rounded jaw curving back to neck
  ctx.bezierCurveTo(11, 21, -1, 21, -9, 15);
  // Sleek back of skull
  ctx.bezierCurveTo(-20, 8, -21, -4, -15, -14);
  ctx.closePath();
}

/**
 * Helper to generate the 3/4 asymmetrical torso path:
 * Left side (rear): sleek vertical spine
 * Right side (front): forward-protruding arching chest & belly
 */
function drawTorsoPath(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(-11, -12);                       // Back neck / shoulder
  ctx.lineTo(3, -12);                          // Neck collar
  ctx.bezierCurveTo(12, -12, 18, -6, 18, 0);   // Forward-arching chest puff
  ctx.bezierCurveTo(18, 7, 14, 13, 8, 15);     // Front belly down to hip
  ctx.lineTo(-3, 15);                          // Groin / bottom hip line
  ctx.bezierCurveTo(-10, 15, -12, 11, -12, 4); // Rear hip
  ctx.bezierCurveTo(-12, -2, -12, -7, -11, -12); // Spine up to shoulder
  ctx.closePath();
}

/**
 * Helper to draw a short rounded limb (arm or leg) with gradient & rim
 */
function drawLimb(
  ctx: CanvasRenderingContext2D,
  originX: number,
  originY: number,
  angle: number,
  bend: number,
  length: number,
  thickness: number,
  cfg: ColorStyleConfig,
  isRear: boolean
) {
  ctx.save();
  ctx.translate(originX, originY);
  ctx.rotate(angle);

  const halfT = thickness / 2;
  const limbGrad = ctx.createLinearGradient(0, 0, 0, length);
  if (isRear) {
    limbGrad.addColorStop(0, cfg.base);
    limbGrad.addColorStop(1, cfg.gradientBottom);
  } else {
    limbGrad.addColorStop(0, cfg.gradientTop);
    limbGrad.addColorStop(0.6, cfg.base);
    limbGrad.addColorStop(1, cfg.gradientBottom);
  }

  ctx.fillStyle = limbGrad;
  ctx.strokeStyle = isRear ? 'rgba(255,255,255,0.3)' : cfg.rim;
  ctx.lineWidth = 1.2;

  if (bend === 0) {
    ctx.beginPath();
    ctx.roundRect(-halfT, 0, thickness, length, halfT);
    ctx.fill();
    ctx.stroke();
  } else {
    // Bent limb
    const kneeY = length * 0.55;
    ctx.beginPath();
    ctx.roundRect(-halfT, 0, thickness, kneeY + halfT, halfT);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.translate(0, kneeY);
    ctx.rotate(bend);
    ctx.beginPath();
    ctx.roundRect(-halfT, 0, thickness, length * 0.55, halfT);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draws the sleek glowing directional arrow matching the new sprite sheet.
 * Red has a bold RIGHT chevron arrow; Blue has a bold LEFT chevron arrow.
 */
export function drawDirectionArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  options: {
    color: CharacterColor;
    direction?: 'left' | 'right';
    glow?: boolean;
    alpha?: number;
  }
) {
  const { color, glow = true, alpha = 1.0 } = options;
  const cfg = COLOR_CONFIG[color];
  const direction = options.direction ?? (color === 'RED' ? 'right' : 'left');
  const isRight = direction === 'right';

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x + size / 2, y + size / 2);

  const scale = size / 100;
  ctx.scale(scale, scale);

  if (!isRight) {
    ctx.scale(-1, 1);
  }

  if (glow) {
    ctx.shadowColor = cfg.shadowColor;
    ctx.shadowBlur = 14;
  }

  // Outer bold chevron outline from uploaded sprite sheet
  ctx.beginPath();
  ctx.moveTo(-28, -10);
  ctx.lineTo(4, -10);
  ctx.lineTo(4, -22);
  ctx.lineTo(28, 0);
  ctx.lineTo(4, 22);
  ctx.lineTo(4, 10);
  ctx.lineTo(-28, 10);
  ctx.closePath();

  const arrowGrad = ctx.createLinearGradient(-28, 0, 28, 0);
  arrowGrad.addColorStop(0, cfg.base);
  arrowGrad.addColorStop(0.7, cfg.gradientTop);
  arrowGrad.addColorStop(1, '#ffffff');

  ctx.fillStyle = arrowGrad;
  ctx.strokeStyle = cfg.rim;
  ctx.lineWidth = 2.4;
  ctx.lineJoin = 'round';
  ctx.fill();
  ctx.stroke();

  // Inset glowing neon contour (double border from user's image)
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(-24, -5.5);
  ctx.lineTo(2, -5.5);
  ctx.lineTo(2, -14);
  ctx.lineTo(19, 0);
  ctx.lineTo(2, 14);
  ctx.lineTo(2, 5.5);
  ctx.lineTo(-24, 5.5);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 1.2;
  ctx.fill();
  ctx.stroke();

  // Bright center core streak
  ctx.beginPath();
  ctx.moveTo(-20, -2);
  ctx.lineTo(1, -2);
  ctx.lineTo(1, -7);
  ctx.lineTo(12, 0);
  ctx.lineTo(1, 7);
  ctx.lineTo(1, 2);
  ctx.lineTo(-20, 2);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.restore();
}

export interface SpriteSheetConfig {
  cellSize?: number;
  padding?: number;
  includeLabels?: boolean;
  background?: 'transparent' | 'dark';
}

export interface FrameDefinition {
  pose: CharacterPose | 'arrow';
  frameIndex?: number;
  label: string;
  category: 'idle' | 'walk' | 'jump' | 'fall' | 'land' | 'arrow';
}

export const SPRITE_SHEET_FRAMES: FrameDefinition[] = [
  { category: 'idle', pose: 'idle', frameIndex: 0, label: 'IDLE' },
  { category: 'walk', pose: 'walk', frameIndex: 0, label: 'WALK 1' },
  { category: 'walk', pose: 'walk', frameIndex: 1, label: 'WALK 2' },
  { category: 'walk', pose: 'walk', frameIndex: 2, label: 'WALK 3' },
  { category: 'walk', pose: 'walk', frameIndex: 3, label: 'WALK 4' },
  { category: 'jump', pose: 'jump', frameIndex: 0, label: 'JUMP 1' },
  { category: 'jump', pose: 'jump', frameIndex: 1, label: 'JUMP 2' },
  { category: 'fall', pose: 'fall', frameIndex: 0, label: 'FALL 1' },
  { category: 'fall', pose: 'fall', frameIndex: 1, label: 'FALL 2' },
  { category: 'land', pose: 'land', frameIndex: 0, label: 'LAND 1' },
  { category: 'land', pose: 'land', frameIndex: 1, label: 'LAND 2' },
  { category: 'arrow', pose: 'arrow', frameIndex: 0, label: 'ARROW' },
];

/**
 * Generates the complete 12-column x 2-row sprite sheet matching the user's uploaded image.
 * - 12 Sprites for Red (facing right)
 * - 12 Sprites for Blue (facing left)
 * - Groups: IDLE (1), WALK (4), JUMP (2), FALL (2), LAND (2), ARROW (1)
 */
export function generateSpriteSheetCanvas(config: SpriteSheetConfig = {}): HTMLCanvasElement {
  const cellSize = config.cellSize ?? 140;
  const padding = config.padding ?? 24;
  const includeLabels = config.includeLabels ?? false;
  const cols = 12;
  const rows = 2;

  const headerHeight = includeLabels ? 56 : 0;
  const leftSidebarWidth = includeLabels ? 160 : 0;

  const canvasWidth = leftSidebarWidth + padding * 2 + cols * cellSize + (cols - 1) * padding;
  const canvasHeight = headerHeight + padding * 2 + rows * cellSize + (rows - 1) * padding;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  if (config.background === 'dark') {
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  } else {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  }

  // Draw group header banners if requested
  if (includeLabels) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 12px monospace';

    const groups: { name: string; startCol: number; span: number }[] = [
      { name: 'IDLE (1)', startCol: 0, span: 1 },
      { name: 'WALK (4)', startCol: 1, span: 4 },
      { name: 'JUMP (2)', startCol: 5, span: 2 },
      { name: 'FALL (2)', startCol: 7, span: 2 },
      { name: 'LAND (2)', startCol: 9, span: 2 },
      { name: 'ARROW', startCol: 11, span: 1 },
    ];

    groups.forEach((g) => {
      const startX = leftSidebarWidth + padding + g.startCol * (cellSize + padding);
      const groupWidth = g.span * cellSize + (g.span - 1) * padding;
      const midX = startX + groupWidth / 2;

      // Clean pill bracket
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(startX, 14, groupWidth, 26, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(g.name, midX, 27);
    });

    // Left info labels
    ctx.textAlign = 'left';
    // Row 0: Red
    const redRowY = headerHeight + padding + cellSize / 2;
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#FF3B3B';
    ctx.fillText('RED', padding, redRowY - 24);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('(FACES RIGHT)', padding, redRowY - 8);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Moves Right →', padding, redRowY + 10);
    ctx.fillText('12 Sprites', padding, redRowY + 26);

    // Row 1: Blue
    const blueRowY = headerHeight + padding + (cellSize + padding) + cellSize / 2;
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#318BFF';
    ctx.fillText('BLUE', padding, blueRowY - 24);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('(FACES LEFT)', padding, blueRowY - 8);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Moves Left ←', padding, blueRowY + 10);
    ctx.fillText('12 Sprites', padding, blueRowY + 26);

    ctx.restore();
  }

  // ROW 0: Neon Red Character (12 Sprites)
  for (let c = 0; c < 12; c++) {
    const frame = SPRITE_SHEET_FRAMES[c];
    const px = leftSidebarWidth + padding + c * (cellSize + padding);
    const py = headerHeight + padding;

    if (frame.pose === 'arrow') {
      drawDirectionArrow(ctx, px, py, cellSize, {
        color: 'RED',
        direction: 'right',
        glow: true,
      });
    } else {
      drawCharacter(ctx, px, py, cellSize, {
        color: 'RED',
        pose: frame.pose,
        frameIndex: frame.frameIndex,
        facing: 'right',
        glow: true,
      });
    }
  }

  // ROW 1: Neon Blue Character (12 Sprites)
  const row1Y = headerHeight + padding + (cellSize + padding);
  for (let c = 0; c < 12; c++) {
    const frame = SPRITE_SHEET_FRAMES[c];
    const px = leftSidebarWidth + padding + c * (cellSize + padding);
    const py = row1Y;

    if (frame.pose === 'arrow') {
      drawDirectionArrow(ctx, px, py, cellSize, {
        color: 'BLUE',
        direction: 'left',
        glow: true,
      });
    } else {
      drawCharacter(ctx, px, py, cellSize, {
        color: 'BLUE',
        pose: frame.pose,
        frameIndex: frame.frameIndex,
        facing: 'left',
        glow: true,
      });
    }
  }

  return canvas;
}

/**
 * Creates individual transparent canvas for a specific sprite and frame
 */
export function generateSingleSpriteCanvas(
  color: CharacterColor,
  pose: CharacterPose | 'arrow',
  frameIndex = 0,
  size = 256
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, size, size);

  if (pose === 'arrow') {
    drawDirectionArrow(ctx, 0, 0, size, {
      color,
      direction: color === 'RED' ? 'right' : 'left',
      glow: true,
    });
  } else {
    drawCharacter(ctx, 0, 0, size, {
      color,
      pose,
      frameIndex,
      walkCycle: 0.25,
      facing: color === 'RED' ? 'right' : 'left',
      glow: true,
    });
  }

  return canvas;
}

/**
 * Generates an SVG string of the character in the requested pose & frame on transparent background.
 */
export function generateCharacterSVG(
  color: CharacterColor,
  pose: CharacterPose | 'arrow',
  frameIndex = 0,
  size = 256
): string {
  const cfg = COLOR_CONFIG[color];
  const isRed = color === 'RED';
  const facingRight = isRed;

  if (pose === 'arrow') {
    const arrowDir = isRed ? 1 : -1;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
  <defs>
    <filter id="glow-${color.toLowerCase()}" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <linearGradient id="grad-${color.toLowerCase()}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${cfg.base}" />
      <stop offset="70%" stop-color="${cfg.gradientTop}" />
      <stop offset="100%" stop-color="#ffffff" />
    </linearGradient>
  </defs>
  <g transform="translate(50, 50) scale(${arrowDir}, 1)" filter="url(#glow-${color.toLowerCase()})">
    <path d="M -28 -10 L 4 -10 L 4 -22 L 28 0 L 4 22 L 4 10 L -28 10 Z" fill="url(#grad-${color.toLowerCase()})" stroke="${cfg.rim}" stroke-width="2.4" stroke-linejoin="round" />
    <path d="M -24 -5.5 L 2 -5.5 L 2 -14 L 19 0 L 2 14 L 2 5.5 L -24 5.5 Z" fill="rgba(255,255,255,0.45)" stroke="rgba(255,255,255,0.85)" stroke-width="1.2" />
    <path d="M -20 -2 L 1 -2 L 1 -7 L 12 0 L 1 7 L 1 2 L -20 2 Z" fill="#ffffff" />
  </g>
</svg>`;
  }

  // Generate Character SVG with Frame-Specific Coordinates
  const transform = facingRight
    ? 'translate(50, 50)'
    : 'translate(50, 50) scale(-1, 1)';

  let headX = 9.5;
  let headY = -12;
  let headTilt = 6; // in degrees
  let bodyX = 6.5;
  let bodyY = 12;
  let bodyTilt = 13; // in degrees
  let squashX = 1.0;
  let squashY = 1.0;

  // Asymmetrical limbs for right-facing 3/4 stance:
  // Rear limbs trail to the LEFT (-X), front limbs lead to the RIGHT (+X)
  let rearArmD = 'M -7.5 10 C -12 14, -15 19, -13 23';
  let frontArmD = 'M 11.5 11 C 18 16, 23 21, 21 26';
  let rearLegD = 'M -5.5 19 C -9 25, -12 31, -11 36';
  let frontLegD = 'M 9.5 19 C 14 25, 19 31, 18 37';

  if (pose === 'walk') {
    const wf = frameIndex % 4;
    if (wf === 0) {
      headX = 10.0;
      headTilt = 7;
      bodyX = 7.0;
      bodyTilt = 14;
      rearArmD = 'M -7.5 10 C -12 14, -16 18, -14 24';
      frontArmD = 'M 11.5 11 C 19 14, 25 17, 23 22';
      rearLegD = 'M -5.5 19 C -12 25, -17 30, -15 35';
      frontLegD = 'M 9.5 19 C 18 25, 25 30, 23 36';
    } else if (wf === 1) {
      headX = 10.5;
      headY = -14;
      headTilt = 6;
      bodyX = 6.5;
      bodyY = 10;
      bodyTilt = 12;
      rearArmD = 'M -7.5 9 C -11 13, -13 16, -11 21';
      frontArmD = 'M 11.5 10 C 16 14, 21 18, 19 23';
      rearLegD = 'M -5.5 17 C 0 21, 6 24, 11 26';
      frontLegD = 'M 9.5 17 C 10 24, 11 30, 10 35';
    } else if (wf === 2) {
      headX = 10.0;
      headTilt = 7;
      bodyX = 7.0;
      bodyTilt = 14;
      rearArmD = 'M -7.5 10 C 0 14, 6 18, 5 23';
      frontArmD = 'M 11.5 11 C 5 16, -2 18, 0 24';
      rearLegD = 'M -5.5 19 C 2 24, 10 28, 16 34';
      frontLegD = 'M 9.5 19 C 1 25, -5 30, -3 35';
    } else {
      headX = 10.0;
      headY = -14;
      headTilt = 6;
      bodyX = 6.5;
      bodyY = 10;
      bodyTilt = 12;
      rearArmD = 'M -7.5 9 C -10 13, -12 16, -10 21';
      frontArmD = 'M 11.5 10 C 17 14, 22 17, 20 22';
      rearLegD = 'M -5.5 17 C -5 24, -5 30, -4 35';
      frontLegD = 'M 9.5 17 C 15 21, 21 24, 23 28';
    }
  } else if (pose === 'jump') {
    const jf = frameIndex % 2;
    if (jf === 0) {
      // Jump 1: Upward spring / leap driving forward-right
      headX = 10.5;
      headY = -14;
      headTilt = -2;
      bodyX = 7.0;
      bodyTilt = 13;
      squashX = 0.94;
      squashY = 1.06;
      rearArmD = 'M -7.5 9 C -12 13, -15 17, -13 22';
      frontArmD = 'M 11.5 10 C 19 5, 25 -1, 22 -6'; // Reaching up-right!
      rearLegD = 'M -5.5 18 C -12 22, -17 25, -14 28'; // Trailing back-left
      frontLegD = 'M 9.5 18 C 17 20, 23 16, 20 11'; // Tucked forward-right
    } else {
      // Jump 2: High Apex Soar driving RIGHT
      headX = 11.5;
      headY = -15;
      headTilt = -4;
      bodyX = 8.0;
      bodyTilt = 15;
      squashX = 0.92;
      squashY = 1.08;
      rearArmD = 'M -7.5 9 C -12 12, -16 15, -14 19';
      frontArmD = 'M 11.5 10 C 20 4, 27 0, 24 -4'; // Streamlined forward reach to RIGHT
      rearLegD = 'M -5.5 18 C -14 20, -20 22, -16 24'; // Aerodynamic slipstream to LEFT
      frontLegD = 'M 9.5 18 C 2 20, -5 22, -3 24';
    }
  } else if (pose === 'fall') {
    const ff = frameIndex % 2;
    if (ff === 0) {
      headX = 9.5;
      headY = -10;
      headTilt = 7;
      bodyX = 6.5;
      bodyTilt = 12;
      rearArmD = 'M -7.5 10 C -13 7, -17 3, -15 -1'; // Wind-swept back-up
      frontArmD = 'M 11.5 11 C 18 13, 22 18, 20 23';  // Leading down-forward
      rearLegD = 'M -5.5 19 C -10 26, -13 31, -11 35'; // Trailing back-up
      frontLegD = 'M 9.5 19 C 15 26, 21 32, 19 37';   // Catching ground forward-right
    } else {
      headX = 10.0;
      headY = -9;
      headTilt = 9;
      bodyX = 7.0;
      bodyTilt = 14;
      squashX = 0.92;
      squashY = 1.08;
      rearArmD = 'M -7.5 10 C -14 5, -19 0, -16 -4';
      frontArmD = 'M 11.5 11 C 18 7, 22 3, 20 -2';
      rearLegD = 'M -5.5 19 C -11 27, -16 32, -13 36';
      frontLegD = 'M 9.5 19 C 15 27, 20 32, 18 37';
    }
  } else if (pose === 'land') {
    const lf = frameIndex % 2;
    if (lf === 0) {
      // Land 1: Superhero impact brace facing RIGHT (NOT centered/symmetric!)
      headX = 10.5;
      headY = -4;
      headTilt = 7;
      bodyX = 7.0;
      bodyY = 15;
      bodyTilt = 13;
      squashX = 1.30;
      squashY = 0.70;
      rearArmD = 'M -7.5 12 C -14 15, -19 18, -17 22'; // Flared back-up to left
      frontArmD = 'M 11.5 12 C 18 16, 24 20, 22 25';   // Braced forward-down to right
      rearLegD = 'M -5.5 16 C -12 19, -17 24, -14 28'; // Leg bent back-left
      frontLegD = 'M 9.5 16 C 18 19, 25 23, 23 27';  // Knee bent deep forward-right
    } else {
      // Land 2: Spring Recovery facing RIGHT
      headX = 10.0;
      headY = -9;
      headTilt = 6;
      bodyX = 6.5;
      bodyY = 13;
      bodyTilt = 13;
      squashX = 1.12;
      squashY = 0.90;
      rearArmD = 'M -7.5 11 C -12 14, -15 18, -13 22';
      frontArmD = 'M 11.5 11 C 18 14, 23 18, 21 23';
      rearLegD = 'M -5.5 18 C -10 22, -14 27, -11 31';
      frontLegD = 'M 9.5 18 C 16 22, 22 27, 20 31';
    }
  }

  // Sculpted 3/4 torso SVG path
  const torsoD = 'M -11 -12 L 3 -12 C 12 -12, 18 -6, 18 0 C 18 7, 14 13, 8 15 L -3 15 C -10 15, -12 11, -12 4 C -12 -2, -12 -7, -11 -12 Z';
  // Sculpted 3/4 head SVG path
  const headD = 'M -15 -14 C -4 -22, 10 -21, 18 -12 C 24 -3, 24 9, 17 16 C 11 21, -1 21, -9 15 C -20 8, -21 -4, -15 -14 Z';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
  <defs>
    <filter id="glow-${color.toLowerCase()}" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <radialGradient id="headGrad-${color.toLowerCase()}" cx="60%" cy="38%" r="62%">
      <stop offset="0%" stop-color="${cfg.highlight}" />
      <stop offset="40%" stop-color="${cfg.gradientTop}" />
      <stop offset="80%" stop-color="${cfg.base}" />
      <stop offset="100%" stop-color="${cfg.gradientBottom}" />
    </radialGradient>
    <linearGradient id="bodyGrad-${color.toLowerCase()}" x1="0%" y1="0%" x2="20%" y2="100%">
      <stop offset="0%" stop-color="${cfg.gradientTop}" />
      <stop offset="50%" stop-color="${cfg.base}" />
      <stop offset="100%" stop-color="${cfg.gradientBottom}" />
    </linearGradient>
  </defs>
  <g transform="${transform}" filter="url(#glow-${color.toLowerCase()})">
    <!-- Rear Limbs (Drawn Behind) -->
    <path d="${rearLegD}" stroke="${cfg.base}" stroke-width="7" stroke-linecap="round" fill="none" />
    <path d="${rearArmD}" stroke="${cfg.base}" stroke-width="6" stroke-linecap="round" fill="none" />
    
    <!-- 3/4 Torso with Forward Chest -->
    <g transform="translate(${bodyX}, ${bodyY}) rotate(${bodyTilt}) scale(${squashX}, ${squashY})">
      <path d="${torsoD}" fill="url(#bodyGrad-${color.toLowerCase()})" stroke="${cfg.rim}" stroke-width="1.5" />
      <ellipse cx="10" cy="-2" rx="7" ry="5.5" fill="rgba(255,255,255,0.28)" />
    </g>

    <!-- Forward Limbs (Drawn In Front) -->
    <path d="${frontLegD}" stroke="${cfg.gradientTop}" stroke-width="7.5" stroke-linecap="round" fill="none" />
    <path d="${frontArmD}" stroke="${cfg.gradientTop}" stroke-width="7" stroke-linecap="round" fill="none" />

    <!-- Head & Visor (Sculpted 3/4 Forward Positioned) -->
    <g transform="translate(${headX}, ${headY}) rotate(${headTilt})">
      <path d="${headD}" fill="url(#headGrad-${color.toLowerCase()})" stroke="${cfg.rim}" stroke-width="1.8" />
      <ellipse cx="9" cy="-5" rx="13" ry="9" fill="rgba(255,255,255,0.28)" />
      
      <!-- Glowing Vertical White Eyes with Forward Bias -->
      <g fill="#ffffff">
        <rect x="6.5" y="-7.0" width="4.2" height="11.0" rx="2.1" />
        <rect x="14.5" y="-8.2" width="5.8" height="13.5" rx="2.8" />
        <circle cx="19.1" cy="-4.2" r="1.4" />
      </g>
    </g>
  </g>
</svg>`;
}
