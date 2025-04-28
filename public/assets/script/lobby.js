import API from "./api.js";

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
      const response = await API.gamePage();
      globalThis.location = response.url;
    }
  }, 1000);
};

const createCopyBtn = () => {
  const roomDetails = document.querySelectorAll(".room-details-container")[0];

  const img = document.createElement("img");
  img.setAttribute("src", "/assets/images/symbols/copy.png");

  const copyBtn = document.createElement("button");
  copyBtn.appendChild(img);
  copyBtn.setAttribute("id", "copy-button");
  roomDetails.appendChild(copyBtn);

  copyBtn.addEventListener("click", handleCopy);
  document.addEventListener("copy", handleCopy);
};

const startRoom = () => {
  const intervalID = setInterval(async () => {
    const roomIDDisplay = document.querySelector("#room-id");
    const { maxPlayers, roomID, players } = await API.roomInfo();
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

const handleCopy = async (_event) => {
  const { roomID } = await API.roomInfo();

  try {
    navigator.clipboard.writeText(roomID);
    const copyBtn = document.querySelector("#copy-button");
    copyBtn.textContent = "Copied";

    const img = document.createElement("img");
    img.setAttribute("src", "/assets/images/symbols/copy.png");

    setTimeout(() => {
      copyBtn.textContent = "";
      copyBtn.appendChild(img);
    }, 1000);
  } catch (error) {
    console.error(error);
  }
};

const createLeaveBtn = () => {
  const gameDetails = document.querySelector("#game-details");
  const leave = document.createElement("button");

  leave.textContent = "LEAVE";
  leave.addEventListener("click", async (_event) => {
    await API.leaveRoom();

    globalThis.location = "/game-options";
  });

  gameDetails.appendChild(leave);
};

const main = () => {
  startRoom();
  setTimeout(() => {
    createCopyBtn();
    createLeaveBtn();
  }, 1000);
};

globalThis.onload = main;
