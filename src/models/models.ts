import { Carcassonne } from "./carcassone.ts";
import RoomManager from "./room-manager.ts";

export type Position = { row: number; col: number };

interface OcupanceSubGrid {
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
    left: OcupanceSubGrid;
    top: OcupanceSubGrid;
    right: OcupanceSubGrid;
    bottom: OcupanceSubGrid;
    middle: OcupanceSubGrid;
  };
}
export type TileEdges = {
  top: string;
  bottom: string;
  right: string;
  left: string;
};
export type ResTiles = {
  leftTile: Tile | null;
  rightTile: Tile | null;
  topTile: Tile | null;
  bottomTile: Tile | null;
};

export enum Feature {
  CITY = "city",
  RIVER = "river",
  ROAD = "road",
  FIELD = "field",
  MONASTERY = "monastery",
  ROAD_END = "endOfRoad",
}

type Edges = [Feature, Feature, Feature, Feature];

export enum CardinalDegrees {
  zero = 0,
  ninety = 90,
  oneEighty = 180,
  twoSeventy = 270,
}

export interface Tile {
  id: string;
  orientation: CardinalDegrees;
  hasShield: boolean;
  //tileEdges: [L,T,R,B]
  tileEdges: Edges;
  tileCenter: Feature;
}

export interface User {
  username: string;
  roomID: string | null;
}
export interface PlayerJson {
  username: string;
  noOfMeeples: number;
  points: number;
  meepleColor: string;
  isHost: boolean;
  roomID: string;
}

export enum GameStatus {
  WAITING = "waiting",
  IN_PLAY = "inPlay",
}
export interface GameRoomJson {
  maxPlayers: number;
  players: PlayerJson[];
  roomID: string;
  host: string;
  gameStatus: GameStatus;
}

type SubGrid = "left" | "top" | "right" | "bottom" | "center";

interface PlacedMeeple {
  feature: Feature;
  playerId: string;
  tileId: string;
  subGrid: SubGrid;
}

export interface AppContext {
  sessions: Map<string, string>;
  users: Map<string, User>;
  roomManager: RoomManager;
  games: Map<string, Carcassonne>;
}
