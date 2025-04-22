import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createApp from "../../src/app.ts";
import { Feature, Tile, User } from "../../src/models/types/models.ts";
import RoomManager from "../../src/models/room/room-manager.ts";
import { Carcassonne } from "../../src/models/game/carcassone.ts";
import Player from "../../src/models/room/player.ts";

describe("serveCurrentTile", () => {
  it("should return null if tile didn't draw", async () => {
    const sessions = new Map<string, string>();
    const users = new Map<string, User>();
    const games = new Map<string, Carcassonne>();
    const roomIdGenerator = () => "1";
    const meepleColorGenerator = () => "red";

    const players = [
      new Player("user1", meepleColorGenerator(), true, roomIdGenerator()),
      new Player("user2", meepleColorGenerator(), true, roomIdGenerator()),
    ];

    games.set("1", Carcassonne.initGame(players));
    const roomManager = new RoomManager(
      () => "1",
      () => meepleColorGenerator
    );

    const appContext = { sessions, users, roomManager, games };
    const app = createApp(appContext);

    const currentTileRequest = new Request(
      "http://localhost/game/current-tile",
      { headers: { cookie: "room-id=1;" } }
    );
    const response = await app.request(currentTileRequest);

    assertEquals(await response.json(), null);
  });

  it("should return current tile if current player drew tile", async () => {
    const sessions = new Map<string, string>();
    const users = new Map<string, User>();
    const games = new Map<string, Carcassonne>();
    const roomIdGenerator = () => "1";
    const meepleColorGenerator = () => "red";

    const players = [
      new Player("user1", meepleColorGenerator(), true, roomIdGenerator()),
      new Player("user1", meepleColorGenerator(), true, roomIdGenerator()),
    ];

    const tileShuffler = (tiles: Tile[]): Tile[] => tiles;
    const tiles: Tile[] = [
      {
        hasShield: false,
        id: "0",
        orientation: 0,
        tileCenter: Feature.CITY,
        tileEdges: [Feature.CITY, Feature.CITY, Feature.CITY, Feature.CITY],
      },
    ];

    const game = Carcassonne.initGame(players, tileShuffler, tiles);

    game.drawATile();

    games.set("1", game);

    const roomManager = new RoomManager(
      () => "1",
      () => meepleColorGenerator
    );

    const appContext = { sessions, users, roomManager, games };
    const app = createApp(appContext);

    const currentTileJSON = tiles.at(0);

    const currentTileRequest = new Request(
      "http://localhost/game/current-tile",
      { headers: { cookie: "room-id=1;" } }
    );

    const response = await app.request(currentTileRequest);
    assertEquals(await response.json(), currentTileJSON);
  });
});
