const back = require('androidjs').back;
const fs = require('fs');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');
const { Gateway, Wallets, IdentityProviderRegistry, Wallet } = require('fabric-network');
const { FileSystemWalletStore } = require('fabric-network/lib/impl/wallet/filesystemwalletstore');
const { error } = require('console');
// const { StringDecoder } = require('node:string_decoder');

const gateway = {
    digibank: `${__dirname}/gateway/connection-org1.json`,
    nbrb: `${__dirname}/gateway/connection-org2.json`

}

const TransactionResult = {
    OK: 'Транзакция выполнена успешно',
    Error: 'Ошибка при выполнении транзакции',
    NoUserInWallet: 'Не удалось найти пользователе в кошельке',
    UserImportOK: 'Пользователь был импортирован в ваш кошелёк',
    CannotImportInWallet: 'Не удалось импортировать в кошелёк',
    CannotRegisterUser: 'Не удалось зарегистрировать пользователя на платформе',
    AlreadyInWallet: 'Данный кошелёк уже привязан к устройству'
}

// class Account {
//     static Wallet = null;
//     static OrgID = 1;
//     static CCP = null;

//     static ID = null;
//     static LastTransactionResult = null;

//     static GetWallet() {
//         return this.Wallet;
//     }
//     static CheckWallet() {
//         if (this.Wallet == null) {
//             back.send("NoWallet", false);
//             return false;
//         }
//         return true;
//     }
//     static GetOrgID() {
//         return this.OrgID;
//     }
//     static GetCCP() {
//         if (this.CCP == null || this.OrgID == null) {
//             this.SelectPeer();
//         }
//         return this.CCP;
//     }

//     static SelectPeer(peerName) {
//         this.CCP = JSON.parse(fs.readFileSync(gateway.digibank));
//         let org = this.CCP['client']['organization'];

//         this.OrgID = org[org.length - 1];
//     }
// }
const walletPath = `${__dirname}/wallet`;
const gatewayPath = `${__dirname}/gateway`;
// const walletPath = `/sdcard/emulated/0/Android/wallet`;

var WALLET = null;
var OrgID = '1';
var ccp = JSON.parse(fs.readFileSync(gateway.nbrb, 'utf8'));

// var wallet;
// var ccp = null


//////////////////////////////////////// Wallet //////////////////////////////////////////////

back.on("WalletList", async function () {
    var wallets = await WalletList();
    back.send("WalletListResult", wallets);
});

async function WalletList() {
    try {
        let wallets = await fs.promises.readdir(walletPath);
        // let wallets = fs.readdirSync(walletPath);
        for (let i = 0; i < wallets.length; i++) {
            wallets[i] = wallets[i].substring(0, wallets[i].length - 3);
        }
        console.log(wallets);
        return wallets;
    } catch (error) {
        return error.toString();
    }
}
back.on("SelectWallet", function (walletName) {
    SelectWallet(walletName);
});

function SelectWallet(walletName) {
    WALLET = walletName;

    let json = JSON.parse(fs.readFileSync(path.join(walletPath, WALLET + '.id'), 'utf-8'));
    OrgID = json['mspId'][3];
}

back.on("DeleteWallet", async function(walletName){
    await DeleteWallet(walletName);
});
async function DeleteWallet(walletName){
    var wallet = await Wallets.newFileSystemWallet(walletPath);
    wallet.remove(walletName);
}

back.on("CurrentWallet", function () {
    back.send("CurrentWallet", WALLET);
})
back.on('CurrentOrgID', function(){
    back.send("CurrentOrgID", OrgID);
})

back.on("CheckWallet", function () {
    if (WALLET == null) {
        back.send("NoWallet");
    }
})
//////////////////////////////////////// Peers //////////////////////////////////////////////

back.on("PeerList", function () {
    let peers = PeerList();
    back.send("PeerListResult", peers);
});

function PeerList() {
    try {
        let peers = fs.readdirSync(gatewayPath);
        console.log(peers);
        return peers;
    } catch (error) {
        return error;
    }
}
back.on("SelectPeer", function (peerName) {
    SelectPeer(peerName);
});

function SelectPeer(peerName) {
    ccp = JSON.parse(fs.readFileSync(path.join(gatewayPath, peerName), 'utf-8'));
    let org = ccp['client']['organization'];

    OrgID = org[org.length - 1];
}

//////////////////////////////////////// Transactions //////////////////////////////////////////////


back.on('Initialize', async function () {
    let result = await Initialize();
    console.log(result);
    back.send("Initialize", result);
})

back.on('Mint', async function (name, price, amount, recipient) {
    let result = await Mint(name, price, amount, recipient);
    console.log(result);
    back.send("MintResult", result);
})

