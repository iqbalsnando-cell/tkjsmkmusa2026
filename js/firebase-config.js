// ============================================================
//  FIREBASE CONFIG - GANTI DENGAN DATA PROJECT KAMU
// ============================================================
// Cara ambil:
// 1. Buka https://console.firebase.google.com
// 2. Pilih project → Project Settings (ikon gear)
// 3. Scroll ke "Your apps" → pilih Web app (atau buat baru)
// 4. Copy object firebaseConfig di bawah ini

const firebaseConfig = {
  apiKey: "AIzaSyC4IOZcDUSZ09NIUFUXvVQwGLZOuX5CHz4",
  authDomain: "base-d7f2a.firebaseapp.com",
  projectId: "base-d7f2a",
  storageBucket: "base-d7f2a.firebasestorage.app",
  messagingSenderId: "270938168800",
  appId: "1:270938168800:web:2f57693c7091ecba0e5f85"
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
