import { assert, assertEquals, assertFalse } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import RoomManager from "../../src/models/room/room-manager.ts";

describe("RoomManager", () => {
  describe("createRoom", () => {
    it("should create a room with a host", () => {
      const roomID = "1";
      const idGenerator = () => roomID;
      const meepleColorGenerator = () => () => "red";

      const lobby = new RoomManager(idGenerator, meepleColorGenerator);

      const createdRoomId = lobby.createRoom("host", 3);

      assertEquals(createdRoomId, roomID);
    });
  });

  describe("hasRoom", () => {
    it("should return false if room is not present in RoomManager", () => {
      const roomID = "1";
      const idGenerator = () => roomID;
      const meepleColorGenerator = () => () => "red";

      const lobby = new RoomManager(idGenerator, meepleColorGenerator);

      assertFalse(lobby.hasRoom(roomID));
    });

    it("should return true if room is present in RoomManager", () => {
      const roomID = "1";
      const idGenerator = () => roomID;
      const meepleColorGenerator = () => () => "red";

      const lobby = new RoomManager(idGenerator, meepleColorGenerator);
      lobby.createRoom("host", 3);

      assert(lobby.hasRoom(roomID));
    });
  });

  describe("getRoom", () => {
    it("should return GameRoom instance if it is created", () => {
      const roomID = "1";
      const idGenerator = () => roomID;
      const meepleColorGenerator = () => () => "red";

      const lobby = new RoomManager(idGenerator, meepleColorGenerator);
      lobby.createRoom("host", 3);

      assertEquals(lobby.getRoom(roomID)?.roomID, roomID);
    });

    it("should return null if GameRoom is not created", () => {
      const roomID = "1";
      const idGenerator = () => roomID;
      const meepleColorGenerator = () => () => "red";

      const lobby = new RoomManager(idGenerator, meepleColorGenerator);

      assertEquals(lobby.getRoom(roomID), null);
    });
  });
});
