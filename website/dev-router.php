<?php
/**
 * فقط برای تست محلی:  php -S 0.0.0.0:8080 dev-router.php
 * روی هاست واقعی نیازی به این فایل نیست (کارش را .htaccess انجام می‌دهد)
 */
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$file = __DIR__ . $path;

if ($path !== '/' && (is_file($file) || is_dir($file))) {
    return false; // فایل واقعی یا دایرکتوری (مثل /admin/) را همان سرور سرو کند
}

$_GET['r'] = ltrim($path, '/');
$_SERVER['SCRIPT_NAME'] = '/index.php';
require __DIR__ . '/index.php';
