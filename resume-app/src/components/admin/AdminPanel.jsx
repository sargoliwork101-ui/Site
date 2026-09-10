import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { RichTextEditorModal } from '../common/RichTextEditorModal';
import { TaxonomyManagerModal } from '../common/TaxonomyManagerModal';
import { UserManagementSection } from './UserManagementSection';
import { BlogManagementSection } from './BlogManagementSection';
import { validateUploadFile, sanitizeSvgDataUrl } from '../../utils/security';
import { serverSmtpGet, serverSmtpSave, serverSmtpReveal, serverSmtpTest } from '../../utils/serverAuth';
import { TEMPLATES } from '../../data/templates';
import {
  LayoutDashboard,
  User,
  Cpu,
  BookOpen,
  Layers,
  Briefcase,
  Palette,
  Search,
  Mail,
  ShieldCheck,
  Save,
  Plus,
  Trash2,
  Edit,
  X,
  Download,
  Upload,
  RefreshCw,
  LogOut,
  ExternalLink,
  Key,
  Star,
  FileSpreadsheet,
  Server,
  Send,
  Eye,
  EyeOff,
  Globe,
  Sliders,
  Sparkles,
  Copy,
  Check,
  GraduationCap,
  Award,
  Image as ImageIcon,
  FolderOpen,
  FileText,
  Database,
  History,
  Bot,
  Clock3,
  RotateCcw,
  HardDriveDownload,
  HardDriveUpload,
  FileDown,
  Box,
  Activity,
  Users,
  Newspaper,
  Building2,
  Headphones,
  LayoutGrid,
  Settings
} from 'lucide-react';
import { CustomAudioPlayer } from '../common/CustomAudioPlayer';


const FAVICON_PRESETS = [
  {
    id: 'chip-cyan',
    nameFa: 'تراشه میکروالکترونیک فیروزه‌ای (Chip Cyan)',
    nameEn: 'Cyan Microchip',
    color: '#00ffcc',
    svg: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300ffcc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='4' y='4' width='16' height='16' rx='2'></rect><rect x='9' y='9' width='6' height='6'></rect><line x1='9' y1='1' x2='9' y2='4'></line><line x1='15' y1='1' x2='15' y2='4'></line><line x1='9' y1='20' x2='9' y2='23'></line><line x1='15' y1='20' x2='15' y2='23'></line><line x1='20' y1='9' x2='23' y2='9'></line><line x1='20' y1='14' x2='23' y2='14'></line><line x1='1' y1='9' x2='4' y2='9'></line><line x1='1' y1='14' x2='4' y2='14'></line></svg>",
  },
  {
    id: 'circuit-emerald',
    nameFa: 'مدار مجتمع سبز زمردی (Circuit Emerald)',
    nameEn: 'Emerald Circuit',
    color: '#10b981',
    svg: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='2' y='2' width='20' height='20' rx='5'></rect><path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z'></path><line x1='17.5' y1='6.5' x2='17.51' y2='6.5'></line></svg>",
  },
  {
    id: 'shield-security',
    nameFa: 'شیلد امنیتی سخت‌افزاری (Shield Blue)',
    nameEn: 'Hardware Shield',
    color: '#38bdf8',
    svg: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2338bdf8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'></path><path d='m9 12 2 2 4-4'></path></svg>",
  },
  {
    id: 'quantum-purple',
    nameFa: 'اتم کوانتومی بنفش (Quantum Atom)',
    nameEn: 'Quantum Atom',
    color: '#a855f7',
    svg: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a855f7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='3'></circle><ellipse cx='12' cy='12' rx='10' ry='4' transform='rotate(45 12 12)'></ellipse><ellipse cx='12' cy='12' rx='10' ry='4' transform='rotate(-45 12 12)'></ellipse></svg>",
  },
  {
    id: 'pulse-amber',
    nameFa: 'سیگنال پالس موج اسیلوسکوپ (Pulse Amber)',
    nameEn: 'Golden Pulse Wave',
    color: '#f59e0b',
    svg: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f59e0b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='22 12 18 12 15 21 9 3 6 12 2 12'></polyline></svg>",
  },
  {
    id: 'monogram-rose',
    nameFa: 'مونوگرام مهندسی رز (Monogram Rose)',
    nameEn: 'Rose Monogram',
    color: '#f43f5e',
    svg: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f43f5e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polygon points='12 2 2 22 22 22'></polygon><line x1='6' y1='15' x2='18' y2='15'></line></svg>",
  },
];

