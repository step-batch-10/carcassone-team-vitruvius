import { assert, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createApp from "../../src/app.ts";
import { AppContext, User } from "../../src/models/models.ts";
import RoomManager from "../../src/models/room-manager.ts";

describe("handleHost", () => {
  it("should redirect to lobby page and create room for host", async () => {
    const sessions = new Map<string, string>();
    const users = new Map<string, User>();
    const roomManager = new RoomManager(
      () => "1",
      () => () => "red"
    );

    const context: AppContext = { sessions, users, roomManager };
    const formData = new FormData();
    formData.set("username", "Alice");

    const app = createApp(context);
    const loginRequest = new Request("http://localhost/login", {
      method: "POST",
      body: formData,
    });

    const loginResponse = await app.request(loginRequest);

    const setCookies = loginResponse.headers.get("set-cookie") ?? "session-id=";

    const { "session-id": sessionId } = Object.fromEntries(
      setCookies.split(";").map((cookie) => cookie.split("="))
    );

    const hostRequest = new Request("http://localhost/host", {
      method: "POST",
      headers: {
        cookie: `session-id=${sessionId}`,
      },
    });

    const response = await app.request(hostRequest);
    const cookies = "room-id=1; Path=/";

    assertEquals(response.status, 303);
    assertEquals(response.headers.get("location"), "/lobby");
    assertEquals(response.headers.get("set-cookie"), cookies);

    const room = roomManager.getRoom("1");
    assert(room);
    assertEquals(room.totalJoinedPlayers(), 1);
    assertEquals(room.host, "Alice");
  });
});
