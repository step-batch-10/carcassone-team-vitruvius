import { TileBoxManager, TileStacker } from "./tiles.ts";
import { Board } from "./board.ts";
import Player from "../room/player.ts";
import {
  CardinalDegrees,
  Center,
  Position,
  Sides,
  Tile,
  TileBox,
} from "../models.ts";

import _ from "lodash";
import { generateTiles } from "./tile-generator.ts";
import { ScoreManager } from "./score-board.ts";

export class Carcassonne {
  private readonly board: Board;
  private readonly players: Player[];
  private turn: number;
  private tileManager: TileStacker;
  private currentTile: Tile | null;
  private unlockedPositions: Position[];
  private tilePlacedAt: Position | null;
  private tileBoxes;
  private scoreBoard;
  private lastPlacedTilePosition: Position;

  constructor(
    players: Player[],
    tileManager: TileStacker,
    board: Board,
    unlockedPosition: Position[],
  ) {
    this.players = players;
    this.turn = 0;
    this.board = board;
    this.currentTile = null;
    this.tileManager = tileManager;
    this.unlockedPositions = unlockedPosition;
    this.tilePlacedAt = null;
    this.tileBoxes = new TileBoxManager(board.getBoard());
    this.scoreBoard = new ScoreManager(
      board.getBoard(),
      this.tileBoxes,
      players,
    );
    this.lastPlacedTilePosition = { row: 42, col: 42 };
  }

  static getAllUnlockedPosition(board: Board): Position[] {
    const unlockedPosition: Position[] = [];

    board.getBoard().forEach((row, rowNo) =>
      row.forEach((_, colNo) => {
        if (board.isBoxUnlockToPlace({ row: rowNo, col: colNo })) {
          unlockedPosition.push({ row: rowNo, col: colNo });
        }
      })
    );

    return unlockedPosition;
  }

  private placablePositions() {
    return this.unlockedPositions.filter((position) =>
      this.board.isTilePlaceable(this.currentTile, position)
    );
  }

  validPositions() {
    return {
      unlockedPositions: this.unlockedPositions,
      placablePositions: this.placablePositions(),
    };
  }

  static initGame(
    players: Player[],
    tileShuffler = (tiles: Tile[]) => tiles.sort(() => Math.random() - 0.5),
    tilesArr = generateTiles(),
  ) {
    const tileManager = new TileStacker(tilesArr, tileShuffler);
    const board = Board.create(84, 84);
    const unlockedPositions = Carcassonne.getAllUnlockedPosition(board);

    return new Carcassonne(players, tileManager, board, unlockedPositions);
  }

  rotateTile(tile: Tile) {
    tile.orientation = (tile.orientation + CardinalDegrees.ninety) % 360;
    tile.tileEdges.unshift(tile.tileEdges.pop()!);

    return tile;
  }

  private canTileBePlaced(tile: Tile) {
    return this.unlockedPositions.some((position) =>
      this.board.isTilePlaceable(tile, position)
    );
  }

  isValidTileToPlace({ ...tile }: Tile) {
    const rotated = tile;
    rotated.tileEdges = [...tile.tileEdges];
    for (let i = 0; i < 4; i++) {
      if (this.canTileBePlaced(rotated)) {
        return true;
      }

      this.rotateTile(rotated);
    }

    return false;
  }

  rotateCurrentTile() {
    return this.rotateTile(this.currentTile!);
  }

  drawATile(): Tile | null {
    const drawnTile = this.tileManager.pickTile();
    if (drawnTile && !this.isValidTileToPlace({ ...drawnTile })) {
      this.tileManager.pushTile(drawnTile);
      return this.drawATile();
    }

    this.currentTile = drawnTile;
    this.unlockedPositions = Carcassonne.getAllUnlockedPosition(this.board);

    return drawnTile;
  }

  getCurrentTile() {
    return this.currentTile;
  }

  getBoard() {
    return this.board.getBoard();
  }

  getCurrentPlayer() {
    return this.players[this.turn];
  }

  getAllPlayers() {
    return this.players.map((player) => player.json());
  }

  getPlayerOf(username: string) {
    return _.find(this.getAllPlayers(), { username: username });
  }

  changePlayerTurn() {
    this.turn = (this.turn + 1) % this.players.length;
  }

  placeATile(position: Position) {
    if (this.board.isTilePlaceable(this.currentTile, position)) {
      this.tilePlacedAt = position;
      this.board.placeTile(this.currentTile!, position);
      this.scoreBoard.score(this.tilePlacedAt);
      this.currentTile = null;
      this.getCurrentPlayer().movesStack.push(position);
      this.lastPlacedTilePosition = position;

      return { isPlaced: true };
    }
    return { isPlaced: false };
  }

  private updateMeeple(subGrid: Sides | Center, player: Player, pos: Position) {
    const meeple = this.tileBoxes.getCell(pos)!.meeple;
    meeple.region = subGrid;
    meeple.color = player.meepleColor;
    meeple.playerName = player.username;
  }

  placeAMeeple(subGrid: Sides | Center) {
    const player = this.getCurrentPlayer();
    if (!this.tilePlacedAt || player.noOfMeeples < 1) {
      return { isPlaced: false };
    }
    const status = this.scoreBoard.placeMeeple(
      this.tilePlacedAt,
      player.username,
      subGrid,
    );
    if (status.isPlaced) {
      this.updateMeeple(subGrid, player, this.tilePlacedAt);
      this.scoreBoard.score(this.tilePlacedAt);
      player.noOfMeeples -= 1;
      this.changePlayerTurn();
    }

    return status;
  }

  state() {
    return {
      board: this.getBoard(),
      currentPlayer: this.getCurrentPlayer().json(),
      currentTile: this.currentTile,
      players: this.getAllPlayers(),
      remainingTiles: this.getRemainingTiles(),
    };
  }

  getClaimables() {
    if (this.tilePlacedAt) {
      const { row, col } = this.tilePlacedAt;
      const tileBox: TileBox = this.board.getBoard()[row][col];
      const unclaimables = new Set(["field", "roadEnd"]);
      const regions = Object.entries(tileBox.occupiedRegion);

      return regions.reduce((claimables: Sides[], [side, obj]) => {
        if (
          !obj.feature ||
          unclaimables.has(obj.feature) ||
          obj.occupiedBy.size > 0
        ) {
          return claimables;
        }
        claimables.push(side as Sides);
        return claimables;
      }, []);
    }
  }

  getRemainingTiles() {
    return this.tileManager.remainingTile();
  }

  lastPlacedTilePositionOf(username: string): Position | null {
    const player = this.players.find((player) => player.username === username);

    return player?.movesStack.peek() ?? null;
  }

  getLastPlacedTilePosition(): Position {
    return this.lastPlacedTilePosition;
  }
}
