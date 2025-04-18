const tilePlacementListener = (cell) => {
  const listener = (_) => {
    const img = document.createElement("img");
    img.src = "/assets/images/tiles/rfrf-r.png";

    cell.appendChild(img);

    cell.removeEventListener("click", listener);
  };

  return listener;
};

let floatingImg;

const tileMovements = (_) => {
  if (!floatingImg) {
    floatingImg = document.createElement("img");
    floatingImg.src = "/assets/images/tiles/rfrf-r.png";
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
  if (!cell) {
    return null;
  }
  const edges = cell.tileEdges.map((edge) => edge[0]).join("");
  const center = cell.tileCenter[0];

  return `/assets/images/tiles/${edges}-${center}.png`;
};

const setImage = (img, path, tiles, row, column, cell) => {
  if (path) {
    img.setAttribute("src", path);
    img.style.transform = `rotate(${tiles[row][column].orientation}deg)`;
    cell.appendChild(img);
  }
};

const renderTiles = (gridSize, tiles, grid) => {
  for (let row = 0; row < gridSize; row++) {
    for (let column = 0; column < gridSize; column++) {
      const cell = document.createElement("div");
      const img = document.createElement("img");
      const path = extractPath(tiles[row][column]);

      setImage(img, path, tiles, row, column, cell);

      cell.addEventListener("click", tilePlacementListener(cell));
      grid.appendChild(cell);
    }
  }
};

const addMouseListeners = (grid) => {
  grid.addEventListener("mousemove", tileMovements);
  grid.addEventListener("mouseleave", hideFloatingImage);
  grid.addEventListener("mouseenter", showFloatingImage);
};

const main = async () => {
  const grid = document.getElementById("grid");
  const gridSize = 84;

  grid.style.display = "grid";
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 150px)`;
  grid.style.gridTemplateRows = `repeat(${gridSize}, 150px)`;

  const res = await fetch("/game/board");
  const tiles = await res.json();

  renderTiles(gridSize, tiles, grid);
  addMouseListeners(grid);
};

globalThis.onload = main;
