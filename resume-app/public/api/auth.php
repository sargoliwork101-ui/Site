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

// ---------------------------------------------------------------------------
// Secure sessions (HttpOnly + SameSite=Lax + Secure-when-HTTPS)
// ---------------------------------------------------------------------------
function sec_session_start() {
  $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || ((int)($_SERVER['SERVER_PORT'] ?? 80) === 443);
  session_name('rsess');
  session_set_cookie_params(array(
    'lifetime' => 0, // session cookie: cleared when the browser closes
    'path'     => '/',
    'secure'   => $https,
    'httponly' => true,
    'samesite' => 'Lax',
  ));
  if (session_status() === PHP_SESSION_NONE) { @session_start(); }
  $now = time();
  $expired = false;
  if (isset($_SESSION['last']) && ($now - (int)$_SESSION['last']) > SESSION_IDLE_TIMEOUT) {
    $expired = true; // idle too long
  }
  if (isset($_SESSION['created']) && ($now - (int)$_SESSION['created']) > SESSION_ABS_TIMEOUT) {
    $expired = true; // absolute lifetime exceeded
  }
  if ($expired) {
    $_SESSION = array();
    if (session_status() === PHP_SESSION_ACTIVE) { @session_destroy(); }
    if (session_status() === PHP_SESSION_NONE) { @session_start(); }
  }
  $_SESSION['last'] = $now;
  if (!isset($_SESSION['created'])) { $_SESSION['created'] = $now; }
}

function sec_is_authed() {
  return !empty($_SESSION['auth']) && $_SESSION['auth'] === true;
}

function sec_login() {
  if (session_status() === PHP_SESSION_ACTIVE) { @session_regenerate_id(true); }
  $_SESSION['auth'] = true;
  $_SESSION['user'] = 'admin';
  $_SESSION['created'] = time();
  $_SESSION['last'] = time();
}

function sec_logout() {
  $_SESSION = array();
  if (session_status() === PHP_SESSION_ACTIVE) { @session_destroy(); }
  if (!headers_sent()) {
    setcookie(session_name(), '', time() - 3600, '/');
  }
}

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
    $tmp = password_hash(bin2hex(random_bytes(8)), PASSWORD_DEFAULT);
    password_verify('x', $tmp);
  } catch (Exception $e) { /* ignore */ }
}

function valid_password($pw) {
  return is_string($pw) && strlen($pw) >= MIN_PASSWORD_LEN && strlen($pw) <= MAX_PASSWORD_LEN;
}

// ---------------------------------------------------------------------------
// OTP slots  (otp.json: {login:{...}, emailchange:{...}, reset:{...}})
// ---------------------------------------------------------------------------
function otp_issue($slot, $extra = array()) {
  $code = '';
  for ($i = 0; $i < OTP_LEN; $i++) { $code .= (string)random_int(0, 9); }
  $all = store_read('otp', array());
  $all[$slot] = array_merge(array(
    'hash'     => password_hash($code, PASSWORD_DEFAULT),
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
      'admin'         => array('hash' => password_hash($pw, PASSWORD_DEFAULT)),
      'recoveryEmail' => $email,
      'emailVerified' => false,
      'createdAt'     => time(),
    );
    if (!store_write('auth', $auth)) api_fail('storage_error', 500);

    $code = otp_issue('login');
    list($sent, $mailErr) = send_otp_mail($email, $code, 'verify');
    api_json(array('ok' => true, 'emailSent' => $sent, 'mailError' => $sent ? null : $mailErr));
    break;
  }

  case 'verify-setup-otp': {
    if (!auth_is_setup()) api_fail('not_setup', 409);
    list($allowed, $retry) = rate_limit('verify:' . $ip, RL_OTP_VERIFY[0], RL_OTP_VERIFY[1]);
    if (!$allowed) api_fail('rate_limit', 429, array('retryAfter' => $retry));

    $res = otp_check('login', $in['otp'] ?? '');
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
    if (!auth_is_setup()) api_fail('not_setup', 409);

    $user = strtolower(trim((string)($in['username'] ?? '')));
    $pw = $in['password'] ?? '';
    $auth = auth_get();

    // Generic failure either way (no account enumeration).
    if (!hash_equals('admin', $user)) { burn_dummy_hash(); api_fail('invalid_credentials', 401); }
    if (!is_string($pw) || !password_verify($pw, (string)$auth['admin']['hash'])) {
      burn_dummy_hash();
      api_fail('invalid_credentials', 401);
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
    $match = $auth !== null && hash_equals(strtolower((string)$auth['recoveryEmail']), $email);
    if ($match && valid_email($email)) {
      $code = otp_issue('login');
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
    $match = $auth !== null && hash_equals(strtolower((string)$auth['recoveryEmail']), $email);
    if (!$match) { burn_dummy_hash(); api_fail('invalid_code'); }

    $res = otp_check('login', $in['otp'] ?? '');
    if ($res === 'expired') api_fail('expired');
    if ($res !== 'ok') api_fail($res === 'locked' ? 'locked' : 'invalid_code');

    try {
      $token = bin2hex(random_bytes(32));
    } catch (Exception $e) {
      api_fail('random_failed', 500);
    }
    $all = store_read('otp', array());
    $all['reset'] = array(
      'hash' => password_hash($token, PASSWORD_DEFAULT),
      'exp'  => time() + RESET_TOKEN_TTL,
      'used' => false,
    );
    store_write('otp', $all);
    api_json(array('ok' => true, 'resetToken' => $token));
    break;
  }

  case 'reset-password': {
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
    $auth['admin']['hash'] = password_hash($pw, PASSWORD_DEFAULT);
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
    $auth['admin']['hash'] = password_hash($pw, PASSWORD_DEFAULT);
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

  default:
    api_fail('unknown_action', 404);
}
