import React, { Suspense, lazy } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Toast } from './components/common/Toast';
import { ActionDialogModal } from './components/common/ActionDialogModal';
import { HomePage } from './components/pages/HomePage';
import { AboutPage } from './components/pages/AboutPage';
import { WorksPage } from './components/pages/WorksPage';
import { PapersPage } from './components/pages/PapersPage';
import { ContactPage } from './components/pages/ContactPage';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { BoardModal } from './components/modals/BoardModal';
import { ArticleModal } from './components/modals/ArticleModal';
import { BlogModal } from './components/modals/BlogModal';

// Code-split heavy interactive modals & admin modules for maximum initial speed
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
    data,
    isAdminOpen,
    isLoginModalOpen,
    isPdfModalOpen,
    isTemplatePickerOpen,
    currentView,
    route,
    dialogState,
    closeDialog,
  } = useData();

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundColor: 'var(--bg, #f5f7fc)',
        fontFamily: `${data?.siteConfig?.fontFamily || 'Vazirmatn'}, -apple-system, BlinkMacSystemFont, sans-serif`,
      }}
    >
      {/* VIEW SWITCHER: STANDALONE BLOG PORTAL VS PORTFOLIO PAGES */}
      {currentView === 'blog' ? (
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
              {data?.siteConfig?.language === 'fa' ? 'در حال بارگذاری وبلاگ...' : 'Loading Blog Portal...'}
            </div>
          }
        >
          <BlogPortalPage />
        </Suspense>
      ) : (
        <>
          {/* Site header (light sticky) */}
          <Navbar />

          {/* Page router — same pages as the original site */}
          <main className="relative z-10">
            {route === 'about' ? (
              <AboutPage />
            ) : route === 'works' ? (
              <WorksPage />
            ) : route === 'papers' ? (
              <PapersPage />
            ) : route === 'contact' ? (
              <ContactPage />
            ) : (
              <HomePage />
            )}
          </main>

          {/* Site footer */}
          <Footer />
        </>
      )}

      {/* Lightweight Shared Modals */}
      <GlobalSearchModal />
      <BoardModal />
      <ArticleModal />
      <BlogModal />
      <Toast />

      {/* Global Action & Confirmation Dialog */}
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
        primaryColor={data?.siteConfig?.primaryColor || '#4f46e5'}
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
