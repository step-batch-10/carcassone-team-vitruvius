import { Carcassonne } from "../../src/models/game/carcassonne.ts";
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createApp from "../../src/app.ts";
import { AppContext, Tile, User } from "../../src/models/models.ts";
import RoomManager from "../../src/models/room/room-manager.ts";
import { silentLogger } from "./silent-logger.ts";
import { createDummyPlayers, dummyTiles } from "../dummy-data.ts";

describe("handleServeClaimables", () => {
  it("should return an array of sides", async () => {
    const sessions = new Map<string, string>();
    const users = new Map<string, User>();
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
        dummyTiles(),
      ),
    );

    const context: AppContext = { sessions, users, roomManager, games };

    const app = createApp(context, silentLogger);
    const request: Request = new Request("http:localhost/game/draw-tile", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    await app.request(request);

    await app.request("/game/place-tile", {
      method: "PATCH",
      headers: { cookie: "room-id=1" },
      body: JSON.stringify({ row: 42, col: 43 }),
    });

    const claimablesResponse = await app.request("/game/claimables", {
      headers: {
        cookie: "room-id=1",
      },
      method: "GET",
    });

    const claimables = await claimablesResponse.json();

    assertEquals(claimables, ["left", "right", "middle"]);
    assertEquals(claimablesResponse.status, 200);
  });
  it("should return an empty array", async () => {
    const sessions = new Map<string, string>();
    const users = new Map<string, User>();
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
        dummyTiles(),
      ),
    );

    const context: AppContext = { sessions, users, roomManager, games };

    const app = createApp(context, silentLogger);
    const request: Request = new Request("http:localhost/game/draw-tile", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    await app.request(request);

    await app.request("/game/place-tile", {
      method: "PATCH",
      headers: { cookie: "room-id=1" },
      body: JSON.stringify({ row: 42, col: 43 }),
    });

    await app.request("/game/claim", {
      method: "PATCH",
      body: JSON.stringify({ side: "left" }),
      headers: {
        cookie: "room-id=1",
        "Content-Type": "application/json",
      },
    });

    const request2: Request = new Request("http:localhost/game/draw-tile", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    await app.request(request2);

    await app.request("/game/place-tile", {
      method: "PATCH",
      headers: { cookie: "room-id=1" },
      body: JSON.stringify({ row: 42, col: 44 }),
    });

    const claimablesResponse = await app.request("/game/claimables", {
      headers: {
        cookie: "room-id=1",
      },
      method: "GET",
    });

    const claimables = await claimablesResponse.json();

    assertEquals(claimables, []);
    assertEquals(claimablesResponse.status, 200);
  });
});
