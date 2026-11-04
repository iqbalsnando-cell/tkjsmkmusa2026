// ============================================================
//  ADMIN DASHBOARD LOGIC
// ============================================================

let contentData = {};
let rulesArr = [];
let birthdayArr = [];
let faqArr = [];
let galleryItems = [];
let albumItems = [];

// ---------- Helpers ----------
function showLoading(v) {
  document.getElementById('loading').classList.toggle('show', v);
}
function toast(msg, isError = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => el.classList.remove('show'), 2800);
}
function $(id) { return document.getElementById(id); }

// ---------- Auth ----------
initFirebase();

auth.onAuthStateChanged(user => {
  if (user) {
    $('loginScreen').style.display = 'none';
    $('dashboard').style.display = 'block';
    loadAllData();
  } else {
    $('loginScreen').style.display = 'flex';
    $('dashboard').style.display = 'none';
  }
});

$('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('loginBtn');
  const err = $('loginError');
  btn.disabled = true;
  btn.textContent = 'Masuk...';
  err.classList.remove('show');
  try {
    await auth.signInWithEmailAndPassword($('email').value.trim(), $('password').value);
  } catch (error) {
    err.textContent = error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password'
      ? 'Email atau password salah.'
      : error.message;
    err.classList.add('show');
  }
  btn.disabled = false;
  btn.textContent = 'Masuk';
});

$('logoutBtn').addEventListener('click', () => auth.signOut());

// ---------- Navigation ----------
document.querySelectorAll('.nav-item[data-panel]').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    $('panel-' + item.dataset.panel).classList.add('active');
    $('sidebar').classList.remove('open');
  });
});
$('menuToggle').addEventListener('click', () => $('sidebar').classList.toggle('open'));

// ---------- Load Data ----------
async function loadAllData() {
  showLoading(true);
  try {
    const doc = await db.collection('content').doc('main').get();
    if (doc.exists) {
      contentData = doc.data();
      fillHeroForm();
      fillStrukturForm();
      fillSosmedForm();
      rulesArr = contentData.rules || [];
      birthdayArr = contentData.birthday || [];
      faqArr = contentData.faq || [];
      renderRules();
      renderBirthday();
      renderFaq();
    }

    // Gallery
    const gSnap = await db.collection('gallery').orderBy('order').get();
    galleryItems = gSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderGallery();

    // Album
    const aSnap = await db.collection('album').orderBy('order').get();
    albumItems = aSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderAlbum();
  } catch (e) {
    console.error(e);
    toast('Gagal memuat data: ' + e.message, true);
  }
  showLoading(false);
}

// ---------- Fill Forms ----------
function fillHeroForm() {
  const h = contentData.hero || {};
  const a = contentData.about || {};
  const f = contentData.features || [];
  $('heroBadge').value = h.badge || '';
  $('heroTitle').value = h.title || '';
  $('heroSub').value = h.sub || '';
  $('heroMotto').value = h.motto || '';
  for (let i = 0; i < 4; i++) {
    $('feat' + (i+1) + 'Title').value = (f[i] && f[i].title) || '';
    $('feat' + (i+1) + 'Desc').value = (f[i] && f[i].desc) || '';
  }
  $('aboutTitle').value = a.title || '';
  $('aboutDesc').value = a.desc || '';
  const s = a.stats || [];
  for (let i = 0; i < 4; i++) {
    $('stat' + (i+1) + 'Num').value = (s[i] && s[i].num) || '';
    $('stat' + (i+1) + 'Label').value = (s[i] && s[i].label) || '';
  }
}

function fillStrukturForm() {
  const s = contentData.struktur || {};
  const set = (id, val) => { if ($(id)) $(id).value = val || ''; };
  set('waliNama', s.wali?.nama); set('waliInisial', s.wali?.inisial);
  set('ketuaNama', s.ketua?.nama); set('ketuaInisial', s.ketua?.inisial);
  set('wakil1Nama', s.wakil1?.nama); set('wakil1Inisial', s.wakil1?.inisial);
  set('wakil2Nama', s.wakil2?.nama); set('wakil2Inisial', s.wakil2?.inisial);
  set('sek1Nama', s.sek1?.nama); set('sek1Inisial', s.sek1?.inisial);
  set('sek2Nama', s.sek2?.nama); set('sek2Inisial', s.sek2?.inisial);
  set('ben1Nama', s.ben1?.nama); set('ben1Inisial', s.ben1?.inisial);
  set('ben2Nama', s.ben2?.nama); set('ben2Inisial', s.ben2?.inisial);
}

