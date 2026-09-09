<?php
/**
 * ذخیره‌سازی داده‌ها — بدون دیتابیس، در یک فایل JSON
 * محتوای دوزبانه: فیلدها به صورت ['fa' => ..., 'en' => ...] ذخیره می‌شوند
 */

function data_dir()     { return dirname(__DIR__) . '/data'; }
function content_file() { return data_dir() . '/content.json'; }
function auth_file()    { return data_dir() . '/auth.json'; }

/** داده‌های نمونه برای اولین اجرا — تخصص الکترونیک */
function seed_data() {
    $now = time();
    return [
        'version' => 2,
        'settings' => [
            'site_name'    => ['fa' => 'پایگاه شخصی', 'en' => 'Personal Site'],
            'person_name'  => 'نام شما',
            'person_title' => ['fa' => 'مهندس الکترونیک | طراحی PCB و سیستم‌های تعبیه‌شده', 'en' => 'Electronics Engineer | PCB & Embedded Systems'],
            'avatar'       => '',
            'email'        => 'you@example.com',
            'phone'        => '',
            'location'     => ['fa' => 'تهران، ایران', 'en' => 'Tehran, Iran'],
            'cv_pdf'       => '',
            'footer_text'  => ['fa' => 'طراحی و توسعه با ❤️', 'en' => 'Built with ❤️'],
            'social'       => ['github' => '', 'linkedin' => '', 'orcid' => '', 'scholar' => '', 'telegram' => ''],
        ],
        'home' => [
            'headline' => ['fa' => 'سلام! من «نام شما» هستم', 'en' => "Hi! I'm Your Name"],
            'subtitle' => ['fa' => 'مهندس الکترونیک — طراحی PCB، سیستم‌های تعبیه‌شده و الکترونیک قدرت. این سایت جایگزین آنلاین رزومه، نمونه‌کارها و مقالات علمی من است.', 'en' => 'Electronics Engineer — PCB design, embedded systems & power electronics. This site is my online resume, portfolio and publications hub.'],
            'intro'    => ['fa' => "این یک متن نمونه است. از پنل مدیریت، بخش «ویرایش محتوا»، می‌توانید معرفی خود را با چند خط ساده جایگزین کنید (هر بخش را هم به فارسی و هم به انگلیسی می‌توانید بنویسید).", 'en' => 'This is a sample introduction. You can replace it from the Admin Panel → «Edit Content» (each field can be written in both Persian and English).'],
        ],
        'about' => [
            'bio' => ['fa' => "این بخش «خود معرفی» است؛ یک متن نمونه برای نمایش چیدمان صفحه.\n\nمثلاً می‌توانید درباره سال‌های تجربه در طراحی سخت‌افزار، حوزه‌های تخصصی (PCB، Embedded، قدرت، RF) و اهداف حرفه‌ای‌تان بنویسید.\n\nهمه‌چیز از پنل مدیریت قابل ویرایش است؛ بدون نیاز به کدنویسی.",
                        'en' => "This is the «About me» section; sample text to show the layout.\n\nFor example, you can write about your years of hardware design experience, specializations (PCB, Embedded, Power, RF) and professional goals.\n\nEverything is editable from the Admin Panel — no coding required."],
            'education' => [
                ['title' => ['fa' => 'کارشناسی ارشد مهندسی الکترونیک (نمونه)', 'en' => 'M.Sc. in Electronic Engineering (Sample)'],
                 'org'   => ['fa' => 'دانشگاه نمونه، دانشکده مهندسی برق و کامپیوتر', 'en' => 'Sample University, Faculty of Electrical & Computer Engineering'],
                 'year'  => '1396-1399',
                 'desc'  => ['fa' => 'پایان‌نامه: طراحی BMS با بالانس فعال', 'en' => 'Thesis: BMS design with active balancing']],
                ['title' => ['fa' => 'کارشناسی مهندسی الکترونیک (نمونه)', 'en' => 'B.Sc. in Electronic Engineering (Sample)'],
                 'org'   => ['fa' => 'دانشگاه نمونه', 'en' => 'Sample University'],
                 'year'  => '1392-1396',
                 'desc'  => ['fa' => '', 'en' => '']],
            ],
            'experience' => [
                ['title' => ['fa' => 'مهندس الکترونیک (نمونه)', 'en' => 'Electronics Engineer (Sample)'],
                 'org'   => ['fa' => 'شرکت فناوری نمونه', 'en' => 'Sample Tech Co.'],
                 'year'  => '1400 - اکنون',
                 'desc'  => ['fa' => 'طراحی PCB و ساخت پروتوتایپ محصولات IoT', 'en' => 'PCB design and IoT product prototyping']],
                ['title' => ['fa' => 'مهندس سخت‌افزار (نمونه)', 'en' => 'Hardware Engineer (Sample)'],
                 'org'   => ['fa' => 'شرکت صنعتی نمونه', 'en' => 'Sample Industrial Co.'],
                 'year'  => '1399-1400',
                 'desc'  => ['fa' => 'طراحی منابع تغذیه و مدارهای قدرت', 'en' => 'Power supply and power circuit design']],
            ],
            'skills' => ['PCB Design (KiCad, Altium)', 'Embedded C / C++', 'STM32 & ESP32', 'Power Electronics', 'Python', 'MATLAB / Simulink', 'Soldering & Prototyping', 'RF & Antenna Basics'],
        ],
        'works' => [
            ['id' => 'w1',
             'title'       => ['fa' => 'PCB سنسور زیست‌محیطی IoT', 'en' => 'IoT Environmental Sensor Node PCB'],
             'category'    => ['fa' => 'طراحی PCB', 'en' => 'PCB Design'],
             'description' => ['fa' => "طراحی برد ۴ لایه با KiCad برای اندازه‌گیری دما، رطوبت و CO2 با ESP32 و ماژول LoRa؛ طراحی مصرف بهینه برای تغذیه با پنل خورشیدی و باتری.\n\nمراحل: رسم اسکیمتیک، Layout، بازبینی DRC، تولید و مونتاژ.", 'en' => "4-layer PCB designed in KiCad for temperature, humidity and CO2 sensing with ESP32 + LoRa; low-power design for solar panel and battery operation.\n\nStages: schematic capture, layout, DRC review, fabrication and assembly."],
             'link' => '', 'featured' => 1, 'created' => $now - 86400 * 40],
            ['id' => 'w2',
             'title'       => ['fa' => 'سیستم مدیریت باتری (BMS) سه‌سلولی', 'en' => '3-Cell Battery Management System (BMS)'],
             'category'    => ['fa' => 'الکترونیک قدرت', 'en' => 'Power Electronics'],
             'description' => ['fa' => 'مدیریت سلول‌های لیتیوم-یون با بالانس فعال، اندازه‌گیری ولتاژ/جریان/دما، تشخیص خطا و ارتباط I2C؛ شامل مدار حفاظت سخت‌افزاری در برابر شارژ/دشارژ بیش‌ازحد.', 'en' => 'Li-ion cell management with active balancing, voltage/current/temperature measurement, fault detection and I2C communication; includes hardware overcharge/overdischarge protection circuitry.'],
             'link' => '', 'featured' => 1, 'created' => $now - 86400 * 30],
            ['id' => 'w3',
             'title'       => ['fa' => 'دستگاه مانیتورینگ مصرف انرژی', 'en' => 'Energy Monitoring Device'],
             'category'    => ['fa' => 'IoT', 'en' => 'IoT'],
             'description' => ['fa' => 'اندازه‌گیری توان لحظه‌ای با سنسور CT و میکروکنترلر، نمایش روی نمایشگر OLED و داشبورد وب برای نمایش مصرف لحظه‌ای و تاریخی.', 'en' => 'Real-time power measurement using CT sensors and a microcontroller, OLED display plus a web dashboard for live and historical consumption.'],
             'link' => '', 'featured' => 1, 'created' => $now - 86400 * 15],
            ['id' => 'w4',
             'title'       => ['fa' => 'درایور موتور BLDC برای ربات', 'en' => 'BLDC Motor Driver for Robotics'],
             'category'    => ['fa' => 'کنترل موتور', 'en' => 'Motor Control'],
             'description' => ['fa' => 'پیاده‌سازی کنترل FOC بدون سنسور روی STM32 با برد ۳ فازه؛ توان خروجی ۵۰۰ وات و رابط کنترل برای ربات‌های متحرک.', 'en' => 'Sensorless FOC implementation on STM32 with a 3-phase board; 500 W output power and a control interface for mobile robots.'],
             'link' => '', 'featured' => 0, 'created' => $now - 86400 * 5],
        ],
        'papers' => [
            ['id' => 'p1',
             'title'    => ['fa' => 'سیستم پایش زیست‌محیطی کم‌هزینه مبتنی بر LoRa و انرژی خورشیدی', 'en' => 'A Low-Cost Solar-Powered Environmental Monitoring System Based on LoRa'],
             'authors'  => ['fa' => 'نام شما، همکار ۱', 'en' => 'Your Name, Co-Author 1'],
             'venue'    => ['fa' => 'مجله الکترونیک کاربردی (نمونه)', 'en' => 'Journal of Applied Electronics (Sample)'],
             'year'     => '1403',
             'type'     => 'journal',
             'doi'      => '',
             'pdf'      => '',
             'abstract' => ['fa' => 'چکیده نمونه این مقاله... این موارد صرفاً برای نمایش هستند و می‌توانید آن‌ها را از پنل مدیریت تغییر دهید.', 'en' => 'Sample abstract of this paper... These items are for demonstration only and can be changed from the Admin Panel.']],
            ['id' => 'p2',
             'title'    => ['fa' => 'طراحی و پیاده‌سازی BMS سه‌سلولی با بالانس فعال', 'en' => 'Design and Implementation of a 3-Cell BMS with Active Balancing'],
             'authors'  => ['fa' => 'نام شما و همکاران', 'en' => 'Your Name et al.'],
             'venue'    => ['fa' => 'کنفرانس ملی الکترونیک (نمونه)', 'en' => 'National Conference on Electronics (Sample)'],
             'year'     => '1402',
             'type'     => 'conference',
             'doi'      => '', 'pdf' => '',
             'abstract' => ['fa' => '', 'en' => '']],
            ['id' => 'p3',
             'title'    => ['fa' => 'پایان‌نامه: طراحی درایور موتور BLDC با کنترل FOC بدون سنسور', 'en' => 'Thesis: Sensorless FOC BLDC Motor Driver Design'],
             'authors'  => ['fa' => 'نام شما', 'en' => 'Your Name'],
             'venue'    => ['fa' => 'دانشگاه نمونه', 'en' => 'Sample University'],
             'year'     => '1399',
             'type'     => 'thesis',
             'doi'      => '', 'pdf' => '',
             'abstract' => ['fa' => '', 'en' => '']],
            ['id' => 'p4',
             'title'    => ['fa' => 'بررسی مقایسه‌ای آنتن‌های مایکرواستریپ در باند ۲.۴ گیگاهرتز', 'en' => 'A Comparative Study of Microstrip Antennas in the 2.4 GHz Band'],
             'authors'  => ['fa' => 'نام شما', 'en' => 'Your Name'],
             'venue'    => ['fa' => 'مجله مهندسی رادیویی (نمونه)', 'en' => 'Journal of Radio Engineering (Sample)'],
             'year'     => '1398',
             'type'     => 'journal',
             'doi'      => '', 'pdf' => '',
             'abstract' => ['fa' => '', 'en' => '']],
        ],
    ];
}

