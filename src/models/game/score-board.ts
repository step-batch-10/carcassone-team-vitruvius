import { TileBoxManager } from "./tiles.ts";
import { Center, Moves, Position, Sides, TileBox } from "../models.ts";
import Player from "../room/player.ts";

export class ScoreManager {
  private board;
  private edges;
  private readonly tileBoxes;
  constructor(board: TileBox[][], tileBoxes: TileBoxManager) {
    this.board = board;
    this.tileBoxes = tileBoxes;
    this.edges = [Sides.LEFT, Sides.TOP, Sides.RIGHT, Sides.BOTTOM];
  }

  private moves(): Moves {
    return {
      left: this.moveTo(Sides.LEFT).bind(this),
      top: this.moveTo(Sides.TOP).bind(this),
      bottom: this.moveTo(Sides.BOTTOM).bind(this),
      right: this.moveTo(Sides.RIGHT).bind(this),
    };
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
      ...this.tileBoxes.adjacentOccupiedRegion(tilePosition),
    };

    const occupiedEdges = [leftEdge, topEdge, rightEdge, bottomEdge];

    this.edges.forEach((edge, index) => {
      if (!occupiedEdges[index]) return;
      currentTile.occupiedRegion[edge].occupiedBy = currentTile.occupiedRegion[
        edge
      ].occupiedBy.union(occupiedEdges[index].occupiedBy);
    });
  }
  private moveTo = (edge: Sides) => (position: Position) => {
    const newPos = this.tileBoxes.adjacentPosition(position)[edge];
    if (this.tileBoxes.getTile(newPos)) {
      this.markOccupance(newPos);
    }
  };

  private moveReccursively(currentTile: TileBox, tilePosition: Position) {
    const cellOccu = currentTile.occupiedRegion;
    const adjEdges = this.tileBoxes.adjOccupiedRegionArray(tilePosition);
    this.edges.forEach((edge, index) => {
      if (
        cellOccu[edge].occupiedBy.size > 0 &&
        adjEdges[index]?.occupiedBy.size === 0
      ) {
        this.moves()[edge](tilePosition);
      }
    });
  }

  markOccupance(tilePosition: Position) {
    const { col, row } = tilePosition;
    const currentTile = this.board[row][col];

    this.markOccupiedRegion(currentTile, tilePosition);
    this.markFeature(currentTile);
    this.markCenterOccupance(currentTile);
    this.moveReccursively(currentTile, tilePosition);
  }

  placeMeeple(position: Position, playerName: string, subGrid: Sides | Center) {
    const cell = this.board[position.row][position.col];
    if (!cell.occupiedRegion[subGrid].occupiedBy.size) {
      cell.occupiedRegion[subGrid].occupiedBy.add(playerName);
      this.markOccupance(position);
      return { isPlaced: true };
    }
    return { isPlaced: false };
  }

  hasAdjacent9Tiles(position: Position): boolean {
    return this.tileBoxes
      .adjacentPositionArray(position)
      .every((pos) => this.tileBoxes.getTile(pos));
  }

  isMonastery(position: Position): boolean {
    return this.tileBoxes.getTile(position)?.tileCenter === "monastery";
  }

  isClaimed(position: Position): boolean | void {
    const cell = this.tileBoxes.getCell(position);
    if (cell) return cell.occupiedRegion.middle.occupiedBy.size > 0;
  }

  markScored(position: Position, subGrid: Sides | Center) {
    const cell = this.tileBoxes.getCell(position);
    if (cell) cell.occupiedRegion[subGrid].isScored = true;
  }

  updateScoreToPlayers(
    playerNames: Set<string> | undefined,
    players: Player[],
    score: number,
  ) {
    playerNames?.values().forEach((playerName) => {
      const player = players.find((player) => player.username === playerName);
      if (player) {
        player.points += score;
      }
    });
  }

  getClaimedBy(position: Position, subGrid: Sides | Center) {
    const cell = this.tileBoxes.getCell(position);
    if (cell) {
      return cell.occupiedRegion[subGrid].occupiedBy;
    }
  }

  private canScoreMonastery(position: Position) {
    return (
      this.isMonastery(position) &&
      this.isClaimed(position) &&
      this.hasAdjacent9Tiles(position) &&
      !this.isScored(position)
    );
  }

  private isScored(position: Position) {
    return this.tileBoxes.getCell(position)?.occupiedRegion.middle.isScored;
  }

  updateScoreForMonastry(position: Position, players: Player[]) {
    if (this.canScoreMonastery(position)) {
      this.updateScoreToPlayers(
        this.getClaimedBy(position, Center.MIDDlE),
        players,
        9,
      );
      this.markScored(position, Center.MIDDlE);
    }

    this.tileBoxes.adjacentPositionArray(position).forEach((adjPos) => {
      if (this.isMonastery(adjPos) && !this.isScored(adjPos)) {
        this.updateScoreForMonastry(adjPos, players);
      }
    });
  }

  score(position: Position, players: Player[]) {
    this.updateScoreForMonastry(position, players);
  }
}
