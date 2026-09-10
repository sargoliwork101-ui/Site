<?php
/**
 * ============================================================================
 * MAILER — UTF-8 Persian emails via PHP mail() (your OWN host, no 3rd party)
 * ============================================================================
 * The OTP code is ONLY ever inside this email + server memory. No external
 * service ever sees it.
 */

require_once __DIR__ . '/config.php';

/** Is PHP mail() usable on this host? */
function mail_available() {
  if (!function_exists('mail')) return false;
  $disabled = ini_get('disable_functions');
  if (is_string($disabled) && stripos($disabled, 'mail') !== false) return false;
  return true;
}

/** Sender address: configured MAIL_FROM or auto noreply@<host>. */
function mail_from_address() {
  if (MAIL_FROM !== null && valid_email(MAIL_FROM)) return MAIL_FROM;
  $host = strtolower((string)($_SERVER['HTTP_HOST'] ?? ''));
  $host = preg_replace('/:\d+$/', '', $host); // strip port
  if (!is_string($host) || !preg_match('/^[a-z0-9.-]+\.[a-z]{2,}$/', $host)) {
    $host = 'localhost';
  }
  return 'noreply@' . $host;
}

/** RFC-2047 encode a UTF-8 subject (no mbstring needed). */
function mail_encode_subject($subject) {
  $clean = str_replace(array("\r", "\n"), '', (string)$subject);
  return '=?UTF-8?B?' . base64_encode($clean) . '?=';
}

/**
 * Send a multipart (text + HTML) email.
 * @return array [sent(bool), errorOrNull]
 */
function send_html_mail($to, $subject, $htmlBody, $textBody = '', $replyTo = null) {
  if (!valid_email($to)) return array(false, 'invalid_email');
  if (!mail_available()) return array(false, 'mail_disabled');

  $from = mail_from_address();
  try {
    $boundary = '=_' . bin2hex(random_bytes(12));
  } catch (Exception $e) {
    return array(false, 'random_failed');
  }

  $headers = array(
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
    'From: ' . $from,
    'X-Mailer: resume-api/' . API_VERSION,
  );
  if ($replyTo !== null && valid_email($replyTo)) {
    $headers[] = 'Reply-To: ' . trim($replyTo);
  }

  $eol = "\r\n";
  $body = '';
  $body .= '--' . $boundary . $eol;
  $body .= 'Content-Type: text/plain; charset=UTF-8' . $eol;
  $body .= 'Content-Transfer-Encoding: 8bit' . $eol . $eol;
  $body .= ($textBody !== '' ? $textBody : ' ') . $eol;
  $body .= '--' . $boundary . $eol;
  $body .= 'Content-Type: text/html; charset=UTF-8' . $eol;
  $body .= 'Content-Transfer-Encoding: 8bit' . $eol . $eol;
  $body .= $htmlBody . $eol;
  $body .= '--' . $boundary . '--' . $eol;

  // Try with envelope sender (-f) first (better SPF alignment), then plain.
  $params = '-f' . $from;
  $sent = @mail($to, mail_encode_subject($subject), $body, implode($eol, $headers), $params);
  if (!$sent) {
    $sent = @mail($to, mail_encode_subject($subject), $body, implode($eol, $headers));
  }
  return $sent ? array(true, null) : array(false, 'mail_failed');
}

/** Persian OTP email (password recovery OR email verification). */
function send_otp_mail($to, $code, $purpose = 'reset') {
  $code = (string)$code;
  $isReset = ($purpose !== 'verify');
  $subject = $isReset
    ? 'کد بازیابی رمز عبور پنل مدیریت: ' . $code
    : 'کد تایید ایمیل بازیابی پنل مدیریت: ' . $code;

  $title = $isReset ? '🔐 کد بازیابی رمز عبور' : '✅ کد تایید ایمیل بازیابی';
  $guide = $isReset
    ? 'این کد را در پنجره «فراموشی رمز عبور» وارد کنید تا رمز جدید تعیین شود. اگر شما این درخواست را ثبت نکرده‌اید، این ایمیل را نادیده بگیرید.'
    : 'این کد را در پنل مدیریت (بخش امنیت و رمز عبور) وارد کنید تا ایمیل بازیابی شما تایید و فعال شود.';

  $html = '<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#0b0f19;color:#f1f5f9;padding:32px;line-height:2;">'
    . '<div style="max-width:520px;margin:0 auto;background:#111827;border:1px solid #1e293b;border-radius:16px;padding:28px;text-align:center;">'
    . '<h2 style="margin:0 0 8px;color:#22d3ee;">' . $title . '</h2>'
    . '<p style="color:#94a3b8;font-size:13px;">' . $guide . '</p>'
    . '<div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#00ffcc;background:#020617;border:1px dashed #22d3ee;border-radius:12px;padding:14px 8px 14px 20px;margin:18px 0;" dir="ltr">' . htmlspecialchars($code, ENT_QUOTES, 'UTF-8') . '</div>'
    . '<p style="color:#f59e0b;font-size:13px;">⏳ این کد فقط ۵ دقیقه اعتبار دارد و حداکثر ۵ بار می‌توانید آن را وارد کنید.</p>'
    . '<p style="color:#64748b;font-size:12px;">این ایمیل به صورت خودکار از طرف سایت شما ارسال شده است.</p>'
    . '</div></div>';

  $text = $title . "\n\n" . 'کد تایید ۶ رقمی: ' . $code . "\n" . 'اعتبار: ۵ دقیقه' . "\n\n" . $guide;

  return send_html_mail($to, $subject, $html, $text);
}

/** Contact-form message forwarded to the admin. */
function send_contact_mail($to, $name, $email, $company, $subject, $message) {
  $esc = function ($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); };
  $subjectLine = '⚡ پیام جدید از سایت: ' . $subject;

  $row = function ($k, $v) use ($esc) {
    return '<tr><td style="padding:8px 12px;color:#94a3b8;font-size:13px;white-space:nowrap;">' . $esc($k)
      . '</td><td style="padding:8px 12px;color:#f1f5f9;font-size:13px;">' . nl2br($esc($v)) . '</td></tr>';
  };

  $html = '<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#0b0f19;color:#f1f5f9;padding:32px;line-height:2;">'
    . '<div style="max-width:560px;margin:0 auto;background:#111827;border:1px solid #1e293b;border-radius:16px;padding:24px;">'
    . '<h2 style="margin:0 0 12px;color:#22d3ee;">⚡ پیام جدید از فرم تماس سایت</h2>'
    . '<table style="width:100%;border-collapse:collapse;">'
    . $row('نام فرستنده', $name)
    . $row('ایمیل فرستنده', $email)
    . $row('سازمان / شرکت', ($company !== '' ? $company : 'شخصی'))
    . $row('موضوع', $subject)
    . $row('متن پیام', $message)
    . '</table></div></div>';

  $text = 'پیام جدید از فرم تماس سایت' . "\n\n"
    . 'نام: ' . $name . "\n"
    . 'ایمیل: ' . $email . "\n"
    . 'شرکت: ' . ($company !== '' ? $company : 'شخصی') . "\n"
    . 'موضوع: ' . $subject . "\n\n" . $message;

  return send_html_mail($to, $subjectLine, $html, $text, $email);
}
