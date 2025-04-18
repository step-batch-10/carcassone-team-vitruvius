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

const fetchRoomData = async () => {
  const roomData = await fetch("/room");

  const { maxPlayers, roomID, players } = await roomData.json();
  console.log(maxPlayers, "max players i am getting form server");

  return { maxPlayers, roomID, players };
};

const playerRows = (player, index) => {
  const row = createRow(index + 1, player);

  return row;
};

const isRoomFull = (players, maxPlayers) => players.length === maxPlayers;

const redirectToGame = async () => {
  const response = await fetch("/game");

  setTimeout(() => {
    globalThis.location = response.url;
  }, 5000);
};

const updateMessage = (maxPlayers, players) => {
  const message = document.querySelector("#waiting-message");

  message.textContent = `Waiting for ${maxPlayers - players.length} player(s)`;
};

const startRoom = () => {
  const intervalID = setInterval(async () => {
    const roomIDDisplay = document.querySelector("#room-id");
    const { maxPlayers, roomID, players } = await fetchRoomData();
    const table = document.querySelector("#table");
    table.replaceChildren(...players.map(playerRows));
    roomIDDisplay.textContent = `ROOM ID : ${roomID}`;

    if (isRoomFull(players, maxPlayers)) {
      clearInterval(intervalID);
      redirectToGame();
    }

    updateMessage(maxPlayers, players);
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
