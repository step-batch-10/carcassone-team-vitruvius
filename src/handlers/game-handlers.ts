import { Context } from "hono";
import { Position } from "../models/types/models.ts";
import { getCookie } from "hono/cookie";
import { Carcassonne } from "../models/game/carcassonne.ts";

const serveGameBoard = (ctx: Context) => {
  const game = ctx.get("game");

  return ctx.json(game.getBoard(), 200);
};

const drawATile = (ctx: Context) => {
  const game = ctx.get("game");

  return ctx.json(game.drawATile(), 200);
};

const serveValidPositions = (ctx: Context) => {
  const game = ctx.get("game");

  return ctx.json(game.validPositions(), 200);
};

const handleTilePlacement = async (ctx: Context) => {
  const game = ctx.get("game");
  const position: Position = await ctx.req.json();
  const desc = game.placeATile(position);

  if (desc) return ctx.json(desc, 400);

  return ctx.json(null, 201);
};

const serveCurrentTile = (ctx: Context) => {
  const game = ctx.get("game");

  return ctx.json(game.getCurrentTile(), 200);
};

const handleRotateTile = (ctx: Context) => {
  const games = ctx.get("games");

  const roomID = String(getCookie(ctx, "room-id"));
  const game = games.get(roomID);
  const rotatedTile = game.rotateCurrentTile();
  return ctx.json(rotatedTile, 200);
};

export {
  serveGameBoard,
  serveCurrentTile,
  drawATile,
  serveValidPositions,
  handleTilePlacement,
  handleRotateTile,
};
