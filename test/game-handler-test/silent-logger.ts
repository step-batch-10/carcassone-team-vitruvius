import { MiddlewareHandler } from "hono";

export const silentLogger: MiddlewareHandler = (_ctx, next) => {
  return next();
};
