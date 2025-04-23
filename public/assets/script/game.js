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

const showPlacedMeeple = async (event) => {
  const playerRes = await fetch("/game/self");
  const { meepleColor } = await playerRes.json();

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
    const res = await fetch("/game/claim", {
      method: "PATCH",
      body: JSON.stringify({ side }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.status === 201) {
      await showPlacedMeeple(event);
      removeMeepleListeners(event, placeMeeple);
    }
  };

  return placeMeeple;
};

const createSubgrid = async () => {
  const sidesResponse = await fetch("/game/claimables");
  const { sides } = await sidesResponse.json();

  return sides.map((side) => {
    const element = document.createElement("div");

    element.classList.add("subgrid");
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
  const subgrid = createSubgrid();
  const skipButton = document.createElement("button");
  skipButton.classList.add("skip");
  skipButton.addEventListener("click", handleSkip(cell));

  cell.replaceChildren(...subgrid, skipButton);
};

const handleTilePlacement = async (event, board, events) => {
  const tilePlacementRes = await placeTile(event.target.parentNode);
  if (tilePlacementRes.status !== 201) {
    alert("isInvalid Place");
    return;
  }

  const cell = event.target.parentNode;
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

const fetchRotatedTile = async () => {
  const response = await fetch("game/tile/rotate", { method: "PATCH" });

  return await response.json();
};

const reqForPlaceablePositions = async () => {
  const res = await fetch("/game/tile/placeable-positions");
  return await res.json();
};

const getCell = (row, col) => document.getElementById(`${row}/${col}`);

const heightLightPlaceableCells = async () => {
  const validPositions = await reqForPlaceablePositions();
  validPositions.placablePositions.forEach(({ row, col }) => {
    const cell = getCell(row, col);
    cell.classList.add("placeable-tile");
  });
};

const rotateRight = async (event) => {
  const rotatedTile = await fetchRotatedTile();

  if (rotatedTile) {
    const tileImage = event.target.parentNode.querySelector("img");
    tileImage.style.transform = `rotateZ(${rotatedTile.orientation}deg)`;

    await heightLightPlaceableCells();
  }
};

const setupGrid = (gridSize) => {
  const grid = document.getElementById("grid");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 150px)`;
  grid.style.gridTemplateRows = `repeat(${gridSize}, 150px)`;

  return grid;
};

const drawATile = async () => {
  const response = await fetch("/game/draw-tile");

  return await response.json();
};

const drawTileIfNotDrawn = async (currentTile) => {
  if (!currentTile) {
    await drawATile();
    await heightLightPlaceableCells();
  }
};

const updateGameState = async (gameState) => {
  const { board: tiles, currentPlayer, self, currentTile } = gameState;

  const grid = setupGrid(84);
  const board = new Board(grid);
  board.build(tiles, createCellEvents(board));

  if (self.username === currentPlayer.username) {
    await drawTileIfNotDrawn(currentTile);
    board.addGhostEffect({ click: rotateRight });
    await heightLightPlaceableCells();
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

  const meepleImg = querySelector("#meeple");
  const meepleCount = querySelector("#meeple-count");
  const score = querySelector("#score");
  meepleCount.textContent = noOfMeeples;
  score.textContent = points;
  meepleImg.src = `assets/images/${meepleColor}-meeple.png`;
};

const fetchGameState = async () => {
  const response = await fetch("/game/state");

  return await response.json();
};

const atTopEdge = () => globalThis.scrollY <= 0;

const atBottomEdge = () => {
  return (
    globalThis.scrollY + globalThis.innerHeight >= document.body.scrollHeight
  );
};

const atLeftEdge = () => globalThis.scrollX <= 0;

const atRightEdge = () => {
  return (
    globalThis.scrollX + globalThis.innerWidth >= document.body.scrollWidth
  );
};

const createAlertDiv = (content) => {
  const alertDiv = document.createElement("div");
  alertDiv.classList.add("custom-alert");
  alertDiv.textContent = content;
  document.body.append(alertDiv);
  setTimeout(() => {
    alertDiv.remove();
  }, 1000);
};

const mouseDown = () => {
  const upArrow = document.querySelector("#a-bottom");
  upArrow.addEventListener("click", () => {
    if (!atBottomEdge()) {
      globalThis.scrollBy({
        top: 450,
        behavior: "smooth",
      });
    } else {
      createAlertDiv("You are already in the bottom edge");
    }
  });
};

const mouseUp = () => {
  console.log("hello");
  const upArrow = document.querySelector("#a-top");
  upArrow.addEventListener("click", () => {
    if (!atTopEdge()) {
      globalThis.scrollBy({
        top: -450,
        behavior: "smooth",
      });
    } else {
      createAlertDiv("You are already in the top edge");
    }
  });
};

const mouseLeft = () => {
  const upArrow = document.querySelector("#a-left");
  upArrow.addEventListener("click", () => {
    if (!atLeftEdge()) {
      globalThis.scrollBy({
        left: -450,
        behavior: "smooth",
      });
    } else {
      createAlertDiv("You are already in the left edge");
    }
  });
};

const mouseRight = () => {
  const upArrow = document.querySelector("#a-right");
  upArrow.addEventListener("click", () => {
    if (!atRightEdge()) {
      globalThis.scrollBy({
        left: 450,
        behavior: "smooth",
      });
    } else {
      createAlertDiv("You are already in the right edge");
    }
  });
};

const main = async () => {
  const gameState = await fetchGameState();
  showPlayerStatus();

  updateGameState(gameState);
  mouseUp();
  mouseDown();
  mouseLeft();
  mouseRight();
  changeFocusToStartingTile();
  showCurrentPlayer(5000);
};

globalThis.addEventListener("DOMContentLoaded", main);
