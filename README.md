### playground for tezos
This is used mainly to test how broken, all Tezos wallet related libraries are.

It's more like a loophole, once you convert sample source into typescript to satisfy all imports because `@tezos-core-tool/crypto-util` is too old now, then all in a sudden, some other libraries that it rely on like `tweetnacl-auth` didn't implement type description to satisfy `ts-node` requirement. But maybe, putting this into a good react boilplate can fix all problems.

There you go, a broken mess. 

Anyway, still can run as: 

    tsc wallet.ts & node wallet.js

Also we still can generate mnemonic words, correct seed key index alike to `Temple Wallet` and `Kukai`. 