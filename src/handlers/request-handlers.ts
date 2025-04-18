import { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";

export const handleJoin = async (ctx: Context) => {
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

export const handleLogin = async (ctx: Context) => {
  const { sessions, users } = ctx.get("context");
  const { username } = await ctx.req.parseBody();
  const sessionID = generateSessionID();
  const userID = generateUserID();

  users.set(userID, { username, roomID: null });
  sessions.set(sessionID, userID);

  setCookie(ctx, "session-id", sessionID);

  return ctx.redirect("/game-options", 303);
};

export const handleGetLobbyDetails = (ctx: Context) => {
  const { roomManager } = ctx.get("context");
  const roomId = getCookie(ctx, "room-id");
  if (roomManager.hasRoom(roomId)) {
    const room = roomManager.getRoom(roomId);

    return ctx.json(room.json(), 200);
  }

  return ctx.json(null, 404);
};
