import { renderMenu } from "./menu.js";
import { clearMenu } from "./clearMenu.js";
import { getWebSocket } from "./network.js";

export function renderLobby(username, password, lobbyId, lobbyName) {
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

    usernameP.id = "usernameP";
    lobbyNameP.id = "lobbyNameP";
    passwordP.id = "passwordP";

    usernameP.textContent = username;
    lobbyNameP.textContent = lobbyName;
    passwordP.textContent = password;

    topDiv.append(usernameP, lobbyNameP, passwordP);
}

export function renderLobbiesDisplay() {
    clearMenu();

    const mainMenuWrapper = document.getElementById("mainMenuWrapper");
    const topDiv = document.createElement("div");
    const midDiv = document.createElement("div");

    topDiv.id = "topDiv";
    midDiv.id = "midDiv";

    mainMenuWrapper.append(topDiv, midDiv);

    mainMenuWrapper.style.justifyContent = "space-between";

    const usernameP = document.createElement("p");
    const username = localStorage.getItem("username");

    usernameP.id = "usernameP";
    usernameP.textContent = username;

    topDiv.append(usernameP);
    topDiv.style.justifyContent = "start";

    let ws = getWebSocket();

    ws.send(JSON.stringify({type: "get_all_lobbies"}));
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
    })
}