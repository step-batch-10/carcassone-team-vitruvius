import { assert, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import GameRoom from "../../src/models/room/game-room.ts";
import { GameRoomJson, GameStatus } from "../../src/models/types/models.ts";

describe("GameRoom", () => {
  it("should create a room and add host in players", () => {
    const meepleColorGenerator = () => "red";
    const room = new GameRoom(2, "mounika", "roomId", meepleColorGenerator);

    assertEquals(room.totalJoinedPlayers(), 1);
  });

  describe("addPlayer", () => {
    it("should return joined player instance", () => {
      const meepleColorGenerator = () => "red";

      const room = new GameRoom(3, "mounika", "roomId", meepleColorGenerator);

      const addedPlayer = room.addPlayer("prasad") ?? { json: () => "" };
      const addedPlayerJson = {
        username: "prasad",
        noOfMeeples: 7,
        points: 0,
        meepleColor: "red",
        isHost: false,
        roomID: "roomId",
      };

      assertEquals(addedPlayer.json(), addedPlayerJson);
    });

    it("should return null when max players limit is extended", () => {
      const meepleColorGenerator = () => "red";

      const room = new GameRoom(1, "mounika", "roomId", meepleColorGenerator);

      assertEquals(room.addPlayer("prasad"), null);
    });
  });

  describe("json", () => {
    it("should return json data of game room with host data", () => {
      const meepleColorGenerator = () => "red";

      const room = new GameRoom(3, "mounika", "roomId", meepleColorGenerator);
      const playerJson = {
        username: "mounika",
        noOfMeeples: 7,
        points: 0,
        meepleColor: "red",
        isHost: true,
        roomID: "roomId",
      };

      const roomJson: GameRoomJson = {
        maxPlayers: 3,
        players: [playerJson],
        roomID: "roomId",
        host: "mounika",
        gameStatus: GameStatus.WAITING,
      };

      assertEquals(room.json(), roomJson);
    });

    it("should return json data of game room with host and joined players data", () => {
      const meepleColorGenerator = () => "red";

      const room = new GameRoom(3, "mounika", "roomId", meepleColorGenerator);
      room.addPlayer("Prasad");

      const playersJson = [
        {
          username: "mounika",
          noOfMeeples: 7,
          points: 0,
          meepleColor: "red",
          isHost: true,
          roomID: "roomId",
        },
        {
          username: "Prasad",
          noOfMeeples: 7,
          points: 0,
          meepleColor: "red",
          isHost: false,
          roomID: "roomId",
        },
      ];

      const roomJson: GameRoomJson = {
        maxPlayers: 3,
        players: playersJson,
        roomID: "roomId",
        host: "mounika",
        gameStatus: GameStatus.WAITING,
      };

      assertEquals(room.json(), roomJson);
    });
  });

  describe("createGame", () => {
    it("should create carcassonne game instance if max player limit reached", () => {
      const room = new GameRoom(2, "Mounika", "roomId", () => "red");

      room.addPlayer("Prasad");

      const game = room.createGame();

      assert(game);
    });

    it("should return null if max player limit is not reached", () => {
      const room = new GameRoom(2, "Mounika", "roomId", () => "red");

      const game = room.createGame();

      assertEquals(game, null);
    });
  });
});
