// HAPP — Firebase Configuration
// ─────────────────────────────────────────────────────────────────────────────
// SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project called "happ-health-tracker"
// 3. Add a Web App to the project
// 4. Copy the firebaseConfig object and paste it below
// 5. Go to Firestore Database → Create database → Start in production mode
// 6. Set Firestore rules (see rules section at bottom of this file)
// ─────────────────────────────────────────────────────────────────────────────

// Replace these values with your Firebase project config:
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// ─────────────────────────────────────────────────────────────────────────────
// Firebase initialisation (using compat SDK loaded via CDN in index.html)
// ─────────────────────────────────────────────────────────────────────────────
let db = null;
let firebaseReady = false;

function initFirebase() {
  try {
    if (firebaseConfig.apiKey === "YOUR_API_KEY") {
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

// Call on load
initFirebase();
