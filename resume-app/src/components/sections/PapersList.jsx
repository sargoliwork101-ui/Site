import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';

/** Paper types — same taxonomy as the site (paper_types in lang.php) */
export const PAPER_TYPES = ['journal', 'conference', 'book_chapter', 'book', 'thesis', 'report', 'other'];

export const PAPER_TYPE_LABELS = {
  journal: { fa: 'مقاله ژورنالی', en: 'Journal' },
  conference: { fa: 'مقاله کنفرانسی', en: 'Conference' },
  book_chapter: { fa: 'فصل کتاب', en: 'Book Chapter' },
  book: { fa: 'کتاب', en: 'Book' },
  thesis: { fa: 'پایان‌نامه', en: 'Thesis' },
  report: { fa: 'گزارش فنی', en: 'Technical Report' },
  other: { fa: 'سایر', en: 'Other' },
};

const typeKey = (t) => (PAPER_TYPES.includes(t) ? t : 'other');
const typeLabel = (t, isFa) => (PAPER_TYPE_LABELS[typeKey(t)] || PAPER_TYPE_LABELS.other)[isFa ? 'fa' : 'en'];

/** Persian/Arabic digit normalization (port of to_num()) */
const toNum = (s) =>
  String(s ?? '')
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));

/** Convert an articles list into year groups (newest first) — site logic */
export const groupPapersByYear = (papers) => {
  const groups = {};
  papers.forEach((p) => {
    const y = String(p.year ?? '').trim();
    const num = Number.isFinite(parseFloat(toNum(y))) ? parseFloat(toNum(y)) : -1;
    (groups[num] = groups[num] || []).push({ disp: y !== '' ? y : null, p });
  });
  const keys = Object.keys(groups).sort((a, b) => b - a);
  return keys.map((k) => ({ yearNum: Number(k), display: groups[k][0].disp, items: groups[k].map((g) => g.p) }));
};

const doiHref = (doi) => {
  const d = String(doi ?? '').trim();
  if (!d) return '';
  return /^https?:\/\//i.test(d) ? d : `https://doi.org/${d.replace(/^\//, '')}`;
};

