/* =========================================================
   mascot.js — Interaksi maskot
   - Mata mengikuti posisi kursor
   - Robot condong & "hidup" saat kursor mendekat
   - Efek lompat kecil saat diklik
   Dimatikan otomatis bila pengguna memilih reduced motion.
   ========================================================= */
(function (global) {
  'use strict';

  const IRK = (global.IRK = global.IRK || {});
  const { qs, on } = IRK.util;

  const MAX_LOOK_X = 2.6; /* px di dalam viewBox 240 */
  const MAX_LOOK_Y = 2.0;
  const MAX_LEAN = 2.6; /* derajat */
  const POKE_MS = 620;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function init() {
    const mascot = qs('.hero-mascot');
    if (!mascot) return;

    const reduceMotion =
      global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    let frame = null;
    let pointer = null;
    let engaged = false;
    let pokeTimer = null;

    function apply() {
      frame = null;
      if (!pointer) return;

      const rect = mascot.getBoundingClientRect();
      if (!rect.width) return;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = pointer.clientX - centerX;
      const dy = pointer.clientY - centerY;

      /* Reaksi "tertarik" hanya aktif bila kursor berada di sekitar maskot. */
      const distance = Math.hypot(dx, dy);
      const reach = rect.width * 1.15;
      const near = distance < reach;
      const closeness = clamp(1 - distance / reach, 0, 1);

      if (near !== engaged) {
        engaged = near;
        mascot.classList.toggle('is-engaged', engaged);
      }

      const nx = clamp(dx / (rect.width * 0.85), -1, 1);
      const ny = clamp(dy / (rect.width * 0.85), -1, 1);

      /* Mata selalu mengikuti kursor; condong badan makin kuat saat makin dekat. */
      mascot.style.setProperty('--look-x', (nx * MAX_LOOK_X).toFixed(2) + 'px');
      mascot.style.setProperty('--look-y', (ny * MAX_LOOK_Y).toFixed(2) + 'px');
      mascot.style.setProperty('--lean', (nx * MAX_LEAN * closeness).toFixed(2) + 'deg');
    }

    function schedule(event) {
      pointer = event;
      if (frame === null) frame = global.requestAnimationFrame(apply);
    }

    function reset() {
      pointer = null;
      if (frame !== null) {
        global.cancelAnimationFrame(frame);
        frame = null;
      }
      engaged = false;
      mascot.classList.remove('is-engaged');
      mascot.style.setProperty('--look-x', '0px');
      mascot.style.setProperty('--look-y', '0px');
      mascot.style.setProperty('--lean', '0deg');
    }

    on(global, 'pointermove', schedule, { passive: true });
    on(global, 'blur', reset);
    on(global.document.documentElement, 'pointerleave', reset);

    on(mascot, 'click', () => {
      if (pokeTimer) {
        clearTimeout(pokeTimer);
        mascot.classList.remove('is-poked');
      }
      /* Baca layout memaksa animasi CSS dimulai ulang. */
      void mascot.getBoundingClientRect();
      mascot.classList.add('is-poked');
      pokeTimer = setTimeout(() => {
        mascot.classList.remove('is-poked');
        pokeTimer = null;
      }, POKE_MS);
    });

    /* Sinkronkan ulang saat halaman di-scroll (posisi maskot berubah). */
    on(global, 'scroll', () => {
      if (pointer) schedule(pointer);
    }, { passive: true });
  }

  IRK.mascot = { init };
  init();
})(typeof window !== 'undefined' ? window : globalThis);
