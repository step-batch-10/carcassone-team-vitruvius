import { Carcassonne } from "./models.ts";
import Player from "./player.ts";

type stringIdentity = () => string;
enum GameStatus {
  WAITING = "waiting",
  IN_PLAY = "inPlay",
}

class GameRoom {
  private maxPlayers: number;
  private game: null | Carcassonne;
  readonly host: string;
  private players: Player[];
  private noOfMeeples: number;
  private meepleColorGenerator: stringIdentity;
  readonly gameStatus: GameStatus;
  readonly roomId: string;

  constructor(
    maxPlayers: number,
    host: string,
    roomId: string,
    meepleColorGenerator: stringIdentity
  ) {
    this.roomId = roomId;
    this.host = host;
    this.noOfMeeples = 7;
    this.maxPlayers = maxPlayers;
    this.game = null;
    this.players = [];
    this.gameStatus = GameStatus.WAITING;
    this.meepleColorGenerator = meepleColorGenerator;
    this.addPlayer(host, true);
  }

  addPlayer(playerName: string, isHost: boolean = false): Player {
    const newPlayer = new Player(
      playerName,
      this.noOfMeeples,
      this.meepleColorGenerator(),
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
