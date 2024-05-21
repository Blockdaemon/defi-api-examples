import { Wallet } from 'ethers';

const wallet = Wallet.createRandom();

console.log("Mnemonic:    " + wallet.mnemonic.phrase);
console.log("Address:     " + wallet.address);
console.log("Private Key: " + wallet.privateKey);
