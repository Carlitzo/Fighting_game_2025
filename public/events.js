import { startGame } from "./game.js";
import { getWebSocket } from "./network.js";
import { clearMenu } from "./clearMenu.js";
import { renderLobbiesDisplay } from "./renderLobby.js";


export function setMainMenuEvents() {
    const wrapper = document.getElementById("wrapper");
    const startGameButton = document.getElementById("startGameContainer");
    const joinGameButton = document.getElementById("joinGameContainer");
    
    if (startGameButton) {
        
        startGameButton.addEventListener("click", () => {
            clearMenu();
            const lobbyNameDiv = document.createElement("div");
            const lobbyPasswordDiv = document.createElement("div");
            const lobbyNameInput = document.createElement("input");
            const lobbyPasswordInput = document.createElement("input");
            const createLobbyButton = document.createElement("button");

            lobbyNameDiv.id = "lobbyNameDiv";
            lobbyPasswordDiv.id = "lobbyPasswordDiv";
            lobbyNameInput.id = "lobbyNameInput";
            lobbyPasswordInput.id = "lobbyPasswordInput";
            createLobbyButton.id = "createLobbyButton";

            mainMenuWrapper.appendChild(lobbyNameDiv);
            mainMenuWrapper.appendChild(lobbyPasswordDiv);
            mainMenuWrapper.appendChild(createLobbyButton);
            lobbyNameDiv.appendChild(lobbyNameInput);
            lobbyPasswordDiv.appendChild(lobbyPasswordInput);

            lobbyNameInput.placeholder = "LOBBY NAME";
            lobbyPasswordInput.placeholder = "LOBBY PASSWORD";
            createLobbyButton.textContent = "Create Game";

            createLobbyButton.addEventListener("click", () => {

                let lobbyName = lobbyNameInput.value;
                let lobbyPassword = lobbyPasswordInput.value;
                let username = localStorage.getItem("username");
                let ws = getWebSocket();
                
                ws.send(JSON.stringify({type: "create_lobby", username: username, lobbyName: lobbyName, lobbyPassword: lobbyPassword}));
            });
            
        });
    };

    if (joinGameButton) {
        joinGameButton.addEventListener("click", () => {
            clearMenu();
            renderLobbiesDisplay();
        })
    }
}