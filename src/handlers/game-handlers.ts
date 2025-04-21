import { Context } from "hono";
import { Variables } from "../models/ds/models.ts";
import { getCookie } from "hono/cookie";
import { Carcassonne } from "../models/game/carcassone.ts";

const getGame = (ctx: Context): Carcassonne => {
  const games = ctx.get("games");

  const roomID = String(getCookie(ctx, "room-id"));
  return games.get(roomID);
};

const serveGameBoard = (ctx: Context<{ Variables: Variables }>) => {
  const game = getGame(ctx);
  if (!game) {
    return ctx.json({ desc: "invalid game Id" }, 200);
  }
  return ctx.json(game.getBoard(), 200);
};
const drawATile = (ctx: Context) => {
  const game = getGame(ctx);

  return ctx.json(game.drawATile(), 200);
};
const serveValidPositions = (ctx: Context) => {
  const game = getGame(ctx);

  return ctx.json(game.validPositions(), 200);
};

export { serveGameBoard, drawATile, serveValidPositions };
