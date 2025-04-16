import { Hono } from "hono";
import { serveStatic } from "hono/deno";

const createHandler = () => {
  const app = new Hono();

  app.use(serveStatic({ root: "./public" }));
  app.post("/host",handle)

  return app;
};

export default createHandler;
