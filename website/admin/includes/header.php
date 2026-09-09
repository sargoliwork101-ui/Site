<?php
/** هدر پنل مدیریت (فقط بعد از require_login فراخوانی شود) — همیشه فارسی */
$_COOKIE['site_lang'] = 'fa';
$admin_nav = [
    'index.php'    => ['🏠 داشبورد', 'نمای کلی و دسترسی سریع'],
    'content.php'  => ['📝 ویرایش محتوا', 'تیتر، معرفی، تحصیلات، سوابق و مهارت‌ها (دوزبانه)'],
    'works.php'    => ['🖼️ نمونه‌کارها', 'افزودن و مدیریت پروژه‌ها با جستجو'],
    'papers.php'   => ['📚 مقالات علمی', 'مقالات، پایان‌نامه‌ها، DOI و PDF'],
    'security.php' => ['🛡️ پایش امنیت', 'بررسی وضعیت امنیتی و سلامت سایت'],
    'settings.php' => ['⚙️ تنظیمات', 'اطلاعات شخصی، لینک‌ها، رزومه PDF و رمز'],
];
$admin_active = basename($_SERVER['SCRIPT_NAME']);
$flash = flash();
?>
<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="csrf" content="<?= e(csrf_token()) ?>">
<meta name="upload-url" content="<?= e(url('admin/upload.php')) ?>">
<title><?= e($admin_title ?? 'پنل مدیریت') ?> — مدیریت سایت</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="<?= e(url('assets/css/style.css')) ?><?= asset_v('assets/css/style.css') ?>">
</head>
<body class="admin-body">
<div class="admin-wrap">
  <aside class="admin-side">
    <div class="admin-brand">⚙️ پنل مدیریت</div>
    <nav class="admin-nav">
      <?php foreach ($admin_nav as $file => $item): ?>
        <a href="<?= e(url('' . $file)) ?>" class="<?= $admin_active === $file ? 'active' : '' ?>" data-tip="<?= e($item[1]) ?>"><?= e($item[0]) ?></a>
      <?php endforeach; ?>
    </nav>
    <div class="admin-side-foot">
      <a href="<?= e(url('')) ?>" target="_blank" data-tip="باز کردن سایت در تب جدید">🌐 مشاهده سایت</a>
      <a href="<?= e(url('admin/logout.php')) ?>" data-tip="خروج امن از پنل">🚪 خروج از پنل</a>
    </div>
  </aside>
  <div class="admin-main">
    <?php if ($flash): ?><div class="alert <?= e($flash['type']) ?>"><?= e($flash['msg']) ?></div><?php endif; ?>
