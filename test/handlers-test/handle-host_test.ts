import { assert, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { createTestApp } from "./handle-get-room_test.ts";

describe("handleHost", () => {
  it("should redirect to lobby page and create room for host", async () => {
    const { app, roomManager } = createTestApp();
    const formData = new FormData();
    formData.set("username", "Alice");

    const loginResponse = await app.request("/login", {
      method: "POST",
      body: formData,
    });

    const setCookies = loginResponse.headers.get("set-cookie") ?? "session-id=";

    const { "session-id": sessionId } = Object.fromEntries(
      setCookies.split(";").map((cookie) => cookie.split("=")),
    );

    const response = await app.request("/host", {
      method: "POST",
      headers: {
        cookie: `session-id=${sessionId}`,
      },
    });
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
