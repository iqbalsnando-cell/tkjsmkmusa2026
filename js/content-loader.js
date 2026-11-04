// ============================================================
//  CONTENT LOADER - Memuat data dari Firestore ke website
// ============================================================

(function () {
  if (!initFirebase()) return;

  async function loadContent() {
    try {
      const doc = await db.collection('content').doc('main').get();
      if (!doc.exists) {
        console.log('[TJKT] Belum ada data di Firestore. Gunakan Admin Dashboard → Seed Data Default.');
        return;
      }
      const data = doc.data();

      // Background & Logo
      if (data.backgroundUrl) {
        const bg = document.querySelector('.bg-fixed');
        if (bg) bg.style.backgroundImage = `url('${data.backgroundUrl}')`;
      }
      if (data.logoUrl) {
        document.querySelectorAll('img[src*="logo-tjkt"]').forEach(img => {
          img.src = data.logoUrl;
        });
      }

      // Hero
      if (data.hero) {
        const h = data.hero;
        const badge = document.querySelector('.hero-badge');
        if (badge && h.badge) badge.textContent = h.badge;

        const title = document.querySelector('.hero-copy h1');
        if (title && h.title) {
          // Keep structure with <span> if possible
          title.innerHTML = h.title.replace(/XII TJKT/gi, '<span>XII TJKT</span>');
        }

        const sub = document.querySelector('.hero-sub');
        if (sub && h.sub) sub.textContent = h.sub;

        const motto = document.querySelector('.hero-motto');
        if (motto && h.motto) motto.textContent = h.motto;
      }

      // Features
      if (data.features && data.features.length) {
        const cards = document.querySelectorAll('.hero-features .feature');
        data.features.forEach((f, i) => {
          if (cards[i]) {
            const h3 = cards[i].querySelector('h3');
            const p = cards[i].querySelector('p');
            if (h3 && f.title) h3.textContent = f.title;
            if (p && f.desc) p.textContent = f.desc;
          }
        });
      }

      // About
      if (data.about) {
        const a = data.about;
        const aboutH2 = document.querySelector('#tentang h2');
        if (aboutH2 && a.title) aboutH2.textContent = a.title;
        const aboutDesc = document.querySelector('#tentang .section-desc');
        if (aboutDesc && a.desc) aboutDesc.textContent = a.desc;

        if (a.stats) {
          const stats = document.querySelectorAll('#tentang .stat-card');
          a.stats.forEach((s, i) => {
            if (stats[i]) {
              const strong = stats[i].querySelector('strong');
              const span = stats[i].querySelector('span');
              if (strong && s.num) strong.textContent = s.num;
              if (span && s.label) span.textContent = s.label;
            }
          });
        }
      }

      // Struktur
      if (data.struktur) {
        const s = data.struktur;
        updateOrgCard('Wali Kelas', s.wali);
        updateOrgCard('Ketua Kelas', s.ketua);
        updateOrgCard('Wakil Ketua 1', s.wakil1);
        updateOrgCard('Wakil Ketua 2', s.wakil2);
        updateOrgCard('Sekretaris 1', s.sek1);
        updateOrgCard('Sekretaris 2', s.sek2);
        updateOrgCard('Bendahara 1', s.ben1);
        updateOrgCard('Bendahara 2', s.ben2);
      }

      // Rules
      if (data.rules && data.rules.length) {
        const ul = document.querySelector('.rules-list');
        if (ul) {
          ul.innerHTML = data.rules.map(r => `<li>${escapeHtml(r)}</li>`).join('');
        }
      }

      // Birthday
      if (data.birthday && data.birthday.length) {
        const grid = document.querySelector('.bday-grid');
        if (grid) {
          grid.innerHTML = data.birthday.map(b =>
            `<div class="bday-item"><strong>${escapeHtml(b.nama)}</strong><span>${escapeHtml(b.tanggal)}</span></div>`
          ).join('');
        }
      }

      // FAQ
      if (data.faq && data.faq.length) {
        const faqSection = document.querySelector('#faq');
        if (faqSection) {
          // Find the details container
          let container = faqSection.querySelector('.faq-list') || faqSection;
          // Rebuild details
          const existing = faqSection.querySelectorAll('details');
          if (existing.length) {
            const parent = existing[0].parentElement;
            parent.innerHTML = data.faq.map(f => `
              <details>
                <summary>${escapeHtml(f.q)}</summary>
                <p>${escapeHtml(f.a)}</p>
              </details>
            `).join('');
          }
        }
      }

      // Sosmed
      if (data.sosmed) {
        const s = data.sosmed;
        const cards = document.querySelectorAll('#sosmed .social-card');
        if (cards[0] && s.igUsername) {
          const title = cards[0].querySelector('.card-title');
          if (title) title.textContent = s.igUsername;
          const link = cards[0].querySelector('a.btn');
          if (link && s.igUrl) link.href = s.igUrl;
        }
        if (cards[1] && s.waTitle) {
          const title = cards[1].querySelector('.card-title');
          if (title) title.textContent = s.waTitle;
          const link = cards[1].querySelector('a.btn');
          if (link && s.waUrl) link.href = s.waUrl;
        }
      }

      // Gallery from Firestore
      await loadGallery();
      // Album from Firestore
      await loadAlbum();

      console.log('[TJKT] Konten berhasil dimuat dari Firebase');
    } catch (err) {
      console.error('[TJKT] Gagal memuat konten:', err);
    }
  }

  function updateOrgCard(label, person) {
    if (!person || !person.nama) return;
    const labels = document.querySelectorAll('.card-label');
    labels.forEach(el => {
      if (el.textContent.trim() === label) {
        const card = el.closest('.org-card') || el.parentElement;
        const title = card.querySelector('.card-title');
        const avatar = card.querySelector('.org-avatar');
        if (title) title.textContent = person.nama;
        if (avatar && person.inisial) avatar.textContent = person.inisial;
      }
    });
  }

  async function loadGallery() {
    try {
      const snap = await db.collection('gallery').orderBy('order').get();
      if (snap.empty) return;

      const track = document.querySelector('#gallery .g-track') || document.querySelector('#gallery');
      if (!track) return;

      // Find the slides container
      const slides = document.querySelectorAll('#gallery .g-slide');
      if (slides.length === 0) return;

      const parent = slides[0].parentElement;
      parent.innerHTML = '';

      snap.docs.forEach((doc, i) => {
        const d = doc.data();
        const div = document.createElement('div');
        div.className = 'g-slide';
        div.innerHTML = `
          <div class="g-card">
            <img src="${d.url}" alt="${escapeHtml(d.caption || 'Galeri')}" loading="lazy"
                 onerror="this.style.display='none'">
            <div class="g-meta">
              <strong>${escapeHtml(d.caption || 'Foto ' + (i + 1))}</strong>
              <small>galeri</small>
            </div>
          </div>
        `;
        parent.appendChild(div);
      });

      // Trigger re-init if gallery script exists
      if (typeof window.initGallery === 'function') window.initGallery();
    } catch (e) {
      console.warn('Gallery load:', e.message);
    }
  }

  async function loadAlbum() {
    try {
      const snap = await db.collection('album').orderBy('order').get();
      if (snap.empty) return;

      const slides = document.querySelectorAll('#album-slider .album-slide, #album .album-slide');
      if (slides.length === 0) return;

      const parent = slides[0].parentElement;
      parent.innerHTML = '';

      snap.docs.forEach((doc, i) => {
        const d = doc.data();
        const div = document.createElement('div');
        div.className = 'album-slide';
        div.innerHTML = `
          <div class="album-card">
            <img src="${d.url}" alt="${escapeHtml(d.caption || 'Album')}" loading="lazy"
                 onerror="this.style.display='none'">
            <div class="album-meta">
              <strong>${escapeHtml(d.caption || 'Foto ' + (i + 1))}</strong>
            </div>
          </div>
        `;
        parent.appendChild(div);
      });
    } catch (e) {
      console.warn('Album load:', e.message);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Run after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadContent);
  } else {
    loadContent();
  }
})();
