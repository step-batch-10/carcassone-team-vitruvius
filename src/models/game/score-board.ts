import {
  OccupanceSubGrid,
  Position,
  RespectivePosition,
  Sides,
  TileBox,
} from "../ds/models.ts";

export class ScoreManager {
  private board;
  private edges;
  constructor(board: TileBox[][]) {
    this.board = board;
    this.edges = [Sides.LEFT, Sides.TOP, Sides.RIGHT, Sides.BOTTOM];
  }

  private adjacentTiles(
    left: Position,
    top: Position,
    right: Position,
    bottom: Position
  ) {
    const leftAdjTile = this.board[left.row][left.col];
    const topAdjTile = this.board[top.row][top.col];
    const rightAdjTile = this.board[right.row][right.col];
    const bottomAdjTile = this.board[bottom.row][bottom.col];

    return { leftAdjTile, topAdjTile, rightAdjTile, bottomAdjTile };
  }

  adjacentEdges(
    tilePosition: Position,
    resPostions: (arg0: Position) => {
      left: Position;
      top: Position;
      right: Position;
      bottom: Position;
    }
  ) {
    const { left, top, right, bottom } = resPostions(tilePosition);

    const { leftAdjTile, topAdjTile, rightAdjTile, bottomAdjTile } =
      this.adjacentTiles(left, top, right, bottom);

    const leftAdjEdge = leftAdjTile.occupiedRegion.right;
    const topAdjEdge = topAdjTile.occupiedRegion.bottom;
    const rightAdjEdge = rightAdjTile.occupiedRegion.left;
    const bottomAdjEdge = bottomAdjTile.occupiedRegion.top;

    return { leftAdjEdge, topAdjEdge, rightAdjEdge, bottomAdjEdge };
  }

  private addPlayerToCenter(
    middleOccupance: OccupanceSubGrid,
    adjacentSubGrid: OccupanceSubGrid
  ) {
    middleOccupance.occupiedBy.union(adjacentSubGrid.occupiedBy);
  }

  markCenterOccupance(cell: TileBox) {
    const occupances = cell.occupiedRegion;
    const middleOccupance = occupances.middle;
    this.edges.forEach((edge: Sides) => {
      if (middleOccupance.feature === occupances[edge].feature)
        this.addPlayerToCenter(middleOccupance, occupances[edge]);
    });
  }

  markOccupance(
    tilePosition: Position,
    respectivePosition: RespectivePosition
  ) {
    const { col, row } = tilePosition;
    const currentTile = this.board[row][col];
    const { leftAdjEdge, topAdjEdge, rightAdjEdge, bottomAdjEdge } =
      this.adjacentEdges(tilePosition, respectivePosition);

    currentTile.occupiedRegion.left = leftAdjEdge;
    currentTile.occupiedRegion.top = topAdjEdge;
    currentTile.occupiedRegion.right = rightAdjEdge;
    currentTile.occupiedRegion.bottom = bottomAdjEdge;
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
