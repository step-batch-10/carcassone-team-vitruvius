import Board from "./board.js";

const updateGameState = async (grid) => {
const getImgUrl = (cell) => {
  const img = cell.querySelector("img");
  console.log();

  return img.src;
};

const placeTile = (cell) => {
  const [row, col] = cell.id.slice("/");
  return fetch("/game/place-tile", {
    method: "PATCH",
    body: JSON.stringify({ row, col }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const addImgToCell = (cell) => {
  console.log(cell);

  const imgPath = getImgUrl(cell);
  cell.innerHtml = "";
  cell.style.backgroundImage = `url("${imgPath}")`;
};

const handleTilePlacement = async (event, board, events) => {
  const tilePlacementRes = await placeTile(event.target);
  if (tilePlacementRes.status !== 201) {
    alert("isInvalid Place");
    return;
  }

  event.target.style.opacity = "1";
  board.removeGhostEffect();
  addImgToCell(event.target);

  event.target.removeEventListener("dblclick", events.dblclick);
};

const createCellEvents = (board) => {
  const events = {
    dblclick: (event) => {
      handleTilePlacement(event, board, events);
    },
  };

  return events;
};

const fetchRotatedTile = async () => {
  const response = await fetch("game/tile/rotate", { method: "PATCH" });

  return await response.json();
};

const rotateRight = async (event) => {
  const rotatedTile = await fetchRotatedTile();

  if (rotatedTile) {
    const tileImage = event.target.parentNode.querySelector("img");
    tileImage.style.transform = `rotateZ(${rotatedTile.orientation}deg)`;
  }
};

const updateGameState = async (grid, currentTilePath) => {
>>>>>>> 0edc13e ([#16]: adds functions rotateTile and placeTile in game.js | sakib/mounika)
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

  // const tileResponse = await fetch("/game/draw-tile");
  // const currentTile = await tileResponse.json();

  // const currentTilePath = Board.extractTileImagePath(currentTile);
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
