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

/**
 * Spotlight global search — light theme (matches the site palette).
 * Searches boards, articles/papers, skills, blog posts & experiences.
 * Ctrl+K / Cmd+K shortcut.
 */
export const GlobalSearchModal = () => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    data,
    setSelectedBoard,
    setSelectedArticle,
    navigateToBlog,
    navigate,
  } = useData();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const inputRef = useRef(null);

  const isFa = data?.siteConfig?.language === 'fa';

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

  // Unified Search Results across Boards, Articles, Skills, Blog & Experience
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
        const interfacesMatch = (board.interfaces || []).some((it) => it.toLowerCase().includes(q));

        if (titleMatch || mcuMatch || catMatch || edaMatch || descMatch || interfacesMatch) {
          list.push({
            type: 'board',
            id: board.id,
            raw: board,
            title: isFa ? board.titleFa : board.titleEn || board.titleFa,
            subtitle: `${board.layers || 4} ${isFa ? 'لایه' : 'Layers'} · ${board.mcu || board.edaTool}`,
            badge: isFa ? board.categoryFa || 'برد الکترونیکی' : board.categoryEn || 'Hardware Board',
            icon: Cpu,
            actionText: isFa ? 'مشاهده جزئیات پروژه' : 'Inspect Board Details',
          });
        }
      });
    }

    // 2. Search in Articles / Papers
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
        const tagMatch = (art.tags || []).some((t) => t.toLowerCase().includes(q));
        const authorMatch =
          (art.authorsFa && art.authorsFa.toLowerCase().includes(q)) ||
          (art.authorsEn && art.authorsEn.toLowerCase().includes(q));

        if (titleMatch || catMatch || sumMatch || tagMatch || authorMatch) {
          list.push({
            type: 'article',
            id: art.id,
            raw: art,
            title: isFa ? art.titleFa : art.titleEn || art.titleFa,
            subtitle: `${isFa ? art.categoryFa || art.category : art.categoryEn || art.category} · ${art.readTime || '10 min'}`,
            badge: isFa ? 'مقاله علمی' : 'Publication',
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
              title: isFa ? sk.nameFa || sk.name : sk.nameEn || sk.name || sk.nameFa,
              subtitle: `${isFa ? group.categoryFa : group.categoryEn || group.categoryFa} · ${isFa ? 'تسلط' : 'Proficiency'} ${sk.level || 90}%`,
              badge: isFa ? 'مهارت تخصصی' : 'Technical Skill',
              icon: Layers,
              actionText: isFa ? 'پرش به صفحه درباره من' : 'Jump to About Page',
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
            title: isFa ? post.titleFa : post.titleEn || post.titleFa,
            subtitle: `${isFa ? post.categoryFa || post.category : post.categoryEn || post.category} · ${post.readTime || '8 min'}`,
            badge: isFa ? 'وبلاگ تخصصی' : 'Tech Blog',
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
            title: isFa ? exp.roleFa : exp.roleEn || exp.roleFa,
            subtitle: `${isFa ? exp.companyFa : exp.companyEn || exp.companyFa} · ${isFa ? exp.periodFa : exp.periodEn}`,
            badge: isFa ? 'سوابق شغلی' : 'Experience',
            icon: Briefcase,
            actionText: isFa ? 'مشاهده در صفحه درباره من' : 'View on About Page',
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
      navigate('works');
      setSelectedBoard(res.raw);
    } else if (res.type === 'article') {
      navigate('papers');
      setSelectedArticle(res.raw);
    } else if (res.type === 'skill' || res.type === 'experience') {
      navigate('about');
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
      className="lm-backdrop animate-fadeIn"
      style={{ alignItems: 'flex-start', paddingTop: '12vh' }}
      onClick={() => setIsSearchModalOpen(false)}
    >
      <div
        className="lm-card"
        style={{ maxWidth: '680px', margin: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="lm-head" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Search className="w-5 h-5 shrink-0" style={{ color: 'var(--accent)' }} />
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
            style={{
              width: '100%', background: 'transparent', border: 'none', outline: 'none',
              fontSize: '14px', color: 'var(--ink)', fontFamily: 'inherit'
            }}
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)',
                display: 'grid', placeItems: 'center'
              }}
              title={isFa ? 'پاک کردن' : 'Clear search'}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span
            style={{
              fontSize: '11px', fontFamily: 'var(--mono)', background: 'var(--bg-soft)',
              border: '1px solid var(--line-strong)', borderRadius: 8, padding: '2px 8px',
              color: 'var(--muted)'
            }}
          >
            ESC
          </span>
        </div>

        {/* Category Filter Tabs */}
        <div className="filters" style={{ padding: '10px 20px 14px', marginBottom: 0, background: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
          {categories.map((c) => {
            const active = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`chip filter ${active ? 'active' : ''}`}
                style={{ fontSize: '12.5px', padding: '5px 14px', whiteSpace: 'nowrap' }}
              >
                {isFa ? c.labelFa : c.labelEn}
              </button>
            );
          })}
        </div>

        {/* Results Body */}
        <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '12px 14px' }}>
          {query.trim() === '' ? (
            /* Empty State / Suggestions */
            <div className="text-center" style={{ padding: '48px 24px' }}>
              <div
                className="mx-auto"
                style={{
                  width: 48, height: 48, borderRadius: 14, display: 'grid', placeItems: 'center',
                  background: 'var(--accent-soft)', border: '1px solid rgba(79,70,229,.25)', color: 'var(--accent)'
                }}
              >
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)', marginTop: 16 }}>
                {isFa ? 'جستجوی یکپارچه و هوشمند در تمام بخش‌ها' : 'Instant Site-Wide Global Search'}
              </h4>
              <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: 6, lineHeight: 1.9 }}>
                {isFa
                  ? 'عنوان برد، نام میکروکنترلر (مانند STM32 یا FPGA)، نام مقاله، موضوعات تخصصی یا شرکت‌ها را تایپ کنید.'
                  : 'Search for board names, MCUs (e.g., STM32, FPGA), article keywords, technical tools, or company history.'}
              </p>

              {/* Quick Search Tags */}
              <div className="chips" style={{ justifyContent: 'center', marginTop: 14 }}>
                {['STM32', 'CAN-FD', 'High-Speed PCB', 'Altium', 'BMS', 'FreeRTOS'].map((tag) => (
                  <button key={tag} onClick={() => setQuery(tag)} className="chip mono" style={{ fontSize: '12px' }}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            /* No Results Found */
            <div className="text-center" style={{ padding: '48px 24px' }}>
              <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>
                {isFa ? `نتیجه‌ای برای «${query}» یافت نشد!` : `No results found matching "${query}"`}
              </p>
              <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: 6 }}>
                {isFa
                  ? 'لطفاً عبارت جستجو را تغییر دهید یا دسته‌بندی دیگری را انتخاب نمایید.'
                  : 'Try adjusting your search terms or choosing a different filter category.'}
              </p>
            </div>
          ) : (
            /* Result Items List */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {results.map((res, i) => {
                const Icon = res.icon;
                return (
                  <div
                    key={`${res.type}-${res.id}-${i}`}
                    onClick={() => handleSelectResult(res)}
                    className="group"
                    style={{
                      padding: '12px 14px', borderRadius: 14, cursor: 'pointer',
                      background: 'var(--surface-2)', border: '1px solid var(--line)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: 12, transition: '.15s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(79,70,229,.45)';
                      e.currentTarget.style.background = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--line)';
                      e.currentTarget.style.background = 'var(--surface-2)';
                    }}
                  >
                    <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
                      <div
                        className="shrink-0"
                        style={{
                          width: 36, height: 36, borderRadius: 11, display: 'grid', placeItems: 'center',
                          background: 'var(--accent-soft)', color: 'var(--accent)',
                          border: '1px solid rgba(79,70,229,.25)'
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
                          <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {res.title}
                          </span>
                          <span
                            style={{
                              fontSize: '10.5px', fontWeight: 700, padding: '2px 9px', borderRadius: 99,
                              background: 'var(--accent-soft)', color: 'var(--accent)',
                              border: '1px solid rgba(79,70,229,.22)', whiteSpace: 'nowrap'
                            }}
                          >
                            {res.badge}
                          </span>
                        </div>
                        <p className="mono" style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {res.subtitle}
                        </p>
                      </div>
                    </div>

                    <div
                      className="shrink-0 flex items-center gap-1.5"
                      style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600 }}
                    >
                      <span className="hidden sm:inline" style={{ opacity: 0.8 }}>{res.actionText}</span>
                      {isFa ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="lm-head" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
            {isFa
              ? `${toPersianDigits(results.length)} نتیجه پیدا شد`
              : `${toEnglishDigits(results.length)} item(s) found`}
          </span>
          <span className="flex items-center gap-1" style={{ fontSize: '11px', color: 'var(--muted)' }}>
            <kbd
              style={{
                padding: '1px 7px', borderRadius: 6, background: 'var(--bg-soft)',
                border: '1px solid var(--line-strong)', fontFamily: 'var(--mono)', fontSize: '10px'
              }}
            >
              ESC
            </kbd>
            <span>{isFa ? 'برای بستن' : 'to close'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
