/// @ts-check
/// Install: 
/// npm i ed25519-hd-key @taquito/taquito @taquito/signer @taquito/utils bip39
import {TezosToolkit} from '@taquito/taquito';
import {InMemorySigner} from '@taquito/signer';
import {b58cencode, prefix} from '@taquito/utils';

import {derivePath} from 'ed25519-hd-key';
import {
  generateMnemonic, validateMnemonic, 
  mnemonicToSeedSync, mnemonicToEntropy, 
  entropyToMnemonic} from 'bip39';
import { pbkdf2Sync, randomBytes, createCipheriv, createDecipheriv} from 'crypto';

///
/// Copy from Temple Wallet
///
const isDefined = <T>(value: T | undefined | null): value is T =>
  value !== undefined && value !== null;

type MaybeString = string | number | boolean | object | undefined | null;

const isString = (str: MaybeString): str is string =>
  isDefined(str) && typeof str === 'string' && str.length !== 0;


const mnemonicToSeed = (
  mnemonic: string,
  passphrase = '',
  bip32Seed = false,
): Buffer => {
  if (!validateMnemonic(mnemonic)) {
    throw new Error('InvalidMnemonic');
  }
  return mnemonicToSeedSync(mnemonic, passphrase).slice(0, bip32Seed ? 64 : 32);
};

const TEZOS_BIP44_COINTYPE = 1729;
const getDerivationPath = (accountIndex: number) =>
  `m/44'/${TEZOS_BIP44_COINTYPE}'/${accountIndex}'/0'`;

const deriveSeed = (seed: Buffer, derivationPath: string) => {
  try {
    const {key} = derivePath(derivationPath, seed.toString('hex'));

    return key;
  } catch (_err) {
    throw new Error('Invalid derivation path');
  }
};

const seedToPrivateKey = (seed: Buffer, derivationPath?: string) => {
  const derivedSeed = isString(derivationPath)
    ? deriveSeed(seed, derivationPath)
    : seed;

  return b58cencode(derivedSeed.slice(0, 32), prefix.edsk2);
};

/**
 * Convert mnemonic to entropy
 * @param mnemonic as string
 * @returns entropy
 */
export const mnemonicToEntropy_ = (mnemonic: string) => {
  return mnemonicToEntropy(mnemonic)

}

/**
 * Convert entropy to mnemonic
 * @param entropy as string
 * @returns mnemonic
 */
export const entropyToMnemonic_ = (entropy: string) => {
  return entropyToMnemonic(entropy)
}

/**
 * Generate 1-way encrypted password, which can't be decrypted.
 * The only way is to encrypt every password and compare hashed result.
 * @param password string
 * @param salt string
 * @returns 1-way encrypted password
 */
 export const encrypt_password = (
   password: string, 
   // optionals
   salt = 'salt', 
   length = 64,
   iteration = 100000, 
    digest = 'sha512') => {
  const derivedKey = pbkdf2Sync(password, salt, iteration, length, digest);
  return derivedKey.toString('hex');
}

/**
 * encrypt/decrypt algoritm
 * */ 
const algorithm = "aes-256-cbc"; 

// generate 16 bytes of random data
const init_vector = randomBytes(16);

// secret key generate 32 bytes of random data
const security_key = randomBytes(32);

/**
 * Encrypt the message/data with aes-256/16/32
 * @param message 
 * @returns 
 */
export const encrypt_data = (data: string) => {
  // init the cipher function
  const cipher = createCipheriv(algorithm, security_key, init_vector);
  // encrypt the message
  let encryptedData = cipher.update(data, "utf-8", "hex");
  encryptedData += cipher.final("hex");
  return encryptedData;
}

/**
 * Decrypt the encrypted message/data with aes-256/16/32
 * @param encryptedData encrypted data to be decrypted
 * @returns decrypted data
 */
export const dencrypt_data = (encrypted_data: string) => {
  // init decipher function
  const decipher = createDecipheriv(algorithm, security_key, init_vector);
  let decrypted = decipher.update(encrypted_data, "hex", "utf-8");
  decrypted += decipher.final("utf8");
  return decrypted;
}