export const AdminPanel = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    logoutAdmin,
    data,
    snapshots,
    users,
    currentUser,
    switchUserForTesting,
    ROLE_DEFINITIONS,
    hasPermission,
    updatePersonalInfo,
    updateSiteConfig,
    uploadMediaFile,
    deleteMediaItem,
    addBoard,
    updateBoard,
    deleteBoard,
    addArticle,
    updateArticle,
    deleteArticle,
    updateSkills,
    updateExperiences,
    updateEducation,
    updateCertifications,
    updateSeoSettings,
    setTemplate,
    deleteMessage,
    toggleMessageRead,
    toggleMessageStar,
    changeAdminPassword,
    toggleFeaturedBoard,
    adminSecurity,
    updateAdminRecoverySettings,
    requestRecoveryEmailChange,
    confirmRecoveryEmailChange,
    saveLocalSecQa,
    getLocalSecQaQuestions,
    backend,
    serverAccountInfo,
    isDefaultPassword,
    createSnapshot,
    restoreSnapshot,
    deleteSnapshot,
    autoBackup,
    autoBackupStatus,
    setAutoBackupConfig,
    getStorageUsage,
    exportDataJson,
    copyBackupToClipboard,
    importDataJson,
    resetToDefaults,
    autoTranslateFaToEn,
    showToast,
    showConfirmDialog,
    showAlertDialog,
  } = useData();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [boardForm, setBoardForm] = useState(null);
  const [articleForm, setArticleForm] = useState(null);
  const [expForm, setExpForm] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [recoveryEmailInput, setRecoveryEmailInput] = useState(adminSecurity?.recoveryEmail || '');
  const [securityOtpInput, setSecurityOtpInput] = useState('');
  const [isVerifyingSecurityEmail, setIsVerifyingSecurityEmail] = useState(false);
  const [isSendingSecurityOtp, setIsSendingSecurityOtp] = useState(false);
  // Local recovery Q&A (gate for the emergency reset; answers are hashed)
  const [secQaForm, setSecQaForm] = useState([{ q: '', a: '' }, { q: '', a: '' }]);
  const [secQaCount, setSecQaCount] = useState(() => {
    try { return (getLocalSecQaQuestions?.() || []).length; } catch { return 0; }
  });
  const [isSavingSecQa, setIsSavingSecQa] = useState(false);
  // Notification mailbox (SMTP) — server-side only; password never in git/localStorage
  const [smtpForm, setSmtpForm] = useState({
    enabled: true,
    host: 'mail.hamedsargoli.ir',
    port: 587,
    encryption: 'starttls',
    username: 'info@hamedsargoli.ir',
    password: '',
    from: 'info@hamedsargoli.ir',
    verifyTls: true,
  });
  const [smtpMeta, setSmtpMeta] = useState({ configured: false, hasPassword: false });
  const [smtpLoading, setSmtpLoading] = useState(false);
  const [smtpSaving, setSmtpSaving] = useState(false);
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState(null);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [securityCurrentPw, setSecurityCurrentPw] = useState('');
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState(null);
  const [newSnapshotName, setNewSnapshotName] = useState('');
  const [clipboardBackupText, setClipboardBackupText] = useState('');
  // Backup-center local UI: storage meter + auto-backup countdown ticker
  const [storageUsage, setStorageUsage] = useState(null);
  const [backupTick, setBackupTick] = useState(0);

  useEffect(() => {
    if (settingsSubTab !== 'backup') return;
    try { setStorageUsage(getStorageUsage()); } catch { /* ignore */ }
    const t = setInterval(() => {
      setBackupTick((x) => x + 1);
      try { setStorageUsage(getStorageUsage()); } catch { /* ignore */ }
    }, 30000);
    return () => clearInterval(t);
  }, [settingsSubTab]);

  // Skills Editing Local State
  const [skillsList, setSkillsList] = useState(data.skills || []);
  const [newCategoryNameFa, setNewCategoryNameFa] = useState('');
  const [newCategoryNameEn, setNewCategoryNameEn] = useState('');
  const [newSkillInputs, setNewSkillInputs] = useState({});

  // Image & File upload input ref
  const fileInputRef = useRef(null);
  const backupFileInputRef = useRef(null);
  const docInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTaxonomyModalOpen, setIsTaxonomyModalOpen] = useState(false);
  const [taxonomyModalTab, setTaxonomyModalTab] = useState('boardCategories');
  const [expSubTab, setExpSubTab] = useState('experience'); // 'experience' | 'education' | 'certifications'
  const [settingsSubTab, setSettingsSubTab] = useState('layout'); // 'layout' | 'design' | 'seo' | 'taxonomies' | 'backup' | 'security'

  const faviconInputRef = useRef(null);
  const [customFaviconUrl, setCustomFaviconUrl] = useState(
    () => data.siteConfig?.faviconUrl || data.seoSettings?.faviconUrl || ''
  );

  const handleFaviconUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateUploadFile(file, { maxSizeMB: 5 });
    if (!validation.valid) {
      showToast(validation.error, 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = sanitizeSvgDataUrl(event.target?.result);
      setCustomFaviconUrl(base64);
      updateSiteConfig({ faviconUrl: base64 });
      updateSeoSettings({ faviconUrl: base64 });
      showToast('فویکون اختصاصی با موفقیت بارگذاری و در تب مرورگر اعمال گردید.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSelectFaviconPreset = (presetSvg) => {
    setCustomFaviconUrl(presetSvg);
    updateSiteConfig({ faviconUrl: presetSvg });
    updateSeoSettings({ faviconUrl: presetSvg });
    showToast('آیکون فویکون با موفقیت تغییر کرد.');
  };

  const handleBrandingSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const faviconUrl = customFaviconUrl || formData.get('faviconUrl') || data?.siteConfig?.faviconUrl || '';
    const brandNameFa = formData.get('brandNameFa') || '';
    const brandNameEn = formData.get('brandNameEn') || '';
    const taglineFa = formData.get('taglineFa') || '';
    const taglineEn = formData.get('taglineEn') || '';
    const bioFa = formData.get('bioFa') || '';
    const bioEn = formData.get('bioEn') || '';
    const copyrightFa = formData.get('copyrightFa') || '';
    const copyrightEn = formData.get('copyrightEn') || '';

    updateSiteConfig({
      faviconUrl,
      brandNameFa,
      brandNameEn,
      taglineFa,
      taglineEn,
      copyrightFa,
      copyrightEn,
    });

    updatePersonalInfo({
      fullNameFa: brandNameFa || data.personalInfo?.fullNameFa,
      fullNameEn: brandNameEn || data.personalInfo?.fullNameEn,
      nameFa: brandNameFa || data.personalInfo?.nameFa,
      nameEn: brandNameEn || data.personalInfo?.nameEn,
      taglineFa: taglineFa || data.personalInfo?.taglineFa,
      taglineEn: taglineEn || data.personalInfo?.taglineEn,
      bioFa: bioFa || data.personalInfo?.bioFa,
      bioEn: bioEn || data.personalInfo?.bioEn,
    });

    updateSeoSettings({
      faviconUrl,
      siteTitle: brandNameFa ? `${brandNameFa} | ${taglineFa || 'رزومه و پورتفولیو مهندسی'}` : data.seoSettings?.siteTitle,
      siteTitleEn: brandNameEn ? `${brandNameEn} | ${taglineEn || 'Engineering Portfolio'}` : data.seoSettings?.siteTitleEn,
      metaDescription: bioFa || data.seoSettings?.metaDescription,
      metaDescriptionEn: bioEn || data.seoSettings?.metaDescriptionEn,
    });

    showToast('تنظیمات فویکون، برندینگ و توضیحات سایت با موفقیت ذخیره شد.');
  };

  const handleSaveSecQa = async () => {
    if (isSavingSecQa) return;
    setIsSavingSecQa(true);
    try {
      const ok = await saveLocalSecQa(secQaForm);
      if (ok) {
        setSecQaForm([{ q: '', a: '' }, { q: '', a: '' }]);
        try { setSecQaCount((getLocalSecQaQuestions?.() || []).length); } catch { /* ignore */ }
      } else {
        showToast('حداقل ۲ سؤال با پاسخ (هر پاسخ حداقل ۳ کاراکتر) لازم است.', 'error');
      }
    } finally {
      setIsSavingSecQa(false);
    }
  };

  // Load the server-side SMTP mailbox whenever the Security tab opens.
  useEffect(() => {
    if (settingsSubTab !== 'security' || !backend?.available) return;
    let cancelled = false;
    setSmtpLoading(true);
    setSmtpTestResult(null);
    serverSmtpGet()
      .then((r) => {
        if (cancelled || !r?.ok || !r.smtp) return;
        setSmtpForm((prev) => ({ ...prev, ...r.smtp, password: '' }));
        setSmtpMeta({ configured: !!r.smtp.configured, hasPassword: !!r.smtp.hasPassword });
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setSmtpLoading(false); });
    return () => { cancelled = true; };
  }, [settingsSubTab, backend?.available]);

  const smtpSet = (key, value) => {
    setSmtpForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSmtp = async () => {
    if (smtpSaving || !backend?.available) return;
    setSmtpSaving(true);
    setSmtpTestResult(null);
    try {
      const r = await serverSmtpSave({ ...smtpForm, port: parseInt(smtpForm.port, 10) || 587 });
      if (r?.ok && r.smtp) {
        setSmtpForm((prev) => ({ ...prev, ...r.smtp, password: '' }));
        setSmtpMeta({ configured: !!r.smtp.configured, hasPassword: !!r.smtp.hasPassword });
        setShowSmtpPassword(false);
        showToast(r.smtp.configured ? 'صندوق ارسال اعلان‌ها ذخیره و فعال شد ✅' : 'تنظیمات SMTP ذخیره شد (هنوز کامل/فعال نیست).');
      } else {
        showToast('ذخیره تنظیمات SMTP ناموفق بود.', 'error');
      }
    } finally {
      setSmtpSaving(false);
    }
  };

  const handleRevealSmtpPassword = async () => {
    if (!backend?.available) return;
    if (showSmtpPassword) {
      setShowSmtpPassword(false);
      smtpSet('password', '');
      return;
    }
    const r = await serverSmtpReveal();
    if (r?.ok) {
      smtpSet('password', r.password || '');
      setShowSmtpPassword(true);
      if (!r.password) showToast('هنوز رمزی روی سرور ثبت نشده است.', 'error');
    } else {
      showToast('نمایش رمز ممکن نشد (دوباره وارد شوید).', 'error');
    }
  };

  const smtpTestErrorFa = (err) => {
    switch (err) {
      case 'smtp_connect': return 'اتصال به سرور SMTP برقرار نشد — هاست/پورت را چک کنید (یا فایروال هاست خروجی SMTP را بسته است).';
      case 'smtp_greet':
      case 'smtp_ehlo': return 'سرور SMTP پاسخ استاندارد نداد — هاست را بررسی کنید.';
      case 'smtp_starttls':
      case 'smtp_tls': return 'خطای TLS/STARTTLS — اگر گواهی هاست معتبر نیست، تیک «بررسی گواهی TLS» را بردارید و دوباره تست کنید.';
      case 'smtp_auth':
      case 'smtp_auth_user':
      case 'smtp_auth_pass': return 'نام کاربری یا رمز SMTP اشتباه است.';
      case 'smtp_from':
      case 'smtp_rcpt':
      case 'smtp_data':
      case 'smtp_send': return 'سرور پیام آزمایشی را قبول نکرد — آدرس فرستنده/گیرنده را بررسی کنید.';
      case 'smtp_not_configured': return 'SMTP هنوز کامل پیکربندی نشده (هاست، نام کاربری و رمز لازم است).';
      case 'no_recovery_email': return 'اول ایمیل بازیابی را در همین تب ثبت و تایید کنید.';
      case 'rate_limit': return 'تعداد تست زیاد شد — چند دقیقه دیگر تلاش کنید.';
      default: return 'ارسال ایمیل تست ناموفق بود.';
    }
  };

  const handleTestSmtp = async () => {
    if (smtpTesting || !backend?.available) return;
    setSmtpTesting(true);
    setSmtpTestResult(null);
    try {
      const r = await serverSmtpTest();
      if (r?.ok && r.sent) {
        setSmtpTestResult({ ok: true });
        showToast('✅ ایمیل تست به ایمیل بازیابی ارسال شد — اینباکس را چک کنید.');
      } else {
        setSmtpTestResult({ ok: false, error: r?.error || 'failed' });
        showToast(smtpTestErrorFa(r?.error), 'error');
      }
    } finally {
      setSmtpTesting(false);
    }
  };

  const handleSendSecurityOtp = async () => {
    const emailToUse = (recoveryEmailInput || '').trim();
    if (!emailToUse || !emailToUse.includes('@')) {
      showToast('لطفاً یک آدرس ایمیل معتبر وارد فرمایید.', 'error');
      return;
    }
    if (isSendingSecurityOtp) return;
    setIsSendingSecurityOtp(true);
    try {
      // Server mode: current password required + OTP mailed to the NEW inbox.
      // Local mode: stored directly (no email channel) — labeled honestly.
      const res = await requestRecoveryEmailChange(securityCurrentPw, emailToUse);
      if (res?.success) {
        if (res.local) {
          setIsVerifyingSecurityEmail(false);
          setSecurityOtpInput('');
          setSecurityCurrentPw('');
        } else if (res.emailSent) {
          setIsVerifyingSecurityEmail(true);
        } else {
          setIsVerifyingSecurityEmail(false);
        }
      }
    } finally {
      setIsSendingSecurityOtp(false);
    }
  };

  const handleConfirmSecurityOtp = async () => {
    const otpToUse = (securityOtpInput || '').trim();
    if (!otpToUse || otpToUse.length < 6) {
      showToast('لطفاً کد تایید ۶ رقمی را به صورت کامل وارد فرمایید.', 'error');
      return;
    }
    if (isSendingSecurityOtp) return;
    setIsSendingSecurityOtp(true);
    try {
      const ok = await confirmRecoveryEmailChange(otpToUse);
      if (ok) {
        updateAdminRecoverySettings(recoveryEmailInput);
        setIsVerifyingSecurityEmail(false);
        setSecurityOtpInput('');
        setSecurityCurrentPw('');
      }
    } finally {
      setIsSendingSecurityOtp(false);
    }
  };

  const handleChangePasswordDirect = async () => {
    if (!currentPasswordInput) {
      showToast('لطفاً رمز عبور فعلی را وارد فرمایید.', 'error');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      showToast('رمز عبور جدید باید حداقل ۸ کاراکتر باشد.', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('تکرار رمز عبور با رمز عبور جدید مطابقت ندارد.', 'error');
      return;
    }
    if (isChangingPw) return;
    setIsChangingPw(true);
    try {
      if (await changeAdminPassword(currentPasswordInput, newPassword)) {
        setCurrentPasswordInput('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } finally {
      setIsChangingPw(false);
    }
  };

  const [richEditorState, setRichEditorState] = useState({
    isOpen: false,
    title: '',
    fieldName: '',
    language: 'fa',
    initialValue: '',
    onSave: null
  });

  const [personalForm, setPersonalForm] = useState(() => ({ ...data.personalInfo }));

  const articleDocInputRef = useRef(null);
  const boardDocInputRef = useRef(null);
  const stepFileInputRef = useRef(null);

  const openRichEditor = ({ title, fieldName, language = 'fa', initialValue = '', onSave }) => {
    setRichEditorState({
      isOpen: true,
      title: title || 'ویرایشگر حرفه‌ای متن (مشابه نرم‌افزار مایکروسافت ورد)',
      fieldName: fieldName || '',
      language,
      initialValue: initialValue || '',
      onSave: (newContent) => {
        if (onSave) onSave(newContent);
      }
    });
  };

  const handleArticleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateUploadFile(file, { maxSizeMB: 25 });
    if (!validation.valid) {
      showToast(validation.error, 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result;
      setArticleForm((prev) => ({
        ...(prev || {}),
        pdfUrl: sanitizeSvgDataUrl(base64Url),
        pdfFileName: file.name,
        pdfFileSize: `${Math.round(file.size / 1024)} KB`,
        pdfFileType: file.name.split('.').pop()?.toUpperCase() || 'PDF'
      }));
      showToast(`فایل مقاله «${file.name}» با موفقیت آپلود شد.`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleBoardDatasheetUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateUploadFile(file, { maxSizeMB: 25 });
    if (!validation.valid) {
      showToast(validation.error, 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result;
      setBoardForm((prev) => ({
        ...(prev || {}),
        datasheetUrl: sanitizeSvgDataUrl(base64Url),
        datasheetFileName: file.name,
        datasheetFileSize: `${Math.round(file.size / 1024)} KB`
      }));
      showToast(`دیتاشیت برد «${file.name}» با موفقیت آپلود شد.`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleBoardStepUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateUploadFile(file, { maxSizeMB: 50 });
    if (!validation.valid) {
      showToast(validation.error, 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result;
      setBoardForm((prev) => ({
        ...(prev || {}),
        stepFileUrl: sanitizeSvgDataUrl(base64Url),
        stepFileName: file.name,
        stepFileSize: `${Math.round(file.size / 1024)} KB`
      }));
      showToast(`فایل سه‌بعدی «${file.name}» با موفقیت بارگذاری شد.`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };


  if (!isAdminOpen) return null;

  const info = data.personalInfo;
  const seo = data.seoSettings;
  const messages = data.messages || [];
  const mediaLibrary = data.mediaLibrary || [];

  const tabs = [
    { id: 'dashboard', label: 'داشبورد و وضعیت', icon: LayoutDashboard },
    { id: 'personal', label: 'اطلاعات فردی و بیو (دوزبانه)', icon: User },
    { id: 'blog', label: 'مدیریت وبلاگ و یادداشت‌ها', icon: Newspaper, count: (data?.blogPosts || []).length, badge: 'پرتال' },
    { id: 'boards', label: 'بردهای الکترونیکی و دیتاشیت', icon: Cpu, count: (data?.boards || []).length },
    { id: 'articles', label: 'مقالات تخصصی (دوزبانه)', icon: BookOpen, count: (data?.articles || []).length },
    { id: 'skills', label: 'مدیریت کارت‌ها و مهارت‌های فنی', icon: Layers, count: skillsList.reduce((acc, g) => acc + (g.items?.length || 0), 0) },
    { id: 'experience', label: 'سوابق و مدارک (دوزبانه)', icon: Briefcase },
    { id: 'media', label: 'کتابخانه رسانه و آپلود عکس', icon: ImageIcon, count: mediaLibrary.length },
    { id: 'inbox', label: 'صندوق پیام‌ها', icon: Mail, count: messages.filter((m) => !m.read).length },
    { id: 'settings', label: 'تنظیمات و پیکربندی کلان سایت', icon: Settings, badge: 'سراسری' },
  ];

  // Filter available tabs by current user role & permissions
  const userRole = currentUser?.role || 'super_admin';
  const filteredTabs = tabs.filter((tab) => {
    if (userRole === 'super_admin') return true;
    if (tab.id === 'dashboard') return true;
    if (tab.id === 'blog') return hasPermission('canManageArticles') || userRole === 'viewer';
    if (tab.id === 'boards') return hasPermission('canManageBoards') || userRole === 'viewer';
    if (tab.id === 'articles') return hasPermission('canManageArticles') || userRole === 'viewer';
    if (tab.id === 'skills') return hasPermission('canManageSkills') || userRole === 'viewer';
    if (tab.id === 'experience') return hasPermission('canManageExperience') || userRole === 'viewer';
    if (tab.id === 'personal') return hasPermission('canManageExperience') || hasPermission('canManageSkills');
    if (tab.id === 'media') return hasPermission('canManageBoards') || hasPermission('canManageArticles');
    if (tab.id === 'inbox') return hasPermission('canManageContact') || userRole === 'viewer';
    if (tab.id === 'settings') return hasPermission('canManageTemplates') || hasPermission('canManageTaxonomies') || hasPermission('canManageBackups') || hasPermission('canManageSecurity') || userRole === 'super_admin';
    if (tab.id === 'users-rbac') return hasPermission('canManageUsers') || userRole === 'admin';
    return true;
  });

  // File Upload Handler for Media Library
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const newMedia = await uploadMediaFile(file, 'بردهای الکترونیکی');
      if (mediaPickerTarget === 'board' && boardForm) {
        setBoardForm((prev) => ({ ...prev, image: newMedia.url }));
      } else if (mediaPickerTarget === 'article' && articleForm) {
        setArticleForm((prev) => ({ ...prev, coverImage: newMedia.url }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Document / PDF Upload Handler for Board Datasheets
  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const newDoc = await uploadMediaFile(file, 'دیتاشیت و اسناد PDF');
      if (boardForm) {
        setBoardForm((prev) => ({ ...prev, datasheetUrl: newDoc.url }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  // Handle Backup File Upload & Restore
  const handleBackupFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        importDataJson(content, {
          onSuccess: () => setSkillsList(data.skills || []),
        });
      }
    };
    reader.readAsText(file);
    if (backupFileInputRef.current) backupFileInputRef.current.value = '';
  };

  // Save Personal Info Form Handler (Full Bilingual + Voice Introduction)
  const handlePersonalSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updatePersonalInfo({
      fullNameFa: formData.get('fullNameFa'),
      fullNameEn: formData.get('fullNameEn'),
      titleFa: formData.get('titleFa'),
      titleEn: formData.get('titleEn'),
      taglineFa: formData.get('taglineFa'),
      taglineEn: formData.get('taglineEn'),
      bioFa: personalForm.bioFa !== undefined ? personalForm.bioFa : formData.get('bioFa'),
      bioEn: personalForm.bioEn !== undefined ? personalForm.bioEn : formData.get('bioEn'),
      locationFa: formData.get('locationFa'),
      locationEn: formData.get('locationEn'),
      statusTextFa: formData.get('statusTextFa'),
      statusTextEn: formData.get('statusTextEn'),
      introAudioUrl: formData.get('introAudioUrl') || '',
      introAudioTitleFa: formData.get('introAudioTitleFa') || '',
      introAudioTitleEn: formData.get('introAudioTitleEn') || '',
      introAudioDuration: formData.get('introAudioDuration') || '',
      email: formData.get('email'),
      phone: formData.get('phone'),
      telegram: formData.get('telegram'),
      github: formData.get('github'),
      linkedin: formData.get('linkedin'),
      website: formData.get('website'),
    });
    showToast('اطلاعات فردی دوزبانه با موفقیت ذخیره شد.');
  };

  // Save SEO Form Handler (Full Bilingual)
  const handleSeoSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateSeoSettings({
      siteTitle: formData.get('siteTitle'),
      siteTitleEn: formData.get('siteTitleEn'),
      metaDescription: formData.get('metaDescription'),
      metaDescriptionEn: formData.get('metaDescriptionEn'),
      keywords: formData.get('keywords'),
      keywordsEn: formData.get('keywordsEn'),
      canonicalUrl: formData.get('canonicalUrl'),
      author: formData.get('author'),
      authorEn: formData.get('authorEn'),
      twitterHandle: formData.get('twitterHandle'),
    });
    showToast('تنظیمات سئو دوزبانه با موفقیت ذخیره شد.');
  };

  // Save Layout & Grid Preferences (Rows * Columns = Dynamic Limit)
  const handleLayoutSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const boardsRows = parseInt(formData.get('boardsDesktopRows'), 10) || 2;
    const boardsCols = parseInt(formData.get('boardsGridColumns'), 10) || 3;
    const articlesRows = parseInt(formData.get('articlesDesktopRows'), 10) || 2;
    const articlesCols = parseInt(formData.get('articlesGridColumns'), 10) || 3;

    updateSiteConfig({
      boardsDesktopRows: boardsRows,
      boardsGridColumns: boardsCols,
      boardsDisplayLimit: boardsRows * boardsCols,
      articlesDesktopRows: articlesRows,
      articlesGridColumns: articlesCols,
      articlesDisplayLimit: articlesRows * articlesCols,
    });

    showToast('تنظیمات چیدمان ردیف‌ها و ستون‌های دسکتاپ با موفقیت ذخیره شد.');
  };

  // Save / Update Board Form (Full Bilingual + Datasheet PDF + Company Affiliation)
  const handleBoardSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const titleFa = formData.get('titleFa');
    const titleEn = formData.get('titleEn') || autoTranslateFaToEn(titleFa);
    const shortDescFa = formData.get('shortDescFa');
    const shortDescEn = formData.get('shortDescEn') || autoTranslateFaToEn(shortDescFa);
    const categoryFa = formData.get('categoryFa') || 'اینترنت اشیا و صنعتی';
    const categoryEn = formData.get('categoryEn') || autoTranslateFaToEn(categoryFa);
    const statusFa = formData.get('statusFa') || 'تولید انبوه صنعتی';
    const statusEn = formData.get('statusEn') || autoTranslateFaToEn(statusFa);
    const powerSupplyFa = formData.get('powerSupplyFa') || 'ورودی ۹ الی ۳۶ ولت DC ایزوله';
    const powerSupplyEn = formData.get('powerSupplyEn') || '9-36V DC Isolated Wide-Range DC/DC';

    const originType = formData.get('originType') || (boardForm?.isPersonalProject ? 'personal' : 'company');
    const isPersonalProject = originType === 'personal' || Boolean(boardForm?.isPersonalProject);
    const companyFa = isPersonalProject ? 'پروژه شخصی / R&D آزاد' : (formData.get('companyFa') || boardForm?.companyFa || '');
    const companyEn = isPersonalProject ? 'Personal R&D Lab' : (formData.get('companyEn') || boardForm?.companyEn || autoTranslateFaToEn(companyFa));
    const companyId = isPersonalProject ? 'personal' : (boardForm?.companyId || 'company-custom');

    const featuresFa = (formData.get('featuresFa') || '').split('\n').map((s) => s.trim()).filter(Boolean);
    const featuresEn = (formData.get('featuresEn') || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    // Read featured state directly from the checkbox (checked = on/true, unchecked = null/false)
    const isFeatured = formData.get('featured') === 'on' || formData.get('featured') === 'true';

    const boardData = {
      titleFa,
      titleEn,
      category: formData.get('category') || 'iot-industrial',
      categoryFa,
      categoryEn,
      layers: parseInt(formData.get('layers') || '4'),
      mcu: formData.get('mcu'),
      edaTool: formData.get('edaTool'),
      dimensions: formData.get('dimensions'),
      powerSupply: powerSupplyFa,
      powerSupplyEn: powerSupplyEn,
      status: statusFa,
      statusEn: statusEn,
      image: boardForm?.image || formData.get('image'),
      datasheetUrl: boardForm?.datasheetUrl || formData.get('datasheetUrl') || '',
      stepFileUrl: boardForm?.stepFileUrl || formData.get('stepFileUrl') || '',
      stepFileName: boardForm?.stepFileName || '',
      stepFileSize: boardForm?.stepFileSize || '',
      shortDescFa,
      shortDescEn,
      isPersonalProject,
      companyId,
      companyFa,
      companyEn,
      interfaces: (formData.get('interfaces') || '').split(',').map((s) => s.trim()).filter(Boolean),
      features: featuresFa,
      featuresEn: featuresEn.length > 0 ? featuresEn : featuresFa.map((f) => autoTranslateFaToEn(f)),
      githubUrl: formData.get('githubUrl'),
      featured: isFeatured,
    };

    if (boardForm.id) {
      updateBoard(boardForm.id, boardData);
    } else {
      addBoard(boardData);
    }
    setBoardForm(null);
  };

  // Save / Update Article Form (Full Bilingual)
  const handleArticleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const titleFa = formData.get('titleFa');
    const titleEn = formData.get('titleEn') || autoTranslateFaToEn(titleFa);
    const summaryFa = formData.get('summaryFa');
    const summaryEn = formData.get('summaryEn') || autoTranslateFaToEn(summaryFa);
    const categoryFa = formData.get('categoryFa') || 'طراحی سخت‌افزار';
    const categoryEn = formData.get('categoryEn') || autoTranslateFaToEn(categoryFa);
    const readTime = formData.get('readTime') || '۱۰ دقیقه';
    const readTimeEn = formData.get('readTimeEn') || '10 min read';

    const articleData = {
      titleFa,
      titleEn,
      category: categoryFa,
      categoryFa,
      categoryEn,
      readTime,
      readTimeEn,
      coverImage: articleForm?.coverImage || formData.get('coverImage'),
      summaryFa: articleForm?.summaryFa !== undefined ? articleForm.summaryFa : summaryFa,
      summaryEn: articleForm?.summaryEn !== undefined ? articleForm.summaryEn : summaryEn,
      contentMarkdownFa: articleForm?.contentMarkdownFa !== undefined ? articleForm.contentMarkdownFa : (formData.get('contentMarkdownFa') || ''),
      contentMarkdownEn: articleForm?.contentMarkdownEn !== undefined ? articleForm.contentMarkdownEn : (formData.get('contentMarkdownEn') || ''),
      pdfUrl: articleForm?.pdfUrl || formData.get('pdfUrl') || '',
      pdfFileName: articleForm?.pdfFileName || 'article_document.pdf',
      pdfFileSize: articleForm?.pdfFileSize || '',
      pdfFileType: articleForm?.pdfFileType || 'PDF',
      tags: (formData.get('tags') || '').split(',').map((s) => s.trim()).filter(Boolean),
    };

    if (articleForm.id) {
      updateArticle(articleForm.id, articleData);
    } else {
      addArticle(articleData);
    }
    setArticleForm(null);
  };

  // --- SKILLS MANAGEMENT HANDLERS (FULL BILINGUAL) ---
  const handleSkillLevelChange = (groupIdx, itemIdx, newLevel) => {
    const updated = [...skillsList];
    updated[groupIdx].items[itemIdx].level = parseInt(newLevel);
    setSkillsList(updated);
  };

  const handleSkillNameFaChange = (groupIdx, itemIdx, newName) => {
    const updated = [...skillsList];
    updated[groupIdx].items[itemIdx].nameFa = newName;
    updated[groupIdx].items[itemIdx].name = newName;
    setSkillsList(updated);
  };

  const handleSkillNameEnChange = (groupIdx, itemIdx, newNameEn) => {
    const updated = [...skillsList];
    updated[groupIdx].items[itemIdx].nameEn = newNameEn;
    setSkillsList(updated);
  };

  const handleCategoryFaChange = (groupIdx, newCatFa) => {
    const updated = [...skillsList];
    updated[groupIdx].categoryFa = newCatFa;
    setSkillsList(updated);
  };

  const handleCategoryEnChange = (groupIdx, newCatEn) => {
    const updated = [...skillsList];
    updated[groupIdx].categoryEn = newCatEn;
    setSkillsList(updated);
  };

  const handleDeleteSkillItem = (groupIdx, itemIdx) => {
    const updated = [...skillsList];
    updated[groupIdx].items.splice(itemIdx, 1);
    setSkillsList(updated);
  };

  const handleAddSkillItem = (groupIdx) => {
    const input = newSkillInputs[groupIdx] || {};
    if (!input.nameFa && !input.name) {
      showToast('لطفاً نام مهارت را وارد نمایید.', 'error');
      return;
    }

    const nameFa = input.nameFa || input.name;
    const nameEn = input.nameEn || autoTranslateFaToEn(nameFa);
    const expFa = input.experience || '۳ سال';
    const expEn = input.experienceEn || '3 Years';

    const updated = [...skillsList];
    updated[groupIdx].items.push({
      name: nameFa,
      nameFa,
      nameEn,
      level: parseInt(input.level || 85),
      experience: expFa,
      experienceEn: expEn,
      icon: 'Activity'
    });
    setSkillsList(updated);
    setNewSkillInputs({
      ...newSkillInputs,
      [groupIdx]: { nameFa: '', nameEn: '', level: 85, experience: '۳ سال', experienceEn: '3 Years' },
    });
    showToast(`مهارت «${nameFa}» اضافه شد.`);
  };

  const handleAddCategoryCard = () => {
    if (!newCategoryNameFa) {
      showToast('لطفاً عنوان کارت دسته‌بندی را وارد نمایید.', 'error');
      return;
    }
    const categoryEn = newCategoryNameEn || autoTranslateFaToEn(newCategoryNameFa) || 'Custom Engineering Skills';
    const newCard = {
      categoryFa: newCategoryNameFa,
      categoryEn,
      icon: 'Cpu',
      items: [
        { name: 'نمونه مهارت اول', nameFa: 'نمونه مهارت اول', nameEn: 'Sample Skill 1', level: 90, experience: '۴ سال', experienceEn: '4 Years', icon: 'CheckCircle2' }
      ]
    };
    const updated = [...skillsList, newCard];
    setSkillsList(updated);
    setNewCategoryNameFa('');
    setNewCategoryNameEn('');
    showToast(`کارت دسته‌بندی جدید «${newCategoryNameFa}» اضافه شد.`);
  };

  const handleDeleteCategoryCard = (groupIdx) => {
    showConfirmDialog({
      title: 'تایید حذف کارت دسته‌بندی مهارت',
      message: 'آیا از حذف کامل این کارت دسته‌بندی و تمام مهارت‌های تخصصی درون آن اطمینان دارید؟',
      type: 'danger',
      confirmText: 'بله، حذف کن',
      cancelText: 'انصراف',
      onConfirm: () => {
        const updated = skillsList.filter((_, idx) => idx !== groupIdx);
        setSkillsList(updated);
        showToast('کارت دسته‌بندی با موفقیت حذف شد.', 'info');
      }
    });
  };

  const handleSaveAllSkills = () => {
    updateSkills(skillsList);
  };

  // Experience Save (Full Bilingual)
  const handleExpSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const roleFa = formData.get('roleFa');
    const roleEn = formData.get('roleEn') || autoTranslateFaToEn(roleFa);
    const companyFa = formData.get('companyFa');
    const companyEn = formData.get('companyEn') || autoTranslateFaToEn(companyFa);
    const periodFa = formData.get('periodFa');
    const periodEn = formData.get('periodEn') || '2021 - Present';
    const locationFa = formData.get('locationFa');
    const locationEn = formData.get('locationEn') || 'Tehran, Iran';

    const achievementsFa = (formData.get('achievementsFa') || '').split('\n').map((s) => s.trim()).filter(Boolean);
    const achievementsEn = (formData.get('achievementsEn') || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const newExp = {
      id: expForm.id || 'exp-' + Date.now(),
      roleFa,
      roleEn,
      companyFa,
      companyEn,
      periodFa,
      periodEn,
      locationFa,
      locationEn,
      achievementsFa,
      achievementsEn: achievementsEn.length > 0 ? achievementsEn : achievementsFa.map((a) => autoTranslateFaToEn(a)),
      skillsUsed: (formData.get('skillsUsed') || '').split(',').map((s) => s.trim()).filter(Boolean),
    };

    let updatedExp;
    if (expForm.id) {
      updatedExp = data.experiences.map((ex) => (ex.id === expForm.id ? newExp : ex));
    } else {
      updatedExp = [newExp, ...data.experiences];
    }
    updateExperiences(updatedExp);
    setExpForm(null);
  };

  // Export Messages as CSV
  const exportMessagesCsv = () => {
    if (messages.length === 0) {
      showToast('پیامی در صندوق موجود نیست.', 'info');
      return;
    }
    const headers = ['نام', 'ایمیل', 'شرکت', 'موضوع', 'تاریخ', 'متن پیام'];
    const rows = messages.map((m) => [
      `"${m.name}"`,
      `"${m.email}"`,
      `"${m.company || ''}"`,
      `"${m.subject}"`,
      `"${m.date}"`,
      `"${m.message.replace(/"/g, '""')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contact_messages_${Date.now()}.csv`;
    a.click();
    a.remove();
    showToast('فایل اکسل پیام‌ها با موفقیت دانلود شد.');
  };


  const handleCopyClipboardBackup = async () => {
    const ok = await copyBackupToClipboard();
    if (ok) {
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 2500);
    }
  };

  const handleRestoreFromClipboard = () => {
    if (!clipboardBackupText.trim()) {
      showToast('لطفاً ابتدا کد متنی پشتیبان را در کادر پیست نمایید.', 'error');
      return;
    }
    importDataJson(clipboardBackupText.trim(), {
      onSuccess: () => {
        setClipboardBackupText('');
        setSkillsList(data.skills || []);
      },
    });
  };

  const handleCreateSnapshot = () => {
    createSnapshot(newSnapshotName);
    setNewSnapshotName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn">
      <div
        className="relative w-full max-w-7xl h-[94vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden File Input for Image Uploading */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Hidden File Input for PDF / Datasheet Uploading */}
        <input
          type="file"
          ref={docInputRef}
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleDocUpload}
        />

        {/* Hidden File Input for JSON Backup Restore */}
        <input
          type="file"
          ref={backupFileInputRef}
          accept=".json,application/json"
          className="hidden"
          onChange={handleBackupFileSelect}
        />

        {/* Admin Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  پنل مدیریت پیشرفته سایت و پورتفولیو
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                  AUTH_ACTIVE
                </span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold">
                  RBAC_ENABLED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                مدیریت تمام فیلدهای فارسی و انگلیسی، دیتاشیت‌های PDF، مهارت‌ها و سیستم کاربران
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Logged in User Profile Badge */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
              <span className="text-lg">{currentUser?.avatar || '👑'}</span>
              <div className="text-right">
                <div className="text-xs font-bold text-white leading-tight">
                  {currentUser?.nameFa || currentUser?.username || 'مدیر ارشد'}
                </div>
                <div className="text-[10px] text-cyan-400 font-mono">
                  {ROLE_DEFINITIONS[currentUser?.role || 'super_admin']?.labelFa || 'Super Admin'}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveTab('settings');
                setSettingsSubTab('backup');
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors shadow-sm cursor-pointer"
              title="مرکز پشتیبان‌گیری و انتقال"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">پشتیبان‌گیری</span>
            </button>

            {/* Single backup entry point: the header shortcut jumps to the Backup
                center (Settings → Backup). All backup/restore ops live there. */}
            <button
              onClick={logoutAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>

            <button
              onClick={() => setIsAdminOpen(false)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Workspace Layout (Sidebar Tabs + Content Area) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar Tabs */}
          <aside className="w-full md:w-64 bg-slate-950/60 border-b md:border-b-0 md:border-l border-slate-800 p-3 space-y-1 overflow-x-auto md:overflow-y-auto shrink-0 flex md:flex-col flex-row">
            {filteredTabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setBoardForm(null);
                    setArticleForm(null);
                    setExpForm(null);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 w-auto md:w-full ${
                    active
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.2 rounded-full font-bold">
                      {tab.badge}
                    </span>
                  )}
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                        active ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </aside>

          {/* Tab Content Panel */}
          <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-900/50">
            {/* 1. DASHBOARD OVERVIEW TAB */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 max-w-5xl">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="text-2xl font-black font-mono text-cyan-400">{data.boards.length}</div>
                    <div className="text-xs text-slate-400 mt-1">بردهای سخت‌افزاری</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="text-2xl font-black font-mono text-emerald-400">{data.articles.length}</div>
                    <div className="text-xs text-slate-400 mt-1">مقالات منتشر شده</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="text-2xl font-black font-mono text-amber-400">{skillsList.length} کارت</div>
                    <div className="text-xs text-slate-400 mt-1">کارت‌های مهارت فعال</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="text-2xl font-black font-mono text-purple-400">{snapshots.length}</div>
                    <div className="text-xs text-slate-400 mt-1">اسنپ‌شات‌های پشتیبان</div>
                  </div>
                </div>

                {/* Bilingual Notice */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-950 to-emerald-950/40 border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-right">
                    <h4 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                      <Globe className="w-4 h-4 text-cyan-400" />
                      <span>موتور دوزبانهٔ موازی در تمامی بخش‌های سایت فعال است</span>
                    </h4>
                    <p className="text-xs text-slate-300">
                      زیر هر فیلد فارسی، فیلد انگلیسی متناظر قرار داده شده است. هنگامی که کاربر زبان سایت را روی انگلیسی قرار دهد، متون انگلیسی نمایش داده می‌شوند و با تغییر زبان به فارسی، متون فارسی خوانده خواهند شد.
                    </p>
                  </div>
                </div>
              </div>
            )}



            {/* BLOG & ENGINEERING INSIGHTS MANAGEMENT TAB */}
            {activeTab === 'blog' && (
              <BlogManagementSection />
            )}

            {/* 3. MEDIA LIBRARY TAB */}
            {activeTab === 'media' && (
              <div className="space-y-6 max-w-5xl">
                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-cyan-400" />
                      <span>کتابخانه رسانه و اسناد</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      آپلود تصاویر بردها، شماتیک‌ها و فایل‌های PDF دیتاشیت.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-xl"
                    >
                      <Upload className="w-4 h-4" />
                      <span>آپلود تصویر جدید</span>
                    </button>

                    <button
                      onClick={() => docInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-xl"
                    >
                      <FileText className="w-4 h-4" />
                      <span>آپلود فایل PDF دیتاشیت</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {mediaLibrary.map((item) => (
                    <div
                      key={item.id}
                      className="group relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col justify-between"
                    >
                      <div className="aspect-[4/3] bg-slate-900 relative overflow-hidden flex items-center justify-center">
                        {item.type === 'application/pdf' || item.name.endsWith('.pdf') ? (
                          <div className="flex flex-col items-center justify-center text-emerald-400 p-4 text-center">
                            <FileText className="w-10 h-10 mb-2" />
                            <span className="text-[10px] font-mono font-bold">PDF DOCUMENT</span>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                      </div>

                      <div className="p-3 space-y-1.5">
                        <div className="text-xs font-bold text-white truncate" title={item.name}>
                          {item.name}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>{item.size}</span>
                          <span>{item.date}</span>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(item.url);
                              showToast('آدرس فایل در حافظه کپی شد.');
                            }}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 text-[10px] flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>کپی URL</span>
                          </button>

                          <button
                            onClick={() => deleteMediaItem(item.id)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-rose-400 text-[10px]"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. PERSONAL INFO TAB (WITH ENGLISH FIELD UNDER EACH PERSIAN FIELD) */}
            {activeTab === 'personal' && (
              <form onSubmit={handlePersonalSubmit} className="space-y-6 max-w-4xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-cyan-400" />
                      <span>مشخصات فردی و بیوگرافی (فیلد انگلیسی زیر هر فیلد فارسی)</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      متن انگلیسی وارد شده هنگام انتخاب زبان انگلیسی در سایت به نمایش درمی‌آید.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shrink-0"
                  >
                    <Save className="w-4 h-4" />
                    <span>ذخیره تغییرات</span>
                  </button>
                </div>

                {/* 1. Full Name */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">نام و نام خانوادگی (فارسی):</label>
                    <input
                      name="fullNameFa"
                      defaultValue={info.fullNameFa}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-cyan-400 mb-1">Full Name (English):</label>
                    <input
                      name="fullNameEn"
                      defaultValue={info.fullNameEn}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* 2. Job Title */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">عنوان شغلی و تخصص (فارسی):</label>
                    <input
                      name="titleFa"
                      defaultValue={info.titleFa}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-cyan-400 mb-1">Job Title / Specialty (English):</label>
                    <input
                      name="titleEn"
                      defaultValue={info.titleEn}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* 3. Tagline */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">شعار و تگ‌لاین شغلی (فارسی):</label>
                    <input
                      name="taglineFa"
                      defaultValue={info.taglineFa}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-cyan-400 mb-1">Professional Tagline (English):</label>
                    <input
                      name="taglineEn"
                      defaultValue={info.taglineEn}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* 4. Biography */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-white">متن کامل بیوگرافی و معرفی (فارسی):</label>
                      <button
                        type="button"
                        onClick={() => openRichEditor({
                          title: 'ویرایشگر حرفه‌ای ورد: متن کامل بیوگرافی (فارسی)',
                          fieldName: 'Biography (FA)',
                          language: 'fa',
                          initialValue: personalForm.bioFa || info.bioFa || '',
                          onSave: (val) => setPersonalForm((prev) => ({ ...prev, bioFa: val }))
                        })}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                        <span>باز کردن در ادیتور کامل ورد</span>
                      </button>
                    </div>
                    <textarea
                      name="bioFa"
                      rows={4}
                      value={personalForm.bioFa !== undefined ? personalForm.bioFa : (info.bioFa || '')}
                      onChange={(e) => setPersonalForm({ ...personalForm, bioFa: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white resize-none leading-relaxed"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-cyan-400">Complete Biography (English):</label>
                      <button
                        type="button"
                        onClick={() => openRichEditor({
                          title: 'Professional Word Editor: Complete Biography (EN)',
                          fieldName: 'Biography (EN)',
                          language: 'en',
                          initialValue: personalForm.bioEn || info.bioEn || '',
                          onSave: (val) => setPersonalForm((prev) => ({ ...prev, bioEn: val }))
                        })}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                        <span>Open in Word Editor</span>
                      </button>
                    </div>
                    <textarea
                      name="bioEn"
                      rows={4}
                      value={personalForm.bioEn !== undefined ? personalForm.bioEn : (info.bioEn || '')}
                      onChange={(e) => setPersonalForm({ ...personalForm, bioEn: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* 5. Location */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">موقعیت مکانی و شهر (فارسی):</label>
                    <input
                      name="locationFa"
                      defaultValue={info.locationFa}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-cyan-400 mb-1">Location / City (English):</label>
                    <input
                      name="locationEn"
                      defaultValue={info.locationEn || 'Tehran, Iran'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* 6. Status Text */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">متن وضعیت کاری و در دسترس بودن (فارسی):</label>
                    <input
                      name="statusTextFa"
                      defaultValue={info.statusTextFa}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-cyan-400 mb-1">Work Status Text (English):</label>
                    <input
                      name="statusTextEn"
                      defaultValue={info.statusTextEn || 'Available for PCB Design Projects'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Contact Channels */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <h5 className="text-xs font-bold text-white">راه‌های ارتباطی:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">ایمیل</label>
                      <input
                        name="email"
                        defaultValue={info.email}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">تلفن</label>
                      <input
                        name="phone"
                        defaultValue={info.phone}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">تلگرام</label>
                      <input
                        name="telegram"
                        defaultValue={info.telegram}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">گیت‌هاب</label>
                      <input
                        name="github"
                        defaultValue={info.github}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">لینکدین</label>
                      <input
                        name="linkedin"
                        defaultValue={info.linkedin}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">وب‌سایت</label>
                      <input
                        name="website"
                        defaultValue={info.website}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Voice Introduction Audio Section (Optional) */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Headphones className="w-4 h-4 text-cyan-400" />
                      <span>پیام صوتی معرفی شخصی در هدر رزومه (اختیاری):</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    با قرار دادن لینک فایل صوتی (مثلاً معرفی ۳۰ ثانیه‌ای از تجارب مهندسی خود)، دکمه پخش صدای شما در کنار دکمه‌های اصلی هدر قرار می‌گیرد. در صورت خالی بودن این فیلد، هیچ فضای خالی یا نقصی در سایت نمایش داده نمی‌شود.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-slate-300 mb-1">آدرس اینترنتی فایل صوتی معرفی (MP3 / WAV URL):</label>
                      <input
                        name="introAudioUrl"
                        defaultValue={info.introAudioUrl || ''}
                        placeholder="https://.../intro.mp3"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">طول مدت پیام صوتی:</label>
                      <input
                        name="introAudioDuration"
                        defaultValue={info.introAudioDuration || '0:45'}
                        placeholder="0:45"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">عنوان پیام صوتی (فارسی):</label>
                      <input
                        name="introAudioTitleFa"
                        defaultValue={info.introAudioTitleFa || 'پیام صوتی معرفی مهندس آرش طاهری'}
                        placeholder="پیام صوتی معرفی مهندس..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-cyan-400 mb-1">Voice Intro Title (English):</label>
                      <input
                        name="introAudioTitleEn"
                        defaultValue={info.introAudioTitleEn || 'Arash Taheri - Voice Introduction'}
                        placeholder="Arash Taheri - Voice Introduction"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {info.introAudioUrl && (
                    <div className="pt-2">
                      <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">پیش‌نمایش زنده پلیر معرفی:</span>
                      <CustomAudioPlayer
                        audioUrl={info.introAudioUrl}
                        titleFa={info.introAudioTitleFa}
                        titleEn={info.introAudioTitleEn}
                        durationStr={info.introAudioDuration}
                        isFa={true}
                        variant="hero"
                      />
                    </div>
                  )}
                </div>
              </form>
            )}

            {/* 5. HARDWARE BOARDS TAB (WITH ENGLISH FIELD UNDER EACH PERSIAN FIELD) */}
            {activeTab === 'boards' && (
              <div className="space-y-6 max-w-5xl">
                {boardForm ? (
                  <form onSubmit={handleBoardSave} className="space-y-5 p-6 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                          <Cpu className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-white">
                            {boardForm.id ? 'ویرایش مشخصات برد سخت‌افزاری' : 'افزودن برد الکترونیکی جدید'}
                          </h4>
                          <p className="text-xs text-slate-400">تمام فیلدها دارای بخش فارسی و انگلیسی مجزا و متصل به ادیتور هستند.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBoardForm(null)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white"
                      >
                        انصراف
                      </button>
                    </div>

                    {/* 1. Board Title Persian & English */}
                    <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-white mb-1">عنوان برد سخت‌افزاری (فارسی):</label>
                        <input
                          name="titleFa"
                          required
                          defaultValue={boardForm.titleFa || ''}
                          placeholder="مثال: گیت‌وی صنعتی چندپروتکله IoT (RT-Gateway Pro)"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-cyan-400 mb-1">Board Title (English):</label>
                        <input
                          name="titleEn"
                          defaultValue={boardForm.titleEn || ''}
                          placeholder="e.g. Industrial Multi-Protocol IoT Gateway (RT-Gateway Pro)"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    {/* 2. Category Dropdown & Options Manager */}
                    <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white">دسته‌بندی سیستمی برد:</label>
                        <button
                          type="button"
                          onClick={() => {
                            setTaxonomyModalTab('boardCategories');
                            setIsTaxonomyModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>⚙️ مدیریت و تغییر نام دسته‌ها (همگام‌سازی خودکار)</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-300 mb-1">انتخاب دسته (فارسی):</label>
                          <select
                            name="categoryFa"
                            defaultValue={boardForm.categoryFa || 'اینترنت اشیا و صنعتی (IoT)'}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                          >
                            {(data.taxonomies?.boardCategories || []).map((cat) => (
                              <option key={cat.id} value={cat.labelFa}>{cat.labelFa}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-cyan-400 mb-1">Category Title (English):</label>
                          <select
                            name="categoryEn"
                            defaultValue={boardForm.categoryEn || 'IoT & Industrial'}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                          >
                            {(data.taxonomies?.boardCategories || []).map((cat) => (
                              <option key={cat.id} value={cat.labelEn}>{cat.labelEn}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* 2.5 Origin & Company Affiliation (Bilingual) */}
                    <div className="p-4 rounded-2xl bg-slate-900/70 border border-cyan-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-cyan-400" />
                          <span>وابستگی سازمانی و محل اجرای پروژه (تولید شرکتی / آزمایشگاه شخصی):</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-300 mb-1">نوع پروژه (فارسی):</label>
                          <select
                            name="originType"
                            value={boardForm.isPersonalProject || boardForm.companyId === 'personal' ? 'personal' : 'company'}
                            onChange={(e) => {
                              const isPers = e.target.value === 'personal';
                              setBoardForm((prev) => ({
                                ...prev,
                                isPersonalProject: isPers,
                                companyId: isPers ? 'personal' : (data.experiences?.[0]?.id || 'company-1'),
                                companyFa: isPers ? 'پروژه شخصی / R&D آزاد' : (data.experiences?.[0]?.companyFa || ''),
                                companyEn: isPers ? 'Personal R&D Lab' : (data.experiences?.[0]?.companyEn || '')
                              }));
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                          >
                            <option value="company">🏢 پروژه شرکتی / صنعتی (تولیدشده در کارفرما)</option>
                            <option value="personal">🔬 پروژه شخصی و تحقیقات آزاد (Personal R&D)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-cyan-400 mb-1">Affiliation Type (English):</label>
                          <div className="text-xs font-mono px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300">
                            {boardForm.isPersonalProject || boardForm.companyId === 'personal' ? 'Personal R&D Lab' : 'Corporate / Industrial Production'}
                          </div>
                        </div>
                      </div>

                      {/* If Corporate, show company selector & custom name inputs */}
                      {!(boardForm.isPersonalProject || boardForm.companyId === 'personal') && (
                        <div className="pt-2 border-t border-slate-800/80 space-y-3">
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">انتخاب سریع از سوابق شغلی:</label>
                            <select
                              value={boardForm.companyId || ''}
                              onChange={(e) => {
                                const exp = (data.experiences || []).find(x => x.id === e.target.value);
                                if (exp) {
                                  setBoardForm((prev) => ({
                                    ...prev,
                                    companyId: exp.id,
                                    companyFa: exp.companyFa,
                                    companyEn: exp.companyEn
                                  }));
                                }
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-300"
                            >
                              <option value="">-- انتخاب از سوابق شغلی یا تایپ دستی در زیر --</option>
                              {(data.experiences || []).map((exp) => (
                                <option key={exp.id} value={exp.id}>
                                  {exp.companyFa} ({exp.companyEn})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-white mb-1">نام شرکت / سازمان (فارسی):</label>
                              <input
                                name="companyFa"
                                value={boardForm.companyFa || ''}
                                onChange={(e) => setBoardForm((prev) => ({ ...prev, companyFa: e.target.value }))}
                                placeholder="مثال: صنایع الکترونیک زعیم"
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-cyan-400 mb-1">Company / Organization (English):</label>
                              <input
                                name="companyEn"
                                value={boardForm.companyEn || ''}
                                onChange={(e) => setBoardForm((prev) => ({ ...prev, companyEn: e.target.value }))}
                                placeholder="e.g. Zaeim Electronic Industries"
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 3. Layers Count & Stackup Details (Full Bilingual) */}
                    <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-white mb-1">تعداد عددی لایه‌ها:</label>
                          <select
                            name="layers"
                            defaultValue={boardForm.layers || 4}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono font-bold"
                          >
                            <option value="2">2 لایه (Double-Sided)</option>
                            <option value="4">4 لایه (Standard Multilayer)</option>
                            <option value="6">6 لایه (High-Density High-Speed)</option>
                            <option value="8">8 لایه (FPGA & Complex DSP)</option>
                            <option value="10">10 لایه (Ultra High-Speed Backplane)</option>
                            <option value="12">12 لایه (Server / PCIe Gen4)</option>
                            <option value="16">16 لایه (HDI Microvias Array)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-white mb-1">شرح استک‌آپ لایه‌ها (فارسی):</label>
                          <input
                            name="layersFa"
                            defaultValue={boardForm.layersFa || `${boardForm.layers || 4} لایه با کنترل امپدانس`}
                            placeholder="مثال: ۶ لایه با کنترل دقیق امپدانس دیفرانسیلی"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-cyan-400 mb-1">Layer Stackup (English):</label>
                          <input
                            name="layersEn"
                            defaultValue={boardForm.layersEn || `${boardForm.layers || 4}-Layer Stackup`}
                            placeholder="e.g. 6-Layer Differential Controlled Impedance"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 4. Dimensions & Physical Form-Factor (Full Bilingual) */}
                    <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-white mb-1">ابعاد فیزیکی و کیس برد (فارسی):</label>
                          <input
                            name="dimensionsFa"
                            defaultValue={boardForm.dimensionsFa || boardForm.dimensions || '۱۰۵ × ۷۵ میلی‌متر استاندارد صنعتی'}
                            placeholder="مثال: ۱۰۵ × ۷۵ میلی‌متر (قاب استاندارد ریل DIN)"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-cyan-400 mb-1">Physical Dimensions (English):</label>
                          <input
                            name="dimensionsEn"
                            defaultValue={boardForm.dimensionsEn || boardForm.dimensions || '105 x 75 mm (DIN-Rail Enclosure)'}
                            placeholder="e.g. 105 x 75 mm (Standard Form-Factor)"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 5. MCU / Core Processor (Full Bilingual) */}
                    <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-white mb-1">پردازنده و تراشه اصلی (فارسی):</label>
                          <input
                            name="mcuFa"
                            defaultValue={boardForm.mcuFa || boardForm.mcu || 'میکروکنترلر دوهسته‌ای STM32H743ZI'}
                            placeholder="مثال: STM32H743ZI (۴۸۰ مگاهرتز Cortex-M7) + وای‌فای ESP32"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-300"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-cyan-400 mb-1">Core Processor / MCU (English):</label>
                          <input
                            name="mcuEn"
                            defaultValue={boardForm.mcuEn || boardForm.mcu || 'STM32H743ZI (480MHz Cortex-M7)'}
                            placeholder="e.g. STM32H743ZI (480MHz ARM Cortex-M7) + ESP32"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 6. EDA Design Tool (Dropdown + Options Manager) */}
                    <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white">نرم‌افزار طراحی مدارات الکترونیکی (EDA Tool):</label>
                        <button
                          type="button"
                          onClick={() => {
                            setTaxonomyModalTab('edaTools');
                            setIsTaxonomyModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>⚙️ مدیریت نرم‌افزارهای EDA</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-300 mb-1">نرم‌افزار (فارسی):</label>
                          <select
                            name="edaToolFa"
                            defaultValue={boardForm.edaToolFa || boardForm.edaTool || 'آلتیوم دیزاینر (Altium Designer 24)'}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                          >
                            {(data.taxonomies?.edaTools || []).map((tool) => (
                              <option key={tool.id} value={tool.labelFa}>{tool.labelFa}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-cyan-400 mb-1">EDA Software (English):</label>
                          <select
                            name="edaToolEn"
                            defaultValue={boardForm.edaToolEn || boardForm.edaTool || 'Altium Designer 24'}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                          >
                            {(data.taxonomies?.edaTools || []).map((tool) => (
                              <option key={tool.id} value={tool.labelEn}>{tool.labelEn}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* 7. Production & Deployment Status (Dropdown + Options Manager) */}
                    <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white">وضعیت تولید و استقرار تجاری:</label>
                        <button
                          type="button"
                          onClick={() => {
                            setTaxonomyModalTab('boardStatuses');
                            setIsTaxonomyModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>⚙️ مدیریت وضعیت‌های تولید</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-300 mb-1">وضعیت (فارسی):</label>
                          <select
                            name="statusFa"
                            defaultValue={boardForm.statusFa || boardForm.status || 'تولید انبوه و عملیاتی در خط تولید'}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-300"
                          >
                            {(data.taxonomies?.boardStatuses || []).map((st) => (
                              <option key={st.id} value={st.labelFa}>{st.labelFa}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-cyan-400 mb-1">Status (English):</label>
                          <select
                            name="statusEn"
                            defaultValue={boardForm.statusEn || 'Mass Production & Active in Industry'}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-300 font-mono"
                          >
                            {(data.taxonomies?.boardStatuses || []).map((st) => (
                              <option key={st.id} value={st.labelEn}>{st.labelEn}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* 8. Power Supply Input (Full Bilingual) */}
                    <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-white mb-1">منبع تغذیه و ورودی توان (فارسی):</label>
                          <input
                            name="powerSupplyFa"
                            defaultValue={boardForm.powerSupplyFa || boardForm.powerSupply || 'ورودی ۹ الی ۳۶ ولت DC ایزوله'}
                            placeholder="مثال: ورودی ۹ الی ۳۶ ولت DC ایزوله با فیلتر EMI"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-cyan-400 mb-1">Power Supply Input (English):</label>
                          <input
                            name="powerSupplyEn"
                            defaultValue={boardForm.powerSupplyEn || '9-36V DC Isolated Wide-Range DC/DC'}
                            placeholder="e.g. 9-36V DC Isolated Wide-Range with Surge Suppression"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 9. Interfaces & Fieldbuses (Full Bilingual) */}
                    <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-white mb-1">پروتکل‌ها و رابط‌های ارتباطی (فارسی - با کاما جدا کنید):</label>
                          <input
                            name="interfacesFa"
                            defaultValue={Array.isArray(boardForm.interfacesFa) ? boardForm.interfacesFa.join(', ') : (boardForm.interfaces?.join(', ') || 'CAN-FD, RS-485, LoRaWAN, USB-C')}
                            placeholder="مثال: دو کانال CAN-FD, رابط RS-485, ماژول LoRaWAN"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-cyan-400 mb-1">Interfaces & Buses (English - Comma separated):</label>
                          <input
                            name="interfacesEn"
                            defaultValue={Array.isArray(boardForm.interfacesEn) ? boardForm.interfacesEn.join(', ') : (boardForm.interfaces?.join(', ') || 'Dual CAN-FD, RS-485, LoRaWAN, USB Type-C')}
                            placeholder="e.g. Dual CAN-FD, Isolated RS-485, LoRaWAN 868MHz, USB Type-C"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 10. Short Description Persian & English with Word Editor */}
                    <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-white">توضیحات خلاصه برد (فارسی):</label>
                          <button
                            type="button"
                            onClick={() => openRichEditor({
                              title: 'ویرایشگر حرفه‌ای ورد: توضیحات برد (فارسی)',
                              fieldName: 'Board Description (FA)',
                              language: 'fa',
                              initialValue: boardForm.shortDescFa || '',
                              onSave: (val) => setBoardForm((prev) => ({ ...prev, shortDescFa: val }))
                            })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-all hover:scale-105"
                          >
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            <span>ویرایش در ادیتور ورد</span>
                          </button>
                        </div>
                        <textarea
                          name="shortDescFa"
                          rows={2}
                          value={boardForm.shortDescFa || ''}
                          onChange={(e) => setBoardForm({ ...boardForm, shortDescFa: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white resize-none"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-cyan-400">Short Description (English):</label>
                          <button
                            type="button"
                            onClick={() => openRichEditor({
                              title: 'Professional Word Editor: Board Description (EN)',
                              fieldName: 'Board Description (EN)',
                              language: 'en',
                              initialValue: boardForm.shortDescEn || '',
                              onSave: (val) => setBoardForm((prev) => ({ ...prev, shortDescEn: val }))
                            })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all hover:scale-105"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            <span>Open in Word Editor</span>
                          </button>
                        </div>
                        <textarea
                          name="shortDescEn"
                          rows={2}
                          value={boardForm.shortDescEn || ''}
                          onChange={(e) => setBoardForm({ ...boardForm, shortDescEn: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono resize-none"
                        />
                      </div>
                    </div>

                    {/* 11. Key Features Persian & English with Word Editor */}
                    <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-white">ویژگی‌های شاخص (فارسی - هر خط یک مورد):</label>
                          <button
                            type="button"
                            onClick={() => openRichEditor({
                              title: 'ویرایشگر حرفه‌ای ورد: ویژگی‌های برد (فارسی)',
                              fieldName: 'Board Features (FA)',
                              language: 'fa',
                              initialValue: Array.isArray(boardForm.features) ? boardForm.features.join('\n') : (boardForm.featuresFa || ''),
                              onSave: (val) => setBoardForm((prev) => ({ ...prev, featuresFa: val, features: val.split('\n').map(s => s.trim()).filter(Boolean) }))
                            })}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                            <span>ادیتور ورد (لیست بالت‌ها)</span>
                          </button>
                        </div>
                        <textarea
                          name="featuresFa"
                          rows={3}
                          value={Array.isArray(boardForm.features) ? boardForm.features.join('\n') : (boardForm.featuresFa || '')}
                          onChange={(e) => setBoardForm({ ...boardForm, featuresFa: e.target.value, features: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white resize-none"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-cyan-400">Key Features (English - One per line):</label>
                          <button
                            type="button"
                            onClick={() => openRichEditor({
                              title: 'Professional Word Editor: Board Features (EN)',
                              fieldName: 'Board Features (EN)',
                              language: 'en',
                              initialValue: Array.isArray(boardForm.featuresEn) ? boardForm.featuresEn.join('\n') : (boardForm.featuresEn || ''),
                              onSave: (val) => setBoardForm((prev) => ({ ...prev, featuresEn: val.split('\n').map(s => s.trim()).filter(Boolean) }))
                            })}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                            <span>Open in Word Editor</span>
                          </button>
                        </div>
                        <textarea
                          name="featuresEn"
                          rows={3}
                          value={Array.isArray(boardForm.featuresEn) ? boardForm.featuresEn.join('\n') : (boardForm.featuresEn || '')}
                          onChange={(e) => setBoardForm({ ...boardForm, featuresEn: e.target.value, features: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono resize-none"
                        />
                      </div>
                    </div>

                    {/* 12. Main Image Upload */}
                    <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-cyan-400" />
                          <span>تصویر اصلی برد الکترونیکی:</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setMediaPickerTarget('board');
                            fileInputRef.current?.click();
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-bold"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>آپلود تصویر</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        {boardForm.image && (
                          <img
                            src={boardForm.image}
                            alt="Preview"
                            className="w-20 h-14 rounded-lg object-cover border border-slate-700 shrink-0 shadow"
                          />
                        )}
                        <input
                          name="image"
                          value={boardForm.image || ''}
                          onChange={(e) => setBoardForm({ ...boardForm, image: e.target.value })}
                          placeholder="آدرس تصویر (URL یا آپلود مستقیم)..."
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* 13. Datasheet PDF Direct Upload & Link */}
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileDown className="w-4 h-4 text-emerald-400" />
                          <label className="text-xs font-bold text-white">آپلود مستقیم دیتاشیت و مستندات فنی برد (PDF):</label>
                        </div>
                        <input
                          type="file"
                          ref={boardDocInputRef}
                          onChange={handleBoardDatasheetUpload}
                          accept=".pdf,.docx,.doc"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => boardDocInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>آپلود فایل دیتاشیت PDF</span>
                        </button>
                      </div>

                      {boardForm?.datasheetUrl && boardForm.datasheetUrl !== '#' ? (
                        <div className="p-3 rounded-xl bg-slate-950 border border-emerald-900/50 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="text-xs truncate">
                              <p className="font-bold text-white truncate">{boardForm.datasheetFileName || 'دیتاشیت ضمیمه شده برد'}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{boardForm.datasheetFileSize || 'فایل بارگذاری شده'} • PDF</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={boardForm.datasheetUrl}
                              download={boardForm.datasheetFileName || 'datasheet.pdf'}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 font-semibold"
                            >
                              دانلود تست
                            </a>
                            <button
                              type="button"
                              onClick={() => setBoardForm((prev) => ({ ...prev, datasheetUrl: '', datasheetFileName: '', datasheetFileSize: '' }))}
                              className="p-1 rounded-lg hover:bg-rose-900/40 text-rose-400"
                              title="حذف دیتاشیت"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400">
                          می‌توانید فایل PDF دیتاشیت برد را مستقیماً آپلود فرمایید یا آدرس لینک آن را در کادر زیر وارد کنید.
                        </p>
                      )}

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">یا آدرس اینترنتی مستقیم دیتاشیت (URL):</label>
                        <input
                          name="datasheetUrl"
                          value={boardForm.datasheetUrl || ''}
                          onChange={(e) => setBoardForm({ ...boardForm, datasheetUrl: e.target.value })}
                          placeholder="https://example.com/datasheet.pdf"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* 13.5 STEP / 3D CAD File Direct Upload & Link */}
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Box className="w-4 h-4 text-cyan-400" />
                          <label className="text-xs font-bold text-white">فایل مدل سه‌بعدی CAD / STEP برد (3D Model - اختیاری):</label>
                        </div>
                        <input
                          type="file"
                          ref={stepFileInputRef}
                          onChange={handleBoardStepUpload}
                          accept=".step,.stp,.glb,.gltf,.obj"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => stepFileInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>آپلود فایل ۳D STEP</span>
                        </button>
                      </div>

                      {boardForm?.stepFileUrl ? (
                        <div className="p-3 rounded-xl bg-slate-950 border border-cyan-900/50 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400">
                              <Box className="w-4 h-4" />
                            </div>
                            <div className="text-xs truncate">
                              <p className="font-bold text-white truncate">{boardForm.stepFileName || 'فایل سه‌بعدی STEP ضمیمه شده'}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{boardForm.stepFileSize || 'فایل سه‌بعدی'} • 3D CAD</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setBoardForm((prev) => ({ ...prev, stepFileUrl: '', stepFileName: '', stepFileSize: '' }))}
                              className="p-1 rounded-lg hover:bg-rose-900/40 text-rose-400"
                              title="حذف فایل ۳D"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400">
                          در صورت آپلود فایل STEP یا 3D CAD، تب نمای سه‌بعدی فعال می‌شود. در صورت خالی بودن، به صورت خودکار فقط عکس و جزئیات نمایش داده می‌شوند.
                        </p>
                      )}

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">یا آدرس اینترنتی مستقیم فایل STEP / 3D CAD (اختیاری):</label>
                        <input
                          name="stepFileUrl"
                          value={boardForm.stepFileUrl || ''}
                          onChange={(e) => setBoardForm({ ...boardForm, stepFileUrl: e.target.value })}
                          placeholder="https://example.com/models/rt-gateway.step"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* 14. GitHub URL */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">لینک گیت‌هاب / سورس کد و شماتیک (اختیاری):</label>
                      <input
                        name="githubUrl"
                        defaultValue={boardForm.githubUrl || ''}
                        placeholder="https://github.com/..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                      />
                    </div>

                    {/* 15. FEATURED HERO PROJECT TOGGLE */}
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                      <div>
                        <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5 cursor-pointer">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span>تعیین به عنوان «پروژه شاخص» در هدر و صفحه اصلی (Featured Hero Project)</span>
                        </label>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          با انتخاب این گزینه، این برد به عنوان پروژه برگزیده در هدر بالای صفحه و در بخش شبیه‌ساز PCB نمایش داده می‌شود.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        name="featured"
                        defaultChecked={boardForm.featured || false}
                        className="w-5 h-5 rounded accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setBoardForm(null)}
                        className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                      >
                        انصراف
                      </button>
                      <button
                        type="submit"
                        className="px-7 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 shadow-lg shadow-cyan-500/20"
                      >
                        ذخیره مشخصات برد سخت‌افزاری
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">لیست بردهای سخت‌افزاری ({data.boards.length})</h4>
                        <p className="text-xs text-slate-400">با کلیک روی ستاره هر برد، می‌توانید آن را به عنوان پروژه شاخص هدر انتخاب کنید.</p>
                      </div>
                      <button
                        onClick={() => setBoardForm({})}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                      >
                        <Plus className="w-4 h-4" />
                        <span>افزودن برد جدید</span>
                      </button>
                    </div>

                    {/* Display Limit Status Box */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 text-cyan-400" />
                        <span className="text-slate-300">
                          چیدمان صفحه اول: <strong className="text-cyan-400 font-mono">{data?.siteConfig?.boardsDesktopRows || 2} ردیف × {data?.siteConfig?.boardsGridColumns || 3} ستون</strong> (نمایش اولیه: {((Number(data?.siteConfig?.boardsDesktopRows) || 2) * (Number(data?.siteConfig?.boardsGridColumns) || 3))} برد) • مابقی در دکمه «مشاهده بیشتر»
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('settings');
                          setSettingsSubTab('layout');
                        }}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-bold underline"
                      >
                        تنظیم چیدمان ردیف‌ها و ستون‌ها
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {data.boards.map((b) => (
                        <div
                          key={b.id}
                          className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                            b.featured
                              ? 'bg-slate-950/90 border-amber-500/50 shadow-lg shadow-amber-500/5'
                              : 'bg-slate-950/70 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={b.image}
                              alt={b.titleFa}
                              className="w-16 h-12 rounded-lg object-cover border border-slate-800 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-xs font-bold text-white">{b.titleFa}</h5>
                                {b.featured && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    <span>پروژه شاخص هدر</span>
                                  </span>
                                )}
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                                  {b.layers} Layers
                                </span>
                                {b.datasheetUrl && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    PDF DATASHEET
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] font-mono text-slate-400 mt-0.5">{b.mcu}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Quick Featured Toggle Star (Toggles on / off) */}
                            <button
                              type="button"
                              onClick={() => toggleFeaturedBoard(b.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                b.featured
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-300'
                              }`}
                              title={b.featured ? 'حذف از لیست پروژه‌های شاخص هدر' : 'افزودن به عنوان پروژه شاخص هدر'}
                            >
                              <Star className={`w-4 h-4 ${b.featured ? 'fill-amber-400 text-amber-400' : ''}`} />
                            </button>

                            <button
                              onClick={() => setBoardForm(b)}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400"
                              title="ویرایش"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                showConfirmDialog({
                                  title: 'تایید حذف برد الکترونیکی',
                                  message: `آیا از حذف دائمی برد «${b.titleFa}» از سیستم اطمینان دارید؟`,
                                  type: 'danger',
                                  confirmText: 'بله، حذف کن',
                                  cancelText: 'انصراف',
                                  onConfirm: () => {
                                    deleteBoard(b.id);
                                  }
                                });
                              }}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400"
                              title="حذف برد سخت‌افزاری"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. ARTICLES TAB (WITH ENGLISH FIELD UNDER EACH PERSIAN FIELD) */}
            {activeTab === 'articles' && (
              <div className="space-y-6 max-w-5xl">
                {articleForm ? (
                  <form onSubmit={handleArticleSave} className="space-y-4 p-6 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <h4 className="text-sm font-bold text-white">
                        {articleForm.id ? 'ویرایش مقاله' : 'نگارش و انتشار مقاله جدید'}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setArticleForm(null)}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        انصراف
                      </button>
                    </div>

                    {/* Article Title Persian & English */}
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-white mb-1">عنوان مقاله (فارسی):</label>
                        <input
                          name="titleFa"
                          required
                          defaultValue={articleForm.titleFa || ''}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-cyan-400 mb-1">Article Title (English):</label>
                        <input
                          name="titleEn"
                          defaultValue={articleForm.titleEn || ''}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* Article Category Persian & English with Taxonomy Sync */}
                    <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white">دسته‌بندی موضوعی مقاله:</label>
                        <button
                          type="button"
                          onClick={() => {
                            setTaxonomyModalTab('articleCategories');
                            setIsTaxonomyModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>⚙️ مدیریت دسته‌های مقالات (اعمال خودکار)</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-300 mb-1">دسته مقاله (فارسی):</label>
                          <select
                            name="categoryFa"
                            defaultValue={articleForm.categoryFa || 'طراحی سخت‌افزار'}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                          >
                            {(data.taxonomies?.articleCategories || []).map((cat) => (
                              <option key={cat.id} value={cat.labelFa}>{cat.labelFa}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-cyan-400 mb-1">Article Category (English):</label>
                          <select
                            name="categoryEn"
                            defaultValue={articleForm.categoryEn || 'Hardware Design'}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                          >
                            {(data.taxonomies?.articleCategories || []).map((cat) => (
                              <option key={cat.id} value={cat.labelEn}>{cat.labelEn}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Read Time Persian & English */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">زمان مطالعه (فارسی)</label>
                        <input
                          name="readTime"
                          defaultValue={articleForm.readTime || '۱۰ دقیقه'}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-cyan-400 mb-1">Read Time (English)</label>
                        <input
                          name="readTimeEn"
                          defaultValue={articleForm.readTimeEn || '10 min read'}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* Dedicated Article Document File Uploader (PDF / DOCX) */}
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileDown className="w-4 h-4 text-rose-400" />
                          <label className="text-xs font-bold text-white">آپلود مستقیم فایل مقاله (PDF / DOCX / سند پژوهش):</label>
                        </div>
                        <input
                          type="file"
                          ref={articleDocInputRef}
                          onChange={handleArticleFileUpload}
                          accept=".pdf,.docx,.doc,.epub,.txt"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => articleDocInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>انتخاب و آپلود فایل مقاله</span>
                        </button>
                      </div>

                      {articleForm?.pdfUrl && articleForm.pdfUrl !== '#' ? (
                        <div className="p-3 rounded-xl bg-slate-950 border border-rose-900/50 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="p-2 rounded-lg bg-rose-950 text-rose-400">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="text-xs truncate">
                              <p className="font-bold text-white truncate">{articleForm.pdfFileName || 'سند ضمیمه شده مقاله'}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{articleForm.pdfFileSize || 'فایل بارگذاری شده'} • {articleForm.pdfFileType || 'PDF'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={articleForm.pdfUrl}
                              download={articleForm.pdfFileName || 'article.pdf'}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 font-semibold"
                            >
                              دانلود تست
                            </a>
                            <button
                              type="button"
                              onClick={() => setArticleForm((prev) => ({ ...prev, pdfUrl: '', pdfFileName: '', pdfFileSize: '' }))}
                              className="p-1 rounded-lg hover:bg-rose-900/40 text-rose-400"
                              title="حذف فایل"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400">
                          می‌توانید فایل‌های PDF یا Word مقاله را مستقیماً آپلود فرمایید تا دکمه دانلود آن در سایت برای بازدیدکنندگان فعال گردد.
                        </p>
                      )}

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">یا آدرس مستقیم اینترنتی سند (IEEE, ArXiv, Google Drive):</label>
                        <input
                          name="pdfUrl"
                          value={articleForm.pdfUrl || ''}
                          onChange={(e) => setArticleForm({ ...articleForm, pdfUrl: e.target.value })}
                          placeholder="https://arxiv.org/pdf/... یا https://..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* Article Image Uploader */}
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white">تصویر کاور مقاله:</label>
                        <button
                          type="button"
                          onClick={() => {
                            setMediaPickerTarget('article');
                            fileInputRef.current?.click();
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>آپلود تصویر</span>
                        </button>
                      </div>

                      <input
                        name="coverImage"
                        value={articleForm.coverImage || ''}
                        onChange={(e) => setArticleForm({ ...articleForm, coverImage: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                      />
                    </div>

                    {/* Summaries Persian & English */}
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-white">چکیده / خلاصه مقاله (فارسی):</label>
                          <button
                            type="button"
                            onClick={() => openRichEditor({
                              title: 'ویرایشگر حرفه‌ای ورد: چکیده مقاله (فارسی)',
                              fieldName: 'Article Abstract (FA)',
                              language: 'fa',
                              initialValue: articleForm.summaryFa || '',
                              onSave: (val) => setArticleForm((prev) => ({ ...prev, summaryFa: val }))
                            })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-all hover:scale-105"
                          >
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            <span>ویرایش در ادیتور ورد</span>
                          </button>
                        </div>
                        <textarea
                          name="summaryFa"
                          rows={2}
                          required
                          value={articleForm.summaryFa || ''}
                          onChange={(e) => setArticleForm({ ...articleForm, summaryFa: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white resize-none"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-cyan-400">Summary / Abstract (English):</label>
                          <button
                            type="button"
                            onClick={() => openRichEditor({
                              title: 'Professional Word Editor: Abstract (EN)',
                              fieldName: 'Article Abstract (EN)',
                              language: 'en',
                              initialValue: articleForm.summaryEn || '',
                              onSave: (val) => setArticleForm((prev) => ({ ...prev, summaryEn: val }))
                            })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all hover:scale-105"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            <span>Open in Word Editor</span>
                          </button>
                        </div>
                        <textarea
                          name="summaryEn"
                          rows={2}
                          value={articleForm.summaryEn || ''}
                          onChange={(e) => setArticleForm({ ...articleForm, summaryEn: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono resize-none"
                        />
                      </div>
                    </div>

                    {/* Markdown / HTML Content Persian & English */}
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-white">متن کامل مقاله (فارسی - دارای امکانات کامل ورد):</label>
                          <button
                            type="button"
                            onClick={() => openRichEditor({
                              title: 'ویرایشگر جامع مایکروسافت ورد: متن کامل مقاله',
                              fieldName: 'Full Article Content (FA)',
                              language: 'fa',
                              initialValue: articleForm.contentMarkdownFa || '',
                              onSave: (val) => setArticleForm((prev) => ({ ...prev, contentMarkdownFa: val }))
                            })}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                            <span>باز کردن ادیتور کامل ورد (جداول، نمادها و فرمت‌بندی)</span>
                          </button>
                        </div>
                        <textarea
                          name="contentMarkdownFa"
                          rows={5}
                          value={articleForm.contentMarkdownFa || ''}
                          onChange={(e) => setArticleForm({ ...articleForm, contentMarkdownFa: e.target.value })}
                          placeholder="متن مقاله را اینجا تایپ کنید یا روی دکمه ادیتور ورد کلیک فرمایید..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono resize-none"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-cyan-400">Full Content (English - Rich Word Editor):</label>
                          <button
                            type="button"
                            onClick={() => openRichEditor({
                              title: 'Microsoft Word-Style Rich Editor: Full Content (EN)',
                              fieldName: 'Full Article Content (EN)',
                              language: 'en',
                              initialValue: articleForm.contentMarkdownEn || '',
                              onSave: (val) => setArticleForm((prev) => ({ ...prev, contentMarkdownEn: val }))
                            })}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                            <span>Open in Full Word Editor</span>
                          </button>
                        </div>
                        <textarea
                          name="contentMarkdownEn"
                          rows={4}
                          value={articleForm.contentMarkdownEn || ''}
                          onChange={(e) => setArticleForm({ ...articleForm, contentMarkdownEn: e.target.value })}
                          placeholder="Enter English content or open Word editor..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono resize-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">تگ‌ها (با کاما جدا کنید)</label>
                      <input
                        name="tags"
                        defaultValue={articleForm.tags?.join(', ') || 'High-Speed PCB, STM32, CAN-FD'}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setArticleForm(null)}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                      >
                        انصراف
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-xl font-bold text-xs bg-cyan-500 text-slate-950"
                      >
                        ذخیره و انتشار مقاله
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">لیست مقالات منتشر شده ({data.articles.length})</h4>
                      <button
                        onClick={() => setArticleForm({})}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                      >
                        <Plus className="w-4 h-4" />
                        <span>افزودن مقاله جدید</span>
                      </button>
                    </div>

                    {/* Articles Display Limit Status Box */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 text-purple-400" />
                        <span className="text-slate-300">
                          چیدمان صفحه اول: <strong className="text-purple-400 font-mono">{data?.siteConfig?.articlesDesktopRows || 2} ردیف × {data?.siteConfig?.articlesGridColumns || 3} ستون</strong> (نمایش اولیه: {((Number(data?.siteConfig?.articlesDesktopRows) || 2) * (Number(data?.siteConfig?.articlesGridColumns) || 3))} مقاله) • مابقی در دکمه «مشاهده بیشتر»
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('settings');
                          setSettingsSubTab('layout');
                        }}
                        className="text-xs text-purple-400 hover:text-purple-300 font-bold underline"
                      >
                        تنظیم چیدمان ردیف‌ها و ستون‌ها
                      </button>
                    </div>

                    <div className="space-y-3">
                      {data.articles.map((art) => (
                        <div
                          key={art.id}
                          className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-white">{art.titleFa}</h5>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                                {art.categoryFa || art.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{art.date} - {art.readTime}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setArticleForm(art)}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400"
                              title="ویرایش"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                showConfirmDialog({
                                  title: 'تایید حذف مقاله پژوهشی',
                                  message: `آیا از حذف مقاله تخصصی «${art.titleFa}» اطمینان دارید؟`,
                                  type: 'danger',
                                  confirmText: 'بله، حذف کن',
                                  cancelText: 'انصراف',
                                  onConfirm: () => {
                                    deleteArticle(art.id);
                                  }
                                });
                              }}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400"
                              title="حذف مقاله"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 7. SKILLS & CARDS STUDIO TAB (FULL BILINGUAL) */}
            {activeTab === 'skills' && (
              <div className="space-y-6 max-w-5xl">
                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-cyan-400" />
                      <span>مدیریت کامل کارت‌ها و مهارت‌های فنی (دوزبانه)</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      می‌توانید عنوان کارت‌ها و مهارت‌ها را به هر دو زبان فارسی و انگلیسی بنویسید و درصد تسلط را تنظیم فرمایید.
                    </p>
                  </div>

                  <button
                    onClick={handleSaveAllSkills}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-xl shrink-0"
                  >
                    <Save className="w-4 h-4" />
                    <span>ذخیره نهایی تمام کارت‌ها</span>
                  </button>
                </div>

                {/* Add New Category Card Box */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-cyan-500/30 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-white mb-1">
                        + عنوان کارت دسته‌بندی جدید (فارسی):
                      </label>
                      <input
                        type="text"
                        value={newCategoryNameFa}
                        onChange={(e) => setNewCategoryNameFa(e.target.value)}
                        placeholder="مثلاً: طراحی مدارات مخابراتی RF"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-cyan-400 mb-1">
                        + Category Card Title (English):
                      </label>
                      <input
                        type="text"
                        value={newCategoryNameEn}
                        onChange={(e) => setNewCategoryNameEn(e.target.value)}
                        placeholder="e.g. RF & Microwave Engineering"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddCategoryCard}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                    >
                      + افزودن کارت دسته
                    </button>
                  </div>
                </div>

                {/* Render All Dynamic Category Cards */}
                <div className="space-y-6">
                  {skillsList.map((group, groupIdx) => (
                    <div
                      key={groupIdx}
                      className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-lg space-y-4"
                    >
                      {/* Card Header Bilingual */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 w-full">
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">عنوان کارت (فارسی):</label>
                            <input
                              type="text"
                              value={group.categoryFa || ''}
                              onChange={(e) => handleCategoryFaChange(groupIdx, e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-cyan-400 block mb-0.5">Category Title (English):</label>
                            <input
                              type="text"
                              value={group.categoryEn || ''}
                              onChange={(e) => handleCategoryEnChange(groupIdx, e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-cyan-300 font-mono"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteCategoryCard(groupIdx)}
                          className="p-1.5 px-3 rounded-lg bg-slate-900 hover:bg-rose-950 text-rose-400 text-xs flex items-center gap-1 shrink-0 self-end sm:self-center"
                          title="حذف کامل این کارت"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف کارت</span>
                        </button>
                      </div>

                      {/* Items inside this Category Card */}
                      <div className="space-y-3">
                        {group.items?.map((skill, itemIdx) => (
                          <div
                            key={itemIdx}
                            className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {/* Skill Title Persian */}
                              <div>
                                <label className="text-[10px] text-slate-400 block mb-0.5">عنوان مهارت (فارسی):</label>
                                <input
                                  type="text"
                                  value={skill.nameFa || skill.name}
                                  onChange={(e) => handleSkillNameFaChange(groupIdx, itemIdx, e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-semibold"
                                />
                              </div>

                              {/* Skill Title English */}
                              <div>
                                <label className="text-[10px] text-cyan-400 block mb-0.5">Skill Name (English):</label>
                                <input
                                  type="text"
                                  value={skill.nameEn || skill.name || ''}
                                  onChange={(e) => handleSkillNameEnChange(groupIdx, itemIdx, e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-cyan-300 font-mono"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center pt-2 border-t border-slate-800/60">
                              <div className="sm:col-span-11 space-y-1">
                                <div className="flex items-center justify-between text-xs font-mono">
                                  <span className="text-slate-400 text-[10px]">درصد تسلط و مهارت فنی (Proficiency):</span>
                                  <span className="text-cyan-400 font-bold">{skill.level}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="10"
                                  max="100"
                                  value={skill.level}
                                  onChange={(e) => handleSkillLevelChange(groupIdx, itemIdx, e.target.value)}
                                  className="w-full accent-cyan-400 cursor-pointer"
                                />
                              </div>

                              <div className="sm:col-span-1 flex justify-end">
                                <button
                                  onClick={() => handleDeleteSkillItem(groupIdx, itemIdx)}
                                  className="p-1.5 rounded-lg bg-slate-950 hover:bg-rose-950 text-rose-400"
                                  title="حذف این مهارت"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add New Skill Item into this Card Box */}
                      <div className="pt-3 border-t border-slate-800/80 space-y-2">
                        <div className="text-[11px] font-bold text-slate-300">+ افزودن مهارت جدید به این کارت:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <input
                              type="text"
                              value={newSkillInputs[groupIdx]?.nameFa || ''}
                              onChange={(e) =>
                                setNewSkillInputs({
                                  ...newSkillInputs,
                                  [groupIdx]: { ...newSkillInputs[groupIdx], nameFa: e.target.value },
                                })
                              }
                              placeholder="نام مهارت (فارسی)..."
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={newSkillInputs[groupIdx]?.nameEn || ''}
                              onChange={(e) =>
                                setNewSkillInputs({
                                  ...newSkillInputs,
                                  [groupIdx]: { ...newSkillInputs[groupIdx], nameEn: e.target.value },
                                })
                              }
                              placeholder="Skill Name (English)..."
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          <div className="sm:col-span-8 flex items-center gap-2">
                            <span className="text-xs text-slate-400">درصد تسلط مهارت:</span>
                            <span className="text-xs font-mono font-bold text-cyan-400">{newSkillInputs[groupIdx]?.level || 85}%</span>
                          </div>
                          <div className="sm:col-span-2">
                            <input
                              type="number"
                              min="10"
                              max="100"
                              value={newSkillInputs[groupIdx]?.level || 85}
                              onChange={(e) =>
                                setNewSkillInputs({
                                  ...newSkillInputs,
                                  [groupIdx]: { ...newSkillInputs[groupIdx], level: e.target.value },
                                })
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-cyan-300 font-mono"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <button
                              onClick={() => handleAddSkillItem(groupIdx)}
                              className="w-full py-1.5 rounded-lg font-bold text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
                            >
                              + افزودن
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. EXPERIENCE TAB (WITH ENGLISH FIELD UNDER EACH PERSIAN FIELD) */}
            {activeTab === 'experience' && (
              <div className="space-y-6 max-w-5xl">
                {/* Sub-tab Navigation */}
                <div className="flex items-center gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setExpSubTab('experience');
                      setExpForm(null);
                      setEduForm(null);
                      setCertForm(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      expSubTab === 'experience'
                        ? 'bg-cyan-500 text-slate-950 shadow-lg'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>سوابق شغلی و شرکت‌ها ({data.experiences.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setExpSubTab('education');
                      setExpForm(null);
                      setEduForm(null);
                      setCertForm(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      expSubTab === 'education'
                        ? 'bg-cyan-500 text-slate-950 shadow-lg'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>تحصیلات آکادمیک ({data.education.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setExpSubTab('certifications');
                      setExpForm(null);
                      setEduForm(null);
                      setCertForm(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      expSubTab === 'certifications'
                        ? 'bg-cyan-500 text-slate-950 shadow-lg'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span>گواهینامه‌های بین‌المللی ({data.certifications.length})</span>
                  </button>
                </div>

                {/* 1. WORK EXPERIENCES SUB-TAB */}
                {expSubTab === 'experience' && (
                  <div>
                    {expForm ? (
                      <form onSubmit={handleExpSave} className="space-y-4 p-6 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-cyan-400" />
                            <span>{expForm.id ? 'ویرایش سابقه شغلی' : 'افزودن موقعیت شغلی جدید'}</span>
                          </h4>
                          <button
                            type="button"
                            onClick={() => setExpForm(null)}
                            className="px-3 py-1 rounded-lg bg-slate-800 text-xs text-slate-300"
                          >
                            انصراف
                          </button>
                        </div>

                        {/* Role Persian & English */}
                        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-white mb-1">سمت و عنوان شغلی (فارسی):</label>
                            <input
                              name="roleFa"
                              required
                              defaultValue={expForm.roleFa || ''}
                              placeholder="مثال: مهندس ارشد طراح سخت‌افزار و سرپرست تیم R&D"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-cyan-400 mb-1">Job Role Title (English):</label>
                            <input
                              name="roleEn"
                              defaultValue={expForm.roleEn || ''}
                              placeholder="e.g. Lead Hardware Engineer & Embedded R&D Lead"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                            />
                          </div>
                        </div>

                        {/* Company Persian & English */}
                        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-white mb-1">نام شرکت / سازمان (فارسی):</label>
                            <input
                              name="companyFa"
                              required
                              defaultValue={expForm.companyFa || ''}
                              placeholder="مثال: شرکت صنایع هوشمند امبدد پیشگام"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-cyan-400 mb-1">Company Name (English):</label>
                            <input
                              name="companyEn"
                              defaultValue={expForm.companyEn || ''}
                              placeholder="e.g. Pioneer Smart Embedded Systems Ltd."
                              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                            />
                          </div>
                        </div>

                        {/* Time Period, Duration & Sorting */}
                        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-white mb-1">بازه زمانی سال (فارسی):</label>
                              <input
                                name="periodFa"
                                defaultValue={expForm.periodFa || '۱۴۰۰ - اکنون'}
                                placeholder="مثال: ۱۴۰۰ - اکنون"
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-cyan-400 mb-1">Time Period (English):</label>
                              <input
                                name="periodEn"
                                defaultValue={expForm.periodEn || '2021 - Present'}
                                placeholder="e.g. 2021 - Present"
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                            <div>
                              <label className="block text-[11px] text-slate-300 font-semibold mb-1">مدت زمان اشتغال (فارسی):</label>
                              <input
                                name="durationFa"
                                defaultValue={expForm.durationFa || '۴ سال و ۲ ماه سابقه'}
                                placeholder="مثال: ۴ سال و ۲ ماه سابقه"
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-300"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] text-cyan-400 font-semibold mb-1">Duration / Tenure (English):</label>
                              <input
                                name="durationEn"
                                defaultValue={expForm.durationEn || '4 yrs 2 mos tenure'}
                                placeholder="e.g. 4 yrs 2 mos tenure"
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-300 font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] text-slate-300 font-semibold mb-1">سال مبنای سورت زمانی (میلادی):</label>
                              <input
                                type="number"
                                name="sortYear"
                                defaultValue={expForm.sortYear || 2021}
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono"
                              />
                            </div>
                          </div>

                          <label className="flex items-center gap-2 pt-1 text-xs text-slate-200 cursor-pointer">
                            <input
                              type="checkbox"
                              name="isCurrent"
                              defaultChecked={expForm.isCurrent}
                              className="rounded text-cyan-500"
                            />
                            <span className="font-semibold text-emerald-400">🟢 شاغل در حال حاضر در این موقعیت شغلی هستم (نمایش نشان فعال در تایم‌لاین درختی)</span>
                          </label>
                        </div>

                        {/* Location Persian & English */}
                        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-white mb-1">موقعیت مکانی (فارسی):</label>
                              <input
                                name="locationFa"
                                defaultValue={expForm.locationFa || 'تهران، پارک فناوری پردیس'}
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-cyan-400 mb-1">Location (English):</label>
                              <input
                                name="locationEn"
                                defaultValue={expForm.locationEn || 'Tehran, Pardis Tech Park'}
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Key Achievements Persian & English with Word Editor */}
                        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-bold text-white">دستاوردهای کلیدی (فارسی - هر خط یک مورد):</label>
                              <button
                                type="button"
                                onClick={() => openRichEditor({
                                  title: 'ویرایشگر حرفه‌ای ورد: دستاوردهای شغلی (فارسی)',
                                  fieldName: 'Key Achievements (FA)',
                                  language: 'fa',
                                  initialValue: Array.isArray(expForm.achievementsFa) ? expForm.achievementsFa.join('\n') : (expForm.achievementsFa || ''),
                                  onSave: (val) => setExpForm((prev) => ({ ...prev, achievementsFa: val.split('\n').map(s => s.trim()).filter(Boolean) }))
                                })}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                                <span>ادیتور ورد (لیست بالت‌ها)</span>
                              </button>
                            </div>
                            <textarea
                              name="achievementsFa"
                              rows={3}
                              value={Array.isArray(expForm.achievementsFa) ? expForm.achievementsFa.join('\n') : (expForm.achievementsFa || '')}
                              onChange={(e) => setExpForm({ ...expForm, achievementsFa: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white resize-none"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-bold text-cyan-400">Key Achievements (English - One per line):</label>
                              <button
                                type="button"
                                onClick={() => openRichEditor({
                                  title: 'Professional Word Editor: Key Achievements (EN)',
                                  fieldName: 'Key Achievements (EN)',
                                  language: 'en',
                                  initialValue: Array.isArray(expForm.achievementsEn) ? expForm.achievementsEn.join('\n') : (expForm.achievementsEn || ''),
                                  onSave: (val) => setExpForm((prev) => ({ ...prev, achievementsEn: val.split('\n').map(s => s.trim()).filter(Boolean) }))
                                })}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                                <span>Open in Word Editor</span>
                              </button>
                            </div>
                            <textarea
                              name="achievementsEn"
                              rows={3}
                              value={Array.isArray(expForm.achievementsEn) ? expForm.achievementsEn.join('\n') : (expForm.achievementsEn || '')}
                              onChange={(e) => setExpForm({ ...expForm, achievementsEn: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono resize-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 mb-1">تکنولوژی‌های استفاده شده (با کاما جدا کنید)</label>
                          <input
                            name="skillsUsed"
                            defaultValue={expForm.skillsUsed?.join(', ') || 'Altium Designer 24, STM32H7, CAN-FD, FreeRTOS'}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => setExpForm(null)}
                            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                          >
                            انصراف
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 text-slate-950"
                          >
                            ذخیره سابقه شغلی
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white">سوابق شغلی ثبت شده در تایم‌لاین ({data.experiences.length})</h4>
                          <button
                            onClick={() => setExpForm({})}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                          >
                            <Plus className="w-4 h-4" />
                            <span>افزودن موقعیت شغلی جدید</span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {data.experiences.map((exp) => (
                            <div
                              key={exp.id}
                              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h5 className="text-xs font-bold text-white">{exp.roleFa}</h5>
                                  {exp.isCurrent && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                                      شاغل
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-cyan-400 font-mono">{exp.roleEn}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                                  {exp.companyFa} • <span className="text-emerald-400">{exp.durationFa || exp.periodFa}</span> ({exp.periodFa})
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setExpForm(exp)}
                                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400"
                                  title="ویرایش"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    showConfirmDialog({
                                      title: 'تایید حذف سابقه شغلی',
                                      message: `آیا از حذف موقعیت شغلی «${exp.roleFa}» در شرکت «${exp.companyFa}» مطمئن هستید؟`,
                                      type: 'danger',
                                      confirmText: 'بله، حذف کن',
                                      cancelText: 'انصراف',
                                      onConfirm: () => {
                                        updateExperiences(data.experiences.filter((ex) => ex.id !== exp.id));
                                        showToast('سابقه شغلی حذف شد.', 'info');
                                      }
                                    });
                                  }}
                                  className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400"
                                  title="حذف سابقه شغلی"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. EDUCATION SUB-TAB (FULL BILINGUAL) */}
                {expSubTab === 'education' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">مدارک و مقاطع تحصیلی دانشگاهی ({data.education.length})</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const newEdu = {
                            id: 'edu-' + Date.now(),
                            degreeFa: 'کارشناسی مهندسی برق',
                            degreeEn: 'B.Sc. in Electrical Engineering',
                            universityFa: 'دانشگاه تهران',
                            universityEn: 'University of Tehran',
                            yearFa: '۱۳۹۵ - ۱۳۹۹',
                            yearEn: '2016 - 2020',
                            gpaFa: 'معدل: ۱۸.۰۰',
                            gpaEn: 'GPA: 3.8/4.0',
                            thesisFa: 'پایان‌نامه دوره کارشناسی',
                            thesisEn: 'Undergraduate Senior Project'
                          };
                          updateEducation([newEdu, ...data.education]);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                      >
                        <Plus className="w-4 h-4" />
                        <span>افزودن مقطع تحصیلی</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {data.education.map((edu, idx) => (
                        <div key={edu.id || idx} className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <span className="text-xs font-bold text-cyan-400">مقطع تحصیلی شماره {idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                showConfirmDialog({
                                  title: 'تایید حذف مقطع تحصیلی',
                                  message: `آیا از حذف مقطع تحصیلی شماره ${idx + 1} (${edu.degreeFa || 'مقطع'}) مطمئن هستید؟`,
                                  type: 'danger',
                                  confirmText: 'بله، حذف کن',
                                  cancelText: 'انصراف',
                                  onConfirm: () => {
                                    updateEducation(data.education.filter((_, i) => i !== idx));
                                    showToast('مقطع تحصیلی حذف شد.', 'info');
                                  }
                                });
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-950 text-rose-400 text-xs"
                              title="حذف مقطع تحصیلی"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] text-slate-300 font-semibold mb-1">مقطع و رشته (فارسی):</label>
                              <input
                                value={edu.degreeFa || ''}
                                onChange={(e) => {
                                  const updated = [...data.education];
                                  updated[idx].degreeFa = e.target.value;
                                  updateEducation(updated);
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-cyan-400 font-semibold mb-1">Degree & Major (English):</label>
                              <input
                                value={edu.degreeEn || ''}
                                onChange={(e) => {
                                  const updated = [...data.education];
                                  updated[idx].degreeEn = e.target.value;
                                  updateEducation(updated);
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] text-slate-300 font-semibold mb-1">نام دانشگاه (فارسی):</label>
                              <input
                                value={edu.universityFa || ''}
                                onChange={(e) => {
                                  const updated = [...data.education];
                                  updated[idx].universityFa = e.target.value;
                                  updateEducation(updated);
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-cyan-400 font-semibold mb-1">University Name (English):</label>
                              <input
                                value={edu.universityEn || ''}
                                onChange={(e) => {
                                  const updated = [...data.education];
                                  updated[idx].universityEn = e.target.value;
                                  updateEducation(updated);
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] text-slate-300 font-semibold mb-1">سال تحصیلی (فارسی):</label>
                              <input
                                value={edu.yearFa || ''}
                                onChange={(e) => {
                                  const updated = [...data.education];
                                  updated[idx].yearFa = e.target.value;
                                  updateEducation(updated);
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-cyan-400 font-semibold mb-1">Academic Years (English):</label>
                              <input
                                value={edu.yearEn || ''}
                                onChange={(e) => {
                                  const updated = [...data.education];
                                  updated[idx].yearEn = e.target.value;
                                  updateEducation(updated);
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] text-slate-300 font-semibold mb-1">پایان‌نامه و پروژه (فارسی):</label>
                              <input
                                value={edu.thesisFa || ''}
                                onChange={(e) => {
                                  const updated = [...data.education];
                                  updated[idx].thesisFa = e.target.value;
                                  updateEducation(updated);
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-cyan-400 font-semibold mb-1">Thesis / Project (English):</label>
                              <input
                                value={edu.thesisEn || ''}
                                onChange={(e) => {
                                  const updated = [...data.education];
                                  updated[idx].thesisEn = e.target.value;
                                  updateEducation(updated);
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. CERTIFICATIONS SUB-TAB (FULL BILINGUAL) */}
                {expSubTab === 'certifications' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">گواهینامه‌های تخصصی و بین‌المللی ({data.certifications.length})</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const newCert = {
                            id: 'cert-' + Date.now(),
                            titleFa: 'گواهینامه تخصصی طراحی مدارات فرکانس بالا',
                            titleEn: 'Advanced High-Speed PCB Specialist',
                            issuer: 'IPC International',
                            issuerFa: 'انجمن بین‌المللی IPC',
                            issuerEn: 'IPC International Association',
                            year: '2023',
                            yearFa: '۱۴۰۲',
                            yearEn: '2023',
                            credentialId: 'IPC-99' + Math.floor(Math.random() * 1000)
                          };
                          updateCertifications([newCert, ...data.certifications]);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                      >
                        <Plus className="w-4 h-4" />
                        <span>افزودن مدرک / گواهینامه</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {data.certifications.map((cert, idx) => (
                        <div key={cert.id || idx} className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <span className="text-xs font-bold text-amber-400">گواهینامه شماره {idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                showConfirmDialog({
                                  title: 'تایید حذف مدرک و گواهینامه',
                                  message: `آیا از حذف گواهینامه «${cert.titleFa || 'مدرک'}» اطمینان دارید؟`,
                                  type: 'danger',
                                  confirmText: 'بله، حذف کن',
                                  cancelText: 'انصراف',
                                  onConfirm: () => {
                                    updateCertifications(data.certifications.filter((_, i) => i !== idx));
                                    showToast('گواهینامه حذف شد.', 'info');
                                  }
                                });
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-950 text-rose-400 text-xs"
                              title="حذف مدرک"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] text-slate-300 font-semibold mb-1">عنوان گواهینامه (فارسی):</label>
                              <input
                                value={cert.titleFa || ''}
                                onChange={(e) => {
                                  const updated = [...data.certifications];
                                  updated[idx].titleFa = e.target.value;
                                  updateCertifications(updated);
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-cyan-400 font-semibold mb-1">Certificate Title (English):</label>
                              <input
                                value={cert.titleEn || ''}
                                onChange={(e) => {
                                  const updated = [...data.certifications];
                                  updated[idx].titleEn = e.target.value;
                                  updateCertifications(updated);
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] text-slate-300 font-semibold mb-1">مرجع صادرکننده (فارسی):</label>
                              <input
                                value={cert.issuerFa || cert.issuer || ''}
                                onChange={(e) => {
                                  const updated = [...data.certifications];
                                  updated[idx].issuerFa = e.target.value;
                                  updated[idx].issuer = e.target.value;
                                  updateCertifications(updated);
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-cyan-400 font-semibold mb-1">Issuer (English):</label>
                              <input
                                value={cert.issuerEn || cert.issuer || ''}
                                onChange={(e) => {
                                  const updated = [...data.certifications];
                                  updated[idx].issuerEn = e.target.value;
                                  updateCertifications(updated);
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-amber-400 font-semibold mb-1">کد رهگیری / ID:</label>
                              <input
                                value={cert.credentialId || ''}
                                onChange={(e) => {
                                  const updated = [...data.certifications];
                                  updated[idx].credentialId = e.target.value;
                                  updateCertifications(updated);
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-300 font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 9. MESSAGES INBOX TAB */}
            {activeTab === 'inbox' && (
              <div className="space-y-4 max-w-5xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">صندوق پیام‌های تماس مستقیم ({messages.length})</h4>
                  <button
                    onClick={exportMessagesCsv}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>خروجی اکسل (CSV)</span>
                  </button>
                </div>

                {messages.length === 0 ? (
                  <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-slate-800">
                    <Mail className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">پیامی در صندوق موجود نیست.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          msg.read ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-950/90 border-cyan-500/40 shadow-lg'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{msg.name}</span>
                            <span className="text-[11px] font-mono text-cyan-400">{msg.email}</span>
                            {msg.company && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                {msg.company}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-[10px] font-mono text-slate-400">{msg.date}</span>
                            <button
                              onClick={() => toggleMessageStar(msg.id)}
                              className={`p-1.5 rounded-lg ${msg.starred ? 'text-amber-400' : 'text-slate-500'}`}
                            >
                              <Star className="w-4 h-4 fill-current" />
                            </button>
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="text-xs font-semibold text-slate-300 mb-1">موضوع: {msg.subject}</div>
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                          {msg.message}
                        </p>

                        <div className="pt-2 flex justify-end gap-2">
                          <button
                            onClick={() => toggleMessageRead(msg.id)}
                            className="text-[11px] text-slate-400 hover:text-white"
                          >
                            {msg.read ? 'علامت به عنوان خوانده نشده' : 'علامت به عنوان خوانده شده'}
                          </button>
                          <a
                            href={`mailto:${msg.email}?subject=پاسخ: ${encodeURIComponent(msg.subject)}`}
                            className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                          >
                            <span>ارسال پاسخ با ایمیل</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

                        {/* 10. UNIFIED MASTER SETTINGS & SYSTEM CONFIGURATION TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-5xl">
                {/* Master Settings Sub-navigation Bar */}
                <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/90 border border-slate-800 overflow-x-auto shadow-lg">
                  {[
                    { id: 'layout', label: 'چیدمان و ردیف‌ها', icon: LayoutGrid },
                    { id: 'branding', label: 'فویکون و توضیحات سایت', icon: Globe },
                    { id: 'users', label: 'مدیریت کاربران و دسترسی‌ها (RBAC)', icon: Users },
                    { id: 'design', label: '۵۰ قالب و تم', icon: Palette },
                    { id: 'seo', label: 'استودیو سئو', icon: Search },
                    { id: 'taxonomies', label: 'دسته‌ها و گزینه‌ها', icon: Sliders },
                    { id: 'backup', label: 'پشتیبان‌گیری و دیتابیس', icon: Database },
                    { id: 'security', label: 'امنیت و کلمه عبور', icon: ShieldCheck },
                  ].map((sub) => {
                    const Icon = sub.icon;
                    const active = settingsSubTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setSettingsSubTab(sub.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          active
                            ? 'bg-cyan-500 text-slate-950 shadow-md font-black scale-102'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{sub.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sub-tab 1: Layout & Grid Preferences (Rows * Columns = Dynamic Limit) */}
                {settingsSubTab === 'layout' && (
                  <form onSubmit={handleLayoutSubmit} className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <LayoutGrid className="w-5 h-5 text-cyan-400" />
                          <h4 className="text-sm font-bold text-white">تنظیمات چیدمان ردیف‌ها و ستون‌های صفحه اول (Layout & Grid Settings)</h4>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          تعداد ردیف‌ها و ستون‌های نمایش بردهای الکترونیکی و مقالات را در حالت دسکتاپ مشخص فرمایید. سقف نمایش اولیه به صورت خودکار از حاصل‌ضرب تعداد ردیف در ستون محاسبه می‌شود و مابقی اقلام در دکمه بازشونده «مشاهده بیشتر» قرار می‌گیرند.
                        </p>
                      </div>
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all shrink-0 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>ذخیره تنظیمات چیدمان</span>
                      </button>
                    </div>

                    {/* Hardware Boards Display Configuration */}
                    <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                            <Cpu className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-white">چیدمان بردهای الکترونیکی (Hardware Boards Layout)</h5>
                            <p className="text-[11px] text-slate-400">کل بردهای ثبت شده در سیستم: {data?.boards?.length || 0} عدد</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Desktop Rows Selector */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            تعداد ردیف اولیه در دسکتاپ:
                          </label>
                          <select
                            name="boardsDesktopRows"
                            defaultValue={data?.siteConfig?.boardsDesktopRows || 2}
                            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-cyan-500 focus:outline-none"
                          >
                            <option value="1">۱ ردیف (تک ردیف فشرده)</option>
                            <option value="2">۲ ردیف (پیش‌فرض استاندارد)</option>
                            <option value="3">۳ ردیف (نمایش گسترده)</option>
                          </select>
                          <p className="text-[10px] text-slate-500 mt-1">تعداد ردیف‌های کارت‌ها در نمایشگرهای لپ‌تاپ و رایانه</p>
                        </div>

                        {/* Grid Columns Selector */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            تعداد ستون‌ها در هر ردیف دسکتاپ:
                          </label>
                          <select
                            name="boardsGridColumns"
                            defaultValue={data?.siteConfig?.boardsGridColumns || 3}
                            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-cyan-500 focus:outline-none"
                          >
                            <option value="1">۱ ستون در هر ردیف (کارت‌های تمام‌عرض و متمرکز)</option>
                            <option value="2">۲ ستون در هر ردیف (کارت‌های عریض)</option>
                            <option value="3">۳ ستون در هر ردیف (پیش‌فرض استاندارد)</option>
                            <option value="4">۴ ستون در هر ردیف (فشرده)</option>
                          </select>
                          <p className="text-[10px] text-slate-500 mt-1">عرض و تعداد ستون‌های پروژه در مانیتور دسکتاپ</p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/20 text-xs text-slate-300 flex items-center gap-3">
                        <Cpu className="w-5 h-5 text-cyan-400 shrink-0" />
                        <div>
                          <span className="font-bold text-white">
                            محاسبه خودکار سقف نمایش اولیه: {data?.siteConfig?.boardsDesktopRows || 2} ردیف × {data?.siteConfig?.boardsGridColumns || 3} ستون = <span className="text-cyan-400 font-bold font-mono">{((Number(data?.siteConfig?.boardsDesktopRows) || 2) * (Number(data?.siteConfig?.boardsGridColumns) || 3))} برد الکترونیکی</span>
                          </span>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            در صفحه اول ابتدا {((Number(data?.siteConfig?.boardsDesktopRows) || 2) * (Number(data?.siteConfig?.boardsGridColumns) || 3))} برد نمایش داده می‌شود و مابقی با کلیک روی دکمه «مشاهده بیشتر» باز خواهند شد.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Articles Display Configuration */}
                    <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-white">چیدمان مقالات و انتشارات تخصصی (Publications Layout)</h5>
                            <p className="text-[11px] text-slate-400">کل مقالات ثبت شده: {data?.articles?.length || 0} مقاله</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Desktop Rows Selector */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            تعداد ردیف اولیه در دسکتاپ:
                          </label>
                          <select
                            name="articlesDesktopRows"
                            defaultValue={data?.siteConfig?.articlesDesktopRows || 2}
                            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-purple-500 focus:outline-none"
                          >
                            <option value="1">۱ ردیف (نمایش تک‌ردیفه افقی)</option>
                            <option value="2">۲ ردیف (پیش‌فرض استاندارد)</option>
                            <option value="3">۳ ردیف (نمایش گسترده)</option>
                          </select>
                          <p className="text-[10px] text-slate-500 mt-1">تعداد ردیف‌های کارت‌های مقالات در صفحه اول</p>
                        </div>

                        {/* Grid Columns Selector */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            تعداد ستون‌ها در هر ردیف دسکتاپ:
                          </label>
                          <select
                            name="articlesGridColumns"
                            defaultValue={data?.siteConfig?.articlesGridColumns || 3}
                            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-purple-500 focus:outline-none"
                          >
                            <option value="1">۱ ستون در هر ردیف (کارت‌های تمام‌عرض)</option>
                            <option value="2">۲ ستون در هر ردیف</option>
                            <option value="3">۳ ستون در هر ردیف (پیش‌فرض استاندارد)</option>
                            <option value="4">۴ ستون در هر ردیف (فشرده)</option>
                          </select>
                          <p className="text-[10px] text-slate-500 mt-1">تقسیم‌بندی ستون‌های مقاله در نمایشگر بزرگ</p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-purple-500/20 text-xs text-slate-300 flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-purple-400 shrink-0" />
                        <div>
                          <span className="font-bold text-white">
                            محاسبه خودکار سقف نمایش اولیه: {data?.siteConfig?.articlesDesktopRows || 2} ردیف × {data?.siteConfig?.articlesGridColumns || 3} ستون = <span className="text-purple-400 font-bold font-mono">{((Number(data?.siteConfig?.articlesDesktopRows) || 2) * (Number(data?.siteConfig?.articlesGridColumns) || 3))} مقاله تخصصی</span>
                          </span>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            در صفحه اول ابتدا {((Number(data?.siteConfig?.articlesDesktopRows) || 2) * (Number(data?.siteConfig?.articlesGridColumns) || 3))} مقاله بارگذاری شده و مابقی با دکمه «مشاهده بیشتر» باز می‌شوند.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-2">
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-7 py-3 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>ذخیره تغییرات چیدمان ردیف‌ها و ستون‌ها</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Sub-tab 2: Favicon, Branding & Descriptions */}
                {settingsSubTab === 'branding' && (
                  <form onSubmit={handleBrandingSubmit} className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-cyan-400" />
                          <h4 className="text-sm font-bold text-white">مدیریت فویکون، هویت بصری و توضیحات کامل سایت</h4>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          شما می‌توانید آیکون تب مرورگر (Favicon)، نام تجاری، عنوان و زیرعنوان، بیوگرافی کلی و متن کپی‌رایت فوتر را به صورت دوزبانه (فارسی و انگلیسی) سفارشی‌سازی فرمایید.
                        </p>
                      </div>
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all shrink-0 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>ذخیره برندینگ و فویکون</span>
                      </button>
                    </div>

                    {/* Hidden Favicon File Input */}
                    <input
                      type="file"
                      ref={faviconInputRef}
                      accept="image/x-icon,image/png,image/svg+xml,image/jpeg"
                      className="hidden"
                      onChange={handleFaviconUpload}
                    />

                    {/* Favicon Browser Tab Simulation & Controls */}
                    <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-white">آیکون سایت و تب مرورگر (Favicon Settings)</h5>
                            <p className="text-[11px] text-slate-400">آیکون کوچک نمایش داده شده در کنار عنوان صفحه در تب مرورگر و بوک‌مارک‌ها</p>
                          </div>
                        </div>
                      </div>

                      {/* Live Browser Tab Preview Simulation */}
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <span className="text-[11px] font-bold text-slate-400">پیش‌نمایش زنده در تب مرورگر (Live Tab Simulation):</span>
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-700 max-w-sm">
                          <img
                            src={customFaviconUrl || data.siteConfig?.faviconUrl || data.seoSettings?.faviconUrl}
                            alt="Favicon"
                            className="w-5 h-5 object-contain shrink-0 rounded"
                          />
                          <span className="text-xs font-bold text-white truncate">
                            {data.seoSettings?.siteTitle || 'مهندس آرش طاهری | رزومه و پورتفولیو'}
                          </span>
                          <X className="w-3.5 h-3.5 text-slate-500 mr-auto ml-0 shrink-0" />
                        </div>
                      </div>

                      {/* Custom Favicon Upload & URL Input */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-white mb-1.5">
                            آدرس URL مستقیم آیکون یا کد Data URI فویکون:
                          </label>
                          <input
                            type="text"
                            name="faviconUrl"
                            value={customFaviconUrl}
                            onChange={(e) => {
                              setCustomFaviconUrl(e.target.value);
                              updateSiteConfig({ faviconUrl: e.target.value });
                              updateSeoSettings({ faviconUrl: e.target.value });
                            }}
                            placeholder="https://example.com/favicon.png یا data:image/svg+xml,..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={() => faviconInputRef.current?.click()}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-colors shadow-sm"
                          >
                            <Upload className="w-4 h-4" />
                            <span>آپلود فایل آیکون (.ico/.png/.svg)</span>
                          </button>
                        </div>
                      </div>

                      {/* 6 Engineering Favicon Presets */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <span className="text-xs font-bold text-slate-300">یا انتخاب از بین ۶ آیکون آماده مهندسی و الکترونیک:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                          {FAVICON_PRESETS.map((preset) => {
                            const isSelected = customFaviconUrl === preset.svg;
                            return (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => handleSelectFaviconPreset(preset.svg)}
                                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all text-center ${
                                  isSelected
                                    ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-400/50 scale-102'
                                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400 hover:border-slate-700'
                                }`}
                              >
                                <img src={preset.svg} alt={preset.nameEn} className="w-7 h-7 object-contain" />
                                <span className="text-[10px] font-bold text-slate-200 line-clamp-1">{preset.nameEn}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Site Brand & Full Name */}
                    <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                      <h5 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
                        <User className="w-4 h-4 text-cyan-400" />
                        <span>نام برند، عنوان و زیرعنوان سایت (Brand & Titles)</span>
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-white mb-1.5">نام برند / نام کامل (فارسی):</label>
                          <input
                            type="text"
                            name="brandNameFa"
                            defaultValue={data.personalInfo?.fullNameFa || data.personalInfo?.nameFa || ''}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-cyan-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-cyan-400 mb-1.5">Brand / Full Name (English):</label>
                          <input
                            type="text"
                            name="brandNameEn"
                            defaultValue={data.personalInfo?.fullNameEn || data.personalInfo?.nameEn || ''}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-white mb-1.5">عنوان تخصصی و شعار کاری (فارسی):</label>
                          <input
                            type="text"
                            name="taglineFa"
                            defaultValue={data.personalInfo?.taglineFa || ''}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-cyan-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-cyan-400 mb-1.5">Professional Tagline / Subtitle (English):</label>
                          <input
                            type="text"
                            name="taglineEn"
                            defaultValue={data.personalInfo?.taglineEn || ''}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Site Bio & Overview Description */}
                    <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                      <h5 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>توضیحات کلی و بیوگرافی کوتاه سایت (Site Bio & Summary)</span>
                      </h5>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-white mb-1.5">متن بیوگرافی و معرفی اجمالی سایت (فارسی):</label>
                          <textarea
                            name="bioFa"
                            rows={3}
                            defaultValue={data.personalInfo?.bioFa || ''}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white resize-none focus:border-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-emerald-400 mb-1.5">Site Overview & Bio (English):</label>
                          <textarea
                            name="bioEn"
                            rows={3}
                            defaultValue={data.personalInfo?.bioEn || ''}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono resize-none focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer Copyright */}
                    <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                      <h5 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
                        <Building2 className="w-4 h-4 text-purple-400" />
                        <span>متن کپی‌رایت و حقوق نشر فوتر (Footer Copyright)</span>
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-white mb-1.5">متن کپی‌رایت پایین سایت (فارسی):</label>
                          <input
                            type="text"
                            name="copyrightFa"
                            defaultValue={data.siteConfig?.copyrightFa || `تمامی حقوق محفوظ است © ${new Date().getFullYear()} ${data.personalInfo?.fullNameFa || 'آرش طاهری'}`}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-purple-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-purple-400 mb-1.5">Footer Copyright Notice (English):</label>
                          <input
                            type="text"
                            name="copyrightEn"
                            defaultValue={data.siteConfig?.copyrightEn || `All rights reserved © ${new Date().getFullYear()} ${data.personalInfo?.fullNameEn || 'Arash Taheri'}`}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-2">
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-7 py-3 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>ذخیره تنظیمات فویکون، برندینگ و توضیحات</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Sub-tab 3: User Management & RBAC */}
                {settingsSubTab === 'users' && (
                  <div className="space-y-4">
                    <UserManagementSection />
                  </div>
                )}

                {/* Sub-tab 4: 50 Design Templates */}
                {settingsSubTab === 'design' && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-white">انتخاب اختصاصی از بین ۵۰ قالب طراحی (مخصوص مدیر سایت)</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          قالب در حال استفاده: <span className="text-cyan-400 font-bold">{data?.siteConfig?.activeTemplateId || data?.siteConfig?.currentTemplateId || 'pcb-blueprint-dark'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(TEMPLATES || []).map((tpl) => {
                        const isCurrent = (data?.siteConfig?.activeTemplateId || data?.siteConfig?.currentTemplateId || 'pcb-blueprint-dark') === tpl.id;
                        return (
                          <div
                            key={tpl.id}
                            onClick={() => setTemplate(tpl.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                              isCurrent
                                ? 'bg-slate-800 border-cyan-400 ring-1 ring-cyan-400'
                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold text-white">{tpl.nameFa}</span>
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: tpl.colors.primary }}
                              />
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{tpl.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sub-tab 5: SEO Studio */}
                {settingsSubTab === 'seo' && (
                  <form onSubmit={handleSeoSubmit} className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">تنظیمات متاتگ‌ها و سئو موتورهای جستجو</h4>
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>ذخیره متاتگ‌ها</span>
                      </button>
                    </div>

                    {/* Google Snippet Simulation */}
                    <div className="p-4 rounded-2xl bg-white text-slate-900 space-y-1 text-left font-sans shadow-lg">
                      <div className="text-xs text-slate-500 font-mono">https://arashtaheri.dev</div>
                      <div className="text-base text-blue-700 hover:underline font-medium cursor-pointer">
                        {seo.siteTitle}
                      </div>
                      <div className="text-xs text-slate-600 line-clamp-2">
                        {seo.metaDescription}
                      </div>
                    </div>

                    {/* Site Title Persian & English */}
                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-white mb-1">عنوان سایت برای موتورهای جستجو (فارسی):</label>
                        <input
                          name="siteTitle"
                          defaultValue={seo.siteTitle}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-cyan-400 mb-1">Site Title for SEO (English):</label>
                        <input
                          name="siteTitleEn"
                          defaultValue={seo.siteTitleEn || 'Arash Taheri | Senior Hardware & Embedded Systems Engineer Portfolio'}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    {/* Meta Description Persian & English */}
                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-white mb-1">توضیحات متاتگ Meta Description (فارسی):</label>
                        <textarea
                          name="metaDescription"
                          rows={2}
                          defaultValue={seo.metaDescription}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white resize-none focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-cyan-400 mb-1">Meta Description (English):</label>
                        <textarea
                          name="metaDescriptionEn"
                          rows={2}
                          defaultValue={seo.metaDescriptionEn || 'Senior Hardware & Embedded Systems Engineer portfolio showcasing high-speed PCB designs, IoT platforms, and technical papers.'}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono resize-none focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-white mb-1">کلمات کلیدی سئو (با کاما جدا کنید):</label>
                        <input
                          name="keywords"
                          defaultValue={seo.keywords}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-cyan-400 mb-1">SEO Keywords (English, comma separated):</label>
                        <input
                          name="keywordsEn"
                          defaultValue={seo.keywordsEn || 'PCB Design, Altium, High-Speed Layout, Embedded Systems, STM32, Hardware Engineer'}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">آدرس اصلی سایت (Canonical URL):</label>
                        <input
                          name="canonicalUrl"
                          defaultValue={seo.canonicalUrl}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">نویسنده متاتگ (Author):</label>
                        <input
                          name="author"
                          defaultValue={seo.author}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </form>
                )}

                {/* Sub-tab 6: Taxonomies */}
                {settingsSubTab === 'taxonomies' && (
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                          <Sliders className="w-5 h-5 text-cyan-400" />
                          <span>مدیریت دسته‌ها، وضعیت‌ها و گزینه‌های سراسری</span>
                        </h4>
                        <p className="text-xs text-slate-400">
                          ویرایش، حذف و افزودن گزینه‌های لیست‌های بازشونده با همگام‌سازی آبشاری خودکار در تمام بردهای موجود.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTaxonomyModalTab('boardCategories');
                          setIsTaxonomyModalOpen(true);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg cursor-pointer"
                      >
                        باز کردن پنجره مدیریت جامع
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-bold text-white flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-cyan-400" />
                            <span>دسته‌های بردهای سخت‌افزاری</span>
                          </h5>
                          <button
                            type="button"
                            onClick={() => {
                              setTaxonomyModalTab('boardCategories');
                              setIsTaxonomyModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold"
                          >
                            ویرایش و افزودن
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {(data.taxonomies?.boardCategories || []).map((cat) => (
                            <div key={cat.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                              <span className="font-bold text-white">{cat.labelFa}</span>
                              <span className="font-mono text-cyan-300 text-[11px]">{cat.labelEn}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-bold text-white flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-emerald-400" />
                            <span>دسته‌های مقالات تخصصی</span>
                          </h5>
                          <button
                            type="button"
                            onClick={() => {
                              setTaxonomyModalTab('articleCategories');
                              setIsTaxonomyModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold"
                          >
                            ویرایش و افزودن
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {(data.taxonomies?.articleCategories || []).map((cat) => (
                            <div key={cat.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                              <span className="font-bold text-white">{cat.labelFa}</span>
                              <span className="font-mono text-emerald-300 text-[11px]">{cat.labelEn}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-bold text-white flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-purple-400" />
                            <span>نرم‌افزارهای طراحی مدارات EDA</span>
                          </h5>
                          <button
                            type="button"
                            onClick={() => {
                              setTaxonomyModalTab('edaTools');
                              setIsTaxonomyModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-semibold"
                          >
                            ویرایش و افزودن
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {(data.taxonomies?.edaTools || []).map((tl) => (
                            <div key={tl.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                              <span className="font-bold text-white">{tl.labelFa}</span>
                              <span className="font-mono text-purple-300 text-[11px]">{tl.labelEn}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-tab 7: Backup & Database */}
                {settingsSubTab === 'backup' && (
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-slate-950/90 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                          <Database className="w-5 h-5 text-emerald-400" />
                          <span>مرکز جامع پشتیبان‌گیری، بازگردانی و انتقال به هاست جدید (Migration Suite)</span>
                        </h4>
                        <p className="text-xs text-slate-400">
                          تنها مرکز پشتیبان‌گیری سایت: فایل بک‌آپ، کل سایت را پوشش می‌دهد (محتوا، کاربران، تنظیمات امنیتی، سؤالات بازیابی).
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={exportDataJson}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-xl cursor-pointer"
                        >
                          <HardDriveDownload className="w-4 h-4" />
                          <span>دانلود فایل پشتیبان کامل (.json)</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-white font-bold text-sm">
                            <Download className="w-4 h-4 text-cyan-400" />
                            <span>۱. خروجی کامل کل سایت</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            دریافت بسته کامل JSON: تمام محتوا، کاربران، تنظیمات امنیتی و سؤالات بازیابی. تاریخچه نسخه‌ها فقط در مرورگر می‌ماند. این فایل را جای امن نگه دارید.
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            type="button"
                            onClick={exportDataJson}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            <span>دانلود فایل JSON بک‌آپ</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleCopyClipboardBackup}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                          >
                            {copiedBackup ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                            <span>{copiedBackup ? 'کپی شد!' : 'کپی کد در حافظه'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-white font-bold text-sm">
                            <HardDriveUpload className="w-4 h-4 text-amber-400" />
                            <span>۲. بازیابی کل سایت از فایل یا پیست مستقیم</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            بارگذاری فایل JSON یا پیست متن کد برای بازگردانی فوری کل سایت (محتوا، کاربران، امنیت، سؤالات بازیابی). قبلش یک نسخه پشتیبان خودکار گرفته می‌شود.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <button
                            type="button"
                            onClick={() => backupFileInputRef.current?.click()}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer"
                          >
                            <Upload className="w-4 h-4" />
                            <span>انتخاب فایل بک‌آپ از سیستم (.json)</span>
                          </button>

                          <div className="pt-2 border-t border-slate-800 space-y-2">
                            <textarea
                              rows={2}
                              value={clipboardBackupText}
                              onChange={(e) => setClipboardBackupText(e.target.value)}
                              placeholder="یا متن کد JSON بک‌آپ را در اینجا پیست فرمایید..."
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-white font-mono placeholder-slate-500 resize-none"
                            />
                            <button
                              type="button"
                              onClick={handleRestoreFromClipboard}
                              className="w-full py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                            >
                              بازگردانی از متن پیست‌شده
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. AUTO BACKUP (debounced timer after last change) */}
                    <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                        <h5 className="text-sm font-bold text-white flex items-center gap-2">
                          <Bot className="w-4 h-4 text-cyan-400" />
                          <span>بک‌آپ خودکار بعد از آخرین تغییر</span>
                        </h5>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full border whitespace-nowrap ${
                            autoBackup?.enabled
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-500/20 text-slate-300 border-slate-500/40'
                          }`}
                        >
                          {autoBackup?.enabled ? '🤖 فعال' : '⚪ غیرفعال'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        هر تغییری در هر قسمت سایت بدهی، تایمر از اول شروع می‌شود؛ اگر تا پایان زمان تنظیمی تغییر جدیدی نیاید، فقط یک نسخه خودکار (🤖) در جدول پایین ثبت می‌شود — نه بیشتر. فقط ۵ نسخه خودکار آخر نگه داشته می‌شود و نسخه‌های دستی تو هیچ‌وقت حذف نمی‌شوند.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                          <input
                            type="checkbox"
                            checked={!!autoBackup?.enabled}
                            onChange={(e) => setAutoBackupConfig({ enabled: e.target.checked })}
                            className="w-4 h-4 accent-cyan-500"
                          />
                          بک‌آپ خودکار فعال باشد
                        </label>
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                          <label className="block text-xs font-bold text-white mb-1.5">
                            فاصله بعد از آخرین تغییر (روز):
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={30}
                            dir="ltr"
                            value={autoBackup?.days ?? 7}
                            onChange={(e) => setAutoBackupConfig({ days: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                          />
                          <p className="text-[11px] text-slate-500 mt-1">بین ۱ تا ۳۰ روز (پیش‌فرض ۷ روز)</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Clock3 className="w-3.5 h-3.5 text-cyan-400" />
                            <span>
                              آخرین بک‌آپ خودکار:{' '}
                              <b className="text-white">
                                {autoBackup?.lastRun
                                  ? new Date(autoBackup.lastRun).toLocaleDateString('fa-IR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                                  : 'هنوز ثبت نشده'}
                              </b>
                            </span>
                          </div>
                          <div key={backupTick} className="text-slate-300">
                            بک‌آپ بعدی:{' '}
                            <b className="text-white">
                              {!autoBackup?.enabled
                                ? '—'
                                : autoBackupStatus?.pending && autoBackupStatus?.nextAt > Date.now()
                                  ? (() => {
                                      const ms = autoBackupStatus.nextAt - Date.now();
                                      if (ms > 86400000) return `حدود ${Math.ceil(ms / 86400000)} روز دیگر`;
                                      if (ms > 3600000) return `حدود ${Math.ceil(ms / 3600000)} ساعت دیگر`;
                                      return 'کمتر از یک ساعت دیگر';
                                    })()
                                  : 'در انتظار تغییر جدید'}
                            </b>
                          </div>
                          <p className="text-[11px] text-slate-500">تایمر با ساعت واقعی جلو می‌رود؛ اگر موعدش وقتی برسد که پنل بسته است، حدود یک دقیقه بعد از باز شدن پنل همان یک نسخه ثبت می‌شود.</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-bold text-white">حافظه مرورگر (نسخه‌ها و دیتا):</span>
                          <span className="font-mono text-slate-300">
                            {storageUsage
                              ? `${(storageUsage.bytes / 1048576).toFixed(1)}MB از ~5MB`
                              : '…'}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              !storageUsage || (storageUsage.bytes / storageUsage.limit) < 0.7
                                ? 'bg-emerald-500'
                                : (storageUsage.bytes / storageUsage.limit) < 0.9
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                            }`}
                            style={{ width: `${storageUsage ? Math.min(100, (storageUsage.bytes / storageUsage.limit) * 100) : 0}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1.5">
                          اگر حافظه پر شد: فایل بک‌آپ را دانلود کن (جای امن نگهش دار) و نسخه‌های قدیمی جدول پایین را حذف کن.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/25 space-y-2">
                        <h6 className="text-xs font-bold text-cyan-300">📍 بک‌آپ‌ها دقیقاً کجا ذخیره می‌شوند؟</h6>
                        <ul className="text-[11px] text-slate-300 leading-relaxed space-y-1.5 list-disc list-inside">
                          <li>
                            <b className="text-white">نسخه‌های جدول پایین (دستی + خودکار):</b> داخل حافظه داخلی همین مرورگر و همین دستگاه (localStorage) با کلید <code dir="ltr" className="text-cyan-300 font-mono">embedded_portfolio_snapshots_v2</code> — برای دیدنش در کروم/اج کلید <code dir="ltr" className="text-cyan-300 font-mono">F12</code> را بزن، تب <code dir="ltr" className="text-cyan-300 font-mono">Application</code> ← بخش <code dir="ltr" className="text-cyan-300 font-mono">Local Storage</code> ← آدرس سایت.
                          </li>
                          <li>
                            <b className="text-white">فایل بک‌آپ کامل (.json):</b> هرجا که خودت دانلودش می‌کنی (معمولاً پوشه Downloads) — این تنها نسخه‌ای است که بیرون از مرورگر است و با پاک شدن دیتای مرورگر از بین نمی‌رود.
                          </li>
                          <li>
                            <b className="text-white">رمزها و صندوق SMTP:</b> روی خود هاست (پوشه <code dir="ltr" className="text-cyan-300 font-mono">api/data</code>) — با بک‌آپ مرورگر کاری ندارند.
                          </li>
                        </ul>
                        <p className="text-[11px] text-amber-300 leading-relaxed">
                          ⚠️ پاک کردن دیتای مرورگر (Clear browsing data) نسخه‌های جدول را پاک می‌کند — برای همین همیشه یک فایل بک‌آپ تازه جای امن داشته باش.
                        </p>
                      </div>
                    </div>

                    {/* Snapshots Table */}
                    <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                        <h5 className="text-sm font-bold text-white flex items-center gap-2">
                          <History className="w-4 h-4 text-purple-400" />
                          <span>تاریخچه اسنپ‌شات‌ها و نسخه‌های زمانی</span>
                        </h5>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <input
                            type="text"
                            value={newSnapshotName}
                            onChange={(e) => setNewSnapshotName(e.target.value)}
                            placeholder="نام اسنپ‌شات جدید..."
                            className="flex-1 sm:w-56 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={handleCreateSnapshot}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-500 text-white hover:bg-purple-400 shrink-0 cursor-pointer"
                          >
                            + ثبت نسخه
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {snapshots.map((snap) => (
                          <div
                            key={snap.id}
                            className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <History className="w-4 h-4 text-purple-400" />
                              <div>
                                <div className="text-xs font-bold text-white flex items-center gap-2">
                                  {snap.name}
                                  {snap.auto && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                      🤖 خودکار
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] font-mono text-slate-400 mt-0.5">{snap.date}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => restoreSnapshot(snap.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>بازگردانی</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteSnapshot(snap.id)}
                                disabled={snapshots.length <= 1}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 text-xs disabled:opacity-30 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-tab 9: Security & Password */}
                {settingsSubTab === 'security' && (
                  <div className="space-y-6">
                    {/* Security-mode banner (honest: server vs local) */}
                    <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                      backend?.available
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                        : 'bg-sky-500/10 border-sky-500/40 text-sky-200'
                    }`}>
                      {backend?.available
                        ? '🔒 حالت امن فعال است: رمزها (bcrypt)، کدهای تایید و محدودیت‌ها سمت سرور اعمال می‌شوند. کد تایید فقط در ایمیل شما موجود است.'
                        : '🖥️ حالت محلی: بک‌اند (PHP) شناسایی نشد. رمزها هش‌شده محلی‌اند و ارسال ایمیل کد تایید فقط روی هاست واقعی (PHP) کار می‌کند.'}
                    </div>

                    {/* Factory-default password alarm */}
                    {isDefaultPassword && (
                      <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/50 text-xs text-rose-200 leading-relaxed animate-pulse">
                        ⚠️ هشدار امنیتی: رمز مدیر هنوز پیش‌فرض است! همین حالا از بخش «تغییر کلمه عبور» یک رمز قوی (حداقل ۸ کاراکتر) تعیین کنید.
                      </div>
                    )}
                    {/* 0. LOCAL RECOVERY QUESTIONS (gate for the emergency reset) */}
                    <div className="p-6 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm sm:text-base font-bold text-white">
                              سؤالات بازیابی محلی (قفل ریست اضطراری)
                            </h4>
                            <p className="text-xs text-slate-400">
                              ریست اضطراری رمز فقط با پاسخ درست به این سؤالات باز می‌شود. پاسخ‌ها هش‌شده ذخیره می‌شوند.
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full border ${
                            secQaCount >= 2
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {secQaCount >= 2 ? `✅ ${secQaCount} سؤال ثبت شده` : '⚠️ ثبت نشده — ریست قفل است'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {secQaForm.map((pair, i) => (
                          <div key={i} className="space-y-2 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                            <input
                              type="text"
                              value={pair.q}
                              onChange={(e) => setSecQaForm((prev) => prev.map((p, j) => (j === i ? { ...p, q: e.target.value } : p)))}
                              placeholder={`سؤال ${i + 1} (مثلاً: نام اولین مدرسه‌ام؟)`}
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                            />
                            <input
                              type="text"
                              value={pair.a}
                              onChange={(e) => setSecQaForm((prev) => prev.map((p, j) => (j === i ? { ...p, a: e.target.value } : p)))}
                              placeholder="پاسخ (حداقل ۳ کاراکتر)"
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveSecQa}
                        disabled={isSavingSecQa}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/50 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isSavingSecQa ? 'در حال ذخیره...' : '💾 ذخیره سؤالات بازیابی'}
                      </button>
                    </div>

                    {/* 1. RECOVERY EMAIL & OTP VERIFICATION SETTINGS */}
                    <div className="p-6 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm sm:text-base font-bold text-white">
                              ایمیل بازیابی رمز عبور و احراز هویت دومرحله‌ای
                            </h4>
                            <p className="text-xs text-slate-400">
                              در صورت فراموشی رمز عبور، کد تایید یکبار مصرف (OTP) ۶ رقمی به این آدرس ایمیل ارسال خواهد شد.
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full border ${
                            (backend?.available ? serverAccountInfo?.emailVerified : adminSecurity?.isEmailVerified)
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {(backend?.available ? serverAccountInfo?.emailVerified : adminSecurity?.isEmailVerified) ? 'ایمیل تایید شده ✅' : 'در انتظار تایید ⚠️'}
                        </span>
                      </div>

                      <div className="space-y-4">
                        {backend?.available && serverAccountInfo?.recoveryEmail && (
                          <p className="text-[11px] text-slate-400 font-mono" dir="ltr">
                            Server recovery email: <span className="text-cyan-300">{serverAccountInfo.recoveryEmail}</span>
                          </p>
                        )}
                        {backend?.available && (
                          <div>
                            <label className="block text-xs font-bold text-white mb-1.5">
                              رمز عبور فعلی (برای تغییر ایمیل، الزامی):
                            </label>
                            <input
                              type="password"
                              value={securityCurrentPw}
                              onChange={(e) => setSecurityCurrentPw(e.target.value)}
                              placeholder="رمز فعلی مدیر..."
                              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                            />
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-bold text-white mb-1.5">
                            آدرس ایمیل مدیر ارشد جهت دریافت کد بازیابی:
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="email"
                              value={recoveryEmailInput}
                              onChange={(e) => setRecoveryEmailInput(e.target.value)}
                              placeholder="admin@yourdomain.com"
                              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={handleSendSecurityOtp}
                              disabled={isSendingSecurityOtp}
                              className={`px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-colors ${isSendingSecurityOtp ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
                            >
                              {isSendingSecurityOtp ? 'در حال ارسال...' : 'ارسال کد تایید (OTP)'}
                            </button>
                          </div>
                        </div>

                        {isVerifyingSecurityEmail && (
                          <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-3 animate-fadeIn">
                            <label className="block text-xs font-bold text-cyan-300">
                              کد تایید ۶ رقمی ارسال شده به ایمیل را وارد فرمایید:
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                maxLength={6}
                                value={securityOtpInput}
                                onChange={(e) => setSecurityOtpInput(e.target.value.replace(/\D/g, ''))}
                                placeholder="123456"
                                className="w-40 px-3.5 py-2 rounded-xl bg-slate-950 border border-cyan-500/50 text-center text-sm font-mono tracking-widest text-white focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={handleConfirmSecurityOtp}
                                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md cursor-pointer"
                              >
                                تایید نهایی ایمیل
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsVerifyingSecurityEmail(false)}
                                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                              >
                                انصراف
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 2. CHANGE PASSWORD */}
                    <div className="p-6 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl space-y-4">
                      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                        <Key className="w-5 h-5 text-amber-400" />
                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-white">تغییر کلمه عبور مدیر سیستم</h4>
                          <p className="text-xs text-slate-400">حداقل ۸ کاراکتر • در حالت امن روی سرور هش می‌شود (bcrypt)</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-white mb-1">رمز عبور فعلی:</label>
                          <input
                            type="password"
                            value={currentPasswordInput}
                            onChange={(e) => setCurrentPasswordInput(e.target.value)}
                            placeholder="رمز فعلی..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-white mb-1">رمز عبور جدید:</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="حداقل ۸ کاراکتر..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-white mb-1">تکرار رمز عبور جدید:</label>
                          <input
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="تکرار دقیق رمز جدید..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={handleChangePasswordDirect}
                          disabled={isChangingPw}
                          className={`px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md transition-colors ${isChangingPw ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
                        >
                          {isChangingPw ? 'در حال ذخیره...' : 'ذخیره و تغییر رمز عبور'}
                        </button>
                      </div>
                    </div>

                    {/* 3. NOTIFICATION MAILBOX (SMTP, server-side only) */}
                    <div className="p-6 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
                            <Server className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm sm:text-base font-bold text-white">
                              صندوق ارسال اعلان‌ها (ایمیل + رمز SMTP)
                            </h4>
                            <p className="text-xs text-slate-400">
                              کدهای تایید و پیام‌های تماس با این صندوق ارسال می‌شوند. رمز فقط روی سرور می‌ماند (فایل 0600) و هیچ‌وقت داخل گیت یا مرورگر ذخیره نمی‌شود.
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full border whitespace-nowrap ${
                            smtpMeta.configured
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-500/20 text-slate-300 border-slate-500/40'
                          }`}
                        >
                          {smtpLoading ? '⏳ در حال بارگذاری...' : (smtpMeta.configured ? '✅ فعال و پیکربندی‌شده' : '⚪ غیرفعال / ناقص')}
                        </span>
                      </div>

                      {!backend?.available ? (
                        <p className="text-xs text-sky-300 leading-relaxed">
                          🖥️ حالت محلی است — تنظیمات SMTP فقط در حالت امن (روی هاست با PHP) کار می‌کند.
                        </p>
                      ) : (
                        <>
                          <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!smtpForm.enabled}
                              onChange={(e) => smtpSet('enabled', e.target.checked)}
                              className="w-4 h-4 accent-violet-500"
                            />
                            ارسال اعلان‌ها با این صندوق فعال باشد (در غیر این صورت از mail خود هاست استفاده می‌شود)
                          </label>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-bold text-white mb-1">هاست SMTP:</label>
                              <input
                                type="text"
                                dir="ltr"
                                value={smtpForm.host}
                                onChange={(e) => smtpSet('host', e.target.value)}
                                placeholder="mail.yourdomain.ir"
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-violet-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-white mb-1">پورت:</label>
                              <input
                                type="number"
                                dir="ltr"
                                value={smtpForm.port}
                                onChange={(e) => smtpSet('port', e.target.value)}
                                placeholder="587"
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-violet-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-white mb-1">رمزنگاری:</label>
                              <select
                                value={smtpForm.encryption}
                                onChange={(e) => smtpSet('encryption', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
                              >
                                <option value="starttls">STARTTLS (پیشنهاد — ۵۸۷)</option>
                                <option value="smtps">SMTPS (۴۶۵)</option>
                                <option value="none">بدون رمزنگاری (۲۵ — ناامن)</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-bold text-white mb-1">نام کاربری (ایمیل صندوق):</label>
                              <input
                                type="text"
                                dir="ltr"
                                value={smtpForm.username}
                                onChange={(e) => smtpSet('username', e.target.value)}
                                placeholder="info@yourdomain.ir"
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-violet-500"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-bold text-white mb-1">
                                رمز صندوق{smtpMeta.hasPassword ? ' (ثبت شده ✅ — خالی = بدون تغییر)' : ' (هنوز ثبت نشده)'}:
                              </label>
                              <div className="relative">
                                <input
                                  type={showSmtpPassword ? 'text' : 'password'}
                                  dir="ltr"
                                  value={smtpForm.password}
                                  onChange={(e) => smtpSet('password', e.target.value)}
                                  placeholder={smtpMeta.hasPassword ? '•••••••• (خالی بگذارید تا عوض نشود)' : 'رمز ایمیل را وارد کنید...'}
                                  autoComplete="new-password"
                                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-violet-500 ltr:pr-10 rtl:pl-10"
                                />
                                <button
                                  type="button"
                                  onClick={handleRevealSmtpPassword}
                                  title={showSmtpPassword ? 'پنهان کردن' : 'نمایش رمز فعلی'}
                                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-violet-300 cursor-pointer"
                                >
                                  {showSmtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-bold text-white mb-1">آدرس فرستنده (خالی = همان نام کاربری):</label>
                              <input
                                type="text"
                                dir="ltr"
                                value={smtpForm.from}
                                onChange={(e) => smtpSet('from', e.target.value)}
                                placeholder="info@yourdomain.ir"
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-violet-500"
                              />
                            </div>
                            <div className="sm:col-span-2 flex items-end">
                              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pb-2">
                                <input
                                  type="checkbox"
                                  checked={!!smtpForm.verifyTls}
                                  onChange={(e) => smtpSet('verifyTls', e.target.checked)}
                                  className="w-4 h-4 accent-violet-500"
                                />
                                بررسی گواهی TLS سرور (اگر تست با خطای TLS شکست خورد، خاموش کنید)
                              </label>
                            </div>
                          </div>

                          {smtpTestResult && !smtpTestResult.ok && (
                            <p className="text-xs text-rose-300 leading-relaxed">
                              ❌ {smtpTestErrorFa(smtpTestResult.error)}
                            </p>
                          )}
                          {smtpTestResult?.ok && (
                            <p className="text-xs text-emerald-300 leading-relaxed">
                              ✅ ایمیل تست ارسال شد — اینباکس ایمیل بازیابی ({serverAccountInfo?.recoveryEmail || adminSecurity?.recoveryEmail || '…'}) را چک کنید (پوشه اسپم هم نگاه کنید).
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2.5">
                            <button
                              type="button"
                              onClick={handleSaveSmtp}
                              disabled={smtpSaving || smtpLoading}
                              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-violet-500/20 hover:bg-violet-500/30 text-violet-200 border border-violet-500/50 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {smtpSaving ? '⏳ در حال ذخیره...' : '💾 ذخیره صندوق SMTP'}
                            </button>
                            <button
                              type="button"
                              onClick={handleTestSmtp}
                              disabled={smtpTesting || smtpLoading}
                              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/50 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              {smtpTesting ? '⏳ در حال ارسال تست...' : 'ارسال ایمیل تست'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* 4. FACTORY RESET */}
                    <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-500/30 space-y-3">
                      <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-rose-400" />
                        <span>بازنشانی به داده‌های پیش‌فرض کارخانه (Factory Reset)</span>
                      </h4>
                      <p className="text-xs text-rose-300/80 leading-relaxed">
                        با کلیک روی این دکمه تمام تغییرات شخصی پاک شده و اطلاعات اولیه بارگذاری می‌شوند (قبل از ریست، یک نسخه پشتیبان خودکار ایجاد می‌شود).
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          showConfirmDialog({
                            title: 'تایید بازنشانی کامل به تنظیمات اولیه کارخانه',
                            message: 'آیا اطمینان دارید؟ تمام تغییرات پاک شده و اطلاعات اولیه بازنشانی می‌شوند. قبل از ریست یک نسخه اسنپ‌شات خودکار ایجاد خواهد شد.',
                            type: 'danger',
                            confirmText: 'بله، ریست کامل کن',
                            cancelText: 'انصراف',
                            onConfirm: () => {
                              resetToDefaults();
                            }
                          });
                        }}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg cursor-pointer"
                      >
                        ریست کامل به حالت اولیه
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      
      {/* PROFESSIONAL WORD-STYLE RICH TEXT EDITOR MODAL */}
      {/* GLOBAL DROPDOWNS & TAXONOMY MANAGER MODAL */}
      <TaxonomyManagerModal
        isOpen={isTaxonomyModalOpen}
        onClose={() => setIsTaxonomyModalOpen(false)}
        initialTab={taxonomyModalTab}
      />

      <RichTextEditorModal
        isOpen={richEditorState.isOpen}
        onClose={() => setRichEditorState((prev) => ({ ...prev, isOpen: false }))}
        title={richEditorState.title}
        fieldName={richEditorState.fieldName}
        language={richEditorState.language}
        initialValue={richEditorState.initialValue}
        onSave={(val) => {
          if (richEditorState.onSave) {
            richEditorState.onSave(val);
          }
          showToast('متن با موفقیت در فرم اعمال شد.');
        }}
      />
</div>
    </div>
  );
};
