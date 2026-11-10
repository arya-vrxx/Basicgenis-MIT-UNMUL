/* =========================================================
   data.js — Sumber data konten (tanpa DOM, tanpa logika UI)
   Semua modul membaca dari window.IRK.data
   ========================================================= */
(function (global) {
  'use strict';

  const IRK = (global.IRK = global.IRK || {});

  IRK.data = {
    /* ---------------------------------------------
       Jenis insiden + langkah pemulihan
       tone: blue | red | purple | green (lihat main.css)
       --------------------------------------------- */
    incidents: [
      {
        id: 'phishing',
        tone: 'blue',
        icon: 'fa-link',
        title: 'Phishing (Link Palsu)',
        desc: 'Terlanjur klik link mencurigakan lalu mengisi data atau kode OTP.',
        eta: '±10 menit',
        checklist: [
          'Ganti kata sandi akun yang datanya terlanjur Anda masukkan — mulai dari email utama.',
          'Keluar paksa (logout semua perangkat) dari menu Keamanan / Perangkat aktif di aplikasi tersebut.',
          'Aktifkan verifikasi dua langkah (2FA) memakai aplikasi authenticator, bukan hanya SMS.',
          'Hubungi call center resmi bank bila Anda sempat mengisi data kartu, PIN, atau kode OTP.',
          'Periksa riwayat transaksi dan email masuk untuk aktivitas yang tidak Anda kenali.'
        ]
      },
      {
        id: 'apk',
        tone: 'red',
        icon: 'fa-file-shield',
        title: 'File APK Berbahaya',
        desc: 'Terlanjur mengunduh dan memasang APK asing (undangan, resi, kurir).',
        eta: 'Segera',
        checklist: [
          'Aktifkan Mode Pesawat sekarang — ini memutus pengiriman data ke server pelaku.',
          'Matikan juga Wi-Fi dan data seluler bila mode pesawat tidak tersedia.',
          'Hapus (uninstall) aplikasi asing tersebut lewat Pengaturan → Aplikasi.',
          'Dari perangkat lain, hubungi call center bank / e-wallet untuk memblokir sementara.',
          'Cek akses aplikasi berbahaya: SMS, kontak, dan Aksesibilitas — matikan izinnya.',
          'Untuk keamanan maksimal, cadangkan foto/dokumen lalu lakukan factory reset.'
        ]
      },
      {
        id: 'hacked',
        tone: 'purple',
        icon: 'fa-user-ninja',
        title: 'Akun Dibajak',
        desc: 'WhatsApp, Instagram, atau akun media sosial diambil alih orang lain.',
        eta: '±15 menit',
        checklist: [
          'WhatsApp: pasang ulang aplikasi lalu login dengan nomor Anda untuk mengeluarkan sesi pelaku.',
          'Coba pulihkan akun lewat menu "Lupa kata sandi" dan periksa email/nomor pemulihan.',
          'Telepon keluarga dan teman terdekat — pelaku biasanya langsung meminta uang.',
          'Aktifkan 2FA dan cabut akses aplikasi pihak ketiga yang tidak Anda kenali.',
          'Laporkan akun yang dibajak lewat pusat bantuan resmi platform tersebut.'
        ]
      },
      {
        id: 'transfer',
        tone: 'green',
        icon: 'fa-money-bill-transfer',
        title: 'Terlanjur Transfer',
        desc: 'Baru sadar uang sudah dikirim ke rekening penipu.',
        eta: 'Menit pertama krusial',
        checklist: [
          'Simpan semua bukti: struk transfer, riwayat chat, nomor HP, dan nomor rekening pelaku.',
          'Telepon call center bank Anda dan minta pemblokiran rekening penerima.',
          'Laporkan rekening penipu ke CekRekening.id.',
          'Datang ke kantor cabang bank dengan KTP, kronologi tertulis, dan bukti transfer.',
          'Buat laporan polisi — diperlukan bank untuk proses lanjutan.',
          'Jangan percaya pihak yang menawarkan "jasa pengembalian dana" berbayar.'
        ]
      }
    ],

    /* ---------------------------------------------
       Tiga langkah pertama saat panik
       --------------------------------------------- */
    instantSteps: [
      { icon: 'fa-wifi', title: 'Matikan internet', desc: 'Aktifkan Mode Pesawat. Ini memutus pengiriman data Anda ke pelaku.', tone: 'red' },
      { icon: 'fa-phone', title: 'Hubungi bank', desc: 'Telepon call center resmi untuk memblokir rekening sementara.', tone: 'amber' },
      { icon: 'fa-lock', title: 'Amankan akun', desc: 'Ganti kata sandi dan aktifkan 2FA dari perangkat lain yang bersih.', tone: 'green' }
    ],

    /* ---------------------------------------------
       Kontak darurat (nomor resmi)
       --------------------------------------------- */
    emergencyContacts: [
      { name: 'BCA', number: '1500888', icon: 'fa-building-columns' },
      { name: 'BRI', number: '14017', icon: 'fa-building-columns' },
      { name: 'BNI', number: '1500046', icon: 'fa-building-columns' },
      { name: 'Mandiri', number: '14000', icon: 'fa-building-columns' },
      { name: 'DANA', number: '1500445', icon: 'fa-wallet' },
      { name: 'OVO', number: '1500696', icon: 'fa-wallet' },
      { name: 'ShopeePay', number: '1500702', icon: 'fa-wallet' },
      { name: 'OJK', number: '157', icon: 'fa-scale-balanced' },
      { name: 'Polisi', number: '110', icon: 'fa-shield-halved' }
    ],

    /* ---------------------------------------------
       Kuis kewaspadaan — 10 skenario
       --------------------------------------------- */
    quizScenarios: [
      {
        id: 1,
        scenario: 'SMS masuk: "Selamat! Anda memenangkan undian Telkomsel Rp25.000.000. Klaim sekarang: http://telkomsel-hadiah.xyz/klaim"',
        options: [
          { text: 'Klik link-nya, siapa tahu benar menang', correct: false },
          { text: 'Abaikan — ini penipuan', correct: true },
          { text: 'Balas SMS untuk konfirmasi', correct: false }
        ],
        explanation: 'Domain .xyz bukan milik Telkomsel, dan situs resmi tidak pernah meminta klaim lewat tautan acak. Cek domainnya: telkomsel.com.'
      },
      {
        id: 2,
        scenario: 'WhatsApp dari nomor teman: "Bisa pinjam uang Rp500rb? Transfer ke 1234567890 (BCA a.n. Budi Santoso)."',
        options: [
          { text: 'Langsung transfer karena teman dekat', correct: false },
          { text: 'Telepon atau video call teman itu dulu', correct: true },
          { text: 'Tanya lewat chat "beneran kamu?"', correct: false }
        ],
        explanation: 'Akun WhatsApp sering dibajak dan dipakai meminjam uang. Chat teks bisa dikendalikan pelaku — verifikasi lewat panggilan suara.'
      },
      {
        id: 3,
        scenario: 'Anda menerima file "Undangan_Pernikahan.apk" di grup WhatsApp dari nomor tak dikenal.',
        options: [
          { text: 'Buka untuk melihat undangannya', correct: false },
          { text: 'Hapus tanpa membuka, lalu blokir pengirim', correct: true },
          { text: 'Simpan dulu, nanti dibuka di komputer', correct: false }
        ],
        explanation: 'Undangan pernikahan selalu berupa gambar atau PDF, bukan APK. File APK dari sumber tak dikenal sering merupakan malware pencuri OTP.'
      },
      {
        id: 4,
        scenario: 'Email mengaku dari bank: "Akun Anda akan diblokir. Verifikasi sekarang dengan membalas kode OTP Anda."',
        options: [
          { text: 'Balas dengan kode OTP agar akun aman', correct: false },
          { text: 'Abaikan dan hubungi call center resmi bank', correct: true },
          { text: 'Klik tanda "Balas" lalu tulis keluhan', correct: false }
        ],
        explanation: 'Bank tidak pernah meminta OTP, PIN, atau kata sandi — lewat kanal apa pun. Siapa pun yang meminta OTP adalah penipu.'
      },
      {
        id: 5,
        scenario: 'Pesan WhatsApp: "Paket Anda tertahan. Bayar biaya Rp2.000 di sini: bit.ly/resi-jnt"',
        options: [
          { text: 'Bayar karena nominalnya kecil', correct: false },
          { text: 'Buka aplikasi J&T resmi dan cek nomor resi', correct: true },
          { text: 'Klik link untuk melihat detail paket', correct: false }
        ],
        explanation: 'Penipuan "paket tertahan" memakai link pendek agar domain aslinya tersembunyi. Nominal kecil dipakai supaya korban lengah dan menyerahkan data kartu.'
      },
      {
        id: 6,
        scenario: 'Akun Instagram mengirim DM: "Halo, ini tim verifikasi. Kirim kode 6 digit yang baru masuk ke SMS-mu ya."',
        options: [
          { text: 'Kirim kodenya, itu untuk verifikasi', correct: false },
          { text: 'Jangan kirim — kode itu untuk masuk ke akun Anda', correct: true },
          { text: 'Kirim setelah memastikan akunnya centang biru', correct: false }
        ],
        explanation: 'Kode 6 digit adalah kunci masuk akun Anda. Tim resmi platform tidak pernah meminta kode verifikasi lewat DM.'
      },
      {
        id: 7,
        scenario: 'Penjual di marketplace meminta DP transfer langsung ke rekening pribadi, di luar aplikasi, dengan alasan "biar lebih murah".',
        options: [
          { text: 'Transfer saja, sudah diskon', correct: false },
          { text: 'Tolak dan bayar lewat sistem marketplace', correct: true },
          { text: 'Transfer setengah dulu sebagai jaminan', correct: false }
        ],
        explanation: 'Transaksi di luar sistem marketplace kehilangan perlindungan pembeli. Pola "biar lebih murah" adalah modus penipuan klasik.'
      },
      {
        id: 8,
        scenario: 'Anda menerima undangan Google Docs, lalu diminta login ulang di halaman yang alamatnya "docs-google.secure-login.com".',
        options: [
          { text: 'Login karena tampilannya mirip Google', correct: false },
          { text: 'Tutup halaman — domainnya bukan google.com', correct: true },
          { text: 'Login lalu langsung ganti password', correct: false }
        ],
        explanation: 'Tampilan bisa dipalsukan, domain tidak. Alamat asli Google selalu berakhiran google.com — bukan "secure-login.com".'
      },
      {
        id: 9,
        scenario: 'Pesan dari "nomor baru" teman: "Ini nomor baruku, tolong simpan. Sekarang aku butuh transfer darurat."',
        options: [
          { text: 'Transfer karena sudah diberi tahu nomor baru', correct: false },
          { text: 'Verifikasi lewat nomor lama atau panggilan langsung', correct: true },
          { text: 'Minta foto KTP sebagai bukti', correct: false }
        ],
        explanation: 'Modus "nomor baru" sering dipakai setelah akun korban dibajak. Selalu verifikasi lewat kanal lama yang sudah Anda percaya.'
      },
      {
        id: 10,
        scenario: 'Lowongan kerja online: "Gaji Rp8 juta, cukup dari HP. Kirim biaya administrasi Rp150.000 untuk mengunci slot."',
        options: [
          { text: 'Bayar karena slotnya terbatas', correct: false },
          { text: 'Abaikan — perusahaan resmi tidak memungut biaya rekrutmen', correct: true },
          { text: 'Bayar asal ada bukti transfer resmi', correct: false }
        ],
        explanation: 'Perusahaan legal tidak memungut biaya administrasi kepada pelamar. Permintaan biaya di awal adalah ciri penipuan lowongan kerja.'
      }
    ],

    /* ---------------------------------------------
       Templat teks
       --------------------------------------------- */
    templates: {
      report: [
        'Waktu Kejadian: [tanggal & jam]',
        'Nomor Rekening Tujuan: [nomor rekening & nama bank]',
        'Platform/Aplikasi: [WhatsApp/Instagram/SMS/dll]',
        'Nominal Kerugian: [jika ada]',
        'Kronologi Singkat: [jelaskan singkat kejadian]',
        'Bukti: [bukti transfer, tangkapan layar chat]'
      ].join('\n'),

      alert: [
        'PENGUMUMAN PENTING:',
        'Akun/perangkat saya sedang terindikasi mengalami peretasan.',
        'Mohon abaikan pesan mencurigakan yang meminta uang atau data pribadi atas nama saya.',
        'Jangan lakukan transfer sebelum menghubungi saya langsung.',
        'Terima kasih.'
      ].join('\n')
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
