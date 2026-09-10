# 🚀 راهنمای جامع و قدم‌به‌قدم راه‌اندازی و انتشار سایت روی هاست لینوکس

این راهنما برای شما آماده شده است تا بتوانید به سادگی و در چند مرحله، وب‌سایت پورتفولیو و رزومه مهندسی الکترونیک و سخت‌افزار خود را روی هاست لینوکسی (cPanel / DirectAdmin) یا سرور مجازی (VPS) مستقر و آنلاین کنید.

---

## 📌 ۱. چه حجمی هاست بگیرم کافی است؟

این وب‌سایت با استفاده از معماری فوق‌سریع **Single Page Application (SPA)** با **React + Vite** طراحی شده است. پس از کامپایل و گرفتن خروجی (`npm run build`)، تمامی کدهای جاوااسکریپت، استایل‌ها، فونت‌ها و فایل‌ها فشرده شده و کل حجم فایل‌های خروجی سایت **حدود ۳ الی ۱۰ مگابایت** خواهد بود.

- **حجم هاست پیشنهادی:** **۵۰۰ مگابایت الی ۱ گیگابایت** هاست لینوکس اشتراکی (برای ذخیره تصاویر پروژه‌ها، دیتاشیت‌های PDF و بک‌آپ‌ها برای چندین سال کاملاً کافی است).
- **نوع هاست:** هر نوع هاست لینوکس استاندارد با پنل **cPanel** یا **DirectAdmin** (هاست ایران یا خارج فرقی نمی‌کند).
- **هزینه:** ارزان‌ترین پلن‌های هاست اشتراکی لینوکس شرکت‌های هاستینگ (مثل ایران سرور، سون‌هاست، پارس‌پک، میزبان‌فا و...) کاملاً پاسخگوی نیاز شماست و هیچ نیازی به پرداخت هزینه‌های سنگین سرور اختصاصی نیست.

---

## 🌐 ۲. نام دامنه (Domain) را کجا باید بنویسم؟

برای اتصال دامنه اختصاصی شما (مانند `arash-taheri.ir` یا `yourname.com`) سه بخش ساده وجود دارد:

