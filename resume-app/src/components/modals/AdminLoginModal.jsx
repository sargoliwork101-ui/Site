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
    adminSecurity,
    data
  } = useData();

  // Modal Views: 'login' | 'forgot_email' | 'forgot_otp' | 'forgot_new_pass'
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

  const isFa = data?.siteConfig?.language === 'fa';

  // Reset state on modal open/close
  useEffect(() => {
    if (isLoginModalOpen) {
      setView('login');
      setUsernameInput('');
      setPassword('');
      setError('');
      setFallbackOtp('');
      setOtpNotice('');
      setIsSendingOtp(false);
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

  // --- 1. Multi-User Login Handler ---
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (cooldownSeconds > 0) return;

    if (!usernameInput.trim()) {
      setError(isFa ? 'لطفاً نام کاربری را وارد فرمایید.' : 'Please enter your username.');
      return;
    }

    if (!password) {
      setError(isFa ? 'لطفاً رمز عبور را وارد فرمایید.' : 'Please enter your password.');
      return;
    }

    const result = loginUser(usernameInput, password);
    if (!result.success) {
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
  };

  // --- 2. Forgot Password: Request OTP ---
  const handleForgotEmailSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(emailInput)) {
      setError(isFa ? 'لطفاً یک آدرس ایمیل معتبر وارد فرمایید.' : 'Please enter a valid email address.');
      return;
    }

    const res = requestPasswordResetOtp(emailInput);
    if (res.success) {
      setError('');
      setResendTimer(60);
      setView('forgot_otp');
    } else {
      setError(isFa ? 'این ایمیل با ایمیل بازیابی ثبت‌شده در سیستم مطابقت ندارد.' : 'Email does not match registered admin email.');
    }
  };

  // --- 3. Forgot Password: Verify OTP ---
  const handleForgotOtpSubmit = (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length !== 6) {
      setError(isFa ? 'کد تایید باید ۶ رقمی باشد.' : 'OTP code must be 6 digits.');
      return;
    }

    const valid = verifyPasswordResetOtp(otpInput);
    if (valid) {
      setError('');
      setView('forgot_new_pass');
    } else {
      setError(isFa ? 'کد تایید وارد شده نادرست یا منقضی شده است.' : 'Invalid or expired verification code.');
    }
  };

  // --- 4. Forgot Password: Save New Password ---
  const handleNewPasswordSubmit = (e) => {
    e.preventDefault();
    if (newPasswordInput.length < 3) {
      setError(isFa ? 'رمز عبور جدید باید حداقل ۳ کاراکتر باشد.' : 'Password must be at least 3 characters.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setError(isFa ? 'تکرار رمز عبور با رمز جدید مطابقت ندارد.' : 'Passwords do not match.');
      return;
    }

    const success = resetPasswordWithOtp(otpInput, newPasswordInput);
    if (!success) {
      setError(isFa ? 'خطا در ثبت رمز عبور جدید.' : 'Failed to reset password.');
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
                disabled={cooldownSeconds > 0}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isFa ? 'احراز هویت و ورود به پنل' : 'Authenticate & Enter'}</span>
              </button>
            </form>
          </>
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
                  disabled={isSendingOtp}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-lg flex items-center gap-1.5 ${isSendingOtp ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
                >
                  <span>{isSendingOtp ? (isFa ? 'در حال ارسال...' : 'Sending...') : (isFa ? 'دریافت کد تایید' : 'Send Reset Code')}</span>
                  {isFa ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </form>
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

              {/* Fallback: shown ONLY when real email delivery failed */}
              {fallbackOtp && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-center space-y-1.5 animate-fadeIn">
                  <p className="text-[11px] text-amber-300 leading-relaxed">
                    {isFa
                      ? 'ارسال ایمیل ناموفق بود؛ کد تایید شما (۵ دقیقه اعتبار دارد):'
                      : 'Email delivery failed; your verification code (valid 5 min):'}
                  </p>
                  <p className="font-mono text-2xl font-black tracking-[0.35em] text-amber-200 select-all" dir="ltr">
                    {fallbackOtp}
                  </p>
                </div>
              )}

              {otpNotice === 'activation' && (
                <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-[11px] text-sky-300 leading-relaxed">
                  {isFa
                    ? '💡 اولین ارسال به این ایمیل نیاز به فعال‌سازی دارد: ایمیل «Activate your form» را در اینباکس یا پوشه اسپم تایید کنید، سپس «ارسال مجدد کد» را بزنید.'
                    : '💡 First-time delivery needs activation: confirm the "Activate your form" email in your inbox/spam, then press Resend.'}
                </div>
              )}

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
                    disabled={isSendingOtp}
                    className={`font-semibold ${isSendingOtp ? 'text-slate-500 cursor-wait' : 'text-cyan-400 hover:text-cyan-300 cursor-pointer'}`}
                  >
                    {isSendingOtp ? (isFa ? 'در حال ارسال...' : 'Sending...') : (isFa ? 'ارسال مجدد کد' : 'Resend Code')}
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isFa ? 'تایید کد و تغییر رمز' : 'Verify & Continue'}</span>
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
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isFa ? 'ذخیره رمز جدید و ورود به پنل' : 'Save Password & Enter'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
