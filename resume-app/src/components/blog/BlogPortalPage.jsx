/**
 * ============================================================================
 * STANDALONE ENGINEERING TECH BLOG PORTAL
 * ============================================================================
 * 
 * A complete, dedicated standalone blog web application that renders independently
 * from the single-page portfolio layout, sharing the exact same live theme,
 * central state, and branding.
 *
 * Supports:
 * - Dedicated Blog Header with Home/Portfolio Return link
 * - Spotlight Blog Search & Category Navigation
 * - Featured Post Showcase Banner
 * - Full Responsive Grid of Blog Posts
 * - In-Depth Single Post Reader with rich HTML, Tables, Images & Code Blocks
 * - Interactive Like Counter with Canvas Confetti
 * - Direct URL Hash Deep-linking (#blog, #blog/slug)
 * - Dedicated Blog Footer
 *
 * @module BlogPortalPage
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { CustomAudioPlayer } from '../common/CustomAudioPlayer';
import { formatNum } from '../../utils/numberHelper';
import { sanitizeRichHtml, copyTextToClipboard } from '../../utils/security';
import {
  Newspaper,
  ArrowRight,
  ArrowLeft,
  Search,
  Calendar,
  Clock,
  Eye,
  Heart,
  Share2,
  Tag,
  BookOpen,
  ShieldCheck,
  Globe,
  Home,
  Check,
  Sparkles,
  Headphones
} from 'lucide-react';

export const BlogPortalPage = () => {
  const {
    data,
    currentTemplate,
    toggleLikeBlogPost,
    navigateToPortfolio,
    navigateToBlog,
    selectedBlogPost,
    setSelectedBlogPost,
    toggleLanguage,
    setIsAdminOpen,
    setIsLoginModalOpen,
    isAuthenticated,
    showToast,
  } = useData();

  const isFa = data?.siteConfig?.language === 'fa';
  const primaryColor = currentTemplate?.colors?.primary || '#00ffcc';
  const blogPosts = data?.blogPosts || [];
  const info = data?.personalInfo || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedLink, setCopiedLink] = useState(false);

  // Initialize likedPosts from localStorage
  const [likedPosts, setLikedPosts] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('liked_blog_posts') || '[]');
      if (Array.isArray(stored)) {
        return stored.reduce((acc, id) => {
          acc[id] = true;
          return acc;
        }, {});
      }
    } catch (e) {}
    return {};
  });

  // Scroll to top on page load or post change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedBlogPost]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set();
    blogPosts.forEach((p) => {
      const cat = isFa ? (p.categoryFa || p.category) : (p.categoryEn || p.category);
      if (cat) cats.add(cat);
    });
    return ['all', ...Array.from(cats)];
  }, [blogPosts, isFa]);

  // Filter blog posts
  const filteredPosts = useMemo(() => {
    return (blogPosts || []).filter((post) => {
      if (!post) return false;
      if (post.status && post.status !== 'published') return false;

      const postCat = isFa ? (post.categoryFa || post.category) : (post.categoryEn || post.category);
      const matchesCat = selectedCategory === 'all' || postCat === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (post.titleFa && post.titleFa.toLowerCase().includes(q)) ||
        (post.titleEn && post.titleEn.toLowerCase().includes(q)) ||
        (post.summaryFa && post.summaryFa.toLowerCase().includes(q)) ||
        (post.summaryEn && post.summaryEn.toLowerCase().includes(q)) ||
        (post.tags && post.tags.some((t) => t && t.toLowerCase().includes(q)));

      return matchesCat && matchesSearch;
    });
  }, [blogPosts, selectedCategory, searchQuery, isFa]);

  // Featured post (Top post)
  const featuredPost = filteredPosts[0] || blogPosts[0];

  // Handle Like Post with Confetti & Toggle
  const handleLike = async (post, e) => {
    e?.stopPropagation();
    if (!post) return;

    const isCurrentlyLiked = !!likedPosts[post.id];
    toggleLikeBlogPost(post.id);

    setLikedPosts((prev) => {
      const updated = { ...prev };
      if (isCurrentlyLiked) {
        delete updated[post.id];
      } else {
        updated[post.id] = true;
      }
      return updated;
    });

    if (!isCurrentlyLiked) {
      try {
        const confettiModule = await import('canvas-confetti');
        const confetti = confettiModule.default || confettiModule;
        confetti({
          particleCount: 45,
          spread: 70,
          origin: { y: 0.75 },
        });
      } catch (err) {}
      showToast(isFa ? 'از پسند شما سپاسگزاریم! ❤️' : 'Thanks for liking this article! ❤️');
    } else {
      showToast(isFa ? 'پسند شما برداشته شد.' : 'Like removed.');
    }
  };

  // Handle Share Link
  const handleShare = async (post, e) => {
    e?.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#blog/${post.slug || post.id}`;
    const ok = await copyTextToClipboard(url);
    if (ok) {
      setCopiedLink(true);
      showToast(isFa ? 'لینک مستقیم مقاله در کلیپ‌بورد کپی شد.' : 'Article direct URL copied to clipboard.');
      setTimeout(() => setCopiedLink(false), 2500);
    } else {
      showToast(isFa ? 'کپی نشد؛ لینک را دستی کپی کنید.' : 'Copy failed; please copy manually.', 'error');
    }
  };

  // Handle Admin Button Click
  const handleAdminClick = () => {
    if (isAuthenticated) {
      setIsAdminOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950">
      {/* =================================================================== */}
      {/* DEDICATED BLOG NAVIGATION HEADER                                   */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-2xl border-b border-slate-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Logo & Blog Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedBlogPost(null);
                navigateToBlog();
              }}
              className="flex items-center gap-3 group text-right"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-slate-950 shadow-lg group-hover:scale-105 transition-transform"
                style={{ backgroundColor: primaryColor }}
              >
                <Newspaper className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm sm:text-base font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors block">
                  {isFa ? 'وبلاگ تخصصی مهندسی سخت‌افزار' : 'Hardware Engineering Blog'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:block">
                  {isFa ? 'یادداشت‌های فنی، طراحی PCB و امبدد' : 'Tech Insights, PCB Layout & RTOS'}
                </span>
              </div>
            </button>
          </div>

          {/* Quick Category Navigation Pills (Desktop) */}
          <nav className="hidden xl:flex items-center gap-1.5 rounded-full px-3 py-1 bg-slate-900/60 border border-slate-800">
            {categories.slice(0, 4).map((cat) => {
              const isSelected = selectedCategory === cat && !selectedBlogPost;
              const label = cat === 'all' ? (isFa ? 'همه مقالات' : 'All') : cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedBlogPost(null);
                    setSelectedCategory(cat);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Navigation Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Return to Portfolio / Main Resume Button */}
            <button
              onClick={() => navigateToPortfolio('hero')}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-slate-850 to-slate-800 hover:from-slate-800 hover:to-slate-750 border border-slate-700 shadow-md transition-all hover:scale-105 active:scale-95 group"
              title={isFa ? 'بازگشت به سایت اصلی رزومه و پورتفولیو' : 'Return to Portfolio & Resume'}
            >
              <Home className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">
                {isFa ? 'بازگشت به پورتفولیو و رزومه' : 'Back to Main Portfolio'}
              </span>
              <span className="sm:hidden">{isFa ? 'پورتفولیو' : 'Portfolio'}</span>
            </button>

            {/* Admin Panel Button */}
            <button
              onClick={handleAdminClick}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center gap-1.5"
              title={isFa ? 'ورود به پنل مدیریت وبلاگ' : 'Admin Management'}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">{isFa ? 'مدیریت وبلاگ' : 'Admin'}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition-colors text-xs font-mono font-bold"
              title={isFa ? 'تغییر زبان سایت (فارسی / English)' : 'Switch Language (FA / EN)'}
            >
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span>{isFa ? 'EN' : 'فا'}</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* =================================================================== */}
      {/* MAIN BODY: (CATALOG VIEW OR SINGLE ARTICLE READER)                 */}
      {/* =================================================================== */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {!selectedBlogPost ? (
          /* =============================================================== */
          /* VIEW 1: FULL STANDALONE BLOG CATALOG                            */
          /* =============================================================== */
          <div className="space-y-12">
            {/* 1. Blog Hero Intro Banner */}
            <div className="relative rounded-3xl p-6 sm:p-12 overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 shadow-2xl">
              {/* Background Glow */}
              <div
                className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: primaryColor }}
              />

              <div className="relative z-10 max-w-3xl space-y-4 text-center sm:text-right rtl:sm:text-right ltr:sm:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isFa ? 'پورتال تخصصی دانش سخت‌افزار و الکترونیک' : 'Hardware Engineering Knowledge Hub'}</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  {isFa ? 'وبلاگ و یادداشت‌های تخصصی مهندسی' : 'Engineering Insights & Tech Notes'}
                </h1>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {isFa
                    ? 'مرجع مقالات و تجربیات عملی طراحی بردهای مدار چاپی پرسرعت (High-Speed PCB)، کنترل امپدانس، توسعه فریم‌ور بلادرنگ RTOS، فیلدباس‌های صنعتی و استانداردهای EMC.'
                    : 'Practical tutorials, layout guidelines, high-speed PCB stackups, RTOS firmware development, and industrial EMC compliance strategies.'}
                </p>

                {/* Search Bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative w-full sm:max-w-md">
                    <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 rtl:right-3.5 rtl:left-auto ltr:left-3.5 ltr:right-auto" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={isFa ? 'جستجوی هوشمند در مقالات، تگ‌ها و مباحث...' : 'Search posts, topics, keywords...'}
                      className="w-full px-10 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-inner"
                    />
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    {isFa ? `${formatNum(filteredPosts.length, true)} یادداشت تخصصی منتشر شده` : `${filteredPosts.length} Published Articles`}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Featured Article Hero Card (If no active search) */}
            {featuredPost && !searchQuery && selectedCategory === 'all' && (
              <div
                onClick={() => {
                  setSelectedBlogPost(featuredPost);
                  navigateToBlog(featuredPost.slug || featuredPost.id);
                }}
                className="group relative rounded-3xl overflow-hidden bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 cursor-pointer shadow-2xl"
              >
                {/* Featured Image */}
                <div className="lg:col-span-7 relative min-h-[280px] sm:min-h-[360px] overflow-hidden bg-slate-950">
                  <img
                    src={featuredPost.coverImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'}
                    alt={isFa ? featuredPost.titleFa : featuredPost.titleEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 select-none pointer-events-none"
                    draggable="false"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent lg:hidden" />
                  <div className="absolute top-4 right-4 rtl:right-4 rtl:left-auto ltr:left-4 ltr:right-auto px-3 py-1 rounded-full bg-cyan-500 text-slate-950 font-black text-xs shadow-lg">
                    ⭐ {isFa ? 'مقاله شاخص' : 'Featured Post'}
                  </div>
                </div>

                {/* Featured Text Details */}
                <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                        {isFa ? (featuredPost.categoryFa || featuredPost.category) : (featuredPost.categoryEn || featuredPost.category)}
                      </span>
                      <span className="text-slate-400 font-mono">• {isFa ? (featuredPost.readTime || '۸ دقیقه') : (featuredPost.readTimeEn || '8 min')}</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-cyan-300 transition-colors leading-snug">
                      {isFa ? featuredPost.titleFa : featuredPost.titleEn}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-4">
                      {isFa ? featuredPost.summaryFa : featuredPost.summaryEn}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{featuredPost.publishDate}</span>
                    </div>

                    <span className="flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:underline">
                      <span>{isFa ? 'مطالعه کامل یادداشت' : 'Read Full Post'}</span>
                      {isFa ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Category Filter Tabs */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4 overflow-x-auto">
              <div className="flex items-center gap-2">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const label = cat === 'all' ? (isFa ? 'همه دسته‌بندی‌ها' : 'All Topics') : cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="text-xs text-slate-400 font-mono shrink-0 hidden sm:block">
                <span>{isFa ? 'تعداد مقالات:' : 'Articles:'} </span>
                <strong className="text-cyan-400">{formatNum(filteredPosts.length, isFa)}</strong>
              </div>
            </div>

            {/* 4. Posts Grid */}
            {filteredPosts.length === 0 ? (
              <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-300">
                  {isFa ? 'مقاله‌ای مطابق با جستجوی شما یافت نشد' : 'No articles match your criteria'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isFa ? 'لطفاً عبارت دیگری را جستجو کنید یا دسته‌بندی را تغییر دهید.' : 'Try different keywords or reset category filters.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredPosts.map((post) => {
                  const title = isFa ? post.titleFa : (post.titleEn || post.titleFa);
                  const summary = isFa ? post.summaryFa : (post.summaryEn || post.summaryFa);
                  const category = isFa ? (post.categoryFa || post.category) : (post.categoryEn || post.category);
                  const readTime = isFa ? (post.readTime || '۷ دقیقه') : (post.readTimeEn || `${post.readTime || 7} min read`);
                  const isLiked = !!likedPosts[post.id];

                  return (
                    <article
                      key={post.id}
                      onClick={() => {
                        setSelectedBlogPost(post);
                        navigateToBlog(post.slug || post.id);
                      }}
                      className="group rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 flex flex-col overflow-hidden shadow-xl hover:-translate-y-1.5 cursor-pointer"
                    >
                      {/* Cover Photo */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                        <img
                          src={post.coverImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'}
                          alt={title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108 pointer-events-none select-none"
                          draggable="false"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />

                        {/* Category Pill */}
                        <div className="absolute top-3 right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto px-3 py-1 rounded-full bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-[11px] font-bold">
                          {category}
                        </div>

                        {/* Read Time */}
                        <div className="absolute bottom-3 left-3 rtl:left-3 rtl:right-auto ltr:right-3 ltr:left-auto flex items-center gap-1 text-[11px] text-slate-300 bg-slate-950/80 px-2.5 py-0.5 rounded-lg font-mono">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span>{readTime}</span>
                        </div>
                      </div>

                      {/* Card Content Body */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{post.publishDate}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>{formatNum(post.views || 180, isFa)}</span>
                            </span>
                          </div>

                          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                            {title}
                          </h3>

                          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                            {summary}
                          </p>
                        </div>

                        {/* Card Footer */}
                        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {(post.tags || []).slice(0, 2).map((t, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => handleLike(post, e)}
                              className={`p-1.5 rounded-xl border transition-all ${
                                isLiked
                                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                  : 'bg-slate-950 text-slate-400 hover:text-rose-400 border-slate-800'
                              }`}
                              title={isFa ? 'پسندیدن مقاله' : 'Like post'}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400' : ''}`} />
                            </button>

                            <span className="flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:underline">
                              <span>{isFa ? 'مطالعه' : 'Read'}</span>
                              {isFa ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* =============================================================== */
          /* VIEW 2: FULL STANDALONE ARTICLE READING PAGE                    */
          /* =============================================================== */
          <article className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            {/* Breadcrumbs Navigation Bar */}
            <div className="flex items-center justify-between gap-3 text-xs border-b border-slate-850 pb-4">
              <div className="flex items-center gap-2 text-slate-400 truncate">
                <button
                  onClick={() => navigateToPortfolio('hero')}
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <Home className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isFa ? 'پورتفولیو' : 'Portfolio'}</span>
                </button>
                <span>/</span>
                <button
                  onClick={() => {
                    setSelectedBlogPost(null);
                    navigateToBlog();
                  }}
                  className="hover:text-white transition-colors"
                >
                  {isFa ? 'وبلاگ' : 'Blog'}
                </button>
                <span>/</span>
                <span className="text-cyan-400 truncate font-semibold">
                  {isFa ? (selectedBlogPost.categoryFa || selectedBlogPost.category) : (selectedBlogPost.categoryEn || selectedBlogPost.category)}
                </span>
              </div>

              <button
                onClick={() => {
                  setSelectedBlogPost(null);
                  navigateToBlog();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors shrink-0"
              >
                {isFa ? <ArrowRight className="w-3.5 h-3.5 text-cyan-400" /> : <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{isFa ? 'بازگشت به فهرست مقالات وبلاگ' : 'Back to Blog List'}</span>
              </button>
            </div>

            {/* Article Header */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                  {isFa ? (selectedBlogPost.categoryFa || selectedBlogPost.category) : (selectedBlogPost.categoryEn || selectedBlogPost.category)}
                </span>
                <span className="text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isFa ? (selectedBlogPost.readTime || '۸ دقیقه مطالعه') : (selectedBlogPost.readTimeEn || '8 min read')}</span>
                </span>
                <span className="text-slate-400 flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{selectedBlogPost.publishDate}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                {isFa ? selectedBlogPost.titleFa : (selectedBlogPost.titleEn || selectedBlogPost.titleFa)}
              </h1>

              {/* Author & Interactions Bar */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-slate-950 text-base shadow-md"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {data?.personalInfo?.fullNameFa?.charAt(0) || 'آ'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {isFa ? (data?.personalInfo?.fullNameFa || 'مهندس آرش طاهری') : (data?.personalInfo?.fullNameEn || 'Arash Taheri')}
                    </div>
                    <div className="text-xs text-slate-400">
                      {isFa ? 'طراح ارشد بردهای سخت‌افزاری و سیستم‌های نهفته' : 'Lead Hardware & Embedded Systems Engineer'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleLike(selectedBlogPost, e)}
                    title={likedPosts[selectedBlogPost.id] ? (isFa ? 'برداشتن لایک' : 'Unlike post') : (isFa ? 'پسندیدن این مقاله' : 'Like this post')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all shadow-sm"
                  >
                    <Heart className={`w-4 h-4 ${likedPosts[selectedBlogPost.id] ? 'fill-rose-400 text-rose-400' : ''}`} />
                    <span>{formatNum(selectedBlogPost.likes || 48, isFa)} {isFa ? 'پسند' : 'Likes'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleShare(selectedBlogPost, e)}
                    title={isFa ? 'کپی لینک مستقیم مقاله برای اشتراک‌گذاری' : 'Copy direct link to clipboard'}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-all"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-cyan-400" />}
                    <span>{copiedLink ? (isFa ? 'کپی شد!' : 'Copied!') : (isFa ? 'اشتراک لینک' : 'Share')}</span>
                  </button>
                </div>
              </div>

              {/* Optional Embedded Audio Player / Podcast (Gracefully hidden if no audioUrl) */}
              {selectedBlogPost.audioUrl && (
                <div className="pt-2">
                  <CustomAudioPlayer
                    audioUrl={selectedBlogPost.audioUrl}
                    titleFa={selectedBlogPost.audioTitleFa || selectedBlogPost.titleFa}
                    titleEn={selectedBlogPost.audioTitleEn || selectedBlogPost.titleEn}
                    durationStr={selectedBlogPost.audioDuration || '10:00'}
                    isFa={isFa}
                    primaryColor={primaryColor}
                    variant="standard"
                    subtitleFa="پادکست و روایت صوتی مقاله مهندسی"
                    subtitleEn="Engineering Audio Podcast"
                  />
                </div>
              )}

              {/* High-Resolution Article Banner Cover Image */}
              {selectedBlogPost.coverImage && (
                <div className="rounded-3xl overflow-hidden aspect-[21/9] border border-slate-800 bg-slate-950 shadow-2xl">
                  <img
                    src={selectedBlogPost.coverImage}
                    alt={isFa ? selectedBlogPost.titleFa : selectedBlogPost.titleEn}
                    className="w-full h-full object-cover select-none pointer-events-none"
                    draggable="false"
                  />
                </div>
              )}
            </div>

            {/* Rich HTML Content Body (With styled Tables, Images, Codes & Callouts) */}
            <div className="bg-slate-900/40 rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl">
              <div
                className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{
                  // SECURITY: blog HTML is ALWAYS purified (stored-XSS defense)
                  __html: sanitizeRichHtml(
                    isFa
                      ? (selectedBlogPost.contentFa || selectedBlogPost.contentMarkdownFa || '<p>محتوای این مقاله در حال بارگذاری است...</p>')
                      : (selectedBlogPost.contentEn || selectedBlogPost.contentMarkdownEn || selectedBlogPost.contentFa || selectedBlogPost.contentFa || '<p>Content in preparation...</p>')
                  )
                }}
              />

              {/* Tags Cloud */}
              <div className="pt-8 mt-8 border-t border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isFa ? 'برچسب‌ها و تگ‌های تخصصی:' : 'Tags & Topics:'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(selectedBlogPost.tags || []).map((t, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-slate-950 text-cyan-300 border border-slate-800 text-xs font-mono"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
              <button
                onClick={() => {
                  setSelectedBlogPost(null);
                  navigateToBlog();
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-lg"
              >
                {isFa ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span>{isFa ? 'مشاهده سایر مقالات و یادداشت‌ها' : 'Explore More Blog Posts'}</span>
              </button>

              <button
                onClick={() => navigateToPortfolio('hero')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <Home className="w-4 h-4 text-cyan-400" />
                <span>{isFa ? 'بازگشت به سایت اصلی پورتفولیو و رزومه' : 'Return to Portfolio Website'}</span>
              </button>
            </div>
          </article>
        )}
      </main>

      {/* =================================================================== */}
      {/* DEDICATED BLOG FOOTER                                              */}
      {/* =================================================================== */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-xs text-slate-400 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-900">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-slate-950"
                style={{ backgroundColor: primaryColor }}
              >
                <Newspaper className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block">
                  {isFa ? 'پورتال وبلاگ تخصصی مهندسی سخت‌افزار' : 'Hardware Engineering Tech Blog'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {isFa ? 'انتشار مقالات و تحلیل‌های مهندسی الکترونیک' : 'Articles & In-depth Technical Analyses'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateToPortfolio('hero')}
                className="text-cyan-400 hover:underline font-bold flex items-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>{isFa ? 'صفحه اصلی رزومه و پورتفولیو' : 'Main Portfolio'}</span>
              </button>
              <span>•</span>
              <button
                onClick={() => navigateToPortfolio('contact')}
                className="hover:text-white transition-colors"
              >
                {isFa ? 'تماس با نویسنده' : 'Contact Author'}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © {new Date().getFullYear()} {isFa ? info.fullNameFa : info.fullNameEn} — {isFa ? 'تمامی حقوق برای وبلاگ مهندسی محفوظ است.' : 'All rights reserved.'}
            </div>
            <div className="flex items-center gap-3">
              <span>{isFa ? 'طراحی بهینه‌شده با React 19 و Vite' : 'Powered by React 19 & Vite'}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
