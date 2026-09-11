/**
 * ═══════════════════════════════════════════════════════════════════
 * PdfResumeModal.jsx — پیش‌نمایش و خروجی PDF رزومه (۳ قالب، فارسی/انگلیسی)
 * ═══════════════════════════════════════════════════════════════════
 * چی توشه؟ رندر A4 از دیتای زنده (personalInfo/سوابق/مهارت...)، دانلود PDF
 * باکیفیت (html2canvas + jsPDF — هر دو lazy ایمپورت می‌شن تا لود اول سنگین
 * نشه)، و چاپ مستقیم (window.print).
 * ⚠️ کتابخانه‌های PDF رو static ایمپورت نکن (حجم باندل اول). در حالت انگلیسی
 * همه رشته‌ها باید انگلیسی باشن (قانون ۱۰) — رشته فارسی جدید نذار.
 */
import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { formatNum, toEnglishDigits, toPersianDigits } from '../../utils/numberHelper';
import {
  X,
  FileDown,
  Printer,
  Globe,
  Cpu,
  BookOpen,
  Briefcase,
  GraduationCap,
  Award,
  Layers,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

export const PdfResumeModal = () => {
  const { isPdfModalOpen, setIsPdfModalOpen, data, showToast } = useData();
  const [resumeLang, setResumeLang] = useState(() => data.siteConfig?.language || 'fa');
  const [resumeLayout, setResumeLayout] = useState('modern-tech'); // 'modern-tech' | 'classic-executive' | 'academic'
  const [isGenerating, setIsGenerating] = useState(false);

  const resumeRef = useRef(null);

  // Sync with site language on open
  useEffect(() => {
    if (isPdfModalOpen) {
      setResumeLang(data.siteConfig?.language || 'fa');
    }
  }, [isPdfModalOpen, data.siteConfig?.language]);

  if (!isPdfModalOpen) return null;

  const isFa = resumeLang === 'fa';
  const info = data?.personalInfo || {};
  const { boards = [], articles = [], skills = [], experiences = [], education = [], certifications = [] } = data || {};

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!resumeRef.current) return;
    setIsGenerating(true);
    showToast(isFa ? 'در حال ساخت نسخه باکیفیت PDF رزومه...' : 'Rendering high-resolution PDF...', 'info');

    try {
      const [html2canvasModule, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      const html2canvas = html2canvasModule.default || html2canvasModule;

      const element = resumeRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Arash_Taheri_Resume_${resumeLang.toUpperCase()}.pdf`);
      showToast(isFa ? 'رزومه PDF با موفقیت دانلود شد.' : 'PDF Resume successfully exported.');
    } catch (error) {
      console.error('PDF Generation failed:', error);
      showToast(isFa ? 'خطا در دانلود خودکار، لطفاً از دکمه چاپ استفاده فرمایید.' : 'Export failed, please use the Print button.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-4 flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {isFa ? 'خروجی و دانلود رزومه PDF استاندارد' : 'Standard PDF Resume Generator & Export'}
              </h3>
              <p className="text-xs text-slate-400">
                {isFa
                  ? 'قالب‌های بهینه‌سازی شده برای ارسال به شرکت‌ها، دانشگاه‌ها و کارفرمایان بین‌المللی'
                  : 'ATS-compliant layouts designed for engineering hiring managers and international firms.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg transition-all"
            >
              {isGenerating ? (
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              <span>{isFa ? 'دانلود فایل PDF' : 'Download PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{isFa ? 'چاپ (Print)' : 'Print CV'}</span>
            </button>

            <button
              onClick={() => setIsPdfModalOpen(false)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="px-6 py-3 bg-slate-950/50 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Template Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">{isFa ? 'قالب رزومه:' : 'Layout Style:'}</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setResumeLayout('modern-tech')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  resumeLayout === 'modern-tech'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isFa ? 'مدرن دو ستونه' : 'Modern Two-Column'}
              </button>
              <button
                onClick={() => setResumeLayout('classic-executive')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  resumeLayout === 'classic-executive'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isFa ? 'کلاسیک اجرایی' : 'Executive Single-Col'}
              </button>
              <button
                onClick={() => setResumeLayout('academic')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  resumeLayout === 'academic'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isFa ? 'آکادمیک و پژوهشی' : 'Academic & Research'}
              </button>
            </div>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">{isFa ? 'زبان رزومه:' : 'Resume Language:'}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setResumeLang('fa')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                  resumeLang === 'fa' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                }`}
              >
                فارسی (RTL)
              </button>
              <button
                onClick={() => setResumeLang('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                  resumeLang === 'en' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                }`}
              >
                English (LTR)
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable A4 Document Preview */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-950/80 flex justify-center flex-1">
          {/* A4 Sheet Container */}
          <div
            ref={resumeRef}
            dir={isFa ? 'rtl' : 'ltr'}
            className="w-full max-w-[800px] bg-white text-slate-900 p-8 sm:p-12 shadow-2xl rounded-sm font-sans"
            style={{
              minHeight: '1100px',
              fontFamily: isFa ? 'Vazirmatn, Tahoma, sans-serif' : 'system-ui, -apple-system, sans-serif',
            }}
          >
            {/* Resume Header */}
            <div className="border-b-2 border-slate-900 pb-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                    {isFa ? info.fullNameFa : info.fullNameEn}
                  </h1>
                  <p className="text-sm font-bold text-cyan-800 mt-1">
                    {isFa ? info.titleFa : info.titleEn}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 max-w-xl leading-relaxed">
                    {isFa ? info.bioFa : info.bioEn}
                  </p>
                </div>

                <div className="text-xs space-y-1.5 text-slate-700 shrink-0 border-t sm:border-t-0 sm:border-l sm:border-r-0 border-slate-200 sm:px-4 pt-3 sm:pt-0">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono text-[11px]">{info.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono text-[11px]">{isFa ? info.phone : toEnglishDigits(info.phone)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isFa ? info.locationFa : info.locationEn}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Two Columns */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left Column (8 cols): Work Experience & Selected Hardware Boards */}
              <div className="md:col-span-8 space-y-6">
                {/* 1. Work Experience */}
                {experiences.length > 0 && (
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-1 mb-3 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-cyan-700" />
                      <span>{isFa ? 'سوابق شغلی و سرپرستی فنی' : 'Work Experience & Leadership'}</span>
                    </h2>

                    <div className="space-y-4">
                      {experiences.map((exp, idx) => {
                        const achievements = isFa ? exp.achievementsFa : (exp.achievementsEn || exp.achievementsFa || []);
                        return (
                          <div key={idx} className="space-y-1 text-xs">
                            <div className="flex items-center justify-between font-bold text-slate-900">
                              <span>{isFa ? exp.roleFa : exp.roleEn}</span>
                              <span className="text-[11px] text-slate-500 font-mono">
                                {isFa ? exp.periodFa : (exp.periodEn || toEnglishDigits(exp.periodFa))}
                              </span>
                            </div>
                            <div className="text-cyan-800 font-semibold text-[11px]">
                              {isFa ? exp.companyFa : exp.companyEn}
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-slate-700 pt-1 text-[11px]">
                              {achievements.slice(0, 3).map((ach, i) => (
                                <li key={i} className="leading-relaxed">{isFa ? ach : formatNum(ach, false)}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Key Hardware Boards Engineered */}
                {boards.length > 0 && (
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-1 mb-3 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-700" />
                      <span>{isFa ? 'بردهای الکترونیکی شاخص ساخته‌شده' : 'Featured Hardware & PCB Projects'}</span>
                    </h2>

                    <div className="space-y-3">
                      {boards.slice(0, 3).map((b, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{isFa ? b.titleFa : b.titleEn}</span>
                            <span className="text-[10px] font-mono font-bold bg-slate-200 px-1.5 py-0.5 rounded">
                              {isFa ? toPersianDigits(b.layers) : toEnglishDigits(b.layers)} {isFa ? 'لایه' : 'Layers'}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-cyan-800">{b.mcu}</div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {isFa ? b.shortDescFa : (b.shortDescEn || b.shortDescFa)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Published Articles & Research */}
                {articles.length > 0 && (
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-1 mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-700" />
                      <span>{isFa ? 'مقالات و انتشارات تخصصی' : 'Selected Publications & Research'}</span>
                    </h2>

                    <div className="space-y-2 text-xs">
                      {articles.slice(0, 3).map((art, idx) => (
                        <div key={idx} className="text-[11px] space-y-0.5">
                          <div className="font-bold text-slate-900">• {isFa ? art.titleFa : art.titleEn}</div>
                          <div className="text-slate-500 font-mono text-[10px]">
                            {isFa ? (art.categoryFa || art.category) : (art.categoryEn || art.category)} | {isFa ? formatNum(art.date, true) : toEnglishDigits(art.date || '2024')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column (4 cols): Technical Skills, Education & Certs */}
              <div className="md:col-span-4 space-y-6">
                {/* 1. Technical Skills */}
                {skills.length > 0 && (
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-1 mb-3 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-700" />
                      <span>{isFa ? 'مهارت‌های تخصصی' : 'Technical Skills'}</span>
                    </h2>

                    <div className="space-y-3">
                      {skills.map((group, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="text-[11px] font-bold text-slate-800">
                            {isFa ? group.categoryFa.split('(')[0] : (group.categoryEn || group.categoryFa).split('(')[0]}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {group.items.slice(0, 4).map((sk, i) => {
                              const sName = isFa ? (sk.nameFa || sk.name) : (sk.nameEn || sk.name || sk.nameFa);
                              return (
                                <span
                                  key={i}
                                  className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                                >
                                  {sName.split('(')[0]}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Education */}
                {education.length > 0 && (
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-1 mb-3 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-cyan-700" />
                      <span>{isFa ? 'تحصیلات دانشگاهی' : 'Education'}</span>
                    </h2>

                    <div className="space-y-3 text-xs">
                      {education.map((edu, idx) => (
                        <div key={idx} className="text-[11px] space-y-0.5">
                          <div className="font-bold text-slate-900">{isFa ? edu.degreeFa : edu.degreeEn}</div>
                          <div className="text-cyan-800">{isFa ? edu.universityFa : edu.universityEn}</div>
                          <div className="text-slate-500 font-mono text-[10px]">
                            {isFa ? edu.yearFa : (edu.yearEn || toEnglishDigits(edu.yearFa))} | {isFa ? edu.gpaFa : (edu.gpaEn || toEnglishDigits(edu.gpaFa))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Certifications */}
                {certifications.length > 0 && (
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-1 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-cyan-700" />
                      <span>{isFa ? 'گواهینامه‌ها' : 'Certifications'}</span>
                    </h2>

                    <div className="space-y-2 text-xs">
                      {certifications.map((c, idx) => (
                        <div key={idx} className="text-[11px] space-y-0.5">
                          <div className="font-bold text-slate-900">{isFa ? c.titleFa : c.titleEn}</div>
                          <div className="text-slate-500 text-[10px]">
                            {isFa ? (c.issuerFa || c.issuer) : (c.issuerEn || c.issuer)} ({formatNum(c.year, isFa)})
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
