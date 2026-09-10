import React, { useEffect, useRef } from 'react';

/**
 * Theme helpers ported from the original site (website/includes/functions.php)
 * — SVG-only graphics, no images.
 */

/** First non-empty language value of a bilingual field {fa,en} | string */
export const bAny = (field) => {
  if (field && typeof field === 'object') {
    const fa = (field.fa || '').trim();
    if (fa !== '') return fa;
    return field.en || '';
  }
  return field || '';
};

/** Localize a bilingual field for the active language (fa fallback) */
export const bLang = (field, lang) => {
  if (field && typeof field === 'object') return field[lang] ?? field.fa ?? '';
  return field || '';
};

/* ------------------------------------------------------------------ */
/* Category icon (port of cat_icon())                                  */
/* ------------------------------------------------------------------ */
const CAT_SVGS = {
  chip: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2.5" />
      <rect x="9.8" y="9.8" width="4.4" height="4.4" rx="1" />
      <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
    </>
  ),
  power: <path d="M13 2.5 4.5 13.5H10l-1 8 8.5-11H12l1-8z" />,
  wifi: (
    <>
      <path d="M2.5 9.5a15 15 0 0 1 19 0M5.5 13a10 10 0 0 1 13 0M8.5 16.3a5.5 5.5 0 0 1 7 0" />
      <circle cx="12" cy="19.3" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.2 5.2l1.9 1.9M16.9 16.9l1.9 1.9M18.8 5.2l-1.9 1.9M7.1 16.9l-1.9 1.9" />
    </>
  ),
  wave: <path d="M2 12c2-4.6 4.4-4.6 6.4 0s4.4 4.6 6.4 0 4.4-4.6 7.2 0" />,
  box: (
    <>
      <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z" />
      <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
    </>
  ),
};

const CAT_KEYS = [
  ['chip', ['pcb', 'board', 'brd', 'کیکاد', 'kicad', 'altium', 'برد', 'طراحی pcb', 'high-speed']],
  ['power', ['power', 'bms', 'تغذیه', 'قدرت', 'شارژر', 'inverter', 'اینورتر']],
  ['wifi', ['iot', 'سنسور', 'sensor', 'wireless', 'lora', 'لوورا', 'ارتباطات بی‌سیم']],
  ['gear', ['motor', 'موتور', 'robot', 'روبوت', 'درایور', 'driver', 'bldc', 'کنترل موتور']],
  ['wave', ['rf', 'آنتن', 'antenna', 'مخابرات', 'radio', 'فرکانس']],
];

