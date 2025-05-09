import MovesStack from "../game/moves-stack.ts";
import { PlayerJson } from "../models.ts";
class Player {
  readonly username: string;
  readonly roomID;
  noOfMeeples: number;
  points: number;
  readonly meepleColor: string;
  readonly isHost: boolean;
  readonly movesStack: MovesStack;

  constructor(
    username: string,
    meepleColor: string,
    isHost: boolean,
    roomID: string,
  ) {
    this.username = username;
    this.noOfMeeples = 7;
    this.points = 0;
    this.meepleColor = meepleColor;
    this.isHost = isHost;
    this.roomID = roomID;
    this.movesStack = new MovesStack();
  }

  json(): PlayerJson {
    return {
      username: this.username,
      noOfMeeples: this.noOfMeeples,
      points: this.points,
      meepleColor: this.meepleColor,
      isHost: this.isHost,
      roomID: this.roomID,
    };
  }
}

export default Player;
