<?php
/**
 * توابع کمکی عمومی
 */

/* ---------- جایگزین‌های UTF-8 (اگر mbstring روی هاست فعال نباشد) ---------- */
function _utf8_chars($s) {
    static $cache = [];
    $s = (string)$s;
    if (!isset($cache[$s])) {
        preg_match_all('/./us', $s, $m);
        $cache[$s] = $m[0];
        if (count($cache) > 500) $cache = []; // جلوگیری از رشد بیش‌ازحد
    }
    return $cache[$s];
}
if (!function_exists('mb_strlen')) {
    function mb_strlen($s) { return count(_utf8_chars($s)); }
}
if (!function_exists('mb_substr')) {
    function mb_substr($s, $start, $len = null) {
        $chars = _utf8_chars($s);
        if ($len === null) return implode('', array_slice($chars, $start));
        return implode('', array_slice($chars, $start, (int)$len));
    }
}
if (!function_exists('mb_strtolower')) {
    function mb_strtolower($s) { return strtolower((string)$s); }
}

/** فرار از HTML (جلوگیری از XSS) */
function e($s) {
    return htmlspecialchars((string)($s ?? ''), ENT_QUOTES, 'UTF-8');
}

/** مسیر ریشه سایت (هم در ریشه دامین کار می‌کند، هم زیرپوشه) */
function app_root() {
    /* همیشه «ریشه‌ی سایت» را برمی‌گرداند — حتی وقتی از داخل /admin اجرا می‌شود */
    static $root = null;
    if ($root === null) {
        $script = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '/');
        $dir = rtrim(dirname($script), '/');
        if (basename($dir) === 'admin') $dir = dirname($dir);
        $root = rtrim($dir, '/');
    }
    return $root;
}

/** ساخت لینک داخل سایت */
function url($path = '') {
    return app_root() . '/' . ltrim((string)$path, '/');
}

/** مسیر فعلی در صفحه اصلی (index.php?r=...) */
function current_route() {
    return trim((string)($_GET['r'] ?? ''), '/');
}

/** نسخه‌ی cache-busting بر اساس زمان تغییر فایل (جلوگیری از کش قدیمی مرورگر) */
function asset_v($rel) {
    static $root = null;
    if ($root === null) $root = dirname(__DIR__);
    $m = @filemtime($root . '/' . ltrim((string)$rel, '/'));
    return $m !== false ? '?' . $m : '';
}

function redirect($loc) {
    header('Location: ' . $loc);
    exit;
}

/** خلاصه‌ی کوتاه از یک متن */
function excerpt($text, $len = 110) {
    $text = trim(strip_tags((string)$text));
    if ($text === '') return '';
    if (mb_strlen($text) <= $len) return $text;
    return mb_substr($text, 0, $len) . '…';
}

/** تبدیل متن به آرایه با ویرگول فارسی/انگلیسی */
function str_list($s) {
    $parts = preg_split('/[,،]/', (string)$s);
    $out = [];
    foreach ($parts as $p) {
        $p = trim($p);
        if ($p !== '') $out[] = mb_substr($p, 0, 120);
    }
    return $out;
}

/** تبدیل ارقام فارسی/عربی به انگلیسی (برای مرتب‌سازی) */
function to_num($s) {
    $s = (string)$s;
    $s = strtr($s, '۰۱۲۳۴۵۶۷۸۹', '0123456789');
    $s = strtr($s, '٠١٢٣٤٥٦٧٨٩', '0123456789');
    return $s;
}

/** تبدیل متن ساده به پاراگراف HTML */
function text_to_html($s) {
    $s = trim((string)$s);
    if ($s === '') return '';
    $out = '';
    foreach (preg_split('/\n\s*\n+/', $s) as $block) {
        $block = trim($block);
        if ($block === '') continue;
        $out .= '<p>' . nl2br(e($block)) . '</p>';
    }
    return $out;
}

/** پیدا کردن آیتم از روی id */
function find_item(array $items, $id) {
    foreach ($items as $it) {
        if (($it['id'] ?? '') === $id) return $it;
    }
    return null;
}

/** id جدید */
function new_id() {
    return bin2hex(random_bytes(4));
}

/**
 * خواندن لیست‌های داینامیک دوزبانه (تحصیلات / سوابق)
 * ورودی JSON از پنل: [{title_fa, title_en, org_fa, org_en, year, desc_fa, desc_en}, ...]
 */
