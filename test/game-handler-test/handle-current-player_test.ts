import { createDummyPlayers, dummyTiles } from "./../dummy-data.ts";

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { createTestApp } from "./handle-place-meeple_test.ts";

describe("testing current Player", () => {
  it("should return current  player Name", async () => {
    const { app } = createTestApp(createDummyPlayers(), dummyTiles());
    const request: Request = new Request("http:localhost/game/current-player", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    const response = await app.request(request);

    assertEquals(response.status, 200);
    assertEquals(await response.json(), "user1");
  });
});
