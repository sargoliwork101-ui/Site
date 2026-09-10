import React from 'react';
import { useData } from '../../context/DataContext';
import { HeroSection } from '../sections/HeroSection';
import { WorksGrid, pickFeaturedWorks } from '../sections/WorksGrid';
import { LatestPapers } from '../sections/PapersList';
import { CountUp, useReveal } from '../theme/Icons';

/**
 * Home page — same composition as the original site:
 * Hero → Intro card → Stats bar → Featured works → Latest papers → CTA band
 */
export const HomePage = () => {
  const { data, setSelectedBoard, navigate } = useData();
  const isFa = data?.siteConfig?.language === 'fa';
  const home = data?.home || {};

  const works = data?.boards || [];
  const papers = data?.articles || [];
  const expCount = (data?.education || []).length + (data?.experiences || []).length;
  const featured = pickFeaturedWorks(works, 3);
  const intro = (isFa ? home.introFa : home.introEn) || '';

  useReveal([data?.siteConfig?.language, works.length, papers.length]);

  return (
    <div className="page-enter">
      <HeroSection />

      {/* Intro card */}
      {intro && (
        <section className="section">
          <div className="container">
            <div className="intro-card reveal">
              <span className="section-tag">Introduction</span>
              <h2 className="section-title">{isFa ? 'معرفی کوتاه' : 'Short Introduction'}</h2>
              <p>{intro}</p>
            </div>
          </div>
        </section>
      )}

      {/* Animated stats bar */}
      <div className="stats-bar">
        <div className="container stats-inner">
          <div className="stat">
            <span className="stat-num">
              <CountUp value={works.length} />
            </span>
            <span>{isFa ? 'نمونه‌کار' : 'Works'}</span>
          </div>
          <div className="stat">
            <span className="stat-num">
              <CountUp value={papers.length} />
            </span>
            <span>{isFa ? 'مقاله و اثر علمی' : 'Publications'}</span>
          </div>
          <div className="stat">
            <span className="stat-num">
              <CountUp value={expCount} />
            </span>
            <span>{isFa ? 'سابقه تحصیلی و شغلی' : 'Academic & Work Records'}</span>
          </div>
        </div>
      </div>

      {/* Featured works */}
      {featured.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head reveal">
              <div>
                <span className="section-tag">Portfolio</span>
                <h2 className="section-title">{isFa ? 'کارهای منتخب' : 'Featured Works'}</h2>
              </div>
              <a className="link-more" href="#/works" onClick={(e) => { e.preventDefault(); navigate('works'); }}>
                {isFa ? 'مشاهده همه ←' : '← View all'}
              </a>
            </div>
            <WorksGrid boards={featured} onOpen={(b) => setSelectedBoard(b)} />
          </div>
        </section>
      )}

      {/* Latest papers */}
      {papers.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="section-head reveal">
              <div>
                <span className="section-tag">Publications</span>
                <h2 className="section-title">{isFa ? 'آخرین مقالات' : 'Latest Publications'}</h2>
              </div>
              <a className="link-more" href="#/papers" onClick={(e) => { e.preventDefault(); navigate('papers'); }}>
                {isFa ? 'همه مقالات ←' : '← All papers'}
              </a>
            </div>
            <LatestPapers count={3} />
          </div>
        </section>
      )}

      {/* CTA band */}
      <section className="cta-band">
        <div className="container cta-inner reveal">
          <h2>{isFa ? 'برای همکاری روی یک پروژه الکترونیک با من در تماس باشید' : 'Let’s work together on an electronics project'}</h2>
          <p>{isFa ? 'آدرس ایمیل، تلگرام و لینک‌های شبکه‌های اجتماعی من در صفحه تماس است.' : 'My email, Telegram and social links are on the contact page.'}</p>
          <button className="btn btn-light" onClick={() => navigate('contact')}>
            {isFa ? 'تماس با من' : 'Contact Me'}
          </button>
        </div>
      </section>
    </div>
  );
};
