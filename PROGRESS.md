# HAPP — Development Progress

**Live:** https://happ-health-tracker.vercel.app/
**Repo:** https://github.com/TaVlala/HAPP
**Stack:** Vanilla JS PWA · Firebase Firestore · Vercel hosting

---

## Session 1 — Initial build
- Project scaffolded: HTML/CSS/JS PWA with service worker
- Firebase Firestore integration with encrypted storage
- Supplement seed data (28 supplements)
- Daily Schedule page with check-off tracking
- Dashboard with stat cards (weight, body fat, compliance)
- Body Measurements page (weight, blood pressure, labs history)
- Archive page for stopped supplements
- Settings page (profile, add supplement, encryption key)
- Sidebar (desktop) + mobile bottom nav
- PWA install banner

## Session 2 — Hosting + Data + Nav restructure
- Migrated from Netlify (hit usage limit) to Vercel
- Fixed Firebase "Not configured" error on Vercel deploy
- Updated supplement data from authoritative reference MD
- DAILY_SCHEDULE revised (Nexium once-daily, Mildronat own slot, Omega-3 split dose, etc.)
- Archive tab moved from main nav into Settings → Data
- Food Pairings tab added (10 foods, 45 pairs, interactive card selection)
- Supplements page: sub-tabs (Catalog / Interactions)
- Interactions & Rules section added to Supplements
- Page persistence on refresh (localStorage `happ_page`)

## Session 3 — Lifestyle, Notifications, Bug fixes (2026-03-22)

### Reminders & Notifications
- New `notificationsModule.js` — browser push notifications per DAILY_SCHEDULE slot
- Master on/off toggle with permission request flow
- Per-slot individual toggles (9 schedule times)
- Meal time inputs (Breakfast, Lunch, Dinner, Bedtime) — notifications fire 30 min early
- "Save meal times" reschedules all timers immediately
- Slot list shows adjusted fire time: "🍳 Breakfast − 30 min (fires 07:30)"
- Test notification button
- SW cache bumped to v7

### Lifestyle page (Food renamed)
- "Food" renamed to "Lifestyle" across sidebar, mobile nav, page header
- Three sub-tabs: 🍽️ Pairings · 📋 Diet · 🌿 Lifestyle
- **Diet Rules tab**: Core principles, Eat freely (4 groups), Foods to avoid (30 items) with live filter by reason (GERD, Blood sugar, Liver, Psoriasis, Bloating, Uric acid), Elimination trials, Daily protein target breakdown (~131g)
- **Lifestyle Protocols tab**: Sleep (6 rules), Daily movement, Back exercises (5), Reflux management ladder (4 steps), Sinus/nasal drip protocol

### Bug fixes & UX
- **Per-slot supplement tracking** — fixed: supplements in multiple slots (e.g. Omega-3 at breakfast + lunch) now track independently via `id:time_sort` key. Checking breakfast dose no longer marks lunch as done.
- Progress bar counts slot instances (13 total) not unique supplements
- Schedule icon changed: 💊 → 📅
- Body/Measurements moved from main nav into Settings → Data
- Manage Supplements section in Settings made collapsible (collapsed by default)
- Fixed collapsible header styling (section-label border rendering as background)

---

## Current nav structure (mobile)
Dashboard · Schedule · Lifestyle · Supps · Settings

## Pages accessible via Settings → Data
- 📊 Body Measurements
- 📁 Archive

## Known limitations
- Browser notifications only fire while the app/browser is open (no backend push)
- Service worker cache requires hard refresh / cache clear on mobile after updates
