# TEZALLET
[![NPM](https://img.shields.io/npm/v/tezallet.svg)](https://www.npmjs.org/package/tezallet)
[![maintainability](https://img.shields.io/codeclimate/maintainability-percentage/thetrung/tezallet?logo=code-climate&style=flat-square)](https://codeclimate.com/github/thetrung/tezallet)

### A EASIER WAY TO BUILD WALLET APP ON TEZOS
I made this because `taquito` didn't include all necessary things to compose a similar wallet function to `Temple` and `Kukai`. While old libraries like `tezos-core-tool` are so old and depricated to use nowadays.

- Update 14th, April 2022:
I replaced [`@tezos-core-tool/crypto-utils`, `tweetnacl-auth`, `tweetnacl`] => with [`ed25519-hd-key` && `bip39`] instead.

*After all broken mess, finally, we can pack all we need into this single file.*


### INSTALLATION

        npm i tezallet

### USAGE
Full Demo at `samples/demo.js`:

        import * as tezallet from 'tezallet';

        //
        // Wallet functions
        //
        // init tezos toolkit
        tezallet.init_tezos_toolkit(tezallet.RPC_URL.ECAD_LABS_Ithacane);

        // generate mnemonic
        const mnemonic = tezallet.generate_mnemonic()
 
        // create wallet[0] 
        tezallet.create_signer(mnemonic, 0);

        // transfer -> address + amount
        await tezallet.transfer(address, 1, true); //tez

        //
        // Encryption
        //
        // test pbdk2
        // 0. init_vector (16-bytes)
        let init_vector = tezallet.init_vector();
        console.log(`0. init_vector: ${init_vector}\n`)

        // 0.test pbdk2
        let pbkdf2_password = tezallet.encrypt_password('user_password', 'tezallet', 16)
        console.log(`1. pbkdf2_password = ${pbkdf2_password}\n`)

        // Note:
        // init vector size = 16
        // pbkdf2_password length = 16

        // 2.encrypt_data
        let encrypted = tezallet.encrypt_data(mnemonic, pbkdf2_password, init_vector);
        console.log(`2. encrypt mnemonic -> ${encrypted}\n`)

        // 3.decrypt_data
        let decrypted = tezallet.dencrypt_data(encrypted, pbkdf2_password, init_vector);
        console.log(`3. decrypt mnemonic -> ${decrypted}\n`)

        // 5.wallet[0] or 1st wallet
        tezallet.create_signer(mnemonic, 0) 
        /// correct address :
        const address = 'tz1hYe3pVtPq8JprqjFCSxrhpbfHPwDYVLXX'
        const account = await tezallet.signer.publicKeyHash()
        const is_matched = address === account
        console.log(`4. (${is_matched ? 'Ok':'Err'}) ${account} ${ is_matched ? '===' : '!='} ${address}\n`)

        let encrypted_mne = tezallet.encrypt_mnemonic(mnemonic, pbkdf2_password, init_vector);
        let decrypted_mne = tezallet.decrypt_mnemonic(encrypted_mne, pbkdf2_password, init_vector);
        let assert_6 = mnemonic === decrypted_mne;
        console.log(`5. (${assert_6 ? 'Ok':'Err'}) ${mnemonic} \n${ is_matched ? '===' : '!='} ${decrypted_mne}\n`)


### TEST && IMPROVE PACKAGE

- Install deps first :

        npm i

or this if you want to try without tezallet:

        npm i ed25519-hd-key @taquito/taquito @taquito/signer @taquito/utils bip39


- Test-run above `Demo` functions :

        npm run test    

- Make changes to `index.ts` and test `demo.js` :

        npm run build && npm run test

### LIBRARIES
that I'm using in this package:

        bip39
        pbkdf2
        crypto
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


### DISCLAIMER

THIS SOFTWARE IS PROVIDED "AS IS" AND ANY EXPRESSED OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
