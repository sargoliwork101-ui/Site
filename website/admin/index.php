<?php
/** داشبورد پنل مدیریت */
require dirname(__DIR__) . '/config.php';
require_login();

$data = load_data();
$admin_title = 'داشبورد';
require __DIR__ . '/includes/header.php';
?>
<h1 class="page-h">داشبورد</h1>
<p class="page-sub">خوش آمدید! برای ویرایش هر بخش از منوی کناری استفاده کنید.</p>

<div class="dash-grid">
  <a class="dash-card card" href="content.php" data-tip="تیتر صفحه اصلی، خود معرفی، تحصیلات، سوابق و مهارت‌ها">
    <span class="dash-num">📝</span>
    <h3>ویرایش محتوا</h3>
    <p>تیتر، معرفی، تحصیلات، سوابق و مهارت‌ها (دوزبانه)</p>
  </a>
  <a class="dash-card card" href="works.php" data-tip="پروژه‌ها با جستجو، پیش‌نمایش و کپی لینک">
    <span class="dash-num">🖼️</span>
    <h3>نمونه‌کارها</h3>
    <p><?= count($data['works'] ?? []) ?> پروژه ثبت شده</p>
  </a>
  <a class="dash-card card" href="papers.php" data-tip="مقالات با DOI و PDF و جستجو">
    <span class="dash-num">📚</span>
    <h3>مقالات علمی</h3>
    <p><?= count($data['papers'] ?? []) ?> مقاله ثبت شده</p>
  </a>
  <a class="dash-card card" href="security.php" data-tip="بررسی لحظه‌ای وضعیت امنیتی و سلامت سایت">
    <span class="dash-num">🛡️</span>
    <h3>پایش امنیت</h3>
    <p>بررسی سرورهای امنیتی، HTTPS و سلامت سیستم</p>
  </a>
  <a class="dash-card card" href="settings.php" data-tip="اطلاعات شخصی، لینک‌ها، رزومه PDF، ایمیل آزمایشی">
    <span class="dash-num">⚙️</span>
    <h3>تنظیمات</h3>
    <p>اطلاعات شخصی، لینک‌ها، رزومه PDF و رمز عبور</p>
  </a>
</div>

<div class="card-p mt16">
  <h2>راهنمای سریع</h2>
  <ul class="help-list">
    <li>💡 روی <b>علامت سؤال</b> کنار هر فیلد بروید تا توضیح آن نمایش داده شود (تولتیپ).</li>
    <li>🔎 در بخش نمونه‌کارها و مقالات، با <b>جعبه جستجو</b> لیست را فیلتر کنید.</li>
    <li>🔗 دکمه <b>کپی لینک</b> آدرس عمومی هر آیتم را در کلیپ‌بورد کپی می‌کند.</li>
    <li>🌐 هر متن را هم به <b>فارسی</b> و هم به <b>انگلیسی</b> وارد کنید؛ اگر یکی خالی باشد از دیگری نمایش داده می‌شود.</li>
    <li>💾 برای بکاپ کامل، پوشه‌های <bdi dir="ltr">data</bdi> و <bdi dir="ltr">uploads</bdi> را کپی کنید.</li>
  </ul>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
