/// @ts-check
/// taquito :
import { TezosToolkit } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'
import { b58cencode, prefix } from '@taquito/utils'

import { derivePath } from 'ed25519-hd-key' 
import {validateMnemonic, mnemonicToSeedSync } from "bip39"


const isDefined = <T>(value: T | undefined | null): value is T => value !== undefined && value !== null;

type MaybeString = string | number | boolean | object | undefined | null;

export const isString = (str: MaybeString): str is string =>
  isDefined(str) && typeof str === 'string' && str.length !== 0;


/// @description: import from array of words
const trim_mnemonic = (mnemonic: string[]) => {
  return mnemonic.join(' ').toLowerCase().replace(/(\r\n|\n|\r)/gm, ' ').trim()
}

const generateMnemonic = (numberOfWords = 15): string => {
  if ([15, 18, 21, 24].indexOf(numberOfWords) !== -1) {
    return generateMnemonic((numberOfWords * 32) / 3);
  } else {
    throw new Error('InvalidNumberOfWords');
  }
};

const validMnemonic = (mnemonic: string): boolean => {
  return validateMnemonic(mnemonic);
};

const mnemonicToSeed = (mnemonic: string, passphrase = '', bip32Seed = false): Buffer => {
  if (!validMnemonic(mnemonic)) {
    throw new Error('InvalidMnemonic');
  }
  return mnemonicToSeedSync(mnemonic, passphrase).slice(0, bip32Seed ? 64 : 32);
};

const TEZOS_BIP44_COINTYPE = 1729;
const getDerivationPath = (accountIndex: number) => `m/44'/${TEZOS_BIP44_COINTYPE}'/${accountIndex}'/0'`;

const deriveSeed = (seed: Buffer, derivationPath: string) => {
  try {
    const { key } = derivePath(derivationPath, seed.toString('hex'));

    return key;
  } catch (_err) {
    throw new Error('Invalid derivation path');
  }
}

const seedToPrivateKey = (seed: Buffer, derivationPath?: string) => {
  const derivedSeed = isString(derivationPath) ? deriveSeed(seed, derivationPath) : seed;

  return b58cencode(derivedSeed.slice(0, 32), prefix.edsk2);
};

/// @description: create signer from mnemonic & index
const create_signer = (mnemonic: string, index: number) => {
  const seed = mnemonicToSeed(mnemonic, '', true)
  const key = seedToPrivateKey(seed, getDerivationPath(index))
  const signer = new InMemorySigner(key)
  return signer
}

/// @description: Transfer to test wallet
const transfer_to = async (tezos: TezosToolkit, account: string, address: string, amount: number) => {
  const counting = new Date().getTime()
  console.log("sending %d tez >> %s", amount, address)
  const op = await tezos.wallet.transfer({
    to: address,
    amount: amount
  }).send()
  const result = await op.confirmation() // listen for confirmation 
  ///
  if(result.completed) {
    const duration = (new Date().getTime() - counting) % (1000 * 60) / 1000
    // refresh balance again.
    const balance = (await tezos.rpc.getBalance(account)).toNumber()/BALANCE_DIV 
    console.log("%ds for Tx: %s \nbalance: %d tez\n" ,duration ,result.block.hash, balance)
  } 
  else console.log("error: %s", result.block)  
}

const BALANCE_DIV = 1000000 // div by 1M
//
const demo = async () => {
  const mnemonic = 'run include giggle half dizzy worth broccoli faith current wheel depth juice reduce width doctor'
  /// correct address :
  const address = "tz1hYe3pVtPq8JprqjFCSxrhpbfHPwDYVLXX"

  const rpcUrl = "https://ithacanet.ecadinfra.com"  // Ithaca Testnet.
  const tezos = new TezosToolkit(rpcUrl)            // init new instance.

  const signer = create_signer(mnemonic, 0)

  tezos.setSignerProvider(signer)

  const account = await signer.publicKeyHash() 

  const balance = (await tezos.rpc.getBalance(account)).toNumber()

  console.log("wallet: %s \nbalance: %d tez\n", account, balance/BALANCE_DIV)
  /// invoke test Tx:
  await transfer_to(tezos, account, address , 0.1)//tez
}

// Test
demo()

export default { demo, create_signer, transfer_to };