import { describe, it } from "@std/testing/bdd";
import {
  createDummyPlayers,
  createPlayer,
  dummyTiles,
  dummyTilesToClaimMonastery,
  dummyTilesToClaimMonastery1,
  dummyTilesToClaimMonastery2,
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

    placeAndDrawTiles(game, [{ row: 42, col: 43 }]);
    game.updateScore();

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
    game.updateScore();

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
    game.updateScore();

    assertEquals(game.getCurrentPlayer().points, 9);
  });

  it("should update score when the tile placed completes two monasteries", () => {
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
    game.updateScore();

    const playerScores = game.getAllPlayers();

    assertEquals(playerScores[0].points, 9);
    assertEquals(playerScores[1].points, 9);
  });

  it("should update score when the tile placed completes two monasteries", () => {
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
    game.updateScore();

    assertEquals(game.getCurrentPlayer().points, 18);
  });
});
