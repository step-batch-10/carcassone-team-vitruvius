import { Context, Hono } from "hono";
import { serveStatic } from "hono/deno";
import { handleHost } from "./handlers/handle-host.ts";
import { MyContext } from "./models/models.ts";
import { Next } from "hono/types";
import { handleLogin, handleJoinReq } from "./handlers/request-handlers.ts";

const setContext = (context: MyContext) => {
  return (ctx: Context, next: Next) => {
    ctx.set("context", context);

    return next();
  };
};

const createHandler = (context: MyContext) => {
  const app = new Hono();

  app.use(setContext(context));
  app.get(
    "/join-page",
    serveStatic({ path: "/html/join-host.html", root: "public" })
  );

  app.post("/login", handleLogin);
  app.post("/host", handleHost);
  app.post("/joinRoom", handleJoinReq);
  app.use(serveStatic({ root: "./public" }));

  return app;
};

export default createHandler;
