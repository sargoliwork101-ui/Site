# 🤖 AI Architecture Instructions & Master Context Prompt
## راهنمای جامع و دستورالعمل‌های فنی برای هوش‌های مصنوعی (AI Master Prompt)

> 💡 **نحوه استفاده برای کاربر:**  
> هر زمان که خواستید در آینده این پروژه را با هر مدل هوش مصنوعی دیگری (مانند **Claude**, **ChatGPT**, **Gemini**, **Grok** یا **DeepSeek**) توسعه، ارتقا یا ویرایش دهید، کافی است **متن کادر زیر** را کپی کرده و به عنوان اولین پیام به هوش مصنوعی بدهید تا هوش مصنوعی بلافاصله تمام تاریخچه، قوانین سخت‌گیرانه، ساختار معماری و خواسته‌های شما را بدون نیاز به هیچ توضیح اضافی متوجه شود!

---

## 📋 پرامپت آماده کپی برای هوش مصنوعی (Ready-to-Copy Master Prompt)

```markdown
You are assisting me in maintaining and developing my existing "Senior Hardware & Embedded Systems Engineer Portfolio & CMS" web application.

### 🏛️ PROJECT CONTEXT & TECH STACK:
- Framework: React 19 + Vite + Tailwind CSS + Lucide React + DOMPurify + jsPDF + html2canvas + Mammoth.js
- Language: Full bilingual (Persian RTL & English LTR) with instant toggle.
- Typography: Default font is Vazirmatn (وزیرمتن) across all pages and 50 templates.
- State Management: Centralized in `src/context/DataContext.jsx` persisted in localStorage with automated JSON snapshots.

### ⚠️ MANDATORY ARCHITECTURAL RULES & USER CONSTRAINTS (DO NOT VIOLATE):
1. **Bilingual Fields Placement:** In the Admin Panel, EVERY single category, board, article, skill, education, and career field MUST have its equivalent English field positioned directly under the Persian field so the user can manually enter custom English text.
2. **No Years of Experience in Skills:** In the Technical Skills & Competencies matrix, do NOT display years of experience. Skills must only focus on proficiency percentage levels (e.g., 95% Mastery / Expert) and domain categories.
3. **Dynamic Hardware Specs (No Hardcoding):** Hardware highlights in the Hero section and PCB cards must NEVER be hardcoded. They must dynamically read from the active/featured board's actual properties (`board.edaTool`, `board.interfaces`, `board.dimensions`, `board.layers`, `board.powerSupply`, `board.status`).
4. **Featured Hero Project (پروژه شاخص):** The admin can select boards as Featured Hero Boards via the star icon in the Admin Panel boards list or the checkbox in the board form. Multiple boards can be featured simultaneously, and on each visit/reload a featured board is randomly selected and showcased in the Hero PCB card without manual clutter.
5. **Conditional Rendering of Empty Sections:** If any section has 0 items (e.g. 0 articles, 0 boards, 0 skills, 0 experiences), that section MUST return `null` and NOT render on the public website, and its navigation link MUST be automatically excluded from Navbar and Footer.
6. **Chronological Project Ordering:** Projects in `BoardsSection` MUST be sorted chronologically by manufacturing/creation date (`createdDate` / `manufactureYear` descending) by default, not by upload order.
7. **LinkedIn Career Tree Design:** The work experience section must maintain an authentic LinkedIn career tree timeline with company cards, company logos/initials, role progression, automatic tenure calculation (years/months), engineering achievements, and skills used.
8. **Word-Style Rich Text Editor:** All text areas must connect to `RichTextEditorModal.jsx` supporting direct copy-pasting from Microsoft Word (preserving tables, headings, and lists), DOCX file import via mammoth, engineering symbols (Ω, µF, ⚡), and text ribbons.
9. **Spotlight Global Search:** The site has a subtle magnifying glass in the Navbar and `Ctrl+K` / `⌘K` shortcut searching across boards, articles, skills, and experience with instant modal jump.
10. **100% English Synchronization:** When site language is set to English (`en`), the entire public UI (navbar, footer, contact form, buttons, PDF resume modal menus, and PDF documents) must display purely in English without Persian remnants.
11. **Computer Engineering Grade Security:** Use `DOMPurify` HTML sanitization, constant-time password check (`timingSafeEqual`), anti-brute-force rate limiting with cooldown timer, honeypot anti-spam, safe download triggers, and 6-digit OTP email password recovery.
12. **50 Homepage Design Models:** The 50 homepage layout models in `src/data/templates.js` must remain selectable EXCLUSIVELY from inside the Admin Panel; no template pickers or banners in public view.
13. **Strict In-Browser View-Only for Hardware Images & 3D Models:** Downloading, saving, or extracting raw 3D CAD/STEP files and board imagery is STRICTLY DISABLED for visitors to protect intellectual property. Users can interact with 3D PCB models (360° orbit, zoom, solder mask color switcher) exclusively in-browser.
14. **Dedicated Engineering Blog Module:** The tech blog is accessible through the main header and footer without cluttering the single-page home layout, supporting category filtering, reading time estimation, interactive celebratory likes, and Word-style WYSIWYG admin editing.
15. **Granular RBAC Multi-User System:** The system includes full Role-Based Access Control with pre-defined roles (`super_admin`, `content_editor`, `hardware_engineer`, `auditor_viewer`, `custom`) and granular permission matrix. Default master credentials are username `admin` with password `admin` for testing.
16. **Dynamic Display Limits ($Rows \times Cols$):** Homepage display limits for boards and scientific articles are dynamically calculated from $Rows \times Columns$ ($1, 2, 3, 4$ desktop columns and $1, 2, 3$ rows), with remaining items placed behind an expandable Show More toggle.
17. **Consolidated Master Settings Hub:** All site-wide configuration modules (Layout & Limits, Favicon & Branding, User Management RBAC, 50 Design Templates, SEO Studio, Global Taxonomies, Database Backups, Iran Host, Security & Recovery) are grouped under the single unified master "Settings" tab in the Admin Panel sidebar.

Whenever you write or modify code, adhere strictly to these 15 constraints, provide clean code comments, and preserve existing features.
```

