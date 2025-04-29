import { Position } from "../models.ts";

class MovesStack {
  private readonly moves: Position[];

  constructor() {
    this.moves = [];
  }

  push(newMove: Position): number {
    return this.moves.push(newMove);
  }

  peek(): Position | null {
    return this.moves.at(-1) ?? null;
  }
}

export default MovesStack;
