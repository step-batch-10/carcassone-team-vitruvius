import Board from "./board.js";
import API from "./api.js";
import Cell from "./cell.js";
import addScrollFeatures from "./scroll.js";
import { Poller } from "./multiplayer.js";

const getImgUrl = (cell) => cell.querySelector("img").src;

const setBackground = (cell) => {
  const imgPath = getImgUrl(cell);
  const img = cell.querySelector("img");
  const btn = cell.querySelector("button");
  cell.removeChild(img);
  cell.removeChild(btn);
  cell.style.backgroundImage = `url("${imgPath}")`;
  cell.style.opacity = "1";
};

const showPlacedMeeple = async (event) => {
  const { meepleColor } = await API.self();

  const meeple = document.createElement("img");

  meeple.classList.add("used-meeple");
  meeple.setAttribute("src", `/assets/images/${meepleColor}-meeple.png`);

  event.target.appendChild(meeple);
};

const removeMeepleListeners = (event, listener) => {
  const placed = event.target;

  placed.parentNode.replaceChildren(placed);
  placed.removeEventListener("click", listener);
};

const handlePlaceMeeple = (side) => {
  const placeMeeple = async (event) => {
    const res = await API.claim(side);

    if (res.status === 201) {
      await showPlacedMeeple(event);
      removeMeepleListeners(event, placeMeeple);
      showPlayerStatus();
    }
  };

  return placeMeeple;
};

const createSubGrid = () => {
  const sides = ["left", "top", "right", "bottom", "middle"];

  return sides.map((side) => {
    const element = document.createElement("div");

    element.classList.add("sub-grid");
    element.classList.add(side);
    element.addEventListener("click", handlePlaceMeeple(side));

    return element;
  });
};

const handleSkip = (cell) => {
  return (_) => {
    cell.replaceChildren();
  };
};

const addMeepleOptions = (cell) => {
  const subGrid = createSubGrid();
  const skipButton = document.createElement("button");

  skipButton.classList.add("skip");
  skipButton.addEventListener("click", handleSkip(cell));

  cell.replaceChildren(...subGrid, skipButton);
};

const handleTilePlacement = async (event, board, events) => {
  const cell = event.target.parentNode;
  const position = Cell.parseCellId(cell.id);

  const tilePlacementRes = await API.placeTile(position);

  if (tilePlacementRes.status !== 201) {
    cell.classList.add("invalid-placement");
    setTimeout(() => cell.classList.remove("invalid-placement"), 200);

    return;
  }

  board.removeGhostEffect();
  Board.removePlaceableCellsHighlight();
  setBackground(cell, board);

  event.target.removeEventListener("dblclick", events.dblclick);
  addMeepleOptions(cell);
};

const createCellEvents = (board) => {
  const events = {
    dblclick: (event) => {
      handleTilePlacement(event, board, events);
    },
  };

  return events;
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
    await API.drawATile();
  }
};

const updateGameState = async (gameState) => {
  const { board: tiles, currentPlayer, self, currentTile } = gameState;

  const grid = setupGrid(84);
  const board = new Board(grid);
  board.build(tiles, createCellEvents(board));

  // make it as a function
  if (self.username === currentPlayer.username) {
    await drawTileIfNotDrawn(currentTile);
    board.addGhostEffect();
    Board.highlightPlaceableCells();
  }
};

const getOriginCoordinates = () => ({
  top: (document.body.scrollHeight - globalThis.innerHeight) / 2,
  left: (document.body.scrollWidth - globalThis.innerWidth) / 2,
  behavior: "smooth",
});

const focusOnOrigin = () => globalThis.scrollTo(getOriginCoordinates());

const changeFocusToStartingTile = () => setTimeout(focusOnOrigin, 2000);

const showCurrentPlayer = (interval) => {
  const currentPlayerLabel = document.querySelector(".player-turn");
  const textLabel = currentPlayerLabel.querySelector("p");

  setInterval(async () => {
    const currentPlayer = await API.currentPlayer();
    textLabel.textContent = `${currentPlayer}'s turn`;
    currentPlayerLabel.style.display = "flex";
  }, interval);
};

const showPlayerStatus = async () => {
  const { noOfMeeples, points, meepleColor } = await API.self();

  const meepleImg = document.querySelector("#meeple");
  const meepleCount = document.querySelector("#meeple-count");
  const score = document.querySelector("#score");
  meepleCount.textContent = noOfMeeples;
  score.textContent = points;
  meepleImg.src = `assets/images/${meepleColor}-meeple.png`;
};

const loadGame = async () => {
  const gameState = await API.gameState();

  await updateGameState(gameState);
  await showPlayerStatus();
};

const refreshGame = () => {
  loadGame();
};

const pollTurn = (gameStatePoller) => {
  return async () => {
    const currentPlayer = await API.currentPlayer();
    const self = await API.self();

    const isPlayerTurn = self.username === currentPlayer;

    if (isPlayerTurn && gameStatePoller.isPolling()) {
      loadGame();
      gameStatePoller.stopPolling();
    }

    if (!isPlayerTurn && !gameStatePoller.isPolling()) {
      gameStatePoller.startPolling();
    }
  };
};

const main = async () => {
  await loadGame();

  const gameStatePoller = new Poller(refreshGame, 1000);
  gameStatePoller.startPolling();

  const turnPoller = new Poller(pollTurn(gameStatePoller), 1000);
  turnPoller.startPolling();

  addScrollFeatures();
  changeFocusToStartingTile();
  showCurrentPlayer(5000);
};

globalThis.addEventListener("DOMContentLoaded", main);
