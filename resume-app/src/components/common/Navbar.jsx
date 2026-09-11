/**
 * ═══════════════════════════════════════════════════════════════════
 * Navbar.jsx — نوبار شناور (برند + منوی همبرگری + جستجو + ورود ادمین)
 * ═══════════════════════════════════════════════════════════════════
 * چی توشه؟ هدر فیکس با افکت اسکرول، منوی همبرگری (navLinks — لینک سکشن‌های
 * غیرخالی به‌صورت داینامیک)، دکمه ذره‌بین جستجو (Ctrl+K)، دانلود رزومه، و
 * دکمه ورود ادمین (اگه لاگین باشه مستقیم پنل رو باز می‌کنه).
 * ⚠️ لینک سکشن خالی رو به navLinks اضافه نکن (قانون ۵: سکشن خالی لینک نداره).
 */
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import {
  Globe,
  Menu,
  X,
  Cpu,
  BookOpen,
  Briefcase,
  Layers,
  Send,
  Sparkles,
  ShieldCheck,
  Search,
  Newspaper
} from 'lucide-react';

export const Navbar = () => {
  const {
    data,
    currentTemplate,
    setIsLoginModalOpen,
    setIsAdminOpen,
    setIsSearchModalOpen,
    navigateToBlog,
    isAuthenticated,
    toggleLanguage,
  } = useData();

  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const lang = data?.siteConfig?.language || 'fa';
  const isFa = lang === 'fa';
  const info = data?.personalInfo || {};
  const primaryColor = currentTemplate?.colors?.primary || '#00ffcc';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter navigation links dynamically based on populated content in database
  const navLinks = [
    { id: 'hero', labelFa: 'صفحه اصلی', labelEn: 'Home', href: '#hero', icon: Sparkles, show: true },
    { id: 'boards', labelFa: 'بردهای ساخته‌شده', labelEn: 'Hardware Boards', href: '#boards', icon: Cpu, show: (data?.boards || []).length > 0 },
    { id: 'articles', labelFa: 'مقالات تخصصی', labelEn: 'Publications', href: '#articles', icon: BookOpen, show: (data?.articles || []).length > 0 },
    { id: 'skills', labelFa: 'مهارت‌های فنی', labelEn: 'Skills Matrix', href: '#skills', icon: Layers, show: (data?.skills || []).length > 0 },
    { id: 'experience', labelFa: 'سوابق و مدارک', labelEn: 'Experience', href: '#experience', icon: Briefcase, show: ((data?.experiences || []).length > 0 || (data?.education || []).length > 0 || (data?.certifications || []).length > 0) },
    { id: 'contact', labelFa: 'تماس مستقیم', labelEn: 'Contact', href: '#contact', icon: Send, show: true },
  ].filter((l) => l.show);

  const handleAdminClick = () => {
    setMenuOpen(false);
    if (isAuthenticated) {
      setIsAdminOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'py-3 backdrop-blur-xl border-b shadow-2xl'
          : 'py-5 bg-transparent'
      }`}
      style={{
        backgroundColor: isScrolled ? `${currentTemplate?.colors?.bg || '#0b0f19'}dd` : 'transparent',
        borderColor: isScrolled ? (currentTemplate?.colors?.border || '#1e293b') : 'transparent',
      }}
    >
      {/* Bar: brand + hamburger only, at every width — nothing left to overlap */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <a href="#hero" className="flex items-center gap-3 group shrink-0 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-lg shadow-lg transition-transform group-hover:scale-105 shrink-0"
            style={{
              backgroundColor: `${primaryColor}20`,
              color: primaryColor,
              border: `1.5px solid ${primaryColor}60`,
              boxShadow: `0 0 15px ${primaryColor}25`,
            }}
          >
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-base sm:text-lg text-slate-100 group-hover:text-white truncate">
                {isFa ? info.fullNameFa : info.fullNameEn}
              </span>
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block truncate max-w-[200px]">
              {isFa ? (info.titleFa || 'طراح سخت‌افزار و امبدد') : (info.titleEn || 'Hardware & Embedded Dev')}
            </p>
          </div>
        </a>

        {/* Quick icons + menu toggle (all screen sizes) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="w-10 h-10 grid place-items-center rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/50 transition-colors"
            aria-label={isFa ? 'جستجوی سایت' : 'Search site'}
            title={isFa ? 'جستجوی سایت' : 'Search site'}
          >
            <Search className="w-5 h-5 text-cyan-400" />
          </button>
          <button
            onClick={toggleLanguage}
            className="w-10 h-10 grid place-items-center rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/50 transition-colors"
            aria-label={isFa ? 'English version' : 'نسخه فارسی'}
            title={isFa ? 'English version' : 'نسخه فارسی'}
          >
            <Globe className="w-5 h-5 text-sky-400" />
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 grid place-items-center rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/50 transition-colors"
            aria-label={isFa ? 'باز و بسته کردن منو' : 'Toggle navigation menu'}
            title={isFa ? 'منوی سایت' : 'Site menu'}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Dropdown Menu (all screen sizes) */}
      {menuOpen && (
        <div className="bg-slate-900/95 backdrop-blur-2xl border-b border-slate-800 mt-3 animate-fadeIn">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-6 space-y-2">
            {/* Quick action: admin panel (search + language live in the top bar now) */}
            <button
              onClick={handleAdminClick}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border mb-3 ${
                isAuthenticated
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                  : 'bg-slate-800 text-amber-300 hover:bg-slate-700 border-amber-500/40'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{isFa ? 'پنل مدیریت' : 'Admin Panel'}</span>
            </button>

            {/* Blog portal */}
            <button
              type="button"
              onClick={() => {
                navigateToBlog();
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 mb-2"
            >
              <Newspaper className="w-4 h-4 text-cyan-400" />
              <span>{isFa ? 'وبلاگ و مقالات تخصصی' : 'Engineering Blog'}</span>
            </button>

            {/* Section links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span>{isFa ? link.labelFa : link.labelEn}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
