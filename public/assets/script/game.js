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

const main = async () => {
  const grid = document.getElementById("grid");
  const gridSize = 84;

  grid.style.display = "grid";``
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 150px)`;
  grid.style.gridTemplateRows = `repeat(${gridSize}, 150px)`;

  const tileResponse = await fetch("/game/draw-tile");
  const currentTile = await tileResponse.json();

  const currentTilePath = Board.extractTileImagePath(currentTile);
  changeFocusToStartingTile();

  await updateGameState(grid, currentTilePath);
};

globalThis.addEventListener("DOMContentLoaded", main);
