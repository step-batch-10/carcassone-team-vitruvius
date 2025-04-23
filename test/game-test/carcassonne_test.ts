import { TileBoxManager } from "../../src/models/game/tiles.ts";
import { createATileBox, dummyTiles5 } from "./../dummy-data.ts";
import {
  createDummyPlayers,
  createPlayer,
  dummyTiles,
  dummyTiles2,
  dummyTiles3,
  dummyTiles4,
} from "../dummy-data.ts";
import { assert, assertEquals, assertFalse } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { Carcassonne } from "../../src/models/game/carcassonne.ts";
import { Sides, Tile } from "../../src/models/types/models.ts";
import { ScoreManager } from "../../src/models/game/score-board.ts";

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
    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles());
    assertEquals(game.drawATile(), {
      hasShield: false,
      id: "2",
      orientation: 0,
      tileCenter: "road",
      tileEdges: ["road", "field", "road", "field"],
    });
  });

  it("should give second Tile when top is invalid tile", () => {
    const players = [
      createPlayer("user1", "black", true, "121"),
      createPlayer("user2", "blue", false, "121"),
    ];
    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles2());
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
    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles());
    game.drawATile();
    game.rotateCurrentTile();

    assertEquals(game.getCurrentTile()?.orientation, 90);
  });
});

describe("testing placablePositions", () => {
  it("should return object having unlockedPosition and placablePositions", () => {
    const players = [
      createPlayer("user1", "black", true, "121"),
      createPlayer("user2", "blue", false, "121"),
    ];
    const game: Carcassonne = Carcassonne.initGame(
      players,
      (arr) => arr,
      dummyTiles(),
    );
    game.drawATile();
    const placeablePositions = game.validPositions();

    assertEquals(placeablePositions, {
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
    });
  });

  it("should return object having unlockedPosition and with no placeablePositions when no tile drawn", () => {
    const players = [
      createPlayer("user1", "black", true, "121"),
      createPlayer("user2", "blue", false, "121"),
    ];
    const game: Carcassonne = Carcassonne.initGame(
      players,
      (arr: Tile[]): Tile[] => arr,
      dummyTiles(),
    );
    const placeablePositions = game.validPositions();

    assertEquals(placeablePositions, {
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
      placablePositions: [],
    });
  });
});

describe("testing place a meeple", () => {
  it("should place a meeple when it is not occupied by any player ", () => {
    const players = [
      createPlayer("user1", "black", true, "121"),
      createPlayer("user2", "blue", false, "121"),
    ];

    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles());

    game.drawATile();
    game.placeATile({ row: 42, col: 43 });
    const status = game.placeAMeeple(Sides.LEFT);

    assert(status.isPlaced);
  });

  it("should not place when it is already occupied by any player", () => {
    const players = [
      createPlayer("user1", "black", true, "121"),
      createPlayer("user2", "blue", false, "121"),
    ];

    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles());

    game.drawATile();
    game.placeATile({ row: 42, col: 43 });
    game.placeAMeeple(Sides.RIGHT);
    game.placeATile({ row: 42, col: 44 });
    const status = game.placeAMeeple(Sides.LEFT);

    assertFalse(status.isPlaced);
  });

  it("when tile placed and connects to claimed feature should marked as claim", () => {
    const tiles = [[createATileBox()]];

    const scoreBoard = new ScoreManager(tiles, new TileBoxManager(tiles));

    assertFalse(scoreBoard.markOccupance({ row: 0, col: 0 }));
  });
});

