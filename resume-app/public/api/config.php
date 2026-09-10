<?php
/**
 * ============================================================================
 * API CONFIG — shared constants, JSON helpers, request guards
 * ============================================================================
 * PHP >= 7.3 required (7.4+ recommended). No extensions required.
 * No secrets live in this file — it is safe if ever served as text.
 */

declare(strict_types=1);

// Production: NEVER print PHP errors (they would break JSON and leak paths).
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

define('API_VERSION', '1.0.0');
define('API_DIR', __DIR__);
define('DATA_DIR', API_DIR . '/data');

// --- Password policy ---
define('MIN_PASSWORD_LEN', 8);
// 72 = bcrypt's hard limit (bytes beyond it are silently IGNORED by the
// algorithm). Capped here so a 100-char password can never verify as its
// 72-char prefix. Applies uniformly even where Argon2 is available.
define('MAX_PASSWORD_LEN', 72);

// --- OTP policy ---
define('OTP_LEN', 6);
define('OTP_TTL', 300);            // 5 minutes
define('OTP_MAX_ATTEMPTS', 5);
define('OTP_RESEND_COOLDOWN', 60); // seconds

// --- Reset-token policy ---
define('RESET_TOKEN_TTL', 600);    // 10 minutes, single use

// --- Rate limits: [max attempts, window seconds] ---
define('RL_SETUP', [10, 3600]);
define('RL_LOGIN', [5, 300]);
// --- Brute-force lockout: N wrong passwords → hard freeze + email alert ---
define('LOCKOUT_FAILS', 3);
define('LOCKOUT_SECONDS', 30);
define('LOCKOUT_FAIL_WINDOW', 600);    // failures older than 10 min don't count
define('LOCKOUT_ALERT_COOLDOWN', 300); // max 1 alert email per 5 min per IP
define('RL_OTP_REQUEST', [3, 600]);
define('RL_OTP_VERIFY', [10, 600]);
define('RL_CONTACT', [5, 3600]);
define('RL_UPLOAD', [5, 3600]);
define('RL_BACKUP', [10, 3600]);      // server backup save/list/get/delete/config
define('RL_CONTENT', [60, 3600]);       // live-content publish (authed admin)
define('RL_CONTENT_GET', [60, 60]);     // live-content fetch (public, per IP)
define('CONTENT_MAX_BYTES', 12582912);  // 12MB live-content cap (base64 images included)
define('BACKUP_MAX_BYTES', 12582912); // 12MB envelope cap (base64 images included)
define('BACKUP_KEEP_MIN', 1);
define('BACKUP_KEEP_MAX', 10);
define('BACKUP_KEEP_DEFAULT', 2);

// --- Session timeouts ---
define('SESSION_IDLE_TIMEOUT', 7200);  // 2 hours idle
define('SESSION_ABS_TIMEOUT', 43200); // 12 hours absolute

// --- Mail From address ---
// null = auto "noreply@<your-domain>". For best deliverability set an address
// on YOUR OWN domain (matching your SPF record), e.g. 'noreply@example.ir'.
// define('MAIL_FROM', null);  -- set below via constant fallback
if (!defined('MAIL_FROM')) {
  define('MAIL_FROM', null);
}

/** Send a JSON response and stop. */
function api_json($data, $code = 200) {
  http_response_code($code);
  header('Content-Type: application/json; charset=utf-8');
  header('X-Content-Type-Options: nosniff');
  header('Cache-Control: no-store, no-cache, must-revalidate');
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

/** Send a JSON error and stop. */
function api_fail($error, $code = 400, $extra = array()) {
  $payload = array('ok' => false, 'error' => (string)$error);
  foreach ($extra as $k => $v) { $payload[$k] = $v; }
  api_json($payload, $code);
}

/**
 * Require a same-origin AJAX POST (cheap, effective CSRF defense:
 * a cross-site <form> cannot set custom headers).
 */
function api_require_post() {
  if (strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    api_fail('method_not_allowed', 405);
  }
  $xrw = trim($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '');
  if (strcasecmp($xrw, 'XMLHttpRequest') !== 0) {
    api_fail('forbidden', 403);
  }
}

/** Parse JSON request body into an array (empty array on any failure). */
function api_input() {
  $raw = file_get_contents('php://input');
  if (!is_string($raw) || $raw === '') return array();
  if (strlen($raw) > 16777216) api_fail('too_large', 413); // 16MB hard cap
  $data = json_decode($raw, true);
  return is_array($data) ? $data : array();
}

/** Strict email validation. */
function valid_email($email) {
  if (!is_string($email)) return false;
  $email = trim($email);
  if ($email === '' || strlen($email) > 254) return false;
  return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Client IP for rate limiting. Uses ONLY REMOTE_ADDR (never X-Forwarded-For)
 * so it cannot be spoofed. Note: behind Cloudflare/proxies all visitors share
 * the proxy IP — acceptable for this single-admin API.
 */
function client_ip() {
  $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
  return is_string($ip) && $ip !== '' ? $ip : '0.0.0.0';
}

/**
 * Ensure the runtime data dir exists and is guarded. The guards are written
 * at RUNTIME too (not only shipped in git) because some upload tools silently
 * skip dotfiles like .htaccess.
 */
function ensure_data_dir() {
  if (!is_dir(DATA_DIR)) {
    @mkdir(DATA_DIR, 0750, true);
    @chmod(DATA_DIR, 0750);
  }
  if (!is_dir(DATA_DIR) || !is_writable(DATA_DIR)) return false;

  $ht = DATA_DIR . '/.htaccess';
  if (!is_file($ht)) {
    @file_put_contents($ht, "<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n  Order Allow,Deny\n  Deny from all\n</IfModule>\n");
  }
  $idx = DATA_DIR . '/index.php';
  if (!is_file($idx)) {
    @file_put_contents($idx, "<?php\nhttp_response_code(403);\nexit('Forbidden');\n");
  }
  return true;
}
