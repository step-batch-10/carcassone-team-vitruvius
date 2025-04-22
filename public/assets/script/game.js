import Board from "./board.js";

const updateGameState = async (grid) => {
  const boardResponse = await fetch("/game/board");
  const tiles = await boardResponse.json();
  const board = new Board(grid);

  board.build(tiles);
  board.addGhostEffect();
};

const changeFocusToStartingTile = () =>
  setTimeout(() => {
    globalThis.scrollTo({
      top: (document.body.scrollHeight - globalThis.innerHeight) / 2,
      left: (document.body.scrollWidth - globalThis.innerWidth) / 2,
      behavior: "smooth",
    });
  }, 2000);

const fetchCurrentPlayer = async () => {
  const response = await fetch("/game/current-player");

  const player = await response.json();

  return player.username;
};

const showCurrentPlayer = (interval) => {
  const currentPlayerLabel = document.querySelector(".player-turn");
  const textLabel = currentPlayerLabel.querySelector("p");

  setInterval(async () => {
    const currentPlayer = await fetchCurrentPlayer();

    textLabel.textContent = `${currentPlayer}'s turn`;
    currentPlayerLabel.style.display = "flex";
  }, interval);
};

const drawATile = async () => {
  const response = await fetch("/game/draw-tile");

  return response.json();
};

const main = async () => {
  showCurrentPlayer(4000);
  const grid = setupGrid(84);

  await drawATile();
  changeFocusToStartingTile();

  await updateGameState(grid);
};

globalThis.addEventListener("DOMContentLoaded", main);

function setupGrid(gridSize) {
  const grid = document.getElementById("grid");

  grid.style.display = "grid";
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 150px)`;
  grid.style.gridTemplateRows = `repeat(${gridSize}, 150px)`;
  return grid;
}
