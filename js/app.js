/* =========================================================
   app.js — Orkestrasi: navigasi, tema, PWA, status jaringan
   ========================================================= */
(function (global) {
  'use strict';

  const IRK = global.IRK;
  const { qs, qsa, on, storage } = IRK.util;

  /* ---------- Navigasi mobile ---------- */
  function initNav() {
    const toggle = qs('#nav-toggle');
    const nav = qs('#main-nav');
    if (!toggle || !nav) return;

    const close = () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Buka menu navigasi');
      const icon = toggle.querySelector('i');
      if (icon) icon.className = 'fa-solid fa-bars';
    };

    on(toggle, 'click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi');
      const icon = toggle.querySelector('i');
      if (icon) icon.className = 'fa-solid ' + (isOpen ? 'fa-xmark' : 'fa-bars');
    });

    qsa('a', nav).forEach((link) => on(link, 'click', close));
    on(document, 'keydown', (event) => {
      if (event.key === 'Escape') close();
    });
    on(global, 'resize', () => {
      if (global.innerWidth > 860) close();
    });
  }

  /* ---------- Sorot menu sesuai bagian yang terlihat ---------- */
  function initScrollSpy() {
    const links = qsa('#main-nav a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in global)) return;

    const map = new Map();
    links.forEach((link) => {
      const target = qs(link.getAttribute('href'));
      if (target) map.set(target, link);
    });

    const visible = new Set();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });

        links.forEach((link) => link.classList.remove('is-active'));
        if (!visible.size) return;

        /* Bagian yang paling bawah di antara yang terlihat dianggap aktif. */
        const ordered = Array.from(visible).sort((a, b) =>
          a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
        );
        map.get(ordered[ordered.length - 1])?.classList.add('is-active');
      },
      { rootMargin: '-40% 0px -45% 0px', threshold: 0 }
    );

    map.forEach((_, section) => observer.observe(section));
  }

  /* ---------- Tombol kembali ke atas ---------- */
  function initBackToTop() {
    const button = qs('#to-top');
    if (!button) return;

    const update = () => button.classList.toggle('is-visible', global.scrollY > 600);
    on(global, 'scroll', update, { passive: true });
    on(button, 'click', () => {
      global.scrollTo({ top: 0, behavior: 'smooth' });
      qs('.site-header .brand')?.focus();
    });
    update();
  }

  /* ---------- Status jaringan ---------- */
  function initNetworkStatus() {
    const pill = qs('#net-status');
    if (!pill) return;

    const update = () => {
      const offline = !navigator.onLine;
      pill.classList.toggle('is-offline', offline);
      pill.querySelector('.net-label').textContent = offline ? 'Mode offline' : 'Siap digunakan';
      pill.title = offline
        ? 'Anda sedang offline. Panduan tetap bisa dibuka.'
        : 'Terhubung ke internet.';
    };

    on(global, 'online', update);
    on(global, 'offline', update);
    update();
  }

  /* ---------- Templat teks ---------- */
  function initTemplates() {
    const report = qs('#report-template');
    const alert = qs('#alert-template');
    if (report) report.value = IRK.data.templates.report;
    if (alert) alert.value = IRK.data.templates.alert;

    const year = qs('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ---------- Service worker ---------- */
  function initServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;

    const toast = qs('#sw-toast');
    const reload = qs('#sw-reload');
    let registrationRef = null;
    let reloading = false;

    on(reload, 'click', () => {
      if (registrationRef && registrationRef.waiting) {
        reloading = true;
        registrationRef.waiting.postMessage({ type: 'SKIP_WAITING' });
      } else {
        global.location.reload();
      }
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading) global.location.reload();
      else if (toast) toast.classList.add('hidden');
    });

    navigator.serviceWorker
      .register('./sw.js')
      .then((registration) => {
        registrationRef = registration;
        if (registration.waiting) showUpdate();

        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate();
          });
        });
      })
      .catch(() => {
        /* offline cache tidak tersedia — aplikasi tetap berjalan */
      });

    function showUpdate() {
      if (toast) toast.classList.remove('hidden');
    }
  }

  /* ---------- Preferensi tampilan ---------- */
  function initPreferences() {
    const root = document.documentElement;
    const saved = storage.get('theme', '');
    if (saved === 'dark' || saved === 'light') root.dataset.theme = saved;

    const button = qs('#theme-toggle');
    if (!button) return;

    const sync = () => {
      const dark = root.dataset.theme === 'dark';
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', dark ? 'Aktifkan tema terang' : 'Aktifkan tema gelap');
      const icon = button.querySelector('i');
      if (icon) icon.className = 'fa-solid ' + (dark ? 'fa-sun' : 'fa-moon');
    };

    on(button, 'click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      storage.set('theme', next);
      sync();
    });

    sync();
  }

  function init() {
    initNav();
    initScrollSpy();
    initBackToTop();
    initNetworkStatus();
    initTemplates();
    initServiceWorker();
    initPreferences();
    document.body.classList.add('is-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : globalThis);
