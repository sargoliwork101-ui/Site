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

const softBox = {
  background: 'var(--surface-2)',
  border: '1px solid var(--line)',
  borderRadius: 12
};

/**
 * Board detail modal — light theme (matches the site palette).
 * Keeps all app features: protected image view, interactive 3D viewer,
 * specs table, features, interfaces, datasheet & GitHub links.
 */
export const BoardModal = () => {
  const { selectedBoard, setSelectedBoard, data } = useData();
  const [viewMode, setViewMode] = useState('image'); // 'image' | '3d'

  if (!selectedBoard) return null;

  const isFa = data?.siteConfig?.language === 'fa';
  const primaryColor = data?.siteConfig?.primaryColor || '#4f46e5';

  // Check if this board has an active 3D STEP / CAD file
  const has3DModel = Boolean(selectedBoard.stepFileUrl);
  const isPersonal = selectedBoard.isPersonalProject || selectedBoard.companyId === 'personal';

  const rawSpecs = isFa
    ? selectedBoard.specs || selectedBoard.specsEn || {}
    : selectedBoard.specsEn || selectedBoard.specs || {};

  // Localize numbers in specs table
  const specsObject = Object.entries(rawSpecs).reduce((acc, [k, v]) => {
    acc[k] = formatNum(v, isFa);
    return acc;
  }, {});

  const close = () => {
    setSelectedBoard(null);
    setViewMode('image');
  };

  return (
    <div className="lm-backdrop animate-fadeIn">
      <div className="lm-card" style={{ maxWidth: 980 }} onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <div className="lm-head">
          <div className="flex items-center gap-3 truncate">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--gradient)', color: '#fff' }}
            >
              <Cpu className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h3 style={{ fontSize: '15.5px', fontWeight: 900, color: 'var(--ink)' }}>{isFa ? selectedBoard.titleFa : selectedBoard.titleEn}</h3>
              <p className="mono" style={{ fontSize: '11.5px', color: 'var(--accent)' }}>
                {isFa ? selectedBoard.categoryFa || selectedBoard.category : selectedBoard.categoryEn || selectedBoard.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* If 3D Model exists, show Switcher Tab */}
            {has3DModel && (
              <div className="flex items-center gap-1" style={{ background: 'var(--bg-soft)', border: '1px solid var(--line)', borderRadius: 12, padding: 3 }}>
                <button
                  type="button"
                  onClick={() => setViewMode('image')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 9,
                    fontSize: '12px', fontWeight: viewMode === 'image' ? 800 : 600, cursor: 'pointer',
                    background: viewMode === 'image' ? '#fff' : 'transparent',
                    color: viewMode === 'image' ? 'var(--accent)' : 'var(--muted)',
                    border: 'none'
                  }}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isFa ? 'عکس برد' : 'Photo'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('3d')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 9,
                    fontSize: '12px', fontWeight: viewMode === '3d' ? 800 : 600, cursor: 'pointer',
                    background: viewMode === '3d' ? 'var(--gradient)' : 'transparent',
                    color: viewMode === '3d' ? '#fff' : 'var(--accent)',
                    border: 'none'
                  }}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>{isFa ? 'نمای ۳D سه‌بعدی' : '3D CAD'}</span>
                </button>
              </div>
            )}

            <button className="lm-close" onClick={close} aria-label={isFa ? 'بستن' : 'Close'}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="lm-body lm-scroll select-none">
          {/* Main Visual: 3D Viewer or Protected High-Res Image */}
          {has3DModel && viewMode === '3d' ? (
            <Interactive3DViewer board={selectedBoard} isFa={isFa} primaryColor={primaryColor} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Image Preview (Protected from Downloading / Dragging / Context Menu) */}
              <div
                onContextMenu={(e) => e.preventDefault()}
                className="md:col-span-6 relative group select-none"
                style={{ ...softBox, borderRadius: 16, overflow: 'hidden', background: 'var(--bg-soft)' }}
              >
                <img
                  src={selectedBoard.image}
                  alt={isFa ? selectedBoard.titleFa : selectedBoard.titleEn}
                  draggable="false"
                  onContextMenu={(e) => e.preventDefault()}
                  style={{
                    width: '100%', height: 260, objectFit: 'cover', display: 'block',
                    pointerEvents: 'none', userSelect: 'none',
                    transition: 'transform .5s'
                  }}
                  onMouseEnter={(e) => (e.target.style.transform = 'scale(1.04)')}
                  onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                />

                <div
                  className="mono absolute"
                  style={{
                    top: 12, insetInlineEnd: 12, padding: '4px 12px', borderRadius: 10,
                    background: 'rgba(255,255,255,.94)', border: '1px solid var(--line-strong)',
                    color: 'var(--accent)', fontSize: '12px', fontWeight: 700
                  }}
                >
                  {isFa ? toPersianDigits(selectedBoard.layers) : toEnglishDigits(selectedBoard.layers)} {isFa ? 'لایه استاندارد' : 'Layers PCB'}
                </div>

                {has3DModel && (
                  <button
                    onClick={() => setViewMode('3d')}
                    className="absolute"
                    style={{
                      bottom: 12, insetInlineStart: 12, display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 12px', borderRadius: 10, fontSize: '12px', fontWeight: 700,
                      background: 'rgba(255,255,255,.96)', color: 'var(--accent)',
                      border: '1px solid var(--line-strong)', cursor: 'pointer'
                    }}
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>{isFa ? 'مشاهده مدل ۳D تعاملی' : 'Switch to 3D View'}</span>
                  </button>
                )}
              </div>

              {/* Quick Parameters */}
              <div className="md:col-span-6 space-y-3">
                {/* Company / Personal Affiliation Card */}
                <div style={{ ...softBox, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{isFa ? 'محل اجرا و وابستگی پروژه:' : 'Project Affiliation / Org:'}</span>
                  {isPersonal ? (
                    <span
                      className="inline-flex items-center gap-1"
                      style={{ padding: '3px 10px', borderRadius: 8, background: '#fff8e6', border: '1px solid #f2d98d', color: '#9a6b00', fontSize: '12px', fontWeight: 700 }}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{isFa ? 'پروژه شخصی / R&D آزاد' : 'Personal Lab R&D'}</span>
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1"
                      style={{ padding: '3px 10px', borderRadius: 8, background: 'var(--accent-soft)', border: '1px solid rgba(79,70,229,.25)', color: 'var(--accent)', fontSize: '12px', fontWeight: 700 }}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{isFa ? selectedBoard.companyFa || 'تولید شرکتی' : selectedBoard.companyEn || 'Corporate R&D'}</span>
                    </span>
                  )}
                </div>

                <div style={{ ...softBox, padding: '12px 14px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{isFa ? 'پردازنده / میکروکنترلر اصلی:' : 'Core Processor / MCU:'}</span>
                  <div className="mono" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginTop: 4, direction: 'ltr', textAlign: 'start' }}>
                    {selectedBoard.mcu}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div style={{ ...softBox, padding: '10px 14px' }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{isFa ? 'نرم‌افزار EDA:' : 'EDA Tool:'}</span>
                    <div className="mono" style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginTop: 2 }}>{selectedBoard.edaTool}</div>
                  </div>
                  <div style={{ ...softBox, padding: '10px 14px' }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{isFa ? 'ابعاد فیزیکی:' : 'Dimensions:'}</span>
                    <div className="mono" style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginTop: 2 }}>
                      {formatNum(selectedBoard.dimensions, isFa)}
                    </div>
                  </div>
                </div>

                <div style={{ ...softBox, padding: '12px 14px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{isFa ? 'منبع تغذیه و ورودی:' : 'Power Supply Input:'}</span>
                  <div className="mono" style={{ fontSize: '12.5px', color: 'var(--ok)', marginTop: 4 }}>
                    {isFa ? formatNum(selectedBoard.powerSupply, isFa) : formatNum(selectedBoard.powerSupplyEn || selectedBoard.powerSupply, isFa)}
                  </div>
                </div>

                <div style={{ ...softBox, background: 'var(--ok-bg)', borderColor: 'var(--ok-line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 14px' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--ok)', fontWeight: 600 }}>{isFa ? 'وضعیت تولید:' : 'Deployment Status:'}</span>
                  <span style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--ok)' }}>
                    {isFa ? selectedBoard.status : selectedBoard.statusEn || selectedBoard.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Description Paragraph */}
          <div style={{ ...softBox, background: '#fff', padding: '14px 16px', marginTop: 18 }}>
            <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--muted)', marginBottom: 6 }}>{isFa ? 'شرح و کاربرد برد:' : 'Board Overview & Application:'}</h4>
            <p style={{ fontSize: '13.5px', color: '#3d4459', lineHeight: 1.9 }}>
              {isFa ? selectedBoard.shortDescFa : selectedBoard.shortDescEn || selectedBoard.shortDescFa}
            </p>
          </div>

          {/* Technical Specs Table */}
          {Object.keys(specsObject).length > 0 && (
            <div style={{ marginTop: 18 }}>
              <h4 className="flex items-center gap-2" style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--ink)', marginBottom: 10 }}>
                <Table className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                <span>{isFa ? 'جدول مشخصات فنی تفصیلی:' : 'Detailed Hardware Specifications:'}</span>
              </h4>
              <div className="tbl-wrap">
                <table className="tbl">
                  <tbody>
                    {Object.entries(specsObject).map(([key, val], idx) => (
                      <tr key={idx}>
                        <td className="mono" style={{ width: '33%', fontWeight: 700 }}>{key}</td>
                        <td className="mono">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Detailed Features List */}
          {(isFa ? selectedBoard.features : selectedBoard.featuresEn || selectedBoard.features)?.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <h4 className="flex items-center gap-2" style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--ink)', marginBottom: 10 }}>
                <Cpu className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                <span>{isFa ? 'ویژگی‌ها و نکات برجسته طراحی سخت‌افزار:' : 'Key Engineering Highlights & Features:'}</span>
              </h4>
              <div className="grid grid-cols-1 gap-2.5">
                {(isFa ? selectedBoard.features : selectedBoard.featuresEn || selectedBoard.features).map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5"
                    style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)', fontSize: '13px', color: '#3d4459', lineHeight: 1.8 }}
                  >
                    <CheckCircle2 className="shrink-0" style={{ width: 16, height: 16, color: 'var(--ok)', marginTop: 5 }} />
                    <span>{isFa ? feat : formatNum(feat, false)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supported Communication Protocols */}
          {selectedBoard.interfaces && selectedBoard.interfaces.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--ink)', marginBottom: 10 }}>
                {isFa ? 'پروتکل‌ها و رابط‌های ارتباطی سخت‌افزاری:' : 'Interfaces & Fieldbus Protocols:'}
              </h4>
              <div className="chips">
                {selectedBoard.interfaces.map((iface, i) => (
                  <span key={i} className="chip mono" style={{ fontSize: '12.5px' }}>
                    {isFa ? iface : formatNum(iface, false)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="lm-head" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div className="flex flex-wrap items-center gap-2">
            {/* Protected Mode Badge */}
            <span className="mono select-none" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 10, background: 'var(--bg-soft)', border: '1px solid var(--line)', fontSize: '11.5px', color: 'var(--muted)' }}>
              <Lock className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
              <span>{isFa ? 'طراحی سخت‌افزار محافظت‌شده (نمایش تحت وب)' : 'Protected Hardware Design'}</span>
            </span>

            {selectedBoard.datasheetUrl && (
              <a
                href={selectedBoard.datasheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-mini btn-soft"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isFa ? 'دیتاشیت مشخصات (PDF)' : 'Datasheet (PDF)'}</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            )}

            {selectedBoard.githubUrl && (
              <a
                href={selectedBoard.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-mini btn-ghost"
              >
                <Github className="w-3.5 h-3.5" />
                <span>{isFa ? 'مشاهده در گیت‌هاب' : 'GitHub'}</span>
              </a>
            )}
          </div>

          <button className="btn btn-primary btn-mini" onClick={close}>
            {isFa ? 'بستن پنجره' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
