<?php
/** نقطه پایانی آپلود فایل برای پنل (JSON) */
require dirname(__DIR__) . '/config.php';
require_login();
$_COOKIE['site_lang'] = 'fa';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'error' => 'روش نامعتبر'], JSON_UNESCAPED_UNICODE);
    exit;
}
verify_csrf();

$type = (string)($_POST['type'] ?? 'image');
$exts = $type === 'file'
    ? ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'zip']
    : ['jpg', 'jpeg', 'png', 'webp', 'gif'];

if (isset($_FILES['file']) && is_array($_FILES['file'])) {
    $res = handle_upload($_FILES['file'], $exts);
    echo json_encode($res, JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(['ok' => false, 'error' => 'فایلی یافت نشد'], JSON_UNESCAPED_UNICODE);
}
