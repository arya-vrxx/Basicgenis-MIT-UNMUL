// FUNC: Checker Logic
// =============================================
function switchCheckerTab(tab) {
    currentCheckerTab = tab;
    const tabLink = document.getElementById('tab-link');
    const tabMessage = document.getElementById('tab-message');
    const inputLink = document.getElementById('input-link');
    const inputMessage = document.getElementById('input-message');

    document.getElementById('checker-results').classList.add('hidden');

    if (tab === 'link') {
        tabLink.className = 'px-5 py-2.5 text-sm font-semibold border-b-2 border-fuchsia-400 text-fuchsia-400 transition';
        tabMessage.className = 'px-5 py-2.5 text-sm font-semibold border-b-2 border-transparent text-purple-300 hover:text-white transition';
        inputLink.classList.remove('hidden'); inputMessage.classList.add('hidden');
    } else {
        tabMessage.className = 'px-5 py-2.5 text-sm font-semibold border-b-2 border-fuchsia-400 text-fuchsia-400 transition';
        tabLink.className = 'px-5 py-2.5 text-sm font-semibold border-b-2 border-transparent text-purple-300 hover:text-white transition';
        inputMessage.classList.remove('hidden'); inputLink.classList.add('hidden');
    }
}

function showCheckerResults({ riskLevel, title, message, riskScore, flags }) {
    const resultsDiv = document.getElementById('checker-results');
    resultsDiv.classList.remove('hidden');

    if (riskLevel === 'info') {
        resultsDiv.innerHTML = `<div class="p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg text-blue-200 text-sm"><i class="fa-solid fa-circle-info mr-2"></i>${message}</div>`;
        return;
    }

    const colors = {
        danger: { bg: 'bg-red-950/50', border: 'border-red-500/50', text: 'text-red-400', icon: 'fa-skull-crossbones', meter: 'bg-red-500' },
        warning: { bg: 'bg-orange-950/50', border: 'border-orange-500/50', text: 'text-orange-400', icon: 'fa-triangle-exclamation', meter: 'bg-orange-500' },
        caution: { bg: 'bg-yellow-950/50', border: 'border-yellow-500/50', text: 'text-yellow-400', icon: 'fa-circle-exclamation', meter: 'bg-yellow-500' },
        safe: { bg: 'bg-green-950/50', border: 'border-green-500/50', text: 'text-green-400', icon: 'fa-circle-check', meter: 'bg-green-500' }
    };
    const c = colors[riskLevel];
    
    let html = `
        <div class="${c.bg} ${c.border} border rounded-xl p-6 animate-fade-in">
            <div class="flex items-center mb-4">
                <i class="fa-solid ${c.icon} ${c.text} text-2xl mr-4"></i>
                <h3 class="font-bold ${c.text} text-lg">${title}</h3>
            </div>
            <div class="mb-5">
                <div class="flex justify-between text-xs font-semibold text-purple-300 mb-1">
                    <span>Tingkat Risiko</span><span>${riskScore}/100</span>
                </div>
                <div class="w-full bg-[#1a0f2e]/80 rounded-full h-3 border border-purple-500/20">
                    <div class="${c.meter} h-3 rounded-full risk-meter-fill" style="width: ${riskScore}%"></div>
                </div>
            </div>
    `;

    if (flags.length > 0) {
        html += `<div class="space-y-2 mb-4"><p class="text-sm font-semibold text-purple-200">Tanda ditemukan:</p>`;
        flags.forEach(flag => {
            html += `<div class="bg-[#1a0f2e]/50 border border-purple-500/20 rounded-lg p-3 flex items-start"><i class="fa-solid fa-flag text-purple-400 mt-0.5 mr-3"></i><span class="text-sm text-purple-100">${flag.text}</span></div>`;
        });
        html += `</div>`;
    }

    if (riskLevel === 'danger' || riskLevel === 'warning') {
        html += `
            <div class="mt-4 p-4 bg-red-950/40 border border-red-500/30 rounded-lg">
                <p class="text-sm font-semibold text-red-200 mb-2">Rekomendasi:</p>
                <ul class="text-sm text-red-100/80 space-y-1 list-disc ml-5">
                    <li>Jangan klik atau balas pesan.</li>
                    <li>Blokir pengirim dan laporkan.</li>
                </ul>
            </div>
        `;
    }
    html += `</div>`;
    resultsDiv.innerHTML = html;
}

function analyzeLink() { showCheckerResults({ riskLevel: 'danger', title: 'Contoh Berbahaya', riskScore: 85, flags: [{ severity: 'high', text: 'Domain mencurigakan atau IP tidak aman.'}] }); }
function analyzeMessage() { showCheckerResults({ riskLevel: 'warning', title: 'Waspada', riskScore: 60, flags: [{ severity: 'medium', text: 'Meminta uang secara mendesak.'}] }); }

// =============================================

