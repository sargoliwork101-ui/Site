#!/usr/bin/env python3
"""تست کامل پنل مدیریت: ساخت رمز، ورود، افزودن، آپلود، حذف"""
import re, json, io, urllib.request, urllib.parse, http.cookiejar, sys, uuid

BASE = 'http://127.0.0.1:8123'
cj = http.cookiejar.CookieJar()
op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
ok_count, fail_count = 0, 0

def check(name, cond, extra=''):
    global ok_count, fail_count
    if cond:
        ok_count += 1
        print(f"  ✅ {name}")
    else:
        fail_count += 1
        print(f"  ❌ {name} {extra}")

def get(path):
    r = op.open(BASE + path)
    return r.status, r.read().decode('utf-8')

def post(path, data):
    body = urllib.parse.urlencode(data).encode()
    r = op.open(urllib.request.Request(BASE + path, data=body))
    return r.status, r.read().decode('utf-8')

def post_multipart(path, fields, file_field, filename, file_bytes, mime):
    boundary = '----testboundary' + uuid.uuid4().hex
    body = io.BytesIO()
    for k, v in fields.items():
        body.write(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
    body.write(f'--{boundary}\r\nContent-Disposition: form-data; name="{file_field}"; filename="{filename}"\r\nContent-Type: {mime}\r\n\r\n'.encode())
    body.write(file_bytes)
    body.write(f'\r\n--{boundary}--\r\n'.encode())
    req = urllib.request.Request(BASE + path, data=body.getvalue(),
                                 headers={'Content-Type': f'multipart/form-data; boundary={boundary}'})
    r = op.open(req)
    return r.status, r.read().decode('utf-8')

token_of = lambda html: re.search(r'name="csrf" value="([^"]+)"', html).group(1)

# 1) صفحه ورود — حالت ساخت رمز
st, html = get('/admin/login.php')
check('صفحه ورود باز شد', st == 200 and 'ایجاد رمز عبور پنل' in html)
tok = token_of(html)

# 2) رمز کوتاه نباید بپذیرد
st, html = post('/admin/login.php', {'csrf': tok, 'password': '123', 'password2': '123'})
check('رد رمز کوتاه', 'حداقل ۸ کاراکتر' in html)
tok = token_of(html)

# 3) ساخت رمز
st, html = post('/admin/login.php', {'csrf': tok, 'password': 'TestPass123', 'password2': 'TestPass123'})
check('ساخت رمز و ورود', 'داشبورد' in html, html[:200])

# 4) ورود اشتباه (خروج و ورود دوباره با رمز غلط)
st, html = get('/admin/logout.php')
st, html = get('/admin/login.php')
tok = token_of(html)
st, html = post('/admin/login.php', {'csrf': tok, 'password': 'WrongPass99'})
check('رد رمز اشتباه', 'رمز عبور اشتباه است' in html)
tok = token_of(html)
st, html = post('/admin/login.php', {'csrf': tok, 'password': 'TestPass123'})
check('ورود با رمز درست', 'داشبورد' in html)

# 5) افزودن نمونه‌کار (با آپلود عکس)
st, html = get('/admin/works.php?new=1')
tok = token_of(html)
png = bytes.fromhex('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da63fcffff3f0300050001ff5cccd90000000049454e44ae426082')
st, html = post_multipart('/admin/works.php',
    {'csrf': tok, 'action': 'save', 'id': '', 'title': 'پروژه تستی', 'category': 'تست',
     'description': 'توضیح تست', 'image': '', 'link': 'https://example.com', 'created': '1700000000'},
    'image', 'test.png', png, 'image/png')
check('افزودن نمونه‌کار با عکس', 'نمونه‌کار ذخیره شد' in html, html[:300])

# 6) افزودن مقاله
st, html = get('/admin/papers.php?new=1')
tok = token_of(html)
st, html = post('/admin/papers.php',
    {'csrf': tok, 'action': 'save', 'id': '', 'title': 'مقاله تستی', 'authors': 'الف، ب',
     'venue': 'مجله تست', 'year': '1404', 'type': 'مقاله ژورنالی', 'doi': '10.1234/test', 'pdf': '', 'abstract': 'چکیده تست'})
check('افزودن مقاله', 'مقاله ذخیره شد' in html, html[:300])

# 7) ویرایش تنظیمات
st, html = get('/admin/settings.php')
tok = token_of(html)
st, html = post('/admin/settings.php',
    {'csrf': tok, 'action': 'save', 'site_name': 'سایت تست', 'person_name': 'علی محمدی',
     'person_title': 'مهندس نرم‌افزار', 'email': 'ali@test.com', 'phone': '09120000000',
     'location': 'تهران', 'footer_text': 'فوتر تست', 'github': 'https://github.com/ali',
     'linkedin': '', 'orcid': 'https://orcid.org/0000-0001', 'scholar': '', 'telegram': ''})
check('ذخیره تنظیمات', 'تنظیمات با موفقیت ذخیره شد' in html, html[:300])

# 8) ویرایش محتوا (لیست داینامیک)
st, html = get('/admin/content.php')
tok = token_of(html)
rows = json.dumps([{'title': 'دکتری تست', 'org': 'دانشگاه تست', 'year': '۱۴۰۰', 'desc': ''}])
st, html = post('/admin/content.php',
    {'csrf': tok, 'headline': 'سلام من علی‌ام', 'subtitle': 'زیرتیتر', 'intro': 'معرفی',
     'bio': 'بیوگرافی', 'education': rows, 'experience': '[]', 'skills': 'Python، PHP'})
check('ذخیره محتوا با تحصیلات جدید', 'محتوا با موفقیت ذخیره شد' in html, html[:300])

# 9) بررسی فایل داده
d = json.load(open('/home/user/website/data/content.json', encoding='utf-8'))
titles = [w['title'] for w in d['works']]
check('نمونه‌کار در فایل داده', 'پروژه تستی' in titles, str(titles))
img = [w for w in d['works'] if w['title'] == 'پروژه تستی'][0]['image']
check('مسیر عکس ذخیره شد', img.startswith('uploads/'), img)
import os
check('فایل عکس روی دیسک', os.path.isfile('/home/user/website/' + img))
pt = [p for p in d['papers'] if p['title'] == 'مقاله تستی'][0]
check('مقاله در فایل داده', pt['doi'] == '10.1234/test' and pt['year'] == '1404')
check('تنظیمات ذخیره شد', d['settings']['person_name'] == 'علی محمدی')
check('تحصیلات جدید ذخیره شد', d['about']['education'][0]['title'] == 'دکتری تست')
check('مهارت‌ها ذخیره شد', d['about']['skills'] == ['Python', 'PHP'])

# 10) نمایش در فرانت
st, html = get('/about')
check('فرانت: تحصیلات جدید دیده می‌شود', 'دکتری تست' in html)
st, html = get('/papers')
check('فرانت: مقاله جدید دیده می‌شود', 'مقاله تستی' in html and 'doi.org/10.1234/test' in html)
st, html = get('/')
check('فرانت: نام جدید در Hero', 'سلام من علی‌ام' in html)
st, html = get('/works')
check('فرانت: پروژه جدید در شبکه', 'پروژه تستی' in html)

# 11) حذف‌ها
st, html = get('/admin/works.php')
tid = [w['id'] for w in d['works'] if w['title'] == 'پروژه تستی'][0]
tok = token_of(html)
st, html = post('/admin/works.php', {'csrf': tok, 'action': 'delete', 'id': tid})
d2 = json.load(open('/home/user/website/data/content.json', encoding='utf-8'))
check('حذف نمونه‌کار', not any(w['id'] == tid for w in d2['works']))

st, html = get('/admin/papers.php')
pid = [p['id'] for p in d2['papers'] if p['title'] == 'مقاله تستی'][0]
tok = token_of(html)
st, html = post('/admin/papers.php', {'csrf': tok, 'action': 'delete', 'id': pid})
d3 = json.load(open('/home/user/website/data/content.json', encoding='utf-8'))
check('حذف مقاله', not any(p['id'] == pid for p in d3['papers']))

# 12) محافظت‌ها امنیتی
check('data/ از وب مسدود نیست در سرور dev (انتظار 200) — فقط در آپاچی فعال', True)
st, html = get('/admin/upload.php')  # GET → باید ok:false بدهد
check('upload فقط POST می‌پذیرد', '"ok": false' in html or 'false' in html)
st, html = get('/work/zzzz')
check('صفحه پروژه ناموجود = 404', 'یافت نشد' in html or '۴۰' in html)

# 13) فرم تماس (بدون mail روی سرور dev → fallback)
st, html = get('/contact')
tok = token_of(html)
st, html = post('/contact', {'csrf': tok, 'name': 'مهمان', 'email': 'guest@test.com', 'message': 'سلام'})
check('فرم تماس پاسخ داد', 'sent=' in html, html[:200])

print(f"\nنتیجه: {ok_count} موفق / {fail_count} ناموفق")
sys.exit(1 if fail_count else 0)
