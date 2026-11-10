// INIT: Render Cards
// =============================================
incidents.forEach(incident => {
    const card = document.createElement('button');
    card.className = `incident-card group text-left p-5 rounded-2xl border border-purple-500/30 bg-purple-900/20 ${incident.theme.borderHover} transition-all duration-300 focus:outline-none focus:ring-2 ${incident.theme.ring} hover:-translate-y-1 hover:bg-purple-900/40 flex flex-col h-full`;
    card.onclick = () => showChecklist(incident);
    card.innerHTML = `
        <div class="flex items-center mb-3">
            <div class="w-12 h-12 rounded-lg ${incident.theme.iconBg} ${incident.theme.text} border border-purple-500/20 flex items-center justify-center text-xl mr-4">
                <i class="fa-solid ${incident.icon}"></i>
            </div>
            <h3 class="font-bold text-white text-lg leading-tight">${incident.title}</h3>
        </div>
        <p class="text-sm text-purple-200/70 flex-grow">${incident.desc}</p>
        <div class="mt-4 text-xs font-semibold ${incident.theme.text} flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            Lihat Solusi <i class="fa-solid fa-arrow-right ml-1"></i>
        </div>
    `;
    cardsContainer.appendChild(card);
});

// =============================================
// FUNC: Checklists & Progress Bar Fix
// =============================================
function showChecklist(incident) {
    checklistSection.classList.remove('hidden');
    let checklistHTML = `
        <div class="mb-5 flex flex-col md:flex-row md:items-center justify-between border-b border-purple-500/30 pb-4">
            <div>
                <p class="text-purple-300 text-sm mb-1">Menampilkan panduan pemulihan untuk:</p>
                <h3 class="text-xl font-bold text-white">${incident.title}</h3>
            </div>
            <span class="mt-2 md:mt-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 border border-red-500/30 text-red-300">
                <i class="fa-solid fa-stopwatch mr-1.5"></i> Lakukan Segera
            </span>
        </div>
        
        <!-- GLOBAL PROGRESS BAR -->
        <div class="mb-6">
            <div class="flex justify-between text-xs text-purple-300 mb-1 font-semibold">
                <span>Progress Pemulihan</span>
                <span id="checklist-progress-text">0%</span>
            </div>
            <div class="w-full bg-purple-950/50 rounded-full h-2 border border-purple-500/20">
                <div id="checklist-progress-bar" class="bg-fuchsia-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
            </div>
        </div>
        <div class="space-y-3">
    `;

    incident.checklist.forEach((item) => {
        checklistHTML += `
            <label class="group flex items-start p-4 bg-purple-900/30 border border-purple-500/30 rounded-xl cursor-pointer hover:bg-purple-800/40 transition-all duration-200">
                <div class="relative flex items-center justify-center mt-0.5 mr-4">
                    <input type="checkbox" onchange="updateChecklistProgress()" class="recovery-checkbox peer w-6 h-6 border-2 border-purple-400/50 rounded text-fuchsia-500 focus:ring-fuchsia-500/50 focus:ring-offset-0 cursor-pointer transition-all bg-[#1a0f2e]/50 checked:border-fuchsia-500">
                </div>
                <span class="text-purple-100 text-sm md:text-base leading-relaxed peer-checked:line-through peer-checked:text-purple-400/50 transition-all">${item}</span>
            </label>
        `;
    });

    checklistHTML += `</div>`;
    checklistContainer.innerHTML = checklistHTML;
    setTimeout(() => { checklistSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
}

function updateChecklistProgress() {
    const checkboxes = document.querySelectorAll('.recovery-checkbox');
    const total = checkboxes.length;
    if (total === 0) return;
    const checked = document.querySelectorAll('.recovery-checkbox:checked').length;
    const percentage = Math.round((checked / total) * 100);
    
    document.getElementById('checklist-progress-text').innerText = `${percentage}%`;
    const bar = document.getElementById('checklist-progress-bar');
    bar.style.width = `${percentage}%`;
    if (percentage === 100) {
        bar.classList.remove('bg-fuchsia-500');
        bar.classList.add('bg-green-500');
    } else {
        bar.classList.add('bg-fuchsia-500');
        bar.classList.remove('bg-green-500');
    }
}

// =============================================


