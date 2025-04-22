import { Feature, TileBox } from "./../types/models.ts";
const createPosition = () => {
  return { feature: null, occupiedBy: new Set<string>() };
};

const createOccupiedRegion = () => {
  return {
    left: createPosition(),
    top: createPosition(),
    right: createPosition(),
    bottom: createPosition(),
    middle: createPosition(),
  };
};

export const createTileBox = (): TileBox => {
  return {
    tile: null,
    meeple: { color: null, playerName: null, region: null },
    occupiedRegion: createOccupiedRegion(),
  };
};

export const firstTileBox: TileBox = {
  tile: {
    id: "1",
    orientation: 0,
    hasShield: false,
    tileEdges: [Feature.ROAD, Feature.CITY, Feature.ROAD, Feature.FIELD],
    tileCenter: Feature.ROAD,
  },
  meeple: {
    color: null,
    playerName: null,
    region: null,
  },
  occupiedRegion: {
    left: { feature: Feature.ROAD, occupiedBy: new Set<string>() },
    top: { feature: Feature.CITY, occupiedBy: new Set<string>() },
    right: { feature: Feature.ROAD, occupiedBy: new Set<string>() },
    bottom: { feature: Feature.FIELD, occupiedBy: new Set<string>() },
    middle: { feature: Feature.ROAD, occupiedBy: new Set<string>() },
  },
};
