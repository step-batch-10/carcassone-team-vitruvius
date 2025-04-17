import { Board } from "./../../src/models/board.ts";
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

describe("testing static method 'create' of board to create board", () => {
  it("should create an empty board of given size with have tileBox", () => {
    const board = Board.create(1, 1);

    assertEquals(board.getBoard().length, 1);
    assertEquals(board.getBoard(), [
      [
        {
          tile: null,
          mapple: { color: null, playerName: null, region: null },
          occupiedRegion: {
            left: { feature: null, occupiedBy: [] },
            top: { feature: null, occupiedBy: [] },
            right: { feature: null, occupiedBy: [] },
            bottom: { feature: null, occupiedBy: [] },
            middle: { feature: null, occupiedBy: [] },
          },
        },
      ],
    ]);
  });
});
