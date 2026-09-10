import React from 'react';
import { useData } from '../../context/DataContext';
import { CatIcon } from '../theme/Icons';

/**
 * Work card grid — ported from the site (card-media with category icon +
 * circuit pattern, category badge, title & excerpt). Cards open the rich
 * BoardModal of the app (specs, 3D viewer, protected image view).
 */
export const WorksGrid = ({ boards, onOpen, limit = null }) => {
  const { data } = useData();
  const isFa = data?.siteConfig?.language === 'fa';
  const list = limit ? boards.slice(0, limit) : boards;

  if (!list.length) {
    return <p className="empty">{isFa ? 'هنوز نمونه‌کاری ثبت نشده است.' : 'No works published yet.'}</p>;
  }

  return (
    <div className="cards-grid">
      {list.map((w) => {
        const catLabel = isFa ? w.categoryFa || w.category || 'پروژه' : w.categoryEn || w.category || 'Project';
        const title = isFa ? w.titleFa || w.title : w.titleEn || w.titleFa || w.title;
        const desc = isFa ? w.shortDescFa || w.shortDescEn : w.shortDescEn || w.shortDescFa;
        const excerpt = desc ? (desc.length > 100 ? `${desc.slice(0, 100)}…` : desc) : '';
        return (
          <button
            key={w.id}
            className="card work-card reveal"
            onClick={() => onOpen && onOpen(w)}
            style={{ textAlign: 'start', font: 'inherit', cursor: 'pointer' }}
          >
            <div className="card-media">
              <div className="media-icon">
                <CatIcon label={{ fa: catLabel, en: catLabel }} />
              </div>
              <span className="badge">{catLabel}</span>
            </div>
            <div className="card-body">
              <h3>{title}</h3>
              {excerpt && <p>{excerpt}</p>}
            </div>
          </button>
        );
      })}
    </div>
  );
};

/** Pick up to 3 featured works (site logic: featured first, then fill the rest) */
export const pickFeaturedWorks = (boards, count = 3) => {
  const featured = boards.filter((w) => w.featured);
  if (featured.length >= count) return featured.slice(0, count);
  const rest = boards.filter((w) => !w.featured);
  return [...featured, ...rest].slice(0, count);
};
