// define function to get the data from storage if file already saved

// const { front } = require("androidjs");

// const { front } = require("androidjs");

function Initialize(){
    front.send("Initialize");
}
function Mint(name, price, amount, recipient){
    front.send("Mint", name, price, amount, recipient);
}

async function ClientAccountID(){
    front.send('ClientAccountID');
}

function QueryClientTokens(){
    front.send('QueryClientTokens');
}

function QueryTokensByClientID(clientID){
    front.send('QueryTokensByClientID', clientID);
}

function QueryAllTokens(){
    front.send('QueryAllTokens');
}

function HistoryForKey(tokenId){
    front.send('HistoryForKey', tokenId);
}

function EnrollAdmin(){
    front.send("EnrollAdmin");
}

function RegisterUserLedger(userName){
    front.send("RegisterUserLedger", userName);
}

function ReadWallet(userName){
    front.send("ReadWallet", userName);
    document.getElementById('userName').setAttribute("value", userName);
}

function GenerateQR(){
    ClearMainForm();

    GetForm("qrForm", "image-center")

    front.send("ClientAccountID");
}
function SendForm(){
    ClearMainForm();
    GetForm("sendForm", "center");
}

function GetCamera(){
    ClearMainForm();
    var resultContainer = document.getElementById('qr-reader-results');
    var lastResult = 0;
    var html5QrcodeScanner = new Html5QrcodeScanner(
        "qrReader", { fps: 10, qrbox: 125 });
    html5QrcodeScanner.render(onScanSuccess);
}
function GetForm(id, attribute=""){
    var form = document.getElementById(id);
    form.setAttribute("class", attribute);
}

function Transfer(recipient, sum){
    front.send("Transfer", recipient, sum);
}
// function openCamera(){
//     function onScanSuccess(decodedText, decodedResult) {
//         var resultContainer = document.getElementById('qrResult');
//         lastResult = decodedText;
//         console.log(`Scan result ${decodedText}`, decodedResult);
//         resultContainer.innerText = decodedText;
//         html5QrcodeScanner.clear();
//     }

//     var lastResult = 0;
//     var html5QrcodeScanner = new Html5QrcodeScanner(
//         "qrReader", { fps: 10, qrbox: 150 });
//     html5QrcodeScanner.render(onScanSuccess);
    
// }

function openCamera(id){
    let width = window.innerWidth;
    let height = window.innerHeight;
    let size;
    if(width<height){
        size = width * 0.95;
    }
    else{
        size=height * 0.95;
    }
    function onScanSuccess(decodedText, decodedResult) {
        var resultContainer = document.getElementById(id);
        lastResult = decodedText;
        console.log(decodedText);
        resultContainer.setAttribute("value", decodedText);
        html5QrcodeScanner.clear();
    }

    var lastResult = 0;
    var html5QrcodeScanner = new Html5QrcodeScanner(
        "qrReader", { fps: 10, qrbox: size });
    html5QrcodeScanner.render(onScanSuccess);
    
}

// Функция для создания ссылки из элемента JSON
function createLink(item) {
    // Создаем элемент <a> с атрибутом href равным значению ключа item.key
    let link = document.createElement("a");
    link.href = item.key;
    // Добавляем класс link для стилизации CSS
    link.className = "link";
    // Создаем элемент <span> с текстом равным значению Record.name
    let name = document.createElement("span");
    name.textContent = item.Record.name;
    // Добавляем класс name для стилизации CSS
    name.className = "name";
    // Создаем элемент <span> с текстом равным значению Record.price
    let price = document.createElement("span");
    price.textContent = item.Record.price;
    // Добавляем класс price для стилизации CSS
    price.className = "price";
    // Создаем элемент <span> с текстом равным значению Record.amount
    let amount = document.createElement("span");
    amount.textContent = item.Record.amount;
    // Добавляем класс amount для стилизации CSS
    amount.className = "amount";
    // Создаем элемент <span> с текстом равным значению Record.owner
    let owner = document.createElement("span");
    owner.textContent = item.Record.owner;
    // Добавляем класс owner для стилизации CSS
    owner.className = "owner";
    // Добавляем все созданные элементы внутрь ссылки
    link.appendChild(name);
    link.appendChild(price);
    link.appendChild(amount);
    link.appendChild(owner);
    // Возвращаем ссылку как результат функции
    return link;
}

