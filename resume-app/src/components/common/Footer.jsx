import React from 'react';
import { useData } from '../../context/DataContext';
import { toPersianDigits } from '../../utils/numberHelper';
import { sanitizeUrl } from '../../utils/security';
import {
  Cpu,
  FileDown,
  ArrowUp,
  Send,
  Search,
  ShieldCheck,
  Newspaper
} from 'lucide-react';
import { Github, Linkedin } from '../common/BrandIcons';

export const Footer = () => {
  const {
    data,
    currentTemplate,
    setIsPdfModalOpen,
    setIsAdminOpen,
    setIsLoginModalOpen,
    setIsSearchModalOpen,
    navigateToBlog,
    isAuthenticated,
  } = useData();

  const isFa = data?.siteConfig?.language === 'fa';
  const info = data?.personalInfo || {};
  const primaryColor = currentTemplate?.colors?.primary || '#00ffcc';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dynamic nav links
  const quickLinks = [
    { labelFa: 'صفحه اصلی', labelEn: 'Home', href: '#hero', show: true },
    { labelFa: 'بردهای ساخته‌شده', labelEn: 'Hardware Boards', href: '#boards', show: (data.boards || []).length > 0 },
    { labelFa: 'مقالات تخصصی', labelEn: 'Publications', href: '#articles', show: (data.articles || []).length > 0 },
    { labelFa: 'مهارت‌های فنی', labelEn: 'Skill Matrix', href: '#skills', show: (data.skills || []).length > 0 },
    { labelFa: 'سوابق و مدارک', labelEn: 'Experience & Tree', href: '#experience', show: (data.experiences?.length > 0 || data.education?.length > 0 || data.certifications?.length > 0) },
    { labelFa: 'تماس مستقیم', labelEn: 'Contact', href: '#contact', show: true },
  ].filter((l) => l.show);

  return (
    <footer className="relative bg-slate-950 border-t border-slate-900 pt-16 pb-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-900">
          {/* Col 1: Bio / Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-slate-950"
                style={{ backgroundColor: primaryColor }}
              >
                <Cpu className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base">
                {isFa ? info.fullNameFa : info.fullNameEn}
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              {isFa ? info.taglineFa : info.taglineEn}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={sanitizeUrl(info.github)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title="GitHub"
                aria-label="GitHub Profile"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href={sanitizeUrl(info.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title="LinkedIn"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href={sanitizeUrl(info.telegram)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title="Telegram"
                aria-label="Telegram Direct"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Navigation Links */}
          <div className="space-y-2">
            <div className="font-bold text-white text-sm">
              {isFa ? 'بخش‌های سایت' : 'Navigation'}
            </div>
            <ul className="space-y-1.5 text-xs">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="hover:text-cyan-400 transition-colors">
                    {isFa ? link.labelFa : link.labelEn}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Tools & Admin */}
          <div className="space-y-2">
            <div className="font-bold text-white text-sm">
              {isFa ? 'امکانات و مدیریت' : 'Actions & Admin'}
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => navigateToBlog()}
                  title={isFa ? 'ورود به پورتال وبلاگ و مطالعه مقالات تخصصی مهندسی' : 'Open Tech Blog Portal'}
                  className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
                >
                  <Newspaper className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isFa ? 'وبلاگ تخصصی مهندسی' : 'Engineering Blog'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsSearchModalOpen(true)}
                  title={isFa ? 'باز کردن جستجوی یکپارچه هوشمند سایت (Ctrl + K)' : 'Open Global Spotlight Search'}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isFa ? 'جستجوی هوشمند در سایت' : 'Instant Site Search'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(true)}
                  title={isFa ? 'تولید و دانلود فایل نسخه چاپی رزومه به فرمت PDF' : 'Generate & Download PDF CV'}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isFa ? 'دانلود نسخه PDF رزومه' : 'Download PDF Resume'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => (isAuthenticated ? setIsAdminOpen(true) : setIsLoginModalOpen(true))}
                  title={isFa ? 'ورود به محیط مدیریت محتوا، کاربران و امنیت' : 'Admin Panel Login'}
                  className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isFa ? 'ورود به پنل مدیریت' : 'Admin Panel Login'}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & back to top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-slate-400 text-xs">
            {isFa
              ? `تمامی حقوق محفوظ است © ${toPersianDigits(new Date().getFullYear())} ${info.fullNameFa || 'مهندس سخت‌افزار'}`
              : `All rights reserved © ${new Date().getFullYear()} ${info.fullNameEn || 'Hardware Engineer'}`}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-xs"
            >
              <span>{isFa ? 'بازگشت به بالا' : 'Back to Top'}</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
