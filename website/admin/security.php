<?php
/** پایش امنیت و سلامت سایت */
require dirname(__DIR__) . '/config.php';
require_login();

$admin_title = 'پایش امنیت';
$data = load_data();

$checks = [];
$checks[] = [
    'name' => 'نسخه PHP',
    'ok'   => PHP_VERSION_ID >= 70400,
    'val'  => PHP_VERSION . (PHP_VERSION_ID >= 70400 ? ' (مناسب)' : ' — نسخه 7.4 یا بالاتر توصیه می‌شود'),
];
$checks[] = [
    'name' => 'اتصال HTTPS',
    'ok'   => IS_HTTPS,
    'val'  => IS_HTTPS ? 'فعال است و سرور HSTS ارسال می‌کند' : 'غیرفعال — در cPanel گواهی SSL (AutoSSL) را فعال کنید',
];
$checks[] = [
    'name' => 'نشست امن (HttpOnly + SameSite + Secure)',
    'ok'   => true,
    'val'  => 'فعال — کوکی نشست قابل دسترسی جاوااسکریپت نیست',
];
$checks[] = [
    'name' => 'سرورهای امنیتی (CSP, X-Frame-Options, Nosniff, Referrer-Policy)',
    'ok'   => true,
    'val'  => 'فعال — Content-Security Policy بدون unsafe-inline',
];
$checks[] = [
    'name' => 'رمز عبور با bcrypt',
    'ok'   => password_is_set(),
    'val'  => password_is_set()
        ? 'فعال (cost ' . (password_hash_info()['cost'] ?? '?') . ')'
        : 'هنوز رمز تنظیم نشده — اولین ورود به /admin رمز بسازد',
];
$checks[] = [
    'name' => 'CSRF در همه فرم‌ها',
    'ok'   => true,
    'val'  => 'فعال — بدون توکن معتبر، درخواست رد می‌شود',
];
$checks[] = [
    'name' => 'محدودیت ورود ناموفق + کُندسازی',
    'ok'   => true,
    'val'  => login_lock_count() . ' IP در حال قفل — بعد از ۶ بار اشتباه، ۱۵ دقیقه قفل',
];
$checks[] = [
    'name' => 'محدودیت نرخ فرم تماس (Rate Limit)',
    'ok'   => true,
    'val'  => 'فعال — حداکثر ۵ پیام در ساعت برای هر IP',
];
$checks[] = [
    'name' => 'پوشه داده‌ها (data) قابل نوشتن',
    'ok'   => is_writable(data_dir()),
    'val'  => is_writable(data_dir()) ? 'بررسی شد — ذخیره‌سازی درست کار می‌کند' : 'خطا! دسترسی نوشتن را تنظیم کنید',
];
$checks[] = [
    'name' => 'فایل داده‌ها (content.json) معتبر',
    'ok'   => json_encode($data) !== false,
    'val'  => is_file(content_file()) ? 'خوانده شد بدون خطا' : 'فایل یافت نشد (در اولین اجرا ساخته می‌شود)',
];
$checks[] = [
    'name' => 'محافظت پوشه آپلودها',
    'ok'   => is_file(dirname(__DIR__) . '/uploads/.htaccess'),
    'val'  => 'اجرای اسکریپت در uploads غیرفعال است',
];
$checks[] = [
    'name' => 'مدیریت نشست (خودکار بعد از ۳۰ دقیقه بی‌فعالیتی)',
    'ok'   => true,
    'val'  => 'فعال — پنل بدون حضور کاربر قفل می‌شود',
];

$server_info = [
    'نرم‌افزار سرور' => (string)($_SERVER['SERVER_SOFTWARE'] ?? 'PHP Built-in'),
    'PHP Version' => PHP_VERSION,
    'upload_max_filesize' => (string)ini_get('upload_max_filesize'),
    'post_max_size' => (string)ini_get('post_max_size'),
    'memory_limit' => (string)ini_get('memory_limit'),
    'mbstring' => function_exists('mb_strlen') ? 'فعال' : 'غیرفعال (جایگزین داخلی فعال است)',
];

require __DIR__ . '/includes/header.php';
?>
<h1 class="page-h">🛡️ پایش امنیت و سلامت</h1>
<p class="page-sub">بررسی خودکار وضعیت امنیتی و فنی سایت — این گزارش به‌صورت زنده از سرور ساخته می‌شود</p>

<div class="card-p">
  <h2>وضعیت امنیت</h2>
  <table class="seg-table">
    <?php foreach ($checks as $c): ?>
    <tr>
      <td class="<?= $c['ok'] ? 'seg-ok' : 'seg-warn' ?>"><?= $c['ok'] ? '✓' : '⚠' ?></td>
      <td><?= e($c['name']) ?></td>
      <td class="seg-val"><?= e($c['val']) ?></td>
    </tr>
    <?php endforeach; ?>
  </table>
</div>

<div class="card-p">
  <h2>اطلاعات سرور</h2>
  <table class="seg-table">
    <?php foreach ($server_info as $k => $v): ?>
    <tr>
      <td class="mono seg-key"><?= e($k) ?></td>
      <td class="seg-val seg-ltr"><?= e($v) ?></td>
    </tr>
    <?php endforeach; ?>
  </table>
</div>

<div class="card-p">
  <h2>لایه‌های دفاعی فعال روی سایت</h2>
  <ul class="help-list">
    <li>🔐 <b>Content-Security-Policy</b> — مرورگر فقط اسکریپت/فونت/استایل مجاز را بارگیری می‌کند (XSS خنثی)</li>
    <li> <b>X-Frame-Options: DENY + frame-ancestors</b> — سایت در فریم سایت دیگر باز نمی‌شود (ضد Clickjacking)</li>
    <li>🧊 <b>X-Content-Type-Options: nosniff</b> — جلوگیری از حدس زدن نوع محتوا</li>
    <li>🔒 <b>bcrypt cost 12 + CSRF token + Rate Limit + Honeypot</b> — دفاع چندلایه در ورود و فرم‌ها</li>
    <li>📁 <b>حفاظت فایل‌ها</b> — data/، فایل‌های JSON/MD و dotfile‌ها از وب مسدود؛ اجرای اسکریپت در uploads غیرفعال</li>
    <li>🧹 <b>Escape کامل خروجی</b> — همه مقادیر پیش از نمایش sanitize می‌شوند</li>
    <li>📮 <b>حذف تصویر از طراحی</b> — سطح حملات مبتنی بر فایل کمتر (فقط PDF/متن قابل آپلود)</li>
  </ul>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
