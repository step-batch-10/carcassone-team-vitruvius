import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createApp from "../../src/app.ts";
import Player from "../../src/models/room/player.ts";
import { AppContext, User } from "../../src/models/models.ts";
import { createTestApp } from "../handlers-test/handle-get-room_test.ts";
import { Carcassonne } from "../../src/models/game/carcassonne.ts";
import { createDummyPlayers } from "../dummy-data.ts";
import { stub } from "@std/testing/mock";
import { silentLogger } from "./silent-logger.ts";
import RoomManager from "../../src/models/room/room-manager.ts";

describe("serveLastPlacedTilePosition", () => {
  it("should return null if player didn't place any tile", async () => {
    const sessions = new Map<string, string>();
    const users = new Map<string, User>();
    const games = new Map<string, Carcassonne>();
    const roomManager = new RoomManager(
      () => "1",
      () => () => "red",
    );

    users.set("u1", { username: "user1", roomID: "1" });
    sessions.set("sId", "u1");
    const players = [
      new Player("user1", "red", true, "121"),
      new Player("user2", "green", false, "121"),
    ];
    const game = Carcassonne.initGame(players);
    games.set("121", game);

    const context: AppContext = { sessions, users, roomManager, games };
    const app = createApp(context, silentLogger);

    const request = new Request("http://localhost/game/last-placed-tile-pos", {
      headers: { cookie: "room-id=121; session-id=sId" },
    });
    const response = await app.request(request);
    assertEquals(response.status, 400);
    assertEquals(await response.json(), null);
  });

  it("should return last placed tile", async () => {
    const { app, games } = createTestApp();

    const game = Carcassonne.initGame(createDummyPlayers());
    games.set("121", game);

    stub(game, "lastPlacedTilePositionOf", () => ({ row: 0, col: 0 }));

    const request = new Request("http://localhost/game/last-placed-tile-pos", {
      headers: { cookie: "room-id=121; session-id=sId" },
    });
    const response = await app.request(request);

    assertEquals(response.status, 200);
    assertEquals(await response.json(), { row: 0, col: 0 });
  });
});
