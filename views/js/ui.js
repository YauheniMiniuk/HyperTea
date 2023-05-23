function loadHeader(){
    let header = document.getElementById("header");
    // <button class="btn btn-primary">Back</button>
    header.innerHTML = `<div class="header-menu">
                            <div class="text-center">
                                    <div id="wallet"></div>
                                    <div id="orgID"></div>
                                </div>
                            </div>`;
}

/* <button class="btn btn-primary">Init</button>
<button class="btn btn-primary">Mint</button>
<button class="btn btn-primary">Burn</button>
<button class="btn btn-primary">Transfer</button>
<button class="btn btn-primary">History</button>
<button class="btn btn-primary">MyQR</button>
<button class="btn btn-primary">QR Scanner</button> */


function loadNavigation(){
    let navigation = document.getElementById("navigation");
    navigation.innerHTML = `<a class="btn btn-primary col" href="index.html">Home</a>
    <a class="btn btn-primary col" href="profile.html">Profile</a>
    <a class="btn btn-primary col" href="admin.html">Admin</a>`;
    var fs = new FileSystem();
}
try{
    loadHeader();
}catch{}
try{
    loadNavigation();
}catch{}


front.send("CurrentWallet");
front.on("CurrentWallet", function(answer){
    var wallet = document.getElementById('wallet');
    wallet.innerText = answer;
});

front.send("CurrentOrgID");
front.on("CurrentOrgID", function(OrgID){
    console.log("OrgID: " + OrgID);
    var orgID = document.getElementById('orgID');
    orgID.innerText = OrgID;
})