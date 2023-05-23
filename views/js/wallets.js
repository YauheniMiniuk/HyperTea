function WalletList() {
    front.send("WalletList");
}

function SelectWallet(walletName) {
    front.send("SelectWallet", walletName);
}

function DeleteWallet(walletName) {
    front.send("DeleteWallet", walletName);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

front.on("WalletListResult", async function (wallets) {
    try {

        let loader = document.getElementById('loader');
        loader.setAttribute('class', '');

        let container = document.getElementById("walletList");
        console.log(wallets);
        for (let i = 0; i < wallets.length; i++) {

            container.innerHTML +=
                `
                <div class="input-group mb-3" role="group" aria-label="Выбор">
                        <a href="admin.html" id="${wallets[i]}" class="btn btn-primary form-control w-50" onclick="SelectWallet(id)">${wallets[i]}</a>
                        <a href="index.html" id="${wallets[i]}" class="btn btn-danger list-group" onclick="DeleteWallet(id)">X</a>
                    </div>
                <div class="btn-toolbar p-2" role="toolbar" aria-label="Выбор и удаление">
                    
                    <div class="btn-group" role="group" aria-label="Удаление">
                        
                    </div>
                </div>
            `;
        }
    } catch (error) {
        container.innerHTML += error;
    }

});


function RegisterUserInWallet(userName, cert, pKey) {
    front.send("RegisterUserInWallet", userName, cert, pKey);
}

front.on("RegisterUserInWalletResult", function (answer) {
    try {
        console.log('RegisterUserWallet');
        let container = document.getElementById("answer");
        container.innerText = answer;
    } catch (error) {
        alert(error);
    }
})