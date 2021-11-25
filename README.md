# opensea bid bot
Opensource opensea bid bot.
Proxies are not required (but recommended if speed is what you are looking for).

### main features

- multi rpc support
- multi wallet support
- proxy option (avoid opensea ratelimit)


### configuration

OS bid bot requires [Node.js](https://nodejs.org/) to run.
You will also need an [infura.io](https://infura.io/dashboard/ethereum) account for the RPC provider.

Note: The bot will start a thread for every mnemonic/privatekey. This means that you can have more of the same mnemonic/privatekey in your config so it starts more threads, resulting in a faster bot.

Edit the `config.json` file to your needs.

`rpc_urls` -> an array of rpc providers (one or more)<br>
`mnemonics` -> an array of mnemonics<br>
`privateKeys` -> an array of private keys<br>
`bid_price` -> amount of `WETH` you want to bid on the assets<br>
`expiration` -> amount of hours in which you want your offer/bid to expire<br>
`timeout` -> timeout in `ms` per bid<br>
`proxied` -> boolean `false`/`true` . if `true`, will read proxies from `proxies.txt`<br>
`targets` -> array of targets with the `address` and `supply` of the collection. the `address` can be found in the url when visiting an asset from this collection; `https://opensea.io/assets/<COLLECTION_ADDRESS>/<token_id (not relevant)>`. the `supply` is the amount of tokens in existence.

##### Always have either one private key or mnemonic !!!

### first example `config.json`
```json
{
    "rpc_urls": [
        "https://mainnet.infura.io/v3/projectid"
    ],
    "mnemonics":[
        "some random twelve word mnemonic here ..."
    ],
    "privateKeys":[],
    "bid_price": 0.2,
    "expiration":3,
    "timeout":100,
    "proxied":false,
    "targets":[
        {
            "address":"0xd13be7ae034a8aafc786fb077eaf1b0892079315",
            "supply":8888
        },
        {
            "address":"0xdeadbeef00000000000000000000000000000000",
            "supply":10000
        }
    ]
}
```

### second example `config.json`
```json
{
    "rpc_urls": [
        "https://mainnet.infura.io/v3/projectid",
        "https://mainnet.infura.io/v3/anotherone"
    ],
    "mnemonics":[
        "some random twelve word cool mnemonic here ..."
    ],
    "privateKeys":[
        "4fa5084bfbd7c6400ef9633dea1d1b329c12dadeb0aac74d4d62a5e1a43a83f3",
        "4c329d7abf1f8c05efd6db8ffd51a601c159d75a81805be10a361cc13d7f2a9c"
    ],
    "bid_price": 0.08,
    "expiration":24,
    "timeout":1500,
    "proxied":true,
    "targets":[
        {
            "address":"0xd13be7ae034a8aafc786fb077eaf1b0892079315",
            "supply":8888
        }
    ]
}
```



### installation
```sh
git clone https://github.com/chain-bots/opensea-bid-bot.git
cd opensea-bid-bot
npm i
```

### running the bot
```sh
node bot.js
```

### License

MIT

