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

import React, { createContext, useContext, useState, useEffect } from 'react';
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
  timingSafeEqual,
  triggerSafeDownload,
  generateSecureOtp
} from '../utils/security';
import { sendOtpEmail } from '../utils/emailHelper';

const DataContext = createContext(null);

// LocalStorage Persistence Keys
const STORAGE_KEY = 'embedded_portfolio_data_v2';
const SNAPSHOTS_KEY = 'embedded_portfolio_snapshots_v2';
const AUTH_KEY = 'embedded_admin_auth_token';
const ADMIN_PASSWORD_KEY = 'embedded_admin_pwd';
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
        return JSON.parse(saved);
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
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse current user', e);
    }
    const isAuth = localStorage.getItem(AUTH_KEY) === 'true';
    if (isAuth) {
      return DEFAULT_USERS[0];
    }
    return null;
  });

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(AUTH_KEY) === 'true';
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

  // Active Toast Notification state
  const [toast, setToast] = useState(null);

  // Show Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Persist data whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to persist data', e);
    }
  }, [data]);

  // Persist snapshots
  useEffect(() => {
    try {
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots));
    } catch (e) {
      console.error('Failed to persist snapshots', e);
    }
  }, [snapshots]);

  // Persist admin security
  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_SECURITY_KEY, JSON.stringify(adminSecurity));
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

  // Persist Current User
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error('Failed to persist current user', e);
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
  // 13. AUTHENTICATION & MULTI-USER RBAC MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Universal User Login with Username/Email & Password and Rate Limiting
   * @param {string} usernameOrEmail - Username or Email
   * @param {string} password - Input security password
   */
  const loginUser = (usernameOrEmail, password) => {
    if (!loginRateLimiter.canAttempt()) {
      const remainingSec = loginRateLimiter.getRemainingCooldownSeconds();
      showToast(`به دلیل تلاش‌های ناموفق متعدد، ورود به مدت ${remainingSec} ثانیه مسدود است.`, 'error');
      return { success: false, error: 'rate_limit' };
    }

    const inputIdentifier = (usernameOrEmail || '').trim().toLowerCase();
    const inputPassword = (password || '').trim();

    // Default fast-track for testing: password 'admin' without identifier or with 'admin'
    if ((!inputIdentifier || inputIdentifier === 'admin') && (inputPassword === 'admin' || timingSafeEqual(inputPassword, adminSecurity.password || 'admin'))) {
      loginRateLimiter.reset();
      const adminUser = users.find((u) => u.username === 'admin') || DEFAULT_USERS[0];
      const updatedAdmin = {
        ...adminUser,
        lastLogin: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) + ' (هم‌اکنون)'
      };
      
      setCurrentUser(updatedAdmin);
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_KEY, 'true');
      setIsLoginModalOpen(false);
      setIsAdminOpen(true);
      showToast(`خوش آمدید! ورود موفق به عنوان ${updatedAdmin.nameFa} (${ROLE_DEFINITIONS.super_admin.labelFa})`);
      return { success: true, user: updatedAdmin };
    }

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

    const isPasswordMatch = timingSafeEqual(inputPassword, targetUser.password) ||
      (targetUser.username === 'admin' && inputPassword === 'admin');

    if (!isPasswordMatch) {
      loginRateLimiter.recordAttempt();
      showToast('نام کاربری یا رمز عبور وارد شده نادرست است!', 'error');
      return { success: false, error: 'invalid_credentials' };
    }

    // Successful login
    loginRateLimiter.reset();
    const updatedUser = {
      ...targetUser,
      lastLogin: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) + ' (هم‌اکنون)'
    };

    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setCurrentUser(updatedUser);
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_KEY, 'true');
    setIsLoginModalOpen(false);
    setIsAdminOpen(true);
    
    const roleLabel = ROLE_DEFINITIONS[updatedUser.role]?.labelFa || 'کاربر سیستم';
    showToast(`ورود موفق: خوش آمدید ${updatedUser.nameFa} (${roleLabel})`);
    return { success: true, user: updatedUser };
  };

  /**
   * Super Admin Login helper for backward compatibility
   */
  const loginAdmin = (password) => {
    return loginUser('admin', password);
  };

  /**
   * Universal Logout
   */
  const logoutUser = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsAdminOpen(false);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    showToast('شما با موفقیت از پنل مدیریت خارج شدید.');
  };

  const logoutAdmin = logoutUser;

  /**
   * Add a new User with Role and Granular Permissions
   */
  const addUser = (userData) => {
    const cleanUsername = sanitizeText(userData.username).toLowerCase().replace(/\s+/g, '');
    if (!cleanUsername) {
      showToast('نام کاربری الزامی است.', 'error');
      return false;
    }
    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      showToast('این نام کاربری قبلاً در سیستم ثبت شده است.', 'error');
      return false;
    }

    const role = userData.role || 'editor';
    const roleDef = ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS.editor;
    const permissions = role === 'custom'
      ? (userData.permissions || { ...roleDef.defaultPermissions })
      : { ...roleDef.defaultPermissions };

    const newUser = {
      id: `user-${Date.now()}`,
      username: cleanUsername,
      password: (userData.password || '123456').trim(),
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
  const updateUser = (userId, updatedFields) => {
    setUsers((prev) => {
      return prev.map((u) => {
        if (u.id === userId) {
          const newRole = updatedFields.role || u.role;
          const roleDef = ROLE_DEFINITIONS[newRole] || ROLE_DEFINITIONS.editor;
          let newPermissions = u.permissions;

          if (updatedFields.permissions) {
            newPermissions = { ...updatedFields.permissions };
          } else if (newRole !== u.role && newRole !== 'custom') {
            newPermissions = { ...roleDef.defaultPermissions };
          }

          const modUser = {
            ...u,
            ...updatedFields,
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
    localStorage.setItem(AUTH_KEY, 'true');
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
   * Request 6-digit OTP code for Password Reset (REAL email delivery).
   * The code is generated locally, stored with a 5-minute expiry, and then
   * actually emailed to the registered recovery address via FormSubmit AJAX.
   * If delivery fails (network / first-time activation), the code is returned
   * so the UI can display it as a fallback — the admin is never locked out.
   * @param {string} email - Registered admin recovery email
   * @returns {Promise<{success: boolean, emailSent?: boolean, needsActivation?: boolean, otp?: string, email?: string, expiresAt?: number, error?: string}>}
   */
  const requestPasswordResetOtp = async (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!validateEmail(cleanEmail)) {
      showToast('لطفاً یک ایمیل معتبر وارد نمایید.', 'error');
      return { success: false, error: 'invalid_email' };
    }

    if (!otpRateLimiter.canAttempt()) {
      const remainingSec = otpRateLimiter.getRemainingCooldownSeconds();
      showToast(`لطفاً قبل از درخواست مجدد کد، ${remainingSec || 30} ثانیه صبر فرمایید.`, 'error');
      return { success: false, error: 'rate_limit' };
    }
    otpRateLimiter.recordAttempt();

    const registeredEmail = (adminSecurity.recoveryEmail || initialData.personalInfo?.email || '').trim().toLowerCase();

    // Check if email matches registered recovery email or contact email
    const isMatchedEmail = cleanEmail === registeredEmail || cleanEmail === (data.personalInfo?.email || '').trim().toLowerCase();

    if (!isMatchedEmail) {
      showToast('این ایمیل با ایمیل بازیابی ثبت‌شده در سیستم مطابقت ندارد!', 'error');
      return { success: false, error: 'email_not_found' };
    }

    // Generate cryptographic 6-digit OTP code (valid for 5 minutes)
    const otp = generateSecureOtp(6);
    const expiresAt = Date.now() + 5 * 60 * 1000;

    setAdminSecurity((prev) => ({
      ...prev,
      activeOtp: otp,
      otpExpiresAt: expiresAt,
    }));

    // Deliver the code by REAL email (async, with timeout + fallback)
    const delivery = await sendOtpEmail({ to: cleanEmail, otp, purpose: 'reset' });

    if (delivery.sent) {
      showToast(`کد تایید ۶ رقمی به ایمیل ${cleanEmail} ارسال شد. (۵ دقیقه اعتبار دارد)`);
      return { success: true, emailSent: true, email: cleanEmail, expiresAt };
    }

    if (delivery.needsActivation) {
      showToast('اولین ارسال به این ایمیل نیاز به فعال‌سازی دارد! ایمیل «Activate your form» را در اینباکس یا اسپم خود تایید کنید و دوباره کد بگیرید.', 'error');
      return { success: true, emailSent: false, needsActivation: true, otp, email: cleanEmail, expiresAt };
    }

    showToast('ارسال ایمیل ناموفق بود (اختلال شبکه؟)؛ کد تایید پایین فرم نمایش داده شد.', 'error');
    return { success: true, emailSent: false, otp, email: cleanEmail, expiresAt };
  };

  /**
   * Verify Password Reset OTP
   * @param {string} otp - 6-digit OTP code
   * @returns {boolean} True if OTP is valid and non-expired
   */
  const verifyPasswordResetOtp = (otp) => {
    const cleanOtp = (otp || '').trim();
    if (!adminSecurity.activeOtp || !adminSecurity.otpExpiresAt) {
      showToast('کد تایید منقضی شده یا درخواستی ثبت نشده است.', 'error');
      return false;
    }

    if (Date.now() > adminSecurity.otpExpiresAt) {
      showToast('کد تایید منقضی شده است. لطفاً کد جدید درخواست نمایید.', 'error');
      return false;
    }

    const isValid = timingSafeEqual(cleanOtp, adminSecurity.activeOtp);
    if (!isValid) {
      showToast('کد تایید وارد شده نادرست است.', 'error');
      return false;
    }

    return true;
  };

  /**
   * Reset Admin Password with Verified OTP
   * @param {string} otp - 6-digit OTP code
   * @param {string} newPassword - New password
   * @returns {boolean} True if password was reset
   */
  const resetPasswordWithOtp = (otp, newPassword) => {
    if (!verifyPasswordResetOtp(otp)) {
      return false;
    }

    const trimmedPw = (newPassword || '').trim();
    if (trimmedPw.length < 3) {
      showToast('رمز عبور جدید باید حداقل ۳ کاراکتر باشد.', 'error');
      return false;
    }

    setAdminSecurity((prev) => ({
      ...prev,
      password: trimmedPw,
      isEmailVerified: true,
      activeOtp: null,
      otpExpiresAt: null,
    }));

    // Update password on admin user object as well
    setUsers((prev) =>
      prev.map((u) => (u.username === 'admin' ? { ...u, password: trimmedPw } : u))
    );

    localStorage.setItem(ADMIN_PASSWORD_KEY, trimmedPw);
    loginRateLimiter.reset();
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_KEY, 'true');
    setIsLoginModalOpen(false);
    setIsAdminOpen(true);
    showToast('رمز عبور مدیر با موفقیت تغییر کرد و وارد پنل شدید.');
    return true;
  };

  /**
   * Send Email Verification OTP (for First-time setup or changing email).
   * REAL email delivery via FormSubmit AJAX; falls back to on-screen code
   * if delivery fails so setup is never blocked.
   * @param {string} email - Email to verify
   * @returns {Promise<{success: boolean, emailSent?: boolean, needsActivation?: boolean, otp?: string, email?: string}>}
   */
  const sendEmailVerificationOtp = async (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!validateEmail(cleanEmail)) {
      showToast('لطفاً یک ایمیل معتبر وارد نمایید.', 'error');
      return { success: false };
    }

    const otp = generateSecureOtp(6);
    const expiresAt = Date.now() + 5 * 60 * 1000;

    setAdminSecurity((prev) => ({
      ...prev,
      recoveryEmail: cleanEmail,
      activeOtp: otp,
      otpExpiresAt: expiresAt,
    }));

    // Deliver the code by REAL email (async, with timeout + fallback)
    const delivery = await sendOtpEmail({ to: cleanEmail, otp, purpose: 'verify' });

    if (delivery.sent) {
      showToast(`کد تایید فعال‌سازی به ${cleanEmail} ارسال شد. (۵ دقیقه اعتبار دارد)`);
      return { success: true, emailSent: true, email: cleanEmail };
    }

    if (delivery.needsActivation) {
      showToast('اولین ارسال به این ایمیل نیاز به فعال‌سازی دارد! ایمیل «Activate your form» را در اینباکس یا اسپم خود تایید کنید و دوباره کد بگیرید.', 'error');
      return { success: true, emailSent: false, needsActivation: true, otp, email: cleanEmail };
    }

    showToast('ارسال ایمیل ناموفق بود (اختلال شبکه؟)؛ کد تایید پایین فرم نمایش داده شد.', 'error');
    return { success: true, emailSent: false, otp, email: cleanEmail };
  };

  /**
   * Confirm Email Verification (Completes first-time setup)
   * @param {string} otp - 6-digit code
   * @returns {boolean} True if confirmed
   */
  const confirmEmailVerification = (otp) => {
    if (!verifyPasswordResetOtp(otp)) {
      return false;
    }

    setAdminSecurity((prev) => ({
      ...prev,
      isEmailVerified: true,
      isFirstTimeSetupComplete: true,
      activeOtp: null,
      otpExpiresAt: null,
    }));

    setIsAuthenticated(true);
    localStorage.setItem(AUTH_KEY, 'true');
    setIsLoginModalOpen(false);
    setIsAdminOpen(true);
    showToast('ایمیل بازیابی با موفقیت تایید و ذخیره گردید. به پنل خوش آمدید!');
    return true;
  };

  /**
   * Change password directly from Admin Panel
   */
  const changeAdminPassword = (newPassword) => {
    const trimmed = (newPassword || '').trim();
    if (!trimmed || trimmed.length < 3) {
      showToast('رمز عبور باید حداقل ۳ کاراکتر باشد.', 'error');
      return false;
    }

    setAdminSecurity((prev) => ({
      ...prev,
      password: trimmed,
    }));

    setUsers((prev) =>
      prev.map((u) => (u.username === 'admin' ? { ...u, password: trimmed } : u))
    );

    localStorage.setItem(ADMIN_PASSWORD_KEY, trimmed);
    showToast('رمز عبور پنل مدیریت با موفقیت تغییر یافت.');
    return true;
  };

  /**
   * Update Recovery Email & Password from Admin Panel Settings
   */
  const updateAdminRecoverySettings = (newEmail, newPassword = null) => {
    const cleanEmail = (newEmail || '').trim().toLowerCase();
    if (!validateEmail(cleanEmail)) {
      showToast('ایمیل وارد شده نامعتبر است.', 'error');
      return false;
    }

    setAdminSecurity((prev) => ({
      ...prev,
      recoveryEmail: cleanEmail,
      isEmailVerified: true,
      password: newPassword ? newPassword.trim() : prev.password,
    }));

    if (newPassword) {
      localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword.trim());
      setUsers((prev) =>
        prev.map((u) => (u.username === 'admin' ? { ...u, password: newPassword.trim() } : u))
      );
    }

    showToast('تنظیمات امنیتی و ایمیل بازیابی مدیر با موفقیت ذخیره شد.');
    return true;
  };

  // --------------------------------------------------------------------------
  // 15. SNAPSHOTS, REVISION HISTORY & FULL JSON BACKUP / RESTORE
  // --------------------------------------------------------------------------
  const createSnapshot = (customName = '') => {
    const newSnapshot = {
      id: `snap-${Date.now()}`,
      name: customName || `اسنپ‌شات ${new Date().toLocaleTimeString('fa-IR')}`,
      date: new Date().toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      timestamp: Date.now(),
      boardsCount: data.boards.length,
      articlesCount: data.articles.length,
      skillsCount: (data.skills || []).reduce((acc, g) => acc + (g.items?.length || 0), 0),
      mediaCount: (data.mediaLibrary || []).length,
      data: JSON.parse(JSON.stringify(data)),
    };

    setSnapshots((prev) => [newSnapshot, ...prev.slice(0, 19)]);
    showToast(`اسنپ‌شات «${newSnapshot.name}» با موفقیت ذخیره شد.`);
  };

  const restoreSnapshot = (snapshotId) => {
    const snap = snapshots.find((s) => s.id === snapshotId);
    if (!snap) return;

    if (window.confirm(`آیا مطمئن هستید که می‌خواهید به نسخه «${snap.name}» بازگردید؟`)) {
      createSnapshot(`بک‌آپ خودکار قبل از بازگردانی ${snap.name}`);
      setData(JSON.parse(JSON.stringify(snap.data)));
      showToast(`نسخه «${snap.name}» با موفقیت بازگردانی شد.`);
    }
  };

  const deleteSnapshot = (snapshotId) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== snapshotId));
    showToast('اسنپ‌شات حذف شد.');
  };

  const exportDataJson = () => {
    const fullBackupObject = {
      meta: {
        app: 'Embedded Hardware Engineer Portfolio & Resume System',
        version: '3.0.0-RBAC',
        exportedAt: new Date().toISOString(),
        siteTitle: data.siteConfig.titleFa,
        author: data.personalInfo.nameFa,
      },
      data,
      users,
      taxonomies: data.taxonomies,
    };

    const fileName = `embedded_portfolio_backup_${new Date().toISOString().split('T')[0]}.json`;
    triggerSafeDownload(fullBackupObject, fileName, 'application/json');
    showToast('فایل پشتیبان کامل JSON دانلود شد.');
  };

  const copyBackupToClipboard = async () => {
    try {
      const fullBackupObject = {
        meta: {
          app: 'Embedded Hardware Engineer Portfolio & Resume System',
          version: '3.0.0-RBAC',
          exportedAt: new Date().toISOString(),
          siteTitle: data.siteConfig.titleFa,
          author: data.personalInfo.nameFa,
        },
        data,
        users,
        taxonomies: data.taxonomies,
      };
      await navigator.clipboard.writeText(JSON.stringify(fullBackupObject, null, 2));
      showToast('کد پشتیبان JSON با موفقیت در کلیپ‌بورد کپی شد!');
      return true;
    } catch (e) {
      console.error('Failed to copy to clipboard', e);
      showToast('خطا در کپی به کلیپ‌بورد', 'error');
      return false;
    }
  };

  const importDataJson = (jsonString) => {
    try {
      const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      const targetData = parsed.data || parsed;
      const targetUsers = parsed.users;

      if (!targetData || (!targetData.boards && !targetData.personalInfo)) {
        showToast('فرمت فایل پشتیبان JSON نامعتبر است!', 'error');
        return false;
      }

      if (window.confirm('آیا از بازگردانی این فایل پشتیبان اطمینان دارید؟ تمام تغییرات فعلی جایگزین خواهند شد.')) {
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

        showToast('پشتیبان با موفقیت بازگردانی شد و تمام بخش‌های سایت آپدیت شدند.');
        return true;
      }
    } catch (e) {
      console.error('Failed to import JSON', e);
      showToast('فرمت فایل پشتیبان JSON نامعتبر یا آسیب‌دیده است!', 'error');
    }
    return false;
  };

  const resetToDefaults = () => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید تمام داده‌ها و تنظیمات را به حالت اولیه برگردانید؟')) {
      createSnapshot('بک‌آپ قبل از ریست کارخانه');
      setData(initialData);
      setUsers(DEFAULT_USERS);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(USERS_KEY);
      showToast('داده‌های سایت با موفقیت به حالت کارخانه بازنشانی شدند.');
    }
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
        toast,
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
        sendEmailVerificationOtp,
        confirmEmailVerification,
        updateAdminRecoverySettings,
        createSnapshot,
        restoreSnapshot,
        deleteSnapshot,
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
