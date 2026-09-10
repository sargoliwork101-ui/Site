import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { sanitizeText, validateEmail, contactRateLimiter } from '../../utils/security';
import { useReveal } from '../theme/Icons';

/**
 * Contact page — ported from the site (website/views/contact.php):
 * form card + channels info card. Keeps the app's security layer
 * (honeypot anti-spam + rate limiting + sanitization + admin inbox + email).
 */
export const ContactPage = () => {
  const { data, addMessage, showToast, adminSecurity } = useData();
  const info = data?.personalInfo || {};
  const isFa = data?.siteConfig?.language === 'fa';

  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
    website_hp: '', // invisible honeypot
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null); // {type: ok|warn|err, msg}

  const socials = [
    { label: 'GitHub', url: info.github },
    { label: 'LinkedIn', url: info.linkedin },
    { label: 'ORCID', url: info.orcid },
    { label: 'Scholar', url: info.scholar },
    { label: 'Telegram', url: info.telegram },
  ].filter((s) => s.url);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Honeypot — pretend success for bots
    if (form.website_hp && form.website_hp.trim() !== '') {
      setAlert({ type: 'ok', msg: isFa ? '✅ پیام شما با موفقیت ارسال شد.' : '✅ Your message was sent successfully.' });
      return;
    }

    // 2. Rate limiting
    if (!contactRateLimiter.canAttempt()) {
      setAlert({
        type: 'warn',
        msg: isFa
          ? '⏳ درخواست‌های شما زیاد بود؛ لطفاً چند دقیقه صبر کنید و دوباره امتحان کنید.'
          : '⏳ Too many requests; please wait a few minutes and try again.',
      });
      return;
    }

    // 3. Validation
    const cleanName = sanitizeText(form.name);
    const cleanEmail = form.email.trim();
    const cleanMessage = sanitizeText(form.message);

    if (!cleanName || !cleanEmail || !cleanMessage) {
      setAlert({
        type: 'err',
        msg: isFa ? '❌ لطفاً فیلدها را کامل و درست پر کنید.' : '❌ Please fill all fields correctly.',
      });
      return;
    }
    if (!validateEmail(cleanEmail)) {
      setAlert({
        type: 'err',
        msg: isFa ? '❌ ایمیل معتبر وارد کنید.' : '❌ Please enter a valid email address.',
      });
      return;
    }

    setIsSubmitting(true);

    // Save to the admin inbox (the context applies rate limiting itself)
    const res = addMessage({
      name: cleanName,
      email: cleanEmail,
      company: '',
      subject: isFa ? 'پیام از فرم تماس سایت' : 'Message from the website contact form',
      message: cleanMessage,
    });

    if (res && res.success === false && res.error === 'rate_limited') {
      setAlert({
        type: 'warn',
        msg: isFa
          ? '⏳ درخواست‌های شما زیاد بود؛ لطفاً چند دقیقه صبر کنید و دوباره امتحان کنید.'
          : '⏳ Too many requests; please wait a few minutes and try again.',
      });
      setIsSubmitting(false);
      return;
    }

    // Best-effort transactional email to the admin
    const recipientEmail = adminSecurity?.recoveryEmail || info.email || '';
    if (recipientEmail) {
      try {
        fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            _subject: `⚡ پیام جدید از سایت: ${cleanName}`,
            'نام فرستنده': cleanName,
            'ایمیل فرستنده': cleanEmail,
            'متن پیام': cleanMessage,
            _template: 'table',
          }),
        }).catch((err) => console.warn('Background email dispatch error:', err));
      } catch (err) {
        /* ignore */
      }
    }

    setAlert({
      type: 'ok',
      msg: isFa
        ? '✅ پیام شما با موفقیت ارسال شد؛ به‌زودی پاسخ می‌دهم.'
        : '✅ Your message was sent successfully; I will reply soon.',
    });
    setForm({ name: '', email: '', message: '', website_hp: '' });
    setIsSubmitting(false);
    showToast(isFa ? 'پیام در صندوق پیام‌های پنل مدیریت ذخیره شد.' : 'Message saved to the admin inbox.');
  };

  useReveal([isFa]);

  return (
    <div className="page-enter">
      <section className="page-hero">
        <div className="container">
          <span className="section-tag">Contact</span>
          <h1>{isFa ? 'تماس با من' : 'Contact Me'}</h1>
          <p className="page-sub">{isFa ? 'برای همکاری، مشاوره یا هر سؤالی پیام دهید' : 'For collaboration, consulting or any question — drop me a message'}</p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-grid">
          {/* Form card */}
          <div className="card contact-form-card reveal">
            {alert && <div className={`alert ${alert.type === 'ok' ? 'ok' : alert.type === 'warn' ? 'warn' : 'err'}`}>{alert.msg}</div>}
            <form onSubmit={handleSubmit}>
              <input type="text" name="website_hp" className="hp-field" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website_hp} onChange={set('website_hp')} />
              <label>
                {isFa ? 'نام و نام خانوادگی' : 'Full Name'}
                <input className="input" type="text" required placeholder={isFa ? 'نام شما' : 'Your name'} value={form.name} onChange={set('name')} />
              </label>
              <label>
                {isFa ? 'ایمیل' : 'Email'}
                <input className="input in-ltr-start" type="email" required placeholder="you@example.com" value={form.email} onChange={set('email')} dir="ltr" />
              </label>
              <label>
                {isFa ? 'پیام' : 'Message'}
                <textarea className="input" rows="6" required placeholder={isFa ? 'پیام خود را بنویسید...' : 'Write your message...'} value={form.message} onChange={set('message')} />
              </label>
              <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (isFa ? 'در حال ارسال...' : 'Sending...') : isFa ? 'ارسال پیام' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Channels card */}
          <aside className="info-card card contact-info reveal">
            <h3>{isFa ? 'راه‌های ارتباطی' : 'Contact Channels'}</h3>
            <ul>
              {info.email && (
                <li>
                  <span className="ico">✉️</span>
                  <bdi dir="ltr">{info.email}</bdi>
                </li>
              )}
              {info.phone && (
                <li>
                  <span className="ico">📞</span>
                  <bdi dir="ltr">{info.phone}</bdi>
                </li>
              )}
              {(isFa ? info.locationFa : info.locationEn) && (
                <li>
                  <span className="ico">📍</span>
                  {isFa ? info.locationFa : info.locationEn}
                </li>
              )}
            </ul>
            {socials.length > 0 && (
              <div className="socials">
                {socials.map((s) => (
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
};
