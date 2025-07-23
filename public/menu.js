import { setMainMenuEvents } from "./events.js";

export function renderMenu() {
    const wrapper = document.getElementById("wrapper");
    const mainMenuWrapper = document.getElementById("mainMenuWrapper");

    wrapper.appendChild(mainMenuWrapper);

    const menuOptions = ["Start Game", "Join Game", "Highscores", "Music"];
    const menuIds = ["startGame", "joinGame", "highscores", "music"];

    for (let i = 0; i < 4; i++) {
        let menuOptionContainer = document.createElement("div");
        let menuOptionText = document.createElement("p")
        menuOptionContainer.id = menuIds[i] + "Container";
        menuOptionText.id = menuIds[i];
        menuOptionText.textContent = menuOptions[i];
        mainMenuWrapper.appendChild(menuOptionContainer);
        menuOptionContainer.appendChild(menuOptionText);
    };

    setMainMenuEvents();
}