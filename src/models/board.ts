import {
  Tile,
  Feature,
  Position,
  TileEdges,
  ResTiles,
  TileBox,
} from "./models.ts";

export class Board {
  private board: TileBox[][];
  constructor(tileBoxes: TileBox[][]) {
    this.board = tileBoxes;
  }

  private static firstTile(): Tile {
    return {
      id: "1",
      orientation: 0,
      hasShield: false,
      tileEdges: [Feature.ROAD, Feature.CITY, Feature.ROAD, Feature.FIELD],
      tileCenter: Feature.ROAD,
    };
  }

  static create(rows: number, cols: number) {
    const emptyBoard = Array(rows).fill(Array(cols).fill(null));
    const tileBoxes: TileBox[][] = emptyBoard.map((rows: null[]) =>
      rows.map(Board.createTileBox)
    );

    tileBoxes[Math.floor(rows / 2)][Math.floor(cols / 2)].tile =
      Board.firstTile();

    return new Board(tileBoxes);
  }

  static createTileBox() {
    return {
      tile: null,
      mapple: { color: null, playerName: null, region: null },
      occupiedRegion: Board.createOccupiedRegion(),
    };
  }

  static createOccupiedRegion() {
    return {
      left: Board.createPosition(),
      top: Board.createPosition(),
      right: Board.createPosition(),
      bottom: Board.createPosition(),
      middle: Board.createPosition(),
    };
  }

  static createPosition() {
    return { feature: null, occupiedBy: [] };
  }

  getTile(position: Position) {
    return this.board[position.row][position.col].tile;
  }

  respectivePosition(position: Position) {
    const { row, col } = position;
    const pos = {
      left: { row, col: col - 1 },
      right: { row, col: col + 1 },
      top: { row: row - 1, col },
      bottom: { row: row + 1, col },
    };

    return pos;
  }

  respectiveTile(position: Position) {
    const resPosition = this.respectivePosition(position);
    const resTile = {
      leftTile: this.getTile(resPosition.left),
      rightTile: this.getTile(resPosition.right),
      topTile: this.getTile(resPosition.top),
      bottomTile: this.getTile(resPosition.bottom),
    };

    return resTile;
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

  isTilePlacable(tile: Tile, position: Position): boolean {
    const placingTileEdges = this.extractEdges(tile);
    const resTiles = this.respectiveTile(position);

    if (this.areAllResEmpty(resTiles)) {
      return false;
    }

    return this.isTileFeatureMatching(placingTileEdges, resTiles);
  }

  getBoard() {
    return this.board;
  }

  getTileBox(position: Position) {
    return this.board[position.row][position.col];
  }

  putTile(tile: Tile, position: Position): boolean {
    if (!this.isTilePlacable(tile, position)) return false;

    this.getTileBox(position).tile = tile;
    return true;
  }
}
