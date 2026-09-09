<?php
/**
 * احراز هویت پنل مدیریت + امنیت فرم‌ها (CSRF) + محدودیت ورود + زمان‌بندی نشست
 */

function is_logged_in() {
    return !empty($_SESSION['admin_ok']);
}

/**
 * محافظت صفحات پنل:
 * - لاگین اجباری
 * - بی‌فعالیتی بیش از ۳۰ دقیقه = خروج خودکار
 */
function require_login() {
    if (empty($_SESSION['admin_ok'])) {
        redirect(url('admin/login.php'));
    }
    if (time() - (int)($_SESSION['last_seen'] ?? 0) > 1800) {
        do_logout();
        redirect(url('admin/login.php') . '?expired=1');
    }
    $_SESSION['last_seen'] = time();
}

/** آیا رمز عبور پنل تعیین شده؟ */
function password_is_set() {
    $a = load_auth();
    return !empty($a['hash']);
}

/** وضعیت هش رمز (برای صفحه پایش امنیت) */
function password_hash_info() {
    $a = load_auth();
    if (empty($a['hash'])) return null;
    $algo = substr($a['hash'], 0, 4); // $2y$
    $cost = (int)substr($a['hash'], 4, 2);
    return ['algo' => $algo, 'cost' => $cost];
}

/** تلاش ورود */
function try_login($password) {
    $a = load_auth();
    if (!empty($a['hash']) && password_verify((string)$password, $a['hash'])) {
        session_regenerate_id(true);
        $_SESSION['admin_ok'] = 1;
        $_SESSION['last_seen'] = time();
        return true;
    }
    return false;
}

/** تعیین رمز جدید — bcrypt با cost=12 (توصیه‌ی امنیتی روز) */
function set_password($password, $email = null) {
    $a = load_auth() ?: [];
    $a['hash'] = password_hash((string)$password, PASSWORD_BCRYPT, ['cost' => 12]);
    if ($email !== null) {
        $em = trim((string)$email);
        if ($em !== '') $a['email'] = $em; // ایمیل بازیابی رمز
    }
    $a['created'] = date('Y-m-d H:i');
    return save_auth($a);
}

/* ---------------- بازیابی رمز با کد ایمیلی ---------------- */

/** ایمیل بازیابی: اول از auth.json؛ اگر ثبت نشده بود از ایمیل تنظیمات سایت */
function recovery_email() {
    $a = load_auth();
    if (!empty($a['email'])) return trim((string)$a['email']);
    $d = load_data();
    return trim((string)($d['settings']['email'] ?? ''));
}

/**
 * ساخت و ارسال کد بازیابی ۶ رقمی
 * محدودیت نرخ: هر ۲ دقیقه یک کد، حداکثر ۳ کد در ساعت
 */
function send_reset_code($email) {
    $a = load_auth() ?: [];
    $r = (array)($a['reset'] ?? []);
    $now = time();
    $t0 = (int)($r['t0'] ?? $now);
    if ($now - $t0 > 3600) { $t0 = $now; $r['count'] = 0; }
    if ($now - (int)($r['last'] ?? 0) < 120) {
        return ['ok' => false, 'error' => 'کد قبلاً ارسال شده؛ ۲ دقیقه صبر کنید و دوباره تلاش کنید.'];
    }
    if ((int)($r['count'] ?? 0) >= 3) {
        return ['ok' => false, 'error' => 'سقف ارسال کد در این ساعت پر شده؛ یک ساعت دیگر دوباره تلاش کنید.'];
    }
    $code = (string)random_int(100000, 999999);
    $host = preg_replace('/[^a-z0-9.\-]/i', '', (string)($_SERVER['SERVER_NAME'] ?? 'localhost'));
    if ($host === '') $host = 'localhost';
    $subject = '=?UTF-8?B?' . base64_encode('کد بازیابی رمز پنل مدیریت') . '?=';
    $body = "کد بازیابی رمز پنل مدیریت: $code\n"
          . "این کد تا ۱۵ دقیقه معتبر است.\n"
          . "اگر شما درخواست ندادید، این ایمیل را نادیده بگیرید.";
    $headers = "From: =?UTF-8?B?" . base64_encode('پنل مدیریت سایت') . "?= <no-reply@$host>\r\n"
             . "Content-Type: text/plain; charset=UTF-8";
    if (!@mail($email, $subject, $body, $headers)) {
        return ['ok' => false, 'error' => 'ارسال ایمیل روی این سرور ممکن نشد. اول از «تنظیمات ← آزمایش ایمیل» مطمئن شوید ارسال ایمیل روی هاست کار می‌کند.'];
    }
    $a['reset'] = [
        'code'  => hash('sha256', $code), // فقط هش کد ذخیره می‌شود
        'exp'   => $now + 900,            // ۱۵ دقیقه اعتبار
        'tries' => 0,
        'last'  => $now,
        'count' => (int)($r['count'] ?? 0) + 1,
        't0'    => $t0,
    ];
    if (!save_auth($a)) return ['ok' => false, 'error' => 'ذخیره‌سازی روی سرور انجام نشد؛ مجوز نوشتن پوشه data را بررسی کنید.'];
    return ['ok' => true];
}

