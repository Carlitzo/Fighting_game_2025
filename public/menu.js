export function renderMenu() {
    const body = document.body;
    const wrapper = document.createElement("div");
    const mainMenuWrapper = document.createElement("div");

    body.appendChild(wrapper);
    wrapper.appendChild(mainMenuWrapper);
    wrapper.style.backgroundImage = `url("./assets/images/BG_main_menu.png")`;

    wrapper.id = "wrapper";
    mainMenuWrapper.id = "mainMenuWrapper";

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
}