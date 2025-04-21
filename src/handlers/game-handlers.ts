import { Context } from "hono";
import { Position, Variables } from "../models/ds/models.ts";
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

const handleTilePlacement = async (ctx: Context) => {
  const game = getGame(ctx);
  const position: Position = await ctx.req.json();
  const desc = game.placeATile(position);
  if (desc) return ctx.json(desc, 400);
  return ctx.json(null, 201);
};

export { serveGameBoard, drawATile, serveValidPositions, handleTilePlacement };