/** Full paper card (papers page) — like the site's paper-card */
export const PaperCard = ({ paper, isFa, onOpen }) => {
  const tkey = typeKey(paper.type);
  const title = isFa ? paper.titleFa || paper.titleEn : paper.titleEn || paper.titleFa;
  const authorsTxt = (isFa ? paper.authorsFa || paper.authorsEn : paper.authorsEn || paper.authorsFa) || '';
  const venueTxt = (isFa ? paper.venueFa || paper.venueEn : paper.venueEn || paper.venueFa) || '';
  const abstractTxt = (isFa ? paper.abstractFa || paper.summaryFa : paper.abstractEn || paper.summaryEn) || '';
  const doi = doiHref(paper.doi);

  return (
    <div className="card paper-card reveal" id={`p-${paper.id}`}>
      <div className="paper-head">
        <span className="badge badge-soft">{typeLabel(tkey, isFa)}</span>
        <h3>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onOpen && onOpen(paper);
            }}
          >
            {title}
          </a>
        </h3>
      </div>
      {authorsTxt && <p className="paper-authors">{authorsTxt}</p>}
      {venueTxt && (
        <p className="paper-venue">
          📖 {venueTxt}
          {paper.year ? <bdi dir="ltr"> · {paper.year}</bdi> : null}
        </p>
      )}
      {abstractTxt && (
        <details className="paper-abstract">
          <summary>{isFa ? 'چکیده' : 'Abstract'}</summary>
          <p>{abstractTxt}</p>
        </details>
      )}
      {(doi || paper.pdfUrl) && (
        <div className="paper-links">
          {doi && (
            <a className="btn btn-mini btn-soft" href={doi} target="_blank" rel="noopener noreferrer">
              DOI ↗
            </a>
          )}
          {paper.pdfUrl && (
            <a className="btn btn-mini" href={paper.pdfUrl} target="_blank" rel="noopener noreferrer">
              PDF ⬇
            </a>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Papers page — like the site: live search (title/authors/venue/abstract in
 * both languages) + type filters + year groups.
 */
export const PapersPageContent = () => {
  const { data, setSelectedArticle } = useData();
  const isFa = data?.siteConfig?.language === 'fa';
  const papers = data?.articles || [];
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');

  // Type counts
  const typeCounts = useMemo(() => {
    const counts = {};
    papers.forEach((p) => {
      const k = typeKey(p.type);
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
  }, [papers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return papers.filter((p) => {
      const okT = type === 'all' || typeKey(p.type) === type;
      if (!okT) return false;
      if (!q) return true;
      const hay = [
        p.titleFa,
        p.titleEn,
        p.authorsFa,
        p.authorsEn,
        p.venueFa,
        p.venueEn,
        p.abstractFa,
        p.summaryFa,
        p.abstractEn,
        p.summaryEn,
        p.year,
        ...((p.tags || []).map((t) => String(t).toLowerCase())),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [papers, query, type]);

  const groups = useMemo(() => groupPapersByYear(filtered), [filtered]);

  if (!papers.length) {
    return <p className="empty">{isFa ? 'هنوز مقاله‌ای ثبت نشده است.' : 'No publications yet.'}</p>;
  }

  return (
    <>
      <div className="paper-tools">
        <input
          type="search"
          className="input search-input"
          placeholder={isFa ? '🔍 جستجو در عنوان، نویسنده، مجله یا چکیده...' : '🔍 Search title, author, venue or abstract...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="filters">
          <button
            className={`chip filter ${type === 'all' ? 'active' : ''}`}
            onClick={() => setType('all')}
          >
            {isFa ? 'همه' : 'All'} ({papers.length})
          </button>
          {Object.entries(typeCounts).map(([t, n]) => (
            <button
              key={t}
              className={`chip filter ${type === t ? 'active' : ''}`}
              onClick={() => setType(t)}
            >
              {typeLabel(t, isFa)} ({n})
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="empty">{isFa ? 'مقاله‌ای مطابق جستجوی شما یافت نشد.' : 'No publications match your search.'}</p>
      ) : (
        <div>
          {groups.map((g) => (
            <div key={g.yearNum}>
              <h2 className="year-head">
                {g.display || (isFa ? 'بدون سال' : 'No year')}{' '}
                <span className="year-count">({g.items.length})</span>
              </h2>
              {g.items.map((p) => (
                <PaperCard key={p.id} paper={p} isFa={isFa} onOpen={(a) => setSelectedArticle(a)} />
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

/** Latest papers (home page) — like the site's paper-list */
export const LatestPapers = ({ count = 3 }) => {
  const { data, setSelectedArticle } = useData();
  const isFa = data?.siteConfig?.language === 'fa';
  const sorted = useMemo(
    () =>
      [...(data?.articles || [])].sort((a, b) => {
        const ya = parseFloat(toNum(a.year)) || -1;
        const yb = parseFloat(toNum(b.year)) || -1;
        return yb - ya;
      }),
    [data?.articles]
  );
  const latest = sorted.slice(0, count);
  if (!latest.length) return null;

  return (
    <div className="paper-list">
      {latest.map((p) => {
        const title = isFa ? p.titleFa || p.titleEn : p.titleEn || p.titleFa;
        const venue = (isFa ? p.venueFa || p.venueEn : p.venueEn || p.venueFa) || '';
        return (
          <div className="paper-item reveal" key={p.id}>
            <span className="paper-year">
              <bdi dir="ltr">{p.year || '—'}</bdi>
            </span>
            <div className="paper-main">
              <h3>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedArticle(p);
                  }}
                >
                  {title}
                </a>
              </h3>
              {venue && <p className="paper-venue">{venue}</p>}
            </div>
            <span className="badge badge-soft">{typeLabel(p.type, isFa)}</span>
          </div>
        );
      })}
    </div>
  );
};
