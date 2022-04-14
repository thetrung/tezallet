///
import { TezosToolkit } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'
import { mnemonicToSeed } from './crypto-utils/utils'
import { keyPairFromAccountIndex } from './crypto-utils/hd'
import "bip39"
///
const BALANCE_DIV = 1000000 // div by 1M
/// 
const rpcUrl = "https://ithacanet.ecadinfra.com"  // Ithaca Testnet.
const tezos = new TezosToolkit(rpcUrl)            // init new instance.

///
/// @description: import from array of words
const import_mnemonic = (mnemonic: string[]) => {
  return mnemonic.join(' ').toLowerCase().replace(/(\r\n|\n|\r)/gm, ' ').trim()
}
///
/// @description: create signer from mnemonic & index
const create_signer = (mnemonic: string, index: number) => {
  const seed = mnemonicToSeed(mnemonic, '', true)
  const keyPair = keyPairFromAccountIndex(seed, index)
  const signer = new InMemorySigner(keyPair.sk || '')
  return signer
}
///
/// @description: Transfer to test wallet on testnet
const transfer_to = async (account: string, address: string, amount: number) => {
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
//
const demo = async () => {
  const mnemonic = 'run include giggle half dizzy worth broccoli faith current wheel depth juice reduce width doctor'
  /// correct address :
  const address = "tz1hYe3pVtPq8JprqjFCSxrhpbfHPwDYVLXX"

  const signer = create_signer(mnemonic, 0)

  tezos.setSignerProvider(signer)

  const account = await signer.publicKeyHash() 

  const balance = (await tezos.rpc.getBalance(account)).toNumber()

  console.log("wallet: %s \nbalance: %d tez\n", account, balance/BALANCE_DIV)
  /// invoke test Tx:
  await transfer_to(account, address , 0.1)//tez
}

// Test
demo()

export default { demo, tezos, create_signer, transfer_to };