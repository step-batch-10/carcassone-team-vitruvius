import { TileBox } from "./carcassone.ts";

export class Board {
  private board: TileBox[][];

  constructor(tileBoxes: TileBox[][]) {
    this.board = tileBoxes;
  }

  static create(rows: number, cols: number) {
    const emptyBoard = Array(rows).fill(Array(cols).fill(null));
    const tileBoxes = emptyBoard.map((rows: null[]) => rows.map(Board.createTileBox));

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

  getBoard() {
    return this.board;
  }
}