function fillSosmedForm() {
  const s = contentData.sosmed || {};
  $('igUsername').value = s.igUsername || '';
  $('igUrl').value = s.igUrl || '';
  $('waTitle').value = s.waTitle || '';
  $('waUrl').value = s.waUrl || '';
}

// ---------- Save Functions ----------
async function saveHero() {
  showLoading(true);
  try {
    const features = [];
    for (let i = 1; i <= 4; i++) {
      features.push({
        title: $('feat' + i + 'Title').value.trim(),
        desc: $('feat' + i + 'Desc').value.trim()
      });
    }
    const stats = [];
    for (let i = 1; i <= 4; i++) {
      stats.push({
        num: $('stat' + i + 'Num').value.trim(),
        label: $('stat' + i + 'Label').value.trim()
      });
    }
    await db.collection('content').doc('main').set({
      hero: {
        badge: $('heroBadge').value.trim(),
        title: $('heroTitle').value.trim(),
        sub: $('heroSub').value.trim(),
        motto: $('heroMotto').value.trim()
      },
      features,
      about: {
        title: $('aboutTitle').value.trim(),
        desc: $('aboutDesc').value.trim(),
        stats
      }
    }, { merge: true });
    toast('Hero & Tentang berhasil disimpan');
  } catch (e) {
    toast(e.message, true);
  }
  showLoading(false);
}

async function saveStruktur() {
  showLoading(true);
  try {
    const get = (id) => $(id).value.trim();
    await db.collection('content').doc('main').set({
      struktur: {
        wali: { nama: get('waliNama'), inisial: get('waliInisial') },
        ketua: { nama: get('ketuaNama'), inisial: get('ketuaInisial') },
        wakil1: { nama: get('wakil1Nama'), inisial: get('wakil1Inisial') },
        wakil2: { nama: get('wakil2Nama'), inisial: get('wakil2Inisial') },
        sek1: { nama: get('sek1Nama'), inisial: get('sek1Inisial') },
        sek2: { nama: get('sek2Nama'), inisial: get('sek2Inisial') },
        ben1: { nama: get('ben1Nama'), inisial: get('ben1Inisial') },
        ben2: { nama: get('ben2Nama'), inisial: get('ben2Inisial') }
      }
    }, { merge: true });
    toast('Struktur berhasil disimpan');
  } catch (e) {
    toast(e.message, true);
  }
  showLoading(false);
}

async function saveSosmed() {
  showLoading(true);
  try {
    await db.collection('content').doc('main').set({
      sosmed: {
        igUsername: $('igUsername').value.trim(),
        igUrl: $('igUrl').value.trim(),
        waTitle: $('waTitle').value.trim(),
        waUrl: $('waUrl').value.trim()
      }
    }, { merge: true });
    toast('Media sosial berhasil disimpan');
  } catch (e) {
    toast(e.message, true);
  }
  showLoading(false);
}

// ---------- Rules ----------
function renderRules() {
  const box = $('rulesList');
  box.innerHTML = rulesArr.map((r, i) => `
    <div class="list-item">
      <div class="info"><strong>${escapeHtml(r)}</strong></div>
      <div class="btns">
        <button class="btn btn-sm btn-outline" onclick="editRule(${i})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="delRule(${i})">Hapus</button>
      </div>
    </div>
  `).join('') || '<p style="color:var(--muted)">Belum ada rules.</p>';
}
function addRule() {
  const t = prompt('Tulis rule baru (contoh: ❌ Berbicara kasar)');
  if (t && t.trim()) { rulesArr.push(t.trim()); renderRules(); }
}
function editRule(i) {
  const t = prompt('Edit rule:', rulesArr[i]);
  if (t !== null) { rulesArr[i] = t.trim(); renderRules(); }
}
function delRule(i) {
  if (confirm('Hapus rule ini?')) { rulesArr.splice(i, 1); renderRules(); }
}
async function saveRules() {
  showLoading(true);
  try {
    await db.collection('content').doc('main').set({ rules: rulesArr }, { merge: true });
    toast('Rules berhasil disimpan');
  } catch (e) { toast(e.message, true); }
  showLoading(false);
}