---

## 🏗️ ساختار ماژول‌ها و وظایف هر فایل (File Architecture Map)

| مسیر فایل / File Path | وظیفه اصلی / Purpose |
|---|---|
| `src/context/DataContext.jsx` | مرکز مدیریت داده‌های دوزبانه، سیستم RBAC، احراز هویت، توابع بازیابی رمز OTP، متدهای CRUD، اسنپ‌شات‌ها و پروژه شاخص |
| `src/data/defaultData.js` | دیتابیس پیش‌فرض شامل ۱۴ برد تخصصی در ۷ دسته بدون فیلد خالی، مقالات، وبلاگ، مهارت‌ها و سوابق شغلی |
| `src/data/templates.js` | تعریف کامل ۵۰ قالب و مدل صفحه اول با تم‌ها و رنگ‌بندی‌های متنوع |
| `src/utils/security.js` | پکیج جامع امنیت: توابع `DOMPurify`، `timingSafeEqual`، `RateLimiter`، تولید توکن `OTP` و `triggerSafeDownload` |
| `src/utils/translatorHelper.js` | موتور کمکی ترجمه خودکار عبارات رایج فارسی به انگلیسی |
| `src/components/admin/AdminPanel.jsx` | پنل مدیریت پیشرفته با فیلدهای دوزبانه زیر هم، ستاره پروژه شاخص، مدیریت دسته‌ها، بک‌آپ و تنظیمات امنیت |
| `src/components/admin/UserManagementSection.jsx` | مدیریت جامع کاربران و سطوح دسترسی RBAC با ماتریس مجوزها و شبیه‌ساز سوئیچ سریع |
| `src/components/admin/BlogManagementSection.jsx` | داشبورد مدیریت و انتشار پست‌های وبلاگ مهندسی با ادیتور ورد و فیلدهای دوزبانه |
| `src/components/modals/AdminLoginModal.jsx` | پنجره لاگین با شیلد ضد نفوذ، ورود سریع تستی، ویزارد ثبت ایمیل و فرآیند بازیابی رمز عبور با کد OTP |
| `src/components/modals/GlobalSearchModal.jsx` | اسپات‌لایت سرچ سراسری با کلید میانبر `Ctrl+K` برای جستجوی همزمان در تمام داده‌ها |
| `src/components/modals/PdfResumeModal.jsx` | خروجی رزومه A4 استاندارد در ۳ قالب (Modern Two-Column, Executive, Academic) با ترجمه ۱۰۰٪ انگلیسی/فارسی |
| `src/components/modals/BoardModal.jsx` | نمایش جزئیات کامل برد با مشخصات استک‌آپ، پین‌اوت‌ها، نمایشگر سه‌بعدی تعاملی و حالت محافظت‌شده View-Only |
| `src/components/modals/ArticleModal.jsx` | نمایش مقاله کامل با فرمت غنی، تگ‌ها و دکمه دانلود سند |
| `src/components/modals/BlogModal.jsx` | درگاه اختصاصی مطالعه مقالات وبلاگ مهندسی با فیلتر دسته‌بندی، جستجو و لایک تعاملی |
| `src/components/common/Interactive3DViewer.jsx` | کامپوننت نمایشگر سه‌بعدی آنلاین بردها با قابلیت چرخش ۳۶۰ درجه، زوم، تعویض رنگ چاپ سبز و امنیت عدم دانلود |
| `src/components/common/RichTextEditorModal.jsx` | ادیتور کامل ورد با جدول‌ساز، سمبل‌های مهندسی (Ω, µF)، ایمپورت DOCX و پیست از ورد |
| `src/components/common/TaxonomyManagerModal.jsx` | مدیریت و تغییر نام گزینه‌های دراپ‌دان (دسته‌ها، وضعیت‌ها، نرم‌افزارها) با همگام‌سازی آبشاری خودکار |
| `src/components/sections/HeroSection.jsx` | بخش هدر و معرفی با کارت تعاملی PCB متصل به پروژه شاخص پویا و تایپوگرافی متحرک |
| `src/components/sections/BoardsSection.jsx` | گرید نمایش بردهای سخت‌افزاری با مرتب‌سازی زمانی بر اساس تاریخ ساخت و رندر مشروط |
| `src/components/sections/ArticlesSection.jsx` | لیست مقالات پژوهشی با فیلتر تگ‌ها، سرچ اختصاصی و رندر مشروط |
| `src/components/sections/SkillsSection.jsx` | ماتریس مهارت‌ها بر اساس درصد تسلط بدون سال سابقه و رندر مشروط |
| `src/components/sections/ExperienceSection.jsx` | درخت سوابق کاری لینکدین با محاسبه سنوات، مدارک تحصیلی و گواهینامه‌ها |
| `src/components/sections/ContactSection.jsx` | فرم تماس ضد اسپم با تله هانی‌پات، Rate Limiting و ارسال مستقیم پیام به ایمیل مدیر |
| `src/components/common/Navbar.jsx` | نوبار شناور با سرچ ذره‌بین، دانلود رزومه، ورود ادمین و لینک‌های ناوبری داینامیک |
| `src/components/common/Footer.jsx` | فوتر سایت با لینک‌های شبکه‌های اجتماعی و ناوبری متصل به سکشن‌های فعال |

