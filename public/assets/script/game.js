import Board from "./board.js";

const updateGameState = async (grid, currentTilePath) => {
  const boardResponse = await fetch("/game/board");
  const tiles = await boardResponse.json();
  const board = new Board(grid);

  board.build(tiles);
  board.addGhostEffect(currentTilePath);
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
  const response = await fetch("/current-player");

  const player = await response.json();

  return player.username;
};

const showCurrentPlayer = (interval) => {
  const currentPlayerLabel = document.querySelector(".player-turn");
  const textLabel = currentPlayerLabel.querySelector("p");

  setInterval(async () => {
    const currentPlayer = await fetchCurrentPlayer();

    textLabel.textContent = `${currentPlayer}'s turn`;
  }, interval);
};

const main = async () => {
  showCurrentPlayer(4000);
  const grid = setupGrid(84);

  const tileResponse = await fetch("/game/draw-tile");
  const currentTile = await tileResponse.json();

  const currentTilePath = Board.extractTileImagePath(currentTile);
  changeFocusToStartingTile();

  await updateGameState(grid, currentTilePath);
};

globalThis.addEventListener("DOMContentLoaded", main);

function setupGrid(gridSize) {
  const grid = document.getElementById("grid");

  grid.style.display = "grid";
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 150px)`;
  grid.style.gridTemplateRows = `repeat(${gridSize}, 150px)`;
  return grid;
}