// ---------- Birthday ----------
function renderBirthday() {
  const box = $('birthdayList');
  box.innerHTML = birthdayArr.map((b, i) => `
    <div class="list-item">
      <div class="info"><strong>${escapeHtml(b.nama)}</strong><span>${escapeHtml(b.tanggal)}</span></div>
      <div class="btns">
        <button class="btn btn-sm btn-outline" onclick="editBirthday(${i})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="delBirthday(${i})">Hapus</button>
      </div>
    </div>
  `).join('') || '<p style="color:var(--muted)">Belum ada data birthday.</p>';
}
function addBirthday() {
  const nama = prompt('Nama:');
  if (!nama) return;
  const tanggal = prompt('Tanggal (contoh: 11 Januari):');
  if (!tanggal) return;
  birthdayArr.push({ nama: nama.trim(), tanggal: tanggal.trim() });
  renderBirthday();
}
function editBirthday(i) {
  const nama = prompt('Nama:', birthdayArr[i].nama);
  if (nama === null) return;
  const tanggal = prompt('Tanggal:', birthdayArr[i].tanggal);
  if (tanggal === null) return;
  birthdayArr[i] = { nama: nama.trim(), tanggal: tanggal.trim() };
  renderBirthday();
}
function delBirthday(i) {
  if (confirm('Hapus data ini?')) { birthdayArr.splice(i, 1); renderBirthday(); }
}
async function saveBirthday() {
  showLoading(true);
  try {
    await db.collection('content').doc('main').set({ birthday: birthdayArr }, { merge: true });
    toast('Birthday berhasil disimpan');
  } catch (e) { toast(e.message, true); }
  showLoading(false);
}

// ---------- FAQ ----------
function renderFaq() {
  const box = $('faqList');
  box.innerHTML = faqArr.map((f, i) => `
    <div class="list-item" style="flex-direction:column;align-items:stretch">
      <div class="info" style="margin-bottom:8px">
        <strong>Q: ${escapeHtml(f.q)}</strong>
        <span style="display:block;margin-top:4px">A: ${escapeHtml(f.a)}</span>
      </div>
      <div class="btns">
        <button class="btn btn-sm btn-outline" onclick="editFaq(${i})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="delFaq(${i})">Hapus</button>
      </div>
    </div>
  `).join('') || '<p style="color:var(--muted)">Belum ada FAQ.</p>';
}
function addFaq() {
  const q = prompt('Pertanyaan:');
  if (!q) return;
  const a = prompt('Jawaban:');
  if (!a) return;
  faqArr.push({ q: q.trim(), a: a.trim() });
  renderFaq();
}
function editFaq(i) {
  const q = prompt('Pertanyaan:', faqArr[i].q);
  if (q === null) return;
  const a = prompt('Jawaban:', faqArr[i].a);
  if (a === null) return;
  faqArr[i] = { q: q.trim(), a: a.trim() };
  renderFaq();
}
function delFaq(i) {
  if (confirm('Hapus FAQ ini?')) { faqArr.splice(i, 1); renderFaq(); }
}
async function saveFaq() {
  showLoading(true);
  try {
    await db.collection('content').doc('main').set({ faq: faqArr }, { merge: true });
    toast('FAQ berhasil disimpan');
  } catch (e) { toast(e.message, true); }
  showLoading(false);
}

// ---------- Gallery & Album Upload ----------
function setupUpload(zoneId, inputId, type) {
  const zone = $(zoneId);
  const input = $(inputId);
  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files, type);
  });
  input.addEventListener('change', () => handleFiles(input.files, type));
}
setupUpload('galeriUploadZone', 'galeriInput', 'gallery');
setupUpload('albumUploadZone', 'albumInput', 'album');

async function handleFiles(files, type) {
  if (!files.length) return;
  showLoading(true);
  const caption = type === 'gallery' ? $('galeriCaption').value.trim() : $('albumCaption').value.trim();
  const col = type === 'gallery' ? 'gallery' : 'album';
  const current = type === 'gallery' ? galleryItems : albumItems;

  try {
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) {
        toast(file.name + ' terlalu besar (max 5MB)', true);
        continue;
      }
      const name = Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const ref = storage.ref(type + '/' + name);
      await ref.put(file);
      const url = await ref.getDownloadURL();
      const order = current.length;
      const docRef = await db.collection(col).add({
        url,
        caption: caption || file.name,
        order,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      current.push({ id: docRef.id, url, caption: caption || file.name, order });
    }
    if (type === 'gallery') renderGallery();
    else renderAlbum();
    toast('Foto berhasil diupload');
    if (type === 'gallery') $('galeriCaption').value = '';
    else $('albumCaption').value = '';
  } catch (e) {
    console.error(e);
    toast('Upload gagal: ' + e.message, true);
  }
  showLoading(false);
}

