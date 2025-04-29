import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { Carcassonne } from "../../src/models/game/carcassonne.ts";
import { createDummyPlayers } from "../dummy-data.ts";
import { stub } from "@std/testing/mock";
import { createTestApp } from "../handlers-test/handle-get-room_test.ts";

describe("serveLastPlayerTilePosition", () => {
  it("should return player's tile position", async () => {
    const players = createDummyPlayers();
    const game = Carcassonne.initGame(players);
    const lastPosition = { row: 0, col: 0 };

    stub(game, "getLastPlacedTilePosition", () => lastPosition);

    const { app, games } = createTestApp();
    games.set("121", game);

    const request = new Request("http://localhost/game/last-player-tile-pos", {
      headers: { cookie: "room-id=121; session-id=sId" },
    });
    const response = await app.request(request);
    assertEquals(response.status, 200);
    assertEquals(await response.json(), lastPosition);
  });
});
