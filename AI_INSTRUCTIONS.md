# 🤖 AI Architecture Instructions & Master Context Prompt
## راهنمای جامع و دستورالعمل‌های فنی برای هوش‌های مصنوعی (AI Master Prompt)

> 💡 **نحوه استفاده برای کاربر:**  
> هر زمان که خواستید در آینده این پروژه را با هر مدل هوش مصنوعی دیگری (مانند **Claude**, **ChatGPT**, **Gemini**, **Grok** یا **DeepSeek**) توسعه، ارتقا یا ویرایش دهید، کافی است **متن کادر زیر** را کپی کرده و به عنوان اولین پیام به هوش مصنوعی بدهید تا هوش مصنوعی بلافاصله تمام تاریخچه، قوانین سخت‌گیرانه، ساختار معماری و خواسته‌های شما را بدون نیاز به هیچ توضیح اضافی متوجه شود!
>
> 🤝 **اگر چند ایجنت همزمان کار می‌کنند:** به هر ایجنت کل همین فایل (یا حداقل بخش «گردش‌کار چند ایجنتی» + قانون ۲۱) را بدهید و برای هرکدام یک حوزه جدا از «نقشه مالکیت» تعیین کنید؛ خودتان (یا یک ایجنت ارشد) نقش **اینتگریتور** را داشته باشید: مرج PRها، بیلد نهایی و ری‌بیلد `site-upload.zip` فقط با اوست.

---

## 📋 پرامپت آماده کپی برای هوش مصنوعی (Ready-to-Copy Master Prompt)

```markdown
You are assisting me in maintaining and developing my existing "Senior Hardware & Embedded Systems Engineer Portfolio & CMS" web application.

### 🏛️ PROJECT CONTEXT & TECH STACK:
- Framework: React 19 + Vite + Tailwind CSS + Lucide React + DOMPurify + jsPDF + html2canvas + Mammoth.js
- Language: Full bilingual (Persian RTL & English LTR) with instant toggle.
- Typography: Default font is Vazirmatn (وزیرمتن) across all pages and 50 templates.
- State Management: Centralized in `src/context/DataContext.jsx` (single-writer file!) persisted in localStorage with automated JSON snapshots; public content syncs from the PHP server when `api/` exists (server is source of truth).

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
15. **Granular RBAC Multi-User System:** The system includes full Role-Based Access Control with 6 pre-defined roles (`super_admin`, `admin`, `editor`, `author`, `viewer`, `custom`) and an 11-permission matrix (`canManage*`; see `UserManagementSection.jsx`). First login in Secure mode runs a setup wizard (strong password + recovery email + inbox OTP) — there is NO default server password; Local mode keeps `admin`/`admin` only until the owner changes it (the default-password alarm must stay).
16. **Dynamic Display Limits ($Rows \times Cols$):** Homepage display limits for boards and scientific articles are dynamically calculated from $Rows \times Columns$ ($1, 2, 3, 4$ desktop columns and $1, 2, 3$ rows), with remaining items placed behind an expandable Show More toggle.
17. **Consolidated Master Settings Hub:** All site-wide configuration modules (Layout & Limits, Favicon & Branding, User Management RBAC, 50 Design Templates, SEO Studio, Global Taxonomies, Database Backups, Security & Recovery) are grouped under the single unified master "Settings" tab in the Admin Panel sidebar.
18. **Server Authority & No On-Screen OTP:** When `api/` exists, auth/OTP/reset-tokens/rate-limits live ONLY in PHP. OTP codes are inbox-only — NEVER render a fallback code in the UI, NEVER generate OTP client-side, NEVER route OTP through third parties.
19. **No Secrets in Git:** Passwords, SMTP credentials, hashes and tokens must NEVER be committed or logged. The notification mailbox lives in `api/data/smtp.json` (0600, server-only) and is edited via the authed panel API. If a secret ever leaks into a commit, rotate it immediately.
20. **Recovery-Question Gate:** The emergency local reset MUST stay gated by the hashed recovery answers (`resume_admin_secqa_v1`); never add a one-click reset.
21. **Parallel Agents:** If several agents work on this repo at once, every agent MUST follow the "Multi-Agent Workflow" section of AI_INSTRUCTIONS.md (branch-per-task, ownership map, merge protocol, PR template).
22. **Review-Hardened Invariants (do NOT regress):** (a) every DYNAMIC `href` goes through `sanitizeUrl` (never raw user/admin URLs); (b) new item IDs use `uniqueId(prefix)`, never bare `Date.now()`; (c) passwords are NEVER trimmed; (d) `triggerSafeDownload` takes a Blob/URL, never a raw object; (e) destructive actions need `showConfirmDialog`, every action needs an honest `showToast` (no fake success); (f) login failures must distinguish locked / rate_limit / network.

Whenever you write or modify code, adhere strictly to these 22 constraints, provide clean code comments (Persian-first file headers), and preserve existing features.
```

