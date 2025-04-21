import { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { Sessions, Users, Variables } from "../models/types/models.ts";
import RoomManager from "../models/room/room-manager.ts";

const parseAppContexts = (ctx: Context, ...keys: string[]) => {
  return Object.fromEntries(keys.map((key) => [key, ctx.get(key)]));
};



const getUserOfSessionId = (
  ctx: Context<{ Variables: Variables }>,
  sessions: Sessions,
  users: Users
) => {
  const sessionID = String(getCookie(ctx, "session-id"));
  const userID = String(sessions.get(sessionID));

  return users.get(userID);
};

const joinPlayerInRoom = (
  ctx: Context<{ Variables: Variables }>,
  roomManager: RoomManager,
  roomID: string,
  username: string
) => {
  if (!roomManager.hasRoom(roomID)) {
    return ctx.json({ isRoomJoined: false }, 200);
  }

  const room = roomManager.getRoom(roomID);
  const games = ctx.get("games");

  room?.addPlayer(String(username));
  setCookie(ctx, "room-id", String(roomID));

  const game = room?.createGame();

  if (game) games.set(roomID, game);

  return ctx.json({ isRoomJoined: true }, 200);
};

const getHostName = (ctx: Context<{ Variables: Variables }>): string => {
  const sessionId = getCookie(ctx, "session-id");
  const { users, sessions } = parseAppContexts(ctx, "users", "sessions");

  const userId = sessions.get(sessionId);
  return users.get(userId).username;
};

const parseMaxPlayers = async (ctx: Context): Promise<number> => {
  const { maxPlayers } = await ctx.req.parseBody();

  return Number(maxPlayers);
};

const handleHost = async (ctx: Context<{ Variables: Variables }>) => {
  const roomManager = ctx.get("roomManager");
  const host = getHostName(ctx);
  const maxPlayers = await parseMaxPlayers(ctx);
  const roomId = roomManager.createRoom(host, maxPlayers);

  setCookie(ctx, "room-id", roomId);

  return ctx.redirect("/lobby", 303);
};

const handleJoin = async (ctx: Context<{ Variables: Variables }>) => {
  const formData = await ctx.req.parseBody();
  const roomID = String(formData.roomID);

  const appContext = parseAppContexts(ctx, "users", "sessions", "roomManager");
  const { users, sessions, roomManager } = appContext;

  const user = getUserOfSessionId(ctx, sessions, users);
  const username = String(user?.username);

  return joinPlayerInRoom(ctx, roomManager, roomID, username);
};

const generateSessionID = () => String(Date.now());
const generateUserID = () => String(Date.now() * Math.random() * 10);

const handleLogin = async (ctx: Context<{ Variables: Variables }>) => {
  const { sessions, users } = parseAppContexts(ctx, "sessions", "users");

  const { username } = await ctx.req.parseBody();
  const sessionID = generateSessionID();
  const userID = generateUserID();

  users.set(userID, { username, roomID: null });
  sessions.set(sessionID, userID);

  setCookie(ctx, "session-id", sessionID);

  return ctx.redirect("/game-options", 303);
};

const handleGetLobbyDetails = (ctx: Context<{ Variables: Variables }>) => {
  const roomManager = ctx.get("roomManager");
  const roomId = String(getCookie(ctx, "room-id"));

  if (roomManager.hasRoom(roomId)) {
    const room = roomManager.getRoom(roomId);

    return ctx.json(room?.json(), 200);
  }

  return ctx.json(null, 404);
};

export {
  handleHost,
  handleGetLobbyDetails,
  handleJoin,
  handleLogin,
};
