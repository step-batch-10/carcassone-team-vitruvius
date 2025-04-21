import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { GameRoomJson, GameStatus, User } from "../../src/models/types/models.ts";
import RoomManager from "../../src/models/room/room-manager.ts";
import createApp from "../../src/app.ts";
import { Carcassonne } from "../../src/models/game/carcassone.ts";

describe("handleGetRoom", () => {
  it("should return json data of room", async () => {
    const sessions = new Map<string, string>();
    const users = new Map<string, User>();
    sessions.set("sId", "uId");
    users.set("uId", { username: "Mounika", roomID: null });
    const roomManager = new RoomManager(
      () => "1",
      () => () => "red"
    );
    const games = new Map<string, Carcassonne>();

    roomManager.createRoom("Mounika", 3);

    const appContext = { sessions, users, roomManager, games };
    const app = createApp(appContext);

    const request = new Request("http://localhost/room", {
      headers: { cookie: "room-id=1; session-id=sId" },
    });

    const response = await app.request(request);

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
    const sessions = new Map<string, string>();
    const users = new Map<string, User>();
    sessions.set("sId", "uId");
    users.set("uId", { username: "Mounika", roomID: null });
    const roomManager = new RoomManager(
      () => "1",
      () => () => "red"
    );

    roomManager.createRoom("Mounika", 3);
    const games = new Map<string, Carcassonne>();

    const appContext = { sessions, users, roomManager, games };
    const app = createApp(appContext);

    const request = new Request("http://localhost/room", {
      headers: { cookie: "room-id=0; session-id=sId" },
    });

    const response = await app.request(request);

    assertEquals(response.status, 404);
    assertEquals(await response.json(), null);
  });
});
