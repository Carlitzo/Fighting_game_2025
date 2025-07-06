import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const originalLog = console.log;

console.log = (...args) => {
  const stack = new Error().stack?.split("\n")[2] || "Unknown location";
  const location = stack.trim().replace(/^at\s+/, "");
  originalLog(`[${location}]`, ...args);
};

const lobbies = new Map();

function generateLobbyId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function createLobby(socket, name) {
  const id = generateLobbyId();
  const lobby = {
    id,
    players: new Map(),
    gameStarted: false,
  };
  lobby.players.set(socket, {
    name,
    x: 0,
    y: 0,
    hp: 100,
    character: null,
  });
  lobbies.set(id, lobby);
  socket.send(JSON.stringify({ type: "lobby_created", id }));
}

function joinLobby(id, socket, name) {
  const lobby = lobbies.get(id);
  if (!lobby) {
    socket.send(JSON.stringify({ type: "error", message: "Lobby not found" }));
    return;
  }
  lobby.players.set(socket, {
    name,
    x: 0,
    y: 0,
    hp: 100,
    character: null,
  });
  broadcast(lobby, "player_joined", { name });
}

function broadcast(lobby, type, data) {
  for (const [playerSocket] of lobby.players) {
    playerSocket.send(JSON.stringify({ type, data }));
  }
}

function handleGameUpdate(lobbyId, socket, updateData) {
  const lobby = lobbies.get(lobbyId);
  if (!lobby) return;

  const player = lobby.players.get(socket);
  if (!player) return;

  Object.assign(player, updateData); // t.ex. x, y, hp, etc.

  // Skicka ny position till alla spelare
  const playerStates = [...lobby.players.values()].map(p => ({ // .values returnerar en iterator istället för en riktig array
    name: p.name,                                             // därför görs den om till en array med ...(spread-syntax) så att .map() kan användas.
    x: p.x,
    y: p.y,
    hp: p.hp,
    character: p.character,
  }));

  broadcast(lobby, "state_update", playerStates);
}

serve(async (req) => {
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("WebSocket only", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  let currentLobbyId = null;

  socket.onopen = () => {
    console.log("Client connected");
  };

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      switch (msg.type) {
        case "create_lobby":
          createLobby(socket, msg.name);
          break;
        case "join_lobby":
          joinLobby(msg.id, socket, msg.name);
          currentLobbyId = msg.id;
          break;
        case "update":
          handleGameUpdate(currentLobbyId, socket, msg.data);
          break;
        default:
          socket.send(JSON.stringify({ type: "error", message: "Unknown type" }));
      }
    } catch (e) {
      console.error("JSON parse error:", e.message);
    }
  };

  socket.onclose = () => {
    console.log("Disconnected");
    // Rensa från lobbyn
    for (const [id, lobby] of lobbies) {
      if (lobby.players.has(socket)) {
        lobby.players.delete(socket);
        broadcast(lobby, "player_left", { name: "unknown" });
        if (lobby.players.size === 0) {
          lobbies.delete(id);
        }
        break;
      }
    }
  };

  socket.onerror = (e) => {
    console.error("Socket error:", e.message);
  };

  return response;
}, { port: 8888 });

console.log("Server running on http://localhost:8888");
