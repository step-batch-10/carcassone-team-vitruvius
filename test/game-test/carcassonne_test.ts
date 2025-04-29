import { assert, assertEquals, assertFalse } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { stub } from "@std/testing/mock";
import { Carcassonne } from "../../src/models/game/carcassonne.ts";
import { TileBoxManager } from "../../src/models/game/tiles.ts";
import { Center, Sides, Tile } from "../../src/models/models.ts";
import {
  createDummyPlayers,
  dummyTiles,
  dummyTiles2,
  dummyTiles3,
  dummyTiles4,
} from "../dummy-data.ts";
import { createDummyTile, dummyTiles5, roadTile4 } from "./../dummy-data.ts";
import { createAndPlaceTiles, placeAndDrawTiles } from "./score_test.ts";

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
      placablePositions: [],
    });
  });
});

describe("Testing place a meeple", () => {
  let game: Carcassonne | undefined;

  beforeEach(() => {
    game = Carcassonne.initGame(players, shuffler, dummyTiles());
  });

  it("should place a meeple when it is not occupied by any player and their meeple count should reduce", () => {
    placeAndDrawTiles(game!, [{ row: 42, col: 43 }]);

    assert(game!.placeAMeeple(Sides.LEFT).isPlaced);
    assertEquals(players[0].noOfMeeples, 6);
  });

  it("should not place meeple when trying to claim without drawing any tile", () => {
    placeAndDrawTiles(game!, [{ row: 42, col: 42 }]);

    assertFalse(game!.placeAMeeple(Sides.LEFT).isPlaced);
    assertEquals(players[1].noOfMeeples, 7);
  });

  it("should not place when it is already occupied by another player and their meeple count remain unchanged", () => {
    placeAndDrawTiles(game!, [
      { row: 41, col: 42, location: Sides.RIGHT },
      { row: 40, col: 42 },
    ]);

    assertFalse(game!.placeAMeeple(Sides.TOP).isPlaced);
    assertEquals(players[1].noOfMeeples, 7);
  });

  it("should not place when it's occupied (city in  the center)", () => {
    placeAndDrawTiles(game!, [
      { row: 42, col: 43, location: Sides.RIGHT },
      { row: 42, col: 44 },
    ]);

    assertFalse(game!.placeAMeeple(Sides.LEFT).isPlaced);
    assertEquals(players[1].noOfMeeples, 7);
  });

  it("should return the empty exception when there is no except tiles then it ", () => {
    const tileBoxes = new TileBoxManager([[]]);
    const position = { row: 0, col: 0 };
    const emptySet = new Set<string>();

    assertEquals(tileBoxes.notScoredEdges(emptySet, position, []).except, []);
    assertEquals(tileBoxes.getLastEdge(emptySet, []).lastEdge, Sides.LEFT);
  });

  it("should claim the monastry", () => {
    const game = createAndPlaceTiles(dummyTiles, [
      { row: 42, col: 43 },
      { row: 42, col: 44 },
      { row: 42, col: 45 },
      { row: 41, col: 45, location: Center.MIDDLE },
    ]);

    const size = game.getBoard()[41][45].occupiedRegion.middle.occupiedBy.size;
    assertEquals(size, 1);
  });
});

