import { Carcassonne } from "./models.ts";
import Player from "./player.ts";

class GameRoom {
  maxPlayers: number;
  game: null | Carcassonne;
  players: Player[];
  noOfMeeples: number;

  constructor(maxPlayers: number, host: string) {
    this.noOfMeeples = 7;
    this.maxPlayers = maxPlayers;
    this.game = null;
    this.players = [new Player(host, 7, "red", true)];
  }

  addPlayer(playerName: string, isHost: boolean = false): Player {
    const newPlayer = new Player(playerName, this.noOfMeeples, "red", isHost);

    this.players.push(newPlayer);

    return newPlayer;
  }

  totalJoinedPlayers(): number {
    return this.players.length;
  }
}

export default GameRoom;
