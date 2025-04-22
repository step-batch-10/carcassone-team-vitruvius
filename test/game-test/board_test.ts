import { Board } from "../../src/models/game/board.ts";
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { Feature } from "../../src/models/types/models.ts";
import {
  createATileBox,
  createTile,
} from "../../src/models/game/dummy-data-for-test.ts";

describe("testing static method 'create' of board to create board", () => {
  it("should create an empty board of given size with first tile already present", () => {
    const board = Board.create(1, 1);

    assertEquals(board.getBoard().length, 1);
    assertEquals(board.getBoard(), [
      [
        createATileBox(
          "1",
          [Feature.ROAD, Feature.CITY, Feature.ROAD, Feature.FIELD],
          Feature.ROAD,
        ),
      ],
    ]);
  });
});

describe("testing is isBoxUnlockToPlace", () => {
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
      const tile = createTile(
        "2",
        [Feature.ROAD, Feature.CITY, Feature.ROAD, Feature.FIELD],
        Feature.ROAD,
      );
      board.placeTile(tile, { row: 2, col: 3 });

      assertEquals(board.getTile({ row: 2, col: 3 }), {
        hasShield: false,
        id: "2",
        orientation: 0,
        tileCenter: "road",
        tileEdges: ["road", "city", "road", "field"],
      });
    });
  });

  describe("invalid positions", () => {
    it("should not put the tile when it is putting the tile where no neighbour tile present", () => {
      const board = Board.create(5, 5);
      const tile = createTile(
        "2",
        [Feature.ROAD, Feature.CITY, Feature.ROAD, Feature.FIELD],
        Feature.ROAD,
      );

      board.placeTile(tile, { row: 1, col: 1 });

      assertEquals(board.getTile({ row: 1, col: 1 }), null);
    });
  });

  describe("invalid matching positions", () => {
    it("road should not match with monastery (invalid position right)", () => {
      const board = Board.create(5, 5);
      const tile = createTile(
        "2",
        [Feature.MONASTERY, Feature.CITY, Feature.ROAD, Feature.FIELD],
        Feature.ROAD,
      );
      board.placeTile(tile, { row: 2, col: 3 });

      assertEquals(board.getTile({ row: 2, col: 3 }), null);
    });

    it("field should not match with monastery (invalid position top)", () => {
      const board = Board.create(5, 5);
      const tile = createTile(
        "2",
        [Feature.MONASTERY, Feature.CITY, Feature.ROAD, Feature.ROAD],
        Feature.ROAD,
      );
      board.placeTile(tile, { row: 1, col: 2 });

      assertEquals(board.getTile({ row: 1, col: 2 }), null);
    });

    it("road should not match with field (invalid position left)", () => {
      const board = Board.create(5, 5);
      const tile = createTile(
        "2",
        [Feature.MONASTERY, Feature.CITY, Feature.FIELD, Feature.ROAD],
        Feature.ROAD,
      );
      board.placeTile(tile, { row: 2, col: 1 });

      assertEquals(board.getTile({ row: 2, col: 1 }), null);
    });

    it("road should not place with monastery (invalid position bottom)", () => {
      const board = Board.create(5, 5);
      const tile = createTile(
        "2",
        [Feature.MONASTERY, Feature.ROAD, Feature.FIELD, Feature.ROAD],
        Feature.ROAD,
      );
      board.placeTile(tile, { row: 3, col: 2 });

      assertEquals(board.getTile({ row: 3, col: 2 }), null);
    });
  });
});

describe("testing isTilePlacable", () => {
  it("should return false if there is no tile", () => {
    const board = Board.create(5, 5);

    const tilePlaced = board.isTilePlaceable(null, { row: 1, col: 1 });

    assertEquals(tilePlaced, false);
  });
});
