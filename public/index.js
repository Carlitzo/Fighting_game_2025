import { connectWebsocket } from "./network.js";
import { renderMenu } from "./menu.js";
import { setEvents } from "./events.js";

connectWebsocket();
// renderMenu();
renderLoginRegister();
setEvents();