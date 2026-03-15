# HAPP — Personal Health Tracker

Personal supplement tracker, adherence monitor, and body measurement logger for David Tavlalashvili.

## Stack
- Vanilla JS (ES Modules) — no framework
- Firebase Firestore — encrypted cloud sync
- AES encryption (CryptoJS) — all health data encrypted at rest
- PWA — installable, works offline

## Pages
| Page | Description |
|---|---|
| Dashboard | Weekly metrics, compliance, body progress charts |
| Daily Schedule | Supplement checklist grouped by time of day |
| Measurements | Weight + body fat entry, history view |
| Archive | Stopped/completed supplements with restore option |
| Settings | Profile, plan start date, encryption key |

## Supplement System
- All 28 supplements pre-loaded as seed data
- Each supplement: start date, optional end date, course countdown
- Phase recommendations shown as info only — never gates
- Any supplement can be started, paused, stopped, or archived at any time
- User can add custom supplements

## Development Phases
- Phase 1 ✅ Project scaffold
- Phase 2 UI shell + layout
- Phase 3 Firebase integration
- Phase 4 Encryption layer
- Phase 5 Supplement data + schedule
- Phase 6 Dashboard + compliance
- Phase 7 Measurements + charts
- Phase 8 Archive module
- Phase 9 Mobile + PWA
