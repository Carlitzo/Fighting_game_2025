
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
                case "lobby_created" :
                    
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