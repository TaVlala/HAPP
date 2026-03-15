// HAPP — Encryption Service
// AES-256 encryption/decryption using CryptoJS
// All health data is encrypted before writing to Firestore or localStorage.
//
// Key management:
//   - Default key is stored in localStorage under 'happ_enc_key'
//   - User can set a custom key in Settings
//   - If no key set, uses a device-bound default derived from a fixed salt
//
// Usage:
//   EncryptionService.encrypt('hello')       → 'U2FsdGVkX1...'
//   EncryptionService.decrypt('U2FsdGVkX1...') → 'hello'
//   EncryptionService.encryptObject({a:1})   → 'U2FsdGVkX1...'
//   EncryptionService.decryptObject('...')   → {a:1}

const EncryptionService = {

  _KEY_STORAGE: 'happ_enc_key',
  _DEFAULT_SALT: 'HAPP-health-tracker-2026-david',

  // ── Key management ────────────────────────────────────────────────────────

  getKey() {
    const stored = localStorage.getItem(this._KEY_STORAGE);
    if (stored) return stored;
    // Generate a default key from salt + user agent fingerprint
    const fingerprint = navigator.userAgent + screen.width + screen.height;
    const defaultKey = CryptoJS.SHA256(this._DEFAULT_SALT + fingerprint).toString();
    localStorage.setItem(this._KEY_STORAGE, defaultKey);
    return defaultKey;
  },

  setKey(newKey) {
    if (!newKey || newKey.trim().length < 8) {
      throw new Error('Encryption key must be at least 8 characters');
    }
    localStorage.setItem(this._KEY_STORAGE, newKey.trim());
    console.log('[Encryption] Key updated');
  },

  hasCustomKey() {
    return !!localStorage.getItem(this._KEY_STORAGE);
  },

  // ── Core encrypt/decrypt ──────────────────────────────────────────────────

  encrypt(plaintext) {
    if (plaintext === null || plaintext === undefined) return null;
    try {
      const key = this.getKey();
      return CryptoJS.AES.encrypt(String(plaintext), key).toString();
    } catch (e) {
      console.error('[Encryption] Encrypt error:', e);
      return null;
    }
  },

  decrypt(ciphertext) {
    if (!ciphertext) return null;
    try {
      const key = this.getKey();
      const bytes = CryptoJS.AES.decrypt(ciphertext, key);
      const result = bytes.toString(CryptoJS.enc.Utf8);
      if (!result) return null;
      return result;
    } catch (e) {
      console.error('[Encryption] Decrypt error:', e);
      return null;
    }
  },

  // ── Object helpers ────────────────────────────────────────────────────────

  encryptObject(obj) {
    if (obj === null || obj === undefined) return null;
    try {
      return this.encrypt(JSON.stringify(obj));
    } catch (e) {
      console.error('[Encryption] encryptObject error:', e);
      return null;
    }
  },

  decryptObject(ciphertext) {
    if (!ciphertext) return null;
    try {
      const json = this.decrypt(ciphertext);
      if (!json) return null;
      return JSON.parse(json);
    } catch (e) {
      console.error('[Encryption] decryptObject error:', e);
      return null;
    }
  },

  // ── Validation ────────────────────────────────────────────────────────────

  // Test that encrypt/decrypt round-trips correctly
  selfTest() {
    try {
      const testData = { test: true, ts: Date.now() };
      const encrypted = this.encryptObject(testData);
      const decrypted = this.decryptObject(encrypted);
      const ok = decrypted && decrypted.test === true;
      console.log('[Encryption] Self-test:', ok ? '✅ PASS' : '❌ FAIL');
      return ok;
    } catch (e) {
      console.error('[Encryption] Self-test error:', e);
      return false;
    }
  },

  // Re-encrypt all localStorage data with a new key
  // Called when user changes their encryption key in Settings
  async reEncryptAll(newKey) {
    console.log('[Encryption] Re-encrypting all data with new key...');
    const keys = Object.values(StorageService.KEYS);
    const oldKey = this.getKey();

    // Read all data with old key
    const dataMap = {};
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (raw) {
        try {
          const bytes = CryptoJS.AES.decrypt(raw, oldKey);
          const json = bytes.toString(CryptoJS.enc.Utf8);
          dataMap[k] = json;
        } catch (e) {
          console.warn('[Encryption] Could not decrypt', k, 'with old key — skipping');
        }
      }
    }

    // Set new key
    this.setKey(newKey);

    // Re-encrypt and save with new key
    for (const [k, json] of Object.entries(dataMap)) {
      if (json) {
        const reEncrypted = CryptoJS.AES.encrypt(json, newKey).toString();
        localStorage.setItem(k, reEncrypted);
      }
    }

    console.log('[Encryption] Re-encryption complete');
  }
};
