<?php
/** مدیریت نمونه‌کارها: افزودن / ویرایش / حذف — دوزبانه، بدون تصویر */
require dirname(__DIR__) . '/config.php';
require_login();

$data = load_data();
$admin_title = 'نمونه‌کارها';
$works = $data['works'] ?? [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $action = (string)($_POST['action'] ?? '');

    if ($action === 'delete') {
        $id = (string)($_POST['id'] ?? '');
        $data['works'] = array_values(array_filter($works, function ($w) use ($id) {
            return $w['id'] !== $id;
        }));
        if (save_data($data)) flash('نمونه‌کار حذف شد.');
        else flash('خطا در ذخیره‌سازی.', 'err');
    } elseif ($action === 'save') {
        $item = [
            'id' => (string)($_POST['id'] ?? '') !== '' ? (string)$_POST['id'] : new_id(),
            'title' => [
                'fa' => trim((string)($_POST['title']['fa'] ?? '')),
                'en' => trim((string)($_POST['title']['en'] ?? '')),
            ],
            'category' => [
                'fa' => trim((string)($_POST['category']['fa'] ?? '')),
                'en' => trim((string)($_POST['category']['en'] ?? '')),
            ],
            'description' => [
                'fa' => trim((string)($_POST['description']['fa'] ?? '')),
                'en' => trim((string)($_POST['description']['en'] ?? '')),
            ],
            'link'    => trim((string)($_POST['link'] ?? '')),
            'featured'=> !empty($_POST['featured']) ? 1 : 0,
            'created' => (int)($_POST['created'] ?? time()),
        ];
        if ($item['category']['fa'] === '' && $item['category']['en'] === '') {
            $item['category'] = ['fa' => 'پروژه', 'en' => 'Project'];
        }
        if ($item['title']['fa'] === '' && $item['title']['en'] === '') {
            flash('عنوان پروژه را (فارسی یا انگلیسی) حتماً وارد کنید.', 'err');
        } else {
            $found = false;
            foreach ($data['works'] as $i => $w) {
                if ($w['id'] === $item['id']) { $data['works'][$i] = $item; $found = true; break; }
            }
            if (!$found) array_unshift($data['works'], $item);
            if (save_data($data)) flash('نمونه‌کار ذخیره شد.');
            else flash('خطا در ذخیره‌سازی.', 'err');
        }
    }
    redirect(url('admin/works.php'));
}

$edit = null;
if (!empty($_GET['edit'])) {
    $edit = find_item($works, (string)$_GET['edit']);
} elseif (!empty($_GET['new'])) {
    $edit = [
        'id' => '',
        'title' => ['fa' => '', 'en' => ''],
        'category' => ['fa' => '', 'en' => ''],
        'description' => ['fa' => '', 'en' => ''],
        'link' => '', 'featured' => 0, 'created' => time(),
    ];
}

require __DIR__ . '/includes/header.php';
?>
<h1 class="page-h">نمونه‌کارها</h1>
<p class="page-sub">پروژه‌ها و کارهایی که می‌خواهید معرفی کنید — آیکون هر کارت بر اساس دسته‌بندی به‌صورت خودکار انتخاب می‌شود</p>

<a class="btn btn-primary" href="?new=1" data-tip="فرم افزودن پروژه جدید را باز می‌کند">＋ افزودن نمونه‌کار</a>

