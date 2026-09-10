/**
 * ============================================================================
 * SECURE PRODUCTION ADMIN & MULTI-USER AUTHENTICATION MODAL
 * ============================================================================
 * 
 * Production Features:
 * 1. Multi-User Authentication (Super Admin, Editor, Hardware Engineer, Viewer, Custom)
 * 2. Brute-Force Rate Limiting Shield & Cooldown Timer
 * 3. Password Visibility Toggle & Timing-Safe Verification
 * 4. Forgot Password Flow: Sends 6-Digit OTP to Registered Recovery Email & Resets Password
 *
 * @module AdminLoginModal
 */

import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldAlert,
  Mail,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  User
} from 'lucide-react';
import { loginRateLimiter, validateEmail } from '../../utils/security';

export const AdminLoginModal = () => {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginUser,
    requestPasswordResetOtp,
    verifyPasswordResetOtp,
    resetPasswordWithOtp,
    setupServerAccount,
    verifyServerSetupOtp,
    skipServerSetupVerify,
    emergencyLocalReset,
    getLocalSecQaQuestions,
    backend,
    adminSecurity,
    data
  } = useData();

  // Modal Views: 'login' | 'setup' | 'setup_otp' | 'forgot_email' | 'forgot_otp' | 'forgot_new_pass'
  const [view, setView] = useState('login');

  // Input states (clean production defaults)
  const [usernameInput, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status & Timers
  const [error, setError] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
  // Server round-trip busy flag + first-run setup + local emergency states.
  // (No on-screen OTP fallback: codes live ONLY in server memory + inbox.)
  const [isBusy, setIsBusy] = useState(false);
  const [setupPassword, setSetupPassword] = useState('');
  const [setupPassword2, setSetupPassword2] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupMailError, setSetupMailError] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [secQuestions, setSecQuestions] = useState([]);
  const [secAnswers, setSecAnswers] = useState(['', '', '']);

  const isFa = data?.siteConfig?.language === 'fa';

  // Reset state on modal open/close
  useEffect(() => {
    if (isLoginModalOpen) {
      setView('login');
      setUsernameInput('');
      setPassword('');
      setError('');
      setIsBusy(false);
      setOtpInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setSetupPassword('');
      setSetupPassword2('');
      setSetupEmail(adminSecurity?.recoveryEmail || data?.personalInfo?.email || '');
      setSetupMailError(false);
      setShowEmergency(false);
      setSecQuestions([]);
      setSecAnswers(['', '', '']);
      setEmailInput(adminSecurity?.recoveryEmail || data?.personalInfo?.email || '');
    }
  }, [isLoginModalOpen, adminSecurity?.recoveryEmail, data?.personalInfo?.email]);

  // Monitor Rate Limiter Cooldown
  useEffect(() => {
    let interval = null;
    if (isLoginModalOpen) {
      interval = setInterval(() => {
        const remaining = loginRateLimiter.getRemainingCooldownSeconds();
        setCooldownSeconds(remaining);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoginModalOpen]);

  // OTP Resend Countdown Timer
  useEffect(() => {
    let timer = null;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendTimer]);

  if (!isLoginModalOpen) return null;

  // --- 1. Multi-User Login Handler (REAL server check for master admin) ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (cooldownSeconds > 0 || isBusy) return;

    if (!usernameInput.trim()) {
      setError(isFa ? 'لطفاً نام کاربری را وارد فرمایید.' : 'Please enter your username.');
      return;
    }

    if (!password) {
      setError(isFa ? 'لطفاً رمز عبور را وارد فرمایید.' : 'Please enter your password.');
      return;
    }

    setIsBusy(true);
    setError('');
    try {
      const result = await loginUser(usernameInput, password);
      if (!result.success) {
        if (result.error === 'setup_required') {
          // First run on real hosting → jump to the secure setup wizard.
          setView('setup');
          setError('');
          return;
        }
        setError(
          isFa
            ? 'نام کاربری یا رمز عبور وارد شده نادرست است.'
            : 'Incorrect username or password provided.'
        );
        const remaining = loginRateLimiter.getRemainingCooldownSeconds();
        setCooldownSeconds(remaining);
      } else {
        setError('');
      }
    } finally {
      setIsBusy(false);
    }
  };

  // --- 1B. First-Run SERVER Setup: master password + recovery email + OTP ---
  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    if (isBusy) return;
    if (!setupPassword || setupPassword.length < 8) {
      setError(isFa ? 'رمز عبور باید حداقل ۸ کاراکتر باشد.' : 'Password must be at least 8 characters.');
      return;
    }
    if (setupPassword !== setupPassword2) {
      setError(isFa ? 'تکرار رمز عبور مطابقت ندارد.' : 'Passwords do not match.');
      return;
    }
    if (!validateEmail(setupEmail)) {
      setError(isFa ? 'لطفاً یک ایمیل معتبر وارد فرمایید.' : 'Please enter a valid email address.');
      return;
    }
    setIsBusy(true);
    setError('');
    setSetupMailError(false);
    try {
      const res = await setupServerAccount(setupPassword, setupEmail);
      if (res.success) {
        if (res.emailSent) {
          setResendTimer(60);
          setView('setup_otp');
        } else {
          // Account created, but mail() failed → offer the skip hatch.
          setSetupMailError(true);
        }
      } else if (res.error === 'already_setup') {
        setView('login');
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleSetupOtpSubmit = async (e) => {
    e.preventDefault();
    if (isBusy) return;
    if (!otpInput || otpInput.trim().length !== 6) {
      setError(isFa ? 'کد تایید باید ۶ رقمی باشد.' : 'OTP code must be 6 digits.');
      return;
    }
    setIsBusy(true);
    setError('');
    try {
      await verifyServerSetupOtp(otpInput); // closes modal + logs in on success
    } finally {
      setIsBusy(false);
    }
  };

  const handleSkipSetupVerify = async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      await skipServerSetupVerify(); // closes modal + logs in (unverified)
    } finally {
      setIsBusy(false);
    }
  };

  // --- 2. Forgot Password: Request OTP (REAL server-issued code) ---
  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    if (isBusy) return;
    if (!validateEmail(emailInput)) {
      setError(isFa ? 'لطفاً یک آدرس ایمیل معتبر وارد فرمایید.' : 'Please enter a valid email address.');
      return;
    }

    setIsBusy(true);
    setError('');
    try {
      const res = await requestPasswordResetOtp(emailInput);
      if (res.success) {
        setResendTimer(Math.max(60, res.retryAfter || 0));
        setView('forgot_otp');
      } else if (res.error === 'no_backend') {
        // Honest local mode: no email channel exists here.
        setShowEmergency(true);
        try { setSecQuestions(getLocalSecQaQuestions() || []); } catch { setSecQuestions([]); }
        setSecAnswers(['', '', '']);
        setError(
          isFa
            ? 'در حالت محلی (بدون بک‌اند) ارسال ایمیل ممکن نیست. از ریست اضطراری زیر استفاده کنید.'
            : 'Local mode has no email channel. Use the emergency reset below.'
        );
      } else if (res.error !== 'rate_limit' && res.error !== 'invalid_email') {
        // Generic on purpose (anti-enumeration): never reveal registered emails.
        setError(isFa ? 'اگر این ایمیل ثبت شده باشد، کد تایید ارسال شد.' : 'If registered, a code was sent.');
      }
    } finally {
      setIsBusy(false);
    }
  };

  // LOCAL-MODE ONLY recovery, gated by the recovery answers set in the panel.
  const handleEmergencyReset = async () => {
    if (isBusy) return;
    setIsBusy(true);
    setError('');
    try {
      const ok = await emergencyLocalReset(secAnswers);
      if (ok) {
        setShowEmergency(false);
        setView('login');
        setUsernameInput('admin');
        setPassword('');
        setError(isFa ? 'رمز ریست شد (admin). وارد شوید و فوراً عوضش کنید.' : 'Reset to admin. Log in and change it now.');
      } else {
        setError(
          secQuestions.length < 2
            ? (isFa ? 'سؤالات بازیابی هنوز در پنل (بخش امنیت) ثبت نشده‌اند — ریست قفل است.' : 'Recovery questions are not set in the panel (Security tab) — reset is locked.')
            : (isFa ? 'جواب‌ها درست نیست. دوباره تلاش کنید.' : 'Wrong answers. Try again.')
        );
      }
    } finally {
      setIsBusy(false);
    }
  };

  // --- 3. Forgot Password: Verify OTP (server issues single-use token) ---
  const handleForgotOtpSubmit = async (e) => {
    e.preventDefault();
    if (isBusy) return;
    if (!otpInput || otpInput.trim().length !== 6) {
      setError(isFa ? 'کد تایید باید ۶ رقمی باشد.' : 'OTP code must be 6 digits.');
      return;
    }

    setIsBusy(true);
    setError('');
    try {
      const valid = await verifyPasswordResetOtp(emailInput, otpInput);
      if (valid) {
        setView('forgot_new_pass');
      } else {
        setError(isFa ? 'کد تایید وارد شده نادرست یا منقضی شده است.' : 'Invalid or expired verification code.');
      }
    } finally {
      setIsBusy(false);
    }
  };

  // --- 4. Forgot Password: Save New Password (bcrypt, server-side) ---
  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    if (isBusy) return;
    if (newPasswordInput.length < 8) {
      setError(isFa ? 'رمز عبور جدید باید حداقل ۸ کاراکتر باشد.' : 'Password must be at least 8 characters.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setError(isFa ? 'تکرار رمز عبور با رمز جدید مطابقت ندارد.' : 'Passwords do not match.');
      return;
    }

    setIsBusy(true);
    setError('');
    try {
      const success = await resetPasswordWithOtp(newPasswordInput);
      if (!success) {
        setError(isFa ? 'خطا در ثبت رمز عبور جدید.' : 'Failed to reset password.');
      }
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsLoginModalOpen(false)}
          className="absolute top-4 left-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label={isFa ? 'بستن' : 'Close'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* ================================================================= */}
        {/* VIEW 1: PRODUCTION LOGIN FORM                                     */}
        {/* ================================================================= */}
        {view === 'login' && (
          <>
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-white">
                {isFa ? 'ورود به پنل مدیریت سامانه' : 'Admin & Staff Login'}
              </h3>
              <p className="text-xs text-slate-400">
                {isFa
                  ? 'جهت مدیریت محتوا، بردهای سخت‌افزاری و وبلاگ وارد شوید.'
                  : 'Enter your credentials to access the management workspace.'}
              </p>
            </div>

            {/* Security-mode pill (honest: server vs local) */}
            <div className="flex justify-center">
              {backend?.checked && backend.available ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isFa ? '🔒 حالت امن (احراز هویت سرور)' : '🔒 Secure mode (server auth)'}
                </span>
              ) : backend?.checked ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/40">
                  {isFa ? '🖥️ حالت محلی (پیش‌نمایش / تست)' : '🖥️ Local mode (preview/testing)'}
                </span>
              ) : null}
            </div>

            {/* First-run setup prompt (real hosting, account not created yet) */}
            {backend?.checked && backend.available && !backend.setupDone && (
              <button
                type="button"
                onClick={() => { setView('setup'); setError(''); }}
                className="w-full p-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-center transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold text-amber-300">
                  {isFa ? '⚙️ راه‌اندازی اولیه: ساخت رمز مدیر و ایمیل بازیابی' : '⚙️ First-time setup: create admin password'}
                </span>
              </button>
            )}

            {/* Rate Limiting Shield */}
            {cooldownSeconds > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-center space-y-1 text-rose-300 animate-pulse">
                <div className="text-xs font-bold flex items-center justify-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>{isFa ? 'سیستم ضد نفوذ فعال است (Rate Limit)' : 'Brute-Force Shield Active'}</span>
                </div>
                <p className="text-[11px]">
                  {isFa
                    ? `به دلیل تلاش‌های ناموفق، ورود به مدت ${cooldownSeconds} ثانیه قفل شده است.`
                    : `Access is temporarily locked for ${cooldownSeconds} seconds.`}
                </p>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isFa ? 'نام کاربری یا ایمیل:' : 'Username or Email:'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 rtl:right-3.5 rtl:left-auto ltr:left-3.5 ltr:right-auto" />
                  <input
                    type="text"
                    required
                    disabled={cooldownSeconds > 0}
                    value={usernameInput}
                    onChange={(e) => {
                      setUsernameInput(e.target.value);
                      setError('');
                    }}
                    placeholder={isFa ? 'نام کاربری (مثلاً admin)...' : 'Username (e.g. admin)...'}
                    className="w-full px-10 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono text-sm transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    {isFa ? 'رمز عبور:' : 'Password:'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setView('forgot_email');
                      setError('');
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                  >
                    {isFa ? 'فراموشی رمز عبور؟' : 'Forgot Password?'}
                  </button>
                </div>

                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 rtl:right-3.5 rtl:left-auto ltr:left-3.5 ltr:right-auto" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={cooldownSeconds > 0}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="••••••••"
                    className="w-full px-10 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono text-center tracking-widest text-base transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 rtl:left-3.5 rtl:right-auto ltr:right-3.5 ltr:left-auto text-slate-500 hover:text-slate-300 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {error && cooldownSeconds === 0 && (
                  <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{error}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={cooldownSeconds > 0 || isBusy}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isBusy ? (isFa ? 'در حال بررسی...' : 'Checking...') : (isFa ? 'احراز هویت و ورود به پنل' : 'Authenticate & Enter')}</span>
              </button>
            </form>
          </>
        )}

        {/* ================================================================= */}
        {/* VIEW SETUP: FIRST-RUN MASTER ACCOUNT (server-side, bcrypt)        */}
        {/* ================================================================= */}
        {view === 'setup' && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {isFa ? 'راه‌اندازی اولیه پنل مدیریت' : 'First-Time Admin Setup'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isFa
                  ? 'رمز عبور مدیر ارشد و ایمیل بازیابی را تعیین کنید. رمز به‌صورت امن روی سرور ذخیره می‌شود.'
                  : 'Create the master password and recovery email. Stored securely on the server.'}
              </p>
            </div>

            {backend?.checked && !backend.mailAvailable && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-[11px] text-amber-300 leading-relaxed">
                {isFa
                  ? '⚠️ ارسال ایمیل (PHP mail) روی این هاست غیرفعال است. می‌توانید بدون تایید ایمیل وارد شوید و بعداً از بخش امنیت اقدام کنید.'
                  : '⚠️ Email sending (PHP mail) is disabled on this host. You may enter without verification and fix it later.'}
              </div>
            )}

            <form onSubmit={handleSetupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isFa ? 'رمز عبور مدیر (حداقل ۸ کاراکتر):' : 'Admin password (min 8 chars):'}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={setupPassword}
                  onChange={(e) => { setSetupPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isFa ? 'تکرار رمز عبور:' : 'Repeat password:'}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={setupPassword2}
                  onChange={(e) => { setSetupPassword2(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isFa ? 'ایمیل بازیابی:' : 'Recovery email:'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={setupEmail}
                    onChange={(e) => { setSetupEmail(e.target.value); setError(''); }}
                    placeholder="admin@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                  />
                </div>
                {error && (
                  <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{error}</span>
                  </p>
                )}
              </div>

              {setupMailError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/40 space-y-2.5">
                  <p className="text-[11px] text-rose-300 leading-relaxed">
                    {isFa
                      ? '❌ حساب ساخته شد اما ایمیل تایید ارسال نشد (اختلال PHP mail هاست). می‌توانید بدون تایید وارد شوید و بعداً از بخش «امنیت و رمز عبور» ایمیل را تایید کنید.'
                      : '❌ Account created but the email failed (host PHP mail issue). You may enter unverified and verify later.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleSkipSetupVerify}
                    disabled={isBusy}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isBusy ? (isFa ? 'در حال ورود...' : 'Entering...') : (isFa ? 'ورود بدون تایید ایمیل' : 'Enter without verification')}
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => { setView('login'); setError(''); }}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  {isFa ? 'بازگشت به صفحه ورود' : 'Back to Login'}
                </button>
                <button
                  type="submit"
                  disabled={isBusy}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg flex items-center gap-1.5 ${isBusy ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
                >
                  <span>{isBusy ? (isFa ? 'در حال ساخت...' : 'Creating...') : (isFa ? 'ساخت حساب + ارسال کد' : 'Create + Send Code')}</span>
                  {isFa ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW SETUP-OTP: VERIFY RECOVERY EMAIL                             */}
        {/* ================================================================= */}
        {view === 'setup_otp' && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg">
                <Mail className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {isFa ? 'تایید ایمیل بازیابی' : 'Verify Recovery Email'}
              </h3>
              <p className="text-xs text-slate-400">
                {isFa
                  ? `کد ۶ رقمی ارسال شده به ${setupEmail} را وارد کنید.`
                  : `Enter the 6-digit code sent to ${setupEmail}`}
              </p>
            </div>

            <form onSubmit={handleSetupOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isFa ? 'کد تایید ۶ رقمی:' : '6-Digit Code:'}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => { setOtpInput(e.target.value.replace(/\D/g, '')); setError(''); }}
                  placeholder="123456"
                  className="w-full py-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-center tracking-widest text-2xl font-bold"
                />
                {error && (
                  <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{error}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isBusy}
                className={`w-full py-3.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg flex items-center justify-center gap-2 ${isBusy ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isBusy ? (isFa ? 'در حال تایید...' : 'Verifying...') : (isFa ? 'تایید و ورود به پنل' : 'Verify & Enter')}</span>
              </button>

              <button
                type="button"
                onClick={handleSkipSetupVerify}
                disabled={isBusy}
                className="w-full text-xs text-slate-400 hover:text-white disabled:opacity-50 cursor-pointer"
              >
                {isFa ? 'ایمیل نمی‌رسد؟ ورود بدون تایید' : 'No email? Enter without verification'}
              </button>
            </form>
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 2: FORGOT PASSWORD - ENTER RECOVERY EMAIL                    */}
        {/* ================================================================= */}
        {view === 'forgot_email' && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg">
                <Mail className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {isFa ? 'بازیابی رمز عبور با ایمیل' : 'Reset Admin Password'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isFa
                  ? 'آدرس ایمیل ثبت‌شده در سیستم را وارد کنید تا کد تایید برای شما ارسال شود.'
                  : 'Enter your registered recovery email to receive a secure password reset token.'}
              </p>
            </div>

            <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isFa ? 'ایمیل بازیابی مدیر:' : 'Recovery Email:'}
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setError('');
                  }}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
                {error && (
                  <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{error}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    setError('');
                  }}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  {isFa ? 'بازگشت به صفحه ورود' : 'Back to Login'}
                </button>

                <button
                  type="submit"
                  disabled={isBusy}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-lg flex items-center gap-1.5 ${isBusy ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
                >
                  <span>{isBusy ? (isFa ? 'در حال ارسال...' : 'Sending...') : (isFa ? 'دریافت کد تایید' : 'Send Reset Code')}</span>
                  {isFa ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </form>

            {/* LOCAL-MODE ONLY emergency reset (physical access to THIS browser) */}
            {showEmergency && !backend?.available && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/40 space-y-2.5 animate-fadeIn">
                <p className="text-[11px] text-rose-300 leading-relaxed">
                  {isFa
                    ? '🖥️ حالت محلی است و ایمیلی ارسال نمی‌شود. برای ریست رمز، به سؤالات بازیابی (ثبت‌شده در پنل ← امنیت) پاسخ دهید:'
                    : '🖥️ Local mode: no email channel. Answer the recovery questions (set in Panel → Security) to reset:'}
                </p>
                {secQuestions.length < 2 ? (
                  <p className="text-[11px] font-bold text-amber-300 leading-relaxed">
                    {isFa
                      ? '⚠️ سؤالات بازیابی هنوز ثبت نشده‌اند؛ ریست اضطراری قفل است. (پس از ورود از بخش امنیت ثبتشان کنید.)'
                      : '⚠️ Recovery questions are not set yet; emergency reset is locked. (Set them in Security after login.)'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {secQuestions.slice(0, 3).map((q, i) => (
                      <div key={i}>
                        <label className="block text-[11px] font-bold text-rose-200 mb-1">{q}</label>
                        <input
                          type="text"
                          value={secAnswers[i] || ''}
                          onChange={(e) => setSecAnswers((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
                          placeholder={isFa ? 'پاسخ...' : 'Answer...'}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-rose-500/40 text-xs text-white focus:outline-none focus:border-rose-400"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleEmergencyReset}
                      disabled={isBusy || secQuestions.slice(0, 3).some((_, i) => !(secAnswers[i] || '').trim())}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/50 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isBusy ? (isFa ? 'در حال بررسی...' : 'Checking...') : (isFa ? 'ریست رمز با جواب‌ها' : 'Reset with answers')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 3: FORGOT PASSWORD - VERIFY OTP                              */}
        {/* ================================================================= */}
        {view === 'forgot_otp' && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {isFa ? 'تایید کد بازیابی ۶ رقمی' : 'Verify Recovery Token'}
              </h3>
              <p className="text-xs text-slate-400">
                {isFa
                  ? `کد ۶ رقمی ارسال شده به ${emailInput} را وارد کنید.`
                  : `Enter the 6-digit token sent to ${emailInput}`}
              </p>
            </div>

            <form onSubmit={handleForgotOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isFa ? 'کد تایید ۶ رقمی:' : '6-Digit Code:'}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                  placeholder="123456"
                  className="w-full py-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono text-center tracking-widest text-2xl font-bold"
                />
                {error && (
                  <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{error}</span>
                  </p>
                )}
              </div>

              {/* Inbox hint (the code ONLY exists in server memory + your inbox) */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                {isFa
                  ? '💡 کد فقط به ایمیل شما ارسال شده و هیچ‌جای دیگری نمایش داده نمی‌شود. اگر نیامد، پوشه اسپم را هم بررسی کنید.'
                  : '💡 The code was sent to your inbox only. Check spam if missing.'}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => setView('forgot_email')}
                  className="hover:text-white cursor-pointer"
                >
                  {isFa ? 'تغییر ایمیل' : 'Back'}
                </button>

                {resendTimer > 0 ? (
                  <span className="font-mono text-[11px] text-slate-500">
                    {resendTimer}s {isFa ? 'تا ارسال مجدد' : 'cooldown'}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleForgotEmailSubmit}
                    disabled={isBusy}
                    className={`font-semibold ${isBusy ? 'text-slate-500 cursor-wait' : 'text-cyan-400 hover:text-cyan-300 cursor-pointer'}`}
                  >
                    {isBusy ? (isFa ? 'در حال ارسال...' : 'Sending...') : (isFa ? 'ارسال مجدد کد' : 'Resend Code')}
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isBusy}
                className={`w-full py-3.5 rounded-xl font-bold text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-lg flex items-center justify-center gap-2 ${isBusy ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
              >
                <span>{isBusy ? (isFa ? 'در حال تایید...' : 'Verifying...') : (isFa ? 'تایید کد و تغییر رمز' : 'Verify & Continue')}</span>
                {isFa ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 4: FORGOT PASSWORD - SET NEW PASSWORD                        */}
        {/* ================================================================= */}
        {view === 'forgot_new_pass' && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {isFa ? 'تعریف رمز عبور جدید' : 'Set New Security Key'}
              </h3>
              <p className="text-xs text-slate-400">
                {isFa
                  ? 'رمز عبور جدید مدیر را وارد نمایید.'
                  : 'Enter your new admin password.'}
              </p>
            </div>

            <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isFa ? 'رمز عبور جدید:' : 'New Password:'}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPasswordInput}
                    onChange={(e) => {
                      setNewPasswordInput(e.target.value);
                      setError('');
                    }}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rtl:left-3 rtl:right-auto ltr:right-3 ltr:left-auto text-slate-500 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isFa ? 'تکرار رمز عبور جدید:' : 'Confirm New Password:'}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPasswordInput}
                  onChange={(e) => {
                    setConfirmPasswordInput(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
                {error && (
                  <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{error}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isBusy}
                className={`w-full py-3.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg flex items-center justify-center gap-2 ${isBusy ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isBusy ? (isFa ? 'در حال ذخیره...' : 'Saving...') : (isFa ? 'ذخیره رمز جدید و ورود به پنل' : 'Save Password & Enter')}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
