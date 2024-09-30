import { AmplifyWrrapper } from "../auth";
import { bip32, encryptor, splitter } from "../logic";

type Distination = {
  region: string;
  bucket: string;
  fileName: string;
}

type CreateParam = {
  key: string;
  distinations: Distination[];
  localStorageKey?: string;
}

type GetEntoropyFromRemoteParam = {
  key: string;
  distinations: Distination[];
}

class SemiCustodialWallet {
  amplifyWrrapper: AmplifyWrrapper;

  constructor(config: any) {
    this.amplifyWrrapper = new AmplifyWrrapper(config);
  }

  async signIn() {
    // 一旦Google固定でいく
    await this.amplifyWrrapper.signIn("Google");
  }

  async SignOut() {
    await this.amplifyWrrapper.signOut();
  }

  async isSignIn() {
    return !!this.amplifyWrrapper.getSession().catch(() => false)
  }

  async create(param: CreateParam) {
    const {distinations, key} = param;
    const entropy = bip32.createEntropy();
    const splitEntropy = splitter.split(entropy, distinations.length)
    const encrypted = await Promise.all(
      splitEntropy.map(async (part: string, i: number) => {
        const cipher = encryptor.encryptWithRandomIv(part, key);
        await this.amplifyWrrapper.upload(distinations[i].region, distinations[i].bucket, distinations[i].fileName, cipher);
      }))
    const encEntropy = encryptor.encryptWithRandomIv(entropy, key)
    //TODO: encEntropyをローカルストレージに入れる
    return encEntropy;
  }

  async getEntoropyFromRemote(param: GetEntoropyFromRemoteParam) {
    const {distinations, key} = param;
  }

  async getEntoropyFromLocal(localStorageKey: string, key: string){
    //TODO: ローカルストレージencEntropyを復号して返す
  }
}
