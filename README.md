### WALKTHROUGH OF MAKING WALLET APP ON TEZOS
This is used mainly to test how broken, all Tezos wallet related libraries are.

Update 14th, April 2022:
I have found new stable libraries to replace `@tezos-core-tool/crypto-utils` along with other deps of it like `tweetnacl-auth`, as `Temple Wallet` no longer use those things but their own implementations with `taquito` and `ed25519-hd-key` instead.

After all broken mess, finally, we can pack all we need into this single file. Try running it as :

    npm run test

### BUILD TEZOS WALLET APP FLOW  
- Overview process : 

    mnemonic > seed > derive by index > b58cencode > create signer > ready to use.

- Details of the flow to build your own wallet app on Tezos is like :

- Use `bip39` to generate mnemonic words

- Use `bip39.mnemonicToSeedSync` to generate seed

- Now we need to `deriveSeed` by `derivationPath`, which is in-form of `m/44'/${TEZOS_BIP44_COINTYPE}'/${accountIndex}'/0'` where `TEZOS_BIP44_COINTYPE = 1729`.

- Encode that buffer again with 32 slices by `b58cencode` with `prefix.edsk2` to get the indexed private key, by the correct order of temple/kukai format.

- Now we can create `signer` to access your on-chain wallet and do whatever you want: `transfer_to` or interact with `contract`.

- The down road from there would be other wallet API integration like `beacon`, `temple-wallet` or `ledger`.

### CONCLUSION
I intended to build new wallet for various ideas, but after digging into tezos libraries, and all of those JS/TS mess, I feel more like wasting time there. So as usual, I document this experience back for whoever need it. As for me, that's enough and the world don't need another wallet app on Tezos chain. Maybe in the future, Tezos can upgrade node to support a more modern solution like NEAR wallet email verification.

A more formal approach would be reading source code of `kukai-wallet` and `temple-wallet`. They may have tactled the error with well-structured the project to avoid these troubles to happen, like compile down to JS instead of running directly via `ts-node` like I did. Because you know, write code and then transpiling it into sibling just to run, with dozen of trouble midway is painful.
