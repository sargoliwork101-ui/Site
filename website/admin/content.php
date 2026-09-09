<?php
/** ویرایش محتوا: صفحه اصلی + درباره من (دوزبانه) */
require dirname(__DIR__) . '/config.php';
require_login();

$data = load_data();
$admin_title = 'ویرایش محتوا';
$save_err = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $data['home']['headline'] = [
        'fa' => trim((string)($_POST['headline']['fa'] ?? '')),
        'en' => trim((string)($_POST['headline']['en'] ?? '')),
    ];
    $data['home']['subtitle'] = [
        'fa' => trim((string)($_POST['subtitle']['fa'] ?? '')),
        'en' => trim((string)($_POST['subtitle']['en'] ?? '')),
    ];
    $data['home']['intro'] = [
        'fa' => trim((string)($_POST['intro']['fa'] ?? '')),
        'en' => trim((string)($_POST['intro']['en'] ?? '')),
    ];
    $data['about']['bio'] = [
        'fa' => trim((string)($_POST['bio']['fa'] ?? '')),
        'en' => trim((string)($_POST['bio']['en'] ?? '')),
    ];
    $data['about']['education']  = parse_rows($_POST['education'] ?? '[]');
    $data['about']['experience'] = parse_rows($_POST['experience'] ?? '[]');
    $data['about']['skills']     = str_list($_POST['skills'] ?? '');
    if (save_data($data)) {
        flash('محتوا با موفقیت ذخیره شد.');
        redirect(url('admin/content.php'));
    }
    $save_err = 'ذخیره‌سازی ناموفق بود.';
}

$home  = $data['home'] ?? [];
$about = $data['about'] ?? [];

/** رندر سطرهای داینامیک دوزبانه */
function render_rows($name, array $items, array $ph_fa, array $ph_en) {
    echo '<div class="rows" data-name="' . e($name) . '">';
    if (!$items) {
        $items = [[
            'title' => ['fa' => '', 'en' => ''],
            'org'   => ['fa' => '', 'en' => ''],
            'year'  => '',
            'desc'  => ['fa' => '', 'en' => ''],
        ]];
    }
    foreach ($items as $it) {
        $t = $it['title'] ?? ['fa' => '', 'en' => ''];
        $o = $it['org']   ?? ['fa' => '', 'en' => ''];
        $d = $it['desc']  ?? ['fa' => '', 'en' => ''];
        if (!is_array($t)) $t = ['fa' => (string)$t, 'en' => ''];
        if (!is_array($o)) $o = ['fa' => (string)$o, 'en' => ''];
        if (!is_array($d)) $d = ['fa' => (string)$d, 'en' => ''];
        echo '<div class="row">'
          . '<div class="row-half">'
          .   '<div class="row-lang">🇮🇷 فارسی</div>'
          .   '<div class="row-inputs">'
          .   '<input data-key="title_fa" placeholder="' . e($ph_fa[0]) . '" value="' . e($t['fa']) . '">'
          .   '<input data-key="org_fa"   placeholder="' . e($ph_fa[1]) . '" value="' . e($o['fa']) . '">'
          .   '<input data-key="year"     placeholder="' . e($ph_fa[2]) . '" value="' . e($it['year'] ?? '') . '">'
          .   '<input data-key="desc_fa"  placeholder="' . e($ph_fa[3]) . '" value="' . e($d['fa']) . '">'
          .   '</div>'
          . '</div>'
          . '<div class="row-half">'
          .   '<div class="row-lang en">🇬🇧 English</div>'
          .   '<div class="row-inputs en">'
          .   '<input data-key="title_en" placeholder="' . e($ph_en[0]) . '" value="' . e($t['en']) . '" dir="ltr">'
          .   '<input data-key="org_en"   placeholder="' . e($ph_en[1]) . '" value="' . e($o['en']) . '" dir="ltr">'
          .   '<input data-key="desc_en"  placeholder="' . e($ph_en[2]) . '" value="' . e($d['en']) . '" dir="ltr">'
          .   '</div>'
          . '</div>'
          . '<button type="button" class="row-del" data-tip="حذف این سطر" title="حذف این سطر">✕</button>'
          . '</div>';
    }
    echo '<button type="button" class="btn btn-mini btn-soft row-add" data-tip="یک سطر جدید به لیست اضافه کنید">＋ افزودن سطر</button></div>';
    echo '<input type="hidden" name="' . e($name) . '" value="">';
}

