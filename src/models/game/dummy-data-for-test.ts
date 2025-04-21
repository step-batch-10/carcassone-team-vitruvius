import { Feature, Tile, TileBox } from "../ds/models.ts";
import Player from "../room/player.ts";

export const createTile = (
  id: string,
  edges: [Feature, Feature, Feature, Feature],
  center: Feature
): Tile => {
  return {
    hasShield: false,
    id,
    orientation: 0,
    tileCenter: center,
    tileEdges: edges,
  };
};

export const createATileBox = (
  id: string,
  edges: [Feature, Feature, Feature, Feature],
  center: Feature
): TileBox => {
  return {
    tile: createTile(id, edges, center),
    mapple: { color: null, playerName: null, region: null },
    occupiedRegion: {
      left: { feature: null, occupiedBy: [] },
      top: { feature: null, occupiedBy: [] },
      right: { feature: null, occupiedBy: [] },
      bottom: { feature: null, occupiedBy: [] },
      middle: { feature: null, occupiedBy: [] },
    },
  };
};

export const dummyTiles = [
  createTile(
    "2",
    [Feature.ROAD, Feature.FIELD, Feature.ROAD, Feature.FIELD],
    Feature.ROAD
  ),

  createTile(
    "3",
    [Feature.ROAD, Feature.FIELD, Feature.ROAD, Feature.FIELD],
    Feature.ROAD
  ),
];

export const dummyTiles2 = [
  createTile(
    "3",
    [
      Feature.MONASTERY,
      Feature.MONASTERY,
      Feature.MONASTERY,
      Feature.MONASTERY,
    ],
    Feature.ROAD
  ),
  createTile(
    "2",
    [Feature.CITY, Feature.CITY, Feature.CITY, Feature.CITY],
    Feature.CITY
  ),
];

export const createPlayer = (
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
