import { renderMenu } from "./menu.js";
import { loginUser } from "./handlers/loginHandler.js";
import { registerUser } from "./handlers/registerHandler.js";

export function renderLoginRegister() {
    const body = document.body;
    const wrapper = document.createElement("div");
    const mainMenuWrapper = document.createElement("div");
    const loginDiv = document.createElement("div");
    const registerDiv = document.createElement("div");
    const loginP = document.createElement("p");
    const registerP = document.createElement("p");

    body.appendChild(wrapper);
    wrapper.appendChild(mainMenuWrapper);
    wrapper.style.backgroundImage = `url("./assets/images/BG_main_menu.png")`;

    wrapper.id = "wrapper";
    mainMenuWrapper.id = "mainMenuWrapper";

    mainMenuWrapper.appendChild(loginDiv);
    mainMenuWrapper.appendChild(registerDiv);
    loginDiv.appendChild(loginP);
    registerDiv.appendChild(registerP);
    loginP.textContent = "Login";
    registerP.textContent = "Register";

    loginDiv.id = "loginDiv";
    registerDiv.id = "registerDiv";

    loginDiv.addEventListener("click", () => {
        renderLogin(loginDiv, registerDiv);
    });

    registerDiv.addEventListener("click", () => {
        renderRegister(loginDiv, registerDiv);
    })
}

function renderLogin(loginDiv, registerDiv) {
    const mainMenuWrapper = document.getElementById("mainMenuWrapper");

    loginDiv.remove();
    registerDiv.remove();

    const usernameDiv = document.createElement("div");
    const usernameInputfield = document.createElement("input");
    usernameInputfield.placeholder = "USERNAME";
    usernameInputfield.type = "text";

    const passwordDiv = document.createElement("div");
    const passwordInputfield = document.createElement("input");
    passwordInputfield.placeholder = "PASSWORD";
    passwordInputfield.type = "password";

    const loginButton = document.createElement("button");
    loginButton.textContent = "Login";

    mainMenuWrapper.appendChild(usernameDiv);
    mainMenuWrapper.appendChild(passwordDiv);
    mainMenuWrapper.appendChild(loginButton);

    usernameDiv.appendChild(usernameInputfield);
    passwordDiv.appendChild(passwordInputfield);

    usernameDiv.id = "usernameDiv";
    usernameInputfield.id = "usernameInputfield"
    passwordDiv.id = "passwordDiv";
    passwordInputfield.id = "passwordInputfield";
    loginButton.id = "loginButton";
    
    loginButton.addEventListener("click", async () => {
        let username = document.getElementById("usernameInputfield").value;
        let password = document.getElementById("passwordInputfield").value;

        const result = await loginUser(username, password);
        
        if (result.success === true) {
            mainMenuWrapper.innerHTML = "";
            localStorage.setItem("username", username);
            renderMenu();
        } else {
            alert("Login failed");
        }
    })
}

function renderRegister(loginDiv, registerDiv) {
    const mainMenuWrapper = document.getElementById("mainMenuWrapper");

    loginDiv.remove();
    registerDiv.remove();

    const usernameDiv = document.createElement("div");
    const usernameHeader = document.createElement("h6");
    const usernameInputfield = document.createElement("input");
    usernameHeader.textContent = "Enter your username here";
    usernameInputfield.placeholder = "USERNAME";
    usernameInputfield.type = "text";

    const passwordDiv = document.createElement("div");
    const passwordHeader = document.createElement("h6");
    const passwordInputfield = document.createElement("input");
    passwordHeader.textContent = "Enter your password here";
    passwordInputfield.placeholder = "PASSWORD";
    passwordInputfield.type = "password";

    const registerButton = document.createElement("button");
    registerButton.textContent = "Register";

    mainMenuWrapper.appendChild(usernameDiv);
    mainMenuWrapper.appendChild(passwordDiv);
    mainMenuWrapper.appendChild(registerButton);

    usernameDiv.appendChild(usernameHeader)
    usernameDiv.appendChild(usernameInputfield);
    passwordDiv.appendChild(passwordHeader);
    passwordDiv.appendChild(passwordInputfield);

    usernameDiv.id = "usernameDiv";
    usernameHeader.id = "usernameHeader";
    usernameInputfield.id = "usernameInputfield"
    passwordDiv.id = "passwordDiv";
    passwordHeader.id = "passwordHeader";
    passwordInputfield.id = "passwordInputfield";
    registerButton.id = "registerButton";

    registerButton.addEventListener("click", async () => {
        let username = document.getElementById("usernameInputfield").value;
        let password = document.getElementById("passwordInputfield").value;

        let result = await registerUser(username, password);

        if (result.success === true) {
            let wrapper = document.getElementById("wrapper");
            wrapper.remove();
            renderLoginRegister();
        } else {
            alert("Register failed");
        }
    })
}
