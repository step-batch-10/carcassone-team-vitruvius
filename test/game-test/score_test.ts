import { describe, it } from "@std/testing/bdd";
import {
  createDummyPlayers,
  createPlayer,
  dummyTiles,
  monasteryTiles,
  monasteryTiles1,
  monasteryTiles2,
  monasteryTiles3,
  roadTile4,
  roadTile5,
  roadTile6,
  roadTile7,
  roadTiles,
  roadTiles1,
  roadTiles2,
  roadTiles3,
} from "../dummy-data.ts";
import { Carcassonne } from "../../src/models/game/carcassonne.ts";
import { assertEquals } from "@std/assert/equals";
import { Center, Position, Sides, Tile } from "../../src/models/models.ts";

type Move = Position & { location?: Sides | Center };

const placeAndDrawTiles = (game: Carcassonne, moves: Move[]) => {
  moves.forEach((move) => {
    game.drawATile();
    game.placeATile({ row: move.row, col: move.col });
    if (move.location) game.placeAMeeple(move.location);
  });
};

export const createAndPlaceTiles = (
  generateTiles: () => Tile[],
  places: Move[],
) => {
  const players = createDummyPlayers();
  const game = Carcassonne.initGame(players, (arr) => arr, generateTiles());

  placeAndDrawTiles(game, places);

  return game;
};

describe("Testing for scoring monastery", () => {
  it("should not update score when monastery not claimed", () => {
    const game = createAndPlaceTiles(dummyTiles, [
      { row: 42, col: 43, location: Center.MIDDlE },
    ]);

    assertEquals(game.getAllPlayers()[0].points, 0);
    assertEquals(game.getAllPlayers()[1].points, 0);
  });

  it("should update score when placing tile is monastery(claimed) and adjacent 8 tiles are there", () => {
    const game = createAndPlaceTiles(monasteryTiles, [
      { row: 42, col: 43 },
      { row: 43, col: 43 },
      { row: 44, col: 43 },
      { row: 44, col: 42 },
      { row: 44, col: 41 },
      { row: 43, col: 41 },
      { row: 42, col: 41 },
      { row: 43, col: 42, location: Center.MIDDlE },
    ]);

    assertEquals(game.getAllPlayers()[0].points, 9);
    assertEquals(game.getAllPlayers()[1].points, 0);
  });

  it("should update score when the tile placed completes the monastery", () => {
    const game = createAndPlaceTiles(monasteryTiles1, [
      { row: 43, col: 42, location: Center.MIDDlE },
      { row: 42, col: 43 },
      { row: 43, col: 43 },
      { row: 44, col: 43 },
      { row: 44, col: 42 },
      { row: 44, col: 41 },
      { row: 43, col: 41 },
      { row: 42, col: 41 },
    ]);

    assertEquals(game.getAllPlayers()[0].points, 9);
    assertEquals(game.getAllPlayers()[1].points, 0);
  });

  it("should update score when the tile placed completes two monasteries claimed by different players", () => {
    const game = createAndPlaceTiles(monasteryTiles2, [
      { row: 42, col: 43 },
      { row: 43, col: 43 },
      { row: 43, col: 42, location: Center.MIDDlE },
      { row: 44, col: 43 },
      { row: 44, col: 42 },
      { row: 45, col: 42 },
      { row: 45, col: 41 },
      { row: 45, col: 40 },
      { row: 44, col: 40 },
      { row: 43, col: 40 },
      { row: 43, col: 41 },
      { row: 42, col: 41 },
      { row: 44, col: 41, location: Center.MIDDlE },
    ]);

    assertEquals(game.getAllPlayers()[0].points, 9);
    assertEquals(game.getAllPlayers()[1].points, 9);
  });

  it("should update score when the tile placed completes two monasteries claimed by single player", () => {
    const players = [createPlayer("Aman", "black", false, "121")];
    const game = Carcassonne.initGame(players, (arr) => arr, monasteryTiles2());

    placeAndDrawTiles(game, [
      { row: 42, col: 43 },
      { row: 43, col: 43 },
      { row: 43, col: 42, location: Center.MIDDlE },
      { row: 44, col: 43 },
      { row: 44, col: 42 },
      { row: 45, col: 42 },
      { row: 45, col: 41 },
      { row: 45, col: 40 },
      { row: 44, col: 40 },
      { row: 43, col: 40 },
      { row: 43, col: 41 },
      { row: 42, col: 41 },
      { row: 44, col: 41, location: Center.MIDDlE },
    ]);

    assertEquals(game.getCurrentPlayer().points, 18);
  });

  it("should remove meeple from the tile and increase the meeple count", () => {
    const players = [createPlayer("user1", "black", true, "121")];
    const game = Carcassonne.initGame(players, (arr) => arr, monasteryTiles1());

    placeAndDrawTiles(game, [
      { row: 43, col: 42, location: Center.MIDDlE },
      { row: 42, col: 43 },
      { row: 43, col: 43 },
      { row: 44, col: 43 },
      { row: 44, col: 42 },
      { row: 44, col: 41 },
      { row: 43, col: 41 },
    ]);

    assertEquals(game.getCurrentPlayer().noOfMeeples, 6);

    placeAndDrawTiles(game, [{ row: 42, col: 41 }]);

    assertEquals(game.getCurrentPlayer().noOfMeeples, 7);
    assertEquals(game.getBoard()[43][42].meeple.color, null);
  });

  it("should remove meeple from the tile and increase the meeple count when two monasteries are placed adjacent to each other claimed by different people", () => {
    const game = createAndPlaceTiles(monasteryTiles3, [
      { row: 43, col: 42, location: Center.MIDDlE },
      { row: 43, col: 43, location: Center.MIDDlE },
    ]);

    assertEquals(game.getAllPlayers()[0].noOfMeeples, 6);
    assertEquals(game.getAllPlayers()[1].noOfMeeples, 6);
  });
});

