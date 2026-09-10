import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Save,
  Cpu,
  BookOpen,
  Activity,
  Sliders,
  Sparkles,
  Wrench
} from 'lucide-react';

const tabConfigs = [
  {
    id: 'boardCategories',
    labelFa: 'دسته‌بندی بردهای سخت‌افزاری',
    labelEn: 'Board Categories',
    icon: Cpu,
    descFa: 'تغییر نام هر دسته بلافاصله روی تمام بردهای سخت‌افزاری مرتبط در سایت اعمال می‌شود.',
    descEn: 'Renaming a category will automatically update all dependent hardware boards across the site.'
  },
  {
    id: 'articleCategories',
    labelFa: 'دسته‌بندی مقالات تخصصی',
    labelEn: 'Article Categories',
    icon: BookOpen,
    descFa: 'تغییر نام دسته مقاله روی تمام مقالات منتشر شده با این موضوع اعمال می‌گردد.',
    descEn: 'Renaming an article category will automatically update all published research papers.'
  },
  {
    id: 'boardStatuses',
    labelFa: 'وضعیت‌های تولید و استقرار بردها',
    labelEn: 'Board Production Statuses',
    icon: Activity,
    descFa: 'مانند «تولید انبوه صنعتی»، «پروتوتایپ آزمایشگاهی» و «متن‌باز».',
    descEn: 'Such as "Mass Production", "Lab Prototype", "Open Source".'
  },
  {
    id: 'edaTools',
    labelFa: 'نرم‌افزارهای طراحی مدارات EDA',
    labelEn: 'EDA Design Tools',
    icon: Wrench,
    descFa: 'مانند «آلتیوم دیزاینر»، «کی‌کد» و «کدنس الیگرو».',
    descEn: 'Such as "Altium Designer", "KiCad", "Cadence Allegro".'
  }
];

/* Inline taxonomy manager: tab navigation + add form + in-place rename list.
   Rendered directly inside the settings page (no modal). */
