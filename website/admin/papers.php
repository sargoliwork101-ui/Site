<?php
/** مدیریت مقالات علمی: افزودن / ویرایش / حذف — دوزبانه */
require dirname(__DIR__) . '/config.php';
require_login();

$data = load_data();
$admin_title = 'مقالات علمی';
$papers = $data['papers'] ?? [];
$types_all = paper_types();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $action = (string)($_POST['action'] ?? '');

    if ($action === 'delete') {
        $id = (string)($_POST['id'] ?? '');
        $old_pdf = '';
        foreach ($papers as $p) {
            if (($p['id'] ?? '') === $id) { $old_pdf = (string)($p['pdf'] ?? ''); break; }
        }
        $data['papers'] = array_values(array_filter($papers, function ($p) use ($id) {
            return $p['id'] !== $id;
        }));
        if (save_data($data)) {
            flash('مقاله حذف شد.');
            unlink_upload($data, $old_pdf);
        } else flash('خطا در ذخیره‌سازی.', 'err');
    } elseif ($action === 'save') {
        $type = (string)($_POST['type'] ?? '');
        $item = [
            'id'      => (string)($_POST['id'] ?? '') !== '' ? (string)$_POST['id'] : new_id(),
            'title'   => [
                'fa' => trim((string)($_POST['title']['fa'] ?? '')),
                'en' => trim((string)($_POST['title']['en'] ?? '')),
            ],
            'authors' => [
                'fa' => trim((string)($_POST['authors']['fa'] ?? '')),
                'en' => trim((string)($_POST['authors']['en'] ?? '')),
            ],
            'venue'   => [
                'fa' => trim((string)($_POST['venue']['fa'] ?? '')),
                'en' => trim((string)($_POST['venue']['en'] ?? '')),
            ],
            'year'    => trim((string)($_POST['year'] ?? '')),
            'type'    => in_array($type, $types_all, true) ? $type : 'other',
            'doi'     => trim((string)($_POST['doi'] ?? '')),
            'pdf'     => (string)($_POST['pdf'] ?? ''),
            'abstract'=> [
                'fa' => trim((string)($_POST['abstract']['fa'] ?? '')),
                'en' => trim((string)($_POST['abstract']['en'] ?? '')),
            ],
        ];
        $new_pdf = '';
        if (!empty($_FILES['pdf']['name'])) {
            $up = handle_upload($_FILES['pdf'], ['pdf']);
            if ($up['ok']) { $item['pdf'] = $up['url']; $new_pdf = $up['url']; }
        }
        if (!empty($_POST['del_pdf'])) $item['pdf'] = '';

        if ($item['title']['fa'] === '' && $item['title']['en'] === '') {
            flash('عنوان مقاله را (فارسی یا انگلیسی) حتماً وارد کنید.', 'err');
        } else {
            $old_pdf = '';
            $found = false;
            foreach ($data['papers'] as $i => $p) {
                if ($p['id'] === $item['id']) {
                    $old_pdf = (string)($p['pdf'] ?? '');
                    $data['papers'][$i] = $item; $found = true; break;
                }
            }
            if (!$found) array_unshift($data['papers'], $item);
            if (save_data($data)) {
                flash('مقاله ذخیره شد.');
                // پاک‌سازی فایل‌های PDF که دیگر به آن‌ها ارجاعی نیست
                $final = (string)$item['pdf'];
                foreach (array_unique(array_filter([$old_pdf, (string)($_POST['pdf'] ?? ''), $new_pdf])) as $c) {
                    if ($c !== $final) unlink_upload($data, $c);
                }
            } else flash('خطا در ذخیره‌سازی.', 'err');
        }
    }
    redirect(url('admin/papers.php'));
}

$edit = null;
if (!empty($_GET['edit'])) {
    $edit = find_item($papers, (string)$_GET['edit']);
} elseif (!empty($_GET['new'])) {
    $edit = [
        'id' => '',
        'title' => ['fa' => '', 'en' => ''],
        'authors' => ['fa' => '', 'en' => ''],
        'venue' => ['fa' => '', 'en' => ''],
        'year' => (string)date('Y'),
        'type' => 'journal', 'doi' => '', 'pdf' => '',
        'abstract' => ['fa' => '', 'en' => ''],
    ];
}

$sorted = $papers;
usort($sorted, function ($a, $b) {
    $ya = is_numeric(to_num($a['year'] ?? '')) ? (float)to_num($a['year']) : -1;
    $yb = is_numeric(to_num($b['year'] ?? '')) ? (float)to_num($b['year']) : -1;
    return $yb <=> $ya;
});

require __DIR__ . '/includes/header.php';
?>
<h1 class="page-h">مقالات علمی</h1>
<p class="page-sub">مقالات، پایان‌نامه‌ها و آثار پژوهشی — هر متن را هم به فارسی و هم به انگلیسی وارد کنید</p>

<a class="btn btn-primary" href="?new=1" data-tip="فرم افزودن مقاله جدید را باز می‌کند">＋ افزودن مقاله</a>

