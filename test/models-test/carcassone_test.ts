import {
  dummyTiles2,
  createDummyPlayers,
  createPlayer,
} from "./../../src/models/dummy-data-for-test.ts";
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { Carcassonne } from "../../src/models/carcassone.ts";

describe("testing getCurrentPlayer", () => {
  it("should return currentPlayer", () => {
    const players = createDummyPlayers();
    const game = Carcassonne.initGame(players);
    assertEquals(game.getCurrentPlayer(), players[0]);
    game.changePlayerTurn();
    assertEquals(game.getCurrentPlayer(), players[1]);
  });
});

describe("testing get Board", () => {
  it("should return the board", () => {
    const players = [
      createPlayer("user1", "black", true, "121"),
      createPlayer("user2", "blue", false, "121"),
    ];
    const game = Carcassonne.initGame(players);
    assertEquals(game.getBoard().length, 84);
  });
});

describe("testing draw a tile", () => {
  it("should give a first tile when top is valid tile", () => {
    const players = [
      createPlayer("user1", "black", true, "121"),
      createPlayer("user2", "blue", false, "121"),
    ];
    const game = Carcassonne.initGame(players, (arr) => arr);
    assertEquals(game.drawATile(), {
      hasShield: false,
      id: "2",
      orientation: 0,
      tileCenter: "road",
      tileEdges: ["road", "field", "road", "monastery"],
    });
  });

  it("should give second Tile when top is invalid tile", () => {
    const players = [
      createPlayer("user1", "black", true, "121"),
      createPlayer("user2", "blue", false, "121"),
    ];
    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles2);
    assertEquals(game.drawATile(), {
      hasShield: false,
      id: "2",
      orientation: 0,
      tileCenter: "city",
      tileEdges: ["city", "city", "city", "city"],
    });
  });
});

describe("testing rotateCurrentTile", () => {
  it("should rotate the current tile by 90 degree", () => {
    const players = [
      createPlayer("user1", "black", true, "121"),
      createPlayer("user2", "blue", false, "121"),
    ];
    const game = Carcassonne.initGame(players, (arr) => arr);
    game.drawATile();
    game.rotateCurrentTile();

    assertEquals(game.getCurrentTile()?.orientation, 90);
  });
});
