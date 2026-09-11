<?php
/**
 * ============================================================================
 * MAILER — UTF-8 Persian emails via PHP mail() (your OWN host, no 3rd party)
 * ============================================================================
 * The OTP code is ONLY ever inside this email + server memory. No external
 * service ever sees it.
 */

/**
 * ── فارسی ──
 * ارسال ایمیل فارسی (UTF-8): اول صندوق SMTP پنل (اگه تنظیم شده باشه)، وگرنه
 * mail() خود هاست. کد OTP فقط داخل همین ایمیله و هیچ‌وقت لاگ/نمایش داده
 * نمی‌شه. ⚠️ برای دیباگ، بدنه ایمیل حاوی کد رو error_log نکن.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/store.php'; // smtp_get_config() persists to api/data/smtp.json (0600)

/**
 * NOTIFICATION SMTP — the admin's own mailbox (host/user/pass) managed from
 * the panel (Settings → Security). Stored server-side ONLY, file 0600, never
 * committed to git, never sent to the browser except masked (see auth.php).
 */
function smtp_defaults() {
  return array(
    'enabled' => false,
    'host' => '',
    'port' => 587,
    'encryption' => 'starttls', // 'starttls' | 'smtps' | 'none'
    'username' => '',
    'password' => '',           // stored as-is (file is 0600 + .htaccess-denied)
    'from' => '',               // empty = username
    'verifyTls' => true,
  );
}

function smtp_get_config() {
  $raw = store_read('smtp', array());
  $cfg = smtp_defaults();
  if (is_array($raw)) {
    foreach ($cfg as $k => $v) {
      if (array_key_exists($k, $raw)) $cfg[$k] = $raw[$k];
    }
  }
  $cfg['enabled'] = !empty($cfg['enabled']);
  $cfg['port'] = max(1, min(65535, (int)$cfg['port']));
  if (!in_array($cfg['encryption'], array('starttls', 'smtps', 'none'), true)) {
    $cfg['encryption'] = 'starttls';
  }
  $cfg['verifyTls'] = !isset($cfg['verifyTls']) || !empty($cfg['verifyTls']);
  foreach (array('host', 'username', 'password', 'from') as $k) {
    $cfg[$k] = (string)$cfg[$k];
  }
  return $cfg;
}

function smtp_configured($cfg = null) {
  if ($cfg === null) $cfg = smtp_get_config();
  return !empty($cfg['enabled'])
    && trim($cfg['host']) !== ''
    && trim($cfg['username']) !== ''
    && (string)$cfg['password'] !== '';
}

/** Is ANY mail channel usable (SMTP account or PHP mail())? */
function mail_available() {
  if (smtp_configured()) return true;
  if (!function_exists('mail')) return false;
  $disabled = ini_get('disable_functions');
  if (is_string($disabled) && stripos($disabled, 'mail') !== false) return false;
  return true;
}

