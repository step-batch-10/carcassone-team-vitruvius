import { assert, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createHandler from "../../src/app.ts";
import { MyContext, User } from "../../src/models/models.ts";
import RoomManager from "../../src/models/room-manager.ts";

describe("handleLogin", () => {
  it("should return a redirection response", async () => {
    const uniqueId = () => "1";
    const uniqueMeepleColor = () => "red";

    const sessions = new Map<string, string>();
    const users = new Map<string, User>();
    const roomManager = new RoomManager(
      () => "1",
      () => "1"
    );
    const context: MyContext = { sessions, users, roomManager };
    const formData = new FormData();
    formData.set("username", "Alice");

    const app = createHandler(context);
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
