function PeerList(){
    front.send("PeerList");
}

function SelectPeer(walletName){
    front.send("SelectPeer", walletName);
}

front.on("PeerListResult", function(peers){
    let container = document.getElementById("work-screen");
    for(let i = 0; i < peers.length; i++){
        container.innerHTML += 
        `
        <div class="m-1">
            <a href="admin.html" id="${peers[i]}" class="btn btn-primary list-group" onclick="SelectPeer(id)">${peers[i]}</a>
        </div>
        `;
    }
});

