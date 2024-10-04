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

  const handleRecoverWithPassword = useCallback(async () => {
    if (!wallet) throw "no wallet";
    if (!encKey) throw "no key";
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
    console.log(entropy)
  }, [wallet, decKey])


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

export default App;
