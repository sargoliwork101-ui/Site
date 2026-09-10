/**
 * ============================================================================
 * USER MANAGEMENT & ROLE-BASED ACCESS CONTROL (RBAC) MODULE
 * ============================================================================
 * 
 * Features:
 * 1. Multi-User Accounts (Super Admin, System Admin, Editor, Author, Viewer, Custom)
 * 2. 10 Granular Permission Checkbox Matrix
 * 3. 1-Click Fast-Switch / Impersonate to test role permissions in real-time
 * 4. User Status (Active / Inactive) toggle
 * 5. Primary Admin Protection (prevents accidental deletion of root admin)
 *
 * @module UserManagementSection
 */

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  Users,
  UserPlus,
  ShieldAlert,
  Zap,
  Edit2,
  Trash2,
  Key,
  Mail,
  User,
  Search,
  CheckCircle2,
  Sliders,
  Check,
  X,
  Eye,
  EyeOff,
  Cpu,
  BookOpen,
  Layers,
  Briefcase,
  GraduationCap,
  Palette,
  Database,
  Lock,
  MessageSquare
} from 'lucide-react';

const PERMISSION_CONFIGS = [
  { key: 'canManageBoards', labelFa: 'مدیریت بردهای سخت‌افزاری', labelEn: 'Hardware Boards', icon: Cpu, descFa: 'ثبت، ویرایش و حذف بردهای الکترونیکی و مشخصات فنی' },
  { key: 'canManageArticles', labelFa: 'مدیریت مقالات تخصصی', labelEn: 'Articles & Pubs', icon: BookOpen, descFa: 'نگارش، ویرایش با ادیتور ورد و مدیریت مقالات علمی' },
  { key: 'canManageSkills', labelFa: 'مدیریت کارت‌ها و مهارت‌ها', labelEn: 'Skills Matrix', icon: Layers, descFa: 'تغییر کارت‌ها، درصد تسلط و دسته‌بندی‌های مهارت' },
  { key: 'canManageExperience', labelFa: 'مدیریت سوابق کاری و شغلی', labelEn: 'Work Experience', icon: Briefcase, descFa: 'ویرایش درخت سوابق لینکدین، دوره‌ها و دستاوردها' },
  { key: 'canManageEducation', labelFa: 'مدیریت سوابق تحصیلی و مدارک', labelEn: 'Education & Certs', icon: GraduationCap, descFa: 'ویرایش مقاطع دانشگاهی و مدارک بین‌المللی' },
  { key: 'canManageContact', labelFa: 'مشاهده و مدیریت پیام‌ها', labelEn: 'Contact Inbox', icon: MessageSquare, descFa: 'مشاهده، ستاره‌گذاری و حذف پیام‌های دریافتی' },
  { key: 'canManageTaxonomies', labelFa: 'مدیریت واژگان و دسته‌ها', labelEn: 'Taxonomies', icon: Sliders, descFa: 'تغییر دسته‌بندی‌ها، ابزارها و سینک خودکار سراسری' },
  { key: 'canManageTemplates', labelFa: 'تغییر قالب و ظاهر سایت', labelEn: 'Templates & Design', icon: Palette, descFa: 'انتخاب از بین ۵۰ قالب زنده و تغییر پالت رنگی' },
  { key: 'canManageBackups', labelFa: 'پشتیبان‌گیری و بازگردانی', labelEn: 'Backup & Restore', icon: Database, descFa: 'ایجاد اسنپ‌شات و دانلود/بازیابی فایل کامل JSON' },
  { key: 'canManageUsers', labelFa: 'مدیریت کاربران و دسترسی‌ها', labelEn: 'User RBAC Management', icon: Users, descFa: 'تعریف کاربر جدید، تغییر نقش‌ها و تخصیص مجوزها' },
  { key: 'canManageSecurity', labelFa: 'تنظیمات امنیتی و کلید ریشه', labelEn: 'Root Security & OTP', icon: Lock, descFa: 'تغییر رمز عبور اصلی و تایید دومرحله‌ای ایمیل' },
];

