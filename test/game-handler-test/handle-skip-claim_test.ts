import { createDummyPlayers, dummyTiles } from "../dummy-data.ts";
import { Carcassonne } from "../../src/models/game/carcassonne.ts";
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createApp from "../../src/app.ts";
import { AppContext, User } from "../../src/models/models.ts";
import RoomManager from "../../src/models/room/room-manager.ts";
import { silentLogger } from "./silent-logger.ts";

describe("handlePlaceMeeple", () => {
  it("should change the current player when a player skips his turn", async () => {
    const sessions = new Map<string, string>();
    const users = new Map<string, User>();
    const roomManager = new RoomManager(
      () => "1",
      () => () => "red"
    );
    const games = new Map<string, Carcassonne>();
    games.set(
      "1",
      Carcassonne.initGame(createDummyPlayers(), (arr) => arr, dummyTiles())
    );

    const context: AppContext = { sessions, users, roomManager, games };
    const position = { row: 42, col: 43 };
    const app = createApp(context, silentLogger);

    const response1 = await app.request("game/draw-tile", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    await response1.json();

    const request = new Request("http:localhost/game/place-tile", {
      method: "PATCH",
      headers: {
        cookie: "room-id=1",
      },
      body: JSON.stringify(position),
    });

    await app.request(request);

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