describe("Testing for scoring Roads", () => {
  it("should not update score when road not completed", () => {
    const game = createAndPlaceTiles(roadTiles, [
      { row: 42, col: 43, location: Center.MIDDlE },
    ]);

    assertEquals(game.getAllPlayers()[0].points, 0);
    assertEquals(game.getAllPlayers()[1].points, 0);
  });

  it("should update score when placed tile joins two end of road", () => {
    const game = createAndPlaceTiles(roadTiles1, [
      { row: 41, col: 42, location: Sides.RIGHT },
      { row: 42, col: 43 },
      { row: 41, col: 43 },
    ]);

    assertEquals(game.getAllPlayers()[0].points, 3);
    assertEquals(game.getAllPlayers()[1].points, 0);
  });

  it("should update score when placed tile is end of road", () => {
    const game = createAndPlaceTiles(roadTiles2, [
      { row: 42, col: 43, location: Sides.TOP },
      { row: 41, col: 43 },
      { row: 41, col: 42 },
    ]);

    assertEquals(game.getAllPlayers()[0].points, 3);
    assertEquals(game.getAllPlayers()[1].points, 0);
  });

  it("should update score when placed tile completes single pair of roads", () => {
    const game = createAndPlaceTiles(roadTiles3, [
      { row: 41, col: 42, location: Sides.RIGHT },
      { row: 41, col: 43 },
    ]);

    assertEquals(game.getAllPlayers()[0].points, 2);
    assertEquals(game.getAllPlayers()[1].points, 0);
  });

  it("should update score when there is a tile containing center as city and connecting roads", () => {
    const game = createAndPlaceTiles(roadTile4, [
      { row: 42, col: 41, location: Sides.LEFT },
      { row: 42, col: 40 },
      { row: 42, col: 39 },
      { row: 43, col: 39 },
      { row: 43, col: 38 },
    ]);

    assertEquals(game.getAllPlayers()[0].points, 5);
    assertEquals(game.getAllPlayers()[0].noOfMeeples, 7);
    assertEquals(game.getAllPlayers()[1].points, 0);
    assertEquals(game.getAllPlayers()[1].noOfMeeples, 7);
  });

  it("should update score of two players when placed tile joins two end of road", () => {
    const game = createAndPlaceTiles(roadTiles1, [
      { row: 41, col: 42, location: Sides.RIGHT },
      { row: 42, col: 43, location: Sides.TOP },
      { row: 41, col: 43 },
    ]);

    assertEquals(game.getAllPlayers()[0].points, 3);
    assertEquals(game.getAllPlayers()[1].points, 3);
  });

  it("should update score when road closed ends with city", () => {
    const game = createAndPlaceTiles(roadTile5, [
      { row: 42, col: 43, location: Sides.LEFT },
      { row: 42, col: 41 },
    ]);

    assertEquals(game.getAllPlayers()[0].points, 3);
    assertEquals(game.getAllPlayers()[1].points, 0);
  });

  it("should update score when road closed ends with monastery", () => {
    const game = createAndPlaceTiles(roadTile5, [
      { row: 42, col: 43, location: Sides.LEFT },
      { row: 42, col: 41 },
      { row: 42, col: 44, location: Sides.LEFT },
    ]);

    assertEquals(game.getAllPlayers()[0].points, 3);
    assertEquals(game.getAllPlayers()[1].points, 2);
  });

  it("should not update score twice when it's already calculated", () => {
    const game = createAndPlaceTiles(roadTile6, [
      { row: 42, col: 41, location: Sides.RIGHT },
      { row: 42, col: 43, location: Sides.RIGHT },
    ]);

    assertEquals(game.getAllPlayers()[0].points, 3);
  });

  it("should not update score twice when it's already calculated", () => {
    const game = createAndPlaceTiles(roadTile6, [
      { row: 42, col: 41, location: Sides.RIGHT },
      { row: 42, col: 43, location: Sides.RIGHT },
    ]);

    assertEquals(game.getAllPlayers()[0].points, 3);
  });
});

it("should update the score", () => {
  const game = createAndPlaceTiles(roadTile7, [
    { row: 42, col: 41 },
    { row: 42, col: 43, location: Center.MIDDlE },
    { row: 42, col: 44 },
    { row: 43, col: 44 },
    { row: 43, col: 45 },
    { row: 42, col: 45 },
  ]);

  assertEquals(game.getAllPlayers()[0].points, 7);
});
