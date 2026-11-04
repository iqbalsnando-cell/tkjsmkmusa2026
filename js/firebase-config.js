// ============================================================
//  FIREBASE CONFIG - GANTI DENGAN DATA PROJECT KAMU
// ============================================================
// Cara ambil:
// 1. Buka https://console.firebase.google.com
// 2. Pilih project → Project Settings (ikon gear)
// 3. Scroll ke "Your apps" → pilih Web app (atau buat baru)
// 4. Copy object firebaseConfig di bawah ini

const firebaseConfig = {
  apiKey: "GANTI_DENGAN_API_KEY_KAMU",
  authDomain: "GANTI_DENGAN_AUTH_DOMAIN.firebaseapp.com",
  projectId: "GANTI_DENGAN_PROJECT_ID",
  storageBucket: "GANTI_DENGAN_PROJECT_ID.appspot.com",
  messagingSenderId: "GANTI_DENGAN_SENDER_ID",
  appId: "GANTI_DENGAN_APP_ID"
};

// Inisialisasi (dipakai di index.html & admin.html)
// Jangan ubah bagian di bawah ini kecuali kamu paham
let app, auth, db, storage;

function initFirebase() {
  if (typeof firebase === 'undefined') {
    console.error('Firebase SDK belum dimuat');
    return false;
  }
  app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  storage = firebase.storage();
  return true;
}
