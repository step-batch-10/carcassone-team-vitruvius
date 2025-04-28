import {
  createDummyPlayers,
  createDummyTile,
  dummyTiles,
} from "../dummy-data.ts";
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { CardinalDegrees, Tile } from "../../src/models/models.ts";
import { createTestApp } from "./handle-place-meeple_test.ts";

describe("testing the handleRotateTile", () => {
  it("should return an object containing an rotatedTile if roomID is valid ", async () => {
    const { app, game } = createTestApp(createDummyPlayers(), dummyTiles());
    game.drawATile();

    const rotatedTileRes = await app.request("game/tile/rotate", {
      method: "PATCH",
      headers: {
        cookie: "room-id=1",
      },
    });

    const rotatedTile: Tile = await rotatedTileRes.json();

    assertEquals(
      rotatedTile,
      createDummyTile("2", ["f", "r", "f", "r"], "r", CardinalDegrees.ninety),
    );
  });

  it("should return an object containing desc key with value 'invalid game id' if roomID is invalid ", async () => {
    const { app, game } = createTestApp(createDummyPlayers(), []);
    game.drawATile();

    const rotatedTileRes = await app.request("game/tile/rotate", {
      method: "PATCH",
      headers: {
        cookie: "room-id=0",
      },
    });

    const actual = await rotatedTileRes.json();

    assertEquals(actual, { desc: "invalid game Id" });
  });
});
