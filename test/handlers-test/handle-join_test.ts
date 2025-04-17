import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createHandler from "../../src/app.ts";
import { MyContext, User } from "../../src/models/models.ts";
import RoomManager from "../../src/models/room-manager.ts";

describe("handleJoinReq", () => {
  it("should join room if roomId is valid", async () => {
    const sessions = new Map<string, string>();
    sessions.set("123", "123");
    const users = new Map<string, User>();

    users.set("123", { username: "user1", roomID: null });

    const roomManager = new RoomManager(
      () => "1",
      () => "red"
    );

    roomManager.createRoom("hostUser");

    const context: MyContext = { sessions, users, roomManager };
    const formData = new FormData();
    formData.set("roomId", "1");

    const app = createHandler(context);

    const response = await app.request("/joinRoom", {
      method: "post",
      body: formData,
      headers: new Headers({ cookie: "session-id=123" }),
    });

    assertEquals(response.status, 200);
    assertEquals(await response.json(), { isRoomJoined: true });
  });

  it("should return not join room if roomId is valid", async () => {
    const sessions = new Map<string, string>();
    sessions.set("123", "123");
    const users = new Map<string, User>();

    users.set("123", { username: "user1", roomID: null });

    const roomManager = new RoomManager(
      () => "1",
      () => "red"
    );

    roomManager.createRoom("hostUser");

    const context: MyContext = { sessions, users, roomManager };
    const formData = new FormData();
    formData.set("roomId", "2");

    const app = createHandler(context);

    const response = await app.request("/joinRoom", {
      method: "post",
      body: formData,
      headers: new Headers({ cookie: "session-id=123" }),
    });

    assertEquals(response.status, 200);
    assertEquals(await response.json(), { isRoomJoined: false });
  });
});
