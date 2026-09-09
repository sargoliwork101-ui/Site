<?php
/** صفحه نمونه‌کارها — دوزبانه، بدون تصویر */
$works = $data['works'] ?? [];
usort($works, function ($a, $b) {
    return ($b['created'] ?? 0) <=> ($a['created'] ?? 0);
});
$categories = [];
foreach ($works as $w) {
    $cat = $w['category'] ?? [];
    $key = b($cat, 'fa') !== '' ? b($cat, 'fa') : b($cat, 'en');
    if ($key === '') $key = t('project');
    if (!isset($categories[$key])) $categories[$key] = ['n' => 0, 'cat' => $cat];
    $categories[$key]['n']++;
}
?>
<section class="page-hero">
  <div class="container">
    <span class="section-tag">Portfolio</span>
    <h1><?= e(t('page_works')) ?></h1>
    <p class="page-sub"><?= e(t('works_sub')) ?></p>
  </div>
</section>

<section class="section">
  <div class="container">
    <?php if ($categories): ?>
    <div class="filters" id="workFilters">
      <button class="chip filter active" data-cat="all"><?= e(t('filter_all')) ?> (<?= count($works) ?>)</button>
      <?php foreach ($categories as $key => $info):
        $label = b($info['cat'] ?? []);
        if ($label === '') $label = $key;
      ?>
        <button class="chip filter" data-cat="<?= e($key) ?>"><?= e($label) ?> (<?= $info['n'] ?>)</button>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>

    <?php if (!$works): ?>
      <p class="empty"><?= e(t('empty_works')) ?></p>
    <?php else: ?>
      <div class="cards-grid" id="worksGrid">
        <?php foreach ($works as $w):
          $key = b($w['category'] ?? [], 'fa') !== '' ? b($w['category'] ?? [], 'fa') : b($w['category'] ?? [], 'en');
          if ($key === '') $key = t('project');
          $c = b($w['category'] ?? []);
          if ($c === '') $c = $key;
        ?>
        <a class="card work-card reveal" data-cat="<?= e($key) ?>" href="<?= e(url('work/' . $w['id'])) ?>">
          <div class="card-media">
            <div class="media-icon"><?= cat_icon($w['category'] ?? []) ?></div>
            <span class="badge"><?= e($c) ?></span>
          </div>
          <div class="card-body">
            <h3><?= e(b($w['title'])) ?></h3>
            <p><?= e(excerpt(b($w['description'] ?? ''), 100)) ?></p>
          </div>
        </a>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
</section>