---

## 🏗️ ساختار ماژول‌ها و وظایف هر فایل (File Architecture Map)

| مسیر فایل / File Path | وظیفه اصلی / Purpose |
|---|---|
| `src/context/DataContext.jsx` | مرکز مدیریت داده‌های دوزبانه، سیستم RBAC، احراز هویت، توابع بازیابی رمز OTP، متدهای CRUD، اسنپ‌شات‌ها و پروژه شاخص |
| `src/data/defaultData.js` | دیتابیس پیش‌فرض شامل ۱۴ برد تخصصی در ۷ دسته بدون فیلد خالی، مقالات، وبلاگ، مهارت‌ها و سوابق شغلی |
| `src/data/templates.js` | تعریف کامل ۵۰ قالب و مدل صفحه اول با تم‌ها و رنگ‌بندی‌های متنوع |
| `src/utils/security.js` | پکیج جامع امنیت: توابع `DOMPurify`، `timingSafeEqual`، `RateLimiter`، تولید توکن `OTP` و `triggerSafeDownload` |
| `src/utils/serverAuth.js` | کلاینت فرانت برای بک‌اند واقعی (آدرس نسبی، سشن same-origin، خطای شفاف `no_backend` در حالت محلی) |
| `public/api/auth.php` | بک‌اند احراز هویت: bcrypt، سشن امن، OTP سمت سرور، ریت‌لیمیت، مدیریت اکانت و صندوق SMTP |
| `public/api/mailer.php` | ارسال ایمیل: SMTP صندوق اعلان‌ها (AUTH LOGIN + STARTTLS/SMTPS) با فال‌بک `mail()` خود هاست |
| `public/api/contact.php` | دریافت پیام فرم تماس + اعتبارسنجی و ضداسپم سمت سرور |
| `public/api/config.php` + `store.php` | ذخیره فایلی اتمیک با دسترسی 0600، ریت‌لیمیتر، سشن امن، دفاع CSRF با هدر AJAX |
| `src/utils/translatorHelper.js` | موتور کمکی ترجمه خودکار عبارات رایج فارسی به انگلیسی |
| `src/components/admin/AdminPanel.jsx` | پنل مدیریت پیشرفته با فیلدهای دوزبانه زیر هم، ستاره پروژه شاخص، مدیریت دسته‌ها، بک‌آپ و تنظیمات امنیت |
| `src/components/admin/UserManagementSection.jsx` | مدیریت جامع کاربران و سطوح دسترسی RBAC با ماتریس ۱۱ مجوزه (حذف ادمین اصلی و خودحذفی ممنوع) |
| `src/components/admin/BlogManagementSection.jsx` | داشبورد مدیریت و انتشار پست‌های وبلاگ مهندسی با ادیتور ورد و فیلدهای دوزبانه |
| `src/components/modals/AdminLoginModal.jsx` | دروازه ورود: لاگین با ریت‌لیمیت، ویزارد نصب اول (رمز+ایمیل+OTP)، بازیابی رمز و ریست اضطراری قفل‌شده |
| `src/components/modals/GlobalSearchModal.jsx` | اسپات‌لایت سرچ سراسری با کلید میانبر `Ctrl+K` برای جستجوی همزمان در تمام داده‌ها |
| `src/components/modals/PdfResumeModal.jsx` | خروجی رزومه A4 استاندارد در ۳ قالب (Modern Two-Column, Executive, Academic) با ترجمه ۱۰۰٪ انگلیسی/فارسی |
| `src/components/modals/BoardModal.jsx` | نمایش جزئیات کامل برد با مشخصات استک‌آپ، پین‌اوت‌ها، نمایشگر سه‌بعدی تعاملی و حالت محافظت‌شده View-Only |
| `src/components/modals/ArticleModal.jsx` | نمایش مقاله کامل با فرمت غنی، تگ‌ها و دکمه دانلود سند |
| `src/components/modals/BlogModal.jsx` | درگاه اختصاصی مطالعه مقالات وبلاگ مهندسی با فیلتر دسته‌بندی، جستجو و لایک تعاملی |
| `src/components/common/Interactive3DViewer.jsx` | کامپوننت نمایشگر سه‌بعدی آنلاین بردها با قابلیت چرخش ۳۶۰ درجه، زوم، تعویض رنگ چاپ سبز و امنیت عدم دانلود |
| `src/components/common/RichTextEditorModal.jsx` | ادیتور کامل ورد با جدول‌ساز، سمبل‌های مهندسی (Ω, µF)، ایمپورت DOCX و پیست از ورد |
| `src/components/common/TaxonomyManager.jsx` | مدیریت و تغییر نام گزینه‌های دراپ‌دان (دسته‌ها، وضعیت‌ها، نرم‌افزارها) با همگام‌سازی آبشاری خودکار |
| `src/components/sections/HeroSection.jsx` | بخش هدر و معرفی با کارت تعاملی PCB متصل به پروژه شاخص پویا و تایپوگرافی متحرک |
| `src/components/sections/BoardsSection.jsx` | گرید نمایش بردهای سخت‌افزاری با مرتب‌سازی زمانی بر اساس تاریخ ساخت و رندر مشروط |
| `src/components/sections/ArticlesSection.jsx` | لیست مقالات پژوهشی با فیلتر تگ‌ها، سرچ اختصاصی و رندر مشروط |
| `src/components/sections/SkillsSection.jsx` | ماتریس مهارت‌ها بر اساس درصد تسلط بدون سال سابقه و رندر مشروط |
| `src/components/sections/ExperienceSection.jsx` | درخت سوابق کاری لینکدین با محاسبه سنوات، مدارک تحصیلی و گواهینامه‌ها |
| `src/components/sections/ContactSection.jsx` | فرم تماس ضد اسپم با تله هانی‌پات، Rate Limiting و ارسال مستقیم پیام به ایمیل مدیر |
| `src/components/common/Navbar.jsx` | نوبار شناور با سرچ ذره‌بین، دانلود رزومه، ورود ادمین و لینک‌های ناوبری داینامیک |
| `src/components/common/Footer.jsx` | فوتر سایت با لینک‌های شبکه‌های اجتماعی و ناوبری متصل به سکشن‌های فعال |
| `src/components/common/Toast.jsx` | نمایش صف پیام‌های شناور (منطق در `showToast` دیتا) |
| `src/components/common/ActionDialogModal.jsx` | دیالوگ تایید/هشدار سراسری (جایگزین `window.confirm`) |
| `src/components/common/ErrorBoundary.jsx` | تور نجات ضد صفحه‌سفید با دکمه بازیابی و پاک‌سازی کش |
| `src/components/common/BackgroundCanvas.jsx` | پس‌زمینه متحرک canvas (جلوه قالب فعال + تاگل خاموشی) |
| `src/components/common/CustomAudioPlayer.jsx` | پخش‌کننده صوت/پادکست (استاندارد + حالت hero) |
| `src/components/common/BrandIcons.jsx` | آیکون‌های SVG دستی گیت‌هاب/لینکدین |
| `src/components/blog/BlogPortalPage.jsx` | پرتال عمومی وبلاگ (نمای جدا با `#blog`) |
| `src/utils/safeStorage.js` | حافظه امن با fallback داخل‌تب (تنها راه مجاز دسترسی به storage) |
| `src/utils/numberHelper.js` | ارقام فارسی/انگلیسی و `formatNum` نمایشی |
| `public/api/upload.php` | آپلود فایل پیوست فرم تماس (اسم تصادفی، ضداجرا) |
| `public/api/content.php` | همگام‌سازی محتوای عمومی (خواندن عمومی، نوشتن با سشن ادمین) |
| `public/api/session.php` | تنها مرجع سشن امن (پرچم‌ها + انقضا + چرخش) |
| `public/.htaccess` | روتینگ SPA + کش + هدرهای OWASP + قفل `api/data/` |
| `build-upload-zip.sh` | ساخت `site-upload.zip` آماده آپلود (فقط اینتگریتور) |

