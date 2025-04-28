import { createDummyPlayers } from "../dummy-data.ts";
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { createTestApp } from "./handle-place-meeple_test.ts";

describe("testing the serve valid position function", () => {
  it("should return an object containing an array of placeable tiles and an array of unlocked tiles ", async () => {
    const { app } = createTestApp(createDummyPlayers(), []);

    const response = await app.request("/game/valid-positions", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    assertEquals(response.status, 200);
    assertEquals(await response.json(), {
      placablePositions: [],
      unlockedPositions: [
        {
          col: 42,
          row: 41,
        },
        {
          col: 41,
          row: 42,
        },
        {
          col: 43,
          row: 42,
        },
        {
          col: 42,
          row: 43,
        },
      ],
    });
  });
});
