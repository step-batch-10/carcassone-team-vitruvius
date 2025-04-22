import {
  createDummyPlayers,
  dummyTiles,
} from "../../src/models/game/dummy-data-for-test.ts";

import { Carcassonne } from "../../src/models/game/carcassonne.ts";
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createApp from "../../src/app.ts";
import { Tile, User } from "../../src/models/types/models.ts";
import RoomManager from "../../src/models/room/room-manager.ts";

describe("testing player Status", () => {
  it("should return the data of the current player", async () => {
    const sessions = new Map<string, string>();
    const users = new Map<string, User>();
    sessions.set("sId", "uId");
    users.set("uId", { username: "user1", roomID: null });
    const roomManager = new RoomManager(
      () => "1",
      () => () => "red",
    );
    const games = new Map<string, Carcassonne>();
    games.set(
      "1",
      Carcassonne.initGame(
        createDummyPlayers(),
        (arr: Tile[]): Tile[] => arr,
        dummyTiles,
      ),
    );

    const appContext = { sessions, users, roomManager, games };
    const app = createApp(appContext);

    const request = new Request("http://localhost/game/self", {
      headers: { cookie: "room-id=1; session-id=sId" },
    });

    const playerData = {
      username: "user1",
      roomId: "121",
      noOfMeeples: 7,
      points: 0,
      meepleColor: "black",
      isHost: true,
    };
    const response = await app.request(request);
    assertEquals(await response.json(), playerData);
    assertEquals(response.status, 200);
  });
});
