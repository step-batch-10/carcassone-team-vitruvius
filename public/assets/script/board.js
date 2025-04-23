class Board {
  #parentNode;
  #cellNodes;
  #ghostEffectEvents;
  #currentTile;

  constructor(parentNode) {
    this.#parentNode = parentNode;
    this.#cellNodes = [];
    this.#ghostEffectEvents = {};
    this.#currentTile = null;
  }

  static extractEdgesOfOriginalTile(edges, orientation) {
    const rotated = [...edges];
    const totalRotations = (orientation / 90) % 4;

    Array.from({ length: totalRotations }, () => {
      rotated.push(rotated.shift());
    });

    return rotated.map((edge) => edge.at(0)).join("");
  }

  static extractTileImagePath(tile) {
    const { tileEdges, orientation, tileCenter, hasShield } = tile;

    const edges = Board.extractEdgesOfOriginalTile(tileEdges, orientation);
    const center = tileCenter.at(0);
    const guard = hasShield ? "-g" : "";

    return `/assets/images/tiles/${edges}-${center}${guard}.png`;
  }

  #createCell(cell, events, chord) {
    const id = chord.join("/");

    const cellElement = document.createElement("div");
    cellElement.id = id;
    cellElement.className = "cell";

    if (cell.tile) {
      const imgPath = Board.extractTileImagePath(cell.tile);
      cellElement.style.backgroundImage = `url("${imgPath}")`;
    } else {
      this.#addEvents(cellElement, events);
    }

    return cellElement;
  }

  #insertTileInCell(cell, tile) {
    if (tile) {
      const imgPath = Board.extractTileImagePath(tile);
      const imgElement = document.createElement("img");

      imgElement.setAttribute("src", imgPath);
      imgElement.style.transform = `rotateZ(${tile.orientation}deg)`;
      imgElement.style.opacity = "0.6";

      cell.appendChild(imgElement);
    }
  }

  #addRotateRightButton(parentNode, events = {}) {
    const rotateButton = document.createElement("button");

    rotateButton.textContent = "->";
    rotateButton.classList.add("rotate-right");
    this.#addEvents(rotateButton, events);

    parentNode.appendChild(rotateButton);
  }

  #removeChildren(parentNode) {
    const imgElement = parentNode.querySelector("img");
    const button = parentNode.querySelector("button");

    if (imgElement) {
      button.remove();
      imgElement.remove();
    }

    parentNode.style.opacity = "1";
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

  async #fetchCurrentTile() {
    const response = await fetch("/game/current-tile");

    return await response.json();
  }

  addGhostEffect(events = {}) {
    this.#ghostEffectEvents = {
      mouseenter: async (event) => {
        event.stopPropagation();
        const cell = event.target;
        this.#currentTile = await this.#fetchCurrentTile();

        if (this.#currentTile) {
          this.#insertTileInCell(cell, this.#currentTile);
          this.#addRotateRightButton(cell, events);
        }
      },
      mouseleave: async (event) => {
        event.stopPropagation();

        this.#currentTile = await this.#fetchCurrentTile();
        this.#removeChildren(event.target);
      },
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

  build(tiles, events = {}) {
    this.#cellNodes = tiles.flatMap((row, rowIndex) =>
      row.map((cell, cellIndex) =>
        this.#createCell(cell, events, [rowIndex, cellIndex])
      )
    );

    this.#parentNode.replaceChildren(...this.#cellNodes);
  }
}

export default Board;