// Функция для принятия JSON и преобразования в список ссылок на HTML 
function JsonToHtml(json) {
    // Парсим JSON в массив объектов 
    let data = JSON.parse(json);
    // Создаем элемент <ul> для хранения списка ссылок 
    let list = document.createElement("ul");
    // Добавляем класс list для стилизации CSS 
    list.className = "list";
    // Проходим по каждому элементу массива 
    for (let item of data) {
        // Создаем элемент <li> для хранения одной ссылки 
        let listItem = document.createElement("li");
        // Добавляем класс listItem для стилизации CSS 
        listItem.className ="listItem";
        // Вызываем функцию createLink и передаем ей текущий элемент массива 
        let linkItem= createLink(item);
        // Добавляем созданную ссылку внутрь элемента <li>
        listItem.appendChild(linkItem);
        // Добавляем элемент <li> внутрь списка <ul>
        list.appendChild(listItem);
    }
    // Возвращаем список как результат функции 
    return list;
}

// Assuming there is a function called fetchObjects(userId) that returns a promise with the JSON data
async function displayObjects(userId) {
    // Get the JSON data from the API
    let data = await fetchObjects(userId);
    // Create an empty HTML string
    let html = "";
    // Loop through each object in the data
    for (let object of data) {
      // Extract the attributes from the object
      let { key, Record: { name, price, amount } } = object;
      // Create an HTML element for each object and append it to the HTML string
      html += `<div class="object">
        <p>Key: ${key}</p>
        <p>Name: ${name}</p>
        <p>Price: ${price}</p>
        <p>Amount: ${amount}</p>
      </div>`;
    }
    // Find an element with id="objects" in the document and set its innerHTML to the HTML string
    document.getElementById("objects").innerHTML = html;
  }


front.on("Initialize", function(msg){
    let result = document.getElementById('result');
    if(msg == true){
        result.innerText = "Токен инициализирован";
        return;
    }
    result.innerText = "Не удалось инициализировать токен";
});

front.on("MintResult", function(msg){
    let result = document.getElementById('result');
    result.innerText = msg;
    // if(msg == true){
    //     result.innerText = "Было выпущено 100 р.";
    //     return;
    // }
    // result.innerText = "Не удалось выпустить деньги";
})

front.on("ClientAccountIDResult", function(msg){
    let width = window.innerWidth;
    let height = window.innerHeight;
    let size;
    if(width<height){
        size = width * 0.95;
    }
    else{
        size=height * 0.8;
    }
    var result = document.getElementById("result");
    
    result.innerHTML = "";
    console.log(msg);
    if(msg == null){
        result.innerText = "Error " + msg;
        return;
    }
    var qrcode = new QRCode(result, {
        text: msg,
        width: size,
        height: size,
        colorDark : "#000",
        colorLight : "#fff",
        correctLevel : QRCode.CorrectLevel.H
    });
});

front.on('QueryClientTokensResult', function(msg){
    let result = document.getElementById("result"); 
    var tokenState = JsonToHtml(msg);
    result.appendChild(tokenState);
    // result.innerHTML = tokenState;
});

front.on('QueryTokensByClientIDResult', function(msg){
    let result = document.getElementById("result"); 
    var tokenState = JsonToHtml(msg);
    result.appendChild(tokenState);
    // result.innerHTML = tokenState;
});

front.on('QueryAllTokensResult', function(msg){
    let result = document.getElementById("result"); 
    var tokenState = JsonToHtml(msg);
    result.appendChild(tokenState);
    // result.innerHTML = tokenState;
});

front.on('HistoryForKeyResult', function(msg){
    let result = document.getElementById("result"); 
    // var tokenState = JsonToHtml(msg);
    result.innerHTML = msg;
});

front.on('EnrollAdminResult', function(msg){
    let result = document.getElementById('result');
    if (msg != true){
        result.innerText = "Не удалось зарегистрировать администратора";
        return;
    }
    result.innerText = "Администратор был успешно зарегистрирован";
});


// front.on('EnrollAdminResult', function(msg){
//     let result = document.getElementById('result');
//     console.log(msg);
//     result.innerText = msg;
// })

front.on("ReadWalletResult", async function(x509Identity){
    let width = window.innerWidth;
    let height = window.innerHeight;
    let size;
    if(width<height){
        size = width * 0.95;
    }
    else{
        size=height * 0.8;
    }

    var certificate = document.getElementById("certificate");
    var privateKey = document.getElementById("privateKey");

    certificate.innerHTML = "";
    privateKey.innerHTML = "";

    if(x509Identity == null){
        certificate.innerText = "Error";
        privateKey.innerText = "Error";
        return;
    }
    new QRCode(certificate, {
        text: `${x509Identity['credentials']['certificate']}`,
        width: size,
        height: size,
        colorDark : "#000",
        colorLight : "#fff",
        correctLevel : QRCode.CorrectLevel.H,
        class: "image"
    });

    new QRCode(privateKey, {
        text: `${x509Identity['credentials']['privateKey']}`,
        width: size,
        height: size,
        colorDark : "#000",
        colorLight : "#fff",
        correctLevel : QRCode.CorrectLevel.H,
        class: "image"
    });
})

front.on('TransferResult', function(msg){
    let result = document.getElementById('result');
    result.innerText = msg;
})

