<?php
/**
 * ============================================================================
 * SECURE SESSION HELPERS — shared by auth.php and content.php
 * ============================================================================
 * Single source of truth for session cookie flags + timeouts + rotation.
 * Every endpoint that reads the admin session MUST use sec_session_start()
 * so flags and expiry stay identical everywhere.
 */

/**
 * ── فارسی ──
 * تنها مرجع تنظیمات سشن امن (httponly/secure/samesite + انقضا + چرخش id).
 * هر endpoint که سشن ادمین می‌خونه باید sec_session_start() همین فایل رو
 * صدا بزنه. ⚠️ پرچم‌ها رو شل نکن (دزدیده‌شدن سشن = دسترسی به پنل).
 */

require_once __DIR__ . '/config.php';

// ---------------------------------------------------------------------------
// Secure sessions (HttpOnly + SameSite=Lax + Secure-when-HTTPS)
// ---------------------------------------------------------------------------
function sec_session_start() {
  // Private session directory: the shared /tmp is reaped by the HOST's own
  // garbage collector (24-min default — often by OTHER sites' GC runs or a
  // cron job), which would silently kill our 2h/12h sessions mid-edit and
  // every authed endpoint would start 401ing. Our own dir + matching GC
  // lifetime makes the app-level timeouts the ONLY expiry that applies.
  // (Files are 0600 by default and covered by api/data/.htaccess deny-all.)
  $sessDir = DATA_DIR . '/sessions';
  if (!is_dir($sessDir)) { @mkdir($sessDir, 0750, true); @chmod($sessDir, 0750); }
  if (is_dir($sessDir) && is_writable($sessDir)) {
    ini_set('session.save_path', $sessDir);
  }
  ini_set('session.gc_maxlifetime', (string)SESSION_ABS_TIMEOUT);
  ini_set('session.gc_probability', '1');
  ini_set('session.gc_divisor', '100');
  ini_set('session.use_strict_mode', '1');   // refuse uninitialized session IDs
  ini_set('session.use_cookies', '1');
  ini_set('session.use_only_cookies', '1');
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
    // Fresh ID for the replacement session (fixation hygiene: the old ID may
    // have been exposed while the expired session was still lying around).
    if (session_status() === PHP_SESSION_ACTIVE) { @session_regenerate_id(true); }
  }
  $_SESSION['last'] = $now;
  if (!isset($_SESSION['created'])) { $_SESSION['created'] = $now; }
  // NOTE: no periodic ID rotation on purpose. The ID rotates on privilege
  // change (login/logout/password-change, per OWASP) — rotating it every N
  // minutes races concurrent tabs: tab A rotates+deletes the file while
  // tab B's in-flight request still carries the old ID, and tab B eats a
  // spurious 401. Pruning happens via gc_maxlifetime + the timeouts above.
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
    // Mirror the session cookie flags — without Secure/SameSite the
    // browser keeps the old cookie and the logout silently fails.
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
          || ((int)($_SERVER['SERVER_PORT'] ?? 80) === 443);
    setcookie(session_name(), '', array(
      'expires'  => time() - 3600,
      'path'     => '/',
      'secure'   => $https,
      'httponly' => true,
      'samesite' => 'Lax',
    ));
  }
}

