import { connectWebsocket } from "./network.js";
import { renderMenu } from "./menu.js";
import { startGame } from "./game.js";

connectWebsocket();
renderMenu();
startGame();