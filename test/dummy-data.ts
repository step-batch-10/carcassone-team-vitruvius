import {
  CardinalDegrees,
  Feature,
  Tile,
  TileBox,
} from "../src/models/models.ts";
import Player from "../src/models/room/player.ts";

type featureAbbr = "r" | "c" | "f" | "m" | "e";

export const createTile = (
  id: string,
  edges: featureAbbr[],
  center: featureAbbr,
  orientation = CardinalDegrees.zero,
): Tile => {
  const some = {
    r: Feature.ROAD,
    c: Feature.CITY,
    f: Feature.FIELD,
    m: Feature.MONASTERY,
    e: Feature.ROAD_END,
  };

  return {
    hasShield: false,
    id,
    orientation,
    tileCenter: some[center],
    tileEdges: edges.map((x) => some[x]),
  };
};

export const createATileBox = (): TileBox => {
  return {
    tile: null,
    meeple: { color: null, playerName: null, region: null },
    occupiedRegion: {
      left: {
        feature: null,
        occupiedBy: new Set<string>(),
        isScored: false,
      },
      top: {
        feature: null,
        occupiedBy: new Set<string>(),
        isScored: false,
      },
      right: {
        feature: null,
        occupiedBy: new Set<string>(),
        isScored: false,
      },
      bottom: {
        feature: null,
        occupiedBy: new Set<string>(),
        isScored: false,
      },
      middle: {
        feature: null,
        occupiedBy: new Set<string>(),
        isScored: false,
      },
    },
  };
};

export const dummyTiles = () => [
  createTile("2", ["r", "f", "r", "f"], "r"),

  createTile("3", ["r", "f", "r", "f"], "r"),
  createTile("3", ["r", "f", "r", "f"], "r"),

  createTile("4", ["f", "f", "f", "f"], "m"),
];

export const dummyTiles3 = () => [
  createTile("2", ["r", "c", "r", "c"], "r"),
  createTile("3", ["r", "f", "f", "r"], "r"),
  createTile("4", ["f", "r", "r", "f"], "r"),
  createTile("5", ["f", "f", "r", "r"], "r"),
];

export const dummyTiles4 = () => [
  createTile("2", ["r", "c", "f", "r"], "r"),
  createTile("3", ["f", "r", "f", "r"], "r"),
];

export const dummyTiles5 = () => [
  createTile("2", ["r", "r", "f", "f"], "r"),
  createTile("3", ["f", "r", "f", "r"], "r"),
];

export const dummyTiles2 = () => [
  createTile("3", ["m", "m", "m", "m"], "r"),
  createTile("2", ["c", "c", "c", "c"], "c"),
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

export const dummyTilesToClaimMonastery = () => {
  return [
    createTile("3", ["r", "c", "f", "r"], "r"),
    createTile("4", ["f", "r", "f", "r"], "r"),
    createTile("5", ["r", "r", "f", "f"], "r"),
    createTile("6", ["r", "f", "r", "f"], "r"),
    createTile("7", ["c", "r", "r", "f"], "r"),
    createTile("8", ["f", "r", "f", "r"], "r"),
    createTile("9", ["r", "f", "r", "r"], "r"),
    createTile("2", ["f", "f", "f", "f"], "m"),
  ];
};

export const dummyTilesToClaimMonastery1 = () => {
  return [
    createTile("2", ["f", "f", "f", "f"], "m"),
    createTile("3", ["r", "c", "f", "r"], "r"),
    createTile("4", ["f", "r", "f", "r"], "r"),
    createTile("5", ["r", "r", "f", "f"], "r"),
    createTile("6", ["r", "f", "r", "f"], "r"),
    createTile("7", ["c", "r", "r", "f"], "r"),
    createTile("8", ["f", "r", "f", "r"], "r"),
    createTile("9", ["r", "f", "r", "r"], "r"),
  ];
};

export const dummyTilesToClaimMonastery2 = () => {
  return [
    createTile("2", ["r", "f", "f", "r"], "r"),
    createTile("3", ["f", "r", "f", "r"], "r"),
    createTile("4", ["f", "f", "f", "f"], "m"),
    createTile("5", ["r", "r", "f", "c"], "r"),
    createTile("6", ["f", "f", "r", "r"], "r"),
    createTile("7", ["r", "r", "f", "f"], "r"),
    createTile("8", ["r", "f", "r", "f"], "r"),
    createTile("9", ["c", "r", "r", "f"], "r"),
    createTile("10", ["f", "r", "f", "r"], "r"),
    createTile("11", ["f", "c", "r", "r"], "r"),
    createTile("12", ["r", "r", "f", "f"], "r"),
    createTile("13", ["f", "f", "r", "r"], "r"),
    createTile("14", ["f", "f", "f", "f"], "m"),
  ];
};
export const dummyTilesToClaimMonastery3 = () => {
  return [
    createTile("2", ["f", "f", "f", "f"], "m"),
    createTile("3", ["f", "f", "f", "f"], "m"),
  ];
};

export const dummyTilesToClaimRoad = () => {
  return [
    createTile("2", ["r", "r", "r", "c"], "e"),
    createTile("3", ["r", "r", "r", "r"], "e"),
  ];
};

export const dummyTilesToClaimRoad1 = () => {
  return [
    createTile("2", ["r", "r", "r", "c"], "e"),
    createTile("3", ["r", "r", "r", "r"], "e"),
    createTile("4", ["r", "c", "f", "r"], "r"),
  ];
};

export const dummyTilesToClaimRoad2 = () => {
  return [
    createTile("3", ["r", "r", "r", "r"], "e"),
    createTile("4", ["r", "c", "f", "r"], "r"),
    createTile("2", ["r", "r", "r", "c"], "e"),
  ];
};

export const dummyTilesToClaimRoad3 = () => {
  return [
    createTile("2", ["r", "r", "r", "c"], "e"),
    createTile("3", ["r", "r", "r", "r"], "e"),
  ];
};
