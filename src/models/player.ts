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
}

export default Player;
