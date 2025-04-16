import { assert, assertEquals, assertFalse } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import RoomManager from "../../src/models/room-manager.ts";

describe("RoomManager", () => {
  describe("createRoom", () => {
    it("should create a room with a host", () => {
      const roomId = "1";
      const idGenerator = () => roomId;
      const meepleColorGenerator = () => "red";

      const lobby = new RoomManager(idGenerator, meepleColorGenerator);

      const createdRoomId = lobby.createRoom("host");

      assertEquals(createdRoomId, roomId);
    });
  });

  describe("hasRoom", () => {
    it("should return false if room is not present in RoomManager", () => {
      const roomId = "1";
      const idGenerator = () => roomId;
      const meepleColorGenerator = () => "red";

      const lobby = new RoomManager(idGenerator, meepleColorGenerator);

      assertFalse(lobby.hasRoom(roomId));
    });

    it("should return true if room is present in RoomManager", () => {
      const roomId = "1";
      const idGenerator = () => roomId;
      const meepleColorGenerator = () => "red";

      const lobby = new RoomManager(idGenerator, meepleColorGenerator);
      lobby.createRoom("host");

      assert(lobby.hasRoom(roomId));
    });
  });

  describe("getRoom", () => {
    it("should return GameRoom instance if it is created", () => {
      const roomId = "1";
      const idGenerator = () => roomId;
      const meepleColorGenerator = () => "red";

      const lobby = new RoomManager(idGenerator, meepleColorGenerator);
      lobby.createRoom("host");

      assertEquals(lobby.getRoom(roomId)?.roomId, roomId);
    });

    it("should return null if GameRoom is not created", () => {
      const roomId = "1";
      const idGenerator = () => roomId;
      const meepleColorGenerator = () => "red";

      const lobby = new RoomManager(idGenerator, meepleColorGenerator);

      assertEquals(lobby.getRoom(roomId), null);
    });
  });
});
