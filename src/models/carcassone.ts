import { TileManager, shuffler } from "./tile-Manager.ts";
import { Board } from "./board.ts";
import Player from "./player.ts";
import { Tile, Position, CardinalDegrees } from "./models.ts";
import { dummyTiles as tiles } from "./dummy-data-for-test.ts";
/*
- make a function to get all placeable positions and unclocked positions
- make a route to return all placeable positions and unclocked positions obj
- and handler for it
*/

export class Carcassonne {
  private readonly board: Board;
  private readonly players: Player[];
  private turn: number;
  private tileManager: TileManager;
  private currentTile: Tile | null;
  private unlockedPositions: Position[];

  constructor(
    players: Player[],
    tileManager: TileManager,
    board: Board,
    unlockedPosition: Position[]
  ) {
    this.players = players;
    this.turn = 0;
    this.board = board;
    this.currentTile = null;
    this.tileManager = tileManager;
    this.unlockedPositions = unlockedPosition;
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
      this.board.isTilePlacable(this.currentTile, position)
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
    tilesArr = tiles
  ) {
    const tileManager = new TileManager(tilesArr, tileShuffler);
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
      this.board.isTilePlacable(tile, position)
    );
  }

  isValidTileToPlace(tile: Tile) {
    for (let i = 0; i < 4; i++) {
      if (this.isTilePlacableAtUnlockedPos(tile)) {
        return true;
      }

      this.rotateTile(tile);
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
}
