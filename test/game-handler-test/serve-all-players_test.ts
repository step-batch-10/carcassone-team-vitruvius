import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { stub } from "@std/testing/mock";
import { createTestApp } from "./handle-place-meeple_test.ts";
import { createDummyPlayers, dummyTiles } from "../dummy-data.ts";

describe("serveAllPlayers", () => {
  it("should return all players data", async () => {
    const { app, game } = createTestApp(
      createDummyPlayers(),
      dummyTiles(),
      "121",
    );

    const player1 = {
      username: "user1",
      roomID: "121",
      noOfMeeples: 2,
      points: 0,
      meepleColor: "red",
      isHost: true,
    };

    stub(game, "getAllPlayers", () => [player1]);

    const response = await app.request("/game/players", {
      headers: { cookie: "room-id=121" },
    });

    const playersJSON = await response.json();

    assertEquals(response.status, 200);
    assertEquals(playersJSON, [player1]);
  });
});
