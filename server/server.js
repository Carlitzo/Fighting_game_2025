import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.224.0/http/file_server.ts";

// --- Lobbydata ---
const lobbies = new Map();

function generateLobbyId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function createLobby(socket, name) {
  const id = generateLobbyId();
  const lobby = { id, players: new Map(), gameStarted: false };
  lobby.players.set(socket, { name, x: 0, y: 0, hp: 100, character: null });
  lobbies.set(id, lobby);
  socket.send(JSON.stringify({ type: "lobby_created", id }));
}

function joinLobby(id, name, socket) {
  const lobby = lobbies.get(id);
  if (!lobby) {
    socket.send(JSON.stringify({ type: "error", message: "Lobby not found" }));
    return;
  }
  lobby.players.set(socket, { name, x: 0, y: 0, hp: 100, character: null });
  broadcast(lobby, "player_joined", { name });
}

function broadcast(lobby, type, data) {
  for (const [sock] of lobby.players) {
    sock.send(JSON.stringify({ type, data }));
  }
}

function handleUpdate(id, socket, updateData) {
  const lobby = lobbies.get(id);
  if (!lobby || !lobby.players.has(socket)) return;

  Object.assign(lobby.players.get(socket), updateData);

  const playerStates = [...lobby.players.values()].map(p => ({
    name: p.name,
    x: p.x,
    y: p.y,
    hp: p.hp,
    character: p.character,
  }));

  broadcast(lobby, "state_update", playerStates);
}

const requestHandler = async (req) => {
  const url = new URL(req.url, "http://localhost:8888");

  // Ignorera favicon.ico
  if (url.pathname === "/favicon.ico") {
    return new Response(null, { status: 204 });
  }

  // WebSocket-uppkoppling
  if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    console.log("WebSocket upgraded");

    let currentLobbyId = null;

    socket.onopen = () => console.log("WebSocket connected");

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case "create_lobby":
            createLobby(socket, msg.name);
            break;
          case "join_lobby":
            joinLobby(msg.id, msg.name, socket);
            currentLobbyId = msg.id;
            break;
          case "update":
            handleUpdate(currentLobbyId, socket, msg.data);
            break;
          default:
            socket.send(JSON.stringify({ type: "error", message: "Unknown message type" }));
        }
      } catch (err) {
        console.error("JSON-error:", err.message);
      }
    };

    socket.onclose = (event) => {
      console.log(`WebSocket closed: code=${event.code}, reason=${event.reason}`);
      for (const [id, lobby] of lobbies) {
        if (lobby.players.has(socket)) {
          lobby.players.delete(socket);
          broadcast(lobby, "player_left", { name: "unknown" });
          if (lobby.players.size === 0) {
            lobbies.delete(id);
            console.log(`Lobby ${id} removed (empty)`);
          }
          break;
        }
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error.message);
    };

    return response;
  }

  const filePath = `./public${url.pathname === "/" ? "/index.html" : url.pathname}`;

  try {
    return await serveFile(req, filePath);
  } catch (err) {
    console.error("404:", err.message);
    return new Response("404 - File not found", { status: 404 });
  }
};

serve(requestHandler, { port: 8888 });
console.log("Server running on localhost:8888");