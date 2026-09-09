<?php
/**
 * صفحه اصلی و مسیریاب (Router) سایت عمومی
 */
require __DIR__ . '/config.php';

/* ---------------- تغییر زبان (?set_lang=en|fa) ---------------- */
if (isset($_GET['set_lang'])) {
    $l = in_array($_GET['set_lang'], ['fa', 'en'], true) ? $_GET['set_lang'] : 'fa';
    setcookie('site_lang', $l, time() + 86400 * 365, '/', '', IS_HTTPS);
    $_COOKIE['site_lang'] = $l;
    $uri   = (string)($_SERVER['REQUEST_URI'] ?? '/');
    $parts = explode('?', $uri, 2);
    parse_str($parts[1] ?? '', $q);
    unset($q['set_lang']);
    $newq = http_build_query($q);
    redirect($parts[0] . ($newq !== '' ? '?' . $newq : ''));
}

$data = load_data();
$s    = $data['settings'] ?? [];
$route = current_route();
$page_title = $s['person_name'] ?? 'Site';

/* ---------------- فرم تماس (+ محدودیت نرخ) ---------------- */
if ($route === 'contact' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $name  = trim((string)($_POST['name'] ?? ''));
    $email = trim((string)($_POST['email'] ?? ''));
    $msg   = trim((string)($_POST['message'] ?? ''));
    $ip    = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

    if (isset($_POST['website_hp']) && trim((string)$_POST['website_hp']) !== '') {
        // honeypot: ربات است؛ گمانه می‌رود ارسال موفق بوده
        $contact_result = 'sent';
    } elseif (!contact_rate_ok($ip)) {
        $contact_result = 'rate';
    } elseif ($name === '' || $msg === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $contact_result = 'error';
    } else {
        $to = (string)($s['email'] ?? '');
        $subject = '=?UTF-8?B?' . base64_encode('تماس از وبسایت: ' . $name) . '?=';
        $body = "نام: $name\nایمیل: $email\n\n$message\n\n--\nارسال از فرم تماس وبسایت";
        $headers = "From: =?UTF-8?B?" . base64_encode($s['person_name'] ?? 'وبسایت') . "?= <no-reply@" . ($_SERVER['SERVER_NAME'] ?? 'localhost') . ">\r\nContent-Type: text/plain; charset=UTF-8";
        $contact_result = ($to !== '' && @mail($to, $subject, $body, $headers)) ? 'sent' : 'fallback';
    }
    redirect(url('contact') . '?sent=' . $contact_result);
}

/* ---------------- مسیریابی ---------------- */
$view = null;
switch (true) {
    case $route === '':
        $view = __DIR__ . '/views/home.php';
        $page_title = $s['person_name'] ?? 'Site';
        break;

    case $route === 'about':
        $view = __DIR__ . '/views/about.php';
        $page_title = t('page_about');
        break;

    case $route === 'works':
        $view = __DIR__ . '/views/works.php';
        $page_title = t('page_works');
        break;

    case (preg_match('#^work/([a-z0-9]+)$#i', $route, $m) && ($work = find_item($data['works'] ?? [], $m[1]))):
        $view = __DIR__ . '/views/work.php';
        $page_title = b_any($work['title'] ?? '');
        break;

    case $route === 'papers':
        $view = __DIR__ . '/views/papers.php';
        $page_title = t('page_papers');
        break;

    case $route === 'contact':
        $view = __DIR__ . '/views/contact.php';
        $page_title = t('page_contact');
        break;

    default:
        http_response_code(404);
        $view = __DIR__ . '/views/404.php';
        $page_title = '404';
}

require __DIR__ . '/includes/header.php';
require $view;
require __DIR__ . '/includes/footer.php';
