/* Pinch landing page — behaviour hooks (see SPEC.md). Vanilla, defensive, never throws. */
(function () {
  'use strict';

  var doc = document;
  var body = doc.body;

  function safe(fn) {
    try { fn(); } catch (e) { /* stay silent: a broken enhancement must not break the page */ }
  }

  function qs(sel, root) { try { return (root || doc).querySelector(sel); } catch (e) { return null; } }
  function qsa(sel, root) {
    try { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); } catch (e) { return []; }
  }

  var reduceMotionQuery = null;
  try { reduceMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null; } catch (e) { reduceMotionQuery = null; }
  function prefersReducedMotion() { return !!(reduceMotionQuery && reduceMotionQuery.matches); }
  function onMotionChange(cb) {
    if (!reduceMotionQuery) return;
    try {
      if (reduceMotionQuery.addEventListener) reduceMotionQuery.addEventListener('change', cb);
      else if (reduceMotionQuery.addListener) reduceMotionQuery.addListener(cb);
    } catch (e) { /* ignore */ }
  }

  var nav = qs('.nav');

  /* ---- Theme toggle: light/dark, remembered; follows the system until the visitor picks ---- */
  safe(function () {
    var root = doc.documentElement;
    var toggle = qs('.theme-toggle');
    var meta = qs('meta[name="theme-color"]');
    var THEME_COLORS = { light: '#fff8f1', dark: '#17110e' };
    var systemDark = null;
    try { systemDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null; } catch (e) { systemDark = null; }

    function stored() {
      try {
        var v = localStorage.getItem('pinch-theme');
        return v === 'light' || v === 'dark' ? v : null;
      } catch (e) { return null; }
    }

    function apply(theme) {
      root.setAttribute('data-theme', theme);
      if (meta) meta.setAttribute('content', THEME_COLORS[theme]);
      if (toggle) {
        var next = theme === 'dark' ? 'light' : 'dark';
        toggle.setAttribute('aria-label', 'Switch to ' + next + ' theme');
        toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      }
    }

    // The inline <head> script already chose a theme; sync the button and meta to it
    apply(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

    if (toggle) {
      toggle.addEventListener('click', function () {
        var theme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        apply(theme);
        try { localStorage.setItem('pinch-theme', theme); } catch (e) { /* storage blocked: still switches for this visit */ }
      });
    }

    // Follow live OS changes only while the visitor hasn't chosen a theme themselves
    if (systemDark) {
      var onSystemChange = function (e) { if (!stored()) apply(e.matches ? 'dark' : 'light'); };
      try {
        if (systemDark.addEventListener) systemDark.addEventListener('change', onSystemChange);
        else if (systemDark.addListener) systemDark.addListener(onSystemChange);
      } catch (e) { /* ignore */ }
    }
  });

  /* ---- Nav: .is-scrolled after 10px; back-to-top: .is-visible after one screen; progress bar ---- */
  safe(function () {
    if (!nav) return;
    var toTop = qs('.to-top');
    var progress = qs('.scroll-progress__bar');
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.pageYOffset || doc.documentElement.scrollTop || 0;
      nav.classList.toggle('is-scrolled', y > 10);
      if (toTop) toTop.classList.toggle('is-visible', y > window.innerHeight);
      if (progress) {
        var max = doc.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
      }
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; (window.requestAnimationFrame || setTimeout)(update); }
    }, { passive: true });
    update();
  });

  /* ---- Mobile menu: body.nav-open + aria-expanded ---- */
  var closeMenu = function () {};
  safe(function () {
    var toggle = qs('.nav__toggle');
    if (!toggle || !body) return;

    function setOpen(open) {
      body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    closeMenu = function () { if (body.classList.contains('nav-open')) setOpen(false); };

    toggle.addEventListener('click', function () {
      setOpen(!body.classList.contains('nav-open'));
    });

    qsa('.nav__links a, .nav__cta').forEach(function (link) {
      link.addEventListener('click', function () { closeMenu(); });
    });

    doc.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && body.classList.contains('nav-open')) {
        setOpen(false);
        try { toggle.focus(); } catch (err) { /* ignore */ }
      }
    });

    // Leaving mobile width with the menu open should not leave it stuck open.
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeMenu();
    });
  });

  /* ---- Reveal on scroll with stagger ---- */
  safe(function () {
    var items = qsa('.reveal');
    if (!items.length) return;

    function showAll() { items.forEach(function (el) { el.classList.add('is-visible'); }); }

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) { showAll(); return; }

    // Stagger siblings that share a parent (feature grid, steps, plans).
    items.forEach(function (el) {
      var siblings = el.parentNode ? qsa(':scope > .reveal', el.parentNode) : [el];
      var idx = siblings.indexOf(el);
      if (idx > 0) el.style.transitionDelay = Math.min(idx * 80, 400) + 'ms';
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    items.forEach(function (el) { io.observe(el); });
    onMotionChange(function () { if (prefersReducedMotion()) showAll(); });
  });

  /* ---- Billing toggle ---- */
  safe(function () {
    var buttons = qsa('.billing-toggle [data-billing]');
    if (!buttons.length) return;
    var periods = { monthly: 'per user / month', yearly: 'per user / month, billed yearly' };

    function apply(mode) {
      buttons.forEach(function (b) {
        var on = b.getAttribute('data-billing') === mode;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      qsa('.plan__price').forEach(function (price) {
        var amount = qs('.plan__amount', price);
        var period = qs('.plan__period', price);
        if (!amount) return;
        var val = amount.getAttribute('data-' + mode);
        if (val) amount.textContent = val;
        // Free plan reads "forever" in both modes; leave it alone.
        if (period && amount.getAttribute('data-monthly') !== '$0') period.textContent = periods[mode] || periods.monthly;
      });
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-billing') || 'monthly'); });
    });
  });

  /* ---- Board animation ---- */
  safe(function () {
    var cols = qsa('.board .board__col');
    if (cols.length < 2) return;

    var timer = null;
    var colIndex = 0;
    var INTERVAL = 3000;
    var MOVE_MS = 450;

    function step() {
      if (prefersReducedMotion()) { stop(); return; }
      safe(function () {
        // Find the next non-empty column, starting from colIndex.
        for (var tries = 0; tries < cols.length; tries++) {
          var from = cols[colIndex];
          var to = cols[(colIndex + 1) % cols.length];
          colIndex = (colIndex + 1) % cols.length;
          var card = from ? qs('.card', from) : null;
          if (card && to) {
            card.classList.add('is-moving');
            setTimeout(function () {
              safe(function () {
                to.appendChild(card);
                // Let the browser paint the new position before dropping the class.
                (window.requestAnimationFrame || setTimeout)(function () {
                  card.classList.remove('is-moving');
                });
              });
            }, MOVE_MS);
            return;
          }
        }
      });
    }

    function start() {
      if (timer || prefersReducedMotion() || doc.visibilityState === 'hidden') return;
      timer = setInterval(step, INTERVAL);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    start();
    onMotionChange(function () { if (prefersReducedMotion()) stop(); else start(); });
    doc.addEventListener('visibilitychange', function () {
      if (doc.visibilityState === 'hidden') stop(); else start();
    });
  });

  /* ---- Testimonials carousel: one slide at a time, wraps, autoplays politely ---- */
  safe(function () {
    var root = qs('.testimonials');
    var viewport = qs('.testimonials__viewport', root);
    var track = qs('.testimonials__track', root);
    if (!root || !viewport || !track) return;
    var slides = qsa('.quote', track);
    if (slides.length < 2) return;
    var dots = qsa('.testimonials__dot', root);
    var prev = qs('.testimonials__prev', root);
    var next = qs('.testimonials__next', root);

    var current = 0;
    var timer = null;
    var INTERVAL = 6000;
    var SWIPE_PX = 40;
    var hovered = false;
    var focused = false;

    function go(index) {
      current = (index % slides.length + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-current * 100) + '%)';
      slides.forEach(function (slide, i) {
        var on = i === current;
        if (on) { slide.removeAttribute('aria-hidden'); slide.removeAttribute('inert'); }
        else { slide.setAttribute('aria-hidden', 'true'); slide.setAttribute('inert', ''); }
      });
      dots.forEach(function (dot, i) {
        var on = i === current;
        dot.classList.toggle('is-active', on);
        if (on) dot.setAttribute('aria-current', 'true'); else dot.removeAttribute('aria-current');
      });
    }

    function canAutoplay() {
      return !prefersReducedMotion() && !hovered && !focused && doc.visibilityState !== 'hidden';
    }
    function start() {
      if (timer || !canAutoplay()) return;
      timer = setInterval(function () { safe(function () { go(current + 1); }); }, INTERVAL);
      // Don't announce every automatic slide change; announce manual ones.
      track.setAttribute('aria-live', 'off');
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
      track.setAttribute('aria-live', 'polite');
    }
    function sync() { if (canAutoplay()) start(); else stop(); }
    // Manual navigation restarts the countdown so a slide never flips right after a click.
    function manual(index) { go(index); stop(); sync(); }

    if (prev) prev.addEventListener('click', function () { manual(current - 1); });
    if (next) next.addEventListener('click', function () { manual(current + 1); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { manual(i); });
    });

    // Arrow keys while focus is anywhere inside the carousel (dots, prev/next).
    root.addEventListener('keydown', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      var key = e.key;
      if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'Left' && key !== 'Right') return;
      e.preventDefault();
      manual(current + (key === 'ArrowLeft' || key === 'Left' ? -1 : 1));
      // Keep focus on the active dot so repeated presses read out the new position.
      var active = e.target && e.target.classList && e.target.classList.contains('testimonials__dot') ? dots[current] : null;
      if (active) { try { active.focus(); } catch (err) { /* ignore */ } }
    });

    // Pause on hover (real mouse only: emulated touch hovers would otherwise stick) and on focus within.
    var hasPointer = 'PointerEvent' in window;
    root.addEventListener(hasPointer ? 'pointerenter' : 'mouseenter', function (e) {
      if (hasPointer && e.pointerType !== 'mouse') return;
      hovered = true; sync();
    });
    root.addEventListener(hasPointer ? 'pointerleave' : 'mouseleave', function (e) {
      if (hasPointer && e.pointerType !== 'mouse') return;
      hovered = false; sync();
    });
    // Ignore focus on the section itself (in-page nav links focus their target) so autoplay keeps running.
    root.addEventListener('focusin', function (e) {
      if (e.target === root) return;
      focused = true; sync();
    });
    root.addEventListener('focusout', function (e) {
      if (e.relatedTarget && root.contains(e.relatedTarget)) return;
      focused = false; sync();
    });
    doc.addEventListener('visibilitychange', sync);
    onMotionChange(sync);

    // Swipe on touch/pen: horizontal drag past the threshold changes slide; vertical scroll stays native.
    if (hasPointer) {
      var startX = null;
      var startY = 0;
      viewport.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse') return;
        startX = e.clientX; startY = e.clientY;
      });
      viewport.addEventListener('pointerup', function (e) {
        if (startX === null) return;
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;
        startX = null;
        if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) manual(current + (dx < 0 ? 1 : -1));
      });
      viewport.addEventListener('pointercancel', function () { startX = null; });
    }

    go(0);
    sync();
  });

  /* ---- FAQ: one answer open at a time ---- */
  safe(function () {
    var items = qsa('.faq__item');
    items.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        items.forEach(function (other) { if (other !== item) other.open = false; });
      });
    });
  });

  /* ---- CTA email validation ---- */
  safe(function () {
    var form = qs('.cta__form');
    if (!form) return;
    var input = qs('input[type="email"]', form);
    var note = qs('.cta__note');
    var original = note ? note.textContent : '';
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function setNote(text, success) {
      if (!note) return;
      note.textContent = text;
      note.classList.toggle('is-success', !!success);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!input) return;
      var value = (input.value || '').trim();
      if (!EMAIL_RE.test(value)) {
        input.setAttribute('aria-invalid', 'true');
        setNote('That email looks a little shell-shocked. Try something like you@yourteam.com.', false);
        try { input.focus(); } catch (err) { /* ignore */ }
        return;
      }
      input.removeAttribute('aria-invalid');
      setNote('Thanks! You’re on the list — watch ' + value + ' for your invite this week.', true);
      try { form.reset(); } catch (err) { /* ignore */ }
    });

    if (input) {
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid') === 'true' && EMAIL_RE.test((input.value || '').trim())) {
          input.removeAttribute('aria-invalid');
          setNote(original, false);
        }
      });
    }
  });

  /* ---- Smooth anchor scroll offset by nav height ---- */
  safe(function () {
    qsa('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        safe(function () {
          var href = link.getAttribute('href');
          if (!href || href === '#') return;
          var target = null;
          try { target = doc.getElementById(decodeURIComponent(href.slice(1))); } catch (err) { target = null; }
          if (!target) return;
          e.preventDefault();
          closeMenu();
          var offset = nav ? nav.getBoundingClientRect().height : 0;
          var top = target.getBoundingClientRect().top + (window.pageYOffset || 0) - offset - 8;
          if (href === '#top') top = 0;
          try {
            window.scrollTo({ top: Math.max(0, top), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
          } catch (err) {
            window.scrollTo(0, Math.max(0, top));
          }
          if (history && history.pushState) { try { history.pushState(null, '', href); } catch (err) { /* ignore */ } }
          // Move keyboard focus to the target so the next Tab continues from there.
          try {
            if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
          } catch (err) { /* ignore */ }
        });
      });
    });
  });
})();
