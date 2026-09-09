<?php
/** صفحه تماس — دوزبانه */
$sent = (string)($_GET['sent'] ?? '');
$soc  = $s['social'] ?? [];
?>
<section class="page-hero">
  <div class="container">
    <span class="section-tag">Contact</span>
    <h1><?= e(t('page_contact')) ?></h1>
    <p class="page-sub"><?= e(t('contact_sub')) ?></p>
  </div>
</section>

<section class="section">
  <div class="container contact-grid">
    <div class="card contact-form-card">
      <?php if ($sent === 'sent'): ?>
        <div class="alert ok"><?= e(t('msg_sent')) ?></div>
      <?php elseif ($sent === 'fallback'): ?>
        <div class="alert warn"><?= e(t('msg_fb_a')) ?> <bdi dir="ltr"><?= e($s['email']) ?></bdi> <?= e(t('msg_fb_b')) ?></div>
      <?php elseif ($sent === 'rate'): ?>
        <div class="alert warn"><?= e(t('msg_rate')) ?></div>
      <?php elseif ($sent === 'error'): ?>
        <div class="alert err"><?= e(t('msg_error')) ?></div>
      <?php endif; ?>
      <form method="post" action="<?= e(url('contact')) ?>">
        <?= csrf_field() ?>
        <input type="text" name="website_hp" class="hp-field" tabindex="-1" autocomplete="off" aria-hidden="true">
        <label><?= e(t('form_name')) ?>
          <input class="input" type="text" name="name" required placeholder="<?= e(t('ph_name')) ?>">
        </label>
        <label><?= e(t('form_email')) ?>
          <input class="input in-ltr-start" type="email" name="email" required placeholder="<?= e(t('ph_email')) ?>">
        </label>
        <label><?= e(t('form_message')) ?>
          <textarea class="input" name="message" rows="6" required placeholder="<?= e(t('ph_message')) ?>"></textarea>
        </label>
        <button class="btn btn-primary" type="submit"><?= e(t('form_send')) ?></button>
      </form>
    </div>

    <aside class="info-card card contact-info">
      <h3><?= e(t('contact_channels')) ?></h3>
      <ul>
        <?php if (!empty($s['email'])):    ?><li><span class="ico">✉️</span><bdi dir="ltr"><?= e($s['email']) ?></bdi></li><?php endif; ?>
        <?php if (!empty($s['phone'])):    ?><li><span class="ico">📞</span><bdi dir="ltr"><?= e($s['phone']) ?></bdi></li><?php endif; ?>
        <?php if (b($s['location']) !== ''): ?><li><span class="ico">📍</span><?= e(b($s['location'])) ?></li><?php endif; ?>
      </ul>
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
    </aside>
  </div>
</section>
