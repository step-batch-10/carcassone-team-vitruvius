import { shuffler } from "./../../src/models/tile-Manager.ts";
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { TileManager } from "../../src/models/tile-Manager.ts";
import { Feature, Tile } from "../../src/models/models.ts";

describe("testing pickTile", () => {
  it("should return a tile from the top of the stack", () => {
    const tiles: Tile[] = [
      {
        id: "123",
        orientation: 0,
        hasShield: false,
        tileEdges: [Feature.ROAD, Feature.ROAD, Feature.ROAD, Feature.ROAD],
        tileCenter: Feature.FIELD,
      },
      {
        id: "124",
        orientation: 0,
        hasShield: false,
        tileEdges: [Feature.ROAD, Feature.ROAD, Feature.ROAD, Feature.ROAD],
        tileCenter: Feature.FIELD,
      },
    ];
    const tileManager = new TileManager(tiles, (tile) => tile);

    assertEquals(tileManager.pickTile(), tiles[0]);
  });

  it("should put a tile in bottom of the stack", () => {
    const tiles: Tile[] = [
      {
        id: "123",
        orientation: 0,
        hasShield: false,
        tileEdges: [Feature.ROAD, Feature.ROAD, Feature.ROAD, Feature.ROAD],
        tileCenter: Feature.FIELD,
      },
    ];

    const tile: Tile = {
      id: "124",
      orientation: 0,
      hasShield: false,
      tileEdges: [Feature.ROAD, Feature.ROAD, Feature.ROAD, Feature.ROAD],
      tileCenter: Feature.FIELD,
    };

    const tileManager = new TileManager(tiles, (tile) => tile);
    tileManager.pushTile(tile);
    assertEquals(tileManager.getStack().at(-1), tile);
  });

  it("when picked a tile from empty stack it shuld return null", () => {
    const tiles: Tile[] = [];

    const tileManager = new TileManager(tiles, (tile) => tile);

    assertEquals(tileManager.pickTile(), null);
  });

  it("when picked a tile the remaining tile should be less", () => {
    const tiles: Tile[] = [
      {
        id: "123",
        orientation: 0,
        hasShield: false,
        tileEdges: [Feature.ROAD, Feature.ROAD, Feature.ROAD, Feature.ROAD],
        tileCenter: Feature.FIELD,
      },
    ];

    const tileManager = new TileManager(tiles, (tile) => tile);
    tileManager.pickTile();

    assertEquals(tileManager.remainingTile(), 0);
  });
});

describe("testing shuffler", () => {
  it("should shuffle", () => {
    const actual = shuffler([
      {
        id: "123",
        orientation: 0,
        hasShield: false,
        tileEdges: [Feature.ROAD, Feature.ROAD, Feature.ROAD, Feature.ROAD],
        tileCenter: Feature.FIELD,
      },
    ]);
    const expected = [
      {
        id: "123",
        orientation: 0,
        hasShield: false,
        tileEdges: [Feature.ROAD, Feature.ROAD, Feature.ROAD, Feature.ROAD],
        tileCenter: Feature.FIELD,
      },
    ];
    assertEquals(actual, expected);
  });
});