<?php if ($edit !== null): ?>
<div class="card-p mt16">
  <h2><?= $edit['id'] !== '' ? 'ویرایش مقاله' : 'افزودن مقاله جدید' ?></h2>
  <form method="post" enctype="multipart/form-data">
    <?= csrf_field() ?>
    <input type="hidden" name="action" value="save">
    <input type="hidden" name="id" value="<?= e($edit['id']) ?>">
    <input type="hidden" name="pdf" value="<?= e($edit['pdf']) ?>">
    <div class="form-grid">
      <div class="field"><label>عنوان مقاله (فارسی) *</label><input class="input" name="title[fa]" value="<?= e($edit['title']['fa'] ?? '') ?>"></div>
      <div class="field"><label>Paper Title (English) *</label><input class="input in-ltr" name="title[en]" value="<?= e($edit['title']['en'] ?? '') ?>"></div>
      <div class="field"><label>نویسندگان (فارسی) <span class="tip" data-tip="با ویرگول جدا کنید — خودتان را هم در لیست بیاورید">؟</span></label><input class="input" name="authors[fa]" value="<?= e($edit['authors']['fa'] ?? '') ?>"></div>
      <div class="field"><label>Authors (English)</label><input class="input in-ltr" name="authors[en]" value="<?= e($edit['authors']['en'] ?? '') ?>"></div>
      <div class="field"><label>مجله / کنفرانس / ناشر (فارسی)</label><input class="input" name="venue[fa]" value="<?= e($edit['venue']['fa'] ?? '') ?>"></div>
      <div class="field"><label>Journal / Conference / Publisher (English)</label><input class="input in-ltr" name="venue[en]" value="<?= e($edit['venue']['en'] ?? '') ?>"></div>
      <div class="field"><label>سال <span class="tip" data-tip="شمسی یا میلادی — مقالات بر اساس همین عدد مرتب می‌شوند">؟</span></label><input class="input" name="year" value="<?= e($edit['year']) ?>" placeholder="مثلاً ۱۴۰۳ یا 2024"></div>
      <div class="field">
        <label>نوع <span class="tip" data-tip="برای فیلتر و برچسب مقالات استفاده می‌شود">؟</span></label>
        <select class="input" name="type">
          <?php foreach ($types_all as $k): ?>
            <option value="<?= e($k) ?>" <?= $edit['type'] === $k ? 'selected' : '' ?>><?= e(t('type_' . $k)) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="field"><label>شناسه DOI (اختیاری) <span class="tip" data-tip="مثلاً 10.1234/abc — لینک DOI به‌صورت خودکار ساخته می‌شود">؟</span></label><input class="input in-ltr" name="doi" placeholder="10.1234/abc" value="<?= e($edit['doi']) ?>"></div>
      <div class="field">
        <label>فایل PDF مقاله (اختیاری) <span class="tip" data-tip="فقط PDF — دکمه «دانلود PDF» کنار مقاله فعال می‌شود">؟</span></label>
        <div class="file-picker" data-type="file">
          <div class="file-preview">
            <?php if (!empty($edit['pdf'])): ?>
              <span class="file-chip">📄 <?= e(basename($edit['pdf'])) ?></span>
            <?php else: ?>
              <span class="file-label">فایلی انتخاب نشده</span>
            <?php endif; ?>
          </div>
          <input type="file" name="pdf" accept="application/pdf">
        </div>
        <?php if (!empty($edit['pdf'])): ?>
          <label class="check"><input type="checkbox" name="del_pdf" value="1"> حذف PDF فعلی</label>
        <?php endif; ?>
      </div>
    </div>
    <div class="form-grid mt16">
      <div class="field"><label>چکیده (فارسی)</label><textarea class="input" name="abstract[fa]" rows="4"><?= e($edit['abstract']['fa'] ?? '') ?></textarea></div>
      <div class="field"><label>Abstract (English)</label><textarea class="input in-ltr" name="abstract[en]" rows="4"><?= e($edit['abstract']['en'] ?? '') ?></textarea></div>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary">ذخیره</button>
      <a class="btn btn-soft" href="<?= e(url('admin/papers.php')) ?>">بستن فرم</a>
    </div>
  </form>
</div>
<?php endif; ?>

<div class="mt16">
  <?php if (!$papers): ?>
    <div class="empty">هنوز مقاله‌ای ثبت نشده است.</div>
  <?php else: ?>
  <div class="list-tools">
    <span class="muted-text"><?= count($papers) ?> مقاله</span>
    <input type="search" class="input tbl-search" data-table="papersTbl" placeholder="🔎 جستجو در لیست...">
  </div>
  <div class="tbl-wrap">
  <table class="tbl" id="papersTbl">
    <thead><tr><th>عنوان</th><th>سال</th><th>نوع</th><th>عملیات</th></tr></thead>
    <tbody>
    <?php foreach ($sorted as $p): $pubUrl = url('papers'); ?>
      <tr>
        <td>
          <div class="cell-title">
            <span class="cell-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>
            </span>
            <span><strong><?= e(b_any($p['title'] ?? '')) ?></strong></span>
          </div>
        </td>
        <td><bdi dir="ltr"><?= e($p['year'] ?? '') ?></bdi></td>
        <td><span class="badge badge-soft"><?= e(t('type_' . (in_array($p['type'] ?? '', $types_all, true) ? $p['type'] : 'other'))) ?></span></td>
        <td>
          <div class="cell-actions">
            <a class="btn btn-mini btn-soft" href="<?= e($pubUrl) ?>" target="_blank" data-tip="باز کردن صفحه مقالات">نمایش</a>
            <button type="button" class="btn btn-mini" data-copy="<?= e($pubUrl) ?>" data-tip="کپی آدرس صفحه مقالات">🔗 کپی لینک</button>
            <a class="btn btn-mini" href="?edit=<?= e($p['id']) ?>" data-tip="ویرایش این مقاله">ویرایش</a>
            <form method="post" data-confirm="این مقاله حذف شود؟ (این کار برگشت‌پذیر نیست)" class="inline">
              <?= csrf_field() ?>
              <input type="hidden" name="action" value="delete">
              <input type="hidden" name="id" value="<?= e($p['id']) ?>">
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
