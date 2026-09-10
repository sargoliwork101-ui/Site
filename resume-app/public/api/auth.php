<?php
/**
 * ============================================================================
 * AUTH API — REAL server-side authentication, OTP, sessions & rate limits
 * ============================================================================
 *
 * Actions (POST + X-Requested-With header, except `status` which is GET):
 *
 *   status               → {backend, setupDone, authenticated, mailAvailable, emailVerified}
 *   setup                → {password, recoveryEmail}        first-run master account + OTP mail
 *   verify-setup-otp     → {otp}                            confirm recovery email, log in
 *   skip-setup-verify    → {}                               enter panel unverified (broken-mail escape hatch)
 *   login                → {username, password}             master login (bcrypt + session)
 *   logout               → {}                               destroy session
 *   request-otp          → {email}                          ALWAYS generic {ok:true} (no enumeration)
 *   verify-otp           → {email, otp}                     → {ok, resetToken} (single-use, 10 min)
 *   reset-password       → {token, newPassword}             consume token, set bcrypt pw, log in
 *   change-password      → {currentPassword, newPassword}   (auth required)
 *   request-email-change → {password, newEmail}             (auth required) OTP to NEW email
 *   confirm-email-change → {otp}                            (auth required)
 *   account              → {}                               (auth required) recovery-email info
 *
 * Secrets (bcrypt hashes) live in api/data/*.json (0600, .htaccess denied).
 * PHP >= 7.3 required.
 */

require_once __DIR__ . '/store.php';
require_once __DIR__ . '/mailer.php';

// Session helpers live in session.php (shared with content.php).
require_once __DIR__ . '/session.php';

// ---------------------------------------------------------------------------
// Auth store helpers
// ---------------------------------------------------------------------------
function auth_get() {
  $a = store_read('auth', null);
  return is_array($a) ? $a : null;
}

function auth_is_setup() {
  $a = auth_get();
  return $a !== null && !empty($a['admin']['hash']);
}

/** Burn ~1 bcrypt to normalize timing on failure paths (also slows guessing). */
function burn_dummy_hash() {
  try {
    $tmp = pw_hash(bin2hex(random_bytes(8)));
    password_verify('x', $tmp);
  } catch (Exception $e) { /* ignore */ }
}

function valid_password($pw) {
  return is_string($pw) && strlen($pw) >= MIN_PASSWORD_LEN && strlen($pw) <= MAX_PASSWORD_LEN;
}

// --- Modern password hashing: Argon2id where the host offers it, ---------
// --- bcrypt cost 12 otherwise. verify() accepts every past algorithm, ---
// --- and successful logins transparently upgrade old hashes. ------------
function pw_algo() {
  if (defined('PASSWORD_ARGON2ID')) return PASSWORD_ARGON2ID;
  return PASSWORD_DEFAULT;
}

function pw_options() {
  if (defined('PASSWORD_ARGON2ID') && pw_algo() === PASSWORD_ARGON2ID) {
    return array('memory_cost' => 65536, 'time_cost' => 3, 'threads' => 1);
  }
  return array('cost' => 12);
}

function pw_hash($pw) {
  return password_hash((string)$pw, pw_algo(), pw_options());
}

function pw_needs_rehash($hash) {
  return password_needs_rehash((string)$hash, pw_algo(), pw_options());
}

// Length-guarded hash_equals: PHP 8 THROWS ValueError on length mismatch,
// so compare lengths first (wrong-length input = simply not equal).
function hash_eq($a, $b) {
  $a = (string)$a;
  $b = (string)$b;
  if (strlen($a) !== strlen($b)) return false;
  return hash_equals($a, $b);
}

// --- Brute-force lockout (keyed by IP — NEVER by account, so an attacker -
// --- cannot DoS the real admin by locking THEIR account with bad guesses). -
function login_lockout_check($ip) {
  $all = store_read('lockout', array());
  $e = (isset($all['login:' . $ip]) && is_array($all['login:' . $ip])) ? $all['login:' . $ip] : null;
  if ($e === null) return 0;
  $until = (int)($e['lockedUntil'] ?? 0);
  return ($until > time()) ? ($until - time()) : 0;
}

