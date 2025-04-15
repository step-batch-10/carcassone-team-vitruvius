import { Hono } from "hono";
import { serveStatic } from "hono/deno";

const createHandler = () => {
  const app = new Hono();

  app.use(serveStatic({ root: "./public" }));

  return app;
};

export default createHandler;
