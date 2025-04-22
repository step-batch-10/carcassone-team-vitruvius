import {
  createDummyPlayers,
  dummyTiles,
} from "../../src/models/game/dummy-data-for-test.ts";
import { Carcassonne } from "../../src/models/game/carcassone.ts";
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createApp from "../../src/app.ts";
import {
  AppContext,
  Feature,
  Tile,
  User,
} from "../../src/models/types/models.ts";
import RoomManager from "../../src/models/room/room-manager.ts";

describe("testing the handleRotateTile", () => {
  it("should return an object containing an rotatedTile if roomId is valid ", async () => {
    const sessions = new Map<string, string>();
    const users = new Map<string, User>();
    const roomManager = new RoomManager(
      () => "1",
      () => () => "red"
    );
    const games = new Map<string, Carcassonne>();
    const game = Carcassonne.initGame(
      createDummyPlayers(),
      (arr) => arr,
      dummyTiles
    );

    game.drawATile();
    games.set("1", game);

    const context: AppContext = { sessions, users, roomManager, games };
    const app = createApp(context);

    const rotatedTileRes = await app.request("game/tile/rotate", {
      method: "PATCH",
      headers: {
        cookie: "room-id=1",
      },
    });

    const rotatedTile: Tile = await rotatedTileRes.json();

    const expectedTile: Tile = {
      hasShield: false,
      id: "2",
      orientation: 90,
      tileCenter: Feature.ROAD,
      tileEdges: [Feature.FIELD, Feature.ROAD, Feature.FIELD, Feature.ROAD],
    };
    assertEquals(rotatedTile, expectedTile);
  });

  it("should return an object containing desc key with value 'invalid game id' if roomId is invalid ", async () => {
    const sessions = new Map<string, string>();
    const users = new Map<string, User>();
    const roomManager = new RoomManager(
      () => "1",
      () => () => "red"
    );
    const games = new Map<string, Carcassonne>();
    const game = Carcassonne.initGame(
      createDummyPlayers(),
      (arr) => arr,
      dummyTiles
    );

    game.drawATile();
    games.set("2", game);

    const context: AppContext = { sessions, users, roomManager, games };
    const app = createApp(context);

    const rotatedTileRes = await app.request("game/tile/rotate", {
      method: "PATCH",
      headers: {
        cookie: "room-id=1",
      },
    });

    const actual = await rotatedTileRes.json();

    const expectedTile = { desc: "invalid game Id" };
    assertEquals(actual, expectedTile);
  });
});
