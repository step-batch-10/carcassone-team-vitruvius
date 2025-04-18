const tilePlacementListener = (cell, currentTilePath) => {
  const listener = (_) => {
    const img = document.createElement("img");
    img.src = currentTilePath;

    cell.appendChild(img);

    cell.removeEventListener("click", listener);
  };

  return listener;
};

let floatingImg;

const tileMovements = (e, currentTilePath) => {
  if (!floatingImg) {
    floatingImg = document.createElement("img");
    floatingImg.src = currentTilePath;
    floatingImg.classList.add("tileMoves");
    document.body.appendChild(floatingImg);
  }

  floatingImg.style.left = e.pageX - 75 + "px";
  floatingImg.style.top = e.pageY - 75 + "px";
  floatingImg.style.opacity = "0.75";
};

const hideFloatingImage = (_) => {
  floatingImg.classList.remove("visible");
  floatingImg.classList.add("hidden");
};

const showFloatingImage = (_) => {
  if (floatingImg) {
    floatingImg.classList.remove("hidden");
    floatingImg.classList.add("visible");
  }
};

const extractPath = (cell) => {
  if (!cell.tile) {
    return null;
  }

  const edges = cell.tile.tileEdges.map((edge) => edge[0]).join("");
  const center = cell.tile.tileCenter[0];
  const guard = cell.tile.hasShield ? "-g" : "";

  return `/assets/images/tiles/${edges}-${center}-${guard}.png`;
};

const setImage = (img, path, tiles, row, column, cell) => {
  if (path) {
    img.setAttribute("src", path);
    img.style.transform = `rotate(${tiles[row][column].orientation}deg)`;
    cell.appendChild(img);
  }
};

const renderTiles = (gridSize, tiles, grid, currentTilePath) => {
  for (let row = 0; row < gridSize; row++) {
    for (let column = 0; column < gridSize; column++) {
      const cell = document.createElement("div");
      const img = document.createElement("img");
      const path = extractPath(tiles[row][column]);

      setImage(img, path, tiles, row, column, cell);

      cell.addEventListener(
        "click",
        tilePlacementListener(cell, currentTilePath)
      );
      grid.appendChild(cell);
    }
  }
};

const addMouseListeners = (grid, currentTilePath) => {
  grid.addEventListener("mousemove", (e) => tileMovements(e, currentTilePath));
  grid.addEventListener("mouseleave", hideFloatingImage);
  grid.addEventListener("mouseenter", showFloatingImage);
};

const main = async () => {
  const grid = document.getElementById("grid");
  const gridSize = 3;

  grid.style.display = "grid";
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 150px)`;
  grid.style.gridTemplateRows = `repeat(${gridSize}, 150px)`;

  const boardResponse = await fetch("/game/board");
  const tiles = await boardResponse.json();

  const tileResponse = await fetch("/game/current-tile");
  const currentTile = await tileResponse.json();
  const currentTilePath = extractPath({ tile: currentTile });

  renderTiles(gridSize, tiles, grid, currentTilePath);
  addMouseListeners(grid, currentTilePath);
};

globalThis.onload = main;
