// INIT: Render Panic Mode
// =============================================
function renderPanicMode() {
    const stepsContainer = document.getElementById('instant-steps');
    stepsContainer.innerHTML = instantSteps.map(step => `
        <div class="bg-red-950/50 rounded-xl p-5 border border-red-500/30 shadow-sm">
            <div class="flex items-center mb-3">
                <div class="w-12 h-12 rounded-full bg-red-500/20 text-${step.color}-400 flex items-center justify-center text-xl font-black mr-4 border border-red-500/30">
                    ${step.number}
                </div>
                <div><h4 class="font-black text-red-100 text-base">${step.title}</h4></div>
            </div>
            <p class="text-sm text-red-200/80 leading-relaxed"><i class="fa-solid ${step.icon} text-${step.color}-400 mr-2"></i>${step.desc}</p>
        </div>
    `).join('');

    const contactsContainer = document.getElementById('emergency-contacts');
    contactsContainer.innerHTML = emergencyContacts.map(contact => `
        <a href="tel:${contact.number}" class="flex items-center p-3 bg-red-950/40 rounded-lg border border-red-500/30 hover:border-red-400 hover:bg-red-900/60 transition-all duration-200 group">
            <div class="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center mr-3 flex-shrink-0">
                <i class="fa-solid ${contact.icon} text-sm"></i>
            </div>
            <div class="min-w-0">
                <p class="font-bold text-red-100 text-sm">${contact.name}</p>
                <p class="text-red-300 font-mono text-sm font-semibold">${contact.number}</p>
            </div>
            <i class="fa-solid fa-phone ml-auto text-red-400 opacity-50 group-hover:opacity-100 transition"></i>
        </a>
    `).join('');
}
renderPanicMode();

// =============================================
// FUNC: Panic Mode Toggle & Clipboard
// =============================================
function togglePanicMode() {
    panicModeOpen = !panicModeOpen;
    const details = document.getElementById('emergency-details');
    const button = document.getElementById('panic-toggle-btn');
    const chevron = document.getElementById('panic-chevron');
    details.classList.toggle('hidden', !panicModeOpen);
    button.setAttribute('aria-expanded', String(panicModeOpen));
    button.firstChild.textContent = panicModeOpen ? 'Tutup ' : 'Buka ';
    chevron.style.transform = panicModeOpen ? 'rotate(0deg)' : 'rotate(180deg)';
}

async function copyToClipboard(elementId, btnId) {
    const textArea = document.getElementById(elementId);
    const textToCopy = textArea.value;
    const btn = document.getElementById(btnId);
    const originalContent = btn.innerHTML;
    try {
        await navigator.clipboard.writeText(textToCopy);
        btn.innerHTML = '<i class="fa-solid fa-check mr-2"></i>Berhasil Disalin!';
        setTimeout(() => { btn.innerHTML = originalContent; }, 2500);
    } catch (err) {
        textArea.select(); document.execCommand('copy');
        btn.innerHTML = '<i class="fa-solid fa-check mr-2"></i>Disalin!';
        setTimeout(() => { btn.innerHTML = originalContent; }, 2500);
    }
}
