# Incident Response & Recovery Kit

Panduan pertolongan pertama pasca-insiden siber. Seluruh logika berjalan di browser — tanpa server, tanpa database, dan tidak ada data yang dikirim keluar. Setelah dibuka sekali, aplikasi tetap bisa dipakai offline.

Dibuat untuk **SMK TI Airlangga Samarinda** — *Guardians of the Digital Space*.

---

## Fitur

| Fitur | Keterangan |
|---|---|
| **Panel darurat** | Tiga langkah instan, 9 nomor kontak resmi (BCA, BRI, BNI, Mandiri, DANA, OVO, ShopeePay, OJK, Polisi), tombol salin semua nomor, dan bisa dibuka/tutup. |
| **Panduan insiden** | 4 skenario — phishing, APK berbahaya, akun dibajak, transfer ke penipu — masing-masing 5–6 langkah. Progres checklist tersimpan otomatis per insiden. |
| **Pemeriksa link** | Analisis rule-based dengan 12 aturan: TLD berisiko, punycode, impersonasi merek, host berupa IP, pemendek link, skema berbahaya, dan lainnya. Dilengkapi contoh cepat satu klik. |
| **Pemeriksa pesan** | 8 kelompok indikator: permintaan OTP/PIN, ancaman, janji hadiah, tekanan waktu, permintaan transfer, link berisiko, penyebutan merek, dan gaya penulisan penipuan. |
| **Riwayat pemeriksaan** | 6 pemeriksaan terakhir beserta skor dan waktu; bisa dihapus. Hanya tersimpan di perangkat. |
| **Kuis** | 10 skenario, urutan diacak, penjelasan di setiap jawaban, rekor tersimpan. |
| **Templat laporan & peringatan** | Siap disalin untuk laporan bank/polisi dan pemberitahuan keluarga. |
| **PWA** | Installable, service worker, cache offline, ikon 192/512 + maskable, serta pemberitahuan versi baru. |
| **Tema terang/gelap** | Tombol di header. Pilihan tersimpan di perangkat; tampilan bawaan adalah terang. |
| **Navigasi & aksesibilitas** | Skip link, menu mobile, sorot menu sesuai bagian yang terlihat, tombol kembali ke atas, indikator online/offline, dan dukungan `prefers-reduced-motion`. |
| **Animasi idle maskot** | Robot melayang, kepala menoleh halus, antena bergoyang, mata berkedip, dan lampu layar dada berdenyut. |
| **Maskot interaktif** | Mata mengikuti kursor ke seluruh halaman. Saat kursor mendekat, robot membesar, condong ke arah kursor, dan "bernapas" lebih cepat. Klik maskot untuk efek lompat kecil. |

---

## Struktur project

```
index.html              struktur halaman + SVG maskot inline (agar bisa dianimasikan)
manifest.json           metadata PWA + ikon
sw.js                   service worker (precache, network-first untuk HTML)
README.md               dokumentasi ini

css/
  main.css              design system: token, komponen, tema, responsif

js/
  data.js               data konten: insiden, kontak, kuis, templat
  util.js               utilitas: escapeHtml, storage, helper DOM
  analyzer.js           mesin analisis link & pesan (murni, tanpa DOM)
  incidents.js          kartu insiden + checklist + progres
  emergency.js          panel darurat, kontak, salin teks
  checker.js            UI pemeriksa (tab, hasil, riwayat)
  quiz.js               alur kuis
  mascot.js             interaksi maskot: mata mengikuti kursor, reaksi mendekat, klik
  app.js                navigasi, scroll-spy, PWA, tema, status jaringan

tests/
  analyzer.test.js      unit test mesin analisis

assets/
  img/                  robot-head.svg, icon-192.png, icon-512.png, icon-maskable-512.png
  vendor/fontawesome/   Font Awesome yang di-vendor (tetap tampil offline)
```

Tidak ada proses build. Semua berkas dilayani apa adanya.

---

## Menjalankan

Service worker dan manifest hanya aktif lewat `http://`, bukan `file://`.

**Opsi 1 — VS Code Live Server**
Klik kanan `index.html` → *Open with Live Server*.

**Opsi 2 — Python**
```bash
python -m http.server 8080
# buka http://localhost:8080
```

**Opsi 3 — Node**
```bash
npx serve .
```

> Tipografi (DM Sans, Manrope) dimuat dari Google Fonts. Saat offline, browser memakai font sistem sebagai gantinya, sementara ikon Font Awesome tetap tampil karena di-vendor di dalam project.

---

## Menjalankan pengujian

```bash
node tests/analyzer.test.js
```

19 kasus uji tanpa dependensi, mencakup: domain resmi dan domain tiruan, punycode, host berupa IP, pemendek link, skema `javascript:`, impersonasi merek, permintaan OTP, hadiah disertai link berbahaya, serta pesan wajar yang tidak boleh ditandai.

---

## Cara kerja analisis

Semua pemeriksaan berjalan di perangkat dan bersifat **rule-based** — tidak ada API, tidak ada data yang dikirim keluar.

**Link** — skor 0–100 dari 12 aturan (beberapa aturan digabung dalam satu poin di bawah ini):

