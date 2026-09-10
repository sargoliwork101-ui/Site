/**
 * ============================================================================
 * DATA CONTEXT & STATE MANAGEMENT (Central Data Hub)
 * ============================================================================
 * 
 * This module manages:
 * 1. Bilingual application database (Hardware Boards, Articles, Skills, Experience, Media)
 * 2. Multi-User Authentication with Role-Based Access Control (RBAC) & Granular Permissions
 * 3. Super Admin & User Management (admin / editor / author / viewer / custom)
 * 4. Password Recovery & OTP Email Verification
 * 5. Featured Hero Project (پروژه شاخص) state & toggles
 * 6. Site-wide template styling, live theme switching, and language states
 * 7. Automated JSON Snapshots, Full Backup/Restore, and Rate-Limited Contact Forms
 *
 * @module DataContext
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initialData } from '../data/defaultData';
import { TEMPLATES, TEMPLATES_MAP, DEFAULT_TEMPLATE } from '../data/templates';
import { autoTranslateFaToEn } from '../utils/translatorHelper';
import {
  sanitizeText,
  validateEmail,
  sanitizeFileName,
  sanitizeBackupPayload,
  loginRateLimiter,
  contactRateLimiter,
  otpRateLimiter,
  triggerSafeDownload,
  hashPasswordLocal,
  verifyPasswordLocal,
  isLocalPasswordHash
} from '../utils/security';
import {
  fetchServerStatus,
  serverSetup,
  serverVerifySetupOtp,
  serverSkipSetupVerify,
  serverLogin,
  serverLogout,
  serverRequestOtp,
  serverVerifyOtp,
  serverResetPassword,
  serverChangePassword,
  serverRequestEmailChange,
  serverConfirmEmailChange,
  serverAccount,
  serverBackupSave
} from '../utils/serverAuth';

const DataContext = createContext(null);

// LocalStorage Persistence Keys
const STORAGE_KEY = 'embedded_portfolio_data_v2';
const SNAPSHOTS_KEY = 'embedded_portfolio_snapshots_v2';
const AUTO_BACKUP_KEY = 'embedded_auto_backup_v1';
const MAX_AUTO_SNAPSHOTS = 5; // auto snapshots kept (manual ones are never pruned)
const MAX_MANUAL_SNAPSHOTS = 20;
const FULL_BACKUP_VERSION = '4.0.0-FULLSITE';
const AUTH_KEY = 'embedded_admin_auth_token';
const ADMIN_PASSWORD_KEY = 'embedded_admin_pwd';

// SECURITY: the login flag + current user live in sessionStorage (cleared when
// the tab closes) — never in persistent localStorage. On real hosting the
// server-side PHP session is the source of truth; this is only a UI mirror.
const sessionGet = (k) => {
  try { return sessionStorage.getItem(k); } catch (e) { return null; }
};
const sessionSet = (k, v) => {
  try { sessionStorage.setItem(k, v); } catch (e) { /* private mode */ }
};
const sessionDel = (k) => {
  try { sessionStorage.removeItem(k); } catch (e) { /* private mode */ }
};
const ADMIN_SECURITY_KEY = 'embedded_admin_security_v3';
const USERS_KEY = 'embedded_portfolio_users_v3';
const CURRENT_USER_KEY = 'embedded_portfolio_current_user_v3';

// ============================================================================
// ROLE DEFINITIONS & GRANULAR PERMISSION MATRIX
// ============================================================================
export const ROLE_DEFINITIONS = {
  super_admin: {
    id: 'super_admin',
    labelFa: 'مدیر ارشد (Super Admin)',
    labelEn: 'Super Administrator',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    icon: '👑',
    descriptionFa: 'دسترسی کامل و نامحدود به تمامی بخش‌ها، تنظیمات امنیتی، قالب‌ها، مدیریت کاربران و بکاپ‌ها',
    descriptionEn: 'Full unrestricted access to all modules, security, users, backups, and templates',
    defaultPermissions: {
      canManageBoards: true,
      canManageArticles: true,
      canManageSkills: true,
      canManageExperience: true,
      canManageEducation: true,
      canManageContact: true,
      canManageTaxonomies: true,
      canManageTemplates: true,
      canManageBackups: true,
      canManageUsers: true,
      canManageSecurity: true,
    }
  },
  admin: {
    id: 'admin',
    labelFa: 'مدیر سیستم (Admin)',
    labelEn: 'Administrator',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    icon: '🛡️',
    descriptionFa: 'مدیریت محتوا، قالب‌ها، دسته‌بندی‌ها و کاربران (بدون امکان تغییر کلیدهای سطح اول امنیتی)',
    descriptionEn: 'Manage content, templates, taxonomies, and users',
    defaultPermissions: {
      canManageBoards: true,
      canManageArticles: true,
      canManageSkills: true,
      canManageExperience: true,
      canManageEducation: true,
      canManageContact: true,
      canManageTaxonomies: true,
      canManageTemplates: true,
      canManageBackups: true,
      canManageUsers: true,
      canManageSecurity: false,
    }
  },
  editor: {
    id: 'editor',
    labelFa: 'ویرایشگر محتوا (Editor)',
    labelEn: 'Content Editor',
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    icon: '✍️',
    descriptionFa: 'ایجاد و ویرایش بردهای سخت‌افزاری، مقالات تخصصی، مهارت‌ها، سوابق شغلی و مشاهده پیام‌ها',
    descriptionEn: 'Create and edit boards, articles, skills, experience, and view messages',
    defaultPermissions: {
      canManageBoards: true,
      canManageArticles: true,
      canManageSkills: true,
      canManageExperience: true,
      canManageEducation: true,
      canManageContact: true,
      canManageTaxonomies: true,
      canManageTemplates: false,
      canManageBackups: false,
      canManageUsers: false,
      canManageSecurity: false,
    }
  },
  author: {
    id: 'author',
    labelFa: 'نویسنده / مهندس (Author)',
    labelEn: 'Author / Hardware Engineer',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    icon: '🔧',
    descriptionFa: 'فقط درج و ویرایش بردهای سخت‌افزاری و نگارش مقالات علمی مهندسی',
    descriptionEn: 'Only create and edit hardware boards and technical publications',
    defaultPermissions: {
      canManageBoards: true,
      canManageArticles: true,
      canManageSkills: false,
      canManageExperience: false,
      canManageEducation: false,
      canManageContact: false,
      canManageTaxonomies: false,
      canManageTemplates: false,
      canManageBackups: false,
      canManageUsers: false,
      canManageSecurity: false,
    }
  },
  viewer: {
    id: 'viewer',
    labelFa: 'ناظر (Viewer / Read-Only)',
    labelEn: 'Viewer (Read-Only)',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    icon: '👁️',
    descriptionFa: 'فقط مشاهده و بررسی آماری پنل و پیش‌نمایش پیش‌نویس‌ها بدون امکان تغییر داده‌ها',
    descriptionEn: 'Read-only view of admin panel, metrics, and drafts without edit permissions',
    defaultPermissions: {
      canManageBoards: false,
      canManageArticles: false,
      canManageSkills: false,
      canManageExperience: false,
      canManageEducation: false,
      canManageContact: false,
      canManageTaxonomies: false,
      canManageTemplates: false,
      canManageBackups: false,
      canManageUsers: false,
      canManageSecurity: false,
    }
  },
  custom: {
    id: 'custom',
    labelFa: 'نقش سفارشی (Custom)',
    labelEn: 'Custom Granular Role',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    icon: '⚙️',
    descriptionFa: 'تعیین دستی و دقیق تک‌تک دسترسی‌های مجاز برای کاربر',
    descriptionEn: 'Manually customized granular permission flags',
    defaultPermissions: {
      canManageBoards: false,
      canManageArticles: false,
      canManageSkills: false,
      canManageExperience: false,
      canManageEducation: false,
      canManageContact: false,
      canManageTaxonomies: false,
      canManageTemplates: false,
      canManageBackups: false,
      canManageUsers: false,
      canManageSecurity: false,
    }
  }
};

// Initial default users for testing and production
export const DEFAULT_USERS = [
  {
    id: 'user-admin',
    username: 'admin',
    password: 'admin',
    nameFa: 'مدیر ارشد سامانه (Super Admin)',
    nameEn: 'Super Administrator',
    email: 'admin@electronic-embedded.com',
    role: 'super_admin',
    status: 'active',
    isPrimary: true,
    avatar: '👑',
    createdAt: '2024-01-01',
    lastLogin: 'هم‌اکنون (فعال)',
    permissions: {
      canManageBoards: true,
      canManageArticles: true,
      canManageSkills: true,
      canManageExperience: true,
      canManageEducation: true,
      canManageContact: true,
      canManageTaxonomies: true,
      canManageTemplates: true,
      canManageBackups: true,
      canManageUsers: true,
      canManageSecurity: true,
    }
  },
  {
    id: 'user-editor',
    username: 'editor',
    password: 'editor123',
    nameFa: 'سارا راد (ویرایشگر محتوا)',
    nameEn: 'Sara Rad (Content Editor)',
    email: 'editor@electronic-embedded.com',
    role: 'editor',
    status: 'active',
    isPrimary: false,
    avatar: '✍️',
    createdAt: '2024-03-15',
    lastLogin: '۲ ساعت پیش',
    permissions: {
      canManageBoards: true,
      canManageArticles: true,
      canManageSkills: true,
      canManageExperience: true,
      canManageEducation: true,
      canManageContact: true,
      canManageTaxonomies: true,
      canManageTemplates: false,
      canManageBackups: false,
      canManageUsers: false,
      canManageSecurity: false,
    }
  },
  {
    id: 'user-engineer',
    username: 'engineer',
    password: 'engineer123',
    nameFa: 'مهندس نوید پویا (طراح سخت‌افزار)',
    nameEn: 'Navid Pouya (Hardware Designer)',
    email: 'navid.hw@electronic-embedded.com',
    role: 'author',
    status: 'active',
    isPrimary: false,
    avatar: '🔧',
    createdAt: '2024-04-10',
    lastLogin: 'دیروز',
    permissions: {
      canManageBoards: true,
      canManageArticles: true,
      canManageSkills: false,
      canManageExperience: false,
      canManageEducation: false,
      canManageContact: false,
      canManageTaxonomies: false,
      canManageTemplates: false,
      canManageBackups: false,
      canManageUsers: false,
      canManageSecurity: false,
    }
  },
  {
    id: 'user-viewer',
    username: 'viewer',
    password: 'viewer123',
    nameFa: 'کاربر ناظر (فقط مشاهده)',
    nameEn: 'System Auditor (Viewer)',
    email: 'viewer@electronic-embedded.com',
    role: 'viewer',
    status: 'active',
    isPrimary: false,
    avatar: '👁️',
    createdAt: '2024-05-01',
    lastLogin: '۳ روز پیش',
    permissions: {
      canManageBoards: false,
      canManageArticles: false,
      canManageSkills: false,
      canManageExperience: false,
      canManageEducation: false,
      canManageContact: false,
      canManageTaxonomies: false,
      canManageTemplates: false,
      canManageBackups: false,
      canManageUsers: false,
      canManageSecurity: false,
    }
  }
];

