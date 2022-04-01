import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";

let rpcUrl = "https://ithacanet.ecadinfra.com"  // Ithaca Testnet.
let tezos = new TezosToolkit(rpcUrl)            // init new instance.


const amount = 1 //tez to Test
const balanceDiv = 1000000 // div by 1M
//
// Although my temple test wallet address was like :
const address = "tz1hYe3pVtPq8JprqjFCSxrhpbfHPwDYVLXX"
///
/// The mnemonic below won't generate that address because 
/// of different combination of salt we are putting in here.
let mnemonic = [
  "run", "include", "giggle", "half", "dizzy", "worth", "broccoli", "faith", 
  "current", "wheel", "depth", "juice", "reduce", "width", "doctor"
]
///
/// [0-1] arg is more like "salt" to change the order and rule to generate wallets.
/// we can use that to create as many wallets as we want.
/// found this on Temple wallet path:
/// `m/44'/${TEZOS_BIP44_COINTYPE}'/${accountIndex}'/0'`
///
/// But we can use this signer to create new wallets, with a fixed rule by our own system.
let signer = InMemorySigner.fromFundraiser("email", "password", mnemonic.join(" "))
tezos.setSignerProvider(signer)
/// create hashed address to use
let account = await signer.publicKeyHash()
console.log("account: " + account)
/// test if we can get balance from it
let balance = await tezos.rpc.getBalance(account)
console.log("balance: " + balance.toNumber()/1000000)

/// Transfer to test wallet on testnet :
async function test_transfer(){
  let counting = new Date().getTime()
  console.log("transfer: %d > %s", amount, address)
  let op = await tezos.wallet.transfer({
    to: address,
    amount: amount
  }).send()
  // listen for confirmation :
  let result = await op.confirmation()
  if(result.completed) {
    let duration = (new Date().getTime() - counting) % (1000 * 60) / 1000
    console.log("sent at " + result.block.hash + " after " + duration)
  }
  // refresh balance again.
  balance = await tezos.rpc.getBalance(account)
  console.log("new balance: " + balance.toNumber()/balanceDiv)
}
