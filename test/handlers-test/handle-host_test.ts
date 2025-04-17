import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createHandler from "../../src/app.ts";
import { MyContext, User } from "../../src/models/models.ts";
import RoomManager from "../../src/models/room-manager.ts";

describe("handleHost", () => {
  it("should return ok", async () => {
    const sessions = new Map<string, string>();
    const users = new Map<string, User>();
    const roomManager = new RoomManager(
      () => "1",
      () => "1"
    );

    const context: MyContext = { sessions, users, roomManager };

    const app = createHandler(context);
    const request = new Request("http://localhost/host", {
      method: "POST",
    });

    const response = await app.request(request);

    assertEquals(await response.json(), "ok");
  });
});
