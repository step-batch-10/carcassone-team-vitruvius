import createHandler from "./app.ts";
import { User } from "./models/models.ts";
import RoomManager from "./models/room-manager.ts";

const idGenerator = (): string => {
  const timestamp = Date.now().toString();
  const randomPart = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  const id = timestamp.slice(-5) + randomPart;
  return id;
};

const meepleColorGenerator = () => {
  const meeplesColor = ["red", "green", "yellow", "blue", "black"];
  let count = 0;
  return (): string => {
    const meeple = meeplesColor[count];
    count = (count + 1) % meeplesColor.length;
    return meeple;
  };
};

const main = () => {
  const users = new Map<string, User>();
  const sessions = new Map<string, string>();
  const roomManager = new RoomManager(idGenerator, meepleColorGenerator());
  const context = { sessions, users, roomManager };

  Deno.serve(createHandler(context).fetch);
};

main();
