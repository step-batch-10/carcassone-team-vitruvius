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

const showPlacedMeeple = async (event) => {
  const { meepleColor } = await API.self();

  const meeple = document.createElement("img");

  meeple.classList.add("used-meeple");
  meeple.setAttribute("src", `/assets/images/${meepleColor}-meeple.png`);

  event.target.appendChild(meeple);
};

const removeMeepleListeners = (event, listener) => {
  const placed = event.target;
  const subgrids = document.querySelectorAll(".subgrid");
  subgrids.forEach((subgrid) => subgrid.remove());
  const skipBtn = document.querySelectorAll(".skip")[0];
  skipBtn.remove();

  placed.parentNode.appendChild(placed);
  placed.removeEventListener("click", listener);
};

const handlePlaceMeeple = (side) => {
  const placeMeeple = async (event) => {
    const res = await API.claim(side);

    if (res.status === 201) {
      await showPlacedMeeple(event);
      removeMeepleListeners(event, placeMeeple);
    }
  };

  return placeMeeple;
};

const createSubGrid = async () => {
  const sides = await API.claimables();

  return sides.map((side) => {
    const element = document.createElement("div");

    const ghostMeeple = document.createElement("img");
    ghostMeeple.setAttribute("src", `/assets/images/ghost-meeple.png`);
    ghostMeeple.classList.add("ghost");
    element.appendChild(ghostMeeple);

    element.classList.add("sub-grid");
    element.classList.add(side);
    element.addEventListener("click", handlePlaceMeeple(side));

    return element;
  });
};

const handleSkip = (cell) => {
  return async (_) => {
    await fetch("/game/skip-claim", { method: "PATCH" });
    const img = cell.querySelector("img");
    cell.replaceChildren(img);
  };
};

const addMeepleOptions = async (cell) => {
  const subGrid = await createSubGrid();
  const skipButton = document.createElement("button");

  skipButton.classList.add("skip");
  skipButton.addEventListener("click", handleSkip(cell));

  cell.append(...subGrid, skipButton);
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
  board.registerLastTilePosition(position);
  placeTile(cell, board);

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
      loadGame(gameState);
      gameStatePoller.stopPolling();
    }

    if (!isPlayerTurn && !gameStatePoller.isPolling()) {
      gameStatePoller.startPolling();
    }
  };
};

const showRemainingTiles = (interval) => {
  const remainingTiles = document.querySelector(".remaining-tiles");
  const textLabel = remainingTiles.querySelector("p");

  setInterval(async () => {
    const numberOfTilesLeft = await API.remainingTiles();
    textLabel.textContent = `Remaining Tiles: ${numberOfTilesLeft + 1}`;
    remainingTiles.style.display = "flex";
  }, interval);
};

const setUPLastPlacedTileOption = () => {
  const lastPlacedTileOption = document.querySelector("#last-placed-tile");

  lastPlacedTileOption.addEventListener("click", async () => {
    const lastPlacedTilePosition = await API.lastPlacedTilePosition();

    if (lastPlacedTilePosition) {
      Board.scrollToCellElementOf(lastPlacedTilePosition);
    }
  });
};

const setUpLastPlayerTileOption = () => {
  const lastPlayerTileOption = document.querySelector("#last-player-tile");

  lastPlayerTileOption.addEventListener("click", async () => {
    const lastPlacedPosition = await API.lastPlayerTilePosition();

    Board.scrollToCellElementOf(lastPlacedPosition);
  });
};

const setUpOrientationOptions = () => {
  setUPLastPlacedTileOption();
  setUpLastPlayerTileOption();
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

  addScrollFeatures();
  changeFocusToStartingTile();
  showCurrentPlayer(5000);
  showRemainingTiles(3000);
  setUpOrientationOptions();
};

globalThis.addEventListener("DOMContentLoaded", main);
