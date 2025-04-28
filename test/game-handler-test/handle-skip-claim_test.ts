import { createDummyPlayers, dummyTiles } from "../dummy-data.ts";
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { createTestApp } from "./handle-place-meeple_test.ts";

describe("handlePlaceMeeple", () => {
  it("should change the current player when a player skips his turn", async () => {
    const { app } = createTestApp(createDummyPlayers(), dummyTiles());
    const position = { row: 42, col: 43 };
    await app.request("game/draw-tile", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    await app.request("/game/place-tile", {
      method: "PATCH",
      headers: {
        cookie: "room-id=1",
      },
      body: JSON.stringify(position),
    });

    const oldPlayerResponse = await app.request("game/current-player", {
      headers: {
        cookie: "room-id=1",
      },
    });

    const oldPlayer = await oldPlayerResponse.json();

    const response2 = await app.request("/game/skip-claim", {
      method: "PATCH",
      headers: {
        cookie: "room-id=1",
      },
    });

    const newPlayerResponse = await app.request("game/current-player", {
      headers: {
        cookie: "room-id=1",
      },
    });

    const newPlayer = await newPlayerResponse.json();

    assertEquals(response2.status, 200);
    assertEquals(oldPlayer, "user1");
    assertEquals(newPlayer, "user2");
  });
});
