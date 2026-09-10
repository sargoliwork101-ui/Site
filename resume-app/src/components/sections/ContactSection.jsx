import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { formatNum, toEnglishDigits, toPersianDigits } from '../../utils/numberHelper';
import {
  Send,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileSpreadsheet,
  Download,
  AlertCircle
} from 'lucide-react';
import { Github, Linkedin } from '../common/BrandIcons';
import { sanitizeText, validateEmail, contactRateLimiter, triggerSafeDownload } from '../../utils/security';
import { serverContact } from '../../utils/serverAuth';

export const ContactSection = () => {
  const { data, currentTemplate, addMessage, showToast, adminSecurity, backend } = useData();
  const info = data?.personalInfo || {};
  const isFa = data?.siteConfig?.language === 'fa';
  const primaryColor = currentTemplate?.colors?.primary || '#00ffcc';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: isFa ? 'طراحی برد جدید (PCB Design)' : 'New Hardware PCB Project',
    message: '',
    website_bot_trap: '', // Invisible honeypot
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Honeypot check for spambots
    if (formData.website_bot_trap && formData.website_bot_trap.trim() !== '') {
      console.warn('Bot detected via honeypot.');
      setSubmitted(true);
      return;
    }

    // 2. Rate Limiting Check
    if (!contactRateLimiter.canAttempt()) {
      const remainingSec = contactRateLimiter.getRemainingCooldownSeconds();
      showToast(
        isFa
          ? `لطفاً ${remainingSec} ثانیه قبل از ارسال پیام بعدی صبر کنید.`
          : `Please wait ${remainingSec}s before sending another message.`,
        'error'
      );
      return;
    }

    // 3. Validation
    const cleanName = sanitizeText(formData.name);
    const cleanEmail = formData.email.trim();
    const cleanCompany = sanitizeText(formData.company);
    const cleanSubject = sanitizeText(formData.subject);
    const cleanMessage = sanitizeText(formData.message);

    if (!cleanName || !cleanEmail || !cleanMessage) {
      showToast(
        isFa ? 'لطفاً تمام فیلدهای ضروری را تکمیل فرمایید.' : 'Please fill all required fields.',
        'error'
      );
      return;
    }

    if (!validateEmail(cleanEmail)) {
      showToast(
        isFa ? 'فرمت آدرس ایمیل وارد شده نامعتبر است.' : 'Invalid email address format.',
        'error'
      );
      return;
    }

    setIsSubmitting(true);
    contactRateLimiter.recordAttempt();

    const recipientEmail = adminSecurity?.recoveryEmail || data.personalInfo?.email || 'arash.taheri.hardware@gmail.com';

    // 1. Save directly to local Admin Panel Inbox
    addMessage({
      name: cleanName,
      email: cleanEmail,
      company: cleanCompany,
      subject: cleanSubject,
      message: cleanMessage,
    });

    // 2. Email the admin: prefer OUR OWN server (private + reliable),
    // fall back to the FormSubmit relay only without a backend.
    // (Contact messages only — OTP codes NEVER go through third parties.)
    const dispatchEmail = async () => {
      if (backend?.available) {
        try {
          const r = await serverContact({
            name: cleanName,
            email: cleanEmail,
            company: cleanCompany,
            subject: cleanSubject,
            message: cleanMessage,
            website_bot_trap: '',
          });
          if (r && r.ok) return; // delivered by our own host
          console.warn('Server mail failed, trying fallback:', r && r.error);
        } catch (err) {
          console.warn('Server mail error, trying fallback:', err);
        }
      }
      try {
        await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            _subject: `⚡ پیام جدید از سایت پورتفولیو: ${cleanSubject}`,
            'نام فرستنده': cleanName,
            'ایمیل فرستنده': cleanEmail,
            'سازمان / شرکت': cleanCompany || 'شخصی',
            'موضوع': cleanSubject,
            'متن پیام': cleanMessage,
            _template: 'table',
            _captcha: 'false',
          }),
        });
      } catch (err) {
        console.warn('Fallback email dispatch error:', err);
      }
    };
    dispatchEmail();

    setTimeout(async () => {
      setIsSubmitting(false);
      setSubmitted(true);

      try {
        const confettiModule = await import('canvas-confetti');
        const confetti = confettiModule.default || confettiModule;
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {}

      setFormData({
        name: '',
        email: '',
        company: '',
        subject: isFa ? 'طراحی برد جدید (PCB Design)' : 'New Hardware PCB Project',
        message: '',
        website_bot_trap: '',
      });
    }, 400);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(info.email);
    showToast(isFa ? 'آدرس ایمیل با موفقیت کپی شد.' : 'Email copied to clipboard.');
  };

  const downloadVCard = () => {
    const vcardContent = `BEGIN:VCARD
VERSION:3.0
FN:${isFa ? info.fullNameFa : info.fullNameEn}
TITLE:${isFa ? info.titleFa : info.titleEn}
EMAIL:${info.email}
TEL:${info.phone}
URL:${info.website || 'https://arashtaheri.dev'}
NOTE:Senior Hardware & Embedded Systems Engineer
END:VCARD`;

    const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8;' });
    triggerSafeDownload(blob, `${isFa ? 'Arash_Taheri' : 'Contact_Card'}.vcf`);
    showToast(isFa ? 'کارت ویزیت الکترونیکی (.vcf) دانلود شد.' : 'vCard downloaded.');
  };

  return (
    <section id="contact" className="py-20 relative">
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
            <Send className="w-3.5 h-3.5" />
            <span>{isFa ? 'راه‌های ارتباطی و مشاوره تخصصی' : 'Get In Touch'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {isFa ? 'تماس مستقیم و ثبت سفارش پروژه' : 'Direct Contact & Inquiries'}
          </h2>

          <p className="text-slate-400 text-sm sm:text-base">
            {isFa
              ? 'جهت مشاوره طراحی سخت‌افزار، بررسی شماتیک و استک‌آپ لایه‌ها، یا استخدام و همکاری پروژه‌ای پیام بگذارید.'
              : 'Feel free to reach out for high-speed PCB consultations, embedded firmware architecture, or commercial projects.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Info Cards */}
          <div className="lg:col-span-5 space-y-4">
            {/* Email Card */}
            <div className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">{isFa ? 'ایمیل مستقیم' : 'Direct Email'}</div>
                  <div className="text-xs sm:text-sm font-mono text-white font-bold break-all">{info.email}</div>
                </div>
              </div>
              <button
                onClick={copyEmail}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title={isFa ? 'کپی ایمیل' : 'Copy Email'}
                aria-label="Copy Email"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {/* Phone & Telegram Card */}
            <div className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">{isFa ? 'تلفن و پیام‌رسان' : 'Phone & Telegram'}</div>
                  <div className="text-xs sm:text-sm font-mono text-white font-bold break-all">{isFa ? info.phone : toEnglishDigits(info.phone)}</div>
                </div>
              </div>
              <a
                href={info.telegram}
                target="_blank"
                rel="noopener noreferrer"
                title={isFa ? 'ارسال پیام مستقیم در تلگرام' : 'Send message via Telegram'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isFa ? 'تلگرام' : 'Telegram'}</span>
              </a>
            </div>

            {/* Location Card */}
            <div className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">{isFa ? 'موقعیت مکانی' : 'Location & Availability'}</div>
                <div className="text-xs sm:text-sm text-white font-semibold">{isFa ? info.locationFa : info.locationEn}</div>
              </div>
            </div>

            {/* Social & vCard Card */}
            <div className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <a
                  href={info.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="GitHub Profile"
                  aria-label="GitHub Profile"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href={info.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="LinkedIn Profile"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>

              <button
                type="button"
                onClick={downloadVCard}
                title={isFa ? 'ذخیره مشخصات و کارت ویزیت در گوشی یا کامپیوتر' : 'Save contact card to phone / PC (.vcf)'}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isFa ? 'دانلود کارت ویزیت (vCard)' : 'Download vCard'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Direct Message Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl relative overflow-hidden">
              {submitted ? (
                <div className="py-12 text-center space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {isFa ? 'پیام شما با موفقیت ارسال شد!' : 'Message Sent Successfully!'}
                  </h3>
                  <p className="text-slate-400 text-sm max-w-md mx-auto">
                    {isFa
                      ? 'با تشکر از تماس شما. پیام مستقیماً در پنل مدیریت ثبت گردید و به زودی به آدرس ایمیل شما پاسخ داده خواهد شد.'
                      : 'Thank you for reaching out. Your message has been logged securely, and I will get back to you shortly.'}
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors mt-2"
                  >
                    {isFa ? 'ارسال پیام جدید' : 'Send Another Message'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Invisible Honeypot Field for Spambots */}
                  <input
                    type="text"
                    name="website_bot_trap"
                    value={formData.website_bot_trap}
                    onChange={(e) => setFormData({ ...formData, website_bot_trap: e.target.value })}
                    style={{ display: 'none', position: 'absolute', opacity: 0, zIndex: -1 }}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {isFa ? 'نام و نام خانوادگی' : 'Full Name'} <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={isFa ? 'مثلاً: علیرضا محمدی' : 'e.g. Alex Johnson'}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {isFa ? 'آدرس ایمیل' : 'Email Address'} <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@company.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-left font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {isFa ? 'شرکت / سازمان (اختیاری)' : 'Company / Organization'}
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder={isFa ? 'نام شرکت یا مجموعه شما' : 'Company or Agency'}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {isFa ? 'موضوع درخواست' : 'Inquiry Topic'}
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                      >
                        <option value={isFa ? 'طراحی برد جدید (PCB Design)' : 'New Hardware PCB Design'}>
                          {isFa ? 'طراحی برد جدید (PCB Design)' : 'New Hardware PCB Design'}
                        </option>
                        <option value={isFa ? 'بررسی شماتیک و رفع عیب فرکانس بالا' : 'High-Speed Signal Integrity & Schematic Review'}>
                          {isFa ? 'بررسی شماتیک و رفع عیب فرکانس بالا' : 'High-Speed Signal Integrity & Schematic Review'}
                        </option>
                        <option value={isFa ? 'توسعه فریمور و RTOS' : 'Embedded Firmware & RTOS Development'}>
                          {isFa ? 'توسعه فریمور و RTOS' : 'Embedded Firmware & RTOS Development'}
                        </option>
                        <option value={isFa ? 'پیشنهاد شغلی / همکاری تمام وقت' : 'Career / Full-Time Engineering Opportunity'}>
                          {isFa ? 'پیشنهاد شغلی / همکاری تمام وقت' : 'Career / Full-Time Engineering Opportunity'}
                        </option>
                        <option value={isFa ? 'سایر موارد و مشاوره' : 'Other Consultations'}>
                          {isFa ? 'سایر موارد و مشاوره' : 'Other Consultations'}
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isFa ? 'متن پیام' : 'Message Details'} <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={
                        isFa
                          ? 'شرح پروژه، نیازهای فنی یا سوالات خود را بنویسید...'
                          : 'Describe your project scope, technical specifications, or questions...'
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl font-bold text-sm text-slate-950 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-xl flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: primaryColor,
                      boxShadow: `0 0 25px ${primaryColor}40`,
                    }}
                  >
                    {isSubmitting ? (
                      <span className="animate-spin w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{isFa ? 'ارسال مستقیم پیام' : 'Send Message Now'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
