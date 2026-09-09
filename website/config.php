<?php
/**
 * =====================================================
 *  تنظیمات کلی + لایه امنیتی سایت
 *  دو زبانه (FA/EN) — تم روشن فید — بدون تصویر
 * =====================================================
 */

define('APP_VERSION', '3.0');
define('MAX_UPLOAD_MB', 10);   // حداکثر حجم فایل آپلودی (مگابایت)

/* ---------------- تشخیص HTTPS ---------------- */
$is_https = (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off')
    || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
    || ((int)($_SERVER['SERVER_PORT'] ?? 0) === 443);
define('IS_HTTPS', (bool)$is_https);

/* شناسایی محیط پیش‌نمایش (برای عدم مسدودسازی فریم در پری‌ویو) */
$host = strtolower((string)($_SERVER['HTTP_HOST'] ?? ''));
define('IS_PREVIEW', $host !== '' && strpos($host, 'e2b.app') !== false);

if (session_status() === PHP_SESSION_NONE) {
    session_name('personal_site_sid');
    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Lax',
        'path'     => '/',
        'secure'   => IS_HTTPS,
    ]);
    session_start();
}

date_default_timezone_set('Asia/Tehran');

/* ---------------- سرورهای امنیتی (متد‌های جدید) ---------------- */
function security_headers() {
    // جلوگیری از کش شدن HTML مرورگر (همیشه کد به‌روز نمایش داده شود)
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    // Content Security Policy — بدون unsafe-inline (کل سایت بدون اسکریپت/استایل درون‌خطی است)
    $csp = "default-src 'self'; "
        . "script-src 'self'; "
        . "style-src 'self' https://fonts.googleapis.com; "
        . "font-src 'self' https://fonts.gstatic.com; "
        . "img-src 'self' data:; "
        . "connect-src 'self'; "
        . "object-src 'none'; "
        . "base-uri 'self'; "
        . "form-action 'self'";
    if (!IS_PREVIEW) {
        $csp .= "; frame-ancestors 'none'";
        header('X-Frame-Options: DENY');
    }
    header('Content-Security-Policy: ' . $csp);
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()');
    if (IS_HTTPS) {
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains', false);
    }
}
security_headers();

require __DIR__ . '/includes/functions.php';
require __DIR__ . '/includes/lang.php';
require __DIR__ . '/includes/db.php';
require __DIR__ . '/includes/auth.php';
