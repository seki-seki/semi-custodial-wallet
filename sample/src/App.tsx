import React from 'react';
import logo from './logo.svg';
import './App.css';
import { bip32, encryptor, splitter } from "semi-custodial-wallet";

function App() {
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
    </div>
  );
}

export default App;