/** خواندن داده‌های سایت */
function load_data() {
    $file = content_file();
    if (!is_file($file)) {
        $d = seed_data();
        save_data($d);
        return $d;
    }
    $fp = @fopen($file, 'r');
    if (!$fp) return seed_data();
    flock($fp, LOCK_SH);
    $raw = stream_get_contents($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    $d = json_decode($raw, true);
    if (!is_array($d)) return seed_data();

    $seed = seed_data();
    // اگر نسخه داده‌ها قدیمی باشد (مثلاً قبل از دوزبانه‌سازی)، بازنشانی به نمونه
    if ((int)($d['version'] ?? 0) !== (int)$seed['version']) {
        save_data($seed);
        return $seed;
    }
    // بخش‌های جدید را از seed تکمیل کن
    foreach ($seed as $k => $v) {
        if (!isset($d[$k]) || !is_array($d[$k])) $d[$k] = $v;
    }
    return $d;
}

/** ذخیره داده‌ها (با روش اتمیک: نوشتن در فایل موقت و rename) */
function save_data(array $data) {
    $file = content_file();
    if (!is_dir(dirname($file))) @mkdir(dirname($file), 0775, true);
    $tmp = $file . '.' . getmypid() . '.' . mt_rand(1000, 9999);
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($json === false) return false;
    if (file_put_contents($tmp, $json, LOCK_EX) === false) return false;
    return rename($tmp, $file);
}

/** خواندن اطلاعات احراز هویت */
function load_auth() {
    $f = auth_file();
    if (!is_file($f)) return null;
    $d = json_decode((string)file_get_contents($f), true);
    return is_array($d) ? $d : null;
}

/** ذخیره اطلاعات احراز هویت */
function save_auth(array $a) {
    $f = auth_file();
    $tmp = $f . '.' . getmypid() . '.tmp';
    if (file_put_contents($tmp, json_encode($a, JSON_UNESCAPED_UNICODE), LOCK_EX) === false) return false;
    return rename($tmp, $f);
}
