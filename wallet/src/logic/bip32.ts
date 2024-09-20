import * as bip39 from "bip39";

class Bip32 {
  createEntropy() {
    const mnemonic = bip39.generateMnemonic();
    return bip39.mnemonicToEntropy(mnemonic);
  }

  entropyToMnemonic(entropy: string) {
    return bip39.entropyToMnemonic(entropy);
  }
}
export const bip32 =  new Bip32();
