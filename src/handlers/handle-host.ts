import { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";

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

const handleHost = (ctx: Context) => {
  const { roomManager } = ctx.get("context");
  const host = getHostName(ctx);
  const maxPlayers = getMaxPlayers(ctx);
  const roomId = roomManager.createRoom(host, maxPlayers);

  setCookie(ctx, "roomId", roomId);

  return ctx.redirect("/lobby", 303);
};

export { handleHost };
