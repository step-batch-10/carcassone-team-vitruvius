import { createDummyPlayers, dummyTiles } from "./../dummy-data.ts";

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { createTestApp } from "./handle-place-meeple_test.ts";

describe("testing player Status", () => {
  it("should return the data of the current player", async () => {
    const { app } = createTestApp(createDummyPlayers(), dummyTiles());

    const playerData = {
      username: "user1",
      roomID: "121",
      noOfMeeples: 7,
      points: 0,
      meepleColor: "black",
      isHost: true,
    };
    const response = await app.request("/game/self", {
      headers: { cookie: "room-id=1; session-id=sId" },
    });
    assertEquals(await response.json(), playerData);
    assertEquals(response.status, 200);
  });
});
