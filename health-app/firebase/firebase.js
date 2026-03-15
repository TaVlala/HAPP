const firebaseConfig = {
  apiKey: "%%FIREBASE_API_KEY%%",
  authDomain: "%%FIREBASE_AUTH_DOMAIN%%",
  projectId: "%%FIREBASE_PROJECT_ID%%",
  storageBucket: "%%FIREBASE_STORAGE_BUCKET%%",
  messagingSenderId: "%%FIREBASE_MESSAGING_SENDER_ID%%",
  appId: "%%FIREBASE_APP_ID%%"
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
