import { assert, assertEquals, assertFalse } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { Carcassonne } from "../../src/models/game/carcassonne.ts";
import { ScoreManager } from "../../src/models/game/score-board.ts";
import { TileBoxManager } from "../../src/models/game/tiles.ts";
import { Center, Feature, Sides, Tile } from "../../src/models/models.ts";
import {
  createDummyPlayers,
  dummyTiles,
  dummyTiles2,
  dummyTiles3,
  dummyTiles4,
} from "../dummy-data.ts";
import { createDummyTile, dummyTiles5, roadTile4 } from "./../dummy-data.ts";
import { createAndPlaceTiles } from "./score_test.ts";

describe("Testing getCurrentPlayer", () => {
  it("should return the current player", () => {
    const game = createAndPlaceTiles(dummyTiles, []);

    assertEquals(game.getCurrentPlayer(), createDummyPlayers()[0]);
    game.changePlayerTurn();
    assertEquals(game.getCurrentPlayer(), createDummyPlayers()[1]);
  });
});

describe("Testing get Board", () => {
  it("should return the board of empty tiles and length 84", () => {
    const game = Carcassonne.initGame(createDummyPlayers());
    assertEquals(game.getBoard().length, 84);
    assertEquals(game.getBoard()[0].length, 84);
  });
});

const shuffler = (arr: Tile[]) => arr;
const players = createDummyPlayers();

describe("Testing draw a tile", () => {
  it("should give the first tile when top has a valid tile", () => {
    const game = Carcassonne.initGame(players, shuffler, dummyTiles());
    assertEquals(
      game.drawATile(),
      createDummyTile("2", ["r", "f", "r", "f"], "r"),
    );
  });

  it("should give the second tile when top has an invalid tile", () => {
    const game = Carcassonne.initGame(players, shuffler, dummyTiles2());
    assertEquals(
      game.drawATile(),
      createDummyTile("2", ["c", "c", "c", "c"], "c"),
    );
  });
});

describe("Testing rotateCurrentTile", () => {
  const game = Carcassonne.initGame(players, shuffler, dummyTiles());

  it("should rotate the current tile by 90 degree", () => {
    game.drawATile();
    game.rotateCurrentTile();

    assertEquals(game.getCurrentTile()?.orientation, 90);
  });

  it("should rotate the current tile by 180 degree", () => {
    game.drawATile();
    game.rotateCurrentTile();
    game.rotateCurrentTile();

    assertEquals(game.getCurrentTile()?.orientation, 180);
  });

  it("should rotate the current tile by 360 degree", () => {
    game.drawATile();
    game.rotateCurrentTile(); // can pass times to rotate as a param.
    game.rotateCurrentTile();
    game.rotateCurrentTile();
    game.rotateCurrentTile();

    assertEquals(game.getCurrentTile()?.orientation, 0);
  });
});

describe("Testing place a tile", () => {
  const game = Carcassonne.initGame(players, shuffler, dummyTiles3());

  it("should place the tile when placed at correct postion", () => {
    game.drawATile();
    assert(game.placeATile({ row: 42, col: 43 }).isPlaced);
  });

  it("should not place the tile when placed at invalid postion", () => {
    game.drawATile();
    assertFalse(game.placeATile({ row: 43, col: 43 }).isPlaced);
  });
});

