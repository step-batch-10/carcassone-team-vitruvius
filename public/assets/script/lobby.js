const main = async() => {
  // const gameDetails = document.querySelector("#game-details");
  const roomID = document.querySelector("#room-id");
  const response = await fetch("/room");
  const {room} = await response.json();
  roomID.textContent = `ROOM ID : ${room}`;

}

globalThis.onload = main;