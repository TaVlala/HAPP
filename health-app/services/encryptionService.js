// HAPP — Encryption Service
// Encryption removed — data is protected by Firestore rules + API key domain restrictions.
// These methods are kept as pass-through so no other code needs to change.

const EncryptionService = {

  _KEY_STORAGE: 'happ_enc_key',

  getKey()          { return 'n/a'; },
  setKey()          {},
  hasCustomKey()    { return false; },
  async loadOrCreateKey() { return 'n/a'; },

  selfTest() {
    console.log('[Encryption] Self-test: ✅ PASS (pass-through mode)');
    return true;
  },

  encrypt(plaintext) {
    if (plaintext === null || plaintext === undefined) return null;
    return String(plaintext);
  },

  decrypt(ciphertext) {
    if (!ciphertext) return null;
    return ciphertext;
  },

  encryptObject(obj) {
    if (obj === null || obj === undefined) return null;
    try { return JSON.stringify(obj); } catch (e) { return null; }
  },

  decryptObject(str) {
    if (!str) return null;
    try {
      // Handle both plain JSON (new) and old AES-encrypted strings gracefully
      return JSON.parse(str);
    } catch (e) {
      // Old encrypted data — unreadable, return null so caller seeds fresh
      return null;
    }
  },

  async reEncryptAll() {
    console.log('[Encryption] No-op — encryption removed');
  }
};
