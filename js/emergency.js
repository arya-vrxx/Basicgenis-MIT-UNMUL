/* =========================================================
   emergency.js — Panel darurat: langkah instan, kontak, salin
   ========================================================= */
(function (global) {
  'use strict';

  const IRK = global.IRK;
  const { escapeHtml: esc, qs, on, flashButton } = IRK.util;
  const { instantSteps, emergencyContacts } = IRK.data;

  /* ---------- Render ---------- */
  function renderSteps() {
    const container = qs('#instant-steps');
    if (!container) return;

    container.innerHTML = instantSteps
      .map(
        (step, index) => `
        <div class="step-card" data-tone="${esc(step.tone)}">
          <div class="step-head">
            <span class="step-num">${index + 1}</span>
            <h4><i class="fa-solid ${esc(step.icon)}" aria-hidden="true"></i> ${esc(step.title)}</h4>
          </div>
          <p>${esc(step.desc)}</p>
        </div>`
      )
      .join('');
  }

  function renderContacts() {
    const container = qs('#emergency-contacts');
    if (!container) return;

    container.innerHTML = emergencyContacts
      .map(
        (contact) => `
        <a class="contact-card" href="tel:${esc(contact.number)}"
           aria-label="Telepon ${esc(contact.name)} di ${esc(contact.number)}">
          <span class="contact-icon"><i class="fa-solid ${esc(contact.icon)}" aria-hidden="true"></i></span>
          <span class="contact-body">
            <strong>${esc(contact.name)}</strong>
            <small>${esc(contact.number)}</small>
          </span>
          <i class="fa-solid fa-phone contact-call" aria-hidden="true"></i>
        </a>`
      )
      .join('');
  }

  /* ---------- Toggle panel ---------- */
  function setPanicOpen(open) {
    const details = qs('#emergency-details');
    const button = qs('#panic-toggle-btn');
    const label = qs('#panic-toggle-text');
    const chevron = qs('#panic-chevron');

    if (details) details.classList.toggle('hidden', !open);
    if (button) button.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'Tutup' : 'Buka';
    if (chevron) chevron.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
  }

  function togglePanicMode() {
    const details = qs('#emergency-details');
    setPanicOpen(details ? details.classList.contains('hidden') : true);
  }

  /* ---------- Salin teks ---------- */
  async function copyText(text, button, successLabel) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const helper = document.createElement('textarea');
        helper.value = text;
        helper.setAttribute('readonly', '');
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        document.body.appendChild(helper);
        helper.select();
        document.execCommand('copy');
        document.body.removeChild(helper);
      }
      flashButton(button, successLabel || 'Tersalin');
      return true;
    } catch (_) {
      flashButton(button, 'Gagal menyalin');
      return false;
    }
  }

  function copyFromElement(sourceId, buttonId, label) {
    const source = qs('#' + sourceId);
    const button = qs('#' + buttonId);
    if (!source) return;
    copyText(source.value, button, label);
  }

  /* ---------- Init ---------- */
  function init() {
    renderSteps();
    renderContacts();

    on(qs('#panic-toggle-btn'), 'click', togglePanicMode);

    on(qs('#report-btn'), 'click', () => copyFromElement('report-template', 'report-btn', 'Templat tersalin'));
    on(qs('#alert-btn'), 'click', () => copyFromElement('alert-template', 'alert-btn', 'Pesan tersalin'));
    on(qs('#copy-phone-btn'), 'click', () => {
      const text = emergencyContacts.map((c) => `${c.name}: ${c.number}`).join('\n');
      copyText(text, qs('#copy-phone-btn'), 'Nomor tersalin');
    });

    setPanicOpen(true);
  }

  IRK.emergency = { init, togglePanicMode, setPanicOpen, copyText };
  init();
})(typeof window !== 'undefined' ? window : globalThis);
