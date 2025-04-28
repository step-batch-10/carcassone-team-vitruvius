import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { createTestApp } from "./handle-get-room_test.ts";

describe("handleJoin", () => {
  it("should join room if roomID is valid", async () => {
    const { app } = createTestApp();
    const formData = new FormData();
    formData.set("roomID", "1");

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

  it("should return not join room if roomID is valid", async () => {
    const formData = new FormData();
    formData.set("roomID", "2");

    const { app } = createTestApp();

    const response = await app.request("/joinRoom", {
      method: "post",
      body: formData,
      headers: new Headers({ cookie: "session-id=123" }),
    });

    assertEquals(response.status, 200);
    assertEquals(await response.json(), { isRoomJoined: false });
  });

  it("should insert game in games when last player joins game", async () => {
    const formData = new FormData();
    formData.set("roomID", "1");

    const { app, games } = createTestApp();
    await app.request("/joinRoom", {
      method: "post",
      body: formData,
      headers: new Headers({ cookie: "session-id=sId" }),
    });
    await app.request("/joinRoom", {
      method: "post",
      body: formData,
      headers: new Headers({ cookie: "session-id=sId" }),
    });

    assertEquals(games.size, 1);
  });

  it("should not insert game in games when player is not last player", async () => {
    const formData = new FormData();
    formData.set("roomID", "1");

    const { app, games } = createTestApp();
    await app.request("/joinRoom", {
      method: "post",
      body: formData,
      headers: new Headers({ cookie: "session-id=sId" }),
    });

    assertEquals(games.size, 0);
  });
});
