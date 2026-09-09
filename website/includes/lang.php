<?php
/**
 * زبانشکن — متن‌های رابط کاربری (فارسی / انگلیسی)
 * زبان فعلی از کوکی site_lang خوانده می‌شود (پیش‌فرض: fa)
 */

function lang() {
    static $l = null;
    if ($l === null) {
        $l = (isset($_COOKIE['site_lang']) && in_array($_COOKIE['site_lang'], ['fa', 'en'], true))
            ? $_COOKIE['site_lang'] : 'fa';
    }
    return $l;
}

/** برگرداندن متن رابط کاربری در زبان فعلی */
function t($key) {
    $L = $GLOBALS['LANG'];
    $l = lang();
    return (string)($L[$l][$key] ?? $L['fa'][$key] ?? $key);
}

/**
 * محتوای دوزبانه: ['fa' => '...', 'en' => '...']
 * اگر زبان فعلی خالی باشد، به fa برمی‌گردد
 */
function b($field, $lang = null) {
    $lang = $lang ?: lang();
    if (is_array($field)) return (string)($field[$lang] ?? $field['fa'] ?? '');
    return (string)($field ?? '');
}

/** اولین مقدار غیرخالی (fa سپس en) — برای جداول پنل */
function b_any($field) {
    if (is_array($field)) {
        $fa = trim((string)($field['fa'] ?? ''));
        if ($fa !== '') return $fa;
        return (string)($field['en'] ?? '');
    }
    return (string)($field ?? '');
}