- `http://` tanpa enkripsi
- host berupa alamat IP
- punycode (`xn--`) dan karakter `@` penyamar
- TLD berisiko (`.xyz`, `.top`, `.tk`, …)
- layanan pemendek link
- nama merek pada domain yang bukan domain resminya
- subdomain bertingkat, tanda hubung berlebih, domain panjang
- kata provokatif pada path (`login`, `klaim`, `otp`, …)
- karakter terenkode ganda
- port tidak lazim
- bonus pengurangan skor untuk domain yang dikenal resmi

**Pesan** — 8 kelompok indikator:

- permintaan OTP/PIN/kata sandi
- ancaman (akun diblokir, denda) dan tekanan waktu
- janji hadiah/undian
- permintaan transfer atau biaya
- link di dalam pesan (dianalisis ulang sebagai link)
- penyebutan merek atau instansi
- nomor panjang (indikasi rekening)
- gaya penulisan: huruf kapital berlebih, salah eja umum, tanda baca berlebihan

Ambang: `≥70` berisiko tinggi, `40–69` waspada, `15–39` perlu hati-hati, `<15` tidak ditemukan pola risiko.

Dua hal yang perlu diketahui tentang ambang ini:

1. Domain yang tidak memicu indikator **tidak otomatis dinyatakan aman** — hasilnya hanya berarti "tidak ada pola risiko yang dikenali".
2. Bila ada indikator apa pun, hasil terendah adalah **perlu hati-hati**; aplikasi tidak akan menyebut "aman" selama masih ada temuan, sekalipun skornya rendah.

> Ini panduan awal, bukan jaminan keamanan dan bukan pengganti laporan resmi. Jangan pernah menempelkan kata sandi, PIN, atau kode OTP.

---

## Catatan pengembangan

- Menambah aturan analisis: edit `js/analyzer.js`, lalu jalankan unit test.
- Menambah soal kuis / insiden: edit `js/data.js` (UI menyesuaikan otomatis).
- **Setiap deploy, naikkan `CACHE_NAME` di `sw.js`** (mis. `irk-v6` → `irk-v7`) agar cache lama terhapus. Bila menambah berkas baru, masukkan juga ke daftar `APP_FILES`.
- Progres checklist, rekor kuis, tema, dan riwayat disimpan di `localStorage` dengan prefix `irk:v1:`.
- Warna dan spacing terpusat sebagai CSS custom property di `:root` dan `[data-theme="dark"]` pada `css/main.css`.
- Font Google dimuat dari CDN dan tidak di-precache (lintas origin). Bila ingin tipografi ikut offline, unduh font-nya ke `assets/vendor/` lalu sesuaikan `index.html`.

---

## Riwayat perbaikan

Perbaikan pada revisi ini:

1. **Kartu insiden ter-render ganda** (8 kartu) karena `data.js` dan `incidents.js` sama-sama merender — dihapus, logika DOM dipisah dari data.
2. **Dua sistem desain bertabrakan** (markup Tailwind ungu gelap di atas tema sage terang + ~40 baris `!important`) — Tailwind CDN dihapus, semua komponen ditulis ulang dengan kelas semantik.
3. **Fitur pemeriksa palsu** (hasil hardcoded) — diganti mesin analisis nyata dengan 19 unit test.
4. **Celah XSS** pada hasil pemeriksaan — semua input pengguna di-escape lewat `IRK.util.escapeHtml` sebelum masuk `innerHTML`.
5. **Halaman auto-scroll** ke bagian cek link saat dibuka — fokus hanya diberikan saat pengguna memicu tab.
6. **Progres checklist hilang** saat refresh — kini tersimpan per insiden.
7. **Aksesibilitas**: skip link, `aria-expanded`, `aria-selected` pada tab, navigasi keyboard, `aria-live` untuk hasil, fokus terlihat, dukungan `prefers-reduced-motion`.
8. **PWA**: `theme_color` disamakan dengan meta tag, ikon PNG 192/512 + maskable, precache lengkap, alur update service worker, Font Awesome di-vendor agar ikon tetap muncul offline.
9. **Tema gelap** dan indikator status jaringan/mode offline.
10. **Animasi idle maskot**: SVG di-inline agar kepala, antena, mata, lengan, layar dada, dan bayangan bisa dianimasikan terpisah dengan CSS (tanpa JavaScript). Menghormati `prefers-reduced-motion`.
11. **Interaksi maskot**: `js/mascot.js` melacak kursor dengan `requestAnimationFrame` (throttled) dan mengatur CSS variable `--look-x`, `--look-y`, `--lean`. Mata selalu mengikuti kursor; condong badan dan percepatan animasi hanya aktif saat kursor berada dalam radius ~1.15× lebar maskot. Klik memicu animasi lompat. Semua mati saat `prefers-reduced-motion`.
12. **Struktur aset dirapikan**: `assets/` dipisah menjadi `img/` dan `vendor/`; `hero-robot.svg` (duplikat SVG yang kini inline) dan `smurf-logo.svg` (maskot lama) dihapus, folder kosong dibersihkan, dan precache `sw.js` disesuaikan.