back.on('Burn', async function (tokenId) {
    let result = await Burn(tokenId);
    console.log(result);
    back.send("Burn");
})

back.on('ClientAccountID', async function () {
    let result = await ClientAccountID();
    console.log(result);
    back.send("ClientAccountIDResult", result);
})

back.on('QueryToken', async function (tokenId) {
    let result = await QueryToken(tokenId);
    console.log(result);
    back.send('QueryTokenResult', result);
})

back.on('QueryClientTokens', async function () {
    let result = await QueryClientTokens();
    // console.log(result)
    back.send("QueryClientTokensResult", result);
})

back.on('QueryTokensByClientID', async function (clientID) {
    let result = await QueryTokensByClientID(clientID);
    // console.log(result)
    back.send("QueryTokensByClientIDResult", result);
})

back.on('QueryAllTokens', async function () {
    let result = await QueryAllTokens();
    back.send("QueryAllTokensResult", result);
})

back.on('Transfer', async function (recipient, value) {
    var result = await Transfer(recipient, value);
    back.send("TransferResult", result);
})

// back.on('GetLastTransaction', function () {
//     back.send('GetLastTransactionResult', Account.LastTransactionResult);
// })

back.on('HistoryForKey', async function (tokenId) {
    var result = await HistoryForKey(tokenId);
    back.send("HistoryForKeyResult", result);
})

back.on('EnrollAdmin', async function () {
    // var result = await Test();
    let result = EnrollAdmin(OrgID);
    back.send("EnrollAdminResult", result);
});

back.on("RegisterUserLedger", async function (userName) {
    var x509Identity = await RegisterUserLedger(userName);
    back.send("RegisterUserLedgerResult", x509Identity);
});

back.on("ReadWallet", async function (userName) {
    var wallet = await Wallets.newFileSystemWallet(walletPath);
    var identity = await wallet.get(userName);

    back.send("ReadWalletResult", identity);
})