function login_lockout_fail($ip) {
  $now = time();
  $all = store_read('lockout', array());
  $k = 'login:' . $ip;
  $e = (isset($all[$k]) && is_array($all[$k])) ? $all[$k] : array();
  if ((int)($e['lockedUntil'] ?? 0) > $now) return; // already locked: no churn
  if ((int)($e['lastFailAt'] ?? 0) > 0 && ($now - (int)$e['lastFailAt']) > LOCKOUT_FAIL_WINDOW) {
    $e['fails'] = 0; // stale failures expire
  }
  $e['lastFailAt'] = $now;
  $e['fails'] = (int)($e['fails'] ?? 0) + 1;
  if ($e['fails'] >= LOCKOUT_FAILS) {
    $e['fails'] = 0;
    $e['lockedUntil'] = $now + LOCKOUT_SECONDS;
    // Email alert (cooldown-guarded, fire-and-forget — never blocks login).
    if (($now - (int)($e['alertAt'] ?? 0)) >= LOCKOUT_ALERT_COOLDOWN) {
      $e['alertAt'] = $now;
      $auth = auth_get();
      $to = ($auth !== null) ? (string)($auth['recoveryEmail'] ?? '') : '';
      if (valid_email($to)) {
        try { send_lockout_mail($to, $ip); } catch (Exception $ex) { /* ignore */ }
      }
    }
  }
  $all[$k] = $e;
  // Prune dead entries so the file stays tiny.
  foreach ($all as $kk => $vv) {
    if (!is_array($vv)) { unset($all[$kk]); continue; }
    $lu = (int)($vv['lockedUntil'] ?? 0);
    $aa = (int)($vv['alertAt'] ?? 0);
    $ff = (int)($vv['fails'] ?? 0);
    if ($lu < $now && $aa < $now - LOCKOUT_ALERT_COOLDOWN && $ff === 0) unset($all[$kk]);
  }
  store_write('lockout', $all);
}

function login_lockout_clear($ip) {
  $all = store_read('lockout', array());
  $k = 'login:' . $ip;
  if (isset($all[$k])) {
    unset($all[$k]);
    store_write('lockout', $all);
  }
}

// ---------------------------------------------------------------------------
// OTP slots (otp.json: {setup:{...}, reset:{...}, emailchange:{...}} — one per flow)
// ---------------------------------------------------------------------------
function otp_issue($slot, $extra = array()) {
  $code = '';
  for ($i = 0; $i < OTP_LEN; $i++) { $code .= (string)random_int(0, 9); }
  $all = store_read('otp', array());
  $all[$slot] = array_merge(array(
    'hash'     => pw_hash($code),
    'exp'      => time() + OTP_TTL,
    'attempts' => 0,
    'sentAt'   => time(),
  ), $extra);
  store_write('otp', $all);
  return $code;
}

/** @return 'ok'|'missing'|'expired'|'locked'|'invalid' */
function otp_check($slot, $code) {
  $all = store_read('otp', array());
  $s = isset($all[$slot]) && is_array($all[$slot]) ? $all[$slot] : null;
  if ($s === null || empty($s['hash']) || empty($s['exp'])) return 'missing';
  if (time() > (int)$s['exp']) { otp_clear($slot); return 'expired'; }
  if ((int)$s['attempts'] >= OTP_MAX_ATTEMPTS) { otp_clear($slot); return 'locked'; }
  if (!is_string($code) || !password_verify($code, $s['hash'])) {
    $s['attempts'] = (int)$s['attempts'] + 1;
    $all[$slot] = $s;
    store_write('otp', $all);
    return 'invalid';
  }
  otp_clear($slot);
  return 'ok';
}

function otp_clear($slot) {
  $all = store_read('otp', array());
  unset($all[$slot]);
  store_write('otp', $all);
}

