# Incident Response & Recovery Kit

Panduan pertolongan pertama pasca-insiden siber. Aplikasi berjalan di browser dan menyediakan langkah darurat, panduan insiden, pemeriksaan link/pesan, kanal pelaporan, dan kuis edukasi.

## Struktur project

- `index.html` — struktur halaman dan konten.
- `css/main.css` — tema, layout responsif, dan komponen antarmuka.
- `js/data.js` — data insiden, kontak darurat, langkah instan, dan skenario kuis.
- `js/incidents.js` — kartu insiden serta checklist pemulihan.
- `js/emergency.js` — render kontak/langkah darurat, tombol bantuan, dan fungsi salin.
- `js/checker.js` — tab dan hasil pemeriksaan link/pesan.
- `js/quiz.js` — alur kuis kewaspadaan.
- `js/app.js` — inisialisasi aplikasi dan registrasi service worker.
- `assets/` — logo dan aset visual.
- `manifest.json`, `sw.js` — metadata PWA dan cache offline.

## Menjalankan

Buka folder ini di VS Code dan jalankan `index.html` dengan Live Server. Server lokal juga diperlukan untuk menguji service worker dan fitur PWA. Font, ikon, dan Tailwind utilities dimuat dari CDN; layout utama tetap menggunakan `css/main.css`.

## Catatan

Analisis pesan/link adalah panduan berbasis pola sederhana, bukan jaminan keamanan atau pengganti laporan resmi. Jangan menempelkan kata sandi, PIN, atau kode OTP.
