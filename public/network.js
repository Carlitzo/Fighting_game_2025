import { renderLobbies, renderLobby, updateLobby, fillLobby, clearModal } from "./renderLobby.js";
import { renderMenu } from "./menu.js";

let ws;

export function connectWebsocket() {
    if (ws) {
        console.warn("Websocket already connected");
        return ws;
    }

    ws = new WebSocket("ws://localhost:8888");

    ws.onopen = () => {
        console.log("Websocket connected!");
    }

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case "lobby_created":
                    renderLobby(data.username, data.password, data.lobbyName, true);
                    updateLobby(data.username, "add_player");
                    console.log(data.username, data.password, data.id, data.lobbyName);
                    break;
                case "receive_all_lobbies":
                    renderLobbies(data.lobbies);
                    break;
                case "player_joined":
                    renderLobby(data.username, data.lobbyName);
                    fillLobby(data.players);
                    clearModal();
                    console.log(data)
                    break;
                case "player_left":
                    clearMenu();
                    renderMenu();
                    break;
                case "update_lobby_for_players":
                    updateLobby(data.data, data.update_type);
                    console.log(data)
                    break;
                
            }
        }
        catch (error) {
            console.warn("Failed to handle the event message", error);
        }
    };

    ws.onclose = () => {
        console.log("Websocket disconnected");
        ws = null;
    }

    ws.onerror = (error) => {
        console.log("Websocket error", error);
    }

    return ws;
}

export function getWebSocket() {
    return ws;
}