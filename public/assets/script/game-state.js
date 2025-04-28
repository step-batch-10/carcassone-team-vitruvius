import Board from "./board.js";
import API from "./api.js";

const areObjectsEqual = (first, second) =>
  JSON.stringify(first) === JSON.stringify(second);

const drawTileIfNotDrawn = async (currentTile) => {
  if (!currentTile) {
    await API.drawATile();
  }
};

class GameState {
  #self;
  #gameState;
  #currentTile;
  #board;

  constructor(gameState, board) {
    this.#self = gameState.self;
    this.#gameState = gameState;
    this.#currentTile = gameState.currentTile;
    this.#board = board;
  }

  async renderGameState() {
    const tiles = this.#gameState.board;
    const currentPlayer = this.#gameState.currentPlayer;

    this.#board.build(tiles);
    if (this.#self.username === currentPlayer.username) {
      await drawTileIfNotDrawn(this.#currentTile);
      this.#board.addGhostEffect();
      Board.highlightPlaceableCells();
    }
  }

  updateGameState(newGameState) {
    if (!areObjectsEqual(this.#gameState, newGameState)) {
      this.#gameState = newGameState;

      this.renderGameState();
    }
  }

  get self() {
    return this.#self;
  }
}

export default GameState;
