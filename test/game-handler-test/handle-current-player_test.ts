import {
  dummyTiles,
  createDummyPlayers,
} from "../../src/models/game/dummy-data-for-test.ts";

import { Carcassonne } from "../../src/models/game/carcassone.ts";
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createApp from "../../src/app.ts";
import { AppContext, Tile, User } from "../../src/models/types/models.ts";
import RoomManager from "../../src/models/room/room-manager.ts";

describe("testing current Player", () => {
  it("should return current  player Name", async () => {
    const sessions = new Map<string, string>();
    const users = new Map<string, User>();
    const roomManager = new RoomManager(
      () => "1",
      () => () => "red"
    );
    const games = new Map<string, Carcassonne>();
    games.set(
      "1",
      Carcassonne.initGame(
        createDummyPlayers(),
        (arr: Tile[]): Tile[] => arr,
        dummyTiles
      )
    );

    const context: AppContext = { sessions, users, roomManager, games };

    const app = createApp(context);
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
