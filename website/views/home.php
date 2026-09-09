<?php
/** صفحه اصلی — طراحی واحد «الکترونیک فید» (بدون تصویر) */
$home   = $data['home'] ?? [];
$works  = $data['works'] ?? [];
$papers = $data['papers'] ?? [];
$about  = $data['about'] ?? [];

$exp_count = count($about['education'] ?? []) + count($about['experience'] ?? []);
$skills4   = array_slice($about['skills'] ?? [], 0, 4);

$featured = array_values(array_filter($works, function ($w) { return !empty($w['featured']); }));
if (count($featured) < 3) {
    $rest = array_values(array_filter($works, function ($w) { return empty($w['featured']); }));
    $featured = array_slice(array_merge($featured, $rest), 0, 3);
}
$sorted_papers = $papers;
usort($sorted_papers, function ($a, $b) {
    $ya = is_numeric(to_num($a['year'] ?? '')) ? (float)to_num($a['year']) : -1;
    $yb = is_numeric(to_num($b['year'] ?? '')) ? (float)to_num($b['year']) : -1;
    return $yb <=> $ya;
});
$latest = array_slice($sorted_papers, 0, 3);
$valid_types = paper_types();
$headline = b($home['headline'] ?? $s['person_name']);
$subtitle = b($home['subtitle']);
?>
<section class="hero">
  <div class="container">
    <div class="hf-grid">
      <div class="reveal">
        <span class="hero-status"><span class="pulse-dot"></span><?= e(t('status')) ?></span>
        <p class="hf-hi"><?= e(t('hero_hi')) ?></p>
        <h1 class="hf-title"><span class="grad"><?= e($headline) ?></span></h1>
        <p class="hf-sub"><?= e($subtitle) ?></p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="<?= e(url('works')) ?>"><?= e(t('btn_view_works')) ?></a>
          <a class="btn btn-light" href="<?= e(url('contact')) ?>"><?= e(t('cta_btn')) ?></a>
        </div>
        <?php if ($skills4): ?>
        <div class="hf-skills">
          <?php foreach ($skills4 as $sk): ?>
          <span class="hf-chip"><span class="hf-chip-dot"></span><bdi dir="ltr"><?= e($sk) ?></bdi></span>
          <?php endforeach; ?>
        </div>
        <?php endif; ?>
      </div>

      <div class="hf-visual reveal" aria-hidden="true">
        <div class="hf-glow"></div>
        <svg class="hf-chip-svg" viewBox="0 0 340 340" fill="none">
          <!-- مدارهای خروجی از پین‌ها -->
          <g stroke="#a9b4cd" stroke-width="1.6" fill="none">
            <path d="M160 78 V36 H240"/>
            <path d="M262 160 H304 V88"/>
            <path d="M139 262 V304 H58"/>
            <path d="M78 139 H36 V210"/>
          </g>
          <path class="hf-trace-anim" d="M160 78 V36 H240" stroke="#4f46e5" stroke-width="1.8" fill="none"/>
          <g fill="#ffffff" stroke-width="2">
            <circle cx="240" cy="36" r="5" stroke="#4f46e5"/>
            <circle cx="304" cy="88" r="5" stroke="#0891b2"/>
            <circle cx="58" cy="304" r="5" stroke="#0891b2"/>
            <circle cx="36" cy="210" r="5" stroke="#4f46e5"/>
          </g>
          <!-- پین‌ها -->
          <g stroke="#9aa6c0" stroke-width="7" stroke-linecap="round">
            <line x1="118" y1="78" x2="118" y2="100"/><line x1="139" y1="78" x2="139" y2="100"/>
            <line x1="181" y1="78" x2="181" y2="100"/><line x1="202" y1="78" x2="202" y2="100"/>
            <line x1="223" y1="78" x2="223" y2="100"/>
            <line x1="118" y1="240" x2="118" y2="262"/><line x1="139" y1="240" x2="139" y2="262"/>
            <line x1="160" y1="240" x2="160" y2="262"/><line x1="181" y1="240" x2="181" y2="262"/>
            <line x1="202" y1="240" x2="202" y2="262"/><line x1="223" y1="240" x2="223" y2="262"/>
            <line x1="78" y1="118" x2="100" y2="118"/><line x1="78" y1="139" x2="100" y2="139"/>
            <line x1="78" y1="160" x2="100" y2="160"/><line x1="78" y1="181" x2="100" y2="181"/>
            <line x1="78" y1="223" x2="100" y2="223"/>
            <line x1="240" y1="118" x2="262" y2="118"/><line x1="240" y1="139" x2="262" y2="139"/>
            <line x1="240" y1="181" x2="262" y2="181"/><line x1="240" y1="202" x2="262" y2="202"/>
            <line x1="240" y1="223" x2="262" y2="223"/>
          </g>
          <!-- پین‌های زنده -->
          <g stroke-width="7" stroke-linecap="round">
            <line class="hf-pin-anim" x1="160" y1="78" x2="160" y2="100"/>
            <line class="hf-pin-anim p2" x1="240" y1="160" x2="262" y2="160"/>
            <line class="hf-pin-anim p3" x1="78" y1="202" x2="100" y2="202"/>
          </g>
          <!-- بدنه چیپ -->
          <rect x="100" y="100" width="140" height="140" rx="22" fill="#ffffff" stroke="#1c2333" stroke-width="2"/>
          <rect x="118" y="118" width="104" height="104" rx="12" fill="#f8fafd" stroke="#e3e8f2" stroke-width="1.5"/>
          <circle cx="126" cy="126" r="4.5" fill="#4f46e5"/>
          <circle cx="214" cy="214" r="4.5" fill="#0891b2"/>
          <text x="170" y="184" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="30" font-weight="700" fill="#1c2333">EE</text>
        </svg>
        <div class="hf-float hf-float-1">
          <small>Status · OK</small>
          <b><?= e(t('status')) ?></b>
        </div>
        <div class="hf-float hf-float-2">
          <small>Experience</small>
          <b><span class="hf-big"><bdi dir="ltr"><?= (int)$exp_count ?></bdi>+</span> <?= e(t('g_exp_unit')) ?></b>
        </div>
      </div>
    </div>
  </div>
