### WALKTHROUGH OF MAKING WALLET APP ON TEZOS
This is used mainly to test how broken, all Tezos wallet related libraries are.

- Update 14th, April 2022:
I have found new stable libraries to replace `@tezos-core-tool/crypto-utils` along with other deps of it like `tweetnacl-auth`, as `Temple Wallet` no longer use those things but their own implementations with `taquito` and `ed25519-hd-key` instead.

After all broken mess, finally, we can pack all we need into this single file. Try running it as :

        npm run test
    
- Install deps on any import :

        npm i ed25519-hd-key @taquito/taquito @taquito/signer @taquito/utils bip39
    

### BUILD TEZOS WALLET APP FLOW  
- Overview process : 

        mnemonic > seed > derive by index > b58cencode > create signer > ready to use.

#### - Details of the flow to build your own wallet app on Tezos is like :

- Use `bip39` to generate mnemonic words

- Use `bip39.mnemonicToSeedSync` to generate seed

- Now we need to `deriveSeed` by `derivationPath`, which is in-form of `m/44'/${TEZOS_BIP44_COINTYPE}'/${accountIndex}'/0'` where `TEZOS_BIP44_COINTYPE = 1729`.

- Encode that buffer again with 32 slices by `b58cencode` with `prefix.edsk2` to get the indexed private key, by the correct order of temple/kukai format.

- Now we can create `signer` to access your on-chain wallet and do whatever you want: `transfer_to` or interact with `contract`.

- The down road from there would be other wallet API integration like `beacon`, `temple-wallet` or `ledger`.

### CONCLUSION
Problem when developing apps on web stack is the consistency of its libraries and ecosystem, which one wrong version or outdated library could ruin your whole function.

This is what I hate with this project but let's see how terrible it is on the way.
