import { describe, it } from "@std/testing/bdd";
import {
  createDummyPlayers,
  createPlayer,
  dummyTiles,
  dummyTilesToClaimMonastery,
  dummyTilesToClaimMonastery1,
  dummyTilesToClaimMonastery2,
  dummyTilesToClaimMonastery3,
  dummyTilesToClaimRoad,
  dummyTilesToClaimRoad1,
  dummyTilesToClaimRoad2,
  dummyTilesToClaimRoad3,
} from "../dummy-data.ts";
import { Carcassonne } from "../../src/models/game/carcassonne.ts";
import { assertEquals } from "@std/assert/equals";
import { Center, Position, Sides } from "../../src/models/models.ts";

type Move = Position & { location?: Sides | Center };

const placeAndDrawTiles = (game: Carcassonne, moves: Move[]) => {
  moves.forEach((move) => {
    game.drawATile();
    game.placeATile(move);
    if (move.location) game.placeAMeeple(move.location);
  });
};

describe("Testing for scoring monastery", () => {
  it("should not update score when monastery not claimed", () => {
    const players = createDummyPlayers();
    const game = Carcassonne.initGame(players, (arr) => arr, dummyTiles());

    placeAndDrawTiles(game, [{ row: 42, col: 43, location: Center.MIDDlE }]);

    assertEquals(game.getCurrentPlayer().points, 0);
  });

  it("should update score when placing tile is monastery(claimed) and adjacent 8 tiles are there", () => {
    const players = [createPlayer("user1", "black", true, "121")];
    const game = Carcassonne.initGame(
      players,
      (arr) => arr,
      dummyTilesToClaimMonastery(),
    );

    placeAndDrawTiles(game, [
      { row: 42, col: 43 },
      { row: 43, col: 43 },
      { row: 44, col: 43 },
      { row: 44, col: 42 },
      { row: 44, col: 41 },
      { row: 43, col: 41 },
      { row: 42, col: 41 },
      { row: 43, col: 42, location: Center.MIDDlE },
    ]);

    assertEquals(game.getCurrentPlayer().points, 9);
  });

  it("should update score when the tile placed completes the monastery", () => {
    const players = [createPlayer("user1", "black", true, "121")];
    const game = Carcassonne.initGame(
      players,
      (arr) => arr,
      dummyTilesToClaimMonastery1(),
    );

    placeAndDrawTiles(game, [
      { row: 43, col: 42, location: Center.MIDDlE },
      { row: 42, col: 43 },
      { row: 43, col: 43 },
      { row: 44, col: 43 },
      { row: 44, col: 42 },
      { row: 44, col: 41 },
      { row: 43, col: 41 },
      { row: 42, col: 41 },
    ]);

    assertEquals(game.getCurrentPlayer().points, 9);
  });

  it("should update score when the tile placed completes two monasteries claimed by different players", () => {
    const players = createDummyPlayers();
    const game = Carcassonne.initGame(
      players,
      (arr) => arr,
      dummyTilesToClaimMonastery2(),
    );

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

    const playerScores = game.getAllPlayers();

    assertEquals(playerScores[0].points, 9);
    assertEquals(playerScores[1].points, 9);
  });

  it("should update score when the tile placed completes two monasteries claimed by single player", () => {
    const players = [createPlayer("Aman", "black", false, "121")];
    const game = Carcassonne.initGame(
      players,
      (arr) => arr,
      dummyTilesToClaimMonastery2(),
    );

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
    const game = Carcassonne.initGame(
      players,
      (arr) => arr,
      dummyTilesToClaimMonastery1(),
    );

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
    const players = createDummyPlayers();
    const game = Carcassonne.initGame(
      players,
      (arr) => arr,
      dummyTilesToClaimMonastery3(),
    );

    placeAndDrawTiles(game, [
      { row: 43, col: 42, location: Center.MIDDlE },
      { row: 43, col: 43, location: Center.MIDDlE },
    ]);

    assertEquals(game.getAllPlayers()[0].noOfMeeples, 6);
    assertEquals(game.getAllPlayers()[1].noOfMeeples, 6);
  });
});

describe("Testing for scoring Roads", () => {
  it("should not update score when road not completed", () => {
    const players = createDummyPlayers();
    const game = Carcassonne.initGame(
      players,
      (arr) => arr,
      dummyTilesToClaimRoad(),
    );

    placeAndDrawTiles(game, [{ row: 42, col: 43, location: Center.MIDDlE }]);

    assertEquals(game.getCurrentPlayer().points, 0);
  });

  it("should update score when placed tile joins two end of road", () => {
    const players = createDummyPlayers();
    const game = Carcassonne.initGame(
      players,
      (arr) => arr,
      dummyTilesToClaimRoad1(),
    );

    placeAndDrawTiles(game, [
      { row: 41, col: 42, location: Sides.RIGHT },
      { row: 42, col: 43 },
      { row: 41, col: 43 },
    ]);

    assertEquals(game.getAllPlayers()[0].points, 3);
  });

  it("should update score when placed tile is end of road", () => {
    const players = createDummyPlayers();
    const game = Carcassonne.initGame(
      players,
      (arr) => arr,
      dummyTilesToClaimRoad2(),
    );

    placeAndDrawTiles(game, [
      { row: 42, col: 43, location: Sides.TOP },
      { row: 41, col: 43 },
      { row: 41, col: 42 },
    ]);

    assertEquals(game.getAllPlayers()[0].points, 3);
  });

  it("should update score when placed tile completes single pair of roads", () => {
    const players = createDummyPlayers();
    const game = Carcassonne.initGame(
      players,
      (arr) => arr,
      dummyTilesToClaimRoad3(),
    );

    placeAndDrawTiles(game, [
      { row: 41, col: 42, location: Sides.RIGHT },
      { row: 41, col: 43 },
    ]);

    assertEquals(game.getAllPlayers()[0].points, 2);
  });
});
