/**
 * ═══════════════════════════════════════════════════════════════════
 * App.jsx — اسکلت و نقشه کل سایت (Layout + Router + Modal wiring)
 * ═══════════════════════════════════════════════════════════════════
 * این فایل چیه؟ چیدمان کلی صفحه: نوبار، ۶ سکشن صفحه اول، فوتر، و همه
 *   مودال‌ها + سوییچ نمای «پورتفولیو / وبلاگ» این‌جا سرهم‌بندی شدن.
 * کِی بازش کن؟
 *   • اضافه کردن سکشن جدید به صفحه اول → ایمپورت + گذاشتن داخل <main>
 *   • اضافه کردن مودال جدید → lazy import + رندر شرطی داخل <Suspense>
 * به چی وصله؟ همه‌چیز از DataContext میاد (useData)؛ خودش state نداره.
 * ⚠️ مودال‌های سنگین عمداً lazy هستن (سرعت لود اول) — مستقیم ایمپورت نکن.
 *   ترتیب لایه‌ها: پس‌زمینه کانوس ← محتوا ← مودال‌ها ← Toast ← دیالوگ سراسری.
 */
import React, { Suspense, lazy } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { BackgroundCanvas } from './components/common/BackgroundCanvas';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Toast } from './components/common/Toast';
import { ActionDialogModal } from './components/common/ActionDialogModal';
import { HeroSection } from './components/sections/HeroSection';
import { BoardsSection } from './components/sections/BoardsSection';
import { ArticlesSection } from './components/sections/ArticlesSection';
import { SkillsSection } from './components/sections/SkillsSection';
import { ExperienceSection } from './components/sections/ExperienceSection';
import { ContactSection } from './components/sections/ContactSection';
// Code-split heavy interactive modals & admin modules for maximum initial speed
const GlobalSearchModal = lazy(() =>
  import('./components/modals/GlobalSearchModal').then((m) => ({ default: m.GlobalSearchModal }))
);
const BoardModal = lazy(() =>
  import('./components/modals/BoardModal').then((m) => ({ default: m.BoardModal }))
);
const ArticleModal = lazy(() =>
  import('./components/modals/ArticleModal').then((m) => ({ default: m.ArticleModal }))
);
const BlogModal = lazy(() =>
  import('./components/modals/BlogModal').then((m) => ({ default: m.BlogModal }))
);
const TemplatePickerModal = lazy(() =>
  import('./components/modals/TemplatePickerModal').then((m) => ({ default: m.TemplatePickerModal }))
);
const PdfResumeModal = lazy(() =>
  import('./components/modals/PdfResumeModal').then((m) => ({ default: m.PdfResumeModal }))
);
const BlogPortalPage = lazy(() =>
  import('./components/blog/BlogPortalPage').then((m) => ({ default: m.BlogPortalPage }))
);
const AdminLoginModal = lazy(() =>
  import('./components/modals/AdminLoginModal').then((m) => ({ default: m.AdminLoginModal }))
);
const AdminPanel = lazy(() =>
  import('./components/admin/AdminPanel').then((m) => ({ default: m.AdminPanel }))
);

// Shown while the (heavy, code-split) AdminPanel chunk downloads after a
// successful login — so the user SEES progress instead of a dead gap.
const PanelBootLoader = () => {
  const { data } = useData();
  const isFa = data?.siteConfig?.language === 'fa';
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="w-72 space-y-4 text-center">
        <div className="text-sm font-bold text-white">
          {isFa ? 'در حال باز کردن پنل مدیریت...' : 'Opening admin panel...'}
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden" dir="ltr">
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 animate-panel-boot" />
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          {isFa ? 'لطفاً چند لحظه صبر کنید' : 'Loading admin workspace...'}
        </div>
      </div>
    </div>
  );
};

function MainLayout() {
  const {
    currentTemplate,
    data,
    isAdminOpen,
    isLoginModalOpen,
    isPdfModalOpen,
    isTemplatePickerOpen,
    isSearchModalOpen,
    selectedBoard,
    selectedArticle,
    isBlogModalOpen,
    currentView,
    dialogState,
    closeDialog
  } = useData();

  const currentBg = currentTemplate?.colors?.bg || '#080d1a';
  const fontFamily = data?.siteConfig?.fontFamily || 'Vazirmatn';
  // Vazirmatn is bundled locally and always available → use it as the guaranteed
  // fallback so templates using non-bundled fonts (Sahel/Shabnam/Estedad) still
  // render Persian correctly instead of falling back to a system font.
  const fontStack = `'${fontFamily}', 'Vazirmatn', Tahoma, -apple-system, BlinkMacSystemFont, sans-serif`;

  return (
    <div
      className="min-h-screen relative text-slate-100 transition-colors duration-700 bg-slate-950"
      style={{
        backgroundColor: currentBg,
        fontFamily: fontStack,
      }}
    >
      {/* Dynamic Background Canvas (PCB Traces, Stars, Matrix code, Aurora) */}
      <BackgroundCanvas />

      {/* VIEW SWITCHER: STANDALONE BLOG PORTAL VS PORTFOLIO HOME */}
      {currentView === 'blog' ? (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-cyan-400 font-mono text-sm">Loading Blog Portal...</div>}>
          <BlogPortalPage />
        </Suspense>
      ) : (
        <>
          {/* Main Portfolio Navigation Header */}
          <Navbar />

          {/* Main Portfolio Sections */}
          <main className="relative z-10">
            <HeroSection />
            <BoardsSection />
            <ArticlesSection />
            <SkillsSection />
            <ExperienceSection />
            <ContactSection />
          </main>

          {/* Main Portfolio Footer */}
          <Footer />
        </>
      )}

      {/* Lazy Shared Modals (code-split; mounted only when opened) */}
      <Suspense fallback={null}>
        {isSearchModalOpen && <GlobalSearchModal />}
        {selectedBoard && <BoardModal />}
        {selectedArticle && <ArticleModal />}
        {isBlogModalOpen && <BlogModal />}
      </Suspense>
      <Toast />

      {/* Global Persian Action & Confirmation Dialog Modal */}
      <ActionDialogModal
        isOpen={dialogState?.isOpen || false}
        type={dialogState?.type || 'confirm'}
        title={dialogState?.title || ''}
        message={dialogState?.message || ''}
        confirmText={dialogState?.confirmText || ''}
        cancelText={dialogState?.cancelText || ''}
        onConfirm={dialogState?.onConfirm}
        onCancel={dialogState?.onCancel || closeDialog}
        isFa={data?.siteConfig?.language === 'fa'}
        primaryColor={currentTemplate?.colors?.primary || '#00ffcc'}
      />

      {/* Code-Split Lazy Modals (Loaded on-demand when requested) */}
      <Suspense fallback={null}>
        {isTemplatePickerOpen && <TemplatePickerModal />}
        {isPdfModalOpen && <PdfResumeModal />}
        {isLoginModalOpen && <AdminLoginModal />}
      </Suspense>
      {/* Admin workspace gets its own loader: the chunk is heavy (~300KB). */}
      <Suspense fallback={<PanelBootLoader />}>
        {isAdminOpen && <AdminPanel />}
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <DataProvider>
        <MainLayout />
      </DataProvider>
    </ErrorBoundary>
  );
}
