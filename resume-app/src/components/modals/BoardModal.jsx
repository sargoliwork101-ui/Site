import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Interactive3DViewer } from '../common/Interactive3DViewer';
import { formatNum, toEnglishDigits, toPersianDigits } from '../../utils/numberHelper';
import {
  X,
  Cpu,
  CheckCircle2,
  FileText,
  ExternalLink,
  Table,
  Box,
  Image as ImageIcon,
  Lock,
  Building2,
  User
} from 'lucide-react';
import { Github } from '../common/BrandIcons';

export const BoardModal = () => {
  const { selectedBoard, setSelectedBoard, currentTemplate, data } = useData();
  const [viewMode, setViewMode] = useState('image'); // 'image' | '3d'

  if (!selectedBoard) return null;

  const isFa = data?.siteConfig?.language === 'fa';
  const primaryColor = currentTemplate?.colors?.primary || '#00ffcc';

  // Check if this board has an active 3D STEP / CAD file
  const has3DModel = Boolean(selectedBoard.stepFileUrl);
  const isPersonal = selectedBoard.isPersonalProject || selectedBoard.companyId === 'personal';

  const rawSpecs = isFa 
    ? (selectedBoard.specs || selectedBoard.specsEn || {}) 
    : (selectedBoard.specsEn || selectedBoard.specs || {});

  // Localize numbers in specs table
  const specsObject = Object.entries(rawSpecs).reduce((acc, [k, v]) => {
    acc[k] = formatNum(v, isFa);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3 truncate mr-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-slate-950 text-xs shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <Cpu className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h3 className="text-base sm:text-lg font-bold text-white truncate">
                {isFa ? selectedBoard.titleFa : selectedBoard.titleEn}
              </h3>
              <p className="text-xs font-mono text-cyan-400 truncate">
                {isFa ? (selectedBoard.categoryFa || selectedBoard.category) : (selectedBoard.categoryEn || selectedBoard.category)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* If 3D Model exists, show Switcher Tab */}
            {has3DModel && (
              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('image')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                    viewMode === 'image'
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isFa ? 'عکس برد' : 'Photo'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('3d')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                    viewMode === '3d'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                      : 'text-cyan-400 hover:text-cyan-300'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>{isFa ? 'نمای ۳D سه‌بعدی' : '3D CAD'}</span>
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setSelectedBoard(null);
                setViewMode('image');
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              aria-label={isFa ? 'بستن' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 select-none">
          {/* Main Visual: 3D Viewer or Protected High-Res Image */}
          {has3DModel && viewMode === '3d' ? (
            <Interactive3DViewer board={selectedBoard} isFa={isFa} primaryColor={primaryColor} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Image Preview (Protected from Downloading / Dragging / Context Menu) */}
              <div
                onContextMenu={(e) => e.preventDefault()}
                className="md:col-span-6 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-[4/3] relative group select-none"
              >
                <img
                  src={selectedBoard.image}
                  alt={isFa ? selectedBoard.titleFa : selectedBoard.titleEn}
                  draggable="false"
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-full object-cover pointer-events-none select-none transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Overlay Protection Watermark */}
                <div className="absolute inset-0 bg-transparent pointer-events-none" />

                <div className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold select-none">
                  {isFa ? toPersianDigits(selectedBoard.layers) : toEnglishDigits(selectedBoard.layers)} {isFa ? 'لایه استاندارد' : 'Layers PCB'}
                </div>

                {has3DModel && (
                  <button
                    onClick={() => setViewMode('3d')}
                    className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/90 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all shadow-lg backdrop-blur-md"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>{isFa ? 'مشاهده مدل ۳D تعاملی' : 'Switch to 3D View'}</span>
                  </button>
                )}
              </div>

              {/* Quick Parameters */}
              <div className="md:col-span-6 space-y-3">
                {/* Company / Personal Affiliation Card */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {isFa ? 'محل اجرا و وابستگی پروژه:' : 'Project Affiliation / Org:'}
                  </span>
                  {isPersonal ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold">
                      <User className="w-3.5 h-3.5" />
                      <span>{isFa ? 'پروژه شخصی / R&D آزاد' : 'Personal Lab R&D'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
                      <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isFa ? (selectedBoard.companyFa || 'تولید شرکتی') : (selectedBoard.companyEn || 'Corporate R&D')}</span>
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400">
                    {isFa ? 'پردازنده / میکروکنترلر اصلی:' : 'Core Processor / MCU:'}
                  </span>
                  <div className="text-xs sm:text-sm font-mono font-bold text-cyan-300">
                    {selectedBoard.mcu}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400">{isFa ? 'نرم‌افزار EDA:' : 'EDA Tool:'}</span>
                    <div className="text-xs font-mono font-bold text-white mt-0.5">{selectedBoard.edaTool}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400">{isFa ? 'ابعاد فیزیکی:' : 'Dimensions:'}</span>
                    <div className="text-xs font-mono font-bold text-white mt-0.5">
                      {formatNum(selectedBoard.dimensions, isFa)}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400">{isFa ? 'منبع تغذیه و ورودی:' : 'Power Supply Input:'}</span>
                  <div className="text-xs font-mono text-emerald-400">
                    {isFa ? formatNum(selectedBoard.powerSupply, isFa) : formatNum(selectedBoard.powerSupplyEn || selectedBoard.powerSupply, isFa)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                  <span className="text-xs text-emerald-300 font-medium">{isFa ? 'وضعیت تولید:' : 'Deployment Status:'}</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {isFa ? selectedBoard.status : (selectedBoard.statusEn || selectedBoard.status)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Description Paragraph */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 mb-1.5">{isFa ? 'شرح و کاربرد برد:' : 'Board Overview & Application:'}</h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {isFa ? selectedBoard.shortDescFa : (selectedBoard.shortDescEn || selectedBoard.shortDescFa)}
            </p>
          </div>

          {/* Technical Specs Table */}
          {Object.keys(specsObject).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Table className="w-4 h-4 text-cyan-400" />
                <span>{isFa ? 'جدول مشخصات فنی تفصیلی:' : 'Detailed Hardware Specifications:'}</span>
              </h4>
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/50">
                <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
                  <tbody>
                    {Object.entries(specsObject).map(([key, val], idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-950/60'}
                      >
                        <td className="p-2.5 font-semibold text-slate-400 border-b border-slate-800/60 w-1/3">
                          {key}
                        </td>
                        <td className="p-2.5 text-slate-200 font-mono border-b border-slate-800/60">
                          {val}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Detailed Features List */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>{isFa ? 'ویژگی‌ها و نکات برجسته طراحی سخت‌افزار:' : 'Key Engineering Highlights & Features:'}</span>
            </h4>
            <div className="grid grid-cols-1 gap-2.5">
              {(isFa ? selectedBoard.features : (selectedBoard.featuresEn || selectedBoard.features))?.map((feat, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-300 leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{isFa ? feat : formatNum(feat, false)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supported Communication Protocols */}
          {selectedBoard.interfaces && selectedBoard.interfaces.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white">
                {isFa ? 'پروتکل‌ها و رابط‌های ارتباطی سخت‌افزاری:' : 'Interfaces & Fieldbus Protocols:'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedBoard.interfaces.map((iface, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-cyan-300 border border-cyan-500/30 font-mono text-xs font-semibold"
                  >
                    {isFa ? iface : formatNum(iface, false)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Protected Mode Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 select-none">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isFa ? 'طراحی سخت‌افزار محافظت‌شده (نمایش تحت وب)' : 'Protected Hardware Design'}</span>
            </div>

            {/* Direct Datasheet / Spec PDF Link if Provided */}
            {selectedBoard.datasheetUrl && (
              <a
                href={selectedBoard.datasheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all shadow-sm"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>{isFa ? 'دیتاشیت مشخصات (PDF)' : 'Datasheet (PDF)'}</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            )}

            {selectedBoard.githubUrl && (
              <a
                href={selectedBoard.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>{isFa ? 'مشاهده در گیت‌هاب' : 'GitHub'}</span>
              </a>
            )}
          </div>

          <button
            onClick={() => {
              setSelectedBoard(null);
              setViewMode('image');
            }}
            className="px-6 py-2 rounded-xl font-bold text-xs text-slate-950"
            style={{ backgroundColor: primaryColor }}
          >
            {isFa ? 'بستن پنجره' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
