import { createDummyPlayers, dummyTiles } from "../dummy-data.ts";
import { Carcassonne } from "../../src/models/game/carcassonne.ts";
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createApp from "../../src/app.ts";
import { AppContext, User } from "../../src/models/types/models.ts";
import RoomManager from "../../src/models/room/room-manager.ts";
import { silentLogger } from "./silent-logger.ts";

describe("handlePlaceMeeple", () => {
  it("should place a meeple and return a response of status code 201 when a meeple is placed", async () => {
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

    const response2 = await app.request("/game/claim", {
      method: "PATCH",
      body: JSON.stringify({ side: "left" }),
      headers: {
        cookie: "room-id=1",
        "Content-Type": "application/json",
      },
    });

    assertEquals(response2.status, 201);
  });
  it("should not place a meeple and return a response of status code 400 when a meeple is placed incorrectly", async () => {
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

    await app.request("/game/claim", {
      method: "PATCH",
      body: JSON.stringify({ side: "left" }),
      headers: {
        cookie: "room-id=1",
        "Content-Type": "application/json",
      },
    });

    const response3 = await app.request("/game/claim", {
      method: "PATCH",
      body: JSON.stringify({ side: "left" }),
      headers: {
        cookie: "room-id=1",
        "Content-Type": "application/json",
      },
    });

    assertEquals(response3.status, 400);
  });
});
