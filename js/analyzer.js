/* =========================================================
   analyzer.js — Mesin analisis link & pesan (rule-based)
   Murni: tidak menyentuh DOM, bisa diuji lewat Node.
   Penggunaan: IRK.analyzer.analyzeLink(input)
               IRK.analyzer.analyzeMessage(input)
   ========================================================= */
(function (global) {
  'use strict';

  const IRK = (global.IRK = global.IRK || {});

  /* ---------- Aturan ---------- */
  const SUSPICIOUS_TLDS = [
    'xyz', 'top', 'tk', 'ml', 'ga', 'cf', 'gq', 'zip', 'mov', 'click',
    'link', 'work', 'rest', 'shop', 'buzz', 'icu', 'country', 'stream',
    'download', 'racing', 'win', 'bid', 'loan', 'review', 'party',
    'trade', 'science', 'gdn', 'men', 'kim', 'date', 'wang', 'accountant'
  ];

  const SHORTENERS = [
    'bit.ly', 'tinyurl.com', 's.id', 'cutt.ly', 't.co', 'goo.gl', 'ow.ly',
    'is.gd', 'buff.ly', 'rb.gy', 'rebrand.ly', 'shorturl.at', 'tiny.cc',
    'bl.ink', 'lnkd.in', 't.ly', 'v.gd'
  ];

  /* Merek populer -> domain resmi. Dipakai untuk mendeteksi impersonasi. */
  const BRANDS = {
    bca: ['bca.co.id', 'klikbca.com'],
    bri: ['bri.co.id'],
    bni: ['bni.co.id'],
    mandiri: ['bankmandiri.co.id'],
    btn: ['btn.co.id'],
    dana: ['dana.id'],
    ovo: ['ovo.id'],
    gopay: ['gojek.com', 'gopay.co.id'],
    shopeepay: ['shopeepay.co.id'],
    shopee: ['shopee.co.id'],
    tokopedia: ['tokopedia.com'],
    lazada: ['lazada.co.id'],
    bukalapak: ['bukalapak.com'],
    telkomsel: ['telkomsel.com'],
    indosat: ['indosat.com'],
    xl: ['xl.co.id'],
    grab: ['grab.com'],
    gojek: ['gojek.com'],
    jnt: ['jet.co.id', 'jnt.co.id'],
    jne: ['jne.co.id'],
    sicepat: ['sicepat.com'],
    anteraja: ['anteraja.id'],
    instagram: ['instagram.com'],
    whatsapp: ['whatsapp.com', 'wa.me'],
    facebook: ['facebook.com', 'fb.com'],
    telegram: ['telegram.org', 't.me'],
    tiktok: ['tiktok.com'],
    google: ['google.com', 'google.co.id', 'gmail.com', 'youtube.com'],
    microsoft: ['microsoft.com', 'live.com', 'office.com', 'outlook.com'],
    apple: ['apple.com', 'icloud.com'],
    netflix: ['netflix.com'],
    ojk: ['ojk.go.id'],
    pajak: ['pajak.go.id'],
    kominfo: ['kominfo.go.id', 'komdigi.go.id']
  };

  const TRUSTED = [
    'google.com', 'youtube.com', 'wikipedia.org', 'github.com', 'microsoft.com',
    'apple.com', 'cloudflare.com', 'mozilla.org', 'kemdikbud.go.id',
    'go.id', 'ac.id', 'sch.id'
  ];

  const URGENCY_WORDS = [
    'segera', 'sekarang', 'hari ini', 'terakhir', 'batas waktu', 'mendesak',
    'jangan sampai', 'buruan', 'cepat', 'dalam 24 jam', 'sebelum jam',
    'kesempatan terakhir', 'ditutup', 'diblokir', 'dinonaktifkan'
  ];

  const PRIZE_WORDS = [
    'menang', 'hadiah', 'undian', 'gratis', 'bonus', 'cashback', 'klaim',
    'pemenang', 'beruntung', 'saldo gratis', 'voucher', 'giveaway'
  ];

  const CREDENTIAL_WORDS = [
    'otp', 'kode verifikasi', 'kode rahasia', 'pin', 'password', 'kata sandi',
    'sandi', 'minta kode', 'kode 6 digit', 'kode 4 digit', 'token', 'mfa',
    'kode masuk', 'kode sms'
  ];

  const MONEY_WORDS = [
    'transfer', 'rekening', 'kirim uang', 'bayar', 'biaya admin', 'dp',
    'uang muka', 'top up', 'isi saldo', 'nominal'
  ];

  const THREAT_WORDS = [
    'akun diblokir', 'akan ditutup', 'dinonaktifkan', 'suspend', 'hangus',
    'dibekukan', 'penalti', 'denda', 'disita', 'bermasalah'
  ];

  const LINK_HINT = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|id|net|org|xyz|top|link|click|site|online|info|biz|me|co|ly|gl|io|app|shop)\b)/i;

  const MAX_SCORE = 100;
  const clamp = (n) => Math.max(0, Math.min(MAX_SCORE, Math.round(n)));

  function levelFromScore(score) {
    if (score >= 70) return 'danger';
    if (score >= 40) return 'warning';
    if (score >= 15) return 'caution';
    return 'safe';
  }

  function textOf(v) {
    return typeof v === 'string' ? v.trim() : '';
  }

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /* Cocokkan kata kunci. Kata pendek memakai batas kata agar
     "PIN" tidak ikut cocok pada "PINjam", "DP" pada "DPT", dll. */
  function hits(words, text, flags) {
    return words.filter((word) => {
      const pattern = /^[a-z]{1,4}$/.test(word)
        ? new RegExp('\\b' + escapeRegExp(word) + '\\b', 'i')
        : word;
      return (pattern instanceof RegExp ? pattern : new RegExp(escapeRegExp(pattern), 'i')).test(text);
    });
  }

  function hostMatches(host, domain) {
    return host === domain || host.endsWith('.' + domain);
  }

  function isTrusted(host) {
    return TRUSTED.some((d) => hostMatches(host, d));
  }

  function isIpHost(host) {
    return /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || /^\[[0-9a-f:]+\]$/i.test(host);
  }

  /* ---------- Parser URL yang toleran ---------- */
  function parseUrl(raw) {
    let value = textOf(raw).replace(/^[<"'\s]+|[>"'\s.,;)]+$/g, '');
    if (!value) return null;

    if (/^[a-z][a-z0-9+.-]*:/i.test(value) && !/^https?:/i.test(value)) {
      const scheme = value.split(':')[0].toLowerCase();
      return { schemeError: scheme, original: value };
    }

    const candidate = /^https?:\/\//i.test(value) ? value : 'https://' + value;
    try {
      const url = new URL(candidate);
      if (!url.hostname || !url.hostname.includes('.')) return null;
      return { url, original: value };
    } catch (_) {
      return null;
    }
  }

  /* =========================================================
     ANALISIS LINK
     ========================================================= */
  function analyzeLink(raw) {
    const input = textOf(raw);

    if (!input) {
      return info('Belum ada link yang diperiksa', 'Tempelkan alamat link terlebih dahulu, lalu tekan "Analisis link".');
    }

    if (input.length > 2048) {
      return info('Link terlalu panjang', 'Alamat yang diperiksa melebihi 2.048 karakter. Potong menjadi bagian inti saja.');
    }

    const parsed = parseUrl(input);

    if (!parsed) {
      return {
        risk: 'caution',
        score: 30,
        title: 'Alamat tidak valid',
        summary: 'Format link tidak dikenali sebagai alamat web. Penipu memang sering menulis alamat dengan sengaja agar sulit dibaca.',
        flags: [{ severity: 'medium', text: 'Struktur link tidak valid atau tidak lengkap.' }],
        target: input.slice(0, 120),
        recommendations: [
          'Periksa ulang penulisan alamat dari sumber aslinya.',
          'Jangan membuka link yang formatnya aneh.'
        ]
      };
    }

    if (parsed.schemeError) {
      return {
        risk: 'danger',
        score: 95,
        title: 'Skema link berbahaya',
        summary: `Link memakai skema "${parsed.schemeError}:", yang bisa menjalankan kode di perangkat Anda.`,
        flags: [{ severity: 'high', text: `Skema "${parsed.schemeError}:" tidak wajar untuk sebuah situs.` }],
        target: parsed.original.slice(0, 120),
        recommendations: ['Tutup halaman ini tanpa mengklik apa pun.', 'Jalankan pemindaian perangkat jika sudah terlanjur dibuka.']
      };
    }

    const url = parsed.url;
    const host = url.hostname.toLowerCase().replace(/\.$/, '');
    const flags = [];
    let score = 0;

    const add = (severity, points, text) => {
      score += points;
      flags.push({ severity, text });
    };

    /* 1. Protokol */
    if (url.protocol === 'http:') {
      add('medium', 12, 'Koneksi tidak terenkripsi (http://) — data yang Anda ketik bisa disadap.');
    }

    /* 2. Host berupa IP */
    if (isIpHost(host)) {
      add('high', 50, 'Alamat tujuan berupa nomor IP, bukan nama domain yang bisa diverifikasi.');
    }

    /* 3. Punycode / karakter non-latin */
    if (host.includes('xn--')) {
      add('high', 50, 'Domain memakai punycode (xn--) — sering dipakai untuk meniru huruf situs asli.');
    }

    /* 4. Obfuscation dengan @ */
    if (/@/.test(url.href.replace(/^[a-z]+:\/\//i, '').split('/')[0])) {
      add('high', 45, 'Ada karakter "@" di bagian alamat — teks sebelum "@" bisa menipu, tujuan asli ada setelahnya.');
    }

    /* 5. TLD mencurigakan */
    const tld = host.split('.').pop();
    if (SUSPICIOUS_TLDS.includes(tld)) {
      add('medium', 25, `Domain berekstensi ".${tld}" sering dipakai kampanye phishing murah.`);
    }

    /* 6. Pemendek link */
    if (SHORTENERS.some((d) => hostMatches(host, d))) {
      add('medium', 20, 'Ini layanan pemendek link — alamat tujuan aslinya tersembunyi.');
    }

    /* 7. Impersonasi merek */
    const labels = host.split('.');
    const brandHits = [];
    Object.keys(BRANDS).forEach((brand) => {
      const labelIndex = labels.findIndex(
        (label) => label === brand || label.startsWith(brand + '-') || label.endsWith('-' + brand)
      );
      if (labelIndex === -1) return;
      const official = BRANDS[brand].some((d) => hostMatches(host, d));
      if (!official) brandHits.push({ brand, labelIndex });
    });
    if (brandHits.length) {
      add('high', 45, `Nama merek "${brandHits[0].brand}" dipakai, tetapi domainnya bukan domain resmi.`);
      if (brandHits.some((hit) => hit.labelIndex < labels.length - 2)) {
        add('high', 25, 'Nama merek diletakkan sebagai subdomain — pola khas link penipuan.');
      }
    }

    /* 8. Struktur host */
    if (labels.length >= 5) {
      add('medium', 15, `Subdomain bertingkat tidak wajar (${labels.length} bagian) — ciri umum link phishing.`);
    }
    if ((host.match(/-/g) || []).length >= 2) {
      add('low', 10, 'Domain mengandung banyak tanda hubung, pola yang sering dipakai domain tiruan.');
    }
    if (host.length > 40) {
      add('low', 8, 'Nama domain sangat panjang dan sulit dibaca sekilas.');
    }

    /* 9. Path provokatif */
    const path = (url.pathname + url.search).toLowerCase();
    const bait = ['login', 'verifikasi', 'verify', 'otp', 'akun', 'hadiah', 'klaim', 'pulsa', 'menang', 'bonus', 'unlock', 'pulihkan', 'reset'];
    const baitHit = bait.find((word) => path.includes(word));
    if (baitHit) {
      add('medium', 20, `Alamat memuat kata "${baitHit}", sering dipakai halaman palsu pencuri data.`);
    }

    /* 10. Karakter terenkode */
    if (/%25|%00|%2f%2f/i.test(url.href)) {
      add('medium', 15, 'Terdapat karakter terenkode ganda — upaya menyamarkan alamat asli.');
    }

    /* 11. Port tidak lazim */
    if (url.port && url.port !== '80' && url.port !== '443') {
      add('medium', 12, `Memakai port tidak lazim (${url.port}).`);
    }

    /* 12. Domain terpercaya -> turunkan skor */
    const trusted = isTrusted(host);
    if (trusted) {
      score = Math.max(0, score - 25);
    }

    score = clamp(score);
    let risk = trusted && score < 15 ? 'safe' : levelFromScore(score);
    /* Jangan pernah menyebut "aman" bila masih ada indikator yang perlu diperiksa. */
    if (risk === 'safe' && flags.length > 0) risk = 'caution';

    const recommendations = buildLinkRecommendations(risk, flags, trusted);

    return {
      risk,
      score,
      title: titleFor(risk),
      summary: summaryFor(risk, trusted),
      flags,
      target: host + (url.pathname !== '/' ? url.pathname : ''),
      recommendations
    };
  }

  function buildLinkRecommendations(risk, flags, trusted) {
    if (risk === 'safe') {
      return [
        'Domain ini tidak menunjukkan pola risiko umum, tetapi bukan jaminan aman.',
        'Tetap periksa apakah Anda memang sedang menghubungi situs tersebut.',
        'Jangan pernah memasukkan kode OTP di halaman mana pun.'
      ];
    }
    const recs = ['Jangan masukkan kata sandi, PIN, atau kode OTP di halaman tersebut.'];
    if (flags.some((f) => /pemendek|@/.test(f.text))) {
      recs.push('Buka layanan pemeriksa link untuk melihat alamat tujuan aslinya.');
    }
    if (risk === 'danger') {
      recs.push('Tutup halaman sekarang dan laporkan link ke AduanKonten.id.');
      recs.push('Jika sudah mengisi data, segera ganti kata sandi dan hubungi bank.');
    } else {
      recs.push('Verifikasi alamat lewat aplikasi atau situs resmi yang Anda buka sendiri.');
      recs.push('Laporkan ke AduanKonten.id bila link diterima dari orang tak dikenal.');
    }
    if (flags.length === 0) recs.push('Tidak ada pola mencurigakan yang terdeteksi, namun tetap berhati-hati.');
    return recs;
  }

  /* =========================================================
     ANALISIS PESAN
     ========================================================= */
  function analyzeMessage(raw) {
    const input = textOf(raw);

    if (!input) {
      return info('Belum ada pesan yang diperiksa', 'Tempelkan isi SMS, WhatsApp, atau email yang mencurigakan.');
    }

    if (input.length < 8) {
      return info('Pesan terlalu pendek', 'Tambahkan isi pesan yang lebih lengkap agar bisa dianalisis.');
    }

    const text = input.toLowerCase();
    const flags = [];
    let score = 0;

    const add = (severity, points, text) => {
      score += points;
      flags.push({ severity, text });
    };

    const find = (words) => hits(words, text);

    /* 1. Kredensial */
    const cred = find(CREDENTIAL_WORDS);
    if (cred.length) {
      add('high', 70, `Meminta data rahasia: "${cred[0]}". Tidak ada pihak resmi yang meminta ini lewat pesan.`);
    }

    /* 2. Ancaman / tenggat */
    const threat = find(THREAT_WORDS);
    if (threat.length) {
      add('high', 30, `Menekan dengan ancaman: "${threat[0]}".`);
    }
    const urgent = find(URGENCY_WORDS);
    if (urgent.length) {
      add('medium', 15, `Mendesak agar cepat bertindak: "${urgent[0]}".`);
    }

    /* 3. Hadiah */
    const prize = find(PRIZE_WORDS);
    if (prize.length) {
      add('high', 40, `Menjanjikan hadiah atau keuntungan: "${prize[0]}".`);
    }

    /* 4. Uang */
    const money = find(MONEY_WORDS);
    if (money.length) {
      add('medium', 18, `Menyangkut permintaan uang atau transfer: "${money[0]}".`);
    }

    /* 5. Link di dalam pesan */
    const urlMatch = input.match(/(https?:\/\/[^\s]+|www\.[^\s]+|\b[a-z0-9-]+\.(?:com|id|net|org|xyz|top|link|click|site|online|info|biz|me|co|ly|gl|io|app|shop)(?:\/[^\s]*)?)/i);
    if (urlMatch) {
      const inner = analyzeLink(urlMatch[0]);
      if (inner.risk === 'danger') {
        add('high', 30, `Mengandung link berisiko tinggi (${inner.target}).`);
      } else if (inner.risk === 'warning') {
        add('medium', 18, `Mengandung link mencurigakan (${inner.target}).`);
      } else if (inner.risk === 'caution') {
        add('low', 8, `Mengandung link yang perlu diperiksa (${inner.target}).`);
      }
    }

    /* 6. Menyebut merek / instansi */
    const brandHit = Object.keys(BRANDS).find((brand) =>
      new RegExp('\\b' + escapeRegExp(brand) + '\\b', 'i').test(text)
    );
    if (brandHit) {
      add('low', 10, `Mengatasnamakan "${brandHit}". Cocokkan hanya lewat aplikasi resmi.`);
    }

    /* 7. Nomor telepon / rekening */
    if (/\b\d{10,16}\b/.test(text)) {
      add('medium', 14, 'Mencantumkan nomor panjang — bisa berupa nomor rekening atau nomor pengirim.');
    }

    /* 8. Gaya penulisan */
    const letters = input.replace(/[^A-Za-z]/g, '');
    if (letters.length > 20) {
      const caps = letters.replace(/[^A-Z]/g, '').length;
      if (caps / letters.length > 0.5) {
        add('low', 8, 'Banyak huruf kapital — dipakai untuk membangun rasa panik.');
      }
    }
    if (/\b(klik disini|transferan|segerah|hati-hati|dgn|yg)\b/i.test(text)) {
      add('low', 5, 'Ada kesalahan ejaan yang umum pada pesan penipuan massal.');
    }
    if ((input.match(/!{2,}|\?{2,}/g) || []).length) {
      add('low', 4, 'Tanda baca berlebihan untuk menekan emosi penerima.');
    }

    score = clamp(score);
    const risk = levelFromScore(score);

    return {
      risk,
      score,
      title: titleFor(risk),
      summary: summaryFor(risk, false, 'message'),
      flags,
      target: input.slice(0, 90) + (input.length > 90 ? '…' : ''),
      recommendations: buildMessageRecommendations(risk, flags)
    };
  }

  function buildMessageRecommendations(risk, flags) {
    const recs = ['Jangan membalas pesan dan jangan mengklik link di dalamnya.'];
    if (flags.some((f) => /data rahasia|kode|otp/i.test(f.text))) {
      recs.push('Jika Anda sudah mengirim kode OTP, segera ganti kata sandi dan hubungi layanan terkait.');
    }
    if (flags.some((f) => /uang|transfer|rekening/i.test(f.text))) {
      recs.push('Verifikasi lewat panggilan suara ke nomor yang Anda percaya, bukan nomor di pesan.');
    }
    recs.push('Blokir dan laporkan pengirim.');
    if (risk === 'danger') {
      recs.push('Laporkan nomor/rekening pelaku ke CekRekening.id dan aduankonten.id.');
    }
    return recs;
  }

  function titleFor(risk) {
    return {
      danger: 'Berisiko tinggi',
      warning: 'Waspada',
      caution: 'Perlu hati-hati',
      safe: 'Tidak ditemukan pola risiko',
      info: 'Informasi'
    }[risk] || 'Hasil pemeriksaan';
  }

  function summaryFor(risk, trusted, kind) {
    if (risk === 'safe') {
      return trusted
        ? 'Domain ini termasuk daftar yang dikenal. Tetap pastikan Anda membukanya dari sumber resmi.'
        : 'Tidak ada pola risiko umum yang terdeteksi. Ini bukan jaminan keamanan.';
    }
    if (risk === 'danger') {
      return kind === 'message'
        ? 'Pesan ini memuat beberapa ciri kuat penipuan. Jangan ditindaklanjuti.'
        : 'Link ini menunjukkan beberapa ciri kuat phishing. Jangan dibuka lebih jauh.';
    }
    if (risk === 'warning') {
      return 'Ada beberapa tanda mencurigakan. Verifikasi lewat kanal resmi sebelum bertindak.';
    }
    return 'Sebagian besar aman, tetapi ada detail yang perlu Anda periksa sendiri.';
  }

  function info(title, summary) {
    return { risk: 'info', score: 0, title, summary, flags: [], target: '', recommendations: [] };
  }

  IRK.analyzer = {
    analyzeLink,
    analyzeMessage,
    /* diekspor untuk pengujian */
    _internal: { parseUrl, levelFromScore, hostMatches, isTrusted, SUSPICIOUS_TLDS, SHORTENERS, BRANDS }
  };
})(typeof window !== 'undefined' ? window : globalThis);
