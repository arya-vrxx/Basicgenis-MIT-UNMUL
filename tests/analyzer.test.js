/* Uji mesin analisis tanpa dependensi.
   Jalankan: node tests/analyzer.test.js
*/
'use strict';

require('../js/analyzer.js');
const { analyzeLink, analyzeMessage } = globalThis.IRK.analyzer;

let pass = 0;
let fail = 0;

function check(name, condition, detail) {
  if (condition) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    console.log(`  FAIL  ${name}${detail ? ' -> ' + detail : ''}`);
  }
}

function expectRisk(name, input, expected, fn = analyzeLink) {
  const res = fn(input);
  check(name, res.risk === expected, `dapat "${res.risk}" (skor ${res.score})`);
}

console.log('\n== Analisis link ==');
expectRisk('link kosong -> info', '', 'info');
expectRisk('domain resmi BCA -> aman', 'https://www.bca.co.id/id/', 'safe');
expectRisk('http tanpa enkripsi tetap dinilai', 'http://example.com', 'caution');
expectRisk('domain tiruan + TLD murah -> bahaya', 'http://bca-login.verifikasi.xyz/akun', 'danger');
expectRisk('host berupa IP -> bahaya', 'https://192.168.1.10/login', 'danger');
expectRisk('pemendek link -> minimal waspada', 'https://bit.ly/3xAbCd', 'caution');
expectRisk('skema javascript -> bahaya', 'javascript:alert(1)', 'danger');
expectRisk('punycode -> bahaya', 'https://xn--80ak6aa92e.com/login', 'danger');
expectRisk('subdomain merek palsu -> bahaya', 'https://instagram.com.secure-login.net/', 'danger');
expectRisk('google resmi -> aman', 'https://accounts.google.com/signin', 'safe');

const ipRes = analyzeLink('https://192.168.1.10/login');
check('IP menghasilkan flag high', ipRes.flags.some((f) => f.severity === 'high'));

const dashRes = analyzeLink('https://bca-login.verifikasi.xyz/akun');
check('impersonasi merek terdeteksi', dashRes.flags.some((f) => /merek/i.test(f.text)));
check('skor terbatas 0-100', dashRes.score <= 100 && dashRes.score >= 0);

console.log('\n== Analisis pesan ==');
expectRisk('pesan kosong -> info', '', 'info', analyzeMessage);
expectRisk('permintaan OTP -> bahaya', 'Halo, ini CS Bank. Mohon kirim kode OTP 6 digit yang baru masuk ya, segera.', 'danger', analyzeMessage);
expectRisk('hadiah + link aneh -> bahaya', 'Selamat anda menang undian! Klaim hadiah di http://hadiah-pulsa.xyz/klaim sekarang', 'danger', analyzeMessage);
expectRisk('chat biasa -> aman', 'Oke besok kita rapat jam 9 di ruang kelas ya', 'safe', analyzeMessage);
expectRisk('pinjam uang tanpa link -> minimal hati-hati',
  'Bisa pinjam uang 500 ribu? Transfer ke rekening 1234567890 segera ya', 'warning', analyzeMessage);

const otpRes = analyzeMessage('Kirim kode OTP anda sekarang juga');
check('pesan OTP punya rekomendasi pemulihan',
  otpRes.recommendations.some((r) => /kata sandi/i.test(r)));

console.log(`\nHasil: ${pass} lulus, ${fail} gagal\n`);
process.exit(fail === 0 ? 0 : 1);
