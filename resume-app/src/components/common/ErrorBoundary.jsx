/**
 * ============================================================================
 * ERROR BOUNDARY WITH AUTOMATIC RECOVERY & CACHE RESET
 * ============================================================================
 * Prevents white screen of death by catching rendering exceptions and offering
 * 1-click automatic state repair.
 */
/**
 * ── راهنمای فارسی ──
 * این فایل «تور نجات» سایته: اگه هرجای React خطای رندر بده (صفحه سفید)،
 * این صفحه خطای فارسی با دو دکمه نشون می‌ده: «بارگذاری مجدد» و «پاکسازی
 * کش و بازنشانی کامل» (حافظه مرورگر رو پاک می‌کنه). دور DataProvider در
 * App.jsx پیچیده شده پس همه‌چیز رو پوشش می‌ده.
 */


import React from 'react';
import { AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleResetStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans dir-rtl text-right">
          <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border border-rose-500/30 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-lg">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">سامانه با خطای بارگذاری مواجه شد</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                ممکن است حافظه موقت مرورگر با نسخه‌های پیشین تداخل پیدا کرده باشد. با کلیک روی دکمه‌های زیر سامانه به صورت خودکار بازیابی می‌شود.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-left font-mono text-xs text-rose-300 max-h-32 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>بارگذاری مجدد صفحه</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetStorage}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                <span>پاکسازی کش و بازنشانی کامل</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
