import { Tile } from "./models.ts";
// import Player from "./player.ts";

interface SubGrid {
  feature: null | string;
  occupiedBy: string[];
}

export interface TileBox {
  tile: null | Tile;
  mapple: {
    color: null | string;
    playerName: null | string;
    region: null | string;
  };

  occupiedRegion: {
    left: SubGrid;
    top: SubGrid;
    right: SubGrid;
    bottom: SubGrid;
    middle: SubGrid;
  };
}
