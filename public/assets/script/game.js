import Board from "./board.js";
import API from "./api.js";
import Cell from "./cell.js";
import addScrollFeatures from "./scroll.js";
import Poller from "./poller.js";
import GameState from "./game-state.js";

const placeTile = (cell) => {
  const img = cell.querySelector("img");
  cell.querySelectorAll("button").forEach((button) => button.remove());

  img.classList.remove("ghost-img");
  img.classList.add("tile");
  cell.style.opacity = "1";
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
  placeTile(cell, board);

  event.target.removeEventListener("dblclick", events.dblclick);
  Cell.addMeepleOptions(cell, board.getMapOrientation());
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
    currentPlayerLabel.classList.remove("hidden");
    currentPlayerLabel.classList.add("visible");
  }, interval);
};

const setUpStatusBox = (gameState) => {
  const statusBox = document.querySelector("#players-status");

  statusBox.addEventListener("click", async () => {
    gameState.toggleShowPlayersTable();
    await gameState.showPlayerStatus(gameState);
  });
};

const loadGame = async (gameState) => {
  const newGameState = await API.gameState();

  await gameState.updateGameState(newGameState);
};

const pollTurn = (gameStatePoller, gameState) => {
  return async () => {
    const currentPlayer = await API.currentPlayer();
    const self = gameState.self;

    const isPlayerTurn = self.username === currentPlayer;

    if (isPlayerTurn && gameStatePoller.isPolling()) {
      gameStatePoller.stopPolling();

      setTimeout(() => loadGame(gameState), 1000);
    }

    if (!isPlayerTurn && !gameStatePoller.isPolling()) {
      gameStatePoller.startPolling();
    }
  };
};

export const addFlashEffect = (element) => element.classList.add("flash");

export const removeFlashEffect = (element) =>
  setTimeout(() => element.classList.remove("flash"), 300);

const setUPLastPlacedTileOption = () => {
  const lastPlacedTileOption = document.querySelector("#last-placed-tile");

  lastPlacedTileOption.addEventListener("click", async () => {
    addFlashEffect(lastPlacedTileOption);

    const lastPlacedTilePosition = await API.lastPlacedTilePosition();

    if (lastPlacedTilePosition) {
      Board.scrollToCellElementOf(lastPlacedTilePosition);
    }

    removeFlashEffect(lastPlacedTileOption);
  });
};

const setUpLastPlayerTileOption = () => {
  const lastPlayerTileOption = document.querySelector("#last-player-tile");

  lastPlayerTileOption.addEventListener("click", async () => {
    addFlashEffect(lastPlayerTileOption);
    const lastPlacedPosition = await API.lastPlayerTilePosition();

    Board.scrollToCellElementOf(lastPlacedPosition);
    removeFlashEffect(lastPlayerTileOption);
  });
};

const setUpWorldRotateOption = (board, gameState) => {
  const worldRotateOption = document.querySelector("#world-rotate");

  worldRotateOption.addEventListener("click", async () => {
    addFlashEffect(worldRotateOption);
    board.rotateMap();
    await gameState.renderGameState();
    removeFlashEffect(worldRotateOption);
  });
};

const setUpToggleGrid = () => {
  const toggleBtn = document.querySelector("#toggle");

  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("show-grid-border");
    if (document.body.classList.contains("show-grid-border")) {
      toggleBtn.src = "/assets/images/symbols/toggle-off.png";
    } else {
      toggleBtn.src = "/assets/images/symbols/toggle.png";
    }
  });
};

const isTileExist = (cell) => cell.tile;

const maxOfRow = (board) => {
  return board.reduce((minOfRow, row, index) => {
    return row.some(isTileExist) ? index : minOfRow;
  }, -1);
};

const minOfRow = (board) => {
  for (const index in board) {
    if (board[index].some(isTileExist)) {
      return Number(index);
    }
  }

  return -1;
};

const min = (minNumber, number) => (minNumber < number ? minNumber : number);
const max = (maxNumber, number) => (maxNumber > number ? maxNumber : number);

const minOfCol = (board) => {
  const positions = [];

  for (const row of board) {
    for (const index in row) {
      if (row[index].tile !== null) positions.push(Number(index));
    }
  }

  return positions.reduce(min);
};

const maxOfCol = (board) => {
  const positions = [];

  for (const row of board) {
    for (const index in row) {
      if (row[index].tile !== null) positions.push(Number(index));
    }
  }

  return positions.reduce(max, -1);
};

const findMiddleCellPosition = (board) => {
  const row = Math.floor((minOfRow(board) + maxOfRow(board)) / 2);
  const col = Math.floor((minOfCol(board) + maxOfCol(board)) / 2);

  return row === -1 || col === -1 ? null : { row, col };
};

const setUpScrollToMiddleOption = (gameState) => {
  const middleCellPositionOption = document.querySelector("#center");

  middleCellPositionOption.addEventListener("click", () => {
    addFlashEffect(middleCellPositionOption);
    const middleCellPosition = findMiddleCellPosition(gameState.getBoard());

    if (middleCellPosition) Board.scrollToCellElementOf(middleCellPosition);
    removeFlashEffect(middleCellPositionOption);
  });
};

const setUpThemeOption = () => {
  const themeOption = document.querySelector("#theme");

  themeOption.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });
};

const setUpOrientationOptions = (board, gameState) => {
  setUPLastPlacedTileOption();
  setUpLastPlayerTileOption();
  setUpToggleGrid();
  setUpWorldRotateOption(board, gameState);
  setUpThemeOption();
  setUpScrollToMiddleOption(gameState);
};

const main = async () => {
  const grid = setupGrid(84);
  const board = new Board(grid);
  board.registerCellEvents(createCellEvents(board));

  const APIs = [async () => [await API.self()], API.allPlayers];
  const newGameState = await API.gameState();
  const gameState = new GameState(newGameState, board, APIs);

  await gameState.renderGameState();
  setUpStatusBox(gameState);

  const gameStatePoller = new Poller(() => loadGame(gameState), 1000);
  gameStatePoller.startPolling();

  const turnPoller = new Poller(pollTurn(gameStatePoller, gameState), 1000);
  turnPoller.startPolling();

  gameState.registerPollers(gameStatePoller, turnPoller);
  addScrollFeatures();
  changeFocusToStartingTile();
  showCurrentPlayer(5000);
  setUpOrientationOptions(board, gameState);
};

globalThis.addEventListener("DOMContentLoaded", main);
