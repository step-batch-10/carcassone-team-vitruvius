import { createTile } from "./../../test/models-test/board_test.ts";
import { TileManager, shuffler } from "./tile-Manager.ts";
import { Board } from "./board.ts";
import Player from "./player.ts";
import { Feature, Tile } from "./models.ts";

const tiles = [
  createTile(
    "2",
    [Feature.ROAD, Feature.FIELD, Feature.ROAD, Feature.MONASTERY],
    Feature.ROAD
  ),

  createTile(
    "3",
    [Feature.ROAD, Feature.FIELD, Feature.ROAD, Feature.MONASTERY],
    Feature.ROAD
  ),
];
export class Carcassonne {
  private readonly board: Board;
  private readonly players: Player[];
  private turn: number;
  private tileManager: TileManager;
  private currentTile: Tile | null;

  constructor(players: Player[], tileManager: TileManager, board: Board) {
    this.players = players;
    this.turn = 0;
    this.board = board;
    this.currentTile = null;
    this.tileManager = tileManager;
  }

  static initGame(players: Player[]) {
    const tileManager = new TileManager(tiles, shuffler);
    const board = Board.create(84, 84);

    return new Carcassonne(players, tileManager, board);
  }

  getBoard() {
    return this.board.getBoard();
  }

  getCurrentPlayer() {
    return this.players[this.turn];
  }

  changePlayerTurn() {
    this.turn = (this.turn + 1) % this.players.length;
  }

  isValidTileToPlace(_tile: Tile) {
    return true;
  }

  drawATile(): Tile | null {
    const drawnTile = this.tileManager.pickTile();

    if (drawnTile && !this.isValidTileToPlace(drawnTile)) {
      this.tileManager.pushTile(drawnTile);
      return this.drawATile();
    }
    this.currentTile = drawnTile;
    return drawnTile;
  }

  getCurrentTile() {
    return this.currentTile;
  }
}
