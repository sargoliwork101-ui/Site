/**
 * ═══════════════════════════════════════════════════════════════════
 * BackgroundCanvas.jsx — پس‌زمینه متحرک کل سایت (مدار/ذرات/ماتریکس...)
 * ═══════════════════════════════════════════════════════════════════
 * چی توشه؟ یه canvas تمام‌صفحه با requestAnimationFrame که جلوه bgEffect
 * قالب فعال رو رندر می‌کنه (پیش‌فرض circuit-canvas)؛ با تاگل «جلوه ذرات»
 * در تنظیمات خاموش می‌شه (اون‌وقت فقط گرادیان ثابت می‌مونه).
 * ⚠️ حلقه انیمیشن cleanup داره (cancel + حذف listener) — موقع ویرایش حفظش
 * کن وگرنه با عوض شدن قالب، حلقه‌ها روی هم انباشته و مرورگر سنگین می‌شه.
 * جلوه جدید = یه شاخه جدید روی bgEffect + مقدارش در templates.js.
 */
import React, { useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';

export const BackgroundCanvas = () => {
  const { currentTemplate, data } = useData();
  const canvasRef = useRef(null);

  const bgEffect = currentTemplate?.bgEffect || 'circuit-canvas';
  const primaryColor = currentTemplate?.colors?.primary || '#00ffcc';
  const showAnimation = data?.siteConfig?.showCircuitAnimation !== false;

  useEffect(() => {
    if (!showAnimation) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return; // headless/odd browsers: static gradient still shows
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // 1. CIRCUIT CANVAS ANIMATION
    if (bgEffect === 'circuit-canvas' || bgEffect === 'grid-blueprint') {
      const nodes = [];
      const nodeCount = Math.min(30, Math.floor(width / 50));
      const traces = [];

      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.floor(Math.random() * (width / 40)) * 40,
          y: Math.floor(Math.random() * (height / 40)) * 40,
          radius: Math.random() > 0.6 ? 3 : 2,
          pulse: Math.random() * Math.PI * 2,
          speed: 0.02 + Math.random() * 0.03,
        });
      }

      // Generate PCB tracks connecting random nodes orthogonally
      for (let i = 0; i < nodes.length; i++) {
        const next = nodes[(i + 1) % nodes.length];
        traces.push({
          from: nodes[i],
          to: next,
          progress: Math.random(),
          speed: 0.003 + Math.random() * 0.006,
        });
      }

      const drawCircuit = () => {
        ctx.clearRect(0, 0, width, height);

        // Draw faint orthogonal grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Draw PCB Traces
        traces.forEach((t) => {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(t.from.x, t.from.y);
          // Orthogonal PCB routing (Manhattan bend)
          const midX = t.to.x;
          const midY = t.from.y;
          ctx.lineTo(midX, midY);
          ctx.lineTo(t.to.x, t.to.y);
          ctx.stroke();

          // Animated Electron pulse along trace
          t.progress = (t.progress + t.speed) % 1;
          let px, py;
          if (t.progress < 0.5) {
            const p = t.progress * 2;
            px = t.from.x + (midX - t.from.x) * p;
            py = midY;
          } else {
            const p = (t.progress - 0.5) * 2;
            px = midX;
            py = midY + (t.to.y - midY) * p;
          }

          ctx.fillStyle = primaryColor;
          ctx.shadowColor = primaryColor;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        // Draw PCB Solder Pads / Vias
        nodes.forEach((n) => {
          n.pulse += n.speed;
          const alpha = 0.3 + Math.sin(n.pulse) * 0.25;

          // Outer ring
          ctx.strokeStyle = primaryColor;
          ctx.globalAlpha = alpha * 0.6;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius * 2, 0, Math.PI * 2);
          ctx.stroke();

          // Inner via hole
          ctx.fillStyle = primaryColor;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        });

        animationFrameId = requestAnimationFrame(drawCircuit);
      };

      drawCircuit();
    }
    // 2. PARTICLES & STARS ANIMATION
    else if (bgEffect === 'particles-stars') {
      const particles = [];
      const count = Math.min(60, Math.floor(width / 25));

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2 + 0.5,
          alpha: Math.random() * 0.7 + 0.2,
        });
      }

      const drawParticles = () => {
        ctx.clearRect(0, 0, width, height);

        particles.forEach((p, idx) => {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.fillStyle = primaryColor;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Connect nearby particles with subtle line
          for (let j = idx + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist < 100) {
              ctx.strokeStyle = primaryColor;
              ctx.globalAlpha = (1 - dist / 100) * 0.15;
              ctx.lineWidth = 0.6;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        });
        ctx.globalAlpha = 1.0;
        animationFrameId = requestAnimationFrame(drawParticles);
      };

      drawParticles();
    }
    // 3. MATRIX RAIN CODE
    else if (bgEffect === 'matrix-code') {
      const columns = Math.floor(width / 20);
      const drops = Array(columns).fill(1);
      const chars = '01STM32FPGAARMVHDLRTOSCANFDHEX89ABCDEF';

      const drawMatrix = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = primaryColor;
        ctx.font = '12px monospace';

        for (let i = 0; i < drops.length; i++) {
          const char = chars[Math.floor(Math.random() * chars.length)];
          const x = i * 20;
          const y = drops[i] * 20;

          ctx.fillText(char, x, y);

          if (y > height && Math.random() > 0.98) {
            drops[i] = 0;
          }
          drops[i]++;
        }

        animationFrameId = requestAnimationFrame(drawMatrix);
      };

      drawMatrix();
    }
    // 4. SUBTLE NOISE / AURORA
    else {
      ctx.clearRect(0, 0, width, height);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [bgEffect, primaryColor, showAnimation]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Background radial gradient glow according to template */}
      <div
        className="absolute inset-0 opacity-40 transition-colors duration-700"
        style={{
          background: `radial-gradient(circle at 50% 15%, ${primaryColor}18 0%, transparent 65%)`,
        }}
      />
      {bgEffect === 'aurora-gradient' && (
        <div className="absolute inset-0 opacity-30 animate-pulse-slow">
          <div
            className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl"
            style={{ background: `${primaryColor}30` }}
          />
          <div
            className="absolute top-1/3 -right-40 w-96 h-96 rounded-full blur-3xl"
            style={{ background: `${currentTemplate?.colors?.secondary || '#818cf8'}25` }}
          />
        </div>
      )}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
