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
function set_password($password) {
    $a = load_auth() ?: [];
    $a['hash'] = password_hash((string)$password, PASSWORD_BCRYPT, ['cost' => 12]);
    $a['created'] = date('Y-m-d H:i');
    return save_auth($a);
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