// ---------------------------------------------------------------------------
// SERVER BACKUPS (auto-backup target: api/data/backups/*.json, 0600, web-denied)
// ---------------------------------------------------------------------------
function backup_dir() { return DATA_DIR . '/backups'; }

function backup_ensure_dir() {
  if (!ensure_data_dir()) return false;
  $d = backup_dir();
  if (!is_dir($d)) { @mkdir($d, 0750, true); @chmod($d, 0750); }
  if (!is_dir($d) || !is_writable($d)) return false;
  // Static guards ship in the repo too; rewrite at runtime in case dotfiles
  // get lost during upload (same pattern as ensure_data_dir()).
  @file_put_contents($d . '/.htaccess', "<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n  Order Allow,Deny\n  Deny from all\n</IfModule>\n");
  @file_put_contents($d . '/index.php', "<?php\nhttp_response_code(403);\nexit('Forbidden');\n");
  return true;
}

/** Strict filename check — blocks path traversal (only our own names pass). */
function backup_valid_name($name) {
  return is_string($name) && preg_match('/^full_\d{8}_\d{6}_[a-f0-9]{8}\.json$/', $name) === 1;
}

function backup_list_files() {
  if (!backup_ensure_dir()) return array();
  $out = array();
  foreach ((@scandir(backup_dir()) ?: array()) as $f) {
    if (!backup_valid_name($f)) continue;
    $p = backup_dir() . '/' . $f;
    if (!is_file($p)) continue;
    $out[] = array('name' => $f, 'bytes' => (@filesize($p) ?: 0), 'mtime' => (@filemtime($p) ?: 0));
  }
  usort($out, function ($a, $b) { return strcmp($b['name'], $a['name']); }); // newest first
  return $out;
}

function backup_keep_count() {
  $cfg = store_read('backupcfg', array());
  $k = isset($cfg['keep']) ? (int)$cfg['keep'] : BACKUP_KEEP_DEFAULT;
  return max(BACKUP_KEEP_MIN, min(BACKUP_KEEP_MAX, $k));
}