---

## 🔒 قوانین و استاندارد‌های امنیتی و حفاظت معنوی (Security & IP Protection Standards)

1. **IP & Asset Protection (حفاظت از کپی‌رایت سخت‌افزار):** دانلود فایل‌های سه‌بعدی CAD/STEP و تصاویر بردهای الکترونیکی غیرفعال است؛ کلیه فایل‌ها فقط به صورت رندر سه‌بعدی تعاملی درون‌برنامه‌ای نمایش داده می‌شوند و کلیک‌راست و درگ تصاویر قفل می‌باشد.
2. **XSS Sanitization:** تمام متون ورودی با `sanitizeText` و تمام محتواهای غنی HTML با `sanitizeRichHtml` (مبتنی بر `DOMPurify`) تمیز می‌شوند.
3. **Prototype Pollution Protection:** تمام داده‌های ورودی از بک‌آپ JSON یا فرم‌ها توسط `sanitizeBackupPayload` پالایش می‌شوند و کلیدهای `__proto__` و `constructor` فیلتر می‌گردند.
4. **Timing-Attack Defense:** تمام مقایسه‌های رمز عبور و کدهای OTP با تابع `timingSafeEqual` انجام می‌شوند تا از حملات کانال جانبی (Side-Channel) جلوگیری شود.
5. **Brute-Force Rate Limiting:** سیستم لاگین دارای Rate Limiter با حداکثر ۵ تلاش در ۳۰ ثانیه و فرم تماس دارای حداکثر ۳ ارسال در ۶۰ ثانیه است.
6. **Password Recovery Flow:** توکن‌های OTP ۶ رقمی تولید شده به مدت ۵ دقیقه معتبر هستند و تایمر ۶۰ ثانیه‌ای برای ارسال مجدد دارند.
7. **Server Authority (حالت امن):** وقتی `api/` روی هاست است، رمزها (bcrypt)، OTP، توکن ریست و ریت‌لیمیت فقط سمت سرورند؛ فرانت هیچ تصمیم امنیتی نمی‌گیرد و حالت‌ها با نشان 🔒/🖥️ صادقانه نمایش داده می‌شوند.
8. **No On-Screen OTP:** کد تایید فقط در ایمیل کاربر است و هیچ‌وقت در UI نمایش داده نمی‌شود؛ هیچ فال‌بک نمایشی مجاز نیست.
9. **SMTP & Secrets Server-Side:** رمز صندوق اعلان‌ها فقط در `api/data/smtp.json` (دسترسی 0600، مسدود از وب) روی سرور؛ هرگز در گیت، localStorage یا لاگ. نمایش رمز فقط با سشن ادمین احرازهویت‌شده.
10. **Headers & CSP:** `Content-Security-Policy` با `script-src 'self'`، هدرهای OWASP در `.htaccess`/Nginx، و ممنوعیت سرو شدن `api/data/`.

