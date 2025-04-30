import Board from "./board.js";
import API from "./api.js";
import Cell from "./cell.js";

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
  #gameStatePoller;
  #turnPoller;
  #isAttemptToPlaceMeeple;

  constructor(gameState, board, APIs) {
    this.#gameState = gameState;
    this.#self = gameState.self;
    this.#cells = gameState.board;
    this.#currentTile = gameState.currentTile;
    this.#board = board;
    this.#currentPlayer = gameState.currentPlayer;
    this.#APIs = APIs;
    this.#currentAPIIndex = 0;
    this.#isAttemptToPlaceMeeple = gameState.isAttemptToPlaceMeeple;
  }

  registerPollers(gameStatePoller, turnPoller) {
    this.#gameStatePoller = gameStatePoller;
    this.#turnPoller = turnPoller;
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

  async addOptionToPlaceMeeple() {
    const { row, col } = await API.lastPlacedTilePosition();
    const cellElement = Cell.getCell(row, col);

    Cell.addMeepleOptions(cellElement, this.#board.getMapOrientation());
  }

  async renderGameState() {
    const currentPlayer = this.#currentPlayer;

    this.#board.registerCells(this.#cells);
    this.#board.build();
    this.showPlayerStatus();
    await this.showRemainingTiles();

    if (this.#self.username === currentPlayer.username) {
      if (this.#isAttemptToPlaceMeeple) return this.addOptionToPlaceMeeple();

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
      this.#isAttemptToPlaceMeeple = newGameState.isAttemptToPlaceMeeple;

      await this.renderGameState();
    }
  }

  get self() {
    return this.#self;
  }

  createBtn() {
    const template = document.querySelector("#score-board");
    const playerScoreBoard = template.content.cloneNode(true);
    const btnContainer = playerScoreBoard.querySelector(".btn-container");

    return btnContainer;
  }

  createRow(selectors) {
    return (player) => {
      const template = document.querySelector("#score-board");
      const playerScoreBoard = template.content.cloneNode(true);
      const [playerStat, username, meepleImg, points] = selectNodes(
        selectors,
        playerScoreBoard,
      );

      username.textContent = player.username;
      meepleImg.setAttribute(
        "src",
        `/assets/images/${player.meepleColor}-meeple.png`,
      );
      points.textContent = player.points;

      return playerStat;
    };
  }

  createScoreBoard(allPlayers) {
    const selectors = [".player-stat", "#username", "#meeple", "#points"];

    return allPlayers.map(this.createRow(selectors));
  }

  async showScoreBoard() {
    const allPlayers = await API.allPlayers();
    const displayDiv = document.querySelector(".score-board-container");
    displayDiv.classList.remove("hidden");
    displayDiv.classList.add("visible");
    const sortedPlayers = _.orderBy(allPlayers, "points", "desc");
    const winner = document.createElement("div");
    winner.classList.add("winner");
    winner.textContent = `${allPlayers[0].username} is the winner`;
    const scoreBoard = this.createScoreBoard(sortedPlayers);
    const buttons = this.createBtn();
    displayDiv.append(winner, ...scoreBoard, buttons);
    document.body.appendChild(displayDiv);
  }

  async showRemainingTiles() {
    const remainingTiles = document.querySelector(".remaining-tiles");
    const textLabel = remainingTiles.querySelector("p");

    const numberOfTilesLeft = await API.remainingTiles();
    const currentTile = await API.currentTile();

    if (numberOfTilesLeft <= 0 && !currentTile) {
      this.#gameStatePoller.stopPolling();
      this.#turnPoller.stopPolling();

      await this.showScoreBoard();
      remainingTiles.classList.add("hidden");
      return;
    }
    textLabel.textContent = `Remaining Tiles: ${numberOfTilesLeft}`;
    remainingTiles.classList.remove("hidden");
    remainingTiles.classList.add("visible");
  }

  getBoard() {
    return this.#cells;
  }
}

export default GameState;
