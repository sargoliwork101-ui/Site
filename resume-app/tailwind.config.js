/**
 * ═══════════════════════════════════════════════════════════════════
 * tailwind.config.js — سفارشی‌سازی Tailwind (فونت‌ها، رنگ‌ها، انیمیشن‌ها)
 * ═══════════════════════════════════════════════════════════════════
 * چی توشه؟ فونت‌های font-vazir/shabnam/...، پالت‌های pcb/* و cyber/*، و
 *   انیمیشن‌های pulse-slow/float/glow/spin-slow که با همین نام‌ها داخل
 *   کلاس‌های کامپوننت‌ها استفاده می‌شن.
 * کِی بازش کن؟ اضافه کردن فونت/رنگ/انیمیشن جدید که با Tailwind صدا زده بشه.
 * ⚠️ فونت‌های Shabnam/Sahel/Estedad باندل نیستن — App.jsx عمداً Vazirmatn
 *   رو fallback گذاشته تا فارسی همیشه درست رندر بشه.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        vazir: ['Vazirmatn', 'Tahoma', 'sans-serif'],
        shabnam: ['Shabnam', 'Vazirmatn', 'sans-serif'],
        sahel: ['Sahel', 'Vazirmatn', 'sans-serif'],
        estedad: ['Estedad', 'Vazirmatn', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace'],
        sans: ['Plus Jakarta Sans', 'Vazirmatn', 'sans-serif'],
        serif: ['Playfair Display', 'Sahel', 'serif'],
      },
      colors: {
        pcb: {
          dark: '#0a1912',
          green: '#00cc66',
          gold: '#e6b800',
          copper: '#d97706',
          trace: '#10b981',
          silk: '#f8fafc',
        },
        cyber: {
          neon: '#00ffcc',
          purple: '#b026ff',
          pink: '#ff007f',
          dark: '#080811',
          card: '#121224',
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { filter: 'drop-shadow(0 0 5px rgba(0, 255, 204, 0.4))' },
          '100%': { filter: 'drop-shadow(0 0 15px rgba(0, 255, 204, 0.9))' },
        }
      }
    },
  },
  plugins: [],
}
