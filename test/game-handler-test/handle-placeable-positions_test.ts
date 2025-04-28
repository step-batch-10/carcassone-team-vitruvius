import { createDummyPlayers, dummyTiles } from "../dummy-data.ts";

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { createTestApp } from "./handle-place-meeple_test.ts";

describe("testing handlePlaceablePositions test", () => {
  it("should return a object with unlockedPositions and placablePositions when the first tile is already placed", async () => {
    const { app } = createTestApp(createDummyPlayers(), dummyTiles());

    const response = await app.request("/game/tile/placeable-positions", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    assertEquals(await response.json(), {
      placablePositions: [],
      unlockedPositions: [
        {
          col: 42,
          row: 41,
        },
        {
          col: 41,
          row: 42,
        },
        {
          col: 43,
          row: 42,
        },
        {
          col: 42,
          row: 43,
        },
      ],
    });
  });
  it("should return a object with unlockedPositions and placablePositions when the second tile is already placed", async () => {
    const { app } = createTestApp(createDummyPlayers(), dummyTiles());

    await app.request("/game/draw-tile", {
      method: "GET",
      headers: { cookie: "room-id=1" },
    });

    const response = await app.request("/game/tile/placeable-positions", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    assertEquals(await response.json(), {
      placablePositions: [
        {
          col: 41,
          row: 42,
        },
        {
          col: 43,
          row: 42,
        },
        {
          col: 42,
          row: 43,
        },
      ],
      unlockedPositions: [
        {
          col: 42,
          row: 41,
        },
        {
          col: 41,
          row: 42,
        },
        {
          col: 43,
          row: 42,
        },
        {
          col: 42,
          row: 43,
        },
      ],
    });
  });

  it("should return a object with unlockedPositions and placablePositions when the third tile is already placed", async () => {
    const { app } = createTestApp(createDummyPlayers(), dummyTiles());

    await app.request("/game/draw-tile", {
      method: "GET",
      headers: { cookie: "room-id=1" },
    });

    await app.request("/game/place-tile", {
      method: "PATCH",
      headers: { cookie: "room-id=1" },
      body: JSON.stringify({ row: 42, col: 43 }),
    });

    await app.request("/game/draw-tile", {
      method: "GET",
      headers: { cookie: "room-id=1" },
    });

    const response = await app.request("/game/tile/placeable-positions", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    assertEquals(await response.json(), {
      placablePositions: [
        { row: 41, col: 43 },
        { row: 42, col: 41 },
        { row: 42, col: 44 },
        { row: 43, col: 42 },
        { row: 43, col: 43 },
      ],
      unlockedPositions: [
        { row: 41, col: 42 },
        { row: 41, col: 43 },
        { row: 42, col: 41 },
        { row: 42, col: 44 },
        { row: 43, col: 42 },
        { row: 43, col: 43 },
      ],
    });
  });
});
