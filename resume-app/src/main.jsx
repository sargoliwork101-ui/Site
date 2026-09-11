/**
 * ═══════════════════════════════════════════════════════════════════
 * main.jsx — نقطه شروع کل سایت (Entry Point)
 * ═══════════════════════════════════════════════════════════════════
 * این فایل چیه؟ اولین فایلی که اجرا می‌شه: فونت‌ها + استایل سراسری رو لود
 *   می‌کنه و کامپوننت App رو داخل <div id="root"> می‌نشونه.
 * کِی بازش کن؟ فقط وقتی می‌خوای فونت جدید اضافه/کم کنی یا رفتار سراسری
 *   رندر (مثل StrictMode) رو عوض کنی. منطق سایت این‌جا نیست!
 * ⚠️ ترتیب ایمپورت فونت‌ها مهم نیست ولی حذف وزنی که استفاده می‌شه،
 *   فونت اون بخش رو به Tahoma برمی‌گردونه (عمداً fallback داریم).
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Self-hosted Persian & mono fonts (bundled locally — no CDN needed, works on any host).
// Only the subsets this site needs are imported to keep the build small:
// Vazirmatn (default UI font): arabic subset = Persian glyphs, latin subset = English UI.
// Perf: only weights actually used (500/600/700/900) — 400/800 had a single
// usage each and were remapped (see HeroSection/ExperienceSection).
import '@fontsource/vazirmatn/arabic-500.css';
import '@fontsource/vazirmatn/latin-500.css';
import '@fontsource/vazirmatn/arabic-600.css';
import '@fontsource/vazirmatn/latin-600.css';
import '@fontsource/vazirmatn/arabic-700.css';
import '@fontsource/vazirmatn/latin-700.css';
import '@fontsource/vazirmatn/arabic-900.css';
import '@fontsource/vazirmatn/latin-900.css';
// Fira Code: used by engineering/mono templates (latin + latin-ext only).
import '@fontsource/fira-code/latin-400.css';
import '@fontsource/fira-code/latin-ext-400.css';
import '@fontsource/fira-code/latin-500.css';
import '@fontsource/fira-code/latin-ext-500.css';
import '@fontsource/fira-code/latin-700.css';
import '@fontsource/fira-code/latin-ext-700.css';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
