import API from "./api.js";
import Board from "./board.js";

const rotateMeepleSide = (side, mapOrientation) => {
  const sideClasses = ["left", "top", "right", "bottom"];

  if (side === "middle") {
    return "middle";
  }

  return sideClasses[
    (sideClasses.indexOf(side) + ((mapOrientation / 90) % 4)) % 4
  ];
};

const createTileImg = (tile, mapOrientation) => {
  const imgPath = Cell.extractTileImagePath(tile);
  const img = document.createElement("img");

  img.setAttribute("src", imgPath);
  img.style.transform = `rotateZ(${tile.orientation + mapOrientation}deg)`;
  img.classList.add("tile");

  return img;
};

const capitalize = (text) =>
  text.at(0).toUpperCase().concat(text.slice(1).toLowerCase());

const Cell = {
  ghostsCells: [],

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

  rotateLeft: async (event) => {
    await API.rotateTile();
    await API.rotateTile();
    const rotatedTile = await API.rotateTile();

    if (rotatedTile) {
      const cellElement = event.target.parentNode;

      cellElement.querySelector(
        "img",
      ).style.transform = `rotateZ(${rotatedTile.orientation}deg)`;

      await Board.highlightPlaceableCells();
    }
  },

  createGhostImage: (path, imgOrientation, mapOrientation) => {
    const imgElement = document.createElement("img");
    const orientation = (imgOrientation + mapOrientation) % 360;

    imgElement.setAttribute("src", path);
    imgElement.style.transform = `rotateZ(${orientation}deg)`;
    imgElement.classList.add("ghost-img");

    return imgElement;
  },

  insertGhostTile: (tile, cellElement, mapOrientation) => {
    if (tile) {
      cellElement.innerHTML = "";

      const imgPath = Cell.extractTileImagePath(tile);
      const ghostImage = Cell.createGhostImage(
        imgPath,
        tile.orientation,
        mapOrientation,
      );

      cellElement.appendChild(ghostImage);
      Cell.addRotateButton(cellElement, "right");
      Cell.addRotateButton(cellElement, "left");
      Cell.ghostsCells.push(cellElement);
    }
  },

  removeGhostFromCells: () => {
    Cell.ghostsCells.forEach((cell) => {
      cell.innerHTML = "";
    });
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

  extractTileImagePath: (tile) => `/assets/images/tiles/${tile.id}.png`,

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

  addMeepleToCell: (meeple, cellElement, mapOrientation) => {
    const { color, region } = meeple;

    if (!color) return;

    const sides = ["left", "top", "right", "bottom", "middle"];

    const subGrids = sides.map((side) => {
      const sideClass = rotateMeepleSide(side, mapOrientation);
      return Cell.createSubGrid(sideClass);
    });

    const occupiedSubGrid = subGrids.at(sides.indexOf(region));
    Cell.placeMeepleOnSubGrid(occupiedSubGrid, color);

    cellElement.append(...subGrids);
  },

  parseCellId: (id) => {
    const parseIdRegex = /^row_(?<row>\d+)-col_(?<col>\d+)$/;
    const chord = id.match(parseIdRegex).groups;

    return { row: Number(chord.row), col: Number(chord.col) };
  },

  addRotateButton: (cellElement, direction) => {
    const rotateButton = document.createElement("button");
    rotateButton.style.backgroundImage =
      `url('assets/images/symbols/rotate-${direction}.png')`;
    rotateButton.classList.add(`rotate-${direction}`);
    rotateButton.addEventListener(
      "click",
      Cell[`rotate${capitalize(direction)}`],
    );

    cellElement.appendChild(rotateButton);
  },

  insertTile: (cell, cellElement, mapOrientation) => {
    const { tile, meeple } = cell;

    if (tile) {
      const tileImg = createTileImg(tile, mapOrientation);
      cellElement.appendChild(tileImg);
      Cell.addMeepleToCell(meeple, cellElement, mapOrientation);
    }
  },

  addEvents: (node, events = {}) => {
    Object.entries(events).forEach(([eventName, handler]) =>
      node.addEventListener(eventName, handler)
    );
  },

  addClassesToCell: (cell, cellElement) => {
    const className = cell.tile ? "placed-cell" : "empty-cell";

    cellElement.classList.add(className);
  },

  createCell: (cellInfo, [row, col], events = {}, mapOrientation) => {
    const cellElement = document.createElement("div");

    cellElement.id = Cell.makeCellId(row, col);
    Cell.addEvents(cellElement, events);
    Cell.insertTile(cellInfo, cellElement, mapOrientation);
    Cell.addClassesToCell(cellInfo, cellElement);

    return cellElement;
  },
};

export default Cell;