function renderGallery() {
  $('galeriGrid').innerHTML = galleryItems.map(item => `
    <div class="img-item">
      <img src="${item.url}" alt="${escapeHtml(item.caption || '')}" loading="lazy">
      <div class="caption">${escapeHtml(item.caption || '')}</div>
      <div class="actions">
        <button class="btn btn-sm btn-danger" onclick="deleteImage('gallery','${item.id}','${item.url}')">Hapus</button>
      </div>
    </div>
  `).join('') || '<p style="color:var(--muted);grid-column:1/-1">Belum ada foto galeri. Upload di atas.</p>';
}

function renderAlbum() {
  $('albumGrid').innerHTML = albumItems.map(item => `
    <div class="img-item">
      <img src="${item.url}" alt="${escapeHtml(item.caption || '')}" loading="lazy">
      <div class="caption">${escapeHtml(item.caption || '')}</div>
      <div class="actions">
        <button class="btn btn-sm btn-danger" onclick="deleteImage('album','${item.id}','${item.url}')">Hapus</button>
      </div>
    </div>
  `).join('') || '<p style="color:var(--muted);grid-column:1/-1">Belum ada foto album. Upload di atas.</p>';
}

async function deleteImage(type, id, url) {
  if (!confirm('Hapus foto ini?')) return;
  showLoading(true);
  try {
    await db.collection(type).doc(id).delete();
    try {
      await storage.refFromURL(url).delete();
    } catch (_) {} // file mungkin sudah tidak ada
    if (type === 'gallery') {
      galleryItems = galleryItems.filter(i => i.id !== id);
      renderGallery();
    } else {
      albumItems = albumItems.filter(i => i.id !== id);
      renderAlbum();
    }
    toast('Foto dihapus');
  } catch (e) {
    toast(e.message, true);
  }
  showLoading(false);
}

// ---------- Logo & Background ----------
async function uploadLogo() {
  const file = $('logoInput').files[0];
  if (!file) return toast('Pilih file dulu', true);
  showLoading(true);
  try {
    const ref = storage.ref('assets/logo-tjkt.png');
    await ref.put(file);
    const url = await ref.getDownloadURL();
    await db.collection('content').doc('main').set({ logoUrl: url }, { merge: true });
    $('logoPreview').innerHTML = `<img src="${url}" style="height:48px;margin-top:8px">`;
    toast('Logo berhasil diupload');
  } catch (e) { toast(e.message, true); }
  showLoading(false);
}

async function uploadBackground() {
  const file = $('bgInput').files[0];
  if (!file) return toast('Pilih file dulu', true);
  showLoading(true);
  try {
    const ref = storage.ref('assets/background.jpg');
    await ref.put(file);
    const url = await ref.getDownloadURL();
    await db.collection('content').doc('main').set({ backgroundUrl: url }, { merge: true });
    toast('Background berhasil diupload');
  } catch (e) { toast(e.message, true); }
  showLoading(false);
}

