// 1st party
import { RippleAPI } from 'ripple-lib';
// import * as cc from 'five-bells-condition';

// TODO: connect via command
const api = new RippleAPI({server: "ws://s.devnet.rippletest.net:51233"});

export const classicAddressToXAddress = function (classicAddress: string, optionsString: string) {
  const options = optionsString.split(' ');
  const tagString = options[0];
  const testString = options[1];
  return RippleAPI.classicAddressToXAddress(classicAddress, tagString === 'false' ? false : parseInt(tagString, 10), testString === 'false' ? false : true);
}

export const sign = function (type: string, optionsString: string) {
  if (type !== 'secret' && type !== 'keypair') {
    return 'Not supported';
  }
  const options = JSON.parse(optionsString);
  if (!options.txJSON) {
    return 'Missing required field: txJSON';
  }

  // TODO: implement interactive mode where each of these things is provided one at a time
  // .question

  return api.sign(options.txJSON, options.secret || options.keypair, options.options);

  // We could automatically generate the public key from the private key:

  // keypair	object	Optional The private and public key of the account that is initiating the transaction. (This field cannot be used with secret).
  // keypair. privateKey	privateKey	The uppercase hexadecimal representation of the secp256k1 or Ed25519 private key.
  // keypair. publicKey	publicKey	The uppercase hexadecimal representation of the secp256k1 or Ed25519 public key.
  // options	object	Optional Options that control the type of signature that will be generated.
  // options. signAs	address	Optional The account that the signature should count for in multisigning.
}

export const prepareTransaction = async function (type: string, optionsString: string) {
  console.log(`optionsString: ${optionsString}`);

  await api.connect();

  /*
  {
    "TransactionType": "AccountDelete",
    "Account": "rM5qup5BYDLMXaR5KU1hiC9HhFMuBVrnKv",
    "Destination": "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe",
    "LastLedgerSequence": 3231818
  }
  */

  return api.prepareTransaction(JSON.parse(optionsString));

  // const options = JSON.parse(optionsString);
  // if (!options.txJSON) {
  //   return 'Missing required field: txJSON';
  // }

  // return api.sign(options.txJSON, options.secret || options.keypair, options.options);

  // We could automatically generate the public key from the private key:

  // keypair	object	Optional The private and public key of the account that is initiating the transaction. (This field cannot be used with secret).
  // keypair. privateKey	privateKey	The uppercase hexadecimal representation of the secp256k1 or Ed25519 private key.
  // keypair. publicKey	publicKey	The uppercase hexadecimal representation of the secp256k1 or Ed25519 public key.
  // options	object	Optional Options that control the type of signature that will be generated.
  // options. signAs	address	Optional The account that the signature should count for in multisigning.
}
