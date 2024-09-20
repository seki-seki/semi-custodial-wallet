import { randomBytes } from "crypto";
import CryptoJS from "crypto-js";
import * as uuid from "uuid";

export const decryptString = (cipherText: string, key: string) => {
  return CryptoJS.AES.decrypt(cipherText, key).toString(CryptoJS.enc.Utf8);
};


class Encryptor {
  createRandomKey = uuid.v4;

  encrypt(plain: string, key: string, iv: string) {
    return CryptoJS.AES.encrypt(plain, CryptoJS.enc.Utf8.parse(key), {
      iv: CryptoJS.enc.Utf8.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }).toString();
  }

  decrypt(cipher: string, key: string, iv: string) {
    return CryptoJS.AES.decrypt(cipher, CryptoJS.enc.Utf8.parse(key), {
      iv: CryptoJS.enc.Utf8.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }).toString(CryptoJS.enc.Utf8);
  }

  generateRandomIVHex(): string {
    if (typeof window !== 'undefined' && window.crypto) {
      // ブラウザ環境
      const array = new Uint8Array(16);
      window.crypto.getRandomValues(array);
      return Array.from(array).map(byte => byte.toString(16).padStart(2, '0')).join('');
    } else {
      // Node.js環境
      const {randomBytes} = require('crypto');
      const iv = randomBytes(16);
      return iv.toString('hex');
    }
  }

  encryptWithRandomIv(plain: string, key: string) {
    const iv = this.generateRandomIVHex();
    const encrypted = CryptoJS.AES.encrypt(plain, CryptoJS.enc.Utf8.parse(key), {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }).toString();
    return encrypted + iv;
  }

  decryptWithLastIv(cipherWithIv: string, key: string) {
    const ivHex = cipherWithIv.slice(-32);
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const cipher = cipherWithIv.slice(0, -32);
    return CryptoJS.AES.decrypt(cipher, CryptoJS.enc.Utf8.parse(key), {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }).toString(CryptoJS.enc.Utf8);
  }
}

export const encryptor = new Encryptor();
