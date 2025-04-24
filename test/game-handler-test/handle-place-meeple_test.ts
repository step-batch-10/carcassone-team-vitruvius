import { Carcassonne } from "../../src/models/game/carcassonne.ts";
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createApp from "../../src/app.ts";
import { AppContext, User } from "../../src/models/models.ts";
import RoomManager from "../../src/models/room/room-manager.ts";
import { silentLogger } from "./silent-logger.ts";
import { assertSpyCallArgs, stub } from "@std/testing/mock";

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

const createTestApp = () => {
  const sessions = new Map<string, string>();
  const users = new Map<string, User>();
  const roomManager = new RoomManager(
    () => "1",
    () => () => "red",
  );
  const games = new Map<string, Carcassonne>();
  const game = Carcassonne.initGame([], (arr) => arr, []);
  games.set("1", game);

  const context: AppContext = { sessions, users, roomManager, games };
  const app = createApp(context, silentLogger);

  return { app, game };
};