/** بررسی کد دریافتی و اعمال رمز جدید (در صورت موفقیت، کد مصرف می‌شود) */
function apply_password_reset($code, $new) {
    if (mb_strlen((string)$new) < 8) return ['ok' => false, 'error' => 'رمز جدید باید حداقل ۸ کاراکتر باشد.'];
    $a = load_auth() ?: [];
    $r = (array)($a['reset'] ?? []);
    if (empty($r['code'])) return ['ok' => false, 'error' => 'ابتدا از «فراموشی رمز عبور» کد بگیرید.'];
    $now = time();
    if ($now > (int)$r['exp']) {
        unset($a['reset']); save_auth($a);
        return ['ok' => false, 'error' => 'کد منقضی شده است؛ دوباره کد بگیرید.'];
    }
    if ((int)$r['tries'] >= 6) {
        unset($a['reset']); save_auth($a);
        return ['ok' => false, 'error' => 'تلاش‌های ناموفق زیاد بود؛ دوباره کد بگیرید.'];
    }
    if (!hash_equals((string)$r['code'], hash('sha256', trim((string)$code)))) {
        $r['tries'] = (int)$r['tries'] + 1;
        $a['reset'] = $r;
        save_auth($a);
        return ['ok' => false, 'error' => 'کد واردشده اشتباه است.'];
    }
    $a['hash'] = password_hash((string)$new, PASSWORD_BCRYPT, ['cost' => 12]);
    $a['created'] = date('Y-m-d H:i');
    unset($a['reset']);
    if (!save_auth($a)) return ['ok' => false, 'error' => 'ذخیره‌سازی انجام نشد؛ مجوز نوشتن پوشه data را بررسی کنید.'];
    return ['ok' => true];
}

/** خروج از پنل */
function do_logout() {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

/* ---------------- CSRF ---------------- */

function csrf_token() {
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16));
    return $_SESSION['csrf'];
}

function csrf_field() {
    return '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '">';
}

function verify_csrf() {
    $sent = (string)($_POST['csrf'] ?? '');
    if ($sent === '' || !hash_equals(csrf_token(), $sent)) {
        http_response_code(400);
        exit('درخواست نامعتبر است (توکن امنیتی CSRF).');
    }
}

/* ---------------- محدودیت تلاش ورود ---------------- */

function login_lock_check($ip) {
    $f = data_dir() . '/lockout.json';
    $d = is_file($f) ? (json_decode((string)file_get_contents($f), true) ?: []) : [];
    if (!empty($d[$ip]['until']) && $d[$ip]['until'] > time()) return true;
    return false;
}

function login_lock_fail($ip) {
    $f = data_dir() . '/lockout.json';
    $d = is_file($f) ? (json_decode((string)file_get_contents($f), true) ?: []) : [];
    $d[$ip] = ['count' => (int)($d[$ip]['count'] ?? 0) + 1, 'until' => 0];
    if ($d[$ip]['count'] >= 6) {
        $d[$ip]['until'] = time() + 900;
        $d[$ip]['count'] = 0;
    }
    @mkdir(dirname($f), 0775, true);
    file_put_contents($f, json_encode($d), LOCK_EX);
}

function login_lock_reset($ip) {
    $f = data_dir() . '/lockout.json';
    if (!is_file($f)) return;
    $d = json_decode((string)file_get_contents($f), true) ?: [];
    if (isset($d[$ip])) {
        unset($d[$ip]);
        file_put_contents($f, json_encode($d), LOCK_EX);
    }
}

/** تعداد IPهای در حال قفل (برای پایش) */
function login_lock_count() {
    $f = data_dir() . '/lockout.json';
    if (!is_file($f)) return 0;
    $d = json_decode((string)file_get_contents($f), true) ?: [];
    $n = 0;
    foreach ($d as $ip => $v) {
        if (!empty($v['until']) && $v['until'] > time()) $n++;
    }
    return $n;
}
