const firebaseConfig = {
  apiKey: "AIzaSyBOWscNQCAsBeb3k2X-Ffw0eCbsZPsd8Wc",
  authDomain: "health-dashboard-8cb07.firebaseapp.com",
  projectId: "health-dashboard-8cb07",
  storageBucket: "health-dashboard-8cb07.firebasestorage.app",
  messagingSenderId: "534790791032",
  appId: "1:534790791032:web:c62f121b5b3e86faf3328d"
};

let db = null;
let firebaseReady = false;

function initFirebase() {
  try {
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith('%%')) {
      console.warn('[Firebase] ⚠️ Not configured — running in local-only mode');
      firebaseReady = false;
      return;
    }
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    firebaseReady = true;
    console.log('[Firebase] ✅ Connected to Firestore');
  } catch (e) {
    console.error('[Firebase] Init error:', e);
    firebaseReady = false;
  }
}

initFirebase();
