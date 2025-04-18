import { Board } from "./board.ts";
import Player from "./player.ts";

export class Carcassonne {
  private readonly board: Board;
  private readonly players: Player[];
  private readonly currentPlayer: Player;
  // private readonly currentTile: Tile;

  constructor(players: Player[]) {
    this.players = players;
    this.currentPlayer = this.players[0];
    this.board = Board.create(168, 168);
  }

  getBoard() {
    return this.board.getBoard();
  }
}
