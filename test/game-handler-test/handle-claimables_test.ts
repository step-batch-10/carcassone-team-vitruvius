import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { createDummyPlayers, dummyTiles } from "../dummy-data.ts";
import { createTestApp } from "./handle-place-meeple_test.ts";

describe("handleServeClaimables", () => {
  it("should return an array of sides", async () => {
    const { app } = createTestApp(createDummyPlayers(), dummyTiles());

    await app.request("/game/draw-tile", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    await app.request("/game/place-tile", {
      method: "PATCH",
      headers: { cookie: "room-id=1" },
      body: JSON.stringify({ row: 42, col: 43 }),
    });

    const claimablesResponse = await app.request("/game/claimables", {
      headers: {
        cookie: "room-id=1",
      },
      method: "GET",
    });

    const claimables = await claimablesResponse.json();

    assertEquals(claimables, ["left", "right", "middle"]);
    assertEquals(claimablesResponse.status, 200);
  });
  it("should return an empty array", async () => {
    const { app } = createTestApp(createDummyPlayers(), dummyTiles());
    await app.request("/game/draw-tile", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    await app.request("/game/place-tile", {
      method: "PATCH",
      headers: { cookie: "room-id=1" },
      body: JSON.stringify({ row: 42, col: 43 }),
    });

    await app.request("/game/claim", {
      method: "PATCH",
      body: JSON.stringify({ side: "left" }),
      headers: {
        cookie: "room-id=1",
        "Content-Type": "application/json",
      },
    });

    const request2: Request = new Request("http:localhost/game/draw-tile", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    await app.request(request2);

    await app.request("/game/place-tile", {
      method: "PATCH",
      headers: { cookie: "room-id=1" },
      body: JSON.stringify({ row: 42, col: 44 }),
    });

    const claimablesResponse = await app.request("/game/claimables", {
      headers: {
        cookie: "room-id=1",
      },
      method: "GET",
    });

    const claimables = await claimablesResponse.json();

    assertEquals(claimables, []);
    assertEquals(claimablesResponse.status, 200);
  });
});
