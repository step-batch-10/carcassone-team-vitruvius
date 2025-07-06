import { assert, assertEquals, assertFalse } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { Board } from "../../src/models/game/board.ts";
import { createATileBox, createDummyTile } from "../dummy-data.ts";

describe("Testing for creation of Board", () => {
  it("should create an empty board of given size with first tile already present", () => {
    const board = Board.create(1, 1);

    const dummyTile = createDummyTile("19", ["r", "c", "r", "f"], "r");
    dummyTile.id = "19";
    dummyTile.tileID = "44";

    assertEquals(board.getBoard().length, 1);
    assertEquals(board.getBoard()[0][0].tile, dummyTile);
  });
});

describe("Testing for isBoxUnlockToPlace", () => {
  it("should return true when corresponding tiles are present", () => {
    assert(Board.create(5, 5).isBoxUnlockToPlace({ row: 2, col: 3 }));
  });

  it("should return false no corresponding tile are present", () => {
    assertFalse(Board.create(5, 5).isBoxUnlockToPlace({ row: 1, col: 1 }));
  });

  it("should return false when row is out of the board", () => {
    assertFalse(Board.create(5, 5).isBoxUnlockToPlace({ row: -1, col: 1 }));
  });

  it("should return false when column is out of the board", () => {
    assertFalse(Board.create(5, 5).isBoxUnlockToPlace({ row: 1, col: -1 }));
  });

  it("should return false when column is out of the board", () => {
    assertFalse(Board.create(5, 5).isBoxUnlockToPlace({ row: 5, col: 1 }));
  });

  it("should return false when it is out of the board", () => {
    assertFalse(Board.create(5, 5).isBoxUnlockToPlace({ row: 1, col: 5 }));
  });
});

describe("Testing putTile", () => {
  describe("for Valid Positions", () => {
    it("should put the tile when it is in valid place", () => {
      const board = Board.create(5, 5);
      const tile = createDummyTile("2", ["r", "c", "r", "f"], "r");
      board.placeTile(tile, { row: 2, col: 3 });

      assertEquals(board.getTile({ row: 2, col: 3 }), tile);
    });
  });

  describe("invalid positions", () => {
    it("should not put the tile when it is putting the tile where no neighbour tile present", () => {
      const board = Board.create(5, 5);
      const tile = createDummyTile("2", ["r", "c", "r", "f"], "r");

      board.placeTile(tile, { row: 1, col: 1 });

      assertEquals(board.getTile({ row: 1, col: 1 }), null);
    });
  });

  describe("invalid matching positions", () => {
    it("road should not match with monastery (invalid position right)", () => {
      const board = Board.create(5, 5);
      const tile = createDummyTile("2", ["m", "c", "r", "f"], "r");
      board.placeTile(tile, { row: 2, col: 3 });

      assertEquals(board.getTile({ row: 2, col: 3 }), null);
    });

    it("field should not match with monastery (invalid position top)", () => {
      const board = Board.create(5, 5);
      const tile = createDummyTile("2", ["m", "c", "r", "r"], "r");
      board.placeTile(tile, { row: 1, col: 2 });

      assertEquals(board.getTile({ row: 1, col: 2 }), null);
    });

    it("road should not match with field (invalid position left)", () => {
      const board = Board.create(5, 5);
      const tile = createDummyTile("2", ["m", "c", "f", "r"], "r");
      board.placeTile(tile, { row: 2, col: 1 });

      assertEquals(board.getTile({ row: 2, col: 1 }), null);
    });

    it("road should not place with monastery (invalid position bottom)", () => {
      const board = Board.create(5, 5);
      const tile = createDummyTile("2", ["m", "r", "f", "r"], "r");
      board.placeTile(tile, { row: 3, col: 2 });

      assertEquals(board.getTile({ row: 3, col: 2 }), null);
    });
  });
});

describe("Testing placing of tile", () => {
  it("should return when the tile being placed outside the board", () => {
    const board = Board.create(5, 5);
    const tile = createDummyTile("2", ["m", "r", "f", "r"], "r");
    board.placeTile(tile, { row: 6, col: 6 });

    assertFalse(board.getTile({ row: 6, col: 6 }));
  });
});