export const TaxonomyManager = ({ initialTab = 'boardCategories' }) => {
  const {
    data,
    updateTaxonomyOption,
    addTaxonomyOption,
    deleteTaxonomyOption,
    autoTranslateFaToEn,
    showToast,
    showConfirmDialog
  } = useData();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [editingOptionId, setEditingOptionId] = useState(null);
  const [editFa, setEditFa] = useState('');
  const [editEn, setEditEn] = useState('');

  const [newFa, setNewFa] = useState('');
  const [newEn, setNewEn] = useState('');

  const isFa = data.siteConfig?.language === 'fa';
  const taxonomies = data.taxonomies || {};
  const currentList = taxonomies[activeTab] || [];

  const currentTabConfig = tabConfigs.find((t) => t.id === activeTab) || tabConfigs[0];

  const startEditing = (opt) => {
    setEditingOptionId(opt.id);
    setEditFa(opt.labelFa);
    setEditEn(opt.labelEn || '');
  };

  const saveEditing = (oldOption) => {
    if (!editFa.trim()) {
      showToast('عنوان فارسی نمی‌تواند خالی باشد.', 'error');
      return;
    }
    const finalEn = editEn.trim() || autoTranslateFaToEn(editFa.trim());
    updateTaxonomyOption(activeTab, oldOption, {
      ...oldOption,
      labelFa: editFa.trim(),
      labelEn: finalEn,
    });
    setEditingOptionId(null);
  };

  const handleAddNew = (e) => {
    e.preventDefault();
    if (!newFa.trim()) {
      showToast('لطفاً عنوان فارسی گزینه را وارد فرمایید.', 'error');
      return;
    }
    const finalEn = newEn.trim() || autoTranslateFaToEn(newFa.trim());
    const slug = finalEn.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const id = slug ? `${slug}-${Date.now().toString().slice(-4)}` : `${activeTab.replace('Categories', '').replace('es', '')}-${Date.now()}`;

    addTaxonomyOption(activeTab, {
      id,
      labelFa: newFa.trim(),
      labelEn: finalEn,
    });

    setNewFa('');
    setNewEn('');
  };

  const handleDelete = (opt) => {
    showConfirmDialog({
      type: 'danger',
      title: 'حذف گزینه؟',
      message: `گزینه «${opt.labelFa}» حذف می‌شود. اگر در بردها استفاده شده باشد، آن‌ها دست‌نخورده می‌مانند ولی این گزینه از فهرست می‌رود.`,
      confirmText: 'بله، حذف کن',
      onConfirm: () => deleteTaxonomyOption(activeTab, opt.id),
    });
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-slate-950/60 border border-slate-800/80 overflow-x-auto">
        {tabConfigs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setEditingOptionId(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                active
                  ? 'bg-cyan-500 text-slate-950 shadow-lg scale-105'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{isFa ? tab.labelFa : tab.labelEn}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${active ? 'bg-slate-950 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                {(taxonomies[tab.id] || []).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Info Banner */}
      <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-800/50 text-xs text-cyan-200 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>{isFa ? currentTabConfig.labelFa : currentTabConfig.labelEn}:</strong> {isFa ? currentTabConfig.descFa : currentTabConfig.descEn}
        </div>
      </div>

      {/* Add New Option Box */}
      <form onSubmit={handleAddNew} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-white flex items-center gap-2">
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>افزودن گزینه جدید به این لیست:</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-slate-300 font-semibold mb-1">عنوان فارسی گزینه:</label>
            <input
              type="text"
              placeholder="مثال: سیستم‌های ناوبری هوشمند"
              value={newFa}
              onChange={(e) => {
                setNewFa(e.target.value);
                if (!newEn) setNewEn(autoTranslateFaToEn(e.target.value));
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-cyan-400 font-semibold mb-1">Option Title (English):</label>
            <input
              type="text"
              placeholder="e.g. Smart Navigation Systems"
              value={newEn}
              onChange={(e) => setNewEn(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ثبت و افزودن به لیست</span>
          </button>
        </div>
      </form>

      {/* Existing Options List with In-Place Renaming */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-300">
          گزینه‌های تعریف شده جاری ({currentList.length}):
        </h4>

        <div className="space-y-2.5">
          {currentList.map((opt) => {
            const isEditing = editingOptionId === opt.id;

            if (isEditing) {
              return (
                <div
                  key={opt.id}
                  className="p-4 rounded-2xl bg-slate-950 border-2 border-cyan-500 shadow-xl space-y-3 animate-fadeIn"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400">ویرایش و همگام‌سازی گزینه:</span>
                    <span className="text-[10px] font-mono text-slate-500">ID: {opt.id}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-300 font-semibold mb-1">عنوان فارسی جدید:</label>
                      <input
                        type="text"
                        value={editFa}
                        onChange={(e) => setEditFa(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-cyan-400 font-semibold mb-1">New English Title:</label>
                      <input
                        type="text"
                        value={editEn}
                        onChange={(e) => setEditEn(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <p className="text-[11px] text-amber-400 flex items-center gap-1">
                      <span>⚡ تغییر نام بلافاصله روی تمام پروژه‌ها اعمال خواهد شد.</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingOptionId(null)}
                        className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-slate-800"
                      >
                        انصراف
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEditing(opt)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 text-xs font-black shadow"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>ذخیره و اعمال سراسری</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={opt.id}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{opt.labelFa}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {opt.id}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-cyan-400">{opt.labelEn}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => startEditing(opt)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
                    title="ویرایش و تغییر نام سراسری"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(opt)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-rose-400 transition-colors"
                    title="حذف گزینه"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* Thin modal shell around the same manager — only used for quick-edit buttons
   inside board/article forms, where leaving the form would lose context. */
export const TaxonomyManagerModal = ({
  isOpen,
  onClose,
  initialTab = 'boardCategories'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 animate-fadeIn">
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 shadow-2xl rounded-3xl flex flex-col overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>مدیریت گزینه‌ها و دسته‌بندی‌های سراسری</span>
                <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 text-[10px] font-mono border border-cyan-800">
                  همگام‌سازی خودکار
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ویرایش نام هر گزینه، بلافاصله در تمام آیتم‌های وابسته به آن در سایت اعمال می‌گردد.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <TaxonomyManager key={initialTab} initialTab={initialTab} />
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            تغییرات ذخیره شده بی‌درنگ در تمامی فیلترها و کارت‌های سایت فعال می‌شوند.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
