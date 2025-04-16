import createHandler from "./app.ts";
import { User } from "./models/models.ts";

const main = () => {
  const users = new Map<string, User>();
  const sessions = new Map<string, string>();
  const context = { sessions, users };

  Deno.serve(createHandler(context).fetch);
};

main();
