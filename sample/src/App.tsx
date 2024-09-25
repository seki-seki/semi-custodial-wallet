import React from 'react';
import logo from './logo.svg';
import './App.css';
import { bip32, encryptor, splitter, AmplifyWrrapper } from "semi-custodial-wallet";
import config from "./aws-exports";
import {
  useEffect, useState
} from "react";

function App() {
  const [session, setSession] = useState<any>()
  const amplify = new AmplifyWrrapper(config);
  useEffect(() => {
    const setup = async () => {
      const amplifySession = await amplify.getSession();
      setSession(amplifySession);
      console.log(amplifySession);
      console.log("set up")
    }
    setup();
  },[]);
  useEffect(() => {
    if(!session) return;
    const entropy = bip32.createEntropy();
    console.log(entropy)
    console.log(bip32.entropyToMnemonic(entropy))
    const splitEntropy = splitter.split(entropy,2)
    console.log(splitEntropy)
    console.log(splitter.concat(splitEntropy))
    const encrypted = splitEntropy.map((part: string) => {
      const key = encryptor.createRandomKey();
      const cipher = encryptor.encryptWithRandomIv(part,key);
      console.log(cipher)
      console.log(encryptor.decryptWithLastIv(cipher,key))
      return cipher;
    })
    const upload = async() => {
      await amplify.upload("ap-northeast-1", "fides-access-test", "test4.text", encrypted[0])
      await amplify.upload("ap-northeast-1", "fides-test-secondary", "test4.text", encrypted[1])
      console.log("upload")
    }
    upload()
  },[session])
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      {/*<LoginButton/>*/}
    </div>
  );
}

// const LoginButton = () => {
//   const handleLogin = () => {
//     // CognitoのホストされたUIにリダイレクト
//     window.location.href = 'https://fides-samile.auth.ap-northeast-1.amazoncognito.com/oauth2/authorize?client_id=2hippmrs2hj7cif1fm96os27gu&response_type=token&scope=openid&redirect_uri=http%3A%2F%2Flocalhost%3A3000';
//   };
//
//   return (
//     <button onClick={handleLogin}>
//       Login with Cognito
//     </button>
//   );
// };
export default App;
