import {
  Feature,
  OccupanceSubGrid,
  Position,
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
}

// export const shuffler = (tiles: Tile[]): Tile[] => {
//   return tiles.sort(() => Math.random() - 0.5);
// };

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
