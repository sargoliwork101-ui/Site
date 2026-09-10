import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { WorksGrid } from '../sections/WorksGrid';
import { useReveal } from '../theme/Icons';

/**
 * Works page — ported from the site (website/views/works.php):
 * category filter chips (with counts) + card grid.
 * Cards open the app's rich BoardModal (specs, 3D viewer, protected media).
 */
export const WorksPage = () => {
  const { data, setSelectedBoard } = useData();
  const isFa = data?.siteConfig?.language === 'fa';
  const [activeCat, setActiveCat] = useState('all');

  const boards = useMemo(
    () =>
      [...(data?.boards || [])].sort((a, b) => {
        const da = new Date(a.createdDate || 0).getTime();
        const db = new Date(b.createdDate || 0).getTime();
        return db - da;
      }),
    [data?.boards]
  );

  // Category list with counts (site logic)
  const categories = useMemo(() => {
    const map = new Map();
    boards.forEach((w) => {
      const key = isFa ? w.categoryFa || w.category : w.categoryEn || w.category;
      const label = key || (isFa ? 'پروژه' : 'Project');
      const cat = map.get(label) || { label, n: 0 };
      cat.n += 1;
      map.set(label, cat);
    });
    return [...map.values()];
  }, [boards, isFa]);

  const filtered = useMemo(() => {
    if (activeCat === 'all') return boards;
    return boards.filter((w) => {
      const key = isFa ? w.categoryFa || w.category : w.categoryEn || w.category;
      return (key || (isFa ? 'پروژه' : 'Project')) === activeCat;
    });
  }, [boards, activeCat, isFa]);

  useReveal([data?.siteConfig?.language, activeCat]);

  return (
    <div className="page-enter">
      <section className="page-hero">
        <div className="container">
          <span className="section-tag">Portfolio</span>
          <h1>{isFa ? 'نمونه‌کارها' : 'My Works'}</h1>
          <p className="page-sub">{isFa ? 'پروژه‌ها و کارهایی که انجام داده‌ام' : 'Projects and works I have done'}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {categories.length > 0 && (
            <div className="filters">
              <button className={`chip filter ${activeCat === 'all' ? 'active' : ''}`} onClick={() => setActiveCat('all')}>
                {isFa ? 'همه' : 'All'} ({boards.length})
              </button>
              {categories.map((c) => (
                <button
                  key={c.label}
                  className={`chip filter ${activeCat === c.label ? 'active' : ''}`}
                  onClick={() => setActiveCat(c.label)}
                >
                  {c.label} ({c.n})
                </button>
              ))}
            </div>
          )}
          <WorksGrid boards={filtered} onOpen={(b) => setSelectedBoard(b)} />
        </div>
      </section>
    </div>
  );
};
