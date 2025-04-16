import { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";

export const handleJoinReq = async (ctx: Context) => {
  const { roomId } = await ctx.req.parseBody();
  const { sessionId } = getCookie(ctx);

  const context = ctx.get("context");
  const playerName = context.sessions.get(sessionId);

  const player = context.users.get(playerName);

  // context.gameRoom.get(roomId).addPlayer(player);
  console.log(player, roomId);

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