</section>

<?php if (b($home['intro'] ?? '') !== ''): ?>
<section class="section">
  <div class="container">
    <div class="intro-card reveal">
      <span class="section-tag">Introduction</span>
      <h2 class="section-title"><?= e(t('section_intro')) ?></h2>
      <?= text_to_html(b($home['intro'])) ?>
    </div>
  </div>
</section>
<?php endif; ?>

<div class="stats-bar">
  <div class="container stats-inner">
    <div class="stat"><span class="stat-num" data-count="<?= count($works) ?>">0</span><span><?= e(t('stats_works')) ?></span></div>
    <div class="stat"><span class="stat-num" data-count="<?= count($papers) ?>">0</span><span><?= e(t('stats_papers')) ?></span></div>
    <div class="stat"><span class="stat-num" data-count="<?= $exp_count ?>">0</span><span><?= e(t('stats_exp')) ?></span></div>
  </div>
</div>

<?php if ($featured): ?>
<section class="section">
  <div class="container">
    <div class="section-head reveal">
      <div>
        <span class="section-tag">Portfolio</span>
        <h2 class="section-title"><?= e(t('section_featured')) ?></h2>
      </div>
      <a class="link-more" href="<?= e(url('works')) ?>"><?= e(t('view_all')) ?> ←</a>
    </div>
    <div class="cards-grid">
      <?php foreach ($featured as $w): $c = b($w['category'] ?? []); if ($c === '') $c = t('project'); ?>
      <a class="card work-card reveal" href="<?= e(url('work/' . $w['id'])) ?>">
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
  </div>
</section>
<?php endif; ?>

<?php if ($latest): ?>
<section class="section section-alt">
  <div class="container">
    <div class="section-head reveal">
      <div>
        <span class="section-tag">Publications</span>
        <h2 class="section-title"><?= e(t('section_latest')) ?></h2>
      </div>
      <a class="link-more" href="<?= e(url('papers')) ?>"><?= e(t('all_papers')) ?> ←</a>
    </div>
    <div class="paper-list">
      <?php foreach ($latest as $p):
        $tkey = in_array($p['type'] ?? '', $valid_types, true) ? $p['type'] : 'other';
      ?>
      <div class="paper-item reveal">
        <span class="paper-year"><?= e($p['year'] ?? '') ?></span>
        <div class="paper-main">
          <h3><?= e(b($p['title'])) ?></h3>
          <p class="paper-venue"><?= e(b($p['venue'])) ?></p>
        </div>
        <span class="badge badge-soft"><?= e(t('type_' . $tkey)) ?></span>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<section class="cta-band">
  <div class="container cta-inner reveal">
    <h2><?= e(t('cta_title')) ?></h2>
    <p><?= e(t('cta_sub')) ?></p>
    <a class="btn btn-light" href="<?= e(url('contact')) ?>"><?= e(t('cta_btn')) ?></a>
  </div>
</section>
