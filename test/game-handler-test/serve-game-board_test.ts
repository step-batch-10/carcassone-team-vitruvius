import { createDummyPlayers, dummyTiles } from "../dummy-data.ts";
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { createTestApp } from "./handle-place-meeple_test.ts";

describe("handle the game board", () => {
  it("should return a game board when game id is valid", async () => {
    const { app } = createTestApp(createDummyPlayers(), []);
    const response = await app.request("/game/board", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    assertEquals(response.status, 200);
    assertEquals((await response.json()).length, 84);
  });

  it("should return a mess of invalid game id when game id is invalid", async () => {
    const { app } = createTestApp(createDummyPlayers(), dummyTiles(), "1");
    const response = await app.request("/game/board", {
      method: "GET",
      headers: {
        cookie: "room-id=2",
      },
    });

    assertEquals(response.status, 404);
    assertEquals(await response.json(), { desc: "invalid game Id" });
  });
});
