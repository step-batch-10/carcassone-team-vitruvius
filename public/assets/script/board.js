import API from "./api.js";
import Cell from "./cell.js";

class Board {
  #parentNode;
  #ghostEffectEvents;

  constructor(parentNode) {
    this.#parentNode = parentNode;
    this.#ghostEffectEvents = {};
  }

  static #getHighlightedCells() {
    return document.querySelectorAll(".placeable-tile");
  }

  static removePlaceableCellsHighlight() {
    const highlightedCells = this.#getHighlightedCells();

    highlightedCells.forEach((cell) => {
      cell.classList.remove("placeable-tile");
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

  static async handleGhostTile(event) {
    event.stopPropagation();

    const currentTile = await API.currentTile();
    const cellElement = event.target;

    if (currentTile) {
      Cell.insertGhostTile(currentTile, cellElement);
    }
  }

  static removeGhostTile(event) {
    event.stopPropagation();

    event.target.innerHTML = "";
  }

  addGhostEffect() {
    this.#ghostEffectEvents = {
      mouseenter: Board.handleGhostTile,
      mouseleave: Board.removeGhostTile,
    };

    const emptyCells = document.querySelectorAll(".empty-cell");

    emptyCells.forEach((cellElement) =>
      this.#addEvents(cellElement, this.#ghostEffectEvents)
    );
  }

  removeGhostEffect() {
    const emptyCells = document.querySelectorAll(".empty-cell");

    emptyCells.forEach((cellElement) => {
      this.#removeEvents(cellElement, this.#ghostEffectEvents);
    });
  }

  build(tiles, events = {}) {
    const cellNodes = tiles.flatMap((row, rowIndex) =>
      row.map((cell, cellIndex) =>
        Cell.createCell(cell, [rowIndex, cellIndex], events)
      )
    );

    this.#parentNode.replaceChildren(...cellNodes);
  }
}

export default Board;
