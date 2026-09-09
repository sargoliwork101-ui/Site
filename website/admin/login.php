<?php
/**
 * ورود به پنل مدیریت:
 * - اولین بار: ساخت رمز عبور + ثبت ایمیل بازیابی
 * - ورود عادی
 * - فراموشی رمز: دریافت کد ایمیلی ۶ رقمی و تعیین رمز جدید
 */
require dirname(__DIR__) . '/config.php';
$_COOKIE['site_lang'] = 'fa';

if (is_logged_in()) redirect(url('admin/index.php'));

$error      = '';
$info       = '';
$need_setup = !password_is_set();
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

// حالت صفحه: ورود / درخواست کد / وارد کردن کد و رمز جدید
$mode = 'login';
if (!$need_setup && isset($_GET['forgot'])) $mode = 'forgot';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $action = (string)($_POST['action'] ?? 'login');

    if (login_lock_check($ip)) {
        $error = 'تلاش‌های ناموفق زیادی داشتید؛ برای ۱۵ دقیقه از ورود موقتاً جلوگیری شد.';
    } elseif ($need_setup) {
        /* ---------- اولین بار: ساخت رمز + ایمیل بازیابی ---------- */
        $p1 = (string)($_POST['password'] ?? '');
        $p2 = (string)($_POST['password2'] ?? '');
        $em = trim((string)($_POST['email'] ?? ''));
        if (mb_strlen($p1) < 8) {
            $error = 'رمز عبور باید حداقل ۸ کاراکتر باشد.';
        } elseif ($p1 !== $p2) {
            $error = 'دو رمز عبور یکسان نیستند.';
        } elseif ($em === '' || !filter_var($em, FILTER_VALIDATE_EMAIL)) {
            $error = 'یک ایمیل معتبر وارد کنید؛ کد بازیابی رمزِ فراموش‌شده به همین ایمیل فرستاده می‌شود.';
        } else {
            if (set_password($p1, $em)) {
                session_regenerate_id(true);
                $_SESSION['admin_ok'] = 1;
                $_SESSION['last_seen'] = time();
                redirect(url('admin/index.php'));
            }
            $error = 'ذخیره رمز عبور انجام نشد؛ دسترسی نوشتن به پوشه data را بررسی کنید.';
        }
    } elseif ($action === 'request_code') {
        /* ---------- فراموشی رمز: درخواست کد ---------- */
        $sent_email = trim((string)($_POST['email'] ?? ''));
        $to = recovery_email();
        if ($to === '') {
            $error = 'هنوز ایمیلی برای بازیابی ثبت نشده است. اگر به پنل دسترسی دارید از «تنظیمات ← تغییر رمز عبور» ایمیل بازیابی را ثبت کنید؛ در غیر این صورت فایل data/auth.json را حذف کنید تا دوباره رمز بسازید (محتوا حذف نمی‌شود).';
        } elseif ($sent_email === '') {
            $error = 'ایمیل خود را وارد کنید.';
        } elseif (!filter_var($sent_email, FILTER_VALIDATE_EMAIL)) {
            $error = 'ایمیل واردشده معتبر نیست.';
        } else {
            if ($sent_email === $to) {
                $res = send_reset_code($to);
                if ($res['ok']) {
                    $mode = 'reset';
                    $info = 'کد بازیابی ۶ رقمی به ایمیل شما ارسال شد؛ پوشه Spam را هم چک کنید. کد تا ۱۵ دقیقه معتبر است.';
                } else {
                    $error = $res['error'];
                }
            } else {
                // برای جلوگیری از حدس زدن ایمیل، پاسخ یکسان است
                $info = 'اگر این ایمیل درست باشد، کد بازیابی تا چند لحظه دیگر ارسال می‌شود.';
            }
        }
    } elseif ($action === 'do_reset') {
        /* ---------- فراموشی رمز: کد + رمز جدید ---------- */
        $p1 = (string)($_POST['password'] ?? '');
        $p2 = (string)($_POST['password2'] ?? '');
        $code = trim((string)($_POST['code'] ?? ''));
        if ($code === '') {
            $error = 'کد دریافتی را وارد کنید.';
        } elseif ($p1 !== $p2) {
            $error = 'دو رمز عبور یکسان نیستند.';
        } else {
            $res = apply_password_reset($code, $p1);
            if ($res['ok']) {
                session_regenerate_id(true);
                $_SESSION['admin_ok'] = 1;
                $_SESSION['last_seen'] = time();
                redirect(url('admin/index.php'));
            }
            $error = $res['error'];
            $mode = 'reset'; // برای تلاش دوباره، فرم کد باز بماند
        }
    } else {
        /* ---------- ورود عادی ---------- */
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
    <?php if ($need_setup): ?>
      <h1>ایجاد رمز عبور پنل</h1>
      <p class="sub">این اولین بار است که وارد می‌شوید. یک رمز عبور قوی (حداقل ۸ کاراکتر) انتخاب کنید و ایمیل خود را برای بازیابی رمز وارد کنید.</p>
      <?php if ($error): ?><div class="alert err"><?= e($error) ?></div><?php endif; ?>
      <form method="post">
        <?= csrf_field() ?>
        <input type="hidden" name="action" value="setup">
        <input class="input" type="password" name="password" placeholder="رمز عبور" required autofocus>
        <input class="input" type="password" name="password2" placeholder="تکرار رمز عبور" required>
        <input class="input in-ltr" type="email" name="email" dir="ltr" placeholder="ایمیل شما (برای بازیابی رمز)" value="<?= e((string)($_POST['email'] ?? '')) ?>" required>
        <button class="btn btn-primary btn-block">ایجاد رمز و ورود</button>
      </form>
    <?php elseif ($mode === 'forgot'): ?>
      <h1>بازیابی رمز عبور</h1>
      <p class="sub">ایمیلی که هنگام ساخت رمز (یا در تنظیمات پنل) ثبت کرده‌اید را وارد کنید؛ کد بازیابی ۶ رقمی برایتان ارسال می‌شود.</p>
      <?php if ($error): ?><div class="alert err"><?= e($error) ?></div><?php endif; ?>
      <?php if ($info): ?><div class="alert ok"><?= e($info) ?></div><?php endif; ?>
      <form method="post">
        <?= csrf_field() ?>
        <input type="hidden" name="action" value="request_code">
        <input class="input in-ltr" type="email" name="email" dir="ltr" placeholder="ایمیل بازیابی" value="<?= e((string)($_POST['email'] ?? '')) ?>" required autofocus>
        <button class="btn btn-primary btn-block">ارسال کد بازیابی</button>
      </form>
    <?php elseif ($mode === 'reset'): ?>
      <h1>بازیابی رمز عبور</h1>
      <p class="sub">کد ۶ رقمی دریافتی و رمز جدید را وارد کنید.</p>
      <?php if ($error): ?><div class="alert err"><?= e($error) ?></div><?php endif; ?>
      <?php if ($info): ?><div class="alert ok"><?= e($info) ?></div><?php endif; ?>
      <form method="post">
        <?= csrf_field() ?>
        <input type="hidden" name="action" value="do_reset">
        <input class="input in-ltr" type="text" name="code" dir="ltr" inputmode="numeric" maxlength="6" placeholder="کد ۶ رقمی" value="<?= e((string)($_POST['code'] ?? '')) ?>" required autofocus>
        <input class="input" type="password" name="password" placeholder="رمز جدید (حداقل ۸ کاراکتر)" required>
        <input class="input" type="password" name="password2" placeholder="تکرار رمز جدید" required>
        <button class="btn btn-primary btn-block">تغییر رمز و ورود</button>
      </form>
    <?php else: ?>
      <h1>ورود به پنل مدیریت</h1>
      <p class="sub">برای ویرایش محتوای سایت وارد شوید.</p>
      <?php if ($error): ?><div class="alert err"><?= e($error) ?></div><?php endif; ?>
      <?php if ($expired): ?><div class="alert warn">جلسه شما به‌دلیل ۳۰ دقیقه بی‌فعالیتی بسته شد؛ دوباره وارد شوید.</div><?php endif; ?>
      <form method="post">
        <?= csrf_field() ?>
        <input type="hidden" name="action" value="login">
        <input class="input" type="password" name="password" placeholder="رمز عبور" required autofocus>
        <button class="btn btn-primary btn-block">ورود</button>
      </form>
      <p class="login-foot"><a href="?forgot=1">رمز عبور را فراموش کرده‌اید؟ بازیابی با ایمیل</a></p>
    <?php endif; ?>
    <p class="login-foot"><a href="<?= e(url('')) ?>">← بازگشت به سایت</a></p>
  </div>
</div>
</body>
</html>
