enum Feature {
  CITY = "city",
  RIVER = "river",
  ROAD = "road",
  FIELD = "field",
  MONASTERY = "monastery",
  ROAD_END = "roadEnd",
}

type Edges = [Feature, Feature, Feature, Feature];

type CardinalDegrees = 0 | 90 | 180 | 270;

interface Tile {
  id: string;
  orientation: CardinalDegrees;
  hasShield: boolean;
  //tileEdges: [L,T,R,B]
  tileEdges: Edges;
  tileCenter: Feature;
  imgPath: string;
  // CCCC-C.jpg
}

interface GameLobby {
  games: MapConstructor; // every Carcassonne game maps to its gameId
}

interface User {
  username: string;
  dob: Date;
}

interface Player {
  username: string;
  noOfMeeples: number;
  points: number;
  meepleColor: string;
}

interface TileHandler {
  tiles: Tile[];
}

interface Carcassonne {
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
