import { connectWebsocket } from "./network.js";
import { renderMenu } from "./menu.js";
import { renderLoginRegister } from "./login_register.js";

connectWebsocket();
renderLoginRegister();