### الف) اتصال دامنه به هاست در شرکت ثبت‌کننده دامنه (DNS Nameservers)
1. وارد پنل کاربری سایتی که دامنه را از آن خریده‌اید (مثلاً سایت [Nic.ir](https://www.nic.ir) برای دامنه‌های `.ir` یا پنل‌های دامنه‌های بین‌المللی) شوید.
2. در بخش **مدیریت NameServerها (DNS)**، دو آدرس نیم‌سرور که هاستینگ به شما ایمیل کرده است را وارد کنید (مثلاً: `ns1.yourhost.com` و `ns2.yourhost.com`).
3. ذخیره کنید. (برای دامنه‌های `.ir` حدود ۲ الی ۱۲ ساعت و برای دامنه‌های بین‌المللی بین ۱۵ دقیقه تا ۲ ساعت زمان می‌برد تا ست شود).

### ب) وارد کردن نام دامنه در تنظیمات سئو سایت (Canonical URL)
برای اینکه موتورهای جستجو مانند گوگل سایت شما را با آدرس رسمی ایندکس کنند:
1. وارد پنل مدیریت سایت شوید (`Admin Panel` -> تب **استودیو سئو و متاتگ**).
2. در فیلد **آدرس اصلی سایت (Canonical URL)**، آدرس کامل سایت خود را بنویسید:
   ```text
   https://yourdomain.com
   ```
   *(یا `https://yourname.ir`)*
3. روی دکمه **ذخیره متاتگ‌ها** کلیک کنید.
*(همچنین این مقدار در فایل `src/data/defaultData.js` در بخش `seoSettings.canonicalUrl` نیز قابل ویرایش اولیه است).*

---

## 🛠️ ۳. مراحل قدم‌به‌قدم بیلد و استقرار روی هاست لینوکس (cPanel / DirectAdmin)

### گام ۱: دریافت پوشه خروجی نهایی (Production Build)
در کامپیوتر خود یا در محیط ترمینال پروژه، دستور زیر را اجرا کنید:

```bash
npm run build
```

پس از اجرای این دستور، یک پوشه به نام **`dist`** در ریشه پروژه ساخته می‌شود که شامل فایل `index.html`، پوشه `assets` و تمام فایل‌های استاتیک کامپایل‌شده سایت است.

---

### گام ۲: آماده‌سازی فایل روتینگ و کش سرور (`.htaccess`)
در داخل همان پوشه `dist` (یا پوشه `public` پروژه)، یک فایل متنی با نام دقیق **`.htaccess`** بسازید و محتویات زیر را درون آن قرار دهید. این فایل باعث می‌شود در صورت رفرش صفحات یا باز کردن لینک‌ها، خطای ۴۰۴ رخ ندهد و سرعت بارگذاری با Gzip و کش به حداکثر برسد:

```apache
# --- SPA Routing for React (Vite) ---
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# --- Enable GZIP / Brotli Compression ---
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json application/xml
</IfModule>

# --- Browser Caching for Maximum Speed ---
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
</IfModule>

# --- Security Headers ---
<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set X-XSS-Protection "1; mode=block"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

---

### گام ۳: آپلود فایل‌ها به پوشه `public_html` هاست
1. وارد کنترل‌پنل هاست خود (**cPanel** یا **DirectAdmin**) شوید.
2. به بخش **File Manager** (مدیریت فایل) بروید.
3. وارد پوشه **`public_html`** شوید (اگر فایل پیش‌فرضی مانند `index.php` یا `default.html` وجود دارد، آن را حذف کنید).
4. تمامی محتویات **داخل پوشه `dist`** (شامل `index.html`، پوشه `assets`، فایل `.htaccess` و تصاویر) را انتخاب کرده و آن‌ها را به صورت فایل `.zip` فشرده کنید.
5. فایل زیپ را در `public_html` آپلود کرده و گزینه **Extract (استخراج)** را بزنید تا فایل‌ها مستقیماً داخل `public_html` قرار گیرند.

> ⚠️ **نکته بسیار مهم:** دقت کنید که فایل `index.html` باید مستقیماً داخل `public_html/index.html` باشد، نه داخل یک پوشه فرعی مثل `public_html/dist/index.html`.

---

### گام ۴: فعال‌سازی رایگان SSL (نماد قفل سبز `https://`)
1. در صفحه اصلی cPanel، وارد بخش **SSL/TLS Status** یا **Let's Encrypt SSL** شوید.
2. روی دامنه خود تیک بزنید و دکمه **Run AutoSSL** یا **Issue** را کلیک کنید.
3. در کمتر از ۲ دقیقه، گواهینامه امنیتی رایگان SSL فعال می‌شود و سایت با `https://yourdomain.com` در دسترس خواهد بود.

---

## 🖥️ ۴. نحوه استقرار روی سرور مجازی (Ubuntu Linux VPS با Nginx)

اگر ترجیح می‌دهید به جای هاست اشتراکی از سرور مجازی (VPS اوبونتو) استفاده کنید:

1. **نصب Nginx:**
   ```bash
   sudo apt update
   sudo apt install nginx git -y
   ```

2. **کپی فایل‌های `dist` در سرور:**
   ```bash
   sudo mkdir -p /var/www/my-resume
   # فایل‌های داخل پوشه dist را به /var/www/my-resume منتقل کنید
   sudo chown -R www-data:www-data /var/www/my-resume
   ```

3. **ایجاد کانفیگ Nginx در مسیر `/etc/nginx/sites-available/my-resume`:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       root /var/www/my-resume;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|pdf)$ {
           expires 1y;
           add_header Cache-Control "public, no-transform";
       }

       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   }
   ```

4. **فعال‌سازی کانفیگ و دریافت SSL با Certbot:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/my-resume /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   
   # دریافت خودکار گواهی SSL رایگان:
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

---

## 🔐 ۵. راهنمای امنیت، رمز عبور و بازیابی با ایمیل (OTP)

مدل امنیتی دو حالت دارد که بالای فرم ورود با نشان مشخص است (🔒 حالت امن / 🖥️ حالت محلی):

- **🔒 حالت امن (Secure):** وقتی پوشه `api/` (بک‌اند PHP) روی هاست باشد. رمزها با bcrypt سمت سرور ذخیره می‌شوند، کد تایید فقط در ایمیل شما موجود است (هیچ‌وقت روی صفحه نمایش داده نمی‌شود) و محدودیت نرخ سمت سرور اعمال می‌شود.
- **🖥️ حالت محلی (Local):** بدون PHP (پیش‌نمایش یا هاست استاتیک). ورود با رمز محلی هش‌شده؛ ارسال ایمیل در این حالت ممکن نیست.

1. **اولین ورود (حالت امن):** ویزارد نصب باز می‌شود — یک رمز قوی (حداقل ۸ کاراکتر) + ایمیل بازیابی تعیین کنید و کد تاییدی که به ایمیلتان می‌آید را وارد کنید.
2. **سؤالات بازیابی محلی (خیلی مهم):** در پنل ← تب «امنیت و رمز عبور» حتماً ۲ سؤال و پاسخ ثبت کنید. ریست اضطراری رمز **فقط** با پاسخ درست به این سؤال‌ها باز می‌شود؛ اگر ثبتشان نکنید ریست قفل می‌ماند.
3. **فراموشی رمز (حالت امن):** روی «فراموشی رمز عبور؟» کلیک کنید؛ کد ۶ رقمی یکبارمصرف به ایمیل ثبت‌شده ارسال می‌شود و بعد از وارد کردن آن رمز جدید تعیین می‌کنید.
4. **فراموشی رمز (حالت محلی):** فقط «ریست اضطراری» با پاسخ به سؤالات بازیابی (مرحله ۲).
5. **تغییر مشخصات امنیتی:** در پنل ادمین (تب «امنیت و رمز عبور») می‌توانید ایمیل بازیابی (با تایید کد ارسالی به ایمیل جدید) یا رمز عبور را تغییر دهید.
6. **فرستنده ایمیل:** ایمیل‌ها با `mail()` خود هاست ارسال می‌شوند (بدون واسطه خارجی). برای deliverability بهتر، در `api/config.php` ثابت `MAIL_FROM` را یک آدرس روی دامنه خودتان بگذارید (مثل `noreply@yourdomain.ir`).

---

## ⭐ ۶. تعیین پروژه شاخص هدر سایت (Featured Hero Board)

- در پنل ادمین -> تب **بردهای الکترونیکی و دیتاشیت**، روی **علامت ستاره (⭐)** در ردیف هر بردی که مایلید کلیک کنید تا بلافاصله به عنوان پروژه شاخص هدر صفحه اول انتخاب شود.
- همچنین هنگام افزودن یا ویرایش برد، می‌توانید تیک گزینه **«تعیین به عنوان پروژه شاخص»** را فعال کنید.

---

## 🌐 ۸. راهنمای اتصال وبلاگ به ساب‌دامین اختصاصی (`blog.yourdomain.com`)

پورتال وبلاگ به صورت کاملاً مستقل و ماژولار طراحی شده است و علاوه بر دسترسی مستقیم در سایت (`#blog` یا دکمه وبلاگ)، به راحتی می‌توانید آن را روی یک **ساب‌دامین اختصاصی** (مانند `blog.yourdomain.com` یا `tech.yourname.ir`) نیز متصل نمایید.

