import React, { useCallback, useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { SemiCustodialWallet } from "semi-custodial-wallet";
import config from "./aws-exports";

function App() {
  const [wallet, setWallet] = useState<SemiCustodialWallet>()
  const [isSignIn, setIsSignIn] = useState<boolean>();
  const [encKey, setEncKey] = useState<string>("");
  const [decKey, setDecKey] = useState<string>("");
  const [passkey, setPasskey] = useState<string>();

  useEffect(() => {
    const setup = async () => {
      const wallet = new SemiCustodialWallet(config);
      setWallet(wallet)
      setIsSignIn(await wallet.isSignIn());
    }
    setup();
  }, []);
  const handleSignIn = useCallback(async () => {
    if (!wallet) throw "no wallet";
    await wallet.signIn();
    setIsSignIn(true);
  }, [wallet]);
  const handleSignOut = useCallback(async () => {
    if (!wallet) throw "no wallet";
    await wallet.signOut();
    setIsSignIn(false);
  }, [wallet]);

  const handleChangeEncKey = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEncKey(e.target.value)
  }, [])
  const handleChangDecKey = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDecKey(e.target.value)
  }, [])



  const handleCreatePasskey = useCallback(async () => {
    if (passkey) throw "already exist";
    if (localStorage.getItem("passkey.rawId")) throw "already created"
    const firstSalt = new Uint8Array(new Array(32).fill(1)).buffer; // Example value
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: new Uint8Array([1, 2, 3, 4]), // Example value
        rp: {
          name: "semi-custodial wallet example", // Example value
        },
        user: {
          id: new Uint8Array([5, 6, 7, 8]),  // Example value
          name: "test", // Example value
          displayName: "test", // Example value
        },
        pubKeyCredParams: [
          {alg: -8, type: "public-key"},   // Ed25519
          {alg: -7, type: "public-key"},   // ES256
          {alg: -257, type: "public-key"}, // RS256
        ],
        authenticatorSelection: {
          userVerification: "required",
        },
        extensions: {
          // @ts-ignore
          prf: {
            eval: {
              first: firstSalt,
            },
          },
        },
      },
    });
    // @ts-ignore
    setPasskey(arrayBufferToBase64(credential.getClientExtensionResults().prf.results.first))
    // @ts-ignore
    localStorage.setItem("passkey.rawId", arrayBufferToBase64(credential.rawId));
  }, [passkey])

  const handleUsePasskey = useCallback(async () => {
    if (passkey) throw "already exist"
    const rawIdString = localStorage.getItem("passkey.rawId");
    if (!rawIdString) throw "no id"
    const rawId = base64ToArrayBuffer(rawIdString);
    const firstSalt = new Uint8Array(new Array(32).fill(1)).buffer; // Example value
    const credential = await navigator.credentials.get({
      publicKey: {
        challenge: new Uint8Array([1, 2, 3, 4]), // Example value
        allowCredentials: [
          {
            id: rawId,
            type: "public-key",
          },
        ],
        extensions: {
          // @ts-ignore
          prf: {
            eval: {
              first: firstSalt,
            },
          },
        },
      },
    });
    // @ts-ignore
    setPasskey(arrayBufferToBase64(credential.getClientExtensionResults().prf.results.first))
  }, [passkey])

  const handleCreateWithPassword = useCallback(async () => {
    if (!wallet) throw "no wallet";
    if (!encKey) throw "no key";
    const [entropy] = await wallet.create({
      destinations: [
        {
          region: "ap-northeast-1",
          bucket: "fides-test-secondary",
          fileName: "key1"
        },
        {
          region: "ap-northeast-1",
          bucket: "fides-access-test1",
          fileName: "key2"
        }
      ],
      key: encKey
    })
    console.log("successfully create")
    console.log(entropy)
  }, [wallet, encKey])

  const handleCreateWithPasskey = useCallback(async () => {
    if (!wallet) throw "no wallet";
    if (!passkey) throw "no passkey";
    const [entropy] = await wallet.create({
      destinations: [
        {
          region: "ap-northeast-1",
          bucket: "fides-test-secondary",
          fileName: "passkey1"
        },
        {
          region: "ap-northeast-1",
          bucket: "fides-access-test1",
          fileName: "passkey2"
        }
      ],
      key: passkey
    })
    console.log("successfully create")
    console.log(entropy)
  }, [wallet, passkey])

  const handleRecoverWithPassword = useCallback(async () => {
    if (!wallet) throw "no wallet";
    if (!decKey) throw "no key";
    const entropy = await wallet.getEntoropyFromRemote({
      destinations: [
        {
          region: "ap-northeast-1",
          bucket: "fides-test-secondary",
          fileName: "key1"
        },
        {
          region: "ap-northeast-1",
          bucket: "fides-access-test1",
          fileName: "key2"
        }
      ],
      key: decKey
    })
    console.log("recover from remote")
    console.log(entropy)
    const fromLocal = wallet.getEntoropyFromLocal({
      key: decKey
    })
    console.log("recover from local")
    console.log(fromLocal)
  }, [wallet, decKey])

  const handleRecoverWithPasskey = useCallback(async () => {
    if (!wallet) throw "no wallet";
    if (!passkey) throw "no passkey";
    console.log(passkey)
    const entropy = await wallet.getEntoropyFromRemote({
      destinations: [
        {
          region: "ap-northeast-1",
          bucket: "fides-test-secondary",
          fileName: "passkey1"
        },
        {
          region: "ap-northeast-1",
          bucket: "fides-access-test1",
          fileName: "passkey2"
        }
      ],
      key: passkey
    })
    console.log("recover from remote")
    console.log(entropy)
    const fromLocal = wallet.getEntoropyFromLocal({
      key: passkey
    })
    console.log("recover from local")
    console.log(fromLocal)
  }, [wallet, passkey])

  return (
    <div className="App">
      <header className="App-header">
        {isSignIn && (
          <div>
            <div>
              <button onClick={handleSignOut}>logout</button>
            </div>
            <div>
              <input type="text" onChange={handleChangeEncKey} value={encKey}/>
              <button onClick={handleCreateWithPassword}>create with password</button>
            </div>
            <div>
              <input type="text" onChange={handleChangDecKey} value={decKey}/>
              <button onClick={handleRecoverWithPassword}>recover with password</button>
            </div>
            {!passkey && (<div>
              <div>
                <button onClick={handleCreatePasskey}>create passkey(use first time to use passkey in this page)
                </button>
              </div>
              <div>
                <button onClick={handleUsePasskey}>use passkey(use second time or later)</button>
              </div>
            </div>)}
            {passkey && (<div>
              <div>
                <button onClick={handleCreateWithPasskey}>create with passkey</button>
              </div>
              <div>
                <button onClick={handleRecoverWithPasskey}>recover with passkey</button>
              </div>
            </div>)}
          </div>
        )}
        {!isSignIn && (
          <div>
            <button onClick={handleSignIn}>login</button>
          </div>
        )}
      </header>
    </div>
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const binary = bytes.reduce((acc, byte) => acc.concat(String.fromCharCode(byte)), '');
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string) {
  const binaryString = window.atob(base64);
  return new Uint8Array(
    [...binaryString].reduce<number[]>((acc, char) => (acc.push(char.charCodeAt(0)), acc), [])
  ).buffer;
}

export default App;
