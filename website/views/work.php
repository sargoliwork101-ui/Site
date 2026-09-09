<?php
/** صفحه جزئیات یک نمونه‌کار — دوزبانه، بدون تصویر */
$c = b($work['category'] ?? []);
if ($c === '') $c = t('project');
?>
<section class="page-hero">
  <div class="container">
    <span class="section-tag">Project</span>
    <h1><?= e(b($work['title'])) ?></h1>
    <p class="page-sub"><?= e($c) ?></p>
  </div>
</section>

<section class="section">
  <div class="container work-detail">
    <div class="work-banner"><?= cat_icon($work['category'] ?? []) ?></div>
    <div class="work-meta">
      <span class="badge badge-soft"><?= e($c) ?></span>
      <?php if (!empty($work['link'])): ?>
        <a class="btn btn-primary" href="<?= e($work['link']) ?>" target="_blank" rel="noopener"><?= e(t('view_project')) ?> ↗</a>
      <?php endif; ?>
    </div>
    <div class="prose"><?= text_to_html(b($work['description'])) ?></div>
    <p class="mt"><a class="link-more" href="<?= e(url('works')) ?>">→ <?= e(t('back_works')) ?></a></p>
  </div>
</section>
