class Board {
  #parentNode;
  #cellNodes;
  #ghostEffectEvents;

  constructor(parentNode) {
    this.#parentNode = parentNode;
    this.#cellNodes = [];
    this.#ghostEffectEvents = {};
  }

  static rotateTile(edges, orientation) {
    const rotated = [...edges];
    const rotations = (orientation / 90) % 4;

    for (let rotation = 0; rotation < rotations; rotation++) {
      rotated.push(rotated.shift());
    }

    return rotated.map((edge) => edge[0]);
  }

  static extractTileImagePath(tile) {
    const { tileEdges, orientation, tileCenter, hasShield } = tile;

    const edges = Board.rotateTile(tileEdges, orientation).join("");
    const center = tileCenter[0];
    const guard = hasShield ? "-g" : "";

    return `/assets/images/tiles/${edges}-${center}${guard}.png`;
  }

  #createCell(cell, events) {
    const cellElement = document.createElement("div");
    cellElement.className = "cell";

    if (cell.tile) {
      const imgPath = Board.extractTileImagePath(cell.tile);
      cellElement.style.backgroundImage = `url("${imgPath}")`;
    } else {
      this.#addEvents(cellElement, events);
    }

    return cellElement;
  }

  #addBackgroundImage(event, imgPath) {
    const element = event.target;

    element.style.backgroundImage = `url("${imgPath}")`;
    element.style.opacity = "0.6";
  }

  #removeBackgroundImage(event) {
    event.target.style.backgroundImage = ``;
  }

  #createHandler(handler, context) {
    return (event) => handler(event, context);
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

  addGhostEffect(imgPath) {
    this.#ghostEffectEvents = {
      mouseover: this.#createHandler(this.#addBackgroundImage, imgPath),
      mouseout: this.#removeBackgroundImage,
    };

    this.#cellNodes.forEach((cell) => {
      if (!cell.style.backgroundImage) {
        this.#addEvents(cell, this.#ghostEffectEvents);
      }
    });
  }

  removeGhostEffect() {
    this.#cellNodes.forEach((cell) => {
      this.#removeEvents(cell, this.#ghostEffectEvents);
    });
  }

  build(tiles, events) {
    this.#cellNodes = tiles
      .flat()
      .map((cell) => this.#createCell(cell, events));
    this.#parentNode.replaceChildren(...this.#cellNodes);
  }
}

export default Board;
