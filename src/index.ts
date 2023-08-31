/// @ts-check
/// Install: 
/// npm i ed25519-hd-key @taquito/taquito @taquito/signer @taquito/utils bip39 @quipuswap/sdk
import {Tzip12Module, tzip12} from '@taquito/tzip12';
import {TezosToolkit} from '@taquito/taquito';
import {InMemorySigner} from '@taquito/signer';
import {b58cencode, prefix, validateAddress} from '@taquito/utils';

// import {swap, batchify } from '@quipuswap/sdk';

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
const _mnemonicToEntropy = (mnemonic: string) => {
  return mnemonicToEntropy(mnemonic)

}

/**
 * Convert entropy to mnemonic
 * @param entropy as string
 * @returns mnemonic
 */
const _entropyToMnemonic = (entropy: string) => {
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

/**
 * generate 16 random bytes by default.
 * @returns Buffer of randombytes 
 */
export const init_vector = (size = 16) => { return randomBytes(size); }

/**
*  Encrypt the data with aes-256-cbc
* @param encrypted_data string to be encrypted
* @param security_key pbkdf2 password
* @param init_vector 16+ randomBytes
* @returns string of encrypted data
*/
export const encrypt_data = (data: string, pbkdf2_password = 'tezallet', init_vector: Buffer) => {
  // init the cipher function
  const cipher = createCipheriv(algorithm, Buffer.from(pbkdf2_password), init_vector);
  // encrypt the message
  let encryptedData = cipher.update(data, "utf-8", "hex");
  encryptedData += cipher.final("hex");
  return encryptedData;
}

/**
 *  Decrypt the encrypted message/data with aes-256-cbc
 * @param encrypted_data string to be decrypted
 * @param security_key pbkdf2 password
 * @param init_vector 16+ randomBytes
 * @returns string of decrypted data
 */
export const dencrypt_data = (
  encrypted_data: string, security_key: string, init_vector: Buffer) => {
  const decipher = createDecipheriv(algorithm, Buffer.from(security_key), init_vector);
  let decrypted = decipher.update(encrypted_data, "hex", "utf-8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * Encrypt mnemonic with a password+salt
 * @param mnemonic string of words
 * @param pbkdf2_password string created password with pbkdf2
 * @param init_vector string salt with 16 bytes length
 * @returns encrypted data string
 */
export const encrypt_mnemonic = (
  mnemonic:string, pbkdf2_password :string, init_vector: Buffer) => {
    const encoded = _mnemonicToEntropy(mnemonic);
    const encrypted = encrypt_data(encoded, pbkdf2_password, init_vector);
    return encrypted;
}

/**
 * Decrypt mnemonic with a password+salt
 * @param encrypted encrypted mnemonic by encrypte_mnemonic function.
 * @param pbkdf2_password created password with pbkdf2
 * @param init_vector with 16 bytes length
 * @returns decrypted data
 */
export const decrypt_mnemonic = (
  encrypted: string, pbkdf2_password :string, init_vector: Buffer) => {
  const decrypted = dencrypt_data(encrypted, pbkdf2_password, init_vector);
  const decoded = _entropyToMnemonic(decrypted);
  return decoded;
}

/**
 * RPC URL pasted from 'https://tezostaquito.io/docs/rpc_nodes/'
 * ( updated 21th July, 2023 )
 *  
 * ECAD Labs	Mainnet	https://mainnet.api.tez.ie	
 * ECAD Labs	Ghostnet	https://ghostnet.ecadinfra.com	
 * ECAD Labs	Nairobinet	https://nairobinet.ecadinfra.com	
 * ECAD Labs	Mumbainet	https://mumbainet.ecadinfra.com	
 * SmartPy	Mainnet	https://mainnet.smartpy.io	
 * SmartPy	Ghostnet	https://ghostnet.smartpy.io	
 * Tezos Foundation	Mainnet	https://rpc.tzbeta.net/	
 * Marigold	Mainnet	https://mainnet.tezos.marigold.dev/	
 * Marigold	Ghostnet	https://ghostnet.tezos.marigold.dev/	
 * Marigold	Nairobinet	https://nairobinet.tezos.marigold.dev/	
 * Marigold	Mumbainet	https://mumbainet.tezos.marigold.dev/	
 * TezTools	Mainnet	https://eu01-node.teztools.net/	
 *
 */
export enum RPC_URL {
  ECAD_Labs_Mainnet	= "https://mainnet.api.tez.ie",
  ECAD_Labs_Ghostnet	= "https://ghostnet.ecadinfra.com",
  ECAD_Labs_Nairobinet	= "https://nairobinet.ecadinfra.com",
  ECAD_Labs_Mumbainet	= "https://mumbainet.ecadinfra.com",
  SmartPy_Mainnet	= "https://mainnet.smartpy.io",
  SmartPy_Ghostnet	= "https://ghostnet.smartpy.io",
  Tezos_Foundation_Mainnet	= "https://rpc.tzbeta.net/",
  Marigold_Mainnet	= "https://mainnet.tezos.marigold.dev/",
  Marigold_Ghostnet	= "https://ghostnet.tezos.marigold.dev/",
  Marigold_Nairobinet	= "https://nairobinet.tezos.marigold.dev/",
  Marigold_Mumbainet	= "https://mumbainet.tezos.marigold.dev/",
  TezTools_Mainnet	= "https://eu01-node.teztools.net/"
}

/**
 * TezosToolkit instance
 */
export let toolkit:TezosToolkit;

/**
 * InMemorySigner
 */
export let signer:InMemorySigner;
/**
 * init tezos toolkit with given RPCURL enum, or customURL if rpcURL=null.
 * @param rpcUrl chosen rpcURL to init.
 */
export const init_tezos_toolkit = (rpcUrl: RPC_URL, customURL = '') => {
  // Init by RPC_URL :
  toolkit = new TezosToolkit(rpcUrl || customURL)
  // adding tzip12 to read metadata of FA2 tokens :
  toolkit.addExtension(new Tzip12Module())
  return toolkit
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
  toolkit.setSignerProvider(signer);
  return signer;
};

/**
 * Default Tezos Unit balance
 */
export const TEZOS_UNIT = 1000000;

/**
 * @description — Used to check if an address or a contract address is valid.
 * @param address - Address to be validated.
 * @returns — 0 (NO_PREFIX_MATCHED), 1 (INVALID_CHECKSUM), 2 (INVALID_LENGTH) or 3 (VALID).
 */
export const validate_address = async (address:string):Promise<boolean> =>{
  const result = validateAddress(address)
  switch(result){
    case 0: console.log('[validate_address]: NO_PREFIX_MATCHED ', address); break
    case 1: console.log('[validate_address]: INVALID_CHECKSUM ', address); break
    case 2: console.log('[validate_address]: INVALID_LENGTH ', address); break
    case 3: console.log('[validate_address]: VALID_ADDRESS ', address); break
  }
  return result == 3
}

/**
 * Get balance from an address.
 * @param account address to get balance
 * @returns number divided by 1,000,000 unit.
 */
export const get_balance = async (account:string): Promise<number> => {
  // validate dest-address first :
  if(validateAddress(account) != 3) {
    console.log('[get_balance] error: address %s is not valid.', account)
    return -1;
  }
  const balance = (await toolkit.rpc.getBalance(account)).toNumber()
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
  is_debug = false,
  signer: InMemorySigner = null,
  fa2_token: string = null,
  fa2_token_id = 0 
) => {
  // validate dest-address first :
  if(validateAddress(dest)!=3) {
    console.log('[transfer] error: address %s is not valid ', dest)
    return;
  }
  // validate amount > 0 :
  if(amount <= 0) {
    console.log('[transfer] error: amount( %d ) need to be bigger than zero.', amount)
    return;
  }
  
  const counting = new Date().getTime();
  // If custom signer is needed
  if(signer) toolkit.setSignerProvider(signer)
  // check fa2 token
  let contract = null
  let transfer_params = null
  if (fa2_token) {
    contract = await toolkit.wallet.at(fa2_token, tzip12)
    // is valid contract ?
    if(!contract){
      console.log('error: contract %s is not valid.', fa2_token)
      return;
    }
    else {
      console.log('valid contract : %s ', fa2_token)

      const pkh = await toolkit.wallet.pkh()
      const metadata = await contract.tzip12().getTokenMetadata(fa2_token_id)
      if(is_debug) console.log('metadata: %s \ndecimals: %d',
      metadata, 10 ** metadata.decimals)
      transfer_params = [
        {
          from_: pkh,
          txs: 
          [
            {
                to_: dest,
                token_id: fa2_token_id,
                amount: amount * (10 ** metadata.decimals) // decimals 
            },
            // could be a batch/airdrop here {}
          ]
        }
      ]
      // Log
      if(is_debug) console.log('sending %d $%s >> %s', amount, metadata.symbol ,dest);
    }
  } else {
    // Log
    if(is_debug) console.log('sending %d %s >> %s', amount, 'tez' ,dest);
  }
  
  // sending
  const op = fa2_token == null && contract == null ? 
  await toolkit.wallet.transfer({to: dest, amount: amount}).send() :
  await contract.methods.transfer(transfer_params).send();  
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

// /**
//  * @description estimate a swap value ( QuipuSwap SDK)
//  * @param tezos TezosToolkit object with signer.
//  * @param fa12_factory QuipuSwap fa1.2 factory contract 
//  * @param fa20_Factory QuipuSwap fa2.0 factory contract
//  * @param from_asset [source KT..address] or ['tez' for XTZ]
//  * @param to_asset [dest KT..address] or ['tez' for XTZ]
//  * @param id_from source contract id, zero by default
//  * @param id_to dest contract id, zero by default
//  */
// export const estimate_swap = async (
//   tezos: TezosToolkit, fa12_factory: string, fa20_Factory: string,
//   from_asset: string, to_asset: string, amount: number,
//   id_from:number = null, id_to:number = null) => {
//   /**
//    * From QuipuSwap SDK sample :
//    */
//   const factories = {
//     fa1_2Factory: fa12_factory,
//     fa2Factory: fa20_Factory,
//   };
//   (async () => {
//     try { 
//       // Configure Pair :
//       const XTZ = "tez"
//       // from asset :
//       const src_asset = from_asset == XTZ ? XTZ : {
//         contract: from_asset,
//         id: id_from ? id_from : 0
//       }
//       // to asset :
//       const dest_asset = to_asset == XTZ ? XTZ : {
//         contract: from_asset,
//         id: id_to ? id_from : 0
//       };
//       // ETA :
//       const estimated_value = await estimateSwap(
//         tezos,
//         factories,
//         src_asset,
//         dest_asset,
//         { inputValue: amount }
//       )
//       console.info(estimated_value)
//     } catch (err) {
//       console.error(err);
//     }
//   })();
// }


// /**
//  * @description swap token A -> token B ( QuipuSwap SDK )
//  * @param tezos TezosToolkit object with signer.
//  * @param fa12_factory QuipuSwap fa1.2 factory contract 
//  * @param fa20_Factory QuipuSwap fa2.0 factory contract
//  * @param from_asset [source KT..address] or ['tez' for XTZ]
//  * @param to_asset [dest KT..address] or ['tez' for XTZ]
//  * @param id_from source contract id, zero by default
//  * @param id_to dest contract id, zero by default
//  * @param slippage 0.5% by default
//  */
// export const swap_token = async (
//   tezos: TezosToolkit, fa12_factory: string, fa20_Factory: string,
//   from_asset: string, to_asset: string, amount: number,
//   id_from:number = null, id_to:number = null,
//   slippage = 0.005 /** 0.5% */) => {
//   /**
//    * From QuipuSwap SDK sample :
//    */
//   const factories = {
//     fa1_2Factory: fa12_factory,
//     fa2Factory: fa20_Factory,
//   };
//   (async () => {
//     try { 
//       // Configure Pair :
//       const XTZ = "tez"
//       // from asset :
//       const src_asset = from_asset == XTZ ? XTZ : {
//         contract: from_asset,
//         id: id_from ? id_from : 0
//       }
//       // to asset :
//       const dest_asset = to_asset == XTZ ? XTZ : {
//         contract: from_asset,
//         id: id_from ? id_from : 0
//       };
//       // ETA :
//       const swap_params = await swap(
//         tezos,
//         factories,
//         src_asset,
//         dest_asset,
//         amount,
//         slippage
//       )
//       const op = await batchify(tezos.wallet.batch([]), swap_params).send();
//       console.info(op.opHash);
//       await op.confirmation();
//       console.info("Complete");
//     } catch (err) {
//       console.error(err);
//     }
//   })();
// }

/**
 * Re-init TezosToolkit instance again for fresh season.
 * @returns nothing.
 */
export const reset = () => {

  // override with new instance
  toolkit = new TezosToolkit(toolkit.rpc.getRpcUrl())

  // clean up signer
  signer = null
}

export default {};