export const UserManagementSection = () => {
  const {
    users,
    currentUser,
    addUser,
    updateUser,
    deleteUser,
    switchUserForTesting,
    ROLE_DEFINITIONS,
    showToast,
    showConfirmDialog
  } = useData();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingUserId, setEditingUserId] = useState(null);

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nameFa, setNameFa] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [status, setStatus] = useState('active');
  const [permissions, setPermissions] = useState({ ...ROLE_DEFINITIONS.editor.defaultPermissions });
  const [showPassword, setShowPassword] = useState(false);
  const [showAdvancedPermissions, setShowAdvancedPermissions] = useState(false);

  // Open modal for Adding new user
  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingUserId(null);
    setUsername('');
    setPassword('');
    setNameFa('');
    setNameEn('');
    setEmail('');
    setRole('editor');
    setStatus('active');
    setPermissions({ ...ROLE_DEFINITIONS.editor.defaultPermissions });
    setShowAdvancedPermissions(false);
    setIsModalOpen(true);
  };

  // Open modal for Editing existing user
  const handleOpenEditModal = (userItem) => {
    setModalMode('edit');
    setEditingUserId(userItem.id);
    setUsername(userItem.username);
    setPassword(''); // never prefill (hashes stay server-side-invisible); empty = keep old
    setNameFa(userItem.nameFa || '');
    setNameEn(userItem.nameEn || '');
    setEmail(userItem.email || '');
    setRole(userItem.role || 'editor');
    setStatus(userItem.status || 'active');
    setPermissions(userItem.permissions || { ...ROLE_DEFINITIONS[userItem.role || 'editor']?.defaultPermissions });
    setShowAdvancedPermissions(userItem.role === 'custom');
    setIsModalOpen(true);
  };

  // Handle Role Selection Change in Form
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    const roleDef = ROLE_DEFINITIONS[newRole];
    if (roleDef && newRole !== 'custom') {
      setPermissions({ ...roleDef.defaultPermissions });
      setShowAdvancedPermissions(false);
    } else if (newRole === 'custom') {
      setShowAdvancedPermissions(true);
    }
  };

  // Toggle individual permission checkbox
  const handleTogglePermission = (permKey) => {
    setPermissions((prev) => ({
      ...prev,
      [permKey]: !prev[permKey],
    }));
  };

  // Submit Form (Add or Edit) — async: passwords are PBKDF2-hashed
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      showToast('لطفاً نام کاربری را وارد فرمایید.', 'error');
      return;
    }

    if (modalMode === 'add' && !password.trim()) {
      showToast('لطفاً رمز عبور کاربر را مشخص نمایید.', 'error');
      return;
    }

    const payload = {
      username: username.trim().toLowerCase(),
      password: password.trim(),
      nameFa: nameFa.trim() || username.trim(),
      nameEn: nameEn.trim() || username.trim(),
      email: email.trim().toLowerCase(),
      role,
      status,
      permissions,
    };

    if (modalMode === 'add') {
      const ok = await addUser(payload);
      if (ok) setIsModalOpen(false);
    } else {
      const ok = await updateUser(editingUserId, payload);
      if (ok) setIsModalOpen(false);
    }
  };

  // Filtered Users List
  const filteredUsers = (users || []).filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.username.toLowerCase().includes(q) ||
      (u.nameFa && u.nameFa.toLowerCase().includes(q)) ||
      (u.nameEn && u.nameEn.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q));

    return matchesRole && matchesSearch;
  });

  const superAdminCount = (users || []).filter((u) => u.role === 'super_admin').length;
  const editorCount = (users || []).filter((u) => u.role === 'editor' || u.role === 'author').length;
  const activeCount = (users || []).filter((u) => u.status === 'active').length;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* 1. TOP STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-mono font-black text-white">{users.length}</div>
            <div className="text-[11px] text-slate-400">کل کاربران سامانه</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-mono font-black text-rose-400">{superAdminCount}</div>
            <div className="text-[11px] text-slate-400">مدیران ارشد (Full)</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <Edit2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-mono font-black text-emerald-400">{editorCount}</div>
            <div className="text-[11px] text-slate-400">ویرایشگران و نویسندگان</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-mono font-black text-amber-400">{activeCount}</div>
            <div className="text-[11px] text-slate-400">حساب‌های فعال</div>
          </div>
        </div>
      </div>

      {/* 2. CONTROL BAR (SEARCH, FILTER & ADD BUTTON) */}
      <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در نام، ایمیل، یوزر..."
              className="w-full px-9 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">همه نقش‌ها</option>
            <option value="super_admin">مدیر ارشد (Super Admin)</option>
            <option value="admin">مدیر سیستم (Admin)</option>
            <option value="editor">ویرایشگر محتوا (Editor)</option>
            <option value="author">نویسنده / مهندس (Author)</option>
            <option value="viewer">ناظر (Viewer)</option>
            <option value="custom">سفارشی (Custom)</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 transition-all shadow-lg shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>تعریف کاربر جدید با نقش و دسترسی اختصاصی</span>
        </button>
      </div>

      {/* 3. USERS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredUsers.map((u) => {
          const roleDef = ROLE_DEFINITIONS[u.role] || ROLE_DEFINITIONS.editor;
          const isCurrentActiveUser = currentUser && currentUser.id === u.id;
          const isPrimaryRoot = u.username === 'admin' || u.isPrimary;

          return (
            <div
              key={u.id}
              className={`p-5 rounded-2xl bg-slate-950/80 border transition-all space-y-4 shadow-xl relative overflow-hidden ${
                isCurrentActiveUser
                  ? 'border-cyan-500/80 shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {isCurrentActiveUser && (
                <div className="absolute top-0 left-0 bg-cyan-500 text-slate-950 text-[10px] font-bold px-3 py-0.5 rounded-br-xl font-mono">
                  ACTIVE_SESSION (شما)
                </div>
              )}

              {/* User Header */}
              <div className="flex items-start justify-between gap-3 pt-1">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-2xl shadow-inner shrink-0">
                    {u.avatar || roleDef.icon || '👤'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        {u.nameFa || u.username}
                      </h4>
                      {isPrimaryRoot && (
                        <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.2 rounded-full font-bold">
                          ریشه سامانه
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <span>@{u.username}</span>
                      <span>•</span>
                      <span className="text-slate-500 text-[11px] truncate max-w-[150px]">{u.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-[11px] font-bold px-2.5 py-0.8 rounded-full border ${roleDef.badgeClass}`}>
                    {roleDef.labelFa}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                      u.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {u.status === 'active' ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>
              </div>

              {/* Role Description & Permissions Summary */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {roleDef.descriptionFa}
                </p>

                {/* Enabled Permissions Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PERMISSION_CONFIGS.map((perm) => {
                    const isEnabled = u.role === 'super_admin' || (u.permissions && u.permissions[perm.key]);
                    return (
                      <span
                        key={perm.key}
                        className={`text-[10px] px-2 py-0.5 rounded-lg font-medium flex items-center gap-1 ${
                          isEnabled
                            ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-950/40 text-slate-600 border border-slate-800 line-through opacity-40'
                        }`}
                        title={perm.descFa}
                      >
                        {isEnabled ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <X className="w-2.5 h-2.5 text-slate-600" />}
                        <span>{perm.labelFa}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Footer Meta & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-850">
                <div className="text-[11px] text-slate-500">
                  <span>آخرین ورود: </span>
                  <span className="text-slate-400 font-mono">{u.lastLogin || 'ثبت نشده'}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(u)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                    title="ویرایش کاربر و تغییر دسترسی‌ها"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ویرایش دسترسی‌ها</span>
                  </button>

                  {/* Delete Button */}
                  {!isPrimaryRoot && (
                    <button
                      type="button"
                      onClick={() => {
                        showConfirmDialog({
                          type: 'danger',
                          title: 'حذف کاربر؟',
                          message: `کاربر «${u.nameFa || u.username}» برای همیشه حذف می‌شود و این عمل قابل بازگشت نیست.`,
                          confirmText: 'بله، حذف کن',
                          onConfirm: () => deleteUser(u.id),
                        });
                      }}
                      className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer"
                      title="حذف کاربر"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* ADD / EDIT USER MODAL                                              */}
      {/* =================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div
            className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
                  {modalMode === 'add' ? <UserPlus className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {modalMode === 'add' ? 'تعریف کاربر جدید در سامانه' : 'ویرایش اطلاعات و دسترسی‌های کاربر'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    تعیین مشخصات هویتی، رمز ورود و سطوح دسترسی بر اساس مدل RBAC
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    نام کاربری (Username): *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="admin, editor, hardware_lead..."
                      className="w-full px-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    رمز عبور ورود: *
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={modalMode === 'add'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={modalMode === 'edit' ? 'خالی = بدون تغییر (حداقل ۸ کاراکتر برای رمز جدید)' : 'حداقل ۸ کاراکتر...'}
                      className="w-full px-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rtl:left-3 rtl:right-auto ltr:right-3 ltr:left-auto text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Names Fa & En */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    نام و نام خانوادگی به فارسی:
                  </label>
                  <input
                    type="text"
                    value={nameFa}
                    onChange={(e) => setNameFa(e.target.value)}
                    placeholder="مثال: مهندس سارا راد"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Full Name in English:
                  </label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Sara Rad"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Email & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    آدرس ایمیل کاربر:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@electronic-embedded.com"
                      className="w-full px-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    وضعیت حساب کاربری:
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="active">فعال (Active - مجاز به ورود)</option>
                    <option value="inactive">غیرفعال (Inactive - مسدود شده)</option>
                  </select>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-white">
                  نقش و الگوی دسترسی کاربر (Role Preset):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {Object.values(ROLE_DEFINITIONS).map((r) => {
                    const isSelected = role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleRoleChange(r.id)}
                        className={`p-3 rounded-xl border text-right rtl:text-right ltr:text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-500 text-white ring-1 ring-cyan-500/50'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg">{r.icon}</span>
                          {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                        </div>
                        <div className="text-xs font-bold text-slate-200 mt-2">{r.labelFa}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-2 mt-1">{r.descriptionFa}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Granular Permissions Checkbox Matrix */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">
                      ماتریس تفکیکی مجوزها (Granular Permission Matrix)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAdvancedPermissions(!showAdvancedPermissions)}
                    className="text-xs text-cyan-400 hover:underline font-semibold"
                  >
                    {showAdvancedPermissions ? 'بستن ریزمجوزها' : 'نمایش و سفارشی‌سازی ریزمجوزها'}
                  </button>
                </div>

                {showAdvancedPermissions && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 animate-fadeIn">
                    {PERMISSION_CONFIGS.map((perm) => {
                      const Icon = perm.icon;
                      const isChecked = role === 'super_admin' ? true : !!permissions[perm.key];
                      const isDisabled = role === 'super_admin';

                      return (
                        <label
                          key={perm.key}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          } ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="checkbox"
                            disabled={isDisabled}
                            checked={isChecked}
                            onChange={() => handleTogglePermission(perm.key)}
                            className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-0"
                          />
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                              <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span>{perm.labelFa}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{perm.descFa}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all"
                >
                  انصراف
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-lg flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{modalMode === 'add' ? 'ثبت و ایجاد کاربر جدید' : 'ذخیره تغییرات کاربر'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
