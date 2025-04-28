import { createDummyPlayers, dummyTiles } from "../dummy-data.ts";

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { createTestApp } from "./handle-place-meeple_test.ts";

describe("draw a tile handler", () => {
  it("should return a valid drawn tile", async () => {
    const { app } = createTestApp(createDummyPlayers(), dummyTiles());

    const response = await app.request("/game/draw-tile", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    assertEquals(response.status, 200);
    assertEquals(await response.json(), {
      hasShield: false,
      id: "2",
      orientation: 0,
      tileCenter: "road",
      tileEdges: ["road", "field", "road", "field"],
      tileID: "0",
    });
  });
});