/**
 * RPC URL pasted from 'https://tezostaquito.io/docs/rpc_nodes/'
 */
export enum RPC_URL {
  ECAD_LABS_Mainnet = "https://mainnet.api.tez.ie",
  ECAD_LABS_Hangzhoune = "https://hangzhounet.api.tez.ie",	
  ECAD_LABS_Ithacane = "https://ithacanet.ecadinfra.com",	
  SmartPy_Mainnet = "https://mainnet.smartpy.io",	
  SmartPy_Hangzhoune = "https://hangzhounet.smartpy.io/",	
  SmartPy_Ithacane = "https://ithacanet.smartpy.io/",	
  Tezos_Foundation_Mainnet = "https://rpc.tzbeta.net/",
  Tezos_Foundation_Ithacanet = "https://rpczero.tzbeta.net/",	
  LetzBake_Mainnet = "https://teznode.letzbake.com",
  GigaNode_Mainnet = "https://mainnet-tezos.giganode.io",	
  GigaNode_Hangzhounet = "https://testnet-tezos.giganode.io/"
}

export let tezos:TezosToolkit = null;
export let signer:InMemorySigner = null;
/**
 * init tezos toolkit with given RPCURL enum, or customURL if rpcURL=null.
 * @param rpcUrl chosen rpcURL to init.
 */
export const init_tezos_toolkit = (rpcUrl: RPC_URL, customURL = '') => {
  // could be re-init
  tezos = new TezosToolkit(rpcUrl || customURL)
  return tezos
}

/**
 * Trim the mnemonic from string array.
 * @param mnemonic array of words
 * @returns trimmed string
 *  */ 
export const trim_mnemonic = (mnemonic: string[]) => {
  return mnemonic
    .join(' ')
    .toLowerCase()
    .replace(/(\r\n|\n|\r)/gm, ' ')
    .trim();
};

/**
 * Generate mnemonic words as a string, from bip39 library.
 * @param strength optional strength, default = 128.
 * @returns string of words
 */
export const generate_mnemonic = (strength?: number, rng?:(size?: number)=> Buffer) => {
  return generateMnemonic(strength || 128, rng);
}

/**
 *  create signer from mnemonic at derive-path [index]
 * @param mnemonic your mnemonic words at length of [3-6-9-12-15-18-21-24]
 * @param index of your wallet
 * @returns signer object
 */
export const create_signer = (mnemonic: string, index: number, salt = '') => {
  const seed = mnemonicToSeed(mnemonic, salt, true);
  const key = seedToPrivateKey(seed, getDerivationPath(index));
  signer = new InMemorySigner(key, salt);
  tezos.setSignerProvider(signer);
  return signer;
};

/**
 * Default Tezos Unit balance
 */
export const TEZOS_UNIT = 1000000;

/**
 * Get balance from an address.
 * @param account address to get balance
 * @returns number divided by 1,000,000 unit.
 */
export const get_balance = async (account:string): Promise<number> => {
  const balance = (await tezos.rpc.getBalance(account)).toNumber()
  return balance/TEZOS_UNIT
}

/**
 * Transfer [amount] of $xtz from current wallet to [dest] address.
 * @param dest receiving address  
 * @param amount (xtz) of tezos to transfer
 * @param is_debug turn on for Tx duration
 */
export const transfer = async (
  dest: string,
  amount: number,
  is_debug = false
) => {
  const counting = new Date().getTime();
  if(is_debug) console.log('sending %d tez >> %s', amount, dest);
  // sending
  const op = await tezos.wallet
    .transfer({to: dest, amount: amount})
    .send();
  // listen for confirmation
  const result = await op.confirmation();
  ///
  if (result.completed) {
    // refresh balance again.
    if(is_debug) {
      const duration = ((new Date().getTime() - counting) % (1000 * 60)) / 1000;
      const balance = await get_balance(dest);
      console.log('%ds for Tx: %s \nbalance: %d tez\n', 
      duration, result.block.hash, balance);
    }
  } else {
    console.log('error: %s', result.block);
  }
};

export default {};
