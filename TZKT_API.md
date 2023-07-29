# NOTE
I intend to use TZKT API for account queries/info.

### Swap networks :

    Enum based pattern :
    https://api.{network}.tzkt.io/

    Mainnet: https://api.tzkt.io/ 
    or https://api.mainnet.tzkt.io/
    Hangzhounet: https://api.hangzhounet.tzkt.io/
    Ithacanet: https://api.ithacanet.tzkt.io/


### To query account info :

    https://api.tzkt.io/v1/accounts/{address}/

### To query account operations :
    
    https://api.tzkt.io/v1/accounts/{address}/operations

### To query applied Tx :
    
    https://api.tzkt.io/v1/operations/transactions/{hash}

### To query account balances of certain token :

    https://api.tzkt.io/v1/tokens/balances?account=[tz1....]&token.contract=[KT1...]&select=balance

- we can select any desirable field with `select=[field]` or just remove it to get the whole info of account with certain contract.

