import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { getCookie } from "hono/cookie";

const handleJoinReq = async (ctx) => {
  const { roomId } = await ctx.parseBody();
  const { sessionId } = getCookie(ctx);
  const context = ctx.get("context");
  const player = context.sessions.get(sessionId);

  context.gameRoom.get(roomId).addPlayer(player);

  return ctx.redirect("waitingRoom");
};

const setContext = (context) => {
  return (ctx, next) => {
    ctx.set("context", context);
    next();
  };
};

const createHandler = (context) => {
  const app = new Hono();

  app.use(setContext(context));
  app.use(serveStatic({ root: "./public" }));
  app.post("/joinRoom", handleJoinReq);

  return app;
};

export default createHandler;
