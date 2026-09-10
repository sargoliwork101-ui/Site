import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import {
  FileDown,
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
    setIsPdfModalOpen,
    setIsLoginModalOpen,
    setIsAdminOpen,
    setIsSearchModalOpen,
    navigateToBlog,
    isAuthenticated,
    toggleLanguage,
  } = useData();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand / Logo */}
        <a href="#hero" className="flex items-center gap-3 group">
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
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-base sm:text-lg text-slate-100 group-hover:text-white">
                {isFa ? info.fullNameFa : info.fullNameEn}
              </span>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block truncate max-w-[200px]">
              {isFa ? (info.titleFa || 'طراح سخت‌افزار و امبدد') : (info.titleEn || 'Hardware & Embedded Dev')}
            </p>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 rounded-full px-4 py-1.5 backdrop-blur-md border border-slate-800/80 bg-slate-900/40">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.id}
                href={link.href}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-full transition-colors hover:bg-slate-800/60"
              >
                <Icon className="w-3.5 h-3.5 opacity-70" />
                <span>{isFa ? link.labelFa : link.labelEn}</span>
              </a>
            );
          })}

          {/* Dedicated Standalone Blog Portal Trigger */}
          <button
            onClick={() => navigateToBlog()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-cyan-300 hover:text-white rounded-full transition-all hover:bg-cyan-500/20 border border-cyan-500/40 shadow-sm"
            title={isFa ? 'مشاهده وبلاگ و یادداشت‌های تخصصی مهندسی' : 'Open Engineering Blog & Technical Insights'}
          >
            <Newspaper className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isFa ? 'وبلاگ تخصصی' : 'Tech Blog'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </button>
        </nav>

        {/* Action Controls & Modal Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Blog Button on Medium Screens */}
          <button
            onClick={() => navigateToBlog()}
            className="hidden sm:flex lg:hidden items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 shadow-sm"
            title={isFa ? 'وبلاگ مهندسی' : 'Tech Blog'}
          >
            <Newspaper className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isFa ? 'وبلاگ' : 'Blog'}</span>
          </button>

          {/* Subtle Global Search Button (Magnifying Glass) */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="p-2 sm:px-2.5 sm:py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition-all text-xs flex items-center gap-1.5 shadow-sm group"
            title={isFa ? 'جستجوی هوشمند در سایت (Ctrl + K)' : 'Spotlight Search (Ctrl + K)'}
          >
            <Search className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="hidden xl:inline font-mono text-[10px] text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700/60">
              ⌘K
            </span>
          </button>

          {/* Download PDF Resume Button */}
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 transition-all hover:border-slate-500 hover:text-white shadow-sm"
            title={isFa ? 'مشاهده و دانلود نسخه PDF رزومه' : 'View & Download Resume PDF'}
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">{isFa ? 'دانلود PDF رزومه' : 'PDF Resume'}</span>
            <span className="sm:hidden">{isFa ? 'PDF' : 'CV'}</span>
          </button>

          {/* Admin Panel Button */}
          <button
            onClick={handleAdminClick}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${
              isAuthenticated
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                : 'bg-slate-800/80 text-amber-300 border-amber-500/40 hover:bg-amber-500/20'
            }`}
            title={isFa ? 'ورود به پنل مدیریت پیشرفته سایت' : 'Super Admin Workspace Login'}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">{isFa ? 'پنل مدیریت' : 'Admin Panel'}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition-colors text-xs font-mono font-bold"
            title={isFa ? 'تغییر زبان سایت (فارسی / English)' : 'Switch Site Language (FA / EN)'}
          >
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>{isFa ? 'EN' : 'فا'}</span>
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-800/60 text-slate-300 hover:text-white border border-slate-700/50"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900/95 backdrop-blur-2xl border-b border-slate-800 px-4 pt-3 pb-6 mt-3 space-y-2 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => {
                setIsSearchModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700"
            >
              <Search className="w-4 h-4 text-cyan-400" />
              <span>{isFa ? 'جستجوی سایت' : 'Search Site'}</span>
            </button>
            <button
              onClick={() => {
                setIsPdfModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700"
            >
              <FileDown className="w-4 h-4 text-emerald-400" />
              <span>{isFa ? 'دانلود PDF' : 'PDF Resume'}</span>
            </button>
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                navigateToBlog();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 mb-2"
            >
              <Newspaper className="w-4 h-4 text-cyan-400" />
              <span>{isFa ? 'وبلاگ و مقالات تخصصی' : 'Engineering Blog'}</span>
            </button>

            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{isFa ? link.labelFa : link.labelEn}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
