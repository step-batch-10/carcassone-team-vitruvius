import { Carcassonne } from "../../src/models/game/carcassonne.ts";
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createApp from "../../src/app.ts";
import { AppContext, Tile, User } from "../../src/models/models.ts";
import RoomManager from "../../src/models/room/room-manager.ts";
import { silentLogger } from "./silent-logger.ts";
import { assertSpyCallArgs, stub } from "@std/testing/mock";
import Player from "../../src/models/room/player.ts";

describe("handlePlaceMeeple", () => {
  it("should respond with ok for successful meeple placement", async () => {
    const { app, game } = createTestApp();
    const placeMeepleStub = stub(game, "placeAMeeple", () => ({
      isPlaced: true,
    }));

    const response = await app.request("/game/claim", {
      method: "PATCH",
      body: JSON.stringify({ side: "left" }),
      headers: {
        cookie: "room-id=1",
        "Content-Type": "application/json",
      },
    });

    assertEquals(201, response.status);
    assertSpyCallArgs(placeMeepleStub, 0, ["left"]);
  });

  it("should respond with bad request for unsuccessful meeple placement", async () => {
    const { app, game } = createTestApp();

    const placeMeepleStub = stub(game, "placeAMeeple", () => ({
      isPlaced: false,
    }));

    const response = await app.request("/game/claim", {
      method: "PATCH",
      body: JSON.stringify({ side: "left" }),
      headers: {
        cookie: "room-id=1",
        "Content-Type": "application/json",
      },
    });

    assertEquals(400, response.status);
    assertSpyCallArgs(placeMeepleStub, 0, ["left"]);
  });
});

export const createTestApp = (
  players: Player[] = [],
  tiles: Tile[] = [],
  roomID: string = "1",
) => {
  const sessions = new Map<string, string>();
  const users = new Map<string, User>();
  sessions.set("sId", "uId");
  users.set("uId", { username: "user1", roomID });
  const roomManager = new RoomManager(
    () => "1",
    () => () => "red",
  );
  const games = new Map<string, Carcassonne>();
  const game = Carcassonne.initGame(players, (arr) => arr, tiles);
  games.set(roomID, game);

  const context: AppContext = { sessions, users, roomManager, games };
  const app = createApp(context, silentLogger);

  return { app, game };
};
