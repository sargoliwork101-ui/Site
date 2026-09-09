<?php /** فوتر عمومی سایت */ $s = $data['settings'] ?? []; ?>
</main>
<footer class="site-footer">
  <div class="container footer-inner">
    <div><?= e(b($s['site_name'])) ?> — <?= e($s['person_name'] ?? '') ?></div>
    <div>© <?= date('Y') ?> | <?= e(b($s['footer_text'])) ?></div>
  </div>
</footer>
<script src="<?= e(url('assets/js/main.js')) ?><?= asset_v('assets/js/main.js') ?>"></script>
</body>
</html>
