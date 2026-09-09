<?php
/** ورود به پنل مدیریت — اولین بار که باز می‌شود، رمز عبور ساخته می‌شود */
require dirname(__DIR__) . '/config.php';
$_COOKIE['site_lang'] = 'fa';

if (is_logged_in()) redirect(url('admin/index.php'));

$error      = '';
$need_setup = !password_is_set();
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    if (login_lock_check($ip)) {
        $error = 'تلاش‌های ناموفق زیادی داشتید؛ برای ۱۵ دقیقه از ورود موقتاً جلوگیری شد.';
    } elseif ($need_setup) {
        $p1 = (string)($_POST['password'] ?? '');
        $p2 = (string)($_POST['password2'] ?? '');
        if (mb_strlen($p1) < 8) {
            $error = 'رمز عبور باید حداقل ۸ کاراکتر باشد.';
        } elseif ($p1 !== $p2) {
            $error = 'دو رمز عبور یکسان نیستند.';
        } else {
            if (set_password($p1)) {
                session_regenerate_id(true);
                $_SESSION['admin_ok'] = 1;
                $_SESSION['last_seen'] = time();
                redirect(url('admin/index.php'));
            }
            $error = 'ذخیره رمز عبور انجام نشد؛ دسترسی نوشتن به پوشه data را بررسی کنید.';
        }
    } else {
        if (try_login((string)($_POST['password'] ?? ''))) {
            login_lock_reset($ip);
            redirect(url('admin/index.php'));
        }
        login_lock_fail($ip);
        $error = 'رمز عبور اشتباه است.';
        sleep(1); // کُندسازی حمله brute-force
    }
}
$expired = !empty($_GET['expired']);
?>
<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ورود به پنل مدیریت</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="<?= e(url('assets/css/style.css')) ?>">
</head>
<body>
<div class="login-wrap">
  <div class="login-card">
    <div class="login-logo">⚙️</div>
    <h1><?= $need_setup ? 'ایجاد رمز عبور پنل' : 'ورود به پنل مدیریت' ?></h1>
    <p class="sub">
      <?= $need_setup
          ? 'این اولین بار است که وارد می‌شوید. یک رمز عبور قوی (حداقل ۸ کاراکتر) انتخاب کنید.'
          : 'برای ویرایش محتوای سایت وارد شوید.' ?>
    </p>
    <?php if ($error): ?><div class="alert err"><?= e($error) ?></div><?php endif; ?>
    <?php if ($expired): ?><div class="alert warn">جلسه شما به‌دلیل ۳۰ دقیقه بی‌فعالیتی بسته شد؛ دوباره وارد شوید.</div><?php endif; ?>
    <form method="post">
      <?= csrf_field() ?>
      <input class="input" type="password" name="password" placeholder="رمز عبور" required autofocus>
      <?php if ($need_setup): ?>
        <input class="input" type="password" name="password2" placeholder="تکرار رمز عبور" required>
      <?php endif; ?>
      <button class="btn btn-primary btn-block"><?= $need_setup ? 'ایجاد رمز و ورود' : 'ورود' ?></button>
    </form>
    <p class="login-foot"><a href="<?= e(url('')) ?>">← بازگشت به سایت</a></p>
  </div>
</div>
</body>
</html>
