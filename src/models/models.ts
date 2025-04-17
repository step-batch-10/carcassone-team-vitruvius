import Player from "./player.ts";
import RoomManager from "./room-manager.ts";

export enum Feature {
  CITY = "city",
  RIVER = "river",
  ROAD = "road",
  FIELD = "field",
  MONASTERY = "monastery",
  ROAD_END = "roadEnd",
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
  imgPath: string;
  // CCCC-C.jpg
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

interface TileHandler {
  tiles: Tile[];
}

export interface Carcassonne {
  tileHandler: TileHandler;
  players: Player[];
  board: Cell[][];
}

type SubGrid = "left" | "top" | "right" | "bottom" | "center";

interface PlacedMeeple {
  feature: Feature;
  playerId: string;
  tileId: string;
  subGrid: SubGrid;
}

interface Cell {
  tile: null | Tile;
  placedMeeple: PlacedMeeple | null;
}

export interface MyContext {
  sessions: Map<string, string>;
  users: Map<string, User>;
  roomManager: RoomManager;
}
