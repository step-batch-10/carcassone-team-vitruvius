import GameRoom from "./game-room.ts";

type stringIdentity = () => string;

class RoomManager {
  private rooms: Map<string, GameRoom>;
  private idGenerator: stringIdentity;
  private meepleColorGenerator: stringIdentity;

  constructor(
    idGenerator: stringIdentity,
    meepleColorGenerator: stringIdentity
  ) {
    this.rooms = new Map();
    this.idGenerator = idGenerator;
    this.meepleColorGenerator = meepleColorGenerator;
  }

  createRoom(host: string, maxPlayers: number): string {
    const roomId = this.idGenerator();
    const room = new GameRoom(
      maxPlayers,
      host,
      roomId,
      this.meepleColorGenerator
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
