import { Context, Hono } from "hono";
import { serveStatic } from "hono/deno";
import { AppContext } from "./models/models.ts";
import { Next } from "hono/types";
import {
  handleLogin,
  handleJoin,
  handleGetLobbyDetails,
  handleHost,
  serveGameBoard,
  drawATile,
} from "./handlers/request-handlers.ts";

const setContext = (context: AppContext) => {
  return (ctx: Context, next: Next) => {
    ctx.set("context", context);

    return next();
  };
};
type variables = {
  context: AppContext;
};

const createGameApp = () => {
  const gameApp = new Hono();
  gameApp.get("/", serveStatic({ path: "/html/game/html", root: "public" }));
  gameApp.get("/board", serveGameBoard);
  gameApp.get("/draw-tile", drawATile);
  return gameApp;
};

const createApp = (context: AppContext) => {
  const app = new Hono<{ Variables: variables }>();

  app.use(setContext(context));
  app.get(
    "/game-options",
    serveStatic({ path: "/html/game-options.html", root: "public" })
  );
  app.route("/game", createGameApp());

  app.get("/lobby", serveStatic({ path: "/html/lobby.html", root: "public" }));
  // /game/valid-positions
  app.post("/login", handleLogin);
  app.post("/host", handleHost);
  app.get("/room", handleGetLobbyDetails);
  app.post("/joinRoom", handleJoin);
  app.use(serveStatic({ root: "./public" }));

  return app;
};

export default createApp;
