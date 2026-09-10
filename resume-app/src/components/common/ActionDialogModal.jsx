/**
 * ============================================================================
 * GLOBAL ACTION & CONFIRMATION DIALOG MODAL COMPONENT (light theme)
 * ============================================================================
 * - Types: 'danger' | 'warning' | 'error' | 'success' | 'info' | 'confirm'
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
  X
} from 'lucide-react';

export const ActionDialogModal = ({
  isOpen,
  type = 'confirm',
  title = '',
  message = '',
  confirmText = '',
  cancelText = '',
  onConfirm,
  onCancel,
  isFa = true
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

  // Icon & Colors configuration based on Dialog Type (light palette)
  const getConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: Trash2,
          iconBg: 'background:#fdecec;color:#b91c1c;border:1px solid rgba(185,28,28,.3)',
          titleColor: 'color:#b91c1c',
          confirmBtnClass: 'btn-danger',
          defaultTitle: isFa ? 'تایید حذف و عملیات حساس' : 'Confirm Destructive Action',
          defaultConfirm: isFa ? 'بله، حذف کن' : 'Yes, Delete',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconBg: 'background:#fef3e2;color:#b45309;border:1px solid rgba(180,83,9,.3)',
          titleColor: 'color:#b45309',
          confirmBtnClass: 'btn-primary',
          defaultTitle: isFa ? 'هشدار سیستمی مهم' : 'Important System Warning',
          defaultConfirm: isFa ? 'متوجه شدم و تایید می‌کنم' : 'I Understand',
        };
      case 'error':
        return {
          icon: XCircle,
          iconBg: 'background:#fdecec;color:#b91c1c;border:1px solid rgba(185,28,28,.3)',
          titleColor: 'color:#b91c1c',
          confirmBtnClass: 'btn-danger',
          defaultTitle: isFa ? 'خطا در انجام عملیات' : 'Operation Error',
          defaultConfirm: isFa ? 'بستن پنجره' : 'Dismiss',
        };
      case 'success':
        return {
          icon: CheckCircle2,
          iconBg: 'background:#e9f9ef;color:#15803d;border:1px solid rgba(21,128,61,.3)',
          titleColor: 'color:#15803d',
          confirmBtnClass: 'btn-primary',
          defaultTitle: isFa ? 'عملیات با موفقیت انجام شد' : 'Operation Successful',
          defaultConfirm: isFa ? 'بسیار عالی' : 'Great',
        };
      case 'info':
      default:
        return {
          icon: Info,
          iconBg: 'background:#eef0ff;color:#4f46e5;border:1px solid rgba(79,70,229,.25)',
          titleColor: 'color:#4f46e5',
          confirmBtnClass: 'btn-primary',
          defaultTitle: isFa ? 'پیام و تاییدیه سیستمی' : 'System Notice',
          defaultConfirm: isFa ? 'تایید و ادامه' : 'Confirm & Proceed',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;
  const isAlertOnly = type === 'error' || type === 'success' || (type === 'info' && !onCancel);

  return (
    <div
      className="lm-backdrop animate-fadeIn"
      style={{ zIndex: 100 }}
      onClick={() => {
        if (onCancel) onCancel();
      }}
    >
      <div
        className="lm-card"
        style={{ maxWidth: '520px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-7 space-y-5" style={{ background: 'var(--surface)' }}>
          {/* Header with Icon and Title */}
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={config.iconBg}
            >
              <Icon className="w-6 h-6" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className={`text-base sm:text-lg font-black tracking-tight ${config.titleColor}`}>
                {title || config.defaultTitle}
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed mt-1.5 whitespace-pre-line" style={{ color: 'var(--muted)' }}>
                {message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onCancel) onCancel();
              }}
              className="lm-close shrink-0"
              style={{ width: 30, height: 30 }}
              title={isFa ? 'بستن پنجره' : 'Close modal'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center justify-end gap-3 pt-3" style={{ borderTop: '1px solid var(--line)' }}>
            {!isAlertOnly && onCancel && (
              <button type="button" onClick={onCancel} className="btn btn-ghost" title={isFa ? 'انصراف و لغو این عملیات' : 'Cancel this action'}>
                {cancelText || (isFa ? 'انصراف' : 'Cancel')}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (onConfirm) onConfirm();
              }}
              className={`btn ${config.confirmBtnClass}`}
              title={isFa ? 'تایید و اجرای این عملیات' : 'Confirm and execute'}
            >
              {confirmText || config.defaultConfirm}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
