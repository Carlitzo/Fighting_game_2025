import { renderMenu } from "./menu.js";
import { clearMenu } from "./clearMenu.js";
import { getWebSocket } from "./network.js";

export function renderLobby(username, password = null, lobbyName, admin = null) {
    const ws = getWebSocket();
    clearMenu();

    const mainMenuWrapper = document.getElementById("mainMenuWrapper");
    const topDiv = document.createElement("div");
    const midDiv = document.createElement("div");

    topDiv.id = "topDiv";
    midDiv.id = "midDiv";

    mainMenuWrapper.append(topDiv, midDiv);

    mainMenuWrapper.style.justifyContent = "space-between";

    const usernameP = document.createElement("p");
    const lobbyNameP = document.createElement("p");
    const passwordP = document.createElement("p");
    const returnBtn = document.createElement("button");

    usernameP.id = "usernameP";
    lobbyNameP.id = "lobbyNameP";
    passwordP.id = "passwordP";
    returnBtn.id = "returnBtn";

    usernameP.textContent = username;
    lobbyNameP.textContent = lobbyName;
    passwordP.textContent = password;
    returnBtn.textContent = "X";

    if (admin) {
        topDiv.append(usernameP, lobbyNameP, passwordP, returnBtn);
    } else {
        topDiv.append(usernameP, lobbyNameP, returnBtn);
    }

    returnBtn.addEventListener("click", () => {
        clearMenu();
        renderMenu();
        ws.send(JSON.stringify({type: "leave_lobby"}));

    });
    returnBtn.addEventListener("click", (e) => {
        e.stopPropagation();
    })
}

export function renderLobbiesDisplay() {
    clearMenu();

    const mainMenuWrapper = document.getElementById("mainMenuWrapper");
    const wrapper = document.getElementById("wrapper");
    const topDiv = document.createElement("div");
    const midDiv = document.createElement("div");

    topDiv.id = "topDiv";
    midDiv.id = "midDiv";

    mainMenuWrapper.append(topDiv, midDiv);

    mainMenuWrapper.style.justifyContent = "space-between";

    const usernameP = document.createElement("p");
    const joinLobbyButton = document.createElement("button");
    const username = localStorage.getItem("username");

    usernameP.id = "usernameP";
    usernameP.textContent = username;

    joinLobbyButton.id = "joinLobbyButton";
    joinLobbyButton.textContent = "Join Lobby";

    topDiv.append(usernameP, joinLobbyButton);
    topDiv.style.justifyContent = "space-between";

    let ws = getWebSocket();

    ws.send(JSON.stringify({type: "get_all_lobbies"}));

    joinLobbyButton.addEventListener("click", () => {
        
        let selectedId = midDiv.querySelector(".active").id;
        let modal = document.createElement("div");
        let modalContent = document.createElement("div");
        let modalTop = document.createElement("div");
        let modalInstruction = document.createElement("p");
        let modalExit = document.createElement("button");
        let modalPassword = document.createElement("input");
        let sendRequestButton = document.createElement("button");
        modal.id = "modal";
        modalContent.id = "modalContent";
        modalTop.id = "modalTop";
        modalInstruction.id = "modalInstruction";
        modalInstruction.textContent = "Enter lobby password";
        modalExit.id = "modalExit";
        modalExit.textContent = "X";
        modalPassword.id = "modalPassword";
        modalPassword.setAttribute("type", "password");
        sendRequestButton.id = "sendRequestButton";
        sendRequestButton.textContent = "Join";
        wrapper.appendChild(modal);
        modal.appendChild(modalContent)
        modalContent.append(modalTop, modalPassword, sendRequestButton);
        modalTop.append(modalInstruction, modalExit);
        modalExit.addEventListener("click", () => {
            modal.remove();
        })
        modalContent.addEventListener("click", (e) => {
            e.stopPropagation();
        })
        sendRequestButton.addEventListener("click", () => {
            let joiningUser = localStorage.getItem("username");
            let password = modalPassword.value;
            if (joiningUser != null) {
                ws.send(JSON.stringify({type:"join_lobby", id: selectedId, user: joiningUser, password: password}));
            }
        })
    })
}

export function renderLobbies(lobbies) {
    const midDiv = document.getElementById("midDiv");
    midDiv.className = "lobbiesDisplay";
    console.log(lobbies)

    lobbies.forEach((lobby) => {
        let lobbyDiv = document.createElement("div");
        let lobbyNameP = document.createElement("p");
        let lobbyCreatorP = document.createElement("p");
        let lobbyPasswordP = document.createElement("p");
        let lobbyAmountOfPlayersP = document.createElement("p");

        lobbyDiv.className = "lobbyDiv"
        lobbyDiv.id = lobby.id;
        lobbyNameP.className = "lobbyNameP";
        lobbyCreatorP.className = "lobbyCreatorP";
        lobbyPasswordP.className = "lobbyPasswordP";
        lobbyAmountOfPlayersP.className = "lobbyAmountOfPlayersP";

        lobbyNameP.textContent = lobby.lobbyName;
        lobbyCreatorP.textContent = lobby.admin;
        lobbyPasswordP.textContent = "*****";
        lobbyAmountOfPlayersP.textContent = lobby.amountOfPlayers;

        lobbyDiv.append(lobbyNameP, lobbyCreatorP, lobbyPasswordP, lobbyAmountOfPlayersP);

        midDiv.appendChild(lobbyDiv);

        lobbyDiv.addEventListener("click", () => {
            lobbyDiv.classList.toggle("active");
        })
    })
}

export function updateLobby(player, type) {
    const midDiv = document.getElementById("midDiv");

    if (type === "remove_player") {
        const playerToRemove = document.getElementById(player);
        playerToRemove.remove();
    } else if (type === "add_player") {
        const playerContainer = document.createElement("div");
        const playerToAdd = document.createElement("p");
        playerContainer.classList.add("playerContainer");
        playerToAdd.id = player;
        playerToAdd.textContent = player;
        midDiv.appendChild(playerContainer);
        playerContainer.appendChild(playerToAdd);
    }
}

export function fillLobby(players) {
    const midDiv = document.getElementById("midDiv");
    
    for (let player of players) {
        const playerContainer = document.createElement("div");
        const playerToAdd = document.createElement("p");
        playerContainer.classList.add("playerContainer");
        playerToAdd.id = player;
        playerToAdd.textContent = player;
        midDiv.appendChild(playerContainer);
        playerContainer.appendChild(playerToAdd);
    }

}

export function clearModal() {
    const modal = document.getElementById("modal");

    modal.remove();
}