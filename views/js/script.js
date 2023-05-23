const TransactionResult = {
    OK: 'Транзакция выполнена успешно',
    Error: 'Ошибка при выполнении транзакции',
    NoUserInWallet: 'Не удалось найти пользователе в кошельке',
    UserImportOK: 'Пользователь был импортирован в ваш кошелёк',
    CannotImportInWallet: 'Не удалось импортировать в кошелёк',
    CannotRegisterUser: 'Не удалось зарегистрировать пользователя на платформе'
}


function Initialize() {
    front.send("Initialize");
}
front.on("Initialize", function (msg) {
    let loader = document.getElementById('loader');
    loader.setAttribute('class', '');

    let result = document.getElementById('result');
    if (msg == true) {
        result.innerText = "Токен инициализирован";
        return;
    }
    result.innerText = "Не удалось инициализировать токен";
});
function Mint(name, price, amount, recipient) {
    front.send("Mint", name, price, amount, recipient);
}
front.on("MintResult", function (msg) {
    let loader = document.getElementById('loader');
    loader.setAttribute('class', '');

    let result = document.getElementById('result');
    result.innerText = msg;
})

async function ClientAccountID() {
    front.send('ClientAccountID');
}
front.on("ClientAccountIDResult", function (msg) {
    let loader = document.getElementById('loader');
    loader.setAttribute('class', '');

    let text = msg;

    if (msg == null) {
        text = "Error: " + msg;
        return;
    }
    GenerateQR("qr", text);

});

function GenerateQR(selector, text) {
    var qr = document.getElementById(selector);
    qr.innerHTML = "";

    let width = window.innerWidth;
    let height = window.innerHeight;
    let size;
    if (width < height) {
        size = width * 0.85;
    }
    else {
        size = height * 0.85;
    }
    var qrcode = new QRCode(selector, {
        text: text,
        width: size,
        height: size,
        colorDark: "#000",
        colorLight: "#fff",
        correctLevel: QRCode.CorrectLevel.H
    });
    console.log(text);
}

function QueryClientTokens() {
    front.send('QueryClientTokens');
}
front.on('QueryClientTokensResult', function (json) {
    let loader = document.getElementById('loader');
    loader.setAttribute('class', '');

    let result = document.getElementById("result");
    var tokenState = JsonToHtml(json);
    result.appendChild(tokenState);
});

function QueryTokensByClientID(clientID) {
    front.send('QueryTokensByClientID', clientID);
}
front.on('QueryTokensByClientIDResult', function (msg) {
    let loader = document.getElementById('loader');
    loader.setAttribute('class', '');

    let result = document.getElementById("result");
    var tokenState = JsonToHtml(msg);
    result.appendChild(tokenState);
    // result.innerHTML = tokenState;
});

function QueryAllTokens() {
    front.send('QueryAllTokens');
}
front.on('QueryAllTokensResult', function (msg) {
    let loader = document.getElementById('loader');
    loader.setAttribute('class', '');

    let result = document.getElementById("result");
    var tokenState = JsonToHtml(msg);
    result.appendChild(tokenState);
    // result.innerHTML = tokenState;
});

function QueryToken(tokenId) {
    front.send('QueryToken', tokenId);
}
front.on('QueryTokenResult', async function (tokenJSON) {
    console.log('QueryToken: ' + tokenJSON);
    let token = JSON.parse(tokenJSON);

    let params = (new URL(document.location)).searchParams;
    let tokenId = params.get("tokenId");

    let tokenIds = document.getElementsByName('tokenId');
    console.log(tokenIds);
    for (let i = 0; i < tokenIds.length; i++) {
        tokenIds[i].setAttribute('value', tokenId);
    }
    document.getElementById('name').setAttribute('value', token.name);
    document.getElementById('price').setAttribute('value', token.price);
    document.getElementById('amount').setAttribute('value', token.amount);

});

function HistoryForKey(tokenId) {
    front.send('HistoryForKey', tokenId);
}

front.on('HistoryForKeyResult', function (resultArray) {
    let loader = document.getElementById('loader');
    loader.setAttribute('class', '');

    let result = document.getElementById("result");
    for (let res in TransactionResult) {
        if (res == resultArray) {
            result.appendChild(res);
            return;
        }
    }
    let resultString = new TextDecoder('utf-8').decode(resultArray);
    console.log(resultString);
    var tokenState = HistoryJsonToHtml(resultString);
    result.appendChild(tokenState);
});
function EnrollAdmin() {
    front.send("EnrollAdmin");
}
front.on('EnrollAdminResult', function (msg) {
    let loader = document.getElementById('loader');
    loader.setAttribute('class', '');

    let result = document.getElementById('result');
    console.log(msg);
    result.appendChild(msg);
})

