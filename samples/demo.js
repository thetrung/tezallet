import * as tezallet from '../dist/index.mjs';

const mnemonic =
'run include giggle half dizzy worth broccoli '
+'faith current wheel depth juice reduce width doctor';

// Temple/Kukai address at index = [0]
const address = 'tz1hYe3pVtPq8JprqjFCSxrhpbfHPwDYVLXX'

const test_utils = ()  => {
  // test generate 
  const test_words = tezallet.generate_mnemonic()
  console.log(`- generate_mnemonic:\n${test_words}\n`)
  
  // test trim function
  const trim_words = tezallet.trim_mnemonic(['test', 'this', 'line'])
  console.log(`- trim_mnemonic: ${trim_words}\n`)

}

const test_wallet_fn = async () => {

  tezallet.init_tezos_toolkit(tezallet.RPC_URL.ECAD_Labs_Ghostnet) 


  // 5. create wallet at [0] 
  tezallet.create_signer(mnemonic, 0) 
  const account = await tezallet.signer.publicKeyHash()
  const is_matched = address === account
  console.log(`5. address[0] === other wallet `
  +`(${is_matched ? 'Ok':'Err'}) \n`
  + `${account} ${ is_matched ? '===' : '!='} ${address}\n`)

  // 6. transfer tez to address
  console.log("6. get_balance + transfer test:")
  const balance = await tezallet.get_balance(account)
  console.log('\n- balance: %d xtz\n', balance)

  await tezallet.transfer(address, 1, true) // 1 xtz

  // 7. transfer FA2 token test
  console.log("7. transfer FA2 token test :") 
  // test FA2_TOKEN on ghostnet 
  const FA2_TOKEN = 'KT1G5K4egfuWWs4Zs5WWhoXPRVETD1qKPYJ1'
  await tezallet.transfer(address, 100.0, true, null, FA2_TOKEN, 0)

  // Reset instance
  tezallet.reset()
}

const test_encryption = async () => {
  // Note:
  // init vector size = 16
  // pbkdf2_password length = 16
  //
  // 0. init_vector (16-bytes by default)
  let init_vector = tezallet.init_vector(16);
  console.log(`0. init_vector: ${init_vector}\n`)

  // 0.test pbdk2
  let pbkdf2_password = tezallet.encrypt_password('user_password', 'tezallet', 16)
  console.log(`1. pbkdf2_password = ${pbkdf2_password}\n`)

  // 2.encrypt_data
  let encrypted = tezallet.encrypt_data("This is secret.", pbkdf2_password, init_vector);
  console.log(`2. encrypt_data -> ${encrypted}\n`)

  // 3.decrypt_data
  let decrypted = tezallet.dencrypt_data(encrypted, pbkdf2_password, init_vector);
  console.log(`3. decrypt_data -> ${decrypted}\n`)


  const encrypted_mne = tezallet.encrypt_mnemonic(mnemonic, pbkdf2_password, init_vector);
  const decrypted_mne = tezallet.decrypt_mnemonic(encrypted_mne, pbkdf2_password, init_vector);
  const assert_6 = mnemonic === decrypted_mne;
  console.log(
    `4. origin vs. encrypted->decrypted (${assert_6 ? 'Ok':'Err'})\n${mnemonic} \n`
    +`${ assert_6 ? '===' : '!='} ${decrypted_mne}\n`)
};

export const demo = async () => {
  test_utils()
  test_wallet_fn()
  test_encryption()
}

demo()

export default {};