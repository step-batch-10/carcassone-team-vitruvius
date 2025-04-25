import { shuffler, TileStacker } from "./tiles.ts";
import { Board } from "./board.ts";
import Player from "../room/player.ts";
import { CardinalDegrees, Center, Position, Sides, Tile } from "../models.ts";
import { dummyTiles as tiles } from "../../../test/dummy-data.ts";
import _ from "lodash";

export class Carcassonne {
  private readonly board: Board;
  private readonly players: Player[];
  private turn: number;
  private tileManager: TileStacker;
  private currentTile: Tile | null;
  private unlockedPositions: Position[];
  private tilePlacedAt: Position | null;

  constructor(
    players: Player[],
    tileManager: TileStacker,
    board: Board,
    unlockedPosition: Position[],
  ) {
    this.players = players;
    this.turn = 0;
    this.board = board;
    this.currentTile = null;
    this.tileManager = tileManager;
    this.unlockedPositions = unlockedPosition;
    this.tilePlacedAt = null;
  }

  static getAllUnlockedPosition(board: Board): Position[] {
    const unlockedPosition = [];
    for (let row = 0; row < 84; row++) {
      for (let col = 0; col < 84; col++) {
        if (board.isBoxUnlockToPlace({ row, col })) {
          unlockedPosition.push({ row, col });
        }
      }
    }

    return unlockedPosition;
  }

  private placablePositions(): Position[] {
    if (!this.currentTile) {
      return [];
    }

    return this.unlockedPositions.filter(
      (position: Position) =>
        this.board.isTilePlaceable(this.currentTile, position) &&
        !this.board.getTile(position),
    );
  }

  validPositions() {
    return {
      unlockedPositions: this.unlockedPositions,
      placablePositions: this.placablePositions(),
    };
  }

  static initGame(
    players: Player[],
    tileShuffler = shuffler,
    tilesArr = tiles(),
  ) {
    const tileManager = new TileStacker(tilesArr, tileShuffler);
    const board = Board.create(84, 84);
    const unlockedPositions = Carcassonne.getAllUnlockedPosition(board);

    return new Carcassonne(players, tileManager, board, unlockedPositions);
  }

  rotateTile(tile: Tile): Tile {
    tile.orientation = (tile.orientation + CardinalDegrees.ninety) % 360;
    const tempEdge = tile.tileEdges.pop();

    if (tempEdge) {
      tile.tileEdges.unshift(tempEdge);
    }

    return tile;
  }

  private isTilePlacableAtUnlockedPos(tile: Tile) {
    return this.unlockedPositions.some((position) =>
      this.board.isTilePlaceable(tile, position)
    );
  }

  isValidTileToPlace({ ...tile }: Tile) {
    const rotated = tile;
    rotated.tileEdges = [...tile.tileEdges];
    for (let i = 0; i < 4; i++) {
      if (this.isTilePlacableAtUnlockedPos(rotated)) {
        return true;
      }

      this.rotateTile(rotated);
    }

    return false;
  }

  rotateCurrentTile() {
    if (this.currentTile) {
      return this.rotateTile(this.currentTile);
    }
  }

  drawATile(): Tile | null {
    const drawnTile = this.tileManager.pickTile();
    if (drawnTile && !this.isValidTileToPlace({ ...drawnTile })) {
      this.tileManager.pushTile(drawnTile);
      return this.drawATile();
    }

    this.currentTile = drawnTile;
    this.unlockedPositions = Carcassonne.getAllUnlockedPosition(this.board);

    return drawnTile;
  }

  getCurrentTile() {
    return this.currentTile;
  }

  getBoard() {
    return this.board.getBoard();
  }

  getCurrentPlayer() {
    return this.players[this.turn];
  }

  getAllPlayers() {
    return this.players;
  }

  getPlayerOf(username: string) {
    return _.find(this.getAllPlayers(), { username: username });
  }

  changePlayerTurn() {
    this.turn = (this.turn + 1) % this.players.length;
  }

  placeATile(position: Position) {
    if (
      this.currentTile &&
      this.board.isTilePlaceable(this.currentTile, position)
    ) {
      this.tilePlacedAt = position;
      this.board.placeTile(this.currentTile, position);
      this.updateScore();
      this.currentTile = null;
      return;
    }

    return { desc: "invalid tile to place" };
  }

  private updateMeeple(
    subGrid: Sides | Center,
    player: Player,
    position: Position,
  ) {
    const cell = this.getBoard()[position.row][position.col];
    cell.meeple.region = subGrid;
    cell.meeple.color = player.meepleColor;
    cell.meeple.playerName = player.username;
  }

  placeAMeeple(subGrid: Sides | Center) {
    const player = this.getCurrentPlayer();
    if (!this.tilePlacedAt) return { isPlaced: false };
    const status = this.board.placeMeeple(
      this.tilePlacedAt,
      player.username,
      subGrid,
    );
    if (status.isPlaced) {
      this.updateMeeple(subGrid, player, this.tilePlacedAt);
      this.updateScore();
      player.noOfMeeples -= 1;
      this.changePlayerTurn();
    }

    return status;
  }

  updateScore() {
    if (this.tilePlacedAt) this.board.score(this.tilePlacedAt, this.players);
  }

  state() {
    return {
      board: this.getBoard(),
      currentPlayer: this.getCurrentPlayer(),
      currentTile: this.currentTile,
      players: this.getAllPlayers(),
    };
  }
}
