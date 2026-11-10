/* =========================================================
   incidents.js — Kartu insiden + checklist pemulihan
   Progres disimpan per insiden di localStorage.
   ========================================================= */
(function (global) {
  'use strict';

  const IRK = global.IRK;
  const { escapeHtml: esc, storage, qs, qsa, on } = IRK.util;
  const incidents = IRK.data.incidents;

  const state = { activeId: null };

  /* ---------- Render kartu ---------- */
  function renderCards() {
    const container = qs('#incident-cards');
    if (!container) return;

    container.innerHTML = incidents
      .map(
        (incident) => `
        <button type="button" class="incident-card" data-tone="${esc(incident.tone)}"
                data-incident-id="${esc(incident.id)}" aria-controls="checklist-section">
          <span class="incident-top">
            <span class="incident-icon"><i class="fa-solid ${esc(incident.icon)}" aria-hidden="true"></i></span>
            <span class="incident-title">${esc(incident.title)}</span>
          </span>
          <span class="incident-desc">${esc(incident.desc)}</span>
          <span class="incident-cta">Lihat langkah <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
        </button>`
      )
      .join('');
  }

  /* ---------- Checklist ---------- */
  function showChecklist(incident) {
    const section = qs('#checklist-section');
    const container = qs('#checklist-container');
    if (!section || !container) return;

    state.activeId = incident.id;
    const storageKey = 'checklist:' + incident.id;
    const completed = new Set(storage.get(storageKey, []));

    const items = incident.checklist
      .map((item, index) => {
        const done = completed.has(index);
        return `
        <li>
          <label class="check-item${done ? ' is-done' : ''}">
            <input type="checkbox" class="check-input" data-step="${index}" ${done ? 'checked' : ''}>
            <span class="check-box" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
            <span class="check-text">${esc(item)}</span>
          </label>
        </li>`;
      })
      .join('');

    container.innerHTML = `
      <div class="checklist-head">
        <div>
          <p class="checklist-label">Panduan pemulihan untuk</p>
          <h3>${esc(incident.title)}</h3>
        </div>
        <span class="badge badge-urgent">
          <i class="fa-solid fa-stopwatch" aria-hidden="true"></i> ${esc(incident.eta)}
        </span>
      </div>

      <div class="progress">
        <div class="progress-meta">
          <span id="progress-label">Progres pemulihan</span>
          <span id="checklist-progress-text" aria-live="polite">0%</span>
        </div>
        <div class="progress-track" id="checklist-progress-bar"
             role="progressbar" aria-labelledby="progress-label"
             aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <div class="progress-fill"></div>
        </div>
      </div>

      <ul class="checklist">${items}</ul>

      <div class="checklist-foot">
        <p class="checklist-done" id="checklist-done" hidden>
          <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
          Semua langkah selesai. Simpan bukti dan pantau akun Anda beberapa hari ke depan.
        </p>
        <button type="button" class="link-button" id="checklist-reset">
          <i class="fa-solid fa-rotate-left" aria-hidden="true"></i> Reset progres
        </button>
      </div>`;

    section.classList.remove('hidden');

    const checkboxes = qsa('.check-input', container);
    checkboxes.forEach((box) => {
      on(box, 'change', () => {
        const index = Number(box.dataset.step);
        if (box.checked) completed.add(index);
        else completed.delete(index);
        box.closest('.check-item').classList.toggle('is-done', box.checked);
        storage.set(storageKey, Array.from(completed).sort((a, b) => a - b));
        updateProgress(checkboxes);
      });
    });

    on(qs('#checklist-reset'), 'click', () => {
      completed.clear();
      storage.remove(storageKey);
      checkboxes.forEach((box) => {
        box.checked = false;
        box.closest('.check-item').classList.remove('is-done');
      });
      updateProgress(checkboxes);
      checkboxes[0] && checkboxes[0].focus();
    });

    updateProgress(checkboxes);

    setTimeout(() => {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  function updateProgress(checkboxes) {
    const total = checkboxes.length;
    const checked = checkboxes.filter((box) => box.checked).length;
    const percent = total ? Math.round((checked / total) * 100) : 0;

    const text = qs('#checklist-progress-text');
    const track = qs('#checklist-progress-bar');
    if (text) text.textContent = percent + '%';
    if (track) {
      track.setAttribute('aria-valuenow', String(percent));
      track.classList.toggle('is-complete', percent === 100);
      const fill = qs('.progress-fill', track);
      if (fill) fill.style.width = percent + '%';
    }

    const done = qs('#checklist-done');
    if (done) done.hidden = percent < 100;
  }

  /* ---------- Init ---------- */
  function init() {
    renderCards();
    const container = qs('#incident-cards');
    on(container, 'click', (event) => {
      const card = event.target.closest('.incident-card');
      if (!card) return;
      const incident = incidents.find((item) => item.id === card.dataset.incidentId);
      if (incident) showChecklist(incident);
    });
  }

  IRK.incidents = { init, showChecklist, state };
  init();
})(typeof window !== 'undefined' ? window : globalThis);
