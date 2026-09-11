/**
 * ═══════════════════════════════════════════════════════════════════
 * SkillsSection.jsx — ماتریس مهارت‌ها (تب گروه‌ها + نوار درصد تسلط)
 * ═══════════════════════════════════════════════════════════════════
 * چی توشه؟ هر گروه مهارت یه تب؛ داخل هر تب نوارهای درصد با برچسب سطح
 * (getProficiencyLabel). آیکون گروه‌ها از iconMap (اسم → کامپوننت lucide).
 * ⚠️ سال سابقه این‌جا ممنوعه (قانون ۲) — فقط درصد و دسته. آیکون جدید برای
 * گروه: اسمش رو هم در دیتا و هم در iconMap اضافه کن. صفر مهارت = عدم رندر.
 */
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { formatNum } from '../../utils/numberHelper';
import {
  Layers,
  Cpu,
  Binary,
  Network,
  Wrench,
  Activity,
  Zap,
  Code2
} from 'lucide-react';

export const SkillsSection = () => {
  const { data, currentTemplate } = useData();
  const [activeTab, setActiveTab] = useState(0);

  const isFa = data.siteConfig?.language === 'fa';
  const primaryColor = currentTemplate?.colors?.primary || '#00ffcc';
  const secondaryColor = currentTemplate?.colors?.secondary || '#10b981';
  const skills = data.skills || [];

  // Conditional Rendering: if 0 skills exist, do not render this section
  if (!skills || skills.length === 0) {
    return null;
  }

  const iconMap = {
    Cpu: Cpu,
    Binary: Binary,
    Network: Network,
    Wrench: Wrench,
    Layers: Layers,
    Activity: Activity,
    Zap: Zap,
    Code2: Code2
  };

  const safeTab = activeTab >= skills.length ? 0 : activeTab;
  const currentGroup = skills[safeTab] || skills[0] || null;

  const getProficiencyLabel = (level) => {
    if (level >= 95) return isFa ? 'تسلط جامع و ممتاز' : 'Mastery';
    if (level >= 90) return isFa ? 'فوق حرفه‌ای' : 'Expert';
    if (level >= 80) return isFa ? 'پیشرفته' : 'Advanced';
    return isFa ? 'متخصص' : 'Proficient';
  };

  return (
    <section id="skills" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border"
            style={{
              backgroundColor: `${primaryColor}15`,
              borderColor: `${primaryColor}30`,
              color: primaryColor,
            }}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isFa ? 'ماتریس مهارت‌ها و تسلط‌های فنی' : 'Technical Competencies & Skill Matrix'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {isFa ? 'مهارت‌های تخصصی، ابزارها و استانداردها' : 'Engineering Skills & Toolchain'}
          </h2>

          <p className="text-slate-400 text-sm sm:text-base">
            {isFa
              ? 'تسلط عمیق بر استانداردهای طراحی مدارات چاپی صنعتی، برنامه‌نویسی میکروکنترلرهای بلادرنگ، الکترونیک قدرت و آزمون‌های آزمایشگاهی.'
              : 'Proven mastery across multi-layer high-speed PCB layout, real-time embedded firmware, power electronics, and lab verification.'}
          </p>
        </div>

        {/* Skill Category Tabs */}
        {skills.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {skills.map((group, idx) => {
              const active = safeTab === idx;
              const Icon = iconMap[group.icon] || Cpu;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  title={isFa ? `مشاهده مهارت‌های دسته: ${group.categoryFa}` : `View skills in: ${group.categoryEn || group.categoryFa}`}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'text-slate-950 shadow-xl scale-105'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                  style={{
                    backgroundColor: active ? primaryColor : undefined,
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{isFa ? group.categoryFa : (group.categoryEn || group.categoryFa)}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                      active ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {formatNum(group.items?.length || 0, isFa)}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Active Category Skills Grid */}
        {currentGroup && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentGroup.items?.map((skill, i) => {
              const skillName = isFa ? (skill.nameFa || skill.name) : (skill.nameEn || skill.name || skill.nameFa);
              const badgeLabel = getProficiencyLabel(skill.level || 90);

              return (
                <div
                  key={i}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-slate-700 transition-all hover:bg-slate-900/90 group"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full ring-2 ring-slate-800 group-hover:scale-125 transition-transform"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {skillName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: `${primaryColor}10`,
                          borderColor: `${primaryColor}25`,
                          color: primaryColor,
                        }}
                      >
                        {badgeLabel}
                      </span>
                      <span className="text-xs font-mono font-bold" style={{ color: primaryColor }}>
                        {formatNum(skill.level, isFa)}%
                      </span>
                    </div>
                  </div>

                  {/* Glowing Progress Bar */}
                  <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/40">
                    <div
                      className="h-full rounded-full transition-all duration-1000 shadow-sm"
                      style={{
                        width: `${skill.level}%`,
                        background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
                        boxShadow: `0 0 8px ${primaryColor}60`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
