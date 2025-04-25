const API = {
  login: async (formData) =>
    await fetch("/login", { method: "POST", body: formData }),

  lobby: async () => await fetch("/lobby"),

  joinPage: async () => await fetch("html/join-game.html"),

  leaveRoom: async () => await fetch("/leave", { method: "POST" }),

  gamePage: async () => await fetch("/game"),

  joinRoom: async (formData) => {
    const response = await fetch("/joinRoom", {
      method: "POST",
      body: formData,
    });

    return await response.json();
  },

  roomInfo: async () => {
    const response = await fetch("/room");

    const { maxPlayers, roomID, players } = await response.json();

    return { maxPlayers, roomID, players };
  },

  claim: async (side) =>
    await fetch("/game/claim", {
      method: "PATCH",
      body: JSON.stringify({ side }),
      headers: { "Content-Type": "application/json" },
    }),

  self: async () => {
    const playerRes = await fetch("/game/self");

    return await playerRes.json();
  },

  allPlayers: async () => {
    const playerRes = await fetch("/game/players");

    return await playerRes.json();
  },

  placeTile: (position) => {
    return fetch("/game/place-tile", {
      method: "PATCH",
      body: JSON.stringify(position),
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  rotateTile: async () => {
    const response = await fetch("game/tile/rotate", { method: "PATCH" });

    return await response.json();
  },

  drawATile: async () => {
    const response = await fetch("/game/draw-tile");

    return await response.json();
  },

  currentPlayer: async () => {
    const response = await fetch("/game/current-player");

    return await response.json();
  },

  gameState: async () => {
    const response = await fetch("/game/state");

    return await response.json();
  },

  placeablePositions: async () => {
    const res = await fetch("/game/tile/placeable-positions");
    return await res.json();
  },

  currentTile: async () => {
    const response = await fetch("/game/current-tile");

    return await response.json();
  },
};

export default API;
