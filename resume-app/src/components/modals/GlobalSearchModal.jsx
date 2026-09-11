import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { toEnglishDigits, toPersianDigits } from '../../utils/numberHelper';
import {
  Search,
  X,
  Cpu,
  BookOpen,
  Layers,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Newspaper
} from 'lucide-react';

export const GlobalSearchModal = () => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    data,
    setSelectedBoard,
    setSelectedArticle,
    navigateToBlog,
    currentTemplate,
  } = useData();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const inputRef = useRef(null);

  const isFa = data?.siteConfig?.language === 'fa';
  const primaryColor = currentTemplate?.colors?.primary || '#00ffcc';

  // Keyboard shortcut listener (Ctrl+K, Cmd+K, Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, setIsSearchModalOpen]);

  // Focus input on modal open
  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setActiveCategory('all');
    }
  }, [isSearchModalOpen]);

  // Unified Search Results across Boards, Articles, Skills, Experience
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const list = [];

    // 1. Search in Boards
    if (activeCategory === 'all' || activeCategory === 'boards') {
      (data.boards || []).forEach((board) => {
        const titleMatch =
          (board.titleFa && board.titleFa.toLowerCase().includes(q)) ||
          (board.titleEn && board.titleEn.toLowerCase().includes(q));
        const mcuMatch = board.mcu && board.mcu.toLowerCase().includes(q);
        const catMatch =
          (board.categoryFa && board.categoryFa.toLowerCase().includes(q)) ||
          (board.categoryEn && board.categoryEn.toLowerCase().includes(q));
        const edaMatch = board.edaTool && board.edaTool.toLowerCase().includes(q);
        const descMatch =
          (board.shortDescFa && board.shortDescFa.toLowerCase().includes(q)) ||
          (board.shortDescEn && board.shortDescEn.toLowerCase().includes(q));
        const interfacesMatch = (board.interfaces || []).some((it) => it && String(it).toLowerCase().includes(q));

        if (titleMatch || mcuMatch || catMatch || edaMatch || descMatch || interfacesMatch) {
          list.push({
            type: 'board',
            id: board.id,
            raw: board,
            title: isFa ? board.titleFa : (board.titleEn || board.titleFa),
            subtitle: `${board.layers || 4} ${isFa ? 'لایه' : 'Layers'} · ${board.mcu || board.edaTool}`,
            badge: isFa ? (board.categoryFa || 'برد الکترونیکی') : (board.categoryEn || 'Hardware Board'),
            badgeColor: 'cyan',
            icon: Cpu,
            actionText: isFa ? 'مشاهده مشخصات شماتیک و PCB' : 'Inspect Schematics & PCB',
          });
        }
      });
    }

    // 2. Search in Articles
    if (activeCategory === 'all' || activeCategory === 'articles') {
      (data.articles || []).forEach((art) => {
        const titleMatch =
          (art.titleFa && art.titleFa.toLowerCase().includes(q)) ||
          (art.titleEn && art.titleEn.toLowerCase().includes(q));
        const catMatch =
          (art.categoryFa && art.categoryFa.toLowerCase().includes(q)) ||
          (art.categoryEn && art.categoryEn.toLowerCase().includes(q)) ||
          (art.category && art.category.toLowerCase().includes(q));
        const sumMatch =
          (art.summaryFa && art.summaryFa.toLowerCase().includes(q)) ||
          (art.summaryEn && art.summaryEn.toLowerCase().includes(q));
        const tagMatch = (art.tags || []).some((t) => t && String(t).toLowerCase().includes(q));

        if (titleMatch || catMatch || sumMatch || tagMatch) {
          list.push({
            type: 'article',
            id: art.id,
            raw: art,
            title: isFa ? art.titleFa : (art.titleEn || art.titleFa),
            subtitle: `${isFa ? (art.categoryFa || art.category) : (art.categoryEn || art.category)} · ${art.readTime || '10 min'}`,
            badge: isFa ? 'مقاله تخصصی' : 'Publication',
            badgeColor: 'emerald',
            icon: BookOpen,
            actionText: isFa ? 'مطالعه مقاله و دانلود فایل' : 'Read Paper & Download',
          });
        }
      });
    }

    // 3. Search in Skills
    if (activeCategory === 'all' || activeCategory === 'skills') {
      (data.skills || []).forEach((group) => {
        const groupCatMatch =
          (group.categoryFa && group.categoryFa.toLowerCase().includes(q)) ||
          (group.categoryEn && group.categoryEn.toLowerCase().includes(q));

        (group.items || []).forEach((sk) => {
          const nameMatch =
            (sk.name && sk.name.toLowerCase().includes(q)) ||
            (sk.nameFa && sk.nameFa.toLowerCase().includes(q)) ||
            (sk.nameEn && sk.nameEn.toLowerCase().includes(q));

          if (groupCatMatch || nameMatch) {
            list.push({
              type: 'skill',
              id: `skill-${sk.name || sk.nameFa}`,
              raw: sk,
              title: isFa ? (sk.nameFa || sk.name) : (sk.nameEn || sk.name || sk.nameFa),
              subtitle: `${isFa ? group.categoryFa : (group.categoryEn || group.categoryFa)} · ${isFa ? 'تسلط' : 'Proficiency'} ${sk.level || 90}%`,
              badge: isFa ? 'مهارت تخصصی' : 'Technical Skill',
              badgeColor: 'purple',
              icon: Layers,
              actionText: isFa ? 'پرش به ماتریس مهارت‌ها' : 'Jump to Skills Matrix',
            });
          }
        });
      });
    }

    // 4. Search in Blog Posts
    if (activeCategory === 'all' || activeCategory === 'blog') {
      (data.blogPosts || []).forEach((post) => {
        const titleMatch =
          (post.titleFa && post.titleFa.toLowerCase().includes(q)) ||
          (post.titleEn && post.titleEn.toLowerCase().includes(q));
        const summaryMatch =
          (post.summaryFa && post.summaryFa.toLowerCase().includes(q)) ||
          (post.summaryEn && post.summaryEn.toLowerCase().includes(q));
        const tagsMatch = (post.tags || []).some((t) => t && t.toLowerCase().includes(q));

        if (titleMatch || summaryMatch || tagsMatch) {
          list.push({
            type: 'blog',
            id: post.id,
            raw: post,
            title: isFa ? post.titleFa : (post.titleEn || post.titleFa),
            subtitle: `${isFa ? (post.categoryFa || post.category) : (post.categoryEn || post.category)} · ${post.readTime || '8 min'}`,
            badge: isFa ? 'وبلاگ تخصصی' : 'Tech Blog',
            badgeColor: 'cyan',
            icon: Newspaper,
            actionText: isFa ? 'ورود به پورتال وبلاگ و مطالعه' : 'Open in Tech Blog Portal',
          });
        }
      });
    }

    // 5. Search in Experiences
    if (activeCategory === 'all' || activeCategory === 'experience') {
      (data.experiences || []).forEach((exp) => {
        const roleMatch =
          (exp.roleFa && exp.roleFa.toLowerCase().includes(q)) ||
          (exp.roleEn && exp.roleEn.toLowerCase().includes(q));
        const compMatch =
          (exp.companyFa && exp.companyFa.toLowerCase().includes(q)) ||
          (exp.companyEn && exp.companyEn.toLowerCase().includes(q));
        const skillsMatch = (exp.skillsUsed || []).some((s) => s && s.toLowerCase().includes(q));

        if (roleMatch || compMatch || skillsMatch) {
          list.push({
            type: 'experience',
            id: exp.id,
            raw: exp,
            title: isFa ? exp.roleFa : (exp.roleEn || exp.roleFa),
            subtitle: `${isFa ? exp.companyFa : (exp.companyEn || exp.companyFa)} · ${isFa ? exp.periodFa : exp.periodEn}`,
            badge: isFa ? 'سوابق شغلی' : 'Experience Tree',
            badgeColor: 'amber',
            icon: Briefcase,
            actionText: isFa ? 'مشاهده در درخت سوابق کاری' : 'View in Career Tree',
          });
        }
      });
    }

    return list;
  }, [query, activeCategory, data, isFa]);

  if (!isSearchModalOpen) return null;

  const handleSelectResult = (res) => {
    setIsSearchModalOpen(false);

    if (res.type === 'blog') {
      navigateToBlog(res.raw.slug || res.raw.id);
    } else if (res.type === 'board') {
      setSelectedBoard(res.raw);
      const el = document.getElementById('boards');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (res.type === 'article') {
      setSelectedArticle(res.raw);
      const el = document.getElementById('articles');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (res.type === 'skill') {
      const el = document.getElementById('skills');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (res.type === 'experience') {
      const el = document.getElementById('experience');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const categories = [
    { id: 'all', labelFa: 'همه نتایج', labelEn: 'All' },
    { id: 'blog', labelFa: 'وبلاگ تخصصی', labelEn: 'Blog' },
    { id: 'boards', labelFa: 'بردهای الکترونیکی', labelEn: 'Boards' },
    { id: 'articles', labelFa: 'مقالات پژوهشی', labelEn: 'Articles' },
    { id: 'skills', labelFa: 'مهارت‌های تخصصی', labelEn: 'Skills' },
    { id: 'experience', labelFa: 'سوابق و مدارک', labelEn: 'Experience' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 pb-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={() => setIsSearchModalOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: `0 20px 50px -10px rgba(0,0,0,0.8), 0 0 25px ${primaryColor}20`,
        }}
      >
        {/* Search Header Bar */}
        <div className="relative flex items-center px-5 py-4 border-b border-slate-800 bg-slate-950/90">
          <Search className="w-5 h-5 text-cyan-400 shrink-0 mr-3 rtl:mr-0 rtl:ml-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isFa
                ? 'جستجوی هوشمند در میان بردها، مقالات، مهارت‌ها و سوابق کاری...'
                : 'Quick search boards, articles, skills, and work experiences...'
            }
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none"
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mr-2 rtl:mr-0 rtl:ml-2"
              title={isFa ? 'پاک کردن' : 'Clear search'}
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="px-2 py-1 rounded-lg text-xs font-mono bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
            title="Escape"
          >
            ESC
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="px-5 py-2.5 bg-slate-950/50 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((c) => {
            const active = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {isFa ? c.labelFa : c.labelEn}
              </button>
            );
          })}
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-2">
          {query.trim() === '' ? (
            /* Empty State / Suggestions */
            <div className="py-12 px-6 text-center space-y-4">
              <div
                className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center border"
                style={{
                  backgroundColor: `${primaryColor}15`,
                  borderColor: `${primaryColor}30`,
                  color: primaryColor,
                }}
              >
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {isFa ? 'جستجوی یکپارچه و هوشمند در تمام بخش‌ها' : 'Instant Site-Wide Global Search'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                  {isFa
                    ? 'عنوان برد، نام میکروکنترلر (مانند STM32 یا FPGA)، نام مقاله، موضوعات تخصصی یا شرکت‌ها را تایپ کنید.'
                    : 'Search for board names, MCUs (e.g., STM32, FPGA), article keywords, technical tools, or company history.'}
                </p>
              </div>

              {/* Quick Search Tags */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {['STM32', 'CAN-FD', 'High-Speed PCB', 'Altium', 'BMS', 'FreeRTOS'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1 rounded-lg text-xs bg-slate-800/90 text-slate-300 hover:bg-cyan-500 hover:text-slate-950 transition-colors border border-slate-700/60"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            /* No Results Found */
            <div className="py-12 px-6 text-center space-y-2">
              <p className="text-sm font-bold text-slate-300">
                {isFa ? `نتیجه‌ای برای «${query}» یافت نشد!` : `No results found matching "${query}"`}
              </p>
              <p className="text-xs text-slate-500">
                {isFa
                  ? 'لطفاً عبارت جستجو را تغییر دهید یا دسته‌بندی دیگری را انتخاب نمایید.'
                  : 'Try adjusting your search terms or choosing a different filter category.'}
              </p>
            </div>
          ) : (
            /* Result Items List */
            results.map((res) => {
              const Icon = res.icon;
              return (
                <div
                  key={res.id}
                  onClick={() => handleSelectResult(res)}
                  className="p-3 sm:p-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/50 transition-all cursor-pointer group flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: `${primaryColor}15`,
                        borderColor: `${primaryColor}30`,
                        color: primaryColor,
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {res.title}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                          {res.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">
                        {res.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 text-xs text-cyan-400 font-medium group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                    <span className="hidden sm:inline text-[11px] opacity-80">{res.actionText}</span>
                    {isFa ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            {isFa
              ? `${toPersianDigits(results.length)} نتیجه پیدا شد`
              : `${toEnglishDigits(results.length)} item(s) found`}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">ESC</kbd>
            <span>{isFa ? 'برای بستن' : 'to close'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
