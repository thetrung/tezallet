import * as tezallet from '../dist/index.mjs';

export const demo = async () => {

  // test generate 
  const test_words = tezallet.generate_mnemonic()
  console.log(`generate_mnemonic:\n${test_words}\n`)
  
  // test trim function
  const trim_words = tezallet.trim_mnemonic([
    'test', 'this', 'line'
  ])
  console.log(`trim_mnemonic: ${trim_words}\n`)

  // tezallet.init_tezos_toolkit(null, "https://ithacanet.ecadinfra.com");
  tezallet.init_tezos_toolkit(tezallet.RPC_URL.ECAD_LABS_Ithacane); // init new instance.

  const mnemonic =
    'run include giggle half dizzy worth broccoli faith current wheel depth juice reduce width doctor';

  tezallet.create_signer(mnemonic, 0); // wallet[0] or 1st wallet.
  /// correct address :
  const address = 'tz1hYe3pVtPq8JprqjFCSxrhpbfHPwDYVLXX';
  const account = await tezallet.signer.publicKeyHash();
  console.log(`${address} == ${account}\n`);

  const balance = await tezallet.get_balance(account);
  console.log('\nbalance: %d xtz\n', balance);

  /// invoke test Tx:
  await tezallet.transfer(address, 1, true); //tez
};

demo()

export default {};