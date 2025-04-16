import { Carcassonne } from "./models.ts";
import Player from "./player.ts";

class GameRoom {
  maxPlayers: number;
  game: null | Carcassonne;
  players: Player[];
  noOfMeeples: number;
  readonly roomId: string;

  constructor(maxPlayers: number, host: string, roomId: string) {
    this.roomId = roomId;
    this.noOfMeeples = 7;
    this.maxPlayers = maxPlayers;
    this.game = null;
    this.players = [];
    this.addPlayer(host, true);
  }

  addPlayer(playerName: string, isHost: boolean = false): Player {
    const newPlayer = new Player(
      playerName,
      this.noOfMeeples,
      "red",
      isHost,
      this.roomId
    );

    this.players.push(newPlayer);

    return newPlayer;
  }

  totalJoinedPlayers(): number {
    return this.players.length;
  }
}

export default GameRoom;