describe("Testing placablePositions", () => {
  let game: Carcassonne | undefined = undefined;

  beforeEach(() => {
    game = Carcassonne.initGame(players, shuffler, dummyTiles());
  });

  it("should return object having unlockedPosition and placablePositions", () => {
    // const game = Carcassonne.initGame(players, shuffler, dummyTiles());
    game!.drawATile();

    // can change this?
    assertEquals(game!.validPositions(), {
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
    const game = Carcassonne.initGame(players, shuffler, dummyTiles());

    assertEquals(game.validPositions(), {
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

describe("Testing place a meeple", () => {
  it("should place a meeple when it is not occupied by any player and their meeple count should reduce", () => {
    const game = Carcassonne.initGame(players, shuffler, dummyTiles()); //how to use everywhere?
    game.drawATile();
    game.placeATile({ row: 42, col: 43 });

    assert(game.placeAMeeple(Sides.LEFT).isPlaced);
    assertEquals(players[0].noOfMeeples, 6);
  });

  it("should not place meeple when trying to claim without drawing any tile", () => {
    const game = Carcassonne.initGame(players, shuffler, dummyTiles());
    game.placeATile({ row: 42, col: 42 });

    assertFalse(game.placeAMeeple(Sides.LEFT).isPlaced);
    assertEquals(players[1].noOfMeeples, 7);
  });

  it("should not place when it is already occupied by another player and their meeple count remain unchanged", () => {
    const game = Carcassonne.initGame(players, shuffler, dummyTiles());

    game.drawATile();
    game.placeATile({ row: 42, col: 43 });
    game.placeAMeeple(Sides.RIGHT);
    game.placeATile({ row: 42, col: 44 });

    assertFalse(game.placeAMeeple(Sides.LEFT).isPlaced);
    assertEquals(players[1].noOfMeeples, 7);
  });

  it("when there is no tile placed then the occupance should not mark", () => {
    const scoreBoard = new ScoreManager([[]], new TileBoxManager([[]]), []);

    assertFalse(
      scoreBoard.hasFeature({ row: 0, col: 0 }, Feature.CITY, Sides.BOTTOM),
    );
  });

  it("when there is no except tiles then it should return the empty exception", () => {
    const tileBoxes = new TileBoxManager([[]]);

    assertEquals(
      tileBoxes.notScoredEdges(new Set<string>(), { row: 0, col: 0 }, [])
        .except,
      [],
    );

    assertEquals(
      tileBoxes.getLastEdge(new Set<string>(), []).lastEdge,
      Sides.LEFT,
    );
  });

  it("should  claim the monastry", () => {
    const game = createAndPlaceTiles(dummyTiles, [
      { row: 42, col: 43 },
      { row: 42, col: 44 },
      { row: 42, col: 45 },
      { row: 41, col: 45, location: Center.MIDDlE },
    ]);

    assertEquals(
      game.getBoard()[41][45].occupiedRegion.middle.occupiedBy.size,
      1,
    );
  });
});

describe("Testing markOccupance", () => {
  const gridSize = (
    game: Carcassonne,
    [row, col]: number[],
    subgrid: "left" | "right" | "top" | "bottom" | "middle",
  ) => {
    return game.getBoard()[row][col].occupiedRegion[subgrid].occupiedBy.size;
  };

  it("should mark the occurence to tile when it is place to connected feature which is claimed", () => {
    const game = createAndPlaceTiles(dummyTiles, [
      { row: 42, col: 43, location: Sides.RIGHT },
      { row: 42, col: 44 },
    ]);

    assertEquals(gridSize(game, [42, 44], "left"), 1);
  });

  it("should mark the occurence to tile when it is place to connected feature which is claimed", () => {
    const game = createAndPlaceTiles(roadTile4, [
      { row: 42, col: 41, location: Sides.LEFT },
      { row: 42, col: 40 },
      { row: 42, col: 39 },
    ]);

    assertEquals(gridSize(game, [42, 39], "bottom"), 1);
    assertEquals(gridSize(game, [42, 39], "left"), 0);
    assertEquals(gridSize(game, [42, 39], "right"), 1);
    assertEquals(gridSize(game, [42, 39], "middle"), 0);
  });

  it("should mark the occupance when the tile are of same feature", () => {
    const game = createAndPlaceTiles(dummyTiles, [
      { row: 42, col: 43, location: Sides.RIGHT },
      { row: 42, col: 44 },
    ]);

    assertEquals(gridSize(game, [42, 44], "left"), 1);
    assertEquals(gridSize(game, [42, 44], "middle"), 1);
    assertEquals(gridSize(game, [42, 44], "right"), 1);
  });

  it("should mark the adjacent left connecting tile", () => {
    const game = createAndPlaceTiles(dummyTiles3, [
      { row: 42, col: 43, location: Sides.RIGHT },
    ]);

    assertEquals(gridSize(game, [42, 42], "left"), 1);
    assertEquals(gridSize(game, [42, 42], "middle"), 1);
    assertEquals(gridSize(game, [42, 42], "right"), 1);
  });

  it("should mark the adjacent right connecting tile", () => {
    const game = createAndPlaceTiles(dummyTiles3, [
      { row: 42, col: 41, location: Sides.RIGHT },
    ]);

    assertEquals(gridSize(game, [42, 42], "left"), 1);
    assertEquals(gridSize(game, [42, 42], "middle"), 1);
    assertEquals(gridSize(game, [42, 42], "right"), 1);
  });

  it("should mark the adjacent top connecting tile", () => {
    const game = createAndPlaceTiles(dummyTiles4, [
      { row: 42, col: 43 },
      { row: 43, col: 43, location: Sides.TOP },
    ]);

    assertEquals(gridSize(game, [42, 43], "left"), 1);
    assertEquals(gridSize(game, [42, 43], "middle"), 1);
    assertEquals(gridSize(game, [42, 43], "bottom"), 1);
  });

  it("should mark the adjacent bottom connecting tile", () => {
    const game = createAndPlaceTiles(dummyTiles5, [
      { row: 42, col: 43 },
      { row: 41, col: 43, location: Sides.TOP },
    ]);

    assertEquals(gridSize(game, [42, 43], "left"), 1);
    assertEquals(gridSize(game, [42, 43], "middle"), 1);
    assertEquals(gridSize(game, [42, 43], "top"), 1);
  });

  it("should mark all the connecting tile occupances", () => {
    const game = createAndPlaceTiles(dummyTiles3, [
      { row: 42, col: 43 },
      { row: 43, col: 42 },
      { row: 43, col: 41, location: Sides.TOP },
      { row: 42, col: 41 },
    ]);

    assertEquals(gridSize(game, [42, 43], "left"), 1);
    assertEquals(gridSize(game, [42, 43], "middle"), 1);
    assertEquals(gridSize(game, [42, 43], "right"), 1);
  });

  it("should mark all the connecting tile occupances with all players claiming", () => {
    const game = createAndPlaceTiles(dummyTiles3, [
      { row: 42, col: 43, location: Sides.LEFT },
      { row: 43, col: 42 },
      { row: 43, col: 41, location: Sides.TOP },
      { row: 42, col: 41 },
    ]);

    assertEquals(gridSize(game, [42, 43], "left"), 2);
    assertEquals(gridSize(game, [42, 43], "middle"), 2);
    assertEquals(gridSize(game, [42, 43], "right"), 2);
  });
});
