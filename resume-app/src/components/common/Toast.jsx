import React from 'react';
import { useData } from '../../context/DataContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast = () => {
  const { toast } = useData();

  if (!toast) return null;

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  };

  const colors = {
    success: 'bg-slate-900/95 border-emerald-500/50 text-emerald-300 shadow-emerald-500/20',
    error: 'bg-slate-900/95 border-rose-500/50 text-rose-300 shadow-rose-500/20',
    info: 'bg-slate-900/95 border-cyan-500/50 text-cyan-300 shadow-cyan-500/20',
  };

  const Icon = icons[toast.type] || CheckCircle2;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl text-xs font-medium max-w-md ${
          colors[toast.type] || colors.success
        }`}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="leading-relaxed text-slate-100">{toast.message}</span>
      </div>
    </div>
  );
};
