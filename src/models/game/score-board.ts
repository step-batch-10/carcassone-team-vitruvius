import { TileBoxManager } from "./tiles.ts";
import { Center, Feature, Moves, Position, Sides, TileBox } from "../models.ts";
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
    this.edges.forEach((edge) => {
      if (middleOccupance.feature === occupances[edge].feature) {
        occupances[edge].occupiedBy = middleOccupance.occupiedBy.union(
          occupances[edge].occupiedBy,
        );
      }
    });

    if (middleOccupance.feature === Feature.CITY) {
      let tempPlayers = new Set<string>();
      this.edges.forEach((edge) => {
        if (occupances[edge].feature === Feature.ROAD) {
          tempPlayers = tempPlayers.union(occupances[edge].occupiedBy);
          occupances[edge].occupiedBy = tempPlayers;
        }
      });
    }
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

  hasFeature(
    position: Position,
    feature: Feature,
    subGrid: Sides | Center,
  ): boolean {
    const cell = this.tileBoxes.getCell(position);
    if (cell) return cell.occupiedRegion[subGrid].feature === feature;
    return false;
  }

  isClaimed(position: Position): boolean | void {
    const cell = this.tileBoxes.getCell(position);
    if (cell) return cell.occupiedRegion.middle.occupiedBy.size > 0;
  }

  markScored(position: Position, subGrid: Sides | Center) {
    const cell = this.tileBoxes.getCell(position);
    if (cell) cell.occupiedRegion[subGrid].isScored = true;
  }

  private findPlayer(players: Player[], playerName: string | null) {
    return players.find((player) => player.username === playerName);
  }

  updateScoreToPlayers(
    playerNames: Set<string> | undefined,
    players: Player[],
    score: number,
  ) {
    playerNames?.values().forEach((playerName) => {
      const player = this.findPlayer(players, playerName);
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

  private canScoreFeature(
    position: Position,
    feature: Feature,
    subGrid: Sides | Center,
  ) {
    return (
      this.hasFeature(position, feature, subGrid) &&
      this.isClaimed(position) &&
      !this.isScored(position)
    );
  }

  private isScored(position: Position) {
    return this.tileBoxes.getCell(position)?.occupiedRegion.middle.isScored;
  }

  private removeMeeple(position: Position, players: Player[]) {
    const cell = this.tileBoxes.getCell(position);
    if (cell) {
      const player = this.findPlayer(players, cell.meeple.playerName);
      if (player) player.noOfMeeples += 1;

      cell.meeple.playerName = null;
      cell.meeple.color = null;
      cell.meeple.region = null;
    }
  }

  updateScoreForMonastry(
    position: Position,
    players: Player[],
    traverse: Set<string>,
  ) {
    traverse.add(`${position.row}-${position.col}`);

    if (
      this.canScoreFeature(position, Feature.MONASTERY, Center.MIDDlE) &&
      this.hasAdjacent9Tiles(position)
    ) {
      this.updateScoreToPlayers(
        this.getClaimedBy(position, Center.MIDDlE),
        players,
        9,
      );
      this.markScored(position, Center.MIDDlE);
      this.removeMeeple(position, players);
    }

    this.tileBoxes.adjacentPositionArray(position).forEach((adjPos) => {
      if (
        this.hasFeature(adjPos, Feature.MONASTERY, Center.MIDDlE) &&
        !this.isScored(adjPos) &&
        !traverse.has(`${adjPos.row}-${adjPos.col}`)
      ) {
        this.updateScoreForMonastry(adjPos, players, traverse);
      }
    });
  }

  private isTraversed(traversedPositions: Set<string>, position: Position) {
    return traversedPositions.has(`${position.row}-${position.col}`);
  }

  getOppositeEdge(edge: Sides) {
    const opposite = {
      right: Sides.LEFT,
      top: Sides.BOTTOM,
      bottom: Sides.TOP,
      left: Sides.RIGHT,
    };
    return opposite[edge];
  }
  removeAllMeeples(traversedPositions: Set<string>, players: Player[]) {
    traversedPositions.values().forEach((position) => {
      const [row, col] = position.split("-").map(Number);
      const convertedPosition = { row, col };
      this.removeMeeple(convertedPosition, players);
    });
  }
  private something(
    position: Position,
    traversedPositions: Set<string>,
    endOfRoad: number,
    players: Player[],
    lastEdge: Sides = Sides.LEFT,
  ): number {
    if (endOfRoad === 2) {
      lastEdge = this.getOppositeEdge(lastEdge);

      const playerNames = this.tileBoxes.getCell(position)
        ?.occupiedRegion[lastEdge].occupiedBy;
      this.updateScoreToPlayers(playerNames, players, traversedPositions.size);
      this.removeAllMeeples(traversedPositions, players);

      return endOfRoad;
    }
    if (this.isTraversed(traversedPositions, position)) return endOfRoad;

    if (this.hasFeature(position, Feature.ROAD_END, Center.MIDDlE)) {
      traversedPositions.add(`${position.row}-${position.col}`);
      return this.something(
        position,
        traversedPositions,
        endOfRoad + 1,
        players,
        lastEdge,
      );
    }
    if (
      this.hasFeature(position, Feature.ROAD, Center.MIDDlE) ||
      this.hasFeature(position, Feature.CITY, Center.MIDDlE)
    ) {
      this.edges.forEach((edge) => {
        if (this.hasFeature(position, Feature.ROAD, edge)) {
          traversedPositions.add(`${position.row}-${position.col}`);
          lastEdge = edge;
          if (endOfRoad >= 2) return endOfRoad;
          endOfRoad = this.something(
            this.tileBoxes.adjacentPosition(position)[edge],
            traversedPositions,
            endOfRoad,
            players,
            lastEdge,
          );
        }
      });
    }

    return endOfRoad;
  }

  updateScoreForRoad(position: Position, players: Player[]) {
    const traversedPositions: Set<string> = new Set();

    if (this.hasFeature(position, Feature.ROAD, Center.MIDDlE)) {
      this.something(position, traversedPositions, 0, players);
    }

    if (this.hasFeature(position, Feature.ROAD_END, Center.MIDDlE)) {
      traversedPositions.add(`${position.row}-${position.col}`);
      this.edges.forEach((edge) => {
        if (this.hasFeature(position, Feature.ROAD, edge)) {
          const newPosition = this.tileBoxes.adjacentPosition(position)[edge];
          this.something(newPosition, traversedPositions, 1, players, edge);
        }
      });
    }
  }

  score(position: Position, players: Player[]) {
    this.updateScoreForMonastry(position, players, new Set<string>());
    this.updateScoreForRoad(position, players);
  }
}
