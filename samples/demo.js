import * as tezallet from '../dist/index.mjs';

export const demo = async () => {

  // test generate 
  const test_words = tezallet.generate_mnemonic()
  console.log(`generate_mnemonic:\n${test_words}\n`)
  
  // test trim function
  const trim_words = tezallet.trim_mnemonic(['test', 'this', 'line'])
  console.log(`trim_mnemonic: ${trim_words}\n`)

  // tezallet.init_tezos_toolkit(null, "https://ithacanet.ecadinfra.com");
  tezallet.init_tezos_toolkit(tezallet.RPC_URL.ECAD_LABS_Ithacane) // init new instance.

  const mnemonic =
    'run include giggle half dizzy worth broccoli faith current wheel depth juice reduce width doctor';

  // 0.test pbdk2
  let pbkdf2_password = tezallet.encrypt_password('user_password', 'tezallet', 16)
  console.log(`0. pbkdf2_password = ${pbkdf2_password}\n`)

  // 0.mnemonic -> entropy
  let encoded = tezallet.mnemonicToEntropy_(mnemonic)
  console.log(`0. mnemonic -> entropy: ${encoded}\n`)

  // 1. init_vector (16-bytes)
  let init_vector = tezallet.init_vector();
  console.log(`0. init_vector: ${init_vector}\n`)

  // Note:
  // init vector size = 16
  // pbkdf2_password length = 16

  // 2.encrypt_data
  let encrypted = tezallet.encrypt_data(encoded, pbkdf2_password, init_vector);
  console.log(`2. encrypt entropy -> ${encrypted}\n`)

  // 3.decrypt_data
  let decrypted = tezallet.dencrypt_data(encrypted, pbkdf2_password, init_vector);
  console.log(`3. decrypt entropy -> ${decrypted}\n`)  

  // 4.entropy -> mnemonic
  let decoded = tezallet.entropyToMnemonic_(decrypted)
  console.log(`4. entropy -> mnemonic: ${decoded}\n`)

  // 5.wallet[0] or 1st wallet
  tezallet.create_signer(mnemonic, 0) 
  /// correct address :
  const address = 'tz1hYe3pVtPq8JprqjFCSxrhpbfHPwDYVLXX'
  const account = await tezallet.signer.publicKeyHash()
  const is_matched = address === account
  console.log(`5. (${is_matched ? 'Ok':'Err'}) ${account} ${ is_matched ? '===' : '!='} ${address}\n`)

  let encrypted_mne = tezallet.encrypt_mnemonic(mnemonic, pbkdf2_password, init_vector);
  let decrypted_mne = tezallet.decrypt_mnemonic(encrypted_mne, pbkdf2_password, init_vector);
  let assert_6 = mnemonic === decrypted_mne;
  console.log(`6. (${assert_6 ? 'Ok':'Err'}) ${mnemonic} \n${ is_matched ? '===' : '!='} ${decrypted_mne}\n`)


  const balance = await tezallet.get_balance(account)
  console.log('\nbalance: %d xtz\n', balance)
  await tezallet.transfer(address, 1, true) //tez
};

demo()

export default {};