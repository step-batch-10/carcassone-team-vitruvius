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

// const reqForPlaceablePositions = async () => {
//   return await fetch("/game/tile/placeable-positions");
// };

// const heightLightPlaceableCell = async () => {
//   const placeablePositions = await reqForPlaceablePositions();
// };

const rotateRight = async (event) => {
  const rotatedTile = await fetchRotatedTile();

  if (rotatedTile) {
    const tileImage = event.target.parentNode.querySelector("img");
    tileImage.style.transform = `rotateZ(${rotatedTile.orientation}deg)`;
    // await heightLightPlaceableCell();
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

  return response.json();
};

const drawTileIfNotDrawn = async (currentTile) => {
  if (!currentTile) {
    await drawATile();
  }
};

const updateGameState = async (gameState) => {
  const { board: tiles, currentPlayer, self, currentTile } = gameState;

  const grid = setupGrid(84);
  const board = new Board(grid);
  board.build(tiles, createCellEvents(board));
  if (self.username === currentPlayer.username) {
    drawTileIfNotDrawn(currentTile);
    await board.addGhostEffect({ click: rotateRight });
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

const mouseDown = () => {
  const upArrow = document.querySelector("#a-bottom");
  upArrow.addEventListener("click", () => {
    if (!atBottomEdge()) {
      globalThis.scrollBy({
        top: 450,
        behavior: "smooth",
      });
    } else {
      alert("You are already in bottom edge!");
    }
  });
};

const mouseUp = () => {
  const upArrow = document.querySelector("#a-top");
  upArrow.addEventListener("click", () => {
    if (!atTopEdge()) {
      globalThis.scrollBy({
        top: -450,
        behavior: "smooth",
      });
    } else {
      alert("You are already in top edge!");
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
      alert("You are already in Left edge!");
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
      alert("You are already in Right edge!");
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
