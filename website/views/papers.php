<?php
/** صفحه مقالات علمی — دوزبانه */
$papers = $data['papers'] ?? [];
$valid_types = paper_types();

$types = [];
foreach ($papers as $p) {
    $t = in_array($p['type'] ?? '', $valid_types, true) ? $p['type'] : 'other';
    $types[$t] = ($types[$t] ?? 0) + 1;
}

// گروه‌بندی بر اساس سال (جدیدتر اول)
$groups = [];
foreach ($papers as $p) {
    $y   = trim((string)($p['year'] ?? ''));
    $num = is_numeric(to_num($y)) ? (float)to_num($y) : -1;
    $groups[$num][] = ['disp' => $y !== '' ? $y : t('no_year'), 'p' => $p];
}
krsort($groups);
?>
<section class="page-hero">
  <div class="container">
    <h1><?= e(t('page_papers')) ?></h1>
    <p class="page-sub"><?= e(t('papers_sub')) ?></p>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="paper-tools">
      <input type="search" id="paperSearch" class="input search-input" placeholder="<?= e(t('search_ph')) ?>">
      <div class="filters" id="paperTypes">
        <button class="chip filter active" data-type="all"><?= e(t('filter_all')) ?> (<?= count($papers) ?>)</button>
        <?php foreach ($types as $t => $n): ?>
          <button class="chip filter" data-type="<?= e($t) ?>"><?= e(t('type_' . $t)) ?> (<?= $n ?>)</button>
        <?php endforeach; ?>
      </div>
    </div>

    <?php if (!$papers): ?>
      <p class="empty"><?= e(t('empty_papers')) ?></p>
    <?php else: ?>
      <div id="papersList">
      <?php foreach ($groups as $num => $list): ?>
        <h2 class="year-head"><?= e($list[0]['disp']) ?> <span class="year-count">(<?= count($list) ?>)</span></h2>
        <?php foreach ($list as $g):
          $p = $g['p'];
          $tkey = in_array($p['type'] ?? '', $valid_types, true) ? $p['type'] : 'other';
          $doi = trim((string)($p['doi'] ?? ''));
          $doi_url = $doi !== '' ? (preg_match('#^https?://#i', $doi) ? $doi : 'https://doi.org/' . ltrim($doi, '/')) : '';
          $searchText = mb_strtolower(trim(
              b($p['title'], 'fa') . ' ' . b($p['title'], 'en') .
              ' ' . b($p['authors'], 'fa') . ' ' . b($p['authors'], 'en') .
              ' ' . b($p['venue'], 'fa') . ' ' . b($p['venue'], 'en') .
              ' ' . b($p['abstract'], 'fa') . ' ' . b($p['abstract'], 'en')
          ));
        ?>
        <div class="card paper-card" id="p-<?= e($p['id']) ?>" data-type="<?= e($tkey) ?>" data-search="<?= e($searchText) ?>">
          <div class="paper-head">
            <span class="badge badge-soft"><?= e(t('type_' . $tkey)) ?></span>
            <h3><?= e(b($p['title'])) ?></h3>
          </div>
          <?php if (b($p['authors']) !== ''): ?><p class="paper-authors"><?= e(b($p['authors'])) ?></p><?php endif; ?>
          <?php if (b($p['venue']) !== ''): ?><p class="paper-venue">📖 <?= e(b($p['venue'])) ?></p><?php endif; ?>
          <?php if (b($p['abstract']) !== ''): ?>
          <details class="paper-abstract"><summary><?= e(t('abstract')) ?></summary><p><?= e(b($p['abstract'])) ?></p></details>
          <?php endif; ?>
          <?php if ($doi_url !== '' || !empty($p['pdf'])): ?>
          <div class="paper-links">
            <?php if ($doi_url !== ''): ?><a class="btn btn-mini btn-soft" href="<?= e($doi_url) ?>" target="_blank" rel="noopener">DOI ↗</a><?php endif; ?>
            <?php if (!empty($p['pdf'])): ?><a class="btn btn-mini" href="<?= e(url($p['pdf'])) ?>" target="_blank" rel="noopener">PDF ⬇</a><?php endif; ?>
          </div>
          <?php endif; ?>
        </div>
        <?php endforeach; ?>
      <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
</section>
