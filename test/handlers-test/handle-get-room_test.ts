import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  AppContext,
  GameRoomJson,
  GameStatus,
  User,
} from "../../src/models/models.ts";
import RoomManager from "../../src/models/room/room-manager.ts";
import createApp from "../../src/app.ts";
import { Carcassonne } from "../../src/models/game/carcassonne.ts";
import { silentLogger } from "../game-handler-test/silent-logger.ts";

export const createTestApp = () => {
  const sessions = new Map<string, string>();
  const users = new Map<string, User>();
  sessions.set("sId", "uId");
  users.set("uId", { username: "Mounika", roomID: null });
  const roomManager = new RoomManager(
    () => "1",
    () => () => "red",
  );
  const games = new Map<string, Carcassonne>();
  roomManager.createRoom("Mounika", 3);
  const context: AppContext = { sessions, users, roomManager, games };
  const app = createApp(context, silentLogger);

  return { app, roomManager, games, sessions };
};

describe("handleGetRoom", () => {
  it("should return json data of room", async () => {
    const { app } = createTestApp();

    const response = await app.request("/room", {
      headers: { cookie: "room-id=1; session-id=sId" },
    });
    const playerJson = {
      username: "Mounika",
      noOfMeeples: 7,
      points: 0,
      meepleColor: "red",
      isHost: true,
      roomID: "1",
    };

    const roomJson: GameRoomJson = {
      maxPlayers: 3,
      players: [playerJson],
      roomID: "1",
      host: "Mounika",
      gameStatus: GameStatus.WAITING,
    };

    assertEquals(response.status, 200);
    assertEquals(await response.json(), roomJson);
  });

  it("should return null when invalid room id given", async () => {
    const { app } = createTestApp();

    const response = await app.request("/room", {
      headers: { cookie: "room-id=0; session-id=sId" },
    });

    assertEquals(response.status, 404);
    assertEquals(await response.json(), null);
  });
});
