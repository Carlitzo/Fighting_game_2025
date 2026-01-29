import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.224.0/http/file_server.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const originalLog = console.log;

console.log = (...args) => {
  const stack = new Error().stack?.split("\n")[2] || "Unknown location";
  const location = stack.trim().replace(/^at\s+/, "");
  originalLog(`[${location}]`, ...args);
};

const db = new DB("./public/db/users.db");

db.execute(
  `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `
);

const lobbies = new Map();

function generateLobbyId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function createLobby(socket, username, lobbyName, lobbyPassword) {
  const id = generateLobbyId();
  const lobby = { id, lobbyName: lobbyName, lobbyPassword: lobbyPassword, players: new Map(), gameStarted: false };

  lobby.players.set(socket, { username: username, admin: true, x: 0, y: 0, hp: 100, character: null });
  lobbies.set(id, lobby);
  socket.send(JSON.stringify({ type: "lobby_created", lobbyName: lobbyName, username: username, password: lobbyPassword, id: id }));
}

function joinLobby(id, username, socket, password) {
  const lobby = lobbies.get(id);
  if (!lobby) {
    socket.send(JSON.stringify({ type: "error", message: "Lobby not found" }));
    return;
  }
  let players = lobby.players
  let player;
  for (let p of players) {
    if (p.admin) {
      player = p;
    }
  }
  if (player && username === player.username) return; 
  if (password != lobby.lobbyPassword) {
    socket.send(JSON.stringify({ type: "invalid password", message: "Invalid password" }));
    return;
  }
  lobby.players.set(socket, { username: username, admin: false, x: 0, y: 0, hp: 100, character: null });
  let playersArray = Array.from(players.values());
  const playerNamesArray = playersArray.map(p => p.username);

  socket.send(JSON.stringify({type: "player_joined", lobbyName: lobby.lobbyName, username: username, update_type: "add_player", players: playerNamesArray}));
  updateLobby({id: id, socket: socket, type: "update_lobby_for_players", data: username, update_type: "add_player"});
}

function leaveLobby(socket) {
  let matchingLobby = null;
  let matchingPlayer = null;
  
  lobbies.forEach(lobby => {
    if (lobby.players.has(socket)) {
      matchingLobby = lobby;
      matchingPlayer = lobby.players.get(socket);
    }
  });

  if (!matchingLobby) return;

  matchingLobby.players.delete(socket);

  socket.send(JSON.stringify({type: "player_left"}));
  updateLobby({id: matchingLobby.id, socket: socket, type: "update_lobby_for_players", data: matchingPlayer.username, update_type: "remove_player"});
}

function removePlayer(lobby, socket) {
  const lobby_id = lobby.id
  const players = lobby.players;
  const playersArray = Array.from(players.values());
  const userToRemove = playersArray.find(p => p.socket === socket)?.username;

  socket.send(JSON.stringify({type: "player_left"}));
  updateLobby({id: lobby_id, socket: socket, type: "update_lobby_for_players", data: userToRemove, update_type: "remove_player"});
}

function updateLobby({id, socket, type, data, update_type}) {
  const lobby = lobbies.get(id);

  if (!lobby) {
    socket.send(JSON.stringify({ type: "error", message: "Lobby not found" }));
    return;
  }
  
  const players = lobby.players;
  
  for (const [sock] of players) {
    if (sock !== socket) sock.send(JSON.stringify({ lobby: lobby, type: type, data: data, update_type: update_type }));
  };
}

function getAllLobbies(socket) {
  const arrayOfLobbies = [];
  lobbies.forEach((lobby) => {
    let adminUsername = null;

    for (let [socket, player] of lobby.players) { //plocka ut socket och player som nyckel och värde-par i en Map
      if (player.admin) {
        adminUsername = player.username;
      }
    }

    arrayOfLobbies.push({id: lobby.id, admin: adminUsername, lobbyName: lobby.lobbyName, gameStarted: lobby.gameStarted, amountOfPlayers: lobby.players.size});
  })

  socket.send(JSON.stringify({type: "receive_all_lobbies", lobbies: arrayOfLobbies}));
}

function broadcast(lobby, type, data) {
  for (const [sock] of lobby.players) {
    sock.send(JSON.stringify({ lobby, type, data }));
  };
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

  if (url.pathname === "/favicon.ico") {
    return new Response(null, { status: 204 });
  }

  if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    console.log("WebSocket upgraded");

    let currentLobbyId = null;

    socket.onopen = () => console.log("WebSocket connected");

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log(msg);

        switch (msg.type) {
          case "create_lobby":
            createLobby(socket, msg.username, msg.lobbyName, msg.lobbyPassword);
            break;
          case "get_all_lobbies":
            getAllLobbies(socket);
            break;
          case "join_lobby":
            joinLobby(msg.id, msg.user, socket, msg.password);
            currentLobbyId = msg.id;
            break;
          case "update":
            handleUpdate(currentLobbyId, socket, msg.data);
            break;
          case "leave_lobby":
            leaveLobby(socket);
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
          removePlayer(lobby, socket);
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

  if (url.pathname === "/register" && req.method === "POST") {
    try {
      const body = await req.json();
      const { username, password} = body;

      if (!username || !password) {
        return new Response(JSON.stringify({error: "Missing fields"}), {status: 400, headers: { "Content-Type": "application/json"}});
      }

      db.query("INSERT INTO users (username, password) VALUES (?, ?)", [
        username, password,
      ]);

      return new Response(JSON.stringify({success: true}), {status: 200, headers: { "Content-Type": "application/json"}});
    } catch (error) {
      return new Response(JSON.stringify({error: error.message}), {status: 500, headers: { "Content-Type" : "application/json"}});
    }
  }

  if (url.pathname === "/login" && req.method === "POST") {
    try {
      const body = await req.json();
      const { username, password} = body;

      if (!username || !password) {
        return new Response(JSON.stringify({error: "Missing fields"}), {status: 400, headers: { "Content-Type": "application/json"}});
      }

      const result = [...db.query(
        "SELECT password FROM users WHERE username = ?", [username]
      )];

      console.log(result);

      if (result.length === 0) {
        return new Response(JSON.stringify({error: "User not found"}), {status: 401, headers: { "Content-Type": "application/json"}});
      }

      const storedPassword = result[0][0];

      if (storedPassword !== password) {
        return new Response(JSON.stringify({ error: "Incorrect password" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
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