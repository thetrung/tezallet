import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";
const balanceDiv = 1000000 // div by 1M
/// 
let rpcUrl = "https://ithacanet.ecadinfra.com"  // Ithaca Testnet.
let tezos = new TezosToolkit(rpcUrl)            // init new instance.
const salt = "tezallet"
const username = "username.tez"
const mnemonic = [ 
  "run", "include", "giggle", "half", "dizzy", "worth", "broccoli", "faith", 
  "current", "wheel", "depth", "juice", "reduce", "width", "doctor"
]
/// adding [0-1] to salt can generate as many wallets as we want after seed wallet.
///
/// found this on Temple wallet path:
/// `m/44'/${TEZOS_BIP44_COINTYPE}'/${accountIndex}'/0'`
const signer = InMemorySigner.fromFundraiser(username, salt, mnemonic.join(" "))
///
tezos.setSignerProvider(signer)
const account = await signer.publicKeyHash() 
let balance = await tezos.rpc.getBalance(account)
console.log("\nwallet: %s \nbalance: %d tez\n", account, balance.toNumber()/balanceDiv)
/// invoke test Tx:
transfer_to("tz1hYe3pVtPq8JprqjFCSxrhpbfHPwDYVLXX" , 0.1)//tez
///
/// @description: Transfer to test wallet on testnet
async function transfer_to(address, amount)
{
  let counting = new Date().getTime()
  console.log("sending %d tez >> %s", amount, address)
  let op = await tezos.wallet.transfer({
    to: address,
    amount: amount
  }).send()
  let result = await op.confirmation() // listen for confirmation 
  ///
  if(result.completed) {
    let duration = (new Date().getTime() - counting) % (1000 * 60) / 1000
    // refresh balance again.
    balance = (await tezos.rpc.getBalance(account)).toNumber()/balanceDiv 
    console.log("%ds for Tx: %s \nbalance: %d tez\n" ,duration ,result.block.hash, balance)
  } 
  else console.log("error: %s", result.block)  
}
