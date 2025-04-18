import { Carcassonne } from "./../models/carcassone.ts";
import { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";

const handleJoin = async (ctx: Context) => {
  const { roomID } = await ctx.req.parseBody();

  const sessionID = getCookie(ctx, "session-id");

  const { sessions, users, roomManager } = ctx.get("context");

  const userID = sessions.get(sessionID);
  const { username } = users.get(userID);

  if (roomManager.hasRoom(roomID)) {
    roomManager.getRoom(roomID).addPlayer(username);
    setCookie(ctx, "room-id", String(roomID));

    return ctx.json({ isRoomJoined: true }, 200);
  }

  return ctx.json({ isRoomJoined: false }, 200);
};

const generateSessionID = () => String(Date.now());
const generateUserID = () => String(Date.now() * Math.random() * 10);

const handleLogin = async (ctx: Context) => {
  const { sessions, users } = ctx.get("context");
  const { username } = await ctx.req.parseBody();
  const sessionID = generateSessionID();
  const userID = generateUserID();

  users.set(userID, { username, roomID: null });
  sessions.set(sessionID, userID);

  setCookie(ctx, "session-id", sessionID);

  return ctx.redirect("/game-options", 303);
};

const handleGetLobbyDetails = (ctx: Context) => {
  const { roomManager } = ctx.get("context");
  const roomId = getCookie(ctx, "room-id");
  if (roomManager.hasRoom(roomId)) {
    const room = roomManager.getRoom(roomId);

    return ctx.json(room.json(), 200);
  }

  return ctx.json(null, 404);
};

const getHostName = (ctx: Context): string => {
  const sessionId = getCookie(ctx, "session-id");
  const { users, sessions } = ctx.get("context");

  const userId = sessions.get(sessionId);
  return users.get(userId).username;
};

const getMaxPlayers = async (ctx: Context): Promise<number> => {
  const { maxPlayers } = await ctx.req.parseBody();

  return Number(maxPlayers);
};

const handleHost = async (ctx: Context) => {
  const { roomManager } = ctx.get("context");
  const host = getHostName(ctx);
  const maxPlayers = await getMaxPlayers(ctx);
  const roomId = roomManager.createRoom(host, maxPlayers);

  setCookie(ctx, "room-id", roomId);

  return ctx.redirect("/lobby", 303);
};

const serveGameBoard = (ctx: Context) => {
  const { games } = ctx.get("context");

  const roomID = getCookie(ctx, "room-id");
  const game: Carcassonne = games.get(roomID);
  if (!game) {
    return ctx.json({ desc: "invalid game Id" }, 200);
  }
  return ctx.json(game.getBoard(), 200);
};

const drawATile = (ctx: Context) => {
  const { games } = ctx.get("context");
  const roomID = getCookie(ctx, "room-id");
  const game: Carcassonne = games.get(roomID);

  return ctx.json(game.drawATile(), 200);
};

export {
  handleHost,
  handleGetLobbyDetails,
  handleJoin,
  handleLogin,
  serveGameBoard,
  drawATile,
};
