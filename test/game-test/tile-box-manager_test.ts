import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { TileBoxManager } from "../../src/models/game/tiles.ts";
import { createATileBox } from "../dummy-data.ts";

describe("Test for adjacentPositionArray", () => {
  it("should return the array of adjacent positions", () => {
    const boxes = [[createATileBox()]];
    const manager = new TileBoxManager(boxes);

    assertEquals(manager.adjacentPositionArray({ row: 5, col: 5 }), [
      { row: 5, col: 4 },
      { row: 5, col: 6 },
      { row: 4, col: 5 },
      { row: 6, col: 5 },
      { row: 4, col: 4 },
      { row: 4, col: 6 },
      { row: 6, col: 4 },
      { row: 6, col: 6 },
    ]);
  });
});
