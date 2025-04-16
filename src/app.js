import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { getCookie } from "hono/cookie";

const handleJoinReq = async (ctx) => {
  const { roomId } = await ctx.parseBody();
  const { sessionId } = getCookie(ctx);
  const context = ctx.get("context");
  const player = context.sessions.get(sessionId);

  context.gameRoom.get(roomId).addPlayer(player);
};

const createHandler = () => {
  const app = new Hono();

  app.use(serveStatic({ root: "./public" }));
  app.post("/joinRoom", handleJoinReq);
  app.post("/host", handle);

  return app;
};

export default createHandler;
