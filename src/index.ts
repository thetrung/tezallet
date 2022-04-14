/// @ts-check
/// taquito :
import {TezosToolkit} from '@taquito/taquito';
import {InMemorySigner} from '@taquito/signer';
import {b58cencode, prefix} from '@taquito/utils';

import {derivePath} from 'ed25519-hd-key';
import {validateMnemonic, mnemonicToSeedSync} from 'bip39';

///
/// Copy from Temple Wallet
///
const isDefined = <T>(value: T | undefined | null): value is T =>
  value !== undefined && value !== null;

type MaybeString = string | number | boolean | object | undefined | null;

const isString = (str: MaybeString): str is string =>
  isDefined(str) && typeof str === 'string' && str.length !== 0;

/// @description: import from array of words
export const trim_mnemonic = (mnemonic: string[]) => {
  return mnemonic
    .join(' ')
    .toLowerCase()
    .replace(/(\r\n|\n|\r)/gm, ' ')
    .trim();
};

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

/// @description: create signer from mnemonic & index
export const create_signer = (mnemonic: string, index: number) => {
  const seed = mnemonicToSeed(mnemonic, '', true);
  const key = seedToPrivateKey(seed, getDerivationPath(index));
  const signer = new InMemorySigner(key);
  return signer;
};

export const TEZOS_UNIT = 1000000;

/// @description: Transfer to test wallet
export const transfer_to = async (
  tezos: TezosToolkit,
  account: string,
  address: string,
  amount: number,
) => {
  const counting = new Date().getTime();
  console.log('sending %d tez >> %s', amount, address);
  const op = await tezos.wallet
    .transfer({
      to: address,
      amount: amount,
    })
    .send();
  // listen for confirmation
  const result = await op.confirmation();
  ///
  if (result.completed) {
    const duration = ((new Date().getTime() - counting) % (1000 * 60)) / 1000;
    // refresh balance again.
    const balance =
      (await tezos.rpc.getBalance(account)).toNumber() / TEZOS_UNIT;
    console.log(
      '%ds for Tx: %s \nbalance: %d tez\n',
      duration,
      result.block.hash,
      balance,
    );
  } else {
    console.log('error: %s', result.block);
  }
};

export default {};