function parse_rows($json) {
    $rows = json_decode((string)$json, true);
    if (!is_array($rows)) return [];
    $out = [];
    foreach ($rows as $r) {
        if (!is_array($r)) continue;
        $row = [
            'title' => [
                'fa' => trim((string)($r['title_fa'] ?? '')),
                'en' => trim((string)($r['title_en'] ?? '')),
            ],
            'org' => [
                'fa' => trim((string)($r['org_fa'] ?? '')),
                'en' => trim((string)($r['org_en'] ?? '')),
            ],
            'year' => trim((string)($r['year'] ?? '')),
            'desc' => [
                'fa' => trim((string)($r['desc_fa'] ?? '')),
                'en' => trim((string)($r['desc_en'] ?? '')),
            ],
        ];
        $empty = $row['title']['fa'] === '' && $row['title']['en'] === ''
            && $row['org']['fa'] === '' && $row['org']['en'] === ''
            && $row['desc']['fa'] === '' && $row['desc']['en'] === ''
            && $row['year'] === '';
        if (!$empty) $out[] = $row;
    }
    return $out;
}

/**
 * آپلود فایل — نتیجه: ['ok'=>true,'url'=>'uploads/..'] یا ['ok'=>false,'error'=>'...']
 */
function handle_upload($file, array $exts, $max_mb = null) {
    $max_mb = $max_mb ?: MAX_UPLOAD_MB;
    if (!isset($file['name']) || $file['error'] === UPLOAD_ERR_NO_FILE) {
        return ['ok' => false, 'error' => 'فایلی انتخاب نشده است.'];
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['ok' => false, 'error' => 'در دریافت فایل خطایی رخ داد (کد ' . (int)$file['error'] . ').'];
    }
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $exts, true)) {
        return ['ok' => false, 'error' => 'قالب فایل مجاز نیست. (قالب‌های مجاز: ' . implode('، ', $exts) . ')'];
    }
    if ($file['size'] > $max_mb * 1024 * 1024) {
        return ['ok' => false, 'error' => 'حجم فایل بیشتر از ' . (int)$max_mb . ' مگابایت است.'];
    }
    // بررسی تطابق نوع فایل با پسوند
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        $allowed = [
            'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png',
            'gif' => 'image/gif', 'webp' => 'image/webp', 'svg' => 'image/svg+xml',
            'pdf' => 'application/pdf',
        ];
        if (isset($allowed[$ext]) && $mime !== $allowed[$ext] && $mime !== 'application/octet-stream') {
            return ['ok' => false, 'error' => 'نوع فایل با پسوند آن مطابقت ندارد.'];
        }
    }
    $dir = dirname(__DIR__) . '/uploads';
    if (!is_dir($dir)) @mkdir($dir, 0775, true);
    $name = date('ymd') . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
    if (!move_uploaded_file($file['tmp_name'], $dir . '/' . $name)) {
        return ['ok' => false, 'error' => 'ذخیره فایل ناموفق بود (مجوز نوشتن پوشه uploads را بررسی کنید).'];
    }
    return ['ok' => true, 'url' => 'uploads/' . $name];
}

/* ---------------- پاک‌سازی فایل‌های آپلود ---------------- */

/** آیا مسیر، فایل آپلودی است که خود سایت ساخته؟ (برای پاک‌سازی امن) */
function is_managed_upload_path($rel) {
    return is_string($rel) && preg_match('#^uploads/[0-9]{6}_[0-9a-f]{16}\.pdf$#i', $rel) === 1;
}

/** آیا فایلی هنوز در داده‌های سایت ارجاع شده؟ */
function upload_referenced(array $data, $rel) {
    foreach (['cv_pdf', 'avatar'] as $k) {
        if ((string)($data['settings'][$k] ?? '') === $rel) return true;
    }
    foreach (($data['papers'] ?? []) as $p) {
        if ((string)($p['pdf'] ?? '') === $rel) return true;
    }
    return false;
}

/**
 * حذف امن فایل آپلودی که دیگر ارجاعی ندارد:
 * فقط فایل‌های با الگوی نام خود سایت و فقط داخل پوشه uploads
 */
function unlink_upload(array $data, $rel) {
    $rel = (string)$rel;
    if (!is_managed_upload_path($rel) || upload_referenced($data, $rel)) return false;
    $base = realpath(dirname(__DIR__) . '/uploads');
    $abs  = realpath(dirname(__DIR__) . '/' . $rel);
    if ($base === false || $abs === false || strncmp($abs, $base . DIRECTORY_SEPARATOR, strlen($base) + 1) !== 0) {
        return false;
    }
    return @unlink($abs);
}

/** پیام موقت (flash) */
function flash($msg = null, $type = 'ok') {
    if ($msg !== null) {
        $_SESSION['flash'] = ['msg' => $msg, 'type' => $type];
        return;
    }
    if (!empty($_SESSION['flash'])) {
        $f = $_SESSION['flash'];
        unset($_SESSION['flash']);
        return $f;
    }
    return null;
}

