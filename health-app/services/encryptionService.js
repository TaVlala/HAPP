// HAPP — Encryption Service
// AES encryption/decryption using CryptoJS
// All data is encrypted before writing to Firestore, decrypted after reading

const EncryptionService = {
  // TODO Phase 4: key will be derived from device fingerprint or user-set passphrase
  _key: 'HAPP_AES_KEY_PHASE_4',

  encrypt(data) {
    // TODO Phase 4: implement CryptoJS.AES.encrypt
    return data;
  },

  decrypt(ciphertext) {
    // TODO Phase 4: implement CryptoJS.AES.decrypt
    return ciphertext;
  },

  encryptObject(obj) {
    return this.encrypt(JSON.stringify(obj));
  },

  decryptObject(ciphertext) {
    try {
      return JSON.parse(this.decrypt(ciphertext));
    } catch {
      return null;
    }
  }
};
