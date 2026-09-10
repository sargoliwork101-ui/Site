import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { sanitizeRichHtml, copyTextToClipboard } from '../../utils/security';
import {
  X,
  BookOpen,
  Calendar,
  Clock,
  Printer,
  Download,
  ExternalLink,
  FileText,
  FileDown,
  Check,
  Share2
} from 'lucide-react';

export const ArticleModal = () => {
  const { selectedArticle, setSelectedArticle, currentTemplate, data, showToast } = useData();
  const [copied, setCopied] = useState(false);

  if (!selectedArticle) return null;

  const isFa = data?.siteConfig?.language === 'fa';
  const primaryColor = currentTemplate?.colors?.primary || '#00ffcc';

  const hasPdf = selectedArticle.pdfUrl && selectedArticle.pdfUrl !== '#' && selectedArticle.pdfUrl.trim() !== '';

  const copyArticleLink = async () => {
    const ok = await copyTextToClipboard(window.location.href);
    if (ok) {
      setCopied(true);
      showToast(isFa ? 'لینک مقاله در حافظه کپی شد.' : 'Article URL copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast(isFa ? 'کپی نشد؛ لینک را دستی کپی کنید.' : 'Copy failed; please copy manually.', 'error');
    }
  };

  const printArticle = () => {
    window.print();
  };

  const contentMarkdown = isFa
    ? (selectedArticle.contentMarkdownFa || selectedArticle.summaryFa)
    : (selectedArticle.contentMarkdownEn || selectedArticle.contentMarkdownFa || selectedArticle.summaryEn || selectedArticle.summaryFa);

  // Check if content contains HTML tags (from rich text editor)
  const isHtmlContent = /<[a-z][\s\S]*>/i.test(contentMarkdown || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <BookOpen className="w-4 h-4" />
            <span>{isFa ? (selectedArticle.categoryFa || selectedArticle.category) : (selectedArticle.categoryEn || selectedArticle.categoryFa || selectedArticle.category)}</span>
          </div>

          <div className="flex items-center gap-2">
            {hasPdf && (
              <a
                href={selectedArticle.pdfUrl}
                download={selectedArticle.pdfFileName || 'research_article.pdf'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 text-xs font-semibold transition-all shadow"
                title={isFa ? 'دانلود نسخه کامل فایل PDF مقاله' : 'Download Complete Paper Document'}
              >
                <FileDown className="w-4 h-4" />
                <span className="hidden sm:inline">{isFa ? 'دانلود فایل مقاله (PDF)' : 'Download PDF Document'}</span>
              </a>
            )}

            <button
              onClick={copyArticleLink}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title={isFa ? 'کپی لینک مقاله' : 'Copy link'}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={printArticle}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title={isFa ? 'چاپ مقاله' : 'Print'}
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSelectedArticle(null)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Article Body */}
        <div className="p-6 sm:p-10 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Title & Metadata */}
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>{selectedArticle.date}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isFa ? `مدت زمان مطالعه: ${selectedArticle.readTime}` : `Read Time: ${selectedArticle.readTimeEn || selectedArticle.readTime}`}</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-white leading-tight">
              {isFa ? selectedArticle.titleFa : (selectedArticle.titleEn || selectedArticle.titleFa)}
            </h1>
            <p className="text-xs font-mono text-cyan-400">
              {isFa ? selectedArticle.titleEn : (selectedArticle.categoryEn || selectedArticle.category)}
            </p>
          </div>

          {/* Cover Image */}
          {selectedArticle.coverImage && (
            <div className="rounded-2xl overflow-hidden aspect-[21/9] border border-slate-800 bg-slate-950 shadow-xl">
              <img
                src={selectedArticle.coverImage}
                alt={selectedArticle.titleFa}
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Abstract / Summary Callout */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 text-xs sm:text-sm text-cyan-100 leading-relaxed shadow-inner">
            <span className="font-black text-cyan-400 text-xs uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>{isFa ? 'چکیده و اهداف پژوهش (Abstract):' : 'Abstract & Research Summary:'}</span>
            </span>
            <p className="leading-relaxed">
              {isFa ? selectedArticle.summaryFa : (selectedArticle.summaryEn || selectedArticle.summaryFa)}
            </p>
          </div>

          {/* DOWNLOADABLE PAPER CARD (If attached) */}
          {hasPdf && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/40 border border-rose-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
                  <FileDown className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {selectedArticle.pdfFileName || (isFa ? 'سند کامل مقاله تخصصی (PDF / Word)' : 'Full Paper Document (PDF)')}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>{selectedArticle.pdfFileSize || (isFa ? 'فایل پیوست آماده دانلود' : 'Attached document ready')}</span>
                    <span>•</span>
                    <span className="text-rose-400 font-bold">{selectedArticle.pdfFileType || 'PDF'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={selectedArticle.pdfUrl}
                  download={selectedArticle.pdfFileName || 'research_article.pdf'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition-all hover:scale-105"
                >
                  <Download className="w-4 h-4" />
                  <span>{isFa ? 'دانلود مستقیم فایل' : 'Direct Download'}</span>
                </a>

                <a
                  href={selectedArticle.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title={isFa ? 'مشاهده آنلاین در تب جدید' : 'View in new tab'}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* MAIN ARTICLE CONTENT (HTML or Markdown) */}
          <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-200 leading-loose space-y-4 pt-2">
            {isHtmlContent ? (
              <div
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(contentMarkdown) }}
                className="space-y-4 rich-article-content"
                dir={isFa ? 'rtl' : 'ltr'}
              />
            ) : contentMarkdown ? (
              contentMarkdown.split('\n\n').map((block, idx) => {
                if (block.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="text-base sm:text-lg font-bold text-white pt-4 pb-1 border-b border-slate-800">
                      {block.replace('### ', '')}
                    </h3>
                  );
                } else if (block.startsWith('#### ')) {
                  return (
                    <h4 key={idx} className="text-sm sm:text-base font-bold text-cyan-300 pt-2">
                      {block.replace('#### ', '')}
                    </h4>
                  );
                } else if (block.startsWith('```')) {
                  const code = block.replace(/```[a-z]*/g, '').trim();
                  return (
                    <pre
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto text-left"
                      dir="ltr"
                    >
                      <code>{code}</code>
                    </pre>
                  );
                } else if (block.startsWith('- ')) {
                  const items = block.split('\n');
                  return (
                    <ul key={idx} className="space-y-1.5 list-disc list-inside text-slate-300">
                      {items.map((it, i) => (
                        <li key={i}>{it.replace('- ', '')}</li>
                      ))}
                    </ul>
                  );
                } else {
                  return <p key={idx} className="text-slate-300 leading-relaxed">{block}</p>;
                }
              })
            ) : (
              <p className="text-slate-300">
                {isFa ? selectedArticle.summaryFa : (selectedArticle.summaryEn || selectedArticle.summaryFa)}
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-2">
            {selectedArticle.tags?.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {isFa ? `نویسنده: ${data?.personalInfo?.fullNameFa || 'مهندس آرش طاهری'}` : `Author: ${data?.personalInfo?.fullNameEn || 'Arash Taheri'}`}
          </span>
          <button
            onClick={() => setSelectedArticle(null)}
            className="px-6 py-2 rounded-xl font-bold text-xs text-slate-950 transition-all hover:scale-105"
            style={{ backgroundColor: primaryColor }}
          >
            {isFa ? 'بستن مقاله' : 'Close Article'}
          </button>
        </div>
      </div>
    </div>
  );
};
