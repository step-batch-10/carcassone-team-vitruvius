import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createApp from "../../src/app.ts";
import { AppContext, User } from "../../src/models/types/models.ts";
import RoomManager from "../../src/models/room/room-manager.ts";
import { Carcassonne } from "../../src/models/game/carcassonne.ts";

describe("handleJoin", () => {
  it("should join room if roomId is valid", async () => {
    const sessions = new Map<string, string>();
    sessions.set("123", "123");
    const users = new Map<string, User>();

    users.set("123", { username: "user1", roomID: null });

    const roomManager = new RoomManager(
      () => "1",
      () => () => "red"
    );

    roomManager.createRoom("hostUser", 3);
    const games = new Map<string, Carcassonne>();

    const context: AppContext = { sessions, users, roomManager, games };
    const formData = new FormData();
    formData.set("roomID", "1");

    const app = createApp(context);

    const response = await app.request("/joinRoom", {
      method: "post",
      body: formData,
      headers: new Headers({ cookie: "session-id=123" }),
    });

    const setCookies = "room-id=1; Path=/";

    assertEquals(response.status, 200);
    assertEquals(await response.json(), { isRoomJoined: true });
    assertEquals(response.headers.get("set-cookie"), setCookies);
  });

  it("should return not join room if roomId is valid", async () => {
    const sessions = new Map<string, string>();
    sessions.set("123", "123");
    const users = new Map<string, User>();

    users.set("123", { username: "user1", roomID: null });

    const roomManager = new RoomManager(
      () => "1",
      () => () => "red"
    );

    roomManager.createRoom("hostUser", 3);
    const games = new Map<string, Carcassonne>();

    const context: AppContext = { sessions, users, roomManager, games };
    const formData = new FormData();
    formData.set("roomID", "2");

    const app = createApp(context);

    const response = await app.request("/joinRoom", {
      method: "post",
      body: formData,
      headers: new Headers({ cookie: "session-id=123" }),
    });

    assertEquals(response.status, 200);
    assertEquals(await response.json(), { isRoomJoined: false });
  });

  it("should insert game in games when last player joins game", async () => {
    const sessions = new Map<string, string>();
    sessions.set("123", "123");
    const users = new Map<string, User>();

    users.set("123", { username: "user1", roomID: null });

    const roomManager = new RoomManager(
      () => "1",
      () => () => "red"
    );

    roomManager.createRoom("hostUser", 2);

    const games = new Map<string, Carcassonne>();

    const context: AppContext = { sessions, users, roomManager, games };
    const formData = new FormData();
    formData.set("roomID", "1");

    const app = createApp(context);
    await app.request("/joinRoom", {
      method: "post",
      body: formData,
      headers: new Headers({ cookie: "session-id=123" }),
    });

    assertEquals(games.size, 1);
  });

  it("should not insert game in games when player is not last player", async () => {
    const sessions = new Map<string, string>();
    sessions.set("123", "123");
    const users = new Map<string, User>();

    users.set("123", { username: "user1", roomID: null });

    const roomManager = new RoomManager(
      () => "1",
      () => () => "red"
    );

    roomManager.createRoom("hostUser", 3);

    const games = new Map<string, Carcassonne>();

    const context: AppContext = { sessions, users, roomManager, games };
    const formData = new FormData();
    formData.set("roomID", "1");

    const app = createApp(context);
    await app.request("/joinRoom", {
      method: "post",
      body: formData,
      headers: new Headers({ cookie: "session-id=123" }),
    });

    assertEquals(games.size, 0);
  });
});
