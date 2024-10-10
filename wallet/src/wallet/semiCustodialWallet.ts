import { AmplifyWrrapper } from "../auth";
import { bip32, encryptor, splitter } from "../logic";

export type Destination = {
  region: string;
  bucket: string;
  fileName: string;
}

export type CreateParam = {
  key: string;
  destinations: Destination[];
  localStorageKey?: string;
}

export type GetEntoropyFromRemoteParam = {
  key: string;
  destinations: Destination[];
}

export type GetEntoropyFromLocalParam = {
  key: string;
  localStorageKey?: string;
}

export const LOCAL_STORAGE_KEY = "semi-custodial-wallet-encEntropy";

export class SemiCustodialWallet {
  amplifyWrrapper: AmplifyWrrapper;

  constructor(config: any) {
    this.amplifyWrrapper = new AmplifyWrrapper(config);
  }

  async signIn() {
    // 一旦Google固定でいく
    await this.amplifyWrrapper.signIn("Google");
  }

  async signOut() {
    await this.amplifyWrrapper.signOut();
  }

  async isSignIn() {
    return !!(await this.amplifyWrrapper.getSession().catch(() => false))
  }

  async getSession() {
    return await this.amplifyWrrapper.getSession();
  }

  async create(param: CreateParam) {
    if (!this.isSignIn()) throw ("sign in first");
    const {destinations, key, localStorageKey} = param;
    const entropy = bip32.createEntropy();
    const splitEntropy = splitter.split(entropy, destinations.length);
    const encrypted = await Promise.all(
      splitEntropy.map(async (part: string, i: number) => {
        const cipher = encryptor.encryptWithRandomIv(part, key);
        return this.amplifyWrrapper.upload(destinations[i].region, destinations[i].bucket, destinations[i].fileName, cipher);
      }))
    const encEntropy = encryptor.encryptWithRandomIv(entropy, key)
    localStorage.setItem(localStorageKey || LOCAL_STORAGE_KEY, encEntropy)
    return [entropy, encEntropy];
  }

  async getEntoropyFromRemote(param: GetEntoropyFromRemoteParam) {
    if (!this.isSignIn()) throw ("sign in first");
    const {destinations, key} = param;
    const splitEntropy = await Promise.all(
      destinations.map(async (Destination: Destination) => {
        const encPart = await this.amplifyWrrapper.get(Destination.region, Destination.bucket, Destination.fileName);
        return encryptor.decryptWithLastIv(encPart, key);
      }))
    return splitEntropy.join("")
  }

  getEntoropyFromLocal(param: GetEntoropyFromLocalParam) {
    const {localStorageKey, key} = param;
    const encEntropy = localStorage.getItem(localStorageKey || LOCAL_STORAGE_KEY);
    if (!encEntropy) throw "not found"
    return encryptor.decryptWithLastIv(encEntropy, key);
  }

  getMnemonicFromEntropy(entropy: string) {
    return bip32.entropyToMnemonic(entropy);
  }
}
