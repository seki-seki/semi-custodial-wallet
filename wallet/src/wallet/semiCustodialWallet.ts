import { AmplifyWrrapper } from "../auth";
import { bip32, encryptor, splitter } from "../logic";

export type Distination = {
  region: string;
  bucket: string;
  fileName: string;
}

export type CreateParam = {
  key: string;
  distinations: Distination[];
  localStorageKey?: string;
}

export type GetEntoropyFromRemoteParam = {
  key: string;
  distinations: Distination[];
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
    const {distinations, key, localStorageKey} = param;
    const entropy = bip32.createEntropy();
    const splitEntropy = splitter.split(entropy, distinations.length);
    const encrypted = await Promise.all(
      splitEntropy.map(async (part: string, i: number) => {
        const cipher = encryptor.encryptWithRandomIv(part, key);
        console.log(`upload to ${distinations[i].bucket}`)
        return () => this.amplifyWrrapper.upload(distinations[i].region, distinations[i].bucket, distinations[i].fileName, cipher);
      }))
    const encEntropy = encryptor.encryptWithRandomIv(entropy, key)
    localStorage.setItem(localStorageKey || LOCAL_STORAGE_KEY, encEntropy)
    return encEntropy;
  }

  async getEntoropyFromRemote(param: GetEntoropyFromRemoteParam) {
    if (!this.isSignIn()) throw ("sign in first");
    const {distinations, key} = param;
    const splitEntropy = await Promise.all(
      distinations.map((distination: Distination) => {
        return () => this.amplifyWrrapper.get(distination.region, distination.bucket, distination.fileName);
      }))
    return encryptor.decryptWithLastIv(splitEntropy.join(""), key);
  }

  async getEntoropyFromLocal(param: GetEntoropyFromLocalParam) {
    const {localStorageKey, key} = param;
    const encEntropy = localStorage.getItem(localStorageKey || LOCAL_STORAGE_KEY);
    if (!encEntropy) throw "not found"
    return encryptor.decryptWithLastIv(encEntropy, key);
  }
}
