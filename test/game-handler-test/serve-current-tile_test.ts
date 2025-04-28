import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { Tile } from "../../src/models/models.ts";
import {
  createDummyPlayers,
  createDummyTile,
  dummyTiles,
} from "../dummy-data.ts";
import { createTestApp } from "./handle-place-meeple_test.ts";

describe("serveCurrentTile", () => {
  it("should return null if tile didn't draw", async () => {
    const { app } = createTestApp(createDummyPlayers(), dummyTiles());
    const response = await app.request("/game/current-tile", {
      headers: { cookie: "room-id=1;" },
    });

    assertEquals(await response.json(), null);
  });

  it("should return current tile if current player drew tile", async () => {
    const tiles: Tile[] = [createDummyTile("0", ["c", "c", "c", "c"], "c")];
    const { app, game } = createTestApp(createDummyPlayers(), tiles);

    game.drawATile();

    const currentTileJSON = tiles.at(0);
    const response = await app.request("/game/current-tile", {
      headers: { cookie: "room-id=1;" },
    });
    assertEquals(await response.json(), currentTileJSON);
  });
});
