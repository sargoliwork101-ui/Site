import React from 'react';
import { useData } from '../../context/DataContext';
import { HeroChipVisual } from '../theme/Icons';

/**
 * Hero — «الکترونیک فید» design ported from the original site
 * (website/views/home.php): status pill, gradient headline, skill chips,
 * animated chip visual with floating stat cards.
 */
export const HeroSection = () => {
  const { data, navigate } = useData();
  const info = data?.personalInfo || {};
  const home = data?.home || {};
  const isFa = data?.siteConfig?.language === 'fa';

  const headline = (isFa ? home.headlineFa : home.headlineEn) || (isFa ? info.fullNameFa : info.fullNameEn);
  const subtitle = (isFa ? home.subtitleFa : home.subtitleEn) || (isFa ? info.taglineFa : info.taglineEn);

  // First four skill names as hero chips (like about.skills slice in the site)
  const skillChips = (data?.skills || [])
    .map((cat) => (cat.items?.[0]?.nameFa || cat.items?.[0]?.name || cat.items?.[0]?.nameEn))
    .filter(Boolean)
    .slice(0, 4);

  const expCount = (data?.education || []).length + (data?.experiences || []).length;

  return (
    <section className="hero">
      <div className="container">
        <div className="hf-grid">
          {/* Text side */}
          <div className="reveal">
            <span className="hero-status">
              <span className="pulse-dot"></span>
              {isFa ? info.statusTextFa || 'در دسترس برای پروژه‌های جدید' : info.statusTextEn || 'Available for new projects'}
            </span>
            <p className="hf-hi">{isFa ? 'سلام 👋' : 'Hello 👋'}</p>
            <h1 className="hf-title">
              <span className="grad">{headline}</span>
            </h1>
            <p className="hf-sub">{subtitle}</p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => navigate('works')}>
                {isFa ? 'مشاهده نمونه‌کارها' : 'View My Works'}
              </button>
              <button className="btn btn-light" onClick={() => navigate('contact')}>
                {isFa ? 'تماس با من' : 'Contact Me'}
              </button>
            </div>
            {skillChips.length > 0 && (
              <div className="hf-skills">
                {skillChips.map((sk, i) => (
                  <span className="hf-chip" key={i}>
                    <span className="hf-chip-dot"></span>
                    <bdi dir="ltr">{sk}</bdi>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Animated chip visual */}
          <div className="hf-visual reveal" aria-hidden="true">
            <div className="hf-glow"></div>
            <HeroChipVisual />
            <div className="hf-float hf-float-1">
              <small>Status · OK</small>
              <b>{isFa ? 'در دسترس برای پروژه‌ها' : 'Available for Projects'}</b>
            </div>
            <div className="hf-float hf-float-2">
              <small>Experience</small>
              <b>
                <span className="hf-big">
                  <bdi dir="ltr">{expCount}</bdi>+
                </span>{' '}
                {isFa ? 'سابقه' : 'Records'}
              </b>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
