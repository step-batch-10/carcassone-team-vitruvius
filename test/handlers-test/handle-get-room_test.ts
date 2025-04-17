import { assert, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  GameRoomJson,
  GameStatus,
  MyContext,
  User,
} from "../../src/models/models.ts";
import RoomManager from "../../src/models/room-manager.ts";
import createHandler from "../../src/app.ts";

describe("handleGetRoom", () => {
  it("should return json data of room", async () => {
    const sessions = new Map<string, string>();
    const users = new Map<string, User>();
    sessions.set("sId", "uId");
    users.set("uId", { username: "Mounika", roomID: null });
    const roomManager = new RoomManager(
      () => "1",
      () => "red"
    );

    roomManager.createRoom("Mounika", 3);

    const context = { sessions, users, roomManager };
    const app = createHandler(context);

    const request = new Request("http://localhost/room", {
      headers: { cookie: "roomId=1; session-id=sId" },
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
});
