<?php
/**
 * ============================================================================
 * CONTACT ATTACHMENT UPLOAD — optional contact-form file (<20MB)
 * ============================================================================
 * Accepts a single multipart file field named "attachment", validates size +
 * extension, stores it under /uploads/contact/ with an unguessable random
 * name, and returns its relative URL. The URL is referenced from the saved
 * message + admin email. Nothing stored here can execute (see guards below).
 */

require_once __DIR__ . '/store.php';
require_once __DIR__ . '/mailer.php';

define('UPLOAD_MAX_BYTES', 20971520); // 20MB
define('UPLOAD_ALLOWED_EXT', array('pdf','doc','docx','xls','xlsx','ppt','pptx','txt','csv','md','jpg','jpeg','png','gif','webp','zip','rar','7z'));
define('UPLOADS_DIR', dirname(API_DIR) . '/uploads/contact');

api_require_post();
$ip = client_ip();

list($allowed, $retry) = rate_limit('upload:' . $ip, RL_UPLOAD[0], RL_UPLOAD[1]);
if (!$allowed) api_fail('rate_limit', 429, array('retryAfter' => $retry));

if (!isset($_FILES['attachment']) || !is_array($_FILES['attachment'])) api_fail('no_file');

$f = $_FILES['attachment'];
$err = (int)($f['error'] ?? UPLOAD_ERR_NO_FILE);
if ($err === UPLOAD_ERR_INI_SIZE || $err === UPLOAD_ERR_FORM_SIZE) api_fail('too_large', 413);
if ($err !== UPLOAD_ERR_OK) api_fail('upload_failed');

$size = (int)($f['size'] ?? 0);
if ($size <= 0 || $size > UPLOAD_MAX_BYTES) api_fail('too_large', 413);

$orig = (string)($f['name'] ?? 'file');
$ext = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
if (!in_array($ext, UPLOAD_ALLOWED_EXT, true)) api_fail('bad_type');

if (!is_dir(UPLOADS_DIR)) {
  @mkdir(UPLOADS_DIR, 0755, true);
}
if (!is_dir(UPLOADS_DIR) || !is_writable(UPLOADS_DIR)) api_fail('storage_unavailable', 500);

// Runtime guards (also shipped in git — some upload tools skip dotfiles)
$ht = UPLOADS_DIR . '/.htaccess';
if (!is_file($ht)) {
  @file_put_contents($ht, "<FilesMatch \"\\.(php|phtml|phar|cgi|pl|py|sh)$\">\n  Require all denied\n</FilesMatch>\nOptions -Indexes -ExecCGI\nphp_flag engine off\n<IfModule mod_headers.c>\n  Header set X-Content-Type-Options \"nosniff\"\n</IfModule>\n");
}
$idx = UPLOADS_DIR . '/index.php';
if (!is_file($idx)) {
  @file_put_contents($idx, "<?php\nhttp_response_code(403);\nexit('Forbidden');\n");
}

try {
  $rand = bin2hex(random_bytes(16));
} catch (Exception $e) {
  $rand = md5(uniqid((string)mt_rand(), true));
}
$dest = UPLOADS_DIR . '/' . $rand . '.' . $ext;
$tmp = (string)($f['tmp_name'] ?? '');
if ($tmp === '' || !@move_uploaded_file($tmp, $dest)) api_fail('storage_unavailable', 500);
@chmod($dest, 0644);

api_json(array(
  'ok' => true,
  'url' => 'uploads/contact/' . $rand . '.' . $ext,
  'name' => $orig,
  'size' => $size,
));
