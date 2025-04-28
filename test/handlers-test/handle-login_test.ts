import { assert, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { createTestApp } from "./handle-get-room_test.ts";

describe("handleLogin", () => {
  it("should return a redirection response", async () => {
    const formData = new FormData();
    formData.set("username", "Alice");

    const { app } = createTestApp();
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
