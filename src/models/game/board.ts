import {
  Edge,
  Position,
  ResTiles,
  Tile,
  TileBox,
  TileEdges,
  Transpose,
} from "../models.ts";
import { ScoreManager } from "./score-board.ts";
import { createTileBox, firstTileBox, TileBoxManager } from "./tiles.ts";

export class Board {
  private board: TileBox[][];
  private scoreManager: ScoreManager;
  private tileBoxes;
  private edges: Edge[];

  constructor(tileBoxes: TileBox[][]) {
    this.board = tileBoxes;
    this.tileBoxes = new TileBoxManager(this.board);
    this.scoreManager = new ScoreManager(this.board, this.tileBoxes, []);
    this.edges = ["left", "top", "right", "bottom"];
  }

  private static putCenterTile(tileBoxes: TileBox[][], firstTileBox: TileBox) {
    const [row, col] = [
      Math.floor(tileBoxes.length / 2),
      Math.floor(tileBoxes[0].length / 2),
    ];
    return (tileBoxes[row][col] = firstTileBox);
  }

  static create(rows: number, cols: number, centerTile = firstTileBox) {
    const board: TileBox[][] = Array.from(
      { length: rows },
      () => Array.from({ length: cols }, () => createTileBox()),
    );
    Board.putCenterTile(board, centerTile());

    return new Board(board);
  }

  allNeighboursEmpty(tiles: ResTiles): boolean {
    const { leftTile, topTile, rightTile, bottomTile } = tiles;
    return !(leftTile || topTile || rightTile || bottomTile);
  }

  isEdgeMatching(
    edge: Tile | null | undefined,
    placingTile: TileEdges,
    direction: Edge,
  ) {
    const transpose: Transpose = {
      left: "right",
      right: "left",
      top: "bottom",
      bottom: "top",
    };

    const val: Edge = transpose[direction];
    return (
      edge && this.tileBoxes.extractEdges(edge)[val] !== placingTile[direction]
    );
  }

  private objectToArray(resTiles: ResTiles) {
    const { leftTile, rightTile, topTile, bottomTile } = resTiles;
    return [leftTile, topTile, rightTile, bottomTile];
  }

  isTileFeatureMatching(placingTile: TileEdges, resTiles: ResTiles): boolean {
    const resTilesArr = this.objectToArray(resTiles);

    return !this.edges.some((edge, index) =>
      this.isEdgeMatching(resTilesArr[index], placingTile, edge)
    );
  }

  isTilePlaceable(tile: Tile | null, position: Position): boolean {
    if (!tile) return false;
    if (this.tileBoxes.getCell(position)?.tile) return false;

    const placingTileEdges = this.tileBoxes.extractEdges(tile);
    const resTiles = this.tileBoxes.adjacentTile(position);

    return (
      !this.allNeighboursEmpty(resTiles) &&
      this.isTileFeatureMatching(placingTileEdges, resTiles)
    );
  }

  getBoard() {
    return this.board;
  }

  getTile(position: Position) {
    return this.tileBoxes.getTile(position);
  }

  placeTile(tile: Tile, position: Position) {
    const cell = this.tileBoxes.getCell(position);
    if (this.isTilePlaceable(tile, position)) {
      cell!.tile = tile;
      this.scoreManager.markOccupance(position, new Set<string>());
      return true;
    }

    return false;
  }

  isBoxUnlockToPlace(position: Position) {
    const resTile = this.tileBoxes.adjacentTile(position);
    return !this.allNeighboursEmpty(resTile) && !this.getTile(position);
  }
}
