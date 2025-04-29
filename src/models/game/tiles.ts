import {
  Center,
  Feature,
  OccupanceSubGrid,
  Position,
  Sides,
  Tile,
  TileBox,
  TileEdges,
} from "../models.ts";

export class TileBoxManager {
  private board: TileBox[][];
  private readonly maxRow: number;
  private readonly maxCol: number;
  constructor(board: TileBox[][]) {
    this.board = board;
    this.maxRow = board.length;
    this.maxCol = board[0].length;
  }

  adjacentPosition(position: Position) {
    const { row, col } = position;
    return {
      left: { row, col: col - 1 },
      right: { row, col: col + 1 },
      top: { row: row - 1, col },
      bottom: { row: row + 1, col },
      topLeft: { row: row - 1, col: col - 1 },
      topRight: { row: row - 1, col: col + 1 },
      bottomLeft: { row: row + 1, col: col - 1 },
      bottomRight: { row: row + 1, col: col + 1 },
    };
  }

  extractEdges(tile: Tile): TileEdges {
    const edges = {
      left: tile.tileEdges[0],
      top: tile.tileEdges[1],
      right: tile.tileEdges[2],
      bottom: tile.tileEdges[3],
    };

    return edges;
  }

  getOccupiedBy(position: Position, edge: Sides | Center) {
    return this.getCell(position)!.occupiedRegion[edge].occupiedBy;
  }

  isClaimed(position: Position) {
    return this.getCell(position)!.occupiedRegion.middle.occupiedBy.size > 0;
  }

  getCell(position: Position) {
    const { row, col } = position;
    if (row < 0 || col < 0 || row >= this.maxRow || col >= this.maxCol) {
      return null;
    }

    return this.board[row][col];
  }

  getTile(position: Position) {
    return this.getCell(position)?.tile;
  }

  isScored(position: Position, edge: Sides | Center) {
    return this.getCell(position)!.occupiedRegion[edge].isScored;
  }

  adjacentCells(position: Position) {
    const resPosition = this.adjacentPosition(position);
    return {
      leftCell: this.getCell(resPosition.left),
      rightCell: this.getCell(resPosition.right),
      topCell: this.getCell(resPosition.top),
      bottomCell: this.getCell(resPosition.bottom),
    };
  }

  adjacentTile(position: Position) {
    const adjCells = this.adjacentCells(position);
    return {
      leftTile: adjCells.leftCell?.tile,
      rightTile: adjCells.rightCell?.tile,
      topTile: adjCells.topCell?.tile,
      bottomTile: adjCells.bottomCell?.tile,
    };
  }

  adjacentOccupiedRegion(position: Position) {
    const adjCells = this.adjacentCells(position);

    return {
      leftEdge: adjCells.leftCell?.occupiedRegion.right,
      topEdge: adjCells.topCell?.occupiedRegion.bottom,
      rightEdge: adjCells.rightCell?.occupiedRegion.left,
      bottomEdge: adjCells.bottomCell?.occupiedRegion.top,
    };
  }

  adjacentPositionArray(position: Position): Position[] {
    return Object.values(this.adjacentPosition(position));
  }

  private hasOccupied(pos: Position, edge: Sides) {
    return this.getOccupiedBy(pos, edge).size > 0;
  }

  notScoredEdges(traverse: Set<string>, pos: Position, edges: Sides[]) {
    const adj = this.adjacentPosition(pos);

    for (const edge of edges) {
      if (
        traverse.has(JSON.stringify(adj[edge])) &&
        this.hasOccupied(pos, edge)
      ) {
        return { except: edges.filter((tempEdge) => tempEdge !== edge), edge };
      }
    }
    return { edge: Sides.LEFT, except: [] };
  }

  getLastEdge(traverse: Set<string>, edges: Sides[]) {
    for (const t of traverse.values()) {
      if (
        this.getCell(JSON.parse(t))!.occupiedRegion.middle.feature !==
          Feature.ROAD
      ) {
        return {
          lastEdge: this.notScoredEdges(traverse, JSON.parse(t), edges).edge,
          position: JSON.parse(t),
        };
      }
    }

    return { lastEdge: Sides.LEFT, position: { row: 42, col: 42 } };
  }

  hasFeature(position: Position, feature: Feature, subGrid: Sides | Center) {
    return this.getCell(position)!.occupiedRegion[subGrid].feature === feature;
  }

  isOccupied(position: Position, edge: Sides | Center) {
    return this.getOccupiedBy(position, edge).size > 0;
  }

  // isScored(position: Position) {
  //   return this.getCell(position)?.occupiedRegion.middle.isScored;
  // }
}

export class TileStacker {
  private readonly tilesStack;

  constructor(tiles: Tile[], tileShuffler: (tiles: Tile[]) => Tile[]) {
    const shuffledTile = tileShuffler([...tiles]);
    this.tilesStack = shuffledTile;
  }

  getStack() {
    return this.tilesStack;
  }

  pushTile(tile: Tile) {
    this.tilesStack.push(tile);
  }

  pickTile(): Tile | null {
    const pickedTile = this.tilesStack.shift();

    return pickedTile || null;
  }

  remainingTile(): number {
    return this.tilesStack.length;
  }
}

const createPosition = (): OccupanceSubGrid => {
  return { feature: null, occupiedBy: new Set<string>(), isScored: false };
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

export const firstTileBox = (): TileBox => ({
  tile: {
    id: "19",
    orientation: 0,
    hasShield: false,
    tileEdges: [Feature.ROAD, Feature.CITY, Feature.ROAD, Feature.FIELD],
    tileCenter: Feature.ROAD,
    tileID: "44",
  },
  meeple: {
    color: null,
    playerName: null,
    region: null,
  },
  occupiedRegion: {
    left: {
      feature: Feature.ROAD,
      occupiedBy: new Set<string>(),
      isScored: false,
    },
    top: {
      feature: Feature.CITY,
      occupiedBy: new Set<string>(),
      isScored: false,
    },
    right: {
      feature: Feature.ROAD,
      occupiedBy: new Set<string>(),
      isScored: false,
    },
    bottom: {
      feature: Feature.FIELD,
      occupiedBy: new Set<string>(),
      isScored: false,
    },
    middle: {
      feature: Feature.ROAD,
      occupiedBy: new Set<string>(),
      isScored: false,
    },
  },
});
