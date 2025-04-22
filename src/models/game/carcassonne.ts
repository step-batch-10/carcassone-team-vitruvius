import { shuffler, TileStacker } from "./tile-Manager.ts";
import { Board } from "./board.ts";
import Player from "../room/player.ts";
import { CardinalDegrees, Position, Sides, Tile } from "../types/models.ts";
import { dummyTiles as tiles } from "./dummy-data-for-test.ts";

export class Carcassonne {
  private readonly board: Board;
  private readonly players: Player[];
  private turn: number;
  private tileManager: TileStacker;
  private currentTile: Tile | null;
  private unlockedPositions: Position[];
  private tilePlacedAt: Position;

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
    this.tilePlacedAt = { row: 42, col: 42 };
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

    return this.unlockedPositions.filter((position: Position) =>
      this.board.isTilePlaceable(this.currentTile, position)
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
    tilesArr = tiles,
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

  isValidTileToPlace(tile: Tile) {
    const rotated = { ...tile };
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

    if (drawnTile && !this.isValidTileToPlace(drawnTile)) {
      this.tileManager.pushTile(drawnTile);
      return this.drawATile();
    }

    this.currentTile = drawnTile;
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

  changePlayerTurn() {
    this.turn = (this.turn + 1) % this.players.length;
  }

  placeATile(position: Position) {
    if (
      this.currentTile &&
      this.board.isTilePlaceable(this.currentTile, position)
    ) {
      this.tilePlacedAt = position;
      return this.board.placeTile(this.currentTile, position);
    }

    return { desc: "invalid tile to place" };
  }

  placeAMeeple(subGrid: Sides) {
    const player = this.getCurrentPlayer().username;
    const status = this.board.placeMeeple(this.tilePlacedAt, player, subGrid);
    if (status.isPlaced) {
      this.changePlayerTurn();
    }

    return status;
  }
}
