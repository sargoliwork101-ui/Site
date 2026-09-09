<?php
/** تنظیمات: اطلاعات شخصی (دوزبانه)، لینک‌ها، رزومه PDF، ایمیل آزمایشی، رمز عبور */
require dirname(__DIR__) . '/config.php';
require_login();

$data = load_data();
$admin_title = 'تنظیمات';
$errors = [];

function bi_from_post($name) {
    return [
        'fa' => trim((string)(($_POST[$name] ?? ['fa' => ''])['fa'] ?? '')),
        'en' => trim((string)(($_POST[$name] ?? ['en' => ''])['en'] ?? '')),
    ];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $action = (string)($_POST['action'] ?? 'save');

    if ($action === 'change_pass') {
        $cur = (string)($_POST['current'] ?? '');
        $new = (string)($_POST['new'] ?? '');
        $rec = trim((string)($_POST['recovery_email'] ?? ''));
        $a   = load_auth();
        if ($new === '' && $rec === '') {
            $errors[] = 'موردی برای تغییر وارد نشده است (رمز جدید یا ایمیل بازیابی).';
        } elseif (!empty($a['hash']) && !password_verify($cur, $a['hash'])) {
            $errors[] = 'رمز عبور فعلی اشتباه است.';
        } elseif ($new !== '' && mb_strlen($new) < 8) {
            $errors[] = 'رمز جدید باید حداقل ۸ کاراکتر باشد.';
        } elseif ($rec !== '' && !filter_var($rec, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'ایمیل بازیابی معتبر نیست.';
        } else {
            if ($new !== '') $a['hash'] = password_hash($new, PASSWORD_BCRYPT, ['cost' => 12]);
            if ($rec !== '') $a['email'] = $rec;
            $a['created'] = date('Y-m-d H:i');
            if (save_auth($a)) {
                flash('رمز عبور / ایمیل بازیابی با موفقیت تغییر کرد.');
                redirect(url('admin/settings.php'));
            }
            $errors[] = 'ذخیره‌سازی انجام نشد (فایل data/auth.json را بررسی کنید).';
        }
    } elseif ($action === 'test_mail') {
        $to = trim((string)($_POST['test_email'] ?? '')) ?: trim((string)($data['settings']['email'] ?? ''));
        if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'ایمیل مقصد معتبر نیست.';
        } else {
            $host = preg_replace('/[^a-z0-9.\-]/i', '', (string)($_SERVER['SERVER_NAME'] ?? 'localhost'));
            if ($host === '') $host = 'localhost';
            $ok = @mail($to, '=?UTF-8?B?' . base64_encode('ایمیل آزمایشی وبسایت') . '?=',
                'این یک ایمیل آزمایشی از فرم سایت شماست. اگر آن را دریافت کردید، ارسال ایمیل روی هاست درست کار می‌کند.',
                "From: no-reply@" . $host . "\r\nContent-Type: text/plain; charset=UTF-8");
            if ($ok) {
                flash('ایمیل آزمایشی برای ' . $to . ' ارسال شد؛ پوشه Inbox و Spam را چک کنید.', 'ok');
            } else {
                flash('ارسال روی این سرور ممکن نشد؛ احتمالاً mail() هاست غیرفعال است. (خود سایت به‌صورت خودکار به بازدیدکننده راهنمایی می‌دهد.)', 'warn');
            }
            redirect(url('admin/settings.php'));
        }
    } else {
        $s = $data['settings'];
        $old_cv = (string)($s['cv_pdf'] ?? '');
        $s['site_name']    = bi_from_post('site_name');
        $s['person_name']  = trim((string)($_POST['person_name'] ?? ''));
        $s['person_title'] = bi_from_post('person_title');
        $s['email']        = trim((string)($_POST['email'] ?? ''));
        $s['phone']        = trim((string)($_POST['phone'] ?? ''));
        $s['location']     = bi_from_post('location');
        $s['footer_text']  = bi_from_post('footer_text');
        $s['social'] = [
            'github'   => trim((string)($_POST['github'] ?? '')),
            'linkedin' => trim((string)($_POST['linkedin'] ?? '')),
            'orcid'    => trim((string)($_POST['orcid'] ?? '')),
            'scholar'  => trim((string)($_POST['scholar'] ?? '')),
            'telegram' => trim((string)($_POST['telegram'] ?? '')),
        ];
        if (!empty($_FILES['cv_pdf']['name'])) {
            $up = handle_upload($_FILES['cv_pdf'], ['pdf']);
            if ($up['ok']) $s['cv_pdf'] = $up['url'];
            else $errors[] = 'فایل رزومه: ' . $up['error'];
        } elseif (!empty($_POST['del_cv'])) {
            $s['cv_pdf'] = '';
        } elseif (is_managed_upload_path($_POST['cv_pdf'] ?? '')) {
            // فایل از قبل با آپلود مستقیم (جاوااسکریپت) در uploads ذخیره شده
            $s['cv_pdf'] = (string)$_POST['cv_pdf'];
        }
        $data['settings'] = $s;
        if (!$errors) {
            if (save_data($data)) {
                flash('تنظیمات با موفقیت ذخیره شد.');
                // پاک‌سازی فایل‌های رزومه که دیگر ارجاعی ندارند
                $final_cv = (string)$s['cv_pdf'];
                foreach (array_unique(array_filter([$old_cv, (string)($_POST['cv_pdf'] ?? '')])) as $c) {
                    if ($c !== '' && $c !== $final_cv) unlink_upload($data, $c);
                }
                redirect(url('admin/settings.php'));
            }
            $errors[] = 'ذخیره‌سازی انجام نشد (فایل data/content.json را بررسی کنید).';
        }
    }
}

