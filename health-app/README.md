# HAPP — Personal Health Tracker

A production-ready personal health tracker built for David Tavlalashvili.
Tracks supplements, adherence, body measurements, and progress analytics.

## Live app
Open `index.html` in a browser, or deploy to any static host (Netlify, Vercel, GitHub Pages).

## Stack
| Layer | Technology |
|---|---|
| Frontend | Vanilla JS (ES5/ES6), no framework |
| Database | Firebase Firestore (encrypted) |
| Encryption | AES-256 via CryptoJS 4.1.1 |
| Charts | Chart.js 4.4.0 |
| PWA | Service Worker + Web App Manifest |

## Pages
| Page | Features |
|---|---|
| Dashboard | 8 stat cards, 7-day compliance sparkline, weight + body fat charts |
| Daily Schedule | Time-grouped supplement checklist, daily compliance tracking |
| Measurements | Weight + body fat entry, history table with deltas, Chart.js charts |
| Archive | Stopped supplements with restore and delete options |
| Settings | Profile, plan start date, custom supplements, encryption key |

## Firebase Setup (required for cloud sync)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create project: `happ-health-tracker`
3. Add a Web App → copy the config object
4. Open `firebase/firebase.js` and replace the 6 placeholder values:
   ```js
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",          // ← replace
     authDomain: "YOUR_PROJECT_ID...", // ← replace
     projectId: "YOUR_PROJECT_ID",    // ← replace
     storageBucket: "...",            // ← replace
     messagingSenderId: "...",        // ← replace
     appId: "..."                     // ← replace
   };
   ```
5. In Firebase Console → Firestore Database → Create database → Production mode
6. Deploy the rules in `firebase/firestore.rules`

**Without Firebase:** App runs fully in localStorage mode. All data stays on-device, encrypted.

## Encryption
- All data is AES-256 encrypted before writing to Firestore or localStorage
- Encryption key is auto-generated from device fingerprint on first launch
- You can set a custom key in Settings → Encryption
- Changing the key re-encrypts all local data automatically

## PWA Installation
- **Chrome/Edge (desktop):** Click the install icon in the address bar
- **Android Chrome:** Tap "Add to Home Screen" from the browser menu
- **iOS Safari:** Tap Share → "Add to Home Screen"
- Works offline after first load (service worker caches all assets)

## Supplement System
- 28 supplements pre-loaded from David's health plan
- Phase recommendations shown as **guidance only** — start any supplement anytime
- Each supplement: start date, optional end date, course countdown, pause/stop/restore
- Custom supplements can be added in Settings

## Development Phases
| Phase | Status | Description |
|---|---|---|
| 1 | ✅ | Project scaffold |
| 2 | ✅ | UI shell + layout |
| 3 | ✅ | Firebase integration |
| 4 | ✅ | Encryption layer |
| 5 | ✅ | Supplements module + daily schedule |
| 6 | ✅ | Dashboard + compliance |
| 7 | ✅ | Measurements + charts |
| 8 | ✅ | Archive module |
| 9 | ✅ | Mobile optimization + PWA |
