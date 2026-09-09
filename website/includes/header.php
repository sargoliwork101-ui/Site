<?php
/** هدر عمومی سایت — دوزبانه */
$s = $data['settings'] ?? [];
$nav_items = [
    ''        => t('nav_home'),
    'about'   => t('nav_about'),
    'works'   => t('nav_works'),
    'papers'  => t('nav_papers'),
    'contact' => t('nav_contact'),
];
$cur    = current_route();
$active = $cur === '' ? 'home' : (string)explode('/', $cur)[0];
$dir    = lang() === 'fa' ? 'rtl' : 'ltr';
$other  = lang() === 'fa' ? 'en' : 'fa';
?>
<!doctype html>
<html lang="<?= lang() ?>" dir="<?= $dir ?>">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($page_title) ?> | <?= e(b($s['site_name'])) ?></title>
<meta name="description" content="<?= e(b($s['person_title'])) ?>">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230e7490'/%3E%3Ccircle cx='32' cy='26' r='10' fill='white'/%3E%3Cpath d='M14 52c2-10 10-14 18-14s16 4 18 14' fill='white'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="<?= e(url('assets/css/style.css')) ?><?= asset_v('assets/css/style.css') ?>">
</head>
<body>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="<?= e(url('')) ?>">
      <span class="brand-mark"><?= e(mb_substr($s['person_name'] ?? 'م', 0, 1)) ?></span>
      <span class="brand-name"><?= e($s['person_name'] ?? 'Site') ?></span>
    </a>
    <nav class="nav" id="nav">
      <?php foreach ($nav_items as $key => $label): ?>
        <a href="<?= e(url($key)) ?>" class="<?= ($key === '' ? 'home' : $key) === $active ? 'active' : '' ?>"><?= e($label) ?></a>
      <?php endforeach; ?>
    </nav>
    <div class="header-end">
      <a class="lang-switch" href="?set_lang=<?= $other ?>" title="Language">
        <span class="lang-icon">🌐</span><span><?= $other === 'en' ? 'EN' : 'فارسی' ?></span>
      </a>
      <button class="nav-toggle" id="navToggle" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>
<main>
