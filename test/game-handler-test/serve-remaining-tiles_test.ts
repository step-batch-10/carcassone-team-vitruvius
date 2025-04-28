import { createDummyPlayers, dummyTiles } from "./../dummy-data.ts";

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { createTestApp } from "./handle-place-meeple_test.ts";

describe("handle remaining tiles", () => {
  it("should return remaining tiles if tiles left", async () => {
    const { app } = createTestApp(createDummyPlayers(), dummyTiles());
    const response = await app.request("/game/remaining-tiles", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    const tilesLeft = await response.json();

    assertEquals(response.status, 200);
    assertEquals(tilesLeft, 4);
  });

  it("remaining tiles should be reduced by once tile is drawn", async () => {
    const { app } = createTestApp(createDummyPlayers(), dummyTiles());

    await app.request("/game/draw-tile", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    const response = await app.request("/game/remaining-tiles", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    const tilesLeft = await response.json();

    assertEquals(response.status, 200);
    assertEquals(tilesLeft, 3);
  });

  it("remaining tiles should be zero when there is no tiles left", async () => {
    const { app } = createTestApp(createDummyPlayers(), []);

    const response = await app.request("/game/remaining-tiles", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    const tilesLeft = await response.json();

    assertEquals(response.status, 200);
    assertEquals(tilesLeft, 0);
  });
});
