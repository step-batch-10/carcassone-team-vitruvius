const createRow = (index, { username, meepleColor }) => {
  const row = document.createElement("tr");
  const serial = document.createElement("td");
  const name = document.createElement("td");
  const color = document.createElement("td");
  const image = document.createElement("img");
  image.setAttribute("src", `/assets/images/${meepleColor}-meeple.png`);
  image.style.width = "40px";
  image.style.height = "80%";

  serial.textContent = index;
  name.textContent = username;
  color.appendChild(image);

  row.append(serial, name, color);

  return row;
};

const fetchRoomData = async () => {
  const roomData = await fetch("/room");

  const { maxPlayers, roomID, players } = await roomData.json();

  return { maxPlayers, roomID, players };
};

const playerRows = (player, index) => {
  const row = createRow(index + 1, player);

  return row;
};

const isRoomFull = (players, maxPlayers) => players.length === maxPlayers;

const updateMessage = (maxPlayers, players) => {
  const message = document.querySelector("#waiting-message");

  message.textContent = `Waiting for ${maxPlayers - players.length} player(s)`;
};

const startGameCountdown = () => {
  let countdown = 3;
  const intervalID = setInterval(async () => {
    const message = document.querySelector("#waiting-message");
    message.textContent = `Starting in ${countdown} seconds...`;
    countdown -= 1;

    if (countdown === 0) {
      clearInterval(intervalID);
      const response = await fetch("/game");
      globalThis.location = response.url;
    }
  }, 1000);
};

const startRoom = () => {
  const intervalID = setInterval(async () => {
    const roomIDDisplay = document.querySelector("#room-id");
    const { maxPlayers, roomID, players } = await fetchRoomData();
    const table = document.querySelector("#table");
    table.replaceChildren(...players.map(playerRows));
    roomIDDisplay.textContent = `ROOM ID : ${roomID}`;

    if (isRoomFull(players, maxPlayers)) {
      startGameCountdown();
      clearInterval(intervalID);
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
