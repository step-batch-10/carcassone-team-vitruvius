import {
  dummyTiles,
  createDummyPlayers,
} from "./../../src/models/dummy-data-for-test.ts";

import { Carcassonne } from "./../../src/models/carcassone.ts";
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createApp from "../../src/app.ts";
import { AppContext, User } from "../../src/models/models.ts";
import RoomManager from "../../src/models/room-manager.ts";

describe("testing draw a tile handler", () => {
  it("should return a valid drawn tile", async () => {
    const sessions = new Map<string, string>();
    const users = new Map<string, User>();
    const roomManager = new RoomManager(
      () => "1",
      () => () => "red"
    );
    const games = new Map<string, Carcassonne>();
    games.set(
      "1",
      Carcassonne.initGame(createDummyPlayers(), (arr) => arr, dummyTiles)
    );

    const context: AppContext = { sessions, users, roomManager, games };

    const app = createApp(context);
    const request: Request = new Request("http:localhost/game/draw-tile", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    const response = await app.request(request);

    assertEquals(response.status, 200);
    assertEquals(await response.json(), {
      hasShield: false,
      id: "2",
      orientation: 0,
      tileCenter: "road",
      tileEdges: ["road", "field", "road", "field"],
    });
  });
});
