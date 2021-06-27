/** Class that simplifies encryption/decryption of passwords */
class SimpleCrypto {
  constructor() {
    /* eslint-disable global-require */
    this.CryptoJS = require('crypto-js');
    /* eslint-enable global-require */
  }

  /**
   * Encrypts password with given key
   * @param {string} password User's password for a given URL
   * @param {string} encryptionKey User's encryption key
   * @returns {string} The decrypted version of param password
   */
  encryptPassword(password, encryptionKey) {
    return this.CryptoJS.AES.encrypt(password, encryptionKey).toString();
  }

  /**
   * Decrypts password with given key
   * @param {string} password User's password for a given URL
   * @param {string} encryptionKey User's encryption key
   * @returns {string} The original decrypted version of param password
   */
  decryptPassword(password, encryptionKey) {
    return this.CryptoJS.AES.decrypt(password, encryptionKey).toString(this.CryptoJS.enc.Utf8);
  }

  /**
   * Generates an encryption key using master password
   * @param {string} masterPassword User's master password
   * @returns {string} Key derived from param masterPassword
   */
  generateKey(masterPassword) {
    return this.CryptoJS.SHA512(masterPassword).toString();
  }
}

export const CryptoUtil = new SimpleCrypto();
