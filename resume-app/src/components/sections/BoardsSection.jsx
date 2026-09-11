/**
 * ═══════════════════════════════════════════════════════════════════
 * BoardsSection.jsx — گرید بردهای سخت‌افزاری صفحه اول
 * ═══════════════════════════════════════════════════════════════════
 * چی توشه؟ مرتب‌سازی زمانی (جدیدترین اول — قانون ۶)، فیلتر دسته، سقف
 * نمایش خودکار (ردیف×ستون از siteConfig) با دکمه «مشاهده بیشتر»، و باز
 * کردن مودال جزئیات با setSelectedBoard.
 * ⚠️ اگه برد صفر باشه کل سکشن null برمی‌گردونه و لینکش از نوبار/فوتر حذف
 * می‌شه (قانون ۵) — این رفتار رو نگه دار. sort روی کپی آرایه انجام می‌شه.
 */
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { formatNum, toEnglishDigits, toPersianDigits } from '../../utils/numberHelper';
import {
  Cpu,
  Layers,
  Maximize2,
  Search,
  Calendar,
  Box,
  Building2,
  User,
  ChevronDown,
  ChevronUp,
  LayoutGrid
} from 'lucide-react';

export const BoardsSection = () => {
  const { data, currentTemplate, setSelectedBoard } = useData();
  const [selectedCategory] = useState('all'); // fixed: pills removed, discovery via search
  const [originFilter, setOriginFilter] = useState('all'); // 'all' | 'company' | 'personal'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc' | 'date-asc' | 'layers-desc'
  const [isExpanded, setIsExpanded] = useState(false);

  const isFa = data?.siteConfig?.language === 'fa';
  const primaryColor = currentTemplate?.colors?.primary || '#00ffcc';

  // Configurable Desktop Layouts (Rows * Columns = Automatic Limit)
  const {
    boardsDesktopRows = 2,
    boardsGridColumns = 3,
  } = data?.siteConfig || {};

  const effectiveLimit = useMemo(() => {
    const rows = Number(boardsDesktopRows) || 2;
    const cols = Number(boardsGridColumns) || 3;
    return rows * cols;
  }, [boardsDesktopRows, boardsGridColumns]);

  const gridClass = useMemo(() => {
    const cols = Number(boardsGridColumns) || 3;
    if (cols === 1) return 'grid grid-cols-1 gap-6 max-w-2xl mx-auto';
    if (cols === 2) return 'grid grid-cols-1 md:grid-cols-2 gap-6';
    if (cols === 4) return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5';
    return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
  }, [boardsGridColumns]);

  // Sort and Filter boards chronologically
  const filteredBoards = useMemo(() => {
    let list = [...(data.boards || [])];

    // Chronological sorting (by createdDate / manufactureYear)
    list.sort((a, b) => {
      if (sortBy === 'date-desc') {
        const dateA = a.createdDate || (a.manufactureYear ? `${a.manufactureYear}-01-01` : '2020-01-01');
        const dateB = b.createdDate || (b.manufactureYear ? `${b.manufactureYear}-01-01` : '2020-01-01');
        return dateB.localeCompare(dateA);
      }
      if (sortBy === 'date-asc') {
        const dateA = a.createdDate || (a.manufactureYear ? `${a.manufactureYear}-01-01` : '2020-01-01');
        const dateB = b.createdDate || (b.manufactureYear ? `${b.manufactureYear}-01-01` : '2020-01-01');
        return dateA.localeCompare(dateB);
      }
      if (sortBy === 'layers-desc') {
        return (b.layers || 0) - (a.layers || 0);
      }
      return 0;
    });

    return list.filter((b) => {
      // Origin filter
      if (originFilter === 'company' && (b.isPersonalProject || b.companyId === 'personal')) return false;
      if (originFilter === 'personal' && !b.isPersonalProject && b.companyId !== 'personal') return false;

      // Category filter
      const matchesCategory =
        selectedCategory === 'all' ||
        b.category === selectedCategory ||
        b.categoryFa === selectedCategory ||
        b.categoryEn === selectedCategory;

      // Search query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (b.titleFa && b.titleFa.toLowerCase().includes(q)) ||
        (b.titleEn && b.titleEn.toLowerCase().includes(q)) ||
        (b.companyFa && b.companyFa.toLowerCase().includes(q)) ||
        (b.companyEn && b.companyEn.toLowerCase().includes(q)) ||
        (b.mcu && b.mcu.toLowerCase().includes(q)) ||
        (b.edaTool && b.edaTool.toLowerCase().includes(q)) ||
        (b.categoryFa && b.categoryFa.toLowerCase().includes(q)) ||
        (b.categoryEn && b.categoryEn.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [data.boards, selectedCategory, originFilter, searchQuery, sortBy]);

  // Sliced Visible Boards according to user limit
  const visibleBoards = useMemo(() => {
    if (isExpanded) return filteredBoards;
    return filteredBoards.slice(0, effectiveLimit);
  }, [filteredBoards, isExpanded, effectiveLimit]);

  // Do not render section if there are no boards
  if (!data.boards || data.boards.length === 0) {
    return null;
  }

  return (
    <section id="boards" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border"
            style={{
              backgroundColor: `${primaryColor}15`,
              borderColor: `${primaryColor}30`,
              color: primaryColor,
            }}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{isFa ? 'پورتفولیو سخت‌افزار و بردهای الکترونیکی' : 'Hardware Engineering Portfolio'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {isFa ? 'بردهای الکترونیکی طراحی و ساخته‌شده' : 'Engineered Circuit Boards'}
          </h2>

          <p className="text-slate-400 text-sm sm:text-base">
            {isFa
              ? 'مجموعه‌ای از بردهای صنعتی چند لایه، سیستم‌های امبدد فرکانس بالا، کنترلرهای توان و پلتفرم‌های اینترنت اشیا تفکیک‌شده بر اساس سوابق شرکتی و پروژه‌های شخصی.'
              : 'Multi-layer high-speed PCBs, industrial IoT gateways, active BMS controllers, and FPGA signal capture platforms separated by company and personal lab.'}
          </p>
        </div>

        {/* Origin Selector Pills (All vs Corporate vs Personal) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
          <button
            type="button"
            onClick={() => setOriginFilter('all')}
            title={isFa ? 'نمایش تمامی پروژه‌ها اعم از صنعتی و آزمایشگاهی' : 'Show all projects (Industrial & Lab)'}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              originFilter === 'all'
                ? 'bg-slate-800 text-white border border-slate-600 shadow-md scale-105'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isFa ? 'تمام پروژه‌ها' : 'All Projects'}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-slate-950/40 text-slate-300">
              {formatNum((data.boards || []).length, isFa)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setOriginFilter('company')}
            title={isFa ? 'فیلتر بردهای صنعتی طراحی‌شده در شرکت‌ها و کارفرمایان' : 'Filter corporate & industrial boards'}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              originFilter === 'company'
                ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/50 shadow-md scale-105'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isFa ? '🏢 پروژه‌های شرکتی و صنعتی' : 'Corporate & Industrial'}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-cyan-950/60 text-cyan-300">
              {formatNum((data.boards || []).filter(b => !b.isPersonalProject && b.companyId !== 'personal').length, isFa)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setOriginFilter('personal')}
            title={isFa ? 'فیلتر بردهای آزمایشگاه شخصی و نوآوری‌های متن‌باز R&D' : 'Filter personal lab & open-source boards'}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              originFilter === 'personal'
                ? 'bg-amber-950/70 text-amber-300 border border-amber-500/50 shadow-md scale-105'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>{isFa ? '🔬 آزمایشگاه شخصی و R&D مستقل' : 'Personal R&D Lab'}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-amber-950/60 text-amber-300">
              {formatNum((data.boards || []).filter(b => b.isPersonalProject || b.companyId === 'personal').length, isFa)}
            </span>
          </button>
        </div>

        {/* Search Bar & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          {/* Search Input & Sort Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isFa ? 'جستجو در نام، شرکت، MCU...' : 'Filter by title, company, MCU...'}
                title={isFa ? 'جستجو در نام برد، شرکت یا میکروکنترلر' : 'Search by title, company, or MCU'}
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 rtl:pr-9 rtl:pl-3"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 rtl:left-auto rtl:right-3 pointer-events-none" />
            </div>

            {/* Chronological Sorting Control */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 py-2 px-2.5 focus:outline-none focus:border-cyan-500"
              title={isFa ? 'مرتب‌سازی زمانی و تعداد لایه بردهای الکترونیکی' : 'Sort engineered boards by date or layer count'}
            >
              <option value="date-desc">{isFa ? 'جدیدترین تاریخ ساخت' : 'Newest First (Date)'}</option>
              <option value="date-asc">{isFa ? 'قدیمی‌ترین تاریخ ساخت' : 'Oldest First (Date)'}</option>
              <option value="layers-desc">{isFa ? 'بیشترین تعداد لایه' : 'Most Layers'}</option>
            </select>
          </div>
        </div>

        {/* Boards Grid */}
        <div className={gridClass}>
          {visibleBoards.map((board) => {
            const yearStr = board.manufactureYear || (board.createdDate ? board.createdDate.split('-')[0] : '2024');
            const isPersonal = board.isPersonalProject || board.companyId === 'personal';

            return (
              <div
                key={board.id}
                onClick={() => setSelectedBoard(board)}
                className="group relative rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col justify-between hover:shadow-2xl cursor-pointer"
              >
                <div>
                  {/* Image Container with Layers Badge & Date Badge */}
                  <div
                    onContextMenu={(e) => e.preventDefault()}
                    className="relative aspect-[16/10] overflow-hidden bg-slate-950 select-none"
                  >
                    <img
                      src={board.image}
                      alt={isFa ? board.titleFa : board.titleEn}
                      draggable="false"
                      onContextMenu={(e) => e.preventDefault()}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108 pointer-events-none select-none"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

                    {/* Top Right: Layer Count Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-700 text-cyan-300 text-[11px] font-mono font-bold shadow-md select-none">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isFa ? toPersianDigits(board.layers) : toEnglishDigits(board.layers)} {isFa ? 'لایه' : 'Layers'}</span>
                    </div>

                    {/* Top Left: Date / Year Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-300 text-[10px] font-mono select-none">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formatNum(yearStr, isFa)}</span>
                    </div>

                    {/* Bottom Floating Bar */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-mono text-cyan-300 bg-slate-950/90 backdrop-blur-md px-2 py-0.5 rounded border border-slate-800 truncate max-w-[70%]">
                        {board.mcu}
                      </span>

                      <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                        {isFa ? (board.status || 'تولید انبوه') : (board.statusEn || board.status || 'Production')}
                      </span>
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="p-5 space-y-3">
                    {/* Origin / Company Association Row */}
                    <div className="flex items-center justify-between gap-2">
                      {isPersonal ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-semibold">
                          <User className="w-3 h-3" />
                          <span>{isFa ? 'پروژه شخصی / R&D آزاد' : 'Personal R&D Lab'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold truncate max-w-[200px]">
                          <Building2 className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="truncate">{isFa ? (board.companyFa || 'تولید شرکتی') : (board.companyEn || 'Corporate R&D')}</span>
                        </span>
                      )}

                      <span className="text-[11px] font-mono text-slate-500 shrink-0">
                        {board.edaTool}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                      {isFa ? board.titleFa : board.titleEn}
                    </h3>

                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                      {isFa ? board.shortDescFa : board.shortDescEn}
                    </p>

                    {/* Interface Badges */}
                    {board.interfaces && board.interfaces.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {board.interfaces.slice(0, 3).map((iface, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                          >
                            {iface}
                          </span>
                        ))}
                        {board.interfaces.length > 3 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            +{formatNum(board.interfaces.length - 3, isFa)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions (Dimensions & View Action) */}
                <div className="px-5 py-3.5 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                    <Box className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-mono text-slate-300">
                      {board.dimensions ? formatNum(board.dimensions, isFa) : (isFa ? 'استاندارد' : 'Standard')}
                    </span>
                  </span>

                  <span className="flex items-center gap-1 font-semibold text-cyan-400 group-hover:underline text-xs">
                    <span>{isFa ? 'مشاهده جزئیات کامل' : 'View Full Details'}</span>
                    <Maximize2 className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Expandable "Show More / کمتر / بیشتر" Trigger */}
        {filteredBoards.length > effectiveLimit && (
          <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={
                isExpanded
                  ? (isFa ? 'بستن و بازگشت به نمایش پیش‌فرض' : 'Collapse to default view')
                  : (isFa
                      ? `مشاهده ${formatNum(filteredBoards.length - effectiveLimit, true)} برد دیگر در گالری`
                      : `Show ${filteredBoards.length - effectiveLimit} more boards`)
              }
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 shadow-xl border bg-slate-900/90 hover:bg-slate-850 text-cyan-300 border-cyan-500/40 hover:border-cyan-400 hover:scale-105 active:scale-95 group cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span>
                {isExpanded
                  ? (isFa
                      ? `بستن و نمایش پیش‌فرض (${formatNum(effectiveLimit, true)} عدد)`
                      : `Show Less (${effectiveLimit} items)`)
                  : (isFa
                      ? `مشاهده سایر پروژه‌ها و بردهای الکترونیکی (${formatNum(filteredBoards.length - effectiveLimit, true)} پروژه دیگر)`
                      : `View More Engineered Boards (+${filteredBoards.length - effectiveLimit} more)`)}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-cyan-400 transition-transform" />
              ) : (
                <ChevronDown className="w-4 h-4 text-cyan-400 transition-transform" />
              )}
            </button>
          </div>
        )}

        {/* Empty Search Result Fallback */}
        {filteredBoards.length === 0 && (
          <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-slate-800/80 p-8">
            <Cpu className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-bold text-sm">
              {isFa ? 'هیچ بردی با این فیلتر یا عبارت یافت نشد.' : 'No engineered boards match your filter query.'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setOriginFilter('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors"
            >
              {isFa ? 'مشاهده همه بردهای الکترونیکی' : 'Show All Engineered Boards'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
