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

const tileMovements = (e, currentTilePath, currentTileOrientation) => {
  if (!floatingImg) {
    floatingImg = document.createElement("img");
    floatingImg.src = currentTilePath;
    floatingImg.classList.add("tileMoves");
    document.body.appendChild(floatingImg);
  }

  floatingImg.style.left = e.pageX - 75 + "px";
  floatingImg.style.top = e.pageY - 75 + "px";
  floatingImg.style.opacity = "0.75";
  floatingImg.style.transform = `rotate(${currentTileOrientation}deg)`;
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

const rotateTile = (edges, orientation) => {
  const rotated = [...edges];
  const rotations = (orientation / 90) % 4;

  for (let rotation = 0; rotation < rotations; rotation++) {
    rotated.push(rotated.shift());
  }

  return rotated.map((edge) => edge[0]);
};

const extractPath = (cell) => {
  if (!cell.tile) {
    return null;
  }

  const edges = rotateTile(cell.tile.tileEdges, cell.tile.orientation).join("");
  const center = cell.tile.tileCenter[0];
  const guard = cell.tile.hasShield ? "-g" : "";

  return `/assets/images/tiles/${edges}-${center}${guard}.png`;
};

const setImage = (img, path, tiles, row, column, cell) => {
  if (path) {
    img.setAttribute("src", path);
    img.style.transform = `rotate(${tiles[row][column].orientation}deg)`;
    cell.appendChild(img);
  }
};

const renderTiles = (gridSize, tiles, grid, currentTilePath) => {
  const newTiles = [];
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
      newTiles.push(cell);
    }
  }

  grid.replaceChildren(...newTiles);
};

const addMouseListeners = (grid, currentTilePath, currentTileOrientation) => {
  grid.addEventListener("mousemove", (e) =>
    tileMovements(e, currentTilePath, currentTileOrientation)
  );
  grid.addEventListener("mouseleave", hideFloatingImage);
  grid.addEventListener("mouseenter", showFloatingImage);
};

const updateGameState = async (
  grid,
  gridSize,
  currentTile,
  currentTilePath
) => {
  const boardResponse = await fetch("/game/board");
  const tiles = await boardResponse.json();

  renderTiles(gridSize, tiles, grid, currentTilePath);

  addMouseListeners(grid, currentTilePath, currentTile.orientation);
};

const main = async () => {
  const grid = document.getElementById("grid");
  const gridSize = 84;

  grid.style.display = "grid";
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 150px)`;
  grid.style.gridTemplateRows = `repeat(${gridSize}, 150px)`;

  const tileResponse = await fetch("/game/draw-tile");
  const currentTile = await tileResponse.json();

  const currentTilePath = extractPath({ tile: currentTile });

  setTimeout(() => {
    globalThis.scrollTo({
      top: (document.body.scrollHeight - globalThis.innerHeight) / 2,
      left: (document.body.scrollWidth - globalThis.innerWidth) / 2,
      behavior: "smooth",
    });
  }, 2000);

  await updateGameState(grid, gridSize, currentTile, currentTilePath);
};

globalThis.onload = main;
