/* =========================================================
   checker.js — UI pemeriksa link & pesan
   Logika analisis ada di analyzer.js; file ini hanya presentasi.
   ========================================================= */
(function (global) {
  'use strict';

  const IRK = global.IRK;
  const { escapeHtml: esc, storage, qs, qsa, on, formatTime } = IRK.util;
  const { analyzeLink, analyzeMessage } = IRK.analyzer;

  const RISK_META = {
    danger: { icon: 'fa-skull-crossbones', label: 'Berisiko tinggi' },
    warning: { icon: 'fa-triangle-exclamation', label: 'Waspada' },
    caution: { icon: 'fa-circle-exclamation', label: 'Perlu hati-hati' },
    safe: { icon: 'fa-circle-check', label: 'Tidak ditemukan pola risiko' },
    info: { icon: 'fa-circle-info', label: 'Informasi' }
  };

  const HISTORY_KEY = 'checker:history';
  const HISTORY_LIMIT = 6;

  /* ---------- Tab ---------- */
  function setTab(tab, shouldFocus) {
    const isLink = tab === 'link';

    const tabLink = qs('#tab-link');
    const tabMessage = qs('#tab-message');
    const panelLink = qs('#input-link');
    const panelMessage = qs('#input-message');

    [tabLink, tabMessage].forEach((btn) => {
      if (!btn) return;
      const active = btn === (isLink ? tabLink : tabMessage);
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', String(active));
      btn.setAttribute('tabindex', active ? '0' : '-1');
    });

    if (panelLink) panelLink.classList.toggle('hidden', !isLink);
    if (panelMessage) panelMessage.classList.toggle('hidden', isLink);

    clearResults();
    /* Fokus hanya saat dipicu pengguna, agar halaman tidak melompat saat dimuat. */
    if (shouldFocus) {
      (isLink ? qs('#suspicious-url') : qs('#suspicious-message'))?.focus({ preventScroll: true });
    }
  }

  function clearResults() {
    const results = qs('#checker-results');
    if (results) {
      results.classList.add('hidden');
      results.innerHTML = '';
    }
  }

  /* ---------- Render hasil ---------- */
  function renderResult(result, kind) {
    const box = qs('#checker-results');
    if (!box) return;

    box.classList.remove('hidden');
    const meta = RISK_META[result.risk] || RISK_META.info;

    if (result.risk === 'info') {
      box.innerHTML = `
        <div class="result result--info">
          <div class="result-head">
            <span class="result-icon"><i class="fa-solid ${meta.icon}" aria-hidden="true"></i></span>
            <div>
              <h3>${esc(result.title)}</h3>
              <p class="result-summary">${esc(result.summary)}</p>
            </div>
          </div>
        </div>`;
      return;
    }

    const flags = result.flags.length
      ? `<ul class="flags">
          ${result.flags
            .map(
              (flag) => `
            <li class="flag flag--${esc(flag.severity)}">
              <span class="flag-dot" aria-hidden="true"></span>
              <span>${esc(flag.text)}</span>
            </li>`
            )
            .join('')}
        </ul>`
      : `<p class="no-flags"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Tidak ada pola risiko yang terdeteksi.</p>`;

    const recommendations = result.recommendations.length
      ? `<div class="recommend">
          <h4><i class="fa-solid fa-list-check" aria-hidden="true"></i> Yang perlu dilakukan</h4>
          <ul>${result.recommendations.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
        </div>`
      : '';

    box.innerHTML = `
      <div class="result result--${esc(result.risk)}">
        <div class="result-head">
          <span class="result-icon"><i class="fa-solid ${meta.icon}" aria-hidden="true"></i></span>
          <div class="result-copy">
            <h3>${esc(result.title)}</h3>
            <p class="result-summary">${esc(result.summary)}</p>
          </div>
          <span class="result-score" aria-label="Skor risiko ${result.score} dari 100">
            ${result.score}<small>/100</small>
          </span>
        </div>

        <div class="meter" role="img" aria-label="Tingkat risiko ${result.score} dari 100">
          <div class="meter-fill" style="width:${result.score}%"></div>
        </div>

        ${
          result.target
            ? `<p class="result-target"><i class="fa-solid ${kind === 'link' ? 'fa-link' : 'fa-comment-dots'}" aria-hidden="true"></i>
                 <code>${esc(result.target)}</code></p>`
            : ''
        }

        ${flags}
        ${recommendations}
      </div>`;

    saveHistory(result, kind);
  }

  /* ---------- Riwayat ---------- */
  function saveHistory(result, kind) {
    if (result.risk === 'info') return;
    const history = storage.get(HISTORY_KEY, []);
    history.unshift({
      kind,
      target: result.target.slice(0, 70),
      risk: result.risk,
      score: result.score,
      time: Date.now()
    });
    storage.set(HISTORY_KEY, history.slice(0, HISTORY_LIMIT));
    renderHistory();
  }

  function renderHistory() {
    const box = qs('#checker-history');
    if (!box) return;

    const history = storage.get(HISTORY_KEY, []);
    if (!history.length) {
      box.classList.add('hidden');
      box.innerHTML = '';
      return;
    }

    box.classList.remove('hidden');
    box.innerHTML = `
      <div class="history-head">
        <h4><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i> Riwayat pemeriksaan</h4>
        <button type="button" class="link-button" id="clear-history">
          <i class="fa-solid fa-trash-can" aria-hidden="true"></i> Hapus
        </button>
      </div>
      <ul class="history-list">
        ${history
          .map(
            (item) => `
          <li class="history-item">
            <span class="dot dot--${esc(item.risk)}" aria-hidden="true"></span>
            <span class="history-target">${esc(item.target)}</span>
            <span class="history-time">${esc(formatTime(item.time))}</span>
          </li>`
          )
          .join('')}
      </ul>
      <p class="history-note">Disimpan hanya di perangkat ini.</p>`;
  }

  /* ---------- Aksi ---------- */
  function run(kind) {
    const input = qs(kind === 'link' ? '#suspicious-url' : '#suspicious-message');
    const value = input ? input.value : '';
    const result = kind === 'link' ? analyzeLink(value) : analyzeMessage(value);
    renderResult(result, kind);
  }

  function fillSample(kind, text) {
    setTab(kind);
    const input = qs(kind === 'link' ? '#suspicious-url' : '#suspicious-message');
    if (input) {
      input.value = text;
      input.focus();
    }
    run(kind);
  }

  /* ---------- Init ---------- */
  function init() {
    const tabLink = qs('#tab-link');
    const tabMessage = qs('#tab-message');

    on(tabLink, 'click', () => setTab('link', true));
    on(tabMessage, 'click', () => setTab('message', true));

    /* Navigasi keyboard untuk tablist */
    [tabLink, tabMessage].forEach((btn) => {
      on(btn, 'keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const next = event.key === 'ArrowRight' ? 'message' : 'link';
        setTab(next);
        qs(next === 'link' ? '#tab-link' : '#tab-message')?.focus();
      });
    });

    on(qs('#analyze-link-btn'), 'click', () => run('link'));
    on(qs('#analyze-message-btn'), 'click', () => run('message'));

    const urlInput = qs('#suspicious-url');
    on(urlInput, 'keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        run('link');
      }
    });

    const messageInput = qs('#suspicious-message');
    on(messageInput, 'keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        run('message');
      }
    });

    /* Contoh cepat */
    on(qs('#sample-link'), 'click', () =>
      fillSample('link', 'http://bca-verifikasi-akun.xyz/login?otp=1')
    );
    on(qs('#sample-link-safe'), 'click', () => fillSample('link', 'https://www.bca.co.id/id'));
    on(qs('#sample-message'), 'click', () =>
      fillSample(
        'message',
        'Selamat! Anda menang undian Rp25.000.000. Klaim hadiah sekarang di bit.ly/klaim-hadiah. Kirim kode OTP untuk verifikasi.'
      )
    );

    /* Hapus riwayat (delegasi karena tombol dibuat ulang) */
    on(qs('#checker-history'), 'click', (event) => {
      if (event.target.closest('#clear-history')) {
        storage.remove(HISTORY_KEY);
        renderHistory();
      }
    });

    renderHistory();
    setTab('link');
  }

  IRK.checker = { init, setTab, run, renderResult };
  init();
})(typeof window !== 'undefined' ? window : globalThis);
