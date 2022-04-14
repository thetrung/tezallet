import {TezosToolkit} from '@taquito/taquito';
import {create_signer, transfer_to, TEZOS_UNIT} from './index';

export const demo = async () => {
  const mnemonic =
    'run include giggle half dizzy worth broccoli faith current wheel depth juice reduce width doctor';
  /// correct address :
  const address = 'tz1hYe3pVtPq8JprqjFCSxrhpbfHPwDYVLXX';

  const rpcUrl = 'https://ithacanet.ecadinfra.com'; // Ithaca Testnet.
  const tezos = new TezosToolkit(rpcUrl); // init new instance.

  const signer = create_signer(mnemonic, 0);

  tezos.setSignerProvider(signer);

  const account = await signer.publicKeyHash();

  const balance = (await tezos.rpc.getBalance(account)).toNumber();

  console.log('wallet: %s \nbalance: %d tez\n', account, balance / TEZOS_UNIT);

  /// invoke test Tx:
  await transfer_to(tezos, account, address, 0.1); //tez
};

demo()