---

## 🤝 گردش‌کار چند ایجنتی (Multi-Agent Workflow) — خواندن برای همه ایجنت‌ها اجباری است

> این پروژه طوری تنظیم شده که **چند ایجنت همزمان** روی آن کار کنند و در انتها همه‌چیز تمیز مرج شود. قانون‌ها ساده‌اند؛ رعایتشان از ۹۰٪ کانفلیکت‌ها جلوگیری می‌کند.

### 🌿 استراتژی برنچ (Branch Strategy)

| برنچ | نقش | چه کسی می‌نویسد |
|---|---|---|
| `main` | همیشه سالم، همیشه قابل دیپلوی | فقط اینتگریتور (با مرج PR) |
| `arena/<id>-site` یا `agent/<name>/<task>` | برنچ کاری هر ایجنت/تسک | فقط همان ایجنت |

- ⛔ **هیچ ایجنتی مستقیم روی `main` کامیت/پوش نمی‌کند.** همه‌چیز از PR می‌گذرد.
- هر تسک = یک برنچ جدا. تسک تمام شد → PR → مرج → برنچ بعدی را از `main` تازه بساز.

### 🗺️ نقشه مالکیت فایل‌ها (Ownership Map — برای جلوگیری از کانفلیکت)

| حوزه کاری | فایل‌ها | قانون |
|---|---|---|
| 🧠 هسته دیتا (تک‌نویسنده!) | `src/context/DataContext.jsx` | در هر دوره فقط **یک ایجنت** لمسش می‌کند؛ بقیه درخواست‌شان را در PR توضیح می‌دهند |
| 🛡️ امنیت فرانت | `src/utils/security.js` | هماهنگ با مالک بک‌اند |
| 🔌 بک‌اند PHP | `public/api/*.php` | ترجیحاً یک ایجنت؛ بقیه فقط ریویو |
| 🎛️ پنل مدیریت | `src/components/admin/*` | ایجنت‌های مختلف = تب‌های مختلف؛ **ویرایش همزمان یک فایل ممنوع** |
| 🎨 سکشن‌های عمومی | `src/components/sections/*` | هر ایجنت سکشن خودش |
| 📦 مودال‌ها/کامپوننت‌ها | `src/components/modals/*` ،`src/components/common/*` | هر ایجنت فایل خودش |
| 📚 داک‌ها | `*.md` | آزاد، ولی همزمان یک فایل را دو نفر ویرایش نکنند |
| 🚫 آرتIFکت بیلد | `dist/` ،`site-upload.zip` | **فقط اینتگریتور** ری‌بیلد می‌کند؛ در PR دستی نزنید |

