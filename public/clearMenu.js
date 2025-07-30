export function clearMenu() {
    const mainMenuWrapper = document.getElementById("mainMenuWrapper");
    const mainMenuElements = Array.from(mainMenuWrapper.childNodes);

    mainMenuElements.forEach((element) => {
        element.remove();
    })
}