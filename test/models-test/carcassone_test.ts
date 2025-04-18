import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { Carcassonne } from "../../src/models/carcassone.ts";
import Player from "../../src/models/player.ts";

const createPlayer = (
  username: string,
  meepleColor: string,
  isHost: boolean,
  roomId: string
): Player => {
  return new Player(username, meepleColor, isHost, roomId);
};

export const createDummyPlayers = () => {
  return [
    createPlayer("user1", "black", true, "121"),
    createPlayer("user2", "blue", false, "121"),
  ];
};

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
