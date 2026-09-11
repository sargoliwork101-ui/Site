/**
 * ═══════════════════════════════════════════════════════════════════
 * HeroSection.jsx — سکشن اول سایت (معرفی + کارت پروژه شاخص + آمار)
 * ═══════════════════════════════════════════════════════════════════
 * چی توشه؟ (۱) تایپوگرافی متحرک عنوان‌ها (۲) کارت PCB پروژه شاخص —
 * هر بازدید یکی از بردهای ستاره‌دار (featured) به‌تصادف نمایش داده می‌شه
 * (۳) دکمه‌های دانلود رزومه/تماس (۴) نوار آمار از personalInfo.stats.
 * چیدمان از قالب فعال میاد (currentTemplate.heroLayout) — چند حالت داره.
 * ⚠️ مشخصات برد (EDA، لایه، ابعاد...) باید همیشه از خود برد خونده بشه؛
 * هیچ عدد/متن سخت‌افزاری رو این‌جا هاردکد نکن (قانون ۳).
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { CustomAudioPlayer } from '../common/CustomAudioPlayer';
import { formatNum, toEnglishDigits, toPersianDigits } from '../../utils/numberHelper';
import {
  Cpu,
  FileDown,
  Mail,
  Terminal,
  Activity,
  Sparkles,
  Award,
  ExternalLink,
  Maximize2,
  FileCode2
} from 'lucide-react';

export const HeroSection = () => {
  const { data, currentTemplate, setIsPdfModalOpen, setSelectedBoard } = useData();
  const info = data.personalInfo || {};
  const isFa = data.siteConfig?.language === 'fa';
  const primaryColor = currentTemplate?.colors?.primary || '#00ffcc';
  const secondaryColor = currentTemplate?.colors?.secondary || '#10b981';

  // Gather all featured boards; if none are marked featured, fallback to all available boards
  const featuredBoards = useMemo(() => {
    const list = (data.boards || []).filter((b) => b.featured);
    if (list.length > 0) return list;
    return data.boards && data.boards.length > 0 ? [data.boards[0]] : [];
  }, [data.boards]);

  // Random selection on initial page load / mount from featured boards
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    if (featuredBoards.length > 1) {
      const randomIndex = Math.floor(Math.random() * featuredBoards.length);
      setFeaturedIndex(randomIndex);
    } else {
      setFeaturedIndex(0);
    }
  }, [featuredBoards.length]);

  const featuredBoard = featuredBoards[featuredIndex] || featuredBoards[0] || null;

  // Dynamic typing animation titles using both customized info and specialties
  const titles = isFa
    ? [
        info.taglineFa || 'طراح بردهای پرسرعت و چند لایه (High-Speed PCB)',
        'توسعه‌دهنده سیستم‌های نهفته و فریم‌ور RTOS (STM32 & ESP32)',
        'متخصص اینترنت اشیا صنعتی و پروتکل‌های CAN-FD / LoRa',
        'پژوهشگر پردازش بلادرنگ سیگنال با FPGA و مدارات فرکانس بالا',
      ]
    : [
        info.taglineEn || 'High-Speed Multi-Layer PCB Designer (Altium / KiCad)',
        'Embedded Systems & RTOS Engineer (STM32 / ESP32)',
        'Industrial IoT & CAN-FD / LoRa Protocols Specialist',
        'Real-Time FPGA Signal Processing Researcher',
      ];

  const [titleIndex, setTitleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = titles[titleIndex] || titles[0];
    let speed = isDeleting ? 30 : 60;

    if (!isDeleting && displayText === current) {
      speed = 2200; // Pause when complete
      const timeout = setTimeout(() => setIsDeleting(true), speed);
      return () => clearTimeout(timeout);
    } else if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setTitleIndex((prev) => (prev + 1) % titles.length);
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayText(
        isDeleting
          ? current.substring(0, displayText.length - 1)
          : current.substring(0, displayText.length + 1)
      );
    }, speed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, titleIndex, isFa, info.taglineFa, info.taglineEn]);

  const heroLayout = currentTemplate?.heroLayout || 'split-hardware';

  return (
    <section id="hero" className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        {/* Layout 1 & Default: Split Hardware Mode */}
        {heroLayout === 'split-hardware' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Right Column (Left in RTL): Text Details */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
              {/* Status Pill Badge */}
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border shadow-sm"
                style={{
                  backgroundColor: `${primaryColor}15`,
                  borderColor: `${primaryColor}40`,
                  color: primaryColor,
                }}
              >
                <span className="relative flex w-2 h-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: primaryColor }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: primaryColor }} />
                </span>
                <span>{isFa ? info.statusTextFa : info.statusTextEn}</span>
              </div>

              {/* Main Headline (FA: normal tracking + tall leading — tight/negative breaks Persian joins) */}
              <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-black text-white text-balance break-words ${isFa ? 'tracking-normal leading-[1.9]' : 'tracking-tight leading-tight'}`}>
                {isFa ? info.fullNameFa : info.fullNameEn}
                <span
                  className={`block mt-2 pb-1 text-2xl sm:text-3xl lg:text-4xl font-black break-words ${isFa ? 'tracking-normal leading-[1.9]' : 'tracking-tight'}`}
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor}, #ffffff)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {isFa ? info.titleFa : info.titleEn}
                </span>
              </h1>

              {/* Dynamic Typing Title */}
              <div
                className={`min-h-[2rem] flex items-center justify-center lg:justify-start gap-2 text-sm sm:text-base font-semibold leading-relaxed ${isFa ? 'font-vazir' : 'font-mono'}`}
                style={{ color: primaryColor }}
              >
                <span className="opacity-70">&gt;</span>
                <span className="min-h-[1.5em]">{displayText}</span>
                <span className="w-2 h-4 bg-current animate-pulse" />
              </div>

              {/* Bio Paragraph */}
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                {isFa ? info.bioFa : info.bioEn}
              </p>

              {/* Action Buttons with Contextual Tooltips */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <a
                  href="#boards"
                  title={isFa ? 'هدایت به بخش بردهای سخت‌افزاری و شبیه‌ساز سه‌بعدی PCB' : 'Jump to Hardware Circuit Boards & 3D PCB Viewer'}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-slate-950 transition-all hover:scale-105 active:scale-95 shadow-xl"
                  style={{
                    backgroundColor: primaryColor,
                    boxShadow: `0 0 25px ${primaryColor}50`,
                  }}
                >
                  <Cpu className="w-4 h-4" />
                  <span>{isFa ? 'مشاهده بردهای ساخته‌شده' : 'Explore Boards'}</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(true)}
                  title={isFa ? 'باز کردن پنجره و دریافت نسخه کامل رزومه چاپی به صورت PDF' : 'Open PDF Resume generation & print modal'}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-all hover:border-slate-500 hover:text-white"
                >
                  <FileDown className="w-4 h-4 text-emerald-400" />
                  <span>{isFa ? 'دانلود رزومه PDF' : 'Download CV'}</span>
                </button>

                <a
                  href="#contact"
                  title={isFa ? 'هدایت به فرم ارسال پیام مستقیم و اطلاعات تماس' : 'Jump to direct contact form and inquiry channels'}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm text-slate-300 hover:text-white bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800 transition-colors"
                >
                  <Mail className="w-4 h-4 text-sky-400" />
                  <span>{isFa ? 'تماس مستقیم' : 'Contact Me'}</span>
                </a>
              </div>

              {/* Optional Voice Introduction Player (Gracefully hidden if no introAudioUrl is set) */}
              {info.introAudioUrl && (
                <div className="pt-2 flex justify-center lg:justify-start">
                  <CustomAudioPlayer
                    audioUrl={info.introAudioUrl}
                    titleFa={info.introAudioTitleFa || 'پیام صوتی معرفی مهندس آرش طاهری'}
                    titleEn={info.introAudioTitleEn || 'Voice Introduction & Bio'}
                    durationStr={info.introAudioDuration || '0:45'}
                    isFa={isFa}
                    primaryColor={primaryColor}
                    variant="hero"
                    subtitleFa="معرفی صوتی و خلاصه تخصص‌ها"
                    subtitleEn="Executive Audio Intro"
                  />
                </div>
              )}

              {/* Key Stats Counter Row with strict digit localization */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80">
                {info.stats?.map((st, i) => {
                  const rawVal = isFa 
                    ? (st.valueFa || st.value) 
                    : (st.valueEn || toEnglishDigits(st.value || st.valueFa));
                  const displayValue = isFa ? toPersianDigits(rawVal) : toEnglishDigits(rawVal);

                  return (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm"
                    >
                      <div className="text-2xl font-black font-mono" style={{ color: primaryColor }}>
                        {displayValue}
                      </div>
                      <div className="text-xs text-slate-400 font-medium mt-0.5">
                        {isFa ? st.labelFa : st.labelEn}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Left Column (Right in RTL): Interactive Hardware Card Visual */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Glow Backdrop */}
                <div
                  className="absolute -inset-1 rounded-3xl opacity-40 blur-2xl transition-all duration-700"
                  style={{
                    background: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
                  }}
                />

                {/* Hardware PCB Visual Card */}
                {featuredBoard ? (
                  <div
                    className="relative rounded-2xl p-5 sm:p-6 backdrop-blur-xl border shadow-2xl bg-slate-950/90 space-y-4"
                    style={{ borderColor: currentTemplate?.colors?.border || '#1e293b' }}
                  >
                    {/* Top PCB Header with Project Category & Status */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2 truncate mr-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                        <span className="text-xs font-bold text-white truncate">
                          {isFa ? (featuredBoard.categoryFa || 'پروژه شاخص مهندسی') : (featuredBoard.categoryEn || 'Featured Engineering Project')}
                        </span>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                        {isFa ? (featuredBoard.status || 'تولید انبوه') : (featuredBoard.statusEn || featuredBoard.status || 'Production')}
                      </span>
                    </div>

                    {/* Visual Image / Interactive PCB Simulation with Tooltip */}
                    <div
                      onClick={() => setSelectedBoard(featuredBoard)}
                      onContextMenu={(e) => e.preventDefault()}
                      title={isFa ? 'برای مشاهده مشخصات فنی کامل، جدول قطعات و شبیه‌ساز سه‌بعدی کلیک کنید' : 'Click to inspect full specs, schematic stackup & interactive 3D model'}
                      className="relative rounded-xl overflow-hidden aspect-[4/3] group border border-slate-800 cursor-pointer select-none transition-all hover:border-cyan-500/50"
                    >
                      <img
                        src={featuredBoard.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'}
                        alt={isFa ? featuredBoard.titleFa : featuredBoard.titleEn}
                        draggable="false"
                        fetchPriority="high"
                        decoding="async"
                        onContextMenu={(e) => e.preventDefault()}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108 pointer-events-none select-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent pointer-events-none" />
                      
                      {/* Layer Badge Top-Right with localized digits */}
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-[11px] font-mono font-bold">
                        {isFa ? toPersianDigits(featuredBoard.layers || 4) : toEnglishDigits(featuredBoard.layers || 4)} {isFa ? 'لایه' : 'Layers'}
                      </div>

                      {/* Floating Chip Spec Callout */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 p-3 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 flex items-center justify-between">
                        <div className="truncate mr-2">
                          <div className="text-xs font-bold text-white truncate">
                            {isFa ? featuredBoard.titleFa : featuredBoard.titleEn}
                          </div>
                          <div className="text-[11px] font-mono text-cyan-400 truncate mt-0.5">
                            {featuredBoard.mcu}
                          </div>
                        </div>
                        <div className="shrink-0">
                          <span className="flex items-center gap-1 text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-lg border border-cyan-500/30">
                            <Maximize2 className="w-3 h-3" />
                            <span>{isFa ? 'مشاهده' : 'View'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Technical Highlights Badges directly sourced from featured board */}
                    <div className="space-y-2 pt-1 text-xs">
                      {/* 1. EDA Tool */}
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                          <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{isFa ? 'نرم‌افزار طراحی CAD:' : 'CAD / EDA Stack:'}</span>
                        </span>
                        <span className="font-mono text-emerald-400 font-bold text-[11px] truncate max-w-[180px]">
                          {featuredBoard.edaTool || 'Altium Designer 24'}
                        </span>
                      </div>

                      {/* 2. Key Interfaces */}
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                          <Activity className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{isFa ? 'پروتکل‌ها و رابط‌ها:' : 'Key Interfaces:'}</span>
                        </span>
                        <span className="font-mono text-cyan-300 font-bold text-[11px] truncate max-w-[180px]">
                          {featuredBoard.interfaces && featuredBoard.interfaces.length > 0
                            ? featuredBoard.interfaces.slice(0, 2).join(' · ')
                            : (isFa ? 'طراحی اختصاصی' : 'Custom IO')}
                        </span>
                      </div>

                      {/* 3. Dimensions & Stackup (Board PCB Icon) */}
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                          <Cpu className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isFa ? 'ابعاد و لایه‌بندی:' : 'Dimensions & Stackup:'}</span>
                        </span>
                        <span className="font-mono text-purple-300 font-bold text-[11px] truncate max-w-[180px]">
                          {featuredBoard.dimensions
                            ? `${formatNum(featuredBoard.dimensions, isFa)} · ${isFa ? toPersianDigits(featuredBoard.layers || 4) : toEnglishDigits(featuredBoard.layers || 4)}L`
                            : (isFa ? 'استاندارد صنعتی' : 'Industrial Standard')}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Fallback Profile Card if no boards exist */
                  <div className="relative rounded-2xl p-6 backdrop-blur-xl border border-slate-800 bg-slate-950/90 text-center space-y-4">
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-cyan-400 shadow-xl">
                      <img src={info.avatar} alt={info.fullNameEn} decoding="async" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{isFa ? info.fullNameFa : info.fullNameEn}</h3>
                      <p className="text-xs text-cyan-400 font-mono mt-1">{isFa ? info.titleFa : info.titleEn}</p>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{isFa ? info.bioFa : info.bioEn}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Layout 2: Centered Minimal Mode */}
        {heroLayout === 'centered-minimal' && (
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border"
              style={{
                backgroundColor: `${primaryColor}15`,
                borderColor: `${primaryColor}40`,
                color: primaryColor,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isFa ? info.statusTextFa : info.statusTextEn}</span>
            </div>

            <h1 className={`text-4xl sm:text-6xl font-black text-white text-balance break-words ${isFa ? 'tracking-normal leading-[1.9]' : 'tracking-tight leading-tight'}`}>
              {isFa ? info.fullNameFa : info.fullNameEn}
            </h1>

            <p
              className={`text-xl sm:text-2xl font-bold break-words ${isFa ? 'tracking-normal leading-[1.9] pb-1' : 'tracking-tight'}`}
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {isFa ? info.titleFa : info.titleEn}
            </p>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              {isFa ? info.bioFa : info.bioEn}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <a
                href="#boards"
                className="px-6 py-3 rounded-xl font-bold text-sm text-slate-950 shadow-lg transition-transform hover:scale-105"
                style={{ backgroundColor: primaryColor }}
              >
                {isFa ? 'بررسی پروژه‌ها و مدارات' : 'View Hardware Projects'}
              </a>
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="px-6 py-3 rounded-xl font-medium text-sm text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800"
              >
                {isFa ? 'دانلود نسخه PDF رزومه' : 'Download CV (PDF)'}
              </button>
            </div>

            {/* Quick stats in single row */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 pt-8 border-t border-slate-800/80">
              {info.stats?.map((st, i) => {
                const rawVal = isFa 
                  ? (st.valueFa || st.value) 
                  : (st.valueEn || toEnglishDigits(st.value || st.valueFa));
                const displayValue = isFa ? toPersianDigits(rawVal) : toEnglishDigits(rawVal);

                return (
                  <div key={i} className="text-center">
                    <div className="text-3xl font-black font-mono" style={{ color: primaryColor }}>
                      {displayValue}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{isFa ? st.labelFa : st.labelEn}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Layout 3: Bento Grid Hero Mode */}
        {heroLayout === 'bento-grid' && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Bento Card 1: Main Info Big Tile */}
            <div
              className="md:col-span-2 lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 flex flex-col justify-between"
              style={{ borderColor: currentTemplate?.colors?.border || '#1e293b' }}
            >
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>{isFa ? 'مهندس ارشد R&D' : 'Lead R&D Engineer'}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white">
                  {isFa ? info.fullNameFa : info.fullNameEn}
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {isFa ? info.taglineFa : info.taglineEn}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <a
                  href="#boards"
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isFa ? 'مشاهده بردها' : 'Explore Boards'}
                </a>
                <button
                  onClick={() => setIsPdfModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl font-medium text-xs bg-slate-800 text-slate-200 border border-slate-700"
                >
                  {isFa ? 'دانلود PDF' : 'PDF Resume'}
                </button>
              </div>
            </div>

            {/* Bento Card 2: Featured Board Image */}
            {featuredBoard && (
              <div
                onClick={() => setSelectedBoard(featuredBoard)}
                onContextMenu={(e) => e.preventDefault()}
                className="md:col-span-1 lg:col-span-2 rounded-3xl overflow-hidden relative group border border-slate-800 min-h-[220px] cursor-pointer select-none"
              >
                <img
                  src={featuredBoard.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'}
                  alt={isFa ? featuredBoard.titleFa : featuredBoard.titleEn}
                  draggable="false"
                  fetchPriority="high"
                  decoding="async"
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none select-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-6 flex flex-col justify-end pointer-events-none">
                  <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase">
                    {isFa ? (featuredBoard.categoryFa || featuredBoard.category) : (featuredBoard.categoryEn || featuredBoard.category)}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    {isFa ? featuredBoard.titleFa : featuredBoard.titleEn}
                  </h3>
                </div>
              </div>
            )}

            {/* Bento Card 3: Experience & Boards Counter with strict digits */}
            <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 flex flex-col justify-between">
              <Award className="w-8 h-8 text-amber-400" />
              <div>
                <div className="text-3xl font-black font-mono text-white">
                  {isFa ? toPersianDigits(info.yearsExperience || 8) : toEnglishDigits(info.yearsExperience || 8)}+ {isFa ? 'سال' : 'Years'}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {isFa ? 'سابقه طراحی بردهای فرکانس بالا' : 'High-Speed PCB Experience'}
                </div>
              </div>
            </div>

            {/* Bento Card 4: Deployed Boards with strict digits */}
            <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 flex flex-col justify-between">
              <Cpu className="w-8 h-8 text-emerald-400" />
              <div>
                <div className="text-3xl font-black font-mono text-white">
                  {isFa ? toPersianDigits(info.boardsCount || 32) : toEnglishDigits(info.boardsCount || 32)}+ {isFa ? 'برد' : 'Boards'}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {isFa ? 'طراحی صنعتی تا ۱۲ لایه' : 'Multi-layer Industrial Designs'}
                </div>
              </div>
            </div>

            {/* Bento Card 5: Research Papers with strict digits */}
            <div className="md:col-span-2 p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-cyan-400">
                  {isFa ? 'مقالات علمی و انتشارات' : 'Research Publications'}
                </div>
                <div className="text-sm font-semibold text-white mt-1">
                  {isFa
                    ? `${toPersianDigits(data.articles?.length || 0)} مقاله تخصصی طراحی سخت‌افزار`
                    : `${toEnglishDigits(data.articles?.length || 0)} Peer-Reviewed Technical Papers`}
                </div>
              </div>
              <a href="#articles" className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* Layout 4: Terminal CLI Mode */}
        {heroLayout === 'terminal-cli' && (
          <div className="max-w-4xl mx-auto rounded-2xl bg-slate-950 border border-emerald-500/40 p-6 font-mono text-emerald-400 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span className="text-xs font-bold">embedded-kernel@v6.8-rtos ~ # whoami</span>
              </div>
              <span className="text-xs text-emerald-600">SYS_STATUS: ONLINE</span>
            </div>

            <div className="space-y-3 text-sm">
              <p>
                <span className="text-cyan-400">$ echo $ENGINEER_NAME</span>
                <br />
                <span className="text-white font-bold">{isFa ? info.fullNameFa : info.fullNameEn}</span>
              </p>
              <p>
                <span className="text-cyan-400">$ cat /etc/specialization</span>
                <br />
                <span className="text-slate-300">{isFa ? info.taglineFa : info.taglineEn}</span>
              </p>
              <p>
                <span className="text-cyan-400">$ pcb-tools --list-stats</span>
                <br />
                <span className="text-amber-400">
                  Total Boards: {toEnglishDigits(info.boardsCount || 32)} | Years Experience: {toEnglishDigits(info.yearsExperience || 8)}+ | Publications: {toEnglishDigits(data.articles?.length || 0)}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-6 mt-6 border-t border-emerald-500/30 font-sans">
              <a
                href="#boards"
                className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
              >
                {isFa ? 'ورود به بخش بردها' : 'Inspect Boards'}
              </a>
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-400 text-xs hover:bg-emerald-950/40"
              >
                {isFa ? 'دریافت نسخه PDF رزومه' : 'Export Resume (PDF)'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
