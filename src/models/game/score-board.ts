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
  private readonly tiles;
  private scorePoints;

  constructor(
    board: TileBox[][],
    tileBoxes: TileBoxManager,
    players: Player[],
  ) {
    this.board = board;
    this.tiles = tileBoxes;
    this.edges = [Sides.LEFT, Sides.TOP, Sides.RIGHT, Sides.BOTTOM];
    this.scorePoints = new Score(tileBoxes, players);
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
        }
      });

      this.edges.forEach((edge) => {
        if (occupances[edge].feature === Feature.ROAD) {
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
      ...this.tiles.adjacentOccupiedRegion(position),
    };

    return [leftEdge, topEdge, rightEdge, bottomEdge];
  }

  private getSubgrid(pos: Position, edge: Sides, subGrid: OccupanceSubGrid) {
    return this.tiles.getOccupiedBy(pos, edge).union(subGrid.occupiedBy);
  }

  private markOccupiedRegion(tile: TileBox, pos: Position) {
    const occupied = this.getEdges(pos);

    this.edges.forEach((edge, index) => {
      const grid = occupied[index];
      tile.occupiedRegion[edge].occupiedBy = this.getSubgrid(pos, edge, grid!);
    });
  }

  private canTraverse(pos: Position, traversed: Set<string>) {
    return (
      this.tiles.getTile(pos) && !this.scorePoints.isTraversed(traversed, pos)
    );
  }

  private moveTo(edge: Sides) {
    return (position: Position, traversed: Set<string>) => {
      const newPos = this.tiles.adjacentPosition(position)[edge];

      if (this.canTraverse(newPos, traversed)) {
        traversed.add(JSON.stringify(newPos));
        this.markOccupance(newPos, traversed);
      }
    };
  }

  private walkAdjTiles(position: Position, traversed: Set<string>) {
    this.edges.forEach((edge) => {
      if (this.tiles.isOccupied(position, edge)) {
        this.moves()[edge](position, traversed);
      }
    });
  }

  markOccupance(position: Position, traversed: Set<string>) {
    const currentTile = this.tiles.getCell(position)!;

    this.markOccupiedRegion(currentTile, position);
    this.markFeature(currentTile);
    this.markCenterOccupance(currentTile);
    this.walkAdjTiles(position, traversed);
  }

  private canClaim(position: Position, subGrid: Sides | Center) {
    return !(
      this.tiles.isOccupied(position, subGrid) ||
      this.tiles.hasFeature(position, Feature.FIELD, subGrid)
    );
  }

  placeMeeple(position: Position, playerName: string, subGrid: Sides | Center) {
    let isPlaced = false;

    if (this.canClaim(position, subGrid)) {
      this.tiles.getOccupiedBy(position, subGrid).add(playerName);
      this.markOccupance(position, new Set<string>());
      isPlaced = true;
    }

    return { isPlaced };
  }

  score(position: Position) {
    this.scorePoints.updateScoreForMonastry(position, new Set<string>());
    this.scorePoints.updateScoreForRoad(position);
  }

  endGame() {
    this.scorePoints.endGameScore(this.board);
  }
}

class Score {
  private tiles;
  private readonly edges;
  private players;

  constructor(tileBoxes: TileBoxManager, players: Player[]) {
    this.tiles = tileBoxes;
    this.edges = [Sides.LEFT, Sides.TOP, Sides.RIGHT, Sides.BOTTOM];
    this.players = players;
  }

  private findPlayer(playerName: string | null) {
    return this.players.find((player) => player.username === playerName);
  }

  private removeMeeple(position: Position) {
    const meeple = this.tiles.getCell(position)!.meeple;
    const player = this.findPlayer(meeple.playerName);

    if (player && this.tiles.isScored(position, meeple.region!)) {
      player.noOfMeeples += 1;

      meeple.playerName = null;
      meeple.color = null;
      meeple.region = null;
    }
  }

