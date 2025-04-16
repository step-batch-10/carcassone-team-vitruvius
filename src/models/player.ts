interface PlayerJson {
  username: string;
  noOfMeeples: number;
  points: number;
  meepleColor: string;
  isHost: boolean;
}

class Player {
  readonly username: string;
  noOfMeeples: number;
  points: number;
  readonly meepleColor: string;
  readonly isHost: boolean;

  constructor(
    username: string,
    meepleCount: number,
    meepleColor: string,
    isHost: boolean
  ) {
    this.username = username;
    this.noOfMeeples = meepleCount;
    this.points = 0;
    this.meepleColor = meepleColor;
    this.isHost = isHost;
  }

  json(): PlayerJson {
    return {
      username: this.username,
      noOfMeeples: this.noOfMeeples,
      points: this.points,
      meepleColor: this.meepleColor,
      isHost: this.isHost,
    };
  }
}

export default Player;
