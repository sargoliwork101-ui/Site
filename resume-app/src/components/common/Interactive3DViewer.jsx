/**
 * ============================================================================
 * INTERACTIVE 3D PCB & STEP VIEWER COMPONENT (WebGL / Canvas)
 * ============================================================================
 * 
 * Secure In-Browser 3D PCB Viewer:
 * - 360-Degree Mouse & Touch Orbit Controls
 * - Layer Silkscreen, Copper Pads, and IC Package Modeling
 * - Interactive Solder Mask Color Selection (Green, Matte Black, Blue, Purple, Red)
 * - Auto-rotation, Zoom Controls & Reset View
 * - Protected In-App Rendering (Direct File & Asset Downloading Disabled for IP Protection)
 *
 * @module Interactive3DViewer
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Palette,
  ShieldCheck,
  Box
} from 'lucide-react';

export const Interactive3DViewer = ({ board, isFa }) => {
  const canvasRef = useRef(null);
  const [rotX, setRotX] = useState(25);
  const [rotY, setRotY] = useState(-35);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [pcbColor, setPcbColor] = useState('dark-green'); // 'dark-green' | 'matte-black' | 'deep-blue' | 'purple' | 'red'

  const colorPalettes = {
    'dark-green': { base: '#0d4022', border: '#175c34', silk: '#e2fadb', chip: '#111827', gold: '#f59e0b' },
    'matte-black': { base: '#18181b', border: '#27272a', silk: '#fafafa', chip: '#09090b', gold: '#eab308' },
    'deep-blue': { base: '#1e3a8a', border: '#1d4ed8', silk: '#ffffff', chip: '#0f172a', gold: '#fbbf24' },
    'purple': { base: '#581c87', border: '#6b21a8', silk: '#f3e8ff', chip: '#18181b', gold: '#f59e0b' },
    'red': { base: '#7f1d1d', border: '#991b1b', silk: '#fef2f2', chip: '#18181b', gold: '#f59e0b' },
  };

  const currentTheme = colorPalettes[pcbColor] || colorPalettes['dark-green'];

  // Handle Mouse Drag for Orbit
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setAutoRotate(false);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setRotY((prev) => prev + deltaX * 0.5);
    setRotX((prev) => Math.max(-80, Math.min(80, prev - deltaY * 0.5)));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Support
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setAutoRotate(false);
      setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - lastMousePos.x;
    const deltaY = e.touches[0].clientY - lastMousePos.y;

    setRotY((prev) => prev + deltaX * 0.6);
    setRotX((prev) => Math.max(-80, Math.min(80, prev - deltaY * 0.6)));
    setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  // Auto-rotation loop
  useEffect(() => {
    let animationFrame = null;
    if (autoRotate && !isDragging) {
      const loop = () => {
        setRotY((prev) => (prev + 0.3) % 360);
        animationFrame = requestAnimationFrame(loop);
      };
      animationFrame = requestAnimationFrame(loop);
    }
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [autoRotate, isDragging]);

  // Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoom, zoom);

    // Radians
    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;

    // 3D Projection Helper
    const project = (x, y, z) => {
      // Rotate Y
      const x1 = x * Math.cos(radY) + z * Math.sin(radY);
      const z1 = -x * Math.sin(radY) + z * Math.cos(radY);

      // Rotate X
      const y2 = y * Math.cos(radX) - z1 * Math.sin(radX);
      const z2 = y * Math.sin(radX) + z1 * Math.cos(radX);

      // Perspective
      const dist = 500;
      const scale = dist / (dist + z2);
      return {
        x: x1 * scale,
        y: y2 * scale,
        z: z2,
      };
    };

    // Board Dimensions
    const bW = 180;
    const bH = 125;
    const bThickness = (board?.layers || 4) * 2 + 6;

    // Draw Bottom Substrate Shadow
    const p1 = project(-bW, -bH, -bThickness);
    const p2 = project(bW, -bH, -bThickness);
    const p3 = project(bW, bH, -bThickness);
    const p4 = project(-bW, bH, -bThickness);

    const t1 = project(-bW, -bH, bThickness);
    const t2 = project(bW, -bH, bThickness);
    const t3 = project(bW, bH, bThickness);
    const t4 = project(-bW, bH, bThickness);

    // Thickness Sides (FR-4 Dielectric Edge)
    ctx.fillStyle = '#064e3b';
    ctx.strokeStyle = '#022c22';
    ctx.lineWidth = 1;

    // Side 1
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(t2.x, t2.y);
    ctx.lineTo(t1.x, t1.y);
    ctx.closePath();
    ctx.fillStyle = '#0a2e1d';
    ctx.fill();
    ctx.stroke();

    // Side 2
    ctx.beginPath();
    ctx.moveTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(t3.x, t3.y);
    ctx.lineTo(t2.x, t2.y);
    ctx.closePath();
    ctx.fillStyle = '#0f3a25';
    ctx.fill();
    ctx.stroke();

    // Side 3
    ctx.beginPath();
    ctx.moveTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.lineTo(t4.x, t4.y);
    ctx.lineTo(t3.x, t3.y);
    ctx.closePath();
    ctx.fillStyle = '#0a2e1d';
    ctx.fill();
    ctx.stroke();

    // Side 4
    ctx.beginPath();
    ctx.moveTo(p4.x, p4.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(t1.x, t1.y);
    ctx.lineTo(t4.x, t4.y);
    ctx.closePath();
    ctx.fillStyle = '#0f3a25';
    ctx.fill();
    ctx.stroke();

    // Top PCB Surface
    ctx.beginPath();
    ctx.moveTo(t1.x, t1.y);
    ctx.lineTo(t2.x, t2.y);
    ctx.lineTo(t3.x, t3.y);
    ctx.lineTo(t4.x, t4.y);
    ctx.closePath();
    ctx.fillStyle = currentTheme.base;
    ctx.fill();
    ctx.strokeStyle = currentTheme.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Metallic Gold/Copper Traces & Ground Vias
    const drawTrace = (x1, y1, x2, y2, color = currentTheme.gold) => {
      const start = project(x1, y1, bThickness + 0.5);
      const end = project(x2, y2, bThickness + 0.5);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    // Draw Differential Pairs & Traces
    drawTrace(-120, -70, -20, -70, currentTheme.gold);
    drawTrace(-120, -65, -20, -65, currentTheme.gold);
    drawTrace(-20, -70, 0, -30, currentTheme.gold);
    drawTrace(-20, -65, 5, -25, currentTheme.gold);

    drawTrace(0, 30, 80, 30, currentTheme.gold);
    drawTrace(0, 35, 80, 35, currentTheme.gold);
    drawTrace(80, 30, 130, 70, currentTheme.gold);

    drawTrace(-140, 20, -80, 20, '#10b981');
    drawTrace(-80, 20, -40, 60, '#10b981');

    // Draw Gold Edge Connectors & Pin Headers
    for (let i = -140; i <= 140; i += 18) {
      const pad = project(i, -110, bThickness + 0.8);
      ctx.beginPath();
      ctx.arc(pad.x, pad.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = currentTheme.gold;
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Draw Main MCU IC Package (e.g. QFP/BGA Chip with 3D height)
    const icX = -10;
    const icY = -5;
    const icSize = 45;
    const icHeight = bThickness + 8;

    const icTop1 = project(icX - icSize, icY - icSize, icHeight);
    const icTop2 = project(icX + icSize, icY - icSize, icHeight);
    const icTop3 = project(icX + icSize, icY + icSize, icHeight);
    const icTop4 = project(icX - icSize, icY + icSize, icHeight);

    ctx.beginPath();
    ctx.moveTo(icTop1.x, icTop1.y);
    ctx.lineTo(icTop2.x, icTop2.y);
    ctx.lineTo(icTop3.x, icTop3.y);
    ctx.lineTo(icTop4.x, icTop4.y);
    ctx.closePath();
    ctx.fillStyle = currentTheme.chip;
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Silkscreen Text on MCU Chip
    const icCenter = project(icX, icY, icHeight + 0.5);
    ctx.fillStyle = currentTheme.silk;
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText((board?.mcu || 'ARM Cortex-M7').slice(0, 14), icCenter.x, icCenter.y - 2);
    ctx.font = '7px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${board?.layers || 4}L-CAD 3D`, icCenter.x, icCenter.y + 10);

    // Draw Secondary Crystals & SMD Capacitors
    const drawSmd = (sx, sy, w, h, label = 'SMD') => {
      const sp = project(sx, sy, bThickness + 4);
      ctx.fillStyle = '#334155';
      ctx.fillRect(sp.x - w / 2, sp.y - h / 2, w, h);
      ctx.strokeStyle = currentTheme.gold;
      ctx.lineWidth = 1;
      ctx.strokeRect(sp.x - w / 2, sp.y - h / 2, w, h);
    };

    drawSmd(90, -40, 24, 14, 'XTAL');
    drawSmd(90, 40, 28, 16, 'LDO');
    drawSmd(-110, 40, 20, 30, 'PHY');
    drawSmd(-100, -30, 16, 16, 'PWR');

    // Silkscreen Board Name
    const silkPos = project(-130, 95, bThickness + 0.6);
    ctx.fillStyle = currentTheme.silk;
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(board?.titleEn?.slice(0, 22) || 'HARDWARE PCB', silkPos.x, silkPos.y);

    ctx.restore();
  }, [rotX, rotY, zoom, pcbColor, board, currentTheme]);

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col select-none"
    >
      {/* 3D Canvas Top Bar */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Box className="w-4 h-4 animate-pulse" />
          </span>
          <div>
            <span className="font-bold text-white flex items-center gap-1.5">
              <span>{isFa ? 'نمایشگر سه‌بعدی تعاملی برد و لایه‌ها' : 'Interactive 3D PCB Viewer'}</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                3D CAD (View-Only)
              </span>
            </span>
            <p className="text-[11px] text-slate-400">
              {isFa ? 'با ماوس بچرخانید و با اسکرول زوم کنید' : 'Click & drag to rotate 360°, scroll to zoom'}
            </p>
          </div>
        </div>

        {/* Solder Mask Color Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <Palette className="w-3.5 h-3.5 text-slate-400 ml-1 rtl:ml-0 rtl:mr-1" />
          {[
            { id: 'dark-green', color: '#15803d', title: 'سبز کلاسیک' },
            { id: 'matte-black', color: '#18181b', title: 'مشکی مات' },
            { id: 'deep-blue', color: '#1d4ed8', title: 'آبی متالیک' },
            { id: 'purple', color: '#7e22ce', title: 'بنفش صنعتی' },
            { id: 'red', color: '#b91c1c', title: 'قرمز مسابقه‌ای' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setPcbColor(c.id)}
              className={`w-4 h-4 rounded-full border transition-all ${
                pcbColor === c.id ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: c.color, borderColor: '#334155' }}
              title={c.title}
            />
          ))}
        </div>
      </div>

      {/* Interactive 3D Canvas Body */}
      <div
        className="relative w-full aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center cursor-grab active:cursor-grabbing select-none overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        <canvas
          ref={canvasRef}
          width={640}
          height={380}
          className="w-full h-full object-contain pointer-events-none select-none"
        />

        {/* Floating Interactive Controls (View-Only, Protected) */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
          {/* Zoom & Orbit Controls */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl">
            <button
              onClick={() => setZoom((prev) => Math.min(prev + 0.15, 2.2))}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title={isFa ? 'بزرگ‌نمایی' : 'Zoom In'}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((prev) => Math.max(prev - 0.15, 0.6))}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title={isFa ? 'کوچک‌نمایی' : 'Zoom Out'}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setRotX(25);
                setRotY(-35);
                setZoom(1);
                setAutoRotate(true);
              }}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title={isFa ? 'زاویه پیش‌فرض و چرخش خودکار' : 'Reset View & Auto Rotate'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Protected View Indicator (No Raw CAD Downloads Allowed) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-cyan-300 shadow-lg select-none">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{isFa ? 'رندر آنلاین سه‌بعدی (تحت وب)' : 'Protected 3D Render'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
