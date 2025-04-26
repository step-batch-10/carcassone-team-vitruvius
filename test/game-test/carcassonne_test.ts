import { TileBoxManager } from "../../src/models/game/tiles.ts";
import { createATileBox, dummyTiles5, roadTile4 } from "./../dummy-data.ts";
import {
  createDummyPlayers,
  dummyTiles,
  dummyTiles2,
  dummyTiles3,
  dummyTiles4,
} from "../dummy-data.ts";
import { assert, assertEquals, assertFalse } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { Carcassonne } from "../../src/models/game/carcassonne.ts";
import { Center, Feature, Sides, Tile } from "../../src/models/models.ts";
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
    const players = createDummyPlayers();
    const game = Carcassonne.initGame(players);
    assertEquals(game.getBoard().length, 84);
  });
});

describe("testing draw a tile", () => {
  it("should give a first tile when top is valid tile", () => {
    const players = createDummyPlayers();
    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles());
    assertEquals(game.drawATile(), {
      hasShield: false,
      id: "2",
      orientation: 0,
      tileCenter: Feature.ROAD,
      tileEdges: [Feature.ROAD, Feature.FIELD, Feature.ROAD, Feature.FIELD],
      tileID: "0",
    });
  });

  it("should give second Tile when top is invalid tile", () => {
    const players = createDummyPlayers();
    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles2());
    assertEquals(game.drawATile(), {
      hasShield: false,
      id: "2",
      orientation: 0,
      tileCenter: Feature.CITY,
      tileEdges: [Feature.CITY, Feature.CITY, Feature.CITY, Feature.CITY],
      tileID: "0",
    });
  });
});

describe("testing rotateCurrentTile", () => {
  it("should rotate the current tile by 90 degree", () => {
    const players = createDummyPlayers();
    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles());
    game.drawATile();
    game.rotateCurrentTile();

    assertEquals(game.getCurrentTile()?.orientation, 90);
  });
});

describe("place a tile", () => {
  it("should place the tile when placing at correct postion", () => {
    const players = createDummyPlayers();
    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles3());
    game.drawATile();
    const result = game.placeATile({ row: 42, col: 43 });

    assertEquals(result, undefined);
  });

  it("should not place the tile when placing at invalid postion", () => {
    const players = createDummyPlayers();
    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles3());
    game.drawATile();
    const result = game.placeATile({ row: 43, col: 42 });

    assertEquals(result, { desc: "invalid tile to place" });
  });
});

describe("testing placablePositions", () => {
  it("should return object having unlockedPosition and placablePositions", () => {
    const players = createDummyPlayers();
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
    const players = createDummyPlayers();
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
  it("should place a meeple when it is not occupied by any player and their meeple count should reduce", () => {
    const players = createDummyPlayers();

    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles());

    game.drawATile();
    game.placeATile({ row: 42, col: 43 });
    const status = game.placeAMeeple(Sides.LEFT);

    assertEquals(players[0].noOfMeeples, 6);
    assert(status.isPlaced);
  });

  it(" should not place tile when try to place without placing any tile", () => {
    const players = createDummyPlayers();

    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles());

    game.placeATile({ row: 42, col: 42 });
    const status = game.placeAMeeple(Sides.LEFT);

    assertFalse(status.isPlaced);
  });

  it("should not place when it is already occupied by any player and their meeple count should not reduce", () => {
    const players = createDummyPlayers();
    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles());

    game.drawATile();
    game.placeATile({ row: 42, col: 43 });
    game.placeAMeeple(Sides.RIGHT);
    game.placeATile({ row: 42, col: 44 });
    const status = game.placeAMeeple(Sides.LEFT);

    assertEquals(players[1].noOfMeeples, 7);
    assertFalse(status.isPlaced);
  });

  it("when there is no tile placed then the occupance should not mark", () => {
    const tiles = [[createATileBox()]];

    const scoreBoard = new ScoreManager(tiles, new TileBoxManager(tiles));

    assertFalse(scoreBoard.markOccupance({ row: 0, col: 0 }));
  });

  it("when there is no tile placed then the occupance should not mark", () => {
    const tiles = [[]];

    const scoreBoard = new ScoreManager(tiles, new TileBoxManager(tiles));

    assertFalse(
      scoreBoard.hasFeature({ row: 0, col: 0 }, Feature.CITY, Sides.BOTTOM),
    );
  });

  it("should  claim the monastry", () => {
    const players = createDummyPlayers();
    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles());

    game.drawATile();
    game.placeATile({ row: 42, col: 43 });
    game.drawATile();
    game.placeATile({ row: 42, col: 44 });
    game.drawATile();
    game.placeATile({ row: 42, col: 45 });
    game.drawATile();
    game.placeATile({ row: 41, col: 45 });
    game.placeAMeeple(Center.MIDDlE);

    assertEquals(
      game.getBoard()[41][45].occupiedRegion.middle.occupiedBy.size,
      1,
    );
  });
});

describe("testing markOccupance", () => {
  it("should mark the occurence to tile when it is place to connected feature which is claimed", () => {
    const players = createDummyPlayers();
    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles());

    game.drawATile();
    game.placeATile({ row: 42, col: 43 });
    game.placeAMeeple(Sides.RIGHT);
    game.drawATile();
    game.placeATile({ row: 42, col: 44 });

    assertEquals(
      game.getBoard()[42][44].occupiedRegion.left.occupiedBy.size,
      1,
    );
  });

  it("should mark the occurence to tile when it is place to connected feature which is claimed", () => {
    const players = createDummyPlayers();
    const game = Carcassonne.initGame(players, (arr) => arr, roadTile4());

    game.drawATile();
    game.placeATile({ row: 42, col: 41 });
    game.placeAMeeple(Sides.LEFT);
    game.drawATile();
    game.placeATile({ row: 42, col: 40 });
    game.drawATile();
    game.placeATile({ row: 42, col: 39 });

    assertEquals(
      game.getBoard()[42][39].occupiedRegion.bottom.occupiedBy.size,
      1,
    );
    assertEquals(
      game.getBoard()[42][39].occupiedRegion.left.occupiedBy.size,
      0,
    );
    assertEquals(
      game.getBoard()[42][39].occupiedRegion.right.occupiedBy.size,
      1,
    );
    assertEquals(
      game.getBoard()[42][39].occupiedRegion.middle.occupiedBy.size,
      0,
    );
  });

  it("should mark the occupance when the tile are of same feature", () => {
    const players = createDummyPlayers();
    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles());

    game.drawATile();
    game.placeATile({ row: 42, col: 43 });
    game.placeAMeeple(Sides.RIGHT);
    game.drawATile();
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
    const players = createDummyPlayers();
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
    const players = createDummyPlayers();
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
    const players = createDummyPlayers();
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
    const players = createDummyPlayers();
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
    assertEquals(game.getBoard()[42][43].occupiedRegion.top.occupiedBy.size, 1);
  });

  it("should mark the all the connecting tile occupances", () => {
    const players = createDummyPlayers();
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

  it("should mark the all the connecting tile occupance of all players claiming", () => {
    const players = createDummyPlayers();
    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles3());

    game.drawATile();
    game.placeATile({ row: 42, col: 43 });
    game.placeAMeeple(Sides.LEFT);
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
