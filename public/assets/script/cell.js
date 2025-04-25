import API from "./api.js";
import Board from "./board.js";

const createTileImg = (tile) => {
  const imgPath = Cell.extractTileImagePath(tile);
  const img = document.createElement("img");

  img.setAttribute("src", imgPath);
  img.style.transform = `rotateZ(${tile.orientation}deg)`;
  img.classList.add("tile");

  return img;
};

const Cell = {
  rotateRight: async (event) => {
    const rotatedTile = await API.rotateTile();

    if (rotatedTile) {
      const cellElement = event.target.parentNode;

      cellElement.querySelector(
        "img",
      ).style.transform = `rotateZ(${rotatedTile.orientation}deg)`;

      await Board.highlightPlaceableCells();
    }
  },

  createGhostImage: (path, orientation) => {
    const imgElement = document.createElement("img");

    imgElement.setAttribute("src", path);
    imgElement.style.transform = `rotateZ(${orientation}deg)`;
    imgElement.classList.add("ghost-img");

    return imgElement;
  },

  insertGhostTile: (tile, cellElement) => {
    if (tile) {
      cellElement.innerHTML = "";

      const imgPath = Cell.extractTileImagePath(tile);
      const ghostImage = Cell.createGhostImage(imgPath, tile.orientation);

      cellElement.appendChild(ghostImage);
      Cell.addRotateRightButton(cellElement);
    }
  },

  getCell: (row, col) => {
    return document.getElementById(Cell.makeCellId(row, col));
  },

  extractEdgesOfOriginalTile: (edges, orientation) => {
    const rotated = [...edges];
    const totalRotations = (orientation / 90) % 4;

    Array.from({ length: totalRotations }, () => {
      rotated.push(rotated.shift());
    });

    return rotated.map((edge) => edge.at(0)).join("");
  },

  extractTileImagePath: (tile) => {
    // const { tileEdges, orientation, tileCenter, hasShield } = tile;

    // const edges = Cell.extractEdgesOfOriginalTile(tileEdges, orientation);
    // const center = tileCenter.at(0);
    // const guard = hasShield ? "-g" : "";

    return `/assets/images/tiles/${tile.id}.png`;
  },

  makeCellId: (row, col) => {
    return `row_${row}-col_${col}`;
  },

  createSubGrid: (side) => {
    const subGrid = document.createElement("div");

    subGrid.classList.add("sub-grid");
    subGrid.classList.add(side);

    return subGrid;
  },

  placeMeepleOnSubGrid: (subGrid, color) => {
    const meeple = document.createElement("img");

    meeple.classList.add("used-meeple");
    meeple.setAttribute("src", `/assets/images/${color}-meeple.png`);

    subGrid.appendChild(meeple);
  },

  addMeepleToCell: (meeple, cellElement) => {
    console.log(meeple, cellElement);
    const { color, region } = meeple;

    if (!color) return;

    const sides = ["left", "top", "right", "bottom", "middle"];
    const subGrids = sides.map((side) => Cell.createSubGrid(side));

    const occupiedSubGrid = subGrids.at(sides.indexOf(region));
    Cell.placeMeepleOnSubGrid(occupiedSubGrid, color);

    cellElement.append(...subGrids);
  },

  parseCellId: (id) => {
    const parseIdRegex = /^row_(?<row>\d+)-col_(?<col>\d+)$/;
    const chord = id.match(parseIdRegex).groups;

    return { row: Number(chord.row), col: Number(chord.col) };
  },

  addRotateRightButton: (cellElement) => {
    const rotateButton = document.createElement("button");

    rotateButton.textContent = "->";
    rotateButton.classList.add("rotate-right");
    rotateButton.addEventListener("click", Cell.rotateRight);

    cellElement.appendChild(rotateButton);
  },

  insertTile: (cell, cellElement) => {
    const { tile, meeple } = cell;

    if (tile) {
      const tileImg = createTileImg(tile);
      cellElement.appendChild(tileImg);
      Cell.addMeepleToCell(meeple, cellElement);
    }
  },

  addEvents: (node, events) => {
    Object.entries(events).forEach(([eventName, handler]) =>
      node.addEventListener(eventName, handler)
    );
  },

  addClassesToCell: (cell, cellElement) => {
    const className = cell.tile ? "placed-cell" : "empty-cell";

    cellElement.classList.add(className);
  },

  createCell: (cellInfo, [row, col], events = {}) => {
    const cellElement = document.createElement("div");

    cellElement.id = Cell.makeCellId(row, col);
    Cell.addEvents(cellElement, events);
    Cell.insertTile(cellInfo, cellElement);
    Cell.addClassesToCell(cellInfo, cellElement);

    return cellElement;
  },
};

export default Cell;
