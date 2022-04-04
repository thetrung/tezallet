### WALKTHROUGH OF MAKING WALLET APP ON TEZOS
This is used mainly to test how broken, all Tezos wallet related libraries are.

It's more like a loophole, once you convert sample source into typescript to satisfy all imports because `@tezos-core-tool/crypto-utils` is too old now, then all in a sudden, some other libraries that it rely on like `tweetnacl-auth` didn't implement type description to satisfy `ts-node` requirement. But maybe, putting this into a good react boilplate can fix all problems.

I also can say, most guides out there are pretty bad written, especially the official one on tezos site, which only give you typescript sample code, while in fact you still can write it with JS, even easier.

There you go, a broken mess. 

Anyway, this project still can run as: 

    tsc wallet.ts && node wallet.js

Also we still can generate mnemonic words, correct seed key index alike to `Temple Wallet` and `Kukai`. 

### BUILD TEZOS WALLET APP FLOW  
The flow to build your own wallet app on Tezos is like :

- Use `bip39` to generate mnemonic words

- Use `utils` & `hd` from `crypto-utils` to generate seed from this will correct address index, which you won't be able to do if following below bare-function of `taquito`.

- Call `InMemorySigner.fromFundraiser` from `taquito\signer` to  input joined mnemonic words with 1st two args as salt if you like, but this will be far from wallet address generated with popular wallets, because they modify seed by derivation nodes based on given wallet index.

- Now you can use `signer` to access your on-chain wallet and do whatever you want: `transfer` or interact with `contract`.

- The down road from there would be other wallet API integration like `beacon`, `temple-wallet` or `ledger` as well as various function like swap, buy w/ fiat, etc.

### CONCLUSION
I intended to build new wallet for various idea, but after digging into tezos libraries, and all of those JS/TS mess, I feel more like wasting time there. So as usual, I document this experience back for whoever need it.

A more formal approach would be reading source code of `kukai-wallet` and `temple-wallet`. They may have tactled the error and well-structured the project to avoid these to happen. Perhaps, they all compile down to JS instead of running directly via `ts-node` like I did. Because you know, write code and then transpiling it into sibling just to run, with dozen of trouble midway is painful.