// ---------- Seed Default Data ----------
async function seedDefaultData() {
  if (!confirm('Ini akan mengisi data default. Lanjutkan?')) return;
  showLoading(true);
  try {
    await db.collection('content').doc('main').set({
      hero: {
        badge: 'Teknologi • Kreativitas • Islam berkemajuan',
        title: 'Selamat Datang di Website XII TJKT',
        sub: 'SMK Muhammadiyah 1 Pringsewu',
        motto: 'Bersama membangun kompetensi, mengasah kreativitas, dan menyiapkan masa depan di dunia teknologi informasi dan komunikasi.'
      },
      features: [
        { title: 'Kompetensi TIK', desc: 'Menguasai jaringan, server, dan teknologi informasi.' },
        { title: 'Pembelajaran Terstruktur', desc: 'Materi sesuai standar industri dan kebutuhan dunia kerja.' },
        { title: 'Fasilitas Lengkap', desc: 'Lab komputer, jaringan, dan perangkat modern.' },
        { title: 'Siap Kerja & Kuliah', desc: 'Lulusan berkompeten, siap bersaing di era digital.' }
      ],
      about: {
        title: 'Tentang Kelas Kami',
        desc: 'Satu Tempat Seribu Cerita',
        stats: [
          { num: '41', label: 'Siswa Aktif' },
          { num: '3', label: 'Tahun Bersama' },
          { num: '16', label: 'Guru' },
          { num: '3', label: 'Bulan PKL' }
        ]
      },
      struktur: {
        wali: { nama: 'Juliana Istiqomah', inisial: 'JI' },
        ketua: { nama: 'Nando Iqbal Setyanto', inisial: 'AT' },
        wakil1: { nama: 'Imam Al Hafiz', inisial: 'IH' },
        wakil2: { nama: 'Syifa Talita Shaki', inisial: 'ST' },
        sek1: { nama: 'Fiko Anjeska', inisial: 'DY' },
        sek2: { nama: 'Rendra Tri Wardhana', inisial: 'RW' },
        ben1: { nama: 'Thalita', inisial: 'TH' },
        ben2: { nama: 'Vanikiara Jovinca Elvarani', inisial: 'VE' }
      },
      rules: [
        '❌ Berbicara kasar',
        '❌ Menghina & mengejek'
      ],
      birthday: [
        { nama: 'Afanda', tanggal: '11 Januari' },
        { nama: 'Umi', tanggal: '16 Januari' },
        { nama: 'Raihan', tanggal: '28 Januari' },
        { nama: 'Felisa', tanggal: '11 Februari' },
        { nama: 'Hendra', tanggal: '2 April' },
        { nama: 'Jaka', tanggal: '5 April' },
        { nama: 'Fiko', tanggal: '20 April' },
        { nama: 'Alfikry', tanggal: '20 April' },
        { nama: 'Aufa', tanggal: '23 April' },
        { nama: 'Areshi', tanggal: '12 Mei' },
        { nama: 'Syifa', tanggal: '18 Mei' },
        { nama: 'Faiz', tanggal: '24 Mei' },
        { nama: 'Dafa', tanggal: '1 Juni' },
        { nama: 'Queensha', tanggal: '1 Juni' },
        { nama: 'Reza', tanggal: '1 Juni' },
        { nama: 'Rafi', tanggal: '1 Juni' },
        { nama: 'Resyha', tanggal: '6 Juni' },
        { nama: 'Danang', tanggal: '20 Juni' },
        { nama: 'Salsa', tanggal: '25 Juni' },
        { nama: 'Thalita', tanggal: '29 Juni' },
        { nama: 'Aldo', tanggal: '12 Juli' },
        { nama: 'Ifan', tanggal: '14 Juli' },
        { nama: 'Riko', tanggal: '15 Juli' },
        { nama: 'Rista', tanggal: '23 Juli' },
        { nama: 'Puspita', tanggal: '2 Agustus' },
        { nama: 'Imam', tanggal: '7 Agustus' },
        { nama: 'Iqbal', tanggal: '10 Agustus' },
        { nama: 'Fatir', tanggal: '25 Agustus' },
        { nama: 'Rendra', tanggal: '1 September' },
        { nama: 'Rafa', tanggal: '6 September' },
        { nama: 'Kiara', tanggal: '19 September' },
        { nama: 'Dani', tanggal: '25 September' },
        { nama: 'Marcel', tanggal: '9 Oktober' },
        { nama: 'Okta', tanggal: '12 Oktober' },
        { nama: 'Safara', tanggal: '16 Oktober' },
        { nama: 'Avicena', tanggal: '19 Oktober' },
        { nama: 'Devina', tanggal: '21 Oktober' },
        { nama: 'Dian', tanggal: '28 Oktober' },
        { nama: 'Vivi', tanggal: '6 November' },
        { nama: 'Reyhan', tanggal: '4 Desember' },
        { nama: 'Rangga', tanggal: '21 Desember' },
        { nama: 'Dika', tanggal: '23 Desember' }
      ],
      faq: [
        {
          q: 'Bagaimana cara mengirim pesan atau kesan untuk kelas?',
          a: 'Gunakan tombol “Kirim Pesan” atau bagian Pesan di website untuk membuka halaman pengiriman pesan.'
        },
        {
          q: 'Bagaimana cara memperbarui foto galeri?',
          a: 'Masuk ke Admin Dashboard → menu Galeri, lalu upload foto baru. Foto langsung tampil di website.'
        }
      ],
      sosmed: {
        igUsername: '@xii_tejekatee',
        igUrl: 'https://www.instagram.com/xii_tejekatee',
        waTitle: 'Saluran WhatsApp XII TJKT',
        waUrl: 'https://whatsapp.com/channel/0029VbAd2UrBFLgM9Y4j3m1D'
      }
    }, { merge: true });

    // Juga seed gallery & album dari file lokal jika belum ada
    toast('Data default berhasil di-seed!');
    await loadAllData();
  } catch (e) {
    toast(e.message, true);
  }
  showLoading(false);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
