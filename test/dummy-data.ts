import {
  CardinalDegrees,
  Feature,
  Tile,
  TileBox,
} from "../src/models/models.ts";
import Player from "../src/models/room/player.ts";

type featureAbbr = "r" | "c" | "f" | "m" | "e";

export const createDummyTile = (
  id: string,
  edges: featureAbbr[],
  center: featureAbbr,
  orientation = CardinalDegrees.zero,
  tileID = "0",
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
    tileID,
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
  createDummyTile("2", ["r", "f", "r", "f"], "r"),
  createDummyTile("3", ["r", "f", "r", "f"], "r"),
  createDummyTile("4", ["r", "f", "r", "f"], "r"),
  createDummyTile("5", ["f", "f", "f", "f"], "m"),
];

export const dummyTiles3 = () => [
  createDummyTile("2", ["r", "c", "r", "c"], "r"),
  createDummyTile("3", ["r", "f", "f", "r"], "r"),
  createDummyTile("4", ["f", "r", "r", "f"], "r"),
  createDummyTile("5", ["f", "f", "r", "r"], "r"),
];

export const dummyTiles4 = () => [
  createDummyTile("2", ["r", "c", "f", "r"], "r"),
  createDummyTile("3", ["f", "r", "f", "r"], "r"),
];

export const dummyTiles5 = () => [
  createDummyTile("2", ["r", "r", "f", "f"], "r"),
  createDummyTile("3", ["f", "r", "f", "r"], "r"),
];

export const dummyTiles2 = () => [
  createDummyTile("3", ["m", "m", "m", "m"], "r"),
  createDummyTile("2", ["c", "c", "c", "c"], "c"),
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

export const monasteryTiles = () => {
  return [
    createDummyTile("3", ["r", "c", "f", "r"], "r"),
    createDummyTile("4", ["f", "r", "f", "r"], "r"),
    createDummyTile("5", ["r", "r", "f", "f"], "r"),
    createDummyTile("6", ["r", "f", "r", "f"], "r"),
    createDummyTile("7", ["c", "r", "r", "f"], "r"),
    createDummyTile("8", ["f", "r", "f", "r"], "r"),
    createDummyTile("9", ["r", "f", "r", "r"], "r"),
    createDummyTile("2", ["f", "f", "f", "f"], "m"),
  ];
};

export const monasteryTiles1 = () => {
  return [
    createDummyTile("2", ["f", "f", "f", "f"], "m"),
    createDummyTile("3", ["r", "c", "f", "r"], "r"),
    createDummyTile("4", ["f", "r", "f", "r"], "r"),
    createDummyTile("5", ["r", "r", "f", "f"], "r"),
    createDummyTile("6", ["r", "f", "r", "f"], "r"),
    createDummyTile("7", ["c", "r", "r", "f"], "r"),
    createDummyTile("8", ["f", "r", "f", "r"], "r"),
    createDummyTile("9", ["r", "f", "r", "r"], "r"),
  ];
};

export const monasteryTiles2 = () => {
  return [
    createDummyTile("2", ["r", "f", "f", "r"], "r"),
    createDummyTile("3", ["f", "r", "f", "r"], "r"),
    createDummyTile("4", ["f", "f", "f", "f"], "m"),
    createDummyTile("5", ["r", "r", "f", "c"], "r"),
    createDummyTile("6", ["f", "f", "r", "r"], "r"),
    createDummyTile("7", ["r", "r", "f", "f"], "r"),
    createDummyTile("8", ["r", "f", "r", "f"], "r"),
    createDummyTile("9", ["c", "r", "r", "f"], "r"),
    createDummyTile("10", ["f", "r", "f", "r"], "r"),
    createDummyTile("11", ["f", "c", "r", "r"], "r"),
    createDummyTile("12", ["r", "r", "f", "f"], "r"),
    createDummyTile("13", ["f", "f", "r", "r"], "r"),
    createDummyTile("14", ["f", "f", "f", "f"], "m"),
  ];
};
export const monasteryTiles3 = () => {
  return [
    createDummyTile("2", ["f", "f", "f", "f"], "m"),
    createDummyTile("3", ["f", "f", "f", "f"], "m"),
  ];
};

export const roadTiles = () => {
  return [
    createDummyTile("2", ["r", "r", "r", "c"], "e"),
    createDummyTile("3", ["r", "r", "r", "r"], "e"),
  ];
};

export const roadTiles1 = () => {
  return [
    createDummyTile("2", ["r", "r", "r", "c"], "e"),
    createDummyTile("3", ["r", "r", "r", "r"], "e"),
    createDummyTile("4", ["r", "c", "f", "r"], "r"),
  ];
};

export const roadTiles2 = () => {
  return [
    createDummyTile("3", ["r", "r", "r", "r"], "e"),
    createDummyTile("4", ["r", "c", "f", "r"], "r"),
    createDummyTile("2", ["r", "r", "r", "c"], "e"),
  ];
};

export const roadTiles3 = () => {
  return [
    createDummyTile("2", ["r", "r", "r", "c"], "e"),
    createDummyTile("3", ["r", "r", "r", "r"], "e"),
  ];
};

export const roadTile4 = () => {
  return [
    createDummyTile("2", ["r", "c", "r", "r"], "e"),
    createDummyTile("3", ["r", "f", "r", "f"], "r"),
    createDummyTile("4", ["c", "c", "r", "r"], "c"),
    createDummyTile("5", ["r", "r", "f", "f"], "r"),
    createDummyTile("6", ["r", "c", "r", "r"], "e"),
  ];
};

export const roadTile5 = () => {
  return [
    createDummyTile("2", ["r", "c", "r", "r"], "e"),
    createDummyTile("3", ["c", "c", "r", "c"], "c"),
    createDummyTile("4", ["r", "f", "f", "f"], "m"),
  ];
};
