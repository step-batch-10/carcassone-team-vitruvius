import { TileBoxManager } from "./tiles.ts";
import { Position, Sides, TileBox } from "../types/models.ts";

export class ScoreManager {
  private board;
  private edges;
  private readonly tileBoxes;
  constructor(board: TileBox[][], tileBoxes: TileBoxManager) {
    this.board = board;
    this.tileBoxes = tileBoxes;
    this.edges = [Sides.LEFT, Sides.TOP, Sides.RIGHT, Sides.BOTTOM];
  }

  private markCenterOccupance(cell: TileBox) {
    const occupances = cell.occupiedRegion;
    const middleOccupance = occupances.middle;

    this.edges.forEach((edge: Sides) => {
      if (middleOccupance.feature === occupances[edge].feature) {
        middleOccupance.occupiedBy = middleOccupance.occupiedBy.union(
          occupances[edge].occupiedBy,
        );
      }
    });
    this.edges.forEach((edge: Sides) => {
      if (middleOccupance.feature === occupances[edge].feature) {
        occupances[edge].occupiedBy = middleOccupance.occupiedBy.union(
          occupances[edge].occupiedBy,
        );
      }
    });
  }

  private markFeature(cell: TileBox) {
    if (!cell.tile) return;
    const tileEdge = cell.tile.tileEdges;
    const tileCenter = cell.tile.tileCenter;
    const tileOccu = cell.occupiedRegion;

    this.edges.forEach((edge, index) => {
      tileOccu[edge].feature = tileEdge[index];
    });
    tileOccu.middle.feature = tileCenter;
  }

  private markOccupiedRegion(currentTile: TileBox, tilePosition: Position) {
    const { leftEdge, topEdge, rightEdge, bottomEdge } = {
      ...this.tileBoxes
        .adjacentOccupiedRegion(tilePosition),
    };

    const occupiedEdges = [leftEdge, topEdge, rightEdge, bottomEdge];

    this.edges.forEach((edge, index) => {
      currentTile.occupiedRegion[edge].occupiedBy = currentTile
        .occupiedRegion[edge].occupiedBy.union(
          occupiedEdges[index]?.feature
            ? occupiedEdges[index].occupiedBy
            : currentTile.occupiedRegion[edge].occupiedBy,
        );
    });
  }

  markOccupance(tilePosition: Position) {
    const { col, row } = tilePosition;
    const currentTile = this.board[row][col];

    this.markOccupiedRegion(currentTile, tilePosition);

    this.markFeature(currentTile);
    this.markCenterOccupance(currentTile);

    const cellOccu = currentTile.occupiedRegion;
    const adjCellEdge = this.tileBoxes.adjacentOccupiedRegion(tilePosition);
    // const move = {
    //   left: this.moveLeft,
    //   top: this.moveTop,
    //   bottom: this.moveBottom,
    //   right: this.moveRight,
    // };
    // this.edges.forEach((edge) => {
    //   if (cellOccu[edge].occupiedBy.size > 0) {
    //     move[edge](tilePosition);
    //   }
    // });

    if (
      cellOccu.left.occupiedBy.size > 0 &&
      adjCellEdge.leftEdge?.occupiedBy.size === 0
    ) {
      this.moveLeft(tilePosition);
    }
    if (
      cellOccu.right.occupiedBy.size > 0 &&
      adjCellEdge.rightEdge?.occupiedBy.size === 0
    ) {
      this.moveRight(tilePosition);
    }
    if (
      cellOccu.top.occupiedBy.size > 0 &&
      adjCellEdge.topEdge?.occupiedBy.size === 0
    ) {
      this.moveTop(tilePosition);
    }
    if (
      cellOccu.bottom.occupiedBy.size > 0 &&
      adjCellEdge.bottomEdge?.occupiedBy.size === 0
    ) {
      this.moveBottom(tilePosition);
    }
  }

  placeMeeple(position: Position, playerName: string, subGrid: Sides) {
    const cell = this.board[position.row][position.col];
    if (!cell.occupiedRegion[subGrid].occupiedBy.size) {
      cell.occupiedRegion[subGrid].occupiedBy.add(playerName);

      this.markOccupance(position);
      return { isPlaced: true };
    }

    return { isPlaced: false };
  }

  private moveTop(position: Position) {
    const newPos = this.tileBoxes.resPos(position).top;
    if (this.tileBoxes.getTile(newPos)) {
      this.markOccupance(newPos);
    }
  }

  private moveLeft(position: Position) {
    const newPos = this.tileBoxes.resPos(position).left;
    if (this.tileBoxes.getTile(newPos)) {
      this.markOccupance(newPos);
    }
  }
  private moveRight(position: Position) {
    const newPos = this.tileBoxes.resPos(position).right;
    if (this.tileBoxes.getTile(newPos)) {
      this.markOccupance(newPos);
    }
  }
  private moveBottom(position: Position) {
    const newPos = this.tileBoxes.resPos(position).bottom;
    if (this.tileBoxes.getTile(newPos)) {
      this.markOccupance(newPos);
    }
  }
}
