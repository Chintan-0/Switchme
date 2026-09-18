import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Grid,
  FileArchive,
  Eye,
  FileCode,
} from 'lucide-react';
import JSZip from 'jszip';
import {
  CharacterColor,
  CharacterPose,
  generateSpriteSheetCanvas,
  generateSingleSpriteCanvas,
  generateCharacterSVG,
  drawCharacter,
  drawDirectionArrow,
  SPRITE_SHEET_FRAMES,
} from '../engine/CharacterSpriteRenderer';

interface SpriteExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpriteExporterModal: React.FC<SpriteExporterModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'sheet' | 'individual' | 'animation'>('sheet');
  const [selectedColor, setSelectedColor] = useState<CharacterColor>('RED');
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number>(0); // 0 to 11
  const [sheetMode, setSheetMode] = useState<'labeled' | 'transparent'>('labeled');
  const [bgMode, setBgMode] = useState<'checkerboard' | 'dark'>('dark');
  const [isZipping, setIsZipping] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const sheetCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentFrame = SPRITE_SHEET_FRAMES[selectedFrameIndex] ?? SPRITE_SHEET_FRAMES[0];

  // Render Sprite Sheet Canvas (12 columns x 2 rows)
  useEffect(() => {
    if (!isOpen || activeTab !== 'sheet') return;
    const canvas = sheetCanvasRef.current;
    if (!canvas) return;

    const source = generateSpriteSheetCanvas({
      cellSize: 140,
      padding: 24,
      includeLabels: sheetMode === 'labeled',
      background: sheetMode === 'labeled' ? 'dark' : undefined,
    });
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(source, 0, 0);
    }
  }, [isOpen, activeTab, sheetMode]);

  // Render Selected Single Sprite Canvas
  useEffect(() => {
    if (!isOpen || activeTab !== 'individual') return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const size = 300;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);
    if (currentFrame.pose === 'arrow') {
      drawDirectionArrow(ctx, 0, 0, size, {
        color: selectedColor,
        direction: selectedColor === 'RED' ? 'right' : 'left',
        glow: true,
      });
    } else {
      drawCharacter(ctx, 0, 0, size, {
        color: selectedColor,
        pose: currentFrame.pose,
        frameIndex: currentFrame.frameIndex,
        facing: selectedColor === 'RED' ? 'right' : 'left',
        glow: true,
      });
    }
  }, [isOpen, activeTab, selectedColor, selectedFrameIndex, currentFrame]);

  // Render Live Animated Showcase
  useEffect(() => {
    if (!isOpen || activeTab !== 'animation') return;
    const canvas = animCanvasRef.current;
    if (!canvas) return;

    canvas.width = 320;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let startTime = performance.now();

    const render = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (currentFrame.category === 'walk') {
        const cycle = (elapsed * 2.2) % 1;
        drawCharacter(ctx, 10, 10, 300, {
          color: selectedColor,
          pose: 'walk',
          walkCycle: cycle,
          facing: selectedColor === 'RED' ? 'right' : 'left',
          glow: true,
        });
      } else if (currentFrame.category === 'arrow') {
        const floatY = Math.sin(elapsed * 4) * 6;
        drawDirectionArrow(ctx, 10, 10 + floatY, 300, {
          color: selectedColor,
          direction: selectedColor === 'RED' ? 'right' : 'left',
          glow: true,
        });
      } else if (currentFrame.category === 'jump' || currentFrame.category === 'fall') {
        // Dynamic leap & drop loop
        const loopPhase = (elapsed * 1.5) % 2;
        const p = loopPhase < 1 ? 'jump' : 'fall';
        const fIdx = Math.floor((loopPhase % 1) * 2);
        drawCharacter(ctx, 10, 10, 300, {
          color: selectedColor,
          pose: p,
          frameIndex: fIdx,
          facing: selectedColor === 'RED' ? 'right' : 'left',
          glow: true,
        });
      } else if (currentFrame.category === 'land') {
        const lf = Math.floor((elapsed * 3) % 2);
        drawCharacter(ctx, 10, 10, 300, {
          color: selectedColor,
          pose: 'land',
          frameIndex: lf,
          facing: selectedColor === 'RED' ? 'right' : 'left',
          glow: true,
        });
      } else {
        const breathe = Math.sin(elapsed * 3) * 3;
        drawCharacter(ctx, 10, 10 + breathe, 300, {
          color: selectedColor,
          pose: 'idle',
          frameIndex: 0,
          facing: selectedColor === 'RED' ? 'right' : 'left',
          glow: true,
        });
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, activeTab, selectedColor, currentFrame]);

  // Single PNG download
  const handleDownloadSinglePng = () => {
    const canvas = generateSingleSpriteCanvas(selectedColor, currentFrame.pose, currentFrame.frameIndex, 512);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanLabel = currentFrame.label.toLowerCase().replace(/\s+/g, '-');
      a.download = `switchme-${selectedColor.toLowerCase()}-${cleanLabel}.png`;
      a.click();
      URL.revokeObjectURL(url);
      flashSuccess(`Downloaded switchme-${selectedColor.toLowerCase()}-${cleanLabel}.png`);
    }, 'image/png');
  };

  // Single SVG download
  const handleDownloadSingleSvg = () => {
    const svgStr = generateCharacterSVG(selectedColor, currentFrame.pose, currentFrame.frameIndex, 512);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanLabel = currentFrame.label.toLowerCase().replace(/\s+/g, '-');
    a.download = `switchme-${selectedColor.toLowerCase()}-${cleanLabel}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    flashSuccess(`Downloaded switchme-${selectedColor.toLowerCase()}-${cleanLabel}.svg`);
  };

  // Full Spritesheet PNG download
  const handleDownloadSheetPng = (labeled: boolean) => {
    const canvas = generateSpriteSheetCanvas({
      cellSize: 200,
      padding: 32,
      includeLabels: labeled,
      background: labeled ? 'dark' : undefined,
    });
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = labeled ? 'switchme-spritesheet-reference.png' : 'switchme-spritesheet-transparent.png';
      a.click();
      URL.revokeObjectURL(url);
      flashSuccess(`Downloaded ${a.download}`);
    }, 'image/png');
  };

  // Full ZIP archive download with all 24 individual sprites + sheets
  const handleDownloadAllZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // 1. Add Spritesheets (Pure Transparent & Reference Labeled)
      const transparentSheet = generateSpriteSheetCanvas({ cellSize: 200, padding: 32, includeLabels: false });
      const transparentBlob = await new Promise<Blob | null>((res) => transparentSheet.toBlob(res, 'image/png'));
      if (transparentBlob) {
        zip.file('spritesheet/switchme-spritesheet-transparent.png', transparentBlob);
      }

      const labeledSheet = generateSpriteSheetCanvas({ cellSize: 200, padding: 32, includeLabels: true, background: 'dark' });
      const labeledBlob = await new Promise<Blob | null>((res) => labeledSheet.toBlob(res, 'image/png'));
      if (labeledBlob) {
        zip.file('spritesheet/switchme-spritesheet-reference.png', labeledBlob);
      }

      // 2. Add Individual PNGs and SVGs for all 12 frames in Red & Blue (24 sprites total)
      const colors: CharacterColor[] = ['RED', 'BLUE'];

      for (const col of colors) {
        const folder = zip.folder(col.toLowerCase());
        for (const frame of SPRITE_SHEET_FRAMES) {
          const cleanName = `${col.toLowerCase()}-${frame.label.toLowerCase().replace(/\s+/g, '-')}`;
          const sCanvas = generateSingleSpriteCanvas(col, frame.pose, frame.frameIndex, 512);
          const sBlob = await new Promise<Blob | null>((res) => sCanvas.toBlob(res, 'image/png'));
          if (sBlob && folder) {
            folder.file(`${cleanName}.png`, sBlob);
          }
          // Vector SVG
          const svgContent = generateCharacterSVG(col, frame.pose, frame.frameIndex, 512);
          if (folder) {
            folder.file(`${cleanName}.svg`, svgContent);
          }
        }
      }

      // 3. Add Metadata JSON
      const metadata = {
        name: 'SwitchMe! Character Sprite Sheet',
        version: '2.0.0',
        aesthetic: '3/4 Directional Asymmetrical Mascot (Red Right, Blue Left)',
        columns: 12,
        rows: 2,
        groups: [
          { name: 'IDLE', count: 1, frames: ['idle'] },
          { name: 'WALK', count: 4, frames: ['walk-1', 'walk-2', 'walk-3', 'walk-4'] },
          { name: 'JUMP', count: 2, frames: ['jump-1', 'jump-2'] },
          { name: 'FALL', count: 2, frames: ['fall-1', 'fall-2'] },
          { name: 'LAND', count: 2, frames: ['land-1', 'land-2'] },
          { name: 'ARROW', count: 1, frames: ['arrow'] },
        ],
        characters: {
          RED: { facing: 'RIGHT', hex: '#FF3B3B', movement: 'Right Arrow' },
          BLUE: { facing: 'LEFT', hex: '#318BFF', movement: 'Left Arrow' },
        },
      };
      zip.file('metadata.json', JSON.stringify(metadata, null, 2));

      // 4. Generate and download zip
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'switchme-sprites-pack.zip';
      a.click();
      URL.revokeObjectURL(url);

      flashSuccess('Downloaded switchme-sprites-pack.zip with all 24 transparent sprites!');
    } catch (err) {
      console.error('Failed to generate ZIP pack', err);
    } finally {
      setIsZipping(false);
    }
  };

  const flashSuccess = (msg: string) => {
    setDownloadSuccess(msg);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  if (!isOpen) return null;

  return (
    <div
      id="modal-sprite-exporter"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#0b0e17] border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0f1422]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff3366]/25 to-[#00d4ff]/25 border border-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-wide text-white uppercase font-mono">
                  SwitchMe! Sprite Sheet (12 Columns x 2 Rows)
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-mono">
                  NEW SPRITE SHEET
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                12 Sprites each: IDLE (1) • WALK (4) • JUMP (2) • FALL (2) • LAND (2) • ARROW (1)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-download-all-zip"
              onClick={handleDownloadAllZip}
              disabled={isZipping}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 text-xs font-semibold tracking-wide transition active:scale-95 cursor-pointer disabled:opacity-50 font-mono"
            >
              <FileArchive className="w-4 h-4" />
              {isZipping ? 'PACKING ZIP...' : 'DOWNLOAD ALL 24 SPRITES (.ZIP)'}
            </button>
            <button
              id="btn-close-sprite-modal"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Success toast notification */}
        {downloadSuccess && (
          <div className="px-6 py-2 bg-emerald-950/80 border-b border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-xs font-mono">
            <Check className="w-4 h-4 text-emerald-400" />
            {downloadSuccess}
          </div>
        )}

        {/* Sub-Header Tabs & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-[#0d101c] border-b border-white/10">
          <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('sheet')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer font-mono ${
                activeTab === 'sheet'
                  ? 'bg-cyan-500/25 border border-cyan-400/50 text-cyan-200'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              SPRITE SHEET (12x2)
            </button>
            <button
              onClick={() => setActiveTab('individual')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer font-mono ${
                activeTab === 'individual'
                  ? 'bg-cyan-500/25 border border-cyan-400/50 text-cyan-200'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              INDIVIDUAL FRAMES (24)
            </button>
            <button
              onClick={() => setActiveTab('animation')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer font-mono ${
                activeTab === 'animation'
                  ? 'bg-cyan-500/25 border border-cyan-400/50 text-cyan-200'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              ANIMATION PREVIEW
            </button>
          </div>

          {/* Toggle controls */}
          <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
            {activeTab === 'sheet' && (
              <div className="flex items-center gap-1.5">
                <span>VIEW:</span>
                <button
                  onClick={() => setSheetMode('labeled')}
                  className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    sheetMode === 'labeled'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-black/30 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  Reference Layout
                </button>
                <button
                  onClick={() => setSheetMode('transparent')}
                  className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    sheetMode === 'transparent'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-black/30 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  Pure Transparent
                </button>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <span>BG:</span>
              <button
                onClick={() => setBgMode('checkerboard')}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  bgMode === 'checkerboard'
                    ? 'bg-white/15 border-white/40 text-white'
                    : 'bg-black/30 border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                Alpha Grid
              </button>
              <button
                onClick={() => setBgMode('dark')}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  bgMode === 'dark'
                    ? 'bg-white/15 border-white/40 text-white'
                    : 'bg-black/30 border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>

        {/* Modal Main Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#070910]">
          {/* TAB 1: FULL SPRITE SHEET */}
          {activeTab === 'sheet' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    {sheetMode === 'labeled' ? 'Complete Reference Sprite Sheet' : 'Pure Transparent Developer Sprite Sheet'}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Row 1: Red (Right) • Row 2: Blue (Left) • 12 distinct columns matching user specification.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadSheetPng(true)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold tracking-wider transition active:scale-95 cursor-pointer font-mono"
                  >
                    <Download className="w-4 h-4" />
                    DOWNLOAD REFERENCE PNG
                  </button>
                  <button
                    onClick={() => handleDownloadSheetPng(false)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-500/40 hover:to-blue-500/40 border border-cyan-400/60 text-cyan-200 text-xs font-semibold tracking-wider transition active:scale-95 cursor-pointer font-mono"
                  >
                    <Download className="w-4 h-4" />
                    DOWNLOAD TRANSPARENT PNG
                  </button>
                </div>
              </div>

              {/* Canvas viewport */}
              <div
                className={`relative rounded-xl border border-white/15 overflow-x-auto p-6 flex items-center justify-start min-h-[360px] ${
                  bgMode === 'checkerboard'
                    ? 'bg-[linear-gradient(45deg,#121624_25%,transparent_25%),linear-gradient(-45deg,#121624_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#121624_75%),linear-gradient(-45deg,transparent_75%,#121624_75%)] bg-[size:20px_20px] bg-[#090b14]'
                    : 'bg-[#05060c]'
                }`}
              >
                <canvas
                  ref={sheetCanvasRef}
                  className="max-w-none h-auto drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
                />
              </div>

              {/* Quick specs footnote */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono text-neutral-400 bg-white/5 border border-white/10 rounded-xl p-3">
                <div>
                  <span className="text-neutral-500">LAYOUT:</span> 12 Columns x 2 Rows
                </div>
                <div>
                  <span className="text-neutral-500">COLUMNS:</span> Idle, 4 Walks, 2 Jumps, 2 Falls, 2 Lands, Arrow
                </div>
                <div>
                  <span className="text-neutral-500">RED:</span> Faces Right (→)
                </div>
                <div>
                  <span className="text-neutral-500">BLUE:</span> Faces Left (←)
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INDIVIDUAL SPRITE INSPECTOR & EXPORTER */}
          {activeTab === 'individual' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Selector Column */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-2">
                    1. Select Character Color
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedColor('RED')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-mono text-xs font-bold transition cursor-pointer ${
                        selectedColor === 'RED'
                          ? 'bg-[#ff3366]/20 border-[#ff3366] text-[#ff8099] shadow-[0_0_15px_rgba(255,51,102,0.25)]'
                          : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-[#ff3366]" />
                      RED [→ RIGHT]
                    </button>
                    <button
                      onClick={() => setSelectedColor('BLUE')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-mono text-xs font-bold transition cursor-pointer ${
                        selectedColor === 'BLUE'
                          ? 'bg-[#00d4ff]/20 border-[#00d4ff] text-[#80e5ff] shadow-[0_0_15px_rgba(0,212,255,0.25)]'
                          : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-[#318BFF]" />
                      BLUE [← LEFT]
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-2">
                    2. Select Exact Frame (12 Frames)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-[300px] overflow-y-auto pr-1">
                    {SPRITE_SHEET_FRAMES.map((f, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedFrameIndex(idx)}
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs font-mono transition cursor-pointer ${
                          selectedFrameIndex === idx
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,212,255,0.2)]'
                            : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                        }`}
                      >
                        <span className="font-semibold">{f.label}</span>
                        <span className="text-[9px] px-1 py-0.5 rounded bg-white/10 text-neutral-400 uppercase">
                          {f.category}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center Canvas Preview */}
              <div
                className={`relative col-span-2 rounded-2xl border border-white/15 p-6 flex flex-col items-center justify-center min-h-[380px] ${
                  bgMode === 'checkerboard'
                    ? 'bg-[linear-gradient(45deg,#121624_25%,transparent_25%),linear-gradient(-45deg,#121624_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#121624_75%),linear-gradient(-45deg,transparent_75%,#121624_75%)] bg-[size:20px_20px] bg-[#090b14]'
                    : 'bg-[#05060c]'
                }`}
              >
                <canvas
                  ref={previewCanvasRef}
                  className="max-w-[280px] max-h-[280px] drop-shadow-[0_8px_30px_rgba(0,0,0,0.8)]"
                />

                <div className="mt-2 text-center">
                  <span className="text-xs font-mono text-cyan-300 font-bold uppercase">
                    {selectedColor} • {currentFrame.label}
                  </span>
                </div>

                {/* Download Actions Bar */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    id="btn-download-single-png"
                    onClick={handleDownloadSinglePng}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/60 text-cyan-200 text-xs font-semibold tracking-wider transition active:scale-95 cursor-pointer font-mono"
                  >
                    <Download className="w-4 h-4" />
                    DOWNLOAD FRAME PNG (512x512)
                  </button>
                  <button
                    id="btn-download-single-svg"
                    onClick={handleDownloadSingleSvg}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold tracking-wider transition active:scale-95 cursor-pointer font-mono"
                  >
                    <FileCode className="w-4 h-4" />
                    DOWNLOAD VECTOR (.SVG)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANIMATION PREVIEW */}
          {activeTab === 'animation' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-2">
                    Animation Showcase
                  </h3>
                  <p className="text-xs text-neutral-400 mb-4">
                    Preview the continuous 4-frame walk cycle, jump &amp; fall kinematics, and landing recovery.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedColor('RED')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border font-mono text-xs font-bold transition cursor-pointer ${
                      selectedColor === 'RED'
                        ? 'bg-[#ff3366]/20 border-[#ff3366] text-[#ff8099]'
                        : 'bg-white/5 border-white/10 text-neutral-400'
                    }`}
                  >
                    RED (RIGHT →)
                  </button>
                  <button
                    onClick={() => setSelectedColor('BLUE')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border font-mono text-xs font-bold transition cursor-pointer ${
                      selectedColor === 'BLUE'
                        ? 'bg-[#00d4ff]/20 border-[#00d4ff] text-[#80e5ff]'
                        : 'bg-white/5 border-white/10 text-neutral-400'
                    }`}
                  >
                    BLUE (← LEFT)
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => setSelectedFrameIndex(0)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono transition cursor-pointer ${
                      currentFrame.category === 'idle'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-white/5 border-white/10 text-neutral-300'
                    }`}
                  >
                    <span>Idle Standing (1 Frame)</span>
                    <span className="text-[10px] text-neutral-400">Breathing Pose</span>
                  </button>
                  <button
                    onClick={() => setSelectedFrameIndex(1)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono transition cursor-pointer ${
                      currentFrame.category === 'walk'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-white/5 border-white/10 text-neutral-300'
                    }`}
                  >
                    <span>Walk Cycle (4 Frames)</span>
                    <span className="text-[10px] text-neutral-400">Active Loop</span>
                  </button>
                  <button
                    onClick={() => setSelectedFrameIndex(5)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono transition cursor-pointer ${
                      currentFrame.category === 'jump' || currentFrame.category === 'fall'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-white/5 border-white/10 text-neutral-300'
                    }`}
                  >
                    <span>Jump &amp; Fall (4 Frames)</span>
                    <span className="text-[10px] text-neutral-400">Airborne Loop</span>
                  </button>
                  <button
                    onClick={() => setSelectedFrameIndex(9)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono transition cursor-pointer ${
                      currentFrame.category === 'land'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-white/5 border-white/10 text-neutral-300'
                    }`}
                  >
                    <span>Landing Squash (2 Frames)</span>
                    <span className="text-[10px] text-neutral-400">Impact &amp; Recover</span>
                  </button>
                  <button
                    onClick={() => setSelectedFrameIndex(11)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono transition cursor-pointer ${
                      currentFrame.category === 'arrow'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-white/5 border-white/10 text-neutral-300'
                    }`}
                  >
                    <span>Direction Arrow (1 Frame)</span>
                    <span className="text-[10px] text-neutral-400">Floating Glow</span>
                  </button>
                </div>
              </div>

              {/* Animated Canvas */}
              <div
                className={`relative col-span-2 rounded-2xl border border-white/15 p-6 flex flex-col items-center justify-center min-h-[380px] ${
                  bgMode === 'checkerboard'
                    ? 'bg-[linear-gradient(45deg,#121624_25%,transparent_25%),linear-gradient(-45deg,#121624_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#121624_75%),linear-gradient(-45deg,transparent_75%,#121624_75%)] bg-[size:20px_20px] bg-[#090b14]'
                    : 'bg-[#05060c]'
                }`}
              >
                <canvas
                  ref={animCanvasRef}
                  className="max-w-[300px] max-h-[300px] drop-shadow-[0_8px_30px_rgba(0,0,0,0.8)]"
                />

                <div className="mt-4 text-center">
                  <div className="text-xs font-mono text-cyan-300 font-semibold uppercase">
                    {selectedColor} MASCOT • {currentFrame.category.toUpperCase()}
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                    Directional 3/4 asymmetrical silhouette matching new sprite sheet
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

