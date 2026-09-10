/**
 * ============================================================================
 * BLOG & ENGINEERING INSIGHTS PORTAL MODAL
 * ============================================================================
 * 
 * Features:
 * 1. Accessible directly from Navbar Header (without cluttering the single-page home)
 * 2. Search & Category Filter for Technical Publications & Engineering Guides
 * 3. Word-Style Rich HTML Content Reader with Code Blocks & Tables
 * 4. Interactive Like Counter with Confetti & Direct Share
 * 5. Full Bilingual (Persian / English) Support & ATS Formatting
 *
 * @module BlogModal
 */

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { formatNum } from '../../utils/numberHelper';
import { sanitizeRichHtml, copyTextToClipboard } from '../../utils/security';
import {
  X,
  Search,
  BookOpen,
  Clock,
  Calendar,
  Eye,
  Heart,
  Share2,
  ArrowRight,
  ArrowLeft,
  Tag,
  Check,
  Newspaper
} from 'lucide-react';

export const BlogModal = () => {
  const {
    isBlogModalOpen,
    setIsBlogModalOpen,
    selectedBlogPost,
    setSelectedBlogPost,
    toggleLikeBlogPost,
    data,
    currentTemplate,
    showToast
  } = useData();

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

  const isFa = data?.siteConfig?.language === 'fa';
  const primaryColor = currentTemplate?.colors?.primary || '#00ffcc';
  const blogPosts = data?.blogPosts || [];

  // Extract unique categories from posts
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

  if (!isBlogModalOpen) return null;

  // Handle Like Post
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
          particleCount: 30,
          spread: 60,
          origin: { y: 0.8 },
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
    const ok = await copyTextToClipboard(window.location.href);
    if (ok) {
      setCopiedLink(true);
      showToast(isFa ? 'لینک مقاله در کلیپ‌بورد کپی شد.' : 'Article link copied to clipboard.');
      setTimeout(() => setCopiedLink(false), 2500);
    } else {
      showToast(isFa ? 'کپی نشد؛ لینک را دستی کپی کنید.' : 'Copy failed; please copy manually.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn">
      <div
        className="relative w-full max-w-6xl h-[94vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-slate-950 shadow-md"
              style={{ backgroundColor: primaryColor }}
            >
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  {isFa ? 'وبلاگ و یادداشت‌های تخصصی مهندسی' : 'Engineering Blog & Technical Insights'}
                </h3>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold">
                  {formatNum(blogPosts.length, isFa)} {isFa ? 'یادداشت' : 'Posts'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isFa
                  ? 'مقالات، تحلیل‌های سخت‌افزاری، استانداردهای EMC و تجارب طراحی سیستم‌های نهفته'
                  : 'Practical guides on high-speed PCB, RTOS firmware, EMC standards & industrial IoT'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedBlogPost && (
              <button
                onClick={() => setSelectedBlogPost(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                {isFa ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                <span>{isFa ? 'بازگشت به لیست مقالات' : 'Back to Blog List'}</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsBlogModalOpen(false);
                setSelectedBlogPost(null);
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* VIEW 1: BLOG POSTS LIST / CATALOG                                 */}
        {/* ================================================================= */}
        {!selectedBlogPost ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search and Category Filter Bar */}
            <div className="p-4 sm:p-6 bg-slate-950/60 border-b border-slate-800 space-y-4 shrink-0">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative w-full sm:max-w-md">
                  <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 rtl:right-3.5 rtl:left-auto ltr:left-3.5 ltr:right-auto" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isFa ? 'جستجو در عنوان، متن و تگ‌های مقالات...' : 'Search articles, keywords, tags...'}
                    className="w-full px-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Counter */}
                <div className="text-xs text-slate-400 font-mono">
                  <span>{isFa ? 'تعداد یافته‌ها:' : 'Showing:'} </span>
                  <strong className="text-cyan-400">{formatNum(filteredPosts.length, isFa)}</strong>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const label = cat === 'all' ? (isFa ? 'همه دسته‌بندی‌ها' : 'All Topics') : cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Posts Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {filteredPosts.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-2 text-slate-500">
                  <BookOpen className="w-10 h-10 opacity-40" />
                  <p className="text-sm">{isFa ? 'مقاله‌ای با این مشخصات یافت نشد.' : 'No blog posts match your filter.'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPosts.map((post) => {
                    const title = isFa ? post.titleFa : (post.titleEn || post.titleFa);
                    const summary = isFa ? post.summaryFa : (post.summaryEn || post.summaryFa);
                    const category = isFa ? (post.categoryFa || post.category) : (post.categoryEn || post.category);
                    const readTime = isFa ? (post.readTime || '۷ دقیقه') : (post.readTimeEn || `${post.readTime || 7} min read`);
                    const isLiked = !!likedPosts[post.id];

                    return (
                      <article
                        key={post.id}
                        onClick={() => setSelectedBlogPost(post)}
                        className="group rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 flex flex-col overflow-hidden shadow-xl hover:-translate-y-1 cursor-pointer"
                      >
                        {/* Thumbnail Image */}
                        <div className="relative aspect-video overflow-hidden bg-slate-900">
                          <img
                            src={post.coverImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108 pointer-events-none select-none"
                            onContextMenu={(e) => e.preventDefault()}
                            draggable="false"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                          {/* Category Badge */}
                          <div className="absolute top-3 right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto px-2.5 py-1 rounded-full bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-[10px] font-bold">
                            {category}
                          </div>

                          {/* Read Time */}
                          <div className="absolute bottom-3 left-3 rtl:left-3 rtl:right-auto ltr:right-3 ltr:left-auto flex items-center gap-1 text-[11px] text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded-md font-mono">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            <span>{readTime}</span>
                          </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{post.publishDate || '۱۴۰۳/۰۵/۰۱'}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                <span>{formatNum(post.views || 180, isFa)}</span>
                              </span>
                            </div>

                            <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                              {title}
                            </h4>

                            <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                              {summary}
                            </p>
                          </div>

                          {/* Tags & Action Bar */}
                          <div className="pt-3 border-t border-slate-850 flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {(post.tags || []).slice(0, 2).map((t, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => handleLike(post, e)}
                                className={`p-1.5 rounded-lg border transition-all ${
                                  isLiked
                                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                    : 'bg-slate-900 text-slate-400 hover:text-rose-400 border-slate-800'
                                }`}
                                title="پسندیدن مقاله"
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
          </div>
        ) : (
          /* =============================================================== */
          /* VIEW 2: FULL RICH BLOG POST READER                              */
          /* =============================================================== */
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
            {/* Post Header Hero */}
            <div className="max-w-4xl mx-auto space-y-4">
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

              <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                {isFa ? selectedBlogPost.titleFa : (selectedBlogPost.titleEn || selectedBlogPost.titleFa)}
              </h1>

              {/* Author & Interactions Bar */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md">
                    {data?.personalInfo?.fullNameFa?.charAt(0) || 'آ'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {isFa ? (data?.personalInfo?.fullNameFa || 'مهندس آرش طاهری') : (data?.personalInfo?.fullNameEn || 'Arash Taheri')}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isFa ? 'طراح ارشد سخت‌افزار و سیستم‌های نهفته' : 'Lead Hardware & Embedded Systems Engineer'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleLike(selectedBlogPost, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all"
                  >
                    <Heart className={`w-3.5 h-3.5 ${likedPosts[selectedBlogPost.id] ? 'fill-rose-400' : ''}`} />
                    <span>{formatNum(selectedBlogPost.likes || 48, isFa)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleShare(selectedBlogPost, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-all"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? (isFa ? 'کپی شد!' : 'Copied!') : (isFa ? 'اشتراک‌گذاری' : 'Share')}</span>
                  </button>
                </div>
              </div>

              {/* Cover Image */}
              {selectedBlogPost.coverImage && (
                <div className="rounded-3xl overflow-hidden aspect-[21/9] border border-slate-800 bg-slate-950 shadow-2xl">
                  <img
                    src={selectedBlogPost.coverImage}
                    alt={isFa ? selectedBlogPost.titleFa : selectedBlogPost.titleEn}
                    className="w-full h-full object-cover select-none pointer-events-none"
                    onContextMenu={(e) => e.preventDefault()}
                    draggable="false"
                  />
                </div>
              )}
            </div>

            {/* Post Rich Content */}
            <div className="max-w-4xl mx-auto">
              <div
                className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{
                  // SECURITY: blog HTML is ALWAYS purified (stored-XSS defense)
                  __html: sanitizeRichHtml(
                    isFa
                      ? (selectedBlogPost.contentFa || selectedBlogPost.contentMarkdownFa || '<p>محتوای این مقاله در حال آماده‌سازی است.</p>')
                      : (selectedBlogPost.contentEn || selectedBlogPost.contentMarkdownEn || selectedBlogPost.contentFa || '<p>Content in preparation.</p>')
                  )
                }}
              />

              {/* Tags Cloud */}
              <div className="pt-8 mt-8 border-t border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isFa ? 'برچسب‌ها و مباحث تخصصی مقاله:' : 'Tags & Keywords:'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(selectedBlogPost.tags || []).map((t, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-slate-950 text-cyan-300 border border-slate-800 text-xs font-mono"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
