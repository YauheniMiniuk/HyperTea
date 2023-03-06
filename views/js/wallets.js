function WalletList(){
    front.send("WalletList");
}

function SelectWallet(walletName){
    front.send("SelectWallet", walletName);
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////

front.on("WalletListResult", function(wallets){
    let container = document.getElementById("work-screen");
    console.log(wallets);
    for(let i = 0; i < wallets.length; i++){
        container.innerHTML += 
        `
        <div class="m-1">
            <a href="admin.html" id="${wallets[i]}" class="btn btn-primary list-group" onclick="SelectWallet(id)">${wallets[i]}</a>
        </div>
        `;
    }
});


function RegisterUserInWallet(userName, cert, pKey){
    front.send("RegisterUserInWallet", userName, cert, pKey);
}

front.on("RegisterUserInWalletResult", function(answer){
    let container = document.getElementById("answer");

    container.innerText = answer;
})