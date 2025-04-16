import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createHandler from "../../src/app.ts";
import { Hono } from "hono";
import { MyContext, User } from "../../src/models/models.ts";

describe("handleHost", () => {
  it("should return ok", async () => {
    const sessions = new Map<string, User>();
    const context: MyContext = { sessions };

    const app: Hono = createHandler(context);
    const request: Request = new Request("http://localhost/host", {
      method: "POST",
    });

    const response: Response = await app.request(request);

    assertEquals(await response.json(), "ok");
  });
});