/** Sender address: SMTP account first, else MAIL_FROM, else noreply@<host>. */
function mail_from_address() {
  $smtp = smtp_get_config();
  if (smtp_configured($smtp)) {
    if (valid_email($smtp['from'])) return $smtp['from'];
    if (valid_email($smtp['username'])) return $smtp['username'];
  }
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
 * Minimal dependency-free SMTP client (AUTH LOGIN + STARTTLS/SMTPS).
 * Used ONLY when the admin configured a notification mailbox in the panel.
 * @return array [sent(bool), errorOrNull]
 */
function smtp_send($to, $subject, $htmlBody, $textBody, $replyTo, $cfg) {
  if (!valid_email($to)) return array(false, 'invalid_email');
  $host = trim((string)$cfg['host']);
  $port = max(1, min(65535, (int)$cfg['port']));
  $enc = (string)$cfg['encryption'];
  $user = (string)$cfg['username'];
  $pass = (string)$cfg['password'];
  $from = valid_email($cfg['from']) ? (string)$cfg['from'] : $user;
  if ($host === '' || $user === '' || $pass === '' || !valid_email($from)) {
    return array(false, 'smtp_not_configured');
  }

  $remote = ($enc === 'smtps' ? 'ssl://' : 'tcp://') . $host . ':' . $port;
  $verify = !isset($cfg['verifyTls']) || !empty($cfg['verifyTls']);
  $ctx = stream_context_create(array('ssl' => array(
    'verify_peer' => $verify,
    'verify_peer_name' => $verify,
    'allow_self_signed' => !$verify,
  )));
  $fp = @stream_socket_client($remote, $errno, $errstr, 12, STREAM_CLIENT_CONNECT, $ctx);
  if (!$fp) return array(false, 'smtp_connect');
  @stream_set_timeout($fp, 12);

  // Read one (possibly multiline) SMTP reply.
  $read = function () use ($fp) {
    $data = '';
    for ($i = 0; $i < 20; $i++) {
      $line = @fgets($fp, 1024);
      if ($line === false) break;
      $data .= $line;
      if (strlen($line) < 4 || $line[3] === ' ') break;
    }
    return $data;
  };
  $say = function ($cmd) use ($fp, $read) {
    if ($cmd !== null) @fwrite($fp, $cmd . "\r\n");
    return $read();
  };
  $code = function ($resp) { return (int)substr(trim((string)$resp), 0, 3); };

  $fail = function ($err) use ($fp, $say) {
    $say('QUIT');
    @fclose($fp);
    return array(false, $err);
  };

  if ($code($read()) !== 220) return $fail('smtp_greet');
  if ($code($say('EHLO localhost')) !== 250) return $fail('smtp_ehlo');
  if ($enc === 'starttls') {
    if ($code($say('STARTTLS')) !== 220) return $fail('smtp_starttls');
    if (!@stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
      return $fail('smtp_tls');
    }
    if ($code($say('EHLO localhost')) !== 250) return $fail('smtp_ehlo');
  }
  if ($code($say('AUTH LOGIN')) !== 334) return $fail('smtp_auth');
  if ($code($say(base64_encode($user))) !== 334) return $fail('smtp_auth_user');
  if ($code($say(base64_encode($pass))) !== 235) return $fail('smtp_auth_pass');
  if ($code($say('MAIL FROM:<' . $from . '>')) !== 250) return $fail('smtp_from');
  $rc = $code($say('RCPT TO:<' . $to . '>'));
  if ($rc !== 250 && $rc !== 251) return $fail('smtp_rcpt');
  if ($code($say('DATA')) !== 354) return $fail('smtp_data');

  try {
    $boundary = '=_' . bin2hex(random_bytes(12));
  } catch (Exception $e) {
    return $fail('random_failed');
  }
  $eol = "\r\n";
  $headers = array(
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
    'From: ' . $from,
    'To: ' . $to,
    'Subject: ' . mail_encode_subject($subject),
    'Date: ' . date('r'),
    'X-Mailer: resume-api/' . API_VERSION,
  );
  if ($replyTo !== null && valid_email($replyTo)) {
    $headers[] = 'Reply-To: ' . trim($replyTo);
  }
  $msg = implode($eol, $headers) . $eol . $eol;
  $msg .= '--' . $boundary . $eol;
  $msg .= 'Content-Type: text/plain; charset=UTF-8' . $eol;
  $msg .= 'Content-Transfer-Encoding: 8bit' . $eol . $eol;
  $msg .= ($textBody !== '' ? $textBody : ' ') . $eol;
  $msg .= '--' . $boundary . $eol;
  $msg .= 'Content-Type: text/html; charset=UTF-8' . $eol;
  $msg .= 'Content-Transfer-Encoding: 8bit' . $eol . $eol;
  $msg .= $htmlBody . $eol;
  $msg .= '--' . $boundary . '--' . $eol;
  // Normalize to CRLF + SMTP dot-stuffing.
  $msg = str_replace("\n", "\r\n", str_replace("\r\n", "\n", $msg));
  $msg = preg_replace('/^\./m', '..', $msg);

  @fwrite($fp, $msg . "\r\n.\r\n");
  $res = $read();
  $say('QUIT');
  @fclose($fp);
  if ($code($res) !== 250) return array(false, 'smtp_send');
  return array(true, null);
}

/**
 * Send a multipart (text + HTML) email.
 * Routes via the panel-configured SMTP mailbox when present, else PHP mail().
 * @return array [sent(bool), errorOrNull]
 */
function send_html_mail($to, $subject, $htmlBody, $textBody = '', $replyTo = null) {
  if (!valid_email($to)) return array(false, 'invalid_email');
  $smtp = smtp_get_config();
  if (smtp_configured($smtp)) {
    return smtp_send($to, $subject, $htmlBody, $textBody, $replyTo, $smtp);
  }
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

/** Brute-force lockout alert to the admin's recovery email. */
function send_lockout_mail($to, $ip) {
  $when = date('Y-m-d H:i:s');
  $subject = '⚠️ هشدار امنیتی: ۳ ورود ناموفق — ورود ۳۰ ثانیه قفل شد';
  $esc = function ($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); };

  $html = '<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#0b0f19;color:#f1f5f9;padding:32px;line-height:2;">'
    . '<div style="max-width:520px;margin:0 auto;background:#111827;border:1px solid #7f1d1d;border-radius:16px;padding:28px;text-align:center;">'
    . '<h2 style="margin:0 0 8px;color:#f87171;">🛡️ تلاش‌های ناموفق ورود شناسایی شد</h2>'
    . '<p style="color:#94a3b8;font-size:13px;">۳ بار رمز اشتباه وارد شد، پس ورود از این آدرس به مدت ۳۰ ثانیه قفل شد.</p>'
    . '<table style="width:100%;border-collapse:collapse;margin:14px 0;text-align:right;">'
    . '<tr><td style="padding:8px 12px;color:#94a3b8;font-size:13px;">آدرس مهاجم (IP)</td>'
    . '<td style="padding:8px 12px;color:#f1f5f9;font-size:13px;font-family:monospace;" dir="ltr">' . $esc($ip) . '</td></tr>'
    . '<tr><td style="padding:8px 12px;color:#94a3b8;font-size:13px;">زمان</td>'
    . '<td style="padding:8px 12px;color:#f1f5f9;font-size:13px;font-family:monospace;" dir="ltr">' . $esc($when) . ' UTC</td></tr>'
    . '</table>'
    . '<p style="color:#f59e0b;font-size:13px;">اگر خودتان بودید، ۳۰ ثانیه صبر کنید و دوباره وارد شوید. در غیر این صورت فوراً رمز مدیر را عوض کنید.</p>'
    . '</div></div>';

  $text = 'هشدار امنیتی سایت' . "\n\n"
    . '۳ ورود ناموفق از IP ' . $ip . ' در ' . $when . ' UTC' . "\n"
    . 'ورود ۳۰ ثانیه قفل شد.' . "\n\n"
    . 'اگر خودتان نبودید، فوراً رمز مدیر را عوض کنید.';

  return send_html_mail($to, $subject, $html, $text);
}

/** Contact-form message forwarded to the admin. */
function contact_attachment_row($attachmentUrl, $attachmentName, $esc) {
  if ($attachmentUrl === '') return '';
  $label = $attachmentName !== '' ? $attachmentName : $attachmentUrl;
  $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
  $host = preg_replace('/[^a-zA-Z0-9.\-:]/', '', (string)($_SERVER['HTTP_HOST'] ?? ''));
  $scriptDir = str_replace('\\', '/', dirname((string)($_SERVER['SCRIPT_NAME'] ?? '/api/contact.php')));
  $root = rtrim(dirname($scriptDir), '/');
  $href = ($host !== '' ? $scheme . '://' . $host . $root . '/' : '') . $attachmentUrl;
  $cell = $host !== ''
    ? '<a href="' . $esc($href) . '" style="color:#22d3ee;">' . $esc($label) . '</a>'
      . '<div style="color:#64748b;font-size:11px;">(یا از صندوق پیام‌های پنل دانلود کنید)</div>'
    : $esc($label) . ' (دانلود از صندوق پیام‌های پنل)';
  return '<tr><td style="padding:8px 12px;color:#94a3b8;font-size:13px;white-space:nowrap;">فایل پیوست</td>'
    . '<td style="padding:8px 12px;color:#f1f5f9;font-size:13px;">' . $cell . '</td></tr>';
}

function send_contact_mail($to, $name, $email, $company, $subject, $message, $phone = '', $attachmentUrl = '', $attachmentName = '') {
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
    . $row('تلفن فرستنده', ($phone !== '' ? $phone : '—'))
    . $row('سازمان / شرکت', ($company !== '' ? $company : 'شخصی'))
    . $row('موضوع', $subject)
    . $row('متن پیام', $message)
    . contact_attachment_row($attachmentUrl, $attachmentName, $esc)
    . '</table></div></div>';

  $text = 'پیام جدید از فرم تماس سایت' . "\n\n"
    . 'نام: ' . $name . "\n"
    . 'ایمیل: ' . $email . "\n"
    . 'تلفن: ' . ($phone !== '' ? $phone : '—') . "\n"
    . 'شرکت: ' . ($company !== '' ? $company : 'شخصی') . "\n"
    . 'موضوع: ' . $subject . "\n\n" . $message;
  if ($attachmentUrl !== '') {
    $text .= "\n\n" . 'فایل پیوست: ' . ($attachmentName !== '' ? $attachmentName : $attachmentUrl)
      . ' — دانلود از صندوق پیام‌های پنل مدیریت';
  }

  return send_html_mail($to, $subjectLine, $html, $text, $email);
}
