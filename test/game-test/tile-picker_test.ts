import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { shuffler, TileStacker } from "../../src/models/game/tiles.ts";
import { Tile } from "../../src/models/models.ts";
import { createDummyTile } from "../dummy-data.ts";

describe("testing pickTile", () => {
  it("should return a tile from the top of the stack", () => {
    const tiles: Tile[] = [
      createDummyTile("123", ["r", "r", "r", "r"], "f"),
      createDummyTile("124", ["r", "r", "r", "r"], "f"),
    ];
    const tileManager = new TileStacker(tiles, (tile) => tile);

    assertEquals(tileManager.pickTile(), tiles[0]);
  });

  it("should put a tile in bottom of the stack", () => {
    const tiles: Tile[] = [createDummyTile("123", ["r", "r", "r", "r"], "f")];

    const tile: Tile = createDummyTile("124", ["r", "r", "r", "r"], "f");

    const tileManager = new TileStacker(tiles, (tile) => tile);
    tileManager.pushTile(tile);
    assertEquals(tileManager.getStack().at(-1), tile);
  });

  it("when picked a tile from empty stack it shuld return null", () => {
    const tiles: Tile[] = [];

    const tileManager = new TileStacker(tiles, (tile) => tile);

    assertEquals(tileManager.pickTile(), null);
  });

  it("when picked a tile the remaining tile should be less", () => {
    const tiles: Tile[] = [createDummyTile("123", ["r", "r", "r", "r"], "f")];

    const tileManager = new TileStacker(tiles, (tile) => tile);
    tileManager.pickTile();

    assertEquals(tileManager.remainingTile(), 0);
  });
});

describe("testing shuffler", () => {
  it("should shuffle", () => {
    const actual = shuffler([
      createDummyTile("123", ["r", "r", "r", "r"], "f"),
    ]);
    const expected = [createDummyTile("123", ["r", "r", "r", "r"], "f"), ,];
    assertEquals(actual, expected);
  });
});
