import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { formatNum, toEnglishDigits, toPersianDigits } from '../../utils/numberHelper';
import {
  Briefcase,
  GraduationCap,
  Award,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  Cpu,
  BadgeCheck,
  Layers,
  ArrowRight,
  User,
  Building2,
  ExternalLink
} from 'lucide-react';

export const ExperienceSection = () => {
  const { data, currentTemplate, setSelectedBoard } = useData();

  const isFa = data?.siteConfig?.language === 'fa';
  const primaryColor = currentTemplate?.colors?.primary || '#00ffcc';

  const { experiences = [], education = [], certifications = [], boards = [] } = data || {};

  const [activeTab, setActiveTab] = useState('experience');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'tenure'

  // Chronological Sorting for experiences
  const sortedExperiences = useMemo(() => {
    const list = [...experiences];
    if (sortBy === 'newest') {
      return list.sort((a, b) => (b.sortDate || '2020').localeCompare(a.sortDate || '2020'));
    }
    if (sortBy === 'oldest') {
      return list.sort((a, b) => (a.sortDate || '2020').localeCompare(b.sortDate || '2020'));
    }
    if (sortBy === 'tenure') {
      return list.sort((a, b) => (b.durationFa || '').length - (a.durationFa || '').length);
    }
    return list;
  }, [experiences, sortBy]);

  // Conditional Rendering: if 0 experiences, education, and certs exist, hide section
  if (experiences.length === 0 && education.length === 0 && certifications.length === 0) {
    return null;
  }

  return (
    <section id="experience" className="py-20 relative bg-slate-950/40 border-y border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border"
            style={{
              backgroundColor: `${primaryColor}15`,
              borderColor: `${primaryColor}30`,
              color: primaryColor,
            }}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{isFa ? 'سوابق حرفه‌ای و ساختار سابقه شغلی' : 'Career History & Academic Track'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {isFa ? 'مسیر حرفه‌ای و سوابق شغلی مهندسی' : 'Professional Work Experience & Tree'}
          </h2>

          <p className="text-slate-400 text-sm sm:text-base">
            {isFa
              ? 'بیش از ۸ سال سابقه رهبری تیم‌های تحقیق و توسعه R&D، طراحی و تجاری‌سازی بردهای الکترونیکی پیشرفته و سیستم‌های هوشمند امبدد.'
              : 'Over 8 years of hardware R&D leadership, production deployments of complex PCBs, and embedded systems architecture.'}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {experiences.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('experience')}
              title={isFa ? 'مشاهده درخت سوابق شغلی و شرکت‌های همکار' : 'View LinkedIn career timeline tree'}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'experience'
                  ? 'text-slate-950 shadow-xl scale-105 font-black'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
              style={{ backgroundColor: activeTab === 'experience' ? primaryColor : undefined }}
            >
              <Briefcase className="w-4 h-4" />
              <span>{isFa ? 'درخت سوابق شغلی (LinkedIn Tree)' : 'Work Experience (Tree)'}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === 'experience' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {formatNum(experiences.length, isFa)}
              </span>
            </button>
          )}

          {education.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('education')}
              title={isFa ? 'مشاهده سوابق تحصیلی، دانشگاه‌ها و پایان‌نامه‌ها' : 'View academic background & university degrees'}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'education'
                  ? 'text-slate-950 shadow-xl scale-105 font-black'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
              style={{ backgroundColor: activeTab === 'education' ? primaryColor : undefined }}
            >
              <GraduationCap className="w-4 h-4" />
              <span>{isFa ? 'مدارک و سوابق تحصیلی' : 'Education & Academic Degrees'}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === 'education' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {formatNum(education.length, isFa)}
              </span>
            </button>
          )}

          {certifications.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('certifications')}
              title={isFa ? 'مشاهده مدارک دوره‌ها و گواهینامه‌های معتبر بین‌المللی' : 'View certifications & credentials'}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'certifications'
                  ? 'text-slate-950 shadow-xl scale-105 font-black'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
              style={{ backgroundColor: activeTab === 'certifications' ? primaryColor : undefined }}
            >
              <Award className="w-4 h-4" />
              <span>{isFa ? 'گواهینامه‌های بین‌المللی' : 'Certifications & Credentials'}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === 'certifications' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {formatNum(certifications.length, isFa)}
              </span>
            </button>
          )}
        </div>

        {/* --- 1. WORK EXPERIENCE (LINKEDIN CAREER TREE DESIGN) --- */}
        {activeTab === 'experience' && (
          <div className="space-y-8">
            {/* Tree Controls Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">{isFa ? 'مرتب‌سازی بر اساس:' : 'Sort by:'}</span>
                <button
                  type="button"
                  onClick={() => setSortBy('newest')}
                  title={isFa ? 'نمایش از جدیدترین به قدیمی‌ترین' : 'Sort from most recent to oldest'}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    sortBy === 'newest' ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isFa ? 'جدیدترین موقعیت' : 'Most Recent'}
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('oldest')}
                  title={isFa ? 'نمایش به ترتیب زمانی از گذشته تا کنون' : 'Sort chronologically'}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    sortBy === 'oldest' ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isFa ? 'قدیمی‌ترین' : 'Chronological'}
                </button>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <BadgeCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-[11px]">
                  {isFa ? '۸+ سال سابقه تخصصی مستند' : '8+ Years Verified Experience'}
                </span>
              </div>
            </div>

            {/* LinkedIn-Style Career Tree Timeline */}
            <div className="relative border-r-2 md:border-r-2 border-slate-800 mr-4 md:mr-6 pr-6 space-y-10 rtl:border-r-2 rtl:border-l-0 rtl:mr-4 rtl:pr-6 ltr:border-l-2 ltr:border-r-0 ltr:ml-4 ltr:pl-6">
              {sortedExperiences.map((exp, idx) => {
                const achievements = isFa ? exp.achievementsFa : (exp.achievementsEn || exp.achievementsFa || []);

                // Find matching boards designed at this company
                const companyBoards = boards.filter((b) => {
                  if (b.isPersonalProject || b.companyId === 'personal') return false;
                  if (b.companyId === exp.id) return true;
                  if (b.companyFa && exp.companyFa && b.companyFa.includes(exp.companyInitials || exp.companyFa)) return true;
                  if (b.companyEn && exp.companyEn && b.companyEn.toLowerCase().includes(exp.companyEn.toLowerCase())) return true;
                  if (exp.projectsLinked && Array.isArray(exp.projectsLinked)) {
                    return exp.projectsLinked.some((pName) =>
                      (b.titleFa && b.titleFa.toLowerCase().includes(pName.toLowerCase())) ||
                      (b.titleEn && b.titleEn.toLowerCase().includes(pName.toLowerCase()))
                    );
                  }
                  return false;
                });

                return (
                  <div key={exp.id || idx} className="relative group">
                    {/* Glowing Node on Timeline */}
                    <div
                      className="absolute -right-[33px] rtl:-right-[33px] ltr:-left-[33px] top-4 w-5 h-5 rounded-full border-4 border-slate-950 flex items-center justify-center transition-transform group-hover:scale-125 z-10 shadow-lg"
                      style={{ backgroundColor: exp.companyColor || primaryColor }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                    </div>

                    {/* Authentic LinkedIn Company Card */}
                    <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 hover:border-slate-700 transition-all hover:shadow-2xl space-y-5">
                      {/* Company Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          {/* Company Avatar / Logo Box */}
                          <div
                            className="w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center font-bold text-slate-950 text-base shadow-lg overflow-hidden border border-slate-700/60"
                            style={{
                              backgroundColor: `${exp.companyColor || primaryColor}30`,
                              borderColor: `${exp.companyColor || primaryColor}60`,
                            }}
                          >
                            {exp.companyLogo ? (
                              <img
                                src={exp.companyLogo}
                                alt={exp.companyEn}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-mono text-white font-black">
                                {exp.companyInitials || 'EXP'}
                              </span>
                            )}
                          </div>

                          {/* Role & Company Details */}
                          <div>
                            <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-cyan-400 transition-colors">
                              {isFa ? exp.roleFa : exp.roleEn}
                            </h3>

                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-cyan-300 mt-1">
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                                {isFa ? exp.companyFa : exp.companyEn}
                              </span>
                              <span className="text-slate-600">·</span>
                              <span className="text-slate-400 font-medium">{isFa ? exp.typeFa : exp.typeEn}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                              <span className="flex items-center gap-1 text-slate-300">
                                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{isFa ? exp.periodFa : (exp.periodEn || toEnglishDigits(exp.periodFa))}</span>
                              </span>
                              <span className="text-slate-600">·</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                <span>{isFa ? exp.locationFa : exp.locationEn}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Tenure Pill Badge */}
                        <div className="shrink-0">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700">
                            {isFa ? exp.durationFa : (exp.durationEn || toEnglishDigits(exp.durationFa))}
                          </span>
                        </div>
                      </div>

                      {/* Role Overview */}
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                        {isFa ? exp.descriptionFa : exp.descriptionEn}
                      </p>

                      {/* Key Achievements List */}
                      {achievements.length > 0 && (
                        <div className="space-y-2 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/60">
                          <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>{isFa ? 'دستاوردهای کلیدی و نتایج مهندسی:' : 'Key Engineering Achievements:'}</span>
                          </div>
                          <ul className="space-y-2 text-xs text-slate-400 pr-2 rtl:pr-2 ltr:pl-2">
                            {achievements.map((ach, i) => (
                              <li key={i} className="flex items-start gap-2 leading-relaxed">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{isFa ? ach : formatNum(ach, false)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Hardware Boards & Products Designed in this Company */}
                      {companyBoards.length > 0 && (
                        <div className="space-y-3 bg-slate-950/70 p-4.5 rounded-2xl border border-cyan-500/20">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                              <Cpu className="w-4 h-4 text-cyan-400" />
                              <span>{isFa ? 'بردهای سخت‌افزاری طراحی‌شده در این شرکت:' : 'Engineered Hardware Boards at this Company:'}</span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">
                              {formatNum(companyBoards.length, isFa)} {isFa ? 'برد صنعتی' : 'Boards'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            {companyBoards.map((b) => (
                              <div
                                key={b.id}
                                onClick={() => setSelectedBoard(b)}
                                className="group/b flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 cursor-pointer transition-all"
                              >
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-800 relative">
                                  <img
                                    src={b.image}
                                    alt={isFa ? b.titleFa : b.titleEn}
                                    className="w-full h-full object-cover group-hover/b:scale-110 transition-transform duration-300 pointer-events-none"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-xs font-bold text-white group-hover/b:text-cyan-400 transition-colors truncate">
                                    {isFa ? b.titleFa : b.titleEn}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                                    <span className="flex items-center gap-0.5 text-cyan-300">
                                      <Layers className="w-3 h-3" />
                                      {isFa ? toPersianDigits(b.layers) : toEnglishDigits(b.layers)} {isFa ? 'لایه' : 'L'}
                                    </span>
                                    <span>·</span>
                                    <span className="truncate text-slate-400">{b.mcu?.split(' ')[0]}</span>
                                  </div>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono font-bold shrink-0">
                                  {isFa ? 'مشاهده ۳D' : 'View'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Skills Used Chips & Linked Boards */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        {/* Skills Used */}
                        {exp.skillsUsed && exp.skillsUsed.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] text-slate-500 font-semibold mr-1 rtl:mr-0 rtl:ml-1">
                              {isFa ? 'مهارت‌ها:' : 'Skills:'}
                            </span>
                            {exp.skillsUsed.map((sk, i) => (
                              <span
                                key={i}
                                className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Projects Linked */}
                        {exp.projectsLinked && exp.projectsLinked.length > 0 && (
                          <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-mono">
                            <Cpu className="w-3.5 h-3.5" />
                            <span>{exp.projectsLinked.join(' · ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- 2. EDUCATION & ACADEMIC TRACK --- */}
        {activeTab === 'education' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {education.map((edu) => (
              <div
                key={edu.id}
                className="p-6 sm:p-7 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {isFa ? edu.yearFa : (edu.yearEn || toEnglishDigits(edu.yearFa))}
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {isFa ? edu.degreeFa : edu.degreeEn}
                  </h3>
                  <p className="text-xs font-semibold text-cyan-400 mt-1">
                    {isFa ? edu.universityFa : edu.universityEn}
                  </p>
                  <p className="text-xs text-emerald-400 font-mono mt-1 font-bold">
                    {isFa ? edu.gpaFa : (edu.gpaEn || toEnglishDigits(edu.gpaFa))}
                  </p>
                </div>

                {/* Thesis Description */}
                {(edu.thesisFa || edu.thesisEn) && (
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-300 space-y-1">
                    <span className="font-bold text-slate-400 block">
                      {isFa ? 'عنوان پایان‌نامه و پروژه پژوهشی:' : 'Thesis & Research Project:'}
                    </span>
                    <p className="leading-relaxed">
                      {isFa ? edu.thesisFa : (edu.thesisEn || edu.thesisFa)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* --- 3. CERTIFICATIONS & CREDENTIALS --- */}
        {activeTab === 'certifications' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className="p-6 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">
                    {isFa ? cert.titleFa : cert.titleEn}
                  </h3>

                  <p className="text-xs text-slate-400">
                    {isFa ? (cert.issuerFa || cert.issuer) : (cert.issuerEn || cert.issuer)}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">{formatNum(cert.year, isFa)}</span>
                  <span className="text-amber-400 font-bold">{cert.credentialId}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
