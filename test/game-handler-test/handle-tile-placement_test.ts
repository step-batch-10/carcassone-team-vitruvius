import { createDummyPlayers, dummyTiles } from "../dummy-data.ts";
import { assertEquals, assertFalse } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { createTestApp } from "./handle-place-meeple_test.ts";

describe("handleTilePlacement", () => {
  it("should return an object containing an array of placeable tiles and an array of unlocked tiles ", async () => {
    const { app } = createTestApp(createDummyPlayers(), dummyTiles());
    const position = { row: 42, col: 43 };

    const drawTileRes = await app.request("game/draw-tile", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    const drawnTile = await drawTileRes.json();
    const placeTileRes = await app.request("/game/place-tile", {
      method: "PATCH",
      headers: {
        cookie: "room-id=1",
      },
      body: JSON.stringify(position),
    });

    assertEquals(placeTileRes.status, 201);

    const boardRes = await app.request("game/board", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });
    const board = await boardRes.json();

    assertEquals(board[42][43].tile, drawnTile);
  });

  it("should return an status code of 400 and a status desc when tile is not placeable ", async () => {
    const position = { row: 40, col: 43 };
    const { app } = createTestApp(createDummyPlayers(), dummyTiles());

    const drawTileRes = await app.request("game/draw-tile", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });

    await drawTileRes.json();

    const response = await app.request("/game/place-tile", {
      method: "PATCH",
      headers: {
        cookie: "room-id=1",
      },
      body: JSON.stringify(position),
    });

    assertEquals(response.status, 400);

    assertFalse((await response.json()).isPlaced);
    const boardRes = await app.request("game/board", {
      method: "GET",
      headers: {
        cookie: "room-id=1",
      },
    });
    const board = await boardRes.json();

    assertEquals(board[40][43].tile, null);
  });
});