describe("Testing isTilePlacable", () => {
  it("should return false if there is no tile", () => {
    assertFalse(Board.create(5, 5).isTilePlaceable(null, { row: 1, col: 1 }));
  });

  it("should return false if the position is not unlocked", () => {
    const board = Board.create(5, 5);

    const tile = createDummyTile("2", ["f", "f", "f", "f"], "m");

    // Unlocked positions are [{row:1, col:2}, {row:2, col:1}, {row:2, col:3}, {row:3, col:2}]
    // Locked position is {row: 2, col: 2}(center of the board)

    assertFalse(board.isTilePlaceable(tile, { row: 0, col: 0 }));
    assertFalse(board.isTilePlaceable(tile, { row: 0, col: 1 }));
    assertFalse(board.isTilePlaceable(tile, { row: 0, col: 2 }));
    assertFalse(board.isTilePlaceable(tile, { row: 0, col: 3 }));
    assertFalse(board.isTilePlaceable(tile, { row: 0, col: 4 }));

    assertFalse(board.isTilePlaceable(tile, { row: 1, col: 0 }));
    assertFalse(board.isTilePlaceable(tile, { row: 1, col: 1 }));
    assertFalse(board.isTilePlaceable(tile, { row: 1, col: 3 }));
    assertFalse(board.isTilePlaceable(tile, { row: 1, col: 4 }));

    assertFalse(board.isTilePlaceable(tile, { row: 2, col: 0 }));
    assertFalse(board.isTilePlaceable(tile, { row: 2, col: 4 }));

    assertFalse(board.isTilePlaceable(tile, { row: 3, col: 0 }));
    assertFalse(board.isTilePlaceable(tile, { row: 3, col: 1 }));
    assertFalse(board.isTilePlaceable(tile, { row: 3, col: 3 }));
    assertFalse(board.isTilePlaceable(tile, { row: 3, col: 4 }));

    assertFalse(board.isTilePlaceable(tile, { row: 4, col: 0 }));
    assertFalse(board.isTilePlaceable(tile, { row: 4, col: 1 }));
    assertFalse(board.isTilePlaceable(tile, { row: 4, col: 2 }));
    assertFalse(board.isTilePlaceable(tile, { row: 4, col: 3 }));
    assertFalse(board.isTilePlaceable(tile, { row: 4, col: 4 }));
  });

  it("should return true if the tile can be placed", () => {
    const tile = createDummyTile("2", ["f", "f", "f", "f"], "m");
    const tileBox = createATileBox();
    tileBox.tile = tile;

    const board = Board.create(5, 5, () => tileBox);

    // Tile can be placed in the following positions
    // [{row:1, col:2}, {row:2, col:1}, {row:2, col:3}, {row:3, col:2}]
    // Locked position is {row: 2, col: 2}(center of the board)([r, c, r, f], r)

    assert(board.isTilePlaceable(tile, { row: 1, col: 2 }));
    assert(board.isTilePlaceable(tile, { row: 2, col: 1 }));
    assert(board.isTilePlaceable(tile, { row: 2, col: 3 }));
    assert(board.isTilePlaceable(tile, { row: 3, col: 2 }));
  });

  it("should return false when the given position has a tile", () => {
    const monastery1 = createDummyTile("2", ["f", "f", "f", "f"], "m");
    const tileBox = createATileBox();
    tileBox.tile = monastery1;

    const board = Board.create(5, 5, () => tileBox);
    // Tile can be placed in the following positions
    // [{row:1, col:2}, {row:2, col:1}, {row:2, col:3}, {row:3, col:2}]
    // Locked position is {row: 2, col: 2}(center of the board)([r, c, r, f], r)

    assertFalse(board.isTilePlaceable(monastery1, { row: 2, col: 2 }));

    const monastery2 = createDummyTile("2", ["f", "f", "f", "f"], "m");
    assert(board.placeTile(monastery2, { row: 1, col: 2 }));
    assertFalse(board.isTilePlaceable(monastery2, { row: 1, col: 2 }));
  });
});
