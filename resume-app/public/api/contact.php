<?php
/**
 * ============================================================================
 * CONTACT API — forward the public contact form to the admin's recovery email
 * ============================================================================
 * Honeypot + strict validation + server-side rate limiting. The message is
 * mailed from the site's OWN host (no third party) with a Reply-To header.
 */

require_once __DIR__ . '/store.php';
require_once __DIR__ . '/mailer.php';

api_require_post();
$in = api_input();
$ip = client_ip();

// --- Honeypot: bots fill this hidden field → fake success, never send ---
$trap = trim((string)($in['website_bot_trap'] ?? ($in['website'] ?? '')));
if ($trap !== '') {
  api_json(array('ok' => true));
}

list($allowed, $retry) = rate_limit('contact:' . $ip, RL_CONTACT[0], RL_CONTACT[1]);
if (!$allowed) api_fail('rate_limit', 429, array('retryAfter' => $retry));

$name = trim((string)($in['name'] ?? ''));
$email = trim((string)($in['email'] ?? ''));
$company = trim((string)($in['company'] ?? ''));
$subject = trim((string)($in['subject'] ?? ''));
$message = trim((string)($in['message'] ?? ''));

if ($name === '' || strlen($name) > 100) api_fail('invalid_name');
if (!valid_email($email)) api_fail('invalid_email');
if (strlen($company) > 150) api_fail('invalid_company');
if ($subject === '') $subject = 'پیام جدید از فرم تماس';
if (strlen($subject) > 150) api_fail('invalid_subject');
if ($message === '' || strlen($message) > 5000) api_fail('invalid_message');

$auth = store_read('auth', null);
if (!is_array($auth) || empty($auth['recoveryEmail'])) {
  api_fail('not_configured', 503); // owner hasn't run setup yet
}

list($sent, $mailErr) = send_contact_mail(
  (string)$auth['recoveryEmail'], $name, $email, $company, $subject, $message
);

if (!$sent) api_fail($mailErr === 'mail_disabled' ? 'mail_disabled' : 'mail_failed', 502);
api_json(array('ok' => true));
