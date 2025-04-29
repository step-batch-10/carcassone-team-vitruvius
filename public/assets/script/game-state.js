import Board from "./board.js";
import API from "./api.js";

const selectNodes = (selectors, parentNode) =>
  selectors.map((selector) => parentNode.querySelector(selector));

class GameState {
  #self;
  #currentTile;
  #board;
  #cells;
  #currentPlayer;
  #gameState;
  #APIs;
  #currentAPIIndex;

  constructor(gameState, board, APIs) {
    this.#gameState = gameState;
    this.#self = gameState.self;
    this.#cells = gameState.board;
    this.#currentTile = gameState.currentTile;
    this.#board = board;
    this.#currentPlayer = gameState.currentPlayer;
    this.#APIs = APIs;
    this.#currentAPIIndex = 0;
  }

  async drawTileIfNotDrawn() {
    if (!this.#currentTile) {
      this.#currentTile = await API.drawATile();
    }
  }

  toggleShowPlayersTable() {
    this.#currentAPIIndex = 1 - this.#currentAPIIndex;
  }

  currentAPI() {
    return this.#APIs[this.#currentAPIIndex];
  }

  createPlayerElement(player) {
    const { username, meepleColor, noOfMeeples, points } = player;

    const template = document.querySelector("#player-template");
    const playerStatusClone = template.content.cloneNode(true);
    const selectors = [
      ".player-name",
      ".meeple-color",
      ".meeple-count",
      ".score",
    ];
    const [playerNameNode, meepleImage, meepleCount, score] = selectNodes(
      selectors,
      playerStatusClone,
    );

    playerNameNode.textContent = username;
    meepleImage.firstElementChild.setAttribute(
      "src",
      `/assets/images/${meepleColor}-meeple.png`,
    );
    meepleCount.textContent = noOfMeeples;
    score.textContent = points;

    return playerStatusClone;
  }

  async showPlayerStatus() {
    const playersTable = document.querySelector("#players-status");
    const statusBody = playersTable.querySelector("tbody");
    const players = await this.currentAPI()();
    const selfNode = this.createPlayerElement(this.#self);
    const otherPlayers = players.filter(
      ({ username }) => this.#self.username !== username,
    );
    const otherPlayerNodes = otherPlayers.map(this.createPlayerElement);

    statusBody.replaceChildren(...otherPlayerNodes, selfNode);
  }

  async renderGameState() {
    const currentPlayer = this.#currentPlayer;

    this.#board.registerCells(this.#cells);
    this.#board.build();
    this.showPlayerStatus();
    await this.showRemainingTiles();

    if (this.#self.username === currentPlayer.username) {
      await this.drawTileIfNotDrawn(this.#currentTile);

      this.#board.addGhostEffect();
      Board.highlightPlaceableCells();
    }
  }

  async updateGameState(newGameState) {
    if (!_.isEqual(this.#gameState, newGameState)) {
      this.#gameState = newGameState;
      this.#self = newGameState.self;
      this.#cells = newGameState.board;
      this.#currentTile = newGameState.currentTile;
      this.#currentPlayer = newGameState.currentPlayer;

      await this.renderGameState();
    }
  }

  get self() {
    return this.#self;
  }

  async showRemainingTiles() {
    const remainingTiles = document.querySelector(".remaining-tiles");
    const textLabel = remainingTiles.querySelector("p");

    const numberOfTilesLeft = await API.remainingTiles();
    textLabel.textContent = `Remaining Tiles: ${numberOfTilesLeft}`;
    remainingTiles.classList.remove("hidden");
    remainingTiles.classList.add("visible");

    console.log(remainingTiles, textLabel);
  }
}

export default GameState;
