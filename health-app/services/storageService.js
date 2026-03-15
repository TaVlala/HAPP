// HAPP — Storage Service
// Handles all reads/writes with:
//   1. Automatic AES encryption/decryption via EncryptionService
//   2. Firestore sync when Firebase is configured
//   3. localStorage fallback when Firebase is not configured
//
// Firestore structure:
//   healthData/profile       → { data: encrypted_string }
//   healthData/supplements   → { data: encrypted_string }
//   healthData/bodyHistory   → { data: encrypted_string }
//   healthData/compliance    → { data: encrypted_string }
//   healthData/archive       → { data: encrypted_string }

const StorageService = {

  COLLECTION: 'healthData',

  KEYS: {
    PROFILE:      'happ_profile',
    SUPPLEMENTS:  'happ_supplements',
    BODY_HISTORY: 'happ_body_history',
    COMPLIANCE:   'happ_compliance',
    ARCHIVE:      'happ_archive',
  },

  // ── Generic read ──────────────────────────────────────────────────────────

  async _read(docId, localKey) {
    if (firebaseReady && db) {
      try {
        const snap = await db.collection(this.COLLECTION).doc(docId).get();
        if (snap.exists) {
          const raw = snap.data().data;
          return EncryptionService.decryptObject(raw);
        }
        return null;
      } catch (e) {
        console.error('[Storage] Firestore read error:', e);
        // Fall through to localStorage
      }
    }
    // localStorage fallback
    const raw = localStorage.getItem(localKey);
    if (!raw) return null;
    return EncryptionService.decryptObject(raw);
  },

  // ── Generic write ─────────────────────────────────────────────────────────

  async _write(docId, localKey, data) {
    const encrypted = EncryptionService.encryptObject(data);
    if (firebaseReady && db) {
      try {
        await db.collection(this.COLLECTION).doc(docId).set({ data: encrypted });
      } catch (e) {
        console.error('[Storage] Firestore write error:', e);
        // Fall through to localStorage
      }
    }
    // Always also write to localStorage as cache/fallback
    localStorage.setItem(localKey, encrypted);
  },

  // ── Profile ───────────────────────────────────────────────────────────────

  async getProfile() {
    return await this._read('profile', this.KEYS.PROFILE);
  },

  async saveProfile(data) {
    await this._write('profile', this.KEYS.PROFILE, data);
  },

  // ── Supplements (user state — not seed data) ──────────────────────────────
  // Stores user's supplement states: { [suppId]: { status, startDate, endDate, ... } }

  async getSupplementStates() {
    return await this._read('supplements', this.KEYS.SUPPLEMENTS) || {};
  },

  async saveSupplementStates(statesMap) {
    await this._write('supplements', this.KEYS.SUPPLEMENTS, statesMap);
  },

  // ── Body History ──────────────────────────────────────────────────────────
  // Array of { date, weight, bodyFat, timestamp }

  async getBodyHistory() {
    return await this._read('bodyHistory', this.KEYS.BODY_HISTORY) || [];
  },

  async addBodyEntry(entry) {
    const history = await this.getBodyHistory();
    history.push({
      ...entry,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0]
    });
    await this._write('bodyHistory', this.KEYS.BODY_HISTORY, history);
    return history;
  },

  async deleteBodyEntry(timestamp) {
    const history = await this.getBodyHistory();
    const filtered = history.filter(e => e.timestamp !== timestamp);
    await this._write('bodyHistory', this.KEYS.BODY_HISTORY, filtered);
    return filtered;
  },

  // ── Compliance ────────────────────────────────────────────────────────────
  // { [dateKey: YYYY-MM-DD]: { completed: string[], total: number, pct: number } }

  async getCompliance() {
    return await this._read('compliance', this.KEYS.COMPLIANCE) || {};
  },

  async saveDayCompliance(dateKey, completedIds, totalCount) {
    const compliance = await this.getCompliance();
    compliance[dateKey] = {
      completed: completedIds,
      total: totalCount,
      pct: totalCount > 0 ? Math.round((completedIds.length / totalCount) * 100) : 0,
      savedAt: Date.now()
    };
    await this._write('compliance', this.KEYS.COMPLIANCE, compliance);
    return compliance;
  },

  async getTodayCompliance() {
    const compliance = await this.getCompliance();
    const key = ComplianceService.todayKey();
    return compliance[key] || { completed: [], total: 0, pct: 0 };
  },

  async getLast7DaysCompliance() {
    const compliance = await this.getCompliance();
    const keys = ComplianceService.last7Days();
    return keys.map(k => compliance[k] || { completed: [], total: 0, pct: 0, date: k });
  },

  // ── Archive ───────────────────────────────────────────────────────────────
  // Array of archived supplement state objects

  async getArchive() {
    return await this._read('archive', this.KEYS.ARCHIVE) || [];
  },

  async addToArchive(item) {
    const archive = await this.getArchive();
    archive.push({ ...item, archivedAt: Date.now() });
    await this._write('archive', this.KEYS.ARCHIVE, archive);
    return archive;
  },

  async removeFromArchive(suppId) {
    const archive = await this.getArchive();
    const filtered = archive.filter(a => a.id !== suppId);
    await this._write('archive', this.KEYS.ARCHIVE, filtered);
    return filtered;
  },

  // ── Utility ───────────────────────────────────────────────────────────────

  isFirebaseReady() {
    return firebaseReady;
  },

  // Clear all local storage (for reset/debug)
  clearLocalCache() {
    Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
    console.log('[Storage] Local cache cleared');
  }
};
