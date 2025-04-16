import { Context, Hono } from "hono";
import { serveStatic } from "hono/deno";
import { getCookie, setCookie } from "hono/cookie";
import { handleHost } from "./handlers/handle-host.ts";
import { MyContext } from "./models/models.ts";
import { Next } from "hono/types";

const handleJoinReq = async (ctx: Context) => {
  const { roomId } = await ctx.req.parseBody();
  const { sessionId } = getCookie(ctx);
  const context = ctx.get("context");
  const player = context.sessions.get(sessionId);

  context.gameRoom.get(roomId).addPlayer(player);

  return ctx.redirect("waitingRoom");
};

const setContext = (context: MyContext) => {
  return (ctx: Context, next: Next) => {
    ctx.set("context", context);

    return next();
  };
};

const generateSessionID = () => String(Date.now());

const handleLogin = async (ctx: Context) => {
  const { sessions, users } = ctx.get("context");
  const { username, dob } = await ctx.req.parseBody();
  const sessionID = generateSessionID();

  users.set(username, { username, dob });
  sessions.set(sessionID, username);

  setCookie(ctx, "session-id", sessionID);

  return ctx.redirect("/room", 303);
};

const createHandler = (context: MyContext) => {
  const app = new Hono();

  app.use(setContext(context));
  app.get(
    "/room",
    serveStatic({ path: "/html/join-host.html", root: "public" })
  );

  app.post("/login", handleLogin);
  app.post("/host", handleHost);
  app.post("/joinRoom", handleJoinReq);
  app.use(serveStatic({ root: "./public" }));

  return app;
};

export default createHandler;
