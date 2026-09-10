import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { FileDown, Menu, ShieldCheck, Search } from 'lucide-react';

/**
 * Site header — light sticky glass header ported from the original site
 * (website/includes/header.php) + app actions (global search, PDF resume, admin).
 */
export const Navbar = () => {
  const {
    data,
    route,
    navigate,
    setIsPdfModalOpen,
    setIsLoginModalOpen,
    setIsAdminOpen,
    setIsSearchModalOpen,
    navigateToBlog,
    isAuthenticated,
    toggleLanguage,
  } = useData();

  const [mobileOpen, setMobileOpen] = useState(false);

  const lang = data?.siteConfig?.language || 'fa';
  const isFa = lang === 'fa';
  const other = isFa ? 'en' : 'fa';
  const info = data?.personalInfo || {};

  // Dynamic navigation — a link is only shown when its section has content
  const navItems = [
    { id: 'home', labelFa: 'خانه', labelEn: 'Home', page: 'home', show: true },
    { id: 'about', labelFa: 'درباره من', labelEn: 'About', page: 'about', show: true },
    {
      id: 'works',
      labelFa: 'نمونه‌کارها',
      labelEn: 'Works',
      page: 'works',
      show: (data?.boards || []).length > 0,
    },
    {
      id: 'papers',
      labelFa: 'مقالات علمی',
      labelEn: 'Publications',
      page: 'papers',
      show: (data?.articles || []).length > 0,
    },
    { id: 'contact', labelFa: 'تماس', labelEn: 'Contact', page: 'contact', show: true },
  ].filter((l) => l.show);

  const activePage = route || 'home';

  const go = (page) => {
    setMobileOpen(false);
    if (page === 'blog') {
      navigateToBlog();
      return;
    }
    navigate(page);
  };

  const handleAdminClick = () => {
    setMobileOpen(false);
    if (isAuthenticated) setIsAdminOpen(true);
    else setIsLoginModalOpen(true);
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        {/* Brand */}
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go('home');
          }}
        >
          <span className="brand-mark">{(info.fullNameFa || 'م')[0]}</span>
          <span className="brand-name">{isFa ? info.fullNameFa : info.fullNameEn || 'Site'}</span>
        </a>

        {/* Desktop nav */}
        <nav className="nav" id="nav" style={mobileOpen ? { display: 'flex' } : undefined}>
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#/${item.page === 'home' ? '' : item.page}`}
              onClick={(e) => {
                e.preventDefault();
                go(item.page);
              }}
              className={item.id === activePage ? 'active' : ''}
            >
              {isFa ? item.labelFa : item.labelEn}
            </a>
          ))}
          <a
            href="#blog"
            onClick={(e) => {
              e.preventDefault();
              go('blog');
            }}
            className={activePage === 'blog' ? 'active' : ''}
          >
            {isFa ? 'وبلاگ' : 'Blog'}
          </a>
        </nav>

        {/* Header end: app actions + language switch */}
        <div className="header-end">
          <button
            className="icon-btn"
            data-tip={isFa ? 'جستجوی سراسری (Ctrl+K)' : 'Global Search (Ctrl+K)'}
            onClick={() => setIsSearchModalOpen(true)}
            aria-label="Global Search"
          >
            <Search />
          </button>
          <button
            className="icon-btn"
            data-tip={isFa ? 'دانلود رزومه (PDF)' : 'Download Resume (PDF)'}
            onClick={() => setIsPdfModalOpen(true)}
            aria-label="Download Resume"
          >
            <FileDown />
          </button>
          <button
            className="icon-btn"
            data-tip={isFa ? 'پنل مدیریت' : 'Admin Panel'}
            onClick={handleAdminClick}
            aria-label="Admin"
          >
            <ShieldCheck />
          </button>
          <button
            className="lang-switch"
            onClick={toggleLanguage}
            title="Language"
          >
            <span className="lang-icon">🌐</span>
            <span>{other === 'en' ? 'EN' : 'فارسی'}</span>
          </button>
          <button
            className="nav-toggle"
            id="navToggle"
            aria-label="Menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <XIcon /> : <><span /><span /><span /></>}
          </button>
        </div>
      </div>
    </header>
  );
};

const XIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