  private roadOrCityInMiddle(
    position: Position,
    traversed: Set<string>,
    lastEdge: Sides,
    endOfRoad: number,
  ) {
    this.edges.forEach((edge) => {
      if (this.tiles.hasFeature(position, Feature.ROAD, edge)) {
        traversed.add(JSON.stringify(position));
        lastEdge = edge;

        if (endOfRoad >= 2) return endOfRoad;
        const adjPos = this.tiles.adjacentPosition(position)[edge];
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

  private roadEnding(pos: Position) {
    const traversed = new Set<string>();
    traversed.add(JSON.stringify(pos));
    this.edges.forEach((edge) => {
      if (
        this.tiles.hasFeature(pos, Feature.ROAD, edge) &&
        !this.tiles.isScored(pos, edge)
      ) {
        const newPosition = this.tiles.adjacentPosition(pos)[edge];
        this.traverseRoadAndScore(newPosition, traversed, 1, edge);
      }
    });
  }

  private markScoredForRoad(traversed: Set<string>) {
    traversed.forEach((pos) => {
      const objPos = JSON.parse(pos);
      const notScored = this.tiles.notScoredEdges.bind(this.tiles);
      const except = notScored(traversed, objPos, this.edges).except;

      if (this.tiles.hasFeature(objPos, Feature.ROAD_END, Center.MIDDlE)) {
        this.markScored(objPos, Feature.ROAD, except);
      } else this.markScored(objPos, Feature.ROAD, []);
    });
  }

  private removeAllMeeples(traversedPositions: Set<string>) {
    traversedPositions.values().forEach((position) => {
      this.removeMeeple(JSON.parse(position));
    });
  }

  private updateScoreToPlayers(
    playerNames: Set<string> | undefined,
    score: number,
  ) {
    playerNames?.values().forEach((playerName) => {
      const player = this.findPlayer(playerName);
      player!.points += score;
    });
  }

  private hasSpecialEnd(pos: Position) {
    let roads = 0;
    this.edges.forEach((edge) => {
      if (this.tiles.hasFeature(pos, Feature.ROAD, edge)) {
        roads += 1;
      }
    });

    return roads === 1;
  }

  private traverseRoadAndScore(
    position: Position,
    traversed: Set<string>,
    endOfRoad: number,
    lastEdge: Sides = Sides.LEFT,
  ): number {
    if (endOfRoad === 2) {
      const { position, lastEdge } = this.tiles.getLastEdge(
        traversed,
        this.edges,
      );

      const playerNames = this.tiles.getOccupiedBy(position, lastEdge);
      if (playerNames.size === 0) return endOfRoad;

      this.updateScoreToPlayers(playerNames, traversed.size);
      this.markScoredForRoad(traversed);
      this.removeAllMeeples(traversed);

      return endOfRoad;
    }

    if (this.isTraversed(traversed, position)) return endOfRoad;

    if (
      this.tiles.hasFeature(position, Feature.ROAD_END, Center.MIDDlE) ||
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
      this.tiles.hasFeature(position, Feature.ROAD, Center.MIDDlE) ||
      this.tiles.hasFeature(position, Feature.CITY, Center.MIDDlE)
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

  updateScoreForRoad(position: Position) {
    const traversed: Set<string> = new Set();

    if (
      this.tiles.hasFeature(position, Feature.ROAD, Center.MIDDlE) ||
      this.tiles.hasFeature(position, Feature.CITY, Center.MIDDlE)
    ) {
      this.traverseRoadAndScore(position, traversed, 0);
    }

    if (
      this.tiles.hasFeature(position, Feature.ROAD_END, Center.MIDDlE) ||
      this.hasSpecialEnd(position)
    ) {
      this.roadEnding(position);
    }
  }

  private canScoreFeature(
    position: Position,
    feature: Feature,
    subGrid: Sides | Center,
  ) {
    return (
      this.tiles.hasFeature(position, feature, subGrid) &&
      this.tiles.isClaimed(position) &&
      !this.tiles.isScored(position, subGrid)
    );
  }

  private hasAdjacent9Tiles(position: Position): boolean {
    return this.tiles
      .adjacentPositionArray(position)
      .every((pos) => this.tiles.getTile(pos));
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

  private markScored(position: Position, feature: Feature, except: Sides[]) {
    const cell = this.tiles.getCell(position);

    this.edges.forEach((edge) => {
      this.markScoredForFeature(cell, edge, feature);
    });

    this.markScoredForFeature(cell, Center.MIDDlE, feature);

    except.forEach((edge) => {
      cell!.occupiedRegion[edge].isScored = false;
    });
  }

  isTraversed(traversedPositions: Set<string>, position: Position) {
    return traversedPositions.has(JSON.stringify(position));
  }

  updateScoreForMonastry(position: Position, traverse: Set<string>) {
    traverse.add(JSON.stringify(position));

    if (
      this.canScoreFeature(position, Feature.MONASTERY, Center.MIDDlE) &&
      this.hasAdjacent9Tiles(position)
    ) {
      this.updateScoreToPlayers(
        this.tiles.getOccupiedBy(position, Center.MIDDlE),
        9,
      );
      this.markScored(position, Feature.MONASTERY, []);
      this.removeMeeple(position);
    }

    this.tiles.adjacentPositionArray(position).forEach((adjPos) => {
      if (
        this.tiles.hasFeature(adjPos, Feature.MONASTERY, Center.MIDDlE) &&
        !this.tiles.isScored(adjPos, Center.MIDDlE) &&
        !this.isTraversed(traverse, adjPos)
      ) {
        this.updateScoreForMonastry(adjPos, traverse);
      }
    });
  }

  noOfAdjTiles(position: Position) {
    return this.tiles
      .adjacentPositionArray(position)
      .reduce(
        (count, pos) => (this.tiles.getTile(pos) ? (count += 1) : count),
        0,
      );
  }

  endGameScore(board: TileBox[][]) {
    board.forEach((_, row) => {
      _.forEach((tile, col) => {
        const meeple = tile.occupiedRegion.middle;
        if (meeple.feature === Feature.MONASTERY && !meeple.isScored) {
          const noOfTiles = this.noOfAdjTiles({ row, col });
          const players = meeple.occupiedBy;
          this.updateScoreToPlayers(players, noOfTiles + 1);
        }
      });
    });
  }
}
