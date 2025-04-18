import createApp from "./app.ts";
import { Carcassonne } from "./models/carcassone.ts";
import { User } from "./models/models.ts";
import RoomManager from "./models/room-manager.ts";

const roomIdGenerator = (): string => Date.now().toString().slice(-6);

const createMeepleColorGenerator = () => {
  return () => {
    const meeplesColor = ["red", "green", "yellow", "blue", "black"];
    let count = 0;
    return (): string => {
      const meeple = meeplesColor[count];
      count = (count + 1) % meeplesColor.length;
      return meeple;
    };
  };
};

const main = () => {
  const users = new Map<string, User>();
  const sessions = new Map<string, string>();
  const roomManager = new RoomManager(
    roomIdGenerator,
    createMeepleColorGenerator()
  );
  const games = new Map<string, Carcassonne>();
  const context = { sessions, users, roomManager, games };

  Deno.serve(createApp(context).fetch);
};

main();
