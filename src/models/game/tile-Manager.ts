import { Tile } from "../types/models.ts";

export const shuffler = (tiles: Tile[]): Tile[] => {
  return tiles.sort(() => Math.random() - 0.5);
};

export class TileStacker {
  private readonly tilesStack;
  constructor(tiles: Tile[], tileShuffler: (tiles: Tile[]) => Tile[]) {
    const shuffledTile = tileShuffler([...tiles]);
    this.tilesStack = shuffledTile;
  }

  getStack() {
    return this.tilesStack;
  }

  pushTile(tile: Tile) {
    this.tilesStack.push(tile);
  }

  pickTile(): Tile | null {
    const pickedTile = this.tilesStack.shift();

    return pickedTile || null;
  }

  remainingTile(): number {
    return this.tilesStack.length;
  }
}
