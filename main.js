const back = require('androidjs').back;
const fs = require('fs');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');
const { Gateway, Wallets, IdentityProviderRegistry, Wallet } = require('fabric-network');
const { FileSystemWalletStore } = require('fabric-network/lib/impl/wallet/filesystemwalletstore');
const { error } = require('console');

const gateway = {
    digibank: `${__dirname}/gateway/connection-org1.json`,
    nbrb: `${__dirname}/gateway/connection-org2.json`
    
}

// const walletPath =`/data/data/com.androidjs.mypkg/files/myapp/wallet`;
const walletPath = `${__dirname}/wallet`;
const gatewayPath = `${__dirname}/gateway`;
// const walletPath = `/sdcard/emulated/0/Android/wallet`;

var WALLET = "admin2";
var OrgID = 1;
var ccp = JSON.parse(fs.readFileSync(gateway.nbrb, 'utf8'));

// var wallet;
// var ccp = null


//////////////////////////////////////// Wallet //////////////////////////////////////////////

back.on("WalletList", function(){
    var wallets = WalletList();
    back.send("WalletListResult", wallets);
});

function WalletList(){
    let wallets = fs.readdirSync(walletPath);
    for(let i = 0; i < wallets.length; i++){
        wallets[i] = wallets[i].substring(0, wallets[i].length - 3);
    }
    return wallets;
}
back.on("SelectWallet", function(walletName){
    SelectWallet(walletName);
});

function SelectWallet(walletName){
    WALLET = walletName;
}

//////////////////////////////////////// Peers //////////////////////////////////////////////

back.on("PeerList", function(){
    let peers = PeerList();
    back.send("PeerListResult", peers);
});

function PeerList(){
    let peers = fs.readdirSync(gatewayPath);
    console.log(peers);
    return peers;
}
back.on("SelectPeer", function(peerName){
    SelectPeer(peerName);
});

function SelectPeer(peerName){
    ccp = JSON.parse(fs.readFileSync(path.join(gatewayPath, peerName), 'utf-8'));
    let name = ccp['name'];
    let org = ccp['client']['organization'];
    
    OrgID = org[org.length-1];
    console.log(OrgID);
    // console.log(name, Org);
}

//////////////////////////////////////// Transactions //////////////////////////////////////////////


back.on('Initialize', async function(){
    let result = await Initialize();
    console.log(result);
    back.send("Initialize", result);
})

back.on('Mint', async function(value){
    let result = await Mint("100");
    console.log(result);
    back.send("Mint", result);
})

back.on('Burn', async function(value){
    let result = await Burn("100");
    console.log(result);
    back.send("Burn");
})

back.on('ClientAccountID', async function(){
    let result = await ClientAccountID();
    console.log(result);
    back.send("ClientAccountIDResult", result);
})

back.on('ClientAccountBalance', async function(){
    // let result;
    
    // try{
    //     let store = new FileSystemWalletStore(walletPath);
    //     let wallet = new Wallet(store);
    //     result = wallet;
    // }catch(error){
    //     result = error.toString();
    // }
    
    let result = await ClientAccountBalance();
    // console.log(result)
    back.send("ClientAccountBalanceResult", result);
})

back.on('Transfer', async function(recipient, value){
    var result = await Transfer(recipient, value);
    back.send("TransferResult", result);
})

back.on('EnrollAdmin', async function(){
    // var result = await Test();
    EnrollAdmin(OrgID);
    back.send("EnrollAdminResult", true);
});

back.on("RegisterUserLedger", async function(userName){
    var x509Identity = await RegisterUserLedger(userName);
    back.send("RegisterUserLedgerResult", x509Identity);
});

back.on("ReadWallet", async function(userName){
    var wallet = await Wallets.newFileSystemWallet(walletPath);
    var identity = await wallet.get(userName);
    
    back.send("ReadWalletResult", identity);
})

