import React from 'react';
import { useData } from '../../context/DataContext';
import { PapersPageContent } from '../sections/PapersList';
import { useReveal } from '../theme/Icons';

/**
 * Scientific papers page — ported from the site (website/views/papers.php):
 * live search + type filters + year-grouped publication cards (DOI / PDF).
 */
export const PapersPage = () => {
  const { data } = useData();
  const isFa = data?.siteConfig?.language === 'fa';
  useReveal([data?.siteConfig?.language]);

  return (
    <div className="page-enter">
      <section className="page-hero">
        <div className="container">
          <h1>{isFa ? 'مقالات علمی' : 'Scientific Publications'}</h1>
          <p className="page-sub">
            {isFa
              ? 'مقالات، پایان‌نامه‌ها و آثار پژوهشی — مرتب بر اساس سال'
              : 'Papers, theses and research works — grouped by year'}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <PapersPageContent />
        </div>
      </section>
    </div>
  );
};
