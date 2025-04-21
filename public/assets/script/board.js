class Board {
  #parentNode;
  #cellNodes;
  #ghostEffectEvents;

  constructor(parentNode) {
    this.#parentNode = parentNode;
    this.#cellNodes = [];
    this.#ghostEffectEvents = {};
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

  #addImage(parentNode, imgPath) {
    const imgElement = document.createElement("img");

    imgElement.setAttribute("src", imgPath);
    parentNode.appendChild(imgElement);

    parentNode.style.opacity = "0.6";
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
      mouseenter: (event) => {
        event.stopPropagation();

        this.#addImage(event.target, imgPath);
        this.#addRotateRightButton(event.target);
      },
      mouseleave: (event) => {
        event.stopPropagation();

        this.#removeChildren(event.target, imgPath);
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
