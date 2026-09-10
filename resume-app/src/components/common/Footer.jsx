import React from 'react';
import { useData } from '../../context/DataContext';
import { Github, Linkedin } from './BrandIcons';

/**
 * Site footer — dark navy strip ported from the original site
 * (.site-footer) + quick navigation & socials.
 */
export const Footer = () => {
  const { data, navigate, navigateToBlog, setIsPdfModalOpen, setIsSearchModalOpen } = useData();
  const isFa = data?.siteConfig?.language === 'fa';
  const info = data?.personalInfo || {};
  const cfg = data?.siteConfig || {};

  const links = [
    { labelFa: 'خانه', labelEn: 'Home', page: 'home' },
    { labelFa: 'درباره من', labelEn: 'About', page: 'about' },
    { labelFa: 'نمونه‌کارها', labelEn: 'Works', page: 'works', show: (data?.boards || []).length > 0 },
    { labelFa: 'مقالات علمی', labelEn: 'Publications', page: 'papers', show: (data?.articles || []).length > 0 },
    { labelFa: 'وبلاگ', labelEn: 'Blog', page: 'blog' },
    { labelFa: 'تماس', labelEn: 'Contact', page: 'contact' },
  ].filter((l) => l.show !== false);

  const socials = [
    { label: 'GitHub', url: info.github, icon: Github },
    { label: 'LinkedIn', url: info.linkedin, icon: Linkedin },
    { label: 'ORCID', url: info.orcid },
    { label: 'Scholar', url: info.scholar },
    { label: 'Telegram', url: info.telegram },
  ].filter((s) => s.url);

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="brand-mark" style={{ width: 28, height: 28, fontSize: 14, borderRadius: 9 }}>
            {(info.fullNameFa || 'م')[0]}
          </span>
          <span>{isFa ? info.fullNameFa : info.fullNameEn}</span>
        </div>

        <nav className="footer-nav">
          {links.map((l) => (
            <a
              key={l.page}
              href={`#/${l.page === 'home' ? '' : l.page === 'blog' ? 'blog' : l.page}`}
              onClick={(e) => {
                e.preventDefault();
                if (l.page === 'blog') navigateToBlog();
                else navigate(l.page);
              }}
            >
              {isFa ? l.labelFa : l.labelEn}
            </a>
          ))}
        </nav>

        <div className="socials" style={{ marginTop: 0 }}>
          {socials.map((s) => {
            const Icon = s.icon;
            return Icon ? (
              <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                <Icon className="w-4 h-4" />
              </a>
            ) : (
              <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer">
                {s.label}
              </a>
            );
          })}
        </div>
      </div>
      <div className="container" style={{ marginTop: 14, opacity: 0.75 }}>
        <span>© {new Date().getFullYear()} — {isFa ? cfg.footerTextFa || 'تمامی حقوق این وب‌سایت محفوظ است.' : cfg.footerTextEn || 'All rights reserved.'}</span>
      </div>
    </footer>
  );
};
