import createApp from "./app.ts";
import { Carcassonne } from "./models/game/carcassonne.ts";
import { User } from "./models/models.ts";
import RoomManager from "./models/room/room-manager.ts";
import { logger } from "hono/logger";

const roomIDGenerator = (): string => Date.now().toString().slice(-6);

const createMeepleColorGenerator = () => {
  return () => {
    const meeplesColor = [
      "hunyadi-yellow",
      "sea-green",
      "carolina-blue",
      "charcoal",
      "lapis-lazuli",
    ];
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
    roomIDGenerator,
    createMeepleColorGenerator(),
  );
  const games = new Map<string, Carcassonne>();
  const context = { sessions, users, roomManager, games };

  Deno.serve(createApp(context, logger()).fetch);
};

main();
