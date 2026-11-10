// FUNC: Quiz
// =============================================
function renderQuiz() {
    const container = document.getElementById('quiz-container');
    if (quizState.finished) {
        container.innerHTML = `
            <div class="text-center py-8 animate-fade-in">
                <h3 class="text-2xl font-black text-white mb-2">Skor: ${quizState.score}/${quizScenarios.length}</h3>
                <button onclick="resetQuiz()" class="btn-gradient text-white px-8 py-3 rounded-xl font-semibold mt-4">Coba Lagi</button>
            </div>`;
        return;
    }

    const q = quizScenarios[quizState.currentQuestion];
    container.innerHTML = `
        <div class="animate-fade-in">
            <div class="bg-[#1a0f2e]/50 border border-purple-500/30 rounded-xl p-5 mb-6">
                <p class="text-sm md:text-base text-purple-100 italic">"${q.scenario}"</p>
            </div>
            <div class="space-y-3">
                ${q.options.map((opt, i) => `
                    <button onclick="answerQuiz(${i}, ${opt.correct})" class="quiz-option w-full text-left p-4 rounded-xl border border-purple-500/30 bg-purple-900/30 hover:bg-purple-800/50 hover:border-fuchsia-400 text-purple-100" id="quiz-opt-${i}">${opt.text}</button>
                `).join('')}
            </div>
            <div id="quiz-explanation" class="hidden mt-6"></div>
            <div id="quiz-next" class="hidden mt-6 text-right">
                <button onclick="nextQuizQuestion()" class="bg-purple-700 text-white px-6 py-2.5 rounded-xl">Lanjut</button>
            </div>
        </div>
    `;
}
renderQuiz();

function answerQuiz(optionIndex, isCorrect) {
    if (quizState.answered) return;
    quizState.answered = true;
    const q = quizScenarios[quizState.currentQuestion];
    
    q.options.forEach((_, i) => {
        const btn = document.getElementById(`quiz-opt-${i}`);
        btn.classList.add('pointer-events-none');
        if (i === optionIndex && isCorrect) btn.className = 'quiz-option w-full text-left p-4 rounded-xl border-2 border-green-400 bg-green-900/40 text-green-100';
        else if (i === optionIndex && !isCorrect) btn.className = 'quiz-option w-full text-left p-4 rounded-xl border-2 border-red-400 bg-red-900/40 text-red-100';
        else if (q.options[i].correct) btn.className = 'quiz-option w-full text-left p-4 rounded-xl border-2 border-green-400 bg-green-900/40 text-green-100';
        else btn.className = 'quiz-option w-full text-left p-4 rounded-xl border border-purple-500/20 bg-[#1a0f2e]/50 opacity-50 text-purple-300';
    });

    if (isCorrect) quizState.score++;
    
    const expDiv = document.getElementById('quiz-explanation');
    expDiv.classList.remove('hidden');
    expDiv.innerHTML = `<div class="p-4 rounded-xl border ${isCorrect ? 'bg-green-900/30 border-green-500/50 text-green-200' : 'bg-red-900/30 border-red-500/50 text-red-200'}">${q.explanation}</div>`;
    document.getElementById('quiz-next').classList.remove('hidden');
}

function nextQuizQuestion() {
    quizState.currentQuestion++;
    quizState.answered = false;
    if (quizState.currentQuestion >= quizScenarios.length) quizState.finished = true;
    renderQuiz();
}
function resetQuiz() { quizState = { currentQuestion: 0, score: 0, answered: false, finished: false }; renderQuiz(); }

// =============================================

