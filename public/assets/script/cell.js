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

const Cell = {
  ghostsCells: [],

  rotateRight: async () => {
    const rotatedTile = await API.rotateTile();

    if (rotatedTile) {
      const ghostImage = document.querySelector(".ghost-img");

      ghostImage.style.transform = `rotateZ(${rotatedTile.orientation}deg)`;

      await Board.highlightPlaceableCells();
    }
  },

  rotateLeft: async () => {
    await API.rotateTile();
    await API.rotateTile();
    const rotatedTile = await API.rotateTile();

    if (rotatedTile) {
      const ghostImage = document.querySelector(".ghost-img");

      ghostImage.style.transform = `rotateZ(${rotatedTile.orientation}deg)`;

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

  rotateShortcutHandler: (event) => {
    if (event.key === "j") {
      event.preventDefault();
      return Cell.rotateLeft();
    }

    if (event.key === "k") {
      event.preventDefault();
      return Cell.rotateRight();
    }
  },

  addRotateShortcuts: () => {
    document.addEventListener("keydown", Cell.rotateShortcutHandler);
  },

  removeRotateShortcuts: () => {
    document.removeEventListener("keydown", Cell.rotateShortcutHandler);
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
      Cell.addRotateButton(cellElement, "right", Cell.rotateRight);
      Cell.addRotateButton(cellElement, "left", Cell.rotateLeft);
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

  addRotateButton: (cellElement, direction, handleRotate) => {
    const rotateButton = document.createElement("button");

    rotateButton.style.backgroundImage =
      `url('assets/images/symbols/rotate-${direction}.png')`;
    rotateButton.classList.add(`rotate-${direction}`);
    rotateButton.addEventListener("click", handleRotate);

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

  showPlacedMeeple: async (event) => {
    const { meepleColor } = await API.self();

    const meeple = document.createElement("img");

    meeple.classList.add("used-meeple");
    meeple.setAttribute("src", `/assets/images/${meepleColor}-meeple.png`);

    event.target.appendChild(meeple);
  },

  removeMeepleListeners: (event, listener) => {
    const placed = event.target;
    const placedSubgrid = event.target.parentNode.cloneNode(true);
    const cell = placed.parentNode.parentNode;
    const subgrids = document.querySelectorAll(".subgrid");

    subgrids.forEach((subgrid) => subgrid.remove());
    const skipBtn = document.querySelectorAll(".skip")[0];
    skipBtn.remove();

    cell.appendChild(placedSubgrid);
    placed.removeEventListener("click", listener);
  },

  handlePlaceMeeple: (side) => {
    const placeMeeple = async (event) => {
      const res = await API.claim(side);

      if (res.status === 201) {
        await Cell.showPlacedMeeple(event);
        Cell.removeMeepleListeners(event, placeMeeple);
      }
    };

    return placeMeeple;
  },

  handleSkip: (cell) => {
    return async (_) => {
      await fetch("/game/skip-claim", { method: "PATCH" });
      const img = cell.querySelector("img");
      cell.replaceChildren(img);
    };
  },

  createSubGridForMeeplePlacement: async (mapOrientation) => {
    const sides = await API.claimables();

    return sides.map((side) => {
      const element = document.createElement("div");

      const ghostMeeple = document.createElement("img");
      ghostMeeple.setAttribute("src", `/assets/images/ghost-meeple.png`);
      ghostMeeple.classList.add("ghost");
      element.appendChild(ghostMeeple);

      const sideClass = rotateMeepleSide(side, mapOrientation);

      element.classList.add("sub-grid");
      element.classList.add(sideClass);
      element.addEventListener("click", Cell.handlePlaceMeeple(side));

      return element;
    });
  },

  addMeepleOptions: async (cell, mapOrientation) => {
    const subGrid = await Cell.createSubGridForMeeplePlacement(mapOrientation);
    const skipButton = document.createElement("button");

    skipButton.classList.add("skip");
    skipButton.addEventListener("click", Cell.handleSkip(cell));

    cell.append(...subGrid, skipButton);
  },
};

export default Cell;
