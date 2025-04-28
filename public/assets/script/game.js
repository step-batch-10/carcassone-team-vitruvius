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

const selectNodes = (selectors, parentNode) =>
  selectors.map((selector) => parentNode.querySelector(selector));

const createPlayerElement = (player) => {
  const { username, meepleColor, noOfMeeples, points } = player;

  const template = document.querySelector("#player-template");
  const playerStatusClone = template.content.cloneNode(true);
  const selectors = ["#player-name", ".meeple", "#meeple-count", "#score"];

  const [playerNameNode, meepleImage, meepleCount, score] = selectNodes(
    selectors,
    playerStatusClone,
  );

  playerNameNode.textContent = username;
  meepleImage.setAttribute("src", `assets/images/${meepleColor}-meeple.png`);
  meepleCount.textContent = noOfMeeples;
  score.textContent = points;

  return playerStatusClone;
};

const setUpStatusBox = async () => {
  const statusBox = document.querySelector("#players-status");
  const self = await API.self();
  const APIs = [async () => [await API.self()], API.allPlayers];

  statusBox.addEventListener("click", createShowPlayerTableHandler(APIs, self));
};

const showCurrentPlayerStatus = async () => {
  const player = await API.self();
  const playerStatusNode = createPlayerElement(player);
  const playersStatus = document.querySelector("#players-status");
  const statusBody = playersStatus.querySelector("tbody");

  statusBody.replaceChildren(playerStatusNode);
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

const toggleShowPlayersTable = async (currentAPI, self) => {
  const playersTable = document.querySelector("#players-status");
  const statusBody = playersTable.querySelector("tbody");
  const players = await currentAPI();
  const selfNode = createPlayerElement(self);
  const otherPlayers = players.filter(
    ({ username }) => self.username !== username,
  );
  const otherPlayerNodes = otherPlayers.map(createPlayerElement);

  statusBody.replaceChildren(...otherPlayerNodes, selfNode);
};

const createShowPlayerTableHandler = (APIs, self) => {
  let index = 0;

  return (_event) => {
    const currentAPI = APIs.at(index);
    toggleShowPlayersTable(currentAPI, self);
    index = (index + 1) % APIs.length;
  };
};

const main = async () => {
  const grid = setupGrid(84);
  const board = new Board(grid);
  board.registerCellEvents(createCellEvents(board));

  const newGameState = await API.gameState();
  const gameState = new GameState(newGameState, board);

  await gameState.renderGameState();
  setUpStatusBox();
  showCurrentPlayerStatus();

  const gameStatePoller = new Poller(() => loadGame(gameState), 1000);
  gameStatePoller.startPolling();

  const turnPoller = new Poller(pollTurn(gameStatePoller, gameState), 1000);
  turnPoller.startPolling();

  addScrollFeatures();
  changeFocusToStartingTile();
  showCurrentPlayer(5000);
};

globalThis.addEventListener("DOMContentLoaded", main);
