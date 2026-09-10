import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../../data/templates';
import {
  X,
  Palette,
  Check,
  Search,
  Type
} from 'lucide-react';

export const TemplatePickerModal = () => {
  const {
    isTemplatePickerOpen,
    setIsTemplatePickerOpen,
    currentTemplate,
    setTemplate,
    data,
    updateSiteConfig,
  } = useData();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isTemplatePickerOpen) return null;

  const currentId = data?.siteConfig?.activeTemplateId || data?.siteConfig?.currentTemplateId || 'pcb-blueprint-dark';

  const filteredTemplates = (TEMPLATES || []).filter((tpl) => {
    const matchesCategory = activeCategory === 'all' || tpl.category === activeCategory;
    const matchesSearch =
      tpl.nameFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tpl.tags && tpl.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const fonts = [
    { id: 'Vazirmatn', label: 'وزیرمتن (استاندارد وب فارسی)' },
    { id: 'Shabnam', label: 'شبنم (خوانا و مهندسی)' },
    { id: 'Sahel', label: 'ساحل (کلاسیک و دانشگاهی)' },
    { id: 'Estedad', label: 'استعداد (مدرن و بولد)' },
    { id: 'Fira Code', label: 'Fira Code (تک‌فاصله مونو مهندسی)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-lg animate-fadeIn">
      <div
        className="relative w-full max-w-6xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-mono font-bold text-slate-950 shadow-lg"
              style={{ backgroundColor: currentTemplate.colors.primary || '#00ffcc' }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  انتخابگر ۵۰ مدل صفحه اصلی سایت
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  50 مدل طراحی
                </span>
              </div>
              <p className="text-xs text-slate-400">
                هر قالبی را انتخاب کنید، رنگ‌ها، چیدمان هیرو، استایل بردها و فونت سایت به صورت آنی تغییر می‌کند.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {/* Active Template Badge */}
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 block">قالب در حال استفاده:</span>
              <span className="text-xs font-bold text-cyan-400">{currentTemplate.nameFa}</span>
            </div>

            <button
              onClick={() => setIsTemplatePickerOpen(false)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Customization Toolbar */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Font Selector */}
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">فونت فارسی:</span>
            <select
              value={data.siteConfig.fontFamily}
              onChange={(e) => updateSiteConfig({ fontFamily: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
            >
              {fonts.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Background Animation Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
            <input
              type="checkbox"
              checked={data.siteConfig.showCircuitAnimation !== false}
              onChange={(e) => updateSiteConfig({ showCircuitAnimation: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>جلوه ذرات و خطوط مدار متحرک</span>
          </label>
        </div>

        {/* Categories Bar & Search Input */}
        <div className="px-6 py-3.5 bg-slate-900/60 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {TEMPLATE_CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
                  }`}
                >
                  <span>{cat.labelFa}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      active ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در بین ۵۰ قالب..."
              className="w-full pl-3 pr-9 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Template Grid Gallery (50 Models) */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((tpl) => {
            const isSelected = currentId === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => setTemplate(tpl.id)}
                className={`group relative rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'ring-2 ring-cyan-400 bg-slate-800/95 shadow-2xl scale-[1.02]'
                    : 'bg-slate-950/70 hover:bg-slate-850 border-slate-800/90 hover:border-slate-600 hover:-translate-y-1'
                }`}
                style={{
                  borderColor: isSelected ? tpl.colors.primary : undefined,
                }}
              >
                {/* Header of Card */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    {/* Badge */}
                    <span
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm"
                      style={{
                        backgroundColor: `${tpl.colors.primary}20`,
                        color: tpl.colors.primary,
                        borderColor: `${tpl.colors.primary}40`,
                      }}
                    >
                      {tpl.badge}
                    </span>

                    {/* Color Swatch Dots */}
                    <div className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-1 rounded-lg border border-slate-800">
                      <span
                        className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: tpl.colors.primary }}
                        title="Primary Color"
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: tpl.colors.secondary }}
                        title="Secondary Color"
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: tpl.colors.bg }}
                        title="Background"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                      {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                      <span>{tpl.nameFa}</span>
                    </h4>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">{tpl.nameEn}</p>
                  </div>

                  {/* Mini Visual Simulation Box */}
                  <div
                    className="h-24 rounded-xl p-3 border flex flex-col justify-between overflow-hidden relative"
                    style={{
                      backgroundColor: tpl.colors.bg,
                      borderColor: tpl.colors.border,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: tpl.colors.primary }}
                        />
                        <div
                          className="h-2 w-12 rounded"
                          style={{ backgroundColor: `${tpl.colors.primary}40` }}
                        />
                      </div>
                      <span
                        className="text-[9px] font-mono px-1.5 py-0.2 rounded"
                        style={{
                          backgroundColor: `${tpl.colors.primary}25`,
                          color: tpl.colors.primary,
                        }}
                      >
                        {tpl.heroLayout}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <div
                        className="h-7 rounded-lg border"
                        style={{
                          backgroundColor: tpl.colors.cardBg,
                          borderColor: tpl.colors.border,
                        }}
                      />
                      <div
                        className="h-7 rounded-lg border"
                        style={{
                          backgroundColor: tpl.colors.cardBg,
                          borderColor: tpl.colors.border,
                        }}
                      />
                      <div
                        className="h-7 rounded-lg border"
                        style={{
                          backgroundColor: tpl.colors.cardBg,
                          borderColor: tpl.colors.border,
                        }}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {tpl.description}
                  </p>
                </div>

                {/* Footer of Card */}
                <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {tpl.tags?.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTemplate(tpl.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {isSelected ? '✓ فعال شده' : 'اعمال این مدل'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Bottom Close Bar */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            نمایش <span className="text-cyan-400 font-bold">{filteredTemplates.length}</span> مدل از مجموع ۵۰ قالب طراحی شده
          </div>
          <button
            onClick={() => setIsTemplatePickerOpen(false)}
            className="px-6 py-2 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
