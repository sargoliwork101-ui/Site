import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { formatNum, toEnglishDigits } from '../../utils/numberHelper';
import {
  BookOpen,
  Clock,
  Calendar,
  ArrowRight,
  ArrowLeft,
  FileText,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  LayoutGrid
} from 'lucide-react';

export const ArticlesSection = () => {
  const { data, currentTemplate, setSelectedArticle } = useData();
  const [selectedTag, setSelectedTag] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const isFa = data?.siteConfig?.language === 'fa';
  const primaryColor = currentTemplate?.colors?.primary || '#00ffcc';

  // Configurable Desktop Layouts (Rows * Columns = Automatic Limit)
  const {
    articlesDesktopRows = 2,
    articlesGridColumns = 3,
  } = data?.siteConfig || {};

  const effectiveLimit = useMemo(() => {
    const rows = Number(articlesDesktopRows) || 2;
    const cols = Number(articlesGridColumns) || 3;
    return rows * cols;
  }, [articlesDesktopRows, articlesGridColumns]);

  const gridClass = useMemo(() => {
    const cols = Number(articlesGridColumns) || 3;
    if (cols === 1) return 'grid grid-cols-1 gap-6 max-w-2xl mx-auto';
    if (cols === 2) return 'grid grid-cols-1 md:grid-cols-2 gap-6';
    if (cols === 4) return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5';
    return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
  }, [articlesGridColumns]);

  // Do not render section if there are no articles
  if (!data?.articles || data.articles.length === 0) {
    return null;
  }

  const allTags = ['all', ...new Set(data.articles.flatMap((a) => a.tags || []))];

  const filteredArticles = data.articles.filter((art) => {
    const matchesTag = selectedTag === 'all' || (art.tags && art.tags.includes(selectedTag));
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (art.titleFa && art.titleFa.toLowerCase().includes(q)) ||
      (art.titleEn && art.titleEn.toLowerCase().includes(q)) ||
      (art.summaryFa && art.summaryFa.toLowerCase().includes(q)) ||
      (art.summaryEn && art.summaryEn.toLowerCase().includes(q)) ||
      (art.categoryFa && art.categoryFa.toLowerCase().includes(q)) ||
      (art.categoryEn && art.categoryEn.toLowerCase().includes(q));

    return matchesTag && matchesSearch;
  });

  const visibleArticles = isExpanded ? filteredArticles : filteredArticles.slice(0, effectiveLimit);

  return (
    <section id="articles" className="py-20 relative bg-slate-950/40 border-y border-slate-900">
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
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isFa ? 'مقالات و انتشارات تخصصی سخت‌افزار' : 'Hardware Research & Publications'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {isFa ? 'مقالات فنی، پژوهش‌ها و راهنماهای طراحی' : 'Technical Papers & Architecture Guides'}
          </h2>

          <p className="text-slate-400 text-sm sm:text-base">
            {isFa
              ? 'مقالات تحلیلی در زمینه طراحی مدارات فرکانس بالا، تطبیق امپدانس، پیاده‌سازی پروتکل‌های صنعتی و معماری سیستم‌های کم‌مصرف نهفته با امکان دانلود اسناد کامل.'
              : 'In-depth research on high-speed signal integrity, industrial bus systems, and embedded RTOS architectures with downloadable documents.'}
          </p>
        </div>

        {/* Filter Tags & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {allTags.slice(0, 8).map((tag) => {
              const active = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  title={isFa ? `فیلتر مقالات بر اساس برچسب: ${tag === 'all' ? 'همه مقالات' : tag}` : `Filter by tag: ${tag}`}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'text-slate-950 shadow-lg scale-105'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                  style={{
                    backgroundColor: active ? primaryColor : undefined,
                  }}
                >
                  {tag === 'all' ? (isFa ? 'همه مقالات' : 'All Papers') : tag}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isFa ? 'جستجو در مقالات...' : 'Search articles & topics...'}
              title={isFa ? 'جستجو در عنوان، موضوع و چکیده مقالات تخصصی' : 'Search in publications and technical guides'}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 rtl:pr-9 rtl:pl-3"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 rtl:left-auto rtl:right-3 pointer-events-none" />
          </div>
        </div>

        {/* Articles Grid */}
        <div className={gridClass}>
          {visibleArticles.map((article) => (
            <article
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              title={isFa ? 'کلیک جهت مطالعه کامل مقاله و دسترسی به فایل‌های پیوست' : 'Click to read full article & view attachments'}
              className="group rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col justify-between hover:shadow-2xl cursor-pointer"
            >
              <div>
                {/* Article Image Banner */}
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-950">
                  <img
                    src={article.coverImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'}
                    alt={isFa ? article.titleFa : article.titleEn}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Category Badge Top-Right */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-700 text-cyan-300 text-[11px] font-bold">
                    {isFa ? (article.categoryFa || article.category) : (article.categoryEn || article.category)}
                  </div>

                  {/* Read Time Top-Left */}
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-300 text-[10px] font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{isFa ? formatNum(article.readTime, true) : (article.readTimeEn || toEnglishDigits(article.readTime || '12 min'))}</span>
                  </div>
                </div>

                {/* Content Box */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isFa ? formatNum(article.date, true) : toEnglishDigits(article.date)}</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {isFa ? article.titleFa : article.titleEn}
                  </h3>

                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                    {isFa ? article.summaryFa : (article.summaryEn || article.summaryFa)}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {article.tags?.slice(0, 3).map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Direct Download & Read Actions */}
              <div className="px-5 py-3.5 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs">
                {article.pdfUrl ? (
                  <a
                    href={article.pdfUrl}
                    download={article.pdfFileName || 'article.pdf'}
                    onClick={(e) => e.stopPropagation()}
                    title={isFa ? 'دانلود سند پیوست مقاله' : 'Download Paper Document'}
                    className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isFa ? 'دانلود سند' : 'Download File'}</span>
                  </a>
                ) : (
                  <span className="text-slate-500 text-[11px] flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>{isFa ? 'مقاله متنی' : 'Full Text Article'}</span>
                  </span>
                )}

                <span className="flex items-center gap-1 font-semibold text-cyan-400 group-hover:underline">
                  <span>{isFa ? 'مطالعه کامل' : 'Read Article'}</span>
                  {isFa ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Expandable "Show More / کمتر / بیشتر" Trigger for Articles */}
        {filteredArticles.length > effectiveLimit && (
          <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={
                isExpanded
                  ? (isFa ? 'بستن و بازگشت به نمایش پیش‌فرض' : 'Collapse to default view')
                  : (isFa
                      ? `مشاهده ${formatNum(filteredArticles.length - effectiveLimit, true)} مقاله دیگر`
                      : `Show ${filteredArticles.length - effectiveLimit} more papers`)
              }
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 shadow-xl border bg-slate-900/90 hover:bg-slate-850 text-cyan-300 border-cyan-500/40 hover:border-cyan-400 hover:scale-105 active:scale-95 group cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span>
                {isExpanded
                  ? (isFa
                      ? `بستن و نمایش پیش‌فرض (${formatNum(effectiveLimit, true)} مقاله)`
                      : `Show Less (${effectiveLimit} articles)`)
                  : (isFa
                      ? `مشاهده سایر مقالات و انتشارات تخصصی (${formatNum(filteredArticles.length - effectiveLimit, true)} مقاله دیگر)`
                      : `View More Publications (+${filteredArticles.length - effectiveLimit} more)`)}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-cyan-400 transition-transform" />
              ) : (
                <ChevronDown className="w-4 h-4 text-cyan-400 transition-transform" />
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