/** Delete oldest beyond keep-count. Returns number pruned. */
function backup_prune($keep = null) {
  if ($keep === null) $keep = backup_keep_count();
  $files = backup_list_files();
  $pruned = 0;
  foreach (array_slice($files, $keep) as $f) {
    if (@unlink(backup_dir() . '/' . $f['name'])) $pruned++;
  }
  return $pruned;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
sec_session_start();
$action = isset($_GET['action']) ? (string)$_GET['action'] : '';

// --- Public, read-only, side-effect free → GET allowed ---
if ($action === 'status') {
  $auth = auth_get();
  api_json(array(
    'backend'       => true,
    'version'       => API_VERSION,
    'setupDone'     => auth_is_setup(),
    'authenticated' => sec_is_authed(),
    'mailAvailable' => mail_available(),
    'emailVerified' => $auth !== null && !empty($auth['emailVerified']),
  ));
}

api_require_post();
$in = api_input();
$ip = client_ip();

switch ($action) {

  // ------------------------------------------------------------------ SETUP
  case 'setup': {
    if (auth_is_setup()) api_fail('already_setup', 409);
    list($allowed, $retry) = rate_limit('setup:' . $ip, RL_SETUP[0], RL_SETUP[1]);
    if (!$allowed) api_fail('rate_limit', 429, array('retryAfter' => $retry));

    $pw = $in['password'] ?? '';
    $email = strtolower(trim((string)($in['recoveryEmail'] ?? '')));
    if (!valid_password($pw)) api_fail('weak_password');
    if (!valid_email($email)) api_fail('invalid_email');

    $auth = array(
      'admin'         => array('hash' => pw_hash($pw)),
      'recoveryEmail' => $email,
      'emailVerified' => false,
      'createdAt'     => time(),
    );
    if (!store_write('auth', $auth)) api_fail('storage_error', 500);

    $code = otp_issue('setup');
    list($sent, $mailErr) = send_otp_mail($email, $code, 'verify');
    api_json(array('ok' => true, 'emailSent' => $sent, 'mailError' => $sent ? null : $mailErr));
    break;
  }

  case 'verify-setup-otp': {
    if (!auth_is_setup()) api_fail('not_setup', 409);
    list($allowed, $retry) = rate_limit('verify:' . $ip, RL_OTP_VERIFY[0], RL_OTP_VERIFY[1]);
    if (!$allowed) api_fail('rate_limit', 429, array('retryAfter' => $retry));

    $res = otp_check('setup', $in['otp'] ?? '');
    if ($res !== 'ok') api_fail($res === 'expired' ? 'expired' : 'invalid_code');

    $auth = auth_get();
    $auth['emailVerified'] = true;
    unset($auth['verifySkipped']);
    store_write('auth', $auth);
    sec_login();
    api_json(array('ok' => true, 'authenticated' => true));
    break;
  }

  case 'skip-setup-verify': {
    // Escape hatch for hosts with broken mail(): enter now, verify later.
    // Safe: setup itself requires uploading to this hosting (owner-only).
    if (!auth_is_setup()) api_fail('not_setup', 409);
    $auth = auth_get();
    if (!empty($auth['emailVerified'])) api_fail('already_verified', 409);
    list($allowed, $retry) = rate_limit('setup:' . $ip, RL_SETUP[0], RL_SETUP[1]);
    if (!$allowed) api_fail('rate_limit', 429, array('retryAfter' => $retry));
    if (!is_string($in['password'] ?? null) || !password_verify((string)$in['password'], (string)$auth['admin']['hash'])) {
      burn_dummy_hash();
      api_fail('invalid_credentials', 401);
    }
    $auth['verifySkipped'] = true;
    store_write('auth', $auth);
    sec_login();
    api_json(array('ok' => true, 'authenticated' => true, 'emailVerified' => false));
    break;
  }

  // ------------------------------------------------------------------ LOGIN
  case 'login': {
    list($allowed, $retry) = rate_limit('login:' . $ip, RL_LOGIN[0], RL_LOGIN[1]);
    if (!$allowed) api_fail('rate_limit', 429, array('retryAfter' => $retry));
    // Hard lockout: 3 wrong passwords → 30s freeze (+ email alert on trigger).
    $lockLeft = login_lockout_check($ip);
    if ($lockLeft > 0) api_fail('locked', 429, array('retryAfter' => $lockLeft));
    if (!auth_is_setup()) api_fail('not_setup', 409);

    $user = strtolower(trim((string)($in['username'] ?? '')));
    $pw = $in['password'] ?? '';
    $auth = auth_get();

    // Generic failure either way (no account enumeration).
    if (!hash_eq('admin', $user)) { burn_dummy_hash(); login_lockout_fail($ip); api_fail('invalid_credentials', 401); }
    if (!is_string($pw) || !password_verify($pw, (string)$auth['admin']['hash'])) {
      burn_dummy_hash();
      login_lockout_fail($ip);
      api_fail('invalid_credentials', 401);
    }
    login_lockout_clear($ip);
    if (pw_needs_rehash((string)$auth['admin']['hash'])) {
      $auth['admin']['hash'] = pw_hash($pw);
      store_write('auth', $auth);
    }
    sec_login();
    api_json(array('ok' => true, 'authenticated' => true));
    break;
  }

  case 'logout': {
    sec_logout();
    api_json(array('ok' => true));
    break;
  }

  // ------------------------------------------------------------------ OTP
  case 'request-otp': {
    list($allowed, $retry) = rate_limit('otpreq:' . $ip, RL_OTP_REQUEST[0], RL_OTP_REQUEST[1]);
    if (!$allowed) api_fail('rate_limit', 429, array('retryAfter' => $retry));

    $email = strtolower(trim((string)($in['email'] ?? '')));

    // Per-address cooldown tracked for EVERY requested address (matching or
    // not) so the response timing/shape never reveals which email is real.
    $cdKey = 'otpcd:' . sha1($ip . '|' . $email);
    list($cdOk, $cdRetry) = rate_limit($cdKey, 1, OTP_RESEND_COOLDOWN);
    if (!$cdOk) api_json(array('ok' => true, 'retryAfter' => $cdRetry));

    $auth = auth_get();
    $match = $auth !== null && hash_eq(strtolower((string)$auth['recoveryEmail']), $email);
    if ($match && valid_email($email)) {
      $code = otp_issue('reset');
      send_otp_mail($email, $code, 'reset'); // result intentionally not exposed
    }
    api_json(array('ok' => true));
    break;
  }

  case 'verify-otp': {
    list($allowed, $retry) = rate_limit('verify:' . $ip, RL_OTP_VERIFY[0], RL_OTP_VERIFY[1]);
    if (!$allowed) api_fail('rate_limit', 429, array('retryAfter' => $retry));

    $email = strtolower(trim((string)($in['email'] ?? '')));
    $auth = auth_get();
    $match = $auth !== null && hash_eq(strtolower((string)$auth['recoveryEmail']), $email);
    if (!$match) { burn_dummy_hash(); api_fail('invalid_code'); }

    $res = otp_check('reset', $in['otp'] ?? '');
    if ($res === 'expired') api_fail('expired');
    if ($res !== 'ok') api_fail($res === 'locked' ? 'locked' : 'invalid_code');

    try {
      $token = bin2hex(random_bytes(32));
    } catch (Exception $e) {
      api_fail('random_failed', 500);
    }
    $all = store_read('otp', array());
    $all['reset'] = array(
      'hash' => pw_hash($token),
      'exp'  => time() + RESET_TOKEN_TTL,
      'used' => false,
    );
    store_write('otp', $all);
    api_json(array('ok' => true, 'resetToken' => $token));
    break;
  }

  case 'reset-password': {
    // The token is 256-bit (unguessable), but throttle anyway so token
    // probing / log spam is capped like every other sensitive endpoint.
    list($allowed, $retry) = rate_limit('resetpw:' . $ip, RL_OTP_VERIFY[0], RL_OTP_VERIFY[1]);
    if (!$allowed) api_fail('rate_limit', 429, array('retryAfter' => $retry));
    $token = $in['token'] ?? '';
    $pw = $in['newPassword'] ?? '';
    if (!valid_password($pw)) api_fail('weak_password');

    $all = store_read('otp', array());
    $r = isset($all['reset']) && is_array($all['reset']) ? $all['reset'] : null;
    $valid = $r !== null && empty($r['used']) && time() <= (int)$r['exp']
      && is_string($token) && $token !== '' && password_verify($token, (string)$r['hash']);
    if (!$valid) api_fail('invalid_token');

    $auth = auth_get();
    if ($auth === null) api_fail('not_setup', 409);
    $auth['admin']['hash'] = pw_hash($pw);
    store_write('auth', $auth);

    $all['reset']['used'] = true; // single use
    store_write('otp', $all);
    sec_login();
    api_json(array('ok' => true, 'authenticated' => true));
    break;
  }

  // ------------------------------------------------- AUTHENTICATED ACTIONS
  case 'change-password': {
    if (!sec_is_authed()) api_fail('auth_required', 401);
    $cur = $in['currentPassword'] ?? '';
    $pw = $in['newPassword'] ?? '';
    if (!valid_password($pw)) api_fail('weak_password');
    $auth = auth_get();
    if ($auth === null || !is_string($cur) || !password_verify($cur, (string)$auth['admin']['hash'])) {
      burn_dummy_hash();
      api_fail('invalid_credentials', 401);
    }
    $auth['admin']['hash'] = pw_hash($pw);
    store_write('auth', $auth);
    sec_login(); // fresh session id after credential change
    api_json(array('ok' => true));
    break;
  }

  case 'request-email-change': {
    if (!sec_is_authed()) api_fail('auth_required', 401);
    list($allowed, $retry) = rate_limit('otpreq:' . $ip, RL_OTP_REQUEST[0], RL_OTP_REQUEST[1]);
    if (!$allowed) api_fail('rate_limit', 429, array('retryAfter' => $retry));

    $pw = $in['password'] ?? '';
    $newEmail = strtolower(trim((string)($in['newEmail'] ?? '')));
    if (!valid_email($newEmail)) api_fail('invalid_email');
    $auth = auth_get();
    if ($auth === null || !is_string($pw) || !password_verify($pw, (string)$auth['admin']['hash'])) {
      burn_dummy_hash();
      api_fail('invalid_credentials', 401);
    }
    $code = otp_issue('emailchange', array('pendingEmail' => $newEmail));
    list($sent, $mailErr) = send_otp_mail($newEmail, $code, 'verify');
    api_json(array('ok' => true, 'emailSent' => $sent, 'mailError' => $sent ? null : $mailErr));
    break;
  }

  case 'confirm-email-change': {
    if (!sec_is_authed()) api_fail('auth_required', 401);
    list($allowed, $retry) = rate_limit('verify:' . $ip, RL_OTP_VERIFY[0], RL_OTP_VERIFY[1]);
    if (!$allowed) api_fail('rate_limit', 429, array('retryAfter' => $retry));

    $all = store_read('otp', array());
    $pending = isset($all['emailchange']['pendingEmail']) ? (string)$all['emailchange']['pendingEmail'] : '';
    $res = otp_check('emailchange', $in['otp'] ?? '');
    if ($res === 'expired') api_fail('expired');
    if ($res !== 'ok' || !valid_email($pending)) {
      api_fail($res === 'locked' ? 'locked' : 'invalid_code');
    }
    $auth = auth_get();
    $auth['recoveryEmail'] = $pending;
    $auth['emailVerified'] = true;
    unset($auth['verifySkipped']);
    store_write('auth', $auth);
    api_json(array('ok' => true, 'recoveryEmail' => $pending));
    break;
  }

  case 'account': {
    if (!sec_is_authed()) api_fail('auth_required', 401);
    $auth = auth_get();
    api_json(array(
      'ok' => true,
      'recoveryEmail' => $auth !== null ? (string)$auth['recoveryEmail'] : '',
      'emailVerified' => $auth !== null && !empty($auth['emailVerified']),
    ));
    break;
  }

  // --- Notification mailbox (SMTP), managed from Panel → Security -----------
  // Stored in api/data/smtp.json (0600, .htaccess-denied). The password is
  // NEVER returned except via smtp-reveal (authed admin session only).

  case 'smtp-get': {
    if (!sec_is_authed()) api_fail('auth_required', 401);
    $cfg = smtp_get_config();
    api_json(array('ok' => true, 'smtp' => array(
      'enabled' => $cfg['enabled'],
      'host' => $cfg['host'],
      'port' => $cfg['port'],
      'encryption' => $cfg['encryption'],
      'username' => $cfg['username'],
      'from' => $cfg['from'],
      'verifyTls' => $cfg['verifyTls'],
      'hasPassword' => ((string)$cfg['password'] !== ''),
      'configured' => smtp_configured($cfg),
    )));
    break;
  }

  case 'smtp-save': {
    if (!sec_is_authed()) api_fail('auth_required', 401);
    $cfg = smtp_get_config();
    $host = trim((string)($in['host'] ?? ''));
    if ($host !== '' && (strlen($host) > 255 || preg_match('/\s/', $host))) api_fail('invalid_host');
    $port = (int)($in['port'] ?? 587);
    if ($port < 1 || $port > 65535) api_fail('invalid_port');
    $enc = (string)($in['encryption'] ?? 'starttls');
    if (!in_array($enc, array('starttls', 'smtps', 'none'), true)) api_fail('invalid_encryption');
    $user = trim((string)($in['username'] ?? ''));
    if (strlen($user) > 128) api_fail('invalid_username');
    $from = trim((string)($in['from'] ?? ''));
    if ($from !== '' && !valid_email($from)) api_fail('invalid_from');
    $cfg['enabled'] = !empty($in['enabled']);
    $cfg['host'] = $host;
    $cfg['port'] = $port;
    $cfg['encryption'] = $enc;
    $cfg['username'] = $user;
    $cfg['from'] = $from;
    $cfg['verifyTls'] = !isset($in['verifyTls']) || !empty($in['verifyTls']);
    // Empty password = keep the stored one (change-only semantics).
    if (array_key_exists('password', $in) && (string)$in['password'] !== '') {
      if (strlen((string)$in['password']) > 256) api_fail('invalid_password');
      $cfg['password'] = (string)$in['password'];
    }
    if (!store_write('smtp', $cfg)) api_fail('save_failed', 500);
    api_json(array('ok' => true, 'smtp' => array(
      'enabled' => $cfg['enabled'],
      'host' => $cfg['host'],
      'port' => $cfg['port'],
      'encryption' => $cfg['encryption'],
      'username' => $cfg['username'],
      'from' => $cfg['from'],
      'verifyTls' => $cfg['verifyTls'],
      'hasPassword' => ((string)$cfg['password'] !== ''),
      'configured' => smtp_configured($cfg),
    )));
    break;
  }

  case 'smtp-reveal': {
    if (!sec_is_authed()) api_fail('auth_required', 401);
    list($allowed, $retry) = rate_limit('smtprev:' . $ip, 10, 600);
    if (!$allowed) api_fail('rate_limit', 429, array('retryAfter' => $retry));
    $cfg = smtp_get_config();
    api_json(array('ok' => true, 'password' => (string)$cfg['password']));
    break;
  }

  case 'smtp-test': {
    if (!sec_is_authed()) api_fail('auth_required', 401);
    list($allowed, $retry) = rate_limit('smtptest:' . $ip, 3, 600);
    if (!$allowed) api_fail('rate_limit', 429, array('retryAfter' => $retry));
    $auth = auth_get();
    // Fixed recipient (recovery email) — this endpoint must never be a relay.
    $to = $auth !== null ? (string)$auth['recoveryEmail'] : '';
    if (!valid_email($to)) api_fail('no_recovery_email');
    $cfg = smtp_get_config();
    if (!smtp_configured($cfg)) api_fail('smtp_not_configured');
    $html = '<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#0b0f19;color:#f1f5f9;padding:32px;line-height:2;">'
      . '<div style="max-width:520px;margin:0 auto;background:#111827;border:1px solid #1e293b;border-radius:16px;padding:28px;text-align:center;">'
      . '<h2 style="margin:0 0 8px;color:#22d3ee;">✅ اتصال SMTP برقرار است</h2>'
      . '<p style="color:#94a3b8;font-size:13px;">این یک ایمیل آزمایشی از پنل مدیریت سایت شماست. اعلان‌ها (کد تایید، پیام‌های تماس) از این پس با این صندوق ارسال می‌شوند.</p>'
      . '</div></div>';
    list($sent, $err) = smtp_send($to, 'تست اتصال SMTP سایت ✅', $html, 'تست اتصال SMTP موفق بود.', null, $cfg);
    api_json(array('ok' => true, 'sent' => $sent, 'error' => $sent ? null : $err));
    break;
  }

  // --- Server backups (auto-backup target lives on the HOST) ------------------
  case 'backup-save': {
    if (!sec_is_authed()) api_fail('auth_required', 401);
    list($allowed, $retry) = rate_limit('backup:' . $ip, RL_BACKUP[0], RL_BACKUP[1]);
    if (!$allowed) api_fail('rate_limit', 429, array('retryAfter' => $retry));
    $clen = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($clen > BACKUP_MAX_BYTES) api_fail('too_large');
    $env = $in['backup'] ?? null;
    if (!is_array($env) || ($env['format'] ?? '') !== 'fullsite' || !is_array($env['data'] ?? null)) {
      api_fail('invalid_backup');
    }
    // Belt & braces: never persist secrets even if a client sends them.
    if (isset($env['adminSecurity']) && is_array($env['adminSecurity'])) {
      unset($env['adminSecurity']['password'], $env['adminSecurity']['activeOtp'], $env['adminSecurity']['otpExpiresAt']);
    }
    if (!backup_ensure_dir()) api_fail('save_failed', 500);
    $json = json_encode($env, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if (!is_string($json) || strlen($json) > BACKUP_MAX_BYTES) api_fail('too_large');
    try { $rand = bin2hex(random_bytes(4)); } catch (Exception $e) { api_fail('save_failed', 500); }
    $name = 'full_' . date('Ymd_His') . '_' . $rand . '.json';
    $tmp = backup_dir() . '/' . $name . '.tmp';
    if (@file_put_contents($tmp, $json, LOCK_EX) === false) api_fail('save_failed', 500);
    @chmod($tmp, 0600);
    if (!@rename($tmp, backup_dir() . '/' . $name)) { @unlink($tmp); api_fail('save_failed', 500); }
    $pruned = backup_prune();
    api_json(array('ok' => true, 'file' => $name, 'bytes' => strlen($json), 'pruned' => $pruned, 'kept' => backup_keep_count()));
    break;
  }

  case 'backup-list': {
    if (!sec_is_authed()) api_fail('auth_required', 401);
    list($allowed, $retry) = rate_limit('backup:' . $ip, RL_BACKUP[0], RL_BACKUP[1]);
    if (!$allowed) api_fail('rate_limit', 429, array('retryAfter' => $retry));
    api_json(array('ok' => true, 'files' => backup_list_files(), 'keep' => backup_keep_count()));
    break;
  }

  case 'backup-get': {
    if (!sec_is_authed()) api_fail('auth_required', 401);
    list($allowed, $retry) = rate_limit('backup:' . $ip, RL_BACKUP[0], RL_BACKUP[1]);
    if (!$allowed) api_fail('rate_limit', 429, array('retryAfter' => $retry));
    $name = (string)($in['name'] ?? '');
    if (!backup_valid_name($name)) api_fail('invalid_name');
    $p = backup_dir() . '/' . $name;
    if (!is_file($p)) api_fail('not_found', 404);
    $raw = @file_get_contents($p);
    $data = is_string($raw) ? json_decode($raw, true) : null;
    if (!is_array($data)) api_fail('corrupt', 500);
    api_json(array('ok' => true, 'backup' => $data));
    break;
  }

  case 'backup-delete': {
    if (!sec_is_authed()) api_fail('auth_required', 401);
    list($allowed, $retry) = rate_limit('backup:' . $ip, RL_BACKUP[0], RL_BACKUP[1]);
    if (!$allowed) api_fail('rate_limit', 429, array('retryAfter' => $retry));
    $name = (string)($in['name'] ?? '');
    if (!backup_valid_name($name)) api_fail('invalid_name');
    $p = backup_dir() . '/' . $name;
    if (is_file($p)) @unlink($p);
    api_json(array('ok' => true));
    break;
  }

  case 'backup-config-get': {
    if (!sec_is_authed()) api_fail('auth_required', 401);
    api_json(array('ok' => true, 'keep' => backup_keep_count()));
    break;
  }

  case 'backup-config-save': {
    if (!sec_is_authed()) api_fail('auth_required', 401);
    $keep = max(BACKUP_KEEP_MIN, min(BACKUP_KEEP_MAX, (int)($in['keep'] ?? BACKUP_KEEP_DEFAULT)));
    if (!store_write('backupcfg', array('keep' => $keep))) api_fail('save_failed', 500);
    $pruned = backup_prune($keep); // shrink immediately when lowered
    api_json(array('ok' => true, 'keep' => $keep, 'pruned' => $pruned));
    break;
  }

  default:
    api_fail('unknown_action', 404);
}
