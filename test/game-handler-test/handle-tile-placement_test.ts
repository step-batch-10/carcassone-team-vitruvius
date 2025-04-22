import {
  createDummyPlayers,
  dummyTiles,
} from "../../src/models/game/dummy-data-for-test.ts";
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
      () => () => "red",
    );
    const games = new Map<string, Carcassonne>();
    games.set(
      "1",
      Carcassonne.initGame(createDummyPlayers(), (arr) => arr, dummyTiles),
    );

    const context: AppContext = { sessions, users, roomManager, games };
    const position = { row: 42, col: 43 };
    const app = createApp(context);

    const response3 = await app.request("game/draw-tile", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    const drawnTile = await response3.json();
    const request = new Request("http:localhost/game/place-tile", {
      method: "PATCH",
      headers: {
        cookie: "room-id=1",
      },
      body: JSON.stringify(position),
    });

    const response = await app.request(request);

    assertEquals(response.status, 201);
    const response2 = await app.request("game/board", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });
    const board = await response2.json();

    assertEquals(board[42][43].tile, drawnTile);
  });

  it("should return an status code of 400 and a status desc when tile is not placeable ", async () => {
    const sessions = new Map<string, string>();
    const users = new Map<string, User>();
    const roomManager = new RoomManager(
      () => "1",
      () => () => "red",
    );
    const games = new Map<string, Carcassonne>();
    games.set(
      "1",
      Carcassonne.initGame(createDummyPlayers(), (arr) => arr, dummyTiles),
    );

    const context: AppContext = { sessions, users, roomManager, games };
    const position = { row: 40, col: 43 };
    const app = createApp(context);

    const response3 = await app.request("game/draw-tile", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    await response3.json();
    const request = new Request("http:localhost/game/place-tile", {
      method: "PATCH",
      headers: {
        cookie: "room-id=1",
      },
      body: JSON.stringify(position),
    });

    const response = await app.request(request);

    assertEquals(response.status, 400);
    assertEquals(await response.json(), { desc: "invalid tile to place" });
    const response2 = await app.request("game/board", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });
    const board = await response2.json();

    assertEquals(board[40][43].tile, null);
  });
});
