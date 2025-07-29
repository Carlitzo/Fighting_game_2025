import { startGame } from "./game.js";
import { getWebSocket } from "./network.js";


export function setMainMenuEvents() {
    const wrapper = document.getElementById("wrapper");
    const startGameButton = document.getElementById("startGameContainer");
    
    if (startGameButton) {
        
        const mainMenuWrapper = document.getElementById("mainMenuWrapper");
        const mainMenuElements = Array.from(mainMenuWrapper.childNodes);
        
        startGameButton.addEventListener("click", () => {
            mainMenuElements.forEach((element) => {
                element.remove();
            })
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
            // let username = localStorage.getItem("username");
            // let ws = getWebSocket();
            
            // ws.send(JSON.stringify({type: "create_lobby", username: username, lobbyName: lobbyName}));
        });
    };
}