import { Context, Hono } from "hono";
import { serveStatic } from "hono/deno";
import { AppContext } from "./models/models.ts";
import { MiddlewareHandler, Next } from "hono/types";
import { Variables } from "./models/models.ts";
import {
  handleLogin,
  handleJoin,
  handleGetLobbyDetails,
  handleHost,
  serveGameBoard,
  drawATile,
} from "./handlers/request-handlers.ts";

const setContext = (
  appContext: AppContext
): MiddlewareHandler<{ Variables: Variables }> => {
  return async (ctx: Context<{ Variables: Variables }>, next: Next) => {
    const { sessions, users, roomManager, games } = appContext;

    ctx.set("sessions", sessions);
    ctx.set("users", users);
    ctx.set("roomManager", roomManager);
    ctx.set("games", games);

    await next();
  };
};

const createGameApp = () => {
  const gameApp = new Hono();
  gameApp.get("/", serveStatic({ path: "/html/game/html", root: "public" }));
  gameApp.get("/board", serveGameBoard);
  gameApp.get("/draw-tile", drawATile);
  return gameApp;
};

const createApp = (appContext: AppContext) => {
  const app = new Hono<{ Variables: Variables }>();

  app.use(setContext(appContext));
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
