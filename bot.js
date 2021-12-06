const OpenSea = require('opensea-js');
const fs = require('fs');
const HDWalletProvider = require("os-wallet-provider");
const config = require('./config.json');
const HttpsProxyAgent = require('https-proxy-agent');
const network = OpenSea.Network.Main;
const DEBUG_LEVEL = 1;

function debug(level, message)
{
    var time = new Date();
    var f_time = time.getHours().toString().padStart(2,'0') + ":" + time.getMinutes().toString().padStart(2,'0') + ":" + time.getSeconds().toString().padStart(2,'0');
    if (DEBUG_LEVEL >= level) { console.log(`[${f_time}] ${message}`); }
}

var proxies = [];
if (config.proxied)
{
    const data = fs.readFileSync('proxies.txt', 'utf8');
    data.split('\n').forEach(line => {
        if (line.length > 3){ proxies.push(`http://${line}`); }
    });
    debug(2, `loaded ${proxies.length} proxies`)
}

const fetch = global.fetch;
global.fetch = function() {
    var url = arguments[0];
    var options = arguments[1];

    if (config.proxied) {
        var proxy = proxies.shift();
        proxies.push(proxy);
        arguments[1].agent = new HttpsProxyAgent(proxy);
        console.log(proxy)
    }

    debug(3, `opensea-sdk : ${url}`);

    return new Promise((resolve, reject) => {
        fetch.apply(this, arguments)
        .then((response) => {
            resolve(response);
        })
        .catch((error) => {
            reject(error);
        })
    });
}


var providers = [];
var assets = [];

var rpc_index = 0;
config.mnemonics.forEach(mnemonic => {
    var provider = new HDWalletProvider({
        mnemonic: {
            phrase: mnemonic
        },
        providerOrUrl: config.rpc_urls[rpc_index]
    });
    var seaport = new OpenSea.OpenSeaPort(provider, {networkName: network});
    providers.push({"provider":provider,"seaport":seaport});
    seaport.addListener(OpenSea.EventType.CreateOrder, ({ order, accountAddress }) => {
        debug(1, `order created ${accountAddress} : ${order.hash} (asset /${order.metadata.asset.id})`);
    });
    rpc_index++;
    if(rpc_index == config.mnemonics.length) {rpc_index = 0;};
})
config.privateKeys.forEach(privateKey => {
    var provider = new HDWalletProvider({
        privateKeys: [privateKey],
        providerOrUrl: config.rpc_urls[rpc_index]
    });
    var seaport = new OpenSea.OpenSeaPort(provider, {networkName: network});
    providers.push({"provider":provider,"seaport":seaport});
    seaport.addListener(OpenSea.EventType.CreateOrder, ({ order, accountAddress }) => {
        debug(1, `order created ${accountAddress} : ${order.hash} (asset /${order.metadata.asset.id})`);
    });
    rpc_index++;
    if(rpc_index == config.mnemonics.length) {rpc_index = 0;};
})


async function providerThread(_provider)
{
    var provider = _provider.provider;
    var seaport = _provider.seaport;
    var _asset = assets.shift();

    if (_asset != undefined) {
        const offer = await seaport.createBuyOrder({
            asset: {
                tokenId:_asset.tokenId,
                tokenAddress:_asset.address
            },
            accountAddress:provider.getAddress(),
            startAmount: config.bid_price,
            expirationTime:Math.round(Date.now() / 1000 + 60 * 60 * config.expiration)
        }).catch(err => {debug(3, 'bidding failed, pushing asset back into array'); assets.push(_asset);});
    }

    setTimeout(providerThread, config.timeout, _provider);
}


config.targets.forEach(target => {
    var current_id = 0;
    while (current_id < target.supply){
        assets.push({"tokenId":String(current_id),"address":target.address});
        current_id++;
    }
})


providers.forEach(provider => {
    debug(2, `starting provider ${provider.provider.getAddress()}`);
    providerThread(provider);
});
