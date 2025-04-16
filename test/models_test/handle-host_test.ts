import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createHandler from "../../src/app.ts";
import { Hono } from "hono";

describe("handleHost", () => {
  it("should return ok", async () => {
    const app: Hono = createHandler();
    const request: Request = new Request("http://localhost/host", {
      method: "POST",
    });

    const response: Response = await app.request(request);

    assertEquals(await response.json(), "ok");
  });
});
