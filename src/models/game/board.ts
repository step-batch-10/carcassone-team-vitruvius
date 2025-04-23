import { createTileBox, firstTileBox, TileBoxManager } from "./tiles.ts";
import {
  Position,
  ResTiles,
  Sides,
  Tile,
  TileBox,
  TileEdges,
} from "../types/models.ts";
import { ScoreManager } from "./score-board.ts";

export class Board {
  private board: TileBox[][];
  private scoreManager: ScoreManager;
  private tileBoxes;

  constructor(tileBoxes: TileBox[][]) {
    this.board = tileBoxes;
    this.tileBoxes = new TileBoxManager(this.board);
    this.scoreManager = new ScoreManager(this.board, this.tileBoxes);
  }

  static create(rows: number, cols: number) {
    const emptyBoard = Array(rows).fill(Array(cols).fill(null));
    const tileBoxes: TileBox[][] = emptyBoard.map((rows: null[]) =>
      rows.map(createTileBox)
    );
    tileBoxes[Math.floor(rows / 2)][Math.floor(cols / 2)] = firstTileBox();

    return new Board(tileBoxes);
  }

  extractEdges(tile: Tile): TileEdges {
    const edges = {
      left: tile.tileEdges[0],
      top: tile.tileEdges[1],
      right: tile.tileEdges[2],
      bottom: tile.tileEdges[3],
    };

    return edges;
  }

  areAllResEmpty(resTiles: ResTiles): boolean {
    const { leftTile, topTile, rightTile, bottomTile } = resTiles;
    return !(leftTile || topTile || rightTile || bottomTile);
  }

  isTileFeatureMatching(placingTile: TileEdges, resTiles: ResTiles): boolean {
    const { leftTile, rightTile, topTile, bottomTile } = resTiles;

    if (leftTile && this.extractEdges(leftTile).right !== placingTile.left) {
      return false;
    }
    if (topTile && this.extractEdges(topTile).bottom !== placingTile.top) {
      return false;
    }
    if (rightTile && this.extractEdges(rightTile).left !== placingTile.right) {
      return false;
    }
    if (
      bottomTile &&
      this.extractEdges(bottomTile).top !== placingTile.bottom
    ) {
      return false;
    }

    return true;
  }

  isTilePlaceable(tile: Tile | null, position: Position): boolean {
    if (!tile) return false;
    const placingTileEdges = this.extractEdges(tile);
    const resTiles = this.tileBoxes.adjacentTile(position);

    if (this.areAllResEmpty(resTiles)) {
      console.log("all cells are empty");

      return false;
    }

    return this.isTileFeatureMatching(placingTileEdges, resTiles);
  }

  getBoard() {
    return this.board;
  }

  getTile(position: Position) {
    return this.tileBoxes.getTile(position);
  }

  placeTile(tile: Tile, position: Position): void {
    const cell = this.tileBoxes.getCell(position);
    if (!cell) return;
    if (this.isTilePlaceable(tile, position)) {
      cell.tile = tile;
      this.scoreManager.markOccupance(position);
    }
  }

  placeMeeple(position: Position, playerName: string, subGrid: Sides) {
    return this.scoreManager.placeMeeple(position, playerName, subGrid);
  }

  isBoxUnlockToPlace(position: Position) {
    const resTile = this.tileBoxes.adjacentTile(position);
    return !this.areAllResEmpty(resTile);
  }
}
