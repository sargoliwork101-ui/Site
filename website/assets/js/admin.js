/* اسکریپت پنل مدیریت */
document.addEventListener('DOMContentLoaded', function () {
  var csrf = (document.querySelector('meta[name="csrf"]') || {}).content || '';
  var uploadUrl = (document.querySelector('meta[name="upload-url"]') || {}).content || '';

  function previewHtml(url, type) {
    if (type === 'image') return '<span class="file-chip">📄 عکس آپلود شد</span>';
    return '<span class="file-chip">📄 فایل آپلود شد</span>';
  }

  /* آپلود فایل */
  document.querySelectorAll('.file-picker').forEach(function (fp) {
    var input = fp.querySelector('input[type=file]');
    if (!input) return;
    var form = fp.closest('form');
    var hidden = form ? form.querySelector('input[type=hidden][name="' + input.name + '"]') : null;
    var preview = fp.querySelector('.file-preview');
    var label = fp.querySelector('.file-label');
    input.addEventListener('change', function () {
      var f = input.files && input.files[0];
      if (!f) return;
      var fd = new FormData();
      fd.append('csrf', csrf);
      fd.append('type', fp.getAttribute('data-type') || 'file');
      fd.append('file', f);
      if (label) label.textContent = '⏳ در حال آپلود…';
      fetch(uploadUrl, { method: 'POST', body: fd })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res.ok) {
            if (hidden) {
              hidden.value = res.url;
              input.value = ''; // جلوگیری از آپلود دوبارهٔ همان فایل هنگام ذخیرهٔ فرم
            }
            if (preview) preview.innerHTML = previewHtml(res.url, fp.getAttribute('data-type') || 'file');
            if (label) label.textContent = '✅ ذخیره شد — فرم را ذخیره کنید تا نهایی شود';
          } else {
            alert(res.error || 'خطا در آپلود فایل');
            if (label) label.textContent = '❌ ' + (res.error || 'خطا');
            input.value = '';
          }
        })
        .catch(function () {
          alert('خطا در ارتباط با سرور');
          input.value = '';
        });
    });
  });

  /* سریالایز سطرهای داینامیک (تحصیلات / سوابق) به JSON */
  document.querySelectorAll('form').forEach(function (form) {
    form.addEventListener('submit', function () {
      form.querySelectorAll('.rows').forEach(function (rows) {
        var hidden = form.querySelector('input[type=hidden][name="' + rows.getAttribute('data-name') + '"]');
        if (!hidden) return;
        var arr = [];
        rows.querySelectorAll('.row').forEach(function (row) {
          var o = {};
          row.querySelectorAll('[data-key]').forEach(function (inp) { o[inp.getAttribute('data-key')] = inp.value; });
          arr.push(o);
        });
        hidden.value = JSON.stringify(arr);
      });
    });
  });

  /* افزودن / حذف سطر داینامیک */
  document.querySelectorAll('.rows').forEach(function (rows) {
    var add = rows.querySelector('.row-add');
    if (add) {
      add.addEventListener('click', function () {
        var tpl = rows.querySelector('.row');
        var nr = tpl.cloneNode(true);
        nr.querySelectorAll('input').forEach(function (i) { i.value = ''; });
        rows.insertBefore(nr, add);
      });
    }
    rows.addEventListener('click', function (ev) {
      var del = ev.target.closest('.row-del');
      if (del) {
        var row = del.closest('.row');
        if (rows.querySelectorAll('.row').length > 1) row.remove();
      }
    });
  });

  /* تأیید حذف */
  document.querySelectorAll('form[data-confirm]').forEach(function (f) {
    f.addEventListener('submit', function (ev) {
      if (!window.confirm(f.getAttribute('data-confirm') || 'مطمئن هستید؟')) ev.preventDefault();
    });
  });

  /* ابزار جدید: جستجو در جدول‌ها */
  document.querySelectorAll('.tbl-search').forEach(function (box) {
    box.addEventListener('input', function () {
      var q = this.value.trim().toLowerCase();
      var tbl = document.getElementById(this.getAttribute('data-table'));
      if (!tbl) return;
      tbl.querySelectorAll('tbody tr').forEach(function (tr) {
        tr.style.display = (!q || tr.textContent.toLowerCase().indexOf(q) !== -1) ? '' : 'none';
      });
    });
  });

  /* ابزار جدید: کپی لینک */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      function done() {
        var old = btn.textContent;
        btn.textContent = '✅ کپی شد';
        setTimeout(function () { btn.textContent = old; }, 1500);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(); });
      } else {
        fallback();
      }
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { window.prompt('کپی کنید:', text); }
        document.body.removeChild(ta);
      }
    });
  });
});
