/* =========================================================
   quiz.js — Kuis kewaspadaan digital
   Soal diacak, skor terbaik disimpan di perangkat.
   ========================================================= */
(function (global) {
  'use strict';

  const IRK = global.IRK;
  const { escapeHtml: esc, storage, qs, qsa, on } = IRK.util;
  const scenarios = IRK.data.quizScenarios;
  const BEST_KEY = 'quiz:best';

  const state = {
    order: [],
    index: 0,
    score: 0,
    answered: false,
    finished: false
  };

  function shuffle(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function start() {
    state.order = shuffle(scenarios.map((_, i) => i));
    state.index = 0;
    state.score = 0;
    state.answered = false;
    state.finished = false;
    render();
  }

  function bestScore() {
    return Number(storage.get(BEST_KEY, 0)) || 0;
  }

  function render() {
    const container = qs('#quiz-container');
    if (!container) return;

    if (state.finished) return renderResult(container);

    const question = scenarios[state.order[state.index]];
    const total = state.order.length;
    const position = state.index + 1;
    const percent = Math.round(((position - 1) / total) * 100);

    container.innerHTML = `
      <div class="quiz">
        <div class="quiz-meta">
          <span>Soal <strong>${position}</strong> dari ${total}</span>
          <span class="quiz-best"><i class="fa-solid fa-trophy" aria-hidden="true"></i> Rekor ${bestScore()}/${total}</span>
        </div>
        <div class="quiz-track" role="progressbar" aria-valuemin="0" aria-valuemax="100"
             aria-valuenow="${percent}" aria-label="Kemajuan kuis">
          <div class="quiz-track-fill" style="width:${percent}%"></div>
        </div>

        <blockquote class="quiz-scenario">${esc(question.scenario)}</blockquote>

        <div class="quiz-options" role="group" aria-label="Pilihan jawaban">
          ${question.options
            .map(
              (option, i) => `
            <button type="button" class="quiz-option" data-index="${i}" data-correct="${option.correct}">
              <span class="quiz-key" aria-hidden="true">${String.fromCharCode(65 + i)}</span>
              <span>${esc(option.text)}</span>
            </button>`
            )
            .join('')}
        </div>

        <div class="quiz-feedback hidden" id="quiz-feedback" aria-live="polite"></div>

        <div class="quiz-actions hidden" id="quiz-actions">
          <button type="button" class="primary-button" id="quiz-next">
            ${position === total ? 'Lihat hasil' : 'Soal berikutnya'}
            <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </button>
        </div>
      </div>`;

    on(qs('#quiz-container .quiz-options'), 'click', (event) => {
      const button = event.target.closest('.quiz-option');
      if (button) answer(button);
    });

    on(qs('#quiz-next'), 'click', next);
  }

  function answer(button) {
    if (state.answered) return;
    state.answered = true;

    const question = scenarios[state.order[state.index]];
    const chosen = Number(button.dataset.index);
    const isCorrect = button.dataset.correct === 'true';

    if (isCorrect) state.score++;

    qsa('#quiz-container .quiz-option').forEach((option, i) => {
      option.disabled = true;
      if (option.dataset.correct === 'true') option.classList.add('is-correct');
      else if (i === chosen) option.classList.add('is-wrong');
    });

    const feedback = qs('#quiz-feedback');
    if (feedback) {
      feedback.classList.remove('hidden');
      feedback.className = 'quiz-feedback ' + (isCorrect ? 'is-correct' : 'is-wrong');
      feedback.innerHTML = `
        <p class="feedback-title">
          <i class="fa-solid ${isCorrect ? 'fa-circle-check' : 'fa-circle-xmark'}" aria-hidden="true"></i>
          ${isCorrect ? 'Tepat sekali' : 'Belum tepat'}
        </p>
        <p>${esc(question.explanation)}</p>`;
    }

    qs('#quiz-actions')?.classList.remove('hidden');
    qs('#quiz-next')?.focus();
  }

  function next() {
    if (state.index + 1 >= state.order.length) {
      state.finished = true;
      const best = bestScore();
      if (state.score > best) storage.set(BEST_KEY, state.score);
      render();
      return;
    }
    state.index++;
    state.answered = false;
    render();
  }

  function renderResult(container) {
    const total = state.order.length;
    const score = state.score;
    const ratio = total ? score / total : 0;
    const best = Math.max(bestScore(), score);

    let verdict;
    if (ratio === 1) verdict = { icon: 'fa-medal', title: 'Sempurna!', text: 'Anda peka terhadap semua pola penipuan di kuis ini.' };
    else if (ratio >= 0.8) verdict = { icon: 'fa-star', title: 'Sangat baik', text: 'Kewaspadaan Anda sudah tinggi. Tinggal pertajam beberapa detail.' };
    else if (ratio >= 0.5) verdict = { icon: 'fa-thumbs-up', title: 'Cukup baik', text: 'Sebagian pola sudah Anda kenali. Pelajari ulang penjelasan yang salah.' };
    else verdict = { icon: 'fa-book-open', title: 'Perlu belajar lagi', text: 'Banyak modus penipuan yang belum dikenali. Coba lagi setelah membaca panduan.' };

    container.innerHTML = `
      <div class="quiz-result">
        <span class="quiz-result-icon"><i class="fa-solid ${verdict.icon}" aria-hidden="true"></i></span>
        <h3>${esc(verdict.title)}</h3>
        <p class="quiz-result-score">${score}<small>/${total}</small></p>
        <p>${esc(verdict.text)}</p>
        <p class="quiz-best-line"><i class="fa-solid fa-trophy" aria-hidden="true"></i> Rekor Anda: ${best}/${total}</p>
        <button type="button" class="primary-button" id="quiz-restart">
          <i class="fa-solid fa-rotate-right" aria-hidden="true"></i> Coba lagi
        </button>
      </div>`;

    on(qs('#quiz-restart'), 'click', start);
    qs('#quiz-restart')?.focus();
  }

  function init() {
    if (!scenarios.length) return;
    start();
  }

  IRK.quiz = { init, start, state };
  init();
})(typeof window !== 'undefined' ? window : globalThis);
