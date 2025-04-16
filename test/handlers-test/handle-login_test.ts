import { assert, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createHandler from "../../src/app.ts";
import { Hono } from "hono";
import { MyContext, User } from "../../src/models/models.ts";

describe("handleLogin", () => {
  it("should return a redirection response", async () => {
    const sessions = new Map<string, string>();
    const users = new Map<string, User>();
    const context: MyContext = { sessions, users };
    const formData = new FormData();
    formData.set("username", "Alice");
    formData.set("dob", "2011-11-03");

    const app: Hono = createHandler(context);
    const request: Request = new Request("http:localhost/login", {
      method: "POST",
      body: formData,
    });

    const response: Response = await app.request(request);

    assertEquals(response.status, 303);
    assertEquals(response.headers.get("location"), "/game-options");
    assert(response.headers.has("set-cookie"));
  });
});