describe("testing markOccupance", () => {
  it("should mark the occurence to tile when it is place to connected feature which is claimed", () => {
    const players = [
      createPlayer("user1", "black", true, "121"),
      createPlayer("user2", "blue", false, "121"),
    ];

    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles());

    game.drawATile();
    game.placeATile({ row: 42, col: 43 });
    game.placeAMeeple(Sides.RIGHT);
    game.placeATile({ row: 42, col: 44 });

    assertEquals(
      game.getBoard()[42][44].occupiedRegion.left.occupiedBy.size,
      1,
    );
  });

  it("should mark the occupance when the tile are of same feature", () => {
    const players = [
      createPlayer("user1", "black", true, "121"),
      createPlayer("user2", "blue", false, "121"),
    ];

    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles());

    game.drawATile();
    game.placeATile({ row: 42, col: 43 });
    game.placeAMeeple(Sides.RIGHT);
    game.placeATile({ row: 42, col: 44 });

    assertEquals(
      game.getBoard()[42][44].occupiedRegion.left.occupiedBy.size,
      1,
    );
    assertEquals(
      game.getBoard()[42][44].occupiedRegion.middle.occupiedBy.size,
      1,
    );
    assertEquals(
      game.getBoard()[42][44].occupiedRegion.right.occupiedBy.size,
      1,
    );
  });

  it("should mark the adjacent left connecting tile", () => {
    const players = [
      createPlayer("user1", "black", true, "121"),
      createPlayer("user2", "blue", false, "121"),
    ];

    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles3());

    game.drawATile();
    game.placeATile({ row: 42, col: 43 });
    game.placeAMeeple(Sides.RIGHT);

    assertEquals(
      game.getBoard()[42][42].occupiedRegion.left.occupiedBy.size,
      1,
    );
    assertEquals(
      game.getBoard()[42][42].occupiedRegion.middle.occupiedBy.size,
      1,
    );
    assertEquals(
      game.getBoard()[42][42].occupiedRegion.right.occupiedBy.size,
      1,
    );
  });

  it("should mark the adjacent right connecting tile", () => {
    const players = [
      createPlayer("user1", "black", true, "121"),
      createPlayer("user2", "blue", false, "121"),
    ];

    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles3());

    game.drawATile();
    game.placeATile({ row: 42, col: 41 });
    game.placeAMeeple(Sides.RIGHT);

    assertEquals(
      game.getBoard()[42][42].occupiedRegion.left.occupiedBy.size,
      1,
    );
    assertEquals(
      game.getBoard()[42][42].occupiedRegion.middle.occupiedBy.size,
      1,
    );
    assertEquals(
      game.getBoard()[42][42].occupiedRegion.right.occupiedBy.size,
      1,
    );
  });

  it("should mark the adjacent top connecting tile", () => {
    const players = [
      createPlayer("user1", "black", true, "121"),
      createPlayer("user2", "blue", false, "121"),
    ];

    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles4());

    game.drawATile();
    game.placeATile({ row: 42, col: 43 });
    game.drawATile();
    game.placeATile({ row: 43, col: 43 });
    game.placeAMeeple(Sides.TOP);

    assertEquals(
      game.getBoard()[42][43].occupiedRegion.left.occupiedBy.size,
      1,
    );
    assertEquals(
      game.getBoard()[42][43].occupiedRegion.middle.occupiedBy.size,
      1,
    );
    assertEquals(
      game.getBoard()[42][43].occupiedRegion.bottom.occupiedBy.size,
      1,
    );
  });

  it("should mark the adjacent bottom connecting tile", () => {
    const players = [
      createPlayer("user1", "black", true, "121"),
      createPlayer("user2", "blue", false, "121"),
    ];

    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles5());

    game.drawATile();
    game.placeATile({ row: 42, col: 43 });
    game.drawATile();
    game.placeATile({ row: 41, col: 43 });
    game.placeAMeeple(Sides.TOP);

    assertEquals(
      game.getBoard()[42][43].occupiedRegion.left.occupiedBy.size,
      1,
    );
    assertEquals(
      game.getBoard()[42][43].occupiedRegion.middle.occupiedBy.size,
      1,
    );
    assertEquals(
      game.getBoard()[42][43].occupiedRegion.top.occupiedBy.size,
      1,
    );
  });

  it("should mark the all the connecting tile occupances", () => {
    const players = [
      createPlayer("user1", "black", true, "121"),
      createPlayer("user2", "blue", false, "121"),
    ];

    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles3());

    game.drawATile();
    game.placeATile({ row: 42, col: 43 });
    game.drawATile();
    game.placeATile({ row: 43, col: 42 });
    game.drawATile();
    game.placeATile({ row: 43, col: 41 });
    game.placeAMeeple(Sides.TOP);
    game.drawATile();
    game.placeATile({ row: 42, col: 41 });

    assertEquals(
      game.getBoard()[42][43].occupiedRegion.left.occupiedBy.size,
      1,
    );
    assertEquals(
      game.getBoard()[42][43].occupiedRegion.middle.occupiedBy.size,
      1,
    );
    assertEquals(
      game.getBoard()[42][43].occupiedRegion.right.occupiedBy.size,
      1,
    );
  });
});
