import React, { useCallback, useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { SemiCustodialWallet } from "semi-custodial-wallet";
import config from "./aws-exports";

function App() {
  const [wallet, setWallet] = useState<SemiCustodialWallet>()
  const [isSignIn, setIsSignIn] = useState<boolean>();
  const [key, setKey] = useState<string>("");
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

  const handleChangeKey = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setKey(e.target.value)
  },[])
  const handleCreateWithPassword = useCallback(async() => {
    if (!wallet) throw "no wallet";
    if(!key) throw "no key";
    await wallet.create({
      distinations: [
        {
          region: "ap-northeast-1",
          bucket: "fides-test-secondary",
          fileName: "key1"
        },
        {
          region: "ap-northeast-1",
          bucket: "fides-access-test",
          fileName: "key2"
        }
      ],
      key
    })
    console.log("successfully create")
    },[wallet, key])
  return (
    <div className="App">
      <header className="App-header">
        {isSignIn && (
          <div>
            <div>
              <button onClick={handleSignOut}>logout</button>
            </div>
            <div>
              <input type="text" onChange={handleChangeKey} value={key}/>
              <button onClick={handleCreateWithPassword}>create with password</button>
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