$s = $data['settings'];
$auth_meta = load_auth() ?: [];
require __DIR__ . '/includes/header.php';
?>
<h1 class="page-h">تنظیمات سایت</h1>
<p class="page-sub">اطلاعات شخصی، لینک‌ها و فایل رزومه — روی علامت «؟» بروید تا راهنمای هر فیلد را ببینید</p>

<?php foreach ($errors as $er): ?><div class="alert err"><?= e($er) ?></div><?php endforeach; ?>

<div class="card-p">
  <h2>اطلاعات اصلی</h2>
  <form method="post" enctype="multipart/form-data">
    <?= csrf_field() ?>
    <input type="hidden" name="action" value="save">
    <div class="form-grid">
      <div class="field">
        <label>نام و نام خانوادگی <span class="tip" data-tip="این نام در هدر، رزومه و ایمیل‌ها نمایش داده می‌شود. نام در هر دو زبان یکسان است.">؟</span></label>
        <input class="input" name="person_name" value="<?= e($s['person_name']) ?>">
      </div>
      <div class="field">
        <label>ایمیل <span class="tip" data-tip="ایمیل شما در صفحه تماس نمایش داده می‌شود و پیام‌های فرم تماس به همین آدرس می‌رسند.">؟</span></label>
        <input class="input in-ltr" type="email" name="email" value="<?= e($s['email']) ?>">
      </div>
    </div>
    <div class="form-grid mt16">
      <div class="field"><label>عنوان / سمت (فارسی) <span class="tip" data-tip="مثلاً: مهندس الکترونیک | طراحی PCB و سیستم‌های تعبیه‌شده">؟</span></label><input class="input" name="person_title[fa]" value="<?= e($s['person_title']['fa'] ?? '') ?>"></div>
      <div class="field"><label>عنوان / سمت (English)</label><input class="input in-ltr" name="person_title[en]" value="<?= e($s['person_title']['en'] ?? '') ?>"></div>
    </div>
    <div class="form-grid mt16">
      <div class="field"><label>نام سایت (فارسی) <span class="tip" data-tip="در تب مرورگر و فوتر نمایش داده می‌شود">؟</span></label><input class="input" name="site_name[fa]" value="<?= e($s['site_name']['fa'] ?? '') ?>"></div>
      <div class="field"><label>نام سایت (English)</label><input class="input in-ltr" name="site_name[en]" value="<?= e($s['site_name']['en'] ?? '') ?>"></div>
    </div>
    <div class="form-grid mt16">
      <div class="field"><label>شماره تماس (اختیاری)</label><input class="input in-ltr" name="phone" value="<?= e($s['phone']) ?>"></div>
      <div class="field"><label>شهر / کشور (فارسی)</label><input class="input" name="location[fa]" value="<?= e($s['location']['fa'] ?? '') ?>"></div>
      <div class="field"><label>شهر / کشور (English)</label><input class="input in-ltr" name="location[en]" value="<?= e($s['location']['en'] ?? '') ?>"></div>
      <div class="field"><label>متن پاورقی (فارسی) <span class="tip" data-tip="متن کوچکی که پایین همه صفحه‌ها نمایش داده می‌شود">؟</span></label><input class="input" name="footer_text[fa]" value="<?= e($s['footer_text']['fa'] ?? '') ?>"></div>
      <div class="field"><label>متن پاورقی (English)</label><input class="input in-ltr" name="footer_text[en]" value="<?= e($s['footer_text']['en'] ?? '') ?>"></div>
    </div>
    <div class="form-grid mt16">
      <div class="field">
        <label>فایل رزومه (PDF) <span class="tip" data-tip="پس از ذخیره، دکمه «دانلود رزومه» در هدر و صفحه درباره من فعال می‌شود. فقط PDF و حداکثر ۱۰ مگابایت.">؟</span></label>
        <div class="file-picker" data-type="file">
          <div class="file-preview">
            <?php if (!empty($s['cv_pdf'])): ?>
              <span class="file-chip">📄 <?= e(basename($s['cv_pdf'])) ?></span>
              <div class="file-label">در سایت دکمه «دانلود رزومه» نمایش داده می‌شود</div>
            <?php else: ?>
              <span class="file-label">فایلی ثبت نشده است</span>
            <?php endif; ?>
          </div>
          <input type="file" name="cv_pdf" accept="application/pdf">
          <input type="hidden" name="cv_pdf" value="<?= e($s['cv_pdf']) ?>">
        </div>
        <?php if (!empty($s['cv_pdf'])): ?>
          <label class="check"><input type="checkbox" name="del_cv" value="1"> حذف فایل فعلی</label>
        <?php endif; ?>
      </div>
    </div>
    <div class="form-grid mt16">
      <div class="field"><label>لینک GitHub</label><input class="input in-ltr" name="github" placeholder="https://github.com/username" value="<?= e($s['social']['github']) ?>"></div>
      <div class="field"><label>لینک LinkedIn</label><input class="input in-ltr" name="linkedin" placeholder="https://linkedin.com/in/username" value="<?= e($s['social']['linkedin']) ?>"></div>
      <div class="field"><label>لینک ORCID <span class="tip" data-tip="شناسه استاندارد پژوهشگران — برای بخش مقالات بسیار مناسب است">؟</span></label><input class="input in-ltr" name="orcid" placeholder="https://orcid.org/0000-0002-XXXX" value="<?= e($s['social']['orcid']) ?>"></div>
      <div class="field"><label>لینک Google Scholar</label><input class="input in-ltr" name="scholar" placeholder="https://scholar.google.com/..." value="<?= e($s['social']['scholar']) ?>"></div>
      <div class="field"><label>لینک تلگرام</label><input class="input in-ltr" name="telegram" placeholder="https://t.me/username" value="<?= e($s['social']['telegram']) ?>"></div>
    </div>
    <div class="form-actions"><button class="btn btn-primary">ذخیره تنظیمات</button></div>
  </form>
