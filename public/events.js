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
            
            let name = localStorage.getItem("username");
            let ws = getWebSocket();
            
            ws.send(JSON.stringify({type: "create_lobby", name: name}));
        });
    };
}