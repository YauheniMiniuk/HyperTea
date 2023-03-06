function loadHeader(){
    let header = document.getElementById("header");
    // <button class="btn btn-primary">Back</button>
    header.innerHTML = `<div class="header-menu">
                            <div class="btns">
                                    <span>Made by Evgeny Miniuk</span>
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
    navigation.innerHTML = `<div class="navigation-menu">
                                <div class="btns">
                                    <a class="btn btn-primary" href="index.html">Home</a>
                                    <a class="btn btn-primary" href="profile.html">Profile</a>
                                    <a class="btn btn-secondary" href="camera.html">QR</a>
                                    <a class="btn btn-primary" href="admin.html">Admin</a>
                                </div>
                            </div>`;
    var fs = new FileSystem();
}
try{
    loadHeader();
}catch{}
try{
    loadNavigation();
}catch{}