### 🔄 پروتکل سینک و مرج (Sync & Merge Protocol)

1. **شروع کار:** برنچ را از تازه‌ترین `main` بساز: `git fetch origin && git checkout -b agent/<name>/<task> origin/main`
2. **حین کار:** اگر کارت بیش از یک روز طول کشید، ری‌بیس کن: `git fetch origin && git rebase origin/main` (کانفلیکت را همان لحظه حل کن، نه آخر کار).
3. **قبل از PR:** چک‌لیست انتهای همین فایل + تمپلیت PR (`.github/PULL_REQUEST_TEMPLATE.md`) را کامل کن.
4. **مرج:** فقط اینتگریتور مرج می‌کند (ترتیب: PRهای کوچک/کم‌ریسک اول). بعد از هر مرج، ایجنت‌های دیگر ری‌بیس می‌کنند.
5. **بعد از مرج همه:** اینتگریتور یک `npm run build` نهایی + ری‌بیلد `site-upload.zip` می‌گیرد و تگ/ریلیز می‌زند.

### 🚫 لیست ممنوعه (باعث رد PR می‌شود)

- کامیت secret (رمز، هش، توکن، SMTP) — حتی «موقتی».
- تغییرنام/حذف فیلدهای persisted (سازگاری `localStorage` کاربر می‌شکند) — فقط **افزودن** فیلد با مقدار پیش‌فرض مجاز است.
- ویرایش موازی یک فایل توسط دو ایجنت (حتی با ابزارهای مختلف — گیت همان‌قدر قاطی می‌کند).
- تولید OTP سمت کلاینت، نمایش کد روی صفحه، یا فرستادن OTP از واسطه خارجی.
- هیچ `window.confirm`/`window.alert` جدید — تاییدها فقط با `showConfirmDialog` سراسری و پیام‌ها فقط با `showToast` (صف‌دار، حداکثر ۳تایی).
- دست‌کاری `dist/` یا `site-upload.zip` در برنچ کاری.

