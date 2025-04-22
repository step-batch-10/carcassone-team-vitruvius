import { TileBoxManager } from "./tileBox.ts";
import { OccupanceSubGrid, Position, Sides, TileBox } from "../types/models.ts";

export class ScoreManager {
  private board;
  private edges;
  private tileBoxes;
  constructor(board: TileBox[][], tileBoxes: TileBoxManager) {
    this.board = board;
    this.tileBoxes = tileBoxes;
    this.edges = [Sides.LEFT, Sides.TOP, Sides.RIGHT, Sides.BOTTOM];
  }

  private addPlayerToCenter(
    middleOccupance: OccupanceSubGrid,
    adjacentSubGrid: OccupanceSubGrid,
  ) {
    middleOccupance.occupiedBy.union(adjacentSubGrid.occupiedBy);
  }

  private markCenterOccupance(cell: TileBox) {
    const occupances = cell.occupiedRegion;
    const middleOccupance = occupances.middle;

    this.edges.forEach((edge: Sides) => {
      if (middleOccupance.feature === occupances[edge].feature) {
        this.addPlayerToCenter(middleOccupance, occupances[edge]);
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
    const { leftEdge, topEdge, rightEdge, bottomEdge } = this.tileBoxes
      .adjacentOccupiedRegion(tilePosition);

    const occupiedEdges = [leftEdge, topEdge, rightEdge, bottomEdge];
    console.log(occupiedEdges);

    this.edges.forEach((edge, index) => {
      currentTile.occupiedRegion[edge] = occupiedEdges[index]?.feature
        ? occupiedEdges[index]
        : currentTile.occupiedRegion[edge];
    });
  }

  markOccupance(tilePosition: Position) {
    const { col, row } = tilePosition;
    const currentTile = this.board[row][col];
    this.markOccupiedRegion(currentTile, tilePosition);

    this.markFeature(currentTile);
    this.markCenterOccupance(this.board[row][col]);
  }

  placeMeeple(position: Position, playerName: string, subGrid: Sides) {
    const cell = this.board[position.row][position.col];
    if (!cell.occupiedRegion[subGrid].occupiedBy.size) {
      cell.occupiedRegion[subGrid].occupiedBy.add(playerName);
      return { isPlaced: true };
    }

    return { isPlaced: false };
  }
}
