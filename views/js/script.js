// define function to get the data from storage if file already saved

// const { front } = require("androidjs");

// const { front } = require("androidjs");


function getDate() {
    var date = document.getElementById('date');
    var time = document.getElementById('time');
    date.innerHTML = "";
    time.innerHTML = "";

    date.innerHTML += new Date().getDate() + ".";
    date.innerHTML += new Date().getMonth() + 1 + ".";
    date.innerHTML += new Date().getFullYear();

    time.innerHTML += new Date().getHours() + ":";
    time.innerHTML += new Date().getMinutes() + ":";
    time.innerHTML += new Date().getSeconds();
}

function Initialize(){
    console.log("Initialize");
    front.send("Initialize");
}
function Mint(){
    front.send("Mint");
}

function ClientAccountID(){
    // getDate();
    front.send('ClientAccountID');
}
function ClientAccountBalance(){
    // getDate();
    front.send('ClientAccountBalance');
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

front.on("Initialize", function(msg){
    let result = document.getElementById('result');
    if(msg == true){
        result.innerText = "Токен инициализирован";
        return;
    }
    result.innerText = "Не удалось инициализировать токен";
});

front.on("Mint", function(msg){
    let result = document.getElementById('result');
    if(msg == true){
        result.innerText = "Было выпущено 100 р.";
        return;
    }
    result.innerText = "Не удалось выпустить деньги";
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

front.on('ClientAccountBalanceResult', function(msg){
    let result = document.getElementById("result"); 
    if (msg == null){
        result.innerText = "0 р.";
        return;
    }
    result.innerText = msg;
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

