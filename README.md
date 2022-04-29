### A EASIER WAY WALLET APP ON TEZOS
I made this because `taquito` didn't include all necessary things to compose a similar wallet function to `Temple` and `Kukai`. While old libraries like `tezos-core-tool` are so old and depricated to use nowadays.

- Update 14th, April 2022:
I replaced [`@tezos-core-tool/crypto-utils`, `tweetnacl-auth`, `tweetnacl`] => with [`ed25519-hd-key` && `bip39`] instead.

*After all broken mess, finally, we can pack all we need into this single file.*


### INSTALLATION

        npm i tezallet

### USAGE
Full Demo at `samples/demo.js`:

        import * as tezallet from 'tezallet';

        // test generate 
        const test_words = tezallet.generate_mnemonic()
        console.log(`generate_mnemonic:\n${test_words}\n`)
        //=> generate_mnemonic:
        //=> scale gift trumpet off cherry company stairs dog hole sense already grant
        
        // test trim function
        const trim_words = tezallet.trim_mnemonic(['test', 'this', 'line'])
        console.log(`trim_mnemonic: ${trim_words}\n`)
        // => trim_mnemonic: test this line

        tezallet.init_tezos_toolkit(tezallet.RPC_URL.ECAD_LABS_Ithacane); // init new instance.

        const mnemonic =
        'run include giggle half dizzy worth broccoli faith current wheel depth juice reduce width doctor';

        tezallet.create_signer(mnemonic, 0); // wallet[0] or 1st wallet.
        /// correct address :
        const address = 'tz1hYe3pVtPq8JprqjFCSxrhpbfHPwDYVLXX';
        const account = await tezallet.signer.publicKeyHash();
        console.log(`${address} == ${account}\n`);
        // => tz1hYe3pVtPq8JprqjFCSxrhpbfHPwDYVLXX == tz1hYe3pVtPq8JprqjFCSxrhpbfHPwDYVLXX

        const balance = await tezallet.get_balance(account);
        console.log('\nbalance: %d xtz\n', balance);
        // => balance: 140.891126 tez

        /// invoke test Tx:
        await tezallet.transfer(address, 1, true); //tez
        // => sending 1 tez >> tz1hYe3pVtPq8JprqjFCSxrhpbfHPwDYVLXX
        // => 21.062s for Tx: BLPwDsdaUQJMx7GUoKXBLxbEjHhfRargJg3QxUoo3b2EKRrSkc1 
        // => balance: 140.890682 tez
        };


### TEST PACKAGE

- Install deps first :

        npm i

or this if you want to try without tezallet:

        npm i ed25519-hd-key @taquito/taquito @taquito/signer @taquito/utils bip39


- Test-run above `Demo` functions :

        npm run test    


### LIBRARIES
that I'm using in this package:

        bip39
        ed25519-hd-key 
        @taquito/taquito 
        @taquito/signer 
        @taquito/utils 


### BUILD TEZOS WALLET APP FLOW  
- Overview process : 

        mnemonic > seed > derive by index > b58cencode > create signer > ready to use.

#### - Detailed flow to build your own Tezos wallet without Tezallet is like :

- Use `bip39` to generate mnemonic words

- Use `bip39.mnemonicToSeedSync` to generate seed

- Now we need to `deriveSeed` by `derivationPath`, which is in-form of `m/44'/${TEZOS_BIP44_COINTYPE}'/${accountIndex}'/0'` where `TEZOS_BIP44_COINTYPE = 1729`.

- Encode that buffer again with 32 slices by `b58cencode` with `prefix.edsk2` to get the indexed private key, by the correct order of temple/kukai format.

- Now we can create `signer` to access your on-chain wallet and do whatever you want: `transfer_to` or interact with `contract`.

- The down road from there would be other wallet API integration like `beacon`, `temple-wallet` or `ledger`.

### CONCLUSION
Problem when developing apps on web stack is the consistency of its libraries and ecosystem, which one wrong version or outdated library could ruin your whole function. This is what I hate with this project and want to improve further, even when I may not use it.
