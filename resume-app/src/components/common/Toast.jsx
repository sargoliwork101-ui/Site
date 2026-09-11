/**
 * ═══════════════════════════════════════════════════════════════════
 * Toast.jsx — نمایش‌دهنده پیام‌های شناور (موفقیت/خطا/هشدار/اطلاع)
 * ═══════════════════════════════════════════════════════════════════
 * این فایل چیه؟ فقط «نمایش» پیام‌هاست؛ منطق صف و تایمر داخل DataContext
 *   (showToast) زندگی می‌کنه. هرجا showToast صدا زده بشه، این‌جا نمایش می‌ده.
 * کِی بازش کن؟ تغییر ظاهر/جایگاه/آیکون پیام‌ها. برای اضافه کردن پیام جدید
 *   به هیچ‌وجه این فایل رو دست نزن — از showToast استفاده کن.
 * ⚠️ با کلیک روی پیام بسته می‌شه (dismissToast) — این رفتار رو نگه دار.
 */
import React from 'react';
import { useData } from '../../context/DataContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const Toast = () => {
  const { toasts, dismissToast } = useData();

  if (!toasts || toasts.length === 0) return null;

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'bg-slate-900/95 border-emerald-500/50 text-emerald-300 shadow-emerald-500/20',
    error: 'bg-slate-900/95 border-rose-500/50 text-rose-300 shadow-rose-500/20',
    warning: 'bg-slate-900/95 border-amber-500/50 text-amber-300 shadow-amber-500/20',
    info: 'bg-slate-900/95 border-cyan-500/50 text-cyan-300 shadow-cyan-500/20',
  };

  return (
    <div className="fixed inset-0 z-[10020] flex flex-col gap-2 items-center justify-center pointer-events-none px-4">
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || CheckCircle2;
        return (
          <div key={toast.id} className="animate-bounce-short pointer-events-auto">
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl text-xs font-medium max-w-[calc(100vw-2rem)] sm:max-w-md cursor-pointer ${
                colors[toast.type] || colors.success
              }`}
              onClick={() => dismissToast && dismissToast(toast.id)}
              title="کلیک برای بستن"
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="leading-relaxed text-slate-100">{toast.message}</span>
              <X className="w-3.5 h-3.5 shrink-0 opacity-50" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
