import { createDummyPlayers } from "../../src/models/dummy-data-for-test.ts";
import { Carcassonne } from "./../../src/models/carcassone.ts";
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createApp from "../../src/app.ts";
import { AppContext, User } from "../../src/models/models.ts";
import RoomManager from "../../src/models/room-manager.ts";

describe("handle the game board", () => {
  it("should return a game board when game id is valid", async () => {
    const sessions = new Map<string, string>();
    const users = new Map<string, User>();
    const roomManager = new RoomManager(
      () => "1",
      () => () => "red"
    );
    const games = new Map<string, Carcassonne>();
    games.set("1", Carcassonne.initGame(createDummyPlayers()));

    const context: AppContext = { sessions, users, roomManager, games };

    const app = createApp(context);
    const request: Request = new Request("http:localhost/game/board", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    const response = await app.request(request);

    assertEquals(response.status, 200);
    assertEquals((await response.json()).length, 84);
  });

  it("should return a mess of invalid game id when game id is invalid", async () => {
    const sessions = new Map<string, string>();
    const users = new Map<string, User>();
    const roomManager = new RoomManager(
      () => "1",
      () => () => "red"
    );
    const games = new Map<string, Carcassonne>();
    games.set("1", Carcassonne.initGame(createDummyPlayers()));

    const context: AppContext = { sessions, users, roomManager, games };

    const app = createApp(context);
    const request: Request = new Request("http:localhost/game/board", {
      method: "GET",
      headers: {
        cookie: "room-id=2",
      },
    });

    const response = await app.request(request);

    assertEquals(response.status, 200);
    assertEquals(await response.json(), { desc: "invalid game Id" });
  });
});