</div>

<div class="card-p">
  <h2>آزمایش ایمیل</h2>
  <p class="page-sub" data-tip="یک ایمیل تستی ارسال می‌شود تا مطمئن شوید ارسال خودکار روی هاست کار می‌کند. اگر خالی بگذارید، به ایمیل سایت (بالا) ارسال می‌شود.">
    اگر ارسال روی هاست فعال نباشد، سایت به‌صورت خودکار به بازدیدکننده می‌گوید مستقیم برای ایمیل شما بنویسد — پس نگران نباشید.
  </p>
  <form method="post">
    <?= csrf_field() ?>
    <input type="hidden" name="action" value="test_mail">
    <div class="form-grid">
      <div class="field"><label>ایمیل مقصد (اختیاری)</label><input class="input in-ltr" type="email" name="test_email" placeholder="خالی = ایمیل سایت"></div>
      <div class="field"><span class="form-actions"><button class="btn btn-soft">📮 ارسال ایمیل آزمایشی</button></span></div>
    </div>
  </form>
</div>

<div class="card-p">
  <h2>تغییر رمز عبور پنل و ایمیل بازیابی</h2>
  <form method="post">
    <?= csrf_field() ?>
    <input type="hidden" name="action" value="change_pass">
    <div class="form-grid">
      <div class="field"><label>رمز فعلی <span class="tip" data-tip="برای هر تغییری (رمز یا ایمیل) لازم است">؟</span></label><input class="input" type="password" name="current" required></div>
      <div class="field"><label>رمز جدید <span class="tip" data-tip="حداقل ۸ کاراکتر — اگر فقط می‌خواهید ایمیل بازیابی را عوض کنید، خالی بگذارید">؟</span></label><input class="input" type="password" name="new" minlength="8"></div>
      <div class="field"><label>ایمیل بازیابی رمز <span class="tip" data-tip="اگر رمز پنل را فراموش کنید، کد بازیابی به همین ایمیل فرستاده می‌شود (لینک «فراموشی رمز عبور» در صفحه ورود). اگر خالی بگذارید تغییر نمی‌کند.">؟</span></label><input class="input in-ltr" type="email" name="recovery_email" dir="ltr" value="<?= e($auth_meta['email'] ?? '') ?>" placeholder="مثلاً admin@example.com"></div>
    </div>
    <div class="form-actions"><button class="btn btn-soft">ذخیره تغییرات</button></div>
  </form>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
