import fs from 'fs';
import path from 'path';

const outDir = path.resolve(process.cwd(), 'public/sprites');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const COLOR_CONFIG = {
  red: {
    base: '#FF3B3B',
    highlight: '#FFA4A4',
    gradientTop: '#FF5C5C',
    gradientBottom: '#B31E24',
    rim: 'rgba(255, 180, 180, 0.75)',
  },
  blue: {
    base: '#318BFF',
    highlight: '#A3CEFF',
    gradientTop: '#579EFF',
    gradientBottom: '#0D52B8',
    rim: 'rgba(180, 220, 255, 0.75)',
  },
};

function getSvg(colorKey, pose, size = 256) {
  const cfg = COLOR_CONFIG[colorKey];
  const isRed = colorKey === 'red';
  const facingRight = isRed;

  if (pose === 'arrow') {
    const arrowDir = isRed ? 1 : -1;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
  <defs>
    <filter id="glow-${colorKey}" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <linearGradient id="grad-${colorKey}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${cfg.base}" />
      <stop offset="70%" stop-color="${cfg.gradientTop}" />
      <stop offset="100%" stop-color="#ffffff" />
    </linearGradient>
  </defs>
  <g transform="translate(50, 50) scale(${arrowDir}, 1)" filter="url(#glow-${colorKey})">
    <path d="M -28 -8 L 6 -8 L 6 -18 L 28 0 L 6 18 L 6 8 L -28 8 Z" fill="url(#grad-${colorKey})" stroke="${cfg.rim}" stroke-width="2" stroke-linejoin="round" />
    <path d="M -22 -2.5 L 5 -2.5 L 5 -8 L 19 0 L 5 8 L 5 2.5 L -22 2.5 Z" fill="rgba(255,255,255,0.65)" />
  </g>
</svg>`;
  }

  const transform = facingRight
    ? 'translate(50, 50)'
    : 'translate(50, 50) scale(-1, 1)';

  let headY = -12;
  let bodyY = 12;
  let squashX = 1.0;
  let squashY = 1.0;
  let leftArmD = 'M -8 10 C -12 18, -14 24, -12 28';
  let rightArmD = 'M 8 10 C 12 18, 14 24, 12 28';
  let leftLegD = 'M -7 20 C -9 28, -10 34, -7 38';
  let rightLegD = 'M 7 20 C 9 28, 10 34, 7 38';

  if (pose === 'jump') {
    headY = -14;
    leftArmD = 'M -8 10 C -16 6, -20 -2, -18 -6';
    rightArmD = 'M 8 10 C 16 6, 20 -2, 18 -6';
    leftLegD = 'M -7 20 C -14 24, -18 22, -16 16';
    rightLegD = 'M 7 20 C 14 24, 18 22, 16 16';
  } else if (pose === 'fall') {
    headY = -10;
    leftArmD = 'M -8 10 C -16 8, -18 4, -16 -2';
    rightArmD = 'M 8 10 C 16 8, 18 4, 16 -2';
    leftLegD = 'M -7 20 C -8 30, -10 38, -6 42';
    rightLegD = 'M 7 20 C 8 30, 10 38, 8 42';
  } else if (pose === 'land') {
    headY = -4;
    bodyY = 14;
    squashX = 1.25;
    squashY = 0.75;
    leftArmD = 'M -8 12 C -18 16, -22 26, -18 30';
    rightArmD = 'M 8 12 C 18 16, 22 26, 18 30';
    leftLegD = 'M -7 18 C -16 22, -22 30, -18 32';
    rightLegD = 'M 7 18 C 16 22, 22 30, 18 32';
  } else if (pose === 'walk') {
    leftArmD = 'M -8 10 C -14 16, -18 22, -16 28';
    rightArmD = 'M 8 10 C 14 6, 16 2, 14 -2';
    leftLegD = 'M -7 20 C -14 26, -18 34, -16 38';
    rightLegD = 'M 7 20 C 12 24, 18 30, 16 36';
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
  <defs>
    <filter id="glow-${colorKey}" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <radialGradient id="headGrad-${colorKey}" cx="55%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${cfg.highlight}" />
      <stop offset="40%" stop-color="${cfg.gradientTop}" />
      <stop offset="80%" stop-color="${cfg.base}" />
      <stop offset="100%" stop-color="${cfg.gradientBottom}" />
    </radialGradient>
    <linearGradient id="bodyGrad-${colorKey}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${cfg.gradientTop}" />
      <stop offset="50%" stop-color="${cfg.base}" />
      <stop offset="100%" stop-color="${cfg.gradientBottom}" />
    </linearGradient>
  </defs>
  <g transform="${transform}" filter="url(#glow-${colorKey})">
    <!-- Rear Limbs -->
    <path d="${leftLegD}" stroke="${cfg.base}" stroke-width="7" stroke-linecap="round" fill="none" />
    <path d="${leftArmD}" stroke="${cfg.base}" stroke-width="6" stroke-linecap="round" fill="none" />
    
    <!-- Body -->
    <g transform="translate(0, ${bodyY}) scale(${squashX}, ${squashY})">
      <rect x="-12.5" y="-12" width="25" height="27" rx="12" fill="url(#bodyGrad-${colorKey})" stroke="${cfg.rim}" stroke-width="1.5" />
      <ellipse cx="2" cy="-4" rx="8" ry="5" fill="rgba(255,255,255,0.22)" />
    </g>

    <!-- Front Limbs -->
    <path d="${rightLegD}" stroke="${cfg.gradientTop}" stroke-width="7" stroke-linecap="round" fill="none" />
    <path d="${rightArmD}" stroke="${cfg.gradientTop}" stroke-width="6" stroke-linecap="round" fill="none" />

    <!-- Head -->
    <g transform="translate(0, ${headY})">
      <circle cx="0" cy="0" r="21.5" fill="url(#headGrad-${colorKey})" stroke="${cfg.rim}" stroke-width="1.8" />
      <ellipse cx="3" cy="-6" rx="11" ry="8" fill="rgba(255,255,255,0.28)" />
      
      <!-- Glowing Vertical White Eyes -->
      <g fill="#ffffff">
        <rect x="3.5" y="-7.5" width="4.8" height="11.5" rx="2.4" />
        <rect x="11.5" y="-7.5" width="4.8" height="11.5" rx="2.4" />
      </g>
    </g>
  </g>
</svg>`;
}

const poses = ['idle', 'walk', 'jump', 'fall', 'land', 'arrow'];

for (const p of poses) {
  fs.writeFileSync(path.join(outDir, `switchme-red-${p}.svg`), getSvg('red', p));
  fs.writeFileSync(path.join(outDir, `switchme-blue-${p}.svg`), getSvg('blue', p));
}

// Generate unified SVG spritesheet
const sheetSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1320 480" width="1320" height="480">
  <defs>
    <!-- Spritesheet definition with pure transparent background -->
  </defs>
  <!-- ROW 1: RED -->
  <g transform="translate(20, 20)">
    <g transform="translate(0, 0)">${getSvg('red', 'idle', 180)}</g>
    <g transform="translate(220, 0)">${getSvg('red', 'walk', 180)}</g>
    <g transform="translate(440, 0)">${getSvg('red', 'jump', 180)}</g>
    <g transform="translate(660, 0)">${getSvg('red', 'fall', 180)}</g>
    <g transform="translate(880, 0)">${getSvg('red', 'land', 180)}</g>
    <g transform="translate(1100, 0)">${getSvg('red', 'arrow', 180)}</g>
  </g>
  <!-- ROW 2: BLUE -->
  <g transform="translate(20, 240)">
    <g transform="translate(0, 0)">${getSvg('blue', 'idle', 180)}</g>
    <g transform="translate(220, 0)">${getSvg('blue', 'walk', 180)}</g>
    <g transform="translate(440, 0)">${getSvg('blue', 'jump', 180)}</g>
    <g transform="translate(660, 0)">${getSvg('blue', 'fall', 180)}</g>
    <g transform="translate(880, 0)">${getSvg('blue', 'land', 180)}</g>
    <g transform="translate(1100, 0)">${getSvg('blue', 'arrow', 180)}</g>
  </g>
</svg>`;

fs.writeFileSync(path.join(outDir, 'switchme-spritesheet.svg'), sheetSvg);
console.log('Successfully generated all SVG sprite assets in public/sprites/');
