import { Carcassonne } from "./game/carcassonne.ts";
import RoomManager from "./room/room-manager.ts";

export enum Feature {
  CITY = "city",
  RIVER = "river",
  ROAD = "road",
  FIELD = "field",
  MONASTERY = "monastery",
  ROAD_END = "roadEnd",
}

export enum Sides {
  LEFT = "left",
  RIGHT = "right",
  TOP = "top",
  BOTTOM = "bottom",
}

export enum Center {
  MIDDLE = "middle",
}

export enum EdgesOccu {
  LEFT = "leftEdge",
  RIGHT = "rightEdge",
  TOP = "topEdge",
  BOTTOM = "bottomEdge",
}

export enum CardinalDegrees {
  zero = 0,
  ninety = 90,
  oneEighty = 180,
  twoSeventy = 270,
}

export type Position = { row: number; col: number };

export interface OccupanceSubGrid {
  feature: null | string;
  occupiedBy: Set<string>;
  isScored: boolean;
}

export type Edge = "left" | "right" | "top" | "bottom";
export interface Transpose {
  left: Edge;
  right: Edge;
  top: Edge;
  bottom: Edge;
}

export interface TileBox {
  tile: null | Tile;
  meeple: {
    color: null | string;
    playerName: null | string;
    region: null | Sides | Center;
  };

  occupiedRegion: {
    left: OccupanceSubGrid;
    top: OccupanceSubGrid;
    right: OccupanceSubGrid;
    bottom: OccupanceSubGrid;
    middle: OccupanceSubGrid;
  };
}
export interface TileEdges {
  top: string;
  bottom: string;
  right: string;
  left: string;
}

export interface Moves {
  [Sides.TOP]: (arg: Position, arg2: Set<string>) => void;
  [Sides.BOTTOM]: (arg: Position, arg2: Set<string>) => void;
  [Sides.LEFT]: (arg: Position, arg2: Set<string>) => void;
  [Sides.RIGHT]: (arg: Position, arg2: Set<string>) => void;
}

export interface ResTiles {
  leftTile: Tile | null | undefined;
  rightTile: Tile | null | undefined;
  topTile: Tile | null | undefined;
  bottomTile: Tile | null | undefined;
}
export interface Tile {
  id: string;
  orientation: CardinalDegrees;
  hasShield: boolean;
  tileEdges: Feature[];
  tileCenter: Feature;
  tileID: string;
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

export interface AppVariables {
  sessions: Map<string, string>;
  users: Map<string, User>;
  roomManager: RoomManager;
  games: Map<string, Carcassonne>;
}

export interface GameVariables {
  game: Carcassonne;
}

export type Sessions = Map<string, string>;

export type Users = Map<string, User>;

export interface AppContext {
  sessions: Sessions;
  users: Users;
  roomManager: RoomManager;
  games: Map<string, Carcassonne>;
}

export interface GameContext {
  game: Carcassonne;
}
export type resPositions = (arg0: Position) => {
  left: Position;
  top: Position;
  right: Position;
  bottom: Position;
};

export interface RespectivePosition {
  (position: Position): {
    left: Position;
    right: Position;
    top: Position;
    bottom: Position;
  };
  (arg0: Position): {
    left: Position;
    top: Position;
    right: Position;
    bottom: Position;
  };
}
