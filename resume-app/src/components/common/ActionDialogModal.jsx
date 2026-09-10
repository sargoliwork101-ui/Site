/**
 * ============================================================================
 * GLOBAL ACTION & CONFIRMATION DIALOG MODAL COMPONENT
 * ============================================================================
 * 
 * Replaces primitive browser alerts/confirms with modern, themed Persian modals:
 * - Types: 'danger' | 'warning' | 'error' | 'success' | 'info' | 'confirm'
 * - Clear Persian explanatory text and contextual action buttons
 * - Keyboard Escape listener & Backdrop click dismiss
 * - Integrated globally via DataContext (showConfirmDialog & showAlertDialog)
 *
 * @module ActionDialogModal
 */

import React, { useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Trash2,
  ShieldAlert,
  X,
  Sparkles
} from 'lucide-react';

export const ActionDialogModal = ({
  isOpen,
  type = 'confirm', // 'danger' | 'warning' | 'error' | 'success' | 'info' | 'confirm'
  title = '',
  message = '',
  confirmText = '',
  cancelText = '',
  onConfirm,
  onCancel,
  isFa = true,
  primaryColor = '#00ffcc'
}) => {
  // ESC listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (onCancel) onCancel();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  // Icon & Colors configuration based on Dialog Type
  const getConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: Trash2,
          iconBg: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
          titleColor: 'text-rose-400',
          confirmBtnClass: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30',
          defaultTitle: isFa ? 'تایید حذف و عملیات حساس' : 'Confirm Destructive Action',
          defaultConfirm: isFa ? 'بله، حذف کن' : 'Yes, Delete',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          titleColor: 'text-amber-300',
          confirmBtnClass: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/30',
          defaultTitle: isFa ? 'هشدار سیستمی مهم' : 'Important System Warning',
          defaultConfirm: isFa ? 'متوجه شدم و تایید می‌کنم' : 'I Understand',
        };
      case 'error':
        return {
          icon: XCircle,
          iconBg: 'bg-red-500/20 text-red-400 border-red-500/40',
          titleColor: 'text-red-400',
          confirmBtnClass: 'bg-red-600 hover:bg-red-500 text-white',
          defaultTitle: isFa ? 'خطا در انجام عملیات' : 'Operation Error',
          defaultConfirm: isFa ? 'بستن پنجره' : 'Dismiss',
        };
      case 'success':
        return {
          icon: CheckCircle2,
          iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          titleColor: 'text-emerald-300',
          confirmBtnClass: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/30',
          defaultTitle: isFa ? 'عملیات با موفقیت انجام شد' : 'Operation Successful',
          defaultConfirm: isFa ? 'بسیار عالی' : 'Great',
        };
      case 'info':
      default:
        return {
          icon: Info,
          iconBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          titleColor: 'text-cyan-300',
          confirmBtnClass: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-500/30',
          defaultTitle: isFa ? 'پیام و تاییدیه سیستمی' : 'System Notice',
          defaultConfirm: isFa ? 'تایید و ادامه' : 'Confirm & Proceed',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;
  const isAlertOnly = type === 'error' || type === 'success' || type === 'info' && !onCancel;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      onClick={() => {
        if (onCancel) onCancel();
      }}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 255, 204, 0.1)',
        }}
      >
        {/* Header with Icon and Title */}
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${config.iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className={`text-base sm:text-lg font-black tracking-tight ${config.titleColor}`}>
              {title || config.defaultTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1.5 whitespace-pre-line">
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onCancel) onCancel();
            }}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shrink-0"
            title={isFa ? 'بستن پنجره' : 'Close modal'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
          {!isAlertOnly && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
              title={isFa ? 'انصراف و لغو این عملیات' : 'Cancel this action'}
            >
              {cancelText || (isFa ? 'انصراف' : 'Cancel')}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (onConfirm) onConfirm();
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 ${config.confirmBtnClass}`}
            title={isFa ? 'تایید و اجرای این عملیات' : 'Confirm and execute'}
          >
            {confirmText || config.defaultConfirm}
          </button>
        </div>
      </div>
    </div>
  );
};
