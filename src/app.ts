import { getCookie } from "hono/cookie";
import { serveStatic } from "hono/deno";
import { AppContext, AppVariables } from "./models/models.ts";
import { MiddlewareHandler, Next } from "hono/types";
import {
  handleGetLobbyDetails,
  handleHost,
  handleJoin,
  handleLogin,
} from "./handlers/request-handlers.ts";
import {
  drawATile,
  getCurrentPlayer,
  getSelfStatus,
  handlePlaceablePositions,
  handlePlaceMeeple,
  handleRotateTile,
  handleSkip,
  handleTilePlacement,
  serveCurrentTile,
  serveGameBoard,
  serveGameState,
  serveValidPositions,
} from "./handlers/game-handlers.ts";
import { Context } from "hono";
import { Hono } from "hono";

const setAppContext = (
  appContext: AppContext,
): MiddlewareHandler<{ Variables: AppVariables }> => {
  return async (ctx: Context<{ Variables: AppVariables }>, next: Next) => {
    const { sessions, users, roomManager, games } = appContext;

    ctx.set("sessions", sessions);
    ctx.set("users", users);
    ctx.set("roomManager", roomManager);
    ctx.set("games", games);

    await next();
  };
};

const setGameInContext = async (ctx: Context, next: Next) => {
  const games = ctx.get("games");
  const roomID = String(getCookie(ctx, "room-id"));

  if (!games.has(roomID)) {
    return ctx.json({ desc: "invalid game Id" }, 404);
  }

  ctx.set("game", games.get(roomID));

  await next();
};

const createGameApp = () => {
  const gameApp = new Hono();

  gameApp.use(setGameInContext);

  gameApp.get("/", serveStatic({ path: "/html/game.html", root: "public" }));
  gameApp.get("/state", serveGameState);
  gameApp.get("/board", serveGameBoard);
  gameApp.get("/draw-tile", drawATile);
  gameApp.get("/valid-positions", serveValidPositions);
  gameApp.patch("/place-tile", handleTilePlacement);
  gameApp.get("/current-tile", serveCurrentTile);
  gameApp.patch("/tile/rotate", handleRotateTile);
  gameApp.get("/current-player", getCurrentPlayer);
  gameApp.get("/self", getSelfStatus);
  gameApp.patch("/claim", handlePlaceMeeple);
  gameApp.patch("/skip-claim", handleSkip);
  gameApp.get("/tile/placeable-positions", handlePlaceablePositions);

  return gameApp;
};

const createApp = (appContext: AppContext, logger: MiddlewareHandler) => {
  const app = new Hono<{ Variables: AppVariables }>();

  app.use(logger);
  app.use(setAppContext(appContext));
  app.get(
    "/game-options",
    serveStatic({ path: "/html/game-options.html", root: "public" }),
  );
  app.route("/game", createGameApp());

  app.get("/lobby", serveStatic({ path: "/html/lobby.html", root: "public" }));
  app.post("/login", handleLogin);
  app.post("/host", handleHost);
  app.get("/room", handleGetLobbyDetails);
  app.post("/joinRoom", handleJoin);
  app.use(serveStatic({ root: "./public" }));

  return app;
};

export default createApp;
