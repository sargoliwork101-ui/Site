<?php
/** صفحه درباره من / رزومه — دوزبانه، بدون تصویر */
$about = $data['about'] ?? [];
$soc   = $s['social'] ?? [];
?>
<section class="page-hero">
  <div class="container">
    <h1><?= e(t('page_about')) ?></h1>
    <p class="page-sub"><?= e(b($s['person_title'])) ?></p>
  </div>
</section>

<section class="section">
  <div class="container about-grid">
    <aside class="about-side">
      <div class="card profile-card">
        <div class="profile-emblem"><?= chip_emblem() ?></div>
        <h3><?= e($s['person_name']) ?></h3>
        <p class="role"><?= e(b($s['person_title'])) ?></p>
      </div>
      <div class="info-card card">
        <h3><?= e(t('contact_info')) ?></h3>
        <ul>
          <?php if (!empty($s['email'])):    ?><li><span class="ico">✉️</span><bdi dir="ltr"><?= e($s['email']) ?></bdi></li><?php endif; ?>
          <?php if (!empty($s['phone'])):    ?><li><span class="ico">📞</span><bdi dir="ltr"><?= e($s['phone']) ?></bdi></li><?php endif; ?>
          <?php if (b($s['location']) !== ''): ?><li><span class="ico">📍</span><?= e(b($s['location'])) ?></li><?php endif; ?>
        </ul>
        <?php if (!empty($s['cv_pdf'])): ?>
          <a class="btn btn-primary btn-block" href="<?= e(url($s['cv_pdf'])) ?>" download><?= e(t('download_cv')) ?></a>
        <?php endif; ?>
        <div class="socials">
          <?php
          $socials = [
            'github'   => ['label' => 'GitHub',   'url' => $soc['github'] ?? ''],
            'linkedin' => ['label' => 'LinkedIn', 'url' => $soc['linkedin'] ?? ''],
            'orcid'    => ['label' => 'ORCID',    'url' => $soc['orcid'] ?? ''],
            'scholar'  => ['label' => 'Scholar',  'url' => $soc['scholar'] ?? ''],
            'telegram' => ['label' => 'Telegram', 'url' => $soc['telegram'] ?? ''],
          ];
          foreach ($socials as $soc_item):
            if ($soc_item['url'] !== ''):
          ?>
            <a href="<?= e($soc_item['url']) ?>" target="_blank" rel="noopener"><?= e($soc_item['label']) ?></a>
          <?php
            endif;
          endforeach;
          ?>
        </div>
      </div>
    </aside>

    <div class="about-main">
      <h2 class="section-title"><?= e(t('about_self')) ?></h2>
      <div class="prose"><?= text_to_html(b($about['bio'])) ?></div>

      <?php if (!empty($about['education'])): ?>
      <h2 class="section-title mt"><?= e(t('about_education')) ?></h2>
      <div class="timeline">
        <?php foreach ($about['education'] as $ed): ?>
        <div class="tl-item">
          <div class="tl-dot"></div>
          <div class="tl-card card">
            <div class="tl-head">
              <h3><?= e(b($ed['title'])) ?></h3>
              <?php if (!empty($ed['year'])): ?><span class="tl-year"><bdi dir="ltr"><?= e($ed['year']) ?></bdi></span><?php endif; ?>
            </div>
            <?php if (b($ed['org']) !== ''): ?><p class="tl-org"><?= e(b($ed['org'])) ?></p><?php endif; ?>
            <?php if (b($ed['desc']) !== ''): ?><p><?= e(b($ed['desc'])) ?></p><?php endif; ?>
          </div>
        </div>
        <?php endforeach; ?>
      </div>
      <?php endif; ?>

      <?php if (!empty($about['experience'])): ?>
      <h2 class="section-title mt"><?= e(t('about_experience')) ?></h2>
      <div class="timeline">
        <?php foreach ($about['experience'] as $ex): ?>
        <div class="tl-item">
          <div class="tl-dot"></div>
          <div class="tl-card card">
            <div class="tl-head">
              <h3><?= e(b($ex['title'])) ?></h3>
              <?php if (!empty($ex['year'])): ?><span class="tl-year"><bdi dir="ltr"><?= e($ex['year']) ?></bdi></span><?php endif; ?>
            </div>
            <?php if (b($ex['org']) !== ''): ?><p class="tl-org"><?= e(b($ex['org'])) ?></p><?php endif; ?>
            <?php if (b($ex['desc']) !== ''): ?><p><?= e(b($ex['desc'])) ?></p><?php endif; ?>
          </div>
        </div>
        <?php endforeach; ?>
      </div>
      <?php endif; ?>

      <?php if (!empty($about['skills'])): ?>
      <h2 class="section-title mt"><?= e(t('about_skills')) ?></h2>
      <div class="chips">
        <?php foreach ($about['skills'] as $sk): ?><span class="chip"><bdi dir="ltr"><?= e($sk) ?></bdi></span><?php endforeach; ?>
      </div>
      <?php endif; ?>
    </div>
  </div>
</section>