/* ---------------- محدودیت نرخ فرم تماس (per IP) ---------------- */
function contact_rate_ok($ip) {
    $f = data_dir() . '/rate.json';
    $d = is_file($f) ? (json_decode((string)file_get_contents($f), true) ?: []) : [];
    $now = time();
    if (!isset($d[$ip]) || $now - (int)$d[$ip]['t0'] > 3600) {
        $d[$ip] = ['n' => 0, 't0' => $now];
    }
    if ($d[$ip]['n'] >= 5) return false;
    $d[$ip]['n']++;
    @mkdir(dirname($f), 0775, true);
    file_put_contents($f, json_encode($d), LOCK_EX);
    return true;
}

/* ---------------- آیکون دسته‌بندی پروژه (SVG، بدون تصویر) ---------------- */
function cat_icon($label) {
    $txt = mb_strtolower(b_any($label) . ' ' . (is_array($label) ? b($label, 'en') : ''));
    $icons = [
        'chip'   => ['pcb', 'board', 'brd', 'کیکاد', 'kicad', 'altium', 'برد', 'طراحی pcb'],
        'power'  => ['power', 'بms', 'bms', 'تغذیه', 'قدرت', 'شارژر', 'inverter', 'اینورتر'],
        'wifi'   => ['iot', 'iot', 'سنسور', 'sensor', 'wireless', 'lora', 'لوورا', 'ارتباطات بی‌سیم'],
        'gear'   => ['motor', 'موتور', 'robot', 'روبوت', 'درایور', 'driver', 'bldc', 'کنترل موتور'],
        'wave'   => ['rf', 'rf', 'آنتن', 'antenna', 'مخابرات', 'radio', 'فرکانس'],
    ];
    $icon = 'box';
    foreach ($icons as $name => $keys) {
        foreach ($keys as $k) {
            if (strpos($txt, $k) !== false) { $icon = $name; break 2; }
        }
    }
    $svg = [
        'chip'  => '<rect x="6" y="6" width="12" height="12" rx="2.5"/><rect x="9.8" y="9.8" width="4.4" height="4.4" rx="1"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
        'power' => '<path d="M13 2.5 4.5 13.5H10l-1 8 8.5-11H12l1-8z"/>',
        'wifi'  => '<path d="M2.5 9.5a15 15 0 0 1 19 0M5.5 13a10 10 0 0 1 13 0M8.5 16.3a5.5 5.5 0 0 1 7 0"/><circle cx="12" cy="19.3" r="1.5" fill="currentColor" stroke="none"/>',
        'gear'  => '<circle cx="12" cy="12" r="3.4"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.2 5.2l1.9 1.9M16.9 16.9l1.9 1.9M18.8 5.2l-1.9 1.9M7.1 16.9l-1.9 1.9"/>',
        'wave'  => '<path d="M2 12c2-4.6 4.4-4.6 6.4 0s4.4 4.6 6.4 0 4.4-4.6 7.2 0"/>',
        'box'   => '<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>',
    ];
    return '<svg class="cat-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' . $svg[$icon] . '</svg>';
}

/* ---------------- نشان چیپ (Hero، بدون تصویر) ---------------- */
function chip_emblem() {
    return '<svg class="chip-emblem" viewBox="0 0 220 220" fill="none" aria-hidden="true">'
        . '<defs><linearGradient id="chipG" x1="0" y1="0" x2="1" y2="1">'
        . '<stop offset="0" stop-color="#4f46e5"/><stop offset="1" stop-color="#0891b2"/>'
        . '</linearGradient></defs>'
        . '<g class="chip-pins" stroke="url(#chipG)" stroke-width="5" stroke-linecap="round">'
        . '<path d="M75 18v22M110 18v22M145 18v22M75 180v22M110 180v22M145 180v22M18 75h22M18 110h22M18 145h22M180 75h22M180 110h22M180 145h22"/>'
        . '</g>'
        . '<rect x="40" y="40" width="140" height="140" rx="22" fill="#ffffff" stroke="url(#chipG)" stroke-width="3"/>'
        . '<rect x="64" y="64" width="92" height="92" rx="12" fill="url(#chipG)" fill-opacity="0.08" stroke="url(#chipG)" stroke-opacity="0.45" stroke-width="2.5"/>'
        . '<g stroke="url(#chipG)" stroke-width="2.5" stroke-linecap="round" opacity="0.8">'
        . '<path d="M84 64v-8M136 64v-8M84 156v8M136 156v8M64 84h-8M64 136h-8M156 84h8M156 136h8"/>'
        . '<path d="M86 110h12l6-10 9 20 6-10h15"/>'
        . '</g>'
        . '<circle cx="154" cy="110" r="3.5" fill="url(#chipG)" class="chip-core"/>'
        . '</svg>';
}
