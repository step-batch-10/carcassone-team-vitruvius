import { Context, Hono } from "hono";
import { serveStatic } from "hono/deno";
import { getCookie } from "hono/cookie";
import { handleHost } from "./handlers/handle-host.ts";

const handleJoinReq = async (ctx: Context) => {
  const { roomId } = await ctx.req.parseBody();
  const { sessionId } = getCookie(ctx);
  const context = ctx.get("context");
  const player = context.sessions.get(sessionId);

  context.gameRoom.get(roomId).addPlayer(player);

  return ctx.redirect("waitingRoom");
};

// const setContext = (context: any) => {
//   return (ctx: Context, next: Next) => {
//     ctx.set("context", context);
//     next();
//   };
// };

const createHandler = () => {
  const app = new Hono();

  // app.use(setContext(context));
  app.post("/host", handleHost);
  app.post("/joinRoom", handleJoinReq);
  app.use(serveStatic({ root: "./public" }));

  return app;
};

export default createHandler;
