import GameRoom from "./game-room.ts";

type stringIdentity = () => string;

class RoomManager {
  private rooms: Map<string, GameRoom>;
  private roomIDGenerator: stringIdentity;
  private createMeepleColorGenerator: () => stringIdentity;

  constructor(
    roomIDGenerator: stringIdentity,
    createMeepleColorGenerator: () => stringIdentity,
  ) {
    this.rooms = new Map();
    this.roomIDGenerator = roomIDGenerator;
    this.createMeepleColorGenerator = createMeepleColorGenerator;
  }

  createRoom(host: string, maxPlayers: number): string {
    const roomID = this.roomIDGenerator();
    const room = new GameRoom(
      maxPlayers,
      host,
      roomID,
      this.createMeepleColorGenerator(),
    );

    this.rooms.set(roomID, room);

    return roomID;
  }

  hasRoom(roomID: string): boolean {
    return this.rooms.has(roomID);
  }

  getRoom(roomID: string): GameRoom | null {
    return this.rooms.get(roomID) ?? null;
  }
}

export default RoomManager;
