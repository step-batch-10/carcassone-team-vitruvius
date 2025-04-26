import { Board } from "../../src/models/game/board.ts";
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { createDummyPlayers, createDummyTile } from "../dummy-data.ts";
import { Feature } from "../../src/models/models.ts";

describe("Testing for creation of Board", () => {
  it("should create an empty board of given size with first tile already present", () => {
    const board = Board.create(1, 1);

    const dummyTile = createDummyTile("1", ["r", "c", "r", "f"], "r");
    dummyTile.id = "19";
    dummyTile.tileID = "44";

    assertEquals(board.getBoard().length, 1);
    assertEquals(board.getBoard()[0][0].tile, dummyTile);
  });
});

describe("Testing for isBoxUnlockToPlace", () => {
  it("should return true when it have any of corresponding tile present", () => {
    const board = Board.create(5, 5);
    const isPlaceable = board.isBoxUnlockToPlace({ row: 2, col: 3 });

    assertEquals(isPlaceable, true);
  });

  it("should return false when it have no corresponding tile present", () => {
    const board = Board.create(5, 5);
    const isPlaceable = board.isBoxUnlockToPlace({ row: 1, col: 1 });

    assertEquals(isPlaceable, false);
  });

  it("should return false when it is out of the board", () => {
    const board = Board.create(5, 5);
    const isPlaceable = board.isBoxUnlockToPlace({ row: -1, col: 1 });

    assertEquals(isPlaceable, false);
  });

  it("should return false when it is out of the board", () => {
    const board = Board.create(5, 5);
    const isPlaceable = board.isBoxUnlockToPlace({ row: 1, col: -1 });

    assertEquals(isPlaceable, false);
  });

  it("should return false when it is out of the board", () => {
    const board = Board.create(5, 5);
    const isPlaceable = board.isBoxUnlockToPlace({ row: 5, col: 1 });

    assertEquals(isPlaceable, false);
  });

  it("should return false when it is out of the board", () => {
    const board = Board.create(5, 5);
    const isPlaceable = board.isBoxUnlockToPlace({ row: 1, col: 5 });

    assertEquals(isPlaceable, false);
  });
});

describe("testing putTile method of Board", () => {
  describe("valid positions", () => {
    it("should put the tile when it is valid place", () => {
      const board = Board.create(5, 5);
      const tile = createDummyTile("2", ["r", "c", "r", "f"], "r");
      board.placeTile(tile, { row: 2, col: 3 });

      assertEquals(board.getTile({ row: 2, col: 3 }), {
        hasShield: false,
        id: "2",
        orientation: 0,
        tileCenter: Feature.ROAD,
        tileEdges: [Feature.ROAD, Feature.CITY, Feature.ROAD, Feature.FIELD],
        tileID: "0",
      });
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

describe("testing placing of tile", () => {
  it("should return when the tile being placed outside the board", () => {
    const board = Board.create(5, 5);
    const tile = createDummyTile("2", ["m", "r", "f", "r"], "r");
    board.placeTile(tile, { row: 6, col: 6 });

    assertEquals(board.getTile({ row: 6, col: 6 }), undefined);
  });
});

describe("testing isTilePlacable", () => {
  it("should return false if there is no tile", () => {
    const board = Board.create(5, 5);

    const tilePlaced = board.isTilePlaceable(null, { row: 1, col: 1 });

    assertEquals(tilePlaced, false);
  });
});

describe("score", () => {
  it("should return invalid position when no position given", () => {
    const board = Board.create(5, 5);
    assertEquals(board.score(undefined, createDummyPlayers()), {
      desc: "invalid position",
    });
  });
});
