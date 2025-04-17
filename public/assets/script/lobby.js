const createRow = (index, { username, meepleColor }) => {
  const row = document.createElement("tr");
  const serial = document.createElement("td");
  const name = document.createElement("td");
  const color = document.createElement("td");

  serial.textContent = index;
  name.textContent = username;
  color.textContent = meepleColor;

  row.append(serial, name, color);

  return row;
};

const newTable = () => {
  const playerDetails = document.querySelector("#players");
  const table = document.createElement("table");
  playerDetails.replaceChildren(table);

  return table;
};

const fetchRoomData = async () => {
  const roomData = await fetch("/room");

  const { maxPlayers, roomID, players } = await roomData.json();

  return { maxPlayers, roomID, players };
};

const appendRow = (table) => {
  return (player, index) => {
    const row = createRow(index + 1, player);

    table.appendChild(row);
  };
};

const isRoomFull = (players, maxPlayers) => players.length === maxPlayers;

const redirectToGame = async () => {
  const response = await fetch("/game");

  setTimeout(() => {
    globalThis.location = response.url;
  }, 5000);
};

const startRoom = () => {
  const intervalID = setInterval(async () => {
    const roomIDDisplay = document.querySelector("#room-id");
    const table = newTable();
    const { maxPlayers, roomID, players } = await fetchRoomData();

    players.forEach(appendRow(table));
    roomIDDisplay.textContent = `ROOM ID : ${roomID}`;

    if (isRoomFull(players, maxPlayers)) {
      clearInterval(intervalID);
      redirectToGame();
    }
  }, 1000);
};

const main = () => {
  startRoom();

  const leave = document.querySelector("#leave-button");

  leave.addEventListener("click", async (_event) => {
    await fetch("/leave", { method: "POST" });

    globalThis.location = "/game-options";
  });
};

globalThis.onload = main;
