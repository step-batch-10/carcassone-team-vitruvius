import { Context } from "hono";

const handleHost = (ctx: Context) => {
  return ctx.json("ok");
};

export { handleHost };