async function Initialize(){
    try{
        var wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(WALLET);
        if (!identity) {
            console.log(`An identity for the user ${WALLET} does not exist in the wallet`);
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: WALLET, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('cbdc');

        await contract.submitTransaction('Initialize', 'CBR', 'CBR', '2');
        console.log(`Токен инициализирован`);

        // Disconnect from the gateway.
        gateway.disconnect();
        return true;
    } catch(error){
        console.log(error);
    }
}

async function Mint(value){
    try{
        var wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(WALLET);
        if (!identity) {
            console.log(`An identity for the user ${WALLET} does not exist in the wallet`);
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: WALLET, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('cbdc');

        await contract.submitTransaction('Mint', value);
        console.log(`Было выпущено ${value} цифровых белорусских рублей.`);

        // Disconnect from the gateway.
        gateway.disconnect();
        return true;
    } catch(error){
        console.log(error);
        return false;
    }
}
async function Burn(value){
    try{
        var wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(WALLET);
        if (!identity) {
            console.log(`An identity for the user ${WALLET} does not exist in the wallet`);
            return `Пользователь "${WALLET}" не найден в кошелькеы`;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: WALLET, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('cbdc');

        await contract.submitTransaction('Burn', value);
        console.log(`Было сожжено ${value} цифровых белорусских рублей.`);

        // Disconnect from the gateway.
        gateway.disconnect();
        return `Было сожжено ${value} цифровых белорусских рублей.`;
    } catch(error){
        console.log(error);
    }
}
async function ClientAccountID(){
    try{

        // var ccp = JSON.parse(fs.readFileSync(gateway.nbrb, 'utf8'));
        
        var wallet = await Wallets.newFileSystemWallet(walletPath);
        // var wallet = await EnrollAdmin("2");

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(WALLET);
        if (!identity) {
            console.log(`An identity for the user ${WALLET} does not exist in the wallet`);
            return;
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
        return result.toString();
    } catch(error){
        console.log(error);
    }
    
}

async function ClientAccountBalance(){
    try{
        var wallet = await Wallets.newFileSystemWallet(walletPath);

        // let store = new FileSystemWalletStore(walletPath);
        // let wallet = new Wallet(store);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get("admin2");
        if (!identity) {
            console.log(`An identity for the user ${WALLET} does not exist in the wallet`);
            return `An identity for the user ${WALLET} does not exist in the wallet`;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: WALLET, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('cbdc');
        
        const result = await contract.evaluateTransaction('ClientAccountBalance');
        // Disconnect from the gateway.
        gateway.disconnect();
        return result.toString();
    } catch(error){
        return error.toString();
    }
    
}

async function Transfer(recipient, sum){
    try{
        var wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(WALLET);
        if (!identity) {
            console.log(`An identity for the user ${WALLET} does not exist in the wallet`);
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: WALLET, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('cbdc');

        await contract.submitTransaction('Transfer', recipient, sum);
        console.log(`Транзакция выполнена!`);

        // Disconnect from the gateway.
        gateway.disconnect();
        return "Транзакция выполнена успешно!";
    } catch(error){
        console.log(error);
    }
    
}

async function EnrollAdmin(OrgID){
    try {
        // Create a new CA client for interacting with the CA.
        const caInfo = ccp.certificateAuthorities[`ca.org${OrgID}.example.com`];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        var wallet = await Wallets.newFileSystemWallet(walletPath);
        // wallet = await Wallets.newInMemoryWallet();

        // Check to see if we've already enrolled the admin user.
        const identity = await wallet.get('admin' + OrgID);
        if (identity) {
            console.log(`An identity for the admin user "admin" already exists in the wallet`);
            return;
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
        console.log(`Successfully enrolled admin user "admin${OrgID}" and imported it into the wallet`);
        // return `Successfully enrolled admin user "admin${OrgID}" and imported it into the wallet`;
        return wallet;

    } catch (error) {
        console.error(`Failed to enroll admin user "admin${OrgID}": ${error}`);
        return `Failed to enroll admin user "admin${OrgID}": ${error}`;
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
            console.log(`An identity for the user ${userName} already exists in the wallet`);
            return `An identity for the user ${userName} already exists in the wallet`;
        }

        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get(WALLET);
        if (!adminIdentity) {
            console.log(`An identity for the admin user ${wallet} does not exist in the wallet`);
            console.log('Run the enrollAdmin.js application before retrying');
            return `An identity for the admin user ${wallet} does not exist in the wallet`;
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

        // return `Successfully registered and enrolled admin user ${userName} and imported it into the wallet
        // Certificate: ${x509Identity['credentials']['certificate']}
        // privateKey: ${x509Identity['credentials']['privateKey']}`;
        return x509Identity;
    } catch (error) {
        console.log(`Failed to register user ${userName}: ${error}`);
        return `Failed to register user ${userName}: ${error}`;
    }
}

async function RegisterUserInWallet(userName, cert, pKey){
    var wallet = await Wallets.newFileSystemWallet(walletPath);
    // Проверка на наличие кошелька
    const userIdentity = await wallet.get(userName);
        if (userIdentity) {
            return `Кошелёк ${userName} был добавлен на устройство`;
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
    return `Кошелёк ${userName} был добавлен на устройство`;
}

back.on("RegisterUserInWallet", async function(userName, cert, pKey){
    let answer = await RegisterUserInWallet(userName, cert, pKey);
    back.send("RegisterUserInWalletResult", answer);
    return;
});