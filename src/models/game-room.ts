import { Carcassonne } from "./models.ts";
import Player from "./player.ts";
import { GameRoomJson, GameStatus } from "./models.ts";
type stringIdentity = () => string;

class GameRoom {
  private maxPlayers: number;
  private game: null | Carcassonne;
  readonly host: string;
  private players: Player[];
  private noOfMeeples: number;
  private meepleColorGenerator: stringIdentity;
  readonly gameStatus: GameStatus;
  readonly roomID: string;

  constructor(
    maxPlayers: number,
    host: string,
    roomID: string,
    meepleColorGenerator: stringIdentity
  ) {
    this.roomID = roomID;
    this.host = host;
    this.noOfMeeples = 7;
    this.maxPlayers = maxPlayers;
    this.game = null;
    this.players = [];
    this.gameStatus = GameStatus.WAITING;
    this.meepleColorGenerator = meepleColorGenerator;
    this.addPlayer(host, true);
  }

  private isMaxPlayerLimitExtended(): boolean {
    return this.maxPlayers === this.players.length;
  }

  private joinPlayerInGame(playerName: string, isHost: boolean) {
    const newPlayer = new Player(
      playerName,
      this.noOfMeeples,
      this.meepleColorGenerator(),
      isHost,
      this.roomID
    );

    this.players.push(newPlayer);

    return newPlayer;
  }

  addPlayer(playerName: string, isHost: boolean = false): Player | null {
    if (this.isMaxPlayerLimitExtended()) {
      return null;
    }

    return this.joinPlayerInGame(playerName, isHost);
  }

  totalJoinedPlayers(): number {
    return this.players.length;
  }

  json(): GameRoomJson {
    const playersJson = this.players.map((player) => player.json());

    return {
      maxPlayers: 3,
      players: playersJson,
      roomID: this.roomID,
      host: this.host,
      gameStatus: GameStatus.WAITING,
    };
  }
}

export default GameRoom;