function RegisterUserLedger(userName) {
    front.send("RegisterUserLedger", userName);
}

function ReadWallet(userName) {
    front.send("ReadWallet", userName);
    document.getElementById('userName').setAttribute("value", userName);
}
front.on("ReadWalletResult", async function (x509Identity) {
    let width = window.innerWidth;
    let height = window.innerHeight;
    let size;
    if (width < height) {
        size = width * 0.95;
    }
    else {
        size = height * 0.8;
    }

    var certificate = document.getElementById("certificate");
    var privateKey = document.getElementById("privateKey");

    certificate.innerHTML = "";
    privateKey.innerHTML = "";

    if (x509Identity == null) {
        certificate.innerText = "Error";
        privateKey.innerText = "Error";
        return;
    }
    new QRCode(certificate, {
        text: `${x509Identity['credentials']['certificate']}`,
        width: size,
        height: size,
        colorDark: "#000",
        colorLight: "#fff",
        correctLevel: QRCode.CorrectLevel.H,
        class: "image"
    });

    new QRCode(privateKey, {
        text: `${x509Identity['credentials']['privateKey']}`,
        width: size,
        height: size,
        colorDark: "#000",
        colorLight: "#fff",
        correctLevel: QRCode.CorrectLevel.H,
        class: "image"
    });
})

function Transfer(recipient, sum) {
    front.send("Transfer", recipient, sum);
}
front.on('TransferResult', function (msg) {
    let loader = document.getElementById('loader');
    loader.setAttribute('class', '');

    let result = document.getElementById('result');
    result.innerText = msg;
})

function openCamera(id) {
    let width = window.innerWidth;
    let height = window.innerHeight;
    let size;
    if (width < height) {
        size = width * 0.6;
    }
    else {
        size = height * 0.6;
    }
    console.log(size);
    function onScanSuccess(decodedText, decodedResult) {
        var resultContainer = document.getElementById(id);
        lastResult = decodedText;
        alert(decodedText);
        resultContainer.setAttribute("value", decodedText);
        html5QrcodeScanner.clear();
    }

    var lastResult = 0;
    var html5QrcodeScanner = new Html5QrcodeScanner(
        "qrReader", { fps: 60, qrbox: size });
    html5QrcodeScanner.render(onScanSuccess);
    return html5QrcodeScanner;
}

function JsonToHtml(json) {
    let data = JSON.parse(json);
    // Создаем div, в котором будут все объекты
    let list = document.createElement('div');
    list.className = 'list-group';

    if (data.length == 0) {
        let h2 = document.createElement('h2');
        h2.innerText = "Пусто";
        list.append(h2);
        return list;
    }
    for (let item of data) {
        let link = document.createElement('a');
        link.href = "tokenInfo.html?tokenId=" + item.key;
        link.className = 'list-group-item list-group-item-action flex-column align-items-start active mb-1';
        list.appendChild(link);

        let header = document.createElement('div');
        header.className = 'd-flex w-100 justify-content-between';
        link.appendChild(header);

        let name = document.createElement('h5');
        name.className = 'mb-1';
        name.innerText = item.Record.name;
        header.appendChild(name);

        let price = document.createElement('p');
        price.className = 'mb-1';
        price.innerText = 'Цена: ' + item.Record.price;
        link.appendChild(price);

        let amount = document.createElement('p');
        amount.className = 'mb-1';
        amount.innerText = 'Количество: ' + item.Record.amount;
        link.appendChild(amount);

    }
    return list;
}
function HistoryJsonToHtml(json) {
    let data = JSON.parse(json);
    // Создаем div, в котором будут все объекты
    let list = document.createElement('div');
    list.className = 'list-group';

    for (let item of data) {
        let div = document.createElement('div');
        div.className = 'list-group-item list-group-item-action flex-column align-items-start active mb-1';
        list.appendChild(div);

        let header = document.createElement('div');
        header.className = 'd-flex w-100 justify-content-between';
        div.appendChild(header);

        let name = document.createElement('h5');
        name.className = 'mb-1';
        name.innerText = item.txID;
        header.appendChild(name);

        let price = document.createElement('p');
        price.className = 'mb-1';
        price.innerText = item.timestamp;
        div.appendChild(price);

    }
    return list;
}






















