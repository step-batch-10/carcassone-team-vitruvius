import { Board } from "./../../src/models/board.ts";
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { Feature, Tile, TileBox } from "../../src/models/models.ts";

export const createTile = (
  id: string,
  edges: [Feature, Feature, Feature, Feature],
  center: Feature
): Tile => {
  return {
    hasShield: false,
    id,
    orientation: 0,
    tileCenter: center,
    tileEdges: edges,
  };
};

const createATileBox = (
  id: string,
  edges: [Feature, Feature, Feature, Feature],
  center: Feature
): TileBox => {
  return {
    tile: createTile(id, edges, center),
    mapple: { color: null, playerName: null, region: null },
    occupiedRegion: {
      left: { feature: null, occupiedBy: [] },
      top: { feature: null, occupiedBy: [] },
      right: { feature: null, occupiedBy: [] },
      bottom: { feature: null, occupiedBy: [] },
      middle: { feature: null, occupiedBy: [] },
    },
  };
};

describe("testing static method 'create' of board to create board", () => {
  it("should create an empty board of given size with first tile already present", () => {
    const board = Board.create(1, 1);

    assertEquals(board.getBoard().length, 1);
    assertEquals(board.getBoard(), [
      [
        createATileBox(
          "1",
          [Feature.ROAD, Feature.CITY, Feature.ROAD, Feature.FIELD],
          Feature.ROAD
        ),
      ],
    ]);
  });
});

describe("testing putTile method of Board", () => {
  describe("valid positions", () => {
    it("should put the tile when it is valid place", () => {
      const board = Board.create(5, 5);
      const tile = createTile(
        "2",
        [Feature.ROAD, Feature.CITY, Feature.ROAD, Feature.FIELD],
        Feature.ROAD
      );
      const tilePlaced = board.putTile(tile, { row: 2, col: 3 });

      assertEquals(tilePlaced, true);
    });
  });

  describe("invalid positions", () => {
    it("should not put the tile when it is putting the tile where no neighbour tile present", () => {
      const board = Board.create(5, 5);
      const tile = createTile(
        "2",
        [Feature.ROAD, Feature.CITY, Feature.ROAD, Feature.FIELD],
        Feature.ROAD
      );

      const tilePlaced = board.putTile(tile, { row: 1, col: 1 });

      assertEquals(tilePlaced, false);
    });
  });

  describe("invalid matching positions", () => {
    it("road should not match with monastery (invalid position right)", () => {
      const board = Board.create(5, 5);
      const tile = createTile(
        "2",
        [Feature.MONASTERY, Feature.CITY, Feature.ROAD, Feature.FIELD],
        Feature.ROAD
      );
      const tilePlaced = board.putTile(tile, { row: 2, col: 3 });

      assertEquals(tilePlaced, false);
    });

    it("field should not match with monastery (invalid position top)", () => {
      const board = Board.create(5, 5);
      const tile = createTile(
        "2",
        [Feature.MONASTERY, Feature.CITY, Feature.ROAD, Feature.ROAD],
        Feature.ROAD
      );
      const tilePlaced = board.putTile(tile, { row: 1, col: 2 });

      assertEquals(tilePlaced, false);
    });

    it("road should not match with field (invalid position left)", () => {
      const board = Board.create(5, 5);
      const tile = createTile(
        "2",
        [Feature.MONASTERY, Feature.CITY, Feature.FIELD, Feature.ROAD],
        Feature.ROAD
      );
      const tilePlaced = board.putTile(tile, { row: 2, col: 1 });

      assertEquals(tilePlaced, false);
    });

    it("road should not place with monastery (invalid position bottom)", () => {
      const board = Board.create(5, 5);
      const tile = createTile(
        "2",
        [Feature.MONASTERY, Feature.ROAD, Feature.FIELD, Feature.ROAD],
        Feature.ROAD
      );
      const tilePlaced = board.putTile(tile, { row: 3, col: 2 });

      assertEquals(tilePlaced, false);
    });
  });
});
