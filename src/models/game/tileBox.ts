import { Position, TileBox } from "../types/models.ts";

export class TileBoxManager {
  private board: TileBox[][];
  private readonly maxRow: number;
  private readonly maxCol: number;
  constructor(board: TileBox[][]) {
    this.board = board;
    this.maxRow = board.length;
    this.maxCol = board[0].length;
  }

  respectivePosition(position: Position) {
    const { row, col } = position;
    return {
      left: { row, col: col - 1 },
      right: { row, col: col + 1 },
      top: { row: row - 1, col },
      bottom: { row: row + 1, col },
    };
  }

  getCell(position: Position) {
    const { row, col } = position;
    if (row < 0 || col < 0 || row >= this.maxRow || col >= this.maxCol) {
      return null;
    }

    return this.board[row][col];
  }

  getTile(position: Position) {
    return this.getCell(position)?.tile;
  }

  adjacentCells(position: Position) {
    const resPosition = this.respectivePosition(position);
    return {
      leftCell: this.getCell(resPosition.left),
      rightCell: this.getCell(resPosition.right),
      topCell: this.getCell(resPosition.top),
      bottomCell: this.getCell(resPosition.bottom),
    };
  }

  adjacentTile(position: Position) {
    const adjCells = this.adjacentCells(position);
    return {
      leftTile: adjCells.leftCell?.tile,
      rightTile: adjCells.rightCell?.tile,
      topTile: adjCells.topCell?.tile,
      bottomTile: adjCells.bottomCell?.tile,
    };
  }

  adjacentOccupiedRegion(position: Position) {
    const adjCells = this.adjacentCells(position);

    return {
      leftEdge: adjCells.leftCell?.occupiedRegion.right,
      topEdge: adjCells.topCell?.occupiedRegion.bottom,
      rightEdge: adjCells.rightCell?.occupiedRegion.left,
      bottomEdge: adjCells.bottomCell?.occupiedRegion.top,
    };
  }
}