<?php if ($edit !== null): ?>
<div class="card-p mt16">
  <h2><?= $edit['id'] !== '' ? 'ویرایش نمونه‌کار' : 'افزودن نمونه‌کار جدید' ?></h2>
  <form method="post">
    <?= csrf_field() ?>
    <input type="hidden" name="action" value="save">
    <input type="hidden" name="id" value="<?= e($edit['id']) ?>">
    <input type="hidden" name="created" value="<?= (int)$edit['created'] ?>">
    <div class="form-grid">
      <div class="field"><label>عنوان پروژه (فارسی) * <span class="tip" data-tip="حداقل یکی از عنوان فارسی یا انگلیسی الزامی است">؟</span></label><input class="input" name="title[fa]" value="<?= e($edit['title']['fa'] ?? '') ?>"></div>
      <div class="field"><label>Project Title (English) *</label><input class="input in-ltr" name="title[en]" value="<?= e($edit['title']['en'] ?? '') ?>"></div>
      <div class="field"><label>دسته (فارسی) <span class="tip" data-tip="مثلاً: طراحی PCB، الکترونیک قدرت، IoT، کنترل موتور — آیکون کارت بر اساس همین کلمات انتخاب می‌شود">؟</span></label><input class="input" name="category[fa]" value="<?= e($edit['category']['fa'] ?? '') ?>"></div>
      <div class="field"><label>Category (English) <span class="tip" data-tip="e.g. PCB Design, Power Electronics, IoT, Motor Control, RF">؟</span></label><input class="input in-ltr" name="category[en]" value="<?= e($edit['category']['en'] ?? '') ?>"></div>
    </div>
    <div class="form-grid mt16">
      <div class="field"><label>توضیح پروژه (فارسی) <span class="tip" data-tip="با خط خالی پاراگراف جدا می‌شود — درباره هدف، قطعات و دستاورد بنویسید">؟</span></label><textarea class="input" name="description[fa]" rows="5"><?= e($edit['description']['fa'] ?? '') ?></textarea></div>
      <div class="field"><label>Project Description (English)</label><textarea class="input in-ltr" name="description[en]" rows="5"><?= e($edit['description']['en'] ?? '') ?></textarea></div>
    </div>
    <div class="field mt16">
      <label>لینک پروژه (اختیاری) <span class="tip" data-tip="آدرس کامل صفحه/گیت‌هاب پروژه — با آیکون ↗ در صفحه پروژه باز می‌شود">؟</span></label>
      <input class="input in-ltr" name="link" placeholder="https://example.com" value="<?= e($edit['link']) ?>">
    </div>
    <label class="check mt16"><input type="checkbox" name="featured" value="1" <?= !empty($edit['featured']) ? 'checked' : '' ?>> در صفحه اصلی به‌عنوان «کار منتخب» نمایش بده <span class="tip" data-tip="تا ۳ پروژه برگزیده بالای صفحه اصلی نمایش داده می‌شوند">؟</span></label>
    <div class="form-actions">
      <button class="btn btn-primary">ذخیره</button>
      <a class="btn btn-soft" href="<?= e(url('admin/works.php')) ?>">بستن فرم</a>
    </div>
  </form>
</div>
<?php endif; ?>

<div class="mt16">
  <?php if (!$works): ?>
    <div class="empty">هنوز نمونه‌کاری ثبت نشده است؛ روی «افزودن نمونه‌کار» بزنید.</div>
  <?php else: ?>
  <div class="list-tools">
    <span class="muted-text"><?= count($works) ?> پروژه</span>
    <input type="search" class="input tbl-search" data-table="worksTbl" placeholder="🔎 جستجو در لیست...">
  </div>
  <div class="tbl-wrap">
  <table class="tbl" id="worksTbl">
    <thead><tr><th>عنوان</th><th>دسته</th><th>برگزیده</th><th>عملیات</th></tr></thead>
    <tbody>
    <?php foreach ($works as $w): $pubUrl = url('work/' . $w['id']); ?>
      <tr>
        <td>
          <div class="cell-title">
            <span class="cell-ico"><?= cat_icon($w['category'] ?? []) ?></span>
            <span><?= e(b_any($w['title'] ?? '')) ?></span>
          </div>
        </td>
        <td><?= e(b_any($w['category'] ?? '')) ?></td>
        <td><?= !empty($w['featured']) ? '<span class="badge-star">⭐ منتخب</span>' : '—' ?></td>
        <td>
          <div class="cell-actions">
            <a class="btn btn-mini btn-soft" href="<?= e($pubUrl) ?>" target="_blank" data-tip="باز کردن صفحه عمومی پروژه در تب جدید">نمایش</a>
            <button type="button" class="btn btn-mini" data-copy="<?= e($pubUrl) ?>" data-tip="کپی آدرس عمومی پروژه در کلیپ‌بورد">🔗 کپی لینک</button>
            <a class="btn btn-mini" href="?edit=<?= e($w['id']) ?>" data-tip="ویرایش این پروژه">ویرایش</a>
            <form method="post" data-confirm="این نمونه‌کار حذف شود؟ (این کار برگشت‌پذیر نیست)" class="inline">
              <?= csrf_field() ?>
              <input type="hidden" name="action" value="delete">
              <input type="hidden" name="id" value="<?= e($w['id']) ?>">
              <button type="submit" class="btn btn-mini btn-danger" data-tip="حذف دائمی">حذف</button>
            </form>
          </div>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
  </div>
  <?php endif; ?>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
