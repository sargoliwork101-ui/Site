<?php
/**
 * ============================================================================
 * SECURE SESSION HELPERS — shared by auth.php and content.php
 * ============================================================================
 * Single source of truth for session cookie flags + timeouts + rotation.
 * Every endpoint that reads the admin session MUST use sec_session_start()
 * so flags and expiry stay identical everywhere.
 */

require_once __DIR__ . '/config.php';

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
  // Rotate the session ID every 30 min while authenticated (anti-fixation).
  if (!empty($_SESSION['auth']) && $_SESSION['auth'] === true) {
    $regen = (int)($_SESSION['regen'] ?? 0);
    if (($now - $regen) > 1800) {
      if (session_status() === PHP_SESSION_ACTIVE) { @session_regenerate_id(true); }
      $_SESSION['regen'] = $now;
    }
  }
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