describe("Testing markOccupance", () => {
  const gridSize = (
    game: Carcassonne,
    [row, col]: number[],
    subgrid: Sides | Center,
  ) => game.getBoard()[row][col].occupiedRegion[subgrid].occupiedBy.size;

  it("should mark the occurence to tile when it is place to connected feature which is claimed", () => {
    const game = createAndPlaceTiles(dummyTiles, [
      { row: 42, col: 43, location: Sides.RIGHT },
      { row: 42, col: 44 },
    ]);

    assertEquals(gridSize(game, [42, 44], Sides.LEFT), 1);
  });

  it("should mark the occurence to tile when it is place to connected feature which is claimed", () => {
    const game = createAndPlaceTiles(roadTile4, [
      { row: 42, col: 41, location: Sides.LEFT },
      { row: 42, col: 40 },
      { row: 42, col: 39 },
    ]);

    assertEquals(gridSize(game, [42, 39], Sides.BOTTOM), 1);
    assertEquals(gridSize(game, [42, 39], Sides.LEFT), 0);
    assertEquals(gridSize(game, [42, 39], Sides.RIGHT), 1);
    assertEquals(gridSize(game, [42, 39], Center.MIDDLE), 0);
  });

  it("should mark the occupance when the tile are of same feature", () => {
    const game = createAndPlaceTiles(dummyTiles, [
      { row: 42, col: 43, location: Sides.RIGHT },
      { row: 42, col: 44 },
    ]);

    assertEquals(gridSize(game, [42, 44], Sides.LEFT), 1);
    assertEquals(gridSize(game, [42, 44], Center.MIDDLE), 1);
    assertEquals(gridSize(game, [42, 44], Sides.RIGHT), 1);
  });

  it("should mark the adjacent left connecting tile", () => {
    const game = createAndPlaceTiles(dummyTiles3, [
      { row: 42, col: 43, location: Sides.RIGHT },
    ]);

    assertEquals(gridSize(game, [42, 42], Sides.LEFT), 1);
    assertEquals(gridSize(game, [42, 42], Center.MIDDLE), 1);
    assertEquals(gridSize(game, [42, 42], Sides.RIGHT), 1);
  });

  it("should mark the adjacent right connecting tile", () => {
    const game = createAndPlaceTiles(dummyTiles3, [
      { row: 42, col: 41, location: Sides.RIGHT },
    ]);

    assertEquals(gridSize(game, [42, 42], Sides.LEFT), 1);
    assertEquals(gridSize(game, [42, 42], Center.MIDDLE), 1);
    assertEquals(gridSize(game, [42, 42], Sides.RIGHT), 1);
  });

  it("should mark the adjacent top connecting tile", () => {
    const game = createAndPlaceTiles(dummyTiles4, [
      { row: 42, col: 43 },
      { row: 43, col: 43, location: Sides.TOP },
    ]);

    assertEquals(gridSize(game, [42, 43], Sides.LEFT), 1);
    assertEquals(gridSize(game, [42, 43], Center.MIDDLE), 1);
    assertEquals(gridSize(game, [42, 43], Sides.BOTTOM), 1);
  });

  it("should mark the adjacent bottom connecting tile", () => {
    const game = createAndPlaceTiles(dummyTiles5, [
      { row: 42, col: 43 },
      { row: 41, col: 43, location: Sides.TOP },
    ]);

    assertEquals(gridSize(game, [42, 43], Sides.LEFT), 1);
    assertEquals(gridSize(game, [42, 43], Center.MIDDLE), 1);
    assertEquals(gridSize(game, [42, 43], Sides.TOP), 1);
  });

  it("should mark all the connecting tile occupances", () => {
    const game = createAndPlaceTiles(dummyTiles3, [
      { row: 42, col: 43 },
      { row: 43, col: 42 },
      { row: 43, col: 41, location: Sides.TOP },
      { row: 42, col: 41 },
    ]);

    assertEquals(gridSize(game, [42, 43], Sides.LEFT), 1);
    assertEquals(gridSize(game, [42, 43], Center.MIDDLE), 1);
    assertEquals(gridSize(game, [42, 43], Sides.RIGHT), 1);
  });

  it("should mark all the connecting tile occupances with all players claiming", () => {
    const game = createAndPlaceTiles(dummyTiles3, [
      { row: 42, col: 43, location: Sides.LEFT },
      { row: 43, col: 42 },
      { row: 43, col: 41, location: Sides.TOP },
      { row: 42, col: 41 },
    ]);

    assertEquals(gridSize(game, [42, 43], Sides.LEFT), 2);
    assertEquals(gridSize(game, [42, 43], Center.MIDDLE), 2);
    assertEquals(gridSize(game, [42, 43], Sides.RIGHT), 2);
  });
});

describe("lastPlacedTilePositionOf", () => {
  it("should return null if player didn't place any tile yet", () => {
    const game = Carcassonne.initGame(createDummyPlayers());

    assertEquals(game.lastPlacedTilePositionOf("user1"), null);
  });

  it("should return player's last placed tile position", () => {
    const game = Carcassonne.initGame(players);
    stub(players[0].movesStack, "peek", () => ({ row: 0, col: 0 }));

    assertEquals(game.lastPlacedTilePositionOf("user1"), { row: 0, col: 0 });
  });
});

describe("lastPlayerTilePosition", () => {
  it("should return first tile position if first player didn't place tile yet", () => {
    const game = Carcassonne.initGame(players);

    assertEquals(game.getLastPlacedTilePosition(), { row: 42, col: 42 });
  });

  it("should return last player's placed tile position", () => {
    const game = Carcassonne.initGame(players, shuffler, dummyTiles());
    game.drawATile();
    const position = game.validPositions().placablePositions[0];
    game.placeATile(position);

    assertEquals(game.getLastPlacedTilePosition(), position);
  });
});
