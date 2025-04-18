import { assert, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createApp from "../../src/app.ts";
import { AppContext, User } from "../../src/models/models.ts";
import RoomManager from "../../src/models/room-manager.ts";
import { Carcassonne } from "../../src/models/carcassone.ts";

describe("handleLogin", () => {
  it("should return a redirection response", async () => {
    const sessions = new Map<string, string>();
    const users = new Map<string, User>();
    const roomManager = new RoomManager(
      () => "1",
      () => () => "red"
    );
    const games = new Map<string, Carcassonne>();

    const context: AppContext = { sessions, users, roomManager, games };
    const formData = new FormData();
    formData.set("username", "Alice");

    const app = createApp(context);
    const request: Request = new Request("http:localhost/login", {
      method: "POST",
      body: formData,
    });

    const response = await app.request(request);

    assertEquals(response.status, 303);
    assertEquals(response.headers.get("location"), "/game-options");
    assert(response.headers.has("set-cookie"));
  });
});