### روش ۱: اتصال از طریق cPanel (ساده‌ترین روش)
1. در **cPanel**، وارد بخش **Subdomains** شوید.
2. نام ساب‌دامین را وارد کنید (مثلاً `blog`).
3. در قسمت **Document Root**، مسیر را دقیقاً همان مسیر روت سایت یعنی **`public_html`** قرار دهید (نه یک فولدر جداگانه).
4. ذخیره کنید.
5. اکنون با باز کردن `https://blog.yourdomain.com`، سایت همان فایل‌های بهینه‌شده را با سرعت فوق‌العاده لود می‌کند و با یک رول ساده در `.htaccess` به بخش وبلاگ ریدایرکت می‌شود:

```apache
# نمونه رول هدایت ساب دامین blog به پورتال وبلاگ در فایل .htaccess
RewriteCond %{HTTP_HOST} ^blog\. [NC]
RewriteRule ^$ /#blog [L,R=301]
```

### روش ۲: در Nginx / VPS سرور مجازی
در فایل کانفیگ Nginx، یک سرور بلاک برای ساب دامین اضافه کنید:

```nginx
server {
    listen 80;
    server_name blog.yourdomain.com;
    return 301 https://yourdomain.com/#blog;
}
```

---

## 💾 ۹. پشتیبان‌گیری و بازگردانی آسان (Backup & Migration)

- در پنل ادمین -> تب **پشتیبان‌گیری، بازگردانی و انتقال هاست**، همیشه می‌توانید با یک کلیک روی **«دانلود فایل پشتیبان کامل (.json)»** کل دیتابیس سایت (شامل تمام بردهای دوزبانه، مقالات، مهارت‌ها، سوابق شغلی و تصاویر) را ذخیره کنید و هر زمان که هاست خود را عوض کردید، با دکمه **«بارگذاری فایل پشتیبان»** در ۱ ثانیه همه اطلاعات را بازگردانید.
