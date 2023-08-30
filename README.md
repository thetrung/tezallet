# TEZALLET
[![NPM](https://img.shields.io/npm/v/tezallet.svg)](https://www.npmjs.org/package/tezallet)
[![maintainability](https://img.shields.io/codeclimate/maintainability-percentage/thetrung/tezallet?logo=code-climate&style=flat-square)](https://codeclimate.com/github/thetrung/tezallet)

### A EASIER WAY TO BUILD WALLET APP ON TEZOS
I made this because `taquito` didn't include all necessary features to compose a similar wallet to `Temple` and `Kukai` with an exact address-index order, while also lacking a lot of essential functions, and old libraries like `tezos-core-tool`,  `tweetnacl-auth`, `tweetnacl` are so old, depricated to use nowadays.

New user/devs should be able to try on making new wallet interaction with less confusion and immediate result.

*After all broken mess, finally, we can pack all we need into this single file.*


### [INSTALLATION](https://www.npmjs.com/package/tezallet)

        npm i tezallet

### USAGE
Full Demo at `samples/demo.js`:

        import * as tezallet from 'tezallet';

        //
        // Wallet functions
        //
        // init tezos toolkit
        tezallet.init_tezos_toolkit(tezallet.RPC_URL.ECAD_LABS_Ithacane)

        // generate new mnemonic
        const mnemonic = tezallet.generate_mnemonic()

        // create wallet at [0] 
        tezallet.create_signer(mnemonic, 0)

        // transfer -> ( address, amount, is_debug? )
        await tezallet.transfer(address, 1.0, true) //tez

        // transfer FA2 Token -> ( address, amount, is_debug?, custom_signer?, fa2_token?, fa2_token_id? )
        await tezallet.transfer(address, 1.0, true, null, FA2_TOKEN, FA2_TOKEN_ID) // FA2

        // validate_address -> (address)
        await tezallet.validate_address('tz123')

        // reset toolkit instance
        tezallet.reset()
        
        //
        // Encryption
        //
        // 0.init_vector (16-bytes)
        let init_vector = tezallet.init_vector()
        let pbkdf2_password = tezallet.encrypt_password('user_password', 'tezallet', 16)
        let encrypted_mne = tezallet.encrypt_mnemonic(mnemonic, pbkdf2_password, init_vector)
        let decrypted_mne = tezallet.decrypt_mnemonic(encrypted_mne, pbkdf2_password, init_vector)

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
        @taquito/tzip12


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
