import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link,
  Image as ImageIcon,
  Table as TableIcon,
  Minus,
  Undo,
  Redo,
  Sparkles,
  Maximize2,
  Minimize2,
  Save,
  Download,
  Upload,
  FileText,
  Copy,
  Check,
  Search,
  Palette,
  Highlighter,
  Cpu,
  AlertCircle,
  Clock,
  Eye,
  Code2,
  Trash2
} from 'lucide-react';

export const RichTextEditorModal = ({
  isOpen,
  onClose,
  initialValue = '',
  onSave,
  title = 'ویرایشگر حرفه‌ای متن (مشابه ورد)',
  fieldName = '',
  language = 'fa',
  readOnly = false
}) => {
  const [content, setContent] = useState(initialValue);
  const [viewMode, setViewMode] = useState('wysiwyg'); // 'wysiwyg' | 'source'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [direction, setDirection] = useState(language === 'en' ? 'ltr' : 'rtl');
  const [currentFont, setCurrentFont] = useState('Vazirmatn');
  const [currentFontSize, setCurrentFontSize] = useState('16px');
  const [textColor, setTextColor] = useState('#f8fafc');
  const [highlightColor, setHighlightColor] = useState('transparent');
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  // Modals inside editor
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableHasHeader, setTableHasHeader] = useState(true);

  const [isSymbolsModalOpen, setIsSymbolsModalOpen] = useState(false);
  const [isCalloutModalOpen, setIsCalloutModalOpen] = useState(false);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');

  const editorRef = useRef(null);
  const docxFileInputRef = useRef(null);
  const imageUploadInputRef = useRef(null);

  // Sync initial content on open
  useEffect(() => {
    if (isOpen) {
      setContent(initialValue || '');
      setDirection(language === 'en' ? 'ltr' : 'rtl');
      if (editorRef.current) {
        editorRef.current.innerHTML = initialValue || '<p><br></p>';
      }
    }
  }, [isOpen, initialValue, language]);

  // Sync editor innerHTML when switching from source code back to WYSIWYG
  useEffect(() => {
    if (viewMode === 'wysiwyg' && editorRef.current) {
      editorRef.current.innerHTML = content || '<p><br></p>';
    }
  }, [viewMode]);

  if (!isOpen) return null;

  // Execute formatting command on contenteditable
  const executeCmd = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      handleContentChange();
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  // Clean Microsoft Word pasted HTML
  const cleanWordHtml = (rawHtml) => {
    let clean = rawHtml;
    // Strip XML namespaces and Office specific comments
    clean = clean.replace(/<!--[\s\S]*?-->/gi, '');
    clean = clean.replace(/<\/?\w+:[^>]*>/gi, '');
    // Strip class names like MsoNormal
    clean = clean.replace(/class="Mso[^"]*"/gi, '');
    clean = clean.replace(/class=Mso\w+/gi, '');
    // Clean inline messy Office styles while keeping essential formatting
    clean = clean.replace(/style="[^"]*mso-[^"]*"/gi, '');
    // Remove empty spans
    clean = clean.replace(/<span>(.*?)<\/span>/gi, '$1');
    return clean;
  };

  // Smart Paste Handler
  const handlePaste = (e) => {
    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData) return;

    const html = clipboardData.getData('text/html');
    if (html && (html.includes('urn:schemas-microsoft-com:office') || html.includes('MsoNormal') || html.includes('WordSection'))) {
      e.preventDefault();
      const cleaned = cleanWordHtml(html);
      document.execCommand('insertHTML', false, cleaned);
      handleContentChange();
    }
  };

  // Import .docx file via Mammoth
  const handleDocxImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.docx')) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result;
        try {
          const mammothModule = await import('mammoth');
          const mammoth = mammothModule.default || mammothModule;
          const result = await mammoth.convertToHtml({ arrayBuffer });
          const convertedHtml = result.value;
          if (editorRef.current) {
            editorRef.current.innerHTML = convertedHtml;
            handleContentChange();
          } else {
            setContent(convertedHtml);
          }
        } catch (err) {
          alert('خطا در خواندن فایل ورد DOCX. لطفاً فایل معتبر انتخاب کنید.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.html')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (editorRef.current) {
          editorRef.current.innerHTML = `<pre style="white-space: pre-wrap;">${text}</pre>`;
          handleContentChange();
        } else {
          setContent(text);
        }
      };
      reader.readAsText(file);
    }
    // reset input
    e.target.value = '';
  };

  // Direct Image Upload Handler
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      const imgHtml = `<img src="${base64}" alt="${file.name}" style="max-width: 100%; border-radius: 12px; margin: 16px 0; box-shadow: 0 4px 20px rgba(0,0,0,0.3);" />`;
      if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand('insertHTML', false, imgHtml);
        handleContentChange();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Insert Table Generator
  const handleInsertTable = () => {
    let tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; overflow: hidden;">`;
    if (tableHasHeader) {
      tableHtml += `<thead><tr style="background: rgba(0, 255, 204, 0.15); border-bottom: 2px solid rgba(0, 255, 204, 0.4);">`;
      for (let c = 0; c < tableCols; c++) {
        tableHtml += `<th style="padding: 10px 14px; text-align: ${direction === 'rtl' ? 'right' : 'left'}; font-weight: bold; border: 1px solid rgba(255,255,255,0.15);">عنوان ستون ${c + 1}</th>`;
      }
      tableHtml += `</tr></thead>`;
    }
    tableHtml += `<tbody>`;
    for (let r = 0; r < tableRows; r++) {
      const bg = r % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)';
      tableHtml += `<tr style="background: ${bg}; border-bottom: 1px solid rgba(255,255,255,0.1);">`;
      for (let c = 0; c < tableCols; c++) {
        tableHtml += `<td style="padding: 10px 14px; border: 1px solid rgba(255,255,255,0.1);">داده ردیف ${r + 1}</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table><p><br></p>`;

    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertHTML', false, tableHtml);
      handleContentChange();
    }
    setIsTableModalOpen(false);
  };

  // Insert Link
  const handleInsertLink = () => {
    if (!linkUrl) return;
    const cleanUrl = linkUrl.startsWith('http') || linkUrl.startsWith('#') ? linkUrl : `https://${linkUrl}`;
    const linkHtml = `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="color: #00ffcc; text-decoration: underline; font-weight: 600;">${linkText || cleanUrl}</a>`;
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertHTML', false, linkHtml);
      handleContentChange();
    }
    setLinkUrl('');
    setLinkText('');
    setIsLinkModalOpen(false);
  };

  // Insert Callout Box
  const handleInsertCallout = (type) => {
    const callouts = {
      info: {
        bg: 'rgba(6, 182, 212, 0.12)',
        border: '#06b6d4',
        title: 'ℹ️ نکته فنی مهم',
        desc: 'توضیحات تکمیلی و نکات کلیدی مربوط به این بخش را در اینجا یادداشت فرمایید.'
      },
      warning: {
        bg: 'rgba(245, 158, 11, 0.12)',
        border: '#f59e0b',
        title: '⚠️ توجه و احتیاط',
        desc: 'رعایت این نکته برای جلوگیری از نویز یا آسیب به مدار سخت‌افزاری الزامی است.'
      },
      success: {
        bg: 'rgba(16, 185, 129, 0.12)',
        border: '#10b981',
        title: '✅ نتیجه تایید شده',
        desc: 'تست‌های عملیاتی مدار با موفقیت انجام شده و پایداری عملکرد ثبت گردید.'
      },
      danger: {
        bg: 'rgba(239, 68, 68, 0.12)',
        border: '#ef4444',
        title: '⛔ هشدار ولتاژ و ایمنی',
        desc: 'حداکثر ولتاژ کاری نباید از مقدار مجاز فراتر رود.'
      }
    };
    const c = callouts[type] || callouts.info;
    const calloutHtml = `<div style="background: ${c.bg}; border-${direction === 'rtl' ? 'right' : 'left'}: 4px solid ${c.border}; padding: 14px 18px; border-radius: 10px; margin: 16px 0;">
      <strong style="color: ${c.border}; display: block; margin-bottom: 6px; font-size: 14px;">${c.title}</strong>
      <p style="margin: 0; color: #cbd5e1; font-size: 13px; line-height: 1.6;">${c.desc}</p>
    </div><p><br></p>`;

    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertHTML', false, calloutHtml);
      handleContentChange();
    }
    setIsCalloutModalOpen(false);
  };

  // Insert Special Symbols
  const handleInsertSymbol = (sym) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertText', false, sym);
      handleContentChange();
    }
    setIsSymbolsModalOpen(false);
  };

  // Find and Replace
  const handleReplaceAll = () => {
    if (!findQuery) return;
    if (viewMode === 'wysiwyg' && editorRef.current) {
      const regex = new RegExp(findQuery, 'gi');
      const updated = editorRef.current.innerHTML.replace(regex, replaceQuery);
      editorRef.current.innerHTML = updated;
      handleContentChange();
    } else {
      const regex = new RegExp(findQuery, 'gi');
      setContent((prev) => prev.replace(regex, replaceQuery));
    }
    alert(`تمام موارد «${findQuery}» با «${replaceQuery}» جایگزین شدند.`);
  };

  // Export File (DOC / HTML / TXT)
  const handleExport = (format) => {
    let textToExport = content;
    let mimeType = 'text/plain';
    let fileExt = 'txt';

    if (format === 'doc') {
      textToExport = `<!DOCTYPE html><html lang="${language}" dir="${direction}"><head><meta charset="utf-8"><title>${title}</title><style>body{font-family: Arial, sans-serif; line-height: 1.6; padding: 30px;}</style></head><body>${content}</body></html>`;
      mimeType = 'application/msword';
      fileExt = 'doc';
    } else if (format === 'html') {
      textToExport = `<!DOCTYPE html><html lang="${language}" dir="${direction}"><head><meta charset="utf-8"><title>${title}</title></head><body>${content}</body></html>`;
      mimeType = 'text/html';
      fileExt = 'html';
    }

    const blob = new Blob([textToExport], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fieldName || 'document'}_${Date.now()}.${fileExt}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save handler
  const handleSaveAndApply = () => {
    const finalContent = viewMode === 'wysiwyg' && editorRef.current ? editorRef.current.innerHTML : content;
    if (onSave) {
      onSave(finalContent);
    }
    setIsSavedRecently(true);
    setTimeout(() => {
      setIsSavedRecently(false);
      onClose();
    }, 400);
  };

  // Calculations for stats
  const plainText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;
  const charCount = plainText.length;
  const readTimeMin = Math.ceil(wordCount / 180);

  // Available Fonts
  const fonts = [
    { name: 'وزیرمتن (Vazirmatn)', value: 'Vazirmatn, sans-serif' },
    { name: 'شبنم (Shabnam)', value: 'Shabnam, sans-serif' },
    { name: 'ساحل (Sahel)', value: 'Sahel, sans-serif' },
    { name: 'ایران‌سنس (IRANSans)', value: 'IRANSans, sans-serif' },
    { name: 'تاهوما (Tahoma)', value: 'Tahoma, sans-serif' },
    { name: 'آریال (Arial)', value: 'Arial, sans-serif' },
    { name: 'تایمز (Times New Roman)', value: '"Times New Roman", serif' },
    { name: 'کنسول مهندسی (Consolas)', value: 'Consolas, monospace' },
    { name: 'کوریور (Courier New)', value: '"Courier New", monospace' }
  ];

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'];

  const engineeringSymbols = [
    'Ω', 'kΩ', 'MΩ', 'µF', 'nF', 'pF', 'µH', 'mH', 'V', 'mV', 'kV', 'A', 'mA', 'µA',
    'W', 'mW', 'Hz', 'kHz', 'MHz', 'GHz', '°C', '±', 'π', 'θ', 'λ', 'µ', 'σ', 'Δ',
    '⚡', '⚙️', '🔌', '📡', '🛡️', '🔬', '💡', '⚠️', '✅', '❌', '→', '←', '↔', '↑', '↓',
    '≤', '≥', '≈', '≠', '≡', '∑', '√', '∞', '∝', '∫'
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 animate-fadeIn">
      <div
        className={`relative w-full bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'fixed inset-2 h-[calc(100vh-16px)] z-[10000]' : 'max-w-6xl max-h-[92vh] h-[850px]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP WORD-STYLE TITLE BAR */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{title}</span>
                {fieldName && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 text-[11px] font-mono border border-slate-700">
                    {fieldName}
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${direction === 'rtl' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-indigo-950 text-indigo-400 border border-indigo-800'}`}>
                  {direction === 'rtl' ? 'فارسی (RTL)' : 'ENGLISH (LTR)'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick stats & action buttons */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-3 text-slate-400 text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <span>کلمات: <strong className="text-white">{wordCount}</strong></span>
              <span>کاراکترها: <strong className="text-white">{charCount}</strong></span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>~{readTimeMin} دقیقه</span>
              </span>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('wysiwyg')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === 'wysiwyg' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="ویرایشگر دیداری ورد"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">دیداری (ورد)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('source')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === 'source' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="مشاهده کد HTML / Markdown"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">سورس HTML</span>
              </button>
            </div>

            {/* Fullscreen button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title={isFullscreen ? 'خروج از تمام صفحه' : 'حالت تمام صفحه'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 hover:text-rose-400 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* WORD RIBBON / TOOLBAR (Visible in WYSIWYG Mode) */}
        {viewMode === 'wysiwyg' && (
          <div className="bg-slate-950/90 border-b border-slate-800 p-2 space-y-1.5 select-none">
            {/* ROW 1: Word File / Import / Clipboard / Formatting */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
              {/* Word & File Import */}
              <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
                <input
                  type="file"
                  ref={docxFileInputRef}
                  onChange={handleDocxImport}
                  accept=".docx,.txt,.md,.html"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => docxFileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 transition-colors"
                  title="وارد کردن مستقیم فایل ورد Word (.docx) یا متنی"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>ورود فایل Word</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.readText().then((text) => {
                      if (text) {
                        if (editorRef.current) {
                          editorRef.current.focus();
                          document.execCommand('insertText', false, text);
                          handleContentChange();
                        }
                      }
                    }).catch(() => {
                      alert('لطفاً متن را کپی کرده و با فشردن کلید Ctrl+V در صفحه جای‌گذاری نمایید.');
                    });
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700"
                  title="چسباندن متن از کلیپ‌بورد"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Paste</span>
                </button>
              </div>

              {/* History Undo / Redo */}
              <div className="flex items-center gap-0.5 px-1 border-l border-slate-800">
                <button
                  type="button"
                  onClick={() => executeCmd('undo')}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCmd('redo')}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Typography Font Family & Size */}
              <div className="flex items-center gap-1 px-1 border-l border-slate-800">
                <select
                  value={currentFont}
                  onChange={(e) => {
                    setCurrentFont(e.target.value);
                    executeCmd('fontName', e.target.value);
                  }}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {fonts.map((f, i) => (
                    <option key={i} value={f.value}>{f.name}</option>
                  ))}
                </select>

                <select
                  value={currentFontSize}
                  onChange={(e) => {
                    setCurrentFontSize(e.target.value);
                    executeCmd('fontSize', '3'); // standard base, formatted via styles
                  }}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {fontSizes.map((s, i) => (
                    <option key={i} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Format Headings Dropdown */}
              <div className="flex items-center gap-1 px-1 border-l border-slate-800">
                <select
                  onChange={(e) => executeCmd('formatBlock', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  defaultValue="p"
                >
                  <option value="p">پاراگراف عادی (Normal)</option>
                  <option value="h1">عنوان اصلی (Heading 1)</option>
                  <option value="h2">عنوان دوم (Heading 2)</option>
                  <option value="h3">عنوان سوم (Heading 3)</option>
                  <option value="h4">عنوان چهارم (Heading 4)</option>
                  <option value="blockquote">نقل‌قول (Quote)</option>
                  <option value="pre">بلوک کد فنی (Code)</option>
                </select>
              </div>

              {/* Formatting Toggles (Bold, Italic, Underline, Strikethrough, Code) */}
              <div className="flex items-center gap-0.5 px-1 border-l border-slate-800">
                <button
                  type="button"
                  onClick={() => executeCmd('bold')}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 font-bold"
                  title="ضخیم / Bold (Ctrl+B)"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCmd('italic')}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 italic"
                  title="مورب / Italic (Ctrl+I)"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCmd('underline')}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 underline"
                  title="خط زیرین / Underline (Ctrl+U)"
                >
                  <Underline className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCmd('strikeThrough')}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 line-through"
                  title="خط روی متن / Strikethrough"
                >
                  <Strikethrough className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCmd('subscript')}
                  className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 text-xs font-mono"
                  title="زیرنویس (X₂)"
                >
                  X₂
                </button>
                <button
                  type="button"
                  onClick={() => executeCmd('superscript')}
                  className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 text-xs font-mono"
                  title="بالانویس (X²)"
                >
                  X²
                </button>
              </div>

              {/* Text Color & Highlight Pickers */}
              <div className="flex items-center gap-1 px-1 border-l border-slate-800">
                <label className="flex items-center gap-1 px-1.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 cursor-pointer text-xs" title="رنگ متن">
                  <Palette className="w-3.5 h-3.5 text-cyan-400" />
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => {
                      setTextColor(e.target.value);
                      executeCmd('foreColor', e.target.value);
                    }}
                    className="w-4 h-4 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                </label>

                <label className="flex items-center gap-1 px-1.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 cursor-pointer text-xs" title="هایلایت متن">
                  <Highlighter className="w-3.5 h-3.5 text-amber-400" />
                  <input
                    type="color"
                    value={highlightColor === 'transparent' ? '#ffff00' : highlightColor}
                    onChange={(e) => {
                      setHighlightColor(e.target.value);
                      executeCmd('hiliteColor', e.target.value);
                    }}
                    className="w-4 h-4 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => executeCmd('removeFormat')}
                  className="p-1.5 rounded hover:bg-slate-800 text-rose-300 hover:text-rose-400"
                  title="پاک کردن فرمت‌ها و استایل‌ها"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ROW 2: Alignment, Direction, Lists, Tables, Symbols, Callouts, Export */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 pt-1 border-t border-slate-900">
              {/* Text Direction (RTL / LTR) */}
              <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setDirection('rtl');
                    if (editorRef.current) editorRef.current.dir = 'rtl';
                  }}
                  className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                    direction === 'rtl' ? 'bg-emerald-600 text-slate-950 font-black' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="راست‌به‌چپ (فارسی)"
                >
                  RTL راست
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDirection('ltr');
                    if (editorRef.current) editorRef.current.dir = 'ltr';
                  }}
                  className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                    direction === 'ltr' ? 'bg-indigo-600 text-white font-black' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="چپ‌به‌راست (English)"
                >
                  LTR چپ
                </button>
              </div>

              {/* Text Alignment */}
              <div className="flex items-center gap-0.5 px-1 border-l border-slate-800">
                <button
                  type="button"
                  onClick={() => executeCmd('justifyRight')}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                  title="راست‌چین"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCmd('justifyCenter')}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                  title="وسط‌چین"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCmd('justifyLeft')}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                  title="چپ‌چین"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCmd('justifyFull')}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                  title="تراز دو طرفه (Justify)"
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Lists & Indent */}
              <div className="flex items-center gap-0.5 px-1 border-l border-slate-800">
                <button
                  type="button"
                  onClick={() => executeCmd('insertUnorderedList')}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                  title="لیست بالت‌دار (نقطه‌ای)"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCmd('insertOrderedList')}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                  title="لیست شماره‌دار (عددی)"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCmd('indent')}
                  className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white text-xs"
                  title="افزایش تورفتگی"
                >
                  ⇥ تو
                </button>
                <button
                  type="button"
                  onClick={() => executeCmd('outdent')}
                  className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white text-xs"
                  title="کاهش تورفتگی"
                >
                  ⇤ بیرون
                </button>
              </div>

              {/* Insert Objects (Table, Link, Image, Callout, Symbols, Divider) */}
              <div className="flex items-center gap-1 px-1 border-l border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTableModalOpen(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
                  title="درج جدول استاندارد ورد"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>جدول</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700"
                  title="درج لینک / پیوند"
                >
                  <Link className="w-3.5 h-3.5" />
                  <span>لینک</span>
                </button>

                <input
                  type="file"
                  ref={imageUploadInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => imageUploadInputRef.current?.click()}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700"
                  title="درج تصویر در متن"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>تصویر</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCalloutModalOpen(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
                  title="درج کادر نکته / هشدار"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>کادر نکته</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSymbolsModalOpen(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700"
                  title="نمادهای مهندسی الکترونیک (Ω, µ, π, ⚡)"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>نمادها (Ω, ⚡)</span>
                </button>

                <button
                  type="button"
                  onClick={() => executeCmd('insertHorizontalRule')}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  title="خط جداکننده افقی"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Find & Replace / Export Dropdown */}
              <div className="flex items-center gap-1 mr-auto">
                <button
                  type="button"
                  onClick={() => setIsFindReplaceOpen(!isFindReplaceOpen)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  title="جستجو و جایگزینی کلمات"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>یافتن</span>
                </button>

                <div className="relative group">
                  <button
                    type="button"
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>خروجی</span>
                  </button>
                  <div className="absolute left-0 bottom-full mb-1 hidden group-hover:flex flex-col w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
                    <button
                      type="button"
                      onClick={() => handleExport('doc')}
                      className="px-3 py-2 text-right text-xs text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      خروجی فایل Word (.doc)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExport('html')}
                      className="px-3 py-2 text-right text-xs text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      خروجی فایل HTML
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExport('txt')}
                      className="px-3 py-2 text-right text-xs text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      خروجی متنی ساده (.txt)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FIND & REPLACE SUBBAR */}
        {isFindReplaceOpen && (
          <div className="bg-slate-950 border-b border-cyan-900/40 p-2.5 flex flex-wrap items-center gap-2 text-xs animate-fadeIn">
            <span className="text-cyan-400 font-bold">جستجو و جایگزینی:</span>
            <input
              type="text"
              placeholder="کلمه مورد جستجو..."
              value={findQuery}
              onChange={(e) => setFindQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 w-40 sm:w-56 focus:outline-none focus:border-cyan-500"
            />
            <input
              type="text"
              placeholder="جایگزین شود با..."
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 w-40 sm:w-56 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={handleReplaceAll}
              className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors"
            >
              جایگزینی همه
            </button>
            <button
              type="button"
              onClick={() => setIsFindReplaceOpen(false)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* MAIN EDITING WORKSPACE / CANVAS */}
        <div className="flex-1 bg-slate-950/60 overflow-y-auto p-4 sm:p-8 flex justify-center">
          {viewMode === 'wysiwyg' ? (
            /* WORD PAPER SHEET CONTAINER */
            <div
              className={`w-full max-w-4xl min-h-[500px] bg-slate-900 border border-slate-800/90 rounded-2xl p-6 sm:p-10 shadow-2xl focus:outline-none transition-all ${
                direction === 'rtl' ? 'text-right' : 'text-left'
              }`}
              dir={direction}
              style={{
                fontFamily: currentFont,
                color: '#f8fafc',
                lineHeight: 1.8,
              }}
            >
              <div
                ref={editorRef}
                contentEditable={!readOnly}
                onInput={handleContentChange}
                onPaste={handlePaste}
                className="prose prose-invert max-w-none min-h-[450px] outline-none text-slate-200 leading-relaxed space-y-4"
                style={{
                  minHeight: '450px',
                  fontFamily: currentFont,
                }}
                suppressContentEditableWarning
              />
            </div>
          ) : (
            /* SOURCE CODE EDITOR */
            <div className="w-full max-w-4xl flex flex-col space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>سورس کد HTML متن (می‌توانید کدهای HTML را مستقیماً ویرایش فرمایید):</span>
                <span>فرمت: Clean HTML / Markdown</span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                dir="ltr"
                rows={22}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 font-mono text-xs text-emerald-400 focus:outline-none focus:border-cyan-500 leading-relaxed shadow-inner resize-y"
              />
            </div>
          )}
        </div>

        {/* FOOTER BAR WITH SAVE & ACTION CONTROLS */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>پشتیبانی کامل از Copy/Paste از ورد، جداول، نمادهای مهندسی و عکس</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              انصراف
            </button>

            <button
              type="button"
              onClick={handleSaveAndApply}
              disabled={isSavedRecently}
              className="flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all scale-100 hover:scale-105 active:scale-95"
            >
              {isSavedRecently ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>اعمال شد!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-slate-950" />
                  <span>ذخیره و اعمال در فرم (Ctrl+S)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- SUB MODALS: LINK, TABLE, SYMBOLS, CALLOUTS --- */}

      {/* 1. LINK MODAL */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-[10010] flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Link className="w-4 h-4 text-cyan-400" />
                <span>درج پیوند اینترنتی (Link)</span>
              </h4>
              <button type="button" onClick={() => setIsLinkModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">متن نمایشی پیوند (اختیاری):</label>
                <input
                  type="text"
                  placeholder="مثال: دانلود دیتاشیت یا صفحه مقاله"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">آدرس اینترنتی (URL):</label>
                <input
                  type="text"
                  placeholder="https://example.com/paper.pdf"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  dir="ltr"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-slate-800"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950"
              >
                درج لینک
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. TABLE GENERATOR MODAL */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-[10010] flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-cyan-400" />
                <span>سازنده جدول استاندارد ورد</span>
              </h4>
              <button type="button" onClick={() => setIsTableModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">تعداد ردیف‌ها (Rows):</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">تعداد ستون‌ها (Columns):</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={tableHasHeader}
                onChange={(e) => setTableHasHeader(e.target.checked)}
                className="rounded text-cyan-500"
              />
              <span>شامل سطر سرستون (Header Row) رنگی و متمایز باشد</span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsTableModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-slate-800"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleInsertTable}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950"
              >
                درج جدول در سند
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SYMBOLS MODAL */}
      {isSymbolsModalOpen && (
        <div className="fixed inset-0 z-[10010] flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>نمادهای علمی، الکترونیک و تخصصی</span>
              </h4>
              <button type="button" onClick={() => setIsSymbolsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">برای درج در موقعیت مکان‌نما، روی نماد مورد نظر کلیک کنید:</p>

            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-64 overflow-y-auto p-1">
              {engineeringSymbols.map((sym, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleInsertSymbol(sym)}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-cyan-500/20 hover:border-cyan-500 border border-slate-800 text-sm font-mono text-cyan-300 hover:text-white transition-all text-center flex items-center justify-center shadow"
                >
                  {sym}
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsSymbolsModalOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-300 hover:text-white"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. CALLOUT MODAL */}
      {isCalloutModalOpen && (
        <div className="fixed inset-0 z-[10010] flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>انتخاب نوع کادر پیام / نکته (Callout Box)</span>
              </h4>
              <button type="button" onClick={() => setIsCalloutModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => handleInsertCallout('info')}
                className="w-full text-right p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 hover:border-cyan-400 text-cyan-200 transition-all flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">ℹ️</div>
                <div>
                  <strong className="block text-cyan-300 font-bold">کادر اطلاع‌رسانی و نکته فنی (Info)</strong>
                  <span className="text-[11px] text-slate-400">مناسب برای فرمول‌ها، رفرنس‌ها و توضیحات تکمیلی</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleInsertCallout('warning')}
                className="w-full text-right p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 hover:border-amber-400 text-amber-200 transition-all flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">⚠️</div>
                <div>
                  <strong className="block text-amber-300 font-bold">کادر هشدار و احتیاط (Warning)</strong>
                  <span className="text-[11px] text-slate-400">مناسب برای نکات نویز، گرما، محدودیت‌های مونتاژ PCB</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleInsertCallout('success')}
                className="w-full text-right p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 hover:border-emerald-400 text-emerald-200 transition-all flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">✅</div>
                <div>
                  <strong className="block text-emerald-300 font-bold">کادر تایید و موفقیت (Success)</strong>
                  <span className="text-[11px] text-slate-400">مناسب برای نتایج تست، استانداردها و تاییدیه کارکرد</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleInsertCallout('danger')}
                className="w-full text-right p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 hover:border-rose-400 text-rose-200 transition-all flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">⛔</div>
                <div>
                  <strong className="block text-rose-300 font-bold">کادر خطر و حساسیت بحرانی (Critical)</strong>
                  <span className="text-[11px] text-slate-400">مناسب برای حداکثر ولتاژ و موارد خطرساز برقی</span>
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCalloutModalOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-300 hover:text-white"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
