import { startGame } from "./game.js";

export function setEvents() {
    const wrapper = document.getElementById("wrapper");
    const startGameButton = document.getElementById("startGameContainer");
    
    startGameButton.addEventListener("click", () => {
    
        wrapper.style.backgroundImage = "none";
        wrapper.remove();
        startGame();
    })
}