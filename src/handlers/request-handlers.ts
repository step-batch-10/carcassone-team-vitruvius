import { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";

export const handleJoinReq = async (ctx: Context) => {
  const { roomId } = await ctx.req.parseBody();
  const sessionId = getCookie(ctx, "session-id");

  const context = ctx.get("context");

  const userID = context.sessions.get(sessionId);

  const { username } = context.users.get(userID);

  if (!context.roomManager.hasRoom(roomId)) {
    return ctx.json({ isRoomJoined: false }, 200);
  }

  context.roomManager.getRoom(roomId).addPlayer(username);

  return ctx.json({ isRoomJoined: true }, 200);
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