$GLOBALS['LANG'] = [
    'fa' => [
        'nav_home'    => 'خانه',
        'nav_about'   => 'درباره من',
        'nav_works'   => 'نمونه‌کارها',
        'nav_papers'  => 'مقالات علمی',
        'nav_contact' => 'تماس',
        'hero_hi'     => 'سلام 👋',
        'status'      => 'در دسترس برای پروژه‌های جدید',
        'btn_view_works'  => 'مشاهده نمونه‌کارها',
        'btn_download_cv' => 'دانلود رزومه (PDF)',
        'btn_about'   => 'آشنایی با من',
        'section_intro'    => 'معرفی کوتاه',
        'section_featured' => 'کارهای منتخب',
        'view_all'         => 'مشاهده همه',
        'section_latest'   => 'آخرین مقالات',
        'all_papers'       => 'همه مقالات',
        'stats_works'   => 'نمونه‌کار',
        'stats_papers'  => 'مقاله و اثر علمی',
        'stats_exp'     => 'سابقه تحصیلی و شغلی',
        'g_role'        => 'نقش',
        'g_location'    => 'مکان',
        'g_exp'         => 'تجربه',
        'g_exp_unit'    => 'سابقه',
        'cta_title' => 'برای همکاری روی یک پروژه الکترونیک با من در تماس باشید',
        'cta_sub'   => 'آدرس ایمیل، تلگرام و لینک‌های شبکه‌های اجتماعی من در صفحه تماس است.',
        'cta_btn'   => 'تماس با من',
        'page_about'  => 'درباره من',
        'about_self'       => 'خود معرفی',
        'about_education'  => 'تحصیلات',
        'about_experience' => 'سوابق کاری',
        'about_skills'     => 'مهارت‌ها و تخصص‌ها',
        'contact_info' => 'اطلاعات تماس',
        'download_cv'  => 'دانلود رزومه (PDF)',
        'page_works' => 'نمونه‌کارها',
        'works_sub'  => 'پروژه‌ها و کارهایی که انجام داده‌ام',
        'page_papers' => 'مقالات علمی',
        'papers_sub'  => 'مقالات، پایان‌نامه‌ها و آثار پژوهشی — مرتب بر اساس سال',
        'search_ph'   => '🔍 جستجو در عنوان، نویسنده، مجله یا چکیده...',
        'filter_all'  => 'همه',
        'no_year'     => 'بدون سال',
        'page_contact' => 'تماس با من',
        'contact_sub'  => 'برای همکاری، مشاوره یا هر سؤالی پیام دهید',
        'form_name'    => 'نام و نام خانوادگی',
        'form_email'   => 'ایمیل',
        'form_message' => 'پیام',
        'form_send'    => 'ارسال پیام',
        'ph_name'    => 'نام شما',
        'ph_email'   => 'you@example.com',
        'ph_message' => 'پیام خود را بنویسید...',
        'msg_sent'     => '✅ پیام شما با موفقیت ارسال شد؛ به‌زودی پاسخ می‌دهم.',
        'msg_fb_a'     => '⚠️ ارسال خودکار ایمیل روی این سرور فعال نیست. لطفاً مستقیماً برای',
        'msg_fb_b'     => 'بنویسید.',
        'msg_rate'     => '⏳ درخواست‌های شما زیاد بود؛ لطفاً چند دقیقه صبر کنید و دوباره امتحان کنید.',
        'msg_error'    => '❌ لطفاً فیلدها را کامل و درست پر کنید (ایمیل معتبر وارد کنید).',
        'contact_channels' => 'راه‌های ارتباطی',
        'not_found'  => 'صفحه‌ای که دنبالش بودید پیدا نشد.',
        'back_home'  => 'بازگشت به صفحه اصلی',
        'empty_works'  => 'هنوز نمونه‌کاری ثبت نشده است.',
        'empty_papers' => 'هنوز مقاله‌ای ثبت نشده است.',
        'view_project' => 'مشاهده پروژه',
        'back_works'   => 'بازگشت به همه نمونه‌کارها',
        'abstract' => 'چکیده',
        'project'  => 'پروژه',
        'type_journal'       => 'مقاله ژورنالی',
        'type_conference'    => 'مقاله کنفرانسی',
        'type_book_chapter'  => 'فصل کتاب',
        'type_book'          => 'کتاب',
        'type_thesis'        => 'پایان‌نامه',
        'type_report'        => 'گزارش فنی',
        'type_other'         => 'سایر',
    ],
    'en' => [
        'nav_home'    => 'Home',
        'nav_about'   => 'About',
        'nav_works'   => 'Portfolio',
        'nav_papers'  => 'Publications',
        'nav_contact' => 'Contact',
        'hero_hi'     => 'Hello 👋',
        'status'      => 'Available for new projects',
        'btn_view_works'  => 'View Portfolio',
        'btn_download_cv' => 'Download CV (PDF)',
        'btn_about'   => 'About Me',
        'section_intro'    => 'Short Introduction',
        'section_featured' => 'Featured Projects',
        'view_all'         => 'View All',
        'section_latest'   => 'Latest Publications',
        'all_papers'       => 'All Publications',
        'stats_works'   => 'Projects',
        'stats_papers'  => 'Publications',
        'stats_exp'     => 'Academic & Work Experience',
        'g_role'        => 'Role',
        'g_location'    => 'Location',
        'g_exp'         => 'Experience',
        'g_exp_unit'    => 'records',
        'cta_title' => "Let's build your next electronics project together",
        'cta_sub'   => 'My email, Telegram and social links are on the contact page.',
        'cta_btn'   => 'Contact Me',
        'page_about'  => 'About Me',
        'about_self'       => 'About Me',
        'about_education'  => 'Education',
        'about_experience' => 'Work Experience',
        'about_skills'     => 'Skills & Expertise',
        'contact_info' => 'Contact Information',
        'download_cv'  => 'Download CV (PDF)',
        'page_works' => 'Portfolio',
        'works_sub'  => 'Projects and things I have built',
        'page_papers' => 'Publications',
        'papers_sub'  => 'Papers, theses and research works — sorted by year',
        'search_ph'   => '🔍 Search in title, authors, venue or abstract...',
        'filter_all'  => 'All',
        'no_year'     => 'No year',
        'page_contact' => 'Contact Me',
        'contact_sub'  => 'For collaboration, consulting or any question, drop me a message',
        'form_name'    => 'Full Name',
        'form_email'   => 'Email',
        'form_message' => 'Message',
        'form_send'    => 'Send Message',
        'ph_name'    => 'Your name',
        'ph_email'   => 'you@example.com',
        'ph_message' => 'Write your message...',
        'msg_sent'     => '✅ Your message was sent successfully; I will get back to you soon.',
        'msg_fb_a'     => '⚠️ Automatic email is not enabled on this server. Please write directly to',
        'msg_fb_b'     => '.',
        'msg_rate'     => '⏳ Too many requests; please wait a few minutes and try again.',
        'msg_error'    => '❌ Please fill in all fields correctly (valid email).',
        'contact_channels' => 'Ways to Reach Me',
        'not_found'  => 'The page you are looking for could not be found.',
        'back_home'  => 'Back to Home',
        'empty_works'  => 'No projects published yet.',
        'empty_papers' => 'No publications yet.',
        'view_project' => 'View Project',
        'back_works'   => 'Back to all projects',
        'abstract' => 'Abstract',
        'project'  => 'Project',
        'type_journal'       => 'Journal',
        'type_conference'    => 'Conference',
        'type_book_chapter'  => 'Book Chapter',
        'type_book'          => 'Book',
        'type_thesis'        => 'Thesis',
        'type_report'        => 'Technical Report',
        'type_other'         => 'Other',
    ],
];

/** انواع مقالات (کلید) */
function paper_types() {
    return ['journal', 'conference', 'book_chapter', 'book', 'thesis', 'report', 'other'];
}
