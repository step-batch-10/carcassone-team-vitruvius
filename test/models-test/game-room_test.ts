import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import GameRoom from "../../src/models/game-room.ts";

describe("GameRoom", () => {
  it("should create a room and add host in players", () => {
    const room = new GameRoom(2, "mounika", "roomId");

    assertEquals(room.totalJoinedPlayers(), 1);
  });

  describe("addPlayer", () => {
    it("should add new player to game room", () => {
      const room = new GameRoom(3, "mounika", "roomId");

      const addedPlayer = room.addPlayer("prasad");
      const addedPlayerJson = {
        username: "prasad",
        noOfMeeples: 7,
        points: 0,
        meepleColor: "red",
        isHost: false,
        roomId: "roomId",
      };

      assertEquals(addedPlayer.json(), addedPlayerJson);
    });
  });
});