// Initial default media items in Media Library
const initialMedia = [
  {
    id: 'media-1',
    name: 'RT-Gateway_PCB_Top.jpg',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    type: 'image/jpeg',
    size: '245 KB',
    date: '۱۴۰۳/۰۵/۰۱',
    category: 'بردهای الکترونیکی'
  },
  {
    id: 'media-2',
    name: 'FPGA_DSP_Board.jpg',
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    type: 'image/jpeg',
    size: '310 KB',
    date: '۱۴۰۳/۰۴/۱۵',
    category: 'بردهای الکترونیکی'
  },
  {
    id: 'media-3',
    name: 'BMS_48V_Industrial.jpg',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    type: 'image/jpeg',
    size: '190 KB',
    date: '۱۴۰۳/۰۳/۲۰',
    category: 'بردهای الکترونیکی'
  },
  {
    id: 'media-4',
    name: 'Drone_FC_Nano.jpg',
    url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
    type: 'image/jpeg',
    size: '280 KB',
    date: '۱۴۰۳/۰۲/۱۰',
    category: 'بردهای الکترونیکی'
  }
];

export const DataProvider = ({ children }) => {
  // --------------------------------------------------------------------------
  // 1. DATA STATE INITIALIZATION & HYDRATION
  // --------------------------------------------------------------------------
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const cleanParsed = sanitizeBackupPayload(parsed);
        const mergedBoards = (cleanParsed.boards && cleanParsed.boards.length >= initialData.boards.length)
          ? cleanParsed.boards
          : initialData.boards;
        const mergedArticles = (cleanParsed.articles && cleanParsed.articles.length >= initialData.articles.length)
          ? cleanParsed.articles
          : initialData.articles;
        const mergedExperiences = (cleanParsed.experiences && cleanParsed.experiences.length >= initialData.experiences.length)
          ? cleanParsed.experiences
          : initialData.experiences;
        const mergedSkills = (cleanParsed.skills && cleanParsed.skills.length >= initialData.skills.length)
          ? cleanParsed.skills
          : initialData.skills;
        const mergedBlogPosts = (cleanParsed.blogPosts && cleanParsed.blogPosts.length > 0)
          ? cleanParsed.blogPosts
          : (initialData.blogPosts || []);
        const mergedTaxonomies = {
          ...initialData.taxonomies,
          ...(cleanParsed.taxonomies || {}),
          boardCategories: (cleanParsed.taxonomies?.boardCategories?.length >= (initialData.taxonomies?.boardCategories?.length || 0))
            ? cleanParsed.taxonomies.boardCategories
            : initialData.taxonomies.boardCategories,
          articleCategories: (cleanParsed.taxonomies?.articleCategories?.length >= (initialData.taxonomies?.articleCategories?.length || 0))
            ? cleanParsed.taxonomies.articleCategories
            : initialData.taxonomies.articleCategories,
          boardStatuses: (cleanParsed.taxonomies?.boardStatuses?.length >= (initialData.taxonomies?.boardStatuses?.length || 0))
            ? cleanParsed.taxonomies.boardStatuses
            : initialData.taxonomies.boardStatuses,
          edaTools: (cleanParsed.taxonomies?.edaTools?.length >= (initialData.taxonomies?.edaTools?.length || 0))
            ? cleanParsed.taxonomies.edaTools
            : initialData.taxonomies.edaTools,
        };

        return {
          ...initialData,
          ...cleanParsed,
          siteConfig: {
            ...initialData.siteConfig,
            ...(cleanParsed.siteConfig || {}),
          },
          personalInfo: {
            ...initialData.personalInfo,
            ...(cleanParsed.personalInfo || {}),
          },
          seoSettings: {
            ...initialData.seoSettings,
            ...(cleanParsed.seoSettings || {}),
          },
          boards: mergedBoards,
          articles: mergedArticles,
          blogPosts: mergedBlogPosts,
          experiences: mergedExperiences,
          skills: mergedSkills,
          taxonomies: mergedTaxonomies,
          mediaLibrary: cleanParsed.mediaLibrary && cleanParsed.mediaLibrary.length > 0
            ? cleanParsed.mediaLibrary
            : initialMedia,
          messages: cleanParsed.messages || initialData.messages || [],
        };
      }
    } catch (e) {
      console.error('Failed to load local storage data', e);
    }
    return {
      ...initialData,
      blogPosts: initialData.blogPosts || [],
      mediaLibrary: initialMedia,
    };
  });

  // --------------------------------------------------------------------------
  // 2. SNAPSHOTS / REVISION HISTORY STATE
  // --------------------------------------------------------------------------
  const [snapshots, setSnapshots] = useState(() => {
    try {
      const saved = localStorage.getItem(SNAPSHOTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load snapshots', e);
    }
    return [
      {
        id: 'snap-initial',
        name: 'نسخه اولیه سیستم (پیش‌فرض)',
        date: '۱۴۰۳/۰۶/۰۱ - ۱۲:۰۰',
        timestamp: Date.now() - 86400000,
        boardsCount: initialData.boards?.length || 4,
        articlesCount: initialData.articles?.length || 2,
        skillsCount: initialData.skills?.length || 4,
        mediaCount: initialMedia.length,
        data: initialData,
      }
    ];
  });

  // --------------------------------------------------------------------------
  // 3. ADMIN SECURITY & PASSWORD RECOVERY STATE
  // --------------------------------------------------------------------------
  const [adminSecurity, setAdminSecurity] = useState(() => {
    try {
      const saved = localStorage.getItem(ADMIN_SECURITY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // SECURITY: OTP material is NEVER restored from storage (memory-only).
        if (parsed && typeof parsed === 'object') {
          parsed.activeOtp = null;
          parsed.otpExpiresAt = null;
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse admin security', e);
    }

    const savedPassword = localStorage.getItem(ADMIN_PASSWORD_KEY) || 'admin';
    return {
      password: savedPassword,
      recoveryEmail: initialData.personalInfo?.email || 'arash.taheri.hardware@gmail.com',
      isEmailVerified: true,
      isFirstTimeSetupComplete: true,
      activeOtp: null,
      otpExpiresAt: null,
    };
  });

  // --------------------------------------------------------------------------
  // 4. MULTI-USER & RBAC STATE
  // --------------------------------------------------------------------------
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem(USERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasAdmin = parsed.some((u) => u.username === 'admin');
          if (!hasAdmin) {
            return [...DEFAULT_USERS, ...parsed];
          }
          return parsed.map((u) => {
            if (u.username === 'admin') {
              return { ...u, password: u.password || 'admin', isPrimary: true };
            }
            return u;
          });
        }
      }
    } catch (e) {
      console.error('Failed to parse users', e);
    }
    return DEFAULT_USERS;
  });

  // Currently Authenticated User Profile
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionGet(CURRENT_USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.error('Failed to parse current user', e);
    }
    return null;
  });

  // Authentication State (tab-scoped; server session is truth on real hosting)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionGet(AUTH_KEY) === 'true';
  });

  // Active Modals state
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState(null);

  // Global Action Dialog Modal State (for confirm, alerts, warnings, deletion notices)
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: 'confirm', // 'danger' | 'warning' | 'error' | 'success' | 'info' | 'confirm'
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    onConfirm: null,
    onCancel: null,
  });

  const closeDialog = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  const showConfirmDialog = ({
    title,
    message,
    type = 'danger',
    confirmText,
    cancelText,
    onConfirm,
    onCancel
  }) => {
    setDialogState({
      isOpen: true,
      type,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: () => {
        closeDialog();
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        closeDialog();
        if (onCancel) onCancel();
      },
    });
  };

  const showAlertDialog = ({
    title,
    message,
    type = 'info',
    confirmText,
    onConfirm
  }) => {
    setDialogState({
      isOpen: true,
      type,
      title,
      message,
      confirmText,
      cancelText: '',
      onConfirm: () => {
        closeDialog();
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        closeDialog();
      },
    });
  };

  // Standalone Sub-Portal / Page View Router ('portfolio' | 'blog')
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#blog')) {
      return 'blog';
    }
    return 'portfolio';
  });

  // Dedicated Route Navigation Helpers
  const navigateToBlog = (slug = null) => {
    setCurrentView('blog');
    if (slug) {
      window.location.hash = `#blog/${slug}`;
      const found = (data?.blogPosts || []).find((p) => p.slug === slug || p.id === slug);
      if (found) setSelectedBlogPost(found);
    } else {
      window.location.hash = '#blog';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPortfolio = (section = 'hero') => {
    setCurrentView('portfolio');
    setSelectedBlogPost(null);
    window.location.hash = `#${section}`;
    setTimeout(() => {
      const el = document.getElementById(section);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  // URL Hash Synchronizer for seamless SPA navigation
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#blog')) {
        setCurrentView('blog');
        const parts = hash.split('/');
        if (parts.length > 1 && parts[1]) {
          const slug = parts[1];
          const found = (data?.blogPosts || []).find((p) => p.slug === slug || p.id === slug);
          if (found) setSelectedBlogPost(found);
        }
      } else {
        setCurrentView('portfolio');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [data?.blogPosts]);

  // Toast notifications (queue, max 3 stacked — rapid actions never eat each other)
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  // Show Toast notification helper (type: 'success' | 'error' | 'warning' | 'info')
  const showToast = (message, type = 'success') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev.slice(-2), { message, type, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, type === 'error' ? 6000 : 4000);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Persist data whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to persist data', e);
    }
  }, [data]);

  // Persist snapshots (quota-aware: warn once per session, never crash)
  useEffect(() => {
    try {
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots));
    } catch (e) {
      console.error('Failed to persist snapshots', e);
      if (!quotaWarnedRef.current) {
        quotaWarnedRef.current = true;
        showToast('⚠️ حافظه مرورگر پر شد! فایل بک‌آپ را دانلود کنید و نسخه‌های قدیمی را حذف کنید.', 'error');
      }
    }
  }, [snapshots]);

  // Persist admin security — WITHOUT secrets (no OTP, no plaintext password).
  // Passwords live hashed in `users`; OTP/reset tokens live server-side or in
  // memory only. This blocks localStorage theft from yielding credentials.
  useEffect(() => {
    try {
      const { activeOtp, otpExpiresAt, password, ...safe } = adminSecurity || {};
      void activeOtp; void otpExpiresAt; void password;
      localStorage.setItem(ADMIN_SECURITY_KEY, JSON.stringify(safe));
    } catch (e) {
      console.error('Failed to persist admin security', e);
    }
  }, [adminSecurity]);

  // Persist Users list
  useEffect(() => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to persist users', e);
    }
  }, [users]);

  // Persist Current User (tab-scoped session only — see AUTH_KEY note)
  useEffect(() => {
    if (currentUser) {
      const { password, ...safeUser } = currentUser;
      void password;
      sessionSet(CURRENT_USER_KEY, JSON.stringify(safeUser));
    } else {
      sessionDel(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  // Synchronize <html> dir, lang, document.title, favicon, and SEO meta tags
  useEffect(() => {
    const lang = data?.siteConfig?.language || 'fa';
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';

    // 1. Dynamic Page Title
    const title = lang === 'fa'
      ? (data?.seoSettings?.siteTitle || `${data?.personalInfo?.fullNameFa || data?.personalInfo?.nameFa || 'مهندس آرش طاهری'} | ${data?.personalInfo?.taglineFa || 'رزومه و پورتفولیو مهندسی'}`)
      : (data?.seoSettings?.siteTitleEn || `${data?.personalInfo?.fullNameEn || data?.personalInfo?.nameEn || 'Arash Taheri'} | ${data?.personalInfo?.taglineEn || 'Engineering Portfolio'}`);
    if (title) {
      document.title = title;
    }

    // 2. Dynamic Favicon (<link rel="icon">)
    const faviconUrl = data?.siteConfig?.faviconUrl || data?.seoSettings?.faviconUrl;
    if (faviconUrl) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = faviconUrl;
    }

    // 3. Dynamic Meta Description
    const metaDesc = lang === 'fa'
      ? (data?.seoSettings?.metaDescription || data?.personalInfo?.bioFa || data?.personalInfo?.taglineFa)
      : (data?.seoSettings?.metaDescriptionEn || data?.personalInfo?.bioEn || data?.personalInfo?.taglineEn);
    if (metaDesc) {
      let meta = document.querySelector("meta[name='description']");
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.getElementsByTagName('head')[0].appendChild(meta);
      }
      meta.setAttribute('content', metaDesc);
    }

    // 4. Dynamic Meta Keywords
    const metaKw = lang === 'fa' ? data?.seoSettings?.keywords : data?.seoSettings?.keywordsEn;
    if (metaKw) {
      let kwTag = document.querySelector("meta[name='keywords']");
      if (!kwTag) {
        kwTag = document.createElement('meta');
        kwTag.name = 'keywords';
        document.getElementsByTagName('head')[0].appendChild(kwTag);
      }
      kwTag.setAttribute('content', metaKw);
    }
  }, [
    data?.siteConfig?.language,
    data?.siteConfig?.faviconUrl,
    data?.seoSettings?.siteTitle,
    data?.seoSettings?.siteTitleEn,
    data?.seoSettings?.metaDescription,
    data?.seoSettings?.metaDescriptionEn,
    data?.seoSettings?.keywords,
    data?.seoSettings?.keywordsEn,
    data?.seoSettings?.faviconUrl,
    data?.personalInfo?.fullNameFa,
    data?.personalInfo?.fullNameEn,
    data?.personalInfo?.nameFa,
    data?.personalInfo?.nameEn,
    data?.personalInfo?.taglineFa,
    data?.personalInfo?.taglineEn,
    data?.personalInfo?.bioFa,
    data?.personalInfo?.bioEn,
  ]);

  // Dynamic Template Getter (with resilient fallback)
  const currentTemplate =
    (data?.siteConfig?.activeTemplateId && TEMPLATES_MAP[data.siteConfig.activeTemplateId]) ||
    (data?.siteConfig?.currentTemplateId && TEMPLATES_MAP[data.siteConfig.currentTemplateId]) ||
    TEMPLATES_MAP['pcb-blueprint-dark'] ||
    DEFAULT_TEMPLATE ||
    TEMPLATES[0];

  // --------------------------------------------------------------------------
  // 5. SITE CONFIGURATION & TEMPLATE CHANGING
  // --------------------------------------------------------------------------
  const updateSiteConfig = (newConfig) => {
    setData((prev) => ({
      ...prev,
      siteConfig: {
        ...prev.siteConfig,
        ...newConfig,
      },
    }));
  };

  const setTemplate = (templateId) => {
    const target = TEMPLATES_MAP[templateId] || TEMPLATES.find((t) => t.id === templateId);
    if (target) {
      updateSiteConfig({ activeTemplateId: target.id, currentTemplateId: target.id });
      showToast(`قالب سایت با موفقیت به «${target.nameFa}» تغییر یافت.`);
    }
  };

  // --------------------------------------------------------------------------
  // 6. PERSONAL INFO & SEO SETTINGS
  // --------------------------------------------------------------------------
  const updatePersonalInfo = (newInfo) => {
    setData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        ...newInfo,
      },
    }));
    showToast('اطلاعات فردی و شغلی با موفقیت ذخیره شد.');
  };

  const updateSeoSettings = (newSeo) => {
    setData((prev) => ({
      ...prev,
      seoSettings: {
        ...prev.seoSettings,
        ...newSeo,
      },
    }));
    showToast('تنظیمات سئو، متاتگ‌ها و ربات‌ها به‌روزرسانی شد.');
  };

  // --------------------------------------------------------------------------
  // 7. MEDIA LIBRARY & UPLOADS
  // --------------------------------------------------------------------------
  const uploadMediaFile = (fileObj) => {
    const newMedia = {
      id: `media-${Date.now()}`,
      name: sanitizeFileName(fileObj.name || 'uploaded_image.jpg'),
      url: fileObj.url,
      type: fileObj.type || 'image/jpeg',
      size: fileObj.size || '150 KB',
      date: new Date().toLocaleDateString('fa-IR'),
      category: fileObj.category || 'عمومی',
    };

    setData((prev) => ({
      ...prev,
      mediaLibrary: [newMedia, ...(prev.mediaLibrary || [])],
    }));
    showToast(`فایل «${newMedia.name}» با موفقیت در کتابخانه ذخیره شد.`);
    return newMedia;
  };

  const deleteMediaItem = (mediaId) => {
    setData((prev) => ({
      ...prev,
      mediaLibrary: (prev.mediaLibrary || []).filter((m) => m.id !== mediaId),
    }));
    showToast('فایل از کتابخانه رسانه حذف گردید.');
  };

  // --------------------------------------------------------------------------
  // 8. HARDWARE BOARDS MANAGEMENT (WITH MULTI-FEATURED TOGGLE & HERO PCB)
  // --------------------------------------------------------------------------
  const toggleFeaturedBoard = (boardId) => {
    let isNowFeatured = false;
    setData((prev) => {
      const target = (prev.boards || []).find((b) => b.id === boardId);
      isNowFeatured = !target?.featured;
      const updatedBoards = (prev.boards || []).map((b) =>
        b.id === boardId ? { ...b, featured: isNowFeatured } : b
      );
      return {
        ...prev,
        boards: updatedBoards,
      };
    });
    const target = (data.boards || []).find((b) => b.id === boardId);
    if (!target?.featured) {
      showToast(`برد «${target?.titleFa || boardId}» به لیست پروژه‌های شاخص هدر اضافه شد ⭐`);
    } else {
      showToast(`برد «${target?.titleFa || boardId}» از حالت شاخص خارج شد.`);
    }
  };

  const setFeaturedBoard = toggleFeaturedBoard; // Alias for backward compatibility

  const addBoard = (boardData) => {
    const newBoard = {
      ...boardData,
      id: `board-${Date.now()}`,
      createdDate: boardData.createdDate || new Date().toISOString().split('T')[0],
      featured: Boolean(boardData.featured),
    };

    setData((prev) => ({
      ...prev,
      boards: [newBoard, ...(prev.boards || [])],
    }));
    showToast(`برد الکترونیکی «${newBoard.titleFa}» با موفقیت اضافه شد.`);
  };

  const updateBoard = (boardId, updatedBoard) => {
    setData((prev) => ({
      ...prev,
      boards: (prev.boards || []).map((b) =>
        b.id === boardId ? { ...b, ...updatedBoard } : b
      ),
    }));
    showToast('مشخصات برد با موفقیت به‌روزرسانی شد.');
  };

  const deleteBoard = (boardId) => {
    setData((prev) => ({
      ...prev,
      boards: (prev.boards || []).filter((b) => b.id !== boardId),
    }));
    showToast('برد الکترونیکی با موفقیت حذف گردید.');
  };

  // --------------------------------------------------------------------------
  // 9. ARTICLES / PUBLICATIONS MANAGEMENT
  // --------------------------------------------------------------------------
  const addArticle = (articleData) => {
    const newArticle = {
      ...articleData,
      id: `art-${Date.now()}`,
      createdDate: articleData.createdDate || new Date().toISOString().split('T')[0],
      views: 0,
      likes: 0,
    };

    setData((prev) => ({
      ...prev,
      articles: [newArticle, ...prev.articles],
    }));
    showToast(`مقاله تخصصی «${newArticle.titleFa}» با موفقیت اضافه شد.`);
  };

  const updateArticle = (articleId, updatedArticle) => {
    setData((prev) => ({
      ...prev,
      articles: prev.articles.map((a) =>
        a.id === articleId ? { ...a, ...updatedArticle } : a
      ),
    }));
    showToast('محتوای مقاله تخصصی با موفقیت ویرایش شد.');
  };

  const deleteArticle = (articleId) => {
    setData((prev) => ({
      ...prev,
      articles: prev.articles.filter((a) => a.id !== articleId),
    }));
    showToast('مقاله با موفقیت حذف گردید.');
  };

  // --------------------------------------------------------------------------
  // 9.5 BLOG POSTS & TECHNICAL INSIGHTS MANAGEMENT
  // --------------------------------------------------------------------------
  const addBlogPost = (postData) => {
    const newPost = {
      ...postData,
      id: `post-${Date.now()}`,
      publishDate: postData.publishDate || new Date().toLocaleDateString('fa-IR'),
      views: 0,
      likes: 0,
      status: postData.status || 'published',
    };

    setData((prev) => ({
      ...prev,
      blogPosts: [newPost, ...(prev.blogPosts || [])],
    }));
    showToast(`یادداشت و مقاله وبلاگ «${newPost.titleFa}» با موفقیت منتشر شد.`);
    return newPost;
  };

  const updateBlogPost = (postId, updatedPost) => {
    setData((prev) => ({
      ...prev,
      blogPosts: (prev.blogPosts || []).map((p) =>
        p.id === postId ? { ...p, ...updatedPost } : p
      ),
    }));
    showToast('مقاله وبلاگ با موفقیت ویرایش و ذخیره شد.');
  };

  const deleteBlogPost = (postId) => {
    setData((prev) => ({
      ...prev,
      blogPosts: (prev.blogPosts || []).filter((p) => p.id !== postId),
    }));
    showToast('مقاله وبلاگ حذف گردید.');
  };

  const toggleLikeBlogPost = (postId) => {
    let isNowLiked = false;
    setData((prev) => {
      let likedIds = [];
      try {
        likedIds = JSON.parse(localStorage.getItem('liked_blog_posts') || '[]');
      } catch (e) {}

      const alreadyLiked = Array.isArray(likedIds) && likedIds.includes(postId);
      if (alreadyLiked) {
        likedIds = likedIds.filter((id) => id !== postId);
        isNowLiked = false;
      } else {
        likedIds = Array.isArray(likedIds) ? [...likedIds, postId] : [postId];
        isNowLiked = true;
      }
      try {
        localStorage.setItem('liked_blog_posts', JSON.stringify(likedIds));
      } catch (e) {}

      const updatedPosts = (prev.blogPosts || []).map((p) => {
        if (p.id === postId) {
          const currentLikes = p.likes || 0;
          return {
            ...p,
            likes: isNowLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1),
          };
        }
        return p;
      });

      return {
        ...prev,
        blogPosts: updatedPosts,
      };
    });

    return isNowLiked;
  };

  // --------------------------------------------------------------------------
  // 10. SKILLS, EXPERIENCES, EDUCATION & CERTIFICATIONS
  // --------------------------------------------------------------------------
  const updateSkills = (newSkillsList) => {
    setData((prev) => ({
      ...prev,
      skills: newSkillsList,
    }));
    showToast('ماتریس و کارت‌های مهارت‌های تخصصی ذخیره شد.');
  };

  const updateExperiences = (newExpList) => {
    setData((prev) => ({
      ...prev,
      experiences: newExpList,
    }));
    showToast('سوابق شغلی مهندسی با موفقیت ذخیره گردید.');
  };

  const updateEducation = (newEduList) => {
    setData((prev) => ({
      ...prev,
      education: newEduList,
    }));
    showToast('سوابق تحصیلی دانشگاهی با موفقیت به‌روزرسانی شد.');
  };

  const updateCertifications = (newCertsList) => {
    setData((prev) => ({
      ...prev,
      certifications: newCertsList,
    }));
    showToast('مدارک و گواهینامه‌های بین‌المللی ذخیره شد.');
  };

  // --------------------------------------------------------------------------
  // 11. DYNAMIC TAXONOMIES (CATEGORIES, STATUSES, EDA TOOLS - WITH CASCADING SYNC)
  // --------------------------------------------------------------------------
  const updateTaxonomyOption = (taxonomyType, oldId, updatedOption) => {
    setData((prev) => {
      const currentTaxonomies = prev.taxonomies || {};
      const list = currentTaxonomies[taxonomyType] || [];

      const updatedList = list.map((item) =>
        item.id === oldId ? { ...item, ...updatedOption } : item
      );

      let updatedBoards = prev.boards;
      let updatedArticles = prev.articles;

      if (taxonomyType === 'boardCategories') {
        const oldItem = list.find((i) => i.id === oldId);
        if (oldItem) {
          updatedBoards = prev.boards.map((b) => {
            if (b.category === oldId || b.categoryFa === oldItem.labelFa || b.categoryEn === oldItem.labelEn) {
              return {
                ...b,
                category: updatedOption.id || oldId,
                categoryFa: updatedOption.labelFa,
                categoryEn: updatedOption.labelEn,
              };
            }
            return b;
          });
        }
      }

      if (taxonomyType === 'articleCategories') {
        const oldItem = list.find((i) => i.id === oldId);
        if (oldItem) {
          updatedArticles = prev.articles.map((a) => {
            if (a.category === oldId || a.categoryFa === oldItem.labelFa || a.categoryEn === oldItem.labelEn) {
              return {
                ...a,
                category: updatedOption.id || oldId,
                categoryFa: updatedOption.labelFa,
                categoryEn: updatedOption.labelEn,
              };
            }
            return a;
          });
        }
      }

      if (taxonomyType === 'boardStatuses') {
        const oldItem = list.find((i) => i.id === oldId);
        if (oldItem) {
          updatedBoards = prev.boards.map((b) => {
            if (b.status === oldId || b.statusFa === oldItem.labelFa || b.statusEn === oldItem.labelEn) {
              return {
                ...b,
                status: updatedOption.id || oldId,
                statusFa: updatedOption.labelFa,
                statusEn: updatedOption.labelEn,
              };
            }
            return b;
          });
        }
      }

      if (taxonomyType === 'edaTools') {
        const oldItem = list.find((i) => i.id === oldId);
        if (oldItem) {
          updatedBoards = prev.boards.map((b) => {
            if (b.edaTool === oldItem.labelEn || b.edaTool === oldItem.labelFa) {
              return {
                ...b,
                edaTool: updatedOption.labelEn || updatedOption.labelFa,
              };
            }
            return b;
          });
        }
      }

      return {
        ...prev,
        taxonomies: {
          ...currentTaxonomies,
          [taxonomyType]: updatedList,
        },
        boards: updatedBoards,
        articles: updatedArticles,
      };
    });

    showToast(`گزینه «${updatedOption.labelFa}» و موارد وابسته با موفقیت به‌روزرسانی شدند.`);
  };

  const addTaxonomyOption = (taxonomyType, newOption) => {
    setData((prev) => {
      const currentTaxonomies = prev.taxonomies || {};
      const list = currentTaxonomies[taxonomyType] || [];
      return {
        ...prev,
        taxonomies: {
          ...currentTaxonomies,
          [taxonomyType]: [...list, newOption],
        },
      };
    });
    showToast(`گزینه جدید «${newOption.labelFa}» به لیست اضافه شد.`);
  };

  const deleteTaxonomyOption = (taxonomyType, optionId) => {
    setData((prev) => {
      const currentTaxonomies = prev.taxonomies || {};
      const list = currentTaxonomies[taxonomyType] || [];
      return {
        ...prev,
        taxonomies: {
          ...currentTaxonomies,
          [taxonomyType]: list.filter((item) => item.id !== optionId),
        },
      };
    });
    showToast('گزینه با موفقیت حذف شد.');
  };

  // --------------------------------------------------------------------------
  // 12. CONTACT INBOX & MESSAGES
  // --------------------------------------------------------------------------
  const addMessage = (msgData) => {
    if (!contactRateLimiter.canAttempt()) {
      const remainingSec = contactRateLimiter.getRemainingCooldownSeconds();
      showToast(`لطفاً قبل از ارسال پیام جدید، ${remainingSec || 30} ثانیه شکیبا باشید.`, 'error');
      return { success: false, error: 'rate_limited' };
    }

    if (msgData.honeypot) {
      console.warn('Spam detected via honeypot field');
      return { success: true };
    }

    contactRateLimiter.recordAttempt();

    const newMsg = {
      id: `msg-${Date.now()}`,
      name: sanitizeText(msgData.name),
      email: sanitizeText(msgData.email),
      subject: sanitizeText(msgData.subject || 'پیام مستقیم از وب‌سایت'),
      message: sanitizeText(msgData.message),
      date: new Date().toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      read: false,
      starred: false,
    };

    setData((prev) => ({
      ...prev,
      messages: [newMsg, ...(prev.messages || [])],
    }));

    showToast('پیام شما با موفقیت ارسال گردید و به ایمیل مدیر ارسال شد.');
    return { success: true };
  };

  const toggleMessageRead = (msgId) => {
    setData((prev) => ({
      ...prev,
      messages: (prev.messages || []).map((m) =>
        m.id === msgId ? { ...m, read: !m.read } : m
      ),
    }));
  };

  const toggleMessageStar = (msgId) => {
    setData((prev) => ({
      ...prev,
      messages: (prev.messages || []).map((m) =>
        m.id === msgId ? { ...m, starred: !m.starred } : m
      ),
    }));
  };

  const deleteMessage = (msgId) => {
    setData((prev) => ({
      ...prev,
      messages: (prev.messages || []).filter((m) => m.id !== msgId),
    }));
    showToast('پیام حذف شد.');
  };

  // --------------------------------------------------------------------------
  // 12B. REAL BACKEND (PHP) STATE + LOCAL PASSWORD MIGRATION
  // --------------------------------------------------------------------------
  // Security model:
  // - ON REAL HOSTING (api/ available): master auth, OTP, reset tokens and
  //   rate limits are enforced SERVER-side (bcrypt, HttpOnly sessions). The
  //   browser only mirrors the session flag. OTP codes NEVER touch the
  //   browser/localStorage — they exist only in server memory + the inbox.
  // - WITHOUT backend (static preview / offline): clearly-labeled LOCAL mode.
  //   Passwords are PBKDF2-hashed, OTP email is unavailable (honest notice +
  //   physical-access emergency reset instead of fake "test codes").
  const [backend, setBackend] = useState({
    checked: false,
    available: false,
    setupDone: false,
    authenticated: false,
    mailAvailable: false,
    emailVerified: false,
  });
  const [serverAccountInfo, setServerAccountInfo] = useState({ recoveryEmail: '', emailVerified: false });
  const [serverResetToken, setServerResetToken] = useState(null); // memory-only, single-use

  const faStamp = () => {
    try {
      return new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) + ' (هم‌اکنون)';
    } catch (e) {
      return 'هم‌اکنون';
    }
  };

  // Local UI mirror of an authenticated session (server OR local login)
  const applyLocalAuth = (user) => {
    const stamped = { ...user, lastLogin: faStamp() };
    setCurrentUser(stamped);
    setIsAuthenticated(true);
    sessionSet(AUTH_KEY, 'true');
    setIsLoginModalOpen(false);
    setIsAdminOpen(true);
    return stamped;
  };

  const clearLocalAuth = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsAdminOpen(false);
    sessionDel(AUTH_KEY);
    sessionDel(CURRENT_USER_KEY);
  };

  const refreshBackend = async () => {
    const s = await fetchServerStatus();
    const next = { checked: true, ...s };
    setBackend(next);
    if (next.available) {
      if (next.authenticated) {
        // Server session alive → mirror locally (admin profile shell)
        const adminUser = (users || []).find((u) => u.username === 'admin') || DEFAULT_USERS[0];
        setCurrentUser((prev) => (prev && prev.username === 'admin' ? prev : { ...adminUser, lastLogin: faStamp() }));
        setIsAuthenticated(true);
        sessionSet(AUTH_KEY, 'true');
        try {
          const acc = await serverAccount();
          if (acc && acc.ok) {
            setServerAccountInfo({
              recoveryEmail: acc.recoveryEmail || '',
              emailVerified: acc.emailVerified === true,
            });
          }
        } catch (e) { /* non-fatal */ }
      } else {
        // Backend exists but no server session → drop any stale local flag
        // for the server-gated master account (no local bypass, ever).
        setCurrentUser((prev) => {
          if (!prev || prev.username === 'admin') {
            setIsAuthenticated(false);
            sessionDel(AUTH_KEY);
            sessionDel(CURRENT_USER_KEY);
            return null;
          }
          return prev;
        });
      }
    }
    return next;
  };

  // Factory-default password verdict (computed from PRE-migration values once)
  const [localPwIsDefault, setLocalPwIsDefault] = useState(() => {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      if (!raw) return true; // fresh install → default 'admin'
      const list = JSON.parse(raw);
      const a = Array.isArray(list) ? list.find((u) => u && u.username === 'admin') : null;
      const pw = a ? a.password : 'admin';
      return pw === 'admin' || pw === '' || pw === '123456';
    } catch (e) {
      return true;
    }
  });
  const isDefaultPassword = backend.available ? !backend.setupDone : localPwIsDefault;

  // One-time hardening on boot:
  //  1. Probe the real backend (if any) and sync the session mirror.
  //  2. Delete legacy PERSISTENT auth flags (a clean re-login is required once).
  //  3. Hash every plaintext local password (PBKDF2) and blank legacy copies.
  useEffect(() => {
    try {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(ADMIN_PASSWORD_KEY);
    } catch (e) { /* ignore */ }
    refreshBackend();
    (async () => {
      try {
        const current = users || [];
        let changed = false;
        const nextUsers = await Promise.all(current.map(async (u) => {
          if (u && typeof u.password === 'string' && u.password !== '' && !isLocalPasswordHash(u.password)) {
            changed = true;
            return { ...u, password: await hashPasswordLocal(u.password) };
          }
          return u;
        }));
        if (changed) setUsers(nextUsers);
        setAdminSecurity((prev) => {
          if (prev && typeof prev.password === 'string' && prev.password !== '') {
            // Fold legacy master password into the admin user if still plaintext there.
            hashPasswordLocal(prev.password).then((h) => {
              setUsers((list) => (list || []).map((u) => (
                u.username === 'admin' && !isLocalPasswordHash(u.password) ? { ...u, password: h } : u
              )));
            }).catch(() => {});
            return { ...prev, password: '' };
          }
          return prev;
        });
      } catch (e) {
        console.error('Password migration failed', e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------------------------------------------------------------
  // 13. AUTHENTICATION & MULTI-USER RBAC MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Universal User Login (REAL when backend is available).
   * - Master `admin` on real hosting → verified SERVER-side (bcrypt + session).
   *   Local password copies are IGNORED there: no bypass, ever.
   * - Other workspace users (RBAC profiles) → local PBKDF2-hashed check.
   * - Without backend (preview/offline): everything local, clearly labeled.
   * @param {string} usernameOrEmail - Username or Email
   * @param {string} password - Input security password
   */
  const loginUser = async (usernameOrEmail, password) => {
    if (!loginRateLimiter.canAttempt()) {
      const remainingSec = loginRateLimiter.getRemainingCooldownSeconds();
      showToast(`به دلیل تلاش‌های ناموفق متعدد، ورود به مدت ${remainingSec} ثانیه مسدود است.`, 'error');
      return { success: false, error: 'rate_limit' };
    }

    const inputIdentifier = (usernameOrEmail || '').trim().toLowerCase();
    const inputPassword = (password || '').trim();
    const wantsAdmin = !inputIdentifier || inputIdentifier === 'admin';

    // --- REAL PATH: master admin verified by the server (bcrypt + session) ---
    if (backend.available && backend.setupDone && wantsAdmin) {
      const r = await serverLogin('admin', inputPassword);
      if (!r.ok) {
        loginRateLimiter.recordAttempt();
        showToast(
          r.error === 'rate_limit'
            ? `ورود موقتاً مسدود است. ${r.retryAfter || 60} ثانیه دیگر تلاش کنید.`
            : 'نام کاربری یا رمز عبور وارد شده نادرست است!',
          'error'
        );
        return { success: false, error: r.error || 'invalid_credentials' };
      }
      loginRateLimiter.reset();
      await refreshBackend();
      const adminUser = users.find((u) => u.username === 'admin') || DEFAULT_USERS[0];
      const stamped = applyLocalAuth(adminUser);
      showToast(`خوش آمدید! ورود امن (سرور) به عنوان ${stamped.nameFa} (${ROLE_DEFINITIONS.super_admin.labelFa})`);
      return { success: true, user: stamped, viaServer: true };
    }

    // Backend exists but owner hasn't run first-time setup yet.
    if (backend.available && !backend.setupDone && wantsAdmin) {
      return { success: false, error: 'setup_required' };
    }

    // --- LOCAL PATH: workspace users / offline-preview mode ---
    // Match by username or email
    const targetUser = users.find(
      (u) => (u.username && u.username.toLowerCase() === inputIdentifier) ||
             (u.email && u.email.toLowerCase() === inputIdentifier)
    );

    if (!targetUser) {
      loginRateLimiter.recordAttempt();
      showToast('نام کاربری یا رمز عبور وارد شده نادرست است!', 'error');
      return { success: false, error: 'invalid_credentials' };
    }

    if (targetUser.status !== 'active') {
      showToast('این حساب کاربری غیرفعال شده است. لطفاً با مدیر ارشد تماس بگیرید.', 'error');
      return { success: false, error: 'user_inactive' };
    }

    // PBKDF2 verify (transparently accepts legacy plaintext once, then migrates)
    const isPasswordMatch = await verifyPasswordLocal(inputPassword, targetUser.password);

    if (!isPasswordMatch) {
      loginRateLimiter.recordAttempt();
      showToast('نام کاربری یا رمز عبور وارد شده نادرست است!', 'error');
      return { success: false, error: 'invalid_credentials' };
    }

    // Migrate legacy plaintext → hash on successful login
    if (!isLocalPasswordHash(targetUser.password)) {
      try {
        const h = await hashPasswordLocal(inputPassword);
        setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, password: h } : u)));
      } catch (e) { /* non-fatal */ }
    }

    // Successful LOCAL login
    loginRateLimiter.reset();
    const stamped = applyLocalAuth(targetUser);
    setUsers((prev) => prev.map((u) => (u.id === stamped.id ? stamped : u)));

    const roleLabel = ROLE_DEFINITIONS[stamped.role]?.labelFa || 'کاربر سیستم';
    showToast(
      backend.available
        ? `ورود موفق (نقش محلی): ${stamped.nameFa} (${roleLabel})`
        : `ورود موفق [حالت محلی]: خوش آمدید ${stamped.nameFa} (${roleLabel})`
    );
    return { success: true, user: stamped, viaServer: false };
  };

  /**
   * Super Admin Login helper for backward compatibility
   */
  const loginAdmin = (password) => {
    return loginUser('admin', password);
  };

  /**
   * Universal Logout (destroys the SERVER session too when backend exists)
   */
  const logoutUser = async () => {
    if (backend.available) {
      try { await serverLogout(); } catch (e) { /* non-fatal */ }
    }
    clearLocalAuth();
    setServerResetToken(null);
    try { await refreshBackend(); } catch (e) { /* non-fatal */ }
    showToast('شما با موفقیت از پنل مدیریت خارج شدید.');
  };

  const logoutAdmin = logoutUser;

  /**
   * Add a new User with Role and Granular Permissions
   */
  const addUser = async (userData) => {
    const cleanUsername = sanitizeText(userData.username).toLowerCase().replace(/\s+/g, '');
    if (!cleanUsername) {
      showToast('نام کاربری الزامی است.', 'error');
      return false;
    }
    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      showToast('این نام کاربری قبلاً در سیستم ثبت شده است.', 'error');
      return false;
    }
    const rawPw = (userData.password || '').trim();
    if (rawPw.length < 8) {
      showToast('رمز عبور کاربر باید حداقل ۸ کاراکتر باشد.', 'error');
      return false;
    }
    const hashedPw = await hashPasswordLocal(rawPw);

    const role = userData.role || 'editor';
    const roleDef = ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS.editor;
    const permissions = role === 'custom'
      ? (userData.permissions || { ...roleDef.defaultPermissions })
      : { ...roleDef.defaultPermissions };

    const newUser = {
      id: `user-${Date.now()}`,
      username: cleanUsername,
      password: hashedPw, // PBKDF2 hash — never plaintext (local mode)
      nameFa: sanitizeText(userData.nameFa) || cleanUsername,
      nameEn: sanitizeText(userData.nameEn) || cleanUsername,
      email: sanitizeText(userData.email) || `${cleanUsername}@system.local`,
      role,
      status: userData.status || 'active',
      isPrimary: false,
      avatar: roleDef.icon || '👤',
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'هنوز وارد نشده',
      permissions,
    };

    setUsers((prev) => [...prev, newUser]);
    showToast(`کاربر «${newUser.nameFa}» با نقش ${roleDef.labelFa} با موفقیت ایجاد شد.`);
    return true;
  };

  /**
   * Update User details, role, status or permissions
   */
  const updateUser = async (userId, updatedFields) => {
    // Hash a changed password (PBKDF2) — never store/overwrite plaintext.
    const fields = { ...(updatedFields || {}) };
    if (!fields.password) delete fields.password; // edit without pw change → keep old
    if (fields.password && !isLocalPasswordHash(fields.password)) {
      const rawPw = String(fields.password).trim();
      if (rawPw.length < 8) {
        showToast('رمز عبور کاربر باید حداقل ۸ کاراکتر باشد.', 'error');
        return false;
      }
      fields.password = await hashPasswordLocal(rawPw);
    }
    setUsers((prev) => {
      return prev.map((u) => {
        if (u.id === userId) {
          const newRole = fields.role || u.role;
          const roleDef = ROLE_DEFINITIONS[newRole] || ROLE_DEFINITIONS.editor;
          let newPermissions = u.permissions;

          if (fields.permissions) {
            newPermissions = { ...fields.permissions };
          } else if (newRole !== u.role && newRole !== 'custom') {
            newPermissions = { ...roleDef.defaultPermissions };
          }

          const modUser = {
            ...u,
            ...fields,
            role: newRole,
            permissions: newPermissions,
            avatar: roleDef.icon || u.avatar,
          };

          if (currentUser && currentUser.id === userId) {
            setCurrentUser(modUser);
          }

          return modUser;
        }
        return u;
      });
    });
    showToast('اطلاعات کاربر با موفقیت به‌روزرسانی شد.');
    return true;
  };

  /**
   * Delete User (Protected against deleting primary admin)
   */
  const deleteUser = (userId) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return false;
    if (target.isPrimary || target.username === 'admin') {
      showToast('امکان حذف کاربر اصلی مدیر ارشد (admin) وجود ندارد!', 'error');
      return false;
    }
    if (currentUser && currentUser.id === userId) {
      showToast('نمی‌توانید حساب کاربری که هم‌اکنون با آن وارد شده‌اید را حذف کنید!', 'error');
      return false;
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast(`کاربر «${target.nameFa}» با موفقیت حذف گردید.`);
    return true;
  };

  /**
   * Switch User for Instant Testing & Role Preview
   */
  const switchUserForTesting = (userId) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return false;
    setCurrentUser(target);
    setIsAuthenticated(true);
    sessionSet(AUTH_KEY, 'true');
    showToast(`تغییر سریع به کاربر «${target.nameFa}» (${ROLE_DEFINITIONS[target.role]?.labelFa})`);
    return true;
  };

  /**
   * Granular Permission Checker
   */
  const hasPermission = (permissionKey) => {
    if (!isAuthenticated || !currentUser) return false;
    if (currentUser.role === 'super_admin') return true;
    return !!currentUser.permissions?.[permissionKey];
  };

  // --------------------------------------------------------------------------
  // 14. PASSWORD RESET OTP & RECOVERY EMAIL
  // --------------------------------------------------------------------------

  /**
   * Request a password-reset OTP. REAL server flow: the code is generated,
   * stored (bcrypt-hashed) and mailed SERVER-side. The response is
   * intentionally generic — it never reveals whether the email is registered
   * (anti-enumeration). The code NEVER touches the browser/localStorage.
   * @param {string} email - Recovery email to send the code to
   * @returns {Promise<{success: boolean, email?: string, retryAfter?: number, error?: string}>}
   */
  const requestPasswordResetOtp = async (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!validateEmail(cleanEmail)) {
      showToast('لطفاً یک ایمیل معتبر وارد نمایید.', 'error');
      return { success: false, error: 'invalid_email' };
    }
    if (!backend.available) {
      // Honest local mode: email is impossible without a backend.
      return { success: false, error: 'no_backend' };
    }

    if (!otpRateLimiter.canAttempt()) {
      const remainingSec = otpRateLimiter.getRemainingCooldownSeconds();
      showToast(`لطفاً قبل از درخواست مجدد کد، ${remainingSec || 30} ثانیه صبر فرمایید.`, 'error');
      return { success: false, error: 'rate_limit' };
    }
    otpRateLimiter.recordAttempt();

    const r = await serverRequestOtp(cleanEmail);
    if (!r.ok) {
      showToast(
        r.error === 'rate_limit'
          ? `درخواست زیاد است. ${r.retryAfter || 60} ثانیه دیگر تلاش کنید.`
          : 'خطای شبکه. اتصال اینترنت را بررسی کنید.',
        'error'
      );
      return { success: false, error: r.error || 'network' };
    }
    return { success: true, email: cleanEmail, retryAfter: r.retryAfter || 0 };
  };

  /**
   * Verify the emailed OTP with the SERVER. On success a single-use reset
   * token is kept IN MEMORY (never in any storage) for the final step.
   * @param {string} email - Recovery email the code was sent to
   * @param {string} otp - 6-digit OTP code from the inbox
   * @returns {Promise<boolean>} True when the token was issued
   */
  const verifyPasswordResetOtp = async (email, otp) => {
    if (!backend.available) return false;
    const cleanOtp = String(otp || '').trim();
    if (cleanOtp.length !== 6) {
      showToast('کد تایید باید ۶ رقمی باشد.', 'error');
      return false;
    }
    const r = await serverVerifyOtp(email, cleanOtp);
    if (!r.ok || !r.resetToken) {
      showToast(
        r.error === 'expired' ? 'کد تایید منقضی شده است. کد جدید درخواست کنید.'
        : r.error === 'locked' ? 'تعداد تلاش‌ها زیاد شد. کد جدید درخواست کنید.'
        : r.error === 'rate_limit' ? 'درخواست زیاد است. کمی بعد تلاش کنید.'
        : 'کد تایید وارد شده نادرست است.',
        'error'
      );
      return false;
    }
    setServerResetToken(r.resetToken);
    return true;
  };

  /**
   * Consume the in-memory reset token and set the new master password
   * (bcrypt-hashed SERVER-side), then log in via a fresh server session.
   * @param {string} newPassword - New password (min 8 chars)
   * @returns {Promise<boolean>} True if password was reset
   */
  const resetPasswordWithOtp = async (newPassword) => {
    if (!backend.available || !serverResetToken) return false;
    const trimmedPw = (newPassword || '').trim();
    if (trimmedPw.length < 8) {
      showToast('رمز عبور جدید باید حداقل ۸ کاراکتر باشد.', 'error');
      return false;
    }
    const r = await serverResetPassword(serverResetToken, trimmedPw);
    setServerResetToken(null); // single-use: always drop after the attempt
    if (!r.ok) {
      showToast('توکن بازیابی نامعتبر یا منقضی است. از اول شروع کنید.', 'error');
      return false;
    }
    loginRateLimiter.reset();
    await refreshBackend();
    const adminUser = users.find((u) => u.username === 'admin') || DEFAULT_USERS[0];
    applyLocalAuth(adminUser);
    setLocalPwIsDefault(false);
    showToast('رمز عبور مدیر با موفقیت تغییر کرد و وارد پنل شدید.');
    return true;
  };

  /**
   * Change the recovery email (panel context, already authed).
   * SERVER mode: requires the current master password; an OTP is mailed to
   * the NEW address and must be confirmed (proves inbox ownership).
   * LOCAL mode: stored directly (no email channel exists) — labeled honestly.
   * @param {string} password - Current master password (server mode)
   * @param {string} newEmail - New recovery email
   */
  const requestRecoveryEmailChange = async (password, newEmail) => {
    const cleanEmail = (newEmail || '').trim().toLowerCase();
    if (!validateEmail(cleanEmail)) {
      showToast('لطفاً یک ایمیل معتبر وارد نمایید.', 'error');
      return { success: false, error: 'invalid_email' };
    }
    if (!backend.available) {
      setAdminSecurity((prev) => ({ ...prev, recoveryEmail: cleanEmail, isEmailVerified: true }));
      showToast('در حالت محلی، ایمیل بازیابی بدون تایید ایمیلی ذخیره شد.');
      return { success: true, local: true, email: cleanEmail };
    }
    if (!otpRateLimiter.canAttempt()) {
      showToast('درخواست زیاد است. کمی بعد تلاش کنید.', 'error');
      return { success: false, error: 'rate_limit' };
    }
    otpRateLimiter.recordAttempt();
    const r = await serverRequestEmailChange(password || '', cleanEmail);
    if (!r.ok) {
      showToast(
        r.error === 'invalid_credentials' ? 'رمز عبور فعلی نادرست است.'
        : r.error === 'rate_limit' ? 'درخواست زیاد است. کمی بعد تلاش کنید.'
        : 'خطای شبکه. اتصال اینترنت را بررسی کنید.',
        'error'
      );
      return { success: false, error: r.error || 'network' };
    }
    if (r.emailSent) {
      showToast(`کد تایید به ${cleanEmail} ارسال شد. (۵ دقیقه اعتبار دارد)`);
    } else {
      showToast('ارسال ایمیل ناموفق بود! تنظیمات ایمیل هاست (PHP mail) را بررسی کنید.', 'error');
    }
    return { success: true, emailSent: r.emailSent === true, mailError: r.mailError || null, email: cleanEmail };
  };

  /**
   * Confirm the recovery-email change with the OTP mailed to the NEW address.
   * @param {string} otp - 6-digit code from the new inbox
   * @returns {Promise<boolean>} True when the email was switched
   */
  const confirmRecoveryEmailChange = async (otp) => {
    if (!backend.available) return true; // local mode stores directly (see above)
    const cleanOtp = String(otp || '').trim();
    if (cleanOtp.length !== 6) {
      showToast('کد تایید باید ۶ رقمی باشد.', 'error');
      return false;
    }
    const r = await serverConfirmEmailChange(cleanOtp);
    if (!r.ok) {
      showToast(
        r.error === 'expired' ? 'کد تایید منقضی شده است. دوباره درخواست دهید.'
        : r.error === 'locked' ? 'تعداد تلاش‌ها زیاد شد. دوباره درخواست دهید.'
        : 'کد تایید وارد شده نادرست است.',
        'error'
      );
      return false;
    }
    setAdminSecurity((prev) => ({
      ...prev,
      recoveryEmail: r.recoveryEmail || prev.recoveryEmail,
      isEmailVerified: true,
    }));
    setServerAccountInfo({ recoveryEmail: r.recoveryEmail || '', emailVerified: true });
    showToast('ایمیل بازیابی با موفقیت تایید و ذخیره گردید.');
    return true;
  };

  /**
   * Change password directly from Admin Panel
   */
  /**
   * Change the MASTER admin password (min 8 chars, current password required).
   * SERVER mode: verified + bcrypt-hashed server-side. LOCAL mode: PBKDF2 hash.
   */
  const changeAdminPassword = async (currentPassword, newPassword) => {
    const trimmed = (newPassword || '').trim();
    if (!trimmed || trimmed.length < 8) {
      showToast('رمز عبور جدید باید حداقل ۸ کاراکتر باشد.', 'error');
      return false;
    }
    if (backend.available) {
      const r = await serverChangePassword(currentPassword || '', trimmed);
      if (!r.ok) {
        showToast(r.error === 'invalid_credentials' ? 'رمز عبور فعلی نادرست است.' : 'تغییر رمز ناموفق بود.', 'error');
        return false;
      }
      await refreshBackend();
      setLocalPwIsDefault(false);
      showToast('رمز عبور پنل مدیریت با موفقیت تغییر یافت.');
      return true;
    }
    // Local mode: verify the current password first (no silent takeover).
    const adminUser = (users || []).find((u) => u.username === 'admin');
    const okCurrent = adminUser ? await verifyPasswordLocal(currentPassword || '', adminUser.password) : false;
    if (!okCurrent) {
      showToast('رمز عبور فعلی نادرست است.', 'error');
      return false;
    }
    const h = await hashPasswordLocal(trimmed);
    setUsers((prev) => (prev || []).map((u) => (u.username === 'admin' ? { ...u, password: h } : u)));
    setAdminSecurity((prev) => ({ ...prev, password: '' }));
    setLocalPwIsDefault(false);
    showToast('رمز عبور پنل مدیریت با موفقیت تغییر یافت.');
    return true;
  };

  /**
   * Update the LOCAL recovery-email value (contact-form recipient / display).
   * On real hosting the SERVER is the source of truth — use
   * requestRecoveryEmailChange() instead. This only syncs the local mirror.
   */
  const updateAdminRecoverySettings = (newEmail) => {
    const cleanEmail = (newEmail || '').trim().toLowerCase();
    if (!validateEmail(cleanEmail)) {
      showToast('ایمیل وارد شده نامعتبر است.', 'error');
      return false;
    }
    setAdminSecurity((prev) => ({ ...prev, recoveryEmail: cleanEmail }));
    showToast('ایمیل بازیابی (محلی) ذخیره شد.');
    return true;
  };

  // --- First-run SERVER setup (master password + recovery email + OTP) ------
  const setupServerAccount = async (password, recoveryEmail) => {
    const r = await serverSetup(password, recoveryEmail);
    if (!r.ok) {
      showToast(
        r.error === 'weak_password' ? 'رمز عبور باید حداقل ۸ کاراکتر باشد.'
        : r.error === 'invalid_email' ? 'ایمیل وارد شده نامعتبر است.'
        : r.error === 'already_setup' ? 'راه‌اندازی قبلاً انجام شده است.'
        : r.error === 'rate_limit' ? 'درخواست زیاد است. کمی بعد تلاش کنید.'
        : 'خطا در راه‌اندازی. دوباره تلاش کنید.',
        'error'
      );
      return { success: false, error: r.error };
    }
    await refreshBackend();
    return { success: true, emailSent: r.emailSent === true, mailError: r.mailError || null };
  };

  const verifyServerSetupOtp = async (otp) => {
    const r = await serverVerifySetupOtp(otp);
    if (!r.ok) {
      showToast(r.error === 'expired' ? 'کد منقضی شده. دوباره راه‌اندازی کنید.' : 'کد تایید نادرست است.', 'error');
      return false;
    }
    loginRateLimiter.reset();
    await refreshBackend();
    const adminUser = users.find((u) => u.username === 'admin') || DEFAULT_USERS[0];
    applyLocalAuth(adminUser);
    setLocalPwIsDefault(false);
    showToast('راه‌اندازی کامل شد! ایمیل بازیابی تایید شد. خوش آمدید!');
    return true;
  };

  const skipServerSetupVerify = async () => {
    const r = await serverSkipSetupVerify();
    if (!r.ok) {
      showToast('خطا. دوباره تلاش کنید.', 'error');
      return false;
    }
    loginRateLimiter.reset();
    await refreshBackend();
    const adminUser = users.find((u) => u.username === 'admin') || DEFAULT_USERS[0];
    applyLocalAuth(adminUser);
    setLocalPwIsDefault(false);
    showToast('بدون تایید ایمیل وارد شدید. از بخش امنیت، ایمیل را تایید کنید.', 'error');
    return true;
  };

  // --------------------------------------------------------------------------
  // LOCAL RECOVERY QUESTIONS — the gate for the emergency local reset.
  // Set once from the panel (Security tab). Answers are PBKDF2-hashed, so a
  // stolen localStorage file does NOT reveal them. Questions are public text.
  // --------------------------------------------------------------------------
  const LOCAL_SECQA_KEY = 'resume_admin_secqa_v1';

  const getLocalSecQaQuestions = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(LOCAL_SECQA_KEY) || '[]');
      return Array.isArray(raw) ? raw.map((r) => r.q).filter(Boolean) : [];
    } catch { return []; }
  };

  const saveLocalSecQa = async (pairs) => {
    const clean = (pairs || [])
      .map((p) => ({ q: String(p.q || '').trim().slice(0, 120), a: String(p.a || '').trim() }))
      .filter((p) => p.q && p.a.length >= 3);
    if (clean.length < 2) return false;
    const hashed = [];
    for (const p of clean.slice(0, 3)) {
      hashed.push({ q: p.q, h: await hashPasswordLocal(p.a.toLowerCase()) });
    }
    try {
      localStorage.setItem(LOCAL_SECQA_KEY, JSON.stringify(hashed));
      showToast('سؤالات بازیابی محلی ذخیره شد ✅');
      return true;
    } catch { return false; }
  };

  const verifyLocalSecQa = async (answers) => {
    try {
      const raw = JSON.parse(localStorage.getItem(LOCAL_SECQA_KEY) || '[]');
      if (!Array.isArray(raw) || raw.length < 2) return false;
      for (let i = 0; i < raw.length; i++) {
        const given = String(answers?.[i] || '').trim().toLowerCase();
        if (!given) return false;
        if (!(await verifyPasswordLocal(given, raw[i].h))) return false;
      }
      return true;
    } catch { return false; }
  };

  /**
   * Emergency LOCAL password reset — REQUIRES the recovery answers chosen
   * in the panel (Security tab). No answers set / wrong answers → locked.
   * NEVER available when the backend exists (the server is the authority).
   */
  const emergencyLocalReset = async (answers) => {
    if (backend.available) return false;
    if (!(await verifyLocalSecQa(answers))) return false;
    const h = await hashPasswordLocal('admin');
    setUsers((prev) => {
      const list = prev || [];
      if (list.some((u) => u.username === 'admin')) {
        return list.map((u) => (u.username === 'admin' ? { ...u, password: h, status: 'active' } : u));
      }
      return [...list, { ...DEFAULT_USERS[0], password: h }];
    });
    setAdminSecurity((prev) => ({ ...prev, password: '' }));
    setLocalPwIsDefault(true);
    showToast('رمز محلی ریست شد: admin (پس از ورود فوراً عوضش کنید!)');
    return true;
  };

  // --------------------------------------------------------------------------
  // 14b. AUTOMATIC BACKUP — debounced: fires ONCE, X days after the LAST change
  // anywhere (content / users / security). Interval is admin-configurable
  // 1..30 days (panel → backup tab). Skips silently when nothing changed
  // (sig match). The deadline is wall-clock persisted, so closing the
  // browser only postpones the single firing until the panel reopens.
  // --------------------------------------------------------------------------
  const [autoBackup, setAutoBackup] = useState(() => {
    // Interval is DAYS (1..30). Migrates the old minutes-based config once.
    const fromMinutes = (m) => Math.max(1, Math.min(30, Math.round((m || 30) / 1440) || 1));
    try {
      const raw = JSON.parse(localStorage.getItem(AUTO_BACKUP_KEY) || '{}');
      return {
        enabled: raw.enabled !== false, // on by default
        days:
          raw.days !== undefined
            ? Math.max(1, Math.min(30, parseInt(raw.days, 10) || 7))
            : fromMinutes(parseInt(raw.minutes, 10)),
        lastRun: raw.lastRun || 0,
        lastSig: typeof raw.lastSig === 'string' ? raw.lastSig : '',
        deadline: raw.deadline || 0, // persisted wall-clock target (survives reloads)
      };
    } catch {
      return { enabled: true, days: 7, lastRun: 0, lastSig: '', deadline: 0 };
    }
  });
  const [autoBackupStatus, setAutoBackupStatus] = useState({ pending: false, nextAt: 0 });
  const autoTimerRef = useRef(null);
  const lastSigRef = useRef(autoBackup.lastSig);
  const mountSigRef = useRef('');
  const quotaWarnedRef = useRef(false);
  const MAX_TIMEOUT_MS = 2147483647; // setTimeout ceiling (~24.8 days)

  // Tiny content signature (length + djb2) — detects "anything changed".
  const sigOf = (obj) => {
    try {
      const s = JSON.stringify(obj);
      let h = 5381;
      for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
      return `${s.length}:${h.toString(36)}`;
    } catch {
      return `${Date.now()}`;
    }
  };

  // Persist auto-backup config (a content hash is not a secret — safe to store)
  useEffect(() => {
    try {
      localStorage.setItem(AUTO_BACKUP_KEY, JSON.stringify(autoBackup));
    } catch (e) {
      console.error('Failed to persist auto-backup config', e);
    }
    lastSigRef.current = autoBackup.lastSig;
  }, [autoBackup]);

  const setAutoBackupConfig = (patch = {}) => {
    setAutoBackup((prev) => ({
      ...prev,
      enabled: patch.enabled !== undefined ? !!patch.enabled : prev.enabled,
      days:
        patch.days !== undefined
          ? Math.max(1, Math.min(30, parseInt(patch.days, 10) || prev.days))
          : prev.days,
    }));
  };

  // Debounce engine: any watched change RESTARTS the countdown from now; when
  // the deadline arrives with no newer change, ONE auto snapshot fires and the
  // engine goes idle until the next real change. Zero polling, zero weight:
  // a single (possibly chained — setTimeout caps at ~24.8d) timer per window.
  useEffect(() => {
    if (!autoBackup.enabled) {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      setAutoBackupStatus({ pending: false, nextAt: 0 });
      return;
    }
    const sig = sigOf({ d: data, u: users, s: stripSecurityForBackup(adminSecurity) });
    if (!mountSigRef.current) mountSigRef.current = sig; // baseline this session
    if (!lastSigRef.current) {
      lastSigRef.current = sig;
      setAutoBackup((prev) => (prev.lastSig ? prev : { ...prev, lastSig: sig }));
    }
    const changedSinceMount = sig !== mountSigRef.current;
    const now = Date.now();
    const dayMs = 86400000;
    let target;
    if (changedSinceMount) {
      // Real change → (re)start the countdown from now (persisted wall-clock).
      target = now + Math.max(1, Math.min(30, autoBackup.days)) * dayMs;
      setAutoBackup((prev) => ({ ...prev, deadline: target }));
    } else if (autoBackup.deadline && autoBackup.deadline > now) {
      // Pure mount: honor the persisted deadline — opening the panel is NOT
      // a change, so the countdown must NOT be extended.
      target = autoBackup.deadline;
    } else if (autoBackup.deadline && autoBackup.deadline <= now) {
      // Deadline passed while the panel was closed → verify + fire soon, once.
      target = now + 60000;
    } else {
      // No deadline and nothing changed → idle until the first change.
      setAutoBackupStatus({ pending: false, nextAt: 0 });
      return;
    }
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    setAutoBackupStatus({ pending: true, nextAt: target });
    const arm = (fireAt) => {
      const wait = Math.min(Math.max(0, fireAt - Date.now()), MAX_TIMEOUT_MS);
      autoTimerRef.current = setTimeout(() => {
        if (Date.now() < fireAt - 1000) {
          arm(fireAt); // 30d exceeds the setTimeout ceiling → chain, still no polling
          return;
        }
        // NOTE: no stale-closure risk — any state change re-runs this effect
        // and re-arms; reaching here untouched means state is exactly as captured.
        const cur = sigOf({ d: data, u: users, s: stripSecurityForBackup(adminSecurity) });
        if (cur === lastSigRef.current) {
          setAutoBackup((prev) => ({ ...prev, deadline: 0 }));
          setAutoBackupStatus({ pending: false, nextAt: 0 });
          return; // nothing new since the last auto backup — skip silently
        }
        // Server-first: the durable copy lives on the HOST (retention enforced
        // there). A local snapshot is only the fallback (no backend / expired
        // session / oversize envelope) — data is protected either way.
        const envelope = buildFullBackup();
        const pushToHost = async () => {
          if (!backend.available || !backend.authenticated) return { ok: false, error: 'no_backend' };
          try {
            return await serverBackupSave(envelope);
          } catch {
            return { ok: false, error: 'network' };
          }
        };
        pushToHost().then((r) => {
          lastSigRef.current = cur;
          setAutoBackup((prev) => ({ ...prev, lastRun: Date.now(), lastSig: cur, deadline: 0 }));
          setAutoBackupStatus({ pending: false, nextAt: 0 });
          if (r && r.ok) {
            showToast('🤖 بک‌آپ خودکار روی هاست ذخیره شد.');
          } else {
            createSnapshot('', { auto: true, silent: true });
            const err = (r && r.error) || 'failed';
            if (err === 'too_large') showToast('بک‌آپ خودکار حجیم بود؛ نسخه محلی ثبت شد — فایل را دستی دانلود کنید.', 'warning');
            else if (err === 'auth_required') showToast('نشست سرور منقضی شده؛ نسخه محلی ثبت شد — دوباره وارد شوید.', 'warning');
            else showToast('هاست در دسترس نبود؛ نسخه محلی ثبت شد.', 'warning');
          }
        });
        return;
      }, wait);
    };
    arm(target);
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, users, adminSecurity, autoBackup.enabled, autoBackup.days]);

  // Browser storage meter for the backup tab (UTF-16 ≈ 2 bytes/char, ~5MB cap)
  const getStorageUsage = () => {
    const keys = [STORAGE_KEY, SNAPSHOTS_KEY, ADMIN_SECURITY_KEY, USERS_KEY, LOCAL_SECQA_KEY, AUTO_BACKUP_KEY];
    let bytes = 0;
    const perKey = {};
    for (const k of keys) {
      try {
        const v = localStorage.getItem(k) || '';
        perKey[k] = v.length * 2;
        bytes += v.length * 2;
      } catch {
        perKey[k] = 0;
      }
    }
    return { bytes, perKey, limit: 5 * 1024 * 1024 };
  };

  // --------------------------------------------------------------------------
  // 15. SNAPSHOTS, REVISION HISTORY & FULL JSON BACKUP / RESTORE
  // --------------------------------------------------------------------------
  // Snapshots = CONTENT history (data only — bounded size). Users/security/secqa
  // are covered by the FILE backup (buildFullBackup). Old snapshots without
  // the `auto` flag are treated as manual (backward compatible).
  const createSnapshot = (customName = '', opts = {}) => {
    const { auto = false, silent = false } = opts;
    const now = new Date();
    const faDateTime = now.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    const newSnapshot = {
      id: `snap-${Date.now()}${auto ? '-auto' : ''}`,
      auto,
      name: customName || (auto ? `🤖 خودکار · ${faDateTime}` : `اسنپ‌شات ${now.toLocaleTimeString('fa-IR')}`),
      date: faDateTime,
      timestamp: Date.now(),
      boardsCount: data.boards.length,
      articlesCount: data.articles.length,
      skillsCount: (data.skills || []).reduce((acc, g) => acc + (g.items?.length || 0), 0),
      mediaCount: (data.mediaLibrary || []).length,
      data: JSON.parse(JSON.stringify(data)),
    };

    setSnapshots((prev) => {
      const next = [newSnapshot, ...(prev || [])];
      if (!auto) {
        // Manual snapshots: cap total manuals, never prune autos here.
        const manuals = next.filter((s) => !s.auto).slice(0, MAX_MANUAL_SNAPSHOTS);
        const autos = next.filter((s) => s.auto);
        return [...manuals, ...autos].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      }
      // Auto snapshots: keep only the newest few; manual ones are untouched.
      const manuals = next.filter((s) => !s.auto);
      const autos = next.filter((s) => s.auto).slice(0, MAX_AUTO_SNAPSHOTS);
      return [...manuals, ...autos].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    });
    if (!silent) showToast(`اسنپ‌شات «${newSnapshot.name}» با موفقیت ذخیره شد.`);
  };

  const restoreSnapshot = (snapshotId) => {
    const snap = snapshots.find((s) => s.id === snapshotId);
    if (!snap || !snap.data) {
      showToast('این نسخه دیتای معتبری ندارد.', 'error');
      return;
    }

    showConfirmDialog({
      type: 'warning',
      title: 'بازگشت به نسخه قبلی؟',
      message: `به نسخه «${snap.name}» برمی‌گردید. فقط محتوای سایت جایگزین می‌شود (کاربران و رمزها دست نمی‌خورند) و قبلش یک نسخه پشتیبان از وضعیت فعلی گرفته می‌شود.`,
      confirmText: 'بله، برگرد',
      onConfirm: () => {
        createSnapshot(`بک‌آپ خودکار قبل از بازگردانی ${snap.name}`);
        setData(JSON.parse(JSON.stringify(snap.data)));
        showToast(`نسخه «${snap.name}» با موفقیت بازگردانی شد.`);
      },
    });
  };

  const deleteSnapshot = (snapshotId) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== snapshotId));
    showToast('اسنپ‌شات حذف شد.');
  };

  // --- Full-site backup envelope (v4) -------------------------------------------
  // Contains EVERYTHING for disaster recovery: content, users (hashes only),
  // security settings (password/OTP stripped), recovery Q&A (hashed answers),
  // auto-backup config. Snapshots stay browser-local (20 full copies would
  // make a giant file). SMTP settings live on the server already.
  const stripSecurityForBackup = (sec) => {
    if (!sec || typeof sec !== 'object') return {};
    const { password, activeOtp, otpExpiresAt, ...safe } = sec;
    void password; void activeOtp; void otpExpiresAt;
    return safe;
  };

  const readSecQaForBackup = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(LOCAL_SECQA_KEY) || '[]');
      return Array.isArray(raw)
        ? raw.filter((r) => r && typeof r.q === 'string' && typeof r.h === 'string')
        : [];
    } catch {
      return [];
    }
  };

  const buildFullBackup = () => ({
    format: 'fullsite',
    meta: {
      app: 'Embedded Hardware Engineer Portfolio & Resume System',
      version: FULL_BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      siteTitle: data?.siteConfig?.titleFa || data?.siteConfig?.siteTitle || '',
      author: data?.personalInfo?.nameFa || '',
    },
    data,
    users,
    adminSecurity: stripSecurityForBackup(adminSecurity),
    secqa: readSecQaForBackup(),
    autoBackup: { enabled: !!autoBackup.enabled, days: autoBackup.days },
  });

  const exportDataJson = () => {
    const fullBackupObject = buildFullBackup();
    const fileName = `site_full_backup_${new Date().toISOString().split('T')[0]}.json`;
    triggerSafeDownload(fullBackupObject, fileName, 'application/json');
    showToast('فایل بک‌آپ کامل سایت دانلود شد (محتوا، کاربران، امنیت، سؤالات بازیابی).');
  };

  const copyBackupToClipboard = async () => {
    try {
      const fullBackupObject = buildFullBackup();
      await navigator.clipboard.writeText(JSON.stringify(fullBackupObject, null, 2));
      showToast('کد بک‌آپ کامل سایت در کلیپ‌بورد کپی شد!');
      return true;
    } catch (e) {
      console.error('Failed to copy to clipboard', e);
      showToast('خطا در کپی به کلیپ‌بورد (فایل حجیم است؟ دانلود را امتحان کنید.)', 'error');
      return false;
    }
  };

  // Returns false on invalid format (toast shown, no dialog). Otherwise opens
  // the themed confirm dialog and returns true; `opts.onSuccess` runs only
  // after the user confirms AND the restore completes.
  const importDataJson = (jsonString, opts = {}) => {
    try {
      const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      const targetData = parsed.data || parsed;
      const targetUsers = parsed.users;

      if (!targetData || (!targetData.boards && !targetData.personalInfo)) {
        showToast('فرمت فایل پشتیبان JSON نامعتبر است!', 'error');
        return false;
      }

      const isFull = parsed && parsed.format === 'fullsite';
      showConfirmDialog({
        type: 'warning',
        title: 'بازیابی فایل پشتیبان؟',
        message: isFull
          ? 'کل سایت (محتوا، کاربران، تنظیمات امنیتی، سؤالات بازیابی) با این فایل جایگزین می‌شود. قبلش یک نسخه پشتیبان از وضعیت فعلی گرفته می‌شود.'
          : 'محتوای سایت با این فایل جایگزین می‌شود. قبلش یک نسخه پشتیبان از وضعیت فعلی گرفته می‌شود.',
        confirmText: 'بله، بازیابی کن',
        onConfirm: () => {
            createSnapshot('بک‌آپ خودکار قبل از بازیابی JSON خارجی');
          const cleanTarget = sanitizeBackupPayload(targetData);

          setData({
            ...initialData,
            ...cleanTarget,
            boards: cleanTarget.boards || initialData.boards,
            articles: cleanTarget.articles || initialData.articles,
            skills: cleanTarget.skills || initialData.skills,
            experiences: cleanTarget.experiences || initialData.experiences,
            education: cleanTarget.education || initialData.education,
            certifications: cleanTarget.certifications || initialData.certifications,
            taxonomies: { ...initialData.taxonomies, ...(cleanTarget.taxonomies || {}) },
            mediaLibrary: cleanTarget.mediaLibrary || initialMedia,
            personalInfo: { ...initialData.personalInfo, ...(cleanTarget.personalInfo || {}) },
            siteConfig: { ...initialData.siteConfig, ...(cleanTarget.siteConfig || {}) },
            seoSettings: { ...initialData.seoSettings, ...(cleanTarget.seoSettings || {}) },
          });

          if (Array.isArray(targetUsers) && targetUsers.length > 0) {
            setUsers(targetUsers);
          }

          // Full-site envelope (v4+): also restore security, recovery Q&A, auto cfg.
          // Legacy files (bare data / v3) restore content (+users) as before.
          const restoredExtras = [];
          if (parsed && parsed.format === 'fullsite') {
            if (parsed.adminSecurity && typeof parsed.adminSecurity === 'object') {
              setAdminSecurity((prev) => ({ ...prev, ...stripSecurityForBackup(parsed.adminSecurity) }));
              restoredExtras.push('تنظیمات امنیتی');
            }
            if (Array.isArray(parsed.secqa)) {
              const cleanQa = parsed.secqa
                .filter((r) => r && typeof r.q === 'string' && typeof r.h === 'string')
                .slice(0, 3);
              try {
                localStorage.setItem(LOCAL_SECQA_KEY, JSON.stringify(cleanQa));
                if (cleanQa.length > 0) restoredExtras.push('سؤالات بازیابی');
              } catch { /* quota/private mode: content restore still succeeded */ }
            }
            if (parsed.autoBackup && typeof parsed.autoBackup === 'object') {
              const rawD =
                parsed.autoBackup.days !== undefined
                  ? parseInt(parsed.autoBackup.days, 10)
                  : Math.round((parseInt(parsed.autoBackup.minutes, 10) || 30) / 1440) || 1;
              const d = Math.max(1, Math.min(30, rawD || 7));
              setAutoBackup((prev) => ({ ...prev, enabled: !!parsed.autoBackup.enabled, days: d, deadline: 0 }));
              restoredExtras.push('تنظیمات بک‌آپ خودکار');
            }
          }

          showToast(
            restoredExtras.length > 0
              ? `کل سایت بازگردانی شد (محتوا، کاربران، ${restoredExtras.join('، ')}).`
              : 'پشتیبان با موفقیت بازگردانی شد و تمام بخش‌های سایت آپدیت شدند.'
          );
          if (opts.onSuccess) opts.onSuccess();
        },
      });
      return true;
    } catch (e) {
      console.error('Failed to import JSON', e);
      showToast('فرمت فایل پشتیبان JSON نامعتبر یا آسیب‌دیده است!', 'error');
    }
    return false;
  };

  const resetToDefaults = () => {
    showConfirmDialog({
      type: 'danger',
      title: 'بازنشانی کارخانه؟',
      message: 'تمام محتوا، کاربران، تنظیمات امنیتی و سؤالات بازیابی به حالت اولیه برمی‌گردند. قبلش یک نسخه پشتیبان گرفته می‌شود و تاریخچه نسخه‌ها (راه برگشت شما) دست‌نخورده می‌ماند.',
      confirmText: 'بله، ریست کن',
      onConfirm: () => {
        createSnapshot('بک‌آپ قبل از ریست کارخانه');
        setData(initialData);
        setUsers(DEFAULT_USERS);
        setAdminSecurity({
          recoveryEmail: initialData.personalInfo?.email || 'arash.taheri.hardware@gmail.com',
          isEmailVerified: true,
          isFirstTimeSetupComplete: true,
          activeOtp: null,
          otpExpiresAt: null,
        });
        setAutoBackup({ enabled: true, days: 7, lastRun: 0, lastSig: '', deadline: 0 });
        try {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(USERS_KEY);
          localStorage.removeItem(ADMIN_SECURITY_KEY);
          localStorage.removeItem(LOCAL_SECQA_KEY);
        } catch { /* ignore */ }
        showToast('داده‌های سایت با موفقیت به حالت کارخانه بازنشانی شدند.');
      },
    });
  };

  const toggleLanguage = () => {
    const newLang = data.siteConfig.language === 'fa' ? 'en' : 'fa';
    updateSiteConfig({ language: newLang });
    document.documentElement.dir = newLang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
    showToast(newLang === 'fa' ? 'زبان سایت: فارسی' : 'Language: English');
  };

  return (
    <DataContext.Provider
      value={{
        data,
        snapshots,
        adminSecurity,
        users,
        currentUser,
        ROLE_DEFINITIONS,
        DEFAULT_USERS,
        currentTemplate,
        isAuthenticated,
        toasts,
        dismissToast,
        showToast,
        setTemplate,
        updateSiteConfig,
        updatePersonalInfo,
        uploadMediaFile,
        deleteMediaItem,
        setFeaturedBoard,
        toggleFeaturedBoard,
        addBoard,
        updateBoard,
        deleteBoard,
        addArticle,
        updateArticle,
        deleteArticle,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        toggleLikeBlogPost,
        updateSkills,
        updateExperiences,
        updateEducation,
        updateCertifications,
        updateSeoSettings,
        updateTaxonomyOption,
        addTaxonomyOption,
        deleteTaxonomyOption,
        addMessage,
        toggleMessageRead,
        toggleMessageStar,
        deleteMessage,
        loginUser,
        loginAdmin,
        logoutUser,
        logoutAdmin,
        addUser,
        updateUser,
        deleteUser,
        switchUserForTesting,
        hasPermission,
        changeAdminPassword,
        requestPasswordResetOtp,
        verifyPasswordResetOtp,
        resetPasswordWithOtp,
        requestRecoveryEmailChange,
        confirmRecoveryEmailChange,
        updateAdminRecoverySettings,
        backend,
        refreshBackend,
        serverAccountInfo,
        setupServerAccount,
        verifyServerSetupOtp,
        skipServerSetupVerify,
        emergencyLocalReset,
        getLocalSecQaQuestions,
        saveLocalSecQa,
        isDefaultPassword,
        createSnapshot,
        restoreSnapshot,
        deleteSnapshot,
        autoBackup,
        autoBackupStatus,
        setAutoBackupConfig,
        getStorageUsage,
        buildFullBackup,
        exportDataJson,
        copyBackupToClipboard,
        importDataJson,
        resetToDefaults,
        toggleLanguage,
        autoTranslateFaToEn,
        isTemplatePickerOpen,
        setIsTemplatePickerOpen,
        isPdfModalOpen,
        setIsPdfModalOpen,
        isSearchModalOpen,
        setIsSearchModalOpen,
        isAdminOpen,
        setIsAdminOpen,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isBlogModalOpen,
        setIsBlogModalOpen,
        selectedBoard,
        setSelectedBoard,
        selectedArticle,
        setSelectedArticle,
        selectedBlogPost,
        setSelectedBlogPost,
        currentView,
        setCurrentView,
        navigateToBlog,
        navigateToPortfolio,
        dialogState,
        setDialogState,
        closeDialog,
        showConfirmDialog,
        showAlertDialog,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
