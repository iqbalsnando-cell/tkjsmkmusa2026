# Website XII TJKT + Admin Dashboard

Website resmi kelas **XII TJKT SMK Muhammadiyah 1 Pringsewu** dengan **Admin Dashboard** berbasis Firebase.

## Fitur Admin

- Login khusus admin (email + password)
- Edit teks Hero, Tentang, Struktur Kelas, Rules, Birthday, FAQ, Media Sosial
- Upload / hapus foto **Galeri** dan **Album**
- Upload logo & background
- Data langsung tampil di website publik

---

## Setup Firebase (WAJIB)

### 1. Buat Project Firebase
1. Buka [Firebase Console](https://console.firebase.google.com)
2. Buat project baru (atau pakai yang sudah ada)
3. Aktifkan **Authentication** → Sign-in method → **Email/Password** → Enable
4. Buat user admin:
   - Authentication → Users → Add user
   - Isi email + password yang akan dipakai login admin

### 2. Aktifkan Firestore
1. Build → Firestore Database → Create database
2. Pilih **Start in test mode** (nanti diganti rules)
3. Lokasi: `asia-southeast2` (Jakarta) atau yang terdekat

### 3. Aktifkan Storage
1. Build → Storage → Get started
2. Pilih rules test mode dulu

### 4. Ambil Config
1. Project Settings (ikon gear) → Your apps → Add web app (`</>`)
2. Copy object `firebaseConfig`
3. Buka file `js/firebase-config.js` dan ganti isinya

### 5. Atur Security Rules

**Firestore Rules** (Firestore → Rules):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Publik boleh baca
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Storage Rules** (Storage → Rules):
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Struktur Folder

```
tkj-website/
├── index.html          ← Website publik
├── admin.html          ← Dashboard admin
├── pesan.html          ← Halaman kirim pesan (tetap pakai Google Apps Script)
├── js/
│   ├── firebase-config.js
│   ├── admin.js
│   └── content-loader.js
├── assets/
│   ├── logo-tjkt.png
│   ├── background.jpg
│   ├── galeri/
│   └── album/
└── README.md
```

---

## Deploy ke Vercel

1. Upload folder `tkj-website` ke GitHub (buat repo baru)
2. Buka [vercel.com](https://vercel.com) → New Project → Import repo
3. Deploy (framework: Other / static)
4. Setelah live, buka: `https://domain-kamu.vercel.app/admin.html`

---

## Cara Pakai Admin

1. Buka `/admin.html`
2. Login dengan email & password yang dibuat di Firebase Auth
3. **Pertama kali**: masuk ke menu **Pengaturan** → klik **Seed Data Default**
4. Setelah itu edit konten sesuka hati, lalu **Simpan**
5. Upload foto di menu Galeri / Album
6. Website publik otomatis menampilkan data terbaru

---

## Catatan

- Pesan (messages) masih memakai Google Apps Script yang sudah ada sebelumnya.
- Foto yang diupload disimpan di Firebase Storage.
- Jangan commit `firebase-config.js` yang berisi API key ke repo publik jika tidak ingin (meski API key web Firebase relatif aman jika rules benar).
- Untuk production, perketat rules sesuai kebutuhan.
