import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import createApp from "../../src/app.ts";
import { AppContext, Feature, Tile, User } from "../../src/models/models.ts";
import { Carcassonne } from "../../src/models/game/carcassonne.ts";
import RoomManager from "../../src/models/room/room-manager.ts";
import { createDummyPlayers, createTile } from "../dummy-data.ts";
import Player from "../../src/models/room/player.ts";
import { silentLogger } from "./silent-logger.ts";

describe("serveGameState", () => {
  it("request from current player", async () => {
    const sessions = new Map<string, string>();
    const users = new Map<string, User>();

    sessions.set("sID1", "uID1");
    users.set("uID1", { username: "user1", roomID: "1" });

    const roomManager = new RoomManager(
      () => "1",
      () => () => "red",
    );

    const tileShuffler = (tiles: Tile[]): Tile[] => tiles;

    const games = new Map<string, Carcassonne>();
    const players = createDummyPlayers();
    const game = Carcassonne.initGame(players, tileShuffler);

    games.set("1", game);

    const context: AppContext = { sessions, users, roomManager, games };

    const app = createApp(context, silentLogger);
    const gameStateRequest = new Request("http://localhost/game/state", {
      headers: { cookie: "room-id=1; session-id=sID1" },
    });
    const response = await app.request(gameStateRequest);
    const gameState = await response.json();

    const expectedTile = createTile(
      "1",
      [Feature.ROAD, Feature.CITY, Feature.ROAD, Feature.FIELD],
      Feature.ROAD,
    );

    assertEquals(response.status, 200);
    assertEquals(gameState.board[42][42].tile, expectedTile);
    assertEquals(gameState.currentPlayer, players[0].json());
    assertEquals(gameState.self, players[0].json());
    assertEquals(
      gameState.players,
      players.map((player: Player) => player.json()),
    );
  });
});
