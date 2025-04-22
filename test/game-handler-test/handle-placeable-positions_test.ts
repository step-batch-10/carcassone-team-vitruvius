// import {
//   createDummyPlayers,
//   dummyTiles,
// } from "../../src/models/game/dummy-data-for-test.ts";

// import { Carcassonne } from "../../src/models/game/carcassonne.ts";
// import { assertEquals } from "@std/assert";
// import { describe, it } from "@std/testing/bdd";
// import createApp from "../../src/app.ts";
// import { AppContext, Tile, User } from "../../src/models/types/models.ts";
// import RoomManager from "../../src/models/room/room-manager.ts";

// describe("testing handlePlaceablePositions test", () => {
//   it("should return a object with unlockedPositions and placablePositions", async () => {
//     const sessions = new Map<string, string>();
//     const users = new Map<string, User>();
//     const roomManager = new RoomManager(
//       () => "1",
//       () => () => "red"
//     );
//     const games = new Map<string, Carcassonne>();
//     games.set(
//       "1",
//       Carcassonne.initGame(
//         createDummyPlayers(),
//         (arr: Tile[]): Tile[] => arr,
//         dummyTiles
//       )
//     );

//     const context: AppContext = { sessions, users, roomManager, games };

//     const app = createApp(context);

//     const response = await app.request("/game/tile/placeable-positions", {
//       method: "GET",
//       headers: {
//         cookie: "room-id=1",
//       },
//     });

//     assertEquals(await response.json(), {
//       placablePositions: [],
//       unlockedPositions: [
//         {
//           col: 42,
//           row: 41,
//         },
//         {
//           col: 41,
//           row: 42,
//         },
//         {
//           col: 43,
//           row: 42,
//         },
//         {
//           col: 42,
//           row: 43,
//         },
//       ],
//     });
//   });
// });
