import API from "./api.js";
import Cell from "./cell.js";

class Board {
  #parentNode;
  #ghostEffectEvents;
  #cellEvents;
  #cells;
  #mapOrientation;

  constructor(parentNode) {
    this.#parentNode = parentNode;
    this.#ghostEffectEvents = {};
    this.#cellEvents = {};
    this.#cells = null;
    this.#mapOrientation = 0;
  }

  static #getHighlightedCells() {
    return document.querySelectorAll(".placeable-tile");
  }

  static removePlaceableCellsHighlight() {
    const highlightedCells = this.#getHighlightedCells();

    highlightedCells.forEach((cell) => {
      cell.classList.remove("placeable-tile");
      cell.classList.add("empty-cell");
    });
  }

  static async highlightPlaceableCells() {
    this.removePlaceableCellsHighlight();

    const validPositions = await API.placeablePositions();

    validPositions.placablePositions.forEach(({ row, col }) => {
      const cell = Cell.getCell(row, col);

      cell.classList.add("placeable-tile");
    });
  }

  #addEvents(node, events) {
    Object.entries(events).forEach(([eventName, handler]) =>
      node.addEventListener(eventName, handler)
    );
  }

  #removeEvents(node, events) {
    Object.entries(events).forEach(([eventName, handler]) =>
      node.removeEventListener(eventName, handler)
    );
  }

  static async handleGhostTile(event, mapOrientation) {
    event.stopPropagation();

    const currentTile = await API.currentTile();
    const cellElement = event.target;

    if (currentTile) {
      Cell.insertGhostTile(currentTile, cellElement, mapOrientation);
    }
  }

  static removeGhostTile(event) {
    event.stopPropagation();
    Cell.removeGhostFromCells();
  }

  registerCellEvents(cellEvents) {
    this.#cellEvents = { ...this.#cellEvents, ...cellEvents };
  }

  addGhostEffect() {
    Cell.addRotateShortcuts();

    this.#ghostEffectEvents = {
      mouseenter: (event) => Board.handleGhostTile(event, this.#mapOrientation),
      mouseleave: Board.removeGhostTile,
    };

    const emptyCells = document.querySelectorAll(".empty-cell");

    emptyCells.forEach((cellElement) =>
      this.#addEvents(cellElement, this.#ghostEffectEvents)
    );
  }

  removeGhostEffect() {
    Cell.removeRotateShortcuts();
    const emptyCells = document.querySelectorAll(".empty-cell");

    emptyCells.forEach((cellElement) => {
      this.#removeEvents(cellElement, this.#ghostEffectEvents);
    });
  }

  rotateMap() {
    this.#mapOrientation = (this.#mapOrientation + 90) % 360;
  }

  rotated(grid) {
    const rotations = (this.#mapOrientation / 90) % 4;

    let rotatedGrid = grid;

    for (let i = 0; i < rotations; i++) {
      rotatedGrid = rotatedGrid[0].map((_, colIndex) =>
        rotatedGrid.map((row) => row[colIndex]).reverse()
      );
    }

    return rotatedGrid;
  }

  registerCells(cells) {
    this.#cells = cells;
  }

  build() {
    const cellNodes = this.#cells.map((row, rowIndex) =>
      row.map((cell, cellIndex) =>
        Cell.createCell(
          cell,
          [rowIndex, cellIndex],
          this.#cellEvents,
          this.#mapOrientation,
        )
      )
    );

    const rotatedNodes = this.rotated(cellNodes);

    this.#parentNode.replaceChildren(...rotatedNodes.flat());
  }

  static scrollToCellElementOf(cellPosition) {
    const { row, col } = cellPosition;
    const cellId = Cell.makeCellId(row, col);
    const cell = document.getElementById(cellId);

    cell.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });

    cell.classList.add("blink-border");

    setTimeout(() => cell.classList.remove("blink-border"), 2000);
  }

  getMapOrientation() {
    return this.#mapOrientation;
  }
}

export default Board;
