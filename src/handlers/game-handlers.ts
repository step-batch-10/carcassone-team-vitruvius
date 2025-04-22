import { Context } from "hono";
import { Position, Sessions, Users } from "../models/types/models.ts";
import { Variables } from "hono/types";
import { getCookie } from "hono/cookie";
import { Carcassonne } from "../models/game/carcassonne.ts";

const parseAppContexts = (ctx: Context, ...keys: string[]) => {
  return Object.fromEntries(keys.map((key) => [key, ctx.get(key)]));
};

const getUserOfSessionId = (
  ctx: Context<{ Variables: Variables }>,
  sessions: Sessions,
  users: Users,
) => {
  const sessionID = String(getCookie(ctx, "session-id"));
  const userID = String(sessions.get(sessionID));

  return users.get(userID);
};

const getGame = (ctx: Context): Carcassonne => {
  const games = ctx.get("games");

  const roomID = String(getCookie(ctx, "room-id"));
  return games.get(roomID);
};

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

const getCurrentPlayer = (ctx: Context) => {
  const game = getGame(ctx);
  const currentPlayer = game.getCurrentPlayer();
  const userName = currentPlayer.username;
  return ctx.json(userName, 200);
};

const getSelfStatus = (ctx: Context) => {
  const appContext = parseAppContexts(ctx, "users", "sessions");
  const { users, sessions } = appContext;
  const game = getGame(ctx);

  const user = getUserOfSessionId(ctx, sessions, users);
  const username = String(user?.username);

  return ctx.json(game.getPlayerOf(username), 200);
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

const serveGameState = (ctx: Context) => {
  const game = ctx.get("game");
  const appContext = parseAppContexts(ctx, "users", "sessions");
  const { users, sessions } = appContext;

  const user = getUserOfSessionId(ctx, sessions, users);
  const username = String(user?.username);
  const self = game.getPlayerOf(username);

  return ctx.json({ ...game.state(), self }, 200);
};

export {
  drawATile,
  getCurrentPlayer,
  getSelfStatus,
  handleRotateTile,
  handleTilePlacement,
  serveCurrentTile,
  serveGameBoard,
  serveGameState,
  serveValidPositions,
};
