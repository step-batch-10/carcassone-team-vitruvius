import {
  Center,
  Feature,
  Moves,
  OccupanceSubGrid,
  Position,
  Sides,
  TileBox,
} from "../models.ts";
import Player from "../room/player.ts";
import { TileBoxManager } from "./tiles.ts";

export class ScoreManager {
  private board;
  private edges;
  private readonly tileBoxes;
  private players;

  constructor(
    board: TileBox[][],
    tileBoxes: TileBoxManager,
    players: Player[],
  ) {
    this.board = board;
    this.tileBoxes = tileBoxes;
    this.edges = [Sides.LEFT, Sides.TOP, Sides.RIGHT, Sides.BOTTOM];
    this.players = players;
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

    this.edges.forEach((edge) => {
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
    const tileEdge = cell.tile!.tileEdges;
    const tileCenter = cell.tile!.tileCenter;
    const tileOccu = cell.occupiedRegion;

    this.edges.forEach((edge, index) => {
      tileOccu[edge].feature = tileEdge[index];
    });
    tileOccu.middle.feature = tileCenter;
  }

  private getEdges(position: Position) {
    const { leftEdge, topEdge, rightEdge, bottomEdge } = {
      ...this.tileBoxes.adjacentOccupiedRegion(position),
    };

    return [leftEdge, topEdge, rightEdge, bottomEdge];
  }

  private getSubgrid(tile: TileBox, edge: Sides, subGrid: OccupanceSubGrid) {
    return tile.occupiedRegion[edge].occupiedBy.union(subGrid.occupiedBy);
  }

  private markOccupiedRegion(tile: TileBox, position: Position) {
    const occupied = this.getEdges(position);

    this.edges.forEach((edge, index) => {
      const grid = occupied[index];
      tile.occupiedRegion[edge].occupiedBy = this.getSubgrid(tile, edge, grid!);
    });
  }

  private moveTo =
    (edge: Sides) => (position: Position, traversedPositions: Set<string>) => {
      const newPos = this.tileBoxes.adjacentPosition(position)[edge];
      if (
        this.tileBoxes.getTile(newPos) &&
        !this.isTraversed(traversedPositions, newPos)
      ) {
        traversedPositions.add(JSON.stringify(newPos));
        this.markOccupance(newPos, traversedPositions);
      }
    };

  private traverseAdjacentTiles(
    currentTile: TileBox,
    tilePosition: Position,
    traversedPositions: Set<string>,
  ) {
    const cellOccu = currentTile.occupiedRegion;

    this.edges.forEach((edge) => {
      if (cellOccu[edge].occupiedBy.size > 0) {
        this.moves()[edge](tilePosition, traversedPositions);
      }
    });
  }

  markOccupance(position: Position, traversedPositions: Set<string>) {
    const currentTile = this.board[position.row][position.col];

    this.markOccupiedRegion(currentTile, position);
    this.markFeature(currentTile);
    this.markCenterOccupance(currentTile);
    this.traverseAdjacentTiles(currentTile, position, traversedPositions);
  }

  private canClaim(position: Position, subGrid: Sides | Center) {
    return !(
      this.tileBoxes.getOccupiedBy(position, subGrid).size ||
      this.hasFeature(position, Feature.FIELD, subGrid)
    );
  }

  placeMeeple(position: Position, playerName: string, subGrid: Sides | Center) {
    let isPlaced = false;

    if (this.canClaim(position, subGrid)) {
      this.tileBoxes.getOccupiedBy(position, subGrid).add(playerName);
      this.markOccupance(position, new Set<string>());
      isPlaced = true;
    }

    return { isPlaced };
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

  markScored(position: Position, feature: Feature, except: Sides[]) {
    const cell = this.tileBoxes.getCell(position);

    this.edges.forEach((edge) => {
      this.markScoredForFeature(cell, edge, feature);
    });

    this.markScoredForFeature(cell, Center.MIDDlE, feature);

    except.forEach((edge) => {
      cell!.occupiedRegion[edge].isScored = false;
    });
  }

  private markScoredForFeature(
    cell: TileBox | null,
    edge: Sides | Center,
    feature: Feature,
  ) {
    if (cell?.occupiedRegion[edge].feature === feature) {
      cell.occupiedRegion[edge].isScored = true;
    }
  }

  private findPlayer(playerName: string | null) {
    return this.players.find((player) => player.username === playerName);
  }

  updateScoreToPlayers(playerNames: Set<string> | undefined, score: number) {
    playerNames?.values().forEach((playerName) => {
      const player = this.findPlayer(playerName);
      player!.points += score;
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

  private removeMeeple(position: Position) {
    const cell = this.tileBoxes.getCell(position);
    if (cell) {
      const player = this.findPlayer(cell.meeple.playerName);
      if (player) player.noOfMeeples += 1;

      cell.meeple.playerName = null;
      cell.meeple.color = null;
      cell.meeple.region = null;
    }
  }

  updateScoreForMonastry(position: Position, traverse: Set<string>) {
    traverse.add(JSON.stringify(position));

    if (
      this.canScoreFeature(position, Feature.MONASTERY, Center.MIDDlE) &&
      this.hasAdjacent9Tiles(position)
    ) {
      this.updateScoreToPlayers(this.getClaimedBy(position, Center.MIDDlE), 9);
      this.markScored(position, Feature.MONASTERY, []);
      this.removeMeeple(position);
    }

    this.tileBoxes.adjacentPositionArray(position).forEach((adjPos) => {
      if (
        this.hasFeature(adjPos, Feature.MONASTERY, Center.MIDDlE) &&
        !this.isScored(adjPos) &&
        !this.isTraversed(traverse, adjPos)
      ) {
        this.updateScoreForMonastry(adjPos, traverse);
      }
    });
  }

  private isTraversed(traversedPositions: Set<string>, position: Position) {
    return traversedPositions.has(JSON.stringify(position));
  }

  removeAllMeeples(traversedPositions: Set<string>) {
    traversedPositions.values().forEach((position) => {
      this.removeMeeple(JSON.parse(position));
    });
  }

  private traverseRoadAndScore(
    position: Position,
    traversed: Set<string>,
    endOfRoad: number,
    lastEdge: Sides = Sides.LEFT,
  ): number {
    if (endOfRoad === 2) {
      const { position, lastEdge } = this.tileBoxes.getLastEdge(
        traversed,
        this.edges,
      );

      const playerNames = this.tileBoxes.getOccupiedBy(position, lastEdge);
      if (playerNames.size === 0) return endOfRoad;

      this.updateScoreToPlayers(playerNames, traversed.size);
      this.removeAllMeeples(traversed);
      this.markScoredForRoad(traversed);

      return endOfRoad;
    }

    if (this.isTraversed(traversed, position)) return endOfRoad;

    if (
      this.hasFeature(position, Feature.ROAD_END, Center.MIDDlE) ||
      this.hasSpecialEnd(position)
    ) {
      traversed.add(JSON.stringify(position));

      return this.traverseRoadAndScore(
        position,
        traversed,
        endOfRoad + 1,
        lastEdge,
      );
    }

    if (
      this.hasFeature(position, Feature.ROAD, Center.MIDDlE) ||
      this.hasFeature(position, Feature.CITY, Center.MIDDlE)
    ) {
      ({ lastEdge, endOfRoad } = this.roadOrCityInMiddle(
        position,
        traversed,
        lastEdge,
        endOfRoad,
      ));
    }

    return endOfRoad;
  }

  private roadOrCityInMiddle(
    position: Position,
    traversed: Set<string>,
    lastEdge: Sides,
    endOfRoad: number,
  ) {
    this.edges.forEach((edge) => {
      if (this.hasFeature(position, Feature.ROAD, edge)) {
        traversed.add(JSON.stringify(position));
        lastEdge = edge;

        if (endOfRoad >= 2) return endOfRoad;
        const adjPos = this.tileBoxes.adjacentPosition(position)[edge];
        endOfRoad = this.traverseRoadAndScore(
          adjPos,
          traversed,
          endOfRoad,
          lastEdge,
        );
      }
    });
    return { lastEdge, endOfRoad };
  }

  private markScoredForRoad(traversed: Set<string>) {
    traversed.forEach((pos) => {
      const objPos = JSON.parse(pos);
      const notScored = this.tileBoxes.notScoredEdges.bind(this.tileBoxes);
      const except = notScored(traversed, objPos, this.edges).except;

      if (this.hasFeature(objPos, Feature.ROAD_END, Center.MIDDlE)) {
        this.markScored(objPos, Feature.ROAD, except);
      } else this.markScored(objPos, Feature.ROAD, []);
    });
  }

  private hasSpecialEnd(pos: Position) {
    let roads = 0;
    this.edges.forEach((edge) => {
      if (this.hasFeature(pos, Feature.ROAD, edge)) {
        roads += 1;
      }
    });

    return roads === 1;
  }

  updateScoreForRoad(position: Position) {
    const traversed: Set<string> = new Set();

    if (
      this.hasFeature(position, Feature.ROAD, Center.MIDDlE) ||
      this.hasFeature(position, Feature.CITY, Center.MIDDlE)
    ) {
      this.traverseRoadAndScore(position, traversed, 0);
    }

    if (
      this.hasFeature(position, Feature.ROAD_END, Center.MIDDlE) ||
      this.hasSpecialEnd(position)
    ) {
      traversed.add(JSON.stringify(position));
      this.roadEnding(position, traversed);
    }
  }

  private roadEnding(pos: Position, traversed: Set<string>) {
    this.edges.forEach((edge) => {
      if (
        this.hasFeature(pos, Feature.ROAD, edge) &&
        !this.tileBoxes.isScored(pos, edge)
      ) {
        const newPosition = this.tileBoxes.adjacentPosition(pos)[edge];
        this.traverseRoadAndScore(newPosition, traversed, 1, edge);
      }
    });
  }

  score(position: Position) {
    this.updateScoreForMonastry(position, new Set<string>());
    this.updateScoreForRoad(position);
  }
}
