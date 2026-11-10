/* =========================================================
   util.js — Utilitas bersama (escape, storage, helper DOM)
   ========================================================= */
(function (global) {
  'use strict';

  const IRK = (global.IRK = global.IRK || {});
  const PREFIX = 'irk:v1:';

  /** Cegah XSS: semua teks dari pengguna wajib lewat sini sebelum innerHTML. */
  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const storage = {
    available() {
      try {
        const probe = PREFIX + '__probe';
        localStorage.setItem(probe, '1');
        localStorage.removeItem(probe);
        return true;
      } catch (_) {
        return false;
      }
    },
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(PREFIX + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (_) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
        return true;
      } catch (_) {
        return false;
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(PREFIX + key);
      } catch (_) {
        /* diabaikan */
      }
    }
  };

  const qs = (selector, root) => (root || document).querySelector(selector);
  const qsa = (selector, root) => Array.from((root || document).querySelectorAll(selector));
  const on = (el, type, handler, options) => {
    if (el) el.addEventListener(type, handler, options);
  };

  function formatTime(timestamp) {
    try {
      return new Date(timestamp).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return '';
    }
  }

  /** Beri umpan balik sementara pada tombol tanpa merusak markup aslinya. */
  function flashButton(button, message, duration) {
    if (!button) return;
    const original = button.innerHTML;
    button.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> ' + message;
    button.disabled = true;
    setTimeout(() => {
      button.innerHTML = original;
      button.disabled = false;
    }, duration || 2200);
  }

  IRK.util = { escapeHtml, storage, qs, qsa, on, formatTime, flashButton };
})(typeof window !== 'undefined' ? window : globalThis);
