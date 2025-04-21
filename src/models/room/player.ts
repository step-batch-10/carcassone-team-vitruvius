import { PlayerJson } from "../ds/models.ts";
class Player {
  readonly username: string;
  readonly roomId;
  noOfMeeples: number;
  points: number;
  readonly meepleColor: string;
  readonly isHost: boolean;

  constructor(
    username: string,
    meepleColor: string,
    isHost: boolean,
    roomId: string
  ) {
    this.username = username;
    this.noOfMeeples = 7;
    this.points = 0;
    this.meepleColor = meepleColor;
    this.isHost = isHost;
    this.roomId = roomId;
  }

  json(): PlayerJson {
    return {
      username: this.username,
      noOfMeeples: this.noOfMeeples,
      points: this.points,
      meepleColor: this.meepleColor,
      isHost: this.isHost,
      roomID: this.roomId,
    };
  }
}

export default Player;
