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
type variables = {
  context: MyContext;
};

const createHandler = (context: MyContext) => {
  const app = new Hono<{ Variables: variables }>();

  app.use(setContext(context));
  app.get(
    "/game-options",
    serveStatic({ path: "/html/game-options.html", root: "public" })
  );
  app.get("/lobby", serveStatic({ path: "/html/lobby.html", root: "public" }));

  app.post("/login", handleLogin);
  app.post("/host", handleHost);
  app.post("/joinRoom", handleJoinReq);
  app.use(serveStatic({ root: "./public" }));

  return app;
};

export default createHandler;
