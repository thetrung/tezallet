///
import { TezosToolkit } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'
import { mnemonicToSeed } from './crypto-utils/utils'
import { keyPairFromAccountIndex } from './crypto-utils/hd'
///
const balanceDiv = 1000000 // div by 1M
/// 
const rpcUrl = "https://ithacanet.ecadinfra.com"  // Ithaca Testnet.
const tezos = new TezosToolkit(rpcUrl)            // init new instance.
//
// mnemonic_sample.join(' ').toLowerCase().replace(/(\r\n|\n|\r)/gm, ' ').trim()
///
const mnemonic = 'run include giggle half dizzy worth broccoli faith current wheel depth juice reduce width doctor'
const seed = mnemonicToSeed(mnemonic, '', true)
const keyPair = keyPairFromAccountIndex(seed, 0)
const signer = new InMemorySigner(keyPair.sk || '')
tezos.setSignerProvider(signer)
/// correct address :
const address = "tz1hYe3pVtPq8JprqjFCSxrhpbfHPwDYVLXX"
//
const main = async () => {
  const account = await signer.publicKeyHash() 
  const balance = (await tezos.rpc.getBalance(account)).toNumber()
  console.log("wallet: %s \nbalance: %d tez\n", account, balance/balanceDiv)
  /// invoke test Tx:
  await transfer_to(account, address , 0.1)//tez
}

main()
///
/// @description: Transfer to test wallet on testnet
async function transfer_to(account: string, address: string, amount: number)
{
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
    const balance = (await tezos.rpc.getBalance(account)).toNumber()/balanceDiv 
    console.log("%ds for Tx: %s \nbalance: %d tez\n" ,duration ,result.block.hash, balance)
  } 
  else console.log("error: %s", result.block)  
}

export default main;