export const CatIcon = ({ label, size = 58 }) => {
  const txt = `${bAny(label)} ${label && typeof label === 'object' ? (label.en || '') : ''}`.toLowerCase();
  let icon = 'box';
  for (const [name, keys] of CAT_KEYS) {
    if (keys.some((k) => txt.includes(k))) {
      icon = name;
      break;
    }
  }
  return (
    <svg
      className="cat-ico"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {CAT_SVGS[icon]}
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* Chip emblem (port of chip_emblem())                                 */
/* ------------------------------------------------------------------ */
export const ChipEmblem = ({ className = '' }) => (
  <svg className={`chip-emblem ${className}`} viewBox="0 0 220 220" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="chipG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#4f46e5" />
        <stop offset="1" stopColor="#0891b2" />
      </linearGradient>
    </defs>
    <g className="chip-pins" stroke="url(#chipG)" strokeWidth="5" strokeLinecap="round">
      <path d="M75 18v22M110 18v22M145 18v22M75 180v22M110 180v22M145 180v22M18 75h22M18 110h22M18 145h22M180 75h22M180 110h22M180 145h22" />
    </g>
    <rect x="40" y="40" width="140" height="140" rx="22" fill="#ffffff" stroke="url(#chipG)" strokeWidth="3" />
    <rect x="64" y="64" width="92" height="92" rx="12" fill="url(#chipG)" fillOpacity="0.08" stroke="url(#chipG)" strokeOpacity="0.45" strokeWidth="2.5" />
    <g stroke="url(#chipG)" strokeWidth="2.5" strokeLinecap="round" opacity="0.8">
      <path d="M84 64v-8M136 64v-8M84 156v8M136 156v8M64 84h-8M64 136h-8M156 84h8M156 136h8" />
      <path d="M86 110h12l6-10 9 20 6-10h15" />
    </g>
    <circle cx="154" cy="110" r="3.5" fill="url(#chipG)" className="chip-core" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Hero animated chip visual (port of home.php hero SVG)               */
/* ------------------------------------------------------------------ */
export const HeroChipVisual = () => (
  <svg className="hf-chip-svg" viewBox="0 0 340 340" fill="none" aria-hidden="true">
    {/* مدارهای خروجی از پین‌ها */}
    <g stroke="#a9b4cd" strokeWidth="1.6" fill="none">
      <path d="M160 78 V36 H240" />
      <path d="M262 160 H304 V88" />
      <path d="M139 262 V304 H58" />
      <path d="M78 139 H36 V210" />
    </g>
    <path className="hf-trace-anim" d="M160 78 V36 H240" stroke="#4f46e5" strokeWidth="1.8" fill="none" />
    <g fill="#ffffff" strokeWidth="2">
      <circle cx="240" cy="36" r="5" stroke="#4f46e5" />
      <circle cx="304" cy="88" r="5" stroke="#0891b2" />
      <circle cx="58" cy="304" r="5" stroke="#0891b2" />
      <circle cx="36" cy="210" r="5" stroke="#4f46e5" />
    </g>
    {/* پین‌ها */}
    <g stroke="#9aa6c0" strokeWidth="7" strokeLinecap="round">
      <line x1="118" y1="78" x2="118" y2="100" />
      <line x1="139" y1="78" x2="139" y2="100" />
      <line x1="181" y1="78" x2="181" y2="100" />
      <line x1="202" y1="78" x2="202" y2="100" />
      <line x1="223" y1="78" x2="223" y2="100" />
      <line x1="118" y1="240" x2="118" y2="262" />
      <line x1="139" y1="240" x2="139" y2="262" />
      <line x1="160" y1="240" x2="160" y2="262" />
      <line x1="181" y1="240" x2="181" y2="262" />
      <line x1="202" y1="240" x2="202" y2="262" />
      <line x1="223" y1="240" x2="223" y2="262" />
      <line x1="78" y1="118" x2="100" y2="118" />
      <line x1="78" y1="139" x2="100" y2="139" />
      <line x1="78" y1="160" x2="100" y2="160" />
      <line x1="78" y1="181" x2="100" y2="181" />
      <line x1="78" y1="223" x2="100" y2="223" />
      <line x1="240" y1="118" x2="262" y2="118" />
      <line x1="240" y1="139" x2="262" y2="139" />
      <line x1="240" y1="181" x2="262" y2="181" />
      <line x1="240" y1="202" x2="262" y2="202" />
      <line x1="240" y1="223" x2="262" y2="223" />
    </g>
    {/* پین‌های زنده */}
    <g strokeWidth="7" strokeLinecap="round">
      <line className="hf-pin-anim" x1="160" y1="78" x2="160" y2="100" />
      <line className="hf-pin-anim p2" x1="240" y1="160" x2="262" y2="160" />
      <line className="hf-pin-anim p3" x1="78" y1="202" x2="100" y2="202" />
    </g>
    {/* بدنه چیپ */}
    <rect x="100" y="100" width="140" height="140" rx="22" fill="#ffffff" stroke="#1c2333" strokeWidth="2" />
    <rect x="118" y="118" width="104" height="104" rx="12" fill="#f8fafd" stroke="#e3e8f2" strokeWidth="1.5" />
    <circle cx="126" cy="126" r="4.5" fill="#4f46e5" />
    <circle cx="214" cy="214" r="4.5" fill="#0891b2" />
    <text x="170" y="184" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="30" fontWeight="700" fill="#1c2333">
      EE
    </text>
  </svg>
);

/* ------------------------------------------------------------------ */
/* Reveal-on-scroll (port of main.js IntersectionObserver)             */
/* ------------------------------------------------------------------ */
export const useReveal = (deps = []) => {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)');
    if (!els.length) return undefined;
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

/* ------------------------------------------------------------------ */
/* Count-up stats (port of main.js countUp)                            */
/* ------------------------------------------------------------------ */
export const CountUp = ({ value, className = '' }) => {
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const target = parseInt(value, 10) || 0;
    const run = () => {
      if (started.current) return;
      started.current = true;
      if (target === 0) {
        el.textContent = '0';
        return;
      }
      const dur = 1300;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (!('IntersectionObserver' in window)) {
      run();
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            run();
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
};
