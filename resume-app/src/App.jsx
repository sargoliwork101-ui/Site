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