require __DIR__ . '/includes/header.php';
?>
<h1 class="page-h">ویرایش محتوا</h1>
<p class="page-sub">متن‌های صفحه اصلی و «درباره من» — هر بخش به فارسی و انگلیسی</p>
<?php if ($save_err): ?><div class="alert err"><?= e($save_err) ?></div><?php endif; ?>

<form method="post">
  <?= csrf_field() ?>

  <div class="card-p">
    <h2>صفحه اصلی</h2>
    <div class="form-grid">
      <div class="field"><label>تیتر بزرگ (فارسی) <span class="tip" data-tip="تیتر اصلی بالای صفحه — مثلاً: سلام! من علی هستم">؟</span></label><input class="input" name="headline[fa]" value="<?= e($home['headline']['fa'] ?? '') ?>"></div>
      <div class="field"><label>تیتر بزرگ (English)</label><input class="input in-ltr" name="headline[en]" value="<?= e($home['headline']['en'] ?? '') ?>"></div>
      <div class="field"><label>زیر تیتر (فارسی) <span class="tip" data-tip="یک یا دو جمله معرفی کوتاه زیر تیتر اصلی">؟</span></label><input class="input" name="subtitle[fa]" value="<?= e($home['subtitle']['fa'] ?? '') ?>"></div>
      <div class="field"><label>زیر تیتر (English)</label><input class="input in-ltr" name="subtitle[en]" value="<?= e($home['subtitle']['en'] ?? '') ?>"></div>
    </div>
    <div class="form-grid mt16">
      <div class="field"><label>معرفی کوتاه (فارسی) <span class="tip" data-tip="در کارت «معرفی کوتاه» صفحه اصلی نمایش داده می‌شود. با خط خالی پاراگراف جدا می‌شود.">؟</span></label><textarea class="input" name="intro[fa]" rows="3"><?= e($home['intro']['fa'] ?? '') ?></textarea></div>
      <div class="field"><label>معرفی کوتاه (English)</label><textarea class="input in-ltr" name="intro[en]" rows="3"><?= e($home['intro']['en'] ?? '') ?></textarea></div>
    </div>
  </div>

  <div class="card-p">
    <h2>درباره من — خود معرفی</h2>
    <div class="form-grid">
      <div class="field"><label>متن (فارسی) <span class="tip" data-tip="بخش اصلی رزومه‌ی متنی — با خط خالی پاراگراف جدا می‌شود">؟</span></label><textarea class="input" name="bio[fa]" rows="7"><?= e($about['bio']['fa'] ?? '') ?></textarea></div>
      <div class="field"><label>Text (English)</label><textarea class="input in-ltr" name="bio[en]" rows="7"><?= e($about['bio']['en'] ?? '') ?></textarea></div>
    </div>
  </div>

  <div class="card-p">
    <h2>تحصیلات <span class="tip" data-tip="هر سطر یک مقطع تحصیلی است؛ سال می‌تواند شمسی یا میلادی باشد و برای هر دو زبان مشترک است.">؟</span></h2>
    <?= render_rows('education', $about['education'] ?? [],
        ['مقطع / عنوان', 'دانشگاه / دانشکده', 'سال (مثلاً: 1396-1400)', 'توضیح اختیاری'],
        ['Degree / Title', 'University / Faculty', '']) ?>
  </div>

  <div class="card-p">
    <h2>سوابق کاری</h2>
    <?= render_rows('experience', $about['experience'] ?? [],
        ['عنوان شغلی', 'شرکت / سازمان', 'بازه زمانی (مثلاً: 1400 - اکنون)', 'توضیح اختیاری'],
        ['Job Title', 'Company / Organization', '']) ?>
  </div>

  <div class="card-p">
    <h2>مهارت‌ها</h2>
    <div class="field">
      <label>مهارت‌ها (با ویرگول) <span class="tip" data-tip="مهارت‌های فنی معمولاً به انگلیسی استاندارد هستند؛ همین لیست در هر دو زبان نمایش داده می‌شود.">؟</span></label>
      <input class="input in-ltr" name="skills" value="<?= e(implode(', ', $about['skills'] ?? [])) ?>" placeholder="PCB Design, Embedded C, STM32, Python">
    </div>
    <div class="form-actions"><button class="btn btn-primary">ذخیره همه تغییرات</button></div>
  </div>
</form>
<?php require __DIR__ . '/includes/footer.php'; ?>
