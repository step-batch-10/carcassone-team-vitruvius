import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import Player from "../../src/models/room/player.ts";

describe("Player", () => {
  describe("json", () => {
    it("should return json data of player", () => {
      const playerJson = {
        username: "prasad",
        noOfMeeples: 7,
        points: 0,
        meepleColor: "red",
        isHost: false,
        roomID: "roomID",
      };

      const player = new Player("prasad", "red", false, "roomID");

      assertEquals(player.json(), playerJson);
    });
  });
});