---

## 🔒 قوانین و استاندارد‌های امنیتی و حفاظت معنوی (Security & IP Protection Standards)

1. **IP & Asset Protection (حفاظت از کپی‌رایت سخت‌افزار):** دانلود فایل‌های سه‌بعدی CAD/STEP و تصاویر بردهای الکترونیکی غیرفعال است؛ کلیه فایل‌ها فقط به صورت رندر سه‌بعدی تعاملی درون‌برنامه‌ای نمایش داده می‌شوند و کلیک‌راست و درگ تصاویر قفل می‌باشد.
2. **XSS Sanitization:** تمام متون ورودی با `sanitizeText` و تمام محتواهای غنی HTML با `sanitizeRichHtml` (مبتنی بر `DOMPurify`) تمیز می‌شوند.
3. **Prototype Pollution Protection:** تمام داده‌های ورودی از بک‌آپ JSON یا فرم‌ها توسط `sanitizeBackupPayload` پالایش می‌شوند و کلیدهای `__proto__` و `constructor` فیلتر می‌گردند.
4. **Timing-Attack Defense:** تمام مقایسه‌های رمز عبور و کدهای OTP با تابع `timingSafeEqual` انجام می‌شوند تا از حملات کانال جانبی (Side-Channel) جلوگیری شود.
5. **Brute-Force Rate Limiting:** سیستم لاگین دارای Rate Limiter با حداکثر ۵ تلاش در ۳۰ ثانیه و فرم تماس دارای حداکثر ۳ ارسال در ۶۰ ثانیه است.
6. **Password Recovery Flow:** توکن‌های OTP ۶ رقمی تولید شده به مدت ۵ دقیقه معتبر هستند و تایمر ۶۰ ثانیه‌ای برای ارسال مجدد دارند.

---

## 📝 چک‌لیست تست قبل از تحویل هر تغییر جدید (AI Verification Checklist)

هر زمان که هوش مصنوعی تغییری در کدها ایجاد کرد، باید موارد زیر را بررسی و تایید کند:
- [ ] سقف تعداد نمایش اولیه بردهای سخت‌افزاری و مقالات بر اساس تنظیمات ادمین (`boardsDisplayLimit` و `articlesDisplayLimit`، پیش‌فرض ۲ ردیف / ۶ عدد یا ۱ ردیف) اعمال شود و مابقی اقلام در دکمه بازشونده «مشاهده بیشتر» قرار گیرند.
- [ ] دستور `npm run build` بدون هیچ ارور یا خطای ماژول با موفقیت اجرا شود.
- [ ] هیچ فیلد فارسی بدون فیلد انگلیسی متناظر در پنل ادمین ایجاد نشده باشد.
- [ ] هیچ سال سابقه‌ای در بخش مهارت‌های فنی اضافه نشده باشد.
- [ ] مشخصات بردها در هدر به صورت پویا از پروژه شاخص (`featured`) خوانده شوند و مقادیر ثابتی هاردکد نشوند.
- [ ] در صورت خالی بودن هر بخش، سکشن مربوطه رندر نشود و لینک آن در نوبار/فوتر حذف گردد.
- [ ] فایل‌های سه‌بعدی و تصاویر بوردها دارای دکمه دانلود نباشند و صرفاً در مرورگر نمایش داده شوند.
- [ ] خروجی رزومه PDF و منوهای آن در حالت انگلیسی کاملاً انگلیسی باشد.
- [ ] جستجوی سراسری (`Ctrl + K`) و باز شدن مودال‌ها بدون باگ کار کنند.
