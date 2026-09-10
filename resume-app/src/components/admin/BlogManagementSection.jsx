/**
 * ============================================================================
 * BLOG & ENGINEERING ARTICLES ADMIN MANAGEMENT MODULE
 * ============================================================================
 * 
 * Features:
 * 1. Full CRUD for Blog Posts with Word-like Rich Text Editor Integration
 * 2. Bilingual Persian & English fields side-by-side
 * 3. SEO Metatags, URL Slugs, Reading Time Estimation & Tag Clouds
 * 4. Post Status (Published, Draft, Archived)
 * 5. Media Library Integration for Cover Images
 *
 * @module BlogManagementSection
 */

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { RichTextEditorModal } from '../common/RichTextEditorModal';
import { autoTranslateFaToEn } from '../../utils/translatorHelper';
import {
  Newspaper,
  Plus,
  Edit2,
  Trash2,
  Save,
  Eye,
  Search,
  CheckCircle2,
  Heart,
  FileText,
  Globe,
  Sparkles,
  X,
  Headphones
} from 'lucide-react';

export const BlogManagementSection = () => {
  const {
    data,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    setSelectedBlogPost,
    setIsBlogModalOpen,
    showToast,
    showConfirmDialog
  } = useData();

  const blogPosts = data?.blogPosts || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Modal form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
  const [editingPostId, setEditingPostId] = useState(null);

  // Form Fields
  const [titleFa, setTitleFa] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('طراحی مدار چاپی (PCB)');
  const [categoryFa, setCategoryFa] = useState('طراحی مدار چاپی (PCB)');
  const [categoryEn, setCategoryEn] = useState('PCB Design & Layout');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80');
  const [readTime, setReadTime] = useState('۸ دقیقه');
  const [readTimeEn, setReadTimeEn] = useState('8 min read');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioTitleFa, setAudioTitleFa] = useState('');
  const [audioTitleEn, setAudioTitleEn] = useState('');
  const [audioDuration, setAudioDuration] = useState('12:00');
  const [summaryFa, setSummaryFa] = useState('');
  const [summaryEn, setSummaryEn] = useState('');
  const [contentFa, setContentFa] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState('published'); // 'published' | 'draft' | 'archived'
  const [seoTitleFa, setSeoTitleFa] = useState('');
  const [seoDescFa, setSeoDescFa] = useState('');

  // Rich Text Editor Modal Sub-state
  const [richEditorConfig, setRichEditorConfig] = useState({
    isOpen: false,
    fieldName: '',
    title: '',
    language: 'fa',
    initialValue: '',
    onSave: null,
  });

  // Open Add Post Modal
  const handleOpenAdd = () => {
    setFormMode('add');
    setEditingPostId(null);
    setTitleFa('');
    setTitleEn('');
    setSlug('');
    setCategory('طراحی مدار چاپی (PCB)');
    setCategoryFa('طراحی مدار چاپی (PCB)');
    setCategoryEn('PCB Design & Layout');
    setCoverImage('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80');
    setReadTime('۸ دقیقه');
    setReadTimeEn('8 min read');
    setAudioUrl('');
    setAudioTitleFa('');
    setAudioTitleEn('');
    setAudioDuration('10:00');
    setSummaryFa('');
    setSummaryEn('');
    setContentFa('<p>متن کامل مقاله و یادداشت مهندسی خود را اینجا وارد یا Paste فرمایید...</p>');
    setContentEn('<p>Write or paste your complete technical article content here...</p>');
    setTagsInput('Altium, High-Speed PCB, Signal Integrity');
    setStatus('published');
    setSeoTitleFa('');
    setSeoDescFa('');
    setIsFormOpen(true);
  };

  // Open Edit Post Modal
  const handleOpenEdit = (post) => {
    setFormMode('edit');
    setEditingPostId(post.id);
    setTitleFa(post.titleFa || '');
    setTitleEn(post.titleEn || '');
    setSlug(post.slug || '');
    setCategory(post.category || 'طراحی مدار چاپی (PCB)');
    setCategoryFa(post.categoryFa || post.category || 'طراحی مدار چاپی (PCB)');
    setCategoryEn(post.categoryEn || 'PCB Design & Layout');
    setCoverImage(post.coverImage || '');
    setReadTime(post.readTime || '۸ دقیقه');
    setReadTimeEn(post.readTimeEn || '8 min read');
    setAudioUrl(post.audioUrl || '');
    setAudioTitleFa(post.audioTitleFa || '');
    setAudioTitleEn(post.audioTitleEn || '');
    setAudioDuration(post.audioDuration || '12:00');
    setSummaryFa(post.summaryFa || '');
    setSummaryEn(post.summaryEn || '');
    setContentFa(post.contentFa || post.contentMarkdownFa || '');
    setContentEn(post.contentEn || post.contentMarkdownEn || '');
    setTagsInput((post.tags || []).join(', '));
    setStatus(post.status || 'published');
    setSeoTitleFa(post.seoTitleFa || '');
    setSeoDescFa(post.seoDescFa || '');
    setIsFormOpen(true);
  };

  // Auto generate slug & translation on blur
  const handleTitleFaBlur = () => {
    if (titleFa && !titleEn) {
      const trans = autoTranslateFaToEn(titleFa);
      setTitleEn(trans);
      if (!slug) {
        setSlug(trans.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
      }
    }
  };

  // Open Word-like Rich Editor for Persian content
  const handleOpenRichEditorFa = () => {
    setRichEditorConfig({
      isOpen: true,
      fieldName: 'contentFa',
      title: 'ویرایشگر حرفه‌ای متن فارسی مقاله (Word Style)',
      language: 'fa',
      initialValue: contentFa,
      onSave: (newHtml) => setContentFa(newHtml),
    });
  };

  // Open Word-like Rich Editor for English content
  const handleOpenRichEditorEn = () => {
    setRichEditorConfig({
      isOpen: true,
      fieldName: 'contentEn',
      title: 'English Article Content Editor (Word Style)',
      language: 'en',
      initialValue: contentEn,
      onSave: (newHtml) => setContentEn(newHtml),
    });
  };

  // Handle Submit Form
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!titleFa.trim()) {
      showToast('عنوان فارسی مقاله الزامی است.', 'error');
      return;
    }

    const tagsArray = tagsInput
      .split(/[,،]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      titleFa: titleFa.trim(),
      titleEn: titleEn.trim() || autoTranslateFaToEn(titleFa.trim()),
      slug: slug.trim() || titleEn.trim().toLowerCase().replace(/[^a-z0-9]/g, '-'),
      category,
      categoryFa,
      categoryEn,
      coverImage: coverImage.trim(),
      readTime: readTime.trim(),
      readTimeEn: readTimeEn.trim(),
      audioUrl: audioUrl.trim(),
      audioTitleFa: audioTitleFa.trim(),
      audioTitleEn: audioTitleEn.trim() || autoTranslateFaToEn(audioTitleFa.trim()),
      audioDuration: audioDuration.trim(),
      summaryFa: summaryFa.trim(),
      summaryEn: summaryEn.trim() || autoTranslateFaToEn(summaryFa.trim()),
      contentFa,
      contentEn,
      tags: tagsArray,
      status,
      seoTitleFa: seoTitleFa.trim(),
      seoDescFa: seoDescFa.trim(),
    };

    if (formMode === 'add') {
      addBlogPost(payload);
    } else {
      updateBlogPost(editingPostId, payload);
    }
    setIsFormOpen(false);
  };

  // Filter posts safely
  const filteredPosts = (blogPosts || []).filter((p) => {
    if (!p) return false;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (p.titleFa && p.titleFa.toLowerCase().includes(q)) ||
      (p.titleEn && p.titleEn.toLowerCase().includes(q)) ||
      (p.summaryFa && p.summaryFa.toLowerCase().includes(q)) ||
      (p.summaryEn && p.summaryEn.toLowerCase().includes(q)) ||
      (p.tags && p.tags.some((t) => t && t.toLowerCase().includes(q)));

    const matchesCat =
      filterCategory === 'all' ||
      p.category === filterCategory ||
      p.categoryFa === filterCategory ||
      p.categoryEn === filterCategory;
    return matchesSearch && matchesCat;
  });

  // Extract unique categories for filter dropdown
  const uniqueCategories = Array.from(
    new Set((blogPosts || []).map((p) => p.categoryFa || p.category).filter(Boolean))
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* 1. TOP STATS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-mono font-black text-white">{blogPosts.length}</div>
            <div className="text-[11px] text-slate-400">کل مقالات وبلاگ</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-mono font-black text-emerald-400">
              {blogPosts.filter((p) => p.status === 'published').length}
            </div>
            <div className="text-[11px] text-slate-400">منتشر شده</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-mono font-black text-amber-400">
              {blogPosts.reduce((acc, p) => acc + (p.views || 0), 0)}
            </div>
            <div className="text-[11px] text-slate-400">مجموع بازدیدها</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-mono font-black text-rose-400">
              {blogPosts.reduce((acc, p) => acc + (p.likes || 0), 0)}
            </div>
            <div className="text-[11px] text-slate-400">پسندهای ثبت‌شده</div>
          </div>
        </div>
      </div>

      {/* 2. CONTROL BAR */}
      <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در مقالات وبلاگ..."
              className="w-full px-9 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">همه دسته‌ها ({blogPosts.length})</option>
            {uniqueCategories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>نگارش و انتشار مقاله جدید در وبلاگ</span>
        </button>
      </div>

      {/* 3. BLOG POSTS TABLE / LIST */}
      <div className="rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="p-3.5">تصویر و عنوان مقاله</th>
                <th className="p-3.5">دسته‌بندی</th>
                <th className="p-3.5">تاریخ انتشار</th>
                <th className="p-3.5">بازدید / لایک</th>
                <th className="p-3.5">وضعیت</th>
                <th className="p-3.5 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.coverImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'}
                        alt={post.titleFa}
                        className="w-12 h-9 rounded-lg object-cover border border-slate-800 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-white line-clamp-1">{post.titleFa}</div>
                        <div className="text-[11px] text-slate-400 font-mono line-clamp-1">{post.titleEn}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[11px]">
                      {post.categoryFa || post.category}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-400">
                    {post.publishDate}
                  </td>
                  <td className="p-3.5 font-mono text-[11px]">
                    <span className="text-amber-400">{post.views || 0}</span> / <span className="text-rose-400">{post.likes || 0}</span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        post.status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {post.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBlogPost(post);
                          setIsBlogModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                        title="مشاهده پیش‌نمایش در وبلاگ"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(post)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                        title="ویرایش مقاله و محتوا"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          showConfirmDialog({
                            title: 'تایید حذف مقاله وبلاگ',
                            message: `آیا از حذف کامل و غیرقابل‌بازگشت مقاله «${post.titleFa}» اطمینان دارید؟`,
                            type: 'danger',
                            confirmText: 'بله، حذف کن',
                            cancelText: 'انصراف',
                            onConfirm: () => {
                              deleteBlogPost(post.id);
                            }
                          });
                        }}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
                        title="حذف دائمی مقاله از وبلاگ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ADD / EDIT BLOG POST MODAL                                         */}
      {/* =================================================================== */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div
            className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
                  {formMode === 'add' ? <Plus className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {formMode === 'add' ? 'نگارش و انتشار مقاله جدید در وبلاگ' : 'ویرایش مقاله وبلاگ'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    پشتیبانی کامل از ادیتور پیشرفته ورد، جداول، عکس، تگ‌ها و فیلدهای دوزبانه
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Titles Fa & En */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    عنوان فارسی مقاله: *
                  </label>
                  <input
                    type="text"
                    required
                    value={titleFa}
                    onChange={(e) => setTitleFa(e.target.value)}
                    onBlur={handleTitleFaBlur}
                    placeholder="مثال: راهنمای جامع طراحی بردهای پرسرعت و کنترل امپدانس"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    English Article Title (زیر فیلد فارسی):
                  </label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="e.g. Comprehensive Guide to High-Speed PCB Layout"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Category, Cover Image & Read Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">دسته‌بندی مقاله:</label>
                  <input
                    type="text"
                    value={categoryFa}
                    onChange={(e) => {
                      setCategoryFa(e.target.value);
                      setCategory(e.target.value);
                    }}
                    placeholder="طراحی مدار چاپی (PCB)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">مدت‌زمان مطالعه:</label>
                  <input
                    type="text"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    placeholder="۸ دقیقه"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">وضعیت انتشار:</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="published">منتشر شده (عمومی در وبلاگ)</option>
                    <option value="draft">پیش‌نویس (فقط ادمین)</option>
                  </select>
                </div>
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">آدرس تصویر شاخص کاور مقاله:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                  {coverImage && (
                    <img
                      src={coverImage}
                      alt="Cover Preview"
                      className="w-10 h-9 rounded-lg object-cover border border-slate-800"
                    />
                  )}
                </div>
              </div>

              {/* Audio Podcast / Narration Attachment Section (Optional) */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Headphones className="w-4 h-4 text-cyan-400" />
                    <span>فایل صوتی و پادکست اختصاصی مقاله (اختیاری):</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  می‌توانید لینک مستقیم فایل صوتی پادکست یا گویندگی مقاله را اینجا قرار دهید تا در بالای متن مقاله پخش‌کننده صوتی نمایش داده شود.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-300 mb-1">آدرس اینترنتی فایل صوتی (Audio URL):</label>
                    <input
                      type="text"
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      placeholder="https://.../podcast.mp3"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">مدت‌زمان صوت:</label>
                    <input
                      type="text"
                      value={audioDuration}
                      onChange={(e) => setAudioDuration(e.target.value)}
                      placeholder="12:45"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">عنوان فایل صوتی (فارسی):</label>
                    <input
                      type="text"
                      value={audioTitleFa}
                      onChange={(e) => setAudioTitleFa(e.target.value)}
                      placeholder="پادکست صوتی: راهنمای عملی طراحی..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-cyan-400 mb-1">Audio Track Title (English):</label>
                    <input
                      type="text"
                      value={audioTitleEn}
                      onChange={(e) => setAudioTitleEn(e.target.value)}
                      placeholder="Audio Podcast: Practical Guide..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Summaries Fa & En */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">خلاصه مقاله به فارسی:</label>
                  <textarea
                    rows={2}
                    value={summaryFa}
                    onChange={(e) => setSummaryFa(e.target.value)}
                    placeholder="خلاصه ۲ تا ۳ خطی مقاله..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Short Summary in English:</label>
                  <textarea
                    rows={2}
                    value={summaryEn}
                    onChange={(e) => setSummaryEn(e.target.value)}
                    placeholder="Brief 2-3 sentences summary..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Rich Content Triggers (Word-like Rich Text Editor Modals) */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>متن اصلی و کامل مقاله (ادیتور حرفه‌ای ورد با امکان Paste و فرمت‌بندی):</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleOpenRichEditorFa}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-cyan-500/50 text-cyan-300 text-xs font-bold transition-all shadow-md"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>ویرایش متن فارسی در ادیتور ورد ({contentFa.length} کاراکتر)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenRichEditorEn}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-750 text-slate-300 text-xs font-bold transition-all shadow-md"
                  >
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Edit English Content in Word Editor ({contentEn.length} chars)</span>
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  برچسب‌ها و تگ‌ها (با ویرگول جدا کنید):
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Altium, High-Speed, STM32, EMC..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
                >
                  انصراف
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{formMode === 'add' ? 'انتشار مقاله در وبلاگ' : 'ذخیره تغییرات مقاله'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Rich Text Editor Modal */}
      <RichTextEditorModal
        isOpen={richEditorConfig.isOpen}
        onClose={() => setRichEditorConfig((prev) => ({ ...prev, isOpen: false }))}
        title={richEditorConfig.title}
        fieldName={richEditorConfig.fieldName}
        language={richEditorConfig.language}
        initialValue={richEditorConfig.initialValue}
        onSave={(newHtml) => {
          if (richEditorConfig.onSave) {
            richEditorConfig.onSave(newHtml);
          }
          setRichEditorConfig((prev) => ({ ...prev, isOpen: false }));
          showToast('متن مقاله با موفقیت در فرم ذخیره شد.');
        }}
      />
    </div>
  );
};
