/**
 * ============================================================================
 * EMAIL HELPER — real transactional email delivery for a 100% static site
 * ============================================================================
 *
 * The site has no backend (pure static hosting), so OTP emails are delivered
 * through the free FormSubmit AJAX API — the same provider the contact form
 * already uses. No API key or server code is required.
 *
 * IMPORTANT FormSubmit behavior:
 * - The FIRST-EVER submission to a recipient address triggers an activation
 *   email ("Activate your form") to that inbox. Real delivery starts only
 *   AFTER the owner clicks the activation link. This helper detects that
 *   state and reports `needsActivation: true` so the UI can guide the user.
 *
 * @module emailHelper
 */

const FORMSUBMIT_AJAX = 'https://formsubmit.co/ajax/';
const REQUEST_TIMEOUT_MS = 15000;

/**
 * Send a 6-digit OTP code to an email address.
 *
 * @param {Object} args
 * @param {string} args.to - Recipient email address
 * @param {string} args.otp - 6-digit code
 * @param {'reset'|'verify'} [args.purpose='reset'] - 'reset' = password recovery, 'verify' = recovery-email activation
 * @returns {Promise<{sent: boolean, needsActivation?: boolean, error?: string}>}
 */
export async function sendOtpEmail({ to, otp, purpose = 'reset' }) {
  const cleanTo = (to || '').trim();
  const cleanOtp = (otp || '').trim();
  if (!cleanTo || !cleanOtp) {
    return { sent: false, error: 'missing_params' };
  }

  const isReset = purpose !== 'verify';
  const subject = isReset
    ? `🔐 کد بازیابی رمز عبور پنل مدیریت: ${cleanOtp}`
    : `✅ کد تایید ایمیل بازیابی پنل مدیریت: ${cleanOtp}`;

  const guide = isReset
    ? 'این کد را در پنجره بازیابی رمز عبور وارد کنید تا رمز جدید تعیین شود. اگر شما این درخواست را ثبت نکرده‌اید، این ایمیل را نادیده بگیرید.'
    : 'این کد را در پنل مدیریت (بخش امنیت و رمز عبور) وارد کنید تا ایمیل بازیابی شما تایید و فعال شود.';

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let res;
    try {
      res = await fetch(`${FORMSUBMIT_AJAX}${encodeURIComponent(cleanTo)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: subject,
          _template: 'table',
          _captcha: 'false',
          '🔐 کد تایید ۶ رقمی': cleanOtp,
          '⏳ مدت اعتبار': '۵ دقیقه',
          '📝 راهنما': guide,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    const text = await res.text().catch(() => '');

    // First submission to a new address → FormSubmit asks for activation.
    // Emails are NOT delivered until the owner clicks the activation link.
    if (/activat|confirm your email|verify your email/i.test(text)) {
      return { sent: false, needsActivation: true };
    }

    if (!res.ok) {
      return { sent: false, error: `http_${res.status}` };
    }

    try {
      const data = JSON.parse(text);
      if (data && typeof data.success === 'string' && /activat|confirm|verif/i.test(data.success)) {
        return { sent: false, needsActivation: true };
      }
    } catch {
      /* plain-text success response → treat as sent */
    }

    return { sent: true };
  } catch (err) {
    if (err && err.name === 'AbortError') {
      return { sent: false, error: 'timeout' };
    }
    return { sent: false, error: 'network' };
  }
}