async function Mint(name, price, amount, recipient) {
    try {
        price = Number(price);
        amount = Number(amount);
        var wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(WALLET);
        if (!identity) {
            console.log(`Пользователь "${WALLET}" не найден в кошельке`);
            return TransactionResult.NoUserInWallet;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: WALLET, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('cbdc');

        let result = await contract.submitTransaction("Mint", name, Number(price), Number(amount), recipient);
        console.log(result);
        console.log(`Был выпущен токен: ${name}.`);

        // Disconnect from the gateway.
        gateway.disconnect();
        return TransactionResult.OK;
    } catch (error) {
        console.log(error);
        return error.toString();
    }
}
async function Burn(tokenId) {
    try {
        var wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(WALLET);
        if (!identity) {
            console.log(TransactionResult.NoUserInWallet);
            return TransactionResult.NoUserInWallet;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: WALLET, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('cbdc');

        await contract.submitTransaction('Burn', tokenId);

        // Disconnect from the gateway.
        gateway.disconnect();

        return TransactionResult.OK;
    } catch (error) {
        return error.toString();
    }
}
async function ClientAccountID() {
    try {
        var wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(WALLET);
        if (!identity) {
            console.log(`Пользователь "${WALLET}" не найден в кошельке`);
            return TransactionResult.NoUserInWallet;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: WALLET, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('cbdc');

        const result = await contract.evaluateTransaction('ClientAccountID');

        // Disconnect from the gateway.
        gateway.disconnect();

        // Account.ID = result.toString();

        return result.toString();
    } catch (error) {
        return error.toString();
    }

}
async function QueryToken(tokenId) {
    try {
        var wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(WALLET);
        if (!identity) {
            console.log(TransactionResult.NoUserInWallet);
            return TransactionResult.NoUserInWallet;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: WALLET, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('cbdc');

        const result = await contract.evaluateTransaction('QueryToken', tokenId);

        // Disconnect from the gateway.
        gateway.disconnect();

        // Account.LastTransactionResult = result.toString();

        return result.toString();
    } catch (error) {
        return error.toString();
    }

}
async function QueryClientTokens() {
    try {
        var wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(WALLET);
        if (!identity) {
            console.log(TransactionResult.NoUserInWallet);
            return TransactionResult.NoUserInWallet;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: WALLET, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('cbdc');

        // const result = await contract.evaluateTransaction('ClientAccountBalance');
        const result = await contract.evaluateTransaction('QueryClientTokens');

        // Disconnect from the gateway.
        gateway.disconnect();

        // Account.LastTransactionResult = result.toString();

        return result.toString();
    } catch (error) {
        return error.toString();
    }

}

async function QueryTokensByClientID(clientID) {
    try {
        var wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(WALLET);
        if (!identity) {
            console.log(TransactionResult.NoUserInWallet);
            return TransactionResult.NoUserInWallet;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: WALLET, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('cbdc');

        // const result = await contract.evaluateTransaction('ClientAccountBalance');
        const result = await contract.evaluateTransaction('QueryTokensByClientID', clientID);
        // Disconnect from the gateway.
        gateway.disconnect();

        // Account.LastTransactionResult = result.toString();

        return result.toString();
    } catch (error) {
        return error.toString();
    }

}

async function QueryAllTokens() {
    try {
        var wallet = await Wallets.newFileSystemWallet(walletPath);

        // let store = new FileSystemWalletStore(walletPath);
        // let wallet = new Wallet(store);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(WALLET);
        if (!identity) {
            console.log(TransactionResult.NoUserInWallet);
            return TransactionResult.NoUserInWallet;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: WALLET, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('cbdc');

        // const result = await contract.evaluateTransaction('ClientAccountBalance');
        const result = await contract.evaluateTransaction('QueryAllTokens');
        // Disconnect from the gateway.
        gateway.disconnect();
        console.log(result);

        // Account.LastTransactionResult = result.toString();

        return result.toString();
    } catch (error) {
        console.log(error);
        return error.toString();
    }

}

async function Transfer(tokenId, recipient) {
    try {
        var wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(WALLET);
        if (!identity) {
            console.log(TransactionResult.NoUserInWallet);
            return TransactionResult.NoUserInWallet;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: WALLET, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('cbdc');

        await contract.submitTransaction('Transfer', tokenId, recipient);

        // Disconnect from the gateway.
        gateway.disconnect();

        return TransactionResult.OK;
    } catch (error) {
        return error.toString();
    }

}

async function HistoryForKey(tokenId) {
    try {
        var wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(WALLET);
        if (!identity) {
            console.log(TransactionResult.NoUserInWallet);
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: WALLET, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('cbdc');
        console.log(tokenId);
        var result = await contract.evaluateTransaction('GetHistoryForKey', tokenId);

        // Disconnect from the gateway.
        gateway.disconnect();
        return result;
    } catch (error) {
        return error.toString();
    }

}

async function EnrollAdmin(OrgID) {
    try {
        // Create a new CA client for interacting with the CA.
        const caInfo = ccp.certificateAuthorities[`ca.org${OrgID}.example.com`];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        var wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the admin user.
        const identity = await wallet.get('admin' + OrgID);
        if (identity) {
            console.log(TransactionResult.AlreadyInWallet);
            return TransactionResult.AlreadyInWallet;
        }
        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: `Org${OrgID}MSP`,
            type: 'X.509',
        };
        await wallet.put('admin' + OrgID, x509Identity);
        console.log(TransactionResult.UserImportOK);
        return TransactionResult.UserImportOK;
        
    } catch (error) {
        console.error(TransactionResult.CannotImportInWallet + ": " + error);
        return TransactionResult.CannotImportInWallet + ": " + error;
    }
}

async function RegisterUserLedger(userName) {
    try {
        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities[`ca.org${OrgID}.example.com`].url;
        const ca = new FabricCAServices(caURL);

        var wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get(userName);
        if (userIdentity) {
            console.log(TransactionResult.AlreadyInWallet);
            return TransactionResult.AlreadyInWallet;
        }

        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get(WALLET);
        if (!adminIdentity) {
            console.log(TransactionResult.NoUserInWallet);
            return TransactionResult.NoUserInWallet;
        }

        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, wallet);

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: `org${OrgID}.department1`,
            enrollmentID: userName,
            role: 'client'
        }, adminUser);
        const enrollment = await ca.enroll({
            enrollmentID: userName,
            enrollmentSecret: secret
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: `Org${OrgID}MSP`,
            type: 'X.509',
        };
        await wallet.put(userName, x509Identity);
        return x509Identity;
    } catch (error) {
        console.log(TransactionResult.CannotRegisterUser);
        return TransactionResult.CannotRegisterUser;
    }
}

async function RegisterUserInWallet(userName, cert, pKey) { 
    try {
        var wallet = await Wallets.newFileSystemWallet(walletPath);
        // Проверка на наличие кошелька
        const userIdentity = await wallet.get(userName);
        if (userIdentity) {
            return TransactionResult.AlreadyInWallet;
        }
        // Создание кошелька на устройстве
        const x509Identity = {
            credentials: {
                certificate: cert,
                privateKey: pKey,
            },
            mspId: `Org${OrgID}MSP`,
            type: 'X.509',
        };
        await wallet.put(userName, x509Identity);
        return TransactionResult.UserImportOK;
    } catch (error) {
        return error;
    }
}

back.on("RegisterUserInWallet", async function (userName, cert, pKey) {
    let answer = await RegisterUserInWallet(userName, cert, pKey);
    back.send("RegisterUserInWalletResult", answer);
});