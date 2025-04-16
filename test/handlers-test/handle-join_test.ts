import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createHandler from "../../src/app.ts";
import { MyContext, User } from "../../src/models/models.ts";

describe("handleJoinReq", () => {
  it("should redirect to waiting room if roomId is valid", async () => {
    const sessions = new Map<string, string>();
    const users = new Map<string, User>();

    const context: MyContext = { sessions, users };
    const formData = new FormData();
    formData.set("roomId", "1234");

    const app = createHandler(context);

    const response = await app.request("/joinRoom", {
      method: "post",
      body: formData,
      headers: new Headers({ cookie: "sessionId=123" }),
    });

    assertEquals(response.status, 200);
    assertEquals(await response.json(), { isRoomJoined: true });
  });
});
