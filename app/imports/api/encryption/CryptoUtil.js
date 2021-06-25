/** Class that simplifies encryption/decryption of passwords */
import aes from "crypto-js/aes";
import { enc } from "crypto-js/core";
import sha512 from "crypto-js/sha512";

class SimpleCrypto {

  /**
   * Encrypts password with given key
   * @param {string} password User's password for a given URL
   * @param {string} encryptionKey User's encryption key
   * @returns {string} The decrypted version of param password
   */
  encryptPassword(password, encryptionKey) {
    return aes.encrypt(password, encryptionKey).toString();
  }

  /**
   * Decrypts password with given key
   * @param {string} password User's password for a given URL
   * @param {string} encryptionKey User's encryption key
   * @returns {string} The original decrypted version of param password
   */
  decryptPassword(password, encryptionKey) {
    return aes.decrypt(password, encryptionKey).toString(enc.Utf8);
  }

  /**
   * Generates an encryption key using master password
   * @param {string} masterPassword User's master password
   * @returns {string} Key derived from param masterPassword
   */
  generateKey(masterPassword) {
    return sha512(masterPassword).toString();
  }
}

export const CryptoUtil = new SimpleCrypto();
