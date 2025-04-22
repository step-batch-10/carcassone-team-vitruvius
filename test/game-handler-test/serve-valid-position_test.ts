import { createDummyPlayers } from "../../src/models/game/dummy-data-for-test.ts";
import { Carcassonne } from "../../src/models/game/carcassonne.ts"; 
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createApp from "../../src/app.ts";
import { AppContext, User } from "../../src/models/types/models.ts";
import RoomManager from "../../src/models/room/room-manager.ts";

describe("testing the serve valid position function", () => {
  it("should return an object containing an array of placeable tiles and an array of unlocked tiles ", async () => {
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
    const request: Request = new Request(
      "http:localhost/game/valid-positions",
      {
        method: "GET",
        headers: {
          cookie: "room-id=1",
        },
      }
    );

    const response = await app.request(request);

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
