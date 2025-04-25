import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createApp from "../../src/app.ts";
import { silentLogger } from "./silent-logger.ts";
import { User } from "../../src/models/models.ts";
import RoomManager from "../../src/models/room/room-manager.ts";
import { Carcassonne } from "../../src/models/game/carcassonne.ts";
import { createDummyPlayers } from "../dummy-data.ts";
import { stub } from "@std/testing/mock";

describe("serveAllPlayers", () => {
  it("should return all players data", async () => {
    const users = new Map<string, User>();
    const sessions = new Map<string, string>();
    const roomManager = new RoomManager(
      () => "1",
      () => () => "red",
    );
    const games = new Map<string, Carcassonne>();
    const game = Carcassonne.initGame(createDummyPlayers());
    const player1 = {
      username: "user1",
      roomID: "121",
      noOfMeeples: 2,
      points: 0,
      meepleColor: "red",
      isHost: true,
    };

    stub(game, "getAllPlayers", () => [player1]);
    games.set("121", game);

    const appContext = { sessions, users, roomManager, games };
    const app = createApp(appContext, silentLogger);

    const request = new Request("http://localhost/game/players", {
      headers: { cookie: "room-id=121" },
    });

    const response = await app.request(request);
    const playersJSON = await response.json();

    assertEquals(response.status, 200);
    assertEquals(playersJSON, [player1]);
  });
});
