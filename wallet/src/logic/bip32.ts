import * as ecc from 'tiny-secp256k1';
import * as crypto from 'crypto';
import BIP32Factory, { BIP32API } from 'bip32';

class Bip32 {
  bip32: BIP32API
  constructor() {
    this.bip32 = BIP32Factory(ecc);
  }
  create() {
    const seed = crypto.randomBytes(32);
    const root = this.bip32.fromSeed(seed);
    return root.toBase58()
  }
}

export default new Bip32();
