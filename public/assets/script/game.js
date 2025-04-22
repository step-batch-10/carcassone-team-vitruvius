import Board from "./board.js";

const querySelector = (selector) => {
  return document.querySelector(selector);
};

const getImgUrl = (cell) => {
  const img = cell.querySelector("img");
  return img.src;
};

const placeTile = (cell) => {
  const [row, col] = cell.id.split("/");

  return fetch("/game/place-tile", {
    method: "PATCH",
    body: JSON.stringify({ row: Number(row), col: Number(col) }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const setBackground = (cell, board) => {
  const imgPath = getImgUrl(cell);
  board.removeGhostEffect();
  const img = cell.querySelector("img");
  const btn = cell.querySelector("button");
  cell.removeChild(img);
  cell.removeChild(btn);
  cell.style.backgroundImage = `url("${imgPath}")`;
  cell.style.opacity = "1";
};

const handleTilePlacement = async (event, board, events) => {
  const tilePlacementRes = await placeTile(event.target.parentNode);
  if (tilePlacementRes.status !== 201) {
    alert("isInvalid Place");
    return;
  }

  setBackground(event.target.parentNode, board);

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

const setupGrid = (gridSize) => {
  const grid = document.getElementById("grid");

  grid.style.display = "grid";
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 150px)`;
  grid.style.gridTemplateRows = `repeat(${gridSize}, 150px)`;

  return grid;
};

const drawTileIfNotDrawn = async (currentTile) => {
  if (!currentTile) {
    await drawATile();
  }
}

const updateGameState = (gameState) => {
  const { board: tiles, currentPlayer, self, currentTile } = gameState;

  const grid = setupGrid(84);
  const board = new Board(grid);
  board.build(tiles, createCellEvents(board));

  if (self.username === currentPlayer.username) {
    drawTileIfNotDrawn(currentTile);
    board.addGhostEffect({ click: rotateRight });
  }
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


  return await response.json();
};

const showCurrentPlayer = (interval) => {
  const currentPlayerLabel = querySelector(".player-turn");
  const textLabel = currentPlayerLabel.querySelector("p");

  setInterval(async () => {
    const currentPlayer = await fetchCurrentPlayer();
    
    textLabel.textContent = `${currentPlayer}'s turn`;
    currentPlayerLabel.style.display = "flex";
  }, interval);
};

const showPlayerStatus = async () => {
  const playerRes = await fetch("/game/self");
  const { noOfMeeples, points, meepleColor } = await playerRes.json();

  const meepleimg = querySelector("#meeple");
  const meepleCount = querySelector("#meeple-count");
  const score = querySelector("#score");
  meepleCount.textContent = noOfMeeples;
  score.textContent = points;
  meepleimg.src = `assets/images/${meepleColor}-meeple.png`;
};

const main = async () => {
  const gameState = await fetchGameState();
  showPlayerStatus();

  updateGameState(gameState);
  changeFocusToStartingTile();
  showCurrentPlayer();
};

globalThis.addEventListener("DOMContentLoaded", main);