### 👤 خط کاربر (User Lane — محتوازنی همزمان با کدنویسی)

- کاربر همزمان در **پنل سایت زنده** محتوا وارد می‌کند؛ این محتوادر `localStorage` مرورگر خودش ذخیره می‌شود و **هیچ ربطی به گیت ندارد** — کدنویسی ایجنت‌ها آن را پاک نمی‌کند و دیپلوی بیلد جدید هم پاکش نمی‌کند (همان origin = همان localStorage).
- ⚠️ اما محتوای پنل فقط در مرورگر کاربر است و بازدیدکنندگان آن را نمی‌بینند. **حلقه انتشار رسمی:** کاربر از تب بک‌آپ **Export JSON** می‌گیرد → فایل را به ایجنت می‌دهد → ایجنت در `src/data/defaultData.js` مرج می‌کند (PR جدا با عنوان `content:`) → اینتگریتور دیپلوی می‌کند.
- 💾 **فرمت بک‌آپ (مقدس!):** انولوپ فایل `format:'fullsite'` نسخه `4.0.0-FULLSITE` شامل `data` + `users` + `adminSecurity` (بدون password/OTP) + `secqa` + `autoBackup` است. اسنپ‌شات‌ها فقط `data` را نگه می‌دارند (محدودیت حجم). بک‌آپ خودکار روی **هاست** ذخیره می‌شود (`api/data/backups/full_*.json`، اکشن‌های `backup-*` در auth.php) و فقط N تای آخر می‌ماند (پیش‌فرض ۲، قابل تنظیم ۱ تا ۱۰، ذخیره در `api/data/backupcfg.json`) — سقف ۱۲MB و rate-limit ‏`RL_BACKUP` را نشکنید. `importDataJson` باید همیشه فایل‌های قدیمی (v3 و bare-data) را هم بخواند — سازگاری عقب‌رو را نشکنید.
- ایجنت‌ها حق ندارند کلیدهای `embedded_*` / `resume_admin_*` در localStorage را تغییرنام دهند یا فرمت ذخیره‌شده را بدون migration عوض کنند.

### 🧪 دستورهای قبل از پوش (Pre-Push Commands)

```bash
cd resume-app
npm run build            # باید سبز شود
npm run lint             # صفر ارور؛ هشدار جدید اضافه نکن
# راستی‌آزمایی تعریف/استفاده شناسه‌های جدید در هر فایل لمس‌شده:
grep -n "YourNewIdentifier" src/path/ToFile.jsx
```

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
- [ ] هیچ secret (رمز، هش، توکن، SMTP) در کد یا کامیت نیامده باشد.
- [ ] هیچ فیلد persisted تغییرنام/حذف نشده باشد (سازگاری localStorage کاربر حفظ شود).
- [ ] شناسه‌های جدید در هر فایل لمس‌شده با grep تعریف/استفاده راستی‌آزمایی شده باشند.
- [ ] اگر فایل مشترک (مثل `DataContext.jsx` یا `auth.php`) لمس شده، برنچ با `main` سینک و کانفلیکت حل شده باشد.
- [ ] `dist/` و `site-upload.zip` دستی ویرایش نشده باشند (فقط اینتگریتور ری‌بیلد می‌کند).
- [ ] اکشن‌های جدید پیام موفقیت/خطا (`showToast`) و عملیات‌های مخرب دیالوگ تایید (`showConfirmDialog`) دارند؛ هیچ `window.confirm`/`window.alert` جدیدی اضافه نشده باشد.
