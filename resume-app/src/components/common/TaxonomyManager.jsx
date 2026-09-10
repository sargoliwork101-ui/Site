import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  Cpu,
  BookOpen,
  Activity,
  Wrench
} from 'lucide-react';

const listConfigs = [
  {
    id: 'boardCategories',
    labelFa: 'دسته‌های بردهای سخت‌افزاری',
    icon: Cpu,
    iconColor: 'text-cyan-400',
    enColor: 'text-cyan-300',
    ringColor: 'ring-cyan-500/70',
    descFa: 'تغییر نام هر دسته بلافاصله روی تمام بردهای مرتبط اعمال می‌شود.',
  },
  {
    id: 'articleCategories',
    labelFa: 'دسته‌های مقالات تخصصی',
    icon: BookOpen,
    iconColor: 'text-emerald-400',
    enColor: 'text-emerald-300',
    ringColor: 'ring-emerald-500/70',
    descFa: 'تغییر نام دسته مقاله روی تمام مقالات منتشرشده با این موضوع اعمال می‌گردد.',
  },
  {
    id: 'boardStatuses',
    labelFa: 'وضعیت‌های تولید و استقرار بردها',
    icon: Activity,
    iconColor: 'text-amber-400',
    enColor: 'text-amber-300',
    ringColor: 'ring-amber-500/70',
    descFa: 'مانند «تولید انبوه صنعتی»، «پروتوتایپ آزمایشگاهی» و «متن‌باز».',
  },
  {
    id: 'edaTools',
    labelFa: 'نرم‌افزارهای طراحی مدارات EDA',
    icon: Wrench,
    iconColor: 'text-purple-400',
    enColor: 'text-purple-300',
    ringColor: 'ring-purple-500/70',
    descFa: 'مانند «آلتیوم دیزاینر»، «کی‌کد» و «کدنس الیگرو».',
  }
];

/* Card-based taxonomy manager rendered inline in the settings page.
   Each list is a card with in-place add / rename / delete.
   `focusId` (optional) scrolls to one card and highlights it — used when
   jumping here from quick links inside board/article forms. */
export const TaxonomyManager = ({ focusId = null }) => {
  const {
    data,
    updateTaxonomyOption,
    addTaxonomyOption,
    deleteTaxonomyOption,
    autoTranslateFaToEn,
    showToast,
    showConfirmDialog
  } = useData();

  const [editingKey, setEditingKey] = useState(null); // `${listId}:${optId}`
  const [editFa, setEditFa] = useState('');
  const [editEn, setEditEn] = useState('');
  const [drafts, setDrafts] = useState({}); // { [listId]: { fa, en } }

  useEffect(() => {
    if (!focusId) return;
    const el = document.getElementById(`tax-card-${focusId}`);
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusId]);

  const taxonomies = data.taxonomies || {};

  const startEditing = (listId, opt) => {
    setEditingKey(`${listId}:${opt.id}`);
    setEditFa(opt.labelFa);
    setEditEn(opt.labelEn || '');
  };

  const saveEditing = (listId, oldOption) => {
    if (!editFa.trim()) {
      showToast('عنوان فارسی نمی‌تواند خالی باشد.', 'error');
      return;
    }
    const finalEn = editEn.trim() || autoTranslateFaToEn(editFa.trim());
    updateTaxonomyOption(listId, oldOption, {
      ...oldOption,
      labelFa: editFa.trim(),
      labelEn: finalEn,
    });
    setEditingKey(null);
  };

  const handleAddNew = (e, listId) => {
    e.preventDefault();
    const draft = drafts[listId] || {};
    if (!(draft.fa || '').trim()) {
      showToast('لطفاً عنوان فارسی گزینه را وارد فرمایید.', 'error');
      return;
    }
    const finalEn = (draft.en || '').trim() || autoTranslateFaToEn(draft.fa.trim());
    const slug = finalEn.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const id = slug ? `${slug}-${Date.now().toString().slice(-4)}` : `${listId.replace('Categories', '').replace('es', '')}-${Date.now()}`;

    addTaxonomyOption(listId, {
      id,
      labelFa: draft.fa.trim(),
      labelEn: finalEn,
    });

    setDrafts((prev) => ({ ...prev, [listId]: { fa: '', en: '' } }));
  };

  const handleDelete = (listId, opt) => {
    showConfirmDialog({
      type: 'danger',
      title: 'حذف گزینه؟',
      message: `گزینه «${opt.labelFa}» حذف می‌شود. اگر در بردها استفاده شده باشد، آن‌ها دست‌نخورده می‌مانند ولی این گزینه از فهرست می‌رود.`,
      confirmText: 'بله، حذف کن',
      onConfirm: () => deleteTaxonomyOption(listId, opt.id),
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
      {listConfigs.map((cfg) => {
        const Icon = cfg.icon;
        const list = taxonomies[cfg.id] || [];
        const draft = drafts[cfg.id] || { fa: '', en: '' };
        const focused = focusId === cfg.id;

        return (
          <div
            key={cfg.id}
            id={`tax-card-${cfg.id}`}
            className={`p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 scroll-mt-4 transition-shadow ${
              focused ? `ring-2 ${cfg.ringColor} shadow-xl` : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-bold text-white flex items-center gap-2">
                <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                <span>{cfg.labelFa}</span>
              </h5>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {list.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">{cfg.descFa}</p>

            {/* Options list */}
            <div className="space-y-1.5">
              {list.map((opt) => {
                const isEditing = editingKey === `${cfg.id}:${opt.id}`;

                if (isEditing) {
                  return (
                    <div key={opt.id} className="p-3 rounded-xl bg-slate-950 border-2 border-cyan-500 space-y-2 animate-fadeIn">
                      <input
                        type="text"
                        value={editFa}
                        onChange={(e) => setEditFa(e.target.value)}
                        placeholder="عنوان فارسی"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="text"
                        value={editEn}
                        onChange={(e) => setEditEn(e.target.value)}
                        placeholder="English title"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingKey(null)}
                          className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-slate-800"
                        >
                          انصراف
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEditing(cfg.id, opt)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>ذخیره</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={opt.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-white truncate">{opt.labelFa}</span>
                      <span className={`font-mono text-[11px] truncate ${cfg.enColor}`}>{opt.labelEn}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEditing(cfg.id, opt)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
                        title="ویرایش و تغییر نام سراسری"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cfg.id, opt)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 transition-colors"
                        title="حذف گزینه"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add new option */}
            <form onSubmit={(e) => handleAddNew(e, cfg.id)} className="pt-2 border-t border-slate-800 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={draft.fa}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDrafts((prev) => ({
                      ...prev,
                      [cfg.id]: { fa: v, en: (prev[cfg.id]?.en || '') || autoTranslateFaToEn(v) },
                    }));
                  }}
                  placeholder="گزینه فارسی جدید…"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  value={draft.en}
                  onChange={(e) =>
                    setDrafts((prev) => ({ ...prev, [cfg.id]: { fa: prev[cfg.id]?.fa || '', en: e.target.value } }))
                  }
                  placeholder="New option…"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-700 hover:border-cyan-500/60 text-slate-400 hover:text-cyan-300 text-xs font-bold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن به این لیست</span>
              </button>
            </form>
          </div>
        );
      })}
    </div>
  );
};
