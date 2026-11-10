// =============================================
// DATA: Insiden
// =============================================
const incidents = [
    {
        id: 'phishing',
        title: 'Phishing (Link Palsu)',
        desc: 'Tidak sengaja klik link mencurigakan & isi data/OTP.',
        icon: 'fa-link',
        theme: { bg: 'bg-blue-900/20', iconBg: 'bg-blue-500/20', text: 'text-blue-300', borderHover: 'hover:border-blue-400', ring: 'focus:ring-blue-400/50' },
        checklist: [
            'Segera ganti password akun yang datanya terlanjur dimasukkan.',
            'Hubungi call center bank resmi jika Anda memasukkan data perbankan (kartu kredit/debit/PIN).',
            'Aktifkan Verifikasi Dua Langkah (2FA) di akun-akun penting Anda.',
            'Logout paksa seluruh sesi perangkat yang aktif melalui menu pengaturan privasi/keamanan aplikasi.'
        ]
    },
    {
        id: 'apk',
        title: 'File APK Berbahaya',
        desc: 'Terlanjur unduh & instal APK asing (undangan, resi, dll).',
        icon: 'fa-file-shield',
        theme: { bg: 'bg-red-900/20', iconBg: 'bg-red-500/20', text: 'text-red-300', borderHover: 'hover:border-red-400', ring: 'focus:ring-red-400/50' },
        checklist: [
            'SEGERA matikan koneksi internet (Wi-Fi dan Data Seluler).',
            'Aktifkan Mode Pesawat (Airplane Mode) agar aplikasi tidak bisa mengirim data Anda ke server pelaku.',
            'Cari dan Hapus (Uninstall) aplikasi asing tersebut dari menu Pengaturan HP Anda.',
            'Gunakan HP/perangkat lain untuk menghubungi call center bank/e-wallet untuk memblokir rekening sementara.',
            'Untuk keamanan maksimal, lakukan Factory Reset setelah mem-backup file foto/dokumen.'
        ]
    },
    {
        id: 'hacked',
        title: 'Akun Dibajak (Hacked)',
        desc: 'WhatsApp, IG, atau akun medsos lainnya diambil alih.',
        icon: 'fa-user-ninja',
        theme: { bg: 'bg-purple-900/30', iconBg: 'bg-fuchsia-500/20', text: 'text-fuchsia-300', borderHover: 'hover:border-fuchsia-400', ring: 'focus:ring-fuchsia-400/50' },
        checklist: [
            'Jika WhatsApp: Hapus lalu instal ulang aplikasi, segera login ulang dengan nomor Anda untuk menendang sesi pelaku.',
            'Coba login kembali menggunakan fitur "Lupa Password" (Forgot Password).',
            'Segera telepon keluarga/teman terdekat secara langsung agar mereka tidak tertipu jika pelaku meminta uang.',
            'Gunakan fitur laporkan akun dibajak yang disediakan resmi oleh platform.'
        ]
    },
    {
        id: 'transfer',
        title: 'Terlanjur Transfer',
        desc: 'Baru menyadari bahwa uang ditransfer ke rekening penipu.',
        icon: 'fa-money-bill-transfer',
        theme: { bg: 'bg-emerald-900/20', iconBg: 'bg-emerald-500/20', text: 'text-emerald-300', borderHover: 'hover:border-emerald-400', ring: 'focus:ring-emerald-400/50' },
        checklist: [
            'Screenshot semua bukti: Bukti transfer m-banking/ATM, riwayat chat, dan nomor HP/rekening pelaku.',
            'Segera hubungi Call Center resmi bank Anda untuk minta pemblokiran rekening penerima.',
            'Laporkan nomor rekening penipu ke platform CekRekening.id.',
            'Segera ke kantor cabang bank terdekat dan siapkan KTP, kronologi, serta laporan polisi.'
        ]
    }
];

// =============================================
// DATA: Emergency Contacts & Steps
// =============================================
const emergencyContacts = [
    { name: 'BCA', number: '1500888', icon: 'fa-building-columns', color: 'blue' },
    { name: 'BRI', number: '14017', icon: 'fa-building-columns', color: 'blue' },
    { name: 'BNI', number: '1500046', icon: 'fa-building-columns', color: 'blue' },
    { name: 'Mandiri', number: '14000', icon: 'fa-building-columns', color: 'blue' },
    { name: 'DANA', number: '1500445', icon: 'fa-wallet', color: 'indigo' },
    { name: 'OVO', number: '1500696', icon: 'fa-wallet', color: 'indigo' },
    { name: 'ShopeePay', number: '1500702', icon: 'fa-wallet', color: 'indigo' },
    { name: 'Polisi (110)', number: '110', icon: 'fa-shield', color: 'red' },
];

const instantSteps = [
    { icon: 'fa-wifi', title: 'MATIKAN INTERNET', desc: 'Aktifkan Mode Pesawat sekarang. Ini mencegah data Anda dikirim ke pelaku.', color: 'red', number: '1' },
    { icon: 'fa-phone', title: 'HUBUNGI BANK', desc: 'Telepon call center bank Anda untuk blokir rekening sementara.', color: 'orange', number: '2' },
    { icon: 'fa-lock', title: 'AMANKAN AKUN', desc: 'Ganti password & aktifkan 2FA di akun dari perangkat lain.', color: 'yellow', number: '3' }
];

const quizScenarios = [
    {
        id: 1,
        scenario: 'Anda menerima SMS: "Selamat! Anda memenangkan undian Telkomsel Rp25.000.000. Klik link berikut untuk klaim hadiah: http://telkomsel-hadiah.xyz/klaim"',
        options: [
            { text: 'Klik link-nya, siapa tahu benar menang', correct: false },
            { text: 'Abaikan — ini jelas penipuan', correct: true },
            { text: 'Balas SMS untuk konfirmasi', correct: false }
        ],
        explanation: '🚩 Tanda penipuan: (1) Domain .xyz bukan domain resmi, (2) Tekanan untuk segera klik link. Telkomsel resmi menggunakan domain telkomsel.com.'
    },
    {
        id: 2,
        scenario: 'Teman Anda mengirim WhatsApp: "Bisa pinjam uang Rp500rb ga? Transfer ke: 1234567890 (BCA a.n. Budi Santoso)."',
        options: [
            { text: 'Langsung transfer karena teman dekat', correct: false },
            { text: 'Telepon/video call teman tersebut dulu', correct: true },
            { text: 'Tanya lewat chat "beneran kamu?"', correct: false }
        ],
        explanation: '🚩 Akun WA bisa dibajak! Verifikasi via telepon langsung sebelum transfer.'
    }
];

let panicModeOpen = true;
let currentCheckerTab = 'link';
let quizState = { currentQuestion: 0, score: 0, answered: false, finished: false };

const cardsContainer = document.getElementById('incident-cards');
const checklistSection = document.getElementById('checklist-section');
const checklistContainer = document.getElementById('checklist-container');

// =============================================
// INIT: Render Cards
// =============================================
incidents.forEach(incident => {
    const card = document.createElement('button');
    card.className = `group text-left p-5 rounded-2xl border border-purple-500/30 bg-purple-900/20 ${incident.theme.borderHover} transition-all duration-300 focus:outline-none focus:ring-2 ${incident.theme.ring} hover:-translate-y-1 hover:bg-purple-900/40 flex flex-col h-full`;
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
// INIT: Render Panic Mode
// =============================================


