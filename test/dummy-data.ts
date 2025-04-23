import { Feature, Tile, TileBox } from "../src/models/types/models.ts";
import Player from "../src/models/room/player.ts";

export const createTile = (
  id: string,
  edges: [Feature, Feature, Feature, Feature],
  center: Feature,
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
  id: string = "1",
  edges: [Feature, Feature, Feature, Feature] | null = null,
  center: Feature = Feature.ROAD,
): TileBox => {
  const tile = edges ? createTile(id, edges, center) : null;
  edges = edges
    ? edges
    : [Feature.CITY, Feature.CITY, Feature.CITY, Feature.CITY];
  return {
    tile: tile,
    meeple: { color: null, playerName: null, region: null },
    occupiedRegion: {
      left: { feature: edges[0], occupiedBy: new Set<string>() },
      top: { feature: edges[1], occupiedBy: new Set<string>() },
      right: { feature: edges[2], occupiedBy: new Set<string>() },
      bottom: { feature: edges[3], occupiedBy: new Set<string>() },
      middle: { feature: center, occupiedBy: new Set<string>() },
    },
  };
};

export const dummyTiles = () => [
  createTile(
    "2",
    [Feature.ROAD, Feature.FIELD, Feature.ROAD, Feature.FIELD],
    Feature.ROAD,
  ),

  createTile(
    "3",
    [Feature.ROAD, Feature.FIELD, Feature.ROAD, Feature.FIELD],
    Feature.ROAD,
  ),
];

export const dummyTiles3 = () => [
  createTile(
    "2",
    [Feature.ROAD, Feature.CITY, Feature.ROAD, Feature.CITY],
    Feature.ROAD,
  ),

  createTile(
    "3",
    [Feature.ROAD, Feature.FIELD, Feature.FIELD, Feature.ROAD],
    Feature.ROAD,
  ),

  createTile(
    "4",
    [Feature.FIELD, Feature.ROAD, Feature.ROAD, Feature.FIELD],
    Feature.ROAD,
  ),
  createTile(
    "5",
    [Feature.FIELD, Feature.FIELD, Feature.ROAD, Feature.ROAD],
    Feature.ROAD,
  ),
];

export const dummyTiles4 = () => [
  createTile(
    "2",
    [Feature.ROAD, Feature.CITY, Feature.FIELD, Feature.ROAD],
    Feature.ROAD,
  ),
  createTile(
    "3",
    [Feature.FIELD, Feature.ROAD, Feature.FIELD, Feature.ROAD],
    Feature.ROAD,
  ),
];

export const dummyTiles5 = () => [
  createTile(
    "2",
    [Feature.ROAD, Feature.ROAD, Feature.FIELD, Feature.FIELD],
    Feature.ROAD,
  ),
  createTile(
    "3",
    [Feature.FIELD, Feature.ROAD, Feature.FIELD, Feature.ROAD],
    Feature.ROAD,
  ),
];

export const dummyTiles2 = () => [
  createTile(
    "3",
    [
      Feature.MONASTERY,
      Feature.MONASTERY,
      Feature.MONASTERY,
      Feature.MONASTERY,
    ],
    Feature.ROAD,
  ),
  createTile(
    "2",
    [Feature.CITY, Feature.CITY, Feature.CITY, Feature.CITY],
    Feature.CITY,
  ),
];

export const createPlayer = (
  username: string,
  meepleColor: string,
  isHost: boolean,
  roomID: string,
): Player => {
  return new Player(username, meepleColor, isHost, roomID);
};

export const createDummyPlayers = () => {
  return [
    createPlayer("user1", "black", true, "121"),
    createPlayer("user2", "blue", false, "121"),
  ];
};
