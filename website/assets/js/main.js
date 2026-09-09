/* اسکریپت عمومی سایت */
document.addEventListener('DOMContentLoaded', function () {
  /* منوی موبایل */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () { nav.classList.toggle('open'); });
    nav.addEventListener('click', function (ev) {
      if (ev.target.tagName === 'A') nav.classList.remove('open');
    });
  }

  /* انیمیشن ظاهر شدن هنگام اسکرول */
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && els.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  /* شمارش آمار (count-up) */
  var nums = document.querySelectorAll('.stat-num[data-count]');
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (target === 0) { el.textContent = '0'; return; }
    var dur = 1300, start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window && nums.length) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { countUp(en.target); io2.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    nums.forEach(function (el) { io2.observe(el); });
  } else {
    nums.forEach(countUp);
  }

  /* فیلتر دسته نمونه‌کارها */
  var wf = document.getElementById('workFilters');
  if (wf) {
    wf.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.filter');
      if (!btn) return;
      wf.querySelectorAll('.filter').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var cat = btn.getAttribute('data-cat');
      document.querySelectorAll('#worksGrid .work-card').forEach(function (card) {
        card.style.display = (cat === 'all' || card.getAttribute('data-cat') === cat) ? '' : 'none';
      });
    });
  }

  /* جستجو + فیلتر نوع مقالات */
  var search = document.getElementById('paperSearch');
  var ptypes = document.getElementById('paperTypes');
  if (search || ptypes) {
    var q = '', type = 'all';
    function applyPapers() {
      var heads = Array.prototype.slice.call(document.querySelectorAll('.year-head'));
      heads.forEach(function (head) {
        var el = head.nextElementSibling;
        var any = false;
        while (el && !el.classList.contains('year-head')) {
          if (el.classList.contains('paper-card')) {
            var okT = type === 'all' || el.getAttribute('data-type') === type;
            var okQ = !q || (el.getAttribute('data-search') || '').indexOf(q) !== -1;
            el.style.display = (okT && okQ) ? '' : 'none';
            if (okT && okQ) any = true;
          }
          el = el.nextElementSibling;
        }
        head.style.display = any ? '' : 'none';
      });
    }
    if (search) {
      search.addEventListener('input', function () { q = this.value.trim().toLowerCase(); applyPapers(); });
    }
    if (ptypes) {
      ptypes.addEventListener('click', function (ev) {
        var btn = ev.target.closest('.filter');
        if (!btn) return;
        ptypes.querySelectorAll('.filter').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        type = btn.getAttribute('data-type');
        applyPapers();
      });
    }
  }
});
