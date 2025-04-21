import GameRoom from "./game-room.ts";

type stringIdentity = () => string;

class RoomManager {
  private rooms: Map<string, GameRoom>;
  private roomIdGenerator: stringIdentity;
  private createMeepleColorGenerator: () => stringIdentity;

  constructor(
    roomIdGenerator: stringIdentity,
    createMeepleColorGenerator: () => stringIdentity
  ) {
    this.rooms = new Map();
    this.roomIdGenerator = roomIdGenerator;
    this.createMeepleColorGenerator = createMeepleColorGenerator;
  }

  createRoom(host: string, maxPlayers: number): string {
    const roomId = this.roomIdGenerator();
    const room = new GameRoom(
      maxPlayers,
      host,
      roomId,
      this.createMeepleColorGenerator()
    );

    this.rooms.set(roomId, room);

    return roomId;
  }

  hasRoom(roomId: string): boolean {
    return this.rooms.has(roomId);
  }

  getRoom(roomId: string): GameRoom | null {
    return this.rooms.get(roomId) ?? null;
  }
}

export default RoomManager;
