import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { sanitizeRichHtml } from '../../utils/security';
import {
  X,
  BookOpen,
  Calendar,
  Clock,
  Printer,
  ExternalLink,
  FileText,
  FileDown,
  Check,
  Share2,
  Download
} from 'lucide-react';

/**
 * Article / Paper reader modal — light theme (matches the site palette).
 * Keeps all app features: PDF download, copy link, print, abstract,
 * markdown/HTML content, tags & author footer.
 */
export const ArticleModal = () => {
  const { selectedArticle, setSelectedArticle, data, showToast } = useData();
  const [copied, setCopied] = useState(false);

  if (!selectedArticle) return null;

  const isFa = data?.siteConfig?.language === 'fa';
  const close = () => setSelectedArticle(null);

  const hasPdf = selectedArticle.pdfUrl && selectedArticle.pdfUrl !== '#' && selectedArticle.pdfUrl.trim() !== '';

  const copyArticleLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showToast(isFa ? 'لینک مقاله در حافظه کپی شد.' : 'Article URL copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const printArticle = () => {
    window.print();
  };

  const contentMarkdown = isFa
    ? selectedArticle.contentMarkdownFa || selectedArticle.summaryFa
    : selectedArticle.contentMarkdownEn || selectedArticle.contentMarkdownFa || selectedArticle.summaryEn || selectedArticle.summaryFa;

  // Check if content contains HTML tags (from rich text editor)
  const isHtmlContent = /<[a-z][\s\S]*>/i.test(contentMarkdown || '');

  const closeBtn = (
    <button className="lm-close" onClick={close} aria-label="Close">
      <X className="w-4 h-4" />
    </button>
  );

  return (
    <div className="lm-backdrop animate-fadeIn">
      <div className="lm-card" onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <div className="lm-head">
          <div className="lm-head-title">
            <BookOpen className="w-4 h-4" />
            <span>
              {isFa
                ? selectedArticle.categoryFa || selectedArticle.category
                : selectedArticle.categoryEn || selectedArticle.categoryFa || selectedArticle.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasPdf && (
              <a
                href={selectedArticle.pdfUrl}
                download={selectedArticle.pdfFileName || 'research_article.pdf'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-mini btn-soft"
                title={isFa ? 'دانلود نسخه کامل فایل PDF مقاله' : 'Download Complete Paper Document'}
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>{isFa ? 'دانلود PDF' : 'Download PDF'}</span>
              </a>
            )}
            <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={copyArticleLink} title={isFa ? 'کپی لینک مقاله' : 'Copy link'}>
              {copied ? <Check className="w-4 h-4" style={{ color: 'var(--ok)' }} /> : <Share2 className="w-4 h-4" />}
            </button>
            <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={printArticle} title={isFa ? 'چاپ مقاله' : 'Print'}>
              <Printer className="w-4 h-4" />
            </button>
            {closeBtn}
          </div>
        </div>

        {/* Article Body */}
        <div className="lm-body lm-scroll">
          {/* Title & Metadata */}
          <div style={{ marginBottom: 20 }}>
            <div className="flex flex-wrap items-center gap-4 text-xs mono" style={{ color: 'var(--muted)', marginBottom: 10 }}>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{selectedArticle.date}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{isFa ? `مدت زمان مطالعه: ${selectedArticle.readTime}` : `Read Time: ${selectedArticle.readTimeEn || selectedArticle.readTime}`}</span>
              </span>
              {selectedArticle.year && (
                <span>
                  <bdi dir="ltr">📅 {selectedArticle.year}</bdi>
                </span>
              )}
              {selectedArticle.doi && (
                <a className="btn btn-mini btn-soft" href={/^https?:\/\//i.test(selectedArticle.doi) ? selectedArticle.doi : `https://doi.org/${selectedArticle.doi}`} target="_blank" rel="noopener noreferrer">
                  DOI ↗
                </a>
              )}
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: 900, lineHeight: 1.7, color: 'var(--ink)' }}>
              {isFa ? selectedArticle.titleFa : selectedArticle.titleEn || selectedArticle.titleFa}
            </h1>
            {(isFa ? selectedArticle.authorsFa || selectedArticle.authorsEn : selectedArticle.authorsEn || selectedArticle.authorsFa) && (
              <p style={{ color: 'var(--muted)', fontSize: '13.5px', marginTop: 6 }}>
                {isFa ? selectedArticle.authorsFa || selectedArticle.authorsEn : selectedArticle.authorsEn || selectedArticle.authorsFa}
              </p>
            )}
            {(isFa ? selectedArticle.venueFa || selectedArticle.venueEn : selectedArticle.venueEn || selectedArticle.venueFa) && (
              <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: 2 }}>
                📖 {isFa ? selectedArticle.venueFa || selectedArticle.venueEn : selectedArticle.venueEn || selectedArticle.venueFa}
              </p>
            )}
          </div>

          {/* Cover Image */}
          {selectedArticle.coverImage && (
            <div className="board-image-box" style={{ margin: '0 0 20px' }}>
              <img src={selectedArticle.coverImage} alt={selectedArticle.titleFa} style={{ height: 240 }} />
            </div>
          )}

          {/* Abstract / Summary Callout */}
          <div
            style={{
              padding: '16px 18px',
              borderRadius: 14,
              background: 'var(--accent-soft)',
              border: '1px solid rgba(79,70,229,.2)',
              marginBottom: 20,
              fontSize: '13.5px',
              color: '#3d4459',
              lineHeight: 1.9
            }}
          >
            <span className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--accent)', fontSize: '12.5px', marginBottom: 6 }}>
              <FileText className="w-4 h-4" />
              <span>{isFa ? 'چکیده و اهداف پژوهش (Abstract):' : 'Abstract & Research Summary:'}</span>
            </span>
            <p>
              {isFa ? selectedArticle.summaryFa : selectedArticle.summaryEn || selectedArticle.summaryFa}
            </p>
          </div>

          {/* DOWNLOADABLE PAPER CARD (If attached) */}
          {hasPdf && (
            <div
              className="flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{
                padding: '14px 16px',
                borderRadius: 14,
                background: 'var(--surface-2)',
                border: '1px solid var(--line)',
                marginBottom: 20
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  style={{
                    padding: 10,
                    borderRadius: 12,
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    border: '1px solid rgba(79,70,229,.25)'
                  }}
                >
                  <FileDown className="w-5 h-5" />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>
                    {selectedArticle.pdfFileName || (isFa ? 'سند کامل مقاله تخصصی (PDF)' : 'Full Paper Document (PDF)')}
                  </h4>
                  <div className="flex items-center gap-2" style={{ fontSize: '12px', color: 'var(--muted)', marginTop: 2 }}>
                    <span>{selectedArticle.pdfFileSize || (isFa ? 'فایل پیوست آماده دانلود' : 'Attached document ready')}</span>
                    <span>•</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{selectedArticle.pdfFileType || 'PDF'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={selectedArticle.pdfUrl}
                  download={selectedArticle.pdfFileName || 'research_article.pdf'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-mini"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isFa ? 'دانلود مستقیم فایل' : 'Direct Download'}</span>
                </a>
                <a
                  href={selectedArticle.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="icon-btn"
                  style={{ width: 34, height: 34 }}
                  title={isFa ? 'مشاهده آنلاین در تب جدید' : 'View in new tab'}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* MAIN ARTICLE CONTENT (HTML or Markdown) */}
          <div className="prose">
            {isHtmlContent ? (
              <div
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(contentMarkdown) }}
                dir={isFa ? 'rtl' : 'ltr'}
              />
            ) : contentMarkdown ? (
              contentMarkdown.split('\n\n').map((block, idx) => {
                if (block.startsWith('### ')) {
                  return (
                    <h3 key={idx} style={{ borderBottom: '1px solid var(--line)', paddingBottom: 6 }}>
                      {block.replace('### ', '')}
                    </h3>
                  );
                } else if (block.startsWith('#### ')) {
                  return (
                    <h4 key={idx} style={{ color: 'var(--accent)' }}>
                      {block.replace('#### ', '')}
                    </h4>
                  );
                } else if (block.startsWith('```')) {
                  const code = block.replace(/```[a-z]*/g, '').trim();
                  return (
                    <pre key={idx} dir="ltr">
                      <code>{code}</code>
                    </pre>
                  );
                } else if (block.startsWith('- ')) {
                  const items = block.split('\n');
                  return (
                    <ul key={idx}>
                      {items.map((it, i) => (
                        <li key={i}>{it.replace('- ', '')}</li>
                      ))}
                    </ul>
                  );
                } else {
                  return <p key={idx}>{block}</p>;
                }
              })
            ) : (
              <p>{isFa ? selectedArticle.summaryFa : selectedArticle.summaryEn || selectedArticle.summaryFa}</p>
            )}
          </div>

          {/* Tags */}
          <div className="chips" style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
            {selectedArticle.tags?.map((tag, i) => (
              <span key={i} className="chip mono" style={{ fontSize: '12px' }}>
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="lm-head" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
            {isFa ? `نویسنده: ${data?.personalInfo?.fullNameFa || ''}` : `Author: ${data?.personalInfo?.fullNameEn || ''}`}
          </span>
          <button className="btn btn-primary btn-mini" onClick={close}>
            {isFa ? 'بستن مقاله' : 'Close Article'}
          </button>
        </div>
      </div>
    </div>
  );
